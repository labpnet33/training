var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now start, inspect and troubleshoot containers, and read a compose file the way a manager reads a seating plan. This chapter is the one-page review: can-do checklist, glossary, most-tested facts and a command cheat sheet. Commands run in the simulator are marked; everything else is reference. To keep practising, use the virtualization module (ccna-virtualization has docker run with port mapping), then auto-git, auto-cicd, auto-ansible and auto-ssh for the surrounding workflow.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Containers module map">
<rect x="10" y="40" width="100" height="60" rx="10" fill="#bae6fd"/><text x="60" y="66" text-anchor="middle" class="svg-ink" font-size="12">image</text><text x="60" y="84" text-anchor="middle" class="svg-muted" font-size="11">recipe</text>
<rect x="125" y="40" width="100" height="60" rx="10" fill="#fde68a"/><text x="175" y="66" text-anchor="middle" class="svg-ink" font-size="12">container</text><text x="175" y="84" text-anchor="middle" class="svg-muted" font-size="11">run, stop, rm</text>
<rect x="240" y="40" width="100" height="60" rx="10" fill="#ddd6fe"/><text x="290" y="66" text-anchor="middle" class="svg-ink" font-size="12">ports</text><text x="290" y="84" text-anchor="middle" class="svg-muted" font-size="11">-p host:cont</text>
<rect x="355" y="40" width="100" height="60" rx="10" fill="#fed7aa"/><text x="405" y="66" text-anchor="middle" class="svg-ink" font-size="12">network</text><text x="405" y="84" text-anchor="middle" class="svg-muted" font-size="11">bridge, names</text>
<rect x="470" y="40" width="160" height="60" rx="10" fill="#bbf7d0"/><text x="550" y="66" text-anchor="middle" class="svg-ink" font-size="12">volumes, compose</text><text x="550" y="84" text-anchor="middle" class="svg-muted" font-size="11">keep data, one file</text>
<line x1="110" y1="70" x2="125" y2="70" stroke="#64748b" stroke-width="2"/><line x1="225" y1="70" x2="240" y2="70" stroke="#64748b" stroke-width="2"/><line x1="340" y1="70" x2="355" y2="70" stroke="#64748b" stroke-width="2"/><line x1="455" y1="70" x2="470" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The module on one line.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain a container against a VM, and image against container.</li>
<li>Start a container with docker run -d --name and read docker ps and docker images.</li>
<li>Publish a port with -p HOST:CONTAINER and read 0.0.0.0:8080-&gt;80/tcp.</li>
<li>Use docker inspect to find state, IP address and port mappings.</li>
<li>Stop, start and remove containers; use docker ps -a to find stopped ones.</li>
<li>Describe the default bridge network, host and none, and user-defined networks with name resolution.</li>
<li>Keep data with volumes and pass settings with environment variables, never secrets in images.</li>
<li>Write and read a basic Dockerfile and a compose file with services, ports, volumes and healthcheck.</li>
<li>Troubleshoot with state, configuration, reachability and output.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Image</dt><dd>Read-only template of an application and its dependencies.</dd>
<dt>Container</dt><dd>A running or stopped instance of an image.</dd>
<dt>Registry</dt><dd>Store of images; images are pulled and pushed.</dd>
<dt>Tag</dt><dd>Version label of an image, as in name:tag.</dd>
<dt>Port mapping</dt><dd>Publishing a container port on a host port with -p.</dd>
<dt>Bridge</dt><dd>Default private virtual network with NAT.</dd>
<dt>Volume</dt><dd>Storage that outlives a container.</dd>
<dt>Dockerfile</dt><dd>Recipe of instructions that builds an image.</dd>
<dt>Compose</dt><dd>Tool and YAML file that runs several services together.</dd>
<dt>Healthcheck</dt><dd>A command that tells the engine whether a service is ready.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>Containers share the host kernel; VMs carry their own guest OS.</li>
<li>One image can start many containers; names must be unique.</li>
<li>-p HOST:CONTAINER, host first; port already allocated refers to the host port.</li>
<li>docker ps shows running only; docker ps -a shows all; a container must be stopped before rm.</li>
<li>Default bridge in the simulator is 172.17.0.0/16 with gateway 172.17.0.1.</li>
<li>The writable layer is lost on rm; volumes survive.</li>
<li>Services in compose reach each other by service name; ports exposes outside the host.</li>
<li>Secrets never go in images or Git; pin image tags instead of latest.</li>
</ul>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c"># works in the simulator on a server host</span>
docker run -d --name web -p 8080:80 nginx
docker ps
docker ps -a
docker images
docker inspect web
docker network ls
docker stop web
docker start web
docker rm web

<span class="c"># Reference configuration (not run in the simulator)</span>
docker logs web
docker exec -it web sh
docker volume create results
docker build -t net-tests:1.0 .
docker compose up -d
docker compose down</pre>

