var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This last chapter pulls the module together. Use it the night before an interview or exam. Remember: this module is a reading module. There is no HA lab in the simulator, so for hands-on practice go to pan-setup, pan-policy and pan-diag, and compare the same ideas in nse4-ha and sec-asa-ha.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain active/passive HA with an analogy and draw the two links.</li>
<li>Say what HA1 and HA2 carry, their ports and backups.</li>
<li>List the requirements: model, PAN-OS, licences, interfaces, group ID.</li>
<li>Configure the pair: HA interfaces, group, mode, peer IP, priority, preemption.</li>
<li>Describe config sync versus state sync and what is local.</li>
<li>Configure link monitoring and path monitoring, and choose good destinations.</li>
<li>Explain the election, states, preemption and timers.</li>
<li>Do a safe failover test and an upgrade using suspend and functional.</li>
<li>Troubleshoot using the seven-step order.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Active / passive</dt><dd>One unit forwards, the other waits in sync.</dd>
<dt>HA1</dt><dd>Control link: hello, heartbeat, config sync, state information.</dd>
<dt>HA2</dt><dd>Data link: session synchronisation.</dd>
<dt>Heartbeat backup</dt><dd>Management-port heartbeat used to avoid split brain.</dd>
<dt>Split brain</dt><dd>Both units think they are active.</dd>
<dt>Device priority</dt><dd>Election value; lower wins.</dd>
<dt>Preemption</dt><dd>Higher-priority unit reclaims the active role after recovery.</dd>
<dt>Link / path monitoring</dt><dd>Interface state check and ICMP reachability check.</dd>
<dt>Suspended</dt><dd>Administratively removed from the election.</dd>
<dt>Gratuitous ARP</dt><dd>Sent by the new active unit so neighbours update tables.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>HA1 ports</td><td>TCP 28769 and 28260 clear text; TCP 28 encrypted</td></tr>
<tr><td>HA2 transport</td><td>Ethernet (default), IP protocol 99, UDP 29281</td></tr>
<tr><td>Hello / heartbeat defaults</td><td>8000 ms and 1000 ms</td></tr>
<tr><td>Promotion hold time</td><td>2000 ms default</td></tr>
<tr><td>Preemption</td><td>Off by default; hold time 1 minute; set on both</td></tr>
<tr><td>Priority</td><td>Default 100; lower wins</td></tr>
<tr><td>Path monitoring defaults</td><td>Ping interval 200 ms, count 10</td></tr>
<tr><td>Not synchronised</td><td>Management IP, hostname, HA settings, licences</td></tr>
<tr><td>IPsec and HA</td><td>Phase 2 SAs sync, IKE Phase 1 renegotiated</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<p>These exist on PAN-OS. Confirm syntax on your release. They are Reference only here.</p>
<pre class="code">show high-availability state
show high-availability all
show high-availability interface ha1
show high-availability state-synchronization
show high-availability link-monitoring
show high-availability path-monitoring
request high-availability state suspend
request high-availability state functional
request high-availability sync-to-remote running-config</pre>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module summary">
<rect x="10" y="20" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">Links HA1 / HA2</text>
<rect x="170" y="20" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">Requirements</text>
<rect x="330" y="20" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">Sync config + state</text>
<rect x="490" y="20" width="140" height="60" rx="10" fill="#fde68a"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="13">Monitoring</text>
<rect x="90" y="100" width="200" height="50" rx="10" fill="#fed7aa"/><text x="190" y="130" text-anchor="middle" class="svg-ink" font-size="13">Election + preemption</text>
<rect x="350" y="100" width="200" height="50" rx="10" fill="#e2e8f0"/><text x="450" y="130" text-anchor="middle" class="svg-ink" font-size="13">Troubleshooting order</text>
</svg><p class="cap">The pieces of an HA design in one view.</p></div>

<div class="eg"><p><b>Worked example (design review).</b> Asked to review an HA design, tick the points: identical hardware and licences, direct HA1 and HA2 plus heartbeat backup, session sync on, monitoring on the ISP next hop with a second internal destination, preemption decision recorded, config changes only on the active unit, a tested failover with a long-lived session, and a written upgrade runbook.</p></div>

