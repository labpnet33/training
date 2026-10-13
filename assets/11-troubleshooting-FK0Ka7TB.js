var e={id:`troubleshooting`,h:{en:`Troubleshooting integrations: a four-hop workflow`,hi:`Integrations troubleshooting: ek four-hop workflow`},body:{en:`
<p>Integrations fail in a particular way: each product says it is fine, yet the end result does not happen. The fix is a disciplined walk along the chain, one hop at a time, with evidence at each hop. This chapter gives you that walk and applies it to both labs and to the SIEM and cloud paths.</p>

<h3>An analogy: a relay race</h3>
<p>When a relay team loses, you do not shout at the last runner. You watch each hand-over: did runner one start, did the baton pass to runner two, did runner two pass it on, did the last runner cross the line? Integration troubleshooting is the same: <b>signal → transport → decision → action</b>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Four-hop troubleshooting">
<rect x="10" y="60" width="140" height="60" rx="8" fill="#fed7aa"/><text x="80" y="85" text-anchor="middle" class="svg-ink" font-size="13">1 Signal</text><text x="80" y="104" text-anchor="middle" class="svg-muted" font-size="12">event produced?</text>
<rect x="170" y="60" width="140" height="60" rx="8" fill="#bae6fd"/><text x="240" y="85" text-anchor="middle" class="svg-ink" font-size="13">2 Transport</text><text x="240" y="104" text-anchor="middle" class="svg-muted" font-size="12">reached the hub?</text>
<rect x="330" y="60" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="400" y="85" text-anchor="middle" class="svg-ink" font-size="13">3 Decision</text><text x="400" y="104" text-anchor="middle" class="svg-muted" font-size="12">rule / source / policy?</text>
<rect x="490" y="60" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="85" text-anchor="middle" class="svg-ink" font-size="13">4 Action</text><text x="560" y="104" text-anchor="middle" class="svg-muted" font-size="12">far end enforced?</text>
<line x1="150" y1="90" x2="170" y2="90" stroke="#64748b" stroke-width="2"/><line x1="310" y1="90" x2="330" y2="90" stroke="#64748b" stroke-width="2"/><line x1="470" y1="90" x2="490" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">stop at the first hop without evidence: that is where the fault is</text>
</svg><p class="cap">Signal, transport, decision, action — collect evidence at each hand-over.</p></div>

<h3>Hop 2 first: is the device talking to its manager?</h3>
<p>Almost every integration depends on the Threat Defense–Management Center channel (sftunnel, TCP 8305). If it is down, events do not arrive, TID data does not publish and correlation sees nothing. Check it before anything else.</p>
<pre class="out">&gt; show managers
Type                      : Manager
Host                      : 10.0.9.10
<span class="hl">Registration              : Completed</span>
Management type           : Configuration and analytics

&gt; sftunnel-status-brief
PEER:10.0.9.10
<span class="hl">Registration: Completed.</span>
Heartbeat Send Time: Fri Oct 2 11:21:02 2026 UTC
Heartbeat Received Time: Fri Oct 2 11:21:04 2026 UTC</pre>

<h3>Ticket 1 — "We added the CERT indicators but users still reach them"</h3>
<table class="cmp"><tr><th>Hop</th><th>Check</th><th>Typical fault</th></tr>
<tr><td>Decision (source)</td><td>Source action and Publish; observable values</td><td>Action Monitor; Publish off; typo; IP entered in a domain source</td></tr>
<tr><td>Transport</td><td>Elements tab; TID Settings</td><td>Element missing; publishing paused</td></tr>
<tr><td>Signal</td><td>Does the traffic reach Snort? Access policy has TID enabled and is deployed</td><td>Prefilter Fastpath; HTTPS URL without decryption; SHA-256 without a malware file policy</td></tr>
<tr><td>Action</td><td>Analysis → Security Intelligence, list column</td><td>Events say Monitor; or a different list matched first</td></tr></table>
<p>In the lab, the classic failure is leaving the action at Monitor or putting both observables on one line; the proof of success is two blocks with list <b>TID: CERT-IN-Feed</b> while news.example still loads.</p>

<h3>Ticket 2 — "The beacon is blocked but the laptop is not quarantined"</h3>
<ol>
<li><b>Signal:</b> is there an intrusion event for 1:58003 from 10.0.1.10? If the rule is disabled in the intrusion policy, or the access rule has no intrusion policy, there is nothing to correlate. In the lab, Inside-Out uses Balanced Security and Connectivity, where 58003 drops.</li>
<li><b>Transport:</b> did the event reach the Management Center (Analysis → Intrusions → Events)?</li>
<li><b>Decision:</b> Analysis → Correlation → Correlation Events — did <b>Contain-CnC</b> fire? If not: is the correlation policy <b>active</b>? Does the condition match (priority 1, not "priority 2")? Is the rule snoozed?</li>
<li><b>Action:</b> Analysis → Correlation → Status — "Successful completion of remediation" or an error. Errors point to pxGrid (identity source Test), a wrong ANC policy name, Mitigate Destination instead of Source, or no ISE session for the IP. If ISE accepted it, check ISE: Endpoint Assignment, live logs for the CoA, the authorization exception on Session:ANCPolicy, and the switch's dynamic-author configuration (the sec-ise ticket "the switch ignores ISE CoA").</li>
</ol>
<pre class="out">Analysis &gt; Correlation &gt; Status
Time       Remediation                Rule         Result Message
11:20:14   ISE-ANC/Quarantine-Source  Contain-CnC  <span class="hl">Error: endpoint 10.0.1.10 has no active session</span></pre>

<h3>Ticket 3 — "Splunk stopped receiving firewall events"</h3>
<p>Signal: are events still visible in the Management Center? Transport: can the collector reach TCP 8302 on the Management Center (or does the device reach the syslog server on its port and interface)? Decision: is the eStreamer client certificate for the collector's current IP, and are the event types still ticked? Action: the input logs in the Cisco Security Cloud app show TLS or authentication errors.</p>

<h3>Ticket 4 — "Users are not matching identity rules"</h3>
<p>Run the ISE identity source <b>Test</b>; check the client is approved in ISE pxGrid Services; check both the pxGrid and MnT CAs; check the ISE network filter includes the user subnet; look for the user in Analysis → Users → Active Sessions; then <code>system support firewall-engine-debug</code> on the device to see the user and SGT seen for the flow.</p>

<div class="eg"><p><b>Worked example.</b> RTC test fails. Hop 1: intrusion event 1:58003 from 10.0.1.10 present. Hop 2: visible in the Management Center. Hop 3: no correlation event. The policy NK-Containment exists but the "active" toggle is off. Turn it on, repeat the simulated beacon — correlation fires, status Successful, PC1 is quarantined, ADMIN unaffected. Five minutes, no guessing.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Starting at the far end ("ISE is broken") without proving the event exists. Clicking Deploy repeatedly for features that do not need it (TID, correlation, dynamic-object mappings). Forgetting the release step after a test, leaving the test laptop quarantined.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions often show "Successful completion of remediation" while the host still has access: the Management Center did its part; the gap is on ISE (authorization rule) or the switch (CoA). Read which hop the evidence comes from.</p></div>

<div class="scn"><h4>Three teams, one missing toggle</h4><p>A hospital's RTC pilot failed in the go-live test. The firewall team showed the intrusion event; the ISE team showed no ANC request had ever arrived; the network team showed the switch accepted CoA. An engineer walked the four hops on a shared screen: event present, reached the Management Center, no correlation event. The correlation policy had been created by one admin and left inactive "until approval". Activating it took one click; the retest quarantined the test laptop in three seconds.</p><p><b>Lesson:</b> walk the hops in order with evidence. It ends arguments between teams quickly.</p></div>

<div class="iv"><p class="q">"Your Rapid Threat Containment test did not quarantine the host. How do you troubleshoot?"</p><p>Strong answer: follow the chain. Confirm the triggering event exists on the device and in the Management Center; confirm the device–Management Center tunnel is healthy; check that the correlation policy is active and the rule condition matches, using Correlation Events; check remediation status for errors (pxGrid connectivity, ANC name, source versus destination, no ISE session); then on ISE check endpoint assignment, the CoA in live logs, the authorization exception on Session:ANCPolicy, and the switch dynamic-author config.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Walk signal → transport → decision → action; stop at the first hop without evidence.</li>
<li>Check the Threat Defense–Management Center channel first (show managers, sftunnel-status-brief).</li>
<li>TID failures: action, publish, elements, paused publishing, fastpath, decryption, file policy.</li>
<li>RTC failures: inactive policy, rule condition, remediation status, ISE session and authorization, CoA.</li>
<li>SIEM failures: TCP 8302 reachability, client certificate, event types, syslog settings.</li>
</ul></div>
`,hi:`
<p>Integrations ek khaas tarah se fail hote hain: har product kehta hai woh theek hai, phir bhi end result nahi hota. Ilaaj hai chain ke saath disciplined walk, ek ek hop, har hop par saboot ke saath. Yeh chapter aapko woh walk deta hai aur use dono labs aur SIEM aur cloud paths par apply karta hai.</p>

<h3>Ek analogy: relay race</h3>
<p>Jab relay team haarti hai, aap aakhri runner par nahi chillaate. Aap har hand-over dekhte ho: kya runner ek ne start kiya, kya baton runner do tak gaya, kya runner do ne aage diya, kya aakhri runner ne line cross ki? Integration troubleshooting bhi aisi hi hai: <b>signal → transport → decision → action</b>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Four-hop troubleshooting">
<rect x="10" y="60" width="140" height="60" rx="8" fill="#fed7aa"/><text x="80" y="85" text-anchor="middle" class="svg-ink" font-size="13">1 Signal</text><text x="80" y="104" text-anchor="middle" class="svg-muted" font-size="12">event bana?</text>
<rect x="170" y="60" width="140" height="60" rx="8" fill="#bae6fd"/><text x="240" y="85" text-anchor="middle" class="svg-ink" font-size="13">2 Transport</text><text x="240" y="104" text-anchor="middle" class="svg-muted" font-size="12">hub tak pahuncha?</text>
<rect x="330" y="60" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="400" y="85" text-anchor="middle" class="svg-ink" font-size="13">3 Decision</text><text x="400" y="104" text-anchor="middle" class="svg-muted" font-size="12">rule / source / policy?</text>
<rect x="490" y="60" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="85" text-anchor="middle" class="svg-ink" font-size="13">4 Action</text><text x="560" y="104" text-anchor="middle" class="svg-muted" font-size="12">far end ne enforce kiya?</text>
<line x1="150" y1="90" x2="170" y2="90" stroke="#64748b" stroke-width="2"/><line x1="310" y1="90" x2="330" y2="90" stroke="#64748b" stroke-width="2"/><line x1="470" y1="90" x2="490" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">pehle bina saboot wale hop par ruko: fault wahin hai</text>
</svg><p class="cap">Signal, transport, decision, action — har hand-over par saboot ikattha karo.</p></div>

<h3>Pehle hop 2: kya device apne manager se baat kar raha hai?</h3>
<p>Lagbhag har integration Threat Defense–Management Center channel (sftunnel, TCP 8305) par depend karta hai. Agar woh down hai, events nahi aate, TID data publish nahi hota aur correlation kuch nahi dekhta. Kisi bhi cheez se pehle ise check karo.</p>
<pre class="out">&gt; show managers
Type                      : Manager
Host                      : 10.0.9.10
<span class="hl">Registration              : Completed</span>
Management type           : Configuration and analytics

&gt; sftunnel-status-brief
PEER:10.0.9.10
<span class="hl">Registration: Completed.</span>
Heartbeat Send Time: Fri Oct 2 11:21:02 2026 UTC
Heartbeat Received Time: Fri Oct 2 11:21:04 2026 UTC</pre>

<h3>Ticket 1 — "Humne CERT indicators jode lekin users ab bhi wahan pahunchte hain"</h3>
<table class="cmp"><tr><th>Hop</th><th>Check</th><th>Typical fault</th></tr>
<tr><td>Decision (source)</td><td>Source action aur Publish; observable values</td><td>Action Monitor; Publish off; typo; domain source mein IP daala</td></tr>
<tr><td>Transport</td><td>Elements tab; TID Settings</td><td>Element missing; publishing paused</td></tr>
<tr><td>Signal</td><td>Kya traffic Snort tak pahunchta hai? Access policy mein TID enabled aur deployed hai</td><td>Prefilter Fastpath; bina decryption HTTPS URL; bina malware file policy SHA-256</td></tr>
<tr><td>Action</td><td>Analysis → Security Intelligence, list column</td><td>Events Monitor kehte hain; ya koi aur list pehle match hui</td></tr></table>
<p>Lab mein classic failure action ko Monitor par chhodna ya dono observables ek line mein daalna hai; success ka saboot hai list <b>TID: CERT-IN-Feed</b> ke saath do blocks jabki news.example ab bhi load hota hai.</p>

<h3>Ticket 2 — "Beacon block hai lekin laptop quarantine nahi hua"</h3>
<ol>
<li><b>Signal:</b> kya 10.0.1.10 se 1:58003 ka intrusion event hai? Agar intrusion policy mein rule disabled hai, ya access rule mein intrusion policy hi nahi, to correlate karne ko kuch nahi. Lab mein Inside-Out Balanced Security and Connectivity use karti hai, jahan 58003 drop karta hai.</li>
<li><b>Transport:</b> kya event Management Center tak pahuncha (Analysis → Intrusions → Events)?</li>
<li><b>Decision:</b> Analysis → Correlation → Correlation Events — kya <b>Contain-CnC</b> fire hui? Agar nahi: kya correlation policy <b>active</b> hai? Kya condition match karti hai (priority 1, "priority 2" nahi)? Kya rule snoozed hai?</li>
<li><b>Action:</b> Analysis → Correlation → Status — "Successful completion of remediation" ya error. Errors pxGrid (identity source Test), galat ANC policy naam, Source ki jagah Mitigate Destination, ya IP ka koi ISE session nahi — ki taraf ishaara karte hain. Agar ISE ne accept kiya, to ISE check karo: Endpoint Assignment, CoA ke liye live logs, Session:ANCPolicy par authorization exception, aur switch ki dynamic-author configuration (sec-ise ticket "the switch ignores ISE CoA").</li>
</ol>
<pre class="out">Analysis &gt; Correlation &gt; Status
Time       Remediation                Rule         Result Message
11:20:14   ISE-ANC/Quarantine-Source  Contain-CnC  <span class="hl">Error: endpoint 10.0.1.10 has no active session</span></pre>

<h3>Ticket 3 — "Splunk ko firewall events milna band ho gaya"</h3>
<p>Signal: kya events ab bhi Management Center mein dikhte hain? Transport: kya collector Management Center par TCP 8302 tak pahunch sakta hai (ya device syslog server tak uske port aur interface par)? Decision: kya eStreamer client certificate collector ke current IP ke liye hai, aur kya event types ab bhi ticked hain? Action: Cisco Security Cloud app ke input logs TLS ya authentication errors dikhate hain.</p>

<h3>Ticket 4 — "Users identity rules match nahi kar rahe"</h3>
<p>ISE identity source ka <b>Test</b> chalao; check karo ki client ISE pxGrid Services mein approved hai; pxGrid aur MnT dono CAs check karo; check karo ki ISE network filter mein user subnet hai; Analysis → Users → Active Sessions mein user dhoondo; phir device par <code>system support firewall-engine-debug</code> chalao taaki flow ke liye dekha gaya user aur SGT dikhe.</p>

<div class="eg"><p><b>Worked example.</b> RTC test fail hota hai. Hop 1: 10.0.1.10 se intrusion event 1:58003 maujood. Hop 2: Management Center mein dikhta hai. Hop 3: koi correlation event nahi. Policy NK-Containment hai lekin "active" toggle off hai. Use on karo, simulated beacon dobara karo — correlation fire hoti hai, status Successful, PC1 quarantine, ADMIN par asar nahi. Paanch minute, koi andaaza nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Bina event exist karna saabit kiye far end se shuru karna ("ISE toota hai"). Un features ke liye baar baar Deploy click karna jinhe uski zaroorat nahi (TID, correlation, dynamic-object mappings). Test ke baad release step bhool jaana, jisse test laptop quarantine reh jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions aksar "Successful completion of remediation" dikhate hain jabki host ka access ab bhi hai: Management Center ne apna kaam kiya; gap ISE (authorization rule) ya switch (CoA) par hai. Padho ki saboot kis hop se aa raha hai.</p></div>

<div class="scn"><h4>Teen teams, ek missing toggle</h4><p>Ek hospital ka RTC pilot go-live test mein fail hua. Firewall team ne intrusion event dikhaya; ISE team ne dikhaya ki koi ANC request kabhi aayi hi nahi; network team ne dikhaya ki switch CoA accept karta hai. Ek engineer ne shared screen par chaaron hops walk kiye: event maujood, Management Center tak pahuncha, koi correlation event nahi. Correlation policy ek admin ne banayi thi aur "approval tak" inactive chhod di thi. Use activate karne mein ek click laga; retest ne test laptop ko teen second mein quarantine kiya.</p><p><b>Seekh:</b> hops ko order mein saboot ke saath walk karo. Isse teams ke beech ki behas jaldi khatam hoti hai.</p></div>

<div class="iv"><p class="q">"Aapke Rapid Threat Containment test ne host quarantine nahi kiya. Aap troubleshoot kaise karoge?"</p><p>Strong answer: chain follow karo. Confirm karo ki trigger karne wala event device aur Management Center mein maujood hai; device–Management Center tunnel healthy hai; Correlation Events se check karo ki correlation policy active hai aur rule condition match karti hai; remediation status mein errors dekho (pxGrid connectivity, ANC naam, source vs destination, ISE session nahi); phir ISE par endpoint assignment, live logs mein CoA, Session:ANCPolicy par authorization exception, aur switch dynamic-author config check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Signal → transport → decision → action walk karo; pehle bina saboot wale hop par ruko.</li>
<li>Pehle Threat Defense–Management Center channel check karo (show managers, sftunnel-status-brief).</li>
<li>TID failures: action, publish, elements, paused publishing, fastpath, decryption, file policy.</li>
<li>RTC failures: inactive policy, rule condition, remediation status, ISE session aur authorization, CoA.</li>
<li>SIEM failures: TCP 8302 reachability, client certificate, event types, syslog settings.</li>
</ul></div>
`}};export{e as default};