<div class="eg"><p><b>Worked example.</b> Interview: "Walk me through packaging a network test tool." Answer: write a Dockerfile with a pinned Python base and dependency install, build and tag the image, run it with --rm, pass credentials as environment variables from the secret store, mount a volume for reports, and describe the runner, a database and a dashboard in a compose file so every engineer and the pipeline run the same stack.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Treating containers as permanent servers. Design for replacement: rebuild from the image, keep data on volumes, keep configuration outside the image.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do not confuse the container port with the host port, an image with a container, or "started" with "ready". And remember that compose down keeps named volumes unless told to remove them.</p></div>

<div class="scn"><h4>The toolset that moved with the team</h4><p>When two engineers left and three joined, Deccan Net's automation environment moved with the repository: one compose file, one Dockerfile, an env file template and a README. New joiners ran one command and had the runner, database and dashboard working in minutes, with the same pinned versions as the pipeline.</p><p><b>Lesson:</b> package the environment, not just the scripts.</p></div>

<div class="iv"><p class="q">"Summarise how containers help network automation."</p><p>They package scripts and dependencies into an image that runs the same on a laptop, a server and a pipeline, start in seconds and are disposable. Compose describes multi-tool setups as one reviewable file, volumes keep results, and published ports expose only what is needed. Mention pinned tags, non-root users and secrets injected at run time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Image is the recipe, container is the instance, volume keeps data.</li>
<li>Publish ports deliberately; use networks and names between containers.</li>
<li>Compose describes the whole toolset; pin tags and keep secrets out.</li>
<li>Troubleshoot in order: state, configuration, reachability, output.</li>
<li>Keep practising in ccna-virtualization, auto-git, auto-cicd, auto-ansible and auto-ssh.</li>
</ul></div>
`,hi:`
<p>Ab aap containers start, inspect aur troubleshoot kar sakte ho, aur compose file ko waise padh sakte ho jaise manager seating plan padhta hai. Yeh chapter ek page ka review hai: can-do checklist, glossary, sabse zyada pooche jaane wale facts aur command cheat sheet. Simulator mein chalne wale commands marked hain; baaki sab reference hai. Practice jaari rakhne ke liye virtualization module (ccna-virtualization mein port mapping ke saath docker run hai) use karo, phir aas-paas ke workflow ke liye auto-git, auto-cicd, auto-ansible aur auto-ssh.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Containers module map">
<rect x="10" y="40" width="100" height="60" rx="10" fill="#bae6fd"/><text x="60" y="66" text-anchor="middle" class="svg-ink" font-size="12">image</text><text x="60" y="84" text-anchor="middle" class="svg-muted" font-size="11">recipe</text>
<rect x="125" y="40" width="100" height="60" rx="10" fill="#fde68a"/><text x="175" y="66" text-anchor="middle" class="svg-ink" font-size="12">container</text><text x="175" y="84" text-anchor="middle" class="svg-muted" font-size="11">run, stop, rm</text>
<rect x="240" y="40" width="100" height="60" rx="10" fill="#ddd6fe"/><text x="290" y="66" text-anchor="middle" class="svg-ink" font-size="12">ports</text><text x="290" y="84" text-anchor="middle" class="svg-muted" font-size="11">-p host:cont</text>
<rect x="355" y="40" width="100" height="60" rx="10" fill="#fed7aa"/><text x="405" y="66" text-anchor="middle" class="svg-ink" font-size="12">network</text><text x="405" y="84" text-anchor="middle" class="svg-muted" font-size="11">bridge, names</text>
<rect x="470" y="40" width="160" height="60" rx="10" fill="#bbf7d0"/><text x="550" y="66" text-anchor="middle" class="svg-ink" font-size="12">volumes, compose</text><text x="550" y="84" text-anchor="middle" class="svg-muted" font-size="11">data bachao, ek file</text>
<line x1="110" y1="70" x2="125" y2="70" stroke="#64748b" stroke-width="2"/><line x1="225" y1="70" x2="240" y2="70" stroke="#64748b" stroke-width="2"/><line x1="340" y1="70" x2="355" y2="70" stroke="#64748b" stroke-width="2"/><line x1="455" y1="70" x2="470" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Module ek line mein.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Container ko VM se, aur image ko container se compare karke samjhao.</li>
<li>docker run -d --name se container start karo aur docker ps aur docker images padho.</li>
<li>-p HOST:CONTAINER se port publish karo aur 0.0.0.0:8080-&gt;80/tcp padho.</li>
<li>docker inspect se state, IP address aur port mappings dhoondho.</li>
<li>Containers stop, start aur remove karo; stopped wale dhoondhne ke liye docker ps -a use karo.</li>
<li>Default bridge network, host aur none, aur name resolution wale user-defined networks describe karo.</li>
<li>Volumes se data rakho aur environment variables se settings do, images mein kabhi secrets nahi.</li>
<li>Basic Dockerfile aur services, ports, volumes aur healthcheck wali compose file likho aur padho.</li>
<li>State, configuration, reachability aur output se troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Image</dt><dd>Application aur uski dependencies ka read-only template.</dd>
<dt>Container</dt><dd>Image ka running ya stopped instance.</dd>
<dt>Registry</dt><dd>Images ka store; images pull aur push hoti hain.</dd>
<dt>Tag</dt><dd>Image ka version label, name:tag jaise.</dd>
<dt>Port mapping</dt><dd>Container port ko -p se host port par publish karna.</dd>
<dt>Bridge</dt><dd>NAT wala default private virtual network.</dd>
<dt>Volume</dt><dd>Storage jo container se zyada jeeta hai.</dd>
<dt>Dockerfile</dt><dd>Instructions ki recipe jo image banati hai.</dd>
<dt>Compose</dt><dd>Tool aur YAML file jo kai services ko saath chalati hai.</dd>
<dt>Healthcheck</dt><dd>Command jo engine ko batata hai service ready hai ya nahi.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li>Containers host kernel share karte hain; VMs apna guest OS rakhte hain.</li>
<li>Ek image se kai containers start ho sakte hain; naam unique hone chahiye.</li>
<li>-p HOST:CONTAINER, pehle host; port already allocated host port ke baare mein hai.</li>
<li>docker ps sirf running dikhata hai; docker ps -a sab; rm se pehle container stop hona chahiye.</li>
<li>Simulator mein default bridge 172.17.0.0/16 hai, gateway 172.17.0.1.</li>
<li>Writable layer rm par jaati hai; volumes bachte hain.</li>
<li>Compose mein services ek-doosre tak service name se pahunchti hain; ports host ke bahar expose karta hai.</li>
<li>Secrets images ya Git mein kabhi nahi; latest ki jagah image tags pin karo.</li>
</ul>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c"># simulator mein server host par chalta hai</span>
docker run -d --name web -p 8080:80 nginx
docker ps
docker ps -a
docker images
docker inspect web
docker network ls
docker stop web
docker start web
docker rm web

