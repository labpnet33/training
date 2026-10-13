var e={id:`silent-telemetry`,h:{en:`Silent telemetry: exporter, collector, reachability (lab vs-log-silence)`,hi:`Silent telemetry: exporter, collector, reachability (lab vs-log-silence)`},body:{en:`
<p>Picture a school notice board that suddenly has no notices from Class 5. Either the Class 5 teacher stopped writing them, or she is posting them to the wrong board, or the board itself is locked, or the corridor to the board is blocked. You would check each possibility in turn. Missing logs in Analytics are exactly this problem, and there are three suspects: the <b>exporter</b> on the branch (the teacher), the <b>collector</b> on Analytics (the board), and the <b>reachability</b> between them (the corridor).</p>

<h3>The incident in the lab</h3>
<p>Lab <b>vs-log-silence</b>: the security team reports that Delhi has disappeared from Analytics. Bengaluru is still visible. You must compare the Delhi (Branch1) log-exporter with the Analytics source list, repair the destination, and prove the branch is exporting again. The Analytics node is <code>ANA</code> at 198.51.100.30, collector port 1234 by default in the course model.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Three suspects">
<rect x="20" y="60" width="150" height="80" rx="8" fill="#bae6fd"/><text x="95" y="88" text-anchor="middle" class="svg-ink" font-size="13">1 Exporter</text><text x="95" y="108" text-anchor="middle" class="svg-muted" font-size="12">Branch1 log-exporter</text><text x="95" y="124" text-anchor="middle" class="svg-muted" font-size="12">destination set?</text>
<rect x="245" y="60" width="150" height="80" rx="8" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">2 Reachability</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">can the branch reach</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.30?</text>
<rect x="470" y="60" width="150" height="80" rx="8" fill="#ddd6fe"/><text x="545" y="88" text-anchor="middle" class="svg-ink" font-size="13">3 Collector</text><text x="545" y="108" text-anchor="middle" class="svg-muted" font-size="12">Analytics enabled,</text><text x="545" y="124" text-anchor="middle" class="svg-muted" font-size="12">port, sources</text>
<line x1="170" y1="100" x2="245" y2="100" stroke="#64748b" stroke-width="3"/><line x1="395" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="3"/>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="13">Compare both ends: branch view and Analytics view</text>
</svg><p class="cap">Check the exporter, then reachability, then the collector. The branch status text tells you which of the three is guilty.</p></div>

<h3>Step 1: read both ends</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org-services Acme log-exporter
Destination: <span class="hl">198.51.100.31</span>
Status: <span class="hl">Destination 198.51.100.31 is not an Analytics node</span>

admin@Analytics-cli&gt; show analytics sources
Branch        Status
Branch2       Exporting to ANA</pre>
<p>The branch says its destination is 198.51.100.31. The Analytics node is 198.51.100.30. A single digit differs. The Analytics source list does not mention Branch1 at all, because Branch1 is exporting to an address that is not Analytics. This is the classic typo, and note that nothing raised an alarm: the router is happily "exporting" to a destination that does not exist.</p>

<h3>Step 2: repair and prove</h3>
<pre class="code"><span class="c">! on Branch1: replace the destination with the real Analytics address</span>
admin@Branch1-cli&gt; configure
admin@Branch1-cli% set orgs org-services Acme log-exporter destination 198.51.100.30
admin@Branch1-cli% show | compare
admin@Branch1-cli% commit
admin@Branch1-cli% exit

admin@Branch1-cli&gt; show orgs org-services Acme log-exporter
Destination: 198.51.100.30
Status: <span class="hl">Exporting to ANA</span>

admin@Analytics-cli&gt; show analytics sources
Branch        Status
Branch1       Exporting to ANA
Branch2       Exporting to ANA</pre>
<p>The proof has two parts: the branch reports a healthy exporter, and the Analytics node independently lists the branch as a source. Always confirm at <b>both ends</b>; one end alone can be wrong.</p>

<h3>The status messages and what each one means</h3>
<table class="cmp"><tr><th>Status text on the branch</th><th>Suspect</th><th>Action</th></tr>
<tr><td>No log-exporter destination configured</td><td>Exporter</td><td>Set the destination: <code>set orgs org-services Acme log-exporter destination 198.51.100.30</code>.</td></tr>
<tr><td>Destination x is not an Analytics node</td><td>Exporter (wrong address)</td><td>Correct the address. Compare with the Director's analytics address (<code>show analytics</code> on DIR).</td></tr>
<tr><td>Log collector is disabled on ANA</td><td>Collector</td><td>On Analytics: <code>analytics log-collector enable true</code> and check <code>show analytics log-collector status</code>.</td></tr>
<tr><td>Analytics x is unreachable from this branch</td><td>Reachability</td><td>Go back to the layered method: ping, routes, tunnels.</td></tr>
<tr><td>Exporting to ANA</td><td>none</td><td>Healthy. Confirm the source list on Analytics.</td></tr></table>
<pre class="out">admin@Analytics-cli&gt; show analytics log-collector status
Log collector: <span class="hl">disabled</span>   Port: 1234
Sources: 0</pre>
<p>A collector that is disabled affects <b>every</b> branch at once; a wrong destination affects one. That difference of scope is your first triage clue: all sites silent means look at the collector, one site silent means look at that site's exporter or path.</p>

<div class="eg"><p><b>Worked example.</b> Three sites stop appearing at 02:00. Scope: all three, same moment, so not three typos. You check the collector: disabled after a maintenance script ran at 01:55. One command, <code>analytics log-collector enable true</code>, and <code>show analytics sources</code> lists three sources again. If instead only Kolkata were silent, you would read Kolkata's exporter status first.</p></div>

<h3>Why silent telemetry is dangerous</h3>
<p>Missing logs are not just a monitoring gap. Security investigations, compliance audits and SLA reports depend on them. A branch that is silent for two weeks leaves a hole in the evidence exactly when you might need it. There are also real-world details beyond the course model: log volumes can be large, so collectors are sized for retention; export can use a dedicated transport or VRF; and in some designs logs are forwarded on to a SIEM. The principle is the same: <b>pipeline = exporter + path + collector, and you verify all three</b>.</p>

<div class="warn"><p><b>Common mistakes.</b> Restarting Analytics for a one-site problem; checking only the branch or only Analytics; hard-coding an address by hand instead of copying it from the Director's analytics setting; forgetting to alarm on "number of sources lower than number of sites".</p></div>
<div class="exam"><p><b>Exam trap.</b> A branch with a wrong exporter destination still looks perfectly healthy on tunnels, BGP and traffic. Telemetry faults are invisible to the data-plane checks. Also, Analytics is out of the user data path: this fault never stops user traffic.</p></div>

<div class="scn"><h4>The audit that found nothing</h4><p>During a security audit a company searched Analytics for a suspicious event at a branch and found no records for three weeks. A replaced CPE had been staged by hand and its log destination typed one digit wrong. Tunnels, BGP and applications were perfect, so nobody noticed. The fix took one command; the hole in the evidence could not be repaired. Afterwards the team added the alert "active sources less than onboarded sites" and used the Director template to set the destination instead of typing it per branch.</p><p><b>Lesson:</b> telemetry needs its own health checks, and templates beat typing.</p></div>

<div class="iv"><p class="q">"A branch has vanished from Analytics. How do you troubleshoot?"</p><p>Scope (one site or all), then branch exporter status, reachability to the collector, and collector state; compare the branch view with the Analytics source list; repair with one change and verify at both ends. Mention that a disabled collector silences everything and a typo silences one site.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The log pipeline has three parts: exporter, path, collector.</li>
<li>One site silent points at its exporter or path; all sites silent point at the collector.</li>
<li>Read both ends: branch log-exporter status and Analytics source list.</li>
<li>Telemetry faults do not affect user traffic, so they stay hidden unless you alarm on absence.</li>
<li>Prefer template-pushed destinations over hand-typed addresses.</li>
</ul></div>
`,hi:`
<p>School ke notice board ki tasveer socho jisme achanak Class 5 ke notices aana band ho jayein. Ya to Class 5 ki teacher ne likhna band kar diya, ya wo galat board par post kar rahi hai, ya board par taala hai, ya board tak jane wala corridor block hai. Aap ek ek karke har possibility check karoge. Analytics mein missing logs bilkul yahi problem hai, aur teen suspects hain: branch par <b>exporter</b> (teacher), Analytics par <b>collector</b> (board), aur dono ke beech <b>reachability</b> (corridor).</p>

<h3>Lab mein incident</h3>
<p>Lab <b>vs-log-silence</b>: security team report karti hai ki Delhi Analytics se gayab ho gaya. Bengaluru abhi bhi dikh raha hai. Aapko Delhi (Branch1) ka log-exporter Analytics source list se compare karna hai, destination repair karna hai, aur prove karna hai ki branch dobara export kar raha hai. Analytics node <code>ANA</code> hai 198.51.100.30 par, course model mein collector port default 1234.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Three suspects">
<rect x="20" y="60" width="150" height="80" rx="8" fill="#bae6fd"/><text x="95" y="88" text-anchor="middle" class="svg-ink" font-size="13">1 Exporter</text><text x="95" y="108" text-anchor="middle" class="svg-muted" font-size="12">Branch1 log-exporter</text><text x="95" y="124" text-anchor="middle" class="svg-muted" font-size="12">destination set?</text>
<rect x="245" y="60" width="150" height="80" rx="8" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">2 Reachability</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">kya branch 198.51.100.30</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">tak pahunchta hai?</text>
<rect x="470" y="60" width="150" height="80" rx="8" fill="#ddd6fe"/><text x="545" y="88" text-anchor="middle" class="svg-ink" font-size="13">3 Collector</text><text x="545" y="108" text-anchor="middle" class="svg-muted" font-size="12">Analytics enabled,</text><text x="545" y="124" text-anchor="middle" class="svg-muted" font-size="12">port, sources</text>
<line x1="170" y1="100" x2="245" y2="100" stroke="#64748b" stroke-width="3"/><line x1="395" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="3"/>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="13">Dono ends compare karo: branch view aur Analytics view</text>
</svg><p class="cap">Pehle exporter, phir reachability, phir collector check karo. Branch ka status text batata hai teeno mein se kaun doshi hai.</p></div>

<h3>Step 1: dono ends padho</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org-services Acme log-exporter
Destination: <span class="hl">198.51.100.31</span>
Status: <span class="hl">Destination 198.51.100.31 is not an Analytics node</span>

admin@Analytics-cli&gt; show analytics sources
Branch        Status
Branch2       Exporting to ANA</pre>
<p>Branch kehta hai uska destination 198.51.100.31 hai. Analytics node 198.51.100.30 hai. Sirf ek digit ka farak. Analytics source list mein Branch1 ka zikr hi nahi, kyunki Branch1 aise address par export kar raha hai jo Analytics hai hi nahi. Ye classic typo hai, aur dhyan do ki kisi ne alarm nahi diya: router khushi se aise destination par "export" kar raha hai jo exist hi nahi karta.</p>

<h3>Step 2: repair aur prove</h3>
<pre class="code"><span class="c">! Branch1 par: destination ko asli Analytics address se replace karo</span>
admin@Branch1-cli&gt; configure
admin@Branch1-cli% set orgs org-services Acme log-exporter destination 198.51.100.30
admin@Branch1-cli% show | compare
admin@Branch1-cli% commit
admin@Branch1-cli% exit

admin@Branch1-cli&gt; show orgs org-services Acme log-exporter
Destination: 198.51.100.30
Status: <span class="hl">Exporting to ANA</span>

admin@Analytics-cli&gt; show analytics sources
Branch        Status
Branch1       Exporting to ANA
Branch2       Exporting to ANA</pre>
<p>Proof ke do hisse hain: branch healthy exporter report karta hai, aur Analytics node independently branch ko source ki tarah list karta hai. Hamesha <b>dono ends</b> par confirm karo; akela ek end galat ho sakta hai.</p>

<h3>Status messages aur unka matlab</h3>
<table class="cmp"><tr><th>Branch par status text</th><th>Suspect</th><th>Action</th></tr>
<tr><td>No log-exporter destination configured</td><td>Exporter</td><td>Destination set karo: <code>set orgs org-services Acme log-exporter destination 198.51.100.30</code>.</td></tr>
<tr><td>Destination x is not an Analytics node</td><td>Exporter (galat address)</td><td>Address sahi karo. Director ke analytics address se compare karo (DIR par <code>show analytics</code>).</td></tr>
<tr><td>Log collector is disabled on ANA</td><td>Collector</td><td>Analytics par: <code>analytics log-collector enable true</code> aur <code>show analytics log-collector status</code> check karo.</td></tr>
<tr><td>Analytics x is unreachable from this branch</td><td>Reachability</td><td>Layered method par wapas jao: ping, routes, tunnels.</td></tr>
<tr><td>Exporting to ANA</td><td>koi nahi</td><td>Healthy. Analytics par source list confirm karo.</td></tr></table>
<pre class="out">admin@Analytics-cli&gt; show analytics log-collector status
Log collector: <span class="hl">disabled</span>   Port: 1234
Sources: 0</pre>
<p>Disabled collector <b>har</b> branch ko ek saath affect karta hai; galat destination sirf ek ko. Scope ka ye farak aapka pehla triage clue hai: saari sites silent hon to collector dekho, ek site silent ho to us site ka exporter ya path dekho.</p>

<div class="eg"><p><b>Worked example.</b> Teen sites 02:00 par dikhna band ho gayi. Scope: teeno, same moment, to teen typos nahi. Collector check karte ho: 01:55 par chali maintenance script ke baad disabled. Ek command, <code>analytics log-collector enable true</code>, aur <code>show analytics sources</code> mein dobara teen sources. Sirf Kolkata silent hoti to pehle Kolkata ka exporter status padhte.</p></div>

<h3>Silent telemetry khatarnak kyun hai</h3>
<p>Missing logs sirf monitoring gap nahi hain. Security investigations, compliance audits aur SLA reports unpar depend karte hain. Do hafte silent rehne wali branch evidence mein ek hole chhod deti hai wahi waqt jab aapko uski zaroorat ho sakti hai. Course model ke bahar real-world details bhi hain: log volumes bade ho sakte hain isliye collectors retention ke hisaab se size hote hain; export dedicated transport ya VRF use kar sakta hai; kuch designs mein logs aage SIEM ko forward hote hain. Principle wahi: <b>pipeline = exporter + path + collector, aur teeno verify karte hain</b>.</p>

<div class="warn"><p><b>Common mistakes.</b> Ek-site ki problem ke liye Analytics restart karna; sirf branch ya sirf Analytics check karna; Director ki analytics setting se copy karne ke bajay address haath se hard-code karna; "active sources onboarded sites se kam" par alarm lagana bhool jana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Galat exporter destination wali branch tunnels, BGP aur traffic par bilkul healthy dikhti hai. Telemetry faults data-plane checks mein invisible hote hain. Ye bhi: Analytics user data path ke bahar hai: ye fault user traffic kabhi nahi rokta.</p></div>

<div class="scn"><h4>Wo audit jisme kuch nahi mila</h4><p>Security audit ke dauran ek company ne Analytics mein branch ke suspicious event ko search kiya aur teen hafte ke records nahi mile. Replace hui CPE haath se stage hui thi aur uska log destination ek digit galat type hua tha. Tunnels, BGP aur applications perfect the, isliye kisi ne notice nahi kiya. Fix ek command ka tha; evidence ka hole repair nahi ho sakta tha. Baad mein team ne alert lagaya "active sources onboarded sites se kam" aur har branch par type karne ke bajay Director template se destination set kiya.</p><p><b>Lesson:</b> telemetry ko apne health checks chahiye, aur templates typing se behtar hain.</p></div>

<div class="iv"><p class="q">"Branch Analytics se gayab ho gayi hai. Kaise troubleshoot karoge?"</p><p>Scope (ek site ya sab), phir branch exporter status, collector tak reachability aur collector state; branch view ko Analytics source list se compare karo; ek change se repair karo aur dono ends par verify karo. Batao ki disabled collector sabko silent karta hai aur typo ek site ko.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Log pipeline ke teen hisse: exporter, path, collector.</li>
<li>Ek site silent matlab uska exporter ya path; saari sites silent matlab collector.</li>
<li>Dono ends padho: branch log-exporter status aur Analytics source list.</li>
<li>Telemetry faults user traffic affect nahi karte, isliye absence par alarm na ho to chhupe rehte hain.</li>
<li>Haath se typed addresses ke bajay template-pushed destinations prefer karo.</li>
</ul></div>
`}};export{e as default};