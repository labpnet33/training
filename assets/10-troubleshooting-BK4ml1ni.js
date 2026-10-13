var e={id:`troubleshooting`,h:{en:`Troubleshooting a deployment: status, logs, ports and both labs`,hi:`Deployment troubleshoot karna: status, logs, ports aur dono labs`},body:{en:`
<p>A doctor does not start with surgery. She asks: is the patient alive (status), what are the symptoms (logs), and are the vital connections working (ports and network)? Fixing a deployment follows the same order. Blueprint item 4.1 asks you to diagnose deployment problems, and nearly every case falls out of a short routine.</p>

<h3>The five-step routine</h3>
<ol>
<li><b>Status: is it running at all?</b> <code>docker ps -a</code> shows running and exited containers. <code>Exited</code> means the process ended: a crash, a bad command, or someone stopped it. A container that keeps restarting is crash-looping.</li>
<li><b>Logs: what did it say?</b> <code>docker logs NAME</code> prints the app's stdout and stderr. Read the <b>last lines first</b>: a Python traceback, "missing environment variable", "address already in use", "permission denied".</li>
<li><b>Ports: is the right door open?</b> Compare the PORTS column with what the app really listens on. Check the host side with <code>ss -tlnp</code> on Linux, the container side with <code>docker inspect</code>. Test with <code>curl</code>.</li>
<li><b>Config: are the settings right?</b> <code>docker exec NAME env</code> shows the variables the app sees. Wrong controller address, missing token, wrong port number.</li>
<li><b>Network and dependencies: can it reach what it needs?</b> From inside the container, <code>ping</code> or <code>curl</code> the database or controller. Check firewall rules, DNS, and that the backing service itself is up.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Diagnosis ladder">
<rect x="10" y="30" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="13">1 Status</text><text x="65" y="74" text-anchor="middle" class="svg-muted" font-size="11">docker ps -a</text>
<rect x="135" y="30" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="190" y="55" text-anchor="middle" class="svg-ink" font-size="13">2 Logs</text><text x="190" y="74" text-anchor="middle" class="svg-muted" font-size="11">docker logs</text>
<rect x="260" y="30" width="110" height="60" rx="8" fill="#fde68a"/><text x="315" y="55" text-anchor="middle" class="svg-ink" font-size="13">3 Ports</text><text x="315" y="74" text-anchor="middle" class="svg-muted" font-size="11">PORTS, ss, curl</text>
<rect x="385" y="30" width="110" height="60" rx="8" fill="#fed7aa"/><text x="440" y="55" text-anchor="middle" class="svg-ink" font-size="13">4 Config</text><text x="440" y="74" text-anchor="middle" class="svg-muted" font-size="11">env variables</text>
<rect x="510" y="30" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="55" text-anchor="middle" class="svg-ink" font-size="13">5 Network</text><text x="570" y="74" text-anchor="middle" class="svg-muted" font-size="11">DNS, firewall, DB</text>
<line x1="120" y1="60" x2="135" y2="60" stroke="#64748b" stroke-width="2"/><line x1="245" y1="60" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="370" y1="60" x2="385" y2="60" stroke="#64748b" stroke-width="2"/><line x1="495" y1="60" x2="510" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">Change ONE thing, retest, write down what fixed it</text>
</svg><p class="cap">Work from the cheapest check to the most expensive, and change one thing at a time.</p></div>

<h3>Common symptoms and causes</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Container not in <code>docker ps</code></td><td>Exited: crash or bad CMD</td><td><code>docker ps -a</code>, <code>docker logs</code></td></tr>
<tr><td>"port is already allocated"</td><td>Another container holds that host port</td><td><code>docker ps</code> PORTS column</td></tr>
<tr><td>Connection refused</td><td>Nothing listening; wrong port; app bound to 127.0.0.1</td><td><code>ss -tlnp</code>, logs</td></tr>
<tr><td>Connection times out</td><td>Firewall, security group or route drops it</td><td>Rules on the path, <code>curl -v</code></td></tr>
<tr><td>App starts then dies</td><td>Missing config or unreachable dependency</td><td>Last log lines, <code>env</code></td></tr>
<tr><td>Works in staging, fails in prod</td><td>Config or version difference</td><td>Compare image tags and variables</td></tr></table>

<h3>Lab 1 walk-through: Ship a web app in a container</h3>
<p>On DOCK01 you run production on 8080, staging on 8081, inspect, trigger a clash and stop staging. The key outputs:</p>
<pre class="out">DOCK01&gt; docker run -d --name nk-web -p 8080:80 nginx
DOCK01&gt; docker run -d --name nk-web-staging -p 8081:80 nginx
DOCK01&gt; docker inspect nk-web
  ...
  "Ports": { <span class="hl">"80/tcp": [ { "HostIp": "0.0.0.0", "HostPort": "8080" } ]</span> }

DOCK01&gt; docker run -d --name nk-web3 -p 8080:80 nginx
docker: Error response from daemon: driver failed programming external connectivity: Bind for 0.0.0.0:8080 failed: <span class="hl">port is already allocated.</span></pre>
<p>In <code>docker inspect</code> the key of the Ports map (<code>80/tcp</code>) is the <b>container</b> port, and <code>HostPort</code> is the host side. Staging uses 8081 on the host but the same 80 inside, which is why both can coexist. After <code>docker stop nk-web-staging</code>, <code>docker ps -a</code> shows it as <code>Exited (0)</code> while nk-web stays <code>Up</code>.</p>

<h3>Lab 2 walk-through: The release that will not start</h3>
<p>shop-v2 must serve on 8080, but shop-v1 still holds it. Start with status:</p>
<pre class="out">DOCK01&gt; docker run -d --name shop-v2 -p 8080:80 nginx
docker: Error response from daemon: ... Bind for 0.0.0.0:8080 failed: <span class="hl">port is already allocated.</span>

DOCK01&gt; docker ps -a
CONTAINER ID   IMAGE      COMMAND                  STATUS              PORTS                    NAMES
e8218d140000   nginx      "nginx -g daemon of…"    Up 5 seconds        <span class="hl">0.0.0.0:8080-&gt;80/tcp</span>     shop-v1
2836cc920000   redis      "/entrypoint.sh"         Up 5 seconds        0.0.0.0:6379-&gt;6379/tcp   cache
53567c020000   alpine     "/entrypoint.sh"         <span class="hl">Exited (0)</span>                              report-job</pre>
<p>Reading it: shop-v1 owns host port 8080; <code>cache</code> must not be touched (other services depend on it); <code>report-job</code> is exited, which is normal for a finished batch job and <b>not</b> the problem here. The safe fix is to retire only the old release: <code>docker stop shop-v1</code>, <code>docker rm shop-v1</code>, then repeat the <code>docker run</code> for shop-v2 and verify with <code>docker ps</code> and <code>docker inspect shop-v2</code>.</p>
<div class="note"><p>In a real environment you would also run <code>docker logs shop-v1</code> before removing it, and ideally use blue/green: start the new version on a spare port, test it, then switch. The simulator does not provide <code>docker logs</code>, so use the output above and the ps output as your evidence.</p></div>

<div class="warn"><p><b>Common mistakes:</b> restarting everything before reading logs; removing the wrong container with <code>docker rm -f</code>; fixing a symptom on the host (opening a port) when the app is bound to the wrong address; changing three things at once so you cannot tell which fixed it.</p></div>
<div class="exam"><p><b>Exam trap:</b> "Connection refused" means the host answered and nothing listens there; a <b>timeout</b> means packets never got an answer (filtered or no route). An <code>Exited</code> container is a process that ended, not a network fault. Always check logs before rebuilding.</p></div>

<div class="scn"><h4>Port clash at release night</h4><p>At 23:30 a Lucknow team's release of the quotes service failed with "port is already allocated". A tired engineer almost ran <code>docker rm -f</code> on everything. Instead the on-call read <code>docker ps</code>, saw the old version holding 8080, stopped only that container, started the new one and verified. Total time: four minutes, no collateral damage.</p><p><b>Lesson:</b> read the evidence, change the minimum, verify.</p></div>

<div class="iv"><p class="q">"A container will not start or the service is unreachable. How do you troubleshoot?"</p><p>Status first (<code>docker ps -a</code>), then logs, then ports and mapping (<code>docker inspect</code>, <code>ss</code>, <code>curl</code>), then config variables, then network dependencies. State that you change one variable at a time and record the fix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routine: status, logs, ports, config, network; cheapest check first.</li>
<li>"Port is already allocated" = another container owns that host port; find it in the PORTS column.</li>
<li>Refused = nothing listening; timeout = blocked or no route.</li>
<li>Stopped (Exited) containers only show with <code>docker ps -a</code>.</li>
<li>Retire the old release safely: stop, remove, then start the new one and verify.</li>
</ul></div>
`,hi:`
<p>Doctor surgery se shuru nahi karti. Woh poochti hai: mareez zinda hai (status), symptoms kya hain (logs), aur zaroori connections kaam kar rahe hain (ports aur network)? Deployment fix karna isi order mein hota hai. Blueprint item 4.1 chahta hai ki aap deployment problems diagnose karo, aur lagbhag har case ek chhoti routine se nikal aata hai.</p>

<h3>Paanch-step routine</h3>
<ol>
<li><b>Status: chal bhi raha hai?</b> <code>docker ps -a</code> running aur exited containers dikhata hai. <code>Exited</code> matlab process khatam: crash, galat command, ya kisi ne stop kiya. Jo container baar-baar restart ho raha hai woh crash-loop mein hai.</li>
<li><b>Logs: usne kya kaha?</b> <code>docker logs NAME</code> app ka stdout aur stderr print karta hai. <b>Aakhri lines pehle</b> padho: Python traceback, "missing environment variable", "address already in use", "permission denied".</li>
<li><b>Ports: sahi darwaza khula hai?</b> PORTS column ko us se compare karo jis par app asal mein sunti hai. Host side Linux par <code>ss -tlnp</code> se, container side <code>docker inspect</code> se check karo. <code>curl</code> se test karo.</li>
<li><b>Config: settings sahi hain?</b> <code>docker exec NAME env</code> dikhata hai app ko kaunse variables dikhte hain. Galat controller address, missing token, galat port number.</li>
<li><b>Network aur dependencies: jo chahiye wahan pahunch sakta hai?</b> Container ke andar se database ya controller ko <code>ping</code> ya <code>curl</code> karo. Firewall rules, DNS, aur backing service khud up hai ya nahi dekho.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Diagnosis seedhi">
<rect x="10" y="30" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="13">1 Status</text><text x="65" y="74" text-anchor="middle" class="svg-muted" font-size="11">docker ps -a</text>
<rect x="135" y="30" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="190" y="55" text-anchor="middle" class="svg-ink" font-size="13">2 Logs</text><text x="190" y="74" text-anchor="middle" class="svg-muted" font-size="11">docker logs</text>
<rect x="260" y="30" width="110" height="60" rx="8" fill="#fde68a"/><text x="315" y="55" text-anchor="middle" class="svg-ink" font-size="13">3 Ports</text><text x="315" y="74" text-anchor="middle" class="svg-muted" font-size="11">PORTS, ss, curl</text>
<rect x="385" y="30" width="110" height="60" rx="8" fill="#fed7aa"/><text x="440" y="55" text-anchor="middle" class="svg-ink" font-size="13">4 Config</text><text x="440" y="74" text-anchor="middle" class="svg-muted" font-size="11">env variables</text>
<rect x="510" y="30" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="55" text-anchor="middle" class="svg-ink" font-size="13">5 Network</text><text x="570" y="74" text-anchor="middle" class="svg-muted" font-size="11">DNS, firewall, DB</text>
<line x1="120" y1="60" x2="135" y2="60" stroke="#64748b" stroke-width="2"/><line x1="245" y1="60" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="370" y1="60" x2="385" y2="60" stroke="#64748b" stroke-width="2"/><line x1="495" y1="60" x2="510" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">EK cheez badlo, dobara test karo, jo fix kiya woh likh lo</text>
</svg><p class="cap">Sabse sasta check pehle, sabse mehenga baad mein, aur ek baar mein ek hi cheez badlo.</p></div>

<h3>Aam symptoms aur causes</h3>
<table class="cmp"><tr><th>Symptom</th><th>Mumkin cause</th><th>Check</th></tr>
<tr><td>Container <code>docker ps</code> mein nahi</td><td>Exited: crash ya galat CMD</td><td><code>docker ps -a</code>, <code>docker logs</code></td></tr>
<tr><td>"port is already allocated"</td><td>Doosra container woh host port pakde hai</td><td><code>docker ps</code> ka PORTS column</td></tr>
<tr><td>Connection refused</td><td>Kuch sun nahi raha; galat port; app 127.0.0.1 par bound</td><td><code>ss -tlnp</code>, logs</td></tr>
<tr><td>Connection time out</td><td>Firewall, security group ya route drop kar raha hai</td><td>Path ke rules, <code>curl -v</code></td></tr>
<tr><td>App start hoke mar jaati hai</td><td>Config missing ya dependency unreachable</td><td>Aakhri log lines, <code>env</code></td></tr>
<tr><td>Staging mein chalta, prod mein fail</td><td>Config ya version ka farq</td><td>Image tags aur variables compare karo</td></tr></table>

<h3>Lab 1 walk-through: Web app ko container mein ship karo</h3>
<p>DOCK01 par aap production 8080 par, staging 8081 par chalate ho, inspect karte ho, clash trigger karte ho aur staging stop karte ho. Key outputs:</p>
<pre class="out">DOCK01&gt; docker run -d --name nk-web -p 8080:80 nginx
DOCK01&gt; docker run -d --name nk-web-staging -p 8081:80 nginx
DOCK01&gt; docker inspect nk-web
  ...
  "Ports": { <span class="hl">"80/tcp": [ { "HostIp": "0.0.0.0", "HostPort": "8080" } ]</span> }

DOCK01&gt; docker run -d --name nk-web3 -p 8080:80 nginx
docker: Error response from daemon: driver failed programming external connectivity: Bind for 0.0.0.0:8080 failed: <span class="hl">port is already allocated.</span></pre>
<p><code>docker inspect</code> mein Ports map ki key (<code>80/tcp</code>) <b>container</b> port hai, aur <code>HostPort</code> host side. Staging host par 8081 use karta hai lekin andar wahi 80, isliye dono saath rah sakte hain. <code>docker stop nk-web-staging</code> ke baad <code>docker ps -a</code> use <code>Exited (0)</code> dikhata hai jabki nk-web <code>Up</code> rehta hai.</p>

<h3>Lab 2 walk-through: Release jo start nahi ho rahi</h3>
<p>shop-v2 ko 8080 par serve karna hai, lekin shop-v1 abhi bhi use pakde hai. Status se shuru karo:</p>
<pre class="out">DOCK01&gt; docker run -d --name shop-v2 -p 8080:80 nginx
docker: Error response from daemon: ... Bind for 0.0.0.0:8080 failed: <span class="hl">port is already allocated.</span>

DOCK01&gt; docker ps -a
CONTAINER ID   IMAGE      COMMAND                  STATUS              PORTS                    NAMES
e8218d140000   nginx      "nginx -g daemon of…"    Up 5 seconds        <span class="hl">0.0.0.0:8080-&gt;80/tcp</span>     shop-v1
2836cc920000   redis      "/entrypoint.sh"         Up 5 seconds        0.0.0.0:6379-&gt;6379/tcp   cache
53567c020000   alpine     "/entrypoint.sh"         <span class="hl">Exited (0)</span>                              report-job</pre>
<p>Padhna: shop-v1 host port 8080 ka maalik hai; <code>cache</code> ko chhedna nahi (doosri services us par depend hain); <code>report-job</code> exited hai, jo khatam hue batch job ke liye normal hai aur yahan <b>problem nahi</b> hai. Safe fix sirf purani release hataana hai: <code>docker stop shop-v1</code>, <code>docker rm shop-v1</code>, phir shop-v2 ke liye <code>docker run</code> dohrao aur <code>docker ps</code> aur <code>docker inspect shop-v2</code> se verify karo.</p>
<div class="note"><p>Real environment mein hatane se pehle <code>docker logs shop-v1</code> bhi chalate, aur behtar hota blue/green: naya version spare port par start karo, test karo, phir switch karo. Simulator <code>docker logs</code> nahi deta, isliye upar ka output aur ps output apna evidence maano.</p></div>

<div class="warn"><p><b>Common mistakes:</b> logs padhe bina sab kuch restart karna; <code>docker rm -f</code> se galat container hata dena; app galat address par bound ho aur host par port kholkar symptom fix karna; teen cheezein ek saath badalna taaki pata na chale kisne fix kiya.</p></div>
<div class="exam"><p><b>Exam trap:</b> "Connection refused" matlab host ne jawab diya aur wahan kuch sun nahi raha; <b>timeout</b> matlab packets ko jawab hi nahi mila (filtered ya route nahi). <code>Exited</code> container ek process hai jo khatam hua, network fault nahi. Rebuild se pehle hamesha logs dekho.</p></div>

<div class="scn"><h4>Release night par port clash</h4><p>Raat 23:30 Lucknow ki team ki quotes service ki release "port is already allocated" se fail hui. Thake engineer ne lagbhag sab par <code>docker rm -f</code> chala diya tha. Uski jagah on-call ne <code>docker ps</code> padha, dekha ki purana version 8080 pakde hai, sirf wahi container stop kiya, naya start kiya aur verify kiya. Total chaar minute, koi collateral damage nahi.</p><p><b>Lesson:</b> evidence padho, kam se kam badlo, verify karo.</p></div>

<div class="iv"><p class="q">"Container start nahi hota ya service unreachable hai. Kaise troubleshoot karte ho?"</p><p>Pehle status (<code>docker ps -a</code>), phir logs, phir ports aur mapping (<code>docker inspect</code>, <code>ss</code>, <code>curl</code>), phir config variables, phir network dependencies. Kaho ki ek baar mein ek variable badalte ho aur fix record karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routine: status, logs, ports, config, network; sabse sasta check pehle.</li>
<li>"Port is already allocated" = doosra container woh host port rakhe hai; PORTS column mein dhoondho.</li>
<li>Refused = kuch sun nahi raha; timeout = blocked ya route nahi.</li>
<li>Stopped (Exited) containers sirf <code>docker ps -a</code> se dikhte hain.</li>
<li>Purani release safely hatao: stop, remove, phir naya start karke verify.</li>
</ul></div>
`}};export{e as default};