<span class="c"># Reference configuration (simulator mein run nahi hua)</span>
docker logs web
docker exec -it web sh
docker volume create results
docker build -t net-tests:1.0 .
docker compose up -d
docker compose down</pre>

<div class="eg"><p><b>Worked example.</b> Interview: "Network test tool ko package karne ka process batao." Jawab: pinned Python base aur dependency install wala Dockerfile likho, image build aur tag karo, --rm ke saath chalao, credentials secret store se environment variables ke roop mein do, reports ke liye volume mount karo, aur runner, database aur dashboard ko compose file mein describe karo taaki har engineer aur pipeline wahi stack chalayein.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Containers ko permanent servers ki tarah treat karna. Replacement ke liye design karo: image se rebuild karo, data volumes par rakho, configuration image ke bahar rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Container port ko host port se, image ko container se, ya "started" ko "ready" se confuse mat karo. Aur yaad rakho compose down named volumes rakhta hai jab tak hatane ko na kaha jaaye.</p></div>

<div class="scn"><h4>Toolset jo team ke saath chala</h4><p>Jab do engineers gaye aur teen aaye, Deccan Net ka automation environment repository ke saath chala: ek compose file, ek Dockerfile, env file template aur README. Naye logon ne ek command chalayi aur minutes mein runner, database aur dashboard pipeline jaise pinned versions ke saath chalne lage.</p><p><b>Lesson:</b> sirf scripts nahi, environment package karo.</p></div>

<div class="iv"><p class="q">"Containers network automation mein kaise madad karte hain, summarise karo."</p><p>Woh scripts aur dependencies ko aisi image mein package karte hain jo laptop, server aur pipeline par ek jaisi chalti hai, seconds mein start hoti hai aur disposable hai. Compose multi-tool setups ko ek reviewable file ke roop mein describe karta hai, volumes results rakhte hain, aur published ports sirf zaroori cheez expose karte hain. Pinned tags, non-root users aur run time par inject hue secrets ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Image recipe hai, container instance hai, volume data rakhta hai.</li>
<li>Ports soch-samajhkar publish karo; containers ke beech networks aur names use karo.</li>
<li>Compose poora toolset describe karta hai; tags pin karo aur secrets bahar rakho.</li>
<li>Order mein troubleshoot karo: state, configuration, reachability, output.</li>
<li>Practice jaari rakho ccna-virtualization, auto-git, auto-cicd, auto-ansible aur auto-ssh mein.</li>
</ul></div>
`}};export{e as default};