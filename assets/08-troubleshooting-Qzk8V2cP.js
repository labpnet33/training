var e={id:`troubleshooting`,h:{en:`Troubleshooting HA: a workflow that finds the fault`,hi:`HA troubleshooting: ek workflow jo fault dhoondh leta hai`},body:{en:`
<p>When an HA ticket arrives, panic helps nobody. Use a fixed order, like a doctor: check the vital signs first, then the links, then the details. This chapter gives a repeatable workflow, the common faults and what each looks like. None of it can be practised in the simulator because it does not model HA; practise the supporting CLI habits in pan-diag and pan-setup, and compare with nse4-ha and sec-asa-ha for the same logic on other vendors.</p>

<h3>The workflow</h3>
<ol>
<li><b>State</b>: on each firewall run <code>show high-availability state</code>. Record local state, peer state and the reason fields.</li>
<li><b>Links</b>: run <code>show high-availability interface ha1</code> and the HA2 equivalent. Is the link up, is the peer address reachable, are there errors?</li>
<li><b>Compatibility</b>: do model, PAN-OS version, application and threat content, and licences match?</li>
<li><b>Sync</b>: is the running configuration shown as synchronised? Is state sync (HA2) up?</li>
<li><b>Monitors</b>: <code>show high-availability link-monitoring</code> and <code>show high-availability path-monitoring</code>. Did a group fail?</li>
<li><b>Logs</b>: read the System log entries from the HA subsystem around the event time. The log gives the reason and timestamp for each state change.</li>
<li><b>Change</b>: ask what changed (upgrade, cable, switch, config) just before the symptom.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Troubleshooting order">
<rect x="8" y="55" width="84" height="56" rx="10" fill="#bae6fd"/><text x="50" y="88" text-anchor="middle" class="svg-ink" font-size="13">1 State</text>
<rect x="104" y="55" width="84" height="56" rx="10" fill="#bbf7d0"/><text x="146" y="88" text-anchor="middle" class="svg-ink" font-size="13">2 Links</text>
<rect x="200" y="55" width="84" height="56" rx="10" fill="#ddd6fe"/><text x="242" y="88" text-anchor="middle" class="svg-ink" font-size="13">3 Compat</text>
<rect x="296" y="55" width="84" height="56" rx="10" fill="#fde68a"/><text x="338" y="88" text-anchor="middle" class="svg-ink" font-size="13">4 Sync</text>
<rect x="392" y="55" width="84" height="56" rx="10" fill="#fed7aa"/><text x="434" y="88" text-anchor="middle" class="svg-ink" font-size="13">5 Monitors</text>
<rect x="488" y="55" width="70" height="56" rx="10" fill="#e2e8f0"/><text x="523" y="88" text-anchor="middle" class="svg-ink" font-size="13">6 Logs</text>
<rect x="570" y="55" width="62" height="56" rx="10" fill="#e2e8f0"/><text x="601" y="88" text-anchor="middle" class="svg-ink" font-size="13">7 Change</text>
</svg><p class="cap">Work left to right. Do not skip steps.</p></div>

<h3>Common faults and their signs</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Peer shows as unknown or HA1 not up</td><td>Wrong peer-ip, cable, VLAN or firewall rule on the HA path</td><td>HA1 addresses, link lights, ping, encryption keys match</td></tr>
<tr><td>Unit is non-functional</td><td>Model or version mismatch, internal fault</td><td>Compatibility fields, System log</td></tr>
<tr><td>Config shown as not synchronised</td><td>Changes made on the passive unit, failed commit, mismatch</td><td>Commit on active, then sync-to-remote if needed</td></tr>
<tr><td>Failover works but sessions drop</td><td>Session sync off or HA2 down</td><td>State synchronisation setting and HA2 status</td></tr>
<tr><td>Frequent failovers</td><td>Over-sensitive monitoring, flapping link, preemption</td><td>Monitor logs, timers, destinations</td></tr>
<tr><td>Both units active</td><td>Split brain: HA1 and backup both lost</td><td>HA1 backup, heartbeat backup, cabling</td></tr>
<tr><td>Traffic fails after failover</td><td>Neighbour ARP or MAC not updated, port security, routing, licence missing</td><td>Gratuitous ARP behaviour, switch tables, licences</td></tr>
</table>

<h3>Reading the HA state</h3>
<p>You will see fields for the local firewall and the peer: state, the reason for the last state change, the election-related values (priority, preemption), running-configuration sync status, and compatibility results. Do not memorise exact output layout; learn what each field means and read it calmly. Never invent or assume values: the output on your device is the source of truth.</p>

<h3>Failover reasons you may find in logs</h3>
<ul>
<li>Heartbeat or hello loss from the peer.</li>
<li>A link-monitoring or path-monitoring failure.</li>
<li>An administrator suspended the unit.</li>
<li>A preemption by a higher-priority unit.</li>
<li>An internal health or software fault.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A ticket says: "Failover happened at lunchtime and nobody knows why." The engineer runs the state command on both firewalls, finds FW-B active, and reads the System log on FW-A. The log shows a path-monitoring failure for the ISP router, then a state change to non-functional, then a recovery a few minutes later. A switch upstream had been rebooted by another team. The firewall behaved as designed; the fix is communication about maintenance, plus a second monitored destination.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Forcing a sync from the wrong side. <code>sync-to-remote</code> overwrites the peer. Verify which firewall holds the good configuration before you push.</p></div>
<div class="exam"><p><b>Exam trap.</b> When asked about a firewall that never becomes active, check compatibility (model, version, licences) and HA1 reachability before anything else. When both are active, think split brain.</p></div>

<div class="scn"><h4>The HA port nobody labelled</h4><p>After a rack move, an HA pair showed the peer as unknown. The state command showed no HA1 connectivity. Link lights were up, but the cables had been swapped between the HA1 and HA2 ports, putting the two subnets on the wrong links. Swapping them back restored HA1 within a minute, and the team added labels and a cabling diagram to the build record.</p><p><b>Lesson:</b> a link light proves a cable, not the right cable.</p></div>

<div class="iv"><p class="q">"An HA pair keeps failing over. How do you troubleshoot?"</p><p>Read the state and reason on both units, then the System log for the trigger. If it is link or path monitoring, check the destination, the upstream device and the timers. If it is heartbeat loss, check HA1 cabling and backups. Check preemption and for flapping links. Fix the cause and test with a controlled suspend and functional cycle.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use a fixed order: state, links, compatibility, sync, monitors, logs, recent changes.</li>
<li>Non-functional usually means a mismatch; split brain means lost HA1 and backups.</li>
<li>Sessions dropping after failover points to session sync or HA2.</li>
<li>Do not push config from the wrong firewall.</li>
<li>Trust the device output, not assumptions.</li>
</ul></div>
`,hi:`
<p>Jab HA ka ticket aata hai, ghabrahat kisi ke kaam nahi aati. Ek fixed order use karo, doctor ki tarah: pehle vital signs, phir links, phir details. Yeh chapter ek repeatable workflow, common faults aur har ek kaisa dikhta hai, yeh deta hai. Isme se kuch bhi simulator mein practise nahi ho sakta kyunki woh HA ko model nahi karta; supporting CLI habits pan-diag aur pan-setup mein practise karo, aur doosre vendors par wahi logic dekhne ke liye nse4-ha aur sec-asa-ha se compare karo.</p>

<h3>Workflow</h3>
<ol>
<li><b>State</b>: har firewall par <code>show high-availability state</code> chalao. Local state, peer state aur reason fields note karo.</li>
<li><b>Links</b>: <code>show high-availability interface ha1</code> aur HA2 ka equivalent chalao. Link up hai, peer address reachable hai, errors hain?</li>
<li><b>Compatibility</b>: model, PAN-OS version, application aur threat content, aur licences match karte hain?</li>
<li><b>Sync</b>: running configuration synchronised dikh rahi hai? State sync (HA2) up hai?</li>
<li><b>Monitors</b>: <code>show high-availability link-monitoring</code> aur <code>show high-availability path-monitoring</code>. Koi group fail hua?</li>
<li><b>Logs</b>: event ke time ke aas-paas HA subsystem ki System log entries padho. Log har state change ki wajah aur timestamp deta hai.</li>
<li><b>Change</b>: poocho ki symptom se just pehle kya badla (upgrade, cable, switch, config).</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Troubleshooting order">
<rect x="8" y="55" width="84" height="56" rx="10" fill="#bae6fd"/><text x="50" y="88" text-anchor="middle" class="svg-ink" font-size="13">1 State</text>
<rect x="104" y="55" width="84" height="56" rx="10" fill="#bbf7d0"/><text x="146" y="88" text-anchor="middle" class="svg-ink" font-size="13">2 Links</text>
<rect x="200" y="55" width="84" height="56" rx="10" fill="#ddd6fe"/><text x="242" y="88" text-anchor="middle" class="svg-ink" font-size="13">3 Compat</text>
<rect x="296" y="55" width="84" height="56" rx="10" fill="#fde68a"/><text x="338" y="88" text-anchor="middle" class="svg-ink" font-size="13">4 Sync</text>
<rect x="392" y="55" width="84" height="56" rx="10" fill="#fed7aa"/><text x="434" y="88" text-anchor="middle" class="svg-ink" font-size="13">5 Monitors</text>
<rect x="488" y="55" width="70" height="56" rx="10" fill="#e2e8f0"/><text x="523" y="88" text-anchor="middle" class="svg-ink" font-size="13">6 Logs</text>
<rect x="570" y="55" width="62" height="56" rx="10" fill="#e2e8f0"/><text x="601" y="88" text-anchor="middle" class="svg-ink" font-size="13">7 Change</text>
</svg><p class="cap">Left se right kaam karo. Steps skip mat karo.</p></div>

<h3>Common faults aur unke signs</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Peer unknown dikhta hai ya HA1 up nahi</td><td>Galat peer-ip, cable, VLAN ya HA path par firewall rule</td><td>HA1 addresses, link lights, ping, encryption keys match</td></tr>
<tr><td>Unit non-functional hai</td><td>Model ya version mismatch, internal fault</td><td>Compatibility fields, System log</td></tr>
<tr><td>Config not synchronised dikhti hai</td><td>Passive unit par changes, failed commit, mismatch</td><td>Active par commit, zaroorat ho to sync-to-remote</td></tr>
<tr><td>Failover chalta hai lekin sessions gir jaate hain</td><td>Session sync off ya HA2 down</td><td>State synchronisation setting aur HA2 status</td></tr>
<tr><td>Baar-baar failovers</td><td>Over-sensitive monitoring, flapping link, preemption</td><td>Monitor logs, timers, destinations</td></tr>
<tr><td>Dono units active</td><td>Split brain: HA1 aur backup dono lost</td><td>HA1 backup, heartbeat backup, cabling</td></tr>
<tr><td>Failover ke baad traffic fail</td><td>Neighbour ARP ya MAC update nahi, port security, routing, licence missing</td><td>Gratuitous ARP behaviour, switch tables, licences</td></tr>
</table>

<h3>HA state ko padhna</h3>
<p>Aapko local firewall aur peer ke fields dikhenge: state, last state change ki wajah, election se jude values (priority, preemption), running-configuration sync status, aur compatibility results. Exact output layout ratta mat maaro; har field ka matlab seekho aur shaanti se padho. Kabhi values invent ya assume mat karo: aapke device ka output hi source of truth hai.</p>

<h3>Logs mein milne wale failover reasons</h3>
<ul>
<li>Peer se heartbeat ya hello loss.</li>
<li>Link-monitoring ya path-monitoring failure.</li>
<li>Administrator ne unit ko suspend kiya.</li>
<li>Higher-priority unit ka preemption.</li>
<li>Internal health ya software fault.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket kehta hai: "Lunchtime par failover hua aur kisi ko wajah nahi pata." Engineer dono firewalls par state command chalata hai, FW-B ko active paata hai, aur FW-A ka System log padhta hai. Log mein ISP router ke liye path-monitoring failure dikhta hai, phir non-functional mein state change, phir kuch minutes baad recovery. Upstream switch ko kisi aur team ne reboot kiya tha. Firewall design ke hisaab se behave hua; fix maintenance ke baare mein communication hai, plus ek doosri monitored destination.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Galat side se sync force karna. <code>sync-to-remote</code> peer ko overwrite karta hai. Push karne se pehle verify karo ki achhi configuration kaun se firewall ke paas hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jab poochha jaaye ki firewall kabhi active kyun nahi banta, to sabse pehle compatibility (model, version, licences) aur HA1 reachability check karo. Jab dono active hon, to split brain socho.</p></div>

<div class="scn"><h4>Woh HA port jise kisi ne label nahi kiya</h4><p>Rack move ke baad ek HA pair mein peer unknown dikha. State command mein HA1 connectivity nahi thi. Link lights up thin, lekin cables HA1 aur HA2 ports ke beech swap ho gayi thin, jisse dono subnets galat links par aa gaye. Unhe wapas swap karne se HA1 ek minute mein restore ho gaya, aur team ne build record mein labels aur cabling diagram jod diye.</p><p><b>Lesson:</b> link light cable prove karti hai, sahi cable nahi.</p></div>

<div class="iv"><p class="q">"HA pair baar-baar failover kar raha hai. Troubleshoot kaise karoge?"</p><p>Dono units par state aur reason padhunga, phir trigger ke liye System log. Agar link ya path monitoring hai to destination, upstream device aur timers check karunga. Agar heartbeat loss hai to HA1 cabling aur backups. Preemption aur flapping links check karunga. Cause fix karke controlled suspend aur functional cycle se test karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fixed order use karo: state, links, compatibility, sync, monitors, logs, recent changes.</li>
<li>Non-functional aam taur par mismatch hai; split brain ka matlab HA1 aur backups lost.</li>
<li>Failover ke baad sessions girna session sync ya HA2 ki taraf ishara karta hai.</li>
<li>Galat firewall se config push mat karo.</li>
<li>Device output par bharosa karo, assumptions par nahi.</li>
</ul></div>
`}};export{e as default};