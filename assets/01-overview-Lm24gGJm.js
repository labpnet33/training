var e={id:`overview`,h:{en:`FortiGate high availability: what you will learn and the big picture`,hi:`FortiGate high availability: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how two FortiGate firewalls become one logical firewall using the <b>FortiGate Clustering Protocol (FGCP)</b>: the difference between active-passive and active-active, what heartbeat links do, how the cluster picks its primary unit, what is synchronised (configuration and sessions) and what is not, how to build a cluster, how to test a failover safely, and how to troubleshoot a cluster that is out of sync. This covers the high availability objectives of the Fortinet NSE 4 / FortiOS Administrator 7.6 exam.</p>
<p><b>Prerequisites.</b> You should be comfortable with the FortiGate basics from the <b>nse4-setup</b> module (interfaces, admin access, the CLI) and with firewall policies from <b>nse4-policy</b>. If you have met firewall failover on another vendor, <b>sec-asa-ha</b> is a good comparison, but it is not required.</p>
<div class="note"><p><b>Honest note about practice.</b> The simulator does not yet have an FGCP lab. The configuration in this module is labelled <b>Reference configuration (not run in the simulator)</b>. Practise the surrounding skills in nse4-setup and nse4-policy, and compare the ideas with sec-asa-ha.</p></div>

<h3>Analogy: two pilots, one aeroplane</h3>
<p>A long-haul flight has a captain and a first officer. Both know the route, both have the same checklists, and both watch the instruments. Only the captain flies. If the captain becomes unwell, the first officer takes the controls within seconds and the passengers barely notice. FGCP works the same way. Two identical FortiGates share one configuration and one set of virtual addresses. One is the <b>primary</b> (captain) and handles traffic. The other is the <b>secondary</b> (first officer), kept up to date and ready to take over.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Two FortiGates in an HA cluster">
<rect x="40" y="20" width="150" height="50" rx="10" fill="#bae6fd"/><text x="115" y="50" text-anchor="middle" class="svg-ink" font-size="13">Switch / ISP side</text>
<rect x="450" y="20" width="150" height="50" rx="10" fill="#bae6fd"/><text x="525" y="50" text-anchor="middle" class="svg-ink" font-size="13">Switch / LAN side</text>
<rect x="150" y="110" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="215" y="138" text-anchor="middle" class="svg-ink" font-size="13">FGT-A</text><text x="215" y="158" text-anchor="middle" class="svg-muted" font-size="12">primary</text>
<rect x="360" y="110" width="130" height="60" rx="10" fill="#fde68a"/><text x="425" y="138" text-anchor="middle" class="svg-ink" font-size="13">FGT-B</text><text x="425" y="158" text-anchor="middle" class="svg-muted" font-size="12">secondary</text>
<line x1="280" y1="140" x2="360" y2="140" stroke="#64748b" stroke-width="3"/><text x="320" y="132" text-anchor="middle" class="svg-accent" font-size="12">heartbeat</text>
<line x1="115" y1="70" x2="190" y2="110" stroke="#64748b" stroke-width="2"/><line x1="115" y1="70" x2="390" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="525" y1="70" x2="250" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="525" y1="70" x2="460" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Both units connect to both networks; one virtual MAC and IP is used</text>
</svg><p class="cap">Two units, same configuration, heartbeat between them, shared virtual addresses.</p></div>

<h3>What problem does HA solve?</h3>
<p>A single firewall is a single point of failure. Power supplies fail, fans fail, upgrades need reboots. If one box carries the whole office, every failure is an outage. With <b>high availability (HA)</b> you buy a second box so that one failure causes at most a short interruption. For a company like a training business with live classes, an outage during a batch costs real money, so a cluster is normal for any site that matters.</p>

<h3>The key ideas, in order</h3>
<ul>
<li><b>Cluster.</b> The group of FortiGates running FGCP together. Up to four units can join, though almost every real deployment uses two.</li>
<li><b>Primary and secondary.</b> The primary forwards traffic and owns the management configuration. In active-passive mode the secondary only waits. FortiOS also calls these units <b>members</b>; older documents say master and slave.</li>
<li><b>Heartbeat.</b> Small keep-alive frames sent between the units on dedicated links. When they stop, the cluster assumes a unit is gone.</li>
<li><b>Virtual MAC.</b> The cluster uses a virtual MAC address on each data interface, so neighbours do not have to relearn a new MAC after failover.</li>
<li><b>Synchronisation.</b> The primary pushes its configuration to the secondary. Optionally it also copies its session table, so existing connections survive a failover.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> HQ has FGT-A and FGT-B, same model, same FortiOS build, same licences. Port1 faces the internet switch, port2 faces the LAN switch, and port3 and port4 are cabled directly between the two units for heartbeat. FGT-A has a higher device priority, so it becomes primary. A user downloads a file through FGT-A. You pull the power on FGT-A. FGT-B notices the heartbeat loss, becomes primary, sends gratuitous ARP for the virtual MAC, and traffic resumes. If session pickup was on, the download carries on; if not, the user restarts it.</p></div>

<h3>Where HA sits in the exam</h3>
<p>The NSE 4 blueprint tests that you can <b>describe</b> the HA modes, <b>configure</b> an FGCP cluster, <b>explain</b> how the primary is chosen, <b>identify</b> what is synchronised, and <b>diagnose</b> a cluster that is not healthy. The next chapters follow that order, with a failover test and a troubleshooting workflow at the end.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Treating HA as a backup of the configuration. HA is live redundancy, not a backup. If you push a bad change to the primary, it is synchronised to the secondary within moments. Keep real configuration backups as well.</p></div>
<div class="exam"><p><b>Exam trap.</b> FGCP is different from FGSP (FortiGate Session Life Support Protocol), which only synchronises sessions between independently configured firewalls, and from VRRP, which gives gateway redundancy but not configuration sync. The question will say "cluster" and "heartbeat" when it means FGCP.</p></div>

<div class="scn"><h4>The firewall that took a whole weekend batch down</h4><p>A branch ran one FortiGate with live classes on Saturday. A power supply failed at 9 am and the replacement arrived on Monday. Students lost a full batch and refunds followed. The company then bought a second unit of the same model, built an active-passive cluster, and the next hardware fault cost a few seconds of packet loss that nobody noticed.</p><p><b>Lesson:</b> the cost of a second firewall is small next to one avoidable outage on a revenue day.</p></div>

<div class="iv"><p class="q">"What is FGCP and why would you use it?"</p><p>FGCP is the FortiGate Clustering Protocol. It lets two to four identical FortiGates work as one logical firewall with synchronised configuration, heartbeat monitoring, a virtual MAC and optional session synchronisation. I use it to remove the firewall as a single point of failure. I would also mention that it needs matching hardware, firmware and licensing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FGCP makes identical FortiGates behave as one logical firewall.</li>
<li>One unit is primary; others are secondary members.</li>
<li>Heartbeat links carry keep-alives, configuration sync and session sync.</li>
<li>The cluster uses virtual MAC addresses so neighbours need no relearning.</li>
<li>HA is redundancy, not a configuration backup.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki do FortiGate firewalls <b>FortiGate Clustering Protocol (FGCP)</b> se kaise ek logical firewall ban jaate hain: active-passive aur active-active mein difference, heartbeat links kya karte hain, cluster apna primary kaise chunta hai, kya synchronise hota hai (configuration aur sessions) aur kya nahi, cluster kaise banate hain, failover ko safely kaise test karte hain, aur out-of-sync cluster ko troubleshoot kaise karte hain. Yeh Fortinet NSE 4 / FortiOS Administrator 7.6 exam ke high availability objectives cover karta hai.</p>
<p><b>Prerequisites.</b> Aapko <b>nse4-setup</b> module ke FortiGate basics (interfaces, admin access, CLI) aur <b>nse4-policy</b> ke firewall policies aane chahiye. Agar aapne kisi aur vendor par firewall failover dekha hai to <b>sec-asa-ha</b> comparison ke liye achha hai, lekin zaroori nahi.</p>
<div class="note"><p><b>Practice ke baare mein seedhi baat.</b> Simulator mein abhi FGCP lab nahi hai. Is module ki configuration ko <b>Reference configuration (not run in the simulator)</b> likha gaya hai. Aas-paas ke skills nse4-setup aur nse4-policy mein practise karo, aur ideas ko sec-asa-ha se compare karo.</p></div>

<h3>Analogy: do pilots, ek aeroplane</h3>
<p>Long-haul flight mein captain aur first officer hote hain. Dono ko route pata hota hai, dono ke paas same checklists hain, aur dono instruments dekhte hain. Sirf captain udaata hai. Captain bimar ho jaaye to first officer kuch seconds mein controls sambhaal leta hai aur passengers ko lagbhag pata nahi chalta. FGCP bilkul aise hi kaam karta hai. Do identical FortiGates ek configuration aur ek virtual address set share karte hain. Ek <b>primary</b> (captain) traffic handle karta hai. Doosra <b>secondary</b> (first officer) up-to-date rehta hai aur takeover ke liye ready hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="HA cluster mein do FortiGates">
<rect x="40" y="20" width="150" height="50" rx="10" fill="#bae6fd"/><text x="115" y="50" text-anchor="middle" class="svg-ink" font-size="13">Switch / ISP side</text>
<rect x="450" y="20" width="150" height="50" rx="10" fill="#bae6fd"/><text x="525" y="50" text-anchor="middle" class="svg-ink" font-size="13">Switch / LAN side</text>
<rect x="150" y="110" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="215" y="138" text-anchor="middle" class="svg-ink" font-size="13">FGT-A</text><text x="215" y="158" text-anchor="middle" class="svg-muted" font-size="12">primary</text>
<rect x="360" y="110" width="130" height="60" rx="10" fill="#fde68a"/><text x="425" y="138" text-anchor="middle" class="svg-ink" font-size="13">FGT-B</text><text x="425" y="158" text-anchor="middle" class="svg-muted" font-size="12">secondary</text>
<line x1="280" y1="140" x2="360" y2="140" stroke="#64748b" stroke-width="3"/><text x="320" y="132" text-anchor="middle" class="svg-accent" font-size="12">heartbeat</text>
<line x1="115" y1="70" x2="190" y2="110" stroke="#64748b" stroke-width="2"/><line x1="115" y1="70" x2="390" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="525" y1="70" x2="250" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="525" y1="70" x2="460" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Dono units dono networks se jude hain; ek virtual MAC aur IP use hota hai</text>
</svg><p class="cap">Do units, same configuration, beech mein heartbeat, shared virtual addresses.</p></div>

<h3>HA kaun si problem solve karta hai?</h3>
<p>Ek akela firewall single point of failure hai. Power supply fail hoti hai, fan fail hote hain, upgrades ke liye reboot chahiye. Agar ek box poore office ko sambhaalta hai to har failure outage hai. <b>High availability (HA)</b> mein aap doosra box lete ho taaki ek failure se zyada se zyada chhota interruption ho. Live classes chalane wale training business ke liye batch ke beech outage ka matlab asli nuksaan hai, isliye jo bhi site important hai wahan cluster normal hai.</p>

<h3>Key ideas, kram se</h3>
<ul>
<li><b>Cluster.</b> FortiGates ka woh group jo FGCP saath chalate hain. Chaar units tak judd sakte hain, lekin lagbhag har real deployment mein do hi hote hain.</li>
<li><b>Primary aur secondary.</b> Primary traffic forward karta hai aur management configuration ka owner hota hai. Active-passive mode mein secondary sirf intezaar karta hai. FortiOS inhe <b>members</b> bhi kehta hai; purane documents mein master aur slave likha hota hai.</li>
<li><b>Heartbeat.</b> Units ke beech dedicated links par bheje jaane wale chhote keep-alive frames. Yeh ruk jaayein to cluster maan leta hai ki unit chala gaya.</li>
<li><b>Virtual MAC.</b> Cluster har data interface par virtual MAC address use karta hai, taaki failover ke baad neighbours ko naya MAC seekhna na pade.</li>
<li><b>Synchronisation.</b> Primary apni configuration secondary ko push karta hai. Optional roop se session table bhi copy karta hai, taaki failover ke baad existing connections bach jaayein.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> HQ mein FGT-A aur FGT-B hain, same model, same FortiOS build, same licences. Port1 internet switch ki taraf, port2 LAN switch ki taraf, aur port3 aur port4 heartbeat ke liye dono units ke beech seedhe cable kiye hain. FGT-A ki device priority zyada hai, isliye woh primary banta hai. Ek user FGT-A se file download karta hai. Aap FGT-A ki power kheench dete ho. FGT-B heartbeat loss dekhta hai, primary ban jaata hai, virtual MAC ke liye gratuitous ARP bhejta hai, aur traffic wapas chalne lagta hai. Session pickup on tha to download chalta rehta hai; nahi tha to user ko dobara shuru karna padta hai.</p></div>

<h3>Exam mein HA kahan aata hai</h3>
<p>NSE 4 blueprint test karta hai ki aap HA modes <b>describe</b> kar sako, FGCP cluster <b>configure</b> kar sako, primary kaise chuna jaata hai <b>explain</b> kar sako, kya synchronise hota hai <b>identify</b> kar sako, aur unhealthy cluster ko <b>diagnose</b> kar sako. Agle chapters isi kram mein chalte hain, aakhir mein failover test aur troubleshooting workflow ke saath.</p>

<div class="warn"><p><b>Common beginner mistake.</b> HA ko configuration ka backup samajhna. HA live redundancy hai, backup nahi. Primary par galat change push karoge to woh kuch hi der mein secondary par bhi sync ho jaata hai. Asli configuration backups alag se rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> FGCP, FGSP (FortiGate Session Life Support Protocol) se alag hai, jo sirf alag-alag configure kiye firewalls ke beech sessions sync karta hai, aur VRRP se bhi alag hai, jo gateway redundancy deta hai lekin configuration sync nahi. Question "cluster" aur "heartbeat" bole to matlab FGCP hai.</p></div>

<div class="scn"><h4>Jis firewall ne poora weekend batch gira diya</h4><p>Ek branch mein ek FortiGate chal raha tha aur Saturday ko live classes thi. Subah 9 baje power supply fail hui aur replacement Monday ko aaya. Students ka poora batch gaya aur refunds hue. Company ne phir same model ka doosra unit liya, active-passive cluster banaya, aur agli hardware fault par kuch seconds ka packet loss hua jise kisi ne notice nahi kiya.</p><p><b>Lesson:</b> doosre firewall ki keemat ek avoidable outage ke nuksaan ke saamne bahut chhoti hai.</p></div>

<div class="iv"><p class="q">"FGCP kya hai aur aap use kyun karoge?"</p><p>FGCP FortiGate Clustering Protocol hai. Isse do se chaar identical FortiGates ek logical firewall ki tarah kaam karte hain: synchronised configuration, heartbeat monitoring, virtual MAC aur optional session synchronisation ke saath. Main firewall ko single point of failure se hatane ke liye use karta hoon. Yeh bhi batata hoon ki isme matching hardware, firmware aur licensing chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FGCP identical FortiGates ko ek logical firewall ki tarah chalata hai.</li>
<li>Ek unit primary hota hai; baaki secondary members.</li>
<li>Heartbeat links keep-alives, configuration sync aur session sync le jaate hain.</li>
<li>Cluster virtual MAC use karta hai taaki neighbours ko relearn na karna pade.</li>
<li>HA redundancy hai, configuration backup nahi.</li>
</ul></div>
`}};export{e as default};