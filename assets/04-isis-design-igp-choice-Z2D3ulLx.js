var e=(e,t,n,r)=>`<text x="`+e+`" y="`+t+`" text-anchor="middle" class="`+(r||`svg-ink`)+`" font-size="12">`+n+`</text>`,t=(e,t,n,r,i)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"`+(i?` stroke-dasharray="5 4"`:``)+`/>`,n=(e,t,n)=>`<circle cx="`+e+`" cy="`+t+`" r="16" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-9)+` `+t+`H`+(e+9)+`M`+e+` `+(t-9)+`V`+(t+9)+`M`+(e-5)+` `+(t-5)+`L`+(e-9)+` `+t+`L`+(e-5)+` `+(t+5)+`M`+(e+5)+` `+(t-5)+`L`+(e+9)+` `+t+`L`+(e+5)+` `+(t+5)+`" fill="none" stroke="#334155" stroke-width="1.5"/>`,r=(e,t,n)=>`<rect x="`+(e-16)+`" y="`+(t-18)+`" width="32" height="36" rx="3" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-9)+` `+(t-10)+`h5v5h-5zM`+(e+4)+` `+(t-10)+`h5v5h-5zM`+(e-9)+` `+(t+1)+`h5v5h-5zM`+(e+4)+` `+(t+1)+`h5v5h-5z" fill="#ffffff" stroke="none"/>`,i=(e,t,n,r)=>`<rect x="`+e+`" y="`+(t-9)+`" width="12" height="12" rx="2" fill="`+n+`" stroke="#475569"/><text x="`+(e+17)+`" y="`+(t+1)+`" class="svg-muted" font-size="11">`+r+`</text>`,a=(e,t,n,r)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="`+t+`">`+n+`</svg><p class="cap">`+r+`</p></div>`,o=o=>{let s=(e,t)=>`<rect x="`+e+`" y="165" width="`+t+`" height="135" rx="10" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 4"/>`,c=`<rect x="10" y="20" width="620" height="112" rx="10" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/><text x="22" y="38" class="svg-accent" font-size="12">`+o[0]+`</text>`+t(126,86,199,86)+t(231,86,304,86)+t(336,86,409,86)+t(441,86,514,86)+n(110,86,`#ddd6fe`)+n(215,86,`#bae6fd`)+n(320,86,`#ddd6fe`)+n(425,86,`#bae6fd`)+n(530,86,`#ddd6fe`)+e(110,64,o[2])+e(215,64,o[1])+e(320,64,o[2])+e(425,64,o[1])+e(530,64,o[2])+s(10,190)+s(225,190)+s(440,190)+t(110,102,60,208)+t(110,102,150,208)+t(320,102,270,208)+t(320,102,370,208)+t(530,102,490,208)+t(530,102,570,208)+r(60,225,`#bbf7d0`)+r(150,225,`#bbf7d0`)+r(270,225,`#bbf7d0`)+r(370,225,`#bbf7d0`)+r(490,225,`#bbf7d0`)+r(570,225,`#bbf7d0`)+e(60,258,o[3],`svg-muted`)+e(150,258,o[3],`svg-muted`)+e(270,258,o[3],`svg-muted`)+e(370,258,o[3],`svg-muted`)+e(490,258,o[3],`svg-muted`)+e(570,258,o[3],`svg-muted`)+e(105,290,o[4],`svg-accent`)+e(320,290,o[5],`svg-accent`)+e(535,290,o[6],`svg-accent`)+i(10,325,`#bae6fd`,o[1])+i(150,325,`#ddd6fe`,o[2])+i(300,325,`#bbf7d0`,o[3]);return a(340,o[7],c,o[8])},s={id:`isis-design-igp-choice`,h:{en:`IS-IS design and choosing an IGP`,hi:`IS-IS design aur IGP ka chunav`},body:{en:`
<h3>Customer case: Cobalt Energy Pipelines</h3>
<p>Cobalt Energy Pipelines operates 380 routers along 14 pipeline stations, three control centers and two data centers, connected by fibre rings. Traffic is dual stack: IPv4 for legacy SCADA gateways and IPv6 for new sensors. Two sites use Juniper routers. The network will grow to about 600 routers in five years. Today it is a patchwork of static routes and a flat legacy design that nobody wants to touch.</p>
<p><b>Requirements:</b> one IGP for IPv4 and IPv6, convergence under one second on ring failures, support for growth to 600 routers, multi-vendor interoperability. <b>Constraints:</b> staff know OSPF better than IS-IS, no downtime windows longer than two hours, fibre rings mean many equal-cost and alternate paths.</p>

