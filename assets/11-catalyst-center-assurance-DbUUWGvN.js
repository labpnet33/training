var e={id:`catalyst-center-assurance`,h:{en:`Cisco Catalyst Center (DNA Center) assurance`,hi:`Cisco Catalyst Center (DNA Center) assurance`},body:{en:`
<p>Everything in the previous chapters produces raw evidence: syslog lines, SNMP counters, flow records, SLA results. A NOC engineer with 2,000 devices cannot read all of it. Think of a car dashboard: the engine produces thousands of sensor readings, but the driver sees one fuel gauge, one temperature gauge and a warning light that says "check engine". <b>Cisco Catalyst Center</b> (called <b>DNA Center</b> until 2023, and still called that in the ENARSI blueprint) is the dashboard of the enterprise network, and its <b>Assurance</b> function turns telemetry into health scores, issues and guided troubleshooting. Blueprint item 4.7 asks you to use it at a describe-and-interpret level: connectivity, monitoring, device health and network health.</p>

<h3>Where the data comes from</h3>
<p>Assurance collects telemetry from managed devices with several mechanisms, many of which you already know:</p>
<ul>
<li><b>SNMP</b> polling and traps for inventory, counters, CPU and memory.</li>
<li><b>Syslog</b> for events such as link flaps and protocol adjacency changes.</li>
<li><b>NetFlow / Flexible NetFlow</b> for application and traffic visibility.</li>
<li><b>Model-driven streaming telemetry</b> on IOS XE devices, plus wireless controller telemetry for clients and access points.</li>
<li><b>Active tests</b>: IP SLA-style probes and wireless sensors that test like a real client.</li>
</ul>
<p>When a device is provisioned, Catalyst Center can push the telemetry settings itself (syslog server, SNMP trap receiver and NetFlow collector pointing at the appliance), from the network settings for that site. If a device was added without that telemetry, Assurance has little or nothing to show.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Assurance data flow">
<rect x="20" y="30" width="130" height="36" rx="8" fill="#e2e8f0"/><text x="85" y="53" text-anchor="middle" class="svg-ink" font-size="12">Routers, switches</text>
<rect x="20" y="92" width="130" height="36" rx="8" fill="#e2e8f0"/><text x="85" y="115" text-anchor="middle" class="svg-ink" font-size="12">WLC, APs</text>
<rect x="20" y="154" width="130" height="36" rx="8" fill="#e2e8f0"/><text x="85" y="177" text-anchor="middle" class="svg-ink" font-size="12">Sensors, clients</text>
<rect x="240" y="70" width="170" height="80" rx="10" fill="#bae6fd"/><text x="325" y="100" text-anchor="middle" class="svg-ink" font-size="13">Catalyst Center</text><text x="325" y="118" text-anchor="middle" class="svg-muted" font-size="12">Assurance engine</text><text x="325" y="135" text-anchor="middle" class="svg-muted" font-size="12">correlation + ML</text>
<rect x="490" y="30" width="130" height="36" rx="8" fill="#bbf7d0"/><text x="555" y="53" text-anchor="middle" class="svg-ink" font-size="12">Network health</text>
<rect x="490" y="92" width="130" height="36" rx="8" fill="#fde68a"/><text x="555" y="115" text-anchor="middle" class="svg-ink" font-size="12">Device 360</text>
<rect x="490" y="154" width="130" height="36" rx="8" fill="#fed7aa"/><text x="555" y="177" text-anchor="middle" class="svg-ink" font-size="12">Issues, path trace</text>
<line x1="150" y1="48" x2="240" y2="95" stroke="#64748b"/><line x1="150" y1="110" x2="240" y2="110" stroke="#64748b"/><line x1="150" y1="172" x2="240" y2="125" stroke="#64748b"/>
<line x1="410" y1="95" x2="490" y2="48" stroke="#64748b"/><line x1="410" y1="110" x2="490" y2="110" stroke="#64748b"/><line x1="410" y1="125" x2="490" y2="172" stroke="#64748b"/>
<text x="195" y="30" text-anchor="middle" class="svg-accent" font-size="12">SNMP, syslog, flows, telemetry</text>
</svg><p class="cap">Telemetry flows in on the left; scores, 360 views and issues come out on the right.</p></div>

<h3>Health scores</h3>
<p>Each device receives a <b>device health score</b> from 1 to 10, computed from key performance indicators (KPIs) such as reachability, CPU and memory utilisation, interface and link errors, and for wireless devices things like radio utilisation and interference. The device score is driven by its worst KPI. Colour bands: <b>poor 1 to 3</b> (red), <b>fair 4 to 7</b> (orange), <b>good 8 to 10</b> (green); grey means no data.</p>
<p><b>Network health</b> is the percentage of healthy devices (score 8 to 10), shown overall and per category: access, distribution, core, router, wireless controller and access point. <b>Client health</b> does the same for wired and wireless clients, based on onboarding (association, authentication, getting an IP address) and connectivity (for wireless, RSSI and SNR).</p>

<div class="eg"><p><b>Worked example.</b> A site has 40 devices. 34 have a score of 8 to 10, 4 are fair, 2 are poor. Network health = 34 / 40 = 85%. One of the poor devices is a branch router with CPU at 96%: its CPU KPI is poor, so its whole health score is poor, even though memory and interfaces are fine. Drilling into Device 360 shows that the CPU rise started when someone left <code>debug ip packet</code> running.</p></div>

<h3>The troubleshooting workflow in Assurance</h3>
<ol>
<li><b>Overall and network health dashboards</b>: which site or category dropped, and when (timeline).</li>
<li><b>Issues and insights</b>: Assurance raises issues (for example "Interface down", "High CPU", "DHCP server not responding", "AP disconnected") with priority, impacted devices or clients, and suggested actions.</li>
<li><b>Device 360 / Client 360</b>: a single page for one device or client with its health over time, KPIs, neighbours, events and a timeline you can move back in time to the moment of the problem.</li>
<li><b>Path trace</b>: pick a source and destination (and optionally ports); Catalyst Center draws the hop-by-hop path using its knowledge of the topology and routing, and can show ACLs and interface statistics along the way.</li>
<li><b>Tools</b>: command runner for read-only show commands on many devices, intelligent capture for wireless clients, sensor tests.</li>
</ol>

<h3>Connectivity problems between the appliance and devices</h3>
<p>Assurance can only be as good as its connection to each device. In the inventory a device shows a <b>reachability</b> state (reachable, ping reachable, unreachable) and a <b>last sync status</b> (managed, or a collection failure or error). Typical causes of "unreachable" or "collection failure":</p>
<table class="cmp"><tr><th>Symptom</th><th>Typical cause</th></tr>
<tr><td>Unreachable</td><td>No route between the appliance and the management IP, or an ACL or firewall blocking it</td></tr>
<tr><td>Credential or collection failure</td><td>Wrong SSH (CLI) credentials, SNMP community or SNMPv3 user; VTY <code>transport input</code> or access-class blocking the appliance</td></tr>
<tr><td>Device managed, but no health data</td><td>Telemetry not configured: no syslog host, SNMP trap host or NetFlow exporter toward Catalyst Center; unsupported software version</td></tr>
<tr><td>Wrong time on events</td><td>Device not synchronised with NTP</td></tr></table>
<p>Notice that this table is simply chapters 2, 3, 4, 5 and 10 again. Assurance does not replace the fundamentals; it depends on them.</p>

<div class="warn"><p><b>Common mistakes.</b> Treating a green network health score as proof that every user is happy (client health can be poor while devices are fine); discovering devices with a management IP that changes; using a management ACL that permits the NMS but not the Catalyst Center cluster addresses.</p></div>

<div class="exam"><p><b>Exam trap.</b> Health scores run from 1 to 10 and a device's score is driven by its <b>lowest</b> KPI. Network health is the percentage of devices in the good range. Expect questions that show a dashboard value and ask what it means.</p></div>

<div class="scn"><h4>The site that looked perfect</h4><p>A branch showed 100% network health in Catalyst Center, but users complained that Wi-Fi dropped every afternoon. Client health for the site was 62%. Client 360 for an affected laptop showed onboarding failures at the "IP address" stage: the DHCP server was not answering. The issue "DHCP server not responding" pointed to the relay switch. The helper address on a new SVI pointed to a decommissioned server. The engineer fixed the helper and client health returned to 95% the next day.</p><p><b>Lesson:</b> device health and client health measure different things; read both.</p></div>

<div class="iv"><p class="q">"How would you use Catalyst Center assurance to troubleshoot a user complaint?"</p><p>Start with Client 360 for that user: onboarding stages, IP address, connected device, health over the time of the complaint. Check the issues list for that client or site, then Device 360 for the access and gateway devices. Use path trace from the client to the application to see the path and any ACLs. If data is missing, check the device's reachability and collection status, and that syslog, SNMP and NetFlow point to the appliance.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Catalyst Center (formerly DNA Center) Assurance turns SNMP, syslog, NetFlow and streaming telemetry into health scores and issues.</li>
<li>Device health 1 to 10: poor 1-3, fair 4-7, good 8-10, driven by the worst KPI.</li>
<li>Network health = percentage of healthy devices, per category and site; client health covers onboarding and connectivity.</li>
<li>Workflow: dashboards, issues, Device 360 / Client 360 with timeline, path trace, command runner.</li>
<li>Unreachable or collection failures come back to routing, ACLs, credentials, SNMP and missing telemetry settings.</li>
</ul></div>
`,hi:`
<p>Pichhle chapters ki har cheez kachha saboot banati hai: syslog lines, SNMP counters, flow records, SLA results. 2,000 devices wala NOC engineer yeh sab nahi padh sakta. Car dashboard socho: engine hazaaron sensor readings banata hai, par driver ko ek fuel gauge, ek temperature gauge aur "check engine" kehne wali warning light dikhti hai. <b>Cisco Catalyst Center</b> (2023 tak <b>DNA Center</b> kaha jaata tha, aur ENARSI blueprint mein ab bhi yahi naam hai) enterprise network ka dashboard hai, aur iska <b>Assurance</b> function telemetry ko health scores, issues aur guided troubleshooting mein badalta hai. Blueprint item 4.7 aapse ise describe-and-interpret level par use karna maangta hai: connectivity, monitoring, device health aur network health.</p>

<h3>Data kahan se aata hai</h3>
<p>Assurance managed devices se kai tareekon se telemetry collect karta hai, jinmein se kai aap pehle se jaante ho:</p>
<ul>
<li>Inventory, counters, CPU aur memory ke liye <b>SNMP</b> polling aur traps.</li>
<li>Link flaps aur protocol adjacency changes jaise events ke liye <b>Syslog</b>.</li>
<li>Application aur traffic visibility ke liye <b>NetFlow / Flexible NetFlow</b>.</li>
<li>IOS XE devices par <b>model-driven streaming telemetry</b>, plus clients aur access points ke liye wireless controller telemetry.</li>
<li><b>Active tests</b>: IP SLA jaise probes aur wireless sensors jo asli client ki tarah test karte hain.</li>
</ul>
<p>Jab device provision hota hai, Catalyst Center telemetry settings khud push kar sakta hai (syslog server, SNMP trap receiver aur NetFlow collector jo appliance ki taraf point karein), us site ki network settings se. Agar device bina us telemetry ke joda gaya, to Assurance ke paas dikhane ko bahut kam ya kuch nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Assurance data flow">
<rect x="20" y="30" width="130" height="36" rx="8" fill="#e2e8f0"/><text x="85" y="53" text-anchor="middle" class="svg-ink" font-size="12">Routers, switches</text>
<rect x="20" y="92" width="130" height="36" rx="8" fill="#e2e8f0"/><text x="85" y="115" text-anchor="middle" class="svg-ink" font-size="12">WLC, APs</text>
<rect x="20" y="154" width="130" height="36" rx="8" fill="#e2e8f0"/><text x="85" y="177" text-anchor="middle" class="svg-ink" font-size="12">Sensors, clients</text>
<rect x="240" y="70" width="170" height="80" rx="10" fill="#bae6fd"/><text x="325" y="100" text-anchor="middle" class="svg-ink" font-size="13">Catalyst Center</text><text x="325" y="118" text-anchor="middle" class="svg-muted" font-size="12">Assurance engine</text><text x="325" y="135" text-anchor="middle" class="svg-muted" font-size="12">correlation + ML</text>
<rect x="490" y="30" width="130" height="36" rx="8" fill="#bbf7d0"/><text x="555" y="53" text-anchor="middle" class="svg-ink" font-size="12">Network health</text>
<rect x="490" y="92" width="130" height="36" rx="8" fill="#fde68a"/><text x="555" y="115" text-anchor="middle" class="svg-ink" font-size="12">Device 360</text>
<rect x="490" y="154" width="130" height="36" rx="8" fill="#fed7aa"/><text x="555" y="177" text-anchor="middle" class="svg-ink" font-size="12">Issues, path trace</text>
<line x1="150" y1="48" x2="240" y2="95" stroke="#64748b"/><line x1="150" y1="110" x2="240" y2="110" stroke="#64748b"/><line x1="150" y1="172" x2="240" y2="125" stroke="#64748b"/>
<line x1="410" y1="95" x2="490" y2="48" stroke="#64748b"/><line x1="410" y1="110" x2="490" y2="110" stroke="#64748b"/><line x1="410" y1="125" x2="490" y2="172" stroke="#64748b"/>
<text x="195" y="30" text-anchor="middle" class="svg-accent" font-size="12">SNMP, syslog, flows, telemetry</text>
</svg><p class="cap">Telemetry baayein se andar aati hai; scores, 360 views aur issues daayein se bahar nikalte hain.</p></div>

<h3>Health scores</h3>
<p>Har device ko 1 se 10 tak <b>device health score</b> milta hai, jo key performance indicators (KPIs) se nikalta hai jaise reachability, CPU aur memory utilisation, interface aur link errors, aur wireless devices ke liye radio utilisation aur interference jaisi cheezein. Device score uske sabse kharab KPI se chalta hai. Colour bands: <b>poor 1 se 3</b> (laal), <b>fair 4 se 7</b> (orange), <b>good 8 se 10</b> (hara); grey ka matlab data nahi.</p>
<p><b>Network health</b> healthy devices (score 8 se 10) ka percentage hai, overall aur har category ke liye dikhaya jaata hai: access, distribution, core, router, wireless controller aur access point. <b>Client health</b> wired aur wireless clients ke liye yahi karta hai, onboarding (association, authentication, IP address milna) aur connectivity (wireless ke liye RSSI aur SNR) ke aadhaar par.</p>

<div class="eg"><p><b>Worked example.</b> Ek site par 40 devices hain. 34 ka score 8 se 10 hai, 4 fair hain, 2 poor. Network health = 34 / 40 = 85%. Poor devices mein se ek branch router hai jiska CPU 96% par hai: uska CPU KPI poor hai, isliye uska poora health score poor hai, jabki memory aur interfaces theek hain. Device 360 mein jaane par dikhta hai ki CPU tab badhna shuru hua jab kisi ne <code>debug ip packet</code> chalta chhod diya.</p></div>

<h3>Assurance mein troubleshooting workflow</h3>
<ol>
<li><b>Overall aur network health dashboards</b>: kaunsi site ya category giri, aur kab (timeline).</li>
<li><b>Issues aur insights</b>: Assurance issues uthata hai (jaise "Interface down", "High CPU", "DHCP server not responding", "AP disconnected") priority, prabhavit devices ya clients, aur suggested actions ke saath.</li>
<li><b>Device 360 / Client 360</b>: ek device ya client ka ek page jismein samay ke saath health, KPIs, neighbours, events aur ek timeline hai jise aap problem ke pal tak peechhe le ja sakte ho.</li>
<li><b>Path trace</b>: source aur destination (aur optionally ports) chuno; Catalyst Center topology aur routing ki jaankari se hop-by-hop path banata hai, aur raaste ke ACLs aur interface statistics dikha sakta hai.</li>
<li><b>Tools</b>: kai devices par read-only show commands ke liye command runner, wireless clients ke liye intelligent capture, sensor tests.</li>
</ol>

<h3>Appliance aur devices ke beech connectivity problems</h3>
<p>Assurance utna hi achha hai jitna har device se uska connection. Inventory mein device ek <b>reachability</b> state (reachable, ping reachable, unreachable) aur <b>last sync status</b> (managed, ya collection failure ya error) dikhata hai. "Unreachable" ya "collection failure" ke typical kaaran:</p>
<table class="cmp"><tr><th>Symptom</th><th>Typical kaaran</th></tr>
<tr><td>Unreachable</td><td>Appliance aur management IP ke beech route nahi, ya ACL ya firewall use block kar raha</td></tr>
<tr><td>Credential ya collection failure</td><td>Galat SSH (CLI) credentials, SNMP community ya SNMPv3 user; VTY <code>transport input</code> ya access-class appliance ko block kar raha</td></tr>
<tr><td>Device managed, par health data nahi</td><td>Telemetry configure nahi: Catalyst Center ki taraf na syslog host, na SNMP trap host, na NetFlow exporter; unsupported software version</td></tr>
<tr><td>Events par galat time</td><td>Device NTP se synchronised nahi</td></tr></table>
<p>Dhyan do ki yeh table bas chapters 2, 3, 4, 5 aur 10 hi dobara hai. Assurance fundamentals ki jagah nahi leta; unhi par depend karta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Hare network health score ko saboot maanna ki har user khush hai (devices theek hon tab bhi client health poor ho sakti hai); aise management IP se devices discover karna jo badalta hai; aisa management ACL use karna jo NMS ko permit karta hai par Catalyst Center cluster addresses ko nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Health scores 1 se 10 tak chalte hain aur device ka score uske <b>sabse kam</b> KPI se chalta hai. Network health good range ke devices ka percentage hai. Aise questions expect karo jo dashboard value dikhakar poochein uska matlab kya hai.</p></div>

<div class="scn"><h4>Woh site jo perfect dikhti thi</h4><p>Ek branch Catalyst Center mein 100% network health dikhati thi, par users shikayat karte the ki har dopahar Wi-Fi girta hai. Site ki client health 62% thi. Ek prabhavit laptop ke Client 360 ne "IP address" stage par onboarding failures dikhaye: DHCP server jawab nahi de raha tha. Issue "DHCP server not responding" ne relay switch ki taraf ishara kiya. Naye SVI par helper address ek decommissioned server ki taraf point kar raha tha. Engineer ne helper theek kiya aur agle din client health 95% par laut aayi.</p><p><b>Seekh:</b> device health aur client health alag cheezein naapte hain; dono padho.</p></div>

<div class="iv"><p class="q">"User complaint ke troubleshooting ke liye aap Catalyst Center assurance kaise use karoge?"</p><p>Us user ke Client 360 se shuru karo: onboarding stages, IP address, connected device, complaint ke samay ki health. Us client ya site ki issues list check karo, phir access aur gateway devices ka Device 360. Client se application tak path trace use karo taaki path aur koi ACLs dikhein. Agar data missing hai, device ki reachability aur collection status check karo, aur yeh ki syslog, SNMP aur NetFlow appliance ki taraf point karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Catalyst Center (pehle DNA Center) Assurance SNMP, syslog, NetFlow aur streaming telemetry ko health scores aur issues mein badalta hai.</li>
<li>Device health 1 se 10: poor 1-3, fair 4-7, good 8-10, sabse kharab KPI se chalta hai.</li>
<li>Network health = healthy devices ka percentage, har category aur site ke liye; client health onboarding aur connectivity cover karti hai.</li>
<li>Workflow: dashboards, issues, timeline ke saath Device 360 / Client 360, path trace, command runner.</li>
<li>Unreachable ya collection failures routing, ACLs, credentials, SNMP aur missing telemetry settings par laut kar aate hain.</li>
</ul></div>
`}};export{e as default};