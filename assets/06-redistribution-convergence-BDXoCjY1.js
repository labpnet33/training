var e=(e,t,n,r)=>`<text x="`+e+`" y="`+t+`" text-anchor="middle" class="`+(r||`svg-ink`)+`" font-size="12">`+n+`</text>`,t=(e,t,n,r,i)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"`+(i?` stroke-dasharray="5 4"`:``)+`/>`,n=(e,t,n)=>`<circle cx="`+e+`" cy="`+t+`" r="16" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-9)+` `+t+`H`+(e+9)+`M`+e+` `+(t-9)+`V`+(t+9)+`M`+(e-5)+` `+(t-5)+`L`+(e-9)+` `+t+`L`+(e-5)+` `+(t+5)+`M`+(e+5)+` `+(t-5)+`L`+(e+9)+` `+t+`L`+(e+5)+` `+(t+5)+`" fill="none" stroke="#334155" stroke-width="1.5"/>`,r=(e,t,n)=>`<g fill="`+n+`" stroke="none"><ellipse cx="`+e+`" cy="`+(t+4)+`" rx="28" ry="13"/><circle cx="`+(e-10)+`" cy="`+(t-4)+`" r="12"/><circle cx="`+(e+8)+`" cy="`+(t-7)+`" r="15"/></g>`,i=(e,t,n)=>`<rect x="`+(e-16)+`" y="`+(t-18)+`" width="32" height="36" rx="3" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-9)+` `+(t-10)+`h5v5h-5zM`+(e+4)+` `+(t-10)+`h5v5h-5zM`+(e-9)+` `+(t+1)+`h5v5h-5zM`+(e+4)+` `+(t+1)+`h5v5h-5z" fill="#ffffff" stroke="none"/>`,a=(e,t,n)=>`<rect x="`+(e-14)+`" y="`+(t-17)+`" width="28" height="34" rx="3" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-8)+` `+(t-8)+`H`+(e+8)+`M`+(e-8)+` `+t+`H`+(e+8)+`M`+(e-8)+` `+(t+8)+`H`+(e+8)+`" stroke="#334155" stroke-width="2"/>`,o=(e,t,n,r)=>`<rect x="`+e+`" y="`+(t-9)+`" width="12" height="12" rx="2" fill="`+n+`" stroke="#475569"/><text x="`+(e+17)+`" y="`+(t+1)+`" class="svg-muted" font-size="11">`+r+`</text>`,s=(e,t,n,r)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="`+t+`">`+n+`</svg><p class="cap">`+r+`</p></div>`,c=c=>{let l=t(128,136,304,90)+t(128,150,304,200)+t(512,136,336,90)+t(512,150,336,200)+t(320,106,320,184,1)+t(80,156,60,222)+t(120,156,140,222)+t(520,156,500,222)+t(560,156,580,222)+r(100,140,`#bbf7d0`)+e(100,175,c[0])+r(540,140,`#bae6fd`)+e(540,175,c[1])+n(320,90,`#fed7aa`)+`<text x="344" y="94" class="svg-ink" font-size="12">`+c[2]+`</text>`+n(320,200,`#fed7aa`)+`<text x="344" y="204" class="svg-ink" font-size="12">`+c[3]+`</text>`+e(320,60,c[6],`svg-accent`)+`<text x="332" y="150" class="svg-accent" font-size="12">`+c[7]+`</text>`+i(60,240,`#bbf7d0`)+i(140,240,`#bbf7d0`)+a(500,240,`#fde68a`)+a(580,240,`#fde68a`)+e(60,272,c[4],`svg-muted`)+e(140,272,c[4],`svg-muted`)+e(500,272,c[5],`svg-muted`)+e(580,272,c[5],`svg-muted`)+o(10,312,`#bbf7d0`,c[0])+o(160,312,`#bae6fd`,c[1])+o(310,312,`#fed7aa`,c[8]);return s(330,c[9],l,c[10])},l={id:`redistribution-convergence`,h:{en:`Redistribution, filtering and fast convergence`,hi:`Redistribution, filtering aur fast convergence`},body:{en:`
<h3>Customer case: Tandem Manufacturing</h3>
<p>Tandem Manufacturing has 12 plants running EIGRP AS 100 and has just acquired a corporate campus with a data center that runs OSPF. The board wants both networks reachable within 90 days. Plant production systems (MES) cannot tolerate a link failure that lasts more than a second. A full migration to one protocol is planned for next year, not now.</p>
<p><b>Requirements:</b> any plant reaches any campus system and back; the two routing domains must not create loops; a failed plant ring link must recover in under one second. <b>Constraints:</b> keep both IGPs for 12 months; two redistribution routers for resilience (R1 and R2); no new hardware at plants; the change must be reversible.</p>