<h3>IS-IS in design terms</h3>
<p>IS-IS runs directly over Layer 2 (it is a CLNS protocol, not IP), so it has no IP-level neighbour addressing and cannot be disturbed by IP filters. Routers are identified by a <b>NET</b> such as <code>49.0001.0100.0000.0001.00</code>: area <code>49.0001</code>, a 6-byte <b>system ID</b> and the selector <code>00</code>. IS-IS has two levels. <b>Level 1</b> routers know only their own area. <b>Level 2</b> routers form the backbone, which must be contiguous but does not need to be a special numbered area. A <b>Level 1/2</b> router joins the two. The big difference from OSPF: <b>area borders fall on links, not on routers</b>, so a router is wholly inside one area and a L1/L2 router is simply connected to both levels. A L1/L2 router sets the <b>attached (ATT) bit</b> so L1 routers install a default route toward it. For better paths, leak selected L2 routes into L1; summarise with <code>summary-address</code> at the L1/L2 border.</p>
<p>Design points to remember: use <b>wide metrics</b> (<code>metric-style wide</code>) because narrow metrics are limited to 63 per link; run <b>point-to-point</b> circuit type on router links to avoid DIS election; remember that the <b>DIS</b> on a broadcast segment has no backup and pre-empts; set the <b>overload bit</b> at start-up (<code>set-overload-bit on-startup</code>) so a rebooting router does not attract transit traffic before BGP and the FIB are ready. For IPv6, choose <b>single topology</b> (one SPF for both protocols) or <b>multi-topology</b> (separate SPFs).</p>

@@DIA@@

<h3>Candidate options</h3>
<table class="cmp"><tr><th>Criterion</th><th>OSPF</th><th>EIGRP</th><th>IS-IS</th></tr>
<tr><td>Scale and hierarchy</td><td>Areas; ABR per router; many LSA types</td><td>Stub and summary based, no areas</td><td>Two levels; borders on links; few PDU types</td></tr>
<tr><td>Convergence</td><td>Fast with throttle, BFD, LFA</td><td>Very fast with feasible successor; query risk</td><td>Fast with throttle, BFD, LFA</td></tr>
<tr><td>Multi-vendor</td><td>Excellent</td><td>Limited in practice</td><td>Excellent (common in provider cores)</td></tr>
<tr><td>IPv4 and IPv6</td><td>OSPFv2 plus OSPFv3 (or v3 for both)</td><td>One process, named mode</td><td>One process; single or multi-topology</td></tr>
<tr><td>Skills and tooling</td><td>Most widely known</td><td>Cisco-centric</td><td>Less known, steep first week</td></tr>
</table>
<p><b>Decision for Cobalt: IS-IS.</b> It meets the multi-vendor requirement, runs IPv4 and IPv6 in one process, scales to 600 routers with a simple two-level hierarchy, and its extensible TLVs suit future features. EIGRP is rejected because of the Juniper sites. OSPF multi-area would also be defensible, and the exam rewards the answer that best matches the stated requirements and constraints, not a favourite protocol. The skills gap is handled with a training plan, not by compromising the design.</p>
<p>Layout: each region is an L1 area (49.0001, 49.0002, 49.0003); the L1/L2 routers form the L2 backbone with the data centers; ring links are point-to-point.</p>
<pre class="code">router isis NK
 net 49.0001.0100.0000.0001.00
 metric-style wide
 set-overload-bit on-startup wait-for-bgp
 spf-interval 5 50 200
 prc-interval 5 50 200
 lsp-gen-interval 5 50 200
 bfd all-interfaces
 address-family ipv6
  multi-topology
 exit-address-family
interface TenGigabitEthernet0/0/0
 ip router isis NK
 ipv6 router isis NK
 isis network point-to-point</pre>
