var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>A pilot runs a checklist before every flight, not because she forgets how to fly but because a checklist catches what memory misses. Use this chapter the same way the night before your 200-901 exam: go through every line and be honest about which ones you could explain to a colleague.</p>

<h3>I can do this (blueprint checklist)</h3>
<ul>
<li><b>4.1</b> Diagnose a failing deployment: <code>docker ps -a</code> for status, logs for the reason, the PORTS column and <code>docker inspect</code> for ports, environment variables for config, then network dependencies.</li>
<li><b>4.2</b> Explain CI, continuous delivery and continuous deployment; name stages (build, test, deploy); explain artifacts and build-once; read a pipeline file.</li>
<li><b>4.3</b> Compare bare metal, VMs, containers, serverless and edge; place workloads on-prem, public, private or hybrid cloud.</li>
<li><b>4.4</b> List the twelve factors and give a network example for each.</li>
<li><b>4.5</b> Define CALMS, infrastructure as code (declarative, idempotent), immutable infrastructure, blue/green, canary, rolling and rollback.</li>
<li><b>4.6</b> Write and read Docker commands: images versus containers, tags, registries, ports, volumes, <code>ps</code>, <code>logs</code>, <code>exec</code>.</li>
<li><b>4.7</b> Write a Dockerfile for a Python app and build and run it.</li>
<li><b>4.8</b> Describe dev, test, staging and prod, and pass configuration with environment variables.</li>
</ul>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Containers vs VMs</td><td>Containers share the host kernel; VMs have their own guest OS and a hypervisor.</td></tr>
<tr><td>Serverless</td><td>You run functions; the provider runs servers; billed per execution.</td></tr>
<tr><td>CI vs CD</td><td>CI = build and test every change. Delivery = manual approval; deployment = automatic.</td></tr>
<tr><td>Twelve-factor config</td><td>Config in environment variables; never in code.</td></tr>
<tr><td>Twelve-factor logs</td><td>Event stream to stdout; platform handles storage.</td></tr>
<tr><td>Immutable</td><td>Replace, never modify; new version = new image.</td></tr>
<tr><td>Blue/green vs canary</td><td>Two environments and a switch, versus a small percentage first.</td></tr>
<tr><td>Port mapping</td><td><code>-p HOST:CONTAINER</code>; host ports are unique per host.</td></tr>
<tr><td>RUN vs CMD</td><td>RUN at build time; CMD at container start.</td></tr>
<tr><td>EXPOSE vs -p</td><td>EXPOSE documents; <code>-p</code> publishes.</td></tr>
<tr><td>Staging</td><td>The closest rehearsal of production.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="20" width="190" height="60" rx="8" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">Package</text><text x="105" y="65" text-anchor="middle" class="svg-muted" font-size="11">Dockerfile, image, tag</text>
<rect x="225" y="20" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Ship</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="11">pipeline, artifact, registry</text>
<rect x="440" y="20" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="13">Run</text><text x="535" y="65" text-anchor="middle" class="svg-muted" font-size="11">environment, config, ports</text>
<line x1="200" y1="50" x2="225" y2="50" stroke="#64748b" stroke-width="2"/><line x1="415" y1="50" x2="440" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="120" y="105" width="400" height="40" rx="8" fill="#fed7aa"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">Observe and fix: status, logs, ports; release safely; roll back</text>
</svg><p class="cap">The whole module in one picture: package, ship, run, observe.</p></div>

<h3>Command cheat-sheet</h3>
<pre class="code">docker run -d --name NAME -p HOST:CONT [-e KEY=VAL] IMAGE[:TAG]
docker ps            docker ps -a
docker stop NAME     docker start NAME     docker rm NAME
docker images        docker inspect NAME
<span class="c"># reference only (not run in the simulator)</span>
docker logs [-f] NAME      docker exec -it NAME sh
docker build -t NAME:TAG .      docker push REGISTRY/NAME:TAG
docker volume create VOL        docker run -v VOL:/path IMAGE</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Artifact</dt><dd>The packaged output of a build, such as an image.</dd>
<dt>Canary</dt><dd>Releasing to a small share of users first.</dd>
<dt>Drift</dt><dd>Servers slowly becoming different through manual changes.</dd>
<dt>Idempotent</dt><dd>Running again gives the same result.</dd>
<dt>Layer</dt><dd>One cached step of an image build.</dd>
<dt>Registry</dt><dd>A store for images.</dd>
<dt>Rollback</dt><dd>Returning to the last known good version.</dd>
<dt>Runner</dt><dd>The machine that executes pipeline jobs.</dd>
</dl>

