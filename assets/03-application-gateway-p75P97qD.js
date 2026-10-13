var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="{{aria}}">
<rect x="10" y="100" width="80" height="50" rx="6" fill="#fed7aa"/><text x="50" y="130" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="120" y="20" width="270" height="230" rx="10" fill="#fde68a"/><text x="255" y="42" text-anchor="middle" class="svg-ink" font-size="13">Application Gateway v2</text>
<rect x="135" y="55" width="240" height="36" rx="6" fill="#ffffff" stroke="#64748b"/><text x="255" y="78" text-anchor="middle" class="svg-ink" font-size="12">{{l1}}</text>
<rect x="135" y="100" width="240" height="36" rx="6" fill="#ffffff" stroke="#64748b"/><text x="255" y="123" text-anchor="middle" class="svg-ink" font-size="12">WAF policy</text>
<rect x="135" y="145" width="240" height="36" rx="6" fill="#ffffff" stroke="#64748b"/><text x="255" y="168" text-anchor="middle" class="svg-ink" font-size="12">{{l2}}</text>
<rect x="135" y="190" width="240" height="46" rx="6" fill="#ffffff" stroke="#64748b"/><text x="255" y="210" text-anchor="middle" class="svg-ink" font-size="12">{{l3}}</text><text x="255" y="226" text-anchor="middle" class="svg-muted" font-size="12">{{l4}}</text>
<rect x="450" y="35" width="180" height="90" rx="8" fill="#bbf7d0"/><text x="540" y="58" text-anchor="middle" class="svg-ink" font-size="13">pool-web</text><text x="540" y="80" text-anchor="middle" class="svg-muted" font-size="12">10.30.2.4  10.30.2.5</text><text x="540" y="104" text-anchor="middle" class="svg-accent" font-size="12">{{web}}</text>
<rect x="450" y="145" width="180" height="90" rx="8" fill="#bae6fd"/><text x="540" y="168" text-anchor="middle" class="svg-ink" font-size="13">pool-api</text><text x="540" y="190" text-anchor="middle" class="svg-muted" font-size="12">10.30.3.4  10.30.3.5</text><text x="540" y="214" text-anchor="middle" class="svg-accent" font-size="12">{{api}}</text>
<line x1="90" y1="125" x2="120" y2="125" stroke="#64748b" stroke-width="2"/><line x1="390" y1="165" x2="450" y2="80" stroke="#64748b" stroke-width="2"/><line x1="390" y1="212" x2="450" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`Application Gateway path-based routing`,l1:`Listener: port 443 + certificate`,l2:`Rule: path /api/* to pool-api`,l3:`Backend settings`,l4:`port, protocol, probe, timeout`,web:`default path /`,api:`path /api/*`,cap:`Application Gateway terminates TLS, applies WAF, then routes by URL path or host name to the right backend pool.`}),r=e(t,{aria:`Application Gateway path-based routing`,l1:`Listener: port 443 + certificate`,l2:`Rule: path /api/* pool-api ko`,l3:`Backend settings`,l4:`port, protocol, probe, timeout`,web:`default path /`,api:`path /api/*`,cap:`Application Gateway TLS terminate karta hai, WAF lagata hai, phir URL path ya host name se sahi backend pool ko route karta hai.`}),i={id:`application-gateway`,h:{en:`Application Gateway v2 (layer 7) and WAF`,hi:`Application Gateway v2 (layer 7) aur WAF`},body:{en:`
<h3>What it is</h3>
<p>Azure Application Gateway is a regional <b>layer-7 load balancer</b> for web traffic. Unlike Load Balancer it is a <b>reverse proxy</b>: it terminates the client's connection, reads the HTTP request (host name, URL path, headers, cookies) and opens a new connection to a backend. That awareness unlocks features a layer-4 balancer cannot offer: routing by URL path or host, TLS termination, cookie-based session affinity, redirects, header rewrites and a <b>Web Application Firewall (WAF)</b> that blocks common attacks such as SQL injection and cross-site scripting (defensive protection using managed rule sets).</p>

<h3>v1 versus v2</h3>
<p>Use the <b>v2</b> SKUs: <code>Standard_v2</code> and <code>WAF_v2</code>. They add autoscaling, zone redundancy, static VIP, faster provisioning and header rewrite. The v1 SKUs are being retired (announced date 28 April 2026; verify the current state) so any new design uses v2 only.</p>

<h3>The building blocks</h3>
<dl class="terms">
<dt>Dedicated subnet</dt><dd>Application Gateway v2 lives in its own subnet (no other resource types in it; a /24 is commonly recommended, verify the sizing guidance). NSG rules must allow the management traffic from the GatewayManager tag on ports 65200 to 65535 for v2 (verify) plus client ports.</dd>
<dt>Frontend IP</dt><dd>A public IP (Standard, static), a private IP, or both. Pure private gateways have extra requirements (verify).</dd>
<dt>Listener</dt><dd>Port, protocol and, for HTTPS, the certificate. <b>Basic</b> listeners answer one site; <b>multi-site</b> listeners match host names such as shop.example and api.example.</dd>
<dt>Request routing rule</dt><dd>Links a listener to a backend pool and backend settings. <b>Basic</b> rules send everything to one pool; <b>path-based</b> rules use a URL path map such as /api/* to pool-api and default to pool-web.</dd>
<dt>Backend pool</dt><dd>IPs, FQDNs, VMs, scale sets or App Service targets.</dd>
<dt>Backend settings</dt><dd>Protocol and port used to the backend, cookie affinity, connection draining, request timeout, host-name override.</dd>
<dt>Health probe</dt><dd>Custom probe with a path and expected status; by default the gateway probes the backend settings port and root path. Unhealthy members get no traffic.</dd>
<dt>WAF policy</dt><dd>Managed rule set (OWASP-based; verify the current set name and version), custom rules, exclusions, and a mode: <b>Detection</b> (log only) or <b>Prevention</b> (block).</dd>
</dl>
`+n+`
<h3>TLS options</h3>
<ul>
<li><b>TLS termination</b> at the gateway: certificate on the listener; traffic to the backend in clear text inside the VNet. Offloads CPU from the web servers.</li>
<li><b>End-to-end TLS</b>: re-encrypt to the backend; the backend certificate must be trusted by the gateway (verify the current trusted-root requirements).</li>
<li><b>Certificates from Key Vault</b> via a managed identity, so renewals do not need a redeploy.</li>
</ul>

<h3>The client IP</h3>
<p>Because Application Gateway is a proxy, the backend sees the gateway's private IP as the source. The original client address arrives in the <code>X-Forwarded-For</code> header, which web servers and logs must read.</p>

<h3>Cost shape (pricing structure only)</h3>
<p>v2 bills a <b>fixed hourly charge for the gateway</b> plus <b>capacity units</b> consumed per hour (a blend of compute, connections and throughput), with a higher hourly rate for WAF_v2 (verify). It bills while it exists, even with no traffic. An idle gateway is one of the commonest unexpected bills in practice subscriptions: delete it when you finish.</p>

<div class="eg"><b>Worked example.</b> Gateway frontend 203.0.113.30. Listener on 443 with certificate for shop.example. Path map: /api/* goes to pool-api (10.30.3.4 and 10.30.3.5, port 8080), everything else to pool-web (10.30.2.4 and 10.30.2.5, port 80). A request for /api/orders reaches an API VM; a request for /index.html reaches a web VM. The backend logs show source 10.30.4.5 (the gateway) and an X-Forwarded-For with the client address.</div>

<div class="note"><b>AWS vs Azure.</b> Application Gateway with WAF is like an AWS Application Load Balancer with AWS WAF. A key difference: Azure's gateway lives in a dedicated subnet and has its own instance count and autoscale settings, and WAF is built into the WAF_v2 SKU or a WAF policy attached to it.</div>

<div class="warn"><b>Common mistakes.</b> Putting other resources in the gateway subnet; blocking management ports with an NSG; forgetting that the health probe uses the backend settings port and host header (a probe 404 marks the pool unhealthy: 502 Bad Gateway to users); leaving WAF in Detection mode and assuming it blocks; running a gateway all weekend.</div>
<div class="exam"><b>Exam trap.</b> A <b>502 Bad Gateway</b> from Application Gateway usually means no healthy backend: check probes, backend settings protocol and port, NSG, and certificates. Layer 7 path routing needs Application Gateway or Front Door, not Load Balancer.</div>

<div class="scn"><h4>Everything returned 502</h4><p>After a release the shop returned 502 for every request. The portal showed backend health Unhealthy. The probe was a custom one on path /health expecting 200, but the new build returned 301 redirecting to HTTPS. Changing the probe to the redirect-aware path (and fixing the app to answer 200 on /health) restored traffic, and the team added a probe test to their release checklist.</p><p><b>Lesson:</b> probes are part of the application contract.</p></div>

<div class="iv"><p class="q">"What is the difference between Load Balancer and Application Gateway?"</p><p>Load Balancer is layer 4: it forwards TCP or UDP flows by IP and port and is not aware of HTTP. Application Gateway is a layer-7 reverse proxy: it terminates TLS, routes by host and path, offers WAF, cookie affinity and header rewrite, and sits in its own subnet with higher cost and latency overhead.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Application Gateway v2 is a regional layer-7 reverse proxy with autoscale, zones and WAF.</li>
<li>Listener, rule, backend settings, pool and probe are the core objects; path-based and multi-site routing are rule types.</li>
<li>WAF has Detection and Prevention modes.</li>
<li>Backend sees the gateway as source; client IP is in X-Forwarded-For.</li>
<li>It bills hourly (fixed plus capacity units): delete labs.</li>
</ul></div>
`,hi:`
<h3>Yeh kya hai</h3>
<p>Azure Application Gateway web traffic ke liye regional <b>layer-7 load balancer</b> hai. Load Balancer ke ulta yeh <b>reverse proxy</b> hai: client ka connection terminate karta hai, HTTP request (host name, URL path, headers, cookies) padhta hai aur backend ke liye naya connection kholta hai. Yeh awareness aise features deti hai jo layer-4 balancer nahi de sakta: URL path ya host se routing, TLS termination, cookie-based session affinity, redirects, header rewrites aur <b>Web Application Firewall (WAF)</b> jo SQL injection aur cross-site scripting jaise common attacks ko block karta hai (managed rule sets se defensive protection).</p>

<h3>v1 versus v2</h3>
<p><b>v2</b> SKUs use karo: <code>Standard_v2</code> aur <code>WAF_v2</code>. Inmein autoscaling, zone redundancy, static VIP, tez provisioning aur header rewrite hai. v1 SKUs retire ho rahe hain (announced date 28 April 2026; current state verify karo), isliye naya design sirf v2 use kare.</p>

<h3>Building blocks</h3>
<dl class="terms">
<dt>Dedicated subnet</dt><dd>Application Gateway v2 apne subnet mein rehta hai (usme koi aur resource type nahi; /24 aam taur par recommend hota hai, sizing guidance verify karo). NSG rules ko GatewayManager tag se v2 ke liye ports 65200 se 65535 par management traffic allow karna chahiye (verify) plus client ports.</dd>
<dt>Frontend IP</dt><dd>Public IP (Standard, static), private IP, ya dono. Sirf private gateways ki extra requirements hain (verify).</dd>
<dt>Listener</dt><dd>Port, protocol aur HTTPS ke liye certificate. <b>Basic</b> listeners ek site ko jawab dete hain; <b>multi-site</b> listeners shop.example aur api.example jaise host names match karte hain.</dd>
<dt>Request routing rule</dt><dd>Listener ko backend pool aur backend settings se jodta hai. <b>Basic</b> rules sab kuch ek pool ko bhejte hain; <b>path-based</b> rules URL path map use karte hain jaise /api/* pool-api ko aur default pool-web ko.</dd>
<dt>Backend pool</dt><dd>IPs, FQDNs, VMs, scale sets ya App Service targets.</dd>
<dt>Backend settings</dt><dd>Backend ke liye protocol aur port, cookie affinity, connection draining, request timeout, host-name override.</dd>
<dt>Health probe</dt><dd>Path aur expected status wala custom probe; default mein gateway backend settings ke port aur root path ko probe karta hai. Unhealthy members ko traffic nahi milta.</dd>
<dt>WAF policy</dt><dd>Managed rule set (OWASP-based; current set ka naam aur version verify karo), custom rules, exclusions, aur mode: <b>Detection</b> (sirf log) ya <b>Prevention</b> (block).</dd>
</dl>
`+r+`
<h3>TLS options</h3>
<ul>
<li>Gateway par <b>TLS termination</b>: certificate listener par; backend tak VNet ke andar clear text traffic. Web servers ka CPU bachta hai.</li>
<li><b>End-to-end TLS</b>: backend tak re-encrypt; backend certificate gateway ke liye trusted hona chahiye (current trusted-root requirements verify karo).</li>
<li>Managed identity se <b>Key Vault ke certificates</b>, taaki renewals ke liye redeploy na karna pade.</li>
</ul>

<h3>Client IP</h3>
<p>Application Gateway proxy hai, isliye backend ko source ki tarah gateway ka private IP dikhta hai. Asli client address <code>X-Forwarded-For</code> header mein aata hai, jise web servers aur logs ko padhna chahiye.</p>

<h3>Cost shape (sirf pricing structure)</h3>
<p>v2 <b>gateway ka fixed hourly charge</b> plus har ghante consume hue <b>capacity units</b> (compute, connections aur throughput ka mix) bill karta hai, WAF_v2 ke liye hourly rate zyada (verify). Yeh exist karne tak bill karta hai, traffic ke bina bhi. Idle gateway practice subscriptions mein sabse common unexpected bills mein se ek hai: khatam karne par delete karo.</p>

<div class="eg"><b>Worked example.</b> Gateway frontend 203.0.113.30. 443 par listener, shop.example ke certificate ke saath. Path map: /api/* pool-api (10.30.3.4 aur 10.30.3.5, port 8080) ko, baaki sab pool-web (10.30.2.4 aur 10.30.2.5, port 80) ko. /api/orders ki request API VM tak pahunchti hai; /index.html ki request web VM tak. Backend logs mein source 10.30.4.5 (gateway) aur client address wala X-Forwarded-For dikhta hai.</div>

<div class="note"><b>AWS vs Azure.</b> WAF ke saath Application Gateway AWS WAF ke saath AWS Application Load Balancer jaisa hai. Ek bada farq: Azure ka gateway dedicated subnet mein rehta hai aur uske apne instance count aur autoscale settings hain, aur WAF WAF_v2 SKU mein ya us se attached WAF policy mein built-in hai.</div>

<div class="warn"><b>Common mistakes.</b> Gateway subnet mein doosre resources rakhna; NSG se management ports block karna; bhoolna ki health probe backend settings ka port aur host header use karta hai (probe par 404 pool ko unhealthy mark karta hai: users ko 502 Bad Gateway); WAF ko Detection mode mein chhodkar maan lena ki woh block karta hai; gateway ko poora weekend chalta chhodna.</div>
<div class="exam"><b>Exam trap.</b> Application Gateway se <b>502 Bad Gateway</b> aam taur par matlab koi healthy backend nahi: probes, backend settings protocol aur port, NSG aur certificates check karo. Layer 7 path routing ke liye Application Gateway ya Front Door chahiye, Load Balancer nahi.</div>

<div class="scn"><h4>Sab 502 de raha tha</h4><p>Release ke baad shop har request par 502 de rahi thi. Portal mein backend health Unhealthy thi. Probe /health path par custom tha jo 200 expect karta tha, par naya build HTTPS par redirect karke 301 de raha tha. Probe ko redirect-aware path par badalne (aur app ko /health par 200 dene ke liye fix karne) se traffic wapas aaya, aur team ne release checklist mein probe test jod diya.</p><p><b>Lesson:</b> probes application contract ka hissa hain.</p></div>

<div class="iv"><p class="q">"Load Balancer aur Application Gateway mein kya farq hai?"</p><p>Load Balancer layer 4 hai: TCP ya UDP flows ko IP aur port se forward karta hai aur HTTP se anjaan hai. Application Gateway layer-7 reverse proxy hai: TLS terminate karta hai, host aur path se route karta hai, WAF, cookie affinity aur header rewrite deta hai, aur apne subnet mein rehta hai, zyada cost aur latency overhead ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Application Gateway v2 autoscale, zones aur WAF wala regional layer-7 reverse proxy hai.</li>
<li>Listener, rule, backend settings, pool aur probe core objects hain; path-based aur multi-site routing rule types hain.</li>
<li>WAF ke Detection aur Prevention modes hain.</li>
<li>Backend gateway ko source dekhta hai; client IP X-Forwarded-For mein hai.</li>
<li>Yeh hourly bill karta hai (fixed plus capacity units): labs delete karo.</li>
</ul></div>
`}};export{i as default};