<div class="warn"><p><b>Common mistakes to avoid.</b> Mismatched licences, shared HA switch, no backups, monitoring far-away hosts, editing the passive unit, never testing failover.</p></div>
<div class="exam"><p><b>Exam traps recap.</b> HA1 versus HA2; lower priority wins; preemption set on both; passive unit is running not off; management settings are not synced; IKE Phase 1 renegotiates after failover.</p></div>

<div class="scn"><h4>The quarterly failover drill</h4><p>A bank schedules a controlled failover every quarter. The engineer opens a long SSH session and a file transfer, suspends the active unit, watches the passive unit take over, confirms sessions survive, reads the logs and then makes the first unit functional again. Twice the drill found a missing licence and a switch with a stale ARP entry before a real outage could.</p><p><b>Lesson:</b> an untested HA pair is only a hope.</p></div>

<div class="iv"><p class="q">"Give me a two-minute summary of Palo Alto active/passive HA."</p><p>Two identical firewalls linked by HA1 (control, config sync, heartbeat) and HA2 (sessions). Priority and optional preemption pick the active unit. Monitoring of links and paths, plus heartbeat loss, triggers failover; the new active unit uses gratuitous ARP and its synced sessions. Config changes happen on the active unit; failover is tested with suspend and functional; troubleshooting follows state, links, compatibility, sync, monitors, logs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA1 = control and config; HA2 = sessions.</li>
<li>Match model, version, licences and interfaces.</li>
<li>Lower priority wins; preemption is optional and must match.</li>
<li>Monitor links and paths, avoid flapping.</li>
<li>Test failover regularly and keep a runbook.</li>
</ul></div>
`,hi:`
<p>Yeh aakhri chapter poore module ko ek saath jodta hai. Interview ya exam se pehli raat ise use karo. Yaad rakho: yeh ek reading module hai. Simulator mein HA lab nahi hai, isliye hands-on practice ke liye pan-setup, pan-policy aur pan-diag par jao, aur wahi ideas nse4-ha aur sec-asa-ha mein compare karo.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Active/passive HA ko analogy ke saath samjhao aur dono links draw karo.</li>
<li>Batao ki HA1 aur HA2 kya carry karte hain, unke ports aur backups.</li>
<li>Requirements ginao: model, PAN-OS, licences, interfaces, group ID.</li>
<li>Pair configure karo: HA interfaces, group, mode, peer IP, priority, preemption.</li>
<li>Config sync aur state sync ka farak aur kya local hai, yeh batao.</li>
<li>Link monitoring aur path monitoring configure karo, aur achhi destinations chuno.</li>
<li>Election, states, preemption aur timers samjhao.</li>
<li>Suspend aur functional se safe failover test aur upgrade karo.</li>
<li>Saat-step order se troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Active / passive</dt><dd>Ek unit forward karta hai, doosra sync mein intezaar karta hai.</dd>
<dt>HA1</dt><dd>Control link: hello, heartbeat, config sync, state information.</dd>
<dt>HA2</dt><dd>Data link: session synchronisation.</dd>
<dt>Heartbeat backup</dt><dd>Split brain se bachne ke liye management-port heartbeat.</dd>
<dt>Split brain</dt><dd>Dono units sochte hain ki woh active hain.</dd>
<dt>Device priority</dt><dd>Election value; chhota jeetta hai.</dd>
<dt>Preemption</dt><dd>Higher-priority unit recovery ke baad active role wapas leta hai.</dd>
<dt>Link / path monitoring</dt><dd>Interface state check aur ICMP reachability check.</dd>
<dt>Suspended</dt><dd>Administratively election se hataya hua.</dd>
<dt>Gratuitous ARP</dt><dd>Naya active unit bhejta hai taaki neighbours tables update karein.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>HA1 ports</td><td>Clear text mein TCP 28769 aur 28260; encrypted TCP 28</td></tr>
<tr><td>HA2 transport</td><td>Ethernet (default), IP protocol 99, UDP 29281</td></tr>
<tr><td>Hello / heartbeat defaults</td><td>8000 ms aur 1000 ms</td></tr>
<tr><td>Promotion hold time</td><td>2000 ms default</td></tr>
<tr><td>Preemption</td><td>Default off; hold time 1 minute; dono par set karo</td></tr>
<tr><td>Priority</td><td>Default 100; chhota jeetta hai</td></tr>
<tr><td>Path monitoring defaults</td><td>Ping interval 200 ms, count 10</td></tr>
<tr><td>Synchronise nahi hota</td><td>Management IP, hostname, HA settings, licences</td></tr>
<tr><td>IPsec aur HA</td><td>Phase 2 SAs sync, IKE Phase 1 renegotiate</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<p>Yeh PAN-OS par maujood hain. Apni release par syntax confirm karo. Yahan yeh sirf Reference hain.</p>
<pre class="code">show high-availability state
show high-availability all
show high-availability interface ha1
show high-availability state-synchronization
show high-availability link-monitoring
show high-availability path-monitoring
request high-availability state suspend
request high-availability state functional
request high-availability sync-to-remote running-config</pre>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module summary">
<rect x="10" y="20" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">Links HA1 / HA2</text>
<rect x="170" y="20" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">Requirements</text>
<rect x="330" y="20" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">Sync config + state</text>
<rect x="490" y="20" width="140" height="60" rx="10" fill="#fde68a"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="13">Monitoring</text>
<rect x="90" y="100" width="200" height="50" rx="10" fill="#fed7aa"/><text x="190" y="130" text-anchor="middle" class="svg-ink" font-size="13">Election + preemption</text>
<rect x="350" y="100" width="200" height="50" rx="10" fill="#e2e8f0"/><text x="450" y="130" text-anchor="middle" class="svg-ink" font-size="13">Troubleshooting order</text>
</svg><p class="cap">HA design ke saare tukde ek nazar mein.</p></div>

