var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="{{aria}}">
<rect x="20" y="10" width="600" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Front Door  ({{g}})</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">{{g2}}</text>
<rect x="20" y="76" width="600" height="56" rx="8" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">Traffic Manager  ({{d}})</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">{{d2}}</text>
<rect x="20" y="142" width="600" height="56" rx="8" fill="#fde68a"/><text x="320" y="166" text-anchor="middle" class="svg-ink" font-size="13">Application Gateway  ({{l7}})</text><text x="320" y="186" text-anchor="middle" class="svg-muted" font-size="12">{{l72}}</text>
<rect x="20" y="208" width="600" height="56" rx="8" fill="#bbf7d0"/><text x="320" y="232" text-anchor="middle" class="svg-ink" font-size="13">Load Balancer  ({{l4}})</text><text x="320" y="252" text-anchor="middle" class="svg-muted" font-size="12">{{l42}}</text>
<text x="320" y="288" text-anchor="middle" class="svg-muted" font-size="12">{{n}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=`<div class="note"><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.nwkings.com. Or use your own account: set a budget alert first and delete the resource group when you finish.</div>`,r=e(t,{aria:`Four Azure load balancing services by scope and layer`,g:`global, layer 7`,g2:`HTTP(S) edge entry, WAF, caching, global failover`,d:`global, DNS`,d2:`Answers DNS queries with the healthiest endpoint; any protocol`,l7:`regional, layer 7`,l72:`URL path and host routing, WAF, TLS termination inside a VNet`,l4:`regional, layer 4`,l42:`TCP and UDP by IP and port; very fast; any app`,n:`Wider scope at the top. Higher layer means more HTTP awareness.`,cap:`Four services, four jobs: choose by scope (global or regional) and by layer (DNS, HTTP, TCP or UDP).`}),i=e(t,{aria:`Four Azure load balancing services by scope and layer`,g:`global, layer 7`,g2:`HTTP(S) edge entry, WAF, caching, global failover`,d:`global, DNS`,d2:`DNS queries ka jawab sabse healthy endpoint se; koi bhi protocol`,l7:`regional, layer 7`,l72:`URL path aur host routing, WAF, VNet ke andar TLS termination`,l4:`regional, layer 4`,l42:`IP aur port se TCP aur UDP; bahut tez; koi bhi app`,n:`Upar zyada wide scope. Upar ka layer matlab zyada HTTP awareness.`,cap:`Chaar services, chaar kaam: scope (global ya regional) aur layer (DNS, HTTP, TCP ya UDP) se chuno.`}),a={id:`big-picture`,h:{en:`Why one server is never enough: load balancing on Azure`,hi:`Ek server kabhi kaafi kyun nahi: Azure par load balancing`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>The four Azure traffic-distribution services and how they differ: <b>Load Balancer</b> (layer 4), <b>Application Gateway</b> (layer 7, regional), <b>Front Door</b> (layer 7, global) and <b>Traffic Manager</b> (DNS).</li>
<li>Load Balancer parts: frontend IP, backend pool, health probe, load-balancing rule, HA ports, public versus internal.</li>
<li>Application Gateway v2: listeners, rules, backend settings, path-based and multi-site routing, WAF, TLS termination.</li>
<li>Front Door and Traffic Manager: global entry, routing methods, failover and their limits.</li>
<li>A <b>decision diagram</b> for choosing, how to combine services, and availability zones.</li>
<li>Guided labs on your own subscription (Standard Load Balancer and Application Gateway v2) with cleanup, plus a troubleshooting workflow.</li>
</ul>
<p><b>Prerequisites:</b> virtual networks and subnets, NSGs, public IPs, the NAT Gateway and peering modules of this track. You should know the OSI layers: layer 4 (TCP and UDP ports) and layer 7 (HTTP, URLs, headers).</p>

`+n+`

<h3>The restaurant analogy</h3>
<p>A busy restaurant has several identical kitchens (servers). The <b>host at the door</b> decides which kitchen gets each party. A layer-4 host only looks at party size and a table number: "next table goes to kitchen 2". That is a <b>Load Balancer</b>: fast and simple. A layer-7 host reads the order: "pizza goes to the pizza kitchen, desserts to the dessert kitchen". That is an <b>Application Gateway</b>. If the restaurant has branches in several cities, a <b>global</b> host (Front Door) sends customers to the nearest open branch, and a <b>phone directory</b> (Traffic Manager) simply gives callers the number of the best branch and lets them dial themselves.</p>
`+r+`
<h3>Why it matters</h3>
<p>A single VM is a single point of failure: it crashes, you patch it, or it gets overloaded, and users see downtime. Spreading traffic across several healthy instances gives <b>high availability</b>, <b>scale-out</b>, and safe patching (take one out, upgrade, put it back). Load balancers also hide the instance addresses behind one stable frontend IP or name.</p>

<div class="eg"><b>Worked example.</b> A web app runs on two VMs, web-1 at 10.30.2.4 and web-2 at 10.30.2.5. A public Load Balancer has frontend 203.0.113.20 port 80 and a health probe on TCP port 80. Users connect to 203.0.113.20. The load balancer picks a backend using a hash of the five-tuple and forwards the packet. If web-1 stops answering the probe, new connections go only to web-2 until web-1 recovers.</div>

<div class="note"><b>AWS vs Azure.</b> Rough mapping: Azure Load Balancer is like AWS Network Load Balancer (layer 4); Application Gateway is like an Application Load Balancer with WAF; Front Door is similar to CloudFront plus global routing; Traffic Manager is like Route 53 routing policies. The mapping is approximate, not exact.</div>

<div class="warn"><b>Common mistake.</b> Picking a service by its name rather than its layer and scope. "Load balancer" in Azure is the layer-4 resource; if you need URL routing or WAF you want Application Gateway or Front Door.</div>

<div class="scn"><h4>The Friday night crash</h4><p>A startup ran its store on one VM. A marketing email drove a spike and the VM maxed out, then crashed; the shop was down for an hour. The engineer placed two VMs behind a Standard Load Balancer with a health probe. During the next campaign one VM was patched in the middle of the rush while the other served everyone, and nobody noticed.</p><p><b>Lesson:</b> load balancing is as much about maintenance and failure as about speed.</p></div>

<div class="iv"><p class="q">"Name Azure's load-balancing services and when you would use each."</p><p>Load Balancer for layer-4 TCP and UDP inside a region; Application Gateway for layer-7 routing and WAF inside a region; Front Door for global HTTP(S) entry with WAF, caching and failover; Traffic Manager for DNS-based global routing of any protocol. Mention they can be combined.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Choose by scope (regional or global) and layer (L4, L7, DNS).</li>
<li>Load Balancer = L4 regional; Application Gateway = L7 regional; Front Door = L7 global; Traffic Manager = DNS global.</li>
<li>Health probes decide who receives traffic.</li>
<li>Application Gateway v2, Azure Firewall, NAT Gateway and Standard public IPs bill hourly: delete labs.</li>
<li>This module mixes theory with guided labs for your own subscription or the free practice labs.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<ul>
<li>Azure ki chaar traffic-distribution services aur woh kaise alag hain: <b>Load Balancer</b> (layer 4), <b>Application Gateway</b> (layer 7, regional), <b>Front Door</b> (layer 7, global) aur <b>Traffic Manager</b> (DNS).</li>
<li>Load Balancer ke parts: frontend IP, backend pool, health probe, load-balancing rule, HA ports, public versus internal.</li>
<li>Application Gateway v2: listeners, rules, backend settings, path-based aur multi-site routing, WAF, TLS termination.</li>
<li>Front Door aur Traffic Manager: global entry, routing methods, failover aur unki limits.</li>
<li>Chunne ke liye <b>decision diagram</b>, services ko kaise combine karein, aur availability zones.</li>
<li>Apne subscription par guided labs (Standard Load Balancer aur Application Gateway v2) cleanup ke saath, aur troubleshooting workflow.</li>
</ul>
<p><b>Prerequisites:</b> virtual networks aur subnets, NSGs, public IPs, is track ke NAT Gateway aur peering modules. Aapko OSI layers pata hone chahiye: layer 4 (TCP aur UDP ports) aur layer 7 (HTTP, URLs, headers).</p>

`+n+`

<h3>Restaurant ki analogy</h3>
<p>Ek busy restaurant mein kai identical kitchens (servers) hain. <b>Darwaze par host</b> decide karta hai ki har party kis kitchen ko jaaye. Layer-4 host sirf party ka size aur table number dekhta hai: "agla table kitchen 2 ko". Yeh <b>Load Balancer</b> hai: tez aur simple. Layer-7 host order padhta hai: "pizza pizza kitchen ko, desserts dessert kitchen ko". Yeh <b>Application Gateway</b> hai. Restaurant ki kai shehron mein branches hon to <b>global</b> host (Front Door) customers ko sabse nazdeeki khuli branch bhejta hai, aur <b>phone directory</b> (Traffic Manager) sirf best branch ka number deti hai aur caller khud dial karta hai.</p>
`+i+`
<h3>Yeh kyun zaroori hai</h3>
<p>Ek VM single point of failure hai: woh crash hota hai, aap use patch karte ho, ya overload ho jaata hai, aur users ko downtime dikhta hai. Traffic ko kai healthy instances mein baantne se <b>high availability</b>, <b>scale-out</b> aur safe patching milti hai (ek ko nikalo, upgrade karo, wapas daalo). Load balancers instance addresses ko ek stable frontend IP ya naam ke peeche chhupa dete hain.</p>

<div class="eg"><b>Worked example.</b> Web app do VMs par chalta hai, web-1 10.30.2.4 par aur web-2 10.30.2.5 par. Public Load Balancer ka frontend 203.0.113.20 port 80 hai aur TCP port 80 par health probe. Users 203.0.113.20 se connect karte hain. Load balancer five-tuple ke hash se backend chunta hai aur packet forward karta hai. web-1 probe ka jawab dena band kare to naye connections sirf web-2 ko jaate hain jab tak web-1 recover na ho.</div>

<div class="note"><b>AWS vs Azure.</b> Mota mapping: Azure Load Balancer AWS Network Load Balancer jaisa hai (layer 4); Application Gateway WAF ke saath Application Load Balancer jaisa; Front Door CloudFront plus global routing jaisa; Traffic Manager Route 53 routing policies jaisa. Mapping approximate hai, exact nahi.</div>

<div class="warn"><b>Common mistake.</b> Service ko uske naam se chunna, layer aur scope se nahi. Azure mein "load balancer" layer-4 resource hai; URL routing ya WAF chahiye to Application Gateway ya Front Door chahiye.</div>

<div class="scn"><h4>Friday night ka crash</h4><p>Ek startup ka store ek VM par chalta tha. Marketing email se spike aaya aur VM max ho gaya, phir crash; shop ek ghanta down rahi. Engineer ne Standard Load Balancer ke peeche health probe ke saath do VMs lagaye. Agle campaign mein rush ke beech ek VM patch hua jabki doosra sabko serve karta raha, aur kisi ko pata nahi chala.</p><p><b>Lesson:</b> load balancing speed jitni hi maintenance aur failure ke baare mein bhi hai.</p></div>

<div class="iv"><p class="q">"Azure ki load-balancing services batao aur har ek kab use karoge."</p><p>Region ke andar layer-4 TCP aur UDP ke liye Load Balancer; region ke andar layer-7 routing aur WAF ke liye Application Gateway; WAF, caching aur failover ke saath global HTTP(S) entry ke liye Front Door; kisi bhi protocol ke DNS-based global routing ke liye Traffic Manager. Batao ki inhe combine kar sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scope (regional ya global) aur layer (L4, L7, DNS) se chuno.</li>
<li>Load Balancer = L4 regional; Application Gateway = L7 regional; Front Door = L7 global; Traffic Manager = DNS global.</li>
<li>Health probes decide karte hain traffic kise milega.</li>
<li>Application Gateway v2, Azure Firewall, NAT Gateway aur Standard public IPs hourly bill karte hain: labs delete karo.</li>
<li>Is module mein theory ke saath apne subscription ya free practice labs ke liye guided labs hain.</li>
</ul></div>
`}};export{a as default};