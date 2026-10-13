var e={id:`logging-events`,h:{en:`Logging inspection events`,hi:`Inspection events ki logging`},body:{en:`
<p>Every earlier chapter ended with "read the log". This chapter teaches how. A firewall that blocks silently is a mystery; a firewall that logs the right thing at the right level is a tool you can debug in minutes.</p>

<h3>Start with an analogy: the security camera and the diary</h3>
<p>A building has cameras that record everything for a day (cheap, short-lived), a guard diary where important events are written permanently, and a red phone for emergencies. The NGFW does the same with log levels: some events are only shown live, some are stored, some trigger an alert.</p>

<h3>Log levels on a rule</h3>
<table class="cmp"><tr><th>Level</th><th>Meaning</th></tr>
<tr><td>None</td><td>No log entry for this rule</td></tr>
<tr><td>Transient</td><td>Shown in current events only, not stored</td></tr>
<tr><td>Stored</td><td>Written to the log database (the default when nothing else sets it)</td></tr>
<tr><td>Essential</td><td>Stored and marked as important for summaries</td></tr>
<tr><td>Alert</td><td>Stored and triggers an alert</td></tr>
</table>
<p>A rule can say inherit: it then takes the default from a <b>Continue</b> rule above it, or Stored when no Continue rule sets one. Choose levels on purpose: Alert on rare events that need a person, Stored on traffic you may need to investigate, None or Transient on noisy traffic you will never audit. Exact storage and retention behaviour depends on your NGFW version and Log Server; the simulator keeps it simple.</p>

<h3>The action values you will see</h3>
<p>The log records what happened to the connection, and the vocabulary is slightly wider than the rule actions:</p>
<ul>
<li><b>Allow</b>: the rule allowed it.</li>
<li><b>Discard</b>: silently dropped by the rule. <b>Refuse</b>: dropped and the sender is told (reset or unreachable).</li>
<li><b>Terminate</b>: the connection was ended by inspection, for example deep inspection matching a situation.</li>
<li><b>Permit</b>: inspection saw something that would normally be terminated, and permitted it, for example because of an Inspection exception.</li>
</ul>
<p>Deep inspection and TLS failures are logged together with the <b>situation</b>, so you see what pattern fired, not just that something did.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Where log entries come from">
<rect x="10" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">Access rule hit</text>
<rect x="10" y="90" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="85" y="120" text-anchor="middle" class="svg-ink" font-size="13">Inspection stage</text>
<rect x="10" y="160" width="150" height="50" rx="8" fill="#fde68a"/><text x="85" y="190" text-anchor="middle" class="svg-ink" font-size="13">URL category</text>
<rect x="260" y="80" width="150" height="70" rx="8" fill="#e2e8f0"/><text x="335" y="110" text-anchor="middle" class="svg-ink" font-size="13">Log entry</text><text x="335" y="130" text-anchor="middle" class="svg-muted" font-size="12">rule, action, level</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="50" text-anchor="middle" class="svg-ink" font-size="13">Logs page</text>
<rect x="490" y="160" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="190" text-anchor="middle" class="svg-ink" font-size="13">Alert</text>
<line x1="160" y1="45" x2="260" y2="105" stroke="#64748b" stroke-width="2"/><line x1="160" y1="115" x2="260" y2="115" stroke="#64748b" stroke-width="2"/><line x1="160" y1="185" x2="260" y2="130" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="95" x2="490" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="135" x2="490" y2="185" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three decision points feed one log; the level decides whether you only see it, store it, or get alerted.</p></div>

<h3>Reading an inspection log line</h3>
<p>Read left to right: time, rule that matched, action, level, then the note and situation. Ask four questions: which rule? What was the outcome? Which situation or category fired? Was the engine able to see the content (HTTPS decrypted or not)?</p>

<pre class="out">time      source       destination    rule         action     note
10:02:11  203.0.113.50 172.16.20.20   DMZ-web      <span class="hl">Terminate</span>  Situation EXPLOIT-TEST matched: Terminate   /vuln-test
10:03:40  10.1.1.10    netbank.example Staff-web    Allow      HTTPS inspection skipped for netbank.example (excluded)
10:04:02  10.1.1.10    facebook.com    Block-social Discard    category Social Media
10:05:18  10.1.1.10    203.0.113.77    Staff-web    Allow      HTTPS not decrypted: the engine cannot see the path
10:06:09  10.1.1.10    172.16.20.20    DMZ-web      Permit     Situation SUSPICIOUS-QUERY matched, Inspection exception permits it   /erp/export</pre>
<p>The five lines tell five stories: a blocked attack, a deliberate exclusion, a category block, a visibility gap, and a tuned false positive.</p>

<div class="eg"><p><b>Worked example.</b> Staff call: "The ERP export fails." You filter the Logs page by destination 172.16.20.20 for the last 15 minutes. You find one Terminate entry with situation SUSPICIOUS-QUERY on /erp/export from 10.1.1.10. In one search you know the rule, the situation, the client and the path. That is the evidence you take into chapter 8. If the rule had log level None, you would have no entry and would have to raise the level, reproduce again and then look.</p></div>

<h3>Monitoring and alerts</h3>
<p>The Monitoring and alerts page shows current events and alerts. Use Alert level only for events where a person must act, such as repeated terminations of a high-value server, otherwise people stop reading alerts. Check retention and notification setup in the documentation for your NGFW version.</p>

<div class="warn"><p><b>Common mistakes.</b></p><ul>
<li>Setting a busy rule to Stored and filling the log database with noise, or setting the DMZ rule to None and losing evidence.</li>
<li>Reading only the action column. The note and situation carry the reason.</li>
<li>Forgetting that a Transient entry is not stored: it disappears and cannot be investigated later.</li>
<li>Assuming no Terminate entry means no attack. It can mean the engine could not see the content.</li>
</ul></div>

<div class="exam"><p><b>Exam trap.</b> Know the five levels (None, Transient, Stored, Essential, Alert), that the default is Stored, and the five action values (Allow, Discard, Permit, Refuse, Terminate). Know that Continue sets defaults for rules below it.</p></div>

<div class="scn"><h4>The attack that left no trace</h4><p>During a controlled drill, the security team sent the training pattern to the DMZ server and then searched the log. Nothing. The rule had log level None because someone once found it noisy. They set the rule to Stored, installed the policy and repeated the test: a Terminate line with situation EXPLOIT-TEST appeared. A second drill to the same server over HTTPS showed an Allow line with "cannot see the path", which led to the HTTPS inspection work from chapter 4.</p><p><b>Lesson:</b> logging is part of the control. A control you cannot read is half a control.</p></div>

<div class="iv"><p class="q">"How do you decide log levels on a firewall rule?"</p><p>Strong answer: Alert for rare, high-value events needing a human; Stored for traffic you may investigate (DMZ, inspection hits, category blocks); Transient or None for high-volume low-value traffic. Mention the Continue rule for defaults, retention limits, and that you test by generating the event and finding it in the log.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Log levels: None, Transient, Stored (default), Essential, Alert.</li>
<li>Log action values: Allow, Discard, Permit, Refuse, Terminate.</li>
<li>Inspection and TLS failures are logged with the situation.</li>
<li>Read rule, action, note and visibility, not just the action.</li>
<li>Choose levels deliberately and test that the event can be found.</li>
</ul></div>
`,hi:`
<p>Pichle har chapter ka end "log padho" par hua. Yeh chapter sikhata hai kaise. Jo firewall chupchaap block karta hai woh ek paheli hai; jo firewall sahi cheez sahi level par log karta hai woh aisa tool hai jise aap minutes mein debug kar sakte ho.</p>

<h3>Ek analogy se shuru karo: security camera aur diary</h3>
<p>Building mein cameras hote hain jo ek din tak sab record karte hain (sasta, short-lived), guard ki diary jahan zaroori events permanently likhe jaate hain, aur emergency ke liye red phone. NGFW log levels ke saath yahi karta hai: kuch events sirf live dikhte hain, kuch stored hote hain, kuch alert trigger karte hain.</p>

<h3>Rule par log levels</h3>
<table class="cmp"><tr><th>Level</th><th>Matlab</th></tr>
<tr><td>None</td><td>Is rule ke liye koi log entry nahi</td></tr>
<tr><td>Transient</td><td>Sirf current events mein dikhta hai, stored nahi hota</td></tr>
<tr><td>Stored</td><td>Log database mein likha jaata hai (default jab koi aur set na kare)</td></tr>
<tr><td>Essential</td><td>Stored aur summaries ke liye important mark hota hai</td></tr>
<tr><td>Alert</td><td>Stored aur alert trigger karta hai</td></tr>
</table>
<p>Rule inherit bol sakta hai: tab woh upar ke <b>Continue</b> rule se default leta hai, ya koi Continue rule set na kare to Stored. Levels soch samajhkar chuno: rare events jinhe insaan chahiye unke liye Alert, jin traffic ko investigate kar sakte ho unke liye Stored, noisy traffic jise kabhi audit nahi karoge uske liye None ya Transient. Exact storage aur retention behaviour aapke NGFW version aur Log Server par depend karta hai; simulator ise simple rakhta hai.</p>

<h3>Action values jo aap dekhoge</h3>
<p>Log batata hai connection ke saath kya hua, aur vocabulary rule actions se thodi badi hai:</p>
<ul>
<li><b>Allow</b>: rule ne allow kiya.</li>
<li><b>Discard</b>: rule ne chupchaap drop kiya. <b>Refuse</b>: drop kiya aur sender ko bataya (reset ya unreachable).</li>
<li><b>Terminate</b>: inspection ne connection khatam kiya, jaise deep inspection ne situation match ki.</li>
<li><b>Permit</b>: inspection ne kuch dekha jo normally terminate hota, aur use permit kiya, jaise Inspection exception ki wajah se.</li>
</ul>
<p>Deep inspection aur TLS failures <b>situation</b> ke saath log hote hain, taaki aap dekho kaunsa pattern fire hua, sirf yeh nahi ki kuch hua.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Log entries kahan se aati hain">
<rect x="10" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">Access rule hit</text>
<rect x="10" y="90" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="85" y="120" text-anchor="middle" class="svg-ink" font-size="13">Inspection stage</text>
<rect x="10" y="160" width="150" height="50" rx="8" fill="#fde68a"/><text x="85" y="190" text-anchor="middle" class="svg-ink" font-size="13">URL category</text>
<rect x="260" y="80" width="150" height="70" rx="8" fill="#e2e8f0"/><text x="335" y="110" text-anchor="middle" class="svg-ink" font-size="13">Log entry</text><text x="335" y="130" text-anchor="middle" class="svg-muted" font-size="12">rule, action, level</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="50" text-anchor="middle" class="svg-ink" font-size="13">Logs page</text>
<rect x="490" y="160" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="190" text-anchor="middle" class="svg-ink" font-size="13">Alert</text>
<line x1="160" y1="45" x2="260" y2="105" stroke="#64748b" stroke-width="2"/><line x1="160" y1="115" x2="260" y2="115" stroke="#64748b" stroke-width="2"/><line x1="160" y1="185" x2="260" y2="130" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="95" x2="490" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="135" x2="490" y2="185" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Teen decision points ek log ko feed karte hain; level decide karta hai ki aap sirf dekho, store karo, ya alert pao.</p></div>

<h3>Inspection log line padhna</h3>
<p>Left se right padho: time, matching rule, action, level, phir note aur situation. Chaar sawaal poochho: kaunsa rule? Outcome kya tha? Kaunsi situation ya category fire hui? Kya engine content dekh paaya (HTTPS decrypt hua ya nahi)?</p>

<pre class="out">time      source       destination    rule         action     note
10:02:11  203.0.113.50 172.16.20.20   DMZ-web      <span class="hl">Terminate</span>  Situation EXPLOIT-TEST matched: Terminate   /vuln-test
10:03:40  10.1.1.10    netbank.example Staff-web    Allow      HTTPS inspection skipped for netbank.example (excluded)
10:04:02  10.1.1.10    facebook.com    Block-social Discard    category Social Media
10:05:18  10.1.1.10    203.0.113.77    Staff-web    Allow      HTTPS not decrypted: the engine cannot see the path
10:06:09  10.1.1.10    172.16.20.20    DMZ-web      Permit     Situation SUSPICIOUS-QUERY matched, Inspection exception permits it   /erp/export</pre>
<p>Paanch lines paanch kahaniyan batati hain: ek blocked attack, ek deliberate exclusion, ek category block, ek visibility gap, aur ek tuned false positive.</p>

<div class="eg"><p><b>Worked example.</b> Staff bolta hai: "ERP export fail ho raha hai." Aap Logs page ko destination 172.16.20.20 se pichhle 15 minute ke liye filter karte ho. Aapko 10.1.1.10 se /erp/export par situation SUSPICIOUS-QUERY ke saath ek Terminate entry milti hai. Ek search mein aap rule, situation, client aur path jaan lete ho. Yahi evidence aap chapter 8 mein le jaate ho. Rule ka log level None hota to koi entry nahi milti aur aapko level badhana, dobara reproduce karna, phir dekhna padta.</p></div>

<h3>Monitoring aur alerts</h3>
<p>Monitoring and alerts page current events aur alerts dikhata hai. Alert level sirf un events ke liye use karo jahan insaan ko action lena hai, jaise high-value server ke repeated terminations, warna log alerts padhna chhod dete hain. Retention aur notification setup ke liye apne NGFW version ki documentation check karo.</p>

<div class="warn"><p><b>Common mistakes.</b></p><ul>
<li>Busy rule ko Stored par rakhkar log database ko noise se bharna, ya DMZ rule ko None karke evidence khona.</li>
<li>Sirf action column padhna. Reason note aur situation mein hota hai.</li>
<li>Yeh bhoolna ki Transient entry stored nahi hoti: woh gayab ho jaati hai aur baad mein investigate nahi ho sakti.</li>
<li>Yeh maanna ki Terminate entry nahi hai to attack nahi hua. Iska matlab yeh bhi ho sakta hai ki engine content nahi dekh paaya.</li>
</ul></div>

<div class="exam"><p><b>Exam trap.</b> Paanch levels (None, Transient, Stored, Essential, Alert), default Stored, aur paanch action values (Allow, Discard, Permit, Refuse, Terminate) jaano. Yaad rakho ki Continue apne neeche ke rules ke liye defaults set karta hai.</p></div>

<div class="scn"><h4>Attack jisne koi nishaan nahi chhoda</h4><p>Ek controlled drill mein security team ne training pattern DMZ server ko bheja aur phir log search kiya. Kuch nahi. Rule ka log level None tha kyunki kisi ne kabhi use noisy paaya tha. Unhone rule ko Stored kiya, policy install ki aur test dobara kiya: situation EXPLOIT-TEST ke saath Terminate line aayi. Usi server par HTTPS se doosre drill mein "cannot see the path" ke saath Allow line aayi, jo hamein chapter 4 ke HTTPS inspection kaam ki taraf le gayi.</p><p><b>Lesson:</b> logging control ka hissa hai. Jo control aap padh nahi sakte woh aadha control hai.</p></div>

<div class="iv"><p class="q">"Firewall rule par log levels kaise decide karte ho?"</p><p>Strong answer: rare, high-value events jinhe insaan chahiye unke liye Alert; jin traffic ko investigate kar sakte ho (DMZ, inspection hits, category blocks) unke liye Stored; high-volume low-value traffic ke liye Transient ya None. Defaults ke liye Continue rule, retention limits, aur yeh mention karo ki aap event generate karke log mein dhundh ke test karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Log levels: None, Transient, Stored (default), Essential, Alert.</li>
<li>Log action values: Allow, Discard, Permit, Refuse, Terminate.</li>
<li>Inspection aur TLS failures situation ke saath log hote hain.</li>
<li>Rule, action, note aur visibility padho, sirf action nahi.</li>
<li>Levels soch samajhkar chuno aur test karo ki event mil jaata hai.</li>
</ul></div>
`}};export{e as default};