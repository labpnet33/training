var e={id:`summary-capstone`,h:{en:`Summary and exam checklist, with the capstone`,hi:`Summary aur exam checklist, capstone ke saath`},body:{en:`
<p>You now know how to run the Pune branch engine day to day: form and fail a cluster, read node states, browse logs, raise alerts, roll back a bad policy and troubleshoot in a fixed order. This last chapter pulls everything together and prepares you for the capstone. Remember the positioning: independent training based on published documentation, with no claim of covering any certification. If you plan to sit an exam, check the current training and certification pages of the vendor before you book.</p>

<h3>Analogy: the final drive test</h3>
<p>A driving school ends with a test on a real road, where small surprises appear. The capstone is that road test: the whole branch, with faults planted for you to find.</p>

<h3>The four labs and what each proves</h3>
<table class="cmp"><tr><th>Lab</th><th>Task</th><th>Skill proved</th></tr>
<tr><td>fp-ops-1</td><td>Form a two-node cluster, fail a node</td><td>CVI, NDI, node states, failover side effects</td></tr>
<tr><td>fp-ops-2</td><td>Find why traffic is denied using Logs</td><td>Reading the deciding rule, Discard versus Refuse</td></tr>
<tr><td>fp-ops-3</td><td>Roll back a bad policy</td><td>Snapshot, Restore to SMC, then Install</td></tr>
<tr><td>fp-ops-4</td><td>Alert on engine offline</td><td>Alert rule, status versus alert</td></tr>
</table>
<p>Every lab passes only after Install policy. If a check fails, ask first: did I install?</p>

<h3>The capstone: Branch build plus ten injected faults</h3>
<p>The capstone (fp-ops-cap) hands you the Pune branch with the pieces of this whole track: SMC NK-SMC at 10.0.0.10, the engine NK-PUNE-FW in cluster form with FW1A and FW1B, a WAN, the Staff LAN, the DMZ with WEB1, NAT, inspection and VPN. Ten faults have been injected. Some are in contact and status, some in policy, NAT, inspection or VPN, and some in the cluster or the alert setup. You will not be told which is which. The method from chapter 6 is your tool.</p>
<ol>
<li>Start with status of every node and the contact cause text.</li>
<li>Compare installed with pending; note the snapshot list.</li>
<li>Walk the eight steps for each user complaint in the ticket list.</li>
<li>Fix one fault, Install policy, retest, read the new log line, record the cause.</li>
<li>If a change makes things worse, use the snapshot rollback.</li>
<li>Finish with an engine-offline alert rule and a cluster that can lose one node.</li>
</ol>
<p>Plan about one fault per install. The checks read only the installed layer, so a perfect SMC with no install scores nothing.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Capstone workflow">
<rect x="20" y="20" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="13">Read symptoms</text>
<rect x="190" y="20" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="255" y="55" text-anchor="middle" class="svg-ink" font-size="13">Eight-step order</text>
<rect x="360" y="20" width="130" height="60" rx="8" fill="#fde68a"/><text x="425" y="55" text-anchor="middle" class="svg-ink" font-size="13">One fix</text>
<rect x="520" y="20" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="570" y="55" text-anchor="middle" class="svg-ink" font-size="13">Install</text>
<rect x="190" y="140" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="255" y="175" text-anchor="middle" class="svg-ink" font-size="13">Retest, logs</text>
<rect x="360" y="140" width="130" height="60" rx="8" fill="#fed7aa"/><text x="425" y="175" text-anchor="middle" class="svg-ink" font-size="13">Worse? Rollback</text>
<line x1="150" y1="50" x2="190" y2="50" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="360" y2="50" stroke="#64748b" stroke-width="2"/><line x1="490" y1="50" x2="520" y2="50" stroke="#64748b" stroke-width="2"/>
<line x1="570" y1="80" x2="570" y2="170" stroke="#64748b" stroke-width="2"/><line x1="570" y1="170" x2="490" y2="170" stroke="#64748b" stroke-width="2"/><line x1="360" y1="170" x2="320" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The loop repeats ten times. Evidence from the logs closes each loop.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain CVI, NDI, heartbeat, standby and balancing modes.</li>
<li>State that the lab has no connection state sync and that failover clears connections and ARP caches.</li>
<li>Name the node states and the sg-cluster options, and say when safe-offline refuses.</li>
<li>Filter logs and name the deciding rule; distinguish Discard from Refuse; list log levels.</li>
<li>Explain why no alert appears without an alert rule or an Alert-level rule.</li>
<li>Do Restore to SMC followed by Install policy, and say why the revision number rises.</li>
<li>Describe backup and upgrade as concepts, with the SMC upgraded first.</li>
<li>Run the eight-step troubleshooting order from memory.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CVI</dt><dd>Cluster virtual IP address, the shared gateway address.</dd>
<dt>NDI</dt><dd>Node dedicated IP address, unique to one node.</dd>
<dt>Heartbeat</dt><dd>Private link where nodes tell each other they are alive.</dd>
<dt>Locked online / offline</dt><dd>A node state pinned against ordinary commands.</dd>
<dt>Policy snapshot</dt><dd>Numbered copy of policies stored at each install.</dd>
<dt>Restore to SMC</dt><dd>Copies a snapshot back into the SMC; the engine is unchanged until Install.</dd>
<dt>Alert rule</dt><dd>Rule that turns an event, such as engine offline, into an alert.</dd>
<dt>Policy match</dt><dd>Tool showing which rule would decide for given traffic.</dd>
</dl>

<h3>Most tested facts</h3>
<div class="exam"><p><b>Memorise.</b> First online node owns the CVI. Failover clears connections. Log levels: None, Transient, Stored, Essential, Alert; default Stored. Discard is silent; Refuse answers. Access rules match original addresses; NAT follows Allow. Install is the boundary between SMC and engine. Status is not an alert. Rollback is restore plus install.</p></div>

<div class="eg"><p><b>Worked example.</b> Self-test in your head: a user reports a timeout to WEB1. You check Online status, no pending changes, route present, Policy match shows Discard by rule 12. You fix the rule, install, and the new log line says Allow. You have used five of the eight steps and can explain each.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating the capstone as a rule-editing exercise only. Several faults live in status, contact, cluster state or alerts.</p></div>

<div class="scn"><h4>Handover day</h4><p>A junior engineer was asked to take over the Pune branch. Her handover note listed: cluster states and who holds locks, the installed revision, the alert rule, the last good snapshot and the eight-step order. When a ticket arrived on her first Monday, she resolved it in ten minutes using the note.</p><p><b>Lesson:</b> operations skill is as much about habits and notes as about commands.</p></div>

<div class="iv"><p class="q">"How would you prove to a new team that a firewall change is safe?"</p><p>Strong answer: review pending changes, install in a window, test with Policy match and real traffic, confirm in the logs, keep the previous snapshot ready for rollback, and have an alert for node loss. Mention that you check the documentation for your NGFW version for anything the simulator does not model.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cluster, node states, logs, alerts, snapshots and the fixed order make up operations.</li>
<li>All labs and the capstone pass only after Install policy.</li>
<li>The capstone hides ten faults across the whole track; follow the order.</li>
<li>Backup and upgrade are concepts: verify details in your version documentation.</li>
<li>This is independent training and does not claim certification coverage.</li>
</ul></div>
`,hi:`
<p>Ab aap Pune branch engine ko roz chalana jaante ho: cluster banana aur fail karna, node states padhna, logs browse karna, alerts raise karna, bad policy rollback karna aur fixed order mein troubleshoot karna. Yeh aakhri chapter sab kuch jodta hai aur capstone ke liye taiyar karta hai. Positioning yaad rakho: independent training, published documentation par based, kisi certification ko cover karne ka claim nahi. Exam dene ka plan ho to book karne se pehle vendor ke current training aur certification pages check karo.</p>

<h3>Analogy: final drive test</h3>
<p>Driving school ka ant asli sadak par test se hota hai, jahan chhote surprises aate hain. Capstone wahi road test hai: poora branch, jisme aapke dhundhne ke liye faults lagaye gaye hain.</p>

<h3>Chaar labs aur har ek kya saabit karta hai</h3>
<table class="cmp"><tr><th>Lab</th><th>Task</th><th>Skill</th></tr>
<tr><td>fp-ops-1</td><td>Do-node cluster banao, ek node fail karo</td><td>CVI, NDI, node states, failover side effects</td></tr>
<tr><td>fp-ops-2</td><td>Logs se pata lagao traffic kyun deny hai</td><td>Deciding rule padhna, Discard versus Refuse</td></tr>
<tr><td>fp-ops-3</td><td>Bad policy rollback karo</td><td>Snapshot, Restore to SMC, phir Install</td></tr>
<tr><td>fp-ops-4</td><td>Engine offline par alert</td><td>Alert rule, status versus alert</td></tr>
</table>
<p>Har lab sirf Install policy ke baad pass hota hai. Check fail ho to pehle pucho: kya maine install kiya?</p>

<h3>Capstone: Branch build plus ten injected faults</h3>
<p>Capstone (fp-ops-cap) aapko Pune branch deta hai jisme is poore track ke hisse hain: SMC NK-SMC 10.0.0.10 par, engine NK-PUNE-FW cluster form mein FW1A aur FW1B ke saath, ek WAN, Staff LAN, WEB1 wala DMZ, NAT, inspection aur VPN. Das faults inject kiye gaye hain. Kuch contact aur status mein, kuch policy, NAT, inspection ya VPN mein, aur kuch cluster ya alert setup mein. Aapko nahi bataya jayega ki kaunsa kahan hai. Chapter 6 ka method aapka tool hai.</p>
<ol>
<li>Har node ke status aur contact cause text se shuru karo.</li>
<li>Installed ko pending se compare karo; snapshot list note karo.</li>
<li>Ticket list ki har user complaint ke liye aath steps chalo.</li>
<li>Ek fault fix karo, Install policy, retest, nayi log line padho, cause record karo.</li>
<li>Change se halat bigde to snapshot rollback use karo.</li>
<li>Ant mein engine-offline alert rule lagao aur aisa cluster jo ek node kho sake.</li>
</ol>
<p>Lagbhag ek install mein ek fault plan karo. Checks sirf installed layer padhte hain, isliye install ke bina perfect SMC ka koi score nahi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Capstone workflow">
<rect x="20" y="20" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="13">Symptoms padho</text>
<rect x="190" y="20" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="255" y="55" text-anchor="middle" class="svg-ink" font-size="13">Aath-step order</text>
<rect x="360" y="20" width="130" height="60" rx="8" fill="#fde68a"/><text x="425" y="55" text-anchor="middle" class="svg-ink" font-size="13">Ek fix</text>
<rect x="520" y="20" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="570" y="55" text-anchor="middle" class="svg-ink" font-size="13">Install</text>
<rect x="190" y="140" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="255" y="175" text-anchor="middle" class="svg-ink" font-size="13">Retest, logs</text>
<rect x="360" y="140" width="130" height="60" rx="8" fill="#fed7aa"/><text x="425" y="175" text-anchor="middle" class="svg-ink" font-size="13">Bigda? Rollback</text>
<line x1="150" y1="50" x2="190" y2="50" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="360" y2="50" stroke="#64748b" stroke-width="2"/><line x1="490" y1="50" x2="520" y2="50" stroke="#64748b" stroke-width="2"/>
<line x1="570" y1="80" x2="570" y2="170" stroke="#64748b" stroke-width="2"/><line x1="570" y1="170" x2="490" y2="170" stroke="#64748b" stroke-width="2"/><line x1="360" y1="170" x2="320" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Loop das baar repeat hota hai. Logs ki evidence har loop band karti hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>CVI, NDI, heartbeat, standby aur balancing modes samjhao.</li>
<li>Batao ki lab mein connection state sync nahi hai aur failover connections aur ARP caches clear karta hai.</li>
<li>Node states aur sg-cluster options ke naam lo, aur batao safe-offline kab refuse karta hai.</li>
<li>Logs filter karo aur deciding rule batao; Discard aur Refuse mein farak batao; log levels ginao.</li>
<li>Samjhao ki alert rule ya Alert-level rule ke bina alert kyun nahi aata.</li>
<li>Restore to SMC ke baad Install policy karo, aur batao revision number kyun badhta hai.</li>
<li>Backup aur upgrade ko concepts ki tarah describe karo, SMC pehle upgrade hota hai.</li>
<li>Aath-step troubleshooting order yaad se chalao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CVI</dt><dd>Cluster virtual IP address, shared gateway address.</dd>
<dt>NDI</dt><dd>Node dedicated IP address, ek node ka unique address.</dd>
<dt>Heartbeat</dt><dd>Private link jahan nodes ek dusre ko batate hain ki woh zinda hain.</dd>
<dt>Locked online / offline</dt><dd>Normal commands ke khilaf pinned node state.</dd>
<dt>Policy snapshot</dt><dd>Har install par store hui policies ki numbered copy.</dd>
<dt>Restore to SMC</dt><dd>Snapshot ko SMC mein wapas copy karta hai; Install tak engine unchanged.</dd>
<dt>Alert rule</dt><dd>Rule jo event, jaise engine offline, ko alert mein badalta hai.</dd>
<dt>Policy match</dt><dd>Tool jo dikhata hai diye gaye traffic ke liye kaunsa rule decide karega.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<div class="exam"><p><b>Yaad karo.</b> Pehla online node CVI ka owner hai. Failover connections clear karta hai. Log levels: None, Transient, Stored, Essential, Alert; default Stored. Discard silent hai; Refuse jawab deta hai. Access rules original addresses match karte hain; NAT Allow ke baad aata hai. Install SMC aur engine ke beech ki boundary hai. Status alert nahi hai. Rollback matlab restore plus install.</p></div>

<div class="eg"><p><b>Worked example.</b> Dimaag mein self-test: user WEB1 tak timeout bata raha hai. Aap Online status, koi pending nahi, route present dekhte ho, Policy match rule 12 se Discard dikhata hai. Rule fix karte ho, install karte ho, aur nayi log line Allow kehti hai. Aapne aath mein se paanch steps use kiye aur har ek samjha sakte ho.</p></div>

<div class="warn"><p><b>Common galti.</b> Capstone ko sirf rule-editing exercise samajhna. Kai faults status, contact, cluster state ya alerts mein hote hain.</p></div>

<div class="scn"><h4>Handover ka din</h4><p>Ek junior engineer ko Pune branch sambhalne ko kaha gaya. Handover note mein tha: cluster states aur locks kiske paas hain, installed revision, alert rule, last good snapshot aur aath-step order. Pehle Monday ko ticket aaya to usne note se das minute mein resolve kar diya.</p><p><b>Seekh:</b> operations skill utni hi habits aur notes ki hai jitni commands ki.</p></div>

<div class="iv"><p class="q">"Nayi team ko kaise saabit karoge ki firewall change safe hai?"</p><p>Strong answer: pending changes review karo, window mein install karo, Policy match aur real traffic se test karo, logs mein confirm karo, rollback ke liye pichla snapshot ready rakho, aur node loss ke liye alert rakho. Batao ki jo simulator model nahi karta uske liye apne NGFW version ki documentation check karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cluster, node states, logs, alerts, snapshots aur fixed order milkar operations banate hain.</li>
<li>Saare labs aur capstone sirf Install policy ke baad pass hote hain.</li>
<li>Capstone poore track mein das faults chhupata hai; order follow karo.</li>
<li>Backup aur upgrade concepts hain: details apne version ki documentation mein verify karo.</li>
<li>Yeh independent training hai aur certification coverage ka claim nahi karti.</li>
</ul></div>
`}};export{e as default};