<h3>Redistribution: what can go wrong</h3>
<p><b>Redistribution</b> copies routes from one routing source into another. It is a boundary tool for mergers and migrations, not a permanent design. Each protocol has its own metric and administrative distance (AD): EIGRP internal 90, OSPF 110, IS-IS 115, EIGRP external 170, eBGP 20, iBGP 200. Routes lose their original metric when they cross, so you must supply a <b>seed metric</b> (EIGRP needs bandwidth, delay, reliability, load and MTU, or a <code>default-metric</code>; OSPF gives externals a default metric of 20 and type E2). OSPF also needs the <code>subnets</code> keyword or classless subnets are not redistributed.</p>

@@DIA@@

<table class="cmp"><tr><th>Pitfall</th><th>What you see</th><th>Design control</th></tr>
<tr><td>Missing seed metric</td><td>Routes not appearing on the other side</td><td>Always set metric or default-metric</td></tr>
<tr><td>Missing <code>subnets</code> in OSPF</td><td>Only classful networks redistributed</td><td>Use <code>redistribute ... subnets</code></td></tr>
<tr><td>Route feedback (mutual redistribution)</td><td>Withdrawn route lingers or loops; suboptimal paths</td><td>Tag on entry, deny the tag on the way back</td></tr>
<tr><td>AD mismatch</td><td>Router prefers a redistributed copy over the real route</td><td>Tags and filters first; change AD only as a last resort</td></tr>
<tr><td>Too many routes injected</td><td>Large tables, unstable domain</td><td>Summarise and filter with prefix lists at the boundary</td></tr>
</table>

<h3>Options and decision</h3>
<table class="cmp"><tr><th>Option</th><th>Benefit</th><th>Risk</th></tr>
<tr><td><b>A. Mutual redistribution, no controls</b></td><td>Fastest to configure</td><td>Feedback loops; unpredictable failover</td></tr>
<tr><td><b>B. One redistribution router</b></td><td>No feedback possible</td><td>Single point of failure and a bottleneck</td></tr>
<tr><td><b>C. Two routers, one-way plus defaults</b></td><td>Simple and loop-free</td><td>Plants lose specific campus routes (less optimal paths)</td></tr>
<tr><td><b>D. Two routers, mutual, tagged and filtered</b></td><td>Resilient, specific routes both ways</td><td>More configuration to keep consistent</td></tr>
</table>
<p><b>Decision: option D.</b> The business needs specific routes and resilience; tags remove the loop risk and the design is reversible when the migration finishes. Prefix lists limit what crosses, and summarisation keeps the table small.</p>
<pre class="code"><span class="c">! Same configuration on R1 and R2</span>
route-map EIGRP-TO-OSPF deny 10
 match tag 110
route-map EIGRP-TO-OSPF permit 20
 set tag 100
route-map OSPF-TO-EIGRP deny 10
 match tag 100
route-map OSPF-TO-EIGRP permit 20
 set tag 110
router ospf 1
 redistribute eigrp 100 subnets route-map EIGRP-TO-OSPF
router eigrp 100
 redistribute ospf 1 metric 1000000 10 255 1 1500 route-map OSPF-TO-EIGRP</pre>

