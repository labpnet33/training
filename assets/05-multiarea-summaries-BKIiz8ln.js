var e={id:`multiarea-summaries`,h:{en:`Multi-area design, summarisation and virtual links`,hi:`Multi-area design, summarisation aur virtual links`},body:{en:`
<p>A national courier company does not give every depot a street-level map of every other city. The Agra depot knows Agra streets in detail and, for Jaipur, only a line saying "Jaipur is 3 hours away". That is exactly what OSPF areas do: <b>inside an area</b> routers know every link (type 1 and 2 LSAs); <b>between areas</b> they only know prefixes and distances (type 3 LSAs). The border router, the ABR, does the translation.</p>

<h3>The rules of multi-area OSPF</h3>
<ol>
<li>Area 0 (the backbone) must exist and every other area must connect to it through an ABR.</li>
<li>Traffic between two non-backbone areas always goes through area 0. It is a hub and spoke at the area level, so a router never "cuts through" between area 10 and area 20.</li>
<li>An ABR must have an <b>active interface in area 0</b>. Touching two non-zero areas does not make a router an ABR.</li>
<li>Inter-area routes are learned by <b>distance vector behaviour</b>: the ABR trusts the cost the other ABR advertised. This is why summaries must not form loops, and one reason for rule 2.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Two areas joined through the backbone">
<rect x="20" y="30" width="170" height="130" rx="12" fill="#bae6fd" stroke="#64748b"/><text x="105" y="52" text-anchor="middle" class="svg-ink" font-size="12">Area 10 (Agra)</text>
<rect x="235" y="30" width="170" height="130" rx="12" fill="#fed7aa" stroke="#64748b"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">Area 0 (backbone)</text>
<rect x="450" y="30" width="170" height="130" rx="12" fill="#ddd6fe" stroke="#64748b"/><text x="535" y="52" text-anchor="middle" class="svg-ink" font-size="12">Area 20 (Jaipur)</text>
<circle cx="60" cy="110" r="22" fill="#fff" stroke="#64748b"/><text x="60" y="114" text-anchor="middle" class="svg-ink" font-size="11">R1</text>
<circle cx="190" cy="110" r="24" fill="#fff" stroke="#64748b"/><text x="190" y="114" text-anchor="middle" class="svg-ink" font-size="11">R2 ABR</text>
<circle cx="450" cy="110" r="24" fill="#fff" stroke="#64748b"/><text x="450" y="114" text-anchor="middle" class="svg-ink" font-size="11">R3 ABR</text>
<circle cx="580" cy="110" r="22" fill="#fff" stroke="#64748b"/><text x="580" y="114" text-anchor="middle" class="svg-ink" font-size="11">R4</text>
<line x1="82" y1="110" x2="166" y2="110" stroke="#64748b" stroke-width="2"/><line x1="214" y1="110" x2="426" y2="110" stroke="#64748b" stroke-width="2"/><line x1="474" y1="110" x2="558" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="320" y="182" text-anchor="middle" class="svg-muted" font-size="11">Type 3 LSAs carry summaries between areas through the ABRs</text>
</svg><p class="cap">Every inter-area route passes through area 0 and an ABR.</p></div>

<h3>Building the two-region lab</h3>
<p>The Agra office (R1) hangs off ABR R2; the Jaipur data room (R4) hangs off ABR R3; R2 and R3 already run area 0. We bring up area 0.0.0.10 and area 0.0.0.20:</p>
<pre class="code"><span class="c">! R1</span>
set protocols ospf area 0.0.0.10 interface ge-0/0/0.0
set protocols ospf area 0.0.0.10 interface lo0.0 passive
set protocols ospf area 0.0.0.10 interface ge-0/0/1.0 passive
set protocols ospf area 0.0.0.10 interface ge-0/0/2.0 passive
<span class="c">! R2 (ABR)</span>
set protocols ospf area 0.0.0.10 interface ge-0/0/0.0</pre>
<p>On R4 the route table now shows the remote prefixes as <b>inter-area</b> routes; the metric of 172.20.1.0/24 is 4: R4-R3 (1) plus R3-R2 (1) plus R2-R1 (1) plus the LAN (1). The Type column of <code>show ospf route</code> shows the difference between intra-area and inter-area:</p>
<pre class="out">lab@R4-JAIPUR&gt; show ospf route
Prefix             Path  Route      NH       Metric NextHop       Nexthop
                   Type  Type       Type            Interface     Address/LSP
10.255.0.3         Intra Area BR    IP            1 ge-0/0/0.0    10.20.34.1
10.20.34.0/30      Intra Network    IP            1 ge-0/0/0.0
172.20.1.0/24      <span class="hl">Inter</span> Network    IP            4 ge-0/0/0.0    10.20.34.1
172.21.1.0/24      Intra Network    IP            1 ge-0/0/1.0</pre>
<p>Note the first line: R4 sees R3 as an area border router (<code>Area BR</code>), because R3's router LSA carries the B bit.</p>

<h3>Summarising with area-range</h3>
<p>Every /24 in area 10 is one type 3 LSA in the backbone, and a flap of one LAN causes updates in every area. Summarisation on the ABR replaces the specifics with one type 3 LSA. It is configured under the area <b>that owns the prefixes</b>:</p>
<pre class="code">set protocols ospf area 0.0.0.10 area-range 172.20.0.0/22
set protocols ospf area 0.0.0.10 area-range 172.20.0.0/22 override-metric 100</pre>
<table class="cmp"><tr><th>Option</th><th>Effect</th></tr>
<tr><td>(none)</td><td>one summary; its metric is derived from the contributing routes</td></tr>
<tr><td><code>override-metric N</code></td><td>advertise the range with a fixed metric</td></tr>
<tr><td><code>restrict</code></td><td>advertise nothing for this range; hides it from other areas</td></tr>
<tr><td><code>exact</code></td><td>advertise only if a route with exactly this length exists</td></tr></table>
<p>After the range and override metric were applied on R2, R4 stopped seeing the /24s and got one route whose metric includes the pinned 100 plus the two links back (R3 re-advertises with +1 and R4 adds +1):</p>
<pre class="out">lab@R4-JAIPUR&gt; show route 172.20.0.0/22
172.20.0.0/22      *[OSPF/10] 00:00:30, metric <span class="hl">102</span>
                    &gt;  to 10.20.34.1 via ge-0/0/0.0
lab@R4-JAIPUR&gt; show ospf database netsummary
Summary  172.20.0.0       10.255.0.3       0x80000001    30  0x22 0x09ba  28</pre>
<p>Two things to remember. First, the ABR keeps the specific routes inside area 10, so traffic inside the area is not affected. Second, an ABR only advertises the summary while at least one contributing route exists; the range itself creates a discard route on the ABR to avoid loops if the more specific route disappears.</p>

<h3>Virtual links: a repair, not a design</h3>
<p>If a new area cannot reach area 0 directly, a <b>virtual link</b> can extend the backbone through a <b>transit area</b>. It is configured under area 0 on both ABRs, using each other's router ID:</p>
<pre class="code">set protocols ospf area 0.0.0.0 virtual-link neighbor-id 10.255.0.3 transit-area 0.0.0.10</pre>
<p>The transit area cannot be a stub area. Virtual links are meant for temporary mergers or as a backup path for a split backbone; the clean fix is a real link to area 0.</p>

<div class="eg"><p><b>Worked example.</b> Area 10 has 172.20.1.0/24, 172.20.2.0/24, 172.20.3.0/24. A summary 172.20.0.0/22 covers 172.20.0.0 - 172.20.3.255. A route 172.20.7.0/24 would not be included, because the range is 4 networks of /24 wide. Check that the summary does not also cover address space that exists elsewhere.</p></div>

<div class="warn"><p><b>Common mistake.</b> Putting <code>area-range</code> under the wrong area. Under area 20 it summarises area 20's prefixes, not area 10's. Also, area-range only works on an ABR; on an internal router it does nothing.</p></div>
<div class="exam"><p><b>Exam trap.</b> area-range goes under the <b>source</b> area. Inter-area routes show as Inter in <code>show ospf route</code>, but both inter-area and intra-area internal routes have preference 10. A router that connects two non-backbone areas and not area 0 is not an ABR.</p></div>

<div class="scn"><h4>One flapping LAN, a hundred updates</h4><p>A branch LAN flapped on a loose cable and every router in the company recalculated SPF. The architect added a /22 area-range on the branch ABR. After that the same flapping stayed inside the branch area, and the backbone saw a stable single summary. The change took one line and a commit.</p><p><b>Lesson:</b> summarisation hides instability from the rest of the network.</p></div>

<div class="iv"><p class="q">"How do you summarise routes between OSPF areas on Junos, and where do you apply it?"</p><p>On the ABR, with <code>area-range</code> under the area whose prefixes are to be summarised. Mention <code>override-metric</code> to fix the cost, <code>restrict</code> to hide a range, and that the ABR keeps the more specific routes locally. For external routes you would use <code>nssa area-range</code> or an ASBR aggregate instead.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inter-area traffic goes through area 0; an ABR needs an active area 0 interface.</li>
<li>Type 3 LSAs carry prefix and distance; the ABR re-originates them at each border.</li>
<li><code>area-range</code> sits under the source area; options are override-metric, restrict, exact.</li>
<li><code>show ospf route</code> distinguishes Intra and Inter routes and shows Area BR.</li>
<li>Virtual links repair a backbone split through a non-stub transit area.</li>
</ul></div>
`,hi:`
<p>Ek national courier company har depot ko doosre sheher ka street-level map nahi deti. Agra depot Agra ki galiyan detail mein jaanta hai aur Jaipur ke liye sirf ek line: "Jaipur 3 ghante door hai". OSPF areas bilkul yahi karte hain: <b>area ke andar</b> routers har link jaante hain (type 1 aur 2 LSAs); <b>areas ke beech</b> sirf prefixes aur doori (type 3 LSAs). Border router, ABR, translation karta hai.</p>

<h3>Multi-area OSPF ke rules</h3>
<ol>
<li>Area 0 (backbone) hona zaroori hai aur har doosra area ABR ke through usse judna chahiye.</li>
<li>Do non-backbone areas ke beech traffic hamesha area 0 se jaata hai. Area level par ye hub and spoke hai, isliye router kabhi area 10 aur area 20 ke beech seedha shortcut nahi leta.</li>
<li>ABR ka <b>area 0 mein active interface</b> hona chahiye. Do non-zero areas ko chhoone se router ABR nahi banta.</li>
<li>Inter-area routes <b>distance vector behaviour</b> se seekhe jaate hain: ABR us cost par bharosa karta hai jo doosre ABR ne advertise kiya. Isliye summaries loops nahi banani chahiye, aur rule 2 ki ek wajah yahi hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Backbone ke through jude do areas">
<rect x="20" y="30" width="170" height="130" rx="12" fill="#bae6fd" stroke="#64748b"/><text x="105" y="52" text-anchor="middle" class="svg-ink" font-size="12">Area 10 (Agra)</text>
<rect x="235" y="30" width="170" height="130" rx="12" fill="#fed7aa" stroke="#64748b"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">Area 0 (backbone)</text>
<rect x="450" y="30" width="170" height="130" rx="12" fill="#ddd6fe" stroke="#64748b"/><text x="535" y="52" text-anchor="middle" class="svg-ink" font-size="12">Area 20 (Jaipur)</text>
<circle cx="60" cy="110" r="22" fill="#fff" stroke="#64748b"/><text x="60" y="114" text-anchor="middle" class="svg-ink" font-size="11">R1</text>
<circle cx="190" cy="110" r="24" fill="#fff" stroke="#64748b"/><text x="190" y="114" text-anchor="middle" class="svg-ink" font-size="11">R2 ABR</text>
<circle cx="450" cy="110" r="24" fill="#fff" stroke="#64748b"/><text x="450" y="114" text-anchor="middle" class="svg-ink" font-size="11">R3 ABR</text>
<circle cx="580" cy="110" r="22" fill="#fff" stroke="#64748b"/><text x="580" y="114" text-anchor="middle" class="svg-ink" font-size="11">R4</text>
<line x1="82" y1="110" x2="166" y2="110" stroke="#64748b" stroke-width="2"/><line x1="214" y1="110" x2="426" y2="110" stroke="#64748b" stroke-width="2"/><line x1="474" y1="110" x2="558" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="320" y="182" text-anchor="middle" class="svg-muted" font-size="11">Type 3 LSAs ABRs ke through areas ke beech summaries le jaate hain</text>
</svg><p class="cap">Har inter-area route area 0 aur ABR se guzarta hai.</p></div>

<h3>Do-region lab banana</h3>
<p>Agra office (R1) ABR R2 ke peeche hai; Jaipur data room (R4) ABR R3 ke peeche; R2 aur R3 pehle se area 0 chalate hain. Hum area 0.0.0.10 aur area 0.0.0.20 chalu karte hain:</p>
<pre class="code"><span class="c">! R1</span>
set protocols ospf area 0.0.0.10 interface ge-0/0/0.0
set protocols ospf area 0.0.0.10 interface lo0.0 passive
set protocols ospf area 0.0.0.10 interface ge-0/0/1.0 passive
set protocols ospf area 0.0.0.10 interface ge-0/0/2.0 passive
<span class="c">! R2 (ABR)</span>
set protocols ospf area 0.0.0.10 interface ge-0/0/0.0</pre>
<p>R4 ki route table ab remote prefixes ko <b>inter-area</b> routes ki tarah dikhati hai; 172.20.1.0/24 ka metric 4 hai: R4-R3 (1) plus R3-R2 (1) plus R2-R1 (1) plus LAN (1). <code>show ospf route</code> ka Type column intra-area aur inter-area ka farq dikhata hai:</p>
<pre class="out">lab@R4-JAIPUR&gt; show ospf route
Prefix             Path  Route      NH       Metric NextHop       Nexthop
                   Type  Type       Type            Interface     Address/LSP
10.255.0.3         Intra Area BR    IP            1 ge-0/0/0.0    10.20.34.1
10.20.34.0/30      Intra Network    IP            1 ge-0/0/0.0
172.20.1.0/24      <span class="hl">Inter</span> Network    IP            4 ge-0/0/0.0    10.20.34.1
172.21.1.0/24      Intra Network    IP            1 ge-0/0/1.0</pre>
<p>Pehli line dekho: R4 R3 ko area border router (<code>Area BR</code>) ki tarah dekhta hai, kyunki R3 ke router LSA mein B bit hai.</p>

<h3>area-range se summarise karna</h3>
<p>Area 10 ka har /24 backbone mein ek type 3 LSA hai, aur ek LAN ke flap se har area mein updates jaate hain. ABR par summarisation specifics ki jagah ek type 3 LSA rakhti hai. Ise us area ke neeche configure karte hain <b>jo prefixes ka malik hai</b>:</p>
<pre class="code">set protocols ospf area 0.0.0.10 area-range 172.20.0.0/22
set protocols ospf area 0.0.0.10 area-range 172.20.0.0/22 override-metric 100</pre>
<table class="cmp"><tr><th>Option</th><th>Asar</th></tr>
<tr><td>(koi nahi)</td><td>ek summary; uska metric contributing routes se nikala jaata hai</td></tr>
<tr><td><code>override-metric N</code></td><td>range ko fixed metric ke saath advertise karo</td></tr>
<tr><td><code>restrict</code></td><td>is range ke liye kuch advertise nahi karta; doosre areas se chhupata hai</td></tr>
<tr><td><code>exact</code></td><td>sirf tab advertise karo jab bilkul isi length ka route maujood ho</td></tr></table>
<p>R2 par range aur override metric lagane ke baad R4 ne /24s dekhna band kar diya aur ek route mila jiska metric pinned 100 plus wapas ke do links hai (R3 +1 ke saath dobara advertise karta hai aur R4 +1 jodta hai):</p>
<pre class="out">lab@R4-JAIPUR&gt; show route 172.20.0.0/22
172.20.0.0/22      *[OSPF/10] 00:00:30, metric <span class="hl">102</span>
                    &gt;  to 10.20.34.1 via ge-0/0/0.0
lab@R4-JAIPUR&gt; show ospf database netsummary
Summary  172.20.0.0       10.255.0.3       0x80000001    30  0x22 0x09ba  28</pre>
<p>Do baatein yaad rakho. Pehli, ABR area 10 ke andar specific routes rakhta hai, isliye area ke andar traffic par asar nahi padta. Doosri, ABR summary tabhi advertise karta hai jab kam se kam ek contributing route maujood ho; range khud ABR par ek discard route banata hai taaki specific route chala jaaye to loop na bane.</p>

<h3>Virtual links: marammat, design nahi</h3>
<p>Agar naya area area 0 tak seedha nahi pahunch sakta, to <b>virtual link</b> backbone ko ek <b>transit area</b> ke through badha sakta hai. Ise dono ABRs par area 0 ke neeche ek doosre ke router ID ke saath configure karte hain:</p>
<pre class="code">set protocols ospf area 0.0.0.0 virtual-link neighbor-id 10.255.0.3 transit-area 0.0.0.10</pre>
<p>Transit area stub area nahi ho sakta. Virtual links temporary mergers ke liye ya split backbone ke backup path ke liye hain; saaf fix area 0 tak asli link hai.</p>

<div class="eg"><p><b>Worked example.</b> Area 10 mein 172.20.1.0/24, 172.20.2.0/24, 172.20.3.0/24 hain. Summary 172.20.0.0/22 172.20.0.0 - 172.20.3.255 ko cover karti hai. Route 172.20.7.0/24 shamil nahi hoga, kyunki range 4 /24 networks chaudi hai. Check karo ki summary aisa address space cover na kare jo kahin aur maujood ho.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>area-range</code> ko galat area ke neeche rakhna. Area 20 ke neeche ye area 20 ke prefixes summarise karta hai, area 10 ke nahi. Saath hi, area-range sirf ABR par kaam karta hai; internal router par ye kuch nahi karta.</p></div>
<div class="exam"><p><b>Exam trap.</b> area-range <b>source</b> area ke neeche jaata hai. Inter-area routes <code>show ospf route</code> mein Inter dikhte hain, par inter-area aur intra-area dono internal routes ki preference 10 hai. Jo router do non-backbone areas ko jodta hai par area 0 ko nahi, wo ABR nahi hai.</p></div>

<div class="scn"><h4>Ek flapping LAN, sau updates</h4><p>Ek branch LAN dheeli cable par flap hui aur company ke har router ne SPF dobara chalaya. Architect ne branch ABR par /22 area-range lagayi. Uske baad wahi flapping branch area ke andar rahi, aur backbone ko ek stable summary dikhi. Change ek line aur ek commit ka tha.</p><p><b>Lesson:</b> summarisation instability ko baaki network se chhupati hai.</p></div>

<div class="iv"><p class="q">"Junos par OSPF areas ke beech routes ko summarise kaise karte ho, aur kahan lagate ho?"</p><p>ABR par, <code>area-range</code> se, us area ke neeche jiske prefixes summarise karne hain. <code>override-metric</code> (cost fix karne ke liye), <code>restrict</code> (range chhupane ke liye) ka zikr karo, aur ye ki ABR specific routes locally rakhta hai. External routes ke liye aap <code>nssa area-range</code> ya ASBR aggregate use karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inter-area traffic area 0 se jaata hai; ABR ko active area 0 interface chahiye.</li>
<li>Type 3 LSAs prefix aur doori le jaate hain; ABR har border par unhe re-originate karta hai.</li>
<li><code>area-range</code> source area ke neeche; options override-metric, restrict, exact.</li>
<li><code>show ospf route</code> Intra aur Inter routes ka farq aur Area BR dikhata hai.</li>
<li>Virtual links non-stub transit area ke through split backbone ko jodte hain.</li>
</ul></div>
`}};export{e as default};