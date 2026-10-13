var e=(e,t,n,r)=>`<text x="`+e+`" y="`+t+`" text-anchor="middle" class="`+(r||`svg-ink`)+`" font-size="12">`+n+`</text>`,t=(e,t,n,r,i)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"`+(i?` stroke-dasharray="5 4"`:``)+`/>`,n=(e,t,n)=>`<circle cx="`+e+`" cy="`+t+`" r="16" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-9)+` `+t+`H`+(e+9)+`M`+e+` `+(t-9)+`V`+(t+9)+`M`+(e-5)+` `+(t-5)+`L`+(e-9)+` `+t+`L`+(e-5)+` `+(t+5)+`M`+(e+5)+` `+(t-5)+`L`+(e+9)+` `+t+`L`+(e+5)+` `+(t+5)+`" fill="none" stroke="#334155" stroke-width="1.5"/>`,r=(e,t,n)=>`<g fill="`+n+`" stroke="none"><ellipse cx="`+e+`" cy="`+(t+4)+`" rx="28" ry="13"/><circle cx="`+(e-10)+`" cy="`+(t-4)+`" r="12"/><circle cx="`+(e+8)+`" cy="`+(t-7)+`" r="15"/></g>`,i=(e,t,n)=>`<rect x="`+(e-16)+`" y="`+(t-18)+`" width="32" height="36" rx="3" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-9)+` `+(t-10)+`h5v5h-5zM`+(e+4)+` `+(t-10)+`h5v5h-5zM`+(e-9)+` `+(t+1)+`h5v5h-5zM`+(e+4)+` `+(t+1)+`h5v5h-5z" fill="#ffffff" stroke="none"/>`,a=(e,t,n)=>`<rect x="`+(e-14)+`" y="`+(t-17)+`" width="28" height="34" rx="3" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-8)+` `+(t-8)+`H`+(e+8)+`M`+(e-8)+` `+t+`H`+(e+8)+`M`+(e-8)+` `+(t+8)+`H`+(e+8)+`" stroke="#334155" stroke-width="2"/>`,o=(e,t,n,r)=>`<rect x="`+e+`" y="`+(t-9)+`" width="12" height="12" rx="2" fill="`+n+`" stroke="#475569"/><text x="`+(e+17)+`" y="`+(t+1)+`" class="svg-muted" font-size="11">`+r+`</text>`,s=(e,t,n,r)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="`+t+`">`+n+`</svg><p class="cap">`+r+`</p></div>`,c=c=>{let l=a(200,36,`#fde68a`)+a(440,36,`#fde68a`)+e(200,66,c[2],`svg-muted`)+e(440,66,c[2],`svg-muted`)+t(200,53,200,84)+t(440,53,440,84)+t(200,116,296,160)+t(440,116,344,160)+n(200,100,`#ddd6fe`)+`<text x="224" y="104" class="svg-ink" font-size="12">`+c[0]+`</text>`+n(440,100,`#ddd6fe`)+`<text x="464" y="104" class="svg-ink" font-size="12">`+c[1]+`</text>`+t(320,186,70,252,1)+t(320,186,190,252,1)+t(320,186,320,252,1)+t(320,186,450,252,1)+t(320,186,570,252,1)+r(320,170,`#e2e8f0`)+e(150,178,c[6],`svg-accent`)+i(70,270,`#bbf7d0`)+i(190,270,`#bbf7d0`)+i(320,270,`#fecaca`)+i(450,270,`#bbf7d0`)+i(570,270,`#bbf7d0`)+e(70,300,c[4],`svg-muted`)+e(190,300,c[4],`svg-muted`)+e(320,300,c[5],`svg-muted`)+e(450,300,c[4],`svg-muted`)+e(570,300,c[4],`svg-muted`)+e(500,178,c[7],`svg-accent`)+o(10,330,`#ddd6fe`,c[8])+o(110,330,`#bbf7d0`,c[4])+o(250,330,`#fecaca`,c[5])+o(390,330,`#fde68a`,c[2])+o(510,330,`#e2e8f0`,c[3]);return s(345,c[9],l,c[10])},l={id:`eigrp-design`,h:{en:`EIGRP design: stub, summarisation and query scope`,hi:`EIGRP design: stub, summarisation aur query scope`},body:{en:`
<h3>Customer case: Lakeshore Hospitals</h3>
<p>Lakeshore Hospitals runs 240 outpatient clinics, two data centers and two hub routers per data center. Every clinic has a private WAN link and a backup VPN. The whole company already runs EIGRP, and the staff know it well. IPv6 is planned for next year, and the clinic count will reach 400 in three years. Clinic routers are low-end platforms with limited CPU.</p>
<p><b>Symptoms:</b> a clinic whose LTE backup link flapped made 15 other clinics lose connectivity for several minutes. The logs showed <code>DUAL-3-SIA</code> messages and neighbours being reset. <b>Requirements:</b> a clinic problem must never affect other clinics, failover under 5 seconds, scale to 400 clinics, IPv6 ready. <b>Constraints:</b> keep EIGRP (skills and tooling), no clinic hardware change, small team.</p>