<h3>Fast convergence: the four stages</h3>
<p>Convergence is <b>detect</b>, <b>propagate</b>, <b>process</b>, <b>update</b>. Shorten each: detection with BFD or a short carrier delay; propagation with link-state flood and SPF throttle timers; processing with incremental or partial calculation; update with hardware FIB programming and pre-computed repair paths. <b>IP Fast Reroute (IP FRR)</b> installs a <b>loop-free alternate (LFA)</b> next hop in the FIB before a failure, so repair takes tens of milliseconds. A neighbour is a valid LFA if its distance to the destination is less than its distance to you plus your distance to the destination. In rings this condition often fails, so <b>remote LFA</b> adds a tunnel to a distant node. EIGRP has the same idea built in as the feasible successor.</p>
<table class="cmp"><tr><th>Mechanism</th><th>Speeds</th><th>Caution</th></tr>
<tr><td>BFD</td><td>Failure detection (sub-second)</td><td>Too aggressive timers flap on shared or busy links</td></tr>
<tr><td>SPF/LSA throttle, tuned hello and hold</td><td>Propagation and processing</td><td>Do not set so low that a storm causes repeated runs</td></tr>
<tr><td>IP FRR (LFA, remote LFA)</td><td>Repair in the FIB</td><td>Coverage depends on topology; not guaranteed</td></tr>
<tr><td>NSF/SSO, graceful restart</td><td>Keeps forwarding during a control-plane restart</td><td>Needs neighbour support</td></tr>
<tr><td>BGP PIC, best external, add-path</td><td>BGP prefix repair</td><td>More memory; design for it</td></tr>
</table>
<pre class="code">interface TenGigabitEthernet0/0/1
 bfd interval 300 min_rx 300 multiplier 3
router ospf 1
 bfd all-interfaces
 fast-reroute per-prefix enable prefix-priority low</pre>
<pre class="out">PLANT3# show ip route 10.12.8.0
Routing entry for 10.12.8.0/24
  Known via "ospf 1", distance 110, metric 30, type intra area
  * 10.0.16.5, from 10.0.0.12, 00:03:11 ago, via TenGigabitEthernet0/0/1
<span class="hl">      repair path via 10.0.16.9, TenGigabitEthernet0/0/2, metric 40</span></pre>

<div class="eg"><p><b>Worked example.</b> Detection at BFD 300 ms by 3 takes 900 ms in the worst case. If the plant needs a one-second repair, detection alone uses nearly all of it, so the plant ring should rely on IP FRR (repair as soon as the interface or BFD session drops) for the first failure, with the IGP reconverging afterwards. A 50 ms by 3 setting would detect in 150 ms but needs hardware-offloaded BFD.</p></div>

<div class="scn"><h4>Post-mortem 1: the route that would not die</h4><p>Without tags, a campus subnet was withdrawn in OSPF but kept being redistributed round and round: R1 had put it into EIGRP, R2 learned the EIGRP copy and fed it back into OSPF. Users reached a decommissioned subnet for ten minutes and a loop appeared during the next change. Tags broke the feedback path.</p></div>
<div class="scn"><h4>Post-mortem 2: BFD set too hot</h4><p>Another site set BFD to 50 ms by 3 on a congested WAN with software BFD. Routine CPU peaks dropped sessions, the IGP flapped several times a day and each flap re-ran SPF in the area. The fix was 300 ms by 3 and IP FRR for the critical ring.</p><p><b>Lesson:</b> redistribution is a controlled boundary, and fast convergence is chosen against the platform's limits, not set to the minimum.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Redistributing a full BGP table into an IGP. Leaving out route filters and letting a leak flood the domain. Assuming LFA protects every prefix in every topology. Treating redistribution as a permanent design.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the AD values. Know that mutual redistribution at more than one point needs tags and filters. Route summarisation reduces the number of routes crossing the boundary. For fast convergence name the stage you are shortening: detection (BFD), propagation or processing (throttle timers), or update (IP FRR).</p></div>

