var e={id:`troubleshooting`,h:{en:`Troubleshooting HA: workflow, split brain and out-of-sync units`,hi:`HA troubleshooting: workflow, split brain aur out-of-sync units`},body:{en:`
<p>When an HA cluster misbehaves, the symptoms are confusing: a unit that will not join, two primaries, a cluster that flaps, or a secondary stuck out of sync. A fixed workflow stops you guessing. This chapter gives that workflow, the usual causes, and the commands to prove each one. The commands are real FortiOS commands, not run in the simulator; for general packet and session diagnostics practise the sniffer and debug tools in the <b>nse4-diag</b> module.</p>

<h3>The workflow: six questions in order</h3>
<ol>
<li><b>Do the units see each other?</b> Run <code>get system ha status</code> on each. If each shows only itself, they are not communicating on the heartbeat links.</li>
<li><b>Do the matching settings really match?</b> Compare group name, password, group ID, mode and heartbeat interfaces with <code>show system ha</code> on both units.</li>
<li><b>Are model and firmware identical?</b> Compare <code>get system status</code> on both units. A different build prevents a clean cluster.</li>
<li><b>Is the heartbeat path physically good?</b> Check cables, link lights, switch ports and VLANs. If the heartbeat goes through a switch, confirm the switch forwards these frames and that no loop protection is blocking the port.</li>
<li><b>Who is primary and why?</b> Read the selection reason in <code>get system ha status</code> and the history. Apply the election order: monitored interfaces, age, priority, serial.</li>
<li><b>Is the configuration in sync?</b> Compare <code>diagnose sys ha checksum cluster</code> from both units and use <code>checksum show</code> to find the section that differs.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="HA troubleshooting flow">
<rect x="10" y="30" width="190" height="50" rx="10" fill="#bae6fd"/><text x="105" y="60" text-anchor="middle" class="svg-ink" font-size="12">Peers visible?</text>
<rect x="225" y="30" width="190" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="12">Settings and firmware match?</text>
<rect x="440" y="30" width="190" height="50" rx="10" fill="#fde68a"/><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="12">Heartbeat path good?</text>
<rect x="10" y="100" width="190" height="50" rx="10" fill="#fed7aa"/><text x="105" y="130" text-anchor="middle" class="svg-ink" font-size="12">Why this primary?</text>
<rect x="225" y="100" width="190" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">Checksums equal?</text>
<rect x="440" y="100" width="190" height="50" rx="10" fill="#e2e8f0"/><text x="535" y="130" text-anchor="middle" class="svg-ink" font-size="12">Read HA history</text>
</svg><p class="cap">Work through the questions in order; stop at the first failure.</p></div>

<h3>Common problems and fixes</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>Unit will not join; each says it is alone</td><td>Mismatched group name, password, group ID or mode; heartbeat cable or VLAN wrong</td><td>Compare <code>show system ha</code>; verify cabling and the switch path</td></tr>
<tr><td>Two primaries (split brain)</td><td>All heartbeat links down while data links are up</td><td>Restore heartbeat; use two or more links; check the switch; reset the unintended primary</td></tr>
<tr><td>Cluster flaps between units</td><td>Override enabled with an unstable unit; a flapping monitored link; aggressive heartbeat timers</td><td>Fix the link; disable override; relax timers</td></tr>
<tr><td>Secondary out of sync</td><td>Firmware mismatch; sync interrupted; a failed object</td><td>Match firmware; check checksums by section; re-sync</td></tr>
<tr><td>No failover on uplink loss</td><td>Interface not in the monitor list</td><td>Add <code>monitor</code> interfaces; test</td></tr>
<tr><td>Wrong unit is primary after reboot</td><td>Age, priority and override interaction</td><td>Apply the election order; decide on override</td></tr>
<tr><td>Cannot reach the secondary</td><td>No reserved management interface</td><td>Configure <code>ha-mgmt-status</code>; or use <code>execute ha manage</code></td></tr></table>

<h3>Understanding split brain</h3>
<p><b>Split brain</b> means both units believe they are primary. It happens when the heartbeat fails but data interfaces stay up. Each unit sees silence from the peer and takes the role. Both then answer on the same virtual MAC and IP, which causes intermittent drops, duplicate-address warnings in switch logs and strange application errors. The defences are redundant heartbeat links on separate paths, monitored interfaces, and sensible timers. If it happens, restore the heartbeat first and the units will re-elect one primary; check afterwards that the configuration on both units is the one you want, because the unit that rejoins as secondary takes the primary's configuration.</p>

<h3>Debugging tools</h3>
<ul>
<li><code>diagnose sys ha history read</code> shows the sequence of events and reasons.</li>
<li><code>diagnose debug application hasync -1</code> and <code>diagnose debug application hatalk -1</code> trace configuration synchronisation and cluster communication. Use <code>diagnose debug enable</code> to start and <code>diagnose debug disable</code> to stop, and keep it short on a busy device.</li>
<li><code>diagnose sys ha dump-by</code> (with its sub-options) shows internal cluster details when support asks for them.</li>
<li>The event log records HA state changes; export it before you reboot anything.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A secondary will not join. <code>get system ha status</code> on FGT-B shows only itself. Comparing <code>show system ha</code> reveals the group name "NK-HQ-CLUSTER" on FGT-A and "NK-HQ-CLUSTr" on FGT-B: one typo. The engineer fixes the name, FGT-B joins within a minute, the checksums match, and the incident is closed with a note to copy HA settings from a template next time.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Rebooting units before collecting the HA history and logs. Changing several settings at once so the cause is never proven. Debugging with a heavy debug level on a busy firewall and slowing it down. Forgetting to turn debug off.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a question shows two units each reporting themselves as primary, the answer is heartbeat failure (split brain), not an election problem. If one unit is simply not joining, suspect mismatched group settings or firmware first.</p></div>

<div class="scn"><h4>Intermittent drops traced to a duplicate primary</h4><p>Users at a campus complained of random drops every few minutes. Switch logs showed the virtual MAC flapping between two ports. Both FortiGates were primary. The only heartbeat cable ran through a patch panel that a contractor had moved, so heartbeat was down while data links stayed up. After the cable was restored the units re-elected, and the team added a second heartbeat cable on a separate route.</p><p><b>Lesson:</b> a single heartbeat path turns one cable fault into a split brain.</p></div>

<div class="iv"><p class="q">"Two FortiGates both claim to be primary. What do you do?"</p><p>That is split brain: the heartbeat is down while the data links are up. I would restore the heartbeat path first, check cables, ports and the switch, then confirm one primary is elected and that the configuration is in sync. Afterwards I would add a redundant heartbeat link and review the HA history to confirm the root cause.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow the workflow: peers, settings, firmware, heartbeat, election, sync.</li>
<li>Split brain means heartbeat is down while data links are up.</li>
<li>Typos in group name or password are a common reason a unit will not join.</li>
<li>Use the HA history and checksum commands before rebooting anything.</li>
<li>Keep debug sessions short and turn them off.</li>
</ul></div>
`,hi:`
<p>HA cluster ghalat behave kare to symptoms confusing hote hain: unit join nahi hota, do primaries, cluster flap karta hai, ya secondary out of sync atka rehta hai. Fixed workflow aapko andaaza lagane se rokta hai. Yeh chapter woh workflow, usual causes aur har ek ko prove karne ke commands deta hai. Commands asli FortiOS commands hain, simulator mein nahi chalaye gaye; general packet aur session diagnostics ke liye <b>nse4-diag</b> module mein sniffer aur debug tools ki practice karo.</p>

<h3>Workflow: kram se chhe sawaal</h3>
<ol>
<li><b>Kya units ek-doosre ko dekhte hain?</b> Har ek par <code>get system ha status</code> chalao. Har ek sirf khud ko dikhaye to woh heartbeat links par baat nahi kar rahe.</li>
<li><b>Kya matching settings sach mein match karti hain?</b> Dono units par <code>show system ha</code> se group name, password, group ID, mode aur heartbeat interfaces compare karo.</li>
<li><b>Kya model aur firmware identical hain?</b> Dono par <code>get system status</code> compare karo. Alag build clean cluster banne se rokta hai.</li>
<li><b>Kya heartbeat path physically theek hai?</b> Cables, link lights, switch ports aur VLANs check karo. Heartbeat switch se guzarta ho to confirm karo ki switch ye frames forward karta hai aur koi loop protection port block nahi kar rahi.</li>
<li><b>Primary kaun hai aur kyun?</b> <code>get system ha status</code> aur history mein selection reason padho. Election order lagao: monitored interfaces, age, priority, serial.</li>
<li><b>Kya configuration in sync hai?</b> Dono units se <code>diagnose sys ha checksum cluster</code> compare karo aur alag hone wala section dhoondhne ke liye <code>checksum show</code> use karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="HA troubleshooting flow">
<rect x="10" y="30" width="190" height="50" rx="10" fill="#bae6fd"/><text x="105" y="60" text-anchor="middle" class="svg-ink" font-size="12">Peers dikhte hain?</text>
<rect x="225" y="30" width="190" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="12">Settings aur firmware match?</text>
<rect x="440" y="30" width="190" height="50" rx="10" fill="#fde68a"/><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="12">Heartbeat path theek?</text>
<rect x="10" y="100" width="190" height="50" rx="10" fill="#fed7aa"/><text x="105" y="130" text-anchor="middle" class="svg-ink" font-size="12">Yahi primary kyun?</text>
<rect x="225" y="100" width="190" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">Checksums equal?</text>
<rect x="440" y="100" width="190" height="50" rx="10" fill="#e2e8f0"/><text x="535" y="130" text-anchor="middle" class="svg-ink" font-size="12">HA history padho</text>
</svg><p class="cap">Sawaal kram se karo; pehle failure par ruk jao.</p></div>

<h3>Common problems aur fixes</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>Unit join nahi hota; har ek kehta hai woh akela hai</td><td>Group name, password, group ID ya mode mismatch; heartbeat cable ya VLAN galat</td><td><code>show system ha</code> compare karo; cabling aur switch path verify karo</td></tr>
<tr><td>Do primaries (split brain)</td><td>Saare heartbeat links down jabki data links up</td><td>Heartbeat restore karo; do ya zyada links; switch check karo; unintended primary reset karo</td></tr>
<tr><td>Cluster units ke beech flap karta hai</td><td>Unstable unit ke saath override enabled; flapping monitored link; aggressive heartbeat timers</td><td>Link fix karo; override disable karo; timers relax karo</td></tr>
<tr><td>Secondary out of sync</td><td>Firmware mismatch; sync beech mein ruka; koi object fail hua</td><td>Firmware match karo; section ke hisaab se checksums dekho; re-sync</td></tr>
<tr><td>Uplink loss par failover nahi</td><td>Interface monitor list mein nahi</td><td><code>monitor</code> interfaces add karo; test karo</td></tr>
<tr><td>Reboot ke baad galat unit primary</td><td>Age, priority aur override ka interaction</td><td>Election order lagao; override par decide karo</td></tr>
<tr><td>Secondary tak pahunch nahi sakte</td><td>Reserved management interface nahi hai</td><td><code>ha-mgmt-status</code> configure karo; ya <code>execute ha manage</code> use karo</td></tr></table>

<h3>Split brain samajhna</h3>
<p><b>Split brain</b> ka matlab dono units maante hain ki woh primary hain. Yeh tab hota hai jab heartbeat fail ho lekin data interfaces up rahein. Har unit peer se khamoshi dekhta hai aur role le leta hai. Phir dono same virtual MAC aur IP par jawab dete hain, jisse intermittent drops, switch logs mein duplicate-address warnings aur ajeeb application errors aate hain. Bachaav hain alag paths par redundant heartbeat links, monitored interfaces aur sensible timers. Ho jaaye to pehle heartbeat restore karo aur units dobara ek primary elect karenge; baad mein check karo ki dono units par configuration wahi hai jo aap chahte ho, kyunki secondary ki tarah rejoin hone wala unit primary ki configuration le leta hai.</p>

<h3>Debugging tools</h3>
<ul>
<li><code>diagnose sys ha history read</code> events ka sequence aur reasons dikhata hai.</li>
<li><code>diagnose debug application hasync -1</code> aur <code>diagnose debug application hatalk -1</code> configuration synchronisation aur cluster communication trace karte hain. Shuru karne ke liye <code>diagnose debug enable</code> aur rokne ke liye <code>diagnose debug disable</code>, aur busy device par ise chhota rakho.</li>
<li><code>diagnose sys ha dump-by</code> (apne sub-options ke saath) internal cluster details dikhata hai jab support maange.</li>
<li>Event log HA state changes record karta hai; kuch bhi reboot karne se pehle use export karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek secondary join nahi karta. FGT-B par <code>get system ha status</code> sirf khud ko dikhata hai. <code>show system ha</code> compare karne par FGT-A par group name "NK-HQ-CLUSTER" aur FGT-B par "NK-HQ-CLUSTr" milta hai: ek typo. Engineer naam theek karta hai, FGT-B ek minute mein join ho jaata hai, checksums match karte hain, aur incident is note ke saath close hota hai ki agli baar HA settings template se copy karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> HA history aur logs collect kiye bina units reboot karna. Ek saath kai settings badalna taaki cause kabhi prove na ho. Busy firewall par heavy debug level se debug karke use slow kar dena. Debug off karna bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Question mein do units dikhe jo dono khud ko primary report karte hain to jawab heartbeat failure (split brain) hai, election problem nahi. Ek unit sirf join nahi ho raha ho to pehle mismatched group settings ya firmware par shak karo.</p></div>

<div class="scn"><h4>Intermittent drops jo duplicate primary se nikle</h4><p>Campus ke users ne har kuch minute mein random drops ki shikayat ki. Switch logs mein virtual MAC do ports ke beech flap kar raha tha. Dono FortiGates primary the. Akela heartbeat cable ek patch panel se jaata tha jise contractor ne hila diya tha, isliye heartbeat down tha jabki data links up. Cable restore hone ke baad units ne dobara elect kiya, aur team ne alag route par doosra heartbeat cable add kiya.</p><p><b>Lesson:</b> akela heartbeat path ek cable fault ko split brain bana deta hai.</p></div>

<div class="iv"><p class="q">"Do FortiGates dono khud ko primary bol rahe hain. Aap kya karoge?"</p><p>Yeh split brain hai: heartbeat down hai jabki data links up hain. Main pehle heartbeat path restore karoonga, cables, ports aur switch check karoonga, phir confirm karoonga ki ek primary elect hua aur configuration in sync hai. Baad mein redundant heartbeat link add karoonga aur root cause confirm karne ke liye HA history review karoonga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow follow karo: peers, settings, firmware, heartbeat, election, sync.</li>
<li>Split brain ka matlab heartbeat down jabki data links up.</li>
<li>Group name ya password ka typo unit ke join na hone ka common karan hai.</li>
<li>Kuch bhi reboot karne se pehle HA history aur checksum commands use karo.</li>
<li>Debug sessions chhote rakho aur unhe off karo.</li>
</ul></div>
`}};export{e as default};