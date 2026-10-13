var e={id:`path-preference`,h:{en:`Path preference: O, O IA, E1/N1, E2/N2 and the forward metric`,hi:`Path preference: O, O IA, E1/N1, E2/N2 aur forward metric`},body:{en:`
<p>When a company hires, it may first look inside the team, then inside the company, and only then outside, even if an outside candidate looks slightly cheaper. OSPF chooses paths the same way. It first looks at the <b>type</b> of route, and only compares <b>metrics</b> between routes of the same type. A low metric can never help an external route beat an intra-area route.</p>

<h3>The order of preference</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="OSPF route type preference ladder">
<rect x="20" y="20" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">1. O: intra-area (types 1 and 2)</text>
<rect x="60" y="68" width="520" height="38" rx="8" fill="#bae6fd"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="13">2. O IA: inter-area (type 3)</text>
<rect x="100" y="116" width="440" height="38" rx="8" fill="#fde68a"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">3. O E1 and O N1: external type 1</text>
<rect x="140" y="164" width="360" height="38" rx="8" fill="#fed7aa"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="13">4. O E2 and O N2: external type 2</text>
<text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="12">Compare metrics only inside the same step</text>
</svg><p class="cap">A route from a higher step always wins, whatever its metric.</p></div>
<ol>
<li><b>Intra-area (O).</b> Learned from type-1 and type-2 LSAs of an attached area.</li>
<li><b>Inter-area (O IA).</b> Learned from type-3 LSAs.</li>
<li><b>External type 1 (E1, N1).</b> Seed metric plus internal cost.</li>
<li><b>External type 2 (E2, N2).</b> Seed metric only; ties broken by the forward metric.</li>
</ol>
<p>This order exists for good reasons. Preferring intra-area paths keeps traffic inside an area where the router has the full topology, which is also part of OSPF's loop prevention between areas. Preferring E1 over E2 is natural: E1 includes the real internal distance, E2 is only a label set by the ASBR.</p>

<h3>Inside the same step</h3>
<ul>
<li><b>O, O IA, E1, N1:</b> lowest total cost wins. Equal costs are load-shared (ECMP) up to <code>maximum-paths</code>, 4 by default on most IOS platforms.</li>
<li><b>E2, N2:</b> lowest E2 metric wins. If two E2 routes have the same metric, the one with the lowest <b>forward metric</b> (the internal cost to the ASBR, or to the forwarding address if it is set) wins. If the forward metric is also equal, both are installed.</li>
<li><b>N versus E for the same prefix:</b> E1 and N1 sit in the same class, as do E2 and N2, so the metrics decide. RFC 3101, which IOS follows by default, adds a final preference when everything else is identical (a type-7 with the P-bit set, then type-5, then the higher router ID). <code>compatible rfc1587</code> restores the older behaviour.</li>
</ul>

<h3>Seeing the forward metric</h3>
<pre class="out">CORE#show ip route 172.31.0.0
Routing entry for 172.31.0.0/24
<span class="hl">  Known via "ospf 1", distance 110, metric 20, type extern 2, forward metric 3</span>
  Last update from 10.0.23.1 on GigabitEthernet0/0, 00:03:12 ago
  Routing Descriptor Blocks:
  * 10.0.23.1, from 2.2.2.2, 00:03:12 ago, via GigabitEthernet0/0
      Route metric is 20, traffic share count is 1</pre>
<p>This is the NSSA lab's partner prefix as seen on CORE. The metric column says 20, but the router also knows it is 3 away from the forwarding address. <code>show ip route ospf</code> alone hides that detail; always look at the single-prefix output when two E2 paths compete.</p>

<h3>Default routes and preference</h3>
<p>Default routes follow the same ladder. If a router receives both an <code>O*IA</code> default (from a totally stubby or totally NSSA ABR) and an <code>O*N2</code> or <code>O*E2</code> default, the inter-area default wins even with a higher metric. This is why adding <code>default-information-originate</code> in a totally NSSA changes nothing on the internal routers.</p>

<h3>Tuning tools</h3>
<ul>
<li><code>ip ospf cost</code> on an interface, or <code>auto-cost reference-bandwidth</code> (the same value on every router, for example 100000 for 100 Gbps).</li>
<li><code>area X default-cost</code> for stub and NSSA defaults.</li>
<li><code>metric</code> and <code>metric-type</code> on <code>redistribute</code> and <code>default-information originate</code>.</li>
<li><code>distance ospf intra-area 110 inter-area 110 external 170</code> changes administrative distance, which matters only when comparing OSPF with other protocols (covered in the redistribution module).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Router X learns 198.51.100.0/24 three ways: O IA with metric 200, O E1 with metric 30, and O E2 with metric 5. Which wins? O IA, because inter-area beats any external route, even though its metric is the highest. Now remove the O IA route: E1 (30) beats E2 (5), because type 1 beats type 2 whatever the numbers. Finally, two E2 routes with metric 20 and forward metrics 10 and 30: the one with forward metric 10 wins.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Trying to steer traffic toward an external path by lowering its metric while an O IA route for the same prefix exists: it will never win. Comparing E2 metrics without checking the forward metric. Changing <code>auto-cost reference-bandwidth</code> on some routers only, which makes costs inconsistent and paths asymmetric.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which route is installed?" questions often show a lower metric on the wrong type. Apply the order first (O, O IA, E1/N1, E2/N2), then compare metrics. Also remember that administrative distance (110 for all OSPF routes by default) does not choose between OSPF route types.</p></div>

<div class="scn"><h4>All internet traffic through the backup link</h4><p>A company had two internet edges. The primary ASBR originated the default route as E2 with metric 1, and the backup ASBR was meant to use E2 with metric 100. During a template cleanup the backup's command became <code>default-information originate metric 100 metric-type 1</code>. Every router now had an O*E1 default with a metric above 100 and an O*E2 default with metric 1, and chose the E1 one: all traffic went through the small backup circuit. Setting the backup back to metric-type 2 restored the design.</p><p><b>Lesson:</b> the route type beats the metric. Check the code letters before you check the numbers.</p></div>

<div class="iv"><p class="q">"How does OSPF choose between several routes to the same prefix?"</p><p>Strong answer: first by route type: intra-area, then inter-area, then external type 1 (E1 and N1), then external type 2 (E2 and N2). Only within the same type does it compare cost; for E2 ties it uses the forward metric to the ASBR or forwarding address, and equal costs are load-balanced up to maximum-paths. Mention that administrative distance only matters between different protocols, and give a quick example where a higher-metric O IA beats a lower-metric E1.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Preference: O, then O IA, then E1/N1, then E2/N2, regardless of metric.</li>
<li>Metrics are compared only between routes of the same type.</li>
<li>E2 ties are broken by the forward metric, visible in <code>show ip route &lt;prefix&gt;</code>.</li>
<li>An O*IA default beats an O*N2 or O*E2 default.</li>
<li>Keep reference bandwidth consistent and tune with ip ospf cost, default-cost and metric-type.</li>
</ul></div>
`,hi:`
<p>Jab koi company hire karti hai, to woh pehle team ke andar dekhti hai, phir company ke andar, aur uske baad hi bahar, bhale hi bahar ka candidate thoda sasta lage. OSPF paths bhi aise hi chunta hai. Woh pehle route ka <b>type</b> dekhta hai, aur <b>metrics</b> sirf same type ke routes ke beech compare karta hai. Kam metric kabhi bhi external route ko intra-area route se jeetne mein madad nahi kar sakta.</p>

<h3>Preference ka order</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="OSPF route type preference ladder">
<rect x="20" y="20" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">1. O: intra-area (types 1 aur 2)</text>
<rect x="60" y="68" width="520" height="38" rx="8" fill="#bae6fd"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="13">2. O IA: inter-area (type 3)</text>
<rect x="100" y="116" width="440" height="38" rx="8" fill="#fde68a"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">3. O E1 aur O N1: external type 1</text>
<rect x="140" y="164" width="360" height="38" rx="8" fill="#fed7aa"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="13">4. O E2 aur O N2: external type 2</text>
<text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="12">Metrics sirf same step ke andar compare karo</text>
</svg><p class="cap">Upar wale step ka route hamesha jeetta hai, metric chahe jo ho.</p></div>
<ol>
<li><b>Intra-area (O).</b> Attached area ke type-1 aur type-2 LSAs se seekha.</li>
<li><b>Inter-area (O IA).</b> Type-3 LSAs se seekha.</li>
<li><b>External type 1 (E1, N1).</b> Seed metric plus internal cost.</li>
<li><b>External type 2 (E2, N2).</b> Sirf seed metric; ties forward metric se tootte hain.</li>
</ol>
<p>Yeh order achhi wajahon se hai. Intra-area paths ko prefer karna traffic ko aise area mein rakhta hai jahan router ke paas poori topology hai, aur yeh areas ke beech OSPF ke loop prevention ka hissa bhi hai. E2 se E1 ko prefer karna natural hai: E1 asli internal doori include karta hai, E2 sirf ASBR ka lagaya label hai.</p>

<h3>Same step ke andar</h3>
<ul>
<li><b>O, O IA, E1, N1:</b> sabse kam total cost jeetti hai. Barabar costs <code>maximum-paths</code> tak load-share hoti hain (ECMP), zyada tar IOS platforms par default 4.</li>
<li><b>E2, N2:</b> sabse kam E2 metric jeetta hai. Agar do E2 routes ka metric same hai, to sabse kam <b>forward metric</b> (ASBR tak, ya set ho to forwarding address tak ki internal cost) wala jeetta hai. Agar forward metric bhi barabar hai, dono install hote hain.</li>
<li><b>Same prefix ke liye N vs E:</b> E1 aur N1 ek hi class mein hain, aur E2 aur N2 bhi, isliye metrics decide karte hain. RFC 3101, jise IOS default roop se follow karta hai, sab kuch identical hone par ek aakhri preference jodta hai (P-bit set wala type-7, phir type-5, phir higher router ID). <code>compatible rfc1587</code> purana behaviour wapas laata hai.</li>
</ul>

<h3>Forward metric dekhna</h3>
<pre class="out">CORE#show ip route 172.31.0.0
Routing entry for 172.31.0.0/24
<span class="hl">  Known via "ospf 1", distance 110, metric 20, type extern 2, forward metric 3</span>
  Last update from 10.0.23.1 on GigabitEthernet0/0, 00:03:12 ago
  Routing Descriptor Blocks:
  * 10.0.23.1, from 2.2.2.2, 00:03:12 ago, via GigabitEthernet0/0
      Route metric is 20, traffic share count is 1</pre>
<p>Yeh CORE par dikhne wala NSSA lab ka partner prefix hai. Metric column 20 kehta hai, lekin router ko yeh bhi pata hai ki forwarding address 3 door hai. Sirf <code>show ip route ospf</code> yeh detail chhupa deta hai; jab do E2 paths compete karein, hamesha single-prefix output dekho.</p>

<h3>Default routes aur preference</h3>
<p>Default routes bhi isi ladder ko follow karte hain. Agar kisi router ko <code>O*IA</code> default (totally stubby ya totally NSSA ABR se) aur <code>O*N2</code> ya <code>O*E2</code> default dono milte hain, to inter-area default jeetta hai, bhale hi uska metric zyada ho. Isiliye totally NSSA mein <code>default-information-originate</code> jodne se internal routers par kuch nahi badalta.</p>

<h3>Tuning tools</h3>
<ul>
<li>Interface par <code>ip ospf cost</code>, ya <code>auto-cost reference-bandwidth</code> (har router par same value, jaise 100 Gbps ke liye 100000).</li>
<li>Stub aur NSSA defaults ke liye <code>area X default-cost</code>.</li>
<li><code>redistribute</code> aur <code>default-information originate</code> par <code>metric</code> aur <code>metric-type</code>.</li>
<li><code>distance ospf intra-area 110 inter-area 110 external 170</code> administrative distance badalta hai, jo sirf OSPF ko doosre protocols se compare karte waqt matter karta hai (redistribution module mein covered).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Router X 198.51.100.0/24 teen tarah se seekhta hai: metric 200 ke saath O IA, metric 30 ke saath O E1, aur metric 5 ke saath O E2. Kaun jeetta hai? O IA, kyunki inter-area har external route ko harata hai, bhale hi uska metric sabse zyada ho. Ab O IA route hatao: E1 (30) E2 (5) ko harata hai, kyunki type 1 type 2 ko harata hai numbers chahe jo hon. Aakhir mein, metric 20 aur forward metrics 10 aur 30 wale do E2 routes: forward metric 10 wala jeetta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Same prefix ka O IA route maujood hote hue external path ka metric kam karke traffic steer karne ki koshish: woh kabhi nahi jeetega. Forward metric check kiye bina E2 metrics compare karna. <code>auto-cost reference-bandwidth</code> sirf kuch routers par badalna, jisse costs inconsistent aur paths asymmetric ho jaate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa route install hoga?" wale questions aksar galat type par kam metric dikhate hain. Pehle order lagao (O, O IA, E1/N1, E2/N2), phir metrics compare karo. Yeh bhi yaad rakho ki administrative distance (default roop se saare OSPF routes ke liye 110) OSPF route types ke beech choose nahi karta.</p></div>

<div class="scn"><h4>Saara internet traffic backup link se</h4><p>Ek company ke do internet edges the. Primary ASBR default route ko metric 1 ke saath E2 originate karta tha, aur backup ASBR ko metric 100 ke saath E2 use karna tha. Template cleanup ke dauraan backup ki command <code>default-information originate metric 100 metric-type 1</code> ban gayi. Ab har router ke paas 100 se upar metric wala O*E1 default aur metric 1 wala O*E2 default tha, aur usne E1 wala chuna: saara traffic chhote backup circuit se jaane laga. Backup ko wapas metric-type 2 par set karne se design theek ho gaya.</p><p><b>Lesson:</b> route type metric ko harata hai. Numbers check karne se pehle code letters check karo.</p></div>

<div class="iv"><p class="q">"Same prefix ke kai routes mein se OSPF kaise chunta hai?"</p><p>Strong answer: pehle route type se: intra-area, phir inter-area, phir external type 1 (E1 aur N1), phir external type 2 (E2 aur N2). Sirf same type ke andar woh cost compare karta hai; E2 ties ke liye ASBR ya forwarding address tak ka forward metric use karta hai, aur barabar costs maximum-paths tak load-balance hoti hain. Batao ki administrative distance sirf alag protocols ke beech matter karta hai, aur ek jaldi example do jahan zyada metric wala O IA kam metric wale E1 ko harata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Preference: O, phir O IA, phir E1/N1, phir E2/N2, metric chahe jo ho.</li>
<li>Metrics sirf same type ke routes ke beech compare hote hain.</li>
<li>E2 ties forward metric se tootte hain, jo <code>show ip route &lt;prefix&gt;</code> mein dikhta hai.</li>
<li>O*IA default O*N2 ya O*E2 default ko harata hai.</li>
<li>Reference bandwidth consistent rakho aur ip ospf cost, default-cost aur metric-type se tune karo.</li>
</ul></div>
`}};export{e as default};