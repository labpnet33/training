var e={id:`external-routes-metrics`,h:{en:`External routes, metrics, preference and interface tuning`,hi:`External routes, metrics, preference aur interface tuning`},body:{en:`
<p>Think of OSPF as the company's internal road map. Roads that belong to the company are known automatically. A road to a partner, a cloud provider or a static route is not on that map until someone deliberately draws it in. Drawing it in is called <b>redistribution</b> or <b>exporting</b>, and the router that does it becomes an ASBR. Separately, every road on the map has a <b>cost</b>, and you can tune it so that traffic prefers the roads you want.</p>

<h3>Exporting routes into OSPF with a policy</h3>
<p>Junos has no <code>redistribute</code> command. A <b>routing policy</b> chooses which routes from another source (direct, static, BGP) are exported into OSPF, and you apply it with <code>set protocols ospf export NAME</code>. This is the policy used on R1 in the stub/NSSA lab to export the cloud subnet:</p>
<pre class="code">set policy-options policy-statement EXPORT-CLOUD term 1 from protocol direct
set policy-options policy-statement EXPORT-CLOUD term 1 from route-filter 198.51.100.0/24 exact
set policy-options policy-statement EXPORT-CLOUD term 1 then accept
set protocols ospf export EXPORT-CLOUD</pre>
<p>Without the <code>route-filter</code>, <b>every direct route</b> would be exported, which would leak internal prefixes. Always filter. R1 becomes an ASBR and creates a type 5 LSA:</p>
<pre class="out">lab@R1-PUNE&gt; show ospf database extern detail
OSPF AS SCOPE link state database
Extern  *198.51.100.0     10.255.1.1       0x80000001   235  0x22 0x7478  36
  mask 255.255.255.0
  Topology default (ID 0)
    Type: <span class="hl">2</span>, Metric: 0, Fwd addr: 0.0.0.0, Tag: 0.0.0.0
lab@R3-NASHIK&gt; show route protocol ospf
198.51.100.0/24    *[OSPF/<span class="hl">150</span>] 00:00:45, metric 0
                    &gt;  to 10.30.23.1 via ge-0/0/0.0</pre>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="External route type 1 and type 2">
<rect x="20" y="20" width="270" height="130" rx="10" fill="#fde68a"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="14">External type 2 (default)</text>
<text x="155" y="75" text-anchor="middle" class="svg-muted" font-size="12">metric = the value set at the ASBR</text><text x="155" y="95" text-anchor="middle" class="svg-muted" font-size="12">internal cost to the ASBR is only a tie-break</text><text x="155" y="125" text-anchor="middle" class="svg-accent" font-size="12">same metric in every router</text>
<rect x="350" y="20" width="270" height="130" rx="10" fill="#bbf7d0"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="14">External type 1</text>
<text x="485" y="75" text-anchor="middle" class="svg-muted" font-size="12">metric = ASBR value + cost to the ASBR</text><text x="485" y="95" text-anchor="middle" class="svg-muted" font-size="12">grows as the route travels</text><text x="485" y="125" text-anchor="middle" class="svg-accent" font-size="12">use it when several exits exist</text>
</svg><p class="cap">Type 1 includes the internal path cost; type 2 ignores it.</p></div>

<h3>E1 versus E2, and preference</h3>
<ul>
<li><b>Type 2 (E2)</b> is the Junos default. The metric stays the same across the AS; only if two ASBRs advertise the same E2 metric is the closer ASBR chosen. <code>show ospf route extern</code> shows <code>Ext2</code>.</li>
<li><b>Type 1 (E1)</b> adds the cost to reach the ASBR. Use it when you have two exits and the nearest should win: <code>set policy-options policy-statement X term 1 then external type 1</code>.</li>
<li>If an E1 and an E2 route exist for the same prefix, <b>E1 is preferred</b>.</li>
<li>Set the starting metric in the policy with <code>then metric 50</code>.</li>
</ul>
<p>In the lab the partner prefix, translated from type 7, looks like this at R1:</p>
<pre class="out">lab@R1-PUNE&gt; show ospf route extern
Prefix             Path  Route      NH       Metric NextHop       Nexthop
                   Type  Type       Type            Interface     Address/LSP
203.0.113.0/24     <span class="hl">Ext2</span>  Network    IP            0 ge-0/0/0.0    10.1.12.2</pre>
<p>The route is <code>[OSPF/150]</code> in <code>show route</code>. Because preference 150 is worse than the default preference of static (5) and of IS-IS (15, 18), an OSPF external route loses against those protocols for the same prefix. If you export a static route into OSPF on one router, that router keeps using its own static.</p>

<h3>Metrics and reference bandwidth</h3>
<p>The OSPF cost of an interface is <b>reference-bandwidth / interface bandwidth</b>. The Junos default reference bandwidth is 100 Mbps, so a 1 Gbps and a 10 Gbps interface can both end up with the minimum cost, and SPF cannot tell them apart. Raise the reference bandwidth on <b>every router</b> (the value must be consistent) or set the metric on the interface:</p>
<pre class="code">set protocols ospf reference-bandwidth 10g
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 metric 25</pre>
<pre class="out">lab@R2-AGRA&gt; show route protocol ospf
10.255.0.1/32      *[OSPF/10] 00:02:15, metric <span class="hl">10</span>
172.20.1.0/24      *[OSPF/10] 00:02:15, metric 11</pre>
<p>With a 10 Gbps reference, a gigabit link now costs 10 instead of 1. A loopback or passive stub link adds its own interface cost (the loopback costs 0). An explicit <code>metric</code> on the interface wins over the calculation.</p>

<h3>Timers and authentication</h3>
<pre class="code">set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 hello-interval 5
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 dead-interval 20
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 authentication md5 1 key Sec3ret</pre>
<p>Defaults on Ethernet are hello 10 s and dead 40 s, which <code>show ospf interface extensive</code> prints as <code>Hello: 10, Dead: 40</code>. Lowering them gives faster failure detection, but the right modern answer is BFD (<code>set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 bfd-liveness-detection minimum-interval 300</code>). Authentication types are none, simple (clear text), and MD5 or HMAC-SHA; an unauthenticated or mismatched hello is discarded and counted as an authentication failure.</p>

<div class="eg"><p><b>Worked example.</b> Two ASBRs, A at internal cost 5 and B at cost 20, both export 198.51.100.0/24 with metric 10. As E2 both routes show metric 10 and the closer ASBR (A) wins on the tie-break. As E1 the routes show 15 and 30, and A wins clearly. If A fails, only the E1 variant makes the numbers reflect the real distance to B.</p></div>

<div class="warn"><p><b>Common mistake.</b> Exporting <code>from protocol direct</code> without a route-filter, which sends every connected subnet (including management ranges) into OSPF. Also changing the reference bandwidth on one router only, which makes costs inconsistent and routing asymmetrical.</p></div>
<div class="exam"><p><b>Exam trap.</b> External routes have preference 150 and internal 10. Type 2 is the default metric type. Type 1 is preferred over type 2 for the same prefix. A policy with no <code>from</code> match exports everything the source offers.</p></div>

<div class="scn"><h4>The 10G link that nobody used</h4><p>A core ring had two paths: a 10 Gbps link and a chain of two 1 Gbps links. Traffic split evenly, because every link had cost 1. The team set <code>reference-bandwidth 100g</code> on every router in one window and ECMP gave way to a clear preferred path.</p><p><b>Lesson:</b> default costs ignore modern speeds. Change the reference bandwidth network-wide and verify with <code>show ospf interface extensive</code>.</p></div>

<div class="iv"><p class="q">"How do you bring a static route into OSPF on Junos, and what happens to its metric?"</p><p>Create a policy that matches <code>from protocol static</code> with a route-filter and <code>then accept</code>, then apply it with <code>protocols ospf export</code>. It is advertised as a type 5 LSA (type 7 in an NSSA), as external type 2 by default and preference 150. Explain E1 versus E2 and that the policy needs a route-filter to avoid leaking routes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Junos exports into OSPF with a policy applied via <code>ospf export</code>; always filter.</li>
<li>External routes are type 5/7 LSAs, type 2 by default, preference 150.</li>
<li>OSPF cost = reference bandwidth / interface bandwidth; align it on all routers.</li>
<li>Defaults: hello 10 s, dead 40 s, priority 128; hello and authentication must match.</li>
<li>BFD is the modern way to detect failures fast.</li>
</ul></div>
`,hi:`
<p>OSPF ko company ka internal road map samjho. Company ki apni roads automatically pata hoti hain. Partner, cloud provider ya static route tak ki road us map par tab tak nahi hoti jab tak koi jaan-boojhkar use na banaye. Use banana <b>redistribution</b> ya <b>exporting</b> kehlata hai, aur jo router ye karta hai wo ASBR ban jaata hai. Alag se, map ki har road ka ek <b>cost</b> hota hai, aur use tune karke aap traffic ko pasandida roads par bhej sakte ho.</p>

<h3>Policy se routes ko OSPF mein export karna</h3>
<p>Junos mein <code>redistribute</code> command nahi hota. Ek <b>routing policy</b> tay karti hai ki doosre source (direct, static, BGP) ke kaun se routes OSPF mein export hon, aur aap ise <code>set protocols ospf export NAME</code> se lagate ho. Stub/NSSA lab mein R1 par cloud subnet export karne ke liye yahi policy hai:</p>
<pre class="code">set policy-options policy-statement EXPORT-CLOUD term 1 from protocol direct
set policy-options policy-statement EXPORT-CLOUD term 1 from route-filter 198.51.100.0/24 exact
set policy-options policy-statement EXPORT-CLOUD term 1 then accept
set protocols ospf export EXPORT-CLOUD</pre>
<p><code>route-filter</code> ke bina <b>har direct route</b> export ho jaata, jisse internal prefixes leak hote. Hamesha filter lagao. R1 ASBR ban jaata hai aur type 5 LSA banata hai:</p>
<pre class="out">lab@R1-PUNE&gt; show ospf database extern detail
OSPF AS SCOPE link state database
Extern  *198.51.100.0     10.255.1.1       0x80000001   235  0x22 0x7478  36
  mask 255.255.255.0
  Topology default (ID 0)
    Type: <span class="hl">2</span>, Metric: 0, Fwd addr: 0.0.0.0, Tag: 0.0.0.0
lab@R3-NASHIK&gt; show route protocol ospf
198.51.100.0/24    *[OSPF/<span class="hl">150</span>] 00:00:45, metric 0
                    &gt;  to 10.30.23.1 via ge-0/0/0.0</pre>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="External route type 1 aur type 2">
<rect x="20" y="20" width="270" height="130" rx="10" fill="#fde68a"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="14">External type 2 (default)</text>
<text x="155" y="75" text-anchor="middle" class="svg-muted" font-size="12">metric = ASBR par set ki hui value</text><text x="155" y="95" text-anchor="middle" class="svg-muted" font-size="12">ASBR tak ka internal cost sirf tie-break</text><text x="155" y="125" text-anchor="middle" class="svg-accent" font-size="12">har router mein same metric</text>
<rect x="350" y="20" width="270" height="130" rx="10" fill="#bbf7d0"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="14">External type 1</text>
<text x="485" y="75" text-anchor="middle" class="svg-muted" font-size="12">metric = ASBR value + ASBR tak cost</text><text x="485" y="95" text-anchor="middle" class="svg-muted" font-size="12">route ke safar ke saath badhta hai</text><text x="485" y="125" text-anchor="middle" class="svg-accent" font-size="12">kai exits hon to use karo</text>
</svg><p class="cap">Type 1 internal path cost jodta hai; type 2 use ignore karta hai.</p></div>

<h3>E1 vs E2, aur preference</h3>
<ul>
<li><b>Type 2 (E2)</b> Junos ka default hai. Metric poore AS mein same rehta hai; sirf jab do ASBRs same E2 metric advertise karte hain tab paas wala ASBR chuna jaata hai. <code>show ospf route extern</code> <code>Ext2</code> dikhata hai.</li>
<li><b>Type 1 (E1)</b> ASBR tak ka cost jodta hai. Jab do exits hon aur nazdeek wala jeetna chahiye tab use karo: <code>set policy-options policy-statement X term 1 then external type 1</code>.</li>
<li>Ek hi prefix ke liye E1 aur E2 dono hon to <b>E1 preferred</b> hai.</li>
<li>Policy mein starting metric <code>then metric 50</code> se set karo.</li>
</ul>
<p>Lab mein type 7 se translate hua partner prefix R1 par aisa dikhta hai:</p>
<pre class="out">lab@R1-PUNE&gt; show ospf route extern
Prefix             Path  Route      NH       Metric NextHop       Nexthop
                   Type  Type       Type            Interface     Address/LSP
203.0.113.0/24     <span class="hl">Ext2</span>  Network    IP            0 ge-0/0/0.0    10.1.12.2</pre>
<p><code>show route</code> mein route <code>[OSPF/150]</code> hai. Preference 150 static (5) aur IS-IS (15, 18) ki default preference se kharab hai, isliye same prefix ke liye OSPF external route inse haar jaata hai. Agar aap ek router par static route ko OSPF mein export karte ho, to wo router apna static hi use karta rehta hai.</p>

<h3>Metrics aur reference bandwidth</h3>
<p>Interface ka OSPF cost <b>reference-bandwidth / interface bandwidth</b> hai. Junos ka default reference bandwidth 100 Mbps hai, isliye 1 Gbps aur 10 Gbps interface dono minimum cost par aa sakte hain, aur SPF unhe alag nahi kar paata. <b>Har router</b> par reference bandwidth badhao (value consistent honi chahiye) ya interface par metric set karo:</p>
<pre class="code">set protocols ospf reference-bandwidth 10g
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 metric 25</pre>
<pre class="out">lab@R2-AGRA&gt; show route protocol ospf
10.255.0.1/32      *[OSPF/10] 00:02:15, metric <span class="hl">10</span>
172.20.1.0/24      *[OSPF/10] 00:02:15, metric 11</pre>
<p>10 Gbps reference ke saath ab gigabit link ka cost 1 ki jagah 10 hai. Loopback ya passive stub link apna interface cost jodta hai (loopback ka cost 0 hai). Interface par explicit <code>metric</code> calculation se upar jeetta hai.</p>

<h3>Timers aur authentication</h3>
<pre class="code">set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 hello-interval 5
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 dead-interval 20
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 authentication md5 1 key Sec3ret</pre>
<p>Ethernet par defaults hello 10 s aur dead 40 s hain, jo <code>show ospf interface extensive</code> <code>Hello: 10, Dead: 40</code> ki tarah print karta hai. Inhe kam karne se failure detection tez hota hai, par aaj ka sahi jawab BFD hai (<code>set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 bfd-liveness-detection minimum-interval 300</code>). Authentication types none, simple (clear text), aur MD5 ya HMAC-SHA hain; unauthenticated ya mismatched hello discard hota hai aur authentication failure ginta jaata hai.</p>

<div class="eg"><p><b>Worked example.</b> Do ASBRs, A internal cost 5 par aur B cost 20 par, dono 198.51.100.0/24 ko metric 10 ke saath export karte hain. E2 mein dono routes metric 10 dikhate hain aur paas wala ASBR (A) tie-break par jeetta hai. E1 mein routes 15 aur 30 dikhate hain, aur A saaf jeetta hai. A fail ho jaaye to sirf E1 variant mein numbers B tak ki asli doori dikhate hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Route-filter ke bina <code>from protocol direct</code> export karna, jisse har connected subnet (management ranges samet) OSPF mein chala jaata hai. Saath hi, sirf ek router par reference bandwidth badalna, jisse costs inconsistent aur routing asymmetrical ho jaati hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> External routes ki preference 150 aur internal ki 10 hai. Type 2 default metric type hai. Same prefix ke liye type 1 type 2 se preferred hai. <code>from</code> match ke bina policy wo sab export kar deti hai jo source offer karta hai.</p></div>

<div class="scn"><h4>Woh 10G link jise kisi ne use nahi kiya</h4><p>Core ring mein do paths the: ek 10 Gbps link aur do 1 Gbps links ki chain. Traffic barabar baant gaya, kyunki har link ka cost 1 tha. Team ne ek window mein har router par <code>reference-bandwidth 100g</code> set kiya aur ECMP ki jagah ek saaf preferred path aa gaya.</p><p><b>Lesson:</b> default costs aaj ki speeds ko ignore karte hain. Reference bandwidth poore network mein badlo aur <code>show ospf interface extensive</code> se verify karo.</p></div>

<div class="iv"><p class="q">"Junos par static route ko OSPF mein kaise laate ho, aur uske metric ka kya hota hai?"</p><p><code>from protocol static</code> aur route-filter wali policy banao jisme <code>then accept</code> ho, phir use <code>protocols ospf export</code> se lagao. Wo type 5 LSA (NSSA mein type 7) ke roop mein, default external type 2 aur preference 150 ke saath advertise hota hai. E1 aur E2 ka farq samjhao aur ye ki leak se bachne ke liye policy mein route-filter chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Junos OSPF mein policy se export karta hai (<code>ospf export</code>); hamesha filter lagao.</li>
<li>External routes type 5/7 LSAs hain, default type 2, preference 150.</li>
<li>OSPF cost = reference bandwidth / interface bandwidth; sab routers par same rakho.</li>
<li>Defaults: hello 10 s, dead 40 s, priority 128; hello aur authentication match hone chahiye.</li>
<li>Tez failure detection ka modern tareeka BFD hai.</li>
</ul></div>
`}};export{e as default};