<div class="eg"><p><b>Self-test.</b> Without looking back: a new automation tool must run in test and prod with different controller addresses, update with no downtime, and be undoable in a minute. Answer: one image with a version tag, built once in a pipeline; controller address as an environment variable; blue/green or canary release; rollback by redeploying the previous tag.</p></div>

<div class="warn"><p><b>Last-day mistakes:</b> mixing up the host and container port in <code>-p</code>; confusing continuous delivery and deployment; forgetting that EXPOSE does not publish; thinking containers have their own kernel.</p></div>
<div class="exam"><p><b>Exam trap:</b> questions often describe a symptom and ask for the <b>first</b> thing to check. Think status, then logs, then ports. Questions on environments want you to keep the <b>same artifact</b> and vary only configuration.</p></div>

<div class="scn"><h4>The interview that went well</h4><p>Asked to "deploy a Python tool safely", a candidate in Gurugram described: a Dockerfile with a pinned base image, a pipeline building once and tagging by commit, configuration through environment variables, a canary release with a rollback trigger, and <code>docker ps</code>, logs and ports as the first diagnostic steps. She got the offer.</p><p><b>Lesson:</b> a connected story beats a list of definitions.</p></div>

<div class="iv"><p class="q">"Summarise how you would take a script from your laptop to production."</p><p>Containerise it with a Dockerfile, store config in environment variables, build once in a CI pipeline and push a tagged image, promote through staging, release with canary or blue/green, watch logs and status, and roll back to the previous tag if needed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Package (Docker), ship (CI/CD), run (environments and config), observe (logs, status, ports).</li>
<li>Know the twelve factors, CALMS, and the release strategies by name and by purpose.</li>
<li>Know the Docker commands and the Dockerfile instructions precisely.</li>
<li>Practise the two labs until the diagnosis routine feels automatic.</li>
</ul></div>
`,hi:`
<p>Pilot har flight se pehle checklist chalata hai, isliye nahi ki use udna bhool gaya, balki isliye ki checklist woh pakadti hai jo yaadasht chhod deti hai. Is chapter ko 200-901 exam se pehli raat isi tarah use karo: har line se guzro aur imaandari se batao ki kaunsi aap colleague ko samjha sakte ho.</p>

<h3>Main yeh kar sakta hoon (blueprint checklist)</h3>
<ul>
<li><b>4.1</b> Failing deployment diagnose karo: status ke liye <code>docker ps -a</code>, wajah ke liye logs, ports ke liye PORTS column aur <code>docker inspect</code>, config ke liye environment variables, phir network dependencies.</li>
<li><b>4.2</b> CI, continuous delivery aur continuous deployment samjhao; stages (build, test, deploy) batao; artifacts aur build-once samjhao; pipeline file padho.</li>
<li><b>4.3</b> Bare metal, VMs, containers, serverless aur edge compare karo; workloads ko on-prem, public, private ya hybrid cloud mein rakho.</li>
<li><b>4.4</b> Barah factors list karo aur har ek ka network example do.</li>
<li><b>4.5</b> CALMS, infrastructure as code (declarative, idempotent), immutable infrastructure, blue/green, canary, rolling aur rollback define karo.</li>
<li><b>4.6</b> Docker commands likho aur padho: images versus containers, tags, registries, ports, volumes, <code>ps</code>, <code>logs</code>, <code>exec</code>.</li>
<li><b>4.7</b> Python app ke liye Dockerfile likho aur build aur run karo.</li>
<li><b>4.8</b> Dev, test, staging aur prod batao, aur environment variables se configuration pass karo.</li>
</ul>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Containers vs VMs</td><td>Containers host kernel share karte hain; VMs ka apna guest OS aur hypervisor hota hai.</td></tr>
<tr><td>Serverless</td><td>Aap functions chalate ho; provider servers; per execution bill.</td></tr>
<tr><td>CI vs CD</td><td>CI = har change build aur test. Delivery = manual approval; deployment = automatic.</td></tr>
<tr><td>Twelve-factor config</td><td>Config environment variables mein; code mein kabhi nahi.</td></tr>
<tr><td>Twelve-factor logs</td><td>stdout par event stream; storage platform sambhalta hai.</td></tr>
<tr><td>Immutable</td><td>Replace karo, modify nahi; naya version = nayi image.</td></tr>
<tr><td>Blue/green vs canary</td><td>Do environments aur switch, versus pehle chhota percentage.</td></tr>
<tr><td>Port mapping</td><td><code>-p HOST:CONTAINER</code>; host ports har host par unique.</td></tr>
<tr><td>RUN vs CMD</td><td>RUN build time par; CMD container start par.</td></tr>
<tr><td>EXPOSE vs -p</td><td>EXPOSE document karta hai; <code>-p</code> publish karta hai.</td></tr>
<tr><td>Staging</td><td>Production ka sabse nazdeeki rehearsal.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module ka naksha">
<rect x="10" y="20" width="190" height="60" rx="8" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">Package</text><text x="105" y="65" text-anchor="middle" class="svg-muted" font-size="11">Dockerfile, image, tag</text>
<rect x="225" y="20" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Ship</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="11">pipeline, artifact, registry</text>
<rect x="440" y="20" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="13">Run</text><text x="535" y="65" text-anchor="middle" class="svg-muted" font-size="11">environment, config, ports</text>
<line x1="200" y1="50" x2="225" y2="50" stroke="#64748b" stroke-width="2"/><line x1="415" y1="50" x2="440" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="120" y="105" width="400" height="40" rx="8" fill="#fed7aa"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">Observe aur fix: status, logs, ports; safe release; rollback</text>
</svg><p class="cap">Poora module ek tasveer mein: package, ship, run, observe.</p></div>

