var e={id:`lb-proxy-waf`,h:{en:`Load balancers, reverse proxies and the WAF`,hi:`Load balancers, reverse proxies aur WAF`},body:{en:`
<p>One server is one point of failure and one point of overload. Production applications run several copies and put smart devices in front of them. Three of those devices are named in the exam blueprint: the <b>load balancer</b>, the <b>reverse proxy</b> and the <b>web application firewall (WAF)</b>. In real products one box often does two or three of these jobs, so learn the <i>functions</i>, not the boxes.</p>

<h3>Analogy: the restaurant front of house</h3>
<p>A host at the door (the load balancer) greets each guest and sends them to a table with a free waiter. A waiter (the reverse proxy) takes the order to the kitchen so guests never walk into the kitchen; he also checks that the order is written on a proper slip. A security guard (the WAF) glances at suspicious slips before they reach the kitchen. The kitchen (the application) can then focus on cooking.</p>

<h3>Load balancer</h3>
<p>A <b>load balancer</b> spreads client requests across a pool of identical servers so no single one is overloaded, and keeps the service up if one fails. Layer 4 balancers decide by address and port (fast, protocol-agnostic); layer 7 balancers read the application request (path, host header, cookie) and can route <code>/api</code> to one pool and <code>/images</code> to another.</p>
<table class="cmp"><tr><th>Method</th><th>How it picks a server</th><th>Good when</th></tr>
<tr><td><b>Round robin</b></td><td>Takes turns: 1, 2, 3, 1, 2, 3</td><td>Servers are equal and requests are similar</td></tr>
<tr><td><b>Weighted round robin</b></td><td>Turns, but a bigger server gets more</td><td>Servers differ in size</td></tr>
<tr><td><b>Least connections</b></td><td>Sends to the server with the fewest active connections</td><td>Requests last for very different times</td></tr>
<tr><td><b>IP hash / source hash</b></td><td>Same client address always maps to the same server</td><td>You need a simple form of stickiness</td></tr>
</table>
<p><b>Persistence</b> (sticky sessions) keeps one client on the same server for a while, using the source IP or a cookie, because the application keeps session data in that server's memory. It works, but it weakens even distribution and loses the session if that server dies. A better design stores sessions in a shared place (a database or cache) so any server can answer; then persistence is not needed.</p>
<p><b>Health checks</b> are what make a load balancer a high-availability tool. The balancer probes every server (a TCP connect, or a request to a path like <code>/health</code> that must return 200). A server that fails several probes in a row is taken out of rotation; when it passes again it returns. Without health checks the balancer keeps sending users to a dead server. A good health path checks the application's real dependencies, not just that the web process is running.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Load balancer with health checks">
<rect x="20" y="95" width="90" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="130" text-anchor="middle" class="svg-ink" font-size="13">Clients</text>
<rect x="190" y="85" width="140" height="80" rx="8" fill="#ddd6fe"/><text x="260" y="115" text-anchor="middle" class="svg-ink" font-size="13">Load balancer</text><text x="260" y="135" text-anchor="middle" class="svg-muted" font-size="11">VIP 203.0.113.10:443</text>
<rect x="450" y="20" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="12">web1 10.30.0.20 UP</text>
<rect x="450" y="100" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="130" text-anchor="middle" class="svg-ink" font-size="12">web2 10.30.0.21 UP</text>
<rect x="450" y="180" width="160" height="50" rx="8" fill="#fecaca"/><text x="530" y="210" text-anchor="middle" class="svg-ink" font-size="12">web3 10.30.0.22 DOWN</text>
<line x1="110" y1="125" x2="188" y2="125" stroke="#64748b" stroke-width="2"/><line x1="330" y1="105" x2="448" y2="50" stroke="#64748b" stroke-width="2"/><line x1="330" y1="125" x2="448" y2="125" stroke="#64748b" stroke-width="2"/><line x1="330" y1="145" x2="448" y2="205" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="400" y="235" text-anchor="middle" class="svg-muted" font-size="11">failed probe: removed from rotation</text>
</svg><p class="cap">The balancer owns one virtual IP, probes each server and sends traffic only to healthy ones.</p></div>

<h3>Reverse proxy</h3>
<p>A <b>forward proxy</b> sits in front of <i>clients</i> and speaks for them to the internet. A <b>reverse proxy</b> sits in front of <i>servers</i> and speaks for them to clients. Clients talk only to the proxy; the real servers stay on a private network. It gives you:</p>
<ul>
<li><b>TLS termination (SSL offload):</b> the proxy holds the certificate and does the encryption work, and forwards plain or re-encrypted traffic to the backends. One place to install and renew certificates, and the application servers are freed from the cryptographic load. Where policy requires it, re-encrypt to the backend (TLS to the backend) so the internal hop is protected too.</li>
<li><b>Routing:</b> by host name or path to different applications.</li>
<li><b>Hiding the topology:</b> internal addresses and software details are not exposed.</li>
<li><b>Caching, compression and rate limiting</b> in one place.</li>
<li><b>Central logging</b> and, with the right headers, the original client address (<code>X-Forwarded-For</code>).</li>
</ul>
<pre class="code"><span class="c"># Reference code (not run in the simulator): nginx as reverse proxy + load balancer</span>
upstream shop_backend {
    least_conn;                                   <span class="c"># or omit for round robin, ip_hash for stickiness</span>
    server 10.30.0.20:8080 max_fails=3 fail_timeout=10s;   <span class="c"># passive health check</span>
    server 10.30.0.21:8080 max_fails=3 fail_timeout=10s;
}
server {
    listen 443 ssl;
    server_name shop.nwk.example;
    ssl_certificate     /etc/ssl/nk/shop.crt;
    ssl_certificate_key /etc/ssl/nk/shop.key;      <span class="c"># private key: mode 600, not in Git</span>
    location / {
        proxy_pass h&#116;tp://shop_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
server {
    listen 80;
    server_name shop.nwk.example;
    return 301 h&#116;tps://$host$request_uri;           <span class="c"># send plain requests to TLS</span>
}</pre>
<p>This is reference text: the lab's web server is a simple nginx service on port 80. Read it for the structure: a pool (<code>upstream</code>), an algorithm, health parameters, TLS on the front, plain or re-encrypted traffic behind, and a redirect from port 80.</p>

<h3>Web application firewall (WAF)</h3>
<p>A <b>WAF</b> inspects HTTP(S) requests at layer 7 and blocks those that match patterns of attack: typical injection strings, script tags in parameters, scanners, protocol violations, request floods. A network firewall asks "may this address reach port 443?"; a WAF asks "does this request to port 443 look malicious?". It is a <b>compensating control</b>: it buys time while a flaw is fixed in the code, and it adds visibility, but it does not replace secure coding. Run it in detect mode first, tune it to cut false positives, then enforce. A WAF needs the decrypted request, so it sits after TLS termination or on the proxy itself.</p>
<table class="cmp"><tr><th></th><th>Network firewall</th><th>WAF</th><th>Load balancer</th><th>Reverse proxy</th></tr>
<tr><td>Main question</td><td>May this address use this port?</td><td>Is this request an attack?</td><td>Which healthy server gets it?</td><td>Who speaks to the backend for the client?</td></tr>
<tr><td>Layer</td><td>3 and 4</td><td>7</td><td>4 or 7</td><td>7</td></tr>
<tr><td>Stops</td><td>Unwanted ports and sources</td><td>Injection, XSS patterns, bots</td><td>Overload, single failure</td><td>Exposure of backends</td></tr>
</table>
<div class="warn"><p><b>Common mistakes.</b> Health checks that only test the port (the app is hung but the port answers); sticky sessions as a substitute for sharing session data; trusting <code>X-Forwarded-For</code> from anyone (only accept it from your own proxy); a TLS-terminating proxy with the backend open to the whole network instead of only to the proxy; leaving the WAF in detect mode forever.</p></div>
<div class="exam"><p><b>Exam traps.</b> Round robin ignores load; least connections reacts to it. A reverse proxy protects servers, a forward proxy protects/represents clients. SSL offload means the proxy or balancer decrypts so the servers do not have to. A WAF complements, not replaces, input validation.</p></div>

<div class="scn"><h4>The health check that said OK to a broken app</h4><p>An online store lost orders for forty minutes although the load balancer showed all three servers green. The health probe only opened the TCP port; the application had lost its database connection but the web process still listened. The team changed the probe to request a health path that runs a trivial database query and returns 503 on failure, set it to remove a server after three failures, and alerted on the number of healthy members dropping below two.</p><p><b>Lesson:</b> a health check must test what users need, not just that a socket is open.</p></div>

<div class="iv"><p class="q">"Where do the firewall, load balancer, reverse proxy and WAF sit, and what does each do?"</p><p>Edge firewall first: it allows only 443 to the front end. Then WAF and TLS termination at the reverse proxy or load balancer, which inspects the decrypted request, picks a healthy server by round robin or least connections and forwards on a private network. Backend servers accept traffic only from the proxy through their own host firewall, and sessions are shared or sticky. Mention health checks, SSL offload and logging at the proxy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Load balancers spread traffic (round robin, weighted, least connections, hash) and use health checks to drop failed servers.</li>
<li>Persistence pins a client to a server; sharing session data is the cleaner design.</li>
<li>A reverse proxy fronts the servers: TLS termination, routing, hiding backends, caching, logging.</li>
<li>A WAF inspects layer 7 requests for attacks; it compensates for flaws but does not replace secure code.</li>
<li>Order: edge firewall, WAF and TLS, load balancer and proxy, host firewall, application.</li>
</ul></div>
`,hi:`
<p>Ek server ek single point of failure aur ek single point of overload hai. Production applications kai copies chalati hain aur unke aage smart devices lagati hain. Inme se teen devices exam blueprint mein naam se hain: <b>load balancer</b>, <b>reverse proxy</b> aur <b>web application firewall (WAF)</b>. Real products mein ek box aksar do ya teen kaam karta hai, isliye <i>functions</i> seekho, boxes nahi.</p>

<h3>Analogy: restaurant ka front of house</h3>
<p>Darwaze par host (load balancer) har guest ka swagat karke use khaali waiter wali table par bhejta hai. Waiter (reverse proxy) order kitchen tak le jata hai taaki guests kabhi kitchen mein na jaayein; woh yeh bhi dekhta hai ki order sahi slip par likha hai. Security guard (WAF) shak wali slips ko kitchen tak pahunchne se pehle ek nazar dekh leta hai. Kitchen (application) phir sirf khana banane par dhyan de sakti hai.</p>

<h3>Load balancer</h3>
<p><b>Load balancer</b> client requests ko identical servers ke pool mein baantta hai taaki koi ek overload na ho, aur ek fail ho jaye to service chalti rahe. Layer 4 balancers address aur port se decide karte hain (fast, protocol-agnostic); layer 7 balancers application request padhte hain (path, host header, cookie) aur <code>/api</code> ko ek pool aur <code>/images</code> ko doosre pool mein bhej sakte hain.</p>
<table class="cmp"><tr><th>Method</th><th>Server kaise chunta hai</th><th>Kab achha</th></tr>
<tr><td><b>Round robin</b></td><td>Baari-baari: 1, 2, 3, 1, 2, 3</td><td>Servers barabar hain aur requests ek jaisi</td></tr>
<tr><td><b>Weighted round robin</b></td><td>Baari-baari, par bade server ko zyada</td><td>Servers ki size alag hai</td></tr>
<tr><td><b>Least connections</b></td><td>Sabse kam active connections wale server ko bhejta hai</td><td>Requests bahut alag-alag der chalti hain</td></tr>
<tr><td><b>IP hash / source hash</b></td><td>Same client address hamesha same server par map</td><td>Aapko stickiness ka simple roop chahiye</td></tr>
</table>
<p><b>Persistence</b> (sticky sessions) ek client ko kuch der ke liye same server par rakhta hai, source IP ya cookie se, kyunki application session data us server ki memory mein rakhti hai. Yeh kaam karta hai, par even distribution kamzor karta hai aur woh server mar jaye to session kho jata hai. Behtar design session ko shared jagah (database ya cache) mein rakhta hai taaki koi bhi server jawab de sake; tab persistence ki zaroorat nahi.</p>
<p><b>Health checks</b> load balancer ko high-availability tool banate hain. Balancer har server ko probe karta hai (TCP connect, ya <code>/health</code> jaise path par request jo 200 return kare). Jo server lagatar kai probes fail kare use rotation se nikal diya jata hai; phir pass ho to wapas aata hai. Health checks ke bina balancer users ko mare hue server par bhejta rehta hai. Achha health path application ki asli dependencies check karta hai, sirf yeh nahi ki web process chal raha hai.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Health checks ke saath load balancer">
<rect x="20" y="95" width="90" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="130" text-anchor="middle" class="svg-ink" font-size="13">Clients</text>
<rect x="190" y="85" width="140" height="80" rx="8" fill="#ddd6fe"/><text x="260" y="115" text-anchor="middle" class="svg-ink" font-size="13">Load balancer</text><text x="260" y="135" text-anchor="middle" class="svg-muted" font-size="11">VIP 203.0.113.10:443</text>
<rect x="450" y="20" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="12">web1 10.30.0.20 UP</text>
<rect x="450" y="100" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="130" text-anchor="middle" class="svg-ink" font-size="12">web2 10.30.0.21 UP</text>
<rect x="450" y="180" width="160" height="50" rx="8" fill="#fecaca"/><text x="530" y="210" text-anchor="middle" class="svg-ink" font-size="12">web3 10.30.0.22 DOWN</text>
<line x1="110" y1="125" x2="188" y2="125" stroke="#64748b" stroke-width="2"/><line x1="330" y1="105" x2="448" y2="50" stroke="#64748b" stroke-width="2"/><line x1="330" y1="125" x2="448" y2="125" stroke="#64748b" stroke-width="2"/><line x1="330" y1="145" x2="448" y2="205" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="400" y="235" text-anchor="middle" class="svg-muted" font-size="11">probe fail: rotation se bahar</text>
</svg><p class="cap">Balancer ek virtual IP rakhta hai, har server ko probe karta hai aur sirf healthy servers ko traffic bhejta hai.</p></div>

<h3>Reverse proxy</h3>
<p><b>Forward proxy</b> <i>clients</i> ke aage baithta hai aur unki taraf se internet se baat karta hai. <b>Reverse proxy</b> <i>servers</i> ke aage baithta hai aur unki taraf se clients se baat karta hai. Clients sirf proxy se baat karte hain; asli servers private network par rehte hain. Yeh deta hai:</p>
<ul>
<li><b>TLS termination (SSL offload):</b> proxy certificate rakhta hai aur encryption ka kaam karta hai, aur backends ko plain ya re-encrypted traffic forward karta hai. Certificates install aur renew karne ki ek jagah, aur application servers cryptographic load se free. Policy ko zaroorat ho to backend tak re-encrypt karo (TLS to the backend) taaki internal hop bhi protected ho.</li>
<li><b>Routing:</b> host name ya path se alag applications tak.</li>
<li><b>Topology chhupana:</b> internal addresses aur software details expose nahi hote.</li>
<li><b>Caching, compression aur rate limiting</b> ek jagah.</li>
<li><b>Central logging</b> aur sahi headers ke saath asli client address (<code>X-Forwarded-For</code>).</li>
</ul>
<pre class="code"><span class="c"># Reference code (not run in the simulator): nginx reverse proxy + load balancer ki tarah</span>
upstream shop_backend {
    least_conn;                                   <span class="c"># ya round robin ke liye hata do, stickiness ke liye ip_hash</span>
    server 10.30.0.20:8080 max_fails=3 fail_timeout=10s;   <span class="c"># passive health check</span>
    server 10.30.0.21:8080 max_fails=3 fail_timeout=10s;
}
server {
    listen 443 ssl;
    server_name shop.nwk.example;
    ssl_certificate     /etc/ssl/nk/shop.crt;
    ssl_certificate_key /etc/ssl/nk/shop.key;      <span class="c"># private key: mode 600, Git mein nahi</span>
    location / {
        proxy_pass h&#116;tp://shop_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
server {
    listen 80;
    server_name shop.nwk.example;
    return 301 h&#116;tps://$host$request_uri;           <span class="c"># plain requests ko TLS par bhejo</span>
}</pre>
<p>Yeh reference text hai: lab ka web server port 80 par simple nginx service hai. Structure ke liye padho: pool (<code>upstream</code>), algorithm, health parameters, aage TLS, peeche plain ya re-encrypted traffic, aur port 80 se redirect.</p>

<h3>Web application firewall (WAF)</h3>
<p><b>WAF</b> layer 7 par HTTP(S) requests inspect karta hai aur attack patterns se match karne wali requests block karta hai: typical injection strings, parameters mein script tags, scanners, protocol violations, request floods. Network firewall poochta hai "kya yeh address port 443 tak pahunch sakta hai?"; WAF poochta hai "port 443 ki yeh request malicious dikhti hai kya?". Yeh ek <b>compensating control</b> hai: code mein flaw theek hone tak waqt kharid leta hai aur visibility deta hai, par secure coding ki jagah nahi leta. Pehle detect mode mein chalao, false positives kam karne ke liye tune karo, phir enforce karo. WAF ko decrypted request chahiye, isliye woh TLS termination ke baad ya proxy par hi baithta hai.</p>
<table class="cmp"><tr><th></th><th>Network firewall</th><th>WAF</th><th>Load balancer</th><th>Reverse proxy</th></tr>
<tr><td>Main sawal</td><td>Kya yeh address yeh port use kar sakta hai?</td><td>Kya yeh request attack hai?</td><td>Kaunse healthy server ko jaye?</td><td>Client ki taraf se backend se kaun baat kare?</td></tr>
<tr><td>Layer</td><td>3 aur 4</td><td>7</td><td>4 ya 7</td><td>7</td></tr>
<tr><td>Rokta hai</td><td>Unwanted ports aur sources</td><td>Injection, XSS patterns, bots</td><td>Overload, single failure</td><td>Backends ka exposure</td></tr>
</table>
<div class="warn"><p><b>Common mistakes.</b> Sirf port test karne wale health checks (app hung hai par port jawab deta hai); session data share karne ki jagah sticky sessions; <code>X-Forwarded-For</code> par kisi par bhi bharosa (sirf apne proxy se accept karo); TLS terminate karne wala proxy jabki backend poore network ke liye khula hai, sirf proxy ke liye nahi; WAF ko hamesha detect mode mein chhodna.</p></div>
<div class="exam"><p><b>Exam traps.</b> Round robin load ignore karta hai; least connections uspar react karta hai. Reverse proxy servers ko protect karta hai, forward proxy clients ko protect/represent karta hai. SSL offload matlab proxy ya balancer decrypt karta hai taaki servers ko na karna pade. WAF input validation ka complement hai, replacement nahi.</p></div>

<div class="scn"><h4>Health check ne toote app ko OK kaha</h4><p>Ek online store ne chalees minute orders khoye jabki load balancer teeno servers green dikha raha tha. Health probe sirf TCP port kholta tha; application ka database connection chala gaya tha par web process ab bhi sun raha tha. Team ne probe ko aise health path par badla jo trivial database query chalata hai aur failure par 503 deta hai, teen failures ke baad server hatane par set kiya, aur healthy members ke do se neeche girne par alert lagaya.</p><p><b>Lesson:</b> health check woh test kare jo users ko chahiye, sirf yeh nahi ki socket khula hai.</p></div>

<div class="iv"><p class="q">"Firewall, load balancer, reverse proxy aur WAF kahan baithte hain, aur har ek kya karta hai?"</p><p>Pehle edge firewall: woh front end tak sirf 443 allow karta hai. Phir reverse proxy ya load balancer par WAF aur TLS termination, jo decrypted request inspect karta hai, round robin ya least connections se healthy server chunta hai aur private network par forward karta hai. Backend servers apne host firewall se sirf proxy se traffic accept karte hain, aur sessions shared ya sticky hote hain. Health checks, SSL offload aur proxy par logging ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Load balancers traffic baantte hain (round robin, weighted, least connections, hash) aur health checks se failed servers hatate hain.</li>
<li>Persistence client ko server se pin karta hai; session data share karna saaf design hai.</li>
<li>Reverse proxy servers ke aage hota hai: TLS termination, routing, backends chhupana, caching, logging.</li>
<li>WAF layer 7 requests ko attacks ke liye inspect karta hai; flaws compensate karta hai par secure code ki jagah nahi leta.</li>
<li>Order: edge firewall, WAF aur TLS, load balancer aur proxy, host firewall, application.</li>
</ul></div>
`}};export{e as default};