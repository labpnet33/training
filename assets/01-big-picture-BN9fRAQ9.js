var e={id:`big-picture`,h:{en:`The big picture: run the network like a hospital`,hi:`Big picture: network ko hospital ki tarah chalao`},body:{en:`
<p><b>What you will learn in this module.</b> Building a network is only the first day of its life. Every day after that, somebody has to know what is installed where, notice when something breaks (ideally before users do), prove that changes were planned, and bring the business back after a disaster. This module covers CompTIA Network+ N10-009 objectives <b>3.1</b> (organisational processes and procedures: documentation, life-cycle, change and configuration management), <b>3.2</b> (network monitoring technologies: SNMP, flow data, packet capture, baselines, log aggregation, API integration, port mirroring and monitoring solutions) and <b>3.3</b> (disaster recovery: RPO, RTO, MTTR, MTBF, DR sites, high availability and DR testing). In the hands-on lab you will send syslog and SNMP traps from two routers to a network management station and let it poll one router safely.</p>
<p><b>Prerequisites.</b> You should be comfortable with IPv4 addressing, the idea of TCP and UDP ports (np-concepts, np-addressing), static routing (np-routing) and the services DHCP, DNS and NAT (np-services). You do not need any monitoring experience. Access control lists appear only in their simplest form here; np-security teaches them in depth, and np-troubleshoot later uses the tools from this module inside the full troubleshooting methodology.</p>

<h3>An analogy: a hospital ward</h3>
<p>Think of a hospital ward. Every patient has a <b>chart</b> at the end of the bed: who they are, what medicines they take, what was done and when. That is <b>documentation</b>. Every bed has a <b>monitor</b> that shows heart rate and blood pressure and beeps when a number goes outside the normal range. That is <b>network monitoring</b>: normal ranges are the <b>baseline</b>, the beep is an <b>alert</b>. No doctor changes a treatment without writing it down and getting it approved, which is <b>change management</b>. And the hospital has a backup generator, a second operating theatre and regular fire drills. That is <b>disaster recovery and high availability</b>, and the drills are <b>DR testing</b>.</p>
<p>A network team works exactly the same way. Without charts, the night-shift engineer cannot tell which cable goes where. Without monitors, the first alarm is an angry call from the sales director. Without change control, a well-meant fix at 5 p.m. takes down the whole branch. Without a DR plan, one flood ends the company.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="The three pillars of network operations">
<rect x="10" y="10" width="620" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Network operations: keep it known, watched and recoverable</text>
<rect x="10" y="64" width="200" height="130" rx="8" fill="#bae6fd"/><text x="110" y="88" text-anchor="middle" class="svg-ink" font-size="14">3.1 Processes</text>
<text x="110" y="112" text-anchor="middle" class="svg-muted" font-size="12">Diagrams, inventory, IPAM</text>
<text x="110" y="132" text-anchor="middle" class="svg-muted" font-size="12">SLA, heat maps</text>
<text x="110" y="152" text-anchor="middle" class="svg-muted" font-size="12">Life cycle, patches</text>
<text x="110" y="172" text-anchor="middle" class="svg-muted" font-size="12">Change and config mgmt</text>
<rect x="220" y="64" width="200" height="130" rx="8" fill="#bbf7d0"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="14">3.2 Monitoring</text>
<text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">SNMP, syslog, SIEM</text>
<text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">Flow data, packet capture</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">Port mirroring, APIs</text>
<text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">Baselines and alerts</text>
<rect x="430" y="64" width="200" height="130" rx="8" fill="#fed7aa"/><text x="530" y="88" text-anchor="middle" class="svg-ink" font-size="14">3.3 Recovery</text>
<text x="530" y="112" text-anchor="middle" class="svg-muted" font-size="12">RPO, RTO</text>
<text x="530" y="132" text-anchor="middle" class="svg-muted" font-size="12">MTTR, MTBF</text>
<text x="530" y="152" text-anchor="middle" class="svg-muted" font-size="12">Cold, warm, hot sites</text>
<text x="530" y="172" text-anchor="middle" class="svg-muted" font-size="12">HA, DR testing</text>
<rect x="10" y="208" width="620" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="233" text-anchor="middle" class="svg-ink" font-size="14">Foundation: routers, switches, servers you already know how to build</text>
</svg><p class="cap">The module in one picture. Each pillar depends on the one before: you cannot monitor what is not documented, and you cannot recover what you never backed up.</p></div>

<h3>The lab network you will use</h3>
<p>The lab is a small office. <b>R1</b> is the office router with the management LAN 192.168.50.0/24 on Gi0/0 (address .1) and a point-to-point link 10.0.12.0/30 to <b>R2</b> on Gi0/1. R2 has two loopbacks: <b>Loopback0</b> 172.16.2.1 (its stable management identity) and <b>Loopback1</b> 172.16.2.65 (which you will shut down to simulate a failure). On the LAN sit the <b>NMS</b> (network management station) at 192.168.50.100 and an ordinary user <b>PC1</b> at 192.168.50.10. The NMS runs three receivers: a <b>syslog collector</b> on UDP 514, an <b>SNMP manager</b> that polls agents on UDP 161, and a <b>trap receiver</b> on UDP 162.</p>
<p>The CLI in the lab uses the industry-standard syntax found on most enterprise routers. The exam is vendor-neutral, so we always explain the concept first and then show how it looks on this CLI.</p>

<div class="eg"><p><b>Worked example: why numbers matter.</b> A router has a 1 Gbps uplink. The monitor polls its interface counters every 5 minutes. At 09:00 the counter reads 1,200,000,000 bytes; at 09:05 it reads 19,200,000,000 bytes. The difference is 18,000,000,000 bytes, which is 144,000,000,000 bits in 300 seconds, or 480 Mbps average: 48% utilisation. If the baseline for 09:00 on a weekday is 20%, that is worth an alert. You will do this maths again in chapter 8.</p></div>

<h3>How the chapters fit together</h3>
<ol>
<li>Documentation: physical and logical diagrams, rack diagrams, cable maps, layer 1/2/3 diagrams (chapter 2).</li>
<li>Asset inventory, IPAM, SLAs and wireless surveys (chapter 3).</li>
<li>Life-cycle, change and configuration management (chapter 4).</li>
<li>SNMP (chapter 5), syslog and SIEM (chapter 6), flow data, packet capture and port mirroring (chapter 7).</li>
<li>Baselines, alerting, APIs and monitoring solutions (chapter 8), then a troubleshooting workflow that walks through the lab (chapter 9).</li>
<li>Disaster recovery metrics and sites (chapter 10), high availability and DR testing (chapter 11), summary (chapter 12).</li>
</ol>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking monitoring is a tool you buy. A monitoring server that nobody configured, with no baseline and no one reading the alerts, is a decoration. Monitoring is a process: decide what normal looks like, collect the data, alert on deviation, and make sure a human acts on it.</p></div>

<div class="exam"><p><b>Exam trap.</b> Objective 3.x questions are often scenario-based: "Which document would help a technician find the switch port for desk 4B?" (a cable map or physical diagram, not a logical diagram). Always ask yourself which document or metric answers the exact question.</p></div>

<div class="scn"><h4>The unlabelled closet</h4><p>A logistics company lost connectivity on one floor after a cleaner knocked a patch cable loose. The on-call engineer drove in at midnight and found 96 unlabelled cables and no cable map. It took three hours of tracing with a toner to find the right port. Monitoring had noticed the switch uplink going down within seconds, but the alert went to a mailbox nobody read at night. After the incident, the team labelled both ends of every cable, created a cable map and routed critical alerts to the on-call phone.</p><p><b>Lesson:</b> documentation shortens the fix, monitoring shortens the time to notice, and both need a process behind them.</p></div>

<div class="iv"><p class="q">"What does network operations mean to you, beyond configuring devices?"</p><p>Strong answer: keeping the network known, watched and recoverable. Known means accurate diagrams, inventory and IPAM. Watched means SNMP, syslog and flow data feeding a monitoring system with baselines and alerts that a human acts on. Recoverable means backed-up configurations, change control with rollback plans, and a tested DR plan with agreed RPO and RTO. Mention one real example of each.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module covers N10-009 objectives 3.1 (processes), 3.2 (monitoring) and 3.3 (disaster recovery).</li>
<li>Documentation is the patient chart, monitoring is the bedside monitor, DR is the backup generator and the fire drill.</li>
<li>The lab: R1, R2 and an NMS that collects syslog (UDP 514), polls SNMP (UDP 161) and receives traps (UDP 162).</li>
<li>Monitoring only works with a baseline, alerts and people who act on them.</li>
<li>Exam questions test which document, protocol or metric fits a specific situation.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Network banana uski life ka sirf pehla din hai. Uske baad har din kisi ko pata hona chahiye ki kya kahan laga hai, kuch toote to notice karna (behtar ho ki users se pehle), sabit karna ki changes plan kiye gaye the, aur disaster ke baad business ko wapas chalana. Yeh module CompTIA Network+ N10-009 ke objectives <b>3.1</b> (organisational processes aur procedures: documentation, life-cycle, change aur configuration management), <b>3.2</b> (network monitoring technologies: SNMP, flow data, packet capture, baselines, log aggregation, API integration, port mirroring aur monitoring solutions) aur <b>3.3</b> (disaster recovery: RPO, RTO, MTTR, MTBF, DR sites, high availability aur DR testing) cover karta hai. Hands-on lab mein aap do routers se syslog aur SNMP traps ek network management station par bhejoge aur use ek router ko safely poll karne doge.</p>
<p><b>Prerequisites.</b> Aapko IPv4 addressing, TCP aur UDP ports ka idea (np-concepts, np-addressing), static routing (np-routing) aur DHCP, DNS aur NAT services (np-services) samajh aani chahiye. Monitoring ka koi experience nahi chahiye. Access control lists yahan sirf sabse simple form mein aati hain; np-security unhe detail mein sikhata hai, aur np-troubleshoot baad mein is module ke tools ko poori troubleshooting methodology ke andar use karta hai.</p>

<h3>Ek analogy: hospital ka ward</h3>
<p>Hospital ke ek ward ke baare mein socho. Har patient ke bed ke end par ek <b>chart</b> hota hai: woh kaun hai, kaunsi dawaiyan leta hai, kya kiya gaya aur kab. Yeh <b>documentation</b> hai. Har bed par ek <b>monitor</b> hota hai jo heart rate aur blood pressure dikhata hai aur number normal range se bahar jaaye to beep karta hai. Yeh <b>network monitoring</b> hai: normal ranges <b>baseline</b> hain, beep <b>alert</b> hai. Koi doctor treatment likhe aur approve karaye bina nahi badalta, yeh <b>change management</b> hai. Aur hospital ke paas backup generator, doosra operation theatre aur regular fire drills hoti hain. Yeh <b>disaster recovery aur high availability</b> hai, aur drills <b>DR testing</b> hain.</p>
<p>Network team bilkul aise hi kaam karti hai. Charts ke bina night-shift engineer bata nahi sakta ki kaunsa cable kahan jaata hai. Monitors ke bina pehla alarm sales director ka gusse wala call hota hai. Change control ke bina shaam 5 baje ka achhi niyat wala fix poori branch gira deta hai. DR plan ke bina ek baadh company khatam kar deti hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Network operations ke teen pillars">
<rect x="10" y="10" width="620" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Network operations: known, watched aur recoverable rakho</text>
<rect x="10" y="64" width="200" height="130" rx="8" fill="#bae6fd"/><text x="110" y="88" text-anchor="middle" class="svg-ink" font-size="14">3.1 Processes</text>
<text x="110" y="112" text-anchor="middle" class="svg-muted" font-size="12">Diagrams, inventory, IPAM</text>
<text x="110" y="132" text-anchor="middle" class="svg-muted" font-size="12">SLA, heat maps</text>
<text x="110" y="152" text-anchor="middle" class="svg-muted" font-size="12">Life cycle, patches</text>
<text x="110" y="172" text-anchor="middle" class="svg-muted" font-size="12">Change aur config mgmt</text>
<rect x="220" y="64" width="200" height="130" rx="8" fill="#bbf7d0"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="14">3.2 Monitoring</text>
<text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">SNMP, syslog, SIEM</text>
<text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">Flow data, packet capture</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">Port mirroring, APIs</text>
<text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">Baselines aur alerts</text>
<rect x="430" y="64" width="200" height="130" rx="8" fill="#fed7aa"/><text x="530" y="88" text-anchor="middle" class="svg-ink" font-size="14">3.3 Recovery</text>
<text x="530" y="112" text-anchor="middle" class="svg-muted" font-size="12">RPO, RTO</text>
<text x="530" y="132" text-anchor="middle" class="svg-muted" font-size="12">MTTR, MTBF</text>
<text x="530" y="152" text-anchor="middle" class="svg-muted" font-size="12">Cold, warm, hot sites</text>
<text x="530" y="172" text-anchor="middle" class="svg-muted" font-size="12">HA, DR testing</text>
<rect x="10" y="208" width="620" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="233" text-anchor="middle" class="svg-ink" font-size="14">Foundation: routers, switches, servers jo aap banana jaante ho</text>
</svg><p class="cap">Poora module ek picture mein. Har pillar pichhle par depend karta hai: jo documented nahi hai use monitor nahi kar sakte, aur jiska backup kabhi liya hi nahi use recover nahi kar sakte.</p></div>

<h3>Lab network jo aap use karoge</h3>
<p>Lab ek chhota office hai. <b>R1</b> office router hai jiske Gi0/0 par management LAN 192.168.50.0/24 (address .1) hai aur Gi0/1 par <b>R2</b> tak point-to-point link 10.0.12.0/30. R2 ke do loopbacks hain: <b>Loopback0</b> 172.16.2.1 (uski stable management identity) aur <b>Loopback1</b> 172.16.2.65 (jise aap failure simulate karne ke liye shut down karoge). LAN par <b>NMS</b> (network management station) 192.168.50.100 par aur ek normal user <b>PC1</b> 192.168.50.10 par baitha hai. NMS teen receivers chalata hai: UDP 514 par <b>syslog collector</b>, ek <b>SNMP manager</b> jo agents ko UDP 161 par poll karta hai, aur UDP 162 par <b>trap receiver</b>.</p>
<p>Lab ka CLI industry-standard syntax use karta hai jo zyada tar enterprise routers par milta hai. Exam vendor-neutral hai, isliye hum hamesha pehle concept samjhayenge aur phir dikhayenge ki is CLI par woh kaisa dikhta hai.</p>

<div class="eg"><p><b>Worked example: numbers kyun matter karte hain.</b> Ek router ka 1 Gbps uplink hai. Monitor har 5 minute mein uske interface counters poll karta hai. 09:00 par counter 1,200,000,000 bytes padhta hai; 09:05 par 19,200,000,000 bytes. Farak 18,000,000,000 bytes hai, yaani 300 seconds mein 144,000,000,000 bits, ya average 480 Mbps: 48% utilisation. Agar weekday 09:00 ka baseline 20% hai, to yeh alert ke laayak hai. Yeh maths aap chapter 8 mein phir karoge.</p></div>

<h3>Chapters aapas mein kaise jude hain</h3>
<ol>
<li>Documentation: physical aur logical diagrams, rack diagrams, cable maps, layer 1/2/3 diagrams (chapter 2).</li>
<li>Asset inventory, IPAM, SLAs aur wireless surveys (chapter 3).</li>
<li>Life-cycle, change aur configuration management (chapter 4).</li>
<li>SNMP (chapter 5), syslog aur SIEM (chapter 6), flow data, packet capture aur port mirroring (chapter 7).</li>
<li>Baselines, alerting, APIs aur monitoring solutions (chapter 8), phir ek troubleshooting workflow jo lab ko step by step chalata hai (chapter 9).</li>
<li>Disaster recovery metrics aur sites (chapter 10), high availability aur DR testing (chapter 11), summary (chapter 12).</li>
</ol>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki monitoring ek tool hai jo khareeda jaata hai. Ek monitoring server jise kisi ne configure nahi kiya, jiska koi baseline nahi, aur jiske alerts koi nahi padhta, sirf decoration hai. Monitoring ek process hai: tay karo ki normal kaisa dikhta hai, data collect karo, deviation par alert karo, aur pakka karo ki koi insaan us par action le.</p></div>

<div class="exam"><p><b>Exam trap.</b> Objective 3.x ke sawaal aksar scenario-based hote hain: "Desk 4B ka switch port dhoondhne mein technician ki madad kaunsa document karega?" (cable map ya physical diagram, logical diagram nahi). Hamesha khud se poocho ki kaunsa document ya metric exact sawaal ka jawab deta hai.</p></div>

<div class="scn"><h4>Bina label wala closet</h4><p>Ek logistics company ki ek floor ki connectivity tab chali gayi jab safai karne wale se ek patch cable dheela ho gaya. On-call engineer aadhi raat ko drive karke aaya aur use 96 bina label ke cables mile aur koi cable map nahi. Toner se trace karke sahi port dhoondhne mein teen ghante lage. Monitoring ne switch uplink down hote hi seconds mein notice kar liya tha, lekin alert ek aise mailbox mein gaya jise raat ko koi nahi padhta tha. Incident ke baad team ne har cable ke dono ends par label lagaye, ek cable map banaya aur critical alerts on-call phone par route kiye.</p><p><b>Seekh:</b> documentation fix ko chhota karta hai, monitoring notice karne ka time chhota karti hai, aur dono ke peeche ek process chahiye.</p></div>

<div class="iv"><p class="q">"Devices configure karne ke alawa aapke liye network operations ka matlab kya hai?"</p><p>Strong answer: network ko known, watched aur recoverable rakhna. Known matlab sahi diagrams, inventory aur IPAM. Watched matlab SNMP, syslog aur flow data ek monitoring system mein jaate hain jahan baselines aur alerts hain jin par insaan action leta hai. Recoverable matlab backed-up configurations, rollback plans ke saath change control, aur agreed RPO aur RTO wala tested DR plan. Har ek ka ek real example do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module N10-009 ke objectives 3.1 (processes), 3.2 (monitoring) aur 3.3 (disaster recovery) cover karta hai.</li>
<li>Documentation patient ka chart hai, monitoring bed ka monitor, DR backup generator aur fire drill.</li>
<li>Lab: R1, R2 aur ek NMS jo syslog collect karta hai (UDP 514), SNMP poll karta hai (UDP 161) aur traps receive karta hai (UDP 162).</li>
<li>Monitoring sirf baseline, alerts aur un par action lene wale logon ke saath kaam karti hai.</li>
<li>Exam ke sawaal test karte hain ki kaunsa document, protocol ya metric kisi specific situation mein fit hota hai.</li>
</ul></div>
`}};export{e as default};