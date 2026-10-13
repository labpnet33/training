var e={id:`overview`,h:{en:`Containers for automation tools: what you will learn and the big picture`,hi:`Automation tools ke liye containers: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn what a container is and why automation teams use them, how to start, stop and inspect containers with <code>docker</code>, how ports and networks connect them, how data survives with volumes, and how a <b>Docker Compose</b> file describes a whole toolset (a script runner, a web dashboard and a database) in one readable file. This is the "containers and application deployment" part of the CCNP Automation (350-901 AUTOCOR) blueprint.</p>
<p><b>Prerequisites.</b> You should know what an IP address and a TCP port are, and be able to use a command line. You do not need any Docker experience. Every command and every file line is explained.</p>

<div class="note"><p><b>How to practise this module.</b> The NK-OS simulator has a small container engine on its server hosts that understands <code>docker ps</code>, <code>run</code>, <code>stop</code>, <code>start</code>, <code>rm</code>, <code>images</code>, <code>network ls</code> and <code>inspect</code>. The outputs labelled "captured from the simulator" in chapters 2 to 5 and 8 were produced by that engine. It does not run docker compose, volumes, builds or logs, and this module has no labs of its own, so Compose files and the other commands are labelled <b>Reference configuration (not run in the simulator)</b>. For the surrounding skills practise in the virtualization module (ccna-virtualization teaches docker run with port mapping), auto-git, auto-cicd (building and running containers in a pipeline), auto-ansible and auto-ssh.</p></div>

<h3>Analogy: the shipping container</h3>
<p>Before standard shipping containers, every cargo was loaded differently: sacks, barrels, crates. Ports needed special cranes for each. Then came the steel box of one standard size. It does not matter what is inside; every ship, train and crane can handle the box. A software <b>container</b> is the same idea. You pack an application together with exactly the libraries and settings it needs. Any computer with a container engine can run that box, and it behaves the same everywhere.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Host with containers">
<rect x="20" y="20" width="600" height="165" rx="12" fill="#e2e8f0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">One host (laptop, server, VM) with a container engine</text>
<rect x="45" y="60" width="150" height="85" rx="10" fill="#bae6fd"/><text x="120" y="88" text-anchor="middle" class="svg-ink" font-size="13">Container 1</text><text x="120" y="108" text-anchor="middle" class="svg-muted" font-size="12">Python + scripts</text>
<rect x="245" y="60" width="150" height="85" rx="10" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">Container 2</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">web dashboard</text>
<rect x="445" y="60" width="150" height="85" rx="10" fill="#bbf7d0"/><text x="520" y="88" text-anchor="middle" class="svg-ink" font-size="13">Container 3</text><text x="520" y="108" text-anchor="middle" class="svg-muted" font-size="12">database</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">each is isolated, all share the host operating system kernel</text>
</svg><p class="cap">Isolated boxes on one host, sharing the kernel.</p></div>

<h3>Why network automation teams care</h3>
<ul>
<li><b>"Works on my laptop" disappears.</b> The Python version, libraries and tools are inside the image, identical for every engineer and for the pipeline.</li>
<li><b>Fast and disposable.</b> A container starts in seconds and is deleted when finished, which suits a CI job that runs your tests (module auto-testing).</li>
<li><b>Packaged toolsets.</b> Network automation platforms, simulators and monitoring stacks are published as images, so installing one is a single command.</li>
<li><b>Controlled.</b> The same image tag is promoted from test to production.</li>
</ul>

<h3>Container versus virtual machine</h3>
<table class="cmp"><tr><th></th><th>Virtual machine</th><th>Container</th></tr>
<tr><td>Contains</td><td>a full guest operating system</td><td>the app and its libraries only</td></tr>
<tr><td>Size</td><td>gigabytes</td><td>usually megabytes</td></tr>
<tr><td>Start time</td><td>minutes</td><td>seconds</td></tr>
<tr><td>Isolation</td><td>strong, own kernel</td><td>process-level, shared kernel</td></tr></table>

<h3>Four words to know now</h3>
<dl class="terms">
<dt>Image</dt><dd>A read-only package: the app, libraries and settings. The recipe.</dd>
<dt>Container</dt><dd>A running (or stopped) instance of an image. The meal cooked from the recipe.</dd>
<dt>Registry</dt><dd>A store of images that you pull from and push to.</dd>
<dt>Compose</dt><dd>A tool and file format that starts several containers together.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Deccan Net's automation team needs a small web page that shows nightly test results. Instead of installing a web server on a shared machine, they run a web server container from a ready-made image on port 8080 and mount the results folder into it. If it misbehaves they delete the container and start a new one in five seconds. You will do the first half of this with a real command in chapter 2.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Treating a container like a small VM that you log in to and configure by hand. Containers are meant to be disposable and rebuilt from an image. Anything you fix by hand inside a running container disappears when it is replaced.</p></div>
<div class="exam"><p><b>Exam trap.</b> A container is not a hypervisor guest: it shares the host kernel. Also, "image" and "container" are different words; one image can start many containers.</p></div>

<div class="scn"><h4>The pipeline that no longer broke on Mondays</h4><p>A team's CI job installed Python packages fresh each run, and on Mondays an upstream release sometimes broke it. They built one image with pinned package versions and ran every job in it. The Monday failures stopped, and a new engineer reproduced any job on a laptop with one command.</p><p><b>Lesson:</b> pin the environment once; use it everywhere.</p></div>

<div class="iv"><p class="q">"What is a container and why use one for network automation tooling?"</p><p>A container is an isolated process with its own filesystem built from an image, sharing the host kernel. It packages tools and exact dependencies, so scripts, test runners and dashboards run identically on a laptop and in a pipeline, start in seconds and can be thrown away. Contrast with a VM, which carries a full guest OS.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A container is an isolated process built from an image and sharing the host kernel.</li>
<li>Image = recipe; container = running instance; registry = image store.</li>
<li>Containers are small, quick and disposable; VMs are heavier with their own OS.</li>
<li>They remove "works on my machine" for automation tools and CI jobs.</li>
<li>Compose describes several containers in one file.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki container kya hai aur automation teams use kyun karti hain, <code>docker</code> se containers ko start, stop aur inspect kaise karte hain, ports aur networks unhe kaise jodte hain, volumes se data kaise bachta hai, aur ek <b>Docker Compose</b> file poore toolset (script runner, web dashboard aur database) ko ek padhne layak file mein kaise describe karti hai. Yeh CCNP Automation (350-901 AUTOCOR) blueprint ka "containers aur application deployment" hissa hai.</p>
<p><b>Prerequisites.</b> Aapko pata hona chahiye ki IP address aur TCP port kya hote hain, aur command line chala sakte ho. Docker ka koi experience zaroori nahi. Har command aur file ki har line explain hai.</p>

<div class="note"><p><b>Is module ki practice kaise karein.</b> NK-OS simulator ke server hosts par ek chhota container engine hai jo <code>docker ps</code>, <code>run</code>, <code>stop</code>, <code>start</code>, <code>rm</code>, <code>images</code>, <code>network ls</code> aur <code>inspect</code> samajhta hai. Chapters 2 se 5 aur 8 mein "captured from the simulator" likhe outputs usi engine ne banaye hain. Woh docker compose, volumes, builds ya logs nahi chalata, aur is module ke apne labs nahi hain, isliye Compose files aur baaki commands par <b>Reference configuration (not run in the simulator)</b> likha hai. Aas-paas ke skills ke liye virtualization module (ccna-virtualization port mapping ke saath docker run sikhata hai), auto-git, auto-cicd (pipeline mein containers build aur run karna), auto-ansible aur auto-ssh mein practise karo.</p></div>

<h3>Analogy: shipping container</h3>
<p>Standard shipping containers se pehle har cargo alag tarah se load hota tha: boriyan, drums, crates. Ports ko har ek ke liye alag crane chahiye thi. Phir ek standard size ka steel box aaya. Andar kya hai farak nahi padta; har jahaz, train aur crane us box ko sambhal leti hai. Software <b>container</b> wahi idea hai. Aap application ko theek wahi libraries aur settings ke saath pack karte ho jo use chahiye. Container engine wala koi bhi computer us box ko chala sakta hai, aur woh har jagah ek jaisa behave karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Host containers ke saath">
<rect x="20" y="20" width="600" height="165" rx="12" fill="#e2e8f0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">Ek host (laptop, server, VM) container engine ke saath</text>
<rect x="45" y="60" width="150" height="85" rx="10" fill="#bae6fd"/><text x="120" y="88" text-anchor="middle" class="svg-ink" font-size="13">Container 1</text><text x="120" y="108" text-anchor="middle" class="svg-muted" font-size="12">Python + scripts</text>
<rect x="245" y="60" width="150" height="85" rx="10" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">Container 2</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">web dashboard</text>
<rect x="445" y="60" width="150" height="85" rx="10" fill="#bbf7d0"/><text x="520" y="88" text-anchor="middle" class="svg-ink" font-size="13">Container 3</text><text x="520" y="108" text-anchor="middle" class="svg-muted" font-size="12">database</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">har ek isolated, sab host OS kernel share karte hain</text>
</svg><p class="cap">Ek host par isolated boxes, kernel share karte hue.</p></div>

<h3>Network automation teams ko parwah kyun hai</h3>
<ul>
<li><b>"Mere laptop par chalta hai" khatam.</b> Python version, libraries aur tools image ke andar hain, har engineer aur pipeline ke liye ek jaise.</li>
<li><b>Tez aur disposable.</b> Container seconds mein start hota hai aur kaam ke baad delete ho jaata hai, jo aapke tests chalane wale CI job (module auto-testing) ke liye fit hai.</li>
<li><b>Packaged toolsets.</b> Network automation platforms, simulators aur monitoring stacks images ke roop mein publish hote hain, isliye install ek command hai.</li>
<li><b>Controlled.</b> Wahi image tag test se production tak promote hota hai.</li>
</ul>

<h3>Container aur virtual machine</h3>
<table class="cmp"><tr><th></th><th>Virtual machine</th><th>Container</th></tr>
<tr><td>Kya hota hai</td><td>poora guest operating system</td><td>sirf app aur uski libraries</td></tr>
<tr><td>Size</td><td>gigabytes</td><td>aam taur par megabytes</td></tr>
<tr><td>Start time</td><td>minutes</td><td>seconds</td></tr>
<tr><td>Isolation</td><td>mazboot, apna kernel</td><td>process-level, shared kernel</td></tr></table>

<h3>Abhi chaar shabd jaan lo</h3>
<dl class="terms">
<dt>Image</dt><dd>Read-only package: app, libraries aur settings. Recipe.</dd>
<dt>Container</dt><dd>Image ka running (ya stopped) instance. Recipe se bana khana.</dd>
<dt>Registry</dt><dd>Images ka store jahan se pull aur jahan push karte hain.</dd>
<dt>Compose</dt><dd>Tool aur file format jo kai containers ko saath start karta hai.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Deccan Net ki automation team ko ek chhota web page chahiye jo raat ke test results dikhaye. Shared machine par web server install karne ki jagah woh ready-made image se web server container port 8080 par chalate hain aur results folder ko usme mount karte hain. Kharab ho to container delete karke paanch second mein naya start karte hain. Iska pehla aadha hissa aap chapter 2 mein asli command se karoge.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Container ko chhote VM ki tarah treat karna jisme login karke haath se configure karo. Containers disposable hone ke liye bane hain aur image se rebuild hote hain. Chalte container ke andar haath se jo bhi theek kiya woh replace hone par gayab ho jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Container hypervisor guest nahi hai: woh host kernel share karta hai. Aur "image" aur "container" alag shabd hain; ek image se kai containers start ho sakte hain.</p></div>

<div class="scn"><h4>Pipeline jo ab Monday ko nahi tootti</h4><p>Ek team ka CI job har run mein Python packages fresh install karta tha, aur Monday ko kabhi-kabhi upstream release use tod deti thi. Unhone pinned package versions ke saath ek image banayi aur har job usi mein chalaya. Monday ke failures band hue, aur naya engineer kisi bhi job ko laptop par ek command se reproduce kar sakta tha.</p><p><b>Lesson:</b> environment ek baar pin karo; har jagah wahi use karo.</p></div>

<div class="iv"><p class="q">"Container kya hai aur network automation tooling ke liye kyun use karte hain?"</p><p>Container ek isolated process hai jiska apna filesystem image se bana hota hai, aur woh host kernel share karta hai. Woh tools aur exact dependencies package karta hai, isliye scripts, test runners aur dashboards laptop aur pipeline par ek jaise chalte hain, seconds mein start hote hain aur phenke ja sakte hain. VM se contrast karo, jo poora guest OS rakhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Container image se bana isolated process hai jo host kernel share karta hai.</li>
<li>Image = recipe; container = running instance; registry = image store.</li>
<li>Containers chhote, tez aur disposable; VMs bhaari aur apne OS ke saath.</li>
<li>Automation tools aur CI jobs ke liye "mere machine par chalta hai" hatate hain.</li>
<li>Compose kai containers ko ek file mein describe karta hai.</li>
</ul></div>
`}};export{e as default};