<h3>How EIGRP converges, and where it hurts</h3>
<p>EIGRP uses <b>DUAL</b>. Each router keeps a <b>successor</b> (best path) and, if one exists, a <b>feasible successor</b> (a backup that meets the feasibility condition: its reported distance is lower than the current feasible distance). If the successor fails and a feasible successor exists, the router switches in microseconds with no query; this is local computation. If no feasible successor exists, the route goes <b>active</b>: the router sends <b>queries</b> to all neighbours, and they query theirs in turn, until every router has replied. The route is <b>stuck in active (SIA)</b> if replies do not return within the active timer (3 minutes by default), and the neighbour that did not answer is reset. Slow links, congested paths and very large query scopes cause SIA.</p>
<p>So the design question is: <b>how far does a query travel?</b> Query scope is the EIGRP equivalent of the OSPF area. You bound it with <b>stub routers</b>, with <b>summarisation</b> (a query for a more-specific prefix that is hidden by a summary is answered immediately at the boundary), and with route filters.</p>

@@DIA@@

<h3>Candidate options</h3>
<table class="cmp"><tr><th>Option</th><th>Query scope</th><th>Table size at clinic</th><th>Effort and risk</th></tr>
<tr><td><b>A. Keep flat EIGRP</b></td><td>Whole WAN: any flap can query 240 clinics</td><td>All routes</td><td>None, but SIA risk stays</td></tr>
<tr><td><b>B. Stub clinics plus default from hubs</b></td><td>Stops at the hub</td><td>One default plus connected</td><td>Low: small config change</td></tr>
<tr><td><b>C. Migrate WAN to OSPF</b></td><td>Area-bounded</td><td>Depends on area type</td><td>High: migration of 240 routers</td></tr>
<tr><td><b>D. BGP to clinics</b></td><td>No query concept</td><td>Policy-controlled</td><td>High: new skills</td></tr>
</table>
<p><b>Decision: option B.</b> It removes the root cause (queries reaching clinics) with the smallest change and keeps the team's skills. It meets all requirements; options C and D add risk without a requirement that demands them.</p>

<h3>The chosen design</h3>
<p>Each clinic is configured as an <b>EIGRP stub</b>. A stub tells its neighbours: "do not send me queries; I only advertise my own connected prefixes". The hubs run <b>named mode</b> (also called wide mode), which uses 64-bit <b>wide metrics</b>, supports IPv4 and IPv6 address families in one process, and groups interface settings under <code>af-interface</code>. Each hub sends only a default route to clinics with a summary, and summarises the DC and clinic ranges toward the core, so a clinic LAN flap changes nothing outside its hub. Primary and backup paths are distinguished by metric; <code>variance</code> would allow unequal-cost load sharing over feasible successors, but a hospital WAN usually prefers a clean primary/backup path.</p>
<pre class="code"><span class="c">! Hub: send only a default route to the clinic-facing interface</span>
router eigrp LAKESHORE
 address-family ipv4 unicast autonomous-system 100
  af-interface Tunnel0
   summary-address 0.0.0.0 0.0.0.0
   hello-interval 5
   hold-time 15
  exit-af-interface
  eigrp router-id 10.0.0.21
 exit-address-family
<span class="c">! Clinic: stub, advertise connected networks only</span>
router eigrp LAKESHORE
 address-family ipv4 unicast autonomous-system 100
  eigrp stub connected
 exit-address-family</pre>
