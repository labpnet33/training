var e={id:`assessment-bandwidth`,h:{en:`Assessing the existing network and planning bandwidth`,hi:`Existing network ka assessment aur bandwidth planning`},body:{en:`
<p>Before you design anything you must know what exists. The exam lists <b>existing network assessment</b> and <b>bandwidth planning</b> as separate skills, and they feed each other: the assessment gives the inputs, the bandwidth plan turns them into hardware and licence decisions.</p>
<h3>Analogy: measuring a house before ordering furniture</h3>
<p>You measure doors, ceiling height and the staircase before you order a sofa. A sofa that does not fit through the door is worth nothing. In the same way, an SD-WAN design that ignores the real circuits, VLANs and applications will fail at deployment, not on paper.</p>
<h3>What to collect, site by site</h3>
<table class="cmp"><tr><th>Area</th><th>Questions to answer</th><th>Why it matters for the design</th></tr>
<tr><td><b>Sites</b></td><td>How many, where, users per site, rack space, power, criticality</td><td>Model, HA, licence tier</td></tr>
<tr><td><b>Circuits</b></td><td>Type (fibre, DSL, cable, MPLS, LTE), contracted down and up speed, provider, public or private address, CGNAT, SLA, monthly cost</td><td>Circuit categories, path policy, backup choice</td></tr>
<tr><td><b>Applications</b></td><td>Voice, video, ERP, SaaS, backups, guest browsing: volume, peak hour, sensitivity to loss and delay</td><td>Performance and QoS policy, bandwidth</td></tr>
<tr><td><b>LAN</b></td><td>VLANs, subnets, which are corporate, guest, IoT, payment</td><td>Interfaces, zones, segmentation</td></tr>
<tr><td><b>Routing</b></td><td>Static or dynamic (BGP, OSPF), default routes, MPLS provider routing, overlapping subnets</td><td>Where the ION injects and learns routes</td></tr>
<tr><td><b>Security and NAT</b></td><td>Existing firewalls, NAT, published servers, compliance rules</td><td>ZBFW zones, NAT policy, where inspection stays</td></tr>
<tr><td><b>Management</b></td><td>DNS, NTP, syslog, SNMP servers, access to the cloud management plane</td><td>Controller connectivity at every site</td></tr></table>
<h3>How to collect it</h3>
<ul>
<li>Interview the site owner and fill a standard site sheet, one per site.</li>
<li>Pull flow or utilisation data from existing routers for at least a full business cycle (for example four weeks) so month-end peaks appear.</li>
<li>Check circuit contracts for committed rate and for burst.</li>
<li>Walk the site, or ask for photos, to confirm rack space, power and cabling.</li>
<li>Use Analytics mode after deployment of a pilot to measure real application traffic; the documentation describes Analytics mode as monitoring without controlling traffic.</li>
</ul>
<h3>Turning numbers into a bandwidth plan</h3>
<ol>
<li><b>Peak per site.</b> Take the busiest-hour traffic, not the daily average. Separate download and upload, because most circuits are asymmetric.</li>
<li><b>Overlay overhead.</b> Tunnels add encapsulation and encryption headers to every packet. As a planning rule of thumb (my own engineering margin, not a vendor figure) add 10 to 20 percent for small-packet traffic such as voice.</li>
<li><b>Growth.</b> Apply a growth factor, for example 30 percent for three years.</li>
<li><b>Hub aggregation.</b> Add the branch peaks that go to a hub, then multiply by a <b>concurrency factor</b> that reflects that not every branch peaks at once (for example 0.6 to 0.8). This is oversubscription: the hub is smaller than the sum of its branches by design.</li>
<li><b>Internet breakout decision.</b> Traffic that goes straight from the branch to the internet never reaches the hub, so it lowers the hub requirement. Traffic backhauled to the data center (for example for central inspection) adds to it.</li>
<li><b>Failure case.</b> Check the design when one circuit or one hub is down: the remaining circuits must carry the critical traffic.</li>
</ol>
<div class="eg"><p><b>Worked example: DC-EAST hub bandwidth.</b></p>
<table class="cmp"><tr><th>Group</th><th>Count</th><th>Peak each (to data center)</th><th>Subtotal</th></tr>
<tr><td>Small shops</td><td>25</td><td>20 Mbps</td><td>500 Mbps</td></tr>
<tr><td>Stores</td><td>12</td><td>120 Mbps</td><td>1,440 Mbps</td></tr>
<tr><td>Regional offices</td><td>3</td><td>300 Mbps</td><td>900 Mbps</td></tr>
<tr><td colspan="3"><b>Sum of peaks</b></td><td><b>2,840 Mbps</b></td></tr></table>
<p>Concurrency factor 0.7: 2,840 x 0.7 = 1,988 Mbps. Overhead 15 percent: 1,988 x 1.15 = 2,286 Mbps. Growth 30 percent: 2,286 x 1.3 = 2,972, round to about 3 Gbps. DC-EAST needs about 3 Gbps of encrypted capacity from branches. If DC-WEST must take over completely when DC-EAST fails, DC-WEST needs the same 3 Gbps for the failure case, even though in normal operation it carries only its own half.</p>
<p>Oversubscription check: the stores have contracted 500 Mbps each, 12 x 500 = 6,000 Mbps of circuits, while the hub plan is 3,000 Mbps. That is 2 to 1 oversubscription of circuit capacity to hub capacity, acceptable because real peaks are far below circuit speed.</p></div>
<h3>Circuit categories in the plan</h3>
<p>Prisma SD-WAN labels each circuit with a <b>category</b>, public (internet) or private (for example MPLS), plus a label such as a provider and city. The data center documentation describes configuring internet circuits and private WAN circuits with pre-defined categories, and says labels can be edited under circuit categories in the stacked policies area. During assessment, write down the label you will give each circuit, because policies refer to categories and labels, not to interface names.</p>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>The documented path to describe a data center and its circuits is Configuration, Prisma SD-WAN, Data Centers, Add Site. The wizard asks for site information (name, city, country, address), then a WAN circuits and devices tab where you add circuits (internet and private WAN), and finally device assignment: assign available devices or create device shells (up to two shells are mentioned for pre-provisioning). The assessment sheet should contain every value this wizard asks for, so that the configuration step is a copy job.</p>
<div class="warn"><p><b>Common mistakes.</b> Using monthly averages instead of busy-hour peaks. Forgetting upload speed on asymmetric links, where the upstream limit is the real bottleneck. Ignoring overlapping subnets between branches. Forgetting that CGNAT or an upstream NAT can prevent a public address and change how tunnels form.</p></div>
<div class="exam"><p><b>Exam trap.</b> A scenario with "branches send traffic to a SaaS service through the data center" implies backhaul, which raises hub bandwidth. A scenario with "direct internet breakout" lowers hub bandwidth but moves inspection to the branch (ZBFW) or to a cloud security service. Read which direction the traffic flows before you size.</p></div>
<div class="scn"><h4>Month-end surprise</h4><p>A distributor sized its hub on weekly averages. At month end all branches uploaded invoices and backups at the same hour, saturating the hub and making voice choppy. After the assessment was redone with the busiest four hours of the month, they doubled the hub capacity and moved backups to run at night through a bulk-transfer policy.</p><p><b>Lesson:</b> plan for the true peak, and shift what can wait.</p></div>
<div class="iv"><p class="q">"How do you plan hub bandwidth for 100 branches?"</p><p>Collect busy-hour peak per branch toward the hub, sum them, apply a concurrency factor for non-simultaneous peaks, add overlay overhead and growth, and check the failure case where one hub carries everything. State that internet breakout reduces hub load and backhaul increases it, and confirm the result with the licence tier and the hardware throughput.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Assess sites, circuits, applications, LAN, routing, security, NAT and management before sizing.</li>
<li>Plan with busy-hour peaks, upload and download separately, overlay overhead and growth.</li>
<li>Hubs are oversubscribed on purpose using a concurrency factor, but must also cover the failure case.</li>
<li>Breakout versus backhaul changes both hub bandwidth and where inspection happens.</li>
<li>Circuits get categories (public or private) and labels that policy will use.</li>
</ul></div>
`,hi:`
<p>Kuch bhi design karne se pehle aapko pata hona chahiye ki kya maujood hai. Exam <b>existing network assessment</b> aur <b>bandwidth planning</b> ko alag skills ki tarah list karta hai, aur dono ek doosre ko feed karte hain: assessment inputs deta hai, bandwidth plan unhe hardware aur licence decisions mein badalta hai.</p>
<h3>Analogy: furniture order karne se pehle ghar naapna</h3>
<p>Sofa order karne se pehle aap darwaze, chhat ki unchai aur seedhiyan naapte ho. Jo sofa darwaze se andar na jaaye woh bekaar hai. Waise hi, jo SD-WAN design real circuits, VLANs aur applications ko ignore karta hai woh paper par nahi, deployment par fail hota hai.</p>
<h3>Site by site kya collect karna hai</h3>
<table class="cmp"><tr><th>Area</th><th>Kin sawalon ke jawab chahiye</th><th>Design ke liye kyun zaroori</th></tr>
<tr><td><b>Sites</b></td><td>Kitni, kahan, har site par users, rack space, power, criticality</td><td>Model, HA, licence tier</td></tr>
<tr><td><b>Circuits</b></td><td>Type (fibre, DSL, cable, MPLS, LTE), contracted down aur up speed, provider, public ya private address, CGNAT, SLA, monthly cost</td><td>Circuit categories, path policy, backup ka choice</td></tr>
<tr><td><b>Applications</b></td><td>Voice, video, ERP, SaaS, backups, guest browsing: volume, peak hour, loss aur delay ke prati sensitivity</td><td>Performance aur QoS policy, bandwidth</td></tr>
<tr><td><b>LAN</b></td><td>VLANs, subnets, kaun corporate, guest, IoT, payment hai</td><td>Interfaces, zones, segmentation</td></tr>
<tr><td><b>Routing</b></td><td>Static ya dynamic (BGP, OSPF), default routes, MPLS provider routing, overlapping subnets</td><td>ION kahan routes inject aur learn karta hai</td></tr>
<tr><td><b>Security aur NAT</b></td><td>Existing firewalls, NAT, published servers, compliance rules</td><td>ZBFW zones, NAT policy, inspection kahan rahega</td></tr>
<tr><td><b>Management</b></td><td>DNS, NTP, syslog, SNMP servers, cloud management plane tak access</td><td>Har site par controller connectivity</td></tr></table>
<h3>Kaise collect karein</h3>
<ul>
<li>Site owner ka interview lo aur har site ke liye standard site sheet bharo.</li>
<li>Existing routers se kam se kam ek poore business cycle (jaise chaar hafte) ka flow ya utilisation data nikalo taaki month-end peaks dikhein.</li>
<li>Circuit contracts mein committed rate aur burst check karo.</li>
<li>Rack space, power aur cabling confirm karne ke liye site walk karo, ya photos maango.</li>
<li>Pilot deploy karne ke baad real application traffic naapne ke liye Analytics mode use karo; documentation Analytics mode ko traffic control kiye bina monitoring ke roop mein describe karti hai.</li>
</ul>
<h3>Numbers ko bandwidth plan mein badalna</h3>
<ol>
<li><b>Har site ka peak.</b> Busiest-hour traffic lo, daily average nahi. Download aur upload alag karo, kyunki zyada tar circuits asymmetric hote hain.</li>
<li><b>Overlay overhead.</b> Tunnels har packet par encapsulation aur encryption headers jodte hain. Planning rule of thumb ke taur par (meri apni engineering margin, vendor figure nahi) voice jaise small-packet traffic ke liye 10 se 20 percent jodo.</li>
<li><b>Growth.</b> Growth factor lagao, jaise teen saal ke liye 30 percent.</li>
<li><b>Hub aggregation.</b> Hub ki taraf jaane wale branch peaks jodo, phir <b>concurrency factor</b> se multiply karo jo dikhata hai ki saare branches ek saath peak nahi karte (jaise 0.6 se 0.8). Yahi oversubscription hai: hub design se hi apne branches ke sum se chhota hota hai.</li>
<li><b>Internet breakout decision.</b> Jo traffic branch se seedha internet jaata hai woh hub tak nahi pahunchta, isliye hub requirement ghatati hai. Jo data center tak backhaul hota hai (jaise central inspection ke liye) woh badhata hai.</li>
<li><b>Failure case.</b> Design check karo jab ek circuit ya ek hub down ho: bache hue circuits ko critical traffic uthana chahiye.</li>
</ol>
<div class="eg"><p><b>Worked example: DC-EAST hub bandwidth.</b></p>
<table class="cmp"><tr><th>Group</th><th>Count</th><th>Har ek ka peak (data center ki taraf)</th><th>Subtotal</th></tr>
<tr><td>Chhoti shops</td><td>25</td><td>20 Mbps</td><td>500 Mbps</td></tr>
<tr><td>Stores</td><td>12</td><td>120 Mbps</td><td>1,440 Mbps</td></tr>
<tr><td>Regional offices</td><td>3</td><td>300 Mbps</td><td>900 Mbps</td></tr>
<tr><td colspan="3"><b>Peaks ka sum</b></td><td><b>2,840 Mbps</b></td></tr></table>
<p>Concurrency factor 0.7: 2,840 x 0.7 = 1,988 Mbps. Overhead 15 percent: 1,988 x 1.15 = 2,286 Mbps. Growth 30 percent: 2,286 x 1.3 = 2,972, round karke lagbhag 3 Gbps. DC-EAST ko branches se lagbhag 3 Gbps encrypted capacity chahiye. Agar DC-EAST fail hone par DC-WEST ko poora takeover karna hai, to DC-WEST ko failure case ke liye wahi 3 Gbps chahiye, chahe normal operation mein woh sirf apna aadha uthaye.</p>
<p>Oversubscription check: stores ne har ek 500 Mbps contract kiya hai, 12 x 500 = 6,000 Mbps circuits, jabki hub plan 3,000 Mbps ka hai. Yeh circuit capacity se hub capacity ka 2 ke 1 oversubscription hai, acceptable kyunki real peaks circuit speed se bahut neeche hote hain.</p></div>
<h3>Plan mein circuit categories</h3>
<p>Prisma SD-WAN har circuit ko ek <b>category</b> se label karta hai, public (internet) ya private (jaise MPLS), saath mein provider aur city jaisa label. Data center documentation internet circuits aur private WAN circuits ko pre-defined categories ke saath configure karna describe karti hai, aur kehti hai ki stacked policies area mein circuit categories ke under labels edit ho sakte hain. Assessment ke dauraan har circuit ko jo label doge woh likh lo, kyunki policies categories aur labels ko refer karti hain, interface names ko nahi.</p>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>Data center aur uske circuits describe karne ka documented path hai Configuration, Prisma SD-WAN, Data Centers, Add Site. Wizard pehle site information (name, city, country, address) maangta hai, phir WAN circuits and devices tab jahan aap circuits (internet aur private WAN) add karte ho, aur aakhir mein device assignment: available devices assign karo ya device shells banao (pre-provisioning ke liye do shells tak ka zikr hai). Assessment sheet mein woh har value honi chahiye jo yeh wizard maangta hai, taaki configuration step copy ka kaam ho.</p>
<div class="warn"><p><b>Common galtiyan.</b> Busy-hour peaks ki jagah monthly averages use karna. Asymmetric links par upload speed bhool jaana, jahan upstream limit hi asli bottleneck hoti hai. Branches ke beech overlapping subnets ko ignore karna. Yeh bhool jaana ki CGNAT ya upstream NAT public address rok sakta hai aur tunnels ke banne ka tareeka badal deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Branches SaaS service tak data center ke through traffic bhejti hain" wala scenario backhaul batata hai, jo hub bandwidth badhata hai. "Direct internet breakout" wala scenario hub bandwidth ghatata hai par inspection ko branch (ZBFW) ya cloud security service par le jaata hai. Size karne se pehle padho ki traffic kis direction mein jaa raha hai.</p></div>
<div class="scn"><h4>Month-end surprise</h4><p>Ek distributor ne apna hub weekly averages par size kiya. Month end par saare branches ne ek hi ghante invoices aur backups upload kiye, jisse hub saturate ho gaya aur voice choppy ho gayi. Assessment ko mahine ke sabse busy chaar ghanton ke saath dobara karne ke baad unhone hub capacity double ki aur backups ko bulk-transfer policy se raat mein chalaya.</p><p><b>Seekh:</b> true peak ke liye plan karo, aur jo ruk sakta hai use shift karo.</p></div>
<div class="iv"><p class="q">"100 branches ke liye hub bandwidth kaise plan karoge?"</p><p>Har branch ka hub ki taraf busy-hour peak collect karo, jodo, non-simultaneous peaks ke liye concurrency factor lagao, overlay overhead aur growth jodo, aur failure case check karo jahan ek hub sab kuch uthata hai. Batao ki internet breakout hub load ghatata hai aur backhaul badhata hai, aur result ko licence tier aur hardware throughput ke saath confirm karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Size karne se pehle sites, circuits, applications, LAN, routing, security, NAT aur management assess karo.</li>
<li>Busy-hour peaks, upload aur download alag, overlay overhead aur growth ke saath plan karo.</li>
<li>Hubs jaan-boojh kar concurrency factor se oversubscribed hote hain, par failure case bhi cover karna hota hai.</li>
<li>Breakout versus backhaul hub bandwidth aur inspection ki jagah dono badalta hai.</li>
<li>Circuits ko categories (public ya private) aur labels milte hain jo policy use karti hai.</li>
</ul></div>
`}};export{e as default};