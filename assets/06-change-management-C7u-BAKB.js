var e={id:`change-management`,h:{en:`Change management, backups, documentation and escalation`,hi:`Change management, backups, documentation aur escalation`},body:{en:`
<p>An airline does not let a pilot repaint the plane in flight. Changes are planned, checked by a second person, scheduled in a window and recorded. A wireless controller carries every user in a building, so it deserves the same respect. This chapter covers the habits that stop incidents from being caused by the people fixing the network.</p>
<h3>The life of a change</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Change lifecycle">
<rect x="8" y="30" width="100" height="55" rx="8" fill="#bae6fd"/><text x="58" y="55" text-anchor="middle" class="svg-ink" font-size="13">Plan</text><text x="58" y="73" text-anchor="middle" class="svg-muted" font-size="11">what, why, who</text>
<rect x="125" y="30" width="100" height="55" rx="8" fill="#ddd6fe"/><text x="175" y="55" text-anchor="middle" class="svg-ink" font-size="13">Back up</text><text x="175" y="73" text-anchor="middle" class="svg-muted" font-size="11">config + baseline</text>
<rect x="242" y="30" width="100" height="55" rx="8" fill="#bbf7d0"/><text x="292" y="55" text-anchor="middle" class="svg-ink" font-size="13">Apply</text><text x="292" y="73" text-anchor="middle" class="svg-muted" font-size="11">in the window</text>
<rect x="359" y="30" width="100" height="55" rx="8" fill="#fde68a"/><text x="409" y="55" text-anchor="middle" class="svg-ink" font-size="13">Verify</text><text x="409" y="73" text-anchor="middle" class="svg-muted" font-size="11">test matrix</text>
<rect x="476" y="30" width="75" height="55" rx="8" fill="#fed7aa"/><text x="513" y="55" text-anchor="middle" class="svg-ink" font-size="13">Save</text><text x="513" y="73" text-anchor="middle" class="svg-muted" font-size="11">write mem</text>
<rect x="565" y="30" width="68" height="55" rx="8" fill="#e2e8f0"/><text x="599" y="55" text-anchor="middle" class="svg-ink" font-size="13">Record</text><text x="599" y="73" text-anchor="middle" class="svg-muted" font-size="11">close</text>
<text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">If verify fails: roll back, then investigate.</text>
</svg><p class="cap">Plan, back up, apply, verify, save, record. A failed verify triggers the rollback.</p></div>
<h3>Running-config versus startup-config</h3>
<p>The 9800 runs from <b>running-config</b> in memory. Changes take effect at once but are lost at reload unless saved to <b>startup-config</b>. <code>write memory</code> (or <code>copy running-config startup-config</code>) saves them. Save only after you have verified the change: if a change is bad and you have not saved, a reload is a crude rollback. If it is good, forgetting to save is a delayed outage.</p>
<pre class="code">WLC1# show running-config | section wireless tag policy
WLC1# show running-config | include radius
WLC1# write memory</pre>
<pre class="out">WLC1# show running-config | section wireless tag policy
wireless tag policy PT-CAMPUS
 wlan NK-STAFF policy PP-STAFF
 wlan NK-VOICE policy PP-VOICE
WLC1# write memory
Building configuration...
[OK]</pre>
<p>The filters <code>| section</code>, <code>| include</code>, <code>| begin</code> and <code>| exclude</code> let you read only what matters. Use them to capture the "before" and "after" of exactly the objects you touched.</p>
<h3>Backups</h3>
<ul>
<li><b>Before every change window:</b> save the running-config to a dated file off the box (concept: copy to an SFTP or TFTP server) and store the baseline show outputs next to it.</li>
<li><b>On a schedule:</b> automated nightly config archive with a retention period, so you can restore the state of last Tuesday.</li>
<li><b>After approved changes:</b> a fresh copy and a fresh baseline.</li>
</ul>
<div class="note"><p><b>Concept only, not simulated in the lab.</b> The lab provides <code>write memory</code> and <code>show running-config</code> filters. Off-box copies, scheduled archives, configuration rollback by replace, high availability (HA SSO pair with a standby controller), N+1 redundancy, software upgrades and in-service upgrade (ISSU) are real 9800 topics that you must understand for the exam but cannot perform here. Know the principle: never upgrade without a backup, a rollback plan and a maintenance window.</p></div>
<h3>Rollback criteria</h3>
<p>Decide <i>before</i> the change what failure looks like. For example: "if staff clients cannot reach RAD1, or guests reach the server network, we roll back." A rollback is the documented reverse of the change, not a panic reload. Because small, single-object changes are easy to reverse, the habit from chapter 4 pays off here: removing the one map you added is trivial; unpicking five edits is not.</p>
<h3>Documentation that helps at 3 am</h3>
<table class="cmp"><tr><th>Document</th><th>Contents</th></tr>
<tr><td>Design table</td><td>VLANs, subnets, SSIDs, policy profiles, tags, RADIUS, AP names and switch ports</td></tr>
<tr><td>Baseline pack</td><td>Dated healthy show outputs</td></tr>
<tr><td>Change record</td><td>Who, when, what, why, test results, rollback</td></tr>
<tr><td>Runbook</td><td>Step-by-step triage for common tickets, with commands</td></tr>
<tr><td>Contact list</td><td>Server, security, ISP and vendor support contacts</td></tr>
</table>
<h3>Escalation</h3>
<p>Escalate when the evidence leaves your area or your authority, not when you are tired. Hand over a complete package: symptom, scope, timeline, outputs you gathered, what you tried and what changed. Examples: RADIUS counters show timeouts and the controller is correct, so the AAA owner gets the ticket; the switch trunk lacks VLAN 99 and you lack switch rights, so the network team gets it; a suspected software defect goes to the vendor with <code>show tech-support wireless</code> (concept) and timestamps. A good escalation saves the next person an hour of repeating your steps.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Saving the configuration before verifying. (2) Changing production at 5 pm Friday with no rollback criteria. (3) "Documentation" that lives only in one engineer's head. (4) Escalating with the words "it does not work" and no outputs.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>write memory</code> saves running to startup. It does not copy the configuration off the device and it does not make a backup you can restore from after a hardware failure.</p></div>
<div class="scn"><h4>The unsaved fix</h4><p>During an outage an engineer re-enabled PP-CORP and corrected a shared secret. Everything worked; he closed the ticket. Two days later a power event rebooted the controller and the corporate Wi-Fi failed again, because the fixes lived only in running-config. The second outage was longer than the first.</p><p><b>Lesson:</b> verify, then save, then record. All three.</p></div>
<div class="iv"><p class="q">"What do you do before making a change on a production wireless controller?"</p><p>Plan with rollback criteria, take a config backup and baseline, get approval and a window, change one object, verify with a test matrix including negative tests, save with write memory, and record. Mention that upgrades and HA are done with extra care.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Plan, back up, apply, verify, save, record.</li>
<li>Running-config is lost at reload; <code>write memory</code> saves it.</li>
<li>Define rollback criteria before the change.</li>
<li>Design table, baseline pack, change record and runbook are the minimum records.</li>
<li>Escalate with evidence and a clear handover.</li>
</ul></div>
`,hi:`
<p>Airline pilot ko udaan ke beech plane repaint nahi karne deti. Changes plan hote hain, doosra vyakti check karta hai, window mein schedule hote hain aur record hote hain. Wireless controller ek building ke har user ko carry karta hai, isliye usse bhi wahi respect milna chahiye. Yeh chapter un aadaton ko cover karta hai jo network fix karne walon ke karan hone wale incidents ko rokti hain.</p>
<h3>Change ki zindagi</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Change lifecycle">
<rect x="8" y="30" width="100" height="55" rx="8" fill="#bae6fd"/><text x="58" y="55" text-anchor="middle" class="svg-ink" font-size="13">Plan</text><text x="58" y="73" text-anchor="middle" class="svg-muted" font-size="11">kya, kyun, kaun</text>
<rect x="125" y="30" width="100" height="55" rx="8" fill="#ddd6fe"/><text x="175" y="55" text-anchor="middle" class="svg-ink" font-size="13">Back up</text><text x="175" y="73" text-anchor="middle" class="svg-muted" font-size="11">config + baseline</text>
<rect x="242" y="30" width="100" height="55" rx="8" fill="#bbf7d0"/><text x="292" y="55" text-anchor="middle" class="svg-ink" font-size="13">Apply</text><text x="292" y="73" text-anchor="middle" class="svg-muted" font-size="11">window mein</text>
<rect x="359" y="30" width="100" height="55" rx="8" fill="#fde68a"/><text x="409" y="55" text-anchor="middle" class="svg-ink" font-size="13">Verify</text><text x="409" y="73" text-anchor="middle" class="svg-muted" font-size="11">test matrix</text>
<rect x="476" y="30" width="75" height="55" rx="8" fill="#fed7aa"/><text x="513" y="55" text-anchor="middle" class="svg-ink" font-size="13">Save</text><text x="513" y="73" text-anchor="middle" class="svg-muted" font-size="11">write mem</text>
<rect x="565" y="30" width="68" height="55" rx="8" fill="#e2e8f0"/><text x="599" y="55" text-anchor="middle" class="svg-ink" font-size="13">Record</text><text x="599" y="73" text-anchor="middle" class="svg-muted" font-size="11">close</text>
<text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">Verify fail ho to rollback karo, phir investigate karo.</text>
</svg><p class="cap">Plan, back up, apply, verify, save, record. Failed verify rollback trigger karta hai.</p></div>
<h3>Running-config versus startup-config</h3>
<p>9800 memory mein <b>running-config</b> se chalta hai. Changes turant effect karte hain lekin reload par kho jaate hain jab tak <b>startup-config</b> mein save na ho. <code>write memory</code> (ya <code>copy running-config startup-config</code>) unhe save karta hai. Change verify karne ke baad hi save karo: change kharab ho aur save nahi kiya to reload ek kaccha rollback hai. Change achha ho to save bhoolna delayed outage hai.</p>
<pre class="code">WLC1# show running-config | section wireless tag policy
WLC1# show running-config | include radius
WLC1# write memory</pre>
<pre class="out">WLC1# show running-config | section wireless tag policy
wireless tag policy PT-CAMPUS
 wlan NK-STAFF policy PP-STAFF
 wlan NK-VOICE policy PP-VOICE
WLC1# write memory
Building configuration...
[OK]</pre>
<p>Filters <code>| section</code>, <code>| include</code>, <code>| begin</code> aur <code>| exclude</code> aapko sirf kaam ki cheez padhne dete hain. Inse un objects ka "before" aur "after" capture karo jinhe aapne chhua.</p>
<h3>Backups</h3>
<ul>
<li><b>Har change window se pehle:</b> running-config ko dated file mein box ke bahar save karo (concept: SFTP ya TFTP server par copy) aur baseline show outputs uske paas rakho.</li>
<li><b>Schedule par:</b> retention period ke saath automated nightly config archive, taaki pichhle Tuesday ki state restore kar sako.</li>
<li><b>Approved changes ke baad:</b> nayi copy aur naya baseline.</li>
</ul>
<div class="note"><p><b>Sirf concept, not simulated in the lab.</b> Lab <code>write memory</code> aur <code>show running-config</code> filters deta hai. Off-box copies, scheduled archives, replace se configuration rollback, high availability (standby controller ke saath HA SSO pair), N+1 redundancy, software upgrades aur in-service upgrade (ISSU) real 9800 topics hain jo exam ke liye samajhne hain lekin yahan perform nahi kar sakte. Principle jaano: backup, rollback plan aur maintenance window ke bina upgrade kabhi nahi.</p></div>
<h3>Rollback criteria</h3>
<p>Change se <i>pehle</i> decide karo ki failure kaisa dikhta hai. Jaise: "agar staff clients RAD1 tak nahi pahunche, ya guests server network tak pahunche, to rollback." Rollback change ka documented ulta hai, panic reload nahi. Chhote, single-object changes aasani se reverse hote hain, isliye chapter 4 ki aadat yahan kaam aati hai: jo ek map add kiya use hataana aasaan hai; paanch edits ko suljhana nahi.</p>
<h3>Documentation jo raat ke 3 baje kaam aaye</h3>
<table class="cmp"><tr><th>Document</th><th>Contents</th></tr>
<tr><td>Design table</td><td>VLANs, subnets, SSIDs, policy profiles, tags, RADIUS, AP names aur switch ports</td></tr>
<tr><td>Baseline pack</td><td>Dated healthy show outputs</td></tr>
<tr><td>Change record</td><td>Kaun, kab, kya, kyun, test results, rollback</td></tr>
<tr><td>Runbook</td><td>Common tickets ke liye commands ke saath step-by-step triage</td></tr>
<tr><td>Contact list</td><td>Server, security, ISP aur vendor support contacts</td></tr>
</table>
<h3>Escalation</h3>
<p>Tab escalate karo jab evidence aapke area ya authority se bahar jaye, tab nahi jab aap thak jao. Poora package handover karo: symptom, scope, timeline, jo outputs jama kiye, kya try kiya aur kya badla. Examples: RADIUS counters timeouts dikhate hain aur controller sahi hai, to AAA owner ko ticket jaata hai; switch trunk par VLAN 99 nahi aur aapke paas switch rights nahi, to network team ko; suspected software defect timestamps aur <code>show tech-support wireless</code> (concept) ke saath vendor ko. Achha escalation agle vyakti ka ek ghanta bachata hai.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Verify se pehle configuration save karna. (2) Friday 5 baje production mein bina rollback criteria ke change. (3) "Documentation" jo sirf ek engineer ke dimaag mein ho. (4) "Kaam nahi kar raha" likhkar bina outputs ke escalate karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>write memory</code> running ko startup mein save karta hai. Yeh configuration ko device se bahar copy nahi karta aur hardware failure ke baad restore layak backup nahi banata.</p></div>
<div class="scn"><h4>Unsaved fix</h4><p>Outage ke dauran ek engineer ne PP-CORP re-enable kiya aur shared secret theek kiya. Sab chala; usne ticket close kar diya. Do din baad power event ne controller reboot kiya aur corporate Wi-Fi phir fail ho gaya, kyunki fixes sirf running-config mein the. Doosra outage pehle se lamba tha.</p><p><b>Seekh:</b> verify, phir save, phir record. Teeno.</p></div>
<div class="iv"><p class="q">"Production wireless controller par change se pehle kya karte ho?"</p><p>Rollback criteria ke saath plan, config backup aur baseline, approval aur window, ek object badlo, negative tests ke saath test matrix se verify, write memory se save, aur record. Jodo ki upgrades aur HA extra care se hote hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Plan, back up, apply, verify, save, record.</li>
<li>Running-config reload par kho jaata hai; <code>write memory</code> save karta hai.</li>
<li>Change se pehle rollback criteria define karo.</li>
<li>Design table, baseline pack, change record aur runbook minimum records hain.</li>
<li>Evidence aur clear handover ke saath escalate karo.</li>
</ul></div>
`}};export{e as default};