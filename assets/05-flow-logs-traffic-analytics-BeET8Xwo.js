var e=`<svg viewBox="0 0 640 250" role="img" aria-label="Flow log pipeline: VNet or NSG flow log to storage account, then Traffic Analytics into a Log Analytics workspace, then queries and dashboards">
<rect x="15" y="40" width="130" height="70" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="80" y="66" text-anchor="middle" class="svg-ink" font-size="12">Traffic in VNet</text><text x="80" y="84" text-anchor="middle" class="svg-muted" font-size="10">hub, spokes</text>
<rect x="180" y="40" width="130" height="70" rx="10" fill="#fed7aa" stroke="#64748b"/><text x="245" y="66" text-anchor="middle" class="svg-ink" font-size="12">Flow log</text><text x="245" y="84" text-anchor="middle" class="svg-muted" font-size="10">VNet flow log (new)</text>
<rect x="345" y="40" width="130" height="70" rx="10" fill="#e2e8f0" stroke="#64748b"/><text x="410" y="66" text-anchor="middle" class="svg-ink" font-size="12">Storage account</text><text x="410" y="84" text-anchor="middle" class="svg-muted" font-size="10">JSON per hour</text>
<rect x="510" y="40" width="115" height="70" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="567" y="66" text-anchor="middle" class="svg-ink" font-size="12">Traffic Analytics</text><text x="567" y="84" text-anchor="middle" class="svg-muted" font-size="10">Log Analytics</text>
<g stroke="#64748b" stroke-width="2"><line x1="145" y1="75" x2="180" y2="75"/><line x1="310" y1="75" x2="345" y2="75"/><line x1="475" y1="75" x2="510" y2="75"/></g>
<rect x="15" y="140" width="610" height="90" rx="10" fill="#f1f5f9" stroke="#64748b"/>
<text x="320" y="164" text-anchor="middle" class="svg-ink" font-size="12">A flow record: time, source IP:port, destination IP:port, protocol, direction, allow or deny, bytes, packets</text>
<text x="320" y="186" text-anchor="middle" class="svg-muted" font-size="11">Example: 10.1.1.4:51022 to 10.2.1.4:1433 TCP inbound DENY (rule DenyAllInBound), 3 packets</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="11">Flow logs show what happened; they are history, not a live tester</text>
</svg>`,t={id:`flow-logs-traffic-analytics`,h:{en:`Flow logs and Traffic Analytics (and the NSG flow log retirement)`,hi:`Flow logs aur Traffic Analytics (aur NSG flow log retirement)`},body:{en:`
<h3>From "now" to "what happened last night"</h3>
<p>Next hop and IP flow verify test the present. Many tickets are about the past: "it failed at 02:10 for ten minutes", "who is sending 40 GB to the internet?", "did anyone try SSH from outside?" For that you need <b>flow logs</b>: a record of network flows that you can search later. Think of a security camera for traffic, saving a short summary line per conversation.</p>
<div class="dia">`+e+`<p class="cap">The pipeline: a flow log writes summaries to storage; Traffic Analytics enriches and sends them to a Log Analytics workspace for queries and dashboards.</p></div>

<h3>NSG flow logs and VNet flow logs</h3>
<p><b>NSG flow logs</b> were the original feature: they record flows evaluated by an NSG, with the rule that matched, the decision (allow or deny), and counters of packets and bytes. They are written as JSON files in a storage account, one file per hour per NSG.</p>
<div class="warn"><p><b>Retirement notice (verify before publishing).</b> Microsoft announced that NSG flow logs are being retired: creation of new NSG flow logs was scheduled to stop in mid-2025 and existing ones to be retired in September 2027, with <b>VNet flow logs</b> as the replacement. Confirm the exact dates and the migration guidance on the current Azure documentation before you build anything new on NSG flow logs.</p></div>
<p><b>VNet flow logs</b> (the replacement, verify current feature set) are enabled at the level of a VNet, a subnet or a NIC and record traffic through the virtual network whether or not an NSG rule was involved. They cover scenarios NSG flow logs missed, such as traffic allowed by other mechanisms, and can report encryption status. Same idea, different attachment point: choose the scope that gives you the evidence you need (often the whole hub and spoke VNets).</p>
<table class="cmp"><tr><th>Question</th><th>NSG flow logs (being retired)</th><th>VNet flow logs</th></tr>
<tr><td>Attached to</td><td>An NSG</td><td>VNet, subnet or NIC</td></tr>
<tr><td>Shows</td><td>Flows evaluated by that NSG, matching rule</td><td>Flows in the virtual network, with state and bytes (verify fields)</td></tr>
<tr><td>Future</td><td>Retirement planned</td><td>Current direction</td></tr></table>

<h3>Setting up a flow log</h3>
<p>You need a Network Watcher in the region, a storage account in the same region, and, for Traffic Analytics, a Log Analytics workspace. Set a <b>retention</b> (days) so that old logs expire.</p>
<pre class="code"><span class="c"># VNet flow log with Traffic Analytics (parameters: confirm with --help)</span>
az network watcher flow-log create -l centralindia -n fl-hub --vnet hub-vnet -g rg-hub --storage-account stlabflowlogs --workspace law-nk --traffic-analytics true --interval 10 --retention 7 --enabled true
az network watcher flow-log show -l centralindia -n fl-hub -o table</pre>
<pre class="out"><span class="c">Illustrative output</span>
Name     Enabled   TargetResource   RetentionDays   TrafficAnalytics
fl-hub   <span class="hl">True</span>      hub-vnet         7               Enabled</pre>
<p>The flow log resource itself is created under the Network Watcher (often in NetworkWatcherRG), which matters at cleanup time: deleting your own resource group may not delete it.</p>

<h3>Traffic Analytics</h3>
<p><b>Traffic Analytics</b> processes the flow log data, enriches it with names, geography and security information, and sends it to Log Analytics at a chosen interval (for example every 10 or 60 minutes; verify the options). It gives dashboards of top talkers, top ports, flows between VNets, flows to the internet, and flagged malicious IPs, and lets you query with KQL. Flows appear after a delay, so it does not replace live testing.</p>
<pre class="code"><span class="c">// KQL: denied flows into the database, grouped (illustrative; table and field names differ by log type, verify)</span>
AzureNetworkAnalytics_CL
| where SubType_s == "FlowLog" and FlowStatus_s == "D"
| where DestPort_d == 1433
| summarize Flows = count() by SrcIP_s, DestIP_s
| order by Flows desc</pre>
<pre class="out"><span class="c">Illustrative output</span>
SrcIP_s     DestIP_s    Flows
10.1.1.4    10.2.1.4    <span class="hl">412</span>
10.1.2.9    10.2.1.4    37</pre>
<p>Read it: 412 denied flows from the app VM to the database in the chosen window point to a rule that is missing or ordered wrongly, and tell you <i>when</i> it started, which you can match to a change record.</p>

<h3>What flow logs are good and bad at</h3>
<ul>
<li><b>Good:</b> proving a deny, finding the time a problem started, spotting unusual flows (scans, big transfers), capacity and cost analysis, compliance evidence.</li>
<li><b>Bad:</b> payload content (use packet capture), exact packet-level timing, real-time alerts (use Connection Monitor and Azure Monitor alerts), and flows that never got logged because the log was off.</li>
<li>Logging has <b>cost</b>: a per-GB charge for logs collected, storage, Log Analytics ingestion and Traffic Analytics processing (verify the pricing structure). Enable where you need evidence, not blindly everywhere forever, and set retention.</li>
</ul>

<div class="warn"><p><b>Common mistakes:</b> enabling logs after the incident, forgetting retention, putting storage in a different region, assuming flow logs are real time, and leaving a flow log running after a lab.</p></div>
<div class="exam"><p><b>Exam trap:</b> flow logs write to a storage account (and optionally Traffic Analytics to Log Analytics). They record flows, not packet contents. NSG flow logs are on a retirement path; VNet flow logs are the replacement (verify dates).</p></div>

<div class="scn"><h4>The 02:10 outage with no evidence</h4><p>Users reported that an internal service failed at 02:10 for ten minutes. Nobody could prove why because flow logs had never been enabled. A week later it recurred; this time VNet flow logs with Traffic Analytics showed thousands of denied flows from a new subnet that had been given a restrictive NSG by an automation job at 02:08. The team fixed the automation and kept the logs on the hub and spoke VNets.</p><p><b>Lesson:</b> evidence must exist before the incident.</p></div>

<div class="iv"><p class="q">"What are flow logs and what is Traffic Analytics?"</p><p>Flow logs record per-flow summaries (addresses, ports, protocol, direction, allow or deny, bytes) to storage. Traffic Analytics processes them into Log Analytics for dashboards and KQL. Mention VNet flow logs replacing NSG flow logs, retention and cost, and that they are historical evidence, not a live test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow logs record flows to storage; Traffic Analytics sends enriched data to Log Analytics.</li>
<li>NSG flow logs are being retired (verify dates); use VNet flow logs for new work.</li>
<li>Great for the past and for denies; not for payloads or live alerts.</li>
<li>Set retention and mind the cost layers: logs, storage, ingestion.</li>
<li>Enable before you need them.</li>
</ul></div>
`,hi:`
<h3>"Abhi" se "kal raat kya hua" tak</h3>
<p>Next hop aur IP flow verify present test karte hain. Kai tickets past ke baare mein hote hain: "02:10 par das minute fail hua", "40 GB internet ko kaun bhej raha hai?", "kya kisi ne bahar se SSH try kiya?" Iske liye <b>flow logs</b> chahiye: network flows ka record jo aap baad mein search kar sako. Ise traffic ka security camera samjho, jo har conversation ki ek chhoti summary line save karta hai.</p>
<div class="dia">`+e+`<p class="cap">Pipeline: flow log storage mein summaries likhta hai; Traffic Analytics unhe enrich karke queries aur dashboards ke liye Log Analytics workspace mein bhejta hai.</p></div>

<h3>NSG flow logs aur VNet flow logs</h3>
<p><b>NSG flow logs</b> original feature thi: yeh NSG dwara evaluate hue flows record karti thi, match hue rule, decision (allow ya deny), aur packets aur bytes ke counters ke saath. Yeh storage account mein JSON files ki tarah likhi jaati hain, har NSG ke liye har ghante ek file.</p>
<div class="warn"><p><b>Retirement notice (publish se pehle verify karo).</b> Microsoft ne announce kiya ki NSG flow logs retire ho rahi hain: naye NSG flow logs banana 2025 ke beech mein rukne wala tha aur maujooda September 2027 mein retire hone wale the, replacement ke taur par <b>VNet flow logs</b>. Kuch bhi naya NSG flow logs par banane se pehle current Azure documentation par exact dates aur migration guidance confirm karo.</p></div>
<p><b>VNet flow logs</b> (replacement, current feature set verify karo) VNet, subnet ya NIC level par enable hoti hain aur virtual network se guzarte traffic ko record karti hain, NSG rule shamil ho ya na ho. Yeh un scenarios ko cover karti hain jo NSG flow logs miss karti thi, jaise doosre mechanisms se allowed traffic, aur encryption status report kar sakti hain. Wahi idea, alag attachment point: wahi scope chuno jo aapko chahiye evidence de (aksar poore hub aur spoke VNets).</p>
<table class="cmp"><tr><th>Sawaal</th><th>NSG flow logs (retire ho rahi)</th><th>VNet flow logs</th></tr>
<tr><td>Attach hoti hain</td><td>NSG par</td><td>VNet, subnet ya NIC par</td></tr>
<tr><td>Kya dikhati hain</td><td>Us NSG dwara evaluate flows, matching rule</td><td>Virtual network ke flows, state aur bytes ke saath (fields verify karo)</td></tr>
<tr><td>Future</td><td>Retirement planned</td><td>Current direction</td></tr></table>

<h3>Flow log set up karna</h3>
<p>Aapko region mein Network Watcher, usi region mein storage account, aur Traffic Analytics ke liye Log Analytics workspace chahiye. Purane logs expire hon isliye <b>retention</b> (days) set karo.</p>
<pre class="code"><span class="c"># Traffic Analytics ke saath VNet flow log (parameters: --help se confirm karo)</span>
az network watcher flow-log create -l centralindia -n fl-hub --vnet hub-vnet -g rg-hub --storage-account stlabflowlogs --workspace law-nk --traffic-analytics true --interval 10 --retention 7 --enabled true
az network watcher flow-log show -l centralindia -n fl-hub -o table</pre>
<pre class="out"><span class="c">Illustrative output</span>
Name     Enabled   TargetResource   RetentionDays   TrafficAnalytics
fl-hub   <span class="hl">True</span>      hub-vnet         7               Enabled</pre>
<p>Flow log resource khud Network Watcher ke neeche (aksar NetworkWatcherRG mein) banta hai, jo cleanup ke waqt matter karta hai: apna resource group delete karne se woh delete nahi ho sakta.</p>

<h3>Traffic Analytics</h3>
<p><b>Traffic Analytics</b> flow log data process karta hai, use naam, geography aur security information se enrich karta hai, aur chune hue interval par (jaise har 10 ya 60 minute; options verify karo) Log Analytics mein bhejta hai. Yeh top talkers, top ports, VNets ke beech flows, internet ke flows, aur flagged malicious IPs ke dashboards deta hai, aur KQL se query karne deta hai. Flows deri se dikhte hain, isliye yeh live testing ki jagah nahi leta.</p>
<pre class="code"><span class="c">// KQL: database ke denied flows, grouped (illustrative; table aur field names log type ke hisaab se alag, verify karo)</span>
AzureNetworkAnalytics_CL
| where SubType_s == "FlowLog" and FlowStatus_s == "D"
| where DestPort_d == 1433
| summarize Flows = count() by SrcIP_s, DestIP_s
| order by Flows desc</pre>
<pre class="out"><span class="c">Illustrative output</span>
SrcIP_s     DestIP_s    Flows
10.1.1.4    10.2.1.4    <span class="hl">412</span>
10.1.2.9    10.2.1.4    37</pre>
<p>Padhna: chune hue window mein app VM se database tak 412 denied flows batate hain ki koi rule missing hai ya galat order mein hai, aur yeh bhi ki yeh <i>kab</i> shuru hua, jise aap change record se match kar sakte ho.</p>

<h3>Flow logs kis mein achhi, kis mein buri</h3>
<ul>
<li><b>Achhi:</b> deny saabit karna, problem kab shuru hui yeh dhundhna, unusual flows (scans, bade transfers) pakadna, capacity aur cost analysis, compliance evidence.</li>
<li><b>Buri:</b> payload content (packet capture use karo), exact packet-level timing, real-time alerts (Connection Monitor aur Azure Monitor alerts use karo), aur woh flows jo log nahi hue kyunki log off tha.</li>
<li>Logging ka <b>cost</b> hota hai: collect hue logs ka per-GB charge, storage, Log Analytics ingestion aur Traffic Analytics processing (pricing structure verify karo). Wahan enable karo jahan evidence chahiye, har jagah hamesha ke liye andhadhundh nahi, aur retention set karo.</li>
</ul>

<div class="warn"><p><b>Common mistakes:</b> incident ke baad logs enable karna, retention bhool jaana, storage ko alag region mein rakhna, flow logs ko real time maan lena, aur lab ke baad flow log chalta chhod dena.</p></div>
<div class="exam"><p><b>Exam trap:</b> flow logs storage account mein likhte hain (aur optionally Traffic Analytics Log Analytics mein). Woh flows record karte hain, packet contents nahi. NSG flow logs retirement path par hain; VNet flow logs replacement hain (dates verify karo).</p></div>

<div class="scn"><h4>02:10 ka outage, evidence nahi</h4><p>Users ne report kiya ki ek internal service 02:10 par das minute ke liye fail hui. Koi saabit nahi kar paya kyunki flow logs kabhi enable hi nahi hui thi. Ek hafte baad dobara hua; is baar Traffic Analytics ke saath VNet flow logs ne ek naye subnet se hazaaron denied flows dikhaye jise 02:08 par ek automation job ne restrictive NSG de diya tha. Team ne automation theek kiya aur hub aur spoke VNets par logs on rakhe.</p><p><b>Lesson:</b> evidence incident se pehle maujood honi chahiye.</p></div>

<div class="iv"><p class="q">"Flow logs aur Traffic Analytics kya hain?"</p><p>Flow logs per-flow summaries (addresses, ports, protocol, direction, allow ya deny, bytes) storage mein record karti hain. Traffic Analytics unhe dashboards aur KQL ke liye Log Analytics mein process karta hai. NSG flow logs ki jagah VNet flow logs, retention aur cost ka zikr karo, aur ki yeh historical evidence hai, live test nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow logs flows storage mein record karti hain; Traffic Analytics enriched data Log Analytics mein bhejta hai.</li>
<li>NSG flow logs retire ho rahi hain (dates verify karo); naye kaam ke liye VNet flow logs.</li>
<li>Past aur denies ke liye shandar; payloads ya live alerts ke liye nahi.</li>
<li>Retention set karo aur cost layers dhyan mein rakho: logs, storage, ingestion.</li>
<li>Zaroorat se pehle enable karo.</li>
</ul></div>
`}};export{t as default};