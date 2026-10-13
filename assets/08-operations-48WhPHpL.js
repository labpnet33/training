var e={id:`operations`,h:{en:`Running a data center day to day: NOC, monitoring, tickets and changes`,hi:`Data center ko roz chalana: NOC, monitoring, tickets aur changes`},body:{en:`
<p>A hospital is not only surgeons. It runs on nurses watching monitors, shift handovers, patient files, checklists before every operation and a clear process when something goes wrong. A data center is the same. Building the fabric is maybe 10% of the job; <b>operating it safely for years</b> is the other 90%. This chapter shows you how that work is organised, because it is exactly what your first data center job will look like.</p>

<h3>Who does what: the NOC and its levels</h3>
<ul>
<li><b>NOC</b> (network operations center): the team that watches the infrastructure 24x7, usually in shifts, with dashboards on the wall.</li>
<li><b>L1</b>: watches alerts, acknowledges them, runs first checks from runbooks, opens and routes tickets, coordinates <b>remote hands</b> (colocation staff who can reseat a cable or swap an optic).</li>
<li><b>L2</b>: deeper troubleshooting, executes approved changes, owns most incidents.</li>
<li><b>L3 / engineering</b>: design, complex problems, root cause analysis, new builds and automation.</li>
<li>Alongside: facilities (power and cooling), server and virtualization, storage, security and application teams.</li>
</ul>

<h3>Monitoring: how you know something is wrong</h3>
<dl class="terms">
<dt>SNMP</dt><dd>Simple Network Management Protocol. The monitoring server <b>polls</b> devices on UDP 161 for counters (interface traffic, errors, CPU) identified by <b>OIDs</b> defined in <b>MIBs</b>. Devices can also send <b>traps</b> on UDP 162 when something happens. Use <b>SNMPv3</b>, which adds authentication and encryption.</dd>
<dt>Syslog</dt><dd>Devices send event messages (link down, neighbor lost, fan failure) to a central syslog server, traditionally on UDP 514. Each message has a <b>severity</b> from 0 (emergencies) to 7 (debugging): 0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational, 7 debugging.</dd>
<dt>Streaming telemetry</dt><dd>Instead of being polled every few minutes, the switch <b>pushes</b> structured data (based on YANG models) every few seconds, often over gRPC/gNMI. Much finer detail, far less load than heavy SNMP polling.</dd>
<dt>Flow data</dt><dd>NetFlow/IPFIX records who talked to whom, how much and on which ports, useful for capacity planning and security.</dd>
<dt>NTP</dt><dd>Every device must have the same accurate time, or you cannot correlate logs from different switches during an incident.</dd>
</dl>

<pre class="code"><span class="c">! Typical NX-OS monitoring baseline, all through the management VRF</span>
ntp server 10.99.0.10 use-vrf management
logging server 10.99.0.20 5 use-vrf management
snmp-server user nocmon network-operator auth sha Str0ngAuthPass priv aes-128 Str0ngPrivPass</pre>
<pre class="out">2026 Sep 29 02:14:07 LEAF-03 %ETHPORT-5-IF_DOWN_LINK_FAILURE: Interface Ethernet1/49 is down (Link failure)
<span class="hl">2026 Sep 29 02:14:07 LEAF-03 %OSPF-5-ADJCHANGE: ospf-UNDERLAY [1234] Nbr 10.0.0.1 on Ethernet1/49 went DOWN</span></pre>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="From device event to engineer">
<rect x="10" y="40" width="110" height="40" rx="8" fill="#bae6fd"/><text x="65" y="65" text-anchor="middle" class="svg-ink" font-size="13">Switch event</text>
<rect x="140" y="40" width="110" height="40" rx="8" fill="#ddd6fe"/><text x="195" y="65" text-anchor="middle" class="svg-ink" font-size="13">Collector</text>
<rect x="270" y="40" width="110" height="40" rx="8" fill="#fde68a"/><text x="325" y="65" text-anchor="middle" class="svg-ink" font-size="13">Alert</text>
<rect x="400" y="40" width="110" height="40" rx="8" fill="#fed7aa"/><text x="455" y="65" text-anchor="middle" class="svg-ink" font-size="13">Ticket</text>
<rect x="530" y="40" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="580" y="65" text-anchor="middle" class="svg-ink" font-size="13">Engineer</text>
<line x1="120" y1="60" x2="140" y2="60" stroke="#64748b" stroke-width="2"/><line x1="250" y1="60" x2="270" y2="60" stroke="#64748b" stroke-width="2"/><line x1="380" y1="60" x2="400" y2="60" stroke="#64748b" stroke-width="2"/><line x1="510" y1="60" x2="530" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="195" y="25" text-anchor="middle" class="svg-muted" font-size="12">SNMP, syslog, telemetry</text>
<text x="390" y="105" text-anchor="middle" class="svg-accent" font-size="12">thresholds and rules decide what becomes a ticket</text>
</svg><p class="cap">Data flows from devices to a collector; rules turn the important events into alerts and tickets.</p></div>

<p>Read a syslog line from left to right: timestamp, device, facility, <b>severity number</b>, mnemonic, then the human message. Here, severity 5 events tell you an uplink failed and the OSPF neighbor on it went down. Because the leaf has a second uplink, traffic continues; the ticket is still urgent because redundancy is gone.</p>

<h3>Tickets: incident, problem and change</h3>
<table class="cmp"><tr><th>Type</th><th>Meaning</th><th>Goal</th><th>Example</th></tr>
<tr><td><b>Incident</b></td><td>Unplanned interruption or degradation of a service</td><td>Restore service as fast as possible</td><td>Rack 12 servers lost connectivity</td></tr>
<tr><td><b>Problem</b></td><td>The underlying cause of one or more incidents</td><td>Find and remove the root cause</td><td>Why do optics from one batch keep failing?</td></tr>
<tr><td><b>Change</b></td><td>A planned modification to production</td><td>Make it safely, approved and reversible</td><td>Add VLAN 30 to the ESX cluster trunks</td></tr>
</table>
<p>Incidents get a <b>priority</b> (P1 critical, full outage, to P4 low). Changes are <b>standard</b> (pre-approved, low risk, repeatable), <b>normal</b> (reviewed and approved, often by a <b>change advisory board</b>, CAB) or <b>emergency</b> (urgent fix, approved quickly, reviewed afterwards).</p>

<h3>Change management, MOPs and rollback</h3>
<p>Risky changes happen in a <b>maintenance window</b>, a pre-agreed low-traffic time such as Sunday 01:00 to 04:00. Every change has a <b>MOP</b> (method of procedure) that someone else could follow:</p>
<ol>
<li><b>Pre-checks</b>: capture the current state (interfaces up, neighbors, routes, MAC counts).</li>
<li><b>Implementation steps</b>: exact commands, device by device.</li>
<li><b>Verification</b>: the same checks again, plus an application test with the owner.</li>
<li><b>Rollback plan</b>: exact steps to undo, and the time by which you must decide to roll back.</li>
<li><b>Communication</b>: who to inform at start, end, and if something goes wrong.</li>
</ol>
<p>NX-OS makes rollback easy with checkpoints:</p>
<pre class="code"><span class="c">! before the change</span>
checkpoint PRE-CHG-4521
<span class="c">! ... make the change, verify ...</span>
<span class="c">! if verification fails</span>
rollback running-config checkpoint PRE-CHG-4521</pre>

<div class="eg"><p><b>Worked example: fitting a change in a window.</b> Window: 01:00 to 04:00 (180 minutes). Pre-checks 20 min, implementation on 8 leaves at 10 min each = 80 min, verification 30 min. Total 130 min, which leaves 50 minutes. Rollback takes 30 minutes, so the <b>go/no-go point</b> is 04:00 − 30 = 03:30. If verification is not clean by 03:30, you roll back, even if you "almost" have it.</p></div>

<h3>Documentation: the memory of the data center</h3>
<ul>
<li><b>IPAM</b> (IP address management): every subnet, VLAN, VRF and reserved address.</li>
<li><b>Rack elevations</b> and <b>cable plans</b> (which port goes where), ideally in a DCIM tool.</li>
<li>Logical and physical <b>diagrams</b>, kept current.</li>
<li><b>Runbooks</b> for common alerts, and automatic <b>configuration backups</b> after every change.</li>
</ul>

<h3>A day in the life of a DC network engineer</h3>
<p><b>09:00</b> shift handover: two open incidents, one change tonight. <b>09:30</b> review overnight alerts: a flapping optic on LEAF-07, so raise a remote-hands ticket to replace it. <b>11:00</b> peer review a colleague's MOP. <b>14:00</b> new rack request from the server team: allocate ports, VLANs and IPs in IPAM, update the cable plan. <b>16:00</b> problem review on last week's outage. <b>01:00</b> maintenance window: checkpoint, change, verify, close the ticket with evidence.</p>

<div class="warn"><p><b>Common mistakes.</b> Making "quick" changes with no ticket or MOP. No rollback plan, or no time left in the window to use it. Devices with wrong clocks, which makes log correlation impossible. Alert fatigue: hundreds of noisy alerts so the real one is missed.</p></div>
<div class="exam"><p><b>Exam and interview tip.</b> Incident = restore service; problem = root cause; change = planned and approved. Syslog severity 0 is the most severe and 7 is debugging. SNMP polls use UDP 161, traps UDP 162; telemetry is push-based.</p></div>

<div class="scn"><h4>The change that outlived its window</h4><p>An engineer was upgrading a pair of border leaves. The first switch took longer to boot than the lab had suggested, and at 03:40 BGP to one ISP was still down. There was no written go/no-go time and no one wanted to "give up". At 04:30 the business day started in another region and customers noticed. The post-incident review added a mandatory go/no-go time to every MOP, a lab-measured duration for each step, and a rule that the change manager, not the implementer, decides on rollback.</p><p><b>Lesson:</b> a rollback plan is only useful if the time to use it is protected.</p></div>

<div class="iv"><p class="q">"What is the difference between an incident and a problem?"</p><p>Strong answer: an incident is an unplanned interruption; the goal is to restore service quickly, even with a workaround. A problem is the underlying cause of one or more incidents; problem management finds and fixes the root cause so it does not recur. Example: reseating a flapping optic closes the incident; discovering a faulty optic batch and replacing all of them resolves the problem. Mention that the permanent fix is itself done through change management.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The NOC runs 24x7 with L1, L2 and L3 roles plus remote hands and partner teams.</li>
<li>Monitoring uses SNMP (poll 161, traps 162, prefer v3), syslog with severities 0 to 7, streaming telemetry and flow data, all with NTP time.</li>
<li>Incident = restore, problem = root cause, change = planned and approved.</li>
<li>Every change needs a MOP with pre-checks, steps, verification, rollback and a go/no-go time; NX-OS checkpoints make rollback fast.</li>
<li>IPAM, rack elevations, cable plans and config backups are the memory of the data center.</li>
</ul></div>
`,hi:`
<p>Hospital sirf surgeons nahi hota. Woh nurses par chalta hai jo monitors dekhti hain, shift handovers par, patient files par, har operation se pehle checklists par, aur kuch galat hone par ek saaf process par. Data center bhi aisa hi hai. Fabric banana shayad kaam ka 10% hai; <b>use saalon tak safely chalana</b> baaki 90% hai. Yeh chapter dikhata hai ki woh kaam kaise organise hota hai, kyunki aapki pehli data center job bilkul aisi hi dikhegi.</p>

<h3>Kaun kya karta hai: NOC aur uske levels</h3>
<ul>
<li><b>NOC</b> (network operations center): woh team jo infrastructure ko 24x7 dekhti hai, aam taur par shifts mein, deewar par dashboards ke saath.</li>
<li><b>L1</b>: alerts dekhta hai, unhe acknowledge karta hai, runbooks se pehli checks chalata hai, tickets kholta aur route karta hai, <b>remote hands</b> ko coordinate karta hai (colocation staff jo cable reseat ya optic swap kar sakta hai).</li>
<li><b>L2</b>: gehri troubleshooting, approved changes execute karta hai, zyada tar incidents ka owner hota hai.</li>
<li><b>L3 / engineering</b>: design, complex problems, root cause analysis, naye builds aur automation.</li>
<li>Saath mein: facilities (power aur cooling), server aur virtualization, storage, security aur application teams.</li>
</ul>

<h3>Monitoring: aapko kaise pata chalta hai ki kuch galat hai</h3>
<dl class="terms">
<dt>SNMP</dt><dd>Simple Network Management Protocol. Monitoring server devices ko UDP 161 par counters (interface traffic, errors, CPU) ke liye <b>poll</b> karta hai, jo <b>MIBs</b> mein defined <b>OIDs</b> se pehchaane jaate hain. Kuch hone par devices UDP 162 par <b>traps</b> bhi bhej sakte hain. <b>SNMPv3</b> use karo, jo authentication aur encryption jodta hai.</dd>
<dt>Syslog</dt><dd>Devices event messages (link down, neighbor lost, fan failure) ek central syslog server ko bhejte hain, traditionally UDP 514 par. Har message ki ek <b>severity</b> hoti hai 0 (emergencies) se 7 (debugging) tak: 0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational, 7 debugging.</dd>
<dt>Streaming telemetry</dt><dd>Har kuch minute mein poll hone ke bajaye, switch har kuch seconds mein structured data (YANG models par based) <b>push</b> karta hai, aksar gRPC/gNMI par. Kaafi zyada detail, aur bhaari SNMP polling se kahin kam load.</dd>
<dt>Flow data</dt><dd>NetFlow/IPFIX record karta hai ki kisne kisse baat ki, kitni aur kin ports par, jo capacity planning aur security ke liye useful hai.</dd>
<dt>NTP</dt><dd>Har device ka time same aur accurate hona chahiye, warna incident ke dauraan alag switches ke logs correlate karna namumkin hai.</dd>
</dl>

<pre class="code"><span class="c">! Typical NX-OS monitoring baseline, sab management VRF ke through</span>
ntp server 10.99.0.10 use-vrf management
logging server 10.99.0.20 5 use-vrf management
snmp-server user nocmon network-operator auth sha Str0ngAuthPass priv aes-128 Str0ngPrivPass</pre>
<pre class="out">2026 Sep 29 02:14:07 LEAF-03 %ETHPORT-5-IF_DOWN_LINK_FAILURE: Interface Ethernet1/49 is down (Link failure)
<span class="hl">2026 Sep 29 02:14:07 LEAF-03 %OSPF-5-ADJCHANGE: ospf-UNDERLAY [1234] Nbr 10.0.0.1 on Ethernet1/49 went DOWN</span></pre>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Device event se engineer tak">
<rect x="10" y="40" width="110" height="40" rx="8" fill="#bae6fd"/><text x="65" y="65" text-anchor="middle" class="svg-ink" font-size="13">Switch event</text>
<rect x="140" y="40" width="110" height="40" rx="8" fill="#ddd6fe"/><text x="195" y="65" text-anchor="middle" class="svg-ink" font-size="13">Collector</text>
<rect x="270" y="40" width="110" height="40" rx="8" fill="#fde68a"/><text x="325" y="65" text-anchor="middle" class="svg-ink" font-size="13">Alert</text>
<rect x="400" y="40" width="110" height="40" rx="8" fill="#fed7aa"/><text x="455" y="65" text-anchor="middle" class="svg-ink" font-size="13">Ticket</text>
<rect x="530" y="40" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="580" y="65" text-anchor="middle" class="svg-ink" font-size="13">Engineer</text>
<line x1="120" y1="60" x2="140" y2="60" stroke="#64748b" stroke-width="2"/><line x1="250" y1="60" x2="270" y2="60" stroke="#64748b" stroke-width="2"/><line x1="380" y1="60" x2="400" y2="60" stroke="#64748b" stroke-width="2"/><line x1="510" y1="60" x2="530" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="195" y="25" text-anchor="middle" class="svg-muted" font-size="12">SNMP, syslog, telemetry</text>
<text x="390" y="105" text-anchor="middle" class="svg-accent" font-size="12">thresholds aur rules tay karte hain ki kya ticket banega</text>
</svg><p class="cap">Data devices se collector tak jaata hai; rules zaroori events ko alerts aur tickets mein badalte hain.</p></div>

<p>Syslog line ko left se right padho: timestamp, device, facility, <b>severity number</b>, mnemonic, phir insaan ke padhne wala message. Yahan severity 5 events batate hain ki ek uplink fail hua aur us par OSPF neighbor down ho gaya. Kyunki leaf ka dusra uplink hai, traffic chalta rehta hai; phir bhi ticket urgent hai kyunki redundancy chali gayi hai.</p>

<h3>Tickets: incident, problem aur change</h3>
<table class="cmp"><tr><th>Type</th><th>Matlab</th><th>Goal</th><th>Example</th></tr>
<tr><td><b>Incident</b></td><td>Service ka unplanned interruption ya degradation</td><td>Service jitni jaldi ho sake restore karna</td><td>Rack 12 ke servers ki connectivity chali gayi</td></tr>
<tr><td><b>Problem</b></td><td>Ek ya zyada incidents ka underlying cause</td><td>Root cause dhoondh kar hatana</td><td>Ek batch ke optics baar baar fail kyun ho rahe hain?</td></tr>
<tr><td><b>Change</b></td><td>Production mein planned modification</td><td>Ise safely, approved aur reversible tareeke se karna</td><td>ESX cluster trunks mein VLAN 30 jodna</td></tr>
</table>
<p>Incidents ko ek <b>priority</b> milti hai (P1 critical, full outage, se P4 low tak). Changes <b>standard</b> (pre-approved, low risk, repeatable), <b>normal</b> (review aur approve hote hain, aksar <b>change advisory board</b>, CAB, dwara) ya <b>emergency</b> (urgent fix, jaldi approve, baad mein review) hote hain.</p>

<h3>Change management, MOPs aur rollback</h3>
<p>Risky changes <b>maintenance window</b> mein hote hain, ek pehle se agreed kam-traffic wala time jaise Sunday 01:00 se 04:00. Har change ka ek <b>MOP</b> (method of procedure) hota hai jise koi dusra bhi follow kar sake:</p>
<ol>
<li><b>Pre-checks</b>: current state capture karo (interfaces up, neighbors, routes, MAC counts).</li>
<li><b>Implementation steps</b>: exact commands, device by device.</li>
<li><b>Verification</b>: wahi checks dobara, plus owner ke saath application test.</li>
<li><b>Rollback plan</b>: undo karne ke exact steps, aur woh time jab tak aapko rollback ka faisla lena hi hai.</li>
<li><b>Communication</b>: start, end par aur kuch galat hone par kise inform karna hai.</li>
</ol>
<p>NX-OS checkpoints se rollback aasaan banata hai:</p>
<pre class="code"><span class="c">! change se pehle</span>
checkpoint PRE-CHG-4521
<span class="c">! ... change karo, verify karo ...</span>
<span class="c">! agar verification fail ho</span>
rollback running-config checkpoint PRE-CHG-4521</pre>

<div class="eg"><p><b>Worked example: change ko window mein fit karna.</b> Window: 01:00 se 04:00 (180 minute). Pre-checks 20 min, 8 leaves par implementation har ek 10 min = 80 min, verification 30 min. Total 130 min, yaani 50 minute bachte hain. Rollback mein 30 minute lagte hain, isliye <b>go/no-go point</b> 04:00 − 30 = 03:30 hai. Agar 03:30 tak verification clean nahi hai, to aap rollback karte ho, chahe aap "lagbhag" pahunch gaye ho.</p></div>

<h3>Documentation: data center ki yaaddaasht</h3>
<ul>
<li><b>IPAM</b> (IP address management): har subnet, VLAN, VRF aur reserved address.</li>
<li><b>Rack elevations</b> aur <b>cable plans</b> (kaunsa port kahan jaata hai), ideally ek DCIM tool mein.</li>
<li>Logical aur physical <b>diagrams</b>, up to date.</li>
<li>Common alerts ke liye <b>runbooks</b>, aur har change ke baad automatic <b>configuration backups</b>.</li>
</ul>

<h3>DC network engineer ki zindagi ka ek din</h3>
<p><b>09:00</b> shift handover: do open incidents, aaj raat ek change. <b>09:30</b> raat ke alerts review: LEAF-07 par ek flapping optic, to use replace karne ke liye remote-hands ticket raise karo. <b>11:00</b> ek colleague ke MOP ka peer review. <b>14:00</b> server team se naye rack ki request: ports, VLANs aur IPAM mein IPs allocate karo, cable plan update karo. <b>16:00</b> pichhle hafte ke outage par problem review. <b>01:00</b> maintenance window: checkpoint, change, verify, evidence ke saath ticket close.</p>

<div class="warn"><p><b>Common galtiyan.</b> Bina ticket ya MOP ke "quick" changes karna. Koi rollback plan nahi, ya use use karne ke liye window mein time hi nahi bacha. Galat clocks wale devices, jisse log correlation namumkin ho jaata hai. Alert fatigue: sainkdon noisy alerts jinmein asli alert chhoot jaata hai.</p></div>
<div class="exam"><p><b>Exam aur interview tip.</b> Incident = service restore; problem = root cause; change = planned aur approved. Syslog severity 0 sabse severe hai aur 7 debugging. SNMP polls UDP 161 use karte hain, traps UDP 162; telemetry push-based hai.</p></div>

<div class="scn"><h4>Woh change jo apni window se lamba chala</h4><p>Ek engineer border leaves ka pair upgrade kar raha tha. Pehla switch lab ke andaaze se zyada der mein boot hua, aur 03:40 par ek ISP ke saath BGP abhi bhi down tha. Koi likha hua go/no-go time nahi tha aur koi "haar maanna" nahi chahta tha. 04:30 par dusre region mein business day shuru hua aur customers ko pata chal gaya. Post-incident review ne har MOP mein mandatory go/no-go time, har step ki lab-measured duration, aur yeh rule joda ki rollback ka faisla implementer nahi, change manager lega.</p><p><b>Seekh:</b> rollback plan tabhi kaam ka hai jab use use karne ka time protected ho.</p></div>

<div class="iv"><p class="q">"Incident aur problem mein kya farak hai?"</p><p>Strong answer: incident ek unplanned interruption hai; goal service ko jaldi restore karna hai, chahe workaround se. Problem ek ya zyada incidents ka underlying cause hai; problem management root cause dhoondh kar theek karta hai taaki woh dobara na ho. Example: flapping optic reseat karne se incident close hota hai; kharaab optic batch pakad kar sab replace karne se problem resolve hoti hai. Batao ki permanent fix bhi change management ke through hi hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NOC 24x7 chalta hai L1, L2 aur L3 roles ke saath, plus remote hands aur partner teams.</li>
<li>Monitoring SNMP (poll 161, traps 162, v3 prefer karo), 0 se 7 severities wala syslog, streaming telemetry aur flow data use karti hai, sab NTP time ke saath.</li>
<li>Incident = restore, problem = root cause, change = planned aur approved.</li>
<li>Har change ko pre-checks, steps, verification, rollback aur go/no-go time wala MOP chahiye; NX-OS checkpoints rollback ko fast banate hain.</li>
<li>IPAM, rack elevations, cable plans aur config backups data center ki yaaddaasht hain.</li>
</ul></div>
`}};export{e as default};