<div class="eg"><p><b>Worked example (design review).</b> HA design review karna ho to points tick karo: identical hardware aur licences, direct HA1 aur HA2 plus heartbeat backup, session sync on, ISP next hop par monitoring aur ek doosri internal destination, preemption ka decision recorded, config changes sirf active unit par, lambe session ke saath tested failover, aur likha hua upgrade runbook.</p></div>

<div class="warn"><p><b>Bachne wali common mistakes.</b> Mismatched licences, shared HA switch, backups nahi, door ke hosts monitor karna, passive unit edit karna, failover kabhi test na karna.</p></div>
<div class="exam"><p><b>Exam traps recap.</b> HA1 versus HA2; chhota priority jeetta hai; preemption dono par set; passive unit running hai band nahi; management settings sync nahi hoti; failover ke baad IKE Phase 1 renegotiate hota hai.</p></div>

<div class="scn"><h4>Quarterly failover drill</h4><p>Ek bank har quarter controlled failover schedule karta hai. Engineer ek lamba SSH session aur file transfer kholta hai, active unit ko suspend karta hai, passive unit ko take over karte dekhta hai, confirm karta hai ki sessions bache, logs padhta hai aur phir pehle unit ko wapas functional banata hai. Do baar drill ne asli outage se pehle ek missing licence aur ek switch ki stale ARP entry pakdi.</p><p><b>Lesson:</b> bina test ka HA pair sirf ek ummeed hai.</p></div>

<div class="iv"><p class="q">"Palo Alto active/passive HA ka do minute ka summary do."</p><p>Do identical firewalls jo HA1 (control, config sync, heartbeat) aur HA2 (sessions) se jude hain. Priority aur optional preemption active unit chunte hain. Links aur paths ki monitoring, plus heartbeat loss, failover trigger karte hain; naya active unit gratuitous ARP aur apne synced sessions use karta hai. Config changes active unit par hote hain; failover suspend aur functional se test hota hai; troubleshooting state, links, compatibility, sync, monitors, logs ke order mein hoti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA1 = control aur config; HA2 = sessions.</li>
<li>Model, version, licences aur interfaces match karo.</li>
<li>Chhota priority jeetta hai; preemption optional hai aur match karna chahiye.</li>
<li>Links aur paths monitor karo, flapping se bacho.</li>
<li>Failover regularly test karo aur runbook rakho.</li>
</ul></div>
`}};export{e as default};