<pre class="out">ST01# show isis neighbors
Tag NK:
System Id      Type Interface     IP Address      State Holdtime Circuit Id
ST02           L1   Te0/0/0       10.4.16.2       UP    27       01
<span class="hl">CORE1          L2   Te0/0/1       10.0.16.1       UP    8        01</span></pre>

<div class="eg"><p><b>Worked example.</b> A fibre ring has 6 stations. With wide metrics and cost 10 per link, a failure of one link turns the path to the far neighbour from 10 into 50. With SPF initial wait 50 ms, BFD at 300 ms by 3 (900 ms detection) and pre-computed LFA, traffic is repaired in tens of milliseconds and the IGP finishes reconverging well within one second.</p></div>

<div class="scn"><h4>Post-mortem: IPv6 black hole in single topology</h4><p>Cobalt first used IS-IS single topology. One station router had a new uplink with <code>ip router isis</code> but the <code>ipv6 router isis</code> line was forgotten. Because both address families share one SPF, the other routers still saw that uplink as a valid path for IPv6, sent traffic to it, and the station dropped it. IPv4 worked, sensor data stopped for 40 minutes, and the cause was hard to see. The team switched to multi-topology so IPv6 builds its own SPF over IPv6-enabled links only.</p><p><b>Lesson:</b> with single topology, every interface in the IS-IS domain must carry both address families. Otherwise use multi-topology.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving narrow metrics on a large network. Making every router L1/L2 (this removes hierarchy and builds a huge L2 database). Letting the L2 backbone become discontiguous. Forgetting that L1 routers choose the nearest L1/L2 router by the ATT default, which can cause suboptimal exit paths unless you leak routes.</p></div>
<div class="exam"><p><b>Exam trap.</b> IS-IS borders are on links, there is no area 0, and the L2 backbone must be contiguous. L1 routers get a default from the ATT bit. The overload bit keeps a router out of transit paths. Pick the IGP using requirements: multi-vendor points away from EIGRP; large provider-like cores favour IS-IS; skills and tooling can favour OSPF.</p></div>

<div class="iv"><p class="q">"OSPF or IS-IS for a new 500-router dual-stack network?"</p><p>Strong answer: start from requirements. Both scale and converge well. IS-IS gives a simple two-level hierarchy, borders on links, one process for both address families and extensible TLVs; OSPF gives broader skills and richer stub area options. State your choice, the reason, and the risk you accept. Mention wide metrics, point-to-point circuits, overload bit and multi-topology.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IS-IS: L1 inside an area, L2 backbone, L1/L2 at the border; borders fall on links.</li>
<li>Use wide metrics, point-to-point circuits and the overload bit at start-up.</li>
<li>Single topology needs identical address-family support on every interface; otherwise multi-topology.</li>
<li>Choose the IGP from requirements: scale, convergence, vendors, address families, skills.</li>
<li>Defend a choice by naming the trade-off you accept.</li>
</ul></div>
`.replace(`@@DIA@@`,o([`Level 2 backbone`,`L2`,`L1/L2`,`Station`,`Area 49.0001 (L1)`,`Area 49.0002 (L1)`,`Area 49.0003 (L1)`,`IS-IS two-level design`,`L1/L2 routers sit on the border; stations in each L1 area follow the attached-bit default toward the L2 backbone.`])),hi:`
<h3>Customer case: Cobalt Energy Pipelines</h3>
<p>Cobalt Energy Pipelines 14 pipeline stations, teen control centers aur do data centers ke beech 380 routers chalata hai, jo fibre rings se jude hain. Traffic dual stack hai: legacy SCADA gateways ke liye IPv4 aur naye sensors ke liye IPv6. Do sites par Juniper routers hain. Network paanch saal mein lagbhag 600 routers tak badhega. Aaj yeh static routes aur RIP-era ke flat design ka jod hai jise koi chhoona nahi chahta.</p>
<p><b>Requirements:</b> IPv4 aur IPv6 ke liye ek IGP, ring failures par ek second se kam convergence, 600 routers tak growth ka support, multi-vendor interoperability. <b>Constraints:</b> staff OSPF ko IS-IS se behtar jaanta hai, do ghante se lambe downtime windows nahi, fibre rings ki wajah se kai equal-cost aur alternate paths.</p>

