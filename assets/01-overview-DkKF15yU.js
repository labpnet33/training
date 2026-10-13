var e={id:`overview`,h:{en:`Getting software from a laptop to users: the big picture`,hi:`Software ko laptop se users tak pahunchana: poori tasveer`},body:{en:`
<p>Think of a restaurant kitchen. A chef can cook one perfect dish at home, but a restaurant must serve the <b>same dish</b>, hot, to two hundred guests every evening, and must be able to fix a bad batch quickly. Writing code is cooking at home. <b>Deploying</b> is running the restaurant: packing the dish the same way every time, delivering it to the right table, and noticing fast when something goes wrong. This module teaches that second half for software, with a network engineer's eye.</p>

<h3>What you will learn</h3>
<ul>
<li>How to <b>diagnose a failing deployment</b> using logs, status and ports (blueprint 4.1).</li>
<li>Why <b>CI/CD pipelines</b> exist and how to read a pipeline file (4.2).</li>
<li>The <b>deployment types</b>: bare metal, virtual machines, containers, serverless, edge, and on-prem versus public, private and hybrid cloud (4.3).</li>
<li>The <b>12-factor app</b> method, all twelve factors, with network examples (4.4).</li>
<li><b>DevOps</b> principles: CALMS, infrastructure as code, immutable infrastructure, blue/green and canary releases, rollback (4.5).</li>
<li><b>Docker basics</b>: Dockerfile, build, run, ports, volumes, <code>docker ps</code>, <code>logs</code>, <code>exec</code>, images versus containers, registries and tags (4.6), and containerising a <b>Python app</b> (4.7).</li>
<li><b>Environments</b> (dev, test, staging, prod) and configuration through <b>environment variables</b> (4.8).</li>
</ul>
<div class="note"><p>This is domain 4 of the Cisco 200-901 CCNAAUTO v1.1 exam, "Application Deployment and Security", worth about 15%. The security half lives in the sibling module <code>caut-appsec</code>. We teach the associate-level foundations here. Deep container work (networks, Compose files for automation tools) comes later in <code>auto-containers</code> for the CCNP track, and pipelines you can practise live in <code>auto-cicd</code>.</p></div>

<h3>Prerequisites</h3>
<p>You should be comfortable with a Linux shell, basic Python (a script that runs and prints), and Git basics from the SDLC module. You do not need any prior Docker experience; we start from nothing.</p>

<h3>The journey of one change</h3>
<p>Every deployment, however fancy the tools, follows the same path. A developer commits code; a pipeline <b>builds</b> it into a package (an <b>artifact</b>), <b>tests</b> it, and <b>deploys</b> it to a series of <b>environments</b>; the running app reads its <b>configuration</b> from the environment; and people watch <b>logs and status</b> to see if it is healthy.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Path of a change from commit to production">
<rect x="10" y="55" width="100" height="50" rx="8" fill="#bae6fd"/><text x="60" y="77" text-anchor="middle" class="svg-ink" font-size="13">Commit</text><text x="60" y="94" text-anchor="middle" class="svg-muted" font-size="12">Git push</text>
<rect x="135" y="55" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="185" y="77" text-anchor="middle" class="svg-ink" font-size="13">Build</text><text x="185" y="94" text-anchor="middle" class="svg-muted" font-size="12">image</text>
<rect x="260" y="55" width="100" height="50" rx="8" fill="#fde68a"/><text x="310" y="77" text-anchor="middle" class="svg-ink" font-size="13">Test</text><text x="310" y="94" text-anchor="middle" class="svg-muted" font-size="12">automatic</text>
<rect x="385" y="55" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="435" y="77" text-anchor="middle" class="svg-ink" font-size="13">Deploy</text><text x="435" y="94" text-anchor="middle" class="svg-muted" font-size="12">staging, prod</text>
<rect x="510" y="55" width="120" height="50" rx="8" fill="#fed7aa"/><text x="570" y="77" text-anchor="middle" class="svg-ink" font-size="13">Observe</text><text x="570" y="94" text-anchor="middle" class="svg-muted" font-size="12">logs, status</text>
<line x1="110" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="235" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="360" y1="80" x2="385" y2="80" stroke="#64748b" stroke-width="2"/><line x1="485" y1="80" x2="510" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">If observe shows trouble: roll back to the previous artifact</text>
</svg><p class="cap">The deployment path this module follows, chapter by chapter.</p></div>

<h3>Why a network engineer cares</h3>
<p>Controllers, automation scripts, monitoring dashboards and chatbots that manage your network are all applications. Someone must run them on a server, keep them up, update them without downtime and give each one the right credentials and addresses. When an automation tool fails at 2 a.m., the cause is rarely the code. It is usually a port already in use, a stopped container, a missing environment variable or a bad release. These are exactly the skills of this module.</p>

<div class="eg"><p><b>Worked example.</b> A Python script that collects interface counters works on your laptop. To deploy it you need: the same Python version on the server (a container fixes this), the controller address and password outside the code (environment variables), a way to start it again if it dies, and a pipeline so every fix reaches the server the same way. Four problems, four chapters.</p></div>

<div class="scn"><h4>Works on my machine</h4><p>Ravi, a network automation engineer in Pune, wrote a backup script that ran perfectly on his laptop. On the shared server it crashed instantly: the server had Python 3.8 and the script used a newer feature. After packaging it in a container image with the right Python inside, it behaved identically on his laptop, the test server and production.</p><p><b>Lesson:</b> deployment problems are mostly about <b>differences between machines</b>. Good deployment removes the differences.</p></div>

<div class="iv"><p class="q">"What does deployment mean, and why is it harder than writing code?"</p><p>Deployment is getting tested software running reliably where users or other systems can use it. It is harder because it adds dependencies, configuration, environments, scaling, updates and failure handling. Mention repeatability: the same steps, every time, by automation rather than by hand.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Deployment = build, test, release, run and observe, repeatably.</li>
<li>Blueprint domain 4 is about 15% of the 200-901 exam; this module covers the deployment half.</li>
<li>Most deployment faults are differences between environments, not code bugs.</li>
<li>Network tools (controllers, scripts, dashboards) are applications that need deploying too.</li>
</ul></div>
`,hi:`
<p>Ek restaurant kitchen socho. Chef ghar par ek perfect dish bana sakta hai, lekin restaurant ko har shaam do sau guests ko <b>wahi dish</b> garam serve karni hoti hai, aur kharab batch jaldi theek karna padta hai. Code likhna ghar par khana pakana hai. <b>Deploy</b> karna restaurant chalana hai: dish ko har baar same tareeke se pack karna, sahi table tak pahunchana, aur kuch galat ho to jaldi pata lagana. Yeh module software ke liye wahi doosra half sikhata hai, network engineer ki nazar se.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>Logs, status aur ports se <b>failing deployment diagnose</b> kaise karte hain (blueprint 4.1).</li>
<li><b>CI/CD pipelines</b> kyun hoti hain aur pipeline file kaise padhte hain (4.2).</li>
<li><b>Deployment types</b>: bare metal, virtual machines, containers, serverless, edge, aur on-prem versus public, private, hybrid cloud (4.3).</li>
<li><b>12-factor app</b> method, saare barah factors, network examples ke saath (4.4).</li>
<li><b>DevOps</b> principles: CALMS, infrastructure as code, immutable infrastructure, blue/green aur canary releases, rollback (4.5).</li>
<li><b>Docker basics</b>: Dockerfile, build, run, ports, volumes, <code>docker ps</code>, <code>logs</code>, <code>exec</code>, image versus container, registries aur tags (4.6), aur <b>Python app</b> ko containerise karna (4.7).</li>
<li><b>Environments</b> (dev, test, staging, prod) aur <b>environment variables</b> se configuration (4.8).</li>
</ul>
<div class="note"><p>Yeh Cisco 200-901 CCNAAUTO v1.1 exam ka domain 4 hai, "Application Deployment and Security", lagbhag 15%. Security wala half sibling module <code>caut-appsec</code> mein hai. Yahan associate-level foundations sikhte hain. Gehra container kaam (networks, automation tools ke liye Compose files) baad mein CCNP track ke <code>auto-containers</code> mein aata hai, aur pipelines ki live practice <code>auto-cicd</code> mein hai.</p></div>

<h3>Prerequisites</h3>
<p>Linux shell mein comfortable hona chahiye, basic Python (script jo chale aur print kare), aur SDLC module ka Git basics. Docker ka pehle se experience nahi chahiye; hum zero se shuru karte hain.</p>

<h3>Ek change ka safar</h3>
<p>Har deployment, chahe tools kitne bhi fancy hon, same raste se guzarta hai. Developer code commit karta hai; pipeline use ek package (<b>artifact</b>) mein <b>build</b> karti hai, <b>test</b> karti hai, aur kai <b>environments</b> mein <b>deploy</b> karti hai; chalti hui app apni <b>configuration</b> environment se padhti hai; aur log <b>logs aur status</b> dekhte hain ki sab theek hai ya nahi.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Commit se production tak change ka raasta">
<rect x="10" y="55" width="100" height="50" rx="8" fill="#bae6fd"/><text x="60" y="77" text-anchor="middle" class="svg-ink" font-size="13">Commit</text><text x="60" y="94" text-anchor="middle" class="svg-muted" font-size="12">Git push</text>
<rect x="135" y="55" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="185" y="77" text-anchor="middle" class="svg-ink" font-size="13">Build</text><text x="185" y="94" text-anchor="middle" class="svg-muted" font-size="12">image</text>
<rect x="260" y="55" width="100" height="50" rx="8" fill="#fde68a"/><text x="310" y="77" text-anchor="middle" class="svg-ink" font-size="13">Test</text><text x="310" y="94" text-anchor="middle" class="svg-muted" font-size="12">automatic</text>
<rect x="385" y="55" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="435" y="77" text-anchor="middle" class="svg-ink" font-size="13">Deploy</text><text x="435" y="94" text-anchor="middle" class="svg-muted" font-size="12">staging, prod</text>
<rect x="510" y="55" width="120" height="50" rx="8" fill="#fed7aa"/><text x="570" y="77" text-anchor="middle" class="svg-ink" font-size="13">Observe</text><text x="570" y="94" text-anchor="middle" class="svg-muted" font-size="12">logs, status</text>
<line x1="110" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="235" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="360" y1="80" x2="385" y2="80" stroke="#64748b" stroke-width="2"/><line x1="485" y1="80" x2="510" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Observe mein dikkat dikhe: pichle artifact par rollback</text>
</svg><p class="cap">Deployment ka raasta jo yeh module chapter-by-chapter follow karta hai.</p></div>

<h3>Network engineer ko isse kya matlab</h3>
<p>Controllers, automation scripts, monitoring dashboards aur chatbots jo aapka network manage karte hain, sab applications hain. Kisi ko unhe server par chalana hota hai, up rakhna hota hai, bina downtime ke update karna hota hai, aur har ek ko sahi credentials aur addresses dene hote hain. Jab raat 2 baje koi automation tool fail hota hai, to wajah shayad hi code hota hai. Aksar port pehle se use mein hota hai, container stopped hota hai, environment variable missing hota hai ya release kharab hoti hai. Yehi skills is module ki hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek Python script jo interface counters collect karti hai, aapke laptop par chalti hai. Deploy karne ke liye chahiye: server par wahi Python version (container yeh fix karta hai), controller ka address aur password code ke bahar (environment variables), agar mar jaye to dobara start karne ka tareeka, aur ek pipeline taaki har fix server tak same tareeke se pahunche. Chaar problems, chaar chapters.</p></div>

<div class="scn"><h4>Mere machine par to chal raha tha</h4><p>Pune ke network automation engineer Ravi ne backup script likhi jo uske laptop par perfect chali. Shared server par turant crash: server par Python 3.8 tha aur script naye feature use karti thi. Sahi Python ke saath container image mein package karne ke baad woh laptop, test server aur production par bilkul same chali.</p><p><b>Lesson:</b> deployment problems zyadatar <b>machines ke beech ke farq</b> ki hoti hain. Achha deployment farq hata deta hai.</p></div>

<div class="iv"><p class="q">"Deployment kya hai, aur code likhne se mushkil kyun hai?"</p><p>Deployment matlab tested software ko aisi jagah reliably chalana jahan users ya doosre systems use kar sakein. Mushkil isliye kyunki dependencies, configuration, environments, scaling, updates aur failure handling jud jaate hain. Repeatability ka zikr karo: har baar same steps, haath se nahi, automation se.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Deployment = build, test, release, run aur observe, repeatably.</li>
<li>Blueprint domain 4 200-901 exam ka lagbhag 15% hai; yeh module deployment half cover karta hai.</li>
<li>Zyadatar deployment faults environments ke beech ke farq hote hain, code bugs nahi.</li>
<li>Network tools (controllers, scripts, dashboards) bhi applications hain jinhe deploy karna padta hai.</li>
</ul></div>
`}};export{e as default};