<div class="iv"><p class="q">"You must redistribute between EIGRP and OSPF at two routers. How do you avoid loops?"</p><p>Strong answer: tag routes when they enter each protocol, deny those tags on the way back, set seed metrics, use prefix lists to limit what crosses, summarise where possible, keep a single direction plus defaults if you can, and verify with traceroute and by failing one router.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Redistribution is a boundary tool; supply seed metrics and use the subnets keyword in OSPF.</li>
<li>Mutual redistribution at two points needs route tags and filters to stop feedback.</li>
<li>Convergence has four stages: detect, propagate, process, update.</li>
<li>BFD speeds detection; throttle timers speed processing; IP FRR speeds repair.</li>
<li>Tune to what the platform can hold; aggressive timers cause flaps.</li>
</ul></div>
`.replace(`@@DIA@@`,c([`EIGRP plants`,`OSPF campus`,`R1`,`R2`,`Plant`,`Data center`,`Tag routes as they cross`,`Loop if untagged`,`Redistribution router`,`Two-way redistribution between EIGRP and OSPF`,`Two redistribution routers give resilience, and route tags stop one router re-injecting what the other injected.`])),hi:`
<h3>Customer case: Tandem Manufacturing</h3>
<p>Tandem Manufacturing ke 12 plants EIGRP AS 100 chalate hain aur usne abhi ek corporate campus kharida hai jisme data center hai aur woh OSPF chalata hai. Board chahta hai ki 90 din mein dono networks reachable hon. Plant production systems (MES) ek second se zyada chalne wala link failure bardasht nahi kar sakte. Ek protocol par poora migration agle saal plan hai, abhi nahi.</p>
<p><b>Requirements:</b> koi bhi plant kisi bhi campus system tak pahunche aur wapas; dono routing domains loops na banayein; plant ring ka failed link ek second se kam mein recover ho. <b>Constraints:</b> 12 mahine tak dono IGPs rakhne hain; resilience ke liye do redistribution routers (R1 aur R2); plants par naya hardware nahi; change reversible hona chahiye.</p>

<h3>Redistribution: kya galat ho sakta hai</h3>
<p><b>Redistribution</b> ek routing source ke routes ko doosre mein copy karta hai. Yeh mergers aur migrations ke liye boundary tool hai, permanent design nahi. Har protocol ka apna metric aur administrative distance (AD) hota hai: EIGRP internal 90, OSPF 110, IS-IS 115, EIGRP external 170, eBGP 20, iBGP 200. Cross karte waqt routes apna original metric kho dete hain, isliye aapko <b>seed metric</b> dena padta hai (EIGRP ko bandwidth, delay, reliability, load aur MTU chahiye, ya <code>default-metric</code>; OSPF externals ko default metric 20 aur type E2 deta hai). OSPF ko <code>subnets</code> keyword bhi chahiye warna classless subnets redistribute nahi hote.</p>

@@DIA@@

<table class="cmp"><tr><th>Pitfall</th><th>Kya dikhta hai</th><th>Design control</th></tr>
<tr><td>Seed metric missing</td><td>Doosri taraf routes nahi aate</td><td>Hamesha metric ya default-metric set karo</td></tr>
<tr><td>OSPF mein <code>subnets</code> missing</td><td>Sirf classful networks redistribute hote hain</td><td><code>redistribute ... subnets</code> use karo</td></tr>
<tr><td>Route feedback (mutual redistribution)</td><td>Withdrawn route tikta hai ya loop banta hai; suboptimal paths</td><td>Entry par tag lagao, wapsi par woh tag deny karo</td></tr>
<tr><td>AD mismatch</td><td>Router asli route ki jagah redistributed copy prefer karta hai</td><td>Pehle tags aur filters; AD sirf aakhri upay</td></tr>
<tr><td>Bahut zyada routes inject</td><td>Bade tables, unstable domain</td><td>Boundary par prefix lists se summarise aur filter karo</td></tr>
</table>

