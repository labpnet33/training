var e={id:`twelve-factor`,h:{en:`The 12-factor app: twelve habits of cloud-ready software`,hi:`12-factor app: cloud-ready software ki barah aadatein`},body:{en:`
<p>Imagine a food truck designed so it can be parked in any city, restart in minutes, and be copied into ten trucks on festival day. Its recipe book is in one place, its ingredients are listed, its gas and water connections are plug-in, and nobody keeps anything precious inside the truck that would be lost if it were swapped. The <b>12-factor app</b> is a set of twelve habits that make software behave like that truck. It was written for web services, but the ideas fit any automation app you deploy, and blueprint item 4.4 expects you to know all twelve in plain words.</p>

<h3>The twelve factors</h3>
<table class="cmp"><tr><th>#</th><th>Factor</th><th>Plain meaning</th><th>Network example</th></tr>
<tr><td>I</td><td>Codebase</td><td>One codebase in version control, many deploys of it.</td><td>One Git repo for the config-backup tool, deployed to test and prod.</td></tr>
<tr><td>II</td><td>Dependencies</td><td>Declare every library explicitly and isolate them.</td><td>A requirements file lists netmiko and pyyaml with versions.</td></tr>
<tr><td>III</td><td>Config</td><td>Anything that changes between deploys lives in the environment, not in code.</td><td>Controller address and token come from environment variables.</td></tr>
<tr><td>IV</td><td>Backing services</td><td>Databases, queues and APIs are attached resources, swappable by changing a URL.</td><td>Switch the inventory database by changing one setting.</td></tr>
<tr><td>V</td><td>Build, release, run</td><td>Three strictly separate stages.</td><td>Build image, combine with config, then run it.</td></tr>
<tr><td>VI</td><td>Processes</td><td>The app is stateless; state lives in a backing service.</td><td>Poll results are written to a database, not kept in memory.</td></tr>
<tr><td>VII</td><td>Port binding</td><td>The app exports its service by listening on a port itself.</td><td>The REST service listens on a port given by the environment.</td></tr>
<tr><td>VIII</td><td>Concurrency</td><td>Scale out by running more processes, not a bigger one.</td><td>Run four poller containers for four sites.</td></tr>
<tr><td>IX</td><td>Disposability</td><td>Start fast, stop gracefully, survive being killed.</td><td>A poller finishes its current device, then exits on SIGTERM.</td></tr>
<tr><td>X</td><td>Dev/prod parity</td><td>Keep dev, staging and prod as similar as possible.</td><td>Same image and same database type in every environment.</td></tr>
<tr><td>XI</td><td>Logs</td><td>Treat logs as a stream of events to stdout.</td><td>Print to the console; the platform collects and ships logs.</td></tr>
<tr><td>XII</td><td>Admin processes</td><td>One-off tasks run in the same environment and code as the app.</td><td>A one-time inventory import runs from the same image.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Build release run and attached resources">
<rect x="15" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="70" y="48" text-anchor="middle" class="svg-ink" font-size="13">Code (Git)</text>
<rect x="170" y="20" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="225" y="48" text-anchor="middle" class="svg-ink" font-size="13">Build</text>
<rect x="325" y="20" width="110" height="46" rx="8" fill="#fde68a"/><text x="380" y="40" text-anchor="middle" class="svg-ink" font-size="13">Release</text><text x="380" y="57" text-anchor="middle" class="svg-muted" font-size="11">build + config</text>
<rect x="480" y="20" width="145" height="46" rx="8" fill="#bbf7d0"/><text x="552" y="48" text-anchor="middle" class="svg-ink" font-size="13">Run (processes)</text>
<line x1="125" y1="43" x2="170" y2="43" stroke="#64748b" stroke-width="2"/><line x1="280" y1="43" x2="325" y2="43" stroke="#64748b" stroke-width="2"/><line x1="435" y1="43" x2="480" y2="43" stroke="#64748b" stroke-width="2"/>
<rect x="325" y="110" width="110" height="40" rx="8" fill="#fed7aa"/><text x="380" y="135" text-anchor="middle" class="svg-ink" font-size="12">Config (env)</text><line x1="380" y1="110" x2="380" y2="66" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="110" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="515" y="135" text-anchor="middle" class="svg-ink" font-size="12">DB</text><rect x="560" y="110" width="65" height="40" rx="8" fill="#e2e8f0"/><text x="592" y="135" text-anchor="middle" class="svg-ink" font-size="12">API</text>
<line x1="515" y1="110" x2="535" y2="66" stroke="#64748b" stroke-width="2"/><line x1="592" y1="110" x2="575" y2="66" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Config and backing services are attached at run time, never baked into code</text>
</svg><p class="cap">Factors III, IV, V and VI in one picture.</p></div>

<h3>Three factors that cause the most trouble</h3>
<p><b>Config (III)</b> is the one tested most. A quick test: could you publish the code publicly right now without leaking a password or an address? If not, config is in the code. <b>Processes (VI)</b>: if the container is deleted and a new one started, nothing important may be lost; keep files and sessions in a volume or database. <b>Logs (XI)</b>: the app never opens log files or manages rotation; it prints events and the platform (<code>docker logs</code>, a log collector) does the rest.</p>
<pre class="code"><span class="c"># Factor III and VII in a few lines of Python</span>
import os
PORT = int(os.environ.get("PORT", "8080"))        <span class="c"># port binding from the environment</span>
CONTROLLER = os.environ["CONTROLLER_ADDR"]         <span class="c"># config, fails loudly if missing</span>
print("starting poller for", CONTROLLER)            <span class="c"># a log event on stdout</span></pre>

<div class="eg"><p><b>Worked example.</b> Your poller reads <code>sites.txt</code> from its own folder and keeps a counter in a global variable. Deploy four copies (factor VIII) and they each hold a different counter (breaks VI) and a stale copy of the file (breaks III and X). The fix: move the site list to a backing service, the counter to a database, and let each container read its site from an environment variable.</p></div>

<div class="warn"><p><b>Common mistake:</b> treating the twelve as laws of Docker. They are habits for the <b>app</b>; containers just make several of them easy.</p></div>
<div class="exam"><p><b>Exam trap:</b> Config is stored in <b>environment variables</b>, not in constants in code or in files committed to the repo. Logs go to <b>stdout</b> as a stream. Scale by adding <b>processes</b> (horizontal), not by a bigger server alone.</p></div>

<div class="scn"><h4>The hard-coded token</h4><p>A developer in Hyderabad committed a script with the controller token inside it. A contractor cloned the repo and the token leaked. The team rotated the token, moved it into an environment variable injected at release time, and added a pipeline check that fails the build when it finds secrets in code.</p><p><b>Lesson:</b> factor III protects you twice: it keeps secrets out of Git and lets the same image run in test and production with different values.</p></div>

<div class="iv"><p class="q">"What is the 12-factor methodology, and which factors matter most for a network automation app?"</p><p>Give one line: twelve guidelines for portable, scalable, cloud-ready services. Then pick: config in the environment, stateless processes, logs to stdout, dependencies declared, and dev/prod parity. Show you understand why each helps deployment and rollback.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know all twelve: codebase, dependencies, config, backing services, build-release-run, processes, port binding, concurrency, disposability, dev/prod parity, logs, admin processes.</li>
<li>Config lives in environment variables; the same build runs everywhere.</li>
<li>Processes are stateless; state goes to backing services.</li>
<li>Logs are an event stream on stdout.</li>
</ul></div>
`,hi:`
<p>Ek food truck socho jo aise design hua hai ki kisi bhi sheher mein khada ho sake, minutes mein restart ho, aur tyohaar ke din dus trucks mein copy ho jaye. Uski recipe book ek jagah hai, ingredients listed hain, gas aur paani ke connections plug-in hain, aur truck ke andar koi keemti cheez nahi rakhi jo badalne par kho jaye. <b>12-factor app</b> barah aadaton ka set hai jo software ko us truck jaisa banata hai. Yeh web services ke liye likha gaya tha, lekin idea har automation app par fit baithte hain jo aap deploy karte ho, aur blueprint item 4.4 chahta hai ki aap saare barah aasaan shabdon mein jaano.</p>

<h3>Barah factors</h3>
<table class="cmp"><tr><th>#</th><th>Factor</th><th>Aasaan matlab</th><th>Network example</th></tr>
<tr><td>I</td><td>Codebase</td><td>Version control mein ek codebase, uske kai deploys.</td><td>Config-backup tool ka ek Git repo, test aur prod mein deploy.</td></tr>
<tr><td>II</td><td>Dependencies</td><td>Har library explicitly declare karo aur isolate karo.</td><td>Requirements file mein netmiko aur pyyaml versions ke saath.</td></tr>
<tr><td>III</td><td>Config</td><td>Jo deploys ke beech badalta hai woh environment mein, code mein nahi.</td><td>Controller address aur token environment variables se aate hain.</td></tr>
<tr><td>IV</td><td>Backing services</td><td>Databases, queues, APIs attached resources hain, URL badal kar swap ho jaate hain.</td><td>Ek setting badal kar inventory database badlo.</td></tr>
<tr><td>V</td><td>Build, release, run</td><td>Teen alag, strictly separate stages.</td><td>Image build, config ke saath milao, phir chalao.</td></tr>
<tr><td>VI</td><td>Processes</td><td>App stateless hai; state backing service mein rehti hai.</td><td>Poll results database mein likhe jaate hain, memory mein nahi.</td></tr>
<tr><td>VII</td><td>Port binding</td><td>App khud ek port par sun kar apni service export karti hai.</td><td>REST service environment se mile port par sunti hai.</td></tr>
<tr><td>VIII</td><td>Concurrency</td><td>Zyada processes chalao, bada process nahi.</td><td>Chaar sites ke liye chaar poller containers.</td></tr>
<tr><td>IX</td><td>Disposability</td><td>Tez start, graceful stop, kill hone par bhi survive.</td><td>Poller SIGTERM par current device khatam karke exit hota hai.</td></tr>
<tr><td>X</td><td>Dev/prod parity</td><td>Dev, staging aur prod ko jitna ho sake similar rakho.</td><td>Har environment mein same image aur same database type.</td></tr>
<tr><td>XI</td><td>Logs</td><td>Logs ko stdout par events ki stream maano.</td><td>Console par print karo; platform logs collect aur ship karta hai.</td></tr>
<tr><td>XII</td><td>Admin processes</td><td>One-off tasks wahi environment aur code mein chalte hain.</td><td>Ek baar ka inventory import wahi image se chalta hai.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Build release run aur attached resources">
<rect x="15" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="70" y="48" text-anchor="middle" class="svg-ink" font-size="13">Code (Git)</text>
<rect x="170" y="20" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="225" y="48" text-anchor="middle" class="svg-ink" font-size="13">Build</text>
<rect x="325" y="20" width="110" height="46" rx="8" fill="#fde68a"/><text x="380" y="40" text-anchor="middle" class="svg-ink" font-size="13">Release</text><text x="380" y="57" text-anchor="middle" class="svg-muted" font-size="11">build + config</text>
<rect x="480" y="20" width="145" height="46" rx="8" fill="#bbf7d0"/><text x="552" y="48" text-anchor="middle" class="svg-ink" font-size="13">Run (processes)</text>
<line x1="125" y1="43" x2="170" y2="43" stroke="#64748b" stroke-width="2"/><line x1="280" y1="43" x2="325" y2="43" stroke="#64748b" stroke-width="2"/><line x1="435" y1="43" x2="480" y2="43" stroke="#64748b" stroke-width="2"/>
<rect x="325" y="110" width="110" height="40" rx="8" fill="#fed7aa"/><text x="380" y="135" text-anchor="middle" class="svg-ink" font-size="12">Config (env)</text><line x1="380" y1="110" x2="380" y2="66" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="110" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="515" y="135" text-anchor="middle" class="svg-ink" font-size="12">DB</text><rect x="560" y="110" width="65" height="40" rx="8" fill="#e2e8f0"/><text x="592" y="135" text-anchor="middle" class="svg-ink" font-size="12">API</text>
<line x1="515" y1="110" x2="535" y2="66" stroke="#64748b" stroke-width="2"/><line x1="592" y1="110" x2="575" y2="66" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Config aur backing services run time par attach hote hain, code mein bake nahi</text>
</svg><p class="cap">Factors III, IV, V aur VI ek tasveer mein.</p></div>

<h3>Teen factors jo sabse zyada dikkat dete hain</h3>
<p><b>Config (III)</b> sabse zyada poocha jaata hai. Quick test: kya aap abhi code public kar sakte ho bina password ya address leak kiye? Agar nahi, to config code mein hai. <b>Processes (VI)</b>: container delete ho kar naya start ho to koi zaroori cheez khoni nahi chahiye; files aur sessions volume ya database mein rakho. <b>Logs (XI)</b>: app kabhi log files nahi kholti na rotation sambhalti hai; woh events print karti hai aur platform (<code>docker logs</code>, log collector) baaki sambhalta hai.</p>
<pre class="code"><span class="c"># Factor III aur VII kuch lines Python mein</span>
import os
PORT = int(os.environ.get("PORT", "8080"))        <span class="c"># port binding environment se</span>
CONTROLLER = os.environ["CONTROLLER_ADDR"]         <span class="c"># config, missing ho to zor se fail</span>
print("starting poller for", CONTROLLER)            <span class="c"># stdout par ek log event</span></pre>

<div class="eg"><p><b>Worked example.</b> Aapka poller apne folder se <code>sites.txt</code> padhta hai aur ek global variable mein counter rakhta hai. Chaar copies deploy karo (factor VIII) to har ek ka counter alag (VI toota) aur file ki purani copy (III aur X toote). Fix: site list backing service mein, counter database mein, aur har container apni site environment variable se padhe.</p></div>

<div class="warn"><p><b>Common mistake:</b> barah factors ko Docker ke kanoon samajhna. Yeh <b>app</b> ki aadatein hain; containers inme se kai ko aasaan bana dete hain.</p></div>
<div class="exam"><p><b>Exam trap:</b> Config <b>environment variables</b> mein hoti hai, code ke constants mein ya repo mein commit ki gayi files mein nahi. Logs <b>stdout</b> par stream ki tarah jaate hain. <b>Processes</b> badhakar scale karo (horizontal), sirf bade server se nahi.</p></div>

<div class="scn"><h4>Hard-coded token</h4><p>Hyderabad ke ek developer ne controller token script ke andar rakh kar commit kar diya. Ek contractor ne repo clone kiya aur token leak ho gaya. Team ne token rotate kiya, use release time par inject hone wale environment variable mein daala, aur pipeline mein check jodi jo code mein secrets milne par build fail kare.</p><p><b>Lesson:</b> factor III do baar bachata hai: secrets ko Git se bahar rakhta hai aur same image ko test aur production mein alag values ke saath chalne deta hai.</p></div>

<div class="iv"><p class="q">"12-factor methodology kya hai, aur network automation app ke liye kaunse factors sabse zaroori hain?"</p><p>Ek line: portable, scalable, cloud-ready services ke barah guidelines. Phir chuno: environment mein config, stateless processes, stdout par logs, declared dependencies, aur dev/prod parity. Dikhao ki har ek deployment aur rollback mein kaise madad karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Saare barah jaano: codebase, dependencies, config, backing services, build-release-run, processes, port binding, concurrency, disposability, dev/prod parity, logs, admin processes.</li>
<li>Config environment variables mein; same build har jagah chalta hai.</li>
<li>Processes stateless; state backing services mein.</li>
<li>Logs stdout par events ki stream.</li>
</ul></div>
`}};export{e as default};