<pre class="out">HUB1# show ip eigrp neighbors detail
EIGRP-IPv4 VR(LAKESHORE) Address-Family Neighbors for AS(100)
H   Address         Interface   Hold Uptime   SRTT   RTO  Q  Seq
0   10.20.0.2       Tu0           12 02:11:07   14   100  0  311
   Version 23.0/2.0, Retrans: 0, Retries: 0, Prefixes: 1
<span class="hl">   Stub Peer Advertising ( CONNECTED ) Routes</span>
<span class="hl">   Suppressing queries</span></pre>

<div class="eg"><p><b>Worked example.</b> Before the change, a lost clinic LAN triggered queries to up to 239 other clinics through two hubs: about 480 query and reply exchanges over slow links. After the change, the hub holds the route, sees the neighbour is a stub, and sends no query at all: zero exchanges to other clinics. Hello 5 s and hold 15 s on the WAN interface detects a dead neighbour in at most 15 seconds without BFD; with BFD on the WAN link, detection drops to about a second.</p></div>

<div class="scn"><h4>Post-mortem: the clinic that took down fifteen</h4><p>Clinic 17 lost its LAN subnet when an access switch failed. Because clinics were ordinary EIGRP routers, both hubs queried every clinic. Clinics 30 to 44 were on a congested LTE backup and did not answer in time. The active timer expired, the hubs reset those neighbours, and the clinics reconverged, flapping again each time. The outage lasted about eight minutes. After the stub change, a repeat failure of the same switch produced one log line and no impact elsewhere.</p><p><b>Lesson:</b> EIGRP scale is limited by query scope, not by the number of routers. Stubs and summaries are the design tools, not timers.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Making a spoke that also acts as a transit router a stub: a stub never advertises routes learned from other neighbours (unless configured with <code>eigrp stub</code> keywords such as <code>redistributed</code> or <code>static</code>), so a downstream network would be unreachable. Summarising at the hub but leaving a discontiguous prefix in the range. Mixing classic and named mode on the same router without checking that metrics and K values match.</p></div>
<div class="exam"><p><b>Exam trap.</b> The three ways to bound EIGRP queries are stub, summarisation and filtering. A feasible successor lets EIGRP converge without queries. Named mode is required for wide metrics and is the recommended way to run IPv4 and IPv6 together. The summary route that EIGRP creates points to Null0 (administrative distance 5).</p></div>

<div class="iv"><p class="q">"A flapping remote site is causing stuck-in-active events. What do you do?"</p><p>Strong answer: explain DUAL query behaviour, confirm the topology with show ip eigrp topology and the logs, then fix the design: make spokes stubs, summarise at the hub toward spokes (often default only), and use feasible successors where possible. Mention BFD for faster detection and that raising the active timer only hides the problem.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EIGRP converges fast with a feasible successor and slowly when queries must travel.</li>
<li>Bound the query scope with stub, summarisation and filters.</li>
<li>Hub-and-spoke: stub spokes, default or summaries from the hub.</li>
<li>Named mode gives wide metrics and one process for IPv4 and IPv6.</li>
<li>Summaries create a Null0 route with AD 5; keep ranges contiguous.</li>
</ul></div>
`.replace(`@@DIA@@`,c([`Hub 1`,`Hub 2`,`Data center`,`WAN`,`Clinic (stub)`,`Flapping clinic`,`Hubs send only 0.0.0.0/0`,`Queries stop at stubs`,`Hub`,`EIGRP hub and spoke with stub clinics`,`Stub clinics are never queried, and hubs advertise only a default route to them.`])),hi:`
<h3>Customer case: Lakeshore Hospitals</h3>
<p>Lakeshore Hospitals 240 outpatient clinics, do data centers aur har data center mein do hub routers chalata hai. Har clinic ke paas ek private WAN link aur ek backup VPN hai. Poori company pehle se EIGRP chalati hai aur staff ise achhe se jaanta hai. IPv6 agle saal plan hai, aur clinics ki sankhya teen saal mein 400 ho jayegi. Clinic routers low-end platforms hain jinka CPU limited hai.</p>
<p><b>Symptoms:</b> ek clinic ka LTE backup link flap hua to 15 doosre clinics kai minute ke liye connectivity kho baithe. Logs mein <code>DUAL-3-SIA</code> messages the aur neighbours reset ho rahe the. <b>Requirements:</b> ek clinic ki problem doosre clinics ko kabhi affect na kare, failover 5 second se kam, 400 clinics tak scale, IPv6 ready. <b>Constraints:</b> EIGRP rakhna hai (skills aur tooling), clinic hardware change nahi, chhoti team.</p>

