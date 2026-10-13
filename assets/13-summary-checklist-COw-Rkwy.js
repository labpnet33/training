var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a camera in a shop and ended with a designed logging estate. Before an exam, an interview or a real change window, run through the picture once more. A pilot reads a checklist even after ten thousand flights, not because she forgot how to fly, but because the cost of skipping one item is high. Logging has the same property: failures are quiet, so a checklist is your alarm.</p>

<h3>The whole module on one page</h3>
<div class="dia"><svg viewBox="0 0 680 150" role="img" aria-label="Summary path">
<rect x="10" y="40" width="120" height="60" rx="8" fill="#bae6fd"/><text x="70" y="75" text-anchor="middle" class="svg-ink" font-size="12">Rule logs</text>
<rect x="150" y="40" width="120" height="60" rx="8" fill="#fde68a"/><text x="210" y="75" text-anchor="middle" class="svg-ink" font-size="12">Profile named</text>
<rect x="290" y="40" width="120" height="60" rx="8" fill="#fed7aa"/><text x="350" y="75" text-anchor="middle" class="svg-ink" font-size="12">Match list</text>
<rect x="430" y="40" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="485" y="75" text-anchor="middle" class="svg-ink" font-size="12">Connection</text>
<rect x="560" y="40" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="615" y="75" text-anchor="middle" class="svg-ink" font-size="12">Collector</text>
<path d="M130 70H150M270 70H290M410 70H430M540 70H560" stroke="#475569" stroke-width="2" fill="none"/>
</svg><p class="cap">Five checks. Every missing log is explained by one of them.</p></div>

<h3>Facts to know cold</h3>
<table class="tbl"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Where logs start</td><td>Written on the firewall first; forwarding is a second step.</td></tr>
<tr><td>Rule settings</td><td>log-end (session-end log) and log-setting (forwarding profile).</td></tr>
<tr><td>Profile</td><td>Match lists with log type, filter and destinations; a log can match several lists.</td></tr>
<tr><td>Filters</td><td>"All Logs", (action eq deny), (rule eq X), (app eq X), (addr.src in range), joined by and/or.</td></tr>
<tr><td>Where objects live</td><td>Forwarding profile in shared log settings or device group; syslog server profile in a template.</td></tr>
<tr><td>Pushes</td><td>Push sends committed configuration. Device group push: policy, objects, forwarding profiles. Template push: server profiles. Collector config push: group membership.</td></tr>
<tr><td>Collectors</td><td>Default group uses the local collector. A custom group needs a collector and a collector configuration push.</td></tr>
<tr><td>Counters</td><td>Created, forwarded, waiting. Waiting means a path problem, and the log is safe on the firewall.</td></tr>
<tr><td>Syslog</td><td>Address, transport, port, format, facility; filter at the source; UDP can lose messages.</td></tr>
<tr><td>Evidence</td><td>Buffers are finite; absence of a log is not proof of absence of traffic.</td></tr>
</table>

<h3>Exam checklist: before you answer</h3>
<ol>
<li>Is the log written? Check the rule's action and log-end.</li>
<li>Does the rule name the profile, and was the device group committed and pushed?</li>
<li>Does a match list with the right filter select the log, with the correct destination switch?</li>
<li>Is the firewall connected to the active Panorama?</li>
<li>Does the collector group have a collector, and was its configuration pushed?</li>
<li>Does the syslog server profile exist on the firewall (template pushed), and does the profile name it exactly?</li>
<li>Did you test with real traffic, and did you read the counters?</li>
</ol>

<h3>Interview checklist</h3>
<ul>
<li>Explain the five stages in your own words, with the analogy that helps you.</li>
<li>Give one example of a quiet failure and how you detect it.</li>
<li>Explain why the forwarding profile and the syslog server profile live in different places.</li>
<li>State the honest limits: ports, collector limits and retention depend on version, so check the documentation for your PAN-OS version.</li>
</ul>

<div class="exam"><p><b>Last exam traps.</b> A profile with send-to-panorama no is valid but does nothing for Panorama. A custom collector group does nothing until its configuration is pushed. A rule with log-end no works for users but produces no logs. Buffering saves path failures, not configuration mistakes.</p></div>

<div class="scn"><h4>The monthly drill</h4><p>One operations team runs a monthly drill: one allowed and one denied session from a test PC at each region, then a check of the counters, the Panorama view and the SIEM. They catch about one broken forwarding path a quarter, usually after a policy change, usually before anyone asks for evidence.</p><p><b>Lesson:</b> testing the path on a schedule is cheaper than discovering the gap in an investigation.</p></div>

<div class="iv"><p class="q">"Summarise how you keep logging reliable across a managed firewall estate."</p><p>Standard profiles attached to every logging rule, device and policy parts pushed in the right order, alerts on silent firewalls and a growing waiting counter, filters that match documented use cases, a retention requirement owned by compliance, and a scheduled end-to-end test with a real session.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five checks explain every missing log: rule, profile, match list, connection, collector.</li>
<li>Know where each object lives and which push carries it.</li>
<li>Counters locate the failing stage; real traffic produces them.</li>
<li>Filter at the source, keep Panorama complete, and test the path on a schedule.</li>
</ul></div>
`,hi:`
<p>Aapne dukaan ke camera se shuru kiya aur ek designed logging estate par pahunche. Exam, interview ya real change window se pehle tasveer ek baar phir dohrao. Pilot das hazaar flights ke baad bhi checklist padhta hai, isliye nahi ki wo udna bhool gaya, balki isliye ki ek item chhodne ki keemat bahut hai. Logging mein bhi yahi hai: failures chupchaap hote hain, isliye checklist aapka alarm hai.</p>