<h3>IS-IS design ke nazariye se</h3>
<p>IS-IS seedha Layer 2 par chalta hai (yeh CLNS protocol hai, IP nahi), isliye isme IP-level neighbour addressing nahi hoti aur IP filters isse disturb nahi kar sakte. Routers ko <b>NET</b> se pehchana jata hai, jaise <code>49.0001.0100.0000.0001.00</code>: area <code>49.0001</code>, 6-byte <b>system ID</b> aur selector <code>00</code>. IS-IS ke do levels hain. <b>Level 1</b> routers sirf apna area jaante hain. <b>Level 2</b> routers backbone banate hain, jo contiguous hona chahiye lekin kisi special numbered area ki zaroorat nahi. <b>Level 1/2</b> router dono ko jodta hai. OSPF se bada fark: <b>area borders links par hote hain, routers par nahi</b>, isliye router poori tarah ek area ke andar hota hai aur L1/L2 router bas dono levels se connected hota hai. L1/L2 router <b>attached (ATT) bit</b> set karta hai taaki L1 routers uski taraf default route install karein. Behtar paths ke liye selected L2 routes ko L1 mein leak karo; L1/L2 border par <code>summary-address</code> se summarise karo.</p>
<p>Yaad rakhne wale design points: <b>wide metrics</b> use karo (<code>metric-style wide</code>) kyunki narrow metrics per link 63 tak limited hain; router links par <b>point-to-point</b> circuit type chalao taaki DIS election na ho; yaad rakho ki broadcast segment par <b>DIS</b> ka koi backup nahi hota aur woh pre-empt karta hai; start-up par <b>overload bit</b> set karo (<code>set-overload-bit on-startup</code>) taaki reboot hota router BGP aur FIB ready hone se pehle transit traffic na kheenche. IPv6 ke liye <b>single topology</b> (dono protocols ke liye ek SPF) ya <b>multi-topology</b> (alag SPFs) chuno.</p>

@@DIA@@

<h3>Candidate options</h3>
<table class="cmp"><tr><th>Criterion</th><th>OSPF</th><th>EIGRP</th><th>IS-IS</th></tr>
<tr><td>Scale aur hierarchy</td><td>Areas; har router ABR ban sakta hai; kai LSA types</td><td>Stub aur summary based, areas nahi</td><td>Do levels; borders links par; kam PDU types</td></tr>
<tr><td>Convergence</td><td>Throttle, BFD, LFA ke saath fast</td><td>Feasible successor se bahut fast; query risk</td><td>Throttle, BFD, LFA ke saath fast</td></tr>
<tr><td>Multi-vendor</td><td>Excellent</td><td>Practice mein limited</td><td>Excellent (provider cores mein common)</td></tr>
<tr><td>IPv4 aur IPv6</td><td>OSPFv2 aur OSPFv3 (ya dono ke liye v3)</td><td>Ek process, named mode</td><td>Ek process; single ya multi-topology</td></tr>
<tr><td>Skills aur tooling</td><td>Sabse zyada jaana jata hai</td><td>Cisco-centric</td><td>Kam jaana jata hai, pehla hafta mushkil</td></tr>
</table>
<p><b>Cobalt ke liye decision: IS-IS.</b> Yeh multi-vendor requirement poori karta hai, IPv4 aur IPv6 ek hi process mein chalata hai, simple two-level hierarchy ke saath 600 routers tak scale karta hai, aur uske extensible TLVs future features ke liye theek hain. EIGRP ko Juniper sites ki wajah se reject kiya gaya. OSPF multi-area bhi defend ho sakta tha, aur exam us jawab ko reward karta hai jo stated requirements aur constraints se best match kare, kisi pasandida protocol ko nahi. Skills gap ko training plan se bharo, design se samjhauta karke nahi.</p>
<p>Layout: har region ek L1 area hai (49.0001, 49.0002, 49.0003); L1/L2 routers data centers ke saath L2 backbone banate hain; ring links point-to-point hain.</p>
<pre class="code">router isis NK
 net 49.0001.0100.0000.0001.00
 metric-style wide
 set-overload-bit on-startup wait-for-bgp
 spf-interval 5 50 200
 prc-interval 5 50 200
 lsp-gen-interval 5 50 200
 bfd all-interfaces
 address-family ipv6
  multi-topology
 exit-address-family
