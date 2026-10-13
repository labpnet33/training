var e={id:`strata-logging-and-insights`,h:{en:`Strata Logging Service, Activity Insights and Log Viewer`,hi:`Strata Logging Service, Activity Insights aur Log Viewer`},body:{en:`
<p>A city has one central records office where every police station, fire station and hospital sends its reports. When you need the story of a night, you do not visit each building; you go to the records office and search. For Prisma Access the records office is the <b>Strata Logging Service</b>. All Prisma Access logs are stored there, whichever tool manages the tenant. Strata Cloud Manager (SCM) gives you two readers on top of it: <b>Activity Insights</b> for the big picture and <b>Log Viewer</b> for individual records.</p>

<h3>The log pipeline</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Logging pipeline">
<rect x="15" y="20" width="130" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">Mobile users</text>
<rect x="15" y="80" width="130" height="44" rx="8" fill="#bae6fd"/><text x="80" y="107" text-anchor="middle" class="svg-ink" font-size="13">Remote networks</text>
<rect x="15" y="140" width="130" height="44" rx="8" fill="#bae6fd"/><text x="80" y="167" text-anchor="middle" class="svg-ink" font-size="13">Service conn.</text>
<rect x="210" y="70" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="295" y="100" text-anchor="middle" class="svg-ink" font-size="13">Strata Logging</text><text x="295" y="118" text-anchor="middle" class="svg-ink" font-size="13">Service</text>
<rect x="450" y="30" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="13">Activity Insights</text>
<rect x="450" y="130" width="170" height="50" rx="8" fill="#fde68a"/><text x="535" y="160" text-anchor="middle" class="svg-ink" font-size="13">Log Viewer</text>
<line x1="145" y1="42" x2="210" y2="95" stroke="#64748b" stroke-width="2"/><line x1="145" y1="102" x2="210" y2="105" stroke="#64748b" stroke-width="2"/><line x1="145" y1="162" x2="210" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="90" x2="450" y2="55" stroke="#64748b" stroke-width="2"/><line x1="380" y1="120" x2="450" y2="155" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three sources, one store, two readers. If logs stop arriving, both readers go quiet.</p></div>

<p>In the Service Setup screen you set the Strata Logging Service theater (the region where logs are stored) and log forwarding. Rules decide whether a log entry is written, through the log setting and the log forwarding profile (policy module). The service itself is concept-only in the simulator, but the habits are real.</p>

<h3>Activity Insights</h3>
<p>Activity Insights gives you trend views. The ones named in the documentation:</p>
<dl class="terms">
<dt>Applications</dt><dd>Which applications users run, how much bandwidth they use, and risk. Useful for "what is eating the internet link?".</dd>
<dt>Users</dt><dd>Mobile users, their locations and connection state. Useful for "who is connected and from where?".</dd>
<dt>Branch Sites</dt><dd>Remote network health, tunnel status and bandwidth. Useful for "is the branch healthy and is it saturated?".</dd>
</dl>
<p>There are also Insights views for <b>Data Centers</b> (service connection status, bandwidth, tunnel data), <b>Network Services</b> (GlobalProtect authentication success and failure, DNS proxy), <b>Prisma Access Locations</b>, and <b>System Settings, Subscription Usage</b> for licence consumption.</p>

<h3>Log Viewer</h3>
<p>Log Viewer is under Activity. It shows individual records. The documented groups:</p>
<table class="cmp">
<tr><th>Group</th><th>Types</th><th>Use it for</th></tr>
<tr><td>Network logs</td><td>Traffic, Threat, URL, File, HIP Match</td><td>Policy matches, blocked sites, posture decisions</td></tr>
<tr><td>Common logs</td><td>System, Configuration</td><td>Service events, who changed what and when</td></tr>
<tr><td>Endpoint logs</td><td>Endpoint</td><td>Client-side events from the GlobalProtect app</td></tr>
</table>

<h3>Which tool, which question</h3>
<table class="cmp">
<tr><th>Question</th><th>Start with</th></tr>
<tr><td>How many users are connected, from where?</td><td>Activity Insights, Users</td></tr>
<tr><td>Is the branch tunnel healthy and busy?</td><td>Activity Insights, Branch Sites</td></tr>
<tr><td>Is the HQ service connection healthy?</td><td>Insights, Data Centers</td></tr>
<tr><td>Why can nobody sign in?</td><td>Insights, Network Services (authentication failures)</td></tr>
<tr><td>Which rule blocked this user?</td><td>Log Viewer, Traffic log</td></tr>
<tr><td>Who changed the rulebase at 09:40?</td><td>Log Viewer, Configuration log</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> At 14:00 several users report the app at 10.10.0.50 is slow. Activity Insights, Applications shows the HQ app traffic normal. Insights, Data Centers shows the HQ service connection (peer HQ-FW 192.0.2.10) near its bandwidth limit, with a spike beginning at 13:40. The Log Viewer Traffic log filtered on that time shows a backup application from the branch BR-FW network (198.51.100.10 side, LAN 10.20.0.0/24) using most of it. The fix is a schedule change for the backup, not a policy change. Three tools, one story.</p></div>
<pre class="out">Log Viewer, Traffic (teaching view; filter: 13:40 to 14:00)
Time      Source        Destination   App        Rule              Bytes
13:42:11  10.20.0.100   10.10.0.50    ssl        allow-branch-hq   <span class="hl">4.8 GB</span>
13:51:30  10.200.0.7    10.10.0.50    ssl        allow-private-hq  12 MB</pre>

<h3>Reading logs responsibly</h3>
<ol>
<li>Fix the time range and time zone first.</li>
<li>Filter by one attribute at a time: user, source IP, rule, application.</li>
<li>Compare a good example with a bad example.</li>
<li>Keep evidence (screenshot with filters, or an export) in the ticket.</li>
<li>Logs may arrive with a delay; wait a short time before concluding there is none.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Searching with a time range that misses the event; reading a dashboard average and missing a short spike; forgetting that a rule without a log forwarding profile produces no searchable log; expecting Panorama to hold the logs when Prisma Access sends them to the Strata Logging Service.</p></div>
<div class="exam"><p><b>Exam trap.</b> All Prisma Access logs go to the Strata Logging Service, whichever tool manages the tenant. Know which SCM view answers which question: authentication failures are under Insights, Network Services; individual policy decisions are in Log Viewer.</p></div>

<div class="scn"><h4>Nobody could sign in</h4><p>Monday morning, many users could not connect. Insights, Network Services showed authentication failures rising from 08:30. The Log Viewer, Endpoint and System logs pointed to the authentication service; the enterprise identity provider had expired a certificate. After renewal, the failures dropped to normal in the next interval.</p><p><b>Lesson:</b> start with the aggregate view, then drill into the individual log type.</p></div>

<div class="iv"><p class="q">"Where do Prisma Access logs go and how do you search them?"</p><p>To the Strata Logging Service, whichever console manages the tenant. In SCM use Activity Insights for trends and Log Viewer for individual Traffic, Threat, URL, File, HIP Match, System, Configuration and Endpoint logs. Fix time range and zone first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The Strata Logging Service is the central store for all Prisma Access logs.</li>
<li>Activity Insights: Applications, Users, Branch Sites. Insights adds Data Centers, Network Services, Locations and Subscription Usage.</li>
<li>Log Viewer holds Traffic, Threat, URL, File, HIP Match, System, Configuration and Endpoint logs.</li>
<li>Pick the tool by the question: aggregate first, then individual logs.</li>
<li>No log forwarding on a rule means no searchable record.</li>
</ul></div>
`,hi:`
<p>Ek shehar mein ek central records office hota hai jahan har police station, fire station aur hospital apni reports bhejta hai. Ek raat ki kahani chahiye to aap har building nahi jaate; records office jaakar search karte ho. Prisma Access ka records office hai <b>Strata Logging Service</b>. Prisma Access ke saare logs wahin store hote hain, chahe tenant kisi bhi tool se manage ho. Strata Cloud Manager (SCM) uske upar do readers deta hai: bade picture ke liye <b>Activity Insights</b> aur individual records ke liye <b>Log Viewer</b>.</p>

<h3>Log pipeline</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Logging pipeline">
<rect x="15" y="20" width="130" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">Mobile users</text>
<rect x="15" y="80" width="130" height="44" rx="8" fill="#bae6fd"/><text x="80" y="107" text-anchor="middle" class="svg-ink" font-size="13">Remote networks</text>
<rect x="15" y="140" width="130" height="44" rx="8" fill="#bae6fd"/><text x="80" y="167" text-anchor="middle" class="svg-ink" font-size="13">Service conn.</text>
<rect x="210" y="70" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="295" y="100" text-anchor="middle" class="svg-ink" font-size="13">Strata Logging</text><text x="295" y="118" text-anchor="middle" class="svg-ink" font-size="13">Service</text>
<rect x="450" y="30" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="13">Activity Insights</text>
<rect x="450" y="130" width="170" height="50" rx="8" fill="#fde68a"/><text x="535" y="160" text-anchor="middle" class="svg-ink" font-size="13">Log Viewer</text>
<line x1="145" y1="42" x2="210" y2="95" stroke="#64748b" stroke-width="2"/><line x1="145" y1="102" x2="210" y2="105" stroke="#64748b" stroke-width="2"/><line x1="145" y1="162" x2="210" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="90" x2="450" y2="55" stroke="#64748b" stroke-width="2"/><line x1="380" y1="120" x2="450" y2="155" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Teen sources, ek store, do readers. Logs aana band hon to dono readers chup ho jaate hain.</p></div>

<p>Service Setup screen mein aap Strata Logging Service theater (wo region jahan logs store hote hain) aur log forwarding set karte ho. Rules decide karte hain ki log entry likhi jaaye ya nahi, log setting aur log forwarding profile ke through (policy module). Service khud simulator mein concept-only hai, lekin aadatein real hain.</p>

<h3>Activity Insights</h3>
<p>Activity Insights trend views deta hai. Documentation mein jinke naam hain:</p>
<dl class="terms">
<dt>Applications</dt><dd>Users kaunsi applications chalate hain, kitna bandwidth lete hain, aur risk. "Internet link kaun kha raha hai?" ke liye useful.</dd>
<dt>Users</dt><dd>Mobile users, unki locations aur connection state. "Kaun kahan se connected hai?" ke liye useful.</dd>
<dt>Branch Sites</dt><dd>Remote network health, tunnel status aur bandwidth. "Branch healthy hai aur saturated to nahi?" ke liye useful.</dd>
</dl>
<p><b>Data Centers</b> (service connection status, bandwidth, tunnel data), <b>Network Services</b> (GlobalProtect authentication success aur failure, DNS proxy), <b>Prisma Access Locations</b>, aur licence consumption ke liye <b>System Settings, Subscription Usage</b> ke Insights views bhi hain.</p>

<h3>Log Viewer</h3>
<p>Log Viewer Activity ke neeche hai. Ye individual records dikhata hai. Documented groups:</p>
<table class="cmp">
<tr><th>Group</th><th>Types</th><th>Kis liye</th></tr>
<tr><td>Network logs</td><td>Traffic, Threat, URL, File, HIP Match</td><td>Policy matches, blocked sites, posture decisions</td></tr>
<tr><td>Common logs</td><td>System, Configuration</td><td>Service events, kisne kab kya badla</td></tr>
<tr><td>Endpoint logs</td><td>Endpoint</td><td>GlobalProtect app ke client-side events</td></tr>
</table>

<h3>Kaunsa tool, kaunsa sawal</h3>
<table class="cmp">
<tr><th>Sawal</th><th>Shuru karo</th></tr>
<tr><td>Kitne users kahan se connected hain?</td><td>Activity Insights, Users</td></tr>
<tr><td>Branch tunnel healthy aur busy hai?</td><td>Activity Insights, Branch Sites</td></tr>
<tr><td>HQ service connection healthy hai?</td><td>Insights, Data Centers</td></tr>
<tr><td>Koi sign in kyun nahi kar paa raha?</td><td>Insights, Network Services (authentication failures)</td></tr>
<tr><td>Is user ko kaunse rule ne block kiya?</td><td>Log Viewer, Traffic log</td></tr>
<tr><td>09:40 par rulebase kisne badla?</td><td>Log Viewer, Configuration log</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> 14:00 par kai users kehte hain 10.10.0.50 ka app slow hai. Activity Insights, Applications HQ app traffic normal dikhata hai. Insights, Data Centers HQ service connection (peer HQ-FW 192.0.2.10) ko bandwidth limit ke paas dikhata hai, 13:40 se spike ke saath. Us time par filter kiya Log Viewer Traffic log branch BR-FW network (198.51.100.10 side, LAN 10.20.0.0/24) ki ek backup application ko zyada tar use karte dikhata hai. Fix backup ka schedule change hai, policy change nahi. Teen tools, ek kahani.</p></div>
<pre class="out">Log Viewer, Traffic (teaching view; filter: 13:40 to 14:00)
Time      Source        Destination   App        Rule              Bytes
13:42:11  10.20.0.100   10.10.0.50    ssl        allow-branch-hq   <span class="hl">4.8 GB</span>
13:51:30  10.200.0.7    10.10.0.50    ssl        allow-private-hq  12 MB</pre>

<h3>Logs zimmedari se padhna</h3>
<ol>
<li>Pehle time range aur time zone fix karo.</li>
<li>Ek ek attribute se filter karo: user, source IP, rule, application.</li>
<li>Achhe example ko bure example se compare karo.</li>
<li>Evidence (filters ke saath screenshot, ya export) ticket mein rakho.</li>
<li>Logs delay se aa sakte hain; "log nahi hai" kehne se pehle thoda wait karo.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Aisa time range search karna jo event miss kare; dashboard average padhna aur chhota spike miss karna; ye bhoolna ki log forwarding profile ke bina rule searchable log nahi deta; Panorama se logs rakhne ki ummeed karna jabki Prisma Access unhe Strata Logging Service ko bhejta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Prisma Access ke saare logs Strata Logging Service mein jaate hain, chahe tenant kisi bhi tool se manage ho. Jaano ki kaunsa SCM view kaunsa sawal answer karta hai: authentication failures Insights, Network Services mein; individual policy decisions Log Viewer mein.</p></div>

<div class="scn"><h4>Koi sign in nahi kar paa raha tha</h4><p>Somvaar subah kai users connect nahi kar paa rahe the. Insights, Network Services ne 08:30 se authentication failures badhte dikhaye. Log Viewer ke Endpoint aur System logs authentication service ki taraf ishara kar rahe the; enterprise identity provider ka certificate expire ho gaya tha. Renewal ke baad agle interval mein failures normal par aa gaye.</p><p><b>Lesson:</b> aggregate view se shuru karo, phir individual log type mein drill karo.</p></div>

<div class="iv"><p class="q">"Prisma Access logs kahan jaate hain aur unhe kaise search karte ho?"</p><p>Strata Logging Service mein, chahe kaunsa bhi console manage kare. SCM mein trends ke liye Activity Insights aur individual Traffic, Threat, URL, File, HIP Match, System, Configuration aur Endpoint logs ke liye Log Viewer. Pehle time range aur zone fix karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Strata Logging Service Prisma Access ke saare logs ka central store hai.</li>
<li>Activity Insights: Applications, Users, Branch Sites. Insights mein Data Centers, Network Services, Locations aur Subscription Usage bhi hain.</li>
<li>Log Viewer mein Traffic, Threat, URL, File, HIP Match, System, Configuration aur Endpoint logs hain.</li>
<li>Sawal ke hisaab se tool chuno: pehle aggregate, phir individual logs.</li>
<li>Rule par log forwarding nahi to searchable record nahi.</li>
</ul></div>
`}};export{e as default};