var e=(e,t,n,r)=>`<text x="`+e+`" y="`+t+`" text-anchor="middle" class="`+(r||`svg-ink`)+`" font-size="12">`+n+`</text>`,t=(e,t,n,r,i)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"`+(i?` stroke-dasharray="5 4"`:``)+`/>`,n=(e,t,n)=>`<circle cx="`+e+`" cy="`+t+`" r="16" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-9)+` `+t+`H`+(e+9)+`M`+e+` `+(t-9)+`V`+(t+9)+`M`+(e-5)+` `+(t-5)+`L`+(e-9)+` `+t+`L`+(e-5)+` `+(t+5)+`M`+(e+5)+` `+(t-5)+`L`+(e+9)+` `+t+`L`+(e+5)+` `+(t+5)+`" fill="none" stroke="#334155" stroke-width="1.5"/>`,r=(e,t,n)=>`<rect x="`+(e-16)+`" y="`+(t-18)+`" width="32" height="36" rx="3" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-9)+` `+(t-10)+`h5v5h-5zM`+(e+4)+` `+(t-10)+`h5v5h-5zM`+(e-9)+` `+(t+1)+`h5v5h-5zM`+(e+4)+` `+(t+1)+`h5v5h-5z" fill="#ffffff" stroke="none"/>`,i=(e,t,n)=>`<rect x="`+(e-14)+`" y="`+(t-17)+`" width="28" height="34" rx="3" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-8)+` `+(t-8)+`H`+(e+8)+`M`+(e-8)+` `+t+`H`+(e+8)+`M`+(e-8)+` `+(t+8)+`H`+(e+8)+`" stroke="#334155" stroke-width="2"/>`,a=(e,t,n)=>`<path d="M`+e+` `+(t-18)+`L`+(e+16)+` `+(t-11)+`V`+(t+2)+`C`+(e+16)+` `+(t+12)+` `+(e+6)+` `+(t+17)+` `+e+` `+(t+20)+`C`+(e-6)+` `+(t+17)+` `+(e-16)+` `+(t+12)+` `+(e-16)+` `+(t+2)+`V`+(t-11)+`Z" fill="`+n+`" stroke="#475569" stroke-width="1.5"/>`,o=(e,t,n,r)=>`<rect x="`+e+`" y="`+(t-9)+`" width="12" height="12" rx="2" fill="`+n+`" stroke="#475569"/><text x="`+(e+17)+`" y="`+(t+1)+`" class="svg-muted" font-size="11">`+r+`</text>`,s=(e,t,n,r)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="`+t+`">`+n+`</svg><p class="cap">`+r+`</p></div>`,c=c=>{let l=(e,t)=>`<rect x="`+e+`" y="178" width="`+t+`" height="128" rx="10" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 4"/>`,u=`<rect x="10" y="22" width="620" height="88" rx="10" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/><text x="22" y="40" class="svg-accent" font-size="12">`+c[0]+`</text>`+t(70,72,184,72)+t(216,72,314,72)+t(346,72,456,72)+t(200,88,110,134)+t(330,88,320,134)+t(330,88,530,134)+r(70,72,`#fde68a`)+e(70,100,c[1])+n(200,72,`#bae6fd`)+e(200,100,c[2])+n(330,72,`#bae6fd`)+e(330,100,c[2])+i(470,72,`#fde68a`)+e(470,100,c[3])+l(10,190)+l(225,190)+l(440,190)+t(110,166,70,232)+t(110,166,150,232)+t(320,166,255,232)+t(320,166,385,232)+t(530,166,490,232)+t(530,166,570,232)+n(110,150,`#ddd6fe`)+n(320,150,`#ddd6fe`)+n(530,150,`#ddd6fe`)+`<text x="136" y="154" class="svg-ink" font-size="12">`+c[4]+`</text><text x="346" y="154" class="svg-ink" font-size="12">`+c[4]+`</text><text x="556" y="154" class="svg-ink" font-size="12">`+c[4]+`</text>`+r(70,250,`#bbf7d0`)+r(150,250,`#bbf7d0`)+r(255,250,`#bbf7d0`)+a(320,250,`#fed7aa`)+r(385,250,`#bbf7d0`)+r(490,250,`#bbf7d0`)+r(570,250,`#bbf7d0`)+e(70,284,c[5],`svg-muted`)+e(150,284,c[5],`svg-muted`)+e(255,284,c[5],`svg-muted`)+e(320,284,c[6],`svg-muted`)+e(385,284,c[5],`svg-muted`)+e(490,284,c[5],`svg-muted`)+e(570,284,c[5],`svg-muted`)+e(105,300,c[7],`svg-accent`)+e(320,300,c[8],`svg-accent`)+e(535,300,c[9],`svg-accent`)+o(10,330,`#bae6fd`,c[10])+o(150,330,`#ddd6fe`,c[4])+o(250,330,`#bbf7d0`,c[5])+o(360,330,`#fed7aa`,c[6])+o(470,330,`#fde68a`,c[11]);return s(345,c[12],u,c[13])},l={id:`ospf-design`,h:{en:`OSPF design: areas, LSA types and stub areas`,hi:`OSPF design: areas, LSA types aur stub areas`},body:{en:`
<h3>Customer case: Northwind Insurance</h3>
<p>Northwind Insurance runs one headquarters, a disaster-recovery site and 120 branch offices across three regions. Over ten years the team put every router into <b>area 0</b> because it "just worked". Today about 410 routers sit in one area. Branch routers are small platforms. Twelve branches also connect to partner extranets with static routes that are redistributed into OSPF.</p>
<p><b>Symptoms:</b> a flapping branch link makes every router run a full SPF; branch CPU spikes above 80%; convergence after a core failure takes 20 seconds; the database holds thousands of external LSAs. <b>Requirements:</b> convergence under 5 seconds for a core failure, partner routes still reachable, headroom for 50% growth. <b>Constraints:</b> no new hardware for branches, two-hour change windows, one small team.</p>

