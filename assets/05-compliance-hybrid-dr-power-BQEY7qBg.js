var e={id:`compliance-hybrid-dr`,h:{en:`Compliance, hybrid cloud, disaster recovery and power and cooling design`,hi:`Compliance, hybrid cloud, disaster recovery aur power aur cooling design`},body:{en:`
<p><b>Analogy.</b> An airline does not only plan flights. It also plans for a closed runway, a strike, a fuel shortage and an audit by the aviation authority. This chapter covers the same "what if and prove it" side of data center design: change control and compliance, hybrid and multi-cloud reach, power and cooling choices, and disaster recovery.</p>

<h3>The customer case: Deccan Air</h3>
<p>Deccan Air is a regional airline with a primary data center in Hyderabad and a recovery site in Nagpur, 500 km apart. The booking platform must restart within 15 minutes of losing Hyderabad (RTO 15 minutes) and may lose at most 1 minute of bookings (RPO 1 minute). Check-in and loyalty workloads burst in holiday season, so the airline wants to use public cloud for temporary capacity. A payment auditor requires evidence of every change and of who approved it. Constraints: the Hyderabad hall has only 6 kW per rack at present, cooling is air-based with cold-aisle containment, the budget excludes a third data center, and the WAN between sites is two 10 Gbps carrier circuits with 9 ms round-trip time.</p>

<h3>Part 1: compliance and change control</h3>
<p><b>Change control</b> is the process that makes a change planned, approved, tested, reversible and recorded. A design supports it with: a change window, peer review, <b>pre-change analysis</b> (checking the effect of a change before applying it, which Nexus Dashboard Insights can do against the fabric), post-change validation, and rollback. Compliance evidence comes from AAA accounting logs (who logged in and ran what), controller audit logs, Git history, and configuration-drift reports. Deccan Air keeps logs for the retention period required by its auditor on a central, write-protected syslog server.</p>

<h3>Part 2: hybrid and multi-cloud connectivity</h3>
<p>Connecting to the cloud has two parts: the <b>transport</b> (a private circuit such as a dedicated cloud connection, or an IPsec VPN over the internet) and <b>operational consistency</b>, meaning the same policy model and tools on premises and in the cloud. In Cisco's design, Nexus Dashboard Orchestrator provides multi-site policy for ACI, and Cloud Network Controller extends ACI policy to public-cloud networks, so a segment defined once can exist on premises and in a cloud region. Intersight gives a common operations view for servers and workloads.</p>
<table class="cmp"><tr><th>Transport</th><th>Pro</th><th>Con</th></tr>
<tr><td>IPsec VPN over internet</td><td>Quick, cheap</td><td>Variable latency, bandwidth capped by gateway</td></tr>
<tr><td>Dedicated private cloud connection</td><td>Predictable latency, higher throughput</td><td>Lead time of weeks, monthly cost</td></tr>
<tr><td>Colocation interconnect hub</td><td>Single point to reach several clouds</td><td>Extra colo contract</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Deccan Air sites and cloud">
<rect x="10" y="30" width="190" height="110" rx="12" fill="#bae6fd"/><text x="105" y="58" text-anchor="middle" class="svg-ink" font-size="14">Hyderabad (primary)</text><text x="105" y="80" text-anchor="middle" class="svg-muted" font-size="12">booking, payments</text><text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">6 kW per rack</text>
<rect x="225" y="30" width="190" height="110" rx="12" fill="#bbf7d0"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="14">Nagpur (recovery)</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">standby copy</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">RTO 15 min</text>
<rect x="440" y="30" width="190" height="110" rx="12" fill="#ddd6fe"/><text x="535" y="58" text-anchor="middle" class="svg-ink" font-size="14">Public cloud region</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="12">burst: check-in</text><text x="535" y="100" text-anchor="middle" class="svg-muted" font-size="12">loyalty</text>
<rect x="10" y="170" width="620" height="44" rx="10" fill="#fde68a"/><text x="320" y="197" text-anchor="middle" class="svg-ink" font-size="14">Orchestrator: one policy across all three</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="200" y1="85" x2="225" y2="85"/><line x1="415" y1="85" x2="440" y2="85"/><line x1="105" y1="140" x2="105" y2="170"/><line x1="320" y1="140" x2="320" y2="170"/><line x1="535" y1="140" x2="535" y2="170"/></g>
<text x="212" y="76" text-anchor="middle" class="svg-muted" font-size="11">DCI</text>
<text x="428" y="76" text-anchor="middle" class="svg-muted" font-size="11">VPN</text>
<rect x="10" y="238" width="14" height="14" fill="#bae6fd"/><text x="30" y="250" class="svg-muted" font-size="12">primary</text>
<rect x="110" y="238" width="14" height="14" fill="#bbf7d0"/><text x="130" y="250" class="svg-muted" font-size="12">recovery</text>
<rect x="215" y="238" width="14" height="14" fill="#ddd6fe"/><text x="235" y="250" class="svg-muted" font-size="12">cloud</text>
<rect x="290" y="238" width="14" height="14" fill="#fde68a"/><text x="310" y="250" class="svg-muted" font-size="12">policy layer</text>
</svg><p class="cap">Three locations, one policy model. DCI = data center interconnect.</p></div>

<h3>Part 3: disaster recovery and business continuity</h3>
<p><b>RTO</b> is how long you can be down; <b>RPO</b> is how much data you can lose. They drive the design. A 1-minute RPO cannot be met by nightly backup. Synchronous storage replication gives zero loss but needs short distance because every write waits for the remote acknowledgement; at 500 km and 9 ms round trip it adds at least that delay to each write, which the booking database cannot accept. Asynchronous replication with a small lag meets a 1-minute RPO.</p>
<table class="cmp"><tr><th>Model</th><th>RTO</th><th>Cost</th><th>Risk</th></tr>
<tr><td>Backup and restore</td><td>Hours to days</td><td>Low</td><td>Misses a 15-minute RTO</td></tr>
<tr><td>Active/standby (warm)</td><td>Minutes</td><td>Medium</td><td>Failover must be tested</td></tr>
<tr><td>Active/active</td><td>Near zero</td><td>High</td><td>Application must support it; larger failure domain if Layer 2 is stretched</td></tr>
</table>
<p>For the network, Deccan Air chooses a VXLAN EVPN Multi-Site design: each site is its own fabric and failure domain, and only selected networks are extended. This is safer than stretching one big Layer 2 domain, because a broadcast storm in one site cannot cross to the other.</p>

<h3>Part 4: power and cooling in design</h3>
<p>The Hyderabad hall provides 6 kW per rack. A rack of four dense servers and two switches that needs 9 kW does not fit, no matter how good the network design is. Check: rated power of each device, redundant power-supply mode (for example grid redundancy with feed A and feed B), and airflow. Nexus switches are ordered with port-side intake or port-side exhaust airflow so that they match the cold-aisle and hot-aisle layout; a wrong airflow choice recirculates hot air.</p>

<div class="eg"><p><b>Worked example.</b> Rack plan: 2 leaf switches at 0.6 kW each = 1.2 kW, 8 servers at 0.7 kW = 5.6 kW. Total 6.8 kW exceeds the 6 kW limit. The design moves 2 servers to the next rack, giving 5.4 kW in rack one and 1.4 kW elsewhere.</p></div>

<div class="scn"><h4>The failover nobody tested</h4><p>A retailer built a standby site and replicated databases, but never ran a failover. When the primary lost power, the standby came up with firewall rules, DNS records and a VLAN missing, because they had been added manually at the primary only. Recovery took 7 hours against a 1-hour target. The fix: define both sites from the same code, run a failover rehearsal twice a year, and write the runbook with named owners.</p><p><b>Lesson:</b> a DR plan is real only when it has been rehearsed and both sites share the same source of truth.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match the technique to RPO and RTO and to distance. Synchronous replication = zero data loss but limited distance. Do not choose stretched Layer 2 for DR just because it is simple; consider failure domains.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting power and cooling limits when the network design looks perfect, and forgetting that VPN gateways cap cloud throughput.</p></div>

<div class="iv"><p class="q">"How do you design DR for an application with RTO 15 minutes and RPO 1 minute across 500 km?"</p><p>Strong answer: asynchronous replication with monitored lag, warm standby with tested automation, separate fabrics joined by Multi-Site rather than one stretched domain, same code for both sites, and a rehearsed runbook. Explain why synchronous replication is unsuitable at that distance.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Change control needs approval, pre-change analysis, validation, rollback and logs.</li>
<li>Hybrid design means transport plus operational consistency from one policy model.</li>
<li>RTO and RPO choose the DR model; distance limits synchronous replication.</li>
<li>Separate fabrics per site keep failure domains small.</li>
<li>Check kW per rack, redundant feeds and airflow direction in every design.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> Ek airline sirf flights plan nahi karti. Wo band runway, strike, fuel shortage aur aviation authority ke audit ka bhi plan banati hai. Yeh chapter data center design ke usi "what if aur prove it" pehlu ko cover karta hai: change control aur compliance, hybrid aur multi-cloud reach, power aur cooling ke choices, aur disaster recovery.</p>

<h3>Customer case: Deccan Air</h3>
<p>Deccan Air ek regional airline hai jiska primary data center Hyderabad mein aur recovery site Nagpur mein hai, 500 km door. Booking platform ko Hyderabad khone ke 15 minute ke andar restart hona hai (RTO 15 minute) aur zyada se zyada 1 minute ki bookings kho sakti hain (RPO 1 minute). Check-in aur loyalty workloads holiday season mein burst karte hain, isliye airline temporary capacity ke liye public cloud use karna chahti hai. Payment auditor ko har change ka aur kisne approve kiya uska evidence chahiye. Constraints: Hyderabad hall mein abhi sirf 6 kW per rack hai, cooling air-based hai cold-aisle containment ke saath, budget mein teesra data center nahi, aur sites ke beech WAN do 10 Gbps carrier circuits hain jinka round-trip time 9 ms hai.</p>

<h3>Part 1: compliance aur change control</h3>
<p><b>Change control</b> wo process hai jo change ko planned, approved, tested, reversible aur recorded banata hai. Design ise support karta hai: change window, peer review, <b>pre-change analysis</b> (apply karne se pehle change ka effect check karna, jo Nexus Dashboard Insights fabric ke against kar sakta hai), post-change validation aur rollback ke saath. Compliance evidence AAA accounting logs (kisne login kiya aur kya chalaya), controller audit logs, Git history aur configuration-drift reports se aata hai. Deccan Air auditor ki required retention period tak logs ek central, write-protected syslog server par rakhti hai.</p>

<h3>Part 2: hybrid aur multi-cloud connectivity</h3>
<p>Cloud se connect karne ke do hisse hain: <b>transport</b> (private circuit jaise dedicated cloud connection, ya internet par IPsec VPN) aur <b>operational consistency</b>, yaani on-premises aur cloud mein same policy model aur tools. Cisco ke design mein Nexus Dashboard Orchestrator ACI ke liye multi-site policy deta hai, aur Cloud Network Controller ACI policy ko public-cloud networks tak extend karta hai, isliye ek baar define kiya segment on premises aur cloud region dono mein ho sakta hai. Intersight servers aur workloads ke liye common operations view deta hai.</p>
<table class="cmp"><tr><th>Transport</th><th>Pro</th><th>Con</th></tr>
<tr><td>Internet par IPsec VPN</td><td>Jaldi, sasta</td><td>Variable latency, bandwidth gateway se capped</td></tr>
<tr><td>Dedicated private cloud connection</td><td>Predictable latency, zyada throughput</td><td>Hafton ka lead time, monthly cost</td></tr>
<tr><td>Colocation interconnect hub</td><td>Kai clouds tak pahunchne ka ek point</td><td>Extra colo contract</td></tr>
</table>

<svg viewBox="0 0 640 270" role="img" aria-label="Deccan Air sites and cloud">
<rect x="10" y="30" width="190" height="110" rx="12" fill="#bae6fd"/><text x="105" y="58" text-anchor="middle" class="svg-ink" font-size="14">Hyderabad (primary)</text><text x="105" y="80" text-anchor="middle" class="svg-muted" font-size="12">booking, payments</text><text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">6 kW per rack</text>
<rect x="225" y="30" width="190" height="110" rx="12" fill="#bbf7d0"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="14">Nagpur (recovery)</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">standby copy</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">RTO 15 min</text>
<rect x="440" y="30" width="190" height="110" rx="12" fill="#ddd6fe"/><text x="535" y="58" text-anchor="middle" class="svg-ink" font-size="14">Public cloud region</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="12">burst: check-in</text><text x="535" y="100" text-anchor="middle" class="svg-muted" font-size="12">loyalty</text>
<rect x="10" y="170" width="620" height="44" rx="10" fill="#fde68a"/><text x="320" y="197" text-anchor="middle" class="svg-ink" font-size="14">Orchestrator: one policy across all three</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="200" y1="85" x2="225" y2="85"/><line x1="415" y1="85" x2="440" y2="85"/><line x1="105" y1="140" x2="105" y2="170"/><line x1="320" y1="140" x2="320" y2="170"/><line x1="535" y1="140" x2="535" y2="170"/></g>
<text x="212" y="76" text-anchor="middle" class="svg-muted" font-size="11">DCI</text>
<text x="428" y="76" text-anchor="middle" class="svg-muted" font-size="11">VPN</text>
<rect x="10" y="238" width="14" height="14" fill="#bae6fd"/><text x="30" y="250" class="svg-muted" font-size="12">primary</text>
<rect x="110" y="238" width="14" height="14" fill="#bbf7d0"/><text x="130" y="250" class="svg-muted" font-size="12">recovery</text>
<rect x="215" y="238" width="14" height="14" fill="#ddd6fe"/><text x="235" y="250" class="svg-muted" font-size="12">cloud</text>
<rect x="290" y="238" width="14" height="14" fill="#fde68a"/><text x="310" y="250" class="svg-muted" font-size="12">policy layer</text>
</svg>

<h3>Part 3: disaster recovery aur business continuity</h3>
<p><b>RTO</b> yeh hai ki aap kitni der down reh sakte ho; <b>RPO</b> yeh hai ki kitna data kho sakte ho. Design inhi se chalta hai. 1 minute ka RPO nightly backup se nahi milta. Synchronous storage replication zero loss deta hai lekin chhoti distance chahiye kyunki har write remote acknowledgement ka wait karta hai; 500 km aur 9 ms round trip par har write mein kam se kam utna delay judta hai, jo booking database accept nahi kar sakta. Chhote lag ke saath asynchronous replication 1 minute RPO poora karta hai.</p>
<table class="cmp"><tr><th>Model</th><th>RTO</th><th>Cost</th><th>Risk</th></tr>
<tr><td>Backup aur restore</td><td>Ghante se din</td><td>Low</td><td>15 minute RTO miss karta hai</td></tr>
<tr><td>Active/standby (warm)</td><td>Minutes</td><td>Medium</td><td>Failover test karna padega</td></tr>
<tr><td>Active/active</td><td>Lagbhag zero</td><td>High</td><td>Application support kare; Layer 2 stretch ho to failure domain bada</td></tr>
</table>
<p>Network ke liye Deccan Air VXLAN EVPN Multi-Site design chunti hai: har site apna fabric aur failure domain hai, aur sirf selected networks extend hote hain. Yeh ek bade stretched Layer 2 domain se safer hai, kyunki ek site ka broadcast storm dusre tak cross nahi kar sakta.</p>

<h3>Part 4: design mein power aur cooling</h3>
<p>Hyderabad hall 6 kW per rack deta hai. Chaar dense servers aur do switches wala rack jise 9 kW chahiye, network design kitna bhi achha ho, fit nahi hota. Check karo: har device ki rated power, redundant power-supply mode (jaise feed A aur feed B ke saath grid redundancy), aur airflow. Nexus switches port-side intake ya port-side exhaust airflow ke saath order hote hain taaki cold-aisle aur hot-aisle layout se match karein; galat airflow choice garam hawa ko recirculate karti hai.</p>

<div class="eg"><p><b>Worked example.</b> Rack plan: 2 leaf switches 0.6 kW each = 1.2 kW, 8 servers 0.7 kW each = 5.6 kW. Total 6.8 kW, 6 kW limit se zyada. Design 2 servers agle rack mein le jata hai, jisse rack one mein 5.4 kW aur doosre mein 1.4 kW.</p></div>

<div class="scn"><h4>Failover jo kabhi test nahi hua</h4><p>Ek retailer ne standby site banayi aur databases replicate kiye, lekin kabhi failover nahi chalaya. Jab primary ki power gayi, standby up aaya lekin firewall rules, DNS records aur ek VLAN missing the, kyunki wo sirf primary par manually add hue the. Recovery mein 7 ghante lage jabki target 1 ghanta tha. Fix: dono sites ko same code se define karo, saal mein do baar failover rehearsal karo, aur named owners ke saath runbook likho.</p><p><b>Lesson:</b> DR plan tabhi real hai jab rehearsed ho aur dono sites same source of truth share karein.</p></div>

<div class="exam"><p><b>Exam trap.</b> Technique ko RPO, RTO aur distance se match karo. Synchronous replication = zero data loss lekin limited distance. Sirf simple hone ki wajah se DR ke liye stretched Layer 2 mat chuno; failure domains sochho.</p></div>

<div class="warn"><p><b>Common mistake.</b> Network design perfect lagne par power aur cooling limits bhool jana, aur yeh bhool jana ki VPN gateways cloud throughput cap karte hain.</p></div>

<div class="iv"><p class="q">"RTO 15 minute aur RPO 1 minute wali application ke liye 500 km par DR kaise design karoge?"</p><p>Strong answer: monitored lag ke saath asynchronous replication, tested automation ke saath warm standby, ek stretched domain ki jagah Multi-Site se joda hua alag fabrics, dono sites ke liye same code, aur rehearsed runbook. Batao ki us distance par synchronous replication kyun unsuitable hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Change control ko approval, pre-change analysis, validation, rollback aur logs chahiye.</li>
<li>Hybrid design matlab transport plus ek policy model se operational consistency.</li>
<li>RTO aur RPO DR model chunte hain; distance synchronous replication ko limit karti hai.</li>
<li>Har site ka alag fabric failure domains chhote rakhta hai.</li>
<li>Har design mein kW per rack, redundant feeds aur airflow direction check karo.</li>
</ul></div>
`}};export{e as default};