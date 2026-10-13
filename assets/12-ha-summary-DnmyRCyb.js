var e={id:`ha-summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have built a cluster, read its election, broken its uplink, split its configuration and moved its sessions. This last chapter is your packing list for the exam and for the interview: what you must be able to do, the words you must know, the numbers you must remember, and the traps that cost marks.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Build an active-passive cluster (group-id 20, NILGIRI-HA, hbdev "port3" 100 "port4" 50) and explain why every setting must match.</li>
<li>Read <code>get system ha status</code> line by line: health, members, configuration status, HBDEV and MONDEV blocks.</li>
<li>State the election order with and without override, and give the history text for each reason.</li>
<li>Configure port monitoring and remote link monitoring, and explain weights, threshold and flip timeout.</li>
<li>Explain what is and is not synchronised, and find a differing table with <code>checksum show</code>.</li>
<li>Enable session pickup, say what it copies and what it does not, and test it with <code>execute ha failover set 1</code>.</li>
<li>Reserve a management interface and reach the secondary.</li>
<li>Walk the six-step troubleshooting workflow.</li>
</ul>

<h3>The election order in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Primary election order">
<rect x="20" y="20" width="280" height="44" rx="8" fill="#bae6fd"/><text x="160" y="38" text-anchor="middle" class="svg-ink" font-size="13">override DISABLED</text><text x="160" y="55" text-anchor="middle" class="svg-muted" font-size="12">default</text>
<rect x="340" y="20" width="280" height="44" rx="8" fill="#ddd6fe"/><text x="480" y="38" text-anchor="middle" class="svg-ink" font-size="13">override ENABLED</text><text x="480" y="55" text-anchor="middle" class="svg-muted" font-size="12">on either unit</text>
<rect x="20" y="80" width="280" height="30" rx="6" fill="#e2e8f0"/><text x="160" y="100" text-anchor="middle" class="svg-ink" font-size="12">1 fewer failures (link + ping server)</text>
<rect x="20" y="118" width="280" height="30" rx="6" fill="#e2e8f0"/><text x="160" y="138" text-anchor="middle" class="svg-ink" font-size="12">2 larger HA age (diff above 300 s)</text>
<rect x="20" y="156" width="280" height="30" rx="6" fill="#e2e8f0"/><text x="160" y="176" text-anchor="middle" class="svg-ink" font-size="12">3 higher priority</text>
<rect x="20" y="194" width="280" height="30" rx="6" fill="#e2e8f0"/><text x="160" y="214" text-anchor="middle" class="svg-ink" font-size="12">4 higher serial number</text>
<rect x="340" y="80" width="280" height="30" rx="6" fill="#e2e8f0"/><text x="480" y="100" text-anchor="middle" class="svg-ink" font-size="12">1 fewer failures (link + ping server)</text>
<rect x="340" y="118" width="280" height="30" rx="6" fill="#fde68a"/><text x="480" y="138" text-anchor="middle" class="svg-ink" font-size="12">2 higher priority</text>
<rect x="340" y="156" width="280" height="30" rx="6" fill="#fde68a"/><text x="480" y="176" text-anchor="middle" class="svg-ink" font-size="12">3 larger HA age</text>
<rect x="340" y="194" width="280" height="30" rx="6" fill="#e2e8f0"/><text x="480" y="214" text-anchor="middle" class="svg-ink" font-size="12">4 higher serial number</text>
</svg><p class="cap">With override, priority and age swap places. Failures always come first, the serial always last.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FGCP</dt><dd>FortiGate Clustering Protocol, the HA protocol of this module.</dd>
<dt>hbdev</dt><dd>Heartbeat devices with priorities, for example "port3" 100 "port4" 50.</dd>
<dt>HA age</dt><dd>Time since HA started or the unit booted; reset by monitored-link failure, remote link failure, <code>reset-uptime</code> and <code>execute ha failover set</code>.</dd>
<dt>override</dt><dd>Puts priority before age, so the preferred unit takes the role back at once. Not synchronised.</dd>
<dt>split brain</dt><dd>Both units primary because they cannot see each other over the heartbeat.</dd>
<dt>remote link monitoring</dt><dd>Ping servers (gwdetect, detectserver, ha-priority) that catch failures behind a port that stays up.</dd>
<dt>session pickup</dt><dd>Copies established TCP sessions to the secondary; connectionless adds UDP and ICMP.</dd>
<dt>reserved management interface</dt><dd>Interface with its own IP, MAC and route on each unit, for reaching the secondary.</dd>
<dt>virtual MAC</dt><dd><code>00:09:0f:09:&lt;group-id in hex&gt;:&lt;index&gt;</code> on the primary's data interfaces.</dd>
</dl>

<h3>Most tested facts and defaults</h3>
<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td><code>ha-uptime-diff-margin</code></td><td>300 s</td></tr>
<tr><td><code>hb-interval</code></td><td>2 (units of 100 ms)</td></tr>
<tr><td><code>hb-lost-threshold</code></td><td>6</td></tr>
<tr><td><code>helo-holddown</code></td><td>20 s</td></tr>
<tr><td><code>pingserver-flip-timeout</code></td><td>60 minutes (lab uses 6)</td></tr>
<tr><td>Not synchronised</td><td>host name, priority, override, override-wait-time, reserved-interface entry</td></tr>
<tr><td>Session pickup copies</td><td>TCP only; UDP and ICMP need connectionless</td></tr></table>
<div class="eg"><p><b>Worked example.</b> Heartbeat: hb-interval 2 means 200 ms per heartbeat, and hb-lost-threshold 6 means the peer is declared lost after 6 misses, 1.2 s. Election: FGT-A (priority 200, age 90 s) and FGT-B (priority 100, age 600 s), no failures. The difference of 510 s is above 300 s, so FGT-B wins on age. Set override and FGT-A wins on priority.</p></div>

<h3>Command cheat sheet</h3>
<table class="cmp"><tr><th>Goal</th><th>Command</th></tr>
<tr><td>Role and serial</td><td><code>get system status</code></td></tr>
<tr><td>Cluster state</td><td><code>get system ha status</code>, <code>diagnose sys ha status</code></td></tr>
<tr><td>Election reason</td><td><code>diagnose sys ha history read</code></td></tr>
<tr><td>Failure counters</td><td><code>diagnose sys ha dump-by vcluster</code></td></tr>
<tr><td>Sync check</td><td><code>diagnose sys ha checksum cluster | show | recalculate</code></td></tr>
<tr><td>Reset age</td><td><code>diagnose sys ha reset-uptime</code></td></tr>
<tr><td>Manual failover</td><td><code>execute ha failover set 1</code> / <code>unset 1</code> / <code>status</code></td></tr>
<tr><td>Stop / start sync</td><td><code>execute ha synchronize stop | start</code></td></tr>
<tr><td>Sessions</td><td><code>diagnose sys session list</code>, <code>diagnose sys session stat</code></td></tr></table>

<div class="exam"><p><b>Exam traps.</b> (1) Failures beat everything, also override. (2) Age is compared only when the difference is above the margin. (3) Changing priority without override does nothing in a running cluster. (4) Override on one unit already changes the order. (5) A port that is up behind a dead switch is not a failure without remote link monitoring. (6) Sync-config disabled: the secondary stays out-of-sync, and when it resumes the primary wins. (7) Active-active load balances only what the schedule allows; the simulator does not distribute sessions.</p></div>
<div class="warn"><p><b>Common mistake.</b> Quoting the old rule "highest priority wins" without the word "unless override is disabled and the age differs".</p></div>

<div class="scn"><h4>The exam question, solved in a minute</h4><p>A question shows FGT-A repaired after a link failure, priority 200, no override, FGT-B primary. "Which unit is primary and why?" The candidate recalls that the failure reset FGT-A's age, so the age difference is above 300 s, FGT-B is older and stays primary. Only override would change it.</p><p><b>Lesson:</b> run the order step by step, never guess from priority.</p></div>
<div class="iv"><p class="q">"Walk me through how a FortiGate cluster picks its primary."</p><p>Give the four steps in order, mention the 300 s margin, then the override exception, then the history text as evidence. Close with the troubleshooting workflow.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Election: failures, age, priority, serial; override swaps age and priority.</li>
<li>Defaults: 300 s margin, hb-interval 2, hb-lost-threshold 6, helo-holddown 20, flip timeout 60 min.</li>
<li>Primary always wins configuration sync; some items stay per unit.</li>
<li>Pickup copies TCP by default; connectionless adds UDP and ICMP.</li>
<li>Troubleshoot in order: roles, peers, heartbeat, election, sync, sessions.</li>
</ul></div>
`,hi:`
<p>Aapne cluster banaya, uska election padha, uska uplink tora, uski configuration alag ki aur uske sessions move kiye. Yeh aakhri chapter exam aur interview ke liye aapki packing list hai: kya karna aana chahiye, kaunse words aane chahiye, kaunse numbers yaad rakhne hain, aur kaunse traps marks kaatte hain.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Active-passive cluster banao (group-id 20, NILGIRI-HA, hbdev "port3" 100 "port4" 50) aur samjhao ki har setting match kyun karni chahiye.</li>
<li><code>get system ha status</code> line by line padho: health, members, configuration status, HBDEV aur MONDEV blocks.</li>
<li>Override ke saath aur bina election order batao, aur har reason ka history text do.</li>
<li>Port monitoring aur remote link monitoring configure karo, aur weights, threshold aur flip timeout samjhao.</li>
<li>Samjhao kya synchronise hota hai aur kya nahi, aur <code>checksum show</code> se alag table dhoondo.</li>
<li>Session pickup enable karo, batao kya copy hota hai aur kya nahi, aur <code>execute ha failover set 1</code> se test karo.</li>
<li>Management interface reserve karo aur secondary tak pahuncho.</li>
<li>Chhe-step troubleshooting workflow chalao.</li>
</ul>

<h3>Election order ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Primary election order">
<rect x="20" y="20" width="280" height="44" rx="8" fill="#bae6fd"/><text x="160" y="38" text-anchor="middle" class="svg-ink" font-size="13">override DISABLED</text><text x="160" y="55" text-anchor="middle" class="svg-muted" font-size="12">default</text>
<rect x="340" y="20" width="280" height="44" rx="8" fill="#ddd6fe"/><text x="480" y="38" text-anchor="middle" class="svg-ink" font-size="13">override ENABLED</text><text x="480" y="55" text-anchor="middle" class="svg-muted" font-size="12">kisi bhi unit par</text>
<rect x="20" y="80" width="280" height="30" rx="6" fill="#e2e8f0"/><text x="160" y="100" text-anchor="middle" class="svg-ink" font-size="12">1 kam failures (link + ping server)</text>
<rect x="20" y="118" width="280" height="30" rx="6" fill="#e2e8f0"/><text x="160" y="138" text-anchor="middle" class="svg-ink" font-size="12">2 bigger HA age (diff 300 s se zyada)</text>
<rect x="20" y="156" width="280" height="30" rx="6" fill="#e2e8f0"/><text x="160" y="176" text-anchor="middle" class="svg-ink" font-size="12">3 higher priority</text>
<rect x="20" y="194" width="280" height="30" rx="6" fill="#e2e8f0"/><text x="160" y="214" text-anchor="middle" class="svg-ink" font-size="12">4 higher serial number</text>
<rect x="340" y="80" width="280" height="30" rx="6" fill="#e2e8f0"/><text x="480" y="100" text-anchor="middle" class="svg-ink" font-size="12">1 kam failures (link + ping server)</text>
<rect x="340" y="118" width="280" height="30" rx="6" fill="#fde68a"/><text x="480" y="138" text-anchor="middle" class="svg-ink" font-size="12">2 higher priority</text>
<rect x="340" y="156" width="280" height="30" rx="6" fill="#fde68a"/><text x="480" y="176" text-anchor="middle" class="svg-ink" font-size="12">3 bigger HA age</text>
<rect x="340" y="194" width="280" height="30" rx="6" fill="#e2e8f0"/><text x="480" y="214" text-anchor="middle" class="svg-ink" font-size="12">4 higher serial number</text>
</svg><p class="cap">Override ke saath priority aur age jagah badal lete hain. Failures hamesha pehle, serial hamesha aakhir mein.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FGCP</dt><dd>FortiGate Clustering Protocol, is module ka HA protocol.</dd>
<dt>hbdev</dt><dd>Priorities ke saath heartbeat devices, jaise "port3" 100 "port4" 50.</dd>
<dt>HA age</dt><dd>HA start hone ya unit boot hone ke baad ka time; monitored-link failure, remote link failure, <code>reset-uptime</code> aur <code>execute ha failover set</code> se reset hota hai.</dd>
<dt>override</dt><dd>Priority ko age se pehle rakhta hai, taaki preferred unit role turant wapas le. Synchronise nahi hota.</dd>
<dt>split brain</dt><dd>Dono units primary kyunki woh heartbeat par ek doosre ko nahi dekh paate.</dd>
<dt>remote link monitoring</dt><dd>Ping servers (gwdetect, detectserver, ha-priority) jo us port ke peeche ki failure pakadte hain jo up rehta hai.</dd>
<dt>session pickup</dt><dd>Established TCP sessions secondary par copy karta hai; connectionless UDP aur ICMP jodta hai.</dd>
<dt>reserved management interface</dt><dd>Har unit par apne IP, MAC aur route wala interface, secondary tak pahunchne ke liye.</dd>
<dt>virtual MAC</dt><dd>Primary ke data interfaces par <code>00:09:0f:09:&lt;group-id in hex&gt;:&lt;index&gt;</code>.</dd>
</dl>

<h3>Sabse zyada tested facts aur defaults</h3>
<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td><code>ha-uptime-diff-margin</code></td><td>300 s</td></tr>
<tr><td><code>hb-interval</code></td><td>2 (100 ms ki units)</td></tr>
<tr><td><code>hb-lost-threshold</code></td><td>6</td></tr>
<tr><td><code>helo-holddown</code></td><td>20 s</td></tr>
<tr><td><code>pingserver-flip-timeout</code></td><td>60 minutes (lab mein 6)</td></tr>
<tr><td>Synchronise nahi hota</td><td>host name, priority, override, override-wait-time, reserved-interface entry</td></tr>
<tr><td>Session pickup copy karta hai</td><td>Sirf TCP; UDP aur ICMP ke liye connectionless chahiye</td></tr></table>
<div class="eg"><p><b>Worked example.</b> Heartbeat: hb-interval 2 matlab 200 ms per heartbeat, aur hb-lost-threshold 6 matlab 6 misses ke baad peer lost, yaani 1.2 s. Election: FGT-A (priority 200, age 90 s) aur FGT-B (priority 100, age 600 s), koi failure nahi. 510 s ka difference 300 s se zyada hai, isliye FGT-B age par jeetta hai. Override set karo to FGT-A priority par jeetta hai.</p></div>

<h3>Command cheat sheet</h3>
<table class="cmp"><tr><th>Goal</th><th>Command</th></tr>
<tr><td>Role aur serial</td><td><code>get system status</code></td></tr>
<tr><td>Cluster state</td><td><code>get system ha status</code>, <code>diagnose sys ha status</code></td></tr>
<tr><td>Election reason</td><td><code>diagnose sys ha history read</code></td></tr>
<tr><td>Failure counters</td><td><code>diagnose sys ha dump-by vcluster</code></td></tr>
<tr><td>Sync check</td><td><code>diagnose sys ha checksum cluster | show | recalculate</code></td></tr>
<tr><td>Age reset</td><td><code>diagnose sys ha reset-uptime</code></td></tr>
<tr><td>Manual failover</td><td><code>execute ha failover set 1</code> / <code>unset 1</code> / <code>status</code></td></tr>
<tr><td>Sync stop / start</td><td><code>execute ha synchronize stop | start</code></td></tr>
<tr><td>Sessions</td><td><code>diagnose sys session list</code>, <code>diagnose sys session stat</code></td></tr></table>

<div class="exam"><p><b>Exam traps.</b> (1) Failures sabse upar, override se bhi. (2) Age tabhi compare hoti hai jab difference margin se zyada ho. (3) Override ke bina priority badalne se running cluster mein kuch nahi hota. (4) Sirf ek unit par override bhi order badal deta hai. (5) Dead switch ke peeche up port remote link monitoring ke bina failure nahi hai. (6) Sync-config disabled: secondary out-of-sync rehta hai, aur resume hone par primary jeetta hai. (7) Active-active sirf utna load balance karta hai jitna schedule allow kare; simulator sessions distribute nahi karta.</p></div>
<div class="warn"><p><b>Common mistake.</b> Purana rule "highest priority wins" bolna, "jab tak override disabled ho aur age alag ho" ke bina.</p></div>

<div class="scn"><h4>Exam ka sawal, ek minute mein hal</h4><p>Ek question mein link failure ke baad repair hua FGT-A hai, priority 200, override nahi, FGT-B primary. "Primary kaunsa unit hai aur kyun?" Candidate ko yaad aata hai ki failure ne FGT-A ki age reset ki, isliye age difference 300 s se zyada hai, FGT-B purana hai aur primary rehta hai. Sirf override ise badalta.</p><p><b>Lesson:</b> order step by step chalao, priority se andaza mat lagao.</p></div>
<div class="iv"><p class="q">"FortiGate cluster apna primary kaise chunta hai, samjhao."</p><p>Chaar steps order mein batao, 300 s margin bolo, phir override ka exception, phir saboot ke taur par history text. End mein troubleshooting workflow batao.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Election: failures, age, priority, serial; override age aur priority ki jagah badalta hai.</li>
<li>Defaults: 300 s margin, hb-interval 2, hb-lost-threshold 6, helo-holddown 20, flip timeout 60 min.</li>
<li>Configuration sync mein primary hamesha jeetta hai; kuch items per unit rehte hain.</li>
<li>Pickup default mein TCP copy karta hai; connectionless UDP aur ICMP jodta hai.</li>
<li>Troubleshoot order mein: roles, peers, heartbeat, election, sync, sessions.</li>
</ul></div>
`}};export{e as default};