<h3>The design problem: why one big area does not scale</h3>
<p>In OSPF every router in an area holds an identical <b>link-state database</b> and runs SPF on it. Any change inside the area is flooded to all routers and each one recalculates. The <b>failure domain is the area</b>. Splitting the network into areas confines flooding and SPF to each area; only summaries cross the border at the <b>ABR</b> (area border router). There is no fixed router count per area: the limit is the CPU and memory of the weakest router, link stability and the amount of external information. Treat figures such as "50 routers per area" as a rule of thumb, never as a standard.</p>

@@DIA@@

<h3>Candidate options</h3>
<table class="cmp"><tr><th>Option</th><th>Scalability</th><th>Convergence</th><th>Complexity</th></tr>
<tr><td><b>A. Keep single area 0</b></td><td>Poor: every change hits 410 routers</td><td>Slow SPF, large LSDB</td><td>Lowest</td></tr>
<tr><td><b>B. Multi-area, regions as normal areas</b></td><td>Good: area-local flooding, Type 3 summaries</td><td>Better, but branches still hold all inter-area routes</td><td>Medium</td></tr>
<tr><td><b>C. Multi-area with stub types at branches</b></td><td>Best: branches hold only a default route</td><td>Fast; smallest branch databases</td><td>Medium; care with ASBRs</td></tr>
</table>