<h3>Options aur decision</h3>
<table class="cmp"><tr><th>Option</th><th>Fayda</th><th>Risk</th></tr>
<tr><td><b>A. Mutual redistribution, koi control nahi</b></td><td>Configure karna sabse tez</td><td>Feedback loops; unpredictable failover</td></tr>
<tr><td><b>B. Ek redistribution router</b></td><td>Feedback possible hi nahi</td><td>Single point of failure aur bottleneck</td></tr>
<tr><td><b>C. Do routers, one-way aur defaults</b></td><td>Simple aur loop-free</td><td>Plants specific campus routes kho dete hain (kam optimal paths)</td></tr>
<tr><td><b>D. Do routers, mutual, tagged aur filtered</b></td><td>Resilient, dono taraf specific routes</td><td>Consistent rakhne ke liye zyada configuration</td></tr>
</table>
<p><b>Decision: option D.</b> Business ko specific routes aur resilience chahiye; tags loop risk hata dete hain aur migration khatam hone par design reversible hai. Prefix lists tay karte hain ki kya cross kare, aur summarisation table chhoti rakhti hai.</p>
<pre class="code"><span class="c">! Same configuration on R1 and R2</span>
route-map EIGRP-TO-OSPF deny 10
 match tag 110
route-map EIGRP-TO-OSPF permit 20
 set tag 100
route-map OSPF-TO-EIGRP deny 10
 match tag 100
route-map OSPF-TO-EIGRP permit 20
 set tag 110
router ospf 1
 redistribute eigrp 100 subnets route-map EIGRP-TO-OSPF
router eigrp 100
 redistribute ospf 1 metric 1000000 10 255 1 1500 route-map OSPF-TO-EIGRP</pre>

<h3>Fast convergence: chaar stages</h3>
<p>Convergence ke chaar stages hain: <b>detect</b>, <b>propagate</b>, <b>process</b>, <b>update</b>. Har ko chhota karo: detection BFD ya chhote carrier delay se; propagation link-state flood aur SPF throttle timers se; processing incremental ya partial calculation se; update hardware FIB programming aur pre-computed repair paths se. <b>IP Fast Reroute (IP FRR)</b> failure se pehle hi FIB mein <b>loop-free alternate (LFA)</b> next hop install kar deta hai, isliye repair kuch dus milliseconds mein ho jata hai. Neighbour tab valid LFA hai jab destination tak uski distance, uski aapse distance aur aapki destination tak distance ke jod se kam ho. Rings mein yeh condition aksar fail hoti hai, isliye <b>remote LFA</b> door ke node tak tunnel jodta hai. EIGRP mein yahi idea feasible successor ke roop mein built-in hai.</p>
<table class="cmp"><tr><th>Mechanism</th><th>Kya tez karta hai</th><th>Dhyan rakho</th></tr>
<tr><td>BFD</td><td>Failure detection (sub-second)</td><td>Bahut aggressive timers shared ya busy links par flap karte hain</td></tr>
<tr><td>SPF/LSA throttle, tuned hello aur hold</td><td>Propagation aur processing</td><td>Itna kam mat karo ki storm mein baar-baar run ho</td></tr>
<tr><td>IP FRR (LFA, remote LFA)</td><td>FIB mein repair</td><td>Coverage topology par depend; guaranteed nahi</td></tr>
<tr><td>NSF/SSO, graceful restart</td><td>Control-plane restart mein forwarding jaari</td><td>Neighbour ka support chahiye</td></tr>
<tr><td>BGP PIC, best external, add-path</td><td>BGP prefix repair</td><td>Zyada memory; design mein shamil karo</td></tr>
</table>
<pre class="code">interface TenGigabitEthernet0/0/1
 bfd interval 300 min_rx 300 multiplier 3
router ospf 1
 bfd all-interfaces
 fast-reroute per-prefix enable prefix-priority low</pre>
