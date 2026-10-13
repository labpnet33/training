var e={id:`fmc-events`,h:{en:`Unified events and connection events in the Management Center`,hi:`Management Center mein unified events aur connection events`},body:{en:`
<p>The device CLI tells you what is happening now. The Management Center tells you what <b>happened</b>: which rule allowed or blocked a connection at 10:14 yesterday, which Snort feature stopped it, and how many bytes went through. It is the flight data recorder. When a user says "it failed this morning and works now", only events can answer.</p>

<h3>Where the events live</h3>
<table class="cmp"><tr><th>Menu</th><th>What you see</th></tr>
<tr><td>Analysis → Unified Events</td><td>Connection, Security Intelligence, intrusion, file and malware events in one table, with a live view and one search bar</td></tr>
<tr><td>Analysis → Connections → Events</td><td>Connection events: initiator, responder, ports, zones, rule, action, reason, bytes, application</td></tr>
<tr><td>Analysis → Connections → Security-Related Events</td><td>Security Intelligence events (IP, URL, DNS)</td></tr>
<tr><td>Analysis → Intrusions → Events</td><td>Intrusion events with GID:SID, message, inline result and packet view</td></tr>
<tr><td>Analysis → Files</td><td>File and malware events</td></tr>
</table>
<p><b>Unified Events</b> is the best first stop for a ticket: one place, all event types for the same flow, and a live mode that refreshes while the user reproduces the problem.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Event flow from device to Management Center">
<rect x="10" y="60" width="150" height="70" rx="8" fill="#bae6fd"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="13">NK-FTD</text><text x="85" y="110" text-anchor="middle" class="svg-muted" font-size="12">rule logs a match</text>
<rect x="245" y="60" width="150" height="70" rx="8" fill="#fde68a"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">sftunnel</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">TCP 8305</text>
<rect x="480" y="60" width="150" height="70" rx="8" fill="#bbf7d0"/><text x="555" y="90" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text><text x="555" y="110" text-anchor="middle" class="svg-muted" font-size="12">event database</text>
<line x1="160" y1="95" x2="245" y2="95" stroke="#64748b" stroke-width="2"/><line x1="395" y1="95" x2="480" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">No logging on the rule = no event, even though traffic matched</text>
</svg><p class="cap">Events exist only if the rule (or default action) is set to log, and they travel to the Management Center over the management tunnel.</p></div>

<h3>Reading a connection event</h3>
<pre class="out">First Packet         2026-10-02 09:14:02
Action               Block
<span class="hl">Reason               (blank)</span>
Initiator IP         198.51.100.10
Responder IP         203.0.113.3
Ingress Zone         OUTSIDE
Egress Zone          OUTSIDE
Responder Port       443 (tcp)
<span class="hl">Access Control Rule  Default Action</span>
Access Control Policy NK-ACP
Device               NK-FTD</pre>
<p>Notice what the event says: the egress zone is OUTSIDE (no UN-NAT happened), the rule is <b>Default Action</b>, and the Reason is blank, so no Snort feature such as Security Intelligence or intrusion was involved; the access control policy simply had no matching rule. After the lab fix, the same search shows:</p>
<pre class="out">Action               Allow
Initiator IP         198.51.100.10
Responder IP         10.0.2.10
Ingress Zone         OUTSIDE
Egress Zone          DMZ
<span class="hl">Access Control Rule  Portal-In</span>
Application Protocol HTTPS
Initiator Bytes      2 291
Responder Bytes      16 051</pre>
<p>Connection events show the <b>real</b> responder address (10.0.2.10), and bytes in both directions prove the server answered.</p>

<h3>The Reason column: who said no?</h3>
<table class="cmp"><tr><th>Reason</th><th>Meaning</th><th>Next step</th></tr>
<tr><td>blank, rule = your Block rule or Default Action</td><td>Access control decision</td><td>Fix or add a rule</td></tr>
<tr><td>IP Block / URL Block / DNS Block</td><td>Security Intelligence block list</td><td>Security-Related Events, validate the indicator</td></tr>
<tr><td>Intrusion Block</td><td>Intrusion policy dropped the flow</td><td>Intrusion event, GID:SID, packet view</td></tr>
<tr><td>File Block / File Malware Block</td><td>File policy</td><td>File events</td></tr>
<tr><td>IP Monitor, DNS Monitor</td><td>SI matched but only monitors</td><td>Traffic continued</td></tr>
</table>

<h3>Why events are sometimes missing</h3>
<ul>
<li><b>Logging is off on the rule.</b> Each rule has "Log at Beginning of Connection" and "Log at End of Connection". Block rules can only log at the beginning (the connection never ends normally). The default action has its own logging setting.</li>
<li><b>Trust and Fastpath</b> flows log less (prefilter Fastpath logs only if configured on the prefilter rule).</li>
<li><b>Time filter.</b> The default view shows the last hour; widen the time window.</li>
<li><b>The device cannot send events.</b> If the management tunnel is down (chapter 8), events queue on the device and arrive later, or not at all if the disk fills.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Search in Unified Events: Initiator IP 198.51.100.10, Responder Port 443, last 2 hours, live view on. While the partner retries, three Block events appear with rule Default Action. After the fix and deploy, the next event shows Allow with rule Portal-In. That is lab task 4's evidence.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Concluding "the firewall is not blocking, there are no events" when the blocking rule simply has logging disabled. Searching connection events for the public address 203.0.113.3 after the fix (the responder is 10.0.2.10). Logging every Allow rule at the beginning <i>and</i> end on a busy firewall, which floods the database; end of connection is usually enough.</p></div>

<div class="exam"><p><b>Exam trap.</b> Block actions log only at the beginning of the connection. Unified Events combines all event types in one view. A blank Reason with rule Default Action means no rule matched; a Reason of IP Block means Security Intelligence, not an access control rule.</p></div>

<div class="scn"><h4>"It worked at 8 and broke at 9"</h4><p>A finance team said a supplier site failed from 9:00. Unified Events filtered on the site showed Allow events with rule Internet-Out until 08:57, then Block events with Reason <b>URL Block</b>. The Security Intelligence feed had added the supplier's shared hosting address after an unrelated site on the same host was flagged. The analyst verified with the threat team that the specific supplier site was clean, added it to the Do-Not-Block list with a ticket reference and an expiry review, deployed, and the next event was Allow.</p><p><b>Lesson:</b> events with timestamps and a Reason turn "it broke" into "this feature, at this minute, for this reason".</p></div>

<div class="iv"><p class="q">"A user says the firewall blocked them, but you find no connection events. What could be wrong?"</p><p>The matching rule or default action may not log; the time window may be too narrow; the traffic may never reach the firewall (check with a capture); the device may not be sending events to the Management Center (management tunnel, disk); or the flow was trusted or fastpathed. Then confirm on the device with packet-tracer and show access-control-config hit counts.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Unified Events is the single view for connection, SI, intrusion, file and malware events.</li>
<li>Connection events show rule, action, reason, zones, real addresses and bytes.</li>
<li>The Reason column tells you which Snort feature blocked; blank plus Default Action means no rule matched.</li>
<li>No logging configured = no events; Block rules log at the beginning only.</li>
<li>Events need a working management connection to reach the Management Center.</li>
</ul></div>
`,hi:`
<p>Device CLI batata hai ki abhi kya ho raha hai. Management Center batata hai ki kya <b>hua tha</b>: kal 10:14 par kis rule ne connection allow ya block kiya, kis Snort feature ne use roka, aur kitne bytes gaye. Yeh flight data recorder hai. Jab user kehta hai "subah fail hua aur ab chal raha hai", to sirf events hi jawab de sakte hain.</p>

<h3>Events kahan rehte hain</h3>
<table class="cmp"><tr><th>Menu</th><th>Aap kya dekhte ho</th></tr>
<tr><td>Analysis → Unified Events</td><td>Connection, Security Intelligence, intrusion, file aur malware events ek table mein, live view aur ek search bar ke saath</td></tr>
<tr><td>Analysis → Connections → Events</td><td>Connection events: initiator, responder, ports, zones, rule, action, reason, bytes, application</td></tr>
<tr><td>Analysis → Connections → Security-Related Events</td><td>Security Intelligence events (IP, URL, DNS)</td></tr>
<tr><td>Analysis → Intrusions → Events</td><td>GID:SID, message, inline result aur packet view ke saath intrusion events</td></tr>
<tr><td>Analysis → Files</td><td>File aur malware events</td></tr>
</table>
<p>Ticket ke liye <b>Unified Events</b> sabse accha pehla stop hai: ek jagah, same flow ke saare event types, aur ek live mode jo user ke problem reproduce karte waqt refresh hota rehta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Device se Management Center tak event flow">
<rect x="10" y="60" width="150" height="70" rx="8" fill="#bae6fd"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="13">NK-FTD</text><text x="85" y="110" text-anchor="middle" class="svg-muted" font-size="12">rule match log karti hai</text>
<rect x="245" y="60" width="150" height="70" rx="8" fill="#fde68a"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">sftunnel</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">TCP 8305</text>
<rect x="480" y="60" width="150" height="70" rx="8" fill="#bbf7d0"/><text x="555" y="90" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text><text x="555" y="110" text-anchor="middle" class="svg-muted" font-size="12">event database</text>
<line x1="160" y1="95" x2="245" y2="95" stroke="#64748b" stroke-width="2"/><line x1="395" y1="95" x2="480" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">Rule par logging nahi = event nahi, chahe traffic match hua ho</text>
</svg><p class="cap">Events tabhi bante hain jab rule (ya default action) log karne ke liye set ho, aur woh management tunnel ke through Management Center tak jaate hain.</p></div>

<h3>Connection event padhna</h3>
<pre class="out">First Packet         2026-10-02 09:14:02
Action               Block
<span class="hl">Reason               (blank)</span>
Initiator IP         198.51.100.10
Responder IP         203.0.113.3
Ingress Zone         OUTSIDE
Egress Zone          OUTSIDE
Responder Port       443 (tcp)
<span class="hl">Access Control Rule  Default Action</span>
Access Control Policy NK-ACP
Device               NK-FTD</pre>
<p>Dekho event kya kehta hai: egress zone OUTSIDE hai (UN-NAT nahi hua), rule <b>Default Action</b> hai, aur Reason khali hai, yaani Security Intelligence ya intrusion jaisa koi Snort feature involved nahi tha; access control policy mein bas koi matching rule nahi thi. Lab fix ke baad wahi search yeh dikhata hai:</p>
<pre class="out">Action               Allow
Initiator IP         198.51.100.10
Responder IP         10.0.2.10
Ingress Zone         OUTSIDE
Egress Zone          DMZ
<span class="hl">Access Control Rule  Portal-In</span>
Application Protocol HTTPS
Initiator Bytes      2 291
Responder Bytes      16 051</pre>
<p>Connection events <b>real</b> responder address (10.0.2.10) dikhate hain, aur dono direction mein bytes prove karte hain ki server ne jawab diya.</p>

<h3>Reason column: kisne mana kiya?</h3>
<table class="cmp"><tr><th>Reason</th><th>Matlab</th><th>Agla step</th></tr>
<tr><td>khali, rule = aapki Block rule ya Default Action</td><td>Access control decision</td><td>Rule theek karo ya jodo</td></tr>
<tr><td>IP Block / URL Block / DNS Block</td><td>Security Intelligence block list</td><td>Security-Related Events, indicator validate karo</td></tr>
<tr><td>Intrusion Block</td><td>Intrusion policy ne flow drop kiya</td><td>Intrusion event, GID:SID, packet view</td></tr>
<tr><td>File Block / File Malware Block</td><td>File policy</td><td>File events</td></tr>
<tr><td>IP Monitor, DNS Monitor</td><td>SI match hua par sirf monitor karta hai</td><td>Traffic chalta raha</td></tr>
</table>

<h3>Events kabhi kabhi missing kyun hote hain</h3>
<ul>
<li><b>Rule par logging off hai.</b> Har rule mein "Log at Beginning of Connection" aur "Log at End of Connection" hota hai. Block rules sirf beginning par log kar sakti hain (connection normal tarah khatam hota hi nahi). Default action ki apni logging setting hoti hai.</li>
<li><b>Trust aur Fastpath</b> flows kam log karte hain (prefilter Fastpath tabhi log karta hai jab prefilter rule par configure ho).</li>
<li><b>Time filter.</b> Default view pichla ek ghanta dikhata hai; time window badhao.</li>
<li><b>Device events nahi bhej sakta.</b> Agar management tunnel down hai (chapter 8), to events device par queue hote hain aur baad mein aate hain, ya disk bhar jaaye to aate hi nahi.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Unified Events mein search: Initiator IP 198.51.100.10, Responder Port 443, pichle 2 ghante, live view on. Partner ke retry karte waqt teen Block events rule Default Action ke saath aate hain. Fix aur deploy ke baad agla event rule Portal-In ke saath Allow dikhata hai. Yahi lab task 4 ka evidence hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Yeh conclusion nikaalna ki "firewall block nahi kar raha, koi events nahi hain" jabki blocking rule par bas logging disabled hai. Fix ke baad connection events mein public address 203.0.113.3 search karna (responder 10.0.2.10 hai). Busy firewall par har Allow rule ko beginning <i>aur</i> end dono par log karna, jo database ko flood kar deta hai; aam taur par end of connection kaafi hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Block actions sirf connection ke beginning par log hote hain. Unified Events saare event types ek view mein jodta hai. Khali Reason ke saath rule Default Action ka matlab koi rule match nahi hui; Reason IP Block ka matlab Security Intelligence hai, access control rule nahi.</p></div>

<div class="scn"><h4>"8 baje chal raha tha aur 9 baje toot gaya"</h4><p>Ek finance team ne kaha ki ek supplier site 9:00 se fail ho rahi hai. Site par filter kiye Unified Events ne 08:57 tak rule Internet-Out ke saath Allow events dikhaye, phir Reason <b>URL Block</b> ke saath Block events. Security Intelligence feed ne supplier ka shared hosting address jod diya tha jab usi host par ek unrelated site flag hui thi. Analyst ne threat team ke saath verify kiya ki woh specific supplier site clean hai, use ticket reference aur expiry review ke saath Do-Not-Block list mein joda, deploy kiya, aur agla event Allow tha.</p><p><b>Seekh:</b> timestamps aur Reason wale events "toot gaya" ko "yeh feature, is minute, is wajah se" mein badal dete hain.</p></div>

<div class="iv"><p class="q">"User kehta hai firewall ne use block kiya, par aapko koi connection events nahi milte. Kya galat ho sakta hai?"</p><p>Matching rule ya default action log nahi karta ho sakta; time window bahut chhota ho sakta hai; traffic shayad firewall tak pahunchta hi nahi (capture se check karo); device shayad Management Center ko events nahi bhej raha (management tunnel, disk); ya flow trusted ya fastpathed tha. Phir device par packet-tracer aur show access-control-config hit counts se confirm karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Unified Events connection, SI, intrusion, file aur malware events ka single view hai.</li>
<li>Connection events rule, action, reason, zones, real addresses aur bytes dikhate hain.</li>
<li>Reason column batata hai kis Snort feature ne block kiya; khali plus Default Action matlab koi rule match nahi hui.</li>
<li>Logging configure nahi = events nahi; Block rules sirf beginning par log karti hain.</li>
<li>Events ko Management Center tak pahunchne ke liye working management connection chahiye.</li>
</ul></div>
`}};export{e as default};