<h3>EIGRP kaise converge karta hai, aur kahan dard hota hai</h3>
<p>EIGRP <b>DUAL</b> use karta hai. Har router ek <b>successor</b> (best path) rakhta hai aur, agar ho, ek <b>feasible successor</b> (backup jo feasibility condition poori karta ho: uska reported distance current feasible distance se kam ho). Agar successor fail ho jaye aur feasible successor maujood ho, to router microseconds mein switch kar leta hai bina query ke; yeh local computation hai. Agar feasible successor nahi hai, to route <b>active</b> ho jata hai: router apne saare neighbours ko <b>queries</b> bhejta hai, woh apne neighbours ko, jab tak har router reply na kar de. Agar active timer (default 3 minute) ke andar replies wapas na aayein to route <b>stuck in active (SIA)</b> ho jata hai, aur jis neighbour ne jawab nahi diya use reset kar diya jata hai. Slow links, congested paths aur bahut bade query scope SIA ki wajah bante hain.</p>
<p>Isliye design ka sawal hai: <b>query kitni door tak jaati hai?</b> Query scope EIGRP mein wahi hai jo OSPF mein area hai. Ise <b>stub routers</b>, <b>summarisation</b> (summary ke peeche chhupe more-specific prefix ki query boundary par hi jawab de di jaati hai) aur route filters se bound karte hain.</p>

@@DIA@@

<h3>Candidate options</h3>
<table class="cmp"><tr><th>Option</th><th>Query scope</th><th>Clinic par table size</th><th>Effort aur risk</th></tr>
<tr><td><b>A. Flat EIGRP rakho</b></td><td>Poora WAN: koi bhi flap 240 clinics ko query kar sakta hai</td><td>Saare routes</td><td>Kuch nahi, lekin SIA risk bana rehta hai</td></tr>
<tr><td><b>B. Stub clinics + hubs se default</b></td><td>Hub par ruk jaati hai</td><td>Ek default aur connected</td><td>Kam: chhota config change</td></tr>
<tr><td><b>C. WAN ko OSPF par migrate karo</b></td><td>Area-bounded</td><td>Area type par depend</td><td>Zyada: 240 routers ka migration</td></tr>
<tr><td><b>D. Clinics tak BGP</b></td><td>Query concept nahi</td><td>Policy-controlled</td><td>Zyada: naye skills</td></tr>
</table>
<p><b>Decision: option B.</b> Yeh sabse chhote change se root cause (clinics tak pahunchti queries) hata deta hai aur team ke skills bachata hai. Sab requirements poori hoti hain; options C aur D aisa risk jodte hain jiski koi requirement maang nahi karti.</p>

<h3>Chosen design</h3>
<p>Har clinic ko <b>EIGRP stub</b> configure kiya jata hai. Stub apne neighbours se kehta hai: "mujhe queries mat bhejo; main sirf apne connected prefixes advertise karta hoon". Hubs <b>named mode</b> (jise wide mode bhi kehte hain) chalate hain, jo 64-bit <b>wide metrics</b> use karta hai, ek process mein IPv4 aur IPv6 address families support karta hai, aur interface settings ko <code>af-interface</code> ke neeche group karta hai. Har hub clinics ko summary ke saath sirf default route bhejta hai, aur core ki taraf DC aur clinic ranges summarise karta hai, isliye clinic LAN ka flap apne hub ke bahar kuch nahi badalta. Primary aur backup paths metric se alag hote hain; <code>variance</code> feasible successors par unequal-cost load sharing deta, lekin hospital WAN aam taur par saaf primary/backup path pasand karta hai.</p>
<pre class="code"><span class="c">! Hub: send only a default route to the clinic-facing interface</span>
router eigrp LAKESHORE
 address-family ipv4 unicast autonomous-system 100
  af-interface Tunnel0
   summary-address 0.0.0.0 0.0.0.0
   hello-interval 5
   hold-time 15
  exit-af-interface
  eigrp router-id 10.0.0.21
 exit-address-family
<span class="c">! Clinic: stub, advertise connected networks only</span>
router eigrp LAKESHORE
 address-family ipv4 unicast autonomous-system 100
  eigrp stub connected
 exit-address-family</pre>
