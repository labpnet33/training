var e={id:`end-to-end-troubleshooting`,h:{en:`End-to-end troubleshooting`,hi:`End-to-end troubleshooting`},body:{en:`
<h3>A method beats a hunch</h3>
<p>Think of a doctor. She does not guess the illness from the first sneeze. She listens to the complaint, measures vital signs, forms a theory, tests it and only then prescribes. End-to-end troubleshooting is the same: follow the path a packet takes from the user to the service and back, check each hop with evidence, and change one thing at a time.</p>

<h3>The method in seven moves</h3>
<ol>
<li><b>Define the problem exactly.</b> Who, what, since when, how often, from where to where. "Kochi staff cannot open the ERP since 09:10" is a problem; "network is bad" is not.</li>
<li><b>Check what changed.</b> The audit log, the change calendar, and the weekend. Most incidents follow a change.</li>
<li><b>Draw the path.</b> User, switch, router, circuit, provider, far router, server. Name the hops.</li>
<li><b>Split the path in half.</b> Test at the middle (ping, traceroute, capture) and learn which half holds the fault. Repeat. This is faster than checking hop by hop.</li>
<li><b>Form one hypothesis</b> and predict what you would see if it were true.</li>
<li><b>Test it</b> with the least risky tool first (read, then probe, then change).</li>
<li><b>Fix, verify with user-level evidence, and record.</b></li>
</ol>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Path from user to service with halving">
<rect x="5" y="60" width="70" height="50" rx="8" fill="#bae6fd"/><text x="40" y="90" text-anchor="middle" class="svg-ink" font-size="12">PC-KCH</text>
<rect x="95" y="60" width="70" height="50" rx="8" fill="#bae6fd"/><text x="130" y="90" text-anchor="middle" class="svg-ink" font-size="12">SW-KCH</text>
<rect x="185" y="60" width="70" height="50" rx="8" fill="#bae6fd"/><text x="220" y="90" text-anchor="middle" class="svg-ink" font-size="12">R-KCH</text>
<rect x="275" y="60" width="90" height="50" rx="8" fill="#fde68a"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="12">Provider</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="11">BB-KCH-01</text>
<rect x="385" y="60" width="70" height="50" rx="8" fill="#bbf7d0"/><text x="420" y="90" text-anchor="middle" class="svg-ink" font-size="12">R-HYD</text>
<rect x="475" y="60" width="70" height="50" rx="8" fill="#bbf7d0"/><text x="510" y="90" text-anchor="middle" class="svg-ink" font-size="12">SW-HYD</text>
<rect x="565" y="60" width="70" height="50" rx="8" fill="#ddd6fe"/><text x="600" y="90" text-anchor="middle" class="svg-ink" font-size="12">SRV-HYD</text>
<g stroke="#64748b" stroke-width="2"><line x1="75" y1="85" x2="95" y2="85"/><line x1="165" y1="85" x2="185" y2="85"/><line x1="255" y1="85" x2="275" y2="85"/><line x1="365" y1="85" x2="385" y2="85"/><line x1="455" y1="85" x2="475" y2="85"/><line x1="545" y1="85" x2="565" y2="85"/></g>
<line x1="320" y1="30" x2="320" y2="150" stroke="#ea5d0c" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="12">test the middle first</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">answers in this half? then split that half again</text>
</svg><p class="cap">Halve the path: each test removes half the suspects.</p></div>

<h3>Observability faults: the monitoring itself can break</h3>
<p>Sometimes the incident is that you cannot see. After a change, a target shows no data, logs stop, or flows vanish. The console gives a reason code for each failing feed, so read the code before guessing:</p>
<table class="cmp"><tr><th>Signal</th><th>Reason codes you may see</th><th>Typical cause</th></tr>
<tr><td>SNMP poll</td><td>disabled, timeout, wrong-community, unknown-user, wrong-level, auth-failure, decrypt-error</td><td>Community typo, v3 credentials changed, access list, firewall</td></tr>
<tr><td>Syslog</td><td>target-down, disabled, collector-off, dest, port, proto</td><td>Wrong logging host, collector stopped, port or protocol mismatch</td></tr>
<tr><td>Flow exporter</td><td>target-down, disabled, dest, port, version, source</td><td>Wrong destination or port, version the collector does not decode, export source not Loopback0</td></tr>
</table>
<p>The Targets page shows a poll state per target. The Logs page shows the collector settings (running, port, protocol, rate limit, retention) and the newest messages. The Flows page lists each exporter and the collector settings (address, UDP port, versions decoded, and which source address it accepts from each router).</p>

<h3>Lab obs-ops-2: three faults after a weekend change</h3>
<p>The story: over the weekend Kabir Shah ran a change at Kochi, Lucknow and Hyderabad. On Monday morning a dashboard shows no data for one target, a log source is silent and a flow exporter has vanished. There are three separate faults, plus a console setting that is wrong. Resist the urge to fix by guessing. Work one signal at a time:</p>
<ol>
<li><b>Read the audit log</b> to see what changed over the weekend. It tells you where to look. <i>What does this change on the wire/policy?</i> Nothing; it is reading.</li>
<li><b>SNMP.</b> On Targets, find the target with no data. The reason code says wrong-community; its poll community differs from the agent's <code>GF-RO</code>. Correct it and Apply. On the wire, the next poll carries the right community string, so the router answers.</li>
<li><b>Syslog.</b> On Logs, find the silent source. The reason code (dest, port or collector-off) points to a wrong destination or a collector setting. The collector must listen on the same port and protocol the routers send (UDP 514). Fix the side that is wrong, Apply, and the messages appear.</li>
<li><b>Flows.</b> On Flows, the exporter reason is source: the router exports from an address other than Loopback0, so the collector rejects it because it accepts only each router's loopback (R-HYD 10.255.0.1, R-KCH 10.255.0.2, R-LKO 10.255.0.3). Set the source back to Loopback0, check destination 10.1.50.100 and port 9995.</li>
<li><b>Console settings.</b> Check collector running, listen ports, versions decoded (v9 and IPFIX) and the log rate limit. Console-side mistakes look like device-side ones.</li>
<li><b>Prove it.</b> Run a Live tools ping and a capture to the collector and show the three feeds back to ok in the Overview.</li>
</ol>
<pre class="out">Targets            R-KCH     poll v2c   <span class="hl">wrong-community</span> (console GF-R0, agent GF-RO)
Logs               R-LKO     <span class="hl">dest</span> (sends to 10.1.50.101, collector is 10.1.50.100)
Flows              R-HYD     exporter <span class="hl">source</span> (Gi0/0 instead of Loopback0)
Collector          flows UDP 9995   versions v9, ipfix   running</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> The community fix changes the string inside SNMP polls. The syslog fix changes where UDP log packets are sent or which port listens. The flow fix changes the source address of export packets, which is what the collector checks. None of them changes user traffic.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Fixing the symptom you noticed and not hunting for the other faults, because one change often causes several. (2) Changing the collector when the router is wrong, so you now break the sources that were working. (3) Never verifying from the user's point of view. (4) Ignoring the reason code and guessing.</p></div>
<div class="exam"><p><b>Exam trap.</b> A reason code is the shortest route to the fault. Also, the NetFlow collector accepts exports only from the expected source address; a wrong export source looks like "no flows" even though the exporter is on.</p></div>

<div class="scn"><h4>The Monday blind spot</h4><p>After a weekend change at Godavari Foods, Meena Iyer found Kochi with no polling data, Lucknow logs silent and Hyderabad exports missing. She opened the audit log, found that a script had changed three things, and fixed community, log destination and export source one at a time, applying and verifying after each. A last capture to OBSERVER proved all three feeds were back, and she added a post-change check list to the change template.</p><p><b>Lesson:</b> one change, many faults; fix one at a time and verify each.</p></div>

<div class="iv"><p class="q">"Users cannot reach an application. How do you troubleshoot end to end?"</p><p>Define the problem precisely, check recent changes, draw the path, halve it with ping, traceroute or capture, form a hypothesis, test with the least risky tool, fix one thing and verify from the user's side. Mention reading evidence from SNMP, flows, logs and probes at each step.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Define the problem, check changes, draw the path, halve it, test, fix, verify.</li>
<li>Reason codes in the console point straight at the failing part.</li>
<li>Monitoring can break too: community, destination, port, source, collector.</li>
<li>Fix one thing at a time and verify each fix.</li>
<li>Always prove recovery with user-level evidence.</li>
</ul></div>
`,hi:`
<h3>Tukke se behtar method</h3>
<p>Doctor socho. Woh pehli chheenk se bimari ka andaza nahi lagati. Woh complaint sunti hai, vital signs naapti hai, theory banati hai, test karti hai aur tab dawa likhti hai. End-to-end troubleshooting waisi hi hai: packet user se service tak aur wapas jis path par jaata hai use follow karo, har hop evidence se check karo, aur ek baar mein ek cheez badlo.</p>

<h3>Saat moves mein method</h3>
<ol>
<li><b>Problem ko exactly define karo.</b> Kaun, kya, kab se, kitni baar, kahan se kahan. "Kochi staff 09:10 se ERP nahi khol pa raha" problem hai; "network kharab hai" nahi.</li>
<li><b>Dekho kya badla.</b> Audit log, change calendar, aur weekend. Zyadatar incidents kisi change ke baad aate hain.</li>
<li><b>Path draw karo.</b> User, switch, router, circuit, provider, door ka router, server. Hops ke naam likho.</li>
<li><b>Path ko aadha karo.</b> Beech mein test karo (ping, traceroute, capture) aur pata karo ki fault kis aadhe mein hai. Phir repeat. Yeh hop-by-hop se tez hai.</li>
<li><b>Ek hypothesis banao</b> aur predict karo ki agar sach hoti to kya dikhta.</li>
<li><b>Test karo</b> sabse kam risky tool se pehle (padho, phir probe, phir change).</li>
<li><b>Fix karo, user-level evidence se verify karo, aur record karo.</b></li>
</ol>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="User se service tak path aur halving">
<rect x="5" y="60" width="70" height="50" rx="8" fill="#bae6fd"/><text x="40" y="90" text-anchor="middle" class="svg-ink" font-size="12">PC-KCH</text>
<rect x="95" y="60" width="70" height="50" rx="8" fill="#bae6fd"/><text x="130" y="90" text-anchor="middle" class="svg-ink" font-size="12">SW-KCH</text>
<rect x="185" y="60" width="70" height="50" rx="8" fill="#bae6fd"/><text x="220" y="90" text-anchor="middle" class="svg-ink" font-size="12">R-KCH</text>
<rect x="275" y="60" width="90" height="50" rx="8" fill="#fde68a"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="12">Provider</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="11">BB-KCH-01</text>
<rect x="385" y="60" width="70" height="50" rx="8" fill="#bbf7d0"/><text x="420" y="90" text-anchor="middle" class="svg-ink" font-size="12">R-HYD</text>
<rect x="475" y="60" width="70" height="50" rx="8" fill="#bbf7d0"/><text x="510" y="90" text-anchor="middle" class="svg-ink" font-size="12">SW-HYD</text>
<rect x="565" y="60" width="70" height="50" rx="8" fill="#ddd6fe"/><text x="600" y="90" text-anchor="middle" class="svg-ink" font-size="12">SRV-HYD</text>
<g stroke="#64748b" stroke-width="2"><line x1="75" y1="85" x2="95" y2="85"/><line x1="165" y1="85" x2="185" y2="85"/><line x1="255" y1="85" x2="275" y2="85"/><line x1="365" y1="85" x2="385" y2="85"/><line x1="455" y1="85" x2="475" y2="85"/><line x1="545" y1="85" x2="565" y2="85"/></g>
<line x1="320" y1="30" x2="320" y2="150" stroke="#ea5d0c" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="12">pehle beech ko test karo</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">jawab is aadhe mein? to us aadhe ko phir split karo</text>
</svg><p class="cap">Path aadha karo: har test aadhe suspects hata deta hai.</p></div>

<h3>Observability faults: monitoring khud bhi toot sakti hai</h3>
<p>Kabhi incident yeh hota hai ki aap dekh hi nahi sakte. Change ke baad target ka data nahi aata, logs band, ya flows gayab. Console har failing feed ka reason code deta hai, to guess se pehle code padho:</p>
<table class="cmp"><tr><th>Signal</th><th>Reason codes jo dikh sakte hain</th><th>Typical cause</th></tr>
<tr><td>SNMP poll</td><td>disabled, timeout, wrong-community, unknown-user, wrong-level, auth-failure, decrypt-error</td><td>Community typo, v3 credentials badle, access list, firewall</td></tr>
<tr><td>Syslog</td><td>target-down, disabled, collector-off, dest, port, proto</td><td>Galat logging host, collector band, port ya protocol mismatch</td></tr>
<tr><td>Flow exporter</td><td>target-down, disabled, dest, port, version, source</td><td>Galat destination ya port, aisa version jo collector decode nahi karta, export source Loopback0 nahi</td></tr>
</table>
<p>Targets page har target ka poll state dikhata hai. Logs page collector settings (running, port, protocol, rate limit, retention) aur naye messages dikhata hai. Flows page har exporter aur collector settings (address, UDP port, decoded versions, aur har router se kaun sa source address accept karta hai) list karta hai.</p>

<h3>Lab obs-ops-2: weekend change ke baad teen faults</h3>
<p>Kahani: weekend mein Kabir Shah ne Kochi, Lucknow aur Hyderabad mein change chalaya. Monday subah dashboard ek target ka no data dikhata hai, ek log source chup hai aur ek flow exporter gayab hai. Teen alag faults hain, plus ek galat console setting. Guess se fix karne ka mann mat karo. Ek ek signal ke saath kaam karo:</p>
<ol>
<li><b>Audit log padho</b> ki weekend mein kya badla. Yeh batata hai kahan dekhna hai. <i>Wire/policy par kya badalta hai?</i> Kuch nahi; yeh padhna hai.</li>
<li><b>SNMP.</b> Targets par no data wala target dhundo. Reason code wrong-community kehta hai; uska poll community agent ke <code>GF-RO</code> se alag hai. Sahi karo aur Apply. Wire par agla poll sahi community string leke jaata hai, to router jawab deta hai.</li>
<li><b>Syslog.</b> Logs par chup source dhundo. Reason code (dest, port ya collector-off) galat destination ya collector setting ki taraf ishara karta hai. Collector ko usi port aur protocol par sunna chahiye jis par routers bhejte hain (UDP 514). Jo side galat hai use fix karo, Apply, aur messages dikhne lagte hain.</li>
<li><b>Flows.</b> Flows par exporter reason source hai: router Loopback0 ke bajaye kisi aur address se export karta hai, to collector reject karta hai kyunki woh sirf har router ka loopback accept karta hai (R-HYD 10.255.0.1, R-KCH 10.255.0.2, R-LKO 10.255.0.3). Source wapas Loopback0 karo, destination 10.1.50.100 aur port 9995 check karo.</li>
<li><b>Console settings.</b> Collector running, listen ports, decoded versions (v9 aur IPFIX) aur log rate limit check karo. Console-side galtiyan device-side jaisi dikhti hain.</li>
<li><b>Saabit karo.</b> Collector tak Live tools ping aur capture chalao aur Overview mein teeno feeds ko wapas ok dikhao.</li>
</ol>
<pre class="out">Targets            R-KCH     poll v2c   <span class="hl">wrong-community</span> (console GF-R0, agent GF-RO)
Logs               R-LKO     <span class="hl">dest</span> (sends to 10.1.50.101, collector is 10.1.50.100)
Flows              R-HYD     exporter <span class="hl">source</span> (Gi0/0 instead of Loopback0)
Collector          flows UDP 9995   versions v9, ipfix   running</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Community fix SNMP polls ke andar ki string badalta hai. Syslog fix badalta hai ki UDP log packets kahan jaate hain ya kaun sa port sunta hai. Flow fix export packets ka source address badalta hai, jo collector check karta hai. Inme se koi user traffic nahi badalta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Jo symptom dikha sirf use fix karna aur baaki faults na dhundhna, kyunki ek change aksar kai faults banata hai. (2) Router galat ho to collector badalna, jisse jo sources chal rahe the woh bhi toot jaate hain. (3) User ke nazariye se kabhi verify na karna. (4) Reason code ignore karke guess karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Reason code fault tak ka sabse chhota raasta hai. Yeh bhi: NetFlow collector sirf expected source address se exports accept karta hai; galat export source "no flows" jaisa dikhta hai jabki exporter on hai.</p></div>

<div class="scn"><h4>Monday ka blind spot</h4><p>Godavari Foods mein weekend change ke baad Meena Iyer ko Kochi ka polling data nahi mila, Lucknow ke logs chup the aur Hyderabad ke exports missing the. Usne audit log kholkar dekha ki ek script ne teen cheezein badli thi, aur community, log destination aur export source ek ek karke fix kiye, har ek ke baad apply aur verify karke. OBSERVER tak last capture ne saabit kiya ki teeno feeds wapas aa gaye, aur usne change template mein post-change checklist jodi.</p><p><b>Seekh:</b> ek change, kai faults; ek ek fix karo aur har ek verify karo.</p></div>

<div class="iv"><p class="q">"Users application tak nahi pahunch pa rahe. End to end troubleshooting kaise karoge?"</p><p>Problem precisely define karo, recent changes dekho, path draw karo, ping, traceroute ya capture se aadha karo, hypothesis banao, sabse kam risky tool se test karo, ek cheez fix karo aur user ki side se verify karo. Batao ki har step par SNMP, flows, logs aur probes ka evidence padhte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Problem define, changes check, path draw, aadha karo, test, fix, verify.</li>
<li>Console ke reason codes seedha failing part ki taraf ishara karte hain.</li>
<li>Monitoring bhi toot sakti hai: community, destination, port, source, collector.</li>
<li>Ek baar mein ek cheez fix karo aur har fix verify karo.</li>
<li>Recovery hamesha user-level evidence se saabit karo.</li>
</ul></div>
`}};export{e as default};