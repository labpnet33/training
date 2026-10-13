var e={id:`import-preference`,h:{en:`Import policy, preferences and metrics: steering what a router uses`,hi:`Import policy, preferences aur metrics: router kya use kare yeh steer karna`},body:{en:`
<p>Export policy decides what OSPF <i>announces</i>. Import policy and preference decide what a router <i>uses</i>. Because every router in an area must hold the same database, OSPF cannot filter LSAs at one router. What you can do is control what this router installs, which route wins, and what cost each link has.</p>

<h3>Import policy: filter the routing table, not the database</h3>
<p>An OSPF import policy under <code>protocols ospf import</code> applies to <b>external routes only</b>. It decides whether SPF may install them in the routing table of this router. In the Chennai lab R1 must never use anything tagged 666. The policy:</p>
<pre class="code">set policy-options policy-statement BLOCK-666 term t from tag 666
set policy-options policy-statement BLOCK-666 term t then reject
set protocols ospf import BLOCK-666</pre>
<p>Before the policy R1 has both partner routes. After it, the route tagged 666 is gone from R1's routing table, but the LSA is still in R1's database, untouched, with its tag in dotted form:</p>
<pre class="out">lab@R1-CHENNAI&gt; show ospf database external lsa-id 198.51.100.0 detail
Extern   198.51.100.0     10.255.4.4       0x80000001    18  0x22 0x98a3  36
  mask 255.255.255.0
  Topology default (ID 0)
    Type: 2, Metric: 20, Fwd addr: 0.0.0.0, Tag: <span class="hl">0.0.2.154</span>

lab@R1-CHENNAI&gt; show route 198.51.100.0/24
inet.0: 15 destinations, 15 routes (15 active, 0 holddown, 0 hidden)

lab@R1-CHENNAI&gt; show route 192.0.2.0/24 detail
192.0.2.0/24 (1 entry, 1 announced)
        *OSPF Preference: 150
                Next hop type: Router
                Next hop: 10.4.12.2 via ge-0/0/0.0, selected
                Next hop: 10.4.13.2 via ge-0/0/1.0
                State: &lt;Active Int Ext&gt;
                Age: 0:19 	Metric: 20
                Area: 0.0.0.0
                Tag: 100</pre>
<p>R2 and R3 are not affected. They keep the 198.51.100.0/24 route because the policy is local to R1. The routing table "destinations" count dropped from 16 to 15, which is a quick sanity check.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Import policy position">
<rect x="20" y="50" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="76" text-anchor="middle" class="svg-ink" font-size="13">LSDB</text><text x="85" y="94" text-anchor="middle" class="svg-muted" font-size="11">same on all routers</text>
<rect x="190" y="50" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="245" y="76" text-anchor="middle" class="svg-ink" font-size="13">SPF</text><text x="245" y="94" text-anchor="middle" class="svg-muted" font-size="11">per router</text>
<rect x="340" y="50" width="130" height="60" rx="10" fill="#fde68a"/><text x="405" y="76" text-anchor="middle" class="svg-ink" font-size="13">Import policy</text><text x="405" y="94" text-anchor="middle" class="svg-muted" font-size="11">external routes</text>
<rect x="510" y="50" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="565" y="76" text-anchor="middle" class="svg-ink" font-size="13">inet.0</text><text x="565" y="94" text-anchor="middle" class="svg-muted" font-size="11">local table</text>
<line x1="150" y1="80" x2="190" y2="80" stroke="#64748b" stroke-width="2"/><line x1="300" y1="80" x2="340" y2="80" stroke="#64748b" stroke-width="2"/><line x1="470" y1="80" x2="510" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">The filter sits after SPF, so the database is never changed.</text>
</svg><p class="cap">Import policy filters installation, not flooding.</p></div>

<h3>Preference: which protocol wins</h3>
<p>When the same prefix is learned from several sources, the routing table prefers the lowest <b>preference</b> value. Defaults: direct 0, static 5, OSPF internal 10, IS-IS level 1 internal 15, IS-IS level 2 internal 18, RIP 100, OSPF external 150, BGP 170, IS-IS external 160 and 165. You can change OSPF's values:</p>
<pre class="code"><span class="c">! Configuration shown as theory: values for the whole OSPF instance</span>
set protocols ospf preference 8
set protocols ospf external-preference 140</pre>
<p>A policy <code>then preference N</code> can change the value for single routes.</p>

<h3>Metrics: the cost of a link</h3>
<p>The OSPF interface cost on Junos is calculated as reference bandwidth divided by link speed, unless you set a <code>metric</code> manually. The default reference bandwidth is 100 Mbps, which gives the same cost 1 to all links of 100 Mbps and above. On a network with 1 and 10 Gbps links you must raise it, or set explicit metrics, so that faster links are preferred.</p>
<pre class="code">set protocols ospf reference-bandwidth 100g
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 metric 50</pre>
<p>The simulator accepted the interface metric line in the Hubli lab. After <code>metric 50</code> on R2's link to R3 the route to 172.16.5.0/24 changed from metric 3 to 52 on R2, then back after the rollback.</p>

<h3>Equal-cost paths and the same ABR</h3>
<p>If two next hops have the same total cost, OSPF installs both, as you saw for 172.16.4.0/24 with 10.4.12.2 and 10.4.13.2. How traffic is spread over them depends on the forwarding table load-balancing policy of the platform. When paths are not equal, only the lowest-cost path is used. <code>no-rfc-1583</code> changes how OSPF chooses between several paths to the <i>same</i> ASBR: with it, intra-area non-backbone paths are preferred as in RFC 2328.</p>

<div class="eg"><p><b>Worked example.</b> A router learns 10.9.0.0/16 from OSPF as an external route (preference 150, metric 20) and from IS-IS level 2 as an internal route (preference 18, metric 500). It installs the IS-IS route, because preference is compared first and the metric does not matter across protocols. Lowering OSPF external preference to 10 would flip the choice.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using an import policy to try to hide an internal route. OSPF import policy affects <b>external</b> routes only. To stop a router from using an internal path, you change metrics or areas, not import policy.</p></div>
<div class="exam"><p><b>Exam trap.</b> A route removed by import policy is still in <code>show ospf database</code> and is still re-flooded to neighbours. If a question says "the LSA must disappear from the network", import policy is the wrong tool; fix it at the originator.</p></div>

<div class="scn"><h4>One office must never use the partner link</h4><p>The security team required that the head office never route to the test network. The team did not want to touch the other offices. An import policy on the head-office router that rejected tag 666 removed the route there only. Other routers kept it, and a ping from the head-office PC to the test network failed, which was the intended result.</p><p><b>Lesson:</b> use tags with import policy for per-router, per-site control.</p></div>

<div class="iv"><p class="q">"Why can't you filter an LSA with an import policy in OSPF?"</p><p>In a link-state protocol every router in the area must hold an identical database or SPF would produce inconsistent trees and loops. So import policy acts after SPF and filters only which external routes are installed in the local routing table. To stop an LSA, you stop it at the originator, with export policy, area type or summarisation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF import policy filters external routes into the local table; the LSDB stays the same.</li>
<li>Preference ranks protocols: OSPF 10 internal, 150 external; lower wins.</li>
<li>Metric is reference bandwidth over link speed unless set manually; raise the reference bandwidth for fast links.</li>
<li>Equal-cost paths install multiple next hops.</li>
<li>Tags plus import reject give per-router control without touching the originator.</li>
</ul></div>
`,hi:`
<p>Export policy tay karti hai ki OSPF kya <i>announce</i> kare. Import policy aur preference tay karte hain ki router kya <i>use</i> kare. Kyunki area ke har router ke paas same database hona chahiye, OSPF ek router par LSAs filter nahi kar sakta. Jo aap kar sakte ho woh hai control karna ki yeh router kya install kare, kaunsa route jeete, aur har link ka cost kya ho.</p>

<h3>Import policy: routing table filter karo, database nahi</h3>
<p><code>protocols ospf import</code> ke neeche OSPF import policy <b>sirf external routes</b> par lagti hai. Woh tay karti hai ki SPF unhe is router ki routing table mein daal sakta hai ya nahi. Chennai lab mein R1 ko tag 666 wali koi cheez kabhi use nahi karni. Policy:</p>
<pre class="code">set policy-options policy-statement BLOCK-666 term t from tag 666
set policy-options policy-statement BLOCK-666 term t then reject
set protocols ospf import BLOCK-666</pre>
<p>Policy se pehle R1 ke paas dono partner routes hain. Baad mein tag 666 wala route R1 ki routing table se chala jaata hai, par LSA R1 ke database mein chhua hua nahi, dotted form ke tag ke saath maujood hai:</p>
<pre class="out">lab@R1-CHENNAI&gt; show ospf database external lsa-id 198.51.100.0 detail
Extern   198.51.100.0     10.255.4.4       0x80000001    18  0x22 0x98a3  36
  mask 255.255.255.0
  Topology default (ID 0)
    Type: 2, Metric: 20, Fwd addr: 0.0.0.0, Tag: <span class="hl">0.0.2.154</span>

lab@R1-CHENNAI&gt; show route 198.51.100.0/24
inet.0: 15 destinations, 15 routes (15 active, 0 holddown, 0 hidden)

lab@R1-CHENNAI&gt; show route 192.0.2.0/24 detail
192.0.2.0/24 (1 entry, 1 announced)
        *OSPF Preference: 150
                Next hop type: Router
                Next hop: 10.4.12.2 via ge-0/0/0.0, selected
                Next hop: 10.4.13.2 via ge-0/0/1.0
                State: &lt;Active Int Ext&gt;
                Age: 0:19 	Metric: 20
                Area: 0.0.0.0
                Tag: 100</pre>
<p>R2 aur R3 par asar nahi padta. Woh 198.51.100.0/24 route rakhte hain kyunki policy R1 ke liye local hai. Routing table ke "destinations" ki ginti 16 se 15 ho gayi, jo quick sanity check hai.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Import policy position">
<rect x="20" y="50" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="76" text-anchor="middle" class="svg-ink" font-size="13">LSDB</text><text x="85" y="94" text-anchor="middle" class="svg-muted" font-size="11">sab routers par same</text>
<rect x="190" y="50" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="245" y="76" text-anchor="middle" class="svg-ink" font-size="13">SPF</text><text x="245" y="94" text-anchor="middle" class="svg-muted" font-size="11">per router</text>
<rect x="340" y="50" width="130" height="60" rx="10" fill="#fde68a"/><text x="405" y="76" text-anchor="middle" class="svg-ink" font-size="13">Import policy</text><text x="405" y="94" text-anchor="middle" class="svg-muted" font-size="11">external routes</text>
<rect x="510" y="50" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="565" y="76" text-anchor="middle" class="svg-ink" font-size="13">inet.0</text><text x="565" y="94" text-anchor="middle" class="svg-muted" font-size="11">local table</text>
<line x1="150" y1="80" x2="190" y2="80" stroke="#64748b" stroke-width="2"/><line x1="300" y1="80" x2="340" y2="80" stroke="#64748b" stroke-width="2"/><line x1="470" y1="80" x2="510" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Filter SPF ke baad lagta hai, isliye database kabhi nahi badalta.</text>
</svg><p class="cap">Import policy installation filter karti hai, flooding nahi.</p></div>

<h3>Preference: kaunsa protocol jeete</h3>
<p>Ek hi prefix kai sources se seekha jaye to routing table sabse chhoti <b>preference</b> value prefer karti hai. Defaults: direct 0, static 5, OSPF internal 10, IS-IS level 1 internal 15, IS-IS level 2 internal 18, RIP 100, OSPF external 150, BGP 170, IS-IS external 160 aur 165. OSPF ki values badal sakte ho:</p>
<pre class="code"><span class="c">! Configuration theory ke roop mein: poore OSPF instance ke liye values</span>
set protocols ospf preference 8
set protocols ospf external-preference 140</pre>
<p>Policy ka <code>then preference N</code> single routes ke liye value badal sakta hai.</p>

<h3>Metrics: link ka cost</h3>
<p>Junos par OSPF interface cost reference bandwidth bhaag link speed se nikalta hai, jab tak aap manually <code>metric</code> set na karo. Default reference bandwidth 100 Mbps hai, jo 100 Mbps aur usse upar ke saare links ko same cost 1 deta hai. 1 aur 10 Gbps links wale network par ise badhana padta hai, ya explicit metrics set karne padte hain, taaki fast links prefer hon.</p>
<pre class="code">set protocols ospf reference-bandwidth 100g
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 metric 50</pre>
<p>Simulator ne Hubli lab mein interface metric line accept ki. R2 ke R3 wale link par <code>metric 50</code> ke baad R2 par 172.16.5.0/24 ka route metric 3 se 52 ho gaya, aur rollback ke baad wapas.</p>

<h3>Equal-cost paths aur same ABR</h3>
<p>Do next hops ka total cost same ho to OSPF dono install karta hai, jaisa aapne 172.16.4.0/24 ke liye 10.4.12.2 aur 10.4.13.2 ke saath dekha. Traffic unmein kaise baantta hai yeh platform ki forwarding table load-balancing policy par depend karta hai. Paths equal na hon to sirf sabse kam cost wala path use hota hai. <code>no-rfc-1583</code> badalta hai ki OSPF <i>same</i> ASBR tak ke kai paths mein se kaise chune: iske saath RFC 2328 ki tarah intra-area non-backbone paths prefer hote hain.</p>

<div class="eg"><p><b>Worked example.</b> Router 10.9.0.0/16 ko OSPF se external route ke roop mein (preference 150, metric 20) aur IS-IS level 2 se internal route ke roop mein (preference 18, metric 500) seekhta hai. Woh IS-IS route install karta hai, kyunki preference pehle compare hoti hai aur protocols ke beech metric matter nahi karta. OSPF external preference ko 10 karne se choice palat jaati.</p></div>

<div class="warn"><p><b>Common mistake.</b> Import policy se internal route chhupane ki koshish karna. OSPF import policy <b>sirf external</b> routes ko asar karti hai. Router ko internal path use karne se rokne ke liye metrics ya areas badalte hain, import policy nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Import policy se hataya gaya route ab bhi <code>show ospf database</code> mein hai aur neighbours ko ab bhi re-flood hota hai. Sawal kehta hai "LSA network se gayab ho" to import policy galat tool hai; originator par fix karo.</p></div>

<div class="scn"><h4>Ek office partner link kabhi use na kare</h4><p>Security team ki requirement thi ki head office test network ki taraf kabhi route na kare. Team doosre offices ko chhoona nahi chahti thi. Head-office router par tag 666 reject karne wali import policy ne route sirf wahan hata diya. Doosre routers ne use rakha, aur head-office PC se test network tak ping fail hua, jo intended result tha.</p><p><b>Lesson:</b> per-router, per-site control ke liye tags ko import policy ke saath use karo.</p></div>

<div class="iv"><p class="q">"OSPF mein import policy se LSA filter kyun nahi kar sakte?"</p><p>Link-state protocol mein area ke har router ke paas identical database hona chahiye warna SPF inconsistent trees aur loops bana dega. Isliye import policy SPF ke baad kaam karti hai aur sirf yeh filter karti hai ki kaunse external routes local routing table mein install hon. LSA rokne ke liye originator par rokte hain: export policy, area type ya summarisation se.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF import policy external routes ko local table mein filter karti hai; LSDB same rehta hai.</li>
<li>Preference protocols rank karti hai: OSPF 10 internal, 150 external; chhoti jeetti hai.</li>
<li>Metric reference bandwidth bhaag link speed hai jab tak manually set na ho; fast links ke liye reference bandwidth badhao.</li>
<li>Equal-cost paths multiple next hops install karte hain.</li>
<li>Tags plus import reject originator ko chhue bina per-router control dete hain.</li>
</ul></div>
`}};export{e as default};