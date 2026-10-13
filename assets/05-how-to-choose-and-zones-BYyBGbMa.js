var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="{{aria}}">
<rect x="220" y="8" width="200" height="40" rx="8" fill="#bae6fd"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">{{q1}}</text>
<line x1="270" y1="48" x2="150" y2="80" stroke="#64748b" stroke-width="2"/><line x1="370" y1="48" x2="500" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="190" y="62" class="svg-accent" font-size="12">{{yes}}</text><text x="440" y="62" class="svg-accent" font-size="12">{{no}}</text>
<rect x="40" y="80" width="220" height="40" rx="8" fill="#ddd6fe"/><text x="150" y="105" text-anchor="middle" class="svg-ink" font-size="13">{{q2}}</text>
<rect x="390" y="80" width="220" height="40" rx="8" fill="#ddd6fe"/><text x="500" y="105" text-anchor="middle" class="svg-ink" font-size="13">{{q2}}</text>
<line x1="100" y1="120" x2="70" y2="170" stroke="#64748b" stroke-width="2"/><line x1="200" y1="120" x2="235" y2="170" stroke="#64748b" stroke-width="2"/>
<line x1="450" y1="120" x2="420" y2="170" stroke="#64748b" stroke-width="2"/><line x1="550" y1="120" x2="565" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="70" y="146" class="svg-accent" font-size="12">{{yes}}</text><text x="225" y="146" class="svg-accent" font-size="12">{{no}}</text><text x="420" y="146" class="svg-accent" font-size="12">{{yes}}</text><text x="560" y="146" class="svg-accent" font-size="12">{{no}}</text>
<rect x="10" y="170" width="120" height="60" rx="8" fill="#fde68a"/><text x="70" y="196" text-anchor="middle" class="svg-ink" font-size="13">Front Door</text><text x="70" y="214" text-anchor="middle" class="svg-muted" font-size="12">(+ WAF)</text>
<rect x="175" y="170" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="235" y="196" text-anchor="middle" class="svg-ink" font-size="13">App Gateway</text><text x="235" y="214" text-anchor="middle" class="svg-muted" font-size="12">v2 (+ WAF)</text>
<rect x="360" y="170" width="120" height="60" rx="8" fill="#fed7aa"/><text x="420" y="196" text-anchor="middle" class="svg-ink" font-size="13">Traffic Manager</text><text x="420" y="214" text-anchor="middle" class="svg-muted" font-size="12">or global LB</text>
<rect x="505" y="170" width="120" height="60" rx="8" fill="#fecaca"/><text x="565" y="196" text-anchor="middle" class="svg-ink" font-size="13">Load Balancer</text><text x="565" y="214" text-anchor="middle" class="svg-muted" font-size="12">Standard</text>
<text x="320" y="265" text-anchor="middle" class="svg-muted" font-size="12">{{n1}}</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="12">{{n2}}</text><text x="320" y="305" text-anchor="middle" class="svg-muted" font-size="12">{{n3}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`Decision diagram for choosing a load balancing service`,q1:`Is the traffic HTTP or HTTPS?`,yes:`yes`,no:`no`,q2:`Multi-region (global)?`,n1:`Left: HTTP(S). Right: any other TCP or UDP protocol.`,n2:`Combine: Front Door in front of Application Gateway, which fronts an internal Load Balancer tier.`,n3:`Internal tiers inside a VNet: internal Load Balancer (L4) or an internal Application Gateway.`,cap:`A decision path: protocol first, then scope. Real designs often stack two services.`}),r=e(t,{aria:`Decision diagram for choosing a load balancing service`,q1:`Kya traffic HTTP ya HTTPS hai?`,yes:`haan`,no:`nahi`,q2:`Multi-region (global)?`,n1:`Left: HTTP(S). Right: koi bhi aur TCP ya UDP protocol.`,n2:`Combine: Front Door ke peeche Application Gateway, jiske peeche internal Load Balancer tier.`,n3:`VNet ke andar internal tiers: internal Load Balancer (L4) ya internal Application Gateway.`,cap:`Decision path: pehle protocol, phir scope. Real designs aksar do services stack karte hain.`}),i={id:`how-to-choose-and-zones`,h:{en:`How to choose, how to combine, and availability zones`,hi:`Kaise chunein, kaise combine karein, aur availability zones`},body:{en:`
<h3>Two questions pick the service</h3>
<p>Ask first: <b>what protocol?</b> If it is HTTP or HTTPS and you need URL routing, TLS offload or WAF, you want a layer-7 service. Anything else (databases, game servers, SMTP, DNS, RDP, custom TCP and UDP) needs layer 4 or DNS. Then ask: <b>what scope?</b> One region, or many regions with automatic failover. The decision diagram shows the result.</p>
`+n+`
<h3>Comparison at a glance</h3>
<table class="cmp"><tr><th></th><th>Load Balancer</th><th>Application Gateway v2</th><th>Front Door</th><th>Traffic Manager</th></tr>
<tr><td>Layer</td><td>4</td><td>7</td><td>7</td><td>DNS</td></tr>
<tr><td>Scope</td><td>Regional</td><td>Regional</td><td>Global</td><td>Global</td></tr>
<tr><td>Protocols</td><td>TCP, UDP, all</td><td>HTTP, HTTPS, WebSocket</td><td>HTTP, HTTPS</td><td>Any (DNS answer)</td></tr>
<tr><td>Proxy?</td><td>No (pass-through)</td><td>Yes</td><td>Yes</td><td>No</td></tr>
<tr><td>WAF</td><td>No</td><td>Yes (WAF_v2)</td><td>Yes</td><td>No</td></tr>
<tr><td>TLS termination</td><td>No</td><td>Yes</td><td>Yes</td><td>No</td></tr>
<tr><td>Where does it live?</td><td>VNet backend pool</td><td>Dedicated subnet</td><td>Microsoft edge</td><td>DNS service</td></tr>
<tr><td>Hourly idle cost</td><td>Low to moderate (verify)</td><td>Fixed hourly: higher</td><td>Base fee per profile (verify)</td><td>Low (per query)</td></tr></table>

<h3>Common combinations</h3>
<ul>
<li><b>Front Door + Application Gateway + internal Load Balancer.</b> Global entry and WAF at the edge, regional routing and WAF in the region, an internal L4 tier for a database or cache cluster.</li>
<li><b>Application Gateway + internal Load Balancer.</b> Single-region web app with a private middle tier.</li>
<li><b>Traffic Manager over regional Load Balancers.</b> Non-HTTP service in two regions with DNS failover.</li>
<li><b>Standard Load Balancer with HA ports in front of two NVAs.</b> Inspection hub for a hub-and-spoke network.</li>
</ul>
<p>Avoid stacking services without a reason: each hop adds latency, cost and another health-probe layer to understand.</p>

<h3>Availability zones</h3>
<p>An <b>availability zone</b> is a physically separate datacentre group inside a region (most regions have three) with independent power, cooling and network. Spreading across zones protects you from a single-datacentre failure.</p>
<dl class="terms">
<dt>Zonal resource</dt><dd>Pinned to one zone (a zonal public IP or zonal VM). If the zone fails, so does it.</dd>
<dt>Zone-redundant resource</dt><dd>Spread across all zones by the platform (a zone-redundant Standard public IP or load balancer frontend, and Application Gateway v2 when configured across zones). It survives the loss of a zone.</dd>
<dt>Non-zonal</dt><dd>The platform chooses; no zone guarantee.</dd>
</dl>
<p>Design rule: <b>zone-redundant frontend, backends spread across at least two zones</b>. A zone-redundant Standard Load Balancer frontend with VMs in zones 1, 2 and 3 keeps working if one zone fails; the probe marks the lost VMs unhealthy. Not every region has zones (verify for your region), and a NAT Gateway is zonal (see the outbound module), so a per-zone subnet and NAT Gateway pairing is common.</p>
<pre class="code"><span class="c"># Place VMs in different zones (a Standard public IP is zone-redundant by default in zoned regions: verify)</span>
az vm create -g nk-lb-rg -n web-1 --image Ubuntu2204 --size Standard_B1s --zone 1 ...
az vm create -g nk-lb-rg -n web-2 --image Ubuntu2204 --size Standard_B1s --zone 2 ...

<span class="c"># Show the zones of a public IP</span>
az network public-ip show -g nk-lb-rg -n nk-lb-pip --query "{sku:sku.name, zones:zones}"</pre>

<h3>Health probe design</h3>
<ul>
<li>A TCP probe only proves the port is open. An HTTP probe to a lightweight <code>/health</code> endpoint proves the app answers.</li>
<li>Make the health endpoint check what matters (database reachable) but keep it cheap, or a slow dependency removes every backend at once.</li>
<li>Choose interval and failure threshold to balance fast failover against flapping.</li>
</ul>

<div class="eg"><b>Worked example.</b> A bank portal: Front Door (WAF Prevention) with two origin groups; each is a regional Application Gateway v2 across zones 1 to 3 (WAF_v2), which routes /api/* to an internal Standard Load Balancer fronting an API tier of six VMs, two per zone. Loss of one zone removes two API VMs and a third of the gateway instances; probes react within seconds; users see nothing.</div>

<div class="warn"><b>Common mistakes.</b> Choosing Load Balancer when the requirement says URL path routing; stacking four services for a simple site; putting all backends in one zone behind a zone-redundant frontend; a health endpoint that depends on a flaky external service.</div>
<div class="exam"><b>Exam trap.</b> A question that says "path-based routing, WAF, single region" points to Application Gateway; "global, HTTP, WAF, caching" to Front Door; "TCP, internal, high performance" to internal Load Balancer; "DNS-based, any protocol, global" to Traffic Manager.</div>

<div class="scn"><h4>The zone that took everything down</h4><p>A team put a zone-redundant public IP on their Load Balancer but deployed all three VMs in zone 1 "for lower latency". When zone 1 had an incident, the frontend stayed up but the pool was empty and users saw errors. Redeploying with one VM per zone fixed the design and, later, the same incident passed without impact.</p><p><b>Lesson:</b> redundancy needs both a redundant frontend and a spread backend.</p></div>

<div class="iv"><p class="q">"Design the entry for a global e-commerce site on Azure."</p><p>Front Door with WAF for global anycast entry, caching static assets and health-based failover between regions; per region an Application Gateway v2 (zone-redundant, WAF_v2 or WAF at Front Door) for path routing; internal Standard Load Balancers for private tiers; backends across zones; locked origins; probes against a health endpoint; costs reviewed because Front Door, gateways and firewalls bill hourly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Choose by protocol (HTTP or not) and scope (regional or global).</li>
<li>Combine services deliberately; each layer adds latency and cost.</li>
<li>Zone-redundant frontends need backends spread across zones.</li>
<li>Health probes should check the app, cheaply.</li>
<li>Know the four one-line answers: LB L4, AppGW L7 regional, Front Door L7 global, Traffic Manager DNS.</li>
</ul></div>
`,hi:`
<h3>Do sawal service chunte hain</h3>
<p>Pehle poocho: <b>kaunsa protocol?</b> HTTP ya HTTPS ho aur URL routing, TLS offload ya WAF chahiye to layer-7 service. Baaki sab (databases, game servers, SMTP, DNS, RDP, custom TCP aur UDP) ke liye layer 4 ya DNS. Phir poocho: <b>kaunsa scope?</b> Ek region, ya automatic failover ke saath kai regions. Decision diagram natija dikhata hai.</p>
`+r+`
<h3>Ek nazar mein comparison</h3>
<table class="cmp"><tr><th></th><th>Load Balancer</th><th>Application Gateway v2</th><th>Front Door</th><th>Traffic Manager</th></tr>
<tr><td>Layer</td><td>4</td><td>7</td><td>7</td><td>DNS</td></tr>
<tr><td>Scope</td><td>Regional</td><td>Regional</td><td>Global</td><td>Global</td></tr>
<tr><td>Protocols</td><td>TCP, UDP, all</td><td>HTTP, HTTPS, WebSocket</td><td>HTTP, HTTPS</td><td>Any (DNS answer)</td></tr>
<tr><td>Proxy?</td><td>Nahi (pass-through)</td><td>Haan</td><td>Haan</td><td>Nahi</td></tr>
<tr><td>WAF</td><td>Nahi</td><td>Haan (WAF_v2)</td><td>Haan</td><td>Nahi</td></tr>
<tr><td>TLS termination</td><td>Nahi</td><td>Haan</td><td>Haan</td><td>Nahi</td></tr>
<tr><td>Kahan rehta hai?</td><td>VNet backend pool</td><td>Dedicated subnet</td><td>Microsoft edge</td><td>DNS service</td></tr>
<tr><td>Hourly idle cost</td><td>Kam se moderate (verify)</td><td>Fixed hourly: zyada</td><td>Profile ka base fee (verify)</td><td>Kam (per query)</td></tr></table>

<h3>Common combinations</h3>
<ul>
<li><b>Front Door + Application Gateway + internal Load Balancer.</b> Edge par global entry aur WAF, region mein regional routing aur WAF, database ya cache cluster ke liye internal L4 tier.</li>
<li><b>Application Gateway + internal Load Balancer.</b> Private middle tier ke saath single-region web app.</li>
<li><b>Regional Load Balancers ke upar Traffic Manager.</b> DNS failover ke saath do regions mein non-HTTP service.</li>
<li><b>Do NVAs ke saamne HA ports wala Standard Load Balancer.</b> Hub-and-spoke network ke liye inspection hub.</li>
</ul>
<p>Bina wajah services stack karne se bacho: har hop latency, cost aur samajhne ke liye ek aur health-probe layer jodta hai.</p>

<h3>Availability zones</h3>
<p><b>Availability zone</b> region ke andar physically alag datacentre group hai (zyadatar regions mein teen) jiski power, cooling aur network independent hai. Zones mein failana single-datacentre failure se bachata hai.</p>
<dl class="terms">
<dt>Zonal resource</dt><dd>Ek zone se pinned (zonal public IP ya zonal VM). Zone fail ho to woh bhi.</dd>
<dt>Zone-redundant resource</dt><dd>Platform ise saare zones mein failata hai (zone-redundant Standard public IP ya load balancer frontend, aur zones mein configure karne par Application Gateway v2). Ek zone ke khone par bhi bacha rehta hai.</dd>
<dt>Non-zonal</dt><dd>Platform chunta hai; zone guarantee nahi.</dd>
</dl>
<p>Design rule: <b>zone-redundant frontend, kam se kam do zones mein failaye backends</b>. Zones 1, 2 aur 3 ke VMs wala zone-redundant Standard Load Balancer frontend ek zone fail hone par bhi chalta rehta hai; probe khoye VMs ko unhealthy mark karta hai. Har region mein zones nahi hote (apne region ke liye verify karo), aur NAT Gateway zonal hota hai (outbound module dekho), isliye per-zone subnet aur NAT Gateway ki jodi common hai.</p>
<pre class="code"><span class="c"># VMs ko alag zones mein rakho (zoned regions mein Standard public IP default zone-redundant hota hai: verify)</span>
az vm create -g nk-lb-rg -n web-1 --image Ubuntu2204 --size Standard_B1s --zone 1 ...
az vm create -g nk-lb-rg -n web-2 --image Ubuntu2204 --size Standard_B1s --zone 2 ...

<span class="c"># Public IP ke zones dekho</span>
az network public-ip show -g nk-lb-rg -n nk-lb-pip --query "{sku:sku.name, zones:zones}"</pre>

<h3>Health probe design</h3>
<ul>
<li>TCP probe sirf yeh sabit karta hai ki port khula hai. Halke <code>/health</code> endpoint par HTTP probe sabit karta hai ki app jawab deta hai.</li>
<li>Health endpoint wahi check kare jo maayne rakhta hai (database reachable) par sasta rahe, warna slow dependency ek saath saare backends hata deti hai.</li>
<li>Tez failover aur flapping ke beech balance ke liye interval aur failure threshold chuno.</li>
</ul>

<div class="eg"><b>Worked example.</b> Bank portal: Front Door (WAF Prevention) do origin groups ke saath; har ek zones 1 se 3 mein regional Application Gateway v2 (WAF_v2) hai, jo /api/* ko internal Standard Load Balancer ko route karta hai jo chhe VMs (har zone mein do) ki API tier ke saamne hai. Ek zone ke khone se do API VMs aur gateway instances ka teesra hissa hat jaata hai; probes seconds mein react karte hain; users ko kuch nahi dikhta.</div>

<div class="warn"><b>Common mistakes.</b> Requirement URL path routing kehti ho to Load Balancer chunna; simple site ke liye chaar services stack karna; zone-redundant frontend ke peeche saare backends ek zone mein rakhna; aisa health endpoint jo flaky external service par depend kare.</div>
<div class="exam"><b>Exam trap.</b> "Path-based routing, WAF, single region" Application Gateway ki taraf ishara karta hai; "global, HTTP, WAF, caching" Front Door; "TCP, internal, high performance" internal Load Balancer; "DNS-based, any protocol, global" Traffic Manager.</div>

<div class="scn"><h4>Zone jisne sab down kar diya</h4><p>Ek team ne Load Balancer par zone-redundant public IP lagaya par "kam latency ke liye" teeno VMs zone 1 mein deploy kiye. Zone 1 mein incident hua to frontend chalta raha par pool khaali tha aur users ko errors dikhe. Har zone mein ek VM ke saath redeploy karne se design theek hua aur baad mein wahi incident bina impact ke guzar gaya.</p><p><b>Lesson:</b> redundancy ke liye redundant frontend aur failaya hua backend dono chahiye.</p></div>

<div class="iv"><p class="q">"Azure par global e-commerce site ki entry design karo."</p><p>Global anycast entry, static assets ki caching aur regions ke beech health-based failover ke liye WAF ke saath Front Door; har region mein path routing ke liye Application Gateway v2 (zone-redundant, WAF_v2 ya Front Door par WAF); private tiers ke liye internal Standard Load Balancers; zones mein failaye backends; locked origins; health endpoint par probes; costs review kyunki Front Door, gateways aur firewalls hourly bill karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Protocol (HTTP ya nahi) aur scope (regional ya global) se chuno.</li>
<li>Services jaanboojhkar combine karo; har layer latency aur cost jodti hai.</li>
<li>Zone-redundant frontends ko zones mein failaye backends chahiye.</li>
<li>Health probes app ko, sasta, check karein.</li>
<li>Chaar ek-line jawab yaad rakho: LB L4, AppGW L7 regional, Front Door L7 global, Traffic Manager DNS.</li>
</ul></div>
`}};export{i as default};