<h3>Poora module ek page par</h3>
<div class="dia"><svg viewBox="0 0 680 150" role="img" aria-label="Summary path">
<rect x="10" y="40" width="120" height="60" rx="8" fill="#bae6fd"/><text x="70" y="75" text-anchor="middle" class="svg-ink" font-size="12">Rule log karta</text>
<rect x="150" y="40" width="120" height="60" rx="8" fill="#fde68a"/><text x="210" y="75" text-anchor="middle" class="svg-ink" font-size="12">Profile named</text>
<rect x="290" y="40" width="120" height="60" rx="8" fill="#fed7aa"/><text x="350" y="75" text-anchor="middle" class="svg-ink" font-size="12">Match list</text>
<rect x="430" y="40" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="485" y="75" text-anchor="middle" class="svg-ink" font-size="12">Connection</text>
<rect x="560" y="40" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="615" y="75" text-anchor="middle" class="svg-ink" font-size="12">Collector</text>
<path d="M130 70H150M270 70H290M410 70H430M540 70H560" stroke="#475569" stroke-width="2" fill="none"/>
</svg><p class="cap">Paanch checks. Har missing log inme se kisi ek se explain hota hai.</p></div>

<h3>Jo facts ratne hain</h3>
<table class="tbl"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Logs kahan se shuru</td><td>Pehle firewall par likhe jate hain; forwarding doosra step hai.</td></tr>
<tr><td>Rule settings</td><td>log-end (session-end log) aur log-setting (forwarding profile).</td></tr>
<tr><td>Profile</td><td>Match lists jinme log type, filter aur destinations; ek log kai lists se match ho sakta hai.</td></tr>
<tr><td>Filters</td><td>"All Logs", (action eq deny), (rule eq X), (app eq X), (addr.src in range), and/or se joda hua.</td></tr>
<tr><td>Objects kahan rehte hain</td><td>Forwarding profile shared log settings ya device group mein; syslog server profile template mein.</td></tr>
<tr><td>Pushes</td><td>Push committed configuration bhejta hai. Device group push: policy, objects, forwarding profiles. Template push: server profiles. Collector config push: group membership.</td></tr>
<tr><td>Collectors</td><td>Default group local collector use karta hai. Custom group ko collector aur collector configuration push chahiye.</td></tr>
<tr><td>Counters</td><td>Created, forwarded, waiting. Waiting ka matlab path problem, aur log firewall par safe hai.</td></tr>
<tr><td>Syslog</td><td>Address, transport, port, format, facility; source par filter; UDP messages kho sakta hai.</td></tr>
<tr><td>Evidence</td><td>Buffers limited hain; log ka na hona traffic na hone ka proof nahi.</td></tr>
</table>

<h3>Exam checklist: jawab dene se pehle</h3>
<ol>
<li>Kya log likha gaya? Rule ka action aur log-end check karo.</li>
<li>Kya rule profile ka naam leta hai, aur device group commit aur push hua?</li>
<li>Kya sahi filter wali match list log select karti hai, sahi destination switch ke saath?</li>
<li>Kya firewall active Panorama se connected hai?</li>
<li>Kya collector group mein collector hai, aur uski configuration push hui?</li>
<li>Kya syslog server profile firewall par exist karta hai (template pushed), aur kya profile use exact naam se refer karta hai?</li>
<li>Kya real traffic se test kiya, aur counters padhe?</li>
</ol>

<h3>Interview checklist</h3>
<ul>
<li>Paanch stages apne shabdon mein samjhao, us analogy ke saath jo aapki madad kare.</li>
<li>Ek quiet failure ka example do aur batao use kaise detect karte ho.</li>
<li>Samjhao ki forwarding profile aur syslog server profile alag jagah kyun rehte hain.</li>
<li>Honest limits batao: ports, collector limits aur retention version par depend karte hain, isliye apne PAN-OS version ki documentation check karo.</li>
</ul>

<div class="exam"><p><b>Aakhri exam traps.</b> send-to-panorama no wala profile valid hai lekin Panorama ke liye kuch nahi karta. Custom collector group tab tak kuch nahi karta jab tak uski configuration push na ho. log-end no wala rule users ke liye chalta hai lekin logs nahi banata. Buffering path failures bachati hai, configuration mistakes nahi.</p></div>

<div class="scn"><h4>Monthly drill</h4><p>Ek operations team monthly drill chalati hai: har region ke test PC se ek allowed aur ek denied session, phir counters, Panorama view aur SIEM ka check. Wo saal mein lagbhag har quarter ek toota forwarding path pakadte hain, aksar policy change ke baad, aksar kisi ke evidence maangne se pehle.</p><p><b>Lesson:</b> schedule par path test karna investigation mein gap dhoondhne se sasta hai.</p></div>

<div class="iv"><p class="q">"Managed firewall estate mein logging reliable kaise rakhte ho, short mein batao."</p><p>Har logging rule par standard profiles, device aur policy parts sahi order mein push, chup firewalls aur badhte waiting counter par alerts, documented use cases se matching filters, compliance ki owned retention requirement, aur real session ke saath scheduled end-to-end test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch checks har missing log explain karte hain: rule, profile, match list, connection, collector.</li>
<li>Jaano har object kahan rehta hai aur kaunsa push use carry karta hai.</li>
<li>Counters failing stage dhoondhte hain; real traffic unhe banata hai.</li>
<li>Source par filter karo, Panorama ko complete rakho, aur path ko schedule par test karo.</li>
</ul></div>
`}};export{e as default};