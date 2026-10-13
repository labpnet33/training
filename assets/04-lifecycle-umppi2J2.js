var e={id:`lifecycle`,h:{en:`Container lifecycle: stop, start, remove and docker ps -a`,hi:`Container lifecycle: stop, start, remove aur docker ps -a`},body:{en:`
<p>A container is born with <code>docker run</code>, can be stopped and started again, and finally removed. Knowing these states and the commands that move between them prevents the most common beginner confusion: "where did my container go?" The outputs are captured from the simulator's container engine.</p>

<h3>Analogy: a light in a room</h3>
<p>A lamp can be on, off, or unplugged and thrown away. Switching it off does not destroy it; you can switch it on again with the same bulb and shade. Throwing it away is final. A container behaves the same: <b>running</b> (on), <b>stopped or exited</b> (off), <b>removed</b> (thrown away).</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Container states">
<rect x="20" y="55" width="130" height="55" rx="10" fill="#bae6fd"/><text x="85" y="87" text-anchor="middle" class="svg-ink" font-size="14">image</text>
<rect x="200" y="55" width="130" height="55" rx="10" fill="#bbf7d0"/><text x="265" y="87" text-anchor="middle" class="svg-ink" font-size="14">running</text>
<rect x="380" y="55" width="130" height="55" rx="10" fill="#fde68a"/><text x="445" y="87" text-anchor="middle" class="svg-ink" font-size="14">stopped</text>
<rect x="545" y="55" width="85" height="55" rx="10" fill="#fed7aa"/><text x="587" y="87" text-anchor="middle" class="svg-ink" font-size="14">removed</text>
<line x1="150" y1="75" x2="200" y2="75" stroke="#64748b" stroke-width="2"/><text x="175" y="68" text-anchor="middle" class="svg-accent" font-size="11">run</text>
<line x1="330" y1="68" x2="380" y2="68" stroke="#64748b" stroke-width="2"/><text x="355" y="60" text-anchor="middle" class="svg-accent" font-size="11">stop</text>
<line x1="380" y1="98" x2="330" y2="98" stroke="#64748b" stroke-width="2"/><text x="355" y="115" text-anchor="middle" class="svg-accent" font-size="11">start</text>
<line x1="510" y1="82" x2="545" y2="82" stroke="#64748b" stroke-width="2"/><text x="528" y="75" text-anchor="middle" class="svg-accent" font-size="11">rm</text>
</svg><p class="cap">run, stop, start and rm move a container between states.</p></div>

<h3>Stopping and starting</h3>
<pre class="out">SRV1&gt; docker stop web
web

SRV1&gt; docker ps
CONTAINER ID   IMAGE      COMMAND                  STATUS              PORTS                    NAMES
398577330000   python     "/entrypoint.sh""        Up 1 seconds        0.0.0.0:5000-&gt;5000/tcp   api</pre>
<p>The command prints the name of the container it stopped. After stopping, <code>docker ps</code> no longer lists <code>web</code>, which is where beginners get worried. It is not gone. To see all containers use the <b>-a</b> (all) option:</p>
<pre class="out">SRV1&gt; docker ps -a
CONTAINER ID   IMAGE      COMMAND                  STATUS              PORTS                    NAMES
4e5173740000   nginx      "nginx -g daemon of…"    <span class="hl">Exited (0)</span>          0.0.0.0:8080-&gt;80/tcp     web
398577330000   python     "/entrypoint.sh""        Up 1 seconds        0.0.0.0:5000-&gt;5000/tcp   api</pre>
<p><code>Exited (0)</code> means the container's main process finished cleanly with exit code 0. A non-zero number would mean it failed. To bring it back with the same name and settings:</p>
<pre class="out">SRV1&gt; docker start web
web</pre>

<h3>What persists across stop and start?</h3>
<p>The container keeps its name, its configuration (ports, network) and the files written inside it. This is why stop and start is cheap. But the files live in a writable layer that belongs to that one container. When you <b>remove</b> the container, they vanish. Chapter 6 shows how volumes keep data safe.</p>

<h3>Removing</h3>
<p><code>docker rm NAME</code> deletes a stopped container. The engine protects you from deleting a running one:</p>
<pre class="out">SRV1&gt; docker rm api
Error response from daemon: You cannot remove a running container 398577330000. <span class="hl">Stop the container before attempting removal</span> or force remove</pre>
<p>So the normal sequence is stop, then rm. In a real engine <code>docker rm -f NAME</code> forces removal of a running container, which is blunt: use it carefully. The simulator's engine supports plain <code>docker rm NAME</code> only.</p>
<pre class="out">SRV1&gt; docker stop web
web

SRV1&gt; docker rm web
web</pre>

<h3>Names must be unique</h3>
<p>Two containers cannot share one name, even if one is stopped:</p>
<pre class="out">SRV1&gt; docker run -d --name web nginx
docker: Error response from daemon: Conflict. The container name "/web" is already in use.</pre>
<p>Either start the existing one (<code>docker start web</code>), remove it first, or choose a different name. Removing a container you do not need is also good housekeeping, because stopped containers still take disk space.</p>

<div class="eg"><p><b>Worked example.</b> A test job needs a fresh web container every run. The job's script does: docker stop web, docker rm web, docker run -d --name web ... That way a run never inherits leftovers from the last one, and the "name already in use" error cannot appear. Disposable and repeatable.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Running docker run again to "restart" a stopped container. That creates a second container or hits the name conflict. Use docker start for an existing container. Another mistake: storing important data only inside the container and then removing it.</p></div>
<div class="exam"><p><b>Exam trap.</b> docker ps shows running containers only. A stopped container still exists and still owns its name and published ports' configuration until it is removed. Exit code 0 means success; non-zero means the process failed.</p></div>

<div class="scn"><h4>The container that vanished</h4><p>A junior engineer stopped a results-server container for a quick fix, ran docker ps and panicked because it was gone. A senior engineer ran docker ps -a, showed the Exited status and ran docker start. The data written inside it was still there because the container had only been stopped, not removed.</p><p><b>Lesson:</b> ps shows what is running; ps -a shows what exists.</p></div>

<div class="iv"><p class="q">"What is the difference between docker stop and docker rm?"</p><p>Stop halts a running container but keeps it, with its configuration and its filesystem changes, so it can be started again. rm deletes a stopped container permanently along with its writable layer, unless data was kept on a volume. docker ps -a lists stopped containers too.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>States: running, stopped (exited), removed.</li>
<li>docker stop halts; docker start resumes; docker rm deletes a stopped container.</li>
<li>docker ps shows running only; docker ps -a shows all.</li>
<li>Exited (0) is a clean finish; a non-zero code means failure.</li>
<li>Container names are unique until the container is removed.</li>
</ul></div>
`,hi:`
<p>Container <code>docker run</code> se janam leta hai, stop aur dobara start ho sakta hai, aur aakhir mein remove hota hai. In states aur unke beech le jaane wale commands ko jaanna sabse aam beginner confusion rokta hai: "mera container kahan gaya?" Outputs simulator ke container engine se capture kiye gaye hain.</p>

<h3>Analogy: kamre ki light</h3>
<p>Lamp on ho sakta hai, off ho sakta hai, ya plug nikalkar phenka ja sakta hai. Off karne se woh destroy nahi hota; wahi bulb aur shade ke saath phir on kar sakte ho. Phenkna final hai. Container bhi aise hi behave karta hai: <b>running</b> (on), <b>stopped ya exited</b> (off), <b>removed</b> (phenka gaya).</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Container states">
<rect x="20" y="55" width="130" height="55" rx="10" fill="#bae6fd"/><text x="85" y="87" text-anchor="middle" class="svg-ink" font-size="14">image</text>
<rect x="200" y="55" width="130" height="55" rx="10" fill="#bbf7d0"/><text x="265" y="87" text-anchor="middle" class="svg-ink" font-size="14">running</text>
<rect x="380" y="55" width="130" height="55" rx="10" fill="#fde68a"/><text x="445" y="87" text-anchor="middle" class="svg-ink" font-size="14">stopped</text>
<rect x="545" y="55" width="85" height="55" rx="10" fill="#fed7aa"/><text x="587" y="87" text-anchor="middle" class="svg-ink" font-size="14">removed</text>
<line x1="150" y1="75" x2="200" y2="75" stroke="#64748b" stroke-width="2"/><text x="175" y="68" text-anchor="middle" class="svg-accent" font-size="11">run</text>
<line x1="330" y1="68" x2="380" y2="68" stroke="#64748b" stroke-width="2"/><text x="355" y="60" text-anchor="middle" class="svg-accent" font-size="11">stop</text>
<line x1="380" y1="98" x2="330" y2="98" stroke="#64748b" stroke-width="2"/><text x="355" y="115" text-anchor="middle" class="svg-accent" font-size="11">start</text>
<line x1="510" y1="82" x2="545" y2="82" stroke="#64748b" stroke-width="2"/><text x="528" y="75" text-anchor="middle" class="svg-accent" font-size="11">rm</text>
</svg><p class="cap">run, stop, start aur rm container ko states ke beech le jaate hain.</p></div>

<h3>Stop aur start karna</h3>
<pre class="out">SRV1&gt; docker stop web
web

SRV1&gt; docker ps
CONTAINER ID   IMAGE      COMMAND                  STATUS              PORTS                    NAMES
398577330000   python     "/entrypoint.sh""        Up 1 seconds        0.0.0.0:5000-&gt;5000/tcp   api</pre>
<p>Command us container ka naam print karta hai jise usne stop kiya. Stop ke baad <code>docker ps</code> ab <code>web</code> ko list nahi karta, aur yahin beginners ghabrate hain. Woh gayab nahi hua. Saare containers dekhne ke liye <b>-a</b> (all) option use karo:</p>
<pre class="out">SRV1&gt; docker ps -a
CONTAINER ID   IMAGE      COMMAND                  STATUS              PORTS                    NAMES
4e5173740000   nginx      "nginx -g daemon of…"    <span class="hl">Exited (0)</span>          0.0.0.0:8080-&gt;80/tcp     web
398577330000   python     "/entrypoint.sh""        Up 1 seconds        0.0.0.0:5000-&gt;5000/tcp   api</pre>
<p><code>Exited (0)</code> ka matlab container ka main process exit code 0 ke saath saaf khatam hua. Non-zero number ka matlab fail hua. Use wahi naam aur settings ke saath wapas laane ke liye:</p>
<pre class="out">SRV1&gt; docker start web
web</pre>

<h3>Stop aur start ke beech kya bachta hai?</h3>
<p>Container apna naam, apni configuration (ports, network) aur andar likhi gayi files rakhta hai. Isi liye stop aur start sasta hai. Par files ek writable layer mein hain jo us ek container ki hai. Container ko <b>remove</b> karte hi woh gayab ho jaati hain. Chapter 6 dikhata hai volumes data ko safe kaise rakhte hain.</p>

<h3>Remove karna</h3>
<p><code>docker rm NAME</code> stopped container delete karta hai. Engine aapko running container delete karne se bachata hai:</p>
<pre class="out">SRV1&gt; docker rm api
Error response from daemon: You cannot remove a running container 398577330000. <span class="hl">Stop the container before attempting removal</span> or force remove</pre>
<p>Isliye normal sequence hai pehle stop, phir rm. Asli engine mein <code>docker rm -f NAME</code> running container ko force remove karta hai, jo bhonda hai: savdhani se use karo. Simulator ka engine sirf seedha <code>docker rm NAME</code> support karta hai.</p>
<pre class="out">SRV1&gt; docker stop web
web

SRV1&gt; docker rm web
web</pre>

<h3>Naam unique hone chahiye</h3>
<p>Do containers ek naam share nahi kar sakte, chahe ek stopped ho:</p>
<pre class="out">SRV1&gt; docker run -d --name web nginx
docker: Error response from daemon: Conflict. The container name "/web" is already in use.</pre>
<p>Ya to maujooda wale ko start karo (<code>docker start web</code>), pehle use remove karo, ya alag naam chuno. Jis container ki zaroorat nahi use remove karna achhi housekeeping bhi hai, kyunki stopped containers bhi disk space lete hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek test job ko har run mein fresh web container chahiye. Job ki script karti hai: docker stop web, docker rm web, docker run -d --name web ... Isse run ko pichle run ke bache hue cheezein nahi milte, aur "name already in use" error aa hi nahi sakta. Disposable aur repeatable.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Stopped container ko "restart" karne ke liye docker run dobara chalana. Isse doosra container bana hai ya name conflict aata hai. Maujooda container ke liye docker start use karo. Ek aur galti: zaroori data sirf container ke andar rakhna aur phir use remove kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> docker ps sirf running containers dikhata hai. Stopped container abhi bhi maujood hai aur remove hone tak apna naam aur published ports ki configuration rakhta hai. Exit code 0 safalta; non-zero matlab process fail hua.</p></div>

<div class="scn"><h4>Container jo gayab ho gaya</h4><p>Ek junior engineer ne quick fix ke liye results-server container stop kiya, docker ps chalaya aur ghabra gaya kyunki woh gayab tha. Senior engineer ne docker ps -a chalaya, Exited status dikhaya aur docker start chalaya. Andar likha data wahin tha kyunki container sirf stop hua tha, remove nahi.</p><p><b>Lesson:</b> ps dikhata hai kya chal raha hai; ps -a dikhata hai kya maujood hai.</p></div>

<div class="iv"><p class="q">"docker stop aur docker rm mein kya farak hai?"</p><p>Stop running container ko rokta hai par use rakhta hai, apni configuration aur filesystem changes ke saath, isliye dobara start ho sakta hai. rm stopped container ko uski writable layer ke saath permanently delete karta hai, jab tak data volume par na rakha ho. docker ps -a stopped containers bhi list karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>States: running, stopped (exited), removed.</li>
<li>docker stop rokta hai; docker start dobara chalata hai; docker rm stopped container delete karta hai.</li>
<li>docker ps sirf running dikhata hai; docker ps -a sab.</li>
<li>Exited (0) saaf finish hai; non-zero code failure.</li>
<li>Container ke naam remove hone tak unique rehte hain.</li>
</ul></div>
`}};export{e as default};