<h3>Command cheat-sheet</h3>
<pre class="code">docker run -d --name NAME -p HOST:CONT [-e KEY=VAL] IMAGE[:TAG]
docker ps            docker ps -a
docker stop NAME     docker start NAME     docker rm NAME
docker images        docker inspect NAME
<span class="c"># sirf reference (simulator mein nahi chalte)</span>
docker logs [-f] NAME      docker exec -it NAME sh
docker build -t NAME:TAG .      docker push REGISTRY/NAME:TAG
docker volume create VOL        docker run -v VOL:/path IMAGE</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Artifact</dt><dd>Build ka packaged output, jaise image.</dd>
<dt>Canary</dt><dd>Pehle users ke chhote hisse ko release karna.</dd>
<dt>Drift</dt><dd>Manual changes se servers ka dheere dheere alag ho jaana.</dd>
<dt>Idempotent</dt><dd>Dobara chalane par wahi result.</dd>
<dt>Layer</dt><dd>Image build ka ek cached step.</dd>
<dt>Registry</dt><dd>Images ka store.</dd>
<dt>Rollback</dt><dd>Last known good version par wapas.</dd>
<dt>Runner</dt><dd>Woh machine jo pipeline jobs execute karti hai.</dd>
</dl>

<div class="eg"><p><b>Self-test.</b> Peeche dekhe bina: ek naye automation tool ko test aur prod mein alag controller addresses ke saath chalna hai, bina downtime ke update hona hai, aur ek minute mein undo ho sakna chahiye. Jawab: version tag wali ek image, pipeline mein ek baar build; controller address environment variable; blue/green ya canary release; pichla tag dobara deploy karke rollback.</p></div>

<div class="warn"><p><b>Aakhri din ki galtiyan:</b> <code>-p</code> mein host aur container port mix karna; continuous delivery aur deployment confuse karna; yeh bhoolna ki EXPOSE publish nahi karta; containers ka apna kernel samajhna.</p></div>
<div class="exam"><p><b>Exam trap:</b> questions aksar symptom batate hain aur <b>pehli</b> cheez check karne ko poochte hain. Socho: status, phir logs, phir ports. Environments ke questions chahte hain ki <b>same artifact</b> rakho aur sirf configuration badlo.</p></div>

<div class="scn"><h4>Achha gaya interview</h4><p>"Python tool ko safely deploy karo" poochne par Gurugram ki ek candidate ne bataya: pinned base image wala Dockerfile, ek baar build karke commit se tag karti pipeline, environment variables se configuration, rollback trigger ke saath canary release, aur <code>docker ps</code>, logs aur ports pehle diagnostic steps. Use offer mila.</p><p><b>Lesson:</b> jodi hui kahani definitions ki list se behtar hoti hai.</p></div>

<div class="iv"><p class="q">"Laptop se production tak script kaise le jaoge, summary do."</p><p>Dockerfile se containerise, config environment variables mein, CI pipeline mein ek baar build aur tagged image push, staging se promote, canary ya blue/green se release, logs aur status dekho, zaroorat par pichle tag par rollback.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Package (Docker), ship (CI/CD), run (environments aur config), observe (logs, status, ports).</li>
<li>Barah factors, CALMS aur release strategies naam aur maksad se jaano.</li>
<li>Docker commands aur Dockerfile instructions ekdam sahi jaano.</li>
<li>Dono labs ki practice karo jab tak diagnosis routine automatic na lage.</li>
</ul></div>
`}};export{e as default};