<h3>LSA types and stub areas you must know</h3>
<table class="cmp"><tr><th>LSA</th><th>Originated by</th><th>Flooded</th></tr>
<tr><td>Type 1 Router</td><td>Every router</td><td>Within the area</td></tr>
<tr><td>Type 2 Network</td><td>DR on a multi-access segment</td><td>Within the area</td></tr>
<tr><td>Type 3 Summary</td><td>ABR</td><td>Into other areas</td></tr>
<tr><td>Type 4 ASBR summary</td><td>ABR</td><td>Tells other areas how to reach the ASBR</td></tr>
<tr><td>Type 5 External</td><td>ASBR</td><td>Whole domain except stub and NSSA areas</td></tr>
<tr><td>Type 7 NSSA external</td><td>ASBR inside an NSSA</td><td>Within the NSSA; the ABR translates it to Type 5</td></tr>
</table>
<table class="cmp"><tr><th>Area type</th><th>Blocks</th><th>ASBR inside?</th><th>Use at Northwind</th></tr>
<tr><td>Stub</td><td>Types 4 and 5 (a default route replaces them)</td><td>No</td><td>Possible, but Type 3 remains</td></tr>
<tr><td>Totally stubby (Cisco)</td><td>Types 3, 4 and 5 (only a default route)</td><td>No</td><td>Branches with no local redistribution</td></tr>
<tr><td>NSSA</td><td>Type 5 (Type 7 allowed)</td><td>Yes</td><td>Branches with partner statics</td></tr>
<tr><td>Totally NSSA</td><td>Types 3, 4, 5 plus a default</td><td>Yes</td><td>Smallest database for ASBR branches</td></tr>
</table>

<h3>The chosen design</h3>
<p>Option C. Area 0 holds HQ, DR and the three regional ABR pairs. Each region becomes an area (10, 20, 30), matching the one-block-per-region address plan from the previous chapter. Plain branches live in <b>totally stubby</b> areas and need only a default route. The area with the twelve partner branches becomes a <b>totally NSSA</b>, because the branch router acts as an <b>ASBR</b>. ABRs summarise with <code>area range</code>; ASBRs summarise externals with <code>summary-address</code>. Point-to-point links use <code>ip ospf network point-to-point</code> to avoid DR election.</p>
<pre class="code"><span class="c">! ABR for region North</span>
router ospf 1
 router-id 10.0.0.11
 area 10 stub no-summary
 area 20 nssa no-summary
 area 10 range 10.4.0.0 255.252.0.0
 timers throttle spf 50 200 5000
 bfd all-interfaces
<span class="c">! Branch in the totally stubby area: only the stub flag</span>
router ospf 1
 area 10 stub
<span class="c">! Partner branch (ASBR inside the NSSA)</span>
router ospf 1
 area 20 nssa
 redistribute static subnets
 summary-address 192.0.2.0 255.255.255.0</pre>
<pre class="out">BR14# show ip ospf
 Area 10
<span class="hl">   It is a stub area, no summary LSA in this area</span>
BR14# show ip route ospf
<span class="hl">O*IA  0.0.0.0/0 [110/2] via 10.4.16.1, 00:12:05, GigabitEthernet0/0</span></pre>

<div class="eg"><p><b>Worked example.</b> A branch in area 10 used to hold about 2,400 LSAs. After the totally stubby conversion it holds its own area's Type 1 and 2 LSAs plus one default Type 3, fewer than 30 in total. A flap in Region East now causes zero SPF work in Region North. Add SPF throttling (start 50 ms, hold 200 ms, max wait 5,000 ms) and BFD, and detection plus SPF plus FIB update fits well inside the 5-second target.</p></div>

<div class="scn"><h4>Post-mortem: the stub area that ate the partner routes</h4><p>The team converted area 20 to a plain stub in one change window. Two things broke. First, the stub flag must match on both ends of a link, so branches not yet changed lost their adjacencies. Second, once the flags matched, the partner statics vanished: an ASBR cannot live in a stub area, so no external route could be originated there. Partner users lost access for 90 minutes until the area was rebuilt as an NSSA. Note also that OSPF prefers intra-area over inter-area routes regardless of cost, so a site reachable through another area can take a longer path than expected.</p><p><b>Lesson:</b> choose the area type from the role of the routers inside it. Stub when there is no ASBR, NSSA when an ASBR must exist, and change both ends of every link in the same window.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using a virtual link as a permanent fix instead of redesigning area 0. Placing the ABR on a small router that also carries user traffic. Removing the Null0 discard route: Cisco IOS adds one for an area range or summary-address, and it protects against loops.</p></div>
<div class="exam"><p><b>Exam trap.</b> Every non-backbone area must connect to area 0, and area 0 must be contiguous. A stub or totally stubby area cannot contain an ASBR; an NSSA can. The ABR converts Type 7 to Type 5. Totally stubby is a Cisco feature (<code>no-summary</code> on the ABR only).</p></div>

