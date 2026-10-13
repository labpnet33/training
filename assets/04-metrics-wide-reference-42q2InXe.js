var e={id:`metrics-wide-reference`,h:{en:`Metrics: narrow, wide and reference bandwidth`,hi:`Metrics: narrow, wide aur reference bandwidth`},body:{en:`
<p>IS-IS chooses paths by adding metrics along the way, exactly like OSPF costs, but two details catch candidates out: the width of the metric field, and the fact that on Junos every interface starts with the same metric whatever its speed.</p>

<h3>Narrow versus wide metrics</h3>
<table class="cmp"><tr><th></th><th>Narrow (old TLVs)</th><th>Wide (extended TLVs)</th></tr>
<tr><td>Interface metric range</td><td>1 to 63 (6 bits)</td><td>1 to 16,777,214 (24 bits)</td></tr>
<tr><td>Path metric limit</td><td>1023</td><td>About 4 billion (32 bits)</td></tr>
<tr><td>Extras</td><td>Up/down bit in the same TLV; no sub-TLVs</td><td>Needed for traffic engineering and many newer features</td></tr></table>
<p>By default a Junos router accepts and sends both styles, which is what the lab's Level 1 overview shows on R2:</p>
<pre class="out">lab@R2&gt; show isis overview
  Level 1
    Internal route preference: 15
    External route preference: 160
    Prefix export count: 0, Prefix export limit: none
    <span class="hl">Wide metrics are enabled, Narrow metrics are enabled</span></pre>
<p>In the Jaipur lab the routers run <code>wide-metrics-only</code>, and the overview changes:</p>
<pre class="out">lab@R1&gt; show isis overview
  Level 2
    Internal route preference: 18
    External route preference: 165
    Prefix export count: 0, Prefix export limit: none
    <span class="hl">Wide metrics are enabled, Narrow metrics are disabled</span></pre>
<p>The mismatch trap: if one router runs only narrow metrics and the rest wide-only, neither side understands the other's TLVs. Adjacencies stay up (hellos do not carry metrics) but routes vanish. Whenever a database looks fine and routes are missing, compare these overview lines on both ends. You set the choice per level with <code>level 2 wide-metrics-only</code> under protocols isis.</p>

<h3>The default metric problem</h3>
<p>Junos gives every IS-IS interface a default metric of 10, whatever the bandwidth. A 100-megabit link and a 100-gigabit link both cost 10. Metrics are therefore flat unless you act. Two methods exist.</p>
<ul>
<li><b>Set metrics by hand.</b> Per interface and per level: <code>set protocols isis interface ge-0/0/1.0 level 2 metric 30</code>. The Jaipur lab does this on the R1 to R4 link so that the ring prefers the R1 to R2 side.</li>
<li><b>Set a reference bandwidth.</b> <code>set protocols isis reference-bandwidth 100g</code> makes the metric reference-bandwidth divided by interface speed, so a 10-gigabit link costs 10 and a 1-gigabit link costs 100. It needs wide metrics for large values. This is configuration to know for the exam; the educational simulator accepts the idea of metrics but the labs set them by hand, so there is no captured output for it here.</li></ul>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Ring with metrics">
<circle cx="120" cy="60" r="22" fill="#bbf7d0" stroke="#64748b"/><text x="120" y="64" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<circle cx="360" cy="60" r="22" fill="#fde68a" stroke="#64748b"/><text x="360" y="64" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<circle cx="520" cy="150" r="22" fill="#fde68a" stroke="#64748b"/><text x="520" y="154" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<circle cx="240" cy="170" r="22" fill="#fed7aa" stroke="#64748b"/><text x="240" y="174" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<line x1="142" y1="60" x2="338" y2="60" stroke="#64748b" stroke-width="2"/><text x="240" y="50" text-anchor="middle" class="svg-muted" font-size="12">10</text>
<line x1="378" y1="76" x2="504" y2="136" stroke="#64748b" stroke-width="2"/><text x="456" y="95" text-anchor="middle" class="svg-muted" font-size="12">10</text>
<line x1="136" y1="76" x2="224" y2="154" stroke="#64748b" stroke-width="2"/><text x="164" y="130" text-anchor="middle" class="svg-muted" font-size="12">30</text>
<line x1="262" y1="170" x2="498" y2="152" stroke="#64748b" stroke-width="2"/><text x="380" y="176" text-anchor="middle" class="svg-muted" font-size="12">30</text>
</svg><p class="cap">The Jaipur ring: 10 on the R1-R2 and R2-R3 links, 30 on the links through R4.</p></div>

<h3>Reading metrics from the lab</h3>
<p>On R1 of the Jaipur ring, the interface database shows 10 on the R2 side and a metric of 30 toward R4 at Level 2 (the columns read L1/L2 metric, and the first is the Level 1 value):</p>
<pre class="out">lab@R1&gt; show isis interface
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            2   0x1 Disabled          Point to Point           10/10
ge-0/0/1.0            2   0x2 Disabled          Point to Point           10/30</pre>
<p>That produces these path costs, which you can check against the routing table:</p>
<pre class="out">lab@R1&gt; show route 10.7.255.3
10.7.255.3/32      *[IS-IS/18] 00:01:01, <span class="hl">metric 20</span>
                    &gt;  to 10.7.12.2 via ge-0/0/0.0</pre>
<p>R1 to R2 is 10, R2 to R3 is 10, so the loopback of R3 costs 20. Via R4 it would cost 30 plus 30. In the Nagpur lab the Level 2 metric toward the core shows how metrics add across the leak. R2 advertises 172.20.4.0/24 into Level 1 with metric 110 (its uplink is 100, plus 10 to the server) while R3 advertises 20 (an uplink of 10, plus 10). R1 adds its own link to each border, 10 for R2 and 20 for R3, and chooses the smaller total:</p>
<pre class="out">lab@R1&gt; show route 172.20.4.10
172.20.4.0/24      *[IS-IS/15] 00:00:47, <span class="hl">metric 40</span>
                    &gt;  to 10.1.13.3 via ge-0/0/1.0</pre>
<p>Through R3: 20 plus 20 equals 40. Through R2 it would be 10 plus 110 equals 120.</p>

<div class="eg"><p><b>Worked example.</b> A 10-gigabit core link and a 1-gigabit backup both show metric 10, so traffic uses both. With <code>reference-bandwidth 100g</code> the 10-gigabit link costs 10 and the 1-gigabit link 100, and only the fast link carries traffic. If you rely on manual metrics instead, put the numbers in your design document so a new engineer does not fix them back to 10.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing the reference bandwidth on one router only. The metrics become inconsistent, and the router with the new value sees paths differently from the others, which can create loops during convergence. Change it on every router in the domain.</p></div>
<div class="exam"><p><b>Exam trap.</b> The metric you configure under an interface is for traffic leaving that interface. It does not change what the neighbour sees for the return path. Asymmetric metrics give asymmetric routing.</p></div>

<div class="scn"><h4>Fibre and microwave both cost 10</h4><p>A bank had a 10-gigabit fibre and a 100-megabit microwave link between two sites, both left at default metric 10. Traffic split across them and the microwave link dropped packets at peak hours. A reference bandwidth and wide metrics fixed it without touching the topology.</p><p><b>Lesson:</b> a default metric is a placeholder, not a design.</p></div>

<div class="iv"><p class="q">"Routes disappear after a router is set to wide-metrics-only, but the adjacency stays up. Why?"</p><p>Hellos do not carry metrics, so the adjacency forms. The LSPs of narrow-only neighbours use TLVs that a wide-only router ignores, so their prefixes and neighbours are missing from SPF. Make both ends use compatible metric styles, for example both wide.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Narrow metrics stop at 63 per link and 1023 per path; wide metrics are 24 and 32 bit.</li>
<li>Junos default is metric 10 for every interface; set metrics by hand or use reference-bandwidth.</li>
<li>show isis overview shows which metric styles a level accepts.</li>
<li>Mismatched styles keep adjacencies up but remove routes.</li>
<li>Path cost is the sum of metrics out of each hop, so check each router.</li>
</ul></div>
`,hi:`
<p>IS-IS raste mein metrics jodkar paths chunta hai, bilkul OSPF costs ki tarah, par do details candidates ko pakadti hain: metric field ki chaudai, aur yeh baat ki Junos par har interface same metric se shuru hota hai chahe speed kuch bhi ho.</p>

<h3>Narrow versus wide metrics</h3>
<table class="cmp"><tr><th></th><th>Narrow (purane TLVs)</th><th>Wide (extended TLVs)</th></tr>
<tr><td>Interface metric range</td><td>1 se 63 (6 bits)</td><td>1 se 16,777,214 (24 bits)</td></tr>
<tr><td>Path metric limit</td><td>1023</td><td>Lagbhag 4 billion (32 bits)</td></tr>
<tr><td>Extras</td><td>Same TLV mein up/down bit; sub-TLVs nahi</td><td>Traffic engineering aur kai naye features ke liye zaroori</td></tr></table>
<p>Default mein Junos router dono styles accept aur send karta hai, jo lab ke R2 ka Level 1 overview dikhata hai:</p>
<pre class="out">lab@R2&gt; show isis overview
  Level 1
    Internal route preference: 15
    External route preference: 160
    Prefix export count: 0, Prefix export limit: none
    <span class="hl">Wide metrics are enabled, Narrow metrics are enabled</span></pre>
<p>Jaipur lab mein routers <code>wide-metrics-only</code> chalate hain, aur overview badal jata hai:</p>
<pre class="out">lab@R1&gt; show isis overview
  Level 2
    Internal route preference: 18
    External route preference: 165
    Prefix export count: 0, Prefix export limit: none
    <span class="hl">Wide metrics are enabled, Narrow metrics are disabled</span></pre>
<p>Mismatch ka jaal: agar ek router sirf narrow chalaye aur baaki wide-only, to koi bhi doosre ke TLVs nahi samajhta. Adjacencies up rehti hain (hellos metrics nahi le jaate) par routes gayab ho jaate hain. Jab database theek dikhe aur routes missing hon, to dono ends par yeh overview lines compare karo. Choice per level protocols isis ke neeche <code>level 2 wide-metrics-only</code> se set hoti hai.</p>

<h3>Default metric ki problem</h3>
<p>Junos har IS-IS interface ko default metric 10 deta hai, bandwidth kuch bhi ho. 100-megabit aur 100-gigabit link dono 10 ke hain. Isliye jab tak aap kuch na karo metrics flat rehte hain. Do tareeke hain.</p>
<ul>
<li><b>Metrics haath se set karo.</b> Per interface aur per level: <code>set protocols isis interface ge-0/0/1.0 level 2 metric 30</code>. Jaipur lab R1 se R4 wale link par yahi karta hai taaki ring R1 se R2 wali taraf prefer kare.</li>
<li><b>Reference bandwidth set karo.</b> <code>set protocols isis reference-bandwidth 100g</code> metric ko reference-bandwidth bhaag interface speed bana deta hai, to 10-gigabit link ka cost 10 aur 1-gigabit ka 100 hota hai. Bade values ke liye wide metrics chahiye. Yeh exam ke liye jaanne wali configuration hai; educational simulator metrics ka idea accept karta hai par labs haath se set karte hain, isliye iska yahan captured output nahi hai.</li></ul>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Ring with metrics">
<circle cx="120" cy="60" r="22" fill="#bbf7d0" stroke="#64748b"/><text x="120" y="64" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<circle cx="360" cy="60" r="22" fill="#fde68a" stroke="#64748b"/><text x="360" y="64" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<circle cx="520" cy="150" r="22" fill="#fde68a" stroke="#64748b"/><text x="520" y="154" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<circle cx="240" cy="170" r="22" fill="#fed7aa" stroke="#64748b"/><text x="240" y="174" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<line x1="142" y1="60" x2="338" y2="60" stroke="#64748b" stroke-width="2"/><text x="240" y="50" text-anchor="middle" class="svg-muted" font-size="12">10</text>
<line x1="378" y1="76" x2="504" y2="136" stroke="#64748b" stroke-width="2"/><text x="456" y="95" text-anchor="middle" class="svg-muted" font-size="12">10</text>
<line x1="136" y1="76" x2="224" y2="154" stroke="#64748b" stroke-width="2"/><text x="164" y="130" text-anchor="middle" class="svg-muted" font-size="12">30</text>
<line x1="262" y1="170" x2="498" y2="152" stroke="#64748b" stroke-width="2"/><text x="380" y="176" text-anchor="middle" class="svg-muted" font-size="12">30</text>
</svg><p class="cap">Jaipur ring: R1-R2 aur R2-R3 links par 10, R4 se guzarne wale links par 30.</p></div>

<h3>Lab se metrics padhna</h3>
<p>Jaipur ring ke R1 par interface database R2 wali taraf 10 aur R4 ki taraf Level 2 par metric 30 dikhata hai (columns L1/L2 metric padhte hain, pehla Level 1 ki value hai):</p>
<pre class="out">lab@R1&gt; show isis interface
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            2   0x1 Disabled          Point to Point           10/10
ge-0/0/1.0            2   0x2 Disabled          Point to Point           10/30</pre>
<p>Isse yeh path costs bante hain, jinhe routing table se check kar sakte ho:</p>
<pre class="out">lab@R1&gt; show route 10.7.255.3
10.7.255.3/32      *[IS-IS/18] 00:01:01, <span class="hl">metric 20</span>
                    &gt;  to 10.7.12.2 via ge-0/0/0.0</pre>
<p>R1 se R2 10 hai, R2 se R3 10, to R3 ke loopback ka cost 20. R4 se jaana 30 aur 30 padta. Nagpur lab mein core ki taraf ka Level 2 metric dikhata hai ki leak ke across metrics kaise jodte hain. R2 172.20.4.0/24 ko Level 1 mein metric 110 se advertise karta hai (uska uplink 100, aur server tak 10) jabki R3 20 (uplink 10, plus 10). R1 har border tak apna link jodta hai, R2 ke liye 10 aur R3 ke liye 20, aur chhota total chunta hai:</p>
<pre class="out">lab@R1&gt; show route 172.20.4.10
172.20.4.0/24      *[IS-IS/15] 00:00:47, <span class="hl">metric 40</span>
                    &gt;  to 10.1.13.3 via ge-0/0/1.0</pre>
<p>R3 ke through: 20 plus 20 barabar 40. R2 ke through 10 plus 110 barabar 120 hota.</p>

<div class="eg"><p><b>Worked example.</b> 10-gigabit core link aur 1-gigabit backup dono metric 10 dikhate hain, isliye traffic dono use karta hai. <code>reference-bandwidth 100g</code> ke saath 10-gigabit link ka cost 10 aur 1-gigabit ka 100 ho jata hai, aur sirf tez link traffic le jata hai. Agar manual metrics par bharosa karte ho, to numbers design document mein likho taaki naya engineer unhe wapas 10 na kar de.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reference bandwidth sirf ek router par badalna. Metrics inconsistent ho jaate hain, aur naya value wala router paths ko baaki se alag dekhta hai, jisse convergence ke dauran loops ban sakte hain. Domain ke har router par badlo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Interface ke neeche jo metric configure karte ho woh us interface se nikalne wale traffic ke liye hai. Woh neighbour ko return path ke liye kuch nahi badalta. Asymmetric metrics asymmetric routing dete hain.</p></div>

<div class="scn"><h4>Fibre aur microwave dono 10</h4><p>Ek bank ke do sites ke beech 10-gigabit fibre aur 100-megabit microwave link the, dono default metric 10 par. Traffic dono mein bant gaya aur microwave link peak hours mein packets girane laga. Reference bandwidth aur wide metrics ne topology chhue bina theek kar diya.</p><p><b>Lesson:</b> default metric placeholder hai, design nahi.</p></div>

<div class="iv"><p class="q">"Router ko wide-metrics-only karne ke baad routes gayab ho gaye par adjacency up hai. Kyun?"</p><p>Hellos metrics nahi le jaate, isliye adjacency ban jati hai. Narrow-only neighbours ke LSPs aise TLVs use karte hain jinhe wide-only router ignore karta hai, isliye unke prefixes aur neighbours SPF se missing hain. Dono ends compatible metric styles use karein, jaise dono wide.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Narrow metrics link par 63 aur path par 1023 tak; wide metrics 24 aur 32 bit hain.</li>
<li>Junos default har interface ke liye metric 10 hai; haath se set karo ya reference-bandwidth use karo.</li>
<li>show isis overview dikhata hai ki level kaun se metric styles accept karta hai.</li>
<li>Mismatched styles adjacencies up rakhte hain par routes hata dete hain.</li>
<li>Path cost har hop se nikalte metrics ka sum hai, isliye har router check karo.</li>
</ul></div>
`}};export{e as default};