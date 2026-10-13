var e={id:`logging-monitoring`,h:{en:`Logs, Log Collectors and monitoring managed devices`,hi:`Logs, Log Collectors aur managed devices ki monitoring`},body:{en:`
<p>Central management also means central visibility. Panorama is where you search logs from all firewalls, check device health and report on the estate.</p>
<div class="note"><p><b>Note.</b> Reference material (not run in the simulator).</p></div>
<h3>Where logs live</h3>
<ul>
<li>In <b>Panorama mode</b> the same system manages and stores logs (the local Log Collector).</li>
<li>In <b>Management Only mode</b> logs go to <b>dedicated Log Collectors</b>, which Panorama manages as managed collectors.</li>
<li>Several collectors form a <b>Collector Group</b> with shared retention settings and optional log redundancy. Firewalls are assigned to a collector group, and spread logs across its members.</li>
</ul>
<p>Logs from Panorama and Log Collectors are searchable from the Panorama Monitor tab, so one query spans every firewall.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Firewalls forward logs to Log Collectors; Panorama queries them for search and reports."><rect x="20" y="40" width="132" height="80" rx="10" fill="#bae6fd"/><text x="86" y="76" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text><text x="86" y="98" text-anchor="middle" class="svg-muted" font-size="12">log forwarding</text><line x1="152" y1="80" x2="176" y2="80" stroke="#64748b" stroke-width="2"/><rect x="176" y="40" width="132" height="80" rx="10" fill="#bbf7d0"/><text x="242" y="76" text-anchor="middle" class="svg-ink" font-size="14">Log Collector</text><text x="242" y="98" text-anchor="middle" class="svg-muted" font-size="12">stores logs</text><line x1="308" y1="80" x2="332" y2="80" stroke="#64748b" stroke-width="2"/><rect x="332" y="40" width="132" height="80" rx="10" fill="#ddd6fe"/><text x="398" y="76" text-anchor="middle" class="svg-ink" font-size="14">Collector group</text><text x="398" y="98" text-anchor="middle" class="svg-muted" font-size="12">retention</text><line x1="464" y1="80" x2="488" y2="80" stroke="#64748b" stroke-width="2"/><rect x="488" y="40" width="132" height="80" rx="10" fill="#fde68a"/><text x="554" y="76" text-anchor="middle" class="svg-ink" font-size="14">Panorama</text><text x="554" y="98" text-anchor="middle" class="svg-muted" font-size="12">search, ACC, reports</text></svg><p class="cap">Firewalls forward logs to Log Collectors; Panorama queries them for search and reports.</p></div>
<h3>Log forwarding from firewalls</h3>
<p>A firewall sends logs to Panorama only if a <b>log forwarding profile</b> is attached to the rules (and system, config and other log types are forwarded through the log settings). Put the profile and its server settings in the template and device group so every firewall behaves the same. A security rule without log forwarding is a rule that is invisible in Panorama, a frequent audit gap.</p>
<p>The firewall stores logs locally too, and buffers them if the connection to the collector breaks, then sends them when it returns. Local disk is small, so do not rely on it as the archive.</p>
<h3>Monitoring the managed estate</h3>
<ul>
<li><b>Managed Devices</b>: connection status, sync state, software and content versions, HA state and licence status in one table.</li>
<li><b>Dashboard and ACC</b>: the Application Command Center summarises traffic, threats and users across the estate.</li>
<li><b>Scheduled reports</b>: send a weekly summary to security and management audiences.</li>
<li><b>System logs</b>: show connection drops, push results and administrator logins.</li>
</ul>
<p>Useful CLI checks on Panorama and on a firewall:</p>
<pre class="code">show devices connected
show devices all
show jobs all
show panorama-status
show system info</pre>
<p><code>show devices connected</code> lists firewalls with an active management connection; <code>show jobs all</code> shows commit and push jobs and their results; <code>show panorama-status</code> on the firewall shows its view of the Panorama connection.</p>
<h3>Software and content updates</h3>
<p>Panorama can distribute PAN-OS software, content (App-ID and threat) and licence updates to managed firewalls. This is part of orchestration: stage the update on Panorama, schedule installs in waves, and verify. Keep Panorama itself at a PAN-OS version equal to or newer than the managed firewalls, a rule that matters when planning upgrades.</p>
<h3>Log security and retention</h3>
<p>Logs contain user names, addresses and URLs, so they are sensitive. Restrict who can read them with access domains and role profiles, forward config and system logs to the central SIEM, set retention to match your legal and operational needs, and protect the collector network. Keep audit logs long enough for investigations.</p>
<h3>Capacity planning</h3>
<p>Log volume depends on rules that log, traffic and log types. Estimate average log rate per firewall, multiply, and compare to collector capacity. Check disk quotas per log type, and watch for the point where oldest logs start to be deleted.</p>
<div class="eg"><p><b>Worked example.</b> A 40-store retailer sends traffic, threat and URL logs to a two-member collector group with redundancy enabled. The dashboard shows two stores disconnected. Managed Devices confirms they are not connected, the System log shows the connection dropped after a router change, and the engineer fixes the TCP 3978 rule on that router.</p></div>
<div class="warn"><p><b>Common mistake.</b> Forgetting the log forwarding profile on new rules. The rule works but nothing shows in Panorama, and the investigator finds an empty search when it matters most.</p></div>
<div class="exam"><p><b>Exam trap.</b> Log Collectors store logs and are grouped in collector groups. Panorama in Management Only mode does not store firewall logs locally. Keep Panorama at the same or newer PAN-OS than the firewalls it manages.</p></div>
<div class="scn"><h4>The incident with no logs</h4><p>After a suspected data leak the investigator searched Panorama for a branch and found nothing. The branch used a newer rule without log forwarding, and the local disk had already rolled over. The team added a log forwarding profile to the baseline post-rule, made it a standard in the rule review, and tested searches monthly.</p><p><b>Lesson:</b> monitoring is only as good as what you forward.</p></div>
<div class="iv"><p class="q">"How do firewall logs reach Panorama and how do you search them?"</p><p>Firewalls forward logs through log forwarding profiles to Panorama or to dedicated Log Collectors in a collector group. Panorama's Monitor tab queries all of them for searches, reports and the ACC. Mention buffering, retention and the access control on logs.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Log Collectors and collector groups store and retain firewall logs.</li><li>Log forwarding profiles on rules decide what Panorama sees.</li><li>Managed Devices shows connection, sync, versions and HA state.</li><li>show devices connected and show jobs all help in operations.</li><li>Keep Panorama at the same or newer PAN-OS than managed firewalls.</li></ul></div>
`,hi:`
<p>Central management ka matlab central visibility bhi hai. Panorama woh jagah hai jahan aap saare firewalls ke logs search karte ho, device health check karte ho aur estate par report banate ho.</p>
<div class="note"><p><b>Note.</b> Reference material (simulator mein nahi chalta).</p></div>
<h3>Logs kahan rehte hain</h3>
<ul>
<li><b>Panorama mode</b> mein wahi system manage bhi karta hai aur logs store bhi (local Log Collector).</li>
<li><b>Management Only mode</b> mein logs <b>dedicated Log Collectors</b> ko jaate hain, jinhe Panorama managed collectors ki tarah manage karta hai.</li>
<li>Kai collectors milkar <b>Collector Group</b> banate hain jisme shared retention settings aur optional log redundancy hoti hai. Firewalls collector group ko assign hote hain aur logs uske members mein baant dete hain.</li>
</ul>
<p>Panorama aur Log Collectors ke logs Panorama ke Monitor tab se searchable hain, isliye ek query har firewall ko cover karti hai.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Firewalls logs Log Collectors ko forward karte hain; Panorama search aur reports ke liye unhe query karta hai."><rect x="20" y="40" width="132" height="80" rx="10" fill="#bae6fd"/><text x="86" y="76" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text><text x="86" y="98" text-anchor="middle" class="svg-muted" font-size="12">log forwarding</text><line x1="152" y1="80" x2="176" y2="80" stroke="#64748b" stroke-width="2"/><rect x="176" y="40" width="132" height="80" rx="10" fill="#bbf7d0"/><text x="242" y="76" text-anchor="middle" class="svg-ink" font-size="14">Log Collector</text><text x="242" y="98" text-anchor="middle" class="svg-muted" font-size="12">logs store karta hai</text><line x1="308" y1="80" x2="332" y2="80" stroke="#64748b" stroke-width="2"/><rect x="332" y="40" width="132" height="80" rx="10" fill="#ddd6fe"/><text x="398" y="76" text-anchor="middle" class="svg-ink" font-size="14">Collector group</text><text x="398" y="98" text-anchor="middle" class="svg-muted" font-size="12">retention</text><line x1="464" y1="80" x2="488" y2="80" stroke="#64748b" stroke-width="2"/><rect x="488" y="40" width="132" height="80" rx="10" fill="#fde68a"/><text x="554" y="76" text-anchor="middle" class="svg-ink" font-size="14">Panorama</text><text x="554" y="98" text-anchor="middle" class="svg-muted" font-size="12">search, ACC, reports</text></svg><p class="cap">Firewalls logs Log Collectors ko forward karte hain; Panorama search aur reports ke liye unhe query karta hai.</p></div>
<h3>Firewalls se log forwarding</h3>
<p>Firewall Panorama ko logs tabhi bhejta hai jab rules par <b>log forwarding profile</b> attach ho (aur system, config aur doosre log types log settings se forward hote hain). Profile aur uski server settings template aur device group mein rakho taaki har firewall same behave kare. Bina log forwarding wali security rule Panorama mein invisible hai, jo audit ki aam gap hai.</p>
<p>Firewall logs local mein bhi store karta hai, aur collector ka connection tootne par buffer karta hai, phir wapas aane par bhejta hai. Local disk chhoti hoti hai, isliye use archive na maano.</p>
<h3>Managed estate ki monitoring</h3>
<ul>
<li><b>Managed Devices</b>: connection status, sync state, software aur content versions, HA state aur licence status ek table mein.</li>
<li><b>Dashboard aur ACC</b>: Application Command Center poore estate ka traffic, threats aur users summarise karta hai.</li>
<li><b>Scheduled reports</b>: security aur management audiences ko weekly summary bhejo.</li>
<li><b>System logs</b>: connection drops, push results aur administrator logins dikhate hain.</li>
</ul>
<p>Panorama aur firewall par useful CLI checks:</p>
<pre class="code">show devices connected
show devices all
show jobs all
show panorama-status
show system info</pre>
<p><code>show devices connected</code> un firewalls ko list karta hai jinka active management connection hai; <code>show jobs all</code> commit aur push jobs aur unke results dikhata hai; firewall par <code>show panorama-status</code> Panorama connection ka firewall ka view dikhata hai.</p>
<h3>Software aur content updates</h3>
<p>Panorama managed firewalls ko PAN-OS software, content (App-ID aur threat) aur licence updates distribute kar sakta hai. Yeh orchestration ka hissa hai: Panorama par update stage karo, installs waves mein schedule karo, aur verify karo. Panorama ko khud managed firewalls ke barabar ya naye PAN-OS version par rakho, jo upgrades plan karte waqt matter karta hai.</p>
<h3>Log security aur retention</h3>
<p>Logs mein user names, addresses aur URLs hote hain, isliye sensitive hain. Access domains aur role profiles se limit karo kaun padh sakta hai, config aur system logs central SIEM ko forward karo, retention legal aur operational needs ke hisaab se set karo, aur collector network protect karo. Audit logs itne lambe rakho ki investigations ho sakein.</p>
<h3>Capacity planning</h3>
<p>Log volume logging wali rules, traffic aur log types par depend karta hai. Har firewall ka average log rate estimate karo, multiply karo, aur collector capacity se compare karo. Har log type ke disk quotas dekho, aur us point par nazar rakho jahan purane logs delete hone lagte hain.</p>
<div class="eg"><p><b>Worked example.</b> 40-store retailer ek do-member collector group ko redundancy ke saath traffic, threat aur URL logs bhejta hai. Dashboard do stores disconnected dikhata hai. Managed Devices confirm karta hai ki woh connected nahi hain, System log dikhata hai ki router change ke baad connection gira, aur engineer us router par TCP 3978 rule theek karta hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Nayi rules par log forwarding profile bhoolna. Rule kaam karti hai par Panorama mein kuch nahi dikhta, aur investigator ko jab sabse zyada zaroorat ho tab khaali search milti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Log Collectors logs store karte hain aur collector groups mein group hote hain. Management Only mode mein Panorama firewall logs local store nahi karta. Panorama ko managed firewalls ke barabar ya naye PAN-OS par rakho.</p></div>
<div class="scn"><h4>Bina logs wala incident</h4><p>Suspected data leak ke baad investigator ne Panorama mein branch ke liye search ki aur kuch nahi mila. Branch ek nayi rule use karta tha jisme log forwarding nahi thi, aur local disk pehle hi roll over ho chuki thi. Team ne baseline post-rule mein log forwarding profile jodi, rule review ka standard banaya, aur har mahine searches test kiye.</p><p><b>Lesson:</b> monitoring utni hi achhi hai jitna aap forward karte ho.</p></div>
<div class="iv"><p class="q">"Firewall logs Panorama tak kaise pahunchte hain aur unhe kaise search karte ho?"</p><p>Firewalls log forwarding profiles se logs Panorama ya collector group ke dedicated Log Collectors ko forward karte hain. Panorama ka Monitor tab searches, reports aur ACC ke liye sabko query karta hai. Buffering, retention aur logs par access control ka zikr karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Log Collectors aur collector groups firewall logs store aur retain karte hain.</li><li>Rules par log forwarding profiles decide karte hain Panorama kya dekhta hai.</li><li>Managed Devices connection, sync, versions aur HA state dikhata hai.</li><li>show devices connected aur show jobs all operations mein madad karte hain.</li><li>Panorama ko managed firewalls ke barabar ya naye PAN-OS par rakho.</li></ul></div>
`}};export{e as default};