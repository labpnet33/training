var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="{{aria}}">
<rect x="10" y="10" width="145" height="180" rx="8" fill="#bbf7d0"/><text x="82" y="34" text-anchor="middle" class="svg-ink" font-size="13">Load Balancer</text>
<text x="82" y="62" text-anchor="middle" class="svg-muted" font-size="12">{{a1}}</text><text x="82" y="84" text-anchor="middle" class="svg-muted" font-size="12">{{a2}}</text><text x="82" y="106" text-anchor="middle" class="svg-muted" font-size="12">{{a3}}</text>
<rect x="170" y="10" width="145" height="180" rx="8" fill="#fde68a"/><text x="242" y="34" text-anchor="middle" class="svg-ink" font-size="13">App Gateway v2</text>
<text x="242" y="62" text-anchor="middle" class="svg-muted" font-size="12">{{b1}}</text><text x="242" y="84" text-anchor="middle" class="svg-muted" font-size="12">{{b2}}</text><text x="242" y="106" text-anchor="middle" class="svg-muted" font-size="12">{{b3}}</text>
<rect x="325" y="10" width="145" height="180" rx="8" fill="#ddd6fe"/><text x="397" y="34" text-anchor="middle" class="svg-ink" font-size="13">Front Door</text>
<text x="397" y="62" text-anchor="middle" class="svg-muted" font-size="12">{{c1}}</text><text x="397" y="84" text-anchor="middle" class="svg-muted" font-size="12">{{c2}}</text><text x="397" y="106" text-anchor="middle" class="svg-muted" font-size="12">{{c3}}</text>
<rect x="485" y="10" width="145" height="180" rx="8" fill="#bae6fd"/><text x="557" y="34" text-anchor="middle" class="svg-ink" font-size="13">Traffic Manager</text>
<text x="557" y="62" text-anchor="middle" class="svg-muted" font-size="12">{{d1}}</text><text x="557" y="84" text-anchor="middle" class="svg-muted" font-size="12">{{d2}}</text><text x="557" y="106" text-anchor="middle" class="svg-muted" font-size="12">{{d3}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`Four services summary`,a1:`Layer 4, regional`,a2:`TCP and UDP`,a3:`Probe, HA ports`,b1:`Layer 7, regional`,b2:`Path, host, WAF`,b3:`Own subnet, hourly`,c1:`Layer 7, global`,c2:`Edge, WAF, cache`,c3:`Seconds failover`,d1:`DNS, global`,d2:`Any protocol`,d3:`TTL-bound failover`,cap:`Four services in one glance.`}),r=e(t,{aria:`Four services summary`,a1:`Layer 4, regional`,a2:`TCP aur UDP`,a3:`Probe, HA ports`,b1:`Layer 7, regional`,b2:`Path, host, WAF`,b3:`Apna subnet, hourly`,c1:`Layer 7, global`,c2:`Edge, WAF, cache`,c3:`Seconds mein failover`,d1:`DNS, global`,d2:`Koi bhi protocol`,d3:`TTL-bound failover`,cap:`Chaar services ek nazar mein.`}),i={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>What you can now do</h3>
<ul>
<li>Choose between Load Balancer, Application Gateway, Front Door and Traffic Manager by protocol and scope, and combine them sensibly.</li>
<li>Build a Standard Load Balancer with frontend, pool, probe, rule and NSG, and prove failover.</li>
<li>Explain HA ports, floating IP, source IP affinity, idle timeout and the AzureLoadBalancer tag.</li>
<li>Describe Application Gateway v2: dedicated subnet, listener, rule, backend settings, pool, probe, WAF modes, X-Forwarded-For, 502 versus 504.</li>
<li>Explain Front Door (global proxy, anycast, WAF, origin lock) and Traffic Manager (DNS, routing methods, TTL-bound failover).</li>
<li>Design for availability zones with zone-redundant frontends and spread backends.</li>
<li>Troubleshoot with backend health first, then NSG, rules, filters and the app; clean up with <code>az group delete</code>.</li>
</ul>
`+n+`
<h3>Mini glossary</h3>
<dl class="terms">
<dt>Frontend IP</dt><dd>The address clients connect to.</dd>
<dt>Backend pool</dt><dd>The instances that receive traffic.</dd>
<dt>Health probe</dt><dd>Periodic check that decides whether an instance gets new traffic.</dd>
<dt>HA ports</dt><dd>Internal Standard LB rule for all ports and protocols, used for NVAs.</dd>
<dt>Listener</dt><dd>Application Gateway object that accepts requests on a port, protocol and host.</dd>
<dt>WAF</dt><dd>Web Application Firewall: blocks common web attacks using managed and custom rules.</dd>
<dt>Anycast</dt><dd>One IP advertised from many locations; users reach the nearest.</dd>
<dt>Origin</dt><dd>A Front Door backend.</dd>
<dt>Zone-redundant</dt><dd>Spread across availability zones by the platform.</dd>
<dt>TTL</dt><dd>Time a DNS answer may be cached.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Azure Load Balancer layer?</td><td>4 (TCP and UDP)</td></tr>
<tr><td>Probe source address?</td><td>168.63.129.16 (AzureLoadBalancer tag)</td></tr>
<tr><td>Standard LB default for inbound?</td><td>Closed until an NSG allows</td></tr>
<tr><td>Default distribution?</td><td>5-tuple hash</td></tr>
<tr><td>HA ports rule?</td><td>Protocol All, port 0, internal Standard LB</td></tr>
<tr><td>Basic LB?</td><td>Retired (announced 30 Sep 2025: verify)</td></tr>
<tr><td>Application Gateway recommended SKU?</td><td>v2 (v1 retiring: verify date)</td></tr>
<tr><td>Application Gateway needs?</td><td>Dedicated subnet</td></tr>
<tr><td>Path-based routing and WAF, regional?</td><td>Application Gateway</td></tr>
<tr><td>Global HTTP, WAF, caching?</td><td>Front Door</td></tr>
<tr><td>DNS-based, any protocol?</td><td>Traffic Manager</td></tr>
<tr><td>Traffic Manager routing methods?</td><td>Priority, Weighted, Performance, Geographic, MultiValue, Subnet</td></tr>
<tr><td>502 from Application Gateway?</td><td>No healthy backend</td></tr>
<tr><td>What bills hourly?</td><td>Standard public IP, Load Balancer, Application Gateway v2, Azure Firewall, NAT Gateway</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">az network public-ip create -g RG -n pip --sku Standard
az network lb create -g RG -n lb --sku Standard --public-ip-address pip --frontend-ip-name fe --backend-pool-name be
az network lb probe create -g RG --lb-name lb -n hp --protocol tcp --port 80
az network lb rule create -g RG --lb-name lb -n r --protocol tcp --frontend-port 80 --backend-port 80 --frontend-ip-name fe --backend-pool-name be --probe-name hp
az network nic create -g RG -n nic --vnet-name VNET --subnet SN --lb-name lb --lb-address-pools be
az network application-gateway create -g RG -n agw --sku Standard_v2 --capacity 1 --priority 100 --vnet-name VNET --subnet agw-sn --public-ip-address pip --frontend-port 80 --servers IP1 IP2
az network application-gateway show-backend-health -g RG -n agw
az group delete -n RG --yes --no-wait</pre>

<div class="warn"><b>Mistakes to avoid on the exam.</b> Choosing Load Balancer for path routing; forgetting the NSG on Standard SKU; assuming Traffic Manager proxies traffic; blaming the gateway for a 502 caused by unhealthy backends; leaving hourly-billed services running.</div>
<div class="exam"><b>Exam trap.</b> Words to map: "URL path" or "WAF" (regional) means Application Gateway; "global" plus "HTTP" means Front Door; "DNS" means Traffic Manager; "TCP or UDP" or "NVA" means Load Balancer.</div>

<div class="scn"><h4>The architecture review</h4><p>A reviewer asked why a platform used Front Door, two regional Application Gateways and internal Load Balancers. The team explained each layer's job: global entry and failover, regional WAF and routing, private L4 tier, zone-redundant everywhere, with cost owners named for the hourly-billed gateways. The reviewer approved and asked only for a probe-ownership document.</p><p><b>Lesson:</b> every layer should have a one-sentence purpose.</p></div>

<div class="iv"><p class="q">"Explain the four Azure load-balancing services in one minute."</p><p>Load Balancer: regional layer 4 for TCP and UDP with probes and HA ports. Application Gateway: regional layer 7 reverse proxy with path and host routing, TLS and WAF in its own subnet. Front Door: global layer 7 edge proxy with WAF, caching and fast failover. Traffic Manager: global DNS routing for any protocol with TTL-bound failover. Choose by protocol and scope, combine deliberately, spread across zones, and watch hourly costs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Protocol and scope pick the service.</li>
<li>Health probes decide who receives traffic; check health first.</li>
<li>Standard SKU is secure by default: allow traffic and the probe in NSGs.</li>
<li>Zone-redundant frontend plus zone-spread backends.</li>
<li>Delete practice resources: they bill hourly.</li>
</ul></div>
`,hi:`
<h3>Ab aap kya kar sakte ho</h3>
<ul>
<li>Protocol aur scope ke hisaab se Load Balancer, Application Gateway, Front Door aur Traffic Manager mein se chuno, aur unhe samajhdari se combine karo.</li>
<li>Frontend, pool, probe, rule aur NSG ke saath Standard Load Balancer banao aur failover sabit karo.</li>
<li>HA ports, floating IP, source IP affinity, idle timeout aur AzureLoadBalancer tag samjhao.</li>
<li>Application Gateway v2 batao: dedicated subnet, listener, rule, backend settings, pool, probe, WAF modes, X-Forwarded-For, 502 versus 504.</li>
<li>Front Door (global proxy, anycast, WAF, origin lock) aur Traffic Manager (DNS, routing methods, TTL-bound failover) samjhao.</li>
<li>Zone-redundant frontends aur failaye backends ke saath availability zones ke liye design karo.</li>
<li>Pehle backend health, phir NSG, rules, filters aur app se troubleshoot karo; <code>az group delete</code> se cleanup karo.</li>
</ul>
`+r+`
<h3>Mini glossary</h3>
<dl class="terms">
<dt>Frontend IP</dt><dd>Woh address jis se clients connect karte hain.</dd>
<dt>Backend pool</dt><dd>Woh instances jo traffic paate hain.</dd>
<dt>Health probe</dt><dd>Periodic check jo decide karta hai instance ko naya traffic milega ya nahi.</dd>
<dt>HA ports</dt><dd>Saare ports aur protocols ke liye internal Standard LB rule, NVAs ke liye.</dd>
<dt>Listener</dt><dd>Application Gateway object jo port, protocol aur host par requests accept karta hai.</dd>
<dt>WAF</dt><dd>Web Application Firewall: managed aur custom rules se common web attacks block karta hai.</dd>
<dt>Anycast</dt><dd>Kai locations se advertise hone wala ek IP; users sabse nazdeeki tak pahunchte hain.</dd>
<dt>Origin</dt><dd>Front Door ka backend.</dd>
<dt>Zone-redundant</dt><dd>Platform dwara availability zones mein failaya hua.</dd>
<dt>TTL</dt><dd>DNS answer kitni der cache ho sakta hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>Azure Load Balancer ka layer?</td><td>4 (TCP aur UDP)</td></tr>
<tr><td>Probe source address?</td><td>168.63.129.16 (AzureLoadBalancer tag)</td></tr>
<tr><td>Standard LB ka inbound default?</td><td>NSG allow karne tak band</td></tr>
<tr><td>Default distribution?</td><td>5-tuple hash</td></tr>
<tr><td>HA ports rule?</td><td>Protocol All, port 0, internal Standard LB</td></tr>
<tr><td>Basic LB?</td><td>Retired (30 Sep 2025 announce: verify)</td></tr>
<tr><td>Application Gateway recommended SKU?</td><td>v2 (v1 retire ho raha: date verify)</td></tr>
<tr><td>Application Gateway ko kya chahiye?</td><td>Dedicated subnet</td></tr>
<tr><td>Path-based routing aur WAF, regional?</td><td>Application Gateway</td></tr>
<tr><td>Global HTTP, WAF, caching?</td><td>Front Door</td></tr>
<tr><td>DNS-based, koi bhi protocol?</td><td>Traffic Manager</td></tr>
<tr><td>Traffic Manager routing methods?</td><td>Priority, Weighted, Performance, Geographic, MultiValue, Subnet</td></tr>
<tr><td>Application Gateway se 502?</td><td>Healthy backend nahi</td></tr>
<tr><td>Kya hourly bill karta hai?</td><td>Standard public IP, Load Balancer, Application Gateway v2, Azure Firewall, NAT Gateway</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">az network public-ip create -g RG -n pip --sku Standard
az network lb create -g RG -n lb --sku Standard --public-ip-address pip --frontend-ip-name fe --backend-pool-name be
az network lb probe create -g RG --lb-name lb -n hp --protocol tcp --port 80
az network lb rule create -g RG --lb-name lb -n r --protocol tcp --frontend-port 80 --backend-port 80 --frontend-ip-name fe --backend-pool-name be --probe-name hp
az network nic create -g RG -n nic --vnet-name VNET --subnet SN --lb-name lb --lb-address-pools be
az network application-gateway create -g RG -n agw --sku Standard_v2 --capacity 1 --priority 100 --vnet-name VNET --subnet agw-sn --public-ip-address pip --frontend-port 80 --servers IP1 IP2
az network application-gateway show-backend-health -g RG -n agw
az group delete -n RG --yes --no-wait</pre>

<div class="warn"><b>Exam mein bachne wali mistakes.</b> Path routing ke liye Load Balancer chunna; Standard SKU par NSG bhool jaana; maan lena ki Traffic Manager traffic proxy karta hai; unhealthy backends se aaye 502 ke liye gateway ko blame karna; hourly-billed services chalte chhodna.</div>
<div class="exam"><b>Exam trap.</b> Words map karo: "URL path" ya "WAF" (regional) matlab Application Gateway; "global" plus "HTTP" matlab Front Door; "DNS" matlab Traffic Manager; "TCP ya UDP" ya "NVA" matlab Load Balancer.</div>

<div class="scn"><h4>Architecture review</h4><p>Reviewer ne poocha ki platform ne Front Door, do regional Application Gateways aur internal Load Balancers kyun use kiye. Team ne har layer ka kaam samjhaya: global entry aur failover, regional WAF aur routing, private L4 tier, har jagah zone-redundant, hourly-billed gateways ke liye named cost owners. Reviewer ne approve kiya aur sirf probe-ownership document maanga.</p><p><b>Lesson:</b> har layer ka ek-line purpose hona chahiye.</p></div>

<div class="iv"><p class="q">"Azure ki chaar load-balancing services ek minute mein samjhao."</p><p>Load Balancer: TCP aur UDP ke liye regional layer 4, probes aur HA ports ke saath. Application Gateway: apne subnet mein path aur host routing, TLS aur WAF wala regional layer 7 reverse proxy. Front Door: WAF, caching aur tez failover wala global layer 7 edge proxy. Traffic Manager: kisi bhi protocol ke liye global DNS routing, TTL-bound failover ke saath. Protocol aur scope se chuno, jaanboojhkar combine karo, zones mein failao, aur hourly costs par nazar rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Protocol aur scope service chunte hain.</li>
<li>Health probes decide karte hain traffic kise milega; pehle health check karo.</li>
<li>Standard SKU secure by default hai: NSGs mein traffic aur probe allow karo.</li>
<li>Zone-redundant frontend plus zones mein failaye backends.</li>
<li>Practice resources delete karo: woh hourly bill karte hain.</li>
</ul></div>
`}};export{i as default};