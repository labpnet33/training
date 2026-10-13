var e=(e,t,n,r)=>`<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Two-level route reflector design"><rect x="200" y="15" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="250" y="40" text-anchor="middle" class="svg-ink" font-size="13">RR-A</text><rect x="340" y="15" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="390" y="40" text-anchor="middle" class="svg-ink" font-size="13">RR-B</text><line x1="300" y1="35" x2="340" y2="35" stroke="#64748b" stroke-width="2"/><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">`+t+`</text><rect x="30" y="110" width="100" height="40" rx="8" fill="#bae6fd"/><text x="80" y="135" text-anchor="middle" class="svg-ink" font-size="13">PE1</text><rect x="150" y="110" width="100" height="40" rx="8" fill="#bae6fd"/><text x="200" y="135" text-anchor="middle" class="svg-ink" font-size="13">PE2</text><rect x="390" y="110" width="100" height="40" rx="8" fill="#bae6fd"/><text x="440" y="135" text-anchor="middle" class="svg-ink" font-size="13">PE3</text><rect x="510" y="110" width="100" height="40" rx="8" fill="#bae6fd"/><text x="560" y="135" text-anchor="middle" class="svg-ink" font-size="13">PE4</text><line x1="230" y1="55" x2="80" y2="110" stroke="#64748b"/><line x1="230" y1="55" x2="200" y2="110" stroke="#64748b"/><line x1="270" y1="55" x2="80" y2="110" stroke="#64748b" stroke-dasharray="4 4"/><line x1="270" y1="55" x2="200" y2="110" stroke="#64748b" stroke-dasharray="4 4"/><line x1="410" y1="55" x2="440" y2="110" stroke="#64748b"/><line x1="410" y1="55" x2="560" y2="110" stroke="#64748b"/><line x1="370" y1="55" x2="440" y2="110" stroke="#64748b" stroke-dasharray="4 4"/><line x1="370" y1="55" x2="560" y2="110" stroke="#64748b" stroke-dasharray="4 4"/><text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">`+n+`</text><text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">`+r+`</text></svg><p class="cap">`+e+`</p></div>`,t={id:`rr-design-redundancy`,h:{en:`Route reflector design: redundancy, cluster IDs and hierarchy`,hi:`Route reflector design: redundancy, cluster IDs aur hierarchy`},body:{en:`
<p>A single RR is a single point of failure for the whole BGP control plane. Real SP designs always use at least two. This chapter covers the design choices the SPCOR exam expects you to explain: redundancy, the cluster ID choice, where to put RRs, and how to scale beyond one level. The lab has a single RR to keep it small; the ideas here are design theory, and any configuration shown is <b>reference configuration</b>, not simulator output.</p>

<h3>Redundancy: two RRs</h3>
<p>Every PE peers with <b>both</b> RRs. If one fails, the other still reflects every route. The two RRs peer with each other as ordinary iBGP neighbours (non-clients of each other). There are two ways to set the cluster ID:</p>
<table class="cmp"><tr><th>Design</th><th>How</th><th>Effect</th></tr>
<tr><td>Same cluster ID on both RRs</td><td><code>bgp cluster-id 1</code> on each</td><td>RRs drop each other's reflected routes (their own cluster ID is in CLUSTER_LIST). Fewer duplicate paths, less memory. But a client that peers with <i>only one</i> RR and loses it, loses routes.</td></tr>
<tr><td>Different cluster IDs (default, router ID)</td><td>nothing configured</td><td>RRs accept each other's reflected routes, so each RR holds two copies. More resilient; uses more memory.</td></tr></table>
<pre class="code"><span class="c">! Reference configuration (the simulator does not implement bgp cluster-id)</span>
router bgp 65000
 bgp cluster-id 1
 neighbor 10.20.255.1 remote-as 65000
 neighbor 10.20.255.1 update-source Loopback0
 neighbor 10.20.255.1 route-reflector-client</pre>
<p>The rule of thumb: <b>same cluster ID</b> when every client is dual-homed to both RRs of the cluster; <b>different IDs</b> when you cannot guarantee that.</p>

@@D@@

<h3>Where to put the RR</h3>
<ul>
<li><b>In-path RR</b>: a P or PE that also reflects. Simple, but a BGP restart on that box can disturb forwarding.</li>
<li><b>Out-of-path (dedicated) RR</b>: a router, even a virtual one, that only runs the control plane and is never in the forwarding path. Preferred in large networks because it can be upgraded and rebooted without touching traffic, and it needs only IGP reachability, not forwarding capacity. In an out-of-path RR design the next-hop-self rule still applies at the PEs.</li>
</ul>

<h3>Hierarchical reflection</h3>
<p>For very large networks (hundreds of PEs, several regions) build levels: regional RRs are <b>clients</b> of top-level RRs, and the top-level RRs form a full mesh. A route climbs from a PE to its regional RR, up to the top RRs, and down into other regions. CLUSTER_LIST grows by one entry per level and protects against loops across levels. Keep the hierarchy shallow: every level adds convergence time.</p>

<h3>Things that go wrong with RRs</h3>
<ol>
<li><b>Suboptimal paths.</b> An RR chooses one best path with <i>its</i> IGP metric view, not the client's. A client that would prefer a closer exit may be told about the RR's choice. Add-Path, best-external and optimal route reflection (covered in chapter 6) address this.</li>
<li><b>Route oscillation.</b> Inconsistent MED comparison in clients and RRs can flip best path repeatedly. Use deterministic MED consistently.</li>
<li><b>Missing next-hop reachability.</b> The RR itself must be able to resolve the next hop to mark a route best. If the RR has no IGP route to a PE loopback, it cannot reflect that PE's routes at all.</li>
</ol>

<div class="eg"><p><b>Worked example: failure of an RR.</b> 30 PEs, two RRs with different cluster IDs, every PE peering with both. RR-A is rebooted for a software upgrade. All 30 PEs still hold sessions to RR-B; their BGP tables do not change and forwarding continues untouched. If the same 30 PEs had been single-homed to RR-A, every route learned through RR-A would be withdrawn on the reboot.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Connecting a PE to only one RR. Giving two RRs the same cluster ID while a client is attached to just one of them. Using the RR as a normal PE with a huge customer table and then rebooting it for maintenance.</p></div>
<div class="exam"><p><b>Exam trap.</b> The cluster ID defaults to the RR's BGP router ID. A route is dropped by an RR if its own cluster ID appears in CLUSTER_LIST. Same cluster ID on both RRs reduces redundant paths; it does not make the design more redundant.</p></div>

<div class="scn"><h4>The maintenance window that did not matter</h4><p>A carrier needed to replace the hardware of a core RR in business hours. Every PE had a session to a second RR with a different cluster ID. They shut the first RR down, watched <code>show ip bgp summary</code> on three PEs and saw prefix counts unchanged, and finished the swap with no customer impact.</p><p><b>Lesson:</b> dual RRs are only a benefit if every client peers with both and you check that before the change.</p></div>

<div class="iv"><p class="q">"How would you design RRs for a network with 200 PEs in four regions?"</p><p>Two dedicated out-of-path RRs per region, with every regional PE peering with both, and the regional RRs as clients of two top-level RRs that are fully meshed. Choose same or different cluster IDs according to whether every client is dual-homed. Mention next-hop-self at the edge, BFD or fast session failure detection, and Add-Path or BGP PIC for fast convergence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use at least two RRs; every PE peers with both.</li>
<li>Cluster ID defaults to the router ID; same ID reduces duplicate paths.</li>
<li>Out-of-path RRs are easier to maintain than in-path ones.</li>
<li>Hierarchical RRs scale; keep the tree shallow.</li>
<li>The RR needs IGP reachability to the next hop to reflect a route.</li>
</ul></div>
`.replace(`@@D@@`,e(`Two RRs, every PE peers with both (solid and dashed lines).`,`full iBGP session between the RRs`,`Region view: 4 PEs, 2 RRs, 8 PE-to-RR sessions + 1 RR-to-RR`,`compare: a 4-PE full mesh would need only 6, but 40 PEs would need 780`)),hi:`
<p>Ek hi RR poore BGP control plane ke liye single point of failure hai. Real SP designs hamesha kam se kam do use karte hain. Is chapter mein woh design choices hain jo SPCOR exam aapse samjhane ki ummeed rakhta hai: redundancy, cluster ID ka choice, RRs kahan rakhein, aur ek level se aage scale kaise karein. Lab mein chhota rakhne ke liye ek hi RR hai; yahan ke ideas design theory hain, aur jo bhi configuration dikhaya hai woh <b>reference configuration</b> hai, simulator output nahi.</p>

<h3>Redundancy: do RRs</h3>
<p>Har PE <b>dono</b> RRs se peer karta hai. Ek fail ho to doosra har route reflect karta rehta hai. Dono RRs aapas mein normal iBGP neighbours (ek doosre ke non-clients) ki tarah peer karte hain. Cluster ID set karne ke do tareeke hain:</p>
<table class="cmp"><tr><th>Design</th><th>Kaise</th><th>Asar</th></tr>
<tr><td>Dono RRs par same cluster ID</td><td>har ek par <code>bgp cluster-id 1</code></td><td>RRs ek doosre ke reflected routes drop karte hain (unka apna cluster ID CLUSTER_LIST mein hai). Kam duplicate paths, kam memory. Lekin jo client <i>sirf ek</i> RR se peer karta hai woh use kho de to routes kho deta hai.</td></tr>
<tr><td>Alag cluster IDs (default, router ID)</td><td>kuch configure nahi</td><td>RRs ek doosre ke reflected routes accept karte hain, isliye har RR ke paas do copies hoti hain. Zyada resilient; zyada memory.</td></tr></table>
<pre class="code"><span class="c">! Reference configuration (simulator bgp cluster-id implement nahi karta)</span>
router bgp 65000
 bgp cluster-id 1
 neighbor 10.20.255.1 remote-as 65000
 neighbor 10.20.255.1 update-source Loopback0
 neighbor 10.20.255.1 route-reflector-client</pre>
<p>Rule of thumb: jab har client cluster ke dono RRs se dual-homed ho tab <b>same cluster ID</b>; jab yeh guarantee na ho tab <b>alag IDs</b>.</p>

@@D@@

<h3>RR kahan rakhein</h3>
<ul>
<li><b>In-path RR</b>: P ya PE jo reflect bhi karta hai. Simple, lekin us box par BGP restart forwarding ko disturb kar sakta hai.</li>
<li><b>Out-of-path (dedicated) RR</b>: router, virtual bhi chalega, jo sirf control plane chalata hai aur kabhi forwarding path mein nahi hota. Bade networks mein pasandida kyunki use traffic ko chhue bina upgrade aur reboot kiya ja sakta hai, aur use forwarding capacity nahi, sirf IGP reachability chahiye. Out-of-path RR design mein bhi PEs par next-hop-self rule lagta hai.</li>
</ul>

<h3>Hierarchical reflection</h3>
<p>Bahut bade networks (sainkdon PEs, kai regions) ke liye levels banao: regional RRs top-level RRs ke <b>clients</b> hote hain, aur top-level RRs full mesh banate hain. Route PE se regional RR tak, phir top RRs tak, aur doosre regions mein neeche jaata hai. CLUSTER_LIST har level par ek entry badhta hai aur levels ke aar-paar loops se bachata hai. Hierarchy ko shallow rakho: har level convergence time badhata hai.</p>

<h3>RRs ke saath kya galat ho sakta hai</h3>
<ol>
<li><b>Suboptimal paths.</b> RR <i>apne</i> IGP metric view se ek best path chunta hai, client ke nahi. Jo client paas wala exit pasand karta, use RR ka choice mil sakta hai. Add-Path, best-external aur optimal route reflection (chapter 6) iska hal hain.</li>
<li><b>Route oscillation.</b> Clients aur RRs mein inconsistent MED comparison best path ko baar-baar flip kar sakta hai. Deterministic MED consistently use karo.</li>
<li><b>Next-hop reachability missing.</b> Route ko best mark karne ke liye RR khud next hop resolve kar paaye. Agar RR ke paas PE loopback ka IGP route nahi to woh us PE ke routes reflect nahi kar sakta.</li>
</ol>

<div class="eg"><p><b>Worked example: RR ka failure.</b> 30 PEs, do RRs alag cluster IDs ke saath, har PE dono se peer. Software upgrade ke liye RR-A reboot hota hai. Saare 30 PEs ke RR-B se sessions bane rehte hain; unki BGP tables nahi badalti aur forwarding chalti rehti hai. Agar yahi 30 PEs sirf RR-A se single-homed hote to reboot par RR-A se seekhe har route withdraw ho jaate.</p></div>

<div class="warn"><p><b>Common mistakes.</b> PE ko sirf ek RR se jodna. Do RRs ko same cluster ID dena jabki koi client sirf ek se attach hai. RR ko bade customer table wale normal PE ki tarah use karke maintenance ke liye reboot karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Cluster ID default mein RR ka BGP router ID hota hai. RR route drop karta hai agar uska apna cluster ID CLUSTER_LIST mein ho. Dono RRs par same cluster ID duplicate paths kam karta hai; design ko zyada redundant nahi banata.</p></div>

<div class="scn"><h4>Maintenance window jo matter nahi hui</h4><p>Ek carrier ko business hours mein core RR ka hardware badalna tha. Har PE ka doosre RR se, alag cluster ID ke saath, session tha. Unhone pehla RR shut kiya, teen PEs par <code>show ip bgp summary</code> dekha, prefix counts unchanged mile, aur swap bina customer impact ke poora hua.</p><p><b>Lesson:</b> dual RRs tabhi faayda dete hain jab har client dono se peer kare aur aap change se pehle yeh check karo.</p></div>

<div class="iv"><p class="q">"Chaar regions mein 200 PEs ke network ke liye RRs ka design kaisa karoge?"</p><p>Har region mein do dedicated out-of-path RRs, har regional PE dono se peer kare, aur regional RRs do top-level RRs ke clients ho jo full mesh mein hon. Cluster IDs same ya alag is par chuno ki har client dual-homed hai ya nahi. Edge par next-hop-self, BFD ya fast session failure detection, aur fast convergence ke liye Add-Path ya BGP PIC ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kam se kam do RRs use karo; har PE dono se peer kare.</li>
<li>Cluster ID default mein router ID hai; same ID duplicate paths kam karta hai.</li>
<li>Out-of-path RRs in-path se maintain karne mein aasan hain.</li>
<li>Hierarchical RRs scale karte hain; tree ko shallow rakho.</li>
<li>Route reflect karne ke liye RR ko next hop tak IGP reachability chahiye.</li>
</ul></div>
`.replace(`@@D@@`,e(`Do RRs, har PE dono se peer karta hai (solid aur dashed lines).`,`RRs ke beech full iBGP session`,`Region view: 4 PEs, 2 RRs, 8 PE-to-RR sessions + 1 RR-to-RR`,`compare: 4-PE full mesh ko sirf 6 chahiye, par 40 PEs ko 780`))}};export{t as default};