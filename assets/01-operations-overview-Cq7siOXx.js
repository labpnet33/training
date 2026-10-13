var e={id:`operations-overview`,h:{en:`Operating Prisma Access: the big picture`,hi:`Prisma Access operate karna: big picture`},body:{en:`
<p>Think of a hospital ward. Doctors write orders (changes), nurses carry them out (pushes), monitors beep when something is wrong (logs and status), and a duty doctor follows a fixed routine when an alarm rings (triage). Prisma Access operations is the same four-part rhythm: <b>change, push, verify, monitor</b>. Learners who only know how to configure are like doctors who never visit the ward after writing the order.</p>

<h3>What you will learn</h3>
<ul>
<li>How a change travels: SCM Push Config, or Panorama Commit to Panorama and Commit and Push.</li>
<li>What Out of sync and In sync mean, and why the Service Setup scope matters.</li>
<li>How logs reach the Strata Logging Service and how to read Activity Insights and Log Viewer.</li>
<li>How to read the Panorama pages: Status, Monitor and Network Details.</li>
<li>What the serviceability commands do and which Panorama CLI commands are documented.</li>
<li>How Panorama-to-SCM migration works and what it cannot do.</li>
<li>A triage playbook across tunnel, BGP, pool and policy, and tips for the SSE Engineer exam.</li>
</ul>
<p><b>Prerequisites:</b> the earlier Prisma Access modules (start, mobile users, remote networks, service connections) and the policy module. You need to know the three template names, the lab IP plan and the zone idea.</p>

<h3>One service, two management consoles</h3>
<p>Prisma Access is a cloud service. You do not log in to its cloud nodes like you would to a router. You manage it through a console and watch it through logs and status pages. Two consoles exist. <b>Panorama</b> with the Cloud Services plugin suits teams already running Panorama and wanting common policy. <b>Strata Cloud Manager (SCM)</b> suits fast onboarding with built-in best-practice policy. The documentation says some features differ between them, and migration goes one way only: Panorama to SCM.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Ops loop">
<rect x="20" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">1 Change</text>
<rect x="190" y="20" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="255" y="50" text-anchor="middle" class="svg-ink" font-size="13">2 Push</text>
<rect x="360" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="425" y="50" text-anchor="middle" class="svg-ink" font-size="13">3 Verify sync</text>
<rect x="520" y="20" width="100" height="50" rx="8" fill="#fde68a"/><text x="570" y="50" text-anchor="middle" class="svg-ink" font-size="13">4 Monitor</text>
<line x1="150" y1="45" x2="190" y2="45" stroke="#64748b" stroke-width="2"/><line x1="320" y1="45" x2="360" y2="45" stroke="#64748b" stroke-width="2"/><line x1="490" y1="45" x2="520" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="130" width="280" height="80" rx="8" fill="#e2e8f0"/><text x="160" y="158" text-anchor="middle" class="svg-ink" font-size="13">SCM: Configuration, Operations,</text><text x="160" y="178" text-anchor="middle" class="svg-ink" font-size="13">Push Config; Sync Status; Insights</text>
<rect x="340" y="130" width="280" height="80" rx="8" fill="#e2e8f0"/><text x="480" y="158" text-anchor="middle" class="svg-ink" font-size="13">Panorama: Commit and Push;</text><text x="480" y="178" text-anchor="middle" class="svg-ink" font-size="13">Cloud Services, Status, Monitor</text>
<line x1="85" y1="70" x2="120" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><line x1="570" y1="70" x2="540" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
</svg><p class="cap">The same four-step loop, two sets of menus. Logs from both go to the Strata Logging Service.</p></div>

<h3>The operations map</h3>
<table class="cmp">
<tr><th>Task</th><th>SCM</th><th>Panorama</th></tr>
<tr><td>Apply changes</td><td>Configuration, Operations, Push Config</td><td>Commit to Panorama, then Commit and Push</td></tr>
<tr><td>Check sync</td><td>Configuration, Prisma Access, Sync Status</td><td>Cloud Services, Status, Status; Monitor</td></tr>
<tr><td>Read logs</td><td>Log Viewer (under Activity)</td><td>Logs stored in the Strata Logging Service</td></tr>
<tr><td>Health and users</td><td>Activity Insights, Insights</td><td>Status, Monitor, Network Details</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> At 10:00 an engineer adds an allow rule for the HQ app 10.10.0.50. At 10:05 she pushes. At 10:08 Config Status reads In sync. At 10:10 lab-user1 on LAPTOP-HOME (203.0.113.50) opens the app and the traffic log shows the new rule name. At 11:00 an alert shows a branch tunnel flapping; she uses the triage playbook. Every step is on the loop: change, push, verify, monitor, then triage when something breaks.</p></div>

<div class="note"><p><b>Teaching model.</b> The simulator models a simplified tenant, push job and status pages. Strata Logging Service, ADEM, licence activation and real client logs are concept-only. The chapters say so where it matters.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Believing a saved or committed-to-Panorama change is live; checking only the tunnel and never the sync state; reading dashboards without a time range; assuming SCM and Panorama have identical features.</p></div>
<div class="exam"><p><b>Exam trap.</b> The Administration and Operation domain (16 percent) covers managing with Panorama, managing with SCM, the Strata Logging Service and security posture. The Troubleshooting domain (18 percent) covers monitoring connectivity and traffic enforcement. Know which console a question is about before you answer.</p></div>

<div class="scn"><h4>The invisible change</h4><p>A team lead said a new rule "did nothing". The engineer found the change committed to Panorama but never pushed; the Config Status showed Out of sync for the networks scope. After Commit and Push with the Prisma Access tab, the status became In sync and the rule showed in logs.</p><p><b>Lesson:</b> verify sync before you debug policy.</p></div>

<div class="iv"><p class="q">"How do you operate a Prisma Access tenant day to day?"</p><p>Change, push, verify sync, monitor, triage. Name the console menus: Push Config and Sync Status on SCM; Commit and Push and Status, Monitor on Panorama. Mention the Strata Logging Service and a written triage routine.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operations is a loop: change, push, verify, monitor, triage.</li>
<li>Prisma Access is managed from a console, not by logging in to cloud nodes.</li>
<li>SCM and Panorama have different menus and some different features; migration is one way.</li>
<li>All Prisma Access logs go to the Strata Logging Service.</li>
<li>Verify sync state before debugging anything else.</li>
</ul></div>
`,hi:`
<p>Hospital ward socho. Doctors orders likhte hain (changes), nurses unhe execute karti hain (pushes), monitors beep karte hain jab kuch galat ho (logs aur status), aur alarm bajne par duty doctor ek fixed routine follow karta hai (triage). Prisma Access operations bhi wahi chaar-hisse ka rhythm hai: <b>change, push, verify, monitor</b>. Jo learners sirf configure karna jaante hain wo un doctors jaise hain jo order likh kar ward mein kabhi nahi jaate.</p>

<h3>Is chapter mein aap seekhoge</h3>
<ul>
<li>Change kaise travel karta hai: SCM Push Config, ya Panorama Commit to Panorama aur Commit and Push.</li>
<li>Out of sync aur In sync ka kya matlab hai, aur Service Setup scope kyun matter karta hai.</li>
<li>Logs Strata Logging Service tak kaise pahunchte hain aur Activity Insights tatha Log Viewer kaise padhte hain.</li>
<li>Panorama pages kaise padhein: Status, Monitor aur Network Details.</li>
<li>Serviceability commands kya karte hain aur kaunse Panorama CLI commands documented hain.</li>
<li>Panorama-to-SCM migration kaise chalta hai aur wo kya nahi kar sakta.</li>
<li>Tunnel, BGP, pool aur policy par triage playbook, aur SSE Engineer exam ke tips.</li>
</ul>
<p><b>Prerequisites:</b> pehle ke Prisma Access modules (start, mobile users, remote networks, service connections) aur policy module. Aapko teen template names, lab IP plan aur zone ka idea pata hona chahiye.</p>

<h3>Ek service, do management consoles</h3>
<p>Prisma Access ek cloud service hai. Aap uske cloud nodes mein router ki tarah login nahi karte. Aap use console se manage karte ho aur logs tatha status pages se dekhte ho. Do consoles hain. <b>Panorama</b> Cloud Services plugin ke saath un teams ke liye hai jo pehle se Panorama chalate hain aur common policy chahte hain. <b>Strata Cloud Manager (SCM)</b> fast onboarding aur built-in best-practice policy ke liye hai. Documentation kehti hai dono ke kuch features alag hain, aur migration sirf ek taraf hota hai: Panorama se SCM.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Ops loop">
<rect x="20" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">1 Change</text>
<rect x="190" y="20" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="255" y="50" text-anchor="middle" class="svg-ink" font-size="13">2 Push</text>
<rect x="360" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="425" y="50" text-anchor="middle" class="svg-ink" font-size="13">3 Verify sync</text>
<rect x="520" y="20" width="100" height="50" rx="8" fill="#fde68a"/><text x="570" y="50" text-anchor="middle" class="svg-ink" font-size="13">4 Monitor</text>
<line x1="150" y1="45" x2="190" y2="45" stroke="#64748b" stroke-width="2"/><line x1="320" y1="45" x2="360" y2="45" stroke="#64748b" stroke-width="2"/><line x1="490" y1="45" x2="520" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="130" width="280" height="80" rx="8" fill="#e2e8f0"/><text x="160" y="158" text-anchor="middle" class="svg-ink" font-size="13">SCM: Configuration, Operations,</text><text x="160" y="178" text-anchor="middle" class="svg-ink" font-size="13">Push Config; Sync Status; Insights</text>
<rect x="340" y="130" width="280" height="80" rx="8" fill="#e2e8f0"/><text x="480" y="158" text-anchor="middle" class="svg-ink" font-size="13">Panorama: Commit and Push;</text><text x="480" y="178" text-anchor="middle" class="svg-ink" font-size="13">Cloud Services, Status, Monitor</text>
<line x1="85" y1="70" x2="120" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><line x1="570" y1="70" x2="540" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
</svg><p class="cap">Wahi chaar-step loop, menus ke do set. Dono ke logs Strata Logging Service mein jaate hain.</p></div>

<h3>Operations ka map</h3>
<table class="cmp">
<tr><th>Task</th><th>SCM</th><th>Panorama</th></tr>
<tr><td>Changes apply karna</td><td>Configuration, Operations, Push Config</td><td>Commit to Panorama, phir Commit and Push</td></tr>
<tr><td>Sync check karna</td><td>Configuration, Prisma Access, Sync Status</td><td>Cloud Services, Status, Status; Monitor</td></tr>
<tr><td>Logs padhna</td><td>Log Viewer (Activity ke neeche)</td><td>Logs Strata Logging Service mein store hote hain</td></tr>
<tr><td>Health aur users</td><td>Activity Insights, Insights</td><td>Status, Monitor, Network Details</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Subah 10:00 par engineer HQ app 10.10.0.50 ke liye allow rule add karti hai. 10:05 par push karti hai. 10:08 par Config Status In sync dikhata hai. 10:10 par LAPTOP-HOME (203.0.113.50) par lab-user1 app kholta hai aur traffic log naya rule name dikhata hai. 11:00 par alert dikhata hai ki branch tunnel flap kar raha hai; wo triage playbook use karti hai. Har step loop par hai: change, push, verify, monitor, aur kuch toote to triage.</p></div>

<div class="note"><p><b>Teaching model.</b> Simulator simplified tenant, push job aur status pages model karta hai. Strata Logging Service, ADEM, licence activation aur real client logs concept-only hain. Jahan matter karta hai chapters batate hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Saved ya sirf Panorama tak committed change ko live maan lena; sirf tunnel check karna aur sync state kabhi nahi; time range ke bina dashboards padhna; ye maan lena ki SCM aur Panorama ke features bilkul same hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Administration and Operation domain (16 percent) mein Panorama se manage karna, SCM se manage karna, Strata Logging Service aur security posture aate hain. Troubleshooting domain (18 percent) mein connectivity monitor karna aur traffic enforcement aate hain. Answer dene se pehle jaano ki question kaunse console ke baare mein hai.</p></div>

<div class="scn"><h4>Invisible change</h4><p>Team lead ne kaha naya rule "kuch nahi karta". Engineer ko mila ki change Panorama tak commit hua tha lekin push nahi hua; networks scope ka Config Status Out of sync tha. Prisma Access tab ke saath Commit and Push ke baad status In sync hua aur rule logs mein dikha.</p><p><b>Lesson:</b> policy debug karne se pehle sync verify karo.</p></div>

<div class="iv"><p class="q">"Prisma Access tenant ko roz kaise operate karte ho?"</p><p>Change, push, verify sync, monitor, triage. Console menus ke naam lo: SCM par Push Config aur Sync Status; Panorama par Commit and Push aur Status, Monitor. Strata Logging Service aur likhi hui triage routine ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operations ek loop hai: change, push, verify, monitor, triage.</li>
<li>Prisma Access console se manage hota hai, cloud nodes mein login karke nahi.</li>
<li>SCM aur Panorama ke menus aur kuch features alag hain; migration ek taraf hota hai.</li>
<li>Prisma Access ke saare logs Strata Logging Service mein jaate hain.</li>
<li>Kuch aur debug karne se pehle sync state verify karo.</li>
</ul></div>
`}};export{e as default};