<div class="iv"><p class="q">"You have a 400-router single-area OSPF network. How do you scale it?"</p><p>Strong answer: align areas to the address plan and failure domains, keep area 0 small and stable, put ABRs on capable routers, summarise at ABRs and ASBRs, use stub or totally stubby for edge areas and NSSA where local redistribution exists, tune SPF and LSA throttling and add BFD. Mention that there is no hard router-per-area limit; it depends on platform and stability.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The area is the OSPF failure domain; multi-area confines flooding and SPF.</li>
<li>ABRs originate Type 3; ASBRs originate Type 5 (Type 7 in an NSSA).</li>
<li>Stub and totally stubby cannot hold an ASBR; NSSA can.</li>
<li>Summarise at ABRs with area range and at ASBRs with summary-address.</li>
<li>Tune convergence with SPF/LSA throttling, point-to-point networks and BFD.</li>
</ul></div>
`.replace(`@@DIA@@`,c([`Area 0 (backbone)`,`HQ`,`Core`,`DR site`,`ABR`,`Branch`,`ASBR`,`Area 10 totally stubby`,`Area 20 totally NSSA`,`Area 30 totally stubby`,`Backbone`,`Data center`,`OSPF multi-area design`,`Area 0 in the middle, regional areas as failure domains, one ABR at each border.`])),hi:`
<h3>Customer case: Northwind Insurance</h3>
<p>Northwind Insurance ka ek headquarters, ek disaster-recovery site aur teen regions mein 120 branch offices hain. Das saal mein team ne har router ko <b>area 0</b> mein daal diya kyunki "chal jata tha". Aaj ek hi area mein lagbhag 410 routers hain. Branch routers chhote platforms hain. Barah branches partner extranets se static routes ke through jude hain jo OSPF mein redistribute hote hain.</p>
<p><b>Symptoms:</b> ek branch link flap hota hai to har router poora SPF chalata hai; branch CPU 80% se upar jata hai; core failure ke baad convergence mein 20 second lagte hain; database mein hazaaron external LSAs hain. <b>Requirements:</b> core failure par 5 second se kam convergence, partner routes reachable rahein, 50% growth ki headroom. <b>Constraints:</b> branches ke liye naya hardware nahi, do ghante ke change windows, ek chhoti team.</p>

<h3>Design problem: ek bada area scale kyun nahi karta</h3>
<p>OSPF mein ek area ke har router ke paas identical <b>link-state database</b> hota hai aur woh us par SPF chalata hai. Area ke andar har change sab routers tak flood hota hai aur har router dobara calculate karta hai. Isliye <b>failure domain area hota hai</b>. Network ko areas mein todne se flooding aur SPF har area tak simit ho jata hai; sirf summaries <b>ABR</b> (area border router) par border cross karte hain. Ek area mein kitne routers ho, iski koi fixed limit nahi hai: limit sabse kamzor router ka CPU aur memory, links ki stability aur external information ki matra se tay hoti hai. "50 routers per area" jaisi figures ko rule of thumb samjho, standard nahi.</p>

@@DIA@@

