var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="{{aria}}">
<rect x="20" y="10" width="600" height="38" rx="6" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">{{l1}}</text>
<rect x="20" y="58" width="600" height="38" rx="6" fill="#ddd6fe"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">{{l2}}</text>
<rect x="20" y="106" width="600" height="38" rx="6" fill="#fde68a"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">{{l3}}</text>
<rect x="20" y="154" width="600" height="38" rx="6" fill="#fed7aa"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">{{l4}}</text>
<rect x="20" y="202" width="600" height="38" rx="6" fill="#bbf7d0"/><text x="320" y="226" text-anchor="middle" class="svg-ink" font-size="13">{{l5}}</text>
<text x="320" y="268" text-anchor="middle" class="svg-muted" font-size="12">{{n}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`Load balancer troubleshooting layers`,l1:`1 Frontend: right IP, port, protocol, DNS name?`,l2:`2 Health: are backends Healthy? (probe path, port, NSG tag)`,l3:`3 Rules and pool: rule maps to the right pool and port? members present?`,l4:`4 Filters: NSG, OS firewall, WAF, origin lock allow the flow?`,l5:`5 Application: listening on 0.0.0.0, returns the expected code`,n:`Health is the pivot: if backends are unhealthy, nothing else matters yet.`,cap:`Work from the client side inward. Start with backend health because it explains most outages.`}),r=e(t,{aria:`Load balancer troubleshooting layers`,l1:`1 Frontend: sahi IP, port, protocol, DNS name?`,l2:`2 Health: kya backends Healthy hain? (probe path, port, NSG tag)`,l3:`3 Rules aur pool: rule sahi pool aur port se map? members maujood?`,l4:`4 Filters: NSG, OS firewall, WAF, origin lock flow allow karte hain?`,l5:`5 Application: 0.0.0.0 par listen, expected code return`,n:`Health pivot hai: backends unhealthy hon to baaki kuch abhi maayne nahi rakhta.`,cap:`Client side se andar ki taraf chalo. Backend health se shuru karo kyunki yeh zyadatar outages samjhata hai.`}),i={id:`troubleshooting`,h:{en:`Troubleshooting load balancing`,hi:`Load balancing troubleshoot karna`},body:{en:`
<h3>The method</h3>
<p>Every load-balancing problem has the same shape: a client sends a request to a frontend, a service picks a backend, the backend answers. Failures hide at one of five layers. The fastest habit is to look at <b>backend health first</b>, because unhealthy backends explain most "it just times out" tickets.</p>
`+n+`
<h3>Layer 1: the frontend</h3>
<p>Is the client calling the right IP or name, port and protocol? For a public Load Balancer confirm the frontend IP with <code>az network public-ip show</code>. For DNS-based services check what the name resolves to (<code>nslookup shop.example</code>) and whether a Traffic Manager or Front Door endpoint is the target.</p>

<h3>Layer 2: health</h3>
<pre class="code"><span class="c"># Load Balancer: probe health metric and the probe definition</span>
LBID=$(az network lb show -g nk-lb-rg -n nk-lb --query id -o tsv)
az monitor metrics list --resource $LBID --metric DipAvailability --interval PT1M --offset 15m -o table
az network lb probe list -g nk-lb-rg --lb-name nk-lb -o table

<span class="c"># Application Gateway: per-server health</span>
az network application-gateway show-backend-health -g nk-agw-rg -n nk-agw -o json</pre>
<pre class="out">Illustrative output
Probe health (Load Balancer metric): <span class="hl">0 %</span>   all backends fail the probe
Application Gateway: server 10.40.2.4  health: <span class="hl">Unhealthy</span>  (probe returned 404)</pre>
<p>Typical causes: probe port or path wrong; the application listens on 127.0.0.1 only instead of 0.0.0.0; an NSG blocks the probe (for Load Balancer the source is 168.63.129.16, tag <code>AzureLoadBalancer</code>; for Application Gateway the gateway subnet must reach the backend); the OS firewall blocks the port; the app returns 301, 401 or 500 on the probe path.</p>

<h3>Layer 3: rules and pool</h3>
<ul>
<li>Does the rule map the frontend port to the correct backend port and pool, and use the intended probe?</li>
<li>Are the VM NICs actually members of the pool (a VM created "behind" nothing is invisible)?</li>
<li>Is the pool in the same VNet as the frontend (Standard Load Balancer backends must be in one VNet)?</li>
<li>For Application Gateway: does the listener match the host name in the request (multi-site)? Does the path map send the path to the intended pool?</li>
</ul>

<h3>Layer 4: filters</h3>
<ul>
<li><b>NSG</b>: Standard SKU is closed until allowed. Check effective security rules on the NIC and subnet, or use IP flow verify.</li>
<li><b>OS firewall</b> (ufw, firewalld, Windows Firewall) on the backend.</li>
<li><b>WAF</b>: 403 responses with a rule ID in the WAF log mean a rule matched. Prevention mode blocks; add a narrow exclusion or tune the rule rather than switching WAF off.</li>
<li><b>Origin lock</b>: if a Front Door origin allows only Front Door addresses, direct tests from your laptop will fail by design.</li>
</ul>

<h3>Layer 5: the application</h3>
<p>From a VM in the same VNet, call the backend directly: <code>curl 10.30.2.4</code>. If that works but the load balancer fails, the problem is in the service configuration. If it fails, the problem is the app or the OS.</p>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>Standard LB: timeout, VMs look fine</td><td>NSG blocking client port or the AzureLoadBalancer tag; probe failing</td></tr>
<tr><td>Uneven load across backends</td><td>Hash distribution with few clients; source IP affinity; long-lived connections</td></tr>
<tr><td>Backend VM cannot reach its own internal LB frontend</td><td>Hairpin limitation of internal Load Balancer</td></tr>
<tr><td>Application Gateway 502</td><td>No healthy backend; probe or backend settings mismatch; certificate</td></tr>
<tr><td>Application Gateway 504</td><td>Backend too slow; request timeout in backend settings too low</td></tr>
<tr><td>403 from a gateway or Front Door</td><td>WAF rule matched (check WAF logs)</td></tr>
<tr><td>Front Door 503</td><td>No healthy origin in the origin group</td></tr>
<tr><td>Traffic Manager endpoint Degraded</td><td>Its probe fails; check the probe path and port</td></tr>
<tr><td>Failover is slow with Traffic Manager</td><td>DNS TTL and resolver caching; probe interval times tolerated failures</td></tr>
<tr><td>Intermittent outbound failures from the pool</td><td>SNAT exhaustion (see the outbound module)</td></tr></table>

<div class="eg"><b>Worked example.</b> Ticket: public Load Balancer 203.0.113.20 times out. Step 1: frontend IP is correct. Step 2: probe health metric is 0 percent. Step 3: rule and pool look right. Step 4: curl from a jump VM to 10.30.2.4 works, so the app is up. The probe uses port 8080 but nginx listens on 80: a one-line change to the probe port fixes health, and the timeout disappears.</div>

<div class="warn"><b>Common mistakes.</b> Debugging the application before looking at health; changing the rule and the NSG and the probe at the same time; testing the frontend from a backend VM and hitting the hairpin limit; forgetting that a WAF in Detection mode only logs.</div>
<div class="exam"><b>Exam trap.</b> "All backends show unhealthy, application works when called directly." Answer: probe misconfiguration or an NSG blocking the probe source (168.63.129.16 / AzureLoadBalancer tag), not the application.</div>

<div class="scn"><h4>Internal LB, one VM cannot call it</h4><p>An internal Load Balancer balanced two API VMs. Calls from the web tier worked, but api-1 calling the same frontend IP sometimes hung. The pattern was random and 50 percent. The cause was the hairpin limitation: when the hash chose api-1 itself as the backend, the flow failed. The team moved the job that called the frontend to a separate subnet or VM, and for self-calls used the local address.</p><p><b>Lesson:</b> a backend instance cannot reliably call its own internal load balancer frontend.</p></div>

<div class="iv"><p class="q">"Users report a timeout through a Standard Load Balancer. How do you proceed?"</p><p>Check backend health first (probe metric and probe definition), then the NSG for client traffic and the AzureLoadBalancer tag, rule mapping and pool membership, the OS firewall and the app listening port. Test the backend directly from inside the VNet to separate application faults from load balancer configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start with backend health; most outages show up there.</li>
<li>Standard SKU is closed by default: NSGs must allow clients and the probe.</li>
<li>Application Gateway: 502 means no healthy backend, 504 means slow backend, 403 may be WAF.</li>
<li>Test backends directly to separate app faults from service configuration.</li>
<li>Traffic Manager failover depends on DNS TTL; Front Door fails over in seconds.</li>
</ul></div>
`,hi:`
<h3>Method</h3>
<p>Har load-balancing problem ki shakal ek hoti hai: client frontend ko request bhejta hai, service backend chunti hai, backend jawab deta hai. Failures paanch layers mein se kisi ek mein chhupi hoti hain. Sabse tez aadat hai <b>pehle backend health</b> dekhna, kyunki unhealthy backends zyadatar "bas timeout ho raha hai" tickets samjhate hain.</p>
`+r+`
<h3>Layer 1: frontend</h3>
<p>Kya client sahi IP ya naam, port aur protocol ko call kar raha hai? Public Load Balancer ke liye <code>az network public-ip show</code> se frontend IP confirm karo. DNS-based services ke liye dekho naam kis par resolve hota hai (<code>nslookup shop.example</code>) aur kya target Traffic Manager ya Front Door endpoint hai.</p>

<h3>Layer 2: health</h3>
<pre class="code"><span class="c"># Load Balancer: probe health metric aur probe definition</span>
LBID=$(az network lb show -g nk-lb-rg -n nk-lb --query id -o tsv)
az monitor metrics list --resource $LBID --metric DipAvailability --interval PT1M --offset 15m -o table
az network lb probe list -g nk-lb-rg --lb-name nk-lb -o table

<span class="c"># Application Gateway: per-server health</span>
az network application-gateway show-backend-health -g nk-agw-rg -n nk-agw -o json</pre>
<pre class="out">Illustrative output
Probe health (Load Balancer metric): <span class="hl">0 %</span>   saare backends probe fail karte hain
Application Gateway: server 10.40.2.4  health: <span class="hl">Unhealthy</span>  (probe ne 404 return kiya)</pre>
<p>Typical wajahein: probe port ya path galat; application 0.0.0.0 ki jagah sirf 127.0.0.1 par listen karti hai; NSG probe ko block karta hai (Load Balancer ke liye source 168.63.129.16 hai, tag <code>AzureLoadBalancer</code>; Application Gateway ke liye gateway subnet backend tak pahunchna chahiye); OS firewall port block karta hai; app probe path par 301, 401 ya 500 deti hai.</p>

<h3>Layer 3: rules aur pool</h3>
<ul>
<li>Kya rule frontend port ko sahi backend port aur pool se map karta hai, aur intended probe use karta hai?</li>
<li>Kya VM NICs asal mein pool ke members hain (jo VM "kisi ke peeche" nahi bana woh invisible hai)?</li>
<li>Kya pool frontend ke same VNet mein hai (Standard Load Balancer ke backends ek VNet mein hone chahiye)?</li>
<li>Application Gateway ke liye: kya listener request ke host name se match karta hai (multi-site)? Kya path map path ko intended pool ko bhejta hai?</li>
</ul>

<h3>Layer 4: filters</h3>
<ul>
<li><b>NSG</b>: Standard SKU allow hone tak band hai. NIC aur subnet ke effective security rules dekho, ya IP flow verify use karo.</li>
<li>Backend par <b>OS firewall</b> (ufw, firewalld, Windows Firewall).</li>
<li><b>WAF</b>: WAF log mein rule ID ke saath 403 matlab rule match hua. Prevention mode block karta hai; WAF band karne ki jagah narrow exclusion jodo ya rule tune karo.</li>
<li><b>Origin lock</b>: Front Door origin sirf Front Door addresses allow kare to laptop se direct tests design se fail honge.</li>
</ul>

<h3>Layer 5: application</h3>
<p>Same VNet ke VM se backend ko seedha call karo: <code>curl 10.30.2.4</code>. Woh chale par load balancer fail ho to problem service configuration mein hai. Woh fail ho to problem app ya OS ki hai.</p>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>Standard LB: timeout, VMs theek dikhte hain</td><td>NSG client port ya AzureLoadBalancer tag block karta hai; probe fail ho raha</td></tr>
<tr><td>Backends par load uneven</td><td>Kam clients ke saath hash distribution; source IP affinity; lambe connections</td></tr>
<tr><td>Backend VM apne hi internal LB frontend tak nahi pahunch pata</td><td>Internal Load Balancer ki hairpin limitation</td></tr>
<tr><td>Application Gateway 502</td><td>Healthy backend nahi; probe ya backend settings mismatch; certificate</td></tr>
<tr><td>Application Gateway 504</td><td>Backend bahut slow; backend settings mein request timeout kam</td></tr>
<tr><td>Gateway ya Front Door se 403</td><td>WAF rule match hua (WAF logs dekho)</td></tr>
<tr><td>Front Door 503</td><td>Origin group mein healthy origin nahi</td></tr>
<tr><td>Traffic Manager endpoint Degraded</td><td>Uska probe fail; probe path aur port check karo</td></tr>
<tr><td>Traffic Manager ke saath failover slow</td><td>DNS TTL aur resolver caching; probe interval ganaa tolerated failures</td></tr>
<tr><td>Pool se intermittent outbound failures</td><td>SNAT exhaustion (outbound module dekho)</td></tr></table>

<div class="eg"><b>Worked example.</b> Ticket: public Load Balancer 203.0.113.20 timeout hota hai. Step 1: frontend IP sahi hai. Step 2: probe health metric 0 percent. Step 3: rule aur pool sahi lagte hain. Step 4: jump VM se 10.30.2.4 par curl chalta hai, yaani app up hai. Probe port 8080 use karta hai par nginx 80 par listen karta hai: probe port ki ek line badalne se health theek hoti hai, aur timeout chala jaata hai.</div>

<div class="warn"><b>Common mistakes.</b> Health dekhe bina application debug karna; rule, NSG aur probe ek saath badalna; backend VM se frontend test karke hairpin limit se takrana; bhoolna ki Detection mode mein WAF sirf log karta hai.</div>
<div class="exam"><b>Exam trap.</b> "Saare backends unhealthy dikhte hain, application seedha call karne par chalti hai." Jawab: probe misconfiguration ya probe source (168.63.129.16 / AzureLoadBalancer tag) ko block karta NSG, application nahi.</div>

<div class="scn"><h4>Internal LB, ek VM call nahi kar pa raha</h4><p>Internal Load Balancer do API VMs ko balance karta tha. Web tier ke calls chalte the, par api-1 se wahi frontend IP call karne par kabhi-kabhi hang hota tha. Pattern random aur 50 percent tha. Wajah hairpin limitation thi: hash api-1 ko hi backend chune to flow fail hota tha. Team ne frontend ko call karne wala job alag subnet ya VM par shift kiya, aur self-calls ke liye local address use kiya.</p><p><b>Lesson:</b> backend instance apne internal load balancer frontend ko reliably call nahi kar sakta.</p></div>

<div class="iv"><p class="q">"Users Standard Load Balancer se timeout report karte hain. Kaise aage badhoge?"</p><p>Pehle backend health (probe metric aur probe definition), phir client traffic aur AzureLoadBalancer tag ke liye NSG, rule mapping aur pool membership, OS firewall aur app listening port. VNet ke andar se backend ko seedha test karo taaki application faults ko load balancer configuration se alag kar sako.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Backend health se shuru karo; zyadatar outages wahin dikhte hain.</li>
<li>Standard SKU by default band hai: NSGs ko clients aur probe allow karna hoga.</li>
<li>Application Gateway: 502 matlab healthy backend nahi, 504 matlab slow backend, 403 WAF ho sakta hai.</li>
<li>App faults ko service configuration se alag karne ke liye backends seedha test karo.</li>
<li>Traffic Manager failover DNS TTL par depend; Front Door seconds mein fail over karta hai.</li>
</ul></div>
`}};export{i as default};