var e={id:`why-areas`,h:{en:`Why one area stops scaling: the two-level hierarchy`,hi:`Ek area kyun scale nahi karta: two-level hierarchy`},body:{en:`
<p>Think of a company with 40 offices where every employee must know the seating plan of every office, and the plan is reprinted for everybody whenever a single desk moves. It works for one building. At 40 buildings the reprinting never stops. In the single-area chapters you saw how every OSPF router holds the same map. Multi-area OSPF is the fix for what happens when that map becomes too big: give each region its own detailed map, and give everybody else only a short summary.</p>

<h3>What goes wrong in one big area</h3>
<p>Inside one area every router keeps an <b>identical LSDB</b>, and any change in the topology is flooded to every router, which then reruns SPF. Nothing is wrong with that rule; it just does not scale linearly. Three costs grow together:</p>
<div class="tbl"><table>
<tr><th>Resource</th><th>What grows</th><th>How you notice it</th></tr>
<tr><td><b>Memory</b></td><td>One router LSA per router, one network LSA per broadcast segment, plus every external LSA</td><td>LSDB counts climb into the thousands; small branch routers run short of RAM</td></tr>
<tr><td><b>CPU</b></td><td>Every link change anywhere triggers a full SPF on every router in the area</td><td>The SPF counter in <code>show ip ospf</code> keeps climbing; CPU spikes on older boxes</td></tr>
<tr><td><b>Flooding</b></td><td>Every LSA update crosses every link of the area, and refreshes every 30 minutes</td><td>Constant LSA traffic, slow convergence after a failure</td></tr>
</table></div>
<p>The worst part is the <b>blast radius</b>. A flapping access link in a far-off branch has no business disturbing the data centre, yet in a single area it does.</p>

<h3>The two-level hierarchy</h3>
<p>OSPF solves this with a fixed, two-level design:</p>
<ul>
<li><b>Level 1: ordinary areas</b> (area 1, area 2, area 10 and so on). Each one has its own LSDB with full detail, and its own SPF.</li>
<li><b>Level 2: the backbone, area 0.</b> Every ordinary area attaches to it. Traffic between two ordinary areas always crosses area 0.</li>
</ul>
<p>The routers that sit on the boundary, the <b>Area Border Routers (ABRs)</b>, hold one LSDB per area and pass reachability between areas as short <b>summary</b> advertisements. Detail stays inside the area; only the result (prefix and cost) leaves it.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Two-level OSPF hierarchy: area 0 in the middle, areas 1, 2 and 3 attached through ABRs">
<ellipse cx="320" cy="130" rx="110" ry="60" fill="#bae6fd" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="14">Area 0</text><text x="320" y="143" text-anchor="middle" class="svg-muted" font-size="11">backbone</text>
<ellipse cx="90" cy="130" rx="70" ry="50" fill="#ddd6fe" stroke="#64748b" stroke-width="2"/>
<text x="90" y="135" text-anchor="middle" class="svg-ink" font-size="14">Area 1</text>
<ellipse cx="550" cy="50" rx="70" ry="38" fill="#ddd6fe" stroke="#64748b" stroke-width="2"/>
<text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="14">Area 2</text>
<ellipse cx="550" cy="210" rx="70" ry="38" fill="#ddd6fe" stroke="#64748b" stroke-width="2"/>
<text x="550" y="215" text-anchor="middle" class="svg-ink" font-size="14">Area 3</text>
<line x1="160" y1="130" x2="212" y2="130" stroke="#64748b" stroke-width="3"/><text x="186" y="120" text-anchor="middle" class="svg-accent" font-size="12">ABR</text>
<line x1="480" y1="62" x2="410" y2="100" stroke="#64748b" stroke-width="3"/><text x="458" y="76" text-anchor="middle" class="svg-accent" font-size="12">ABR</text>
<line x1="480" y1="198" x2="410" y2="160" stroke="#64748b" stroke-width="3"/><text x="458" y="190" text-anchor="middle" class="svg-accent" font-size="12">ABR</text>
</svg><p class="cap">Every ordinary area touches area 0. A flap inside area 3 reruns SPF only inside area 3.</p></div>

<h3>What the hierarchy buys you</h3>
<dl class="terms">
<dt>Smaller LSDBs</dt><dd>A router in area 1 holds the detailed router and network LSAs of area 1 only. Other areas appear as a handful of summary LSAs.</dd>
<dt>Contained SPF</dt><dd>A link flap inside area 1 reruns the full SPF only for routers in area 1. Routers elsewhere see, at worst, a small change to a summary, which they handle without a full SPF.</dd>
<dt>Contained flooding</dt><dd>Detailed LSAs never leave their area. The flood stops at the ABR.</dd>
<dt>Room for summarisation</dt><dd>Because the ABR sits on the border, it can replace ten prefixes by one. You will do this in chapter 7.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> A retail chain has 120 stores, each with 2 routers and 3 links, all in area 0: about 240 router LSAs. Each store has a broadband link that flaps 3 times an hour. That is 360 flaps an hour, and each one is flooded to all 240 routers, which each run SPF: roughly 86,000 SPF runs an hour across the network. Split the stores into 6 regional areas of 20 stores. The same 360 flaps still happen, but each one now costs SPF on about 40 routers in its own region: roughly 14,000 runs an hour, and the other regions only see a quiet summary. The routers did not change; the design did.</p></div>

<h3>When you actually need areas</h3>
<p>There is no magic router count. Vendors quote figures like 50 routers per area as a guide, but the real triggers are CPU spikes during link flaps, small devices struggling with LSDB size, a wish to summarise addresses, or an organisation split by region. A 6-router campus with one area is perfectly healthy. Do not add areas just to look professional: more areas mean more ABRs, more config and more places to break.</p>

<div class="warn"><p><b>Common mistakes.</b> Thinking areas are a security or VLAN-like separation. They are not: an area is purely a flooding and SPF boundary. Another mistake is dividing a small network into many areas with no address plan, then discovering that the prefixes cannot be summarised, so you pay the complexity and gain nothing. Also, making the topology by hand without ever including area 0: ordinary areas cannot talk to each other until a backbone exists.</p></div>

<div class="exam"><p><b>Exam traps.</b> Areas reduce LSDB size, SPF runs and flooding scope. They do not change the metric formula. Area 0 is mandatory in a multi-area design. An area ID is 32 bits, written as a number (1) or in dotted form (0.0.0.1): the two are the same area.</p></div>

<div class="scn"><h4>The merger that doubled the CPU</h4><p>Two companies merged and their networks were joined by one big area 0 of about 280 routers. Monday morning, an engineer saw the core routers at 70 percent CPU. The cause was not traffic: one old branch with a failing optic flapped 20 times in an hour, and each flap forced every router to run SPF. The temporary fix was to shut the faulty link. The permanent fix was to put each company's sites in its own area, with two ABRs joining them to a small backbone.</p><p><b>Lesson:</b> the cost of a topology change is paid by every router in the area, so area size is a design decision, not an afterthought.</p></div>

<div class="iv"><p class="q">'Your OSPF network has grown to 300 routers in area 0 and CPUs are high. What do you do?'</p><p>Strong answer: first confirm it is SPF churn using the SPF counters and the flapping interfaces, and fix any unstable link. Then redesign into a two-level hierarchy: keep area 0 as a small core, move regions into ordinary areas behind ABRs, and summarise each region's prefixes at the ABR. Say clearly that this limits the blast radius of every flap.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One area means one LSDB, one flooding domain and one SPF for every router: it works until the network grows or becomes unstable.</li>
<li>Multi-area OSPF is a two-level hierarchy: ordinary areas around a backbone, area 0.</li>
<li>ABRs keep a separate LSDB per area and pass only summaries between them.</li>
<li>Areas shrink LSDBs, contain SPF and flooding, and allow summarisation, but they add ABRs and config to manage.</li>
</ul></div>
`,hi:`
<p>Ek company socho jiske 40 offices hain aur har employee ko har office ka seating plan pata hona chahiye, aur ek desk khisakne par plan sabke liye dobara print hota hai. Ek building ke liye chalta hai. 40 buildings par printing kabhi rukti nahi. Single-area chapters mein aapne dekha ki har OSPF router ke paas same map hota hai. Multi-area OSPF uska ilaaj hai jab woh map bahut bada ho jaata hai: har region ko apna detailed map do, aur baaki sabko sirf ek chhoti summary.</p>

<h3>Ek bade area mein kya bigadta hai</h3>
<p>Ek area ke andar har router ek <b>identical LSDB</b> rakhta hai, aur topology ka har change har router tak flood hota hai, jo phir SPF dobara chalata hai. Rule mein koi galti nahi hai; bas yeh linear tareeke se scale nahi karta. Teen keematein saath mein badhti hain:</p>
<div class="tbl"><table>
<tr><th>Resource</th><th>Kya badhta hai</th><th>Kaise pata chalta hai</th></tr>
<tr><td><b>Memory</b></td><td>Har router ka ek router LSA, har broadcast segment ka ek network LSA, aur har external LSA</td><td>LSDB count hazaaron mein jaata hai; chhote branch routers ki RAM kam padti hai</td></tr>
<tr><td><b>CPU</b></td><td>Area mein kahin bhi link change har router par full SPF chalwata hai</td><td><code>show ip ospf</code> mein SPF counter badhta rehta hai; purane boxes par CPU spikes</td></tr>
<tr><td><b>Flooding</b></td><td>Har LSA update area ke har link se guzarta hai, aur har 30 minute mein refresh hota hai</td><td>LSA traffic lagatar, failure ke baad slow convergence</td></tr>
</table></div>
<p>Sabse buri baat hai <b>blast radius</b>. Door ke branch ka flapping access link data centre ko disturb kare, yeh theek nahi, lekin single area mein yahi hota hai.</p>

<h3>Two-level hierarchy</h3>
<p>OSPF isse ek fixed, two-level design se solve karta hai:</p>
<ul>
<li><b>Level 1: ordinary areas</b> (area 1, area 2, area 10 waghera). Har ek ka apna full-detail LSDB aur apna SPF.</li>
<li><b>Level 2: backbone, area 0.</b> Har ordinary area isse jura hota hai. Do ordinary areas ke beech ka traffic hamesha area 0 se guzarta hai.</li>
</ul>
<p>Boundary par baithe routers, yaani <b>Area Border Routers (ABRs)</b>, har area ka ek alag LSDB rakhte hain aur areas ke beech reachability chhote <b>summary</b> advertisements ke roop mein dete hain. Detail area ke andar rehti hai; sirf result (prefix aur cost) bahar jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Two-level OSPF hierarchy: beech mein area 0, ABRs ke through areas 1, 2 aur 3 jude hue">
<ellipse cx="320" cy="130" rx="110" ry="60" fill="#bae6fd" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="14">Area 0</text><text x="320" y="143" text-anchor="middle" class="svg-muted" font-size="11">backbone</text>
<ellipse cx="90" cy="130" rx="70" ry="50" fill="#ddd6fe" stroke="#64748b" stroke-width="2"/>
<text x="90" y="135" text-anchor="middle" class="svg-ink" font-size="14">Area 1</text>
<ellipse cx="550" cy="50" rx="70" ry="38" fill="#ddd6fe" stroke="#64748b" stroke-width="2"/>
<text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="14">Area 2</text>
<ellipse cx="550" cy="210" rx="70" ry="38" fill="#ddd6fe" stroke="#64748b" stroke-width="2"/>
<text x="550" y="215" text-anchor="middle" class="svg-ink" font-size="14">Area 3</text>
<line x1="160" y1="130" x2="212" y2="130" stroke="#64748b" stroke-width="3"/><text x="186" y="120" text-anchor="middle" class="svg-accent" font-size="12">ABR</text>
<line x1="480" y1="62" x2="410" y2="100" stroke="#64748b" stroke-width="3"/><text x="458" y="76" text-anchor="middle" class="svg-accent" font-size="12">ABR</text>
<line x1="480" y1="198" x2="410" y2="160" stroke="#64748b" stroke-width="3"/><text x="458" y="190" text-anchor="middle" class="svg-accent" font-size="12">ABR</text>
</svg><p class="cap">Har ordinary area area 0 ko chhoota hai. Area 3 ke andar flap sirf area 3 ke andar SPF chalata hai.</p></div>

<h3>Hierarchy se kya milta hai</h3>
<dl class="terms">
<dt>Chhote LSDBs</dt><dd>Area 1 ke router ke paas sirf area 1 ke detailed router aur network LSAs hote hain. Baaki areas kuch summary LSAs ke roop mein dikhte hain.</dd>
<dt>Contained SPF</dt><dd>Area 1 ke andar link flap sirf area 1 ke routers par full SPF chalata hai. Baaki jagah ke routers ko zyada se zyada summary mein chhota change dikhta hai, jo woh bina full SPF ke sambhal lete hain.</dd>
<dt>Contained flooding</dt><dd>Detailed LSAs apne area se bahar nahi jaate. Flood ABR par ruk jaata hai.</dd>
<dt>Summarisation ki jagah</dt><dd>ABR border par baitha hai, isliye woh das prefixes ki jagah ek de sakta hai. Yeh aap chapter 7 mein karoge.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Ek retail chain ke 120 stores hain, har store mein 2 routers aur 3 links, sab area 0 mein: lagbhag 240 router LSAs. Har store ka broadband link ghante mein 3 baar flap karta hai. Yaani ghante mein 360 flaps, aur har flap 240 routers tak flood hota hai, jo sab SPF chalate hain: poore network mein ghante mein lagbhag 86,000 SPF runs. Ab stores ko 20-20 ke 6 regional areas mein baanto. Wahi 360 flaps hote hain, lekin har flap ab sirf apne region ke lagbhag 40 routers par SPF chalwata hai: lagbhag 14,000 runs ghante mein, aur baaki regions sirf shaant summary dekhte hain. Routers wahi hain; design badla.</p></div>

<h3>Areas ki zaroorat kab padti hai</h3>
<p>Koi jaadui router count nahi hota. Vendors kai baar 50 routers per area jaisa guideline bolte hain, lekin asli signals hain: link flap ke time CPU spike, chhote devices LSDB size se jhoojhna, addresses summarise karne ki ichha, ya region ke hisaab se bata hua organisation. 6 routers ka campus ek area mein bilkul theek hai. Sirf professional dikhne ke liye areas mat jodo: zyada areas matlab zyada ABRs, zyada config aur toot-ne ki zyada jagah.</p>

<div class="warn"><p><b>Common galtiyan.</b> Areas ko security ya VLAN jaisa separation samajhna. Aisa nahi hai: area sirf flooding aur SPF ki boundary hai. Ek aur galti: chhote network ko bina address plan ke kai areas mein baant dena, phir pata chalna ki prefixes summarise nahi ho sakte, yaani complexity ka kharcha, fayda kuch nahi. Aur topology haath se bana kar area 0 ko shaamil hi na karna: backbone bane bina ordinary areas aapas mein baat nahi kar sakte.</p></div>

<div class="exam"><p><b>Exam traps.</b> Areas LSDB size, SPF runs aur flooding scope kam karte hain. Metric formula nahi badalte. Multi-area design mein area 0 zaroori hai. Area ID 32 bit ka hota hai, number (1) ya dotted form (0.0.0.1) mein likha jaata hai: dono ek hi area hain.</p></div>

<div class="scn"><h4>Merger jisne CPU doguna kar diya</h4><p>Do companies ke merge ke baad unke networks ko lagbhag 280 routers ke ek bade area 0 mein jod diya gaya. Monday subah engineer ne core routers ka CPU 70 percent dekha. Wajah traffic nahi thi: ek purane branch ka kharab optic ghante mein 20 baar flap hua, aur har flap ne har router par SPF chalwaya. Temporary fix: kharab link shut kar do. Permanent fix: har company ke sites ko apne area mein daalo, aur do ABRs se ek chhote backbone se jodo.</p><p><b>Seekh:</b> topology change ki keemat area ka har router chukata hai, isliye area ka size design ka decision hai, baad ki soch nahi.</p></div>

<div class="iv"><p class="q">'Aapka OSPF network area 0 mein 300 routers tak pahunch gaya hai aur CPU high hai. Aap kya karoge?'</p><p>Strong answer: pehle SPF counters aur flapping interfaces se confirm karo ki yeh SPF churn hai, aur koi unstable link ho to theek karo. Phir two-level hierarchy mein redesign karo: area 0 ko chhota core rakho, regions ko ABRs ke peeche ordinary areas mein daalo, aur har region ke prefixes ABR par summarise karo. Saaf bolo ki isse har flap ka blast radius limit hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek area matlab ek LSDB, ek flooding domain aur har router ke liye ek SPF: network bade ya unstable hone tak chalta hai.</li>
<li>Multi-area OSPF two-level hierarchy hai: backbone area 0 ke ird-gird ordinary areas.</li>
<li>ABRs har area ka alag LSDB rakhte hain aur areas ke beech sirf summaries dete hain.</li>
<li>Areas LSDB chhota karte hain, SPF aur flooding ko contain karte hain aur summarisation sambhav karte hain, lekin ABRs aur config badhate hain.</li>
</ul></div>
`}};export{e as default};