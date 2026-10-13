var e={id:`troubleshooting`,h:{en:`Troubleshooting containers: a workflow and the errors you will meet`,hi:`Containers troubleshooting: workflow aur woh errors jo milenge`},body:{en:`
<p>Container problems fall into a small number of patterns. With a fixed routine you can solve most of them in minutes. This chapter gives the routine and walks through the real error messages captured from the simulator's container engine on host SRV1. Commands the simulator does not have (logs, exec, compose) are shown as <b>Reference configuration (not run in the simulator)</b>.</p>

<h3>Analogy: a lift engineer</h3>
<p>A lift engineer asks the same questions every time: Is the lift powered? Is it on the right floor? Is the door blocked? Is the call button wired? Containers have the same four questions: <b>Is it running? Is it the right container? Can it be reached? What did it say?</b></p>

<h3>The four-step routine</h3>
<ol>
<li><b>State</b>: <code>docker ps -a</code>. Is it Up or Exited? If Exited, what code?</li>
<li><b>Configuration</b>: <code>docker inspect NAME</code>. Right image, right ports, right network and IP?</li>
<li><b>Reachability</b>: from where are you connecting, to which port? Is the port published? Does the application listen on the container port you mapped?</li>
<li><b>Output</b>: what did the application print? In a real engine: <code>docker logs NAME</code>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Troubleshooting routine">
<rect x="10" y="40" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="66" text-anchor="middle" class="svg-ink" font-size="13">1 State</text><text x="80" y="84" text-anchor="middle" class="svg-muted" font-size="11">docker ps -a</text>
<rect x="170" y="40" width="140" height="60" rx="10" fill="#fde68a"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="13">2 Config</text><text x="240" y="84" text-anchor="middle" class="svg-muted" font-size="11">docker inspect</text>
<rect x="330" y="40" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="400" y="66" text-anchor="middle" class="svg-ink" font-size="13">3 Reach</text><text x="400" y="84" text-anchor="middle" class="svg-muted" font-size="11">ports, network</text>
<rect x="490" y="40" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="66" text-anchor="middle" class="svg-ink" font-size="13">4 Output</text><text x="560" y="84" text-anchor="middle" class="svg-muted" font-size="11">docker logs</text>
<line x1="150" y1="70" x2="170" y2="70" stroke="#64748b" stroke-width="2"/><line x1="310" y1="70" x2="330" y2="70" stroke="#64748b" stroke-width="2"/><line x1="470" y1="70" x2="490" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">State, config, reach, output: in that order.</p></div>

<h3>Error 1: the port is already allocated</h3>
<pre class="out">SRV1&gt; docker run -d --name web2 -p 8080:80 nginx
docker: Error response from daemon: driver failed programming external connectivity: <span class="hl">Bind for 0.0.0.0:8080 failed: port is already allocated.</span></pre>
<p>Cause: another container (or program) already owns host port 8080. Check with <code>docker ps</code>, look at the PORTS column, and either choose another host port (<code>-p 8081:80</code>) or stop the owner. This error is about the <b>host</b> port, not the container port.</p>

<h3>Error 2: the name is in use</h3>
<pre class="out">SRV1&gt; docker run -d --name web nginx
docker: Error response from daemon: Conflict. <span class="hl">The container name "/web" is already in use.</span></pre>
<p>Cause: a container called web exists, possibly stopped. Run <code>docker ps -a</code> to see it. Then start it, remove it, or pick another name.</p>

<h3>Error 3: removing a running container</h3>
<pre class="out">SRV1&gt; docker rm api
Error response from daemon: You cannot remove a running container 398577330000. <span class="hl">Stop the container before attempting removal</span> or force remove</pre>
<p>Cause: you asked to delete something still running. Run <code>docker stop api</code> first (a real engine also offers force remove; use it carefully).</p>

<h3>Error 4: no such container</h3>
<pre class="out">SRV1&gt; docker start nothing
Error response from daemon: No such container: nothing

SRV1&gt; docker inspect nothing
Error: No such object: nothing</pre>
<p>Cause: a typo, or the container was already removed. <code>docker ps -a</code> lists every name that exists. Copy the exact name.</p>

<h3>Problem 5: the container exits immediately</h3>
<p>In <code>docker ps -a</code> the status reads Exited with a non-zero code. A container lives only as long as its main process. If the script crashes or finishes, the container exits. Reference commands for a real engine:</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
docker logs runner               <span class="c"># what the script printed before it stopped</span>
docker inspect runner            <span class="c"># exit code, command, environment</span>
docker exec -it runner sh        <span class="c"># open a shell inside a RUNNING container to look around</span></pre>
<p>Typical causes: a missing environment variable, a wrong command in CMD, an unreachable database, a missing file because the volume was not mounted. The logs usually say which.</p>

<h3>Problem 6: running, but nobody can reach it</h3>
<ol>
<li>Is it published? An empty PORTS column in <code>docker ps</code> and an empty Ports in inspect mean no outside access by design.</li>
<li>Is the mapping the right way round, HOST:CONTAINER?</li>
<li>Does the application listen on the container port you mapped, and on all addresses inside the container rather than only the container's loopback?</li>
<li>Is a firewall on the host blocking the host port?</li>
<li>Container to container: are both on the same network, and are you using the service name rather than localhost?</li>
</ol>

<div class="eg"><p><b>Worked example.</b> A colleague says the dashboard at port 8080 is dead. You run docker ps -a: the dashboard is Exited. You run docker logs and see it could not find its report folder because the volume line was missing from the compose file. You add the volume, run compose up -d, and the dashboard returns. Four steps, no guessing.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Deleting and recreating the container before reading the logs. You lose the evidence and often recreate the same fault. Look first. Also, do not paste logs containing secrets into a public ticket.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Port already allocated" refers to the host side. "Name already in use" can come from a stopped container. A container that exits straight away usually means its main process ended, not that Docker is broken.</p></div>

<div class="scn"><h4>Two errors, two causes</h4><p>On a shared build host, an engineer tried to start a second web container and got "port is already allocated". Rather than killing the first container, they checked docker ps, saw it served the team's test report, and published their second one on 8081. A second engineer on the same host got "name already in use" for a stopped container left from last week; docker ps -a showed it, and docker rm cleaned it up before the new run.</p><p><b>Lesson:</b> read the message; each one points to a single fix.</p></div>

<div class="iv"><p class="q">"A container will not start or cannot be reached. How do you troubleshoot?"</p><p>Check state with docker ps -a (running or exited, exit code), configuration with docker inspect (image, ports, network, IP), reachability (is the port published, mapped host-to-container correctly, application listening on all addresses, firewall, same network), and output with docker logs. Fix one cause, rerun, and keep the evidence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routine: state, configuration, reachability, output.</li>
<li>Port already allocated means the host port is taken; names are unique until removed.</li>
<li>Stop before rm; docker ps -a shows what exists.</li>
<li>A container lives as long as its main process; exits point to the app, not Docker.</li>
<li>Read logs before deleting anything.</li>
</ul></div>
`,hi:`
<p>Container problems kuch gine-chune patterns mein aati hain. Fixed routine ke saath aap zyadatar ko minutes mein solve kar sakte ho. Yeh chapter routine deta hai aur SRV1 host par simulator ke container engine se capture kiye asli error messages se guzarta hai. Jo commands simulator mein nahi hain (logs, exec, compose) unhe <b>Reference configuration (not run in the simulator)</b> ke roop mein dikhaya gaya hai.</p>

<h3>Analogy: lift engineer</h3>
<p>Lift engineer har baar wahi sawaal poochta hai: Lift mein power hai? Sahi floor par hai? Darwaza atka hai? Call button ki wiring hai? Containers ke wahi chaar sawaal hain: <b>Kya chal raha hai? Kya yeh sahi container hai? Kya pahuncha ja sakta hai? Usne kya kaha?</b></p>

<h3>Chaar step ka routine</h3>
<ol>
<li><b>State</b>: <code>docker ps -a</code>. Up hai ya Exited? Exited ho to kaunsa code?</li>
<li><b>Configuration</b>: <code>docker inspect NAME</code>. Sahi image, sahi ports, sahi network aur IP?</li>
<li><b>Reachability</b>: aap kahan se, kaunse port se connect kar rahe ho? Kya port published hai? Kya application us container port par sunti hai jo aapne map kiya?</li>
<li><b>Output</b>: application ne kya print kiya? Asli engine mein: <code>docker logs NAME</code>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Troubleshooting routine">
<rect x="10" y="40" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="66" text-anchor="middle" class="svg-ink" font-size="13">1 State</text><text x="80" y="84" text-anchor="middle" class="svg-muted" font-size="11">docker ps -a</text>
<rect x="170" y="40" width="140" height="60" rx="10" fill="#fde68a"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="13">2 Config</text><text x="240" y="84" text-anchor="middle" class="svg-muted" font-size="11">docker inspect</text>
<rect x="330" y="40" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="400" y="66" text-anchor="middle" class="svg-ink" font-size="13">3 Reach</text><text x="400" y="84" text-anchor="middle" class="svg-muted" font-size="11">ports, network</text>
<rect x="490" y="40" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="66" text-anchor="middle" class="svg-ink" font-size="13">4 Output</text><text x="560" y="84" text-anchor="middle" class="svg-muted" font-size="11">docker logs</text>
<line x1="150" y1="70" x2="170" y2="70" stroke="#64748b" stroke-width="2"/><line x1="310" y1="70" x2="330" y2="70" stroke="#64748b" stroke-width="2"/><line x1="470" y1="70" x2="490" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">State, config, reach, output: isi order mein.</p></div>

<h3>Error 1: port already allocated</h3>
<pre class="out">SRV1&gt; docker run -d --name web2 -p 8080:80 nginx
docker: Error response from daemon: driver failed programming external connectivity: <span class="hl">Bind for 0.0.0.0:8080 failed: port is already allocated.</span></pre>
<p>Wajah: koi aur container (ya program) host port 8080 pehle se le chuka hai. <code>docker ps</code> se check karo, PORTS column dekho, aur ya to doosra host port chuno (<code>-p 8081:80</code>) ya maalik ko stop karo. Yeh error <b>host</b> port ke baare mein hai, container port ke nahi.</p>

<h3>Error 2: naam use mein hai</h3>
<pre class="out">SRV1&gt; docker run -d --name web nginx
docker: Error response from daemon: Conflict. <span class="hl">The container name "/web" is already in use.</span></pre>
<p>Wajah: web naam ka container maujood hai, shayad stopped. <code>docker ps -a</code> se dekho. Phir use start karo, remove karo, ya alag naam chuno.</p>

<h3>Error 3: running container remove karna</h3>
<pre class="out">SRV1&gt; docker rm api
Error response from daemon: You cannot remove a running container 398577330000. <span class="hl">Stop the container before attempting removal</span> or force remove</pre>
<p>Wajah: aapne woh cheez delete karne ko kaha jo abhi chal rahi hai. Pehle <code>docker stop api</code> chalao (asli engine force remove bhi deta hai; savdhani se use karo).</p>

<h3>Error 4: no such container</h3>
<pre class="out">SRV1&gt; docker start nothing
Error response from daemon: No such container: nothing

SRV1&gt; docker inspect nothing
Error: No such object: nothing</pre>
<p>Wajah: typo, ya container pehle hi remove ho chuka. <code>docker ps -a</code> har maujood naam list karta hai. Exact naam copy karo.</p>

<h3>Problem 5: container turant exit ho jaata hai</h3>
<p><code>docker ps -a</code> mein status non-zero code ke saath Exited dikhta hai. Container sirf utni der jeeta hai jitni der uska main process. Script crash ho ya khatam ho, container exit ho jaata hai. Asli engine ke liye reference commands:</p>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua)</span>
docker logs runner               <span class="c"># script ne rukne se pehle kya print kiya</span>
docker inspect runner            <span class="c"># exit code, command, environment</span>
docker exec -it runner sh        <span class="c"># RUNNING container ke andar shell kholkar dekho</span></pre>
<p>Aam wajahein: environment variable missing, CMD mein galat command, unreachable database, volume mount na hone se file missing. Logs aam taur par batate hain kaunsi.</p>

<h3>Problem 6: running hai, par koi pahunch nahi paata</h3>
<ol>
<li>Kya published hai? <code>docker ps</code> mein khaali PORTS column aur inspect mein khaali Ports ka matlab design se bahar ka access nahi.</li>
<li>Kya mapping sahi taraf hai, HOST:CONTAINER?</li>
<li>Kya application us container port par sunti hai jo aapne map kiya, aur container ke andar saare addresses par, sirf container ke loopback par nahi?</li>
<li>Kya host par firewall host port ko rok raha hai?</li>
<li>Container se container: kya dono same network par hain, aur kya aap localhost ki jagah service name use kar rahe ho?</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Colleague kehta hai port 8080 ka dashboard mar gaya. Aap docker ps -a chalate ho: dashboard Exited hai. Aap docker logs chalate ho aur dekhte ho ki woh apna report folder nahi dhoondh paya kyunki compose file mein volume line missing thi. Aap volume jodte ho, compose up -d chalate ho, aur dashboard wapas aa jaata hai. Chaar steps, koi andaaza nahi.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Logs padhne se pehle container delete karke recreate karna. Saboot kho jaata hai aur aksar wahi fault dobara ban jaata hai. Pehle dekho. Aur secrets wale logs public ticket mein paste mat karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Port already allocated" host side ke baare mein hai. "Name already in use" stopped container se bhi aa sakta hai. Jo container turant exit ho jaata hai uska matlab aam taur par uska main process khatam hua, Docker kharab nahi hai.</p></div>

<div class="scn"><h4>Do errors, do wajahein</h4><p>Shared build host par ek engineer ne doosra web container start karna chaha aur "port is already allocated" mila. Pehle container ko maarne ki jagah unhone docker ps dekha, paaya ki woh team ka test report serve kar raha hai, aur apna doosra 8081 par publish kiya. Usi host par doosre engineer ko pichhle hafte ke chhode stopped container ke liye "name already in use" mila; docker ps -a ne use dikhaya, aur docker rm ne naye run se pehle saaf kar diya.</p><p><b>Lesson:</b> message padho; har ek ek hi fix ki taraf ishara karta hai.</p></div>

<div class="iv"><p class="q">"Container start nahi hota ya reach nahi hota. Troubleshoot kaise karoge?"</p><p>docker ps -a se state (running ya exited, exit code), docker inspect se configuration (image, ports, network, IP), reachability (port published hai, host-to-container sahi map hai, application saare addresses par sunti hai, firewall, same network), aur docker logs se output check karo. Ek wajah fix karo, rerun karo, aur saboot rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routine: state, configuration, reachability, output.</li>
<li>Port already allocated matlab host port le liya gaya; naam remove hone tak unique hain.</li>
<li>rm se pehle stop; docker ps -a dikhata hai kya maujood hai.</li>
<li>Container apne main process jitna jeeta hai; exit app ki taraf ishara karta hai, Docker ki nahi.</li>
<li>Kuch delete karne se pehle logs padho.</li>
</ul></div>
`}};export{e as default};