<h3>Candidate options</h3>
<table class="cmp"><tr><th>Option</th><th>Scalability</th><th>Convergence</th><th>Complexity</th></tr>
<tr><td><b>A. Single area 0 rakho</b></td><td>Kharab: har change 410 routers par asar karta hai</td><td>Dheema SPF, bada LSDB</td><td>Sabse kam</td></tr>
<tr><td><b>B. Multi-area, regions normal areas</b></td><td>Achha: area-local flooding, Type 3 summaries</td><td>Behtar, lekin branches ke paas ab bhi saare inter-area routes</td><td>Medium</td></tr>
<tr><td><b>C. Multi-area, branches par stub types</b></td><td>Sabse achha: branches ke paas sirf default route</td><td>Fast; branch databases sabse chhote</td><td>Medium; ASBRs ke saath dhyan</td></tr>
</table>

<h3>LSA types aur stub areas jo aapko aane chahiye</h3>
<table class="cmp"><tr><th>LSA</th><th>Kaun originate karta hai</th><th>Kahan flood hota hai</th></tr>
<tr><td>Type 1 Router</td><td>Har router</td><td>Area ke andar</td></tr>
<tr><td>Type 2 Network</td><td>Multi-access segment par DR</td><td>Area ke andar</td></tr>
<tr><td>Type 3 Summary</td><td>ABR</td><td>Doosre areas mein</td></tr>
<tr><td>Type 4 ASBR summary</td><td>ABR</td><td>Doosre areas ko ASBR tak ka raasta batata hai</td></tr>
<tr><td>Type 5 External</td><td>ASBR</td><td>Poora domain, stub aur NSSA areas ko chhodkar</td></tr>
<tr><td>Type 7 NSSA external</td><td>NSSA ke andar ASBR</td><td>NSSA ke andar; ABR ise Type 5 mein translate karta hai</td></tr>
</table>
<table class="cmp"><tr><th>Area type</th><th>Kya block karta hai</th><th>Andar ASBR?</th><th>Northwind mein use</th></tr>
<tr><td>Stub</td><td>Types 4 aur 5 (default route inki jagah leta hai)</td><td>Nahi</td><td>Possible, lekin Type 3 rehta hai</td></tr>
<tr><td>Totally stubby (Cisco)</td><td>Types 3, 4 aur 5 (sirf default route)</td><td>Nahi</td><td>Jin branches mein local redistribution nahi</td></tr>
<tr><td>NSSA</td><td>Type 5 (Type 7 allowed)</td><td>Haan</td><td>Partner statics wali branches</td></tr>
<tr><td>Totally NSSA</td><td>Types 3, 4, 5 aur ek default</td><td>Haan</td><td>ASBR branches ke liye sabse chhota database</td></tr>
</table>

<h3>Chosen design</h3>
<p>Option C. Area 0 mein HQ, DR aur teen regional ABR pairs rehte hain. Har region ek area ban jata hai (10, 20, 30), jo pichle chapter ke one-block-per-region address plan se match karta hai. Plain branches <b>totally stubby</b> areas mein jaate hain aur unhe sirf default route chahiye. Barah partner branches wala area <b>totally NSSA</b> banta hai, kyunki branch router <b>ASBR</b> ka kaam karta hai. ABRs <code>area range</code> se summarise karte hain; ASBRs externals ko <code>summary-address</code> se summarise karte hain. Point-to-point links par DR election se bachne ke liye <code>ip ospf network point-to-point</code> use hota hai.</p>
<pre class="code"><span class="c">! ABR for region North</span>
router ospf 1
 router-id 10.0.0.11
 area 10 stub no-summary
 area 20 nssa no-summary
 area 10 range 10.4.0.0 255.252.0.0
 timers throttle spf 50 200 5000
 bfd all-interfaces
<span class="c">! Branch in the totally stubby area: only the stub flag</span>
router ospf 1
 area 10 stub
<span class="c">! Partner branch (ASBR inside the NSSA)</span>
router ospf 1
 area 20 nssa
 redistribute static subnets
 summary-address 192.0.2.0 255.255.255.0</pre>
<pre class="out">BR14# show ip ospf
 Area 10
<span class="hl">   It is a stub area, no summary LSA in this area</span>
BR14# show ip route ospf
<span class="hl">O*IA  0.0.0.0/0 [110/2] via 10.4.16.1, 00:12:05, GigabitEthernet0/0</span></pre>