<pre class="out">PLANT3# show ip route 10.12.8.0
Routing entry for 10.12.8.0/24
  Known via "ospf 1", distance 110, metric 30, type intra area
  * 10.0.16.5, from 10.0.0.12, 00:03:11 ago, via TenGigabitEthernet0/0/1
<span class="hl">      repair path via 10.0.16.9, TenGigabitEthernet0/0/2, metric 40</span></pre>

<div class="eg"><p><b>Worked example.</b> BFD 300 ms guna 3 par detection worst case mein 900 ms leta hai. Agar plant ko ek second mein repair chahiye, to akele detection lagbhag poora samay kha jata hai, isliye plant ring ko pehle failure ke liye IP FRR par rely karna chahiye (interface ya BFD session girte hi repair), aur IGP baad mein reconverge kare. 50 ms guna 3 setting 150 ms mein detect karegi, lekin hardware-offloaded BFD chahiye.</p></div>

<div class="scn"><h4>Post-mortem 1: woh route jo mara hi nahi</h4><p>Tags ke bina campus subnet OSPF mein withdraw hua lekin gol-gol redistribute hota raha: R1 ne use EIGRP mein daala tha, R2 ne EIGRP copy seekhi aur wapas OSPF mein feed kar di. Users das minute tak decommissioned subnet tak pahunchte rahe aur agle change ke dauran loop dikha. Tags ne feedback path tod diya.</p></div>
<div class="scn"><h4>Post-mortem 2: BFD bahut tez set ho gaya</h4><p>Ek aur site ne congested WAN par software BFD ko 50 ms guna 3 set kar diya. Routine CPU peaks se sessions gir jaate the, IGP din mein kai baar flap hota tha aur har flap area mein SPF dobara chalata tha. Fix tha 300 ms guna 3 aur critical ring ke liye IP FRR.</p><p><b>Lesson:</b> redistribution ek controlled boundary hai, aur fast convergence platform ki limits ke saamne chuna jata hai, minimum par set nahi kiya jata.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Poori BGP table ko IGP mein redistribute karna. Route filters chhod dena aur leak ko poore domain mein bahne dena. Yeh maan lena ki LFA har topology mein har prefix ko protect karta hai. Redistribution ko permanent design samajhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> AD values jaano. Yeh jaano ki ek se zyada point par mutual redistribution ko tags aur filters chahiye. Route summarisation boundary cross karne wale routes kam karta hai. Fast convergence ke liye batao ki aap kaun sa stage chhota kar rahe ho: detection (BFD), propagation ya processing (throttle timers), ya update (IP FRR).</p></div>

<div class="iv"><p class="q">"Aapko do routers par EIGRP aur OSPF ke beech redistribute karna hai. Loops se kaise bachoge?"</p><p>Strong answer: jab route har protocol mein enter kare tab tag lagao, wapsi par woh tags deny karo, seed metrics set karo, prefix lists se tay karo ki kya cross kare, jahan ho sake summarise karo, ho sake to ek direction plus defaults rakho, aur traceroute se aur ek router fail karke verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Redistribution boundary tool hai; seed metrics do aur OSPF mein subnets keyword lagao.</li>
<li>Do points par mutual redistribution ko feedback rokne ke liye route tags aur filters chahiye.</li>
<li>Convergence ke chaar stages: detect, propagate, process, update.</li>
<li>BFD detection tez karta hai; throttle timers processing; IP FRR repair.</li>
<li>Wahi tune karo jo platform sambhal sake; aggressive timers flaps laate hain.</li>
</ul></div>
`.replace(`@@DIA@@`,c([`EIGRP plants`,`OSPF campus`,`R1`,`R2`,`Plant`,`Data center`,`Cross karte waqt tag lagao`,`Tag ke bina loop`,`Redistribution router`,`EIGRP aur OSPF ke beech two-way redistribution`,`Do redistribution routers resilience dete hain, aur route tags ek router ko woh dobara inject karne se rokte hain jo doosre ne inject kiya.`]))}};export{l as default};