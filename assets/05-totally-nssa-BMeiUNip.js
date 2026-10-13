var e={id:`totally-nssa`,h:{en:`Totally NSSA, N1/E1 metrics and NSSA fine controls (lab: Surat)`,hi:`Totally NSSA, N1/E1 metrics aur NSSA fine controls (lab: Surat)`},body:{en:`
<p>A warehouse needs very little routing knowledge: its own few networks, a way out to everything else, and a way to tell the company about its supplier's network. That is a <b>totally NSSA</b>: the smallest possible database that still allows a local ASBR. This chapter also looks at external metric types, because the Surat lab asks you to export the supplier network as type 1 so the core sees the real path cost.</p>

<h3>Totally NSSA in one sentence</h3>
<p>A totally NSSA is an NSSA whose ABR also blocks type-3 summaries and replaces them with a single <b>type-3 default</b>. You create it with <code>area 40 nssa no-summary</code> on the <b>ABR only</b>. Internal routers keep plain <code>area 40 nssa</code>. The default arrives automatically as <code>O*IA</code>, exactly as in a totally stubby area, while local type-7 LSAs still flow out through the ABR.</p>

<table class="cmp"><tr><th>Command (under router ospf)</th><th>Where</th><th>Effect</th></tr>
<tr><td><code>area 40 nssa</code></td><td>Every router in the area</td><td>NSSA: no type-4/5 in, type-7 allowed</td></tr>
<tr><td><code>area 40 nssa no-summary</code></td><td>ABR</td><td>Totally NSSA: also no type-3, automatic O*IA default</td></tr>
<tr><td><code>area 40 nssa default-information-originate</code></td><td>ABR (or ASBR with a default in its table)</td><td>Type-7 default, O*N2</td></tr>
<tr><td><code>area 40 nssa no-redistribution</code></td><td>ABR that is also an ASBR</td><td>Redistributed routes go to area 0 as type-5 only, not into the NSSA</td></tr>
<tr><td><code>area 40 nssa translate type7 always</code></td><td>One ABR of several</td><td>Force this ABR to be the translator</td></tr>
<tr><td><code>area 40 nssa translate type7 suppress-fa</code></td><td>Translating ABR</td><td>Translated type-5 uses forwarding address 0.0.0.0</td></tr>
</table>

<h3>Lab walk-through: Surat warehouse, area 40</h3>
<p>BR is already in an NSSA and redistributes 172.31.40.0/24 (Loopback5). It has no default route, so <code>ping 203.0.113.1</code> fails, and it still carries every inter-area route. Step one: make the area totally NSSA.</p>
<pre class="code"><span class="c">! ABR only</span>
router ospf 1
 area 40 nssa no-summary</pre>
<pre class="out">BR#show ip route ospf
Gateway of last resort is 10.40.12.2 to network 0.0.0.0

<span class="hl">O*IA  0.0.0.0/0 [110/2] via 10.40.12.2, 00:00:09, GigabitEthernet0/0</span>

ABR#show ip ospf | section Area 40
    Area 40
        Number of interfaces in this area is 1
<span class="hl">        It is a NSSA area, no summary LSA in this area</span>
<span class="hl">        Perform type-7/type-5 LSA translation</span></pre>
<p>All O IA routes are gone, the default is there, and BR can now ping 203.0.113.1. Step two: change the external metric type on BR.</p>
<pre class="code"><span class="c">! BR (the NSSA ASBR)</span>
router ospf 1
 redistribute connected subnets metric-type 1</pre>

<h3>E1 versus E2 (and N1 versus N2)</h3>
<p>An external route starts with a <b>seed metric</b>, 20 by default for redistributed connected and static routes into OSPF (1 for routes from BGP). What happens next depends on the metric type:</p>
<ul>
<li><b>Type 2 (E2, N2), the default.</b> The metric stays at the seed value everywhere in the domain. Internal cost is ignored in the displayed metric. If two paths have the same E2 metric, the router prefers the lower <b>forward metric</b>, the cost to reach the ASBR or forwarding address.</li>
<li><b>Type 1 (E1, N1).</b> Each router adds its internal cost to reach the ASBR (or forwarding address) to the seed. The metric grows as you move away, so routers choose the truly closest exit.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="E1 metric grows along the path">
<rect x="20" y="60" width="140" height="60" rx="8" fill="#fde68a"/><text x="90" y="84" text-anchor="middle" class="svg-ink" font-size="13">BR (ASBR)</text><text x="90" y="104" text-anchor="middle" class="svg-muted" font-size="12">seed 20, FA 1.1.1.1</text>
<rect x="250" y="60" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="13">ABR</text><text x="320" y="104" text-anchor="middle" class="svg-accent" font-size="12">O N1 20+2 = 22</text>
<rect x="480" y="60" width="140" height="60" rx="8" fill="#bae6fd"/><text x="550" y="84" text-anchor="middle" class="svg-ink" font-size="13">CORE</text><text x="550" y="104" text-anchor="middle" class="svg-accent" font-size="12">O E1 20+3 = 23</text>
<line x1="160" y1="90" x2="250" y2="90" stroke="#64748b" stroke-width="2"/><text x="205" y="80" text-anchor="middle" class="svg-muted" font-size="12">cost 1</text>
<line x1="390" y1="90" x2="480" y2="90" stroke="#64748b" stroke-width="2"/><text x="435" y="80" text-anchor="middle" class="svg-muted" font-size="12">cost 1</text>
<text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">With metric-type 2 every router would show 20</text>
</svg><p class="cap">Type-1 metrics add the cost to the forwarding address (here BR's Loopback0, cost 1 on top of the links). Type-2 metrics stay flat.</p></div>

<pre class="out">ABR#show ip route ospf | include 172.31
<span class="hl">O N1     172.31.40.0 [110/22] via 10.40.12.1, 00:00:31, GigabitEthernet0/0</span>

CORE#show ip route 172.31.40.0
Routing entry for 172.31.40.0/24
<span class="hl">  Known via "ospf 1", distance 110, metric 23, type extern 1</span>
  Last update from 10.0.23.1 on GigabitEthernet0/0, 00:00:28 ago
  Routing Descriptor Blocks:
  * 10.0.23.1, from 2.2.2.2, 00:00:28 ago, via GigabitEthernet0/0
      Route metric is 23, traffic share count is 1</pre>
<p>Your exact numbers depend on which address BR uses as the forwarding address, but the rule never changes: an E1 metric on CORE is always larger than 20, because CORE adds its internal cost. Finally confirm translation with <code>show ip ospf</code> on the ABR and <code>ping 172.31.40.1</code> from CORE.</p>

<div class="eg"><p><b>Worked example: why E1 matters.</b> The same supplier prefix is redistributed by two warehouses, both with seed 20. Warehouse A is 3 hops (cost 3) from CORE, warehouse B is 12 hops (cost 12). As E2, both show metric 20 and CORE falls back to the forward metric: 3 versus 12, so A wins. As E1, the metrics are 23 and 32: A wins again, but now every router along the way sees the real total. Now imagine B is redistributed with seed 5 and A with seed 20. As E2, B wins with metric 5 even though it is 12 hops away. As E1, B is 5 + 12 = 17 and A is 20 + 3 = 23, so B still wins. Always do the arithmetic: E1 is not magic, it simply includes the internal cost, so seed metrics still matter.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting <code>no-summary</code> on BR: only the ABR originates type-3 LSAs. Adding <code>default-information-originate</code> as well as <code>no-summary</code> and being surprised that the O*IA default wins: an inter-area route is always preferred to an N2 route. Forgetting that a totally NSSA hides specific routes, so with two ABRs traffic may leave through the less optimal one.</p></div>

<div class="exam"><p><b>Exam trap.</b> The default in a totally NSSA is <code>O*IA</code> (type-3), the default in a plain NSSA with <code>default-information-originate</code> is <code>O*N2</code> (type-7). And inside an NSSA, <code>metric-type 1</code> produces <code>O N1</code>, which becomes <code>O E1</code> after translation.</p></div>

<div class="scn"><h4>The supplier traffic that crossed the country</h4><p>Two warehouses, Surat and Guwahati, both redistributed the same supplier backup network as NSSA externals with the default type 2. Traffic from the Mumbai core consistently went to Guwahati. <code>show ip route</code> showed metric 20 via both, with Guwahati's translating ABR winning on the forward metric because a link on the Surat side had been given a high cost for maintenance and never restored. The engineer restored the cost and changed both redistributions to <code>metric-type 1</code> so the full path cost would be visible in every routing table.</p><p><b>Lesson:</b> E2 hides internal cost in the metric column. Use <code>show ip route &lt;prefix&gt;</code> to see the forward metric before you guess.</p></div>

<div class="iv"><p class="q">"When would you use a totally NSSA, and what is the difference between N1 and N2?"</p><p>Strong answer: a totally NSSA suits a small site with one exit that must still inject external routes, such as a warehouse with a supplier link: it keeps the database minimal (intra-area plus an O*IA default) while allowing type-7. Configure <code>area X nssa no-summary</code> on the ABR. N2 keeps the seed metric flat and uses the forward metric only as a tie-break; N1 adds internal cost to the seed, and after translation they become E2 and E1.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Totally NSSA = <code>area X nssa no-summary</code> on the ABR; automatic O*IA default, type-7 still allowed.</li>
<li>Seed metric for redistribution into OSPF is 20 (1 from BGP); type 2 is the default metric type.</li>
<li>E2/N2 stay flat and tie-break on forward metric; E1/N1 add internal cost to the seed.</li>
<li>Know the NSSA knobs: default-information-originate, no-redistribution, translate type7 always, suppress-fa.</li>
<li>Verify both directions: default out of the NSSA, translated E1/E2 into area 0.</li>
</ul></div>
`,hi:`
<p>Ek warehouse ko bahut kam routing knowledge chahiye: apne kuch networks, baaki sab ke liye bahar jaane ka ek raasta, aur company ko apne supplier ke network ke baare mein batane ka ek tareeka. Yahi <b>totally NSSA</b> hai: sabse chhota possible database jo phir bhi local ASBR allow karta hai. Yeh chapter external metric types bhi dekhta hai, kyunki Surat lab aapse supplier network ko type 1 ke roop mein export karwati hai taaki core ko asli path cost dikhe.</p>

<h3>Totally NSSA ek sentence mein</h3>
<p>Totally NSSA ek aisa NSSA hai jiska ABR type-3 summaries ko bhi rokta hai aur unki jagah ek <b>type-3 default</b> deta hai. Ise <b>sirf ABR</b> par <code>area 40 nssa no-summary</code> se banate hain. Internal routers par simple <code>area 40 nssa</code> rehta hai. Default apne aap <code>O*IA</code> ke roop mein aata hai, bilkul totally stubby area ki tarah, jabki local type-7 LSAs ab bhi ABR ke through bahar jaate hain.</p>

<table class="cmp"><tr><th>Command (router ospf ke andar)</th><th>Kahan</th><th>Asar</th></tr>
<tr><td><code>area 40 nssa</code></td><td>Area ka har router</td><td>NSSA: andar type-4/5 nahi, type-7 allowed</td></tr>
<tr><td><code>area 40 nssa no-summary</code></td><td>ABR</td><td>Totally NSSA: type-3 bhi nahi, automatic O*IA default</td></tr>
<tr><td><code>area 40 nssa default-information-originate</code></td><td>ABR (ya table mein default wala ASBR)</td><td>Type-7 default, O*N2</td></tr>
<tr><td><code>area 40 nssa no-redistribution</code></td><td>ABR jo ASBR bhi hai</td><td>Redistributed routes sirf type-5 ke roop mein area 0 jaate hain, NSSA mein nahi</td></tr>
<tr><td><code>area 40 nssa translate type7 always</code></td><td>Kai mein se ek ABR</td><td>Is ABR ko translator banne par majboor karo</td></tr>
<tr><td><code>area 40 nssa translate type7 suppress-fa</code></td><td>Translate karne wala ABR</td><td>Translated type-5 forwarding address 0.0.0.0 use karta hai</td></tr>
</table>

<h3>Lab walk-through: Surat warehouse, area 40</h3>
<p>BR pehle se NSSA mein hai aur 172.31.40.0/24 (Loopback5) redistribute karta hai. Uske paas default route nahi hai, isliye <code>ping 203.0.113.1</code> fail hota hai, aur uske paas ab bhi har inter-area route hai. Step one: area ko totally NSSA banao.</p>
<pre class="code"><span class="c">! Sirf ABR</span>
router ospf 1
 area 40 nssa no-summary</pre>
<pre class="out">BR#show ip route ospf
Gateway of last resort is 10.40.12.2 to network 0.0.0.0

<span class="hl">O*IA  0.0.0.0/0 [110/2] via 10.40.12.2, 00:00:09, GigabitEthernet0/0</span>

ABR#show ip ospf | section Area 40
    Area 40
        Number of interfaces in this area is 1
<span class="hl">        It is a NSSA area, no summary LSA in this area</span>
<span class="hl">        Perform type-7/type-5 LSA translation</span></pre>
<p>Saare O IA routes chale gaye, default aa gaya, aur BR ab 203.0.113.1 ping kar sakta hai. Step two: BR par external metric type badlo.</p>
<pre class="code"><span class="c">! BR (NSSA ASBR)</span>
router ospf 1
 redistribute connected subnets metric-type 1</pre>

<h3>E1 vs E2 (aur N1 vs N2)</h3>
<p>External route ek <b>seed metric</b> se shuru hota hai, OSPF mein redistribute kiye connected aur static routes ke liye default 20 (BGP se aaye routes ke liye 1). Aage kya hota hai, woh metric type par depend karta hai:</p>
<ul>
<li><b>Type 2 (E2, N2), default.</b> Metric poore domain mein seed value par hi rehta hai. Dikhne wale metric mein internal cost ignore hoti hai. Agar do paths ka E2 metric same hai, to router kam <b>forward metric</b> wala chunta hai, yaani ASBR ya forwarding address tak pahunchne ki cost.</li>
<li><b>Type 1 (E1, N1).</b> Har router seed mein ASBR (ya forwarding address) tak pahunchne ki apni internal cost jodta hai. Door jaate jaate metric badhta hai, isliye routers sach mein sabse nazdeek exit chunte hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="E1 metric path ke saath badhta hai">
<rect x="20" y="60" width="140" height="60" rx="8" fill="#fde68a"/><text x="90" y="84" text-anchor="middle" class="svg-ink" font-size="13">BR (ASBR)</text><text x="90" y="104" text-anchor="middle" class="svg-muted" font-size="12">seed 20, FA 1.1.1.1</text>
<rect x="250" y="60" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="13">ABR</text><text x="320" y="104" text-anchor="middle" class="svg-accent" font-size="12">O N1 20+2 = 22</text>
<rect x="480" y="60" width="140" height="60" rx="8" fill="#bae6fd"/><text x="550" y="84" text-anchor="middle" class="svg-ink" font-size="13">CORE</text><text x="550" y="104" text-anchor="middle" class="svg-accent" font-size="12">O E1 20+3 = 23</text>
<line x1="160" y1="90" x2="250" y2="90" stroke="#64748b" stroke-width="2"/><text x="205" y="80" text-anchor="middle" class="svg-muted" font-size="12">cost 1</text>
<line x1="390" y1="90" x2="480" y2="90" stroke="#64748b" stroke-width="2"/><text x="435" y="80" text-anchor="middle" class="svg-muted" font-size="12">cost 1</text>
<text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">metric-type 2 ke saath har router 20 dikhata</text>
</svg><p class="cap">Type-1 metrics forwarding address tak ki cost jodte hain (yahan BR ka Loopback0, links ke upar cost 1). Type-2 metrics flat rehte hain.</p></div>

<pre class="out">ABR#show ip route ospf | include 172.31
<span class="hl">O N1     172.31.40.0 [110/22] via 10.40.12.1, 00:00:31, GigabitEthernet0/0</span>

CORE#show ip route 172.31.40.0
Routing entry for 172.31.40.0/24
<span class="hl">  Known via "ospf 1", distance 110, metric 23, type extern 1</span>
  Last update from 10.0.23.1 on GigabitEthernet0/0, 00:00:28 ago
  Routing Descriptor Blocks:
  * 10.0.23.1, from 2.2.2.2, 00:00:28 ago, via GigabitEthernet0/0
      Route metric is 23, traffic share count is 1</pre>
<p>Aapke exact numbers is par depend karte hain ki BR forwarding address ke roop mein kaunsa address use karta hai, lekin rule kabhi nahi badalta: CORE par E1 metric hamesha 20 se bada hota hai, kyunki CORE apni internal cost jodta hai. Aakhir mein ABR par <code>show ip ospf</code> se translation aur CORE se <code>ping 172.31.40.1</code> confirm karo.</p>

<div class="eg"><p><b>Worked example: E1 kyun matter karta hai.</b> Wahi supplier prefix do warehouses redistribute karte hain, dono seed 20 ke saath. Warehouse A CORE se 3 hops (cost 3) door hai, warehouse B 12 hops (cost 12). E2 ke roop mein dono metric 20 dikhate hain aur CORE forward metric par jaata hai: 3 vs 12, to A jeetta hai. E1 ke roop mein metrics 23 aur 32 hain: A phir jeetta hai, lekin ab raaste ka har router asli total dekhta hai. Ab socho B seed 5 ke saath aur A seed 20 ke saath redistribute hota hai. E2 ke roop mein B metric 5 ke saath jeetta hai jabki woh 12 hops door hai. E1 ke roop mein B 5 + 12 = 17 hai aur A 20 + 3 = 23, isliye B ab bhi jeetta hai. Hamesha hisaab lagao: E1 koi jaadu nahi, woh bas internal cost include karta hai, isliye seed metrics ab bhi matter karte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> BR par <code>no-summary</code> lagana: type-3 LSAs sirf ABR originate karta hai. <code>no-summary</code> ke saath <code>default-information-originate</code> bhi jodna aur hairan hona ki O*IA default jeetta hai: inter-area route hamesha N2 route se prefer hota hai. Yeh bhoolna ki totally NSSA specific routes chhupa deta hai, isliye do ABRs ke saath traffic kam optimal wale se nikal sakta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Totally NSSA mein default <code>O*IA</code> (type-3) hai, plain NSSA mein <code>default-information-originate</code> ke saath default <code>O*N2</code> (type-7) hai. Aur NSSA ke andar <code>metric-type 1</code> se <code>O N1</code> banta hai, jo translation ke baad <code>O E1</code> ban jaata hai.</p></div>

<div class="scn"><h4>Supplier traffic jo poore desh ko paar karta tha</h4><p>Do warehouses, Surat aur Guwahati, dono same supplier backup network ko default type 2 ke saath NSSA externals ke roop mein redistribute karte the. Mumbai core se traffic lagataar Guwahati jaata tha. <code>show ip route</code> ne dono ke through metric 20 dikhaya, aur Guwahati ka translating ABR forward metric par jeet raha tha kyunki Surat side ke ek link ko maintenance ke liye high cost diya gaya tha aur kabhi wapas nahi kiya gaya. Engineer ne cost wapas ki aur dono redistributions ko <code>metric-type 1</code> kar diya taaki har routing table mein poori path cost dikhe.</p><p><b>Lesson:</b> E2 metric column mein internal cost chhupa deta hai. Guess karne se pehle forward metric dekhne ke liye <code>show ip route &lt;prefix&gt;</code> use karo.</p></div>

<div class="iv"><p class="q">"Totally NSSA kab use karoge, aur N1 aur N2 mein kya farak hai?"</p><p>Strong answer: totally NSSA ek exit wali chhoti site ke liye sahi hai jise phir bhi external routes inject karne hain, jaise supplier link wala warehouse: yeh database minimal rakhta hai (intra-area plus O*IA default) aur type-7 allow karta hai. ABR par <code>area X nssa no-summary</code> configure karo. N2 seed metric flat rakhta hai aur forward metric sirf tie-break ke liye use karta hai; N1 seed mein internal cost jodta hai, aur translation ke baad woh E2 aur E1 ban jaate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Totally NSSA = ABR par <code>area X nssa no-summary</code>; automatic O*IA default, type-7 ab bhi allowed.</li>
<li>OSPF mein redistribution ka seed metric 20 hai (BGP se 1); type 2 default metric type hai.</li>
<li>E2/N2 flat rehte hain aur forward metric par tie-break karte hain; E1/N1 seed mein internal cost jodte hain.</li>
<li>NSSA knobs yaad rakho: default-information-originate, no-redistribution, translate type7 always, suppress-fa.</li>
<li>Dono directions verify karo: NSSA se bahar default, area 0 mein translated E1/E2.</li>
</ul></div>
`}};export{e as default};