<div class="eg"><p><b>Worked example.</b> Area 10 ke ek branch ke paas pehle lagbhag 2,400 LSAs the. Totally stubby conversion ke baad uske paas apne area ke Type 1 aur 2 LSAs aur ek default Type 3 hai, kul 30 se kam. Region East ka flap ab Region North mein zero SPF work karta hai. SPF throttling (start 50 ms, hold 200 ms, max wait 5,000 ms) aur BFD jodo, to detection, SPF aur FIB update 5 second ke target ke andar aaram se fit ho jata hai.</p></div>

<div class="scn"><h4>Post-mortem: stub area jo partner routes kha gaya</h4><p>Team ne area 20 ko ek hi change window mein plain stub bana diya. Do cheezein toot gayi. Pehli, stub flag link ke dono sirson par match karna chahiye, isliye jin branches par abhi change nahi hua tha unki adjacencies gir gayi. Doosri, flags match hone ke baad partner statics gayab ho gaye: stub area mein ASBR nahi reh sakta, isliye wahan koi external route originate nahi ho sakta. Partner users 90 minute tak access se door rahe jab tak area ko NSSA ke roop mein dobara nahi banaya gaya. Yeh bhi yaad rakho ki OSPF cost ki parwah kiye bina intra-area route ko inter-area par prefer karta hai, isliye jo site doosre area ke through reachable hai woh expected se lamba path le sakti hai.</p><p><b>Lesson:</b> area type andar ke routers ke role se chuno. ASBR nahi hai to stub, ASBR chahiye to NSSA, aur har link ke dono ends ek hi window mein badlo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Virtual link ko permanent fix banana, area 0 ko redesign karne ki jagah. ABR ko aise chhote router par rakhna jo user traffic bhi carry karta hai. Null0 discard route hatana: Cisco IOS area range ya summary-address ke liye ek add karta hai, aur woh loops se bachata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Har non-backbone area ko area 0 se connect hona chahiye, aur area 0 contiguous hona chahiye. Stub ya totally stubby area mein ASBR nahi ho sakta; NSSA mein ho sakta hai. ABR Type 7 ko Type 5 mein convert karta hai. Totally stubby ek Cisco feature hai (<code>no-summary</code> sirf ABR par).</p></div>

<div class="iv"><p class="q">"Aapke paas 400-router single-area OSPF network hai. Ise scale kaise karoge?"</p><p>Strong answer: areas ko address plan aur failure domains ke saath align karo, area 0 chhota aur stable rakho, ABRs capable routers par lagao, ABRs aur ASBRs par summarise karo, edge areas ke liye stub ya totally stubby aur jahan local redistribution hai wahan NSSA use karo, SPF aur LSA throttling tune karo aur BFD jodo. Yeh bhi bolo ki router-per-area ki koi hard limit nahi hai; yeh platform aur stability par depend karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Area OSPF ka failure domain hai; multi-area flooding aur SPF ko simit karta hai.</li>
<li>ABRs Type 3 originate karte hain; ASBRs Type 5 (NSSA mein Type 7).</li>
<li>Stub aur totally stubby mein ASBR nahi ho sakta; NSSA mein ho sakta hai.</li>
<li>ABRs par area range aur ASBRs par summary-address se summarise karo.</li>
<li>SPF/LSA throttling, point-to-point networks aur BFD se convergence tune karo.</li>
</ul></div>
`.replace(`@@DIA@@`,c([`Area 0 (backbone)`,`HQ`,`Core`,`DR site`,`ABR`,`Branch`,`ASBR`,`Area 10 totally stubby`,`Area 20 totally NSSA`,`Area 30 totally stubby`,`Backbone`,`Data center`,`OSPF multi-area design`,`Beech mein Area 0, regional areas failure domains ki tarah, har border par ABR.`]))}};export{l as default};