<pre class="out">HUB1# show ip eigrp neighbors detail
EIGRP-IPv4 VR(LAKESHORE) Address-Family Neighbors for AS(100)
H   Address         Interface   Hold Uptime   SRTT   RTO  Q  Seq
0   10.20.0.2       Tu0           12 02:11:07   14   100  0  311
   Version 23.0/2.0, Retrans: 0, Retries: 0, Prefixes: 1
<span class="hl">   Stub Peer Advertising ( CONNECTED ) Routes</span>
<span class="hl">   Suppressing queries</span></pre>

<div class="eg"><p><b>Worked example.</b> Change se pehle ek clinic LAN ke lost hone par do hubs ke through 239 doosre clinics tak queries jaati thi: slow links par lagbhag 480 query aur reply exchanges. Change ke baad hub route rakhta hai, dekhta hai ki neighbour stub hai, aur koi query bhejta hi nahi: doosre clinics ko zero exchanges. WAN interface par hello 5 s aur hold 15 s BFD ke bina dead neighbour ko zyada se zyada 15 second mein pakadte hain; WAN link par BFD ke saath detection lagbhag ek second tak aa jata hai.</p></div>

<div class="scn"><h4>Post-mortem: ek clinic jisne pandrah giraye</h4><p>Clinic 17 ka LAN subnet tab gaya jab ek access switch fail hua. Clinics aam EIGRP routers the, isliye dono hubs ne har clinic ko query ki. Clinics 30 se 44 congested LTE backup par the aur samay par jawab nahi de paye. Active timer expire hua, hubs ne un neighbours ko reset kiya, aur clinics reconverge hote hi baar-baar flap karte rahe. Outage lagbhag aath minute chala. Stub change ke baad usi switch ke dobara fail hone par sirf ek log line aayi aur kahin koi asar nahi hua.</p><p><b>Lesson:</b> EIGRP ki scale routers ki sankhya se nahi, query scope se limit hoti hai. Stubs aur summaries design tools hain, timers nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Aise spoke ko stub banana jo transit router bhi hai: stub doosre neighbours se seekhe routes advertise nahi karta (jab tak <code>eigrp stub</code> ke keywords jaise <code>redistributed</code> ya <code>static</code> configure na ho), isliye downstream network unreachable ho jata hai. Hub par summarise karna lekin range mein discontiguous prefix chhod dena. Ek hi router par classic aur named mode mix karna bina check kiye ki metrics aur K values match karte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> EIGRP queries ko bound karne ke teen tareeke: stub, summarisation aur filtering. Feasible successor EIGRP ko bina queries ke converge karne deta hai. Wide metrics ke liye named mode chahiye aur IPv4 aur IPv6 saath chalane ka recommended tareeka yahi hai. EIGRP jo summary route banata hai woh Null0 ki taraf point karta hai (administrative distance 5).</p></div>

<div class="iv"><p class="q">"Ek flapping remote site stuck-in-active events paida kar rahi hai. Aap kya karoge?"</p><p>Strong answer: DUAL query behaviour samjhao, show ip eigrp topology aur logs se topology confirm karo, phir design fix karo: spokes ko stub banao, hub par spokes ki taraf summarise karo (aksar sirf default), aur jahan possible ho feasible successors use karo. Faster detection ke liye BFD batao aur yeh bhi ki active timer badhana sirf problem chhupata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EIGRP feasible successor ke saath fast converge karta hai aur jab queries door tak jaayein to slow.</li>
<li>Query scope ko stub, summarisation aur filters se bound karo.</li>
<li>Hub-and-spoke: stub spokes, hub se default ya summaries.</li>
<li>Named mode wide metrics aur IPv4 aur IPv6 ke liye ek process deta hai.</li>
<li>Summaries AD 5 wala Null0 route banate hain; ranges contiguous rakho.</li>
</ul></div>
`.replace(`@@DIA@@`,c([`Hub 1`,`Hub 2`,`Data center`,`WAN`,`Clinic (stub)`,`Flapping clinic`,`Hubs sirf 0.0.0.0/0 bhejte hain`,`Queries stubs par ruk jaati hain`,`Hub`,`Stub clinics ke saath EIGRP hub and spoke`,`Stub clinics ko kabhi query nahi jaati, aur hubs unhe sirf default route dete hain.`]))}};export{l as default};