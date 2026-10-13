var e={id:`high-availability`,h:{en:`High availability and redundancy: headend, branch and circuits`,hi:`High availability aur redundancy: headend, branch aur circuits`},body:{en:`
<p>A hospital has a main power line, a generator and batteries for the operating theatre. It does not wait for a blackout to discover whether the backup works; it tests the backup regularly. High availability (HA) in SD-WAN follows the same thinking: remove single points of failure at each level, then test the backup. There are three levels: the <b>circuits</b>, the <b>branch device</b> and the <b>headend</b> (Director, Controller, Analytics). This chapter is conceptual. The course labs show circuit redundancy in action (chapter 6), but you should know the whole picture, because interviewers ask about it.</p>

<h3>Single points of failure, level by level</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Redundancy levels">
<rect x="10" y="10" width="620" height="84" rx="8" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">Headend (Mumbai DC and a second site)</text>
<rect x="30" y="44" width="170" height="38" rx="6" fill="#fff"/><text x="115" y="68" text-anchor="middle" class="svg-ink" font-size="12">Director: active and standby</text>
<rect x="235" y="44" width="170" height="38" rx="6" fill="#fff"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="12">Controllers: two or more</text>
<rect x="440" y="44" width="170" height="38" rx="6" fill="#fff"/><text x="525" y="68" text-anchor="middle" class="svg-ink" font-size="12">Analytics: cluster</text>
<rect x="10" y="104" width="620" height="84" rx="8" fill="#bae6fd"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="14">Branch</text>
<rect x="30" y="138" width="270" height="38" rx="6" fill="#fff"/><text x="165" y="162" text-anchor="middle" class="svg-ink" font-size="12">Single CPE or an HA pair of CPEs</text>
<rect x="330" y="138" width="280" height="38" rx="6" fill="#fff"/><text x="470" y="162" text-anchor="middle" class="svg-ink" font-size="12">LAN switch uplinks to both CPEs</text>
<rect x="10" y="198" width="620" height="92" rx="8" fill="#bbf7d0"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="14">Circuits</text>
<rect x="30" y="232" width="170" height="44" rx="6" fill="#fff"/><text x="115" y="250" text-anchor="middle" class="svg-ink" font-size="12">Internet</text><text x="115" y="266" text-anchor="middle" class="svg-muted" font-size="11">carrier A</text>
<rect x="235" y="232" width="170" height="44" rx="6" fill="#fff"/><text x="320" y="250" text-anchor="middle" class="svg-ink" font-size="12">MPLS</text><text x="320" y="266" text-anchor="middle" class="svg-muted" font-size="11">carrier B</text>
<rect x="440" y="232" width="170" height="44" rx="6" fill="#fff"/><text x="525" y="250" text-anchor="middle" class="svg-ink" font-size="12">LTE</text><text x="525" y="266" text-anchor="middle" class="svg-muted" font-size="11">carrier C</text>
</svg><p class="cap">Each level removes a different single point of failure. A design is only as strong as its weakest level.</p></div>

<h3>Level 1: dual circuits (what the labs show)</h3>
<p>The course branches have up to three transports: Internet, MPLS and LTE. SD-WAN keeps a tunnel on each and the policy chooses among them, so one failure only reduces redundancy. Two design details matter in real life:</p>
<ul>
<li><b>Carrier diversity.</b> Two circuits from the same carrier that share the same duct are not diverse. A single fibre cut can kill both. Use different carriers, different physical paths and, where possible, different technologies (fibre plus LTE).</li>
<li><b>Capacity during failure.</b> If MPLS carries voice and ERP and fails, will the remaining Internet circuit hold both? Plan for the failed state, not just the normal state.</li>
</ul>

<h3>Level 2: the branch device</h3>
<p>A single CPE is a single point of failure for the whole site even if it has three circuits. For important sites, real Versa supports <b>HA pairs of branch devices</b>: two VOS devices, one active and one standby, connected by an HA link and sharing a virtual identity towards the LAN, so that the standby takes over if the active fails. Some designs instead use two independent CPEs with routing between them. Both approaches need the LAN side to fail over too: a LAN switch with uplinks to both devices, and a first-hop mechanism or dynamic routing in the LAN. Exact HA modes and commands depend on the release and are outside the course CLI.</p>

<h3>Level 3: the headend</h3>
<dl class="terms">
<dt>Controller redundancy</dt><dd>Branches can be given more than one Controller, so if one is unreachable they build their overlay to the next. In the course there is one Controller (198.51.100.20); the lab <b>vs-controller-typo</b> in an earlier module showed what happens when a branch points at a wrong Controller address. Real deployments place Controllers in different locations.</dd>
<dt>Director redundancy</dt><dd>The Director is the management plane. It is usually deployed as an active/standby pair with synchronised database. If the Director is down, <b>branches keep forwarding</b>: you only lose the ability to push new configuration and see management views.</dd>
<dt>Analytics redundancy</dt><dd>Analytics is deployed as a cluster in real networks so that logs are not lost when a node fails. If it is down, user traffic is unaffected but visibility is lost.</dd>
</dl>

<h3>Failure domains: what stops when X fails</h3>
<table class="cmp"><tr><th>Component fails</th><th>User traffic</th><th>What you lose</th></tr>
<tr><td>One WAN circuit</td><td>continues on other transports</td><td>redundancy, maybe quality</td></tr>
<tr><td>Branch CPE (no HA)</td><td>site down</td><td>everything at that site</td></tr>
<tr><td>Controller (single)</td><td>existing tunnels may continue for a while, new sessions and route updates are affected</td><td>control plane: new branches, route changes</td></tr>
<tr><td>Director</td><td>continues</td><td>configuration push, onboarding of new devices, management views</td></tr>
<tr><td>Analytics</td><td>continues</td><td>logs and dashboards</td></tr></table>
<p>This table is a great interview answer. It shows you understand the split between <b>control, management and data planes</b>. The exact behaviour of existing tunnels during a Controller loss depends on timers and release, so say "continues for some time" rather than promising forever.</p>

<div class="eg"><p><b>Worked example.</b> A retailer has 200 stores, each with Internet and LTE, and a Director pair plus two Controllers in two data centres. A storm cuts the Mumbai DC's power. Stores keep selling because the second Controller in another city keeps the overlay alive. The Director standby takes over for management. Analytics logs queue and catch up later. Engineers then review whether LTE can carry card payments at peak, because that is the failed-state capacity question.</p></div>

<h3>Test the backup</h3>
<p>Redundancy that was never tested is a hope, not a design. Do planned failure drills: shut one circuit in a maintenance window and watch with the tools from chapters 2 to 5 that traffic moves, voice keeps its path, alarms fire, and failback is clean. Record the result in the runbook. The same drill is a safe way to train new engineers, which is what the lab environment does for you.</p>

<div class="warn"><p><b>Common mistakes.</b> Two circuits in the same duct; redundancy on the WAN but a single switch or single power supply on the LAN side; no capacity planning for the failed state; HA configured but never tested; forgetting that Director HA and Controller HA are different things.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do not confuse the planes. Losing the Director does not stop forwarding; losing a branch CPE without HA stops that site; losing Analytics only stops logging. Questions often swap these.</p></div>

<div class="scn"><h4>Redundant on paper</h4><p>A company bought two circuits for each branch, but both came from the same provider and entered the building through the same conduit. A road works crew cut the conduit and both circuits died at once. After the incident the company moved the backup to LTE and later to a second carrier, and added a quarterly failover drill.</p><p><b>Lesson:</b> redundancy needs real diversity, and diversity needs testing.</p></div>

<div class="iv"><p class="q">"What happens to the SD-WAN if the Director goes down?"</p><p>Branches keep forwarding because the data and control planes do not depend on the Director. You lose configuration push, onboarding and management views until it returns; a standby Director reduces that window. Contrast with Controller loss (control plane) and Analytics loss (visibility only).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Remove single points of failure at three levels: circuits, branch, headend.</li>
<li>Diverse carriers and paths matter more than the number of circuits.</li>
<li>Know what stops when each component fails: control, management, data and visibility are different planes.</li>
<li>Plan capacity for the failed state and test failover with drills.</li>
<li>Branch HA and headend HA details depend on release; the course shows circuit redundancy in practice.</li>
</ul></div>
`,hi:`
<p>Hospital ke paas main power line, generator aur operating theatre ke liye batteries hoti hain. Wo blackout ka wait nahi karta ye jaanne ke liye ki backup chalta hai ya nahi; wo backup ko regularly test karta hai. SD-WAN mein high availability (HA) bhi yahi soch follow karti hai: har level par single points of failure hatao, phir backup test karo. Teen levels hain: <b>circuits</b>, <b>branch device</b> aur <b>headend</b> (Director, Controller, Analytics). Ye chapter conceptual hai. Course labs circuit redundancy action mein dikhate hain (chapter 6), lekin poori tasveer aapko aani chahiye kyunki interviewers isse puchte hain.</p>

<h3>Single points of failure, level by level</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Redundancy levels">
<rect x="10" y="10" width="620" height="84" rx="8" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">Headend (Mumbai DC aur ek doosri site)</text>
<rect x="30" y="44" width="170" height="38" rx="6" fill="#fff"/><text x="115" y="68" text-anchor="middle" class="svg-ink" font-size="12">Director: active aur standby</text>
<rect x="235" y="44" width="170" height="38" rx="6" fill="#fff"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="12">Controllers: do ya zyada</text>
<rect x="440" y="44" width="170" height="38" rx="6" fill="#fff"/><text x="525" y="68" text-anchor="middle" class="svg-ink" font-size="12">Analytics: cluster</text>
<rect x="10" y="104" width="620" height="84" rx="8" fill="#bae6fd"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="14">Branch</text>
<rect x="30" y="138" width="270" height="38" rx="6" fill="#fff"/><text x="165" y="162" text-anchor="middle" class="svg-ink" font-size="12">Single CPE ya CPEs ka HA pair</text>
<rect x="330" y="138" width="280" height="38" rx="6" fill="#fff"/><text x="470" y="162" text-anchor="middle" class="svg-ink" font-size="12">LAN switch ke uplinks dono CPEs tak</text>
<rect x="10" y="198" width="620" height="92" rx="8" fill="#bbf7d0"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="14">Circuits</text>
<rect x="30" y="232" width="170" height="44" rx="6" fill="#fff"/><text x="115" y="250" text-anchor="middle" class="svg-ink" font-size="12">Internet</text><text x="115" y="266" text-anchor="middle" class="svg-muted" font-size="11">carrier A</text>
<rect x="235" y="232" width="170" height="44" rx="6" fill="#fff"/><text x="320" y="250" text-anchor="middle" class="svg-ink" font-size="12">MPLS</text><text x="320" y="266" text-anchor="middle" class="svg-muted" font-size="11">carrier B</text>
<rect x="440" y="232" width="170" height="44" rx="6" fill="#fff"/><text x="525" y="250" text-anchor="middle" class="svg-ink" font-size="12">LTE</text><text x="525" y="266" text-anchor="middle" class="svg-muted" font-size="11">carrier C</text>
</svg><p class="cap">Har level ek alag single point of failure hatata hai. Design utna hi strong hai jitna uska sabse kamzor level.</p></div>

<h3>Level 1: dual circuits (jo labs dikhate hain)</h3>
<p>Course branches ke paas zyada se zyada teen transports hain: Internet, MPLS aur LTE. SD-WAN har ek par tunnel rakhta hai aur policy unme se chunti hai, isliye ek failure sirf redundancy kam karta hai. Real life mein do design details matter karte hain:</p>
<ul>
<li><b>Carrier diversity.</b> Same carrier ke do circuits jo same duct share karte hain diverse nahi hain. Ek fibre cut dono maar sakta hai. Alag carriers, alag physical paths aur ho sake to alag technologies (fibre plus LTE) use karo.</li>
<li><b>Failure ke dauran capacity.</b> MPLS voice aur ERP carry karta ho aur fail ho jaye, to kya bacha hua Internet circuit dono ko sambhal lega? Sirf normal state nahi, failed state ke liye plan karo.</li>
</ul>

<h3>Level 2: branch device</h3>
<p>Teen circuits ke bawajood single CPE poori site ka single point of failure hai. Important sites ke liye real Versa <b>branch devices ke HA pairs</b> support karta hai: do VOS devices, ek active aur ek standby, HA link se jude aur LAN ki taraf shared virtual identity rakhte hue, taaki active fail hone par standby sambhal le. Kuch designs mein do independent CPEs ke beech routing hoti hai. Dono approaches mein LAN side ko bhi failover chahiye: dono devices tak uplinks wala LAN switch, aur LAN mein first-hop mechanism ya dynamic routing. Exact HA modes aur commands release par depend karte hain aur course CLI se bahar hain.</p>

<h3>Level 3: headend</h3>
<dl class="terms">
<dt>Controller redundancy</dt><dd>Branches ko ek se zyada Controller diye ja sakte hain, to ek unreachable ho to wo agle tak overlay banate hain. Course mein ek Controller hai (198.51.100.20); pichhle module ka lab <b>vs-controller-typo</b> dikha chuka hai ki branch galat Controller address point kare to kya hota hai. Real deployments Controllers ko alag locations mein rakhte hain.</dd>
<dt>Director redundancy</dt><dd>Director management plane hai. Ye aam taur par active/standby pair mein synchronised database ke saath deploy hota hai. Director down ho to <b>branches forward karte rehte hain</b>: aap sirf nayi configuration push karne aur management views dekhne ki ability khote ho.</dd>
<dt>Analytics redundancy</dt><dd>Real networks mein Analytics cluster ke roop mein deploy hota hai taaki node fail hone par logs na jayein. Down ho to user traffic affect nahi hota par visibility jati hai.</dd>
</dl>

<h3>Failure domains: X fail ho to kya rukta hai</h3>
<table class="cmp"><tr><th>Component fail</th><th>User traffic</th><th>Kya khote ho</th></tr>
<tr><td>Ek WAN circuit</td><td>doosre transports par chalta hai</td><td>redundancy, shayad quality</td></tr>
<tr><td>Branch CPE (HA nahi)</td><td>site down</td><td>us site ka sab kuch</td></tr>
<tr><td>Controller (single)</td><td>existing tunnels kuch time chal sakte hain, naye sessions aur route updates affect hote hain</td><td>control plane: naye branches, route changes</td></tr>
<tr><td>Director</td><td>chalta hai</td><td>configuration push, naye devices ka onboarding, management views</td></tr>
<tr><td>Analytics</td><td>chalta hai</td><td>logs aur dashboards</td></tr></table>
<p>Ye table behtareen interview answer hai. Ye dikhata hai ki aap <b>control, management aur data planes</b> ka split samajhte ho. Controller loss ke dauran existing tunnels ka exact behaviour timers aur release par depend karta hai, isliye "kuch time chalta hai" kaho, "hamesha" ka promise mat do.</p>

<div class="eg"><p><b>Worked example.</b> Ek retailer ke 200 stores hain, har ek mein Internet aur LTE, aur do data centres mein Director pair plus do Controllers. Toofan Mumbai DC ki power kaat deta hai. Stores bikri karte rehte hain kyunki doosre shehar ka Controller overlay zinda rakhta hai. Director standby management sambhal leta hai. Analytics logs queue hote hain aur baad mein catch up karte hain. Phir engineers dekhte hain ki kya LTE peak par card payments carry kar sakta hai, kyunki ye failed-state capacity ka sawal hai.</p></div>

<h3>Backup ko test karo</h3>
<p>Jo redundancy kabhi test nahi hui wo umeed hai, design nahi. Planned failure drills karo: maintenance window mein ek circuit shut karo aur chapter 2 se 5 ke tools se dekho ki traffic move hota hai, voice apna path rakhti hai, alarms bajte hain, aur failback clean hai. Result runbook mein likho. Wahi drill naye engineers ko train karne ka safe tareeka hai, jo lab environment aapke liye karta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Same duct mein do circuits; WAN par redundancy lekin LAN side par single switch ya single power supply; failed-state ke liye capacity planning na karna; HA configure kiya par kabhi test nahi; ye bhoolna ki Director HA aur Controller HA alag cheezein hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Planes ko mix mat karo. Director jaane se forwarding nahi rukti; bina HA ke branch CPE jaane se wo site rukti hai; Analytics jaane se sirf logging rukti hai. Questions aksar inhe swap karte hain.</p></div>

<div class="scn"><h4>Kagaz par redundant</h4><p>Ek company ne har branch ke liye do circuits kharide, lekin dono ek hi provider se the aur ek hi conduit se building mein aaye the. Road works crew ne conduit kaat diya aur dono circuits ek saath mar gaye. Incident ke baad company ne backup LTE par aur baad mein doosre carrier par shift kiya, aur quarterly failover drill jodi.</p><p><b>Lesson:</b> redundancy ko asli diversity chahiye, aur diversity ko testing.</p></div>

<div class="iv"><p class="q">"Director down ho jaye to SD-WAN ka kya hoga?"</p><p>Branches forward karte rehte hain kyunki data aur control planes Director par depend nahi karte. Wapas aane tak configuration push, onboarding aur management views jate hain; standby Director us window ko chhota karta hai. Controller loss (control plane) aur Analytics loss (sirf visibility) se contrast karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen levels par single points of failure hatao: circuits, branch, headend.</li>
<li>Circuits ki ginti se zyada carrier aur path diversity matter karti hai.</li>
<li>Jaano har component fail hone par kya rukta hai: control, management, data aur visibility alag planes hain.</li>
<li>Failed state ke liye capacity plan karo aur drills se failover test karo.</li>
<li>Branch HA aur headend HA ki details release par depend karti hain; course circuit redundancy practice mein dikhata hai.</li>
</ul></div>
`}};export{e as default};