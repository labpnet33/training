var e={id:`deployment-types`,h:{en:`Where does the app run? Bare metal, VMs, containers, serverless, edge and clouds`,hi:`App kahan chalti hai? Bare metal, VMs, containers, serverless, edge aur clouds`},body:{en:`
<p>Think of housing. You can build your own house on a plot (bare metal), rent a flat in a building with its own meter and walls (a virtual machine), share a co-working desk with your own locker (a container), or just book a hotel room for one night and pay per night (serverless). Each choice trades control, cost, speed and effort. Blueprint item 4.3 asks you to know the <b>attributes</b> of each.</p>

<h3>The five ways to run code</h3>
<dl class="terms">
<dt>Bare metal</dt><dd>The app runs directly on a physical server's operating system. Maximum performance and full hardware control, but slow to set up, hard to move, and one app can disturb another on the same box.</dd>
<dt>Virtual machine (VM)</dt><dd>A <b>hypervisor</b> splits one physical server into several VMs, each with its <b>own full guest operating system</b>. Strong isolation, familiar to every admin, but heavy: gigabytes of disk and minutes to boot.</dd>
<dt>Container</dt><dd>Packages the app and its libraries but <b>shares the host's kernel</b>. No guest OS, so it is megabytes in size and starts in about a second. Isolation is lighter than a VM. Ideal for microservices and automation tools.</dd>
<dt>Serverless (Function as a Service)</dt><dd>You upload a small <b>function</b>; the cloud runs it only when an event arrives (an API call, a file upload, a timer) and bills per execution. No server to manage, scales to zero, but short runtime limits, cold starts and provider lock-in.</dd>
<dt>Edge</dt><dd>Code runs <b>close to where data is produced</b>: a branch router, a factory gateway, a store. It cuts latency, saves WAN bandwidth and keeps working if the link to the data center is down. Hardware is small, so apps must be light, and many remote sites must be updated automatically.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Layers: bare metal, VM, container">
<text x="110" y="18" text-anchor="middle" class="svg-ink" font-size="13">Bare metal</text><text x="320" y="18" text-anchor="middle" class="svg-ink" font-size="13">Virtual machines</text><text x="530" y="18" text-anchor="middle" class="svg-ink" font-size="13">Containers</text>
<rect x="20" y="30" width="180" height="40" rx="6" fill="#bbf7d0"/><text x="110" y="55" text-anchor="middle" class="svg-ink" font-size="12">App</text>
<rect x="20" y="75" width="180" height="40" rx="6" fill="#ddd6fe"/><text x="110" y="100" text-anchor="middle" class="svg-ink" font-size="12">Operating system</text>
<rect x="20" y="120" width="180" height="40" rx="6" fill="#e2e8f0"/><text x="110" y="145" text-anchor="middle" class="svg-ink" font-size="12">Hardware</text>
<rect x="230" y="30" width="85" height="30" rx="6" fill="#bbf7d0"/><text x="272" y="50" text-anchor="middle" class="svg-ink" font-size="12">App A</text><rect x="325" y="30" width="85" height="30" rx="6" fill="#bbf7d0"/><text x="367" y="50" text-anchor="middle" class="svg-ink" font-size="12">App B</text>
<rect x="230" y="63" width="85" height="30" rx="6" fill="#ddd6fe"/><text x="272" y="83" text-anchor="middle" class="svg-ink" font-size="11">Guest OS</text><rect x="325" y="63" width="85" height="30" rx="6" fill="#ddd6fe"/><text x="367" y="83" text-anchor="middle" class="svg-ink" font-size="11">Guest OS</text>
<rect x="230" y="96" width="180" height="30" rx="6" fill="#fde68a"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="12">Hypervisor</text>
<rect x="230" y="129" width="180" height="31" rx="6" fill="#e2e8f0"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="12">Hardware</text>
<rect x="440" y="30" width="85" height="30" rx="6" fill="#bbf7d0"/><text x="482" y="50" text-anchor="middle" class="svg-ink" font-size="12">App A</text><rect x="535" y="30" width="85" height="30" rx="6" fill="#bbf7d0"/><text x="577" y="50" text-anchor="middle" class="svg-ink" font-size="12">App B</text>
<rect x="440" y="63" width="180" height="30" rx="6" fill="#fed7aa"/><text x="530" y="83" text-anchor="middle" class="svg-ink" font-size="12">Container engine</text>
<rect x="440" y="96" width="180" height="30" rx="6" fill="#ddd6fe"/><text x="530" y="116" text-anchor="middle" class="svg-ink" font-size="12">Host OS (shared kernel)</text>
<rect x="440" y="129" width="180" height="31" rx="6" fill="#e2e8f0"/><text x="530" y="149" text-anchor="middle" class="svg-ink" font-size="12">Hardware</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Fewer layers = lighter and faster; more layers = stronger isolation</text>
</svg><p class="cap">The stack under the application for three deployment types.</p></div>

<table class="cmp"><tr><th>Attribute</th><th>Bare metal</th><th>VM</th><th>Container</th><th>Serverless</th></tr>
<tr><td>Start time</td><td>Hours</td><td>Minutes</td><td>About a second</td><td>Milliseconds to seconds</td></tr>
<tr><td>Isolation</td><td>Physical</td><td>Strong (own OS)</td><td>Process level (shared kernel)</td><td>Provider managed</td></tr>
<tr><td>Size</td><td>n/a</td><td>GBs</td><td>MBs</td><td>KBs to MBs of code</td></tr>
<tr><td>You manage</td><td>Everything</td><td>Guest OS and up</td><td>App and image</td><td>Only the function</td></tr>
<tr><td>Cost model</td><td>Buy hardware</td><td>Per VM running</td><td>Share a host</td><td>Per execution</td></tr></table>

<h3>Where it lives: on-prem and clouds</h3>
<ul>
<li><b>On-premises</b>: your own data center. Full control and data residency, but you buy, power and patch everything.</li>
<li><b>Public cloud</b>: a provider's shared infrastructure, rented on demand. Fast and elastic; you pay as you use.</li>
<li><b>Private cloud</b>: cloud-style self-service on infrastructure dedicated to one organisation, on-prem or hosted.</li>
<li><b>Hybrid cloud</b>: private plus public joined together, so workloads can sit where they fit best or burst to the public side at peak.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> A bank in Mumbai keeps its core ledger on bare metal on-prem (regulation, steady load), runs its internal automation tools as containers on VMs in a private cloud, bursts its public web portal into a public cloud during salary week, and runs a tiny container on every ATM-room gateway at the edge. That is hybrid cloud using four deployment types at once.</p></div>

<div class="warn"><p><b>Common mistake:</b> saying "a container is a small VM". A VM has its own kernel; a container shares the host kernel. That is why a Linux container cannot run a different kernel from its host.</p></div>
<div class="exam"><p><b>Exam trap:</b> "serverless" does not mean there are no servers. It means <b>you</b> do not manage them. Also remember that edge is about location (near the data), not a specific technology.</p></div>

<div class="scn"><h4>The nightly report that cost too much</h4><p>A Chennai team ran a nightly inventory report on a VM that sat idle 23 hours a day. They moved the report to a serverless function triggered by a timer. The bill dropped, and nobody patches an operating system for it any more. But a report that ran longer than the provider's time limit had to be split into smaller steps.</p><p><b>Lesson:</b> match the type to the workload shape: constant load suits VMs or containers; short, bursty jobs suit serverless.</p></div>

<div class="iv"><p class="q">"Containers or VMs for a new automation service?"</p><p>Say it depends, then reason: containers for fast startup, density and CI/CD friendliness; VMs when you need a different OS or kernel or strong tenant isolation. Many teams run containers inside VMs to get both. Mention the trade-off, not a winner.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bare metal = raw speed; VM = own OS, strong isolation; container = shared kernel, light and fast; serverless = functions billed per run; edge = close to the data.</li>
<li>On-prem is yours; public is rented; private is dedicated cloud-style; hybrid joins them.</li>
<li>Containers share the host kernel, VMs do not.</li>
<li>Pick by workload shape, control needed and cost.</li>
</ul></div>
`,hi:`
<p>Ghar ki misaal lo. Aap plot par apna ghar bana sakte ho (bare metal), building mein apne meter aur deewaron wala flat kiraye par le sakte ho (virtual machine), co-working mein apne locker wali desk share kar sakte ho (container), ya ek raat ka hotel room book karke per-night paise de sakte ho (serverless). Har choice control, cost, speed aur mehnat ka trade-off hai. Blueprint item 4.3 chahta hai ki aapko har ek ke <b>attributes</b> pata hon.</p>

<h3>Code chalane ke paanch tareeke</h3>
<dl class="terms">
<dt>Bare metal</dt><dd>App seedha physical server ke operating system par chalti hai. Maximum performance aur poora hardware control, lekin setup dheema, move karna mushkil, aur ek app doosri ko disturb kar sakti hai.</dd>
<dt>Virtual machine (VM)</dt><dd><b>Hypervisor</b> ek physical server ko kai VMs mein baant deta hai, har ek ka <b>apna poora guest operating system</b>. Strong isolation, har admin ko familiar, lekin bhaari: GBs disk aur boot mein minutes.</dd>
<dt>Container</dt><dd>App aur uski libraries pack karta hai lekin <b>host ka kernel share karta hai</b>. Guest OS nahi, isliye MBs size aur lagbhag ek second mein start. Isolation VM se halka. Microservices aur automation tools ke liye ideal.</dd>
<dt>Serverless (Function as a Service)</dt><dd>Aap ek chhota <b>function</b> upload karte ho; cloud use sirf tab chalata hai jab event aaye (API call, file upload, timer) aur per execution bill karta hai. Manage karne ko server nahi, zero tak scale hota hai, lekin runtime limits, cold start aur provider lock-in.</dd>
<dt>Edge</dt><dd>Code <b>wahan chalta hai jahan data banta hai</b>: branch router, factory gateway, store. Latency kam, WAN bandwidth bachti hai, aur data center ka link down ho tab bhi chalta rehta hai. Hardware chhota hota hai, isliye apps halki honi chahiye, aur bahut saari remote sites automatically update karni padti hain.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Layers: bare metal, VM, container">
<text x="110" y="18" text-anchor="middle" class="svg-ink" font-size="13">Bare metal</text><text x="320" y="18" text-anchor="middle" class="svg-ink" font-size="13">Virtual machines</text><text x="530" y="18" text-anchor="middle" class="svg-ink" font-size="13">Containers</text>
<rect x="20" y="30" width="180" height="40" rx="6" fill="#bbf7d0"/><text x="110" y="55" text-anchor="middle" class="svg-ink" font-size="12">App</text>
<rect x="20" y="75" width="180" height="40" rx="6" fill="#ddd6fe"/><text x="110" y="100" text-anchor="middle" class="svg-ink" font-size="12">Operating system</text>
<rect x="20" y="120" width="180" height="40" rx="6" fill="#e2e8f0"/><text x="110" y="145" text-anchor="middle" class="svg-ink" font-size="12">Hardware</text>
<rect x="230" y="30" width="85" height="30" rx="6" fill="#bbf7d0"/><text x="272" y="50" text-anchor="middle" class="svg-ink" font-size="12">App A</text><rect x="325" y="30" width="85" height="30" rx="6" fill="#bbf7d0"/><text x="367" y="50" text-anchor="middle" class="svg-ink" font-size="12">App B</text>
<rect x="230" y="63" width="85" height="30" rx="6" fill="#ddd6fe"/><text x="272" y="83" text-anchor="middle" class="svg-ink" font-size="11">Guest OS</text><rect x="325" y="63" width="85" height="30" rx="6" fill="#ddd6fe"/><text x="367" y="83" text-anchor="middle" class="svg-ink" font-size="11">Guest OS</text>
<rect x="230" y="96" width="180" height="30" rx="6" fill="#fde68a"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="12">Hypervisor</text>
<rect x="230" y="129" width="180" height="31" rx="6" fill="#e2e8f0"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="12">Hardware</text>
<rect x="440" y="30" width="85" height="30" rx="6" fill="#bbf7d0"/><text x="482" y="50" text-anchor="middle" class="svg-ink" font-size="12">App A</text><rect x="535" y="30" width="85" height="30" rx="6" fill="#bbf7d0"/><text x="577" y="50" text-anchor="middle" class="svg-ink" font-size="12">App B</text>
<rect x="440" y="63" width="180" height="30" rx="6" fill="#fed7aa"/><text x="530" y="83" text-anchor="middle" class="svg-ink" font-size="12">Container engine</text>
<rect x="440" y="96" width="180" height="30" rx="6" fill="#ddd6fe"/><text x="530" y="116" text-anchor="middle" class="svg-ink" font-size="12">Host OS (shared kernel)</text>
<rect x="440" y="129" width="180" height="31" rx="6" fill="#e2e8f0"/><text x="530" y="149" text-anchor="middle" class="svg-ink" font-size="12">Hardware</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Kam layers = halka aur tez; zyada layers = strong isolation</text>
</svg><p class="cap">Teen deployment types ke liye application ke neeche ka stack.</p></div>

<table class="cmp"><tr><th>Attribute</th><th>Bare metal</th><th>VM</th><th>Container</th><th>Serverless</th></tr>
<tr><td>Start time</td><td>Hours</td><td>Minutes</td><td>Lagbhag ek second</td><td>Milliseconds se seconds</td></tr>
<tr><td>Isolation</td><td>Physical</td><td>Strong (apna OS)</td><td>Process level (shared kernel)</td><td>Provider managed</td></tr>
<tr><td>Size</td><td>n/a</td><td>GBs</td><td>MBs</td><td>KBs se MBs code</td></tr>
<tr><td>Aap manage karte ho</td><td>Sab kuch</td><td>Guest OS aur upar</td><td>App aur image</td><td>Sirf function</td></tr>
<tr><td>Cost model</td><td>Hardware kharido</td><td>Per VM running</td><td>Host share karo</td><td>Per execution</td></tr></table>

<h3>Kahan rehta hai: on-prem aur clouds</h3>
<ul>
<li><b>On-premises</b>: aapka apna data center. Poora control aur data residency, lekin sab kuch aap kharidte, power dete aur patch karte ho.</li>
<li><b>Public cloud</b>: provider ka shared infrastructure, demand par kiraye par. Tez aur elastic; jitna use utna paisa.</li>
<li><b>Private cloud</b>: ek organisation ke liye dedicated infrastructure par cloud-style self-service, on-prem ya hosted.</li>
<li><b>Hybrid cloud</b>: private aur public jude hue, taaki workloads wahan rahein jahan fit baithein ya peak par public side par burst karein.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Mumbai ka ek bank apna core ledger on-prem bare metal par rakhta hai (regulation, steady load), internal automation tools private cloud ke VMs par containers mein chalata hai, salary week mein public web portal ko public cloud mein burst karta hai, aur har ATM-room gateway par edge par ek chhota container chalata hai. Yeh hybrid cloud hai jisme ek saath chaar deployment types hain.</p></div>

<div class="warn"><p><b>Common mistake:</b> "container ek chhota VM hai" kehna. VM ka apna kernel hota hai; container host kernel share karta hai. Isi liye Linux container apne host se alag kernel nahi chala sakta.</p></div>
<div class="exam"><p><b>Exam trap:</b> "serverless" ka matlab yeh nahi ki servers hain hi nahi. Matlab <b>aap</b> unhe manage nahi karte. Aur edge location ke baare mein hai (data ke paas), koi specific technology nahi.</p></div>

<div class="scn"><h4>Raat ki report jo mehngi padi</h4><p>Chennai ki ek team nightly inventory report ek VM par chalati thi jo din ke 23 ghante idle rehta tha. Unhone report ko timer se trigger hone wale serverless function mein move kiya. Bill gir gaya, aur ab uske liye koi operating system patch nahi karta. Lekin jo report provider ki time limit se zyada chalti thi use chhote steps mein todna pada.</p><p><b>Lesson:</b> type ko workload ke shape se match karo: constant load ke liye VMs ya containers; chhote, bursty jobs ke liye serverless.</p></div>

<div class="iv"><p class="q">"Naye automation service ke liye containers ya VMs?"</p><p>Kaho "depends", phir reason do: tez startup, density aur CI/CD friendliness ke liye containers; alag OS ya kernel ya strong tenant isolation chahiye to VMs. Bahut teams dono ka fayda lene ke liye VMs ke andar containers chalati hain. Trade-off batao, winner nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bare metal = raw speed; VM = apna OS, strong isolation; container = shared kernel, halka aur tez; serverless = per run bill hone wale functions; edge = data ke paas.</li>
<li>On-prem aapka hai; public kiraye ka; private dedicated cloud-style; hybrid dono jodta hai.</li>
<li>Containers host kernel share karte hain, VMs nahi.</li>
<li>Workload shape, zaroori control aur cost se chuno.</li>
</ul></div>
`}};export{e as default};