interface TenGigabitEthernet0/0/0
 ip router isis NK
 ipv6 router isis NK
 isis network point-to-point</pre>
<pre class="out">ST01# show isis neighbors
Tag NK:
System Id      Type Interface     IP Address      State Holdtime Circuit Id
ST02           L1   Te0/0/0       10.4.16.2       UP    27       01
<span class="hl">CORE1          L2   Te0/0/1       10.0.16.1       UP    8        01</span></pre>

<div class="eg"><p><b>Worked example.</b> Ek fibre ring mein 6 stations hain. Wide metrics ke saath, har link ka cost 10, ek link fail hone par door wale neighbour ka path 10 ki jagah 50 ho jata hai. SPF initial wait 50 ms, BFD 300 ms guna 3 (900 ms detection) aur pre-computed LFA ke saath traffic kuch dus milliseconds mein repair ho jata hai aur IGP ek second ke andar aaram se reconverge ho jata hai.</p></div>

<div class="scn"><h4>Post-mortem: single topology mein IPv6 black hole</h4><p>Cobalt ne pehle IS-IS single topology use ki. Ek station router par naye uplink par <code>ip router isis</code> tha lekin <code>ipv6 router isis</code> line bhool gayi. Kyunki dono address families ek hi SPF share karti hain, doosre routers ne us uplink ko IPv6 ke liye valid path maana, traffic wahan bheja, aur station ne use drop kar diya. IPv4 chalta raha, sensor data 40 minute ruka raha, aur wajah dekhna mushkil tha. Team ne multi-topology par switch kiya taaki IPv6 sirf IPv6-enabled links par apna SPF banaye.</p><p><b>Lesson:</b> single topology mein IS-IS domain ke har interface par dono address families honi chahiye. Warna multi-topology use karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Bade network par narrow metrics chhodna. Har router ko L1/L2 banana (isse hierarchy khatam ho jati hai aur bahut bada L2 database banta hai). L2 backbone ko discontiguous hone dena. Yeh bhoolna ki L1 routers ATT default se sabse paas ka L1/L2 router chunte hain, jisse suboptimal exit paths ban sakte hain jab tak routes leak na karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> IS-IS borders links par hote hain, area 0 nahi hota, aur L2 backbone contiguous hona chahiye. L1 routers ATT bit se default pate hain. Overload bit router ko transit paths se bahar rakhta hai. IGP requirements se chuno: multi-vendor EIGRP se door le jata hai; bade provider-jaise cores IS-IS ko favour karte hain; skills aur tooling OSPF ko favour kar sakte hain.</p></div>

<div class="iv"><p class="q">"Naye 500-router dual-stack network ke liye OSPF ya IS-IS?"</p><p>Strong answer: requirements se shuru karo. Dono scale aur converge achhe se karte hain. IS-IS simple two-level hierarchy, links par borders, dono address families ke liye ek process aur extensible TLVs deta hai; OSPF zyada skills aur richer stub area options deta hai. Apna choice, uska reason aur jo risk aap accept karte ho woh batao. Wide metrics, point-to-point circuits, overload bit aur multi-topology ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IS-IS: area ke andar L1, L2 backbone, border par L1/L2; borders links par girte hain.</li>
<li>Wide metrics, point-to-point circuits aur start-up par overload bit use karo.</li>
<li>Single topology ko har interface par same address-family support chahiye; warna multi-topology.</li>
<li>IGP requirements se chuno: scale, convergence, vendors, address families, skills.</li>
<li>Choice ko defend karo us trade-off ka naam lekar jo aap accept karte ho.</li>
</ul></div>
`.replace(`@@DIA@@`,o([`Level 2 backbone`,`L2`,`L1/L2`,`Station`,`Area 49.0001 (L1)`,`Area 49.0002 (L1)`,`Area 49.0003 (L1)`,`IS-IS two-level design`,`L1/L2 routers border par hain; har L1 area ke stations attached-bit default se L2 backbone ki taraf jaate hain.`]))}};export{s as default};