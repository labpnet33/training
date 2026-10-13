var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="{{aria}}">
<rect x="10" y="20" width="300" height="250" rx="10" fill="#ddd6fe"/><text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="13">Front Door ({{proxy}})</text>
<rect x="30" y="60" width="100" height="40" rx="6" fill="#fed7aa"/><text x="80" y="85" text-anchor="middle" class="svg-ink" font-size="12">{{user}}</text>
<rect x="150" y="60" width="140" height="40" rx="6" fill="#ffffff" stroke="#64748b"/><text x="220" y="78" text-anchor="middle" class="svg-ink" font-size="12">{{edge}}</text><text x="220" y="92" text-anchor="middle" class="svg-muted" font-size="12">WAF + cache</text>
<rect x="30" y="170" width="120" height="50" rx="6" fill="#bbf7d0"/><text x="90" y="192" text-anchor="middle" class="svg-ink" font-size="12">Origin Central India</text><text x="90" y="208" text-anchor="middle" class="svg-muted" font-size="12">healthy</text>
<rect x="170" y="170" width="120" height="50" rx="6" fill="#fecaca"/><text x="230" y="192" text-anchor="middle" class="svg-ink" font-size="12">Origin West Europe</text><text x="230" y="208" text-anchor="middle" class="svg-muted" font-size="12">down</text>
<line x1="80" y1="100" x2="90" y2="170" stroke="#16a34a" stroke-width="3"/><line x1="220" y1="100" x2="90" y2="170" stroke="#16a34a" stroke-width="3"/>
<text x="160" y="248" text-anchor="middle" class="svg-muted" font-size="12">{{fd}}</text>
<rect x="330" y="20" width="300" height="250" rx="10" fill="#bae6fd"/><text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="13">Traffic Manager ({{dns}})</text>
<rect x="350" y="60" width="100" height="40" rx="6" fill="#fed7aa"/><text x="400" y="85" text-anchor="middle" class="svg-ink" font-size="12">{{user}}</text>
<rect x="480" y="60" width="130" height="40" rx="6" fill="#ffffff" stroke="#64748b"/><text x="545" y="85" text-anchor="middle" class="svg-ink" font-size="12">DNS answer</text>
<rect x="350" y="170" width="120" height="50" rx="6" fill="#bbf7d0"/><text x="410" y="192" text-anchor="middle" class="svg-ink" font-size="12">Endpoint A</text><text x="410" y="208" text-anchor="middle" class="svg-muted" font-size="12">healthy</text>
<rect x="490" y="170" width="120" height="50" rx="6" fill="#fecaca"/><text x="550" y="192" text-anchor="middle" class="svg-ink" font-size="12">Endpoint B</text><text x="550" y="208" text-anchor="middle" class="svg-muted" font-size="12">down</text>
<line x1="450" y1="80" x2="480" y2="80" stroke="#64748b" stroke-width="2"/><line x1="400" y1="100" x2="410" y2="170" stroke="#16a34a" stroke-width="3" stroke-dasharray="5 4"/>
<text x="480" y="248" text-anchor="middle" class="svg-muted" font-size="12">{{tm}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`Front Door proxies, Traffic Manager answers DNS`,proxy:`a proxy at the edge`,user:`User`,edge:`Nearest edge`,fd:`Traffic passes THROUGH Front Door`,dns:`DNS only`,tm:`User connects DIRECTLY to the endpoint`,cap:`Front Door sits in the data path as a global reverse proxy; Traffic Manager only answers a DNS question and steps aside.`}),r=e(t,{aria:`Front Door proxies, Traffic Manager answers DNS`,proxy:`edge par proxy`,user:`User`,edge:`Sabse nazdeeki edge`,fd:`Traffic Front Door ke THROUGH jaata hai`,dns:`sirf DNS`,tm:`User endpoint se SEEDHA connect hota hai`,cap:`Front Door data path mein global reverse proxy ki tarah baithta hai; Traffic Manager sirf DNS ka jawab deta hai aur hat jaata hai.`}),i={id:`front-door-traffic-manager`,h:{en:`Front Door and Traffic Manager: global entry`,hi:`Front Door aur Traffic Manager: global entry`},body:{en:`
<h3>Why a global layer?</h3>
<p>Load Balancer and Application Gateway live in one region. If the whole region fails, or users in another continent are far from it, a regional service cannot help. A <b>global</b> layer sits above regions: it sends each user to the best healthy deployment and fails over automatically. Azure has two global services with very different mechanics.</p>

<h3>Azure Front Door</h3>
<p>Front Door is a <b>global layer-7 reverse proxy</b> running on Microsoft's edge network. Users connect to the nearest edge location using <b>anycast</b>; the edge terminates TLS, applies WAF and caching, then forwards over Microsoft's backbone to the best healthy <b>origin</b>.</p>
<dl class="terms">
<dt>Profile and tiers</dt><dd>Standard and Premium tiers (Premium adds extra WAF rule sets and Private Link origins; verify the feature split). The older Classic Front Door is being retired (announced 31 March 2027; verify).</dd>
<dt>Endpoint</dt><dd>The name users hit, for example nk-shop-xxxx.z01.azurefd.net, plus your custom domains with managed certificates.</dd>
<dt>Origin group and origins</dt><dd>The backends (App Service, Application Gateway public IP, Storage static site, VMs, any public host) grouped with a health probe and load-balancing settings (latency sensitivity, priority, weight).</dd>
<dt>Route</dt><dd>Maps domain and path patterns to an origin group, with caching and redirects.</dd>
<dt>WAF policy</dt><dd>Edge protection against common web attacks and bots, with Detection or Prevention mode.</dd>
</dl>
<p>Typical benefits: lower latency for global users, TLS offload at the edge, DDoS absorption, caching of static content, instant failover between regions. Typical care points: lock the origin so only Front Door can reach it (allow the <code>AzureFrontDoor.Backend</code> service tag and check the <code>X-Azure-FDID</code> header), otherwise attackers can bypass the WAF by hitting the origin directly.</p>

<h3>Azure Traffic Manager</h3>
<p>Traffic Manager is a <b>DNS-based</b> traffic router. When a client resolves nk-shop.example, Traffic Manager's DNS answers with the address or name of one endpoint chosen by the routing method. After that, the client connects <b>directly</b> to the endpoint: Traffic Manager is no longer in the path, so it works for <b>any protocol</b> (not just HTTP) but cannot cache, terminate TLS or filter.</p>
<table class="cmp"><tr><th>Routing method</th><th>Use</th></tr>
<tr><td>Priority</td><td>Active/passive failover: primary, then secondary</td></tr>
<tr><td>Weighted</td><td>Split traffic by weights; blue/green and canary</td></tr>
<tr><td>Performance</td><td>Lowest network latency to the endpoint</td></tr>
<tr><td>Geographic</td><td>Pin user regions to endpoints (data residency)</td></tr>
<tr><td>MultiValue</td><td>Return several healthy IPs</td></tr>
<tr><td>Subnet</td><td>Map client IP ranges to endpoints</td></tr></table>
`+n+`
<h3>The failover-time difference</h3>
<p>Front Door detects an unhealthy origin through probes and stops sending requests within seconds, because every request passes through it. Traffic Manager's failover time is the probe interval times tolerated failures <b>plus</b> the DNS TTL cache time on the clients' resolvers: with a 60-second TTL and probes every 30 seconds with 3 tolerated failures, worst-case switch can take around 2.5 minutes or more (illustrative arithmetic, verify defaults). Some clients ignore TTLs.</p>

<h3>Choosing between them</h3>
<table class="cmp"><tr><th>Question</th><th>Front Door</th><th>Traffic Manager</th></tr>
<tr><td>Layer</td><td>7 (HTTP and HTTPS)</td><td>DNS (any protocol)</td></tr>
<tr><td>In the data path?</td><td>Yes (proxy)</td><td>No</td></tr>
<tr><td>WAF and caching</td><td>Yes</td><td>No</td></tr>
<tr><td>Failover speed</td><td>Seconds</td><td>Minutes (TTL dependent)</td></tr>
<tr><td>Non-HTTP apps (SMTP, game UDP)</td><td>Not suited</td><td>Suitable</td></tr>
<tr><td>Cost shape</td><td>Base fee per profile plus per request and data transfer (verify)</td><td>Per DNS query and per endpoint health check (verify)</td></tr></table>

<div class="eg"><b>Worked example.</b> A shop runs in Central India and West Europe. Front Door has one endpoint, one origin group with both regions (latency-based, priority tie-break) and a WAF policy in Prevention mode. A user in Mumbai goes to the Central India origin. At 10:00 Central India fails its probe; at 10:00:20 all new Mumbai requests flow to West Europe with no DNS change and no client action.</div>

<div class="warn"><b>Common mistakes.</b> Expecting Traffic Manager to cache or terminate TLS; leaving the origin open to the internet so WAF is bypassed; using a long DNS TTL and expecting instant failover; using Front Door for a non-HTTP protocol; forgetting that Traffic Manager cannot be a plain A record at the zone apex without an alias record.</div>
<div class="exam"><b>Exam trap.</b> "Which service provides global HTTP load balancing with WAF and acts as a proxy?" Front Door. "Which only returns DNS answers and works with any protocol?" Traffic Manager.</div>

<div class="scn"><h4>The failover that took four minutes</h4><p>A game studio used Traffic Manager (Priority) between two regions for a UDP game service. When the primary failed, players were disconnected for around four minutes because resolvers cached the old answer for the TTL, plus probe delays. The studio lowered the TTL to 30 seconds, tuned probe interval and tolerated failures, and added client retry logic. For their HTTPS website they used Front Door, where failover took seconds.</p><p><b>Lesson:</b> DNS failover is bounded by TTL and client behaviour; proxy failover is not.</p></div>

<div class="iv"><p class="q">"Front Door or Traffic Manager for a global web app?"</p><p>Front Door for HTTP(S): anycast edge, WAF, caching, TLS offload, near-instant health-based failover. Traffic Manager when the protocol is not HTTP, or as a simple DNS layer, accepting DNS caching delays. They can also be combined, for example Traffic Manager across Front Door and another CDN.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Front Door is a global layer-7 proxy with WAF and caching; failover in seconds.</li>
<li>Traffic Manager is DNS only; the client connects directly; failover bound by TTL.</li>
<li>Lock origins so only Front Door can reach them.</li>
<li>Traffic Manager routing: Priority, Weighted, Performance, Geographic, MultiValue, Subnet.</li>
<li>Classic Front Door is being retired (verify date); use Standard or Premium.</li>
</ul></div>
`,hi:`
<h3>Global layer kyun?</h3>
<p>Load Balancer aur Application Gateway ek region mein rehte hain. Poora region fail ho jaye, ya doosre continent ke users us se door hon, to regional service madad nahi kar sakti. <b>Global</b> layer regions ke upar baithta hai: har user ko sabse achhe healthy deployment tak bhejta hai aur automatically fail over karta hai. Azure ki do global services hain jinka mechanics bahut alag hai.</p>

<h3>Azure Front Door</h3>
<p>Front Door Microsoft ke edge network par chalne wala <b>global layer-7 reverse proxy</b> hai. Users <b>anycast</b> se sabse nazdeeki edge location se connect hote hain; edge TLS terminate karta hai, WAF aur caching lagata hai, phir Microsoft backbone par sabse achhe healthy <b>origin</b> ko forward karta hai.</p>
<dl class="terms">
<dt>Profile aur tiers</dt><dd>Standard aur Premium tiers (Premium extra WAF rule sets aur Private Link origins jodta hai; feature split verify karo). Purana Classic Front Door retire ho raha hai (announced 31 March 2027; verify).</dd>
<dt>Endpoint</dt><dd>Jis naam par users aate hain, jaise nk-shop-xxxx.z01.azurefd.net, plus managed certificates ke saath aapke custom domains.</dd>
<dt>Origin group aur origins</dt><dd>Backends (App Service, Application Gateway public IP, Storage static site, VMs, koi bhi public host) jo health probe aur load-balancing settings (latency sensitivity, priority, weight) ke saath group hote hain.</dd>
<dt>Route</dt><dd>Domain aur path patterns ko origin group se map karta hai, caching aur redirects ke saath.</dd>
<dt>WAF policy</dt><dd>Common web attacks aur bots ke khilaf edge protection, Detection ya Prevention mode ke saath.</dd>
</dl>
<p>Typical fayde: global users ke liye kam latency, edge par TLS offload, DDoS absorb karna, static content ki caching, regions ke beech instant failover. Dhyan dene wali baat: origin ko lock karo taaki sirf Front Door pahunch sake (<code>AzureFrontDoor.Backend</code> service tag allow karo aur <code>X-Azure-FDID</code> header check karo), warna attackers origin ko seedha hit karke WAF bypass kar sakte hain.</p>

<h3>Azure Traffic Manager</h3>
<p>Traffic Manager <b>DNS-based</b> traffic router hai. Client nk-shop.example resolve kare to Traffic Manager ka DNS routing method se chune hue ek endpoint ka address ya naam jawab mein deta hai. Uske baad client endpoint se <b>seedha</b> connect hota hai: Traffic Manager ab path mein nahi hai, isliye yeh <b>kisi bhi protocol</b> (sirf HTTP nahi) ke liye kaam karta hai par cache, TLS terminate ya filter nahi kar sakta.</p>
<table class="cmp"><tr><th>Routing method</th><th>Use</th></tr>
<tr><td>Priority</td><td>Active/passive failover: primary, phir secondary</td></tr>
<tr><td>Weighted</td><td>Weights se traffic split; blue/green aur canary</td></tr>
<tr><td>Performance</td><td>Endpoint tak sabse kam network latency</td></tr>
<tr><td>Geographic</td><td>User regions ko endpoints se pin karo (data residency)</td></tr>
<tr><td>MultiValue</td><td>Kai healthy IPs return karo</td></tr>
<tr><td>Subnet</td><td>Client IP ranges ko endpoints se map karo</td></tr></table>
`+r+`
<h3>Failover-time ka farq</h3>
<p>Front Door probes se unhealthy origin pehchan leta hai aur seconds mein requests bhejna band kar deta hai, kyunki har request uske through guzarti hai. Traffic Manager ka failover time probe interval ganaa tolerated failures <b>plus</b> clients ke resolvers par DNS TTL cache time hai: 60-second TTL aur har 30 second probe ke saath 3 tolerated failures par worst-case switch lagbhag 2.5 minute ya zyada le sakta hai (illustrative arithmetic, defaults verify karo). Kuch clients TTL ignore karte hain.</p>

<h3>Dono mein chunna</h3>
<table class="cmp"><tr><th>Sawal</th><th>Front Door</th><th>Traffic Manager</th></tr>
<tr><td>Layer</td><td>7 (HTTP aur HTTPS)</td><td>DNS (koi bhi protocol)</td></tr>
<tr><td>Data path mein?</td><td>Haan (proxy)</td><td>Nahi</td></tr>
<tr><td>WAF aur caching</td><td>Haan</td><td>Nahi</td></tr>
<tr><td>Failover speed</td><td>Seconds</td><td>Minutes (TTL par depend)</td></tr>
<tr><td>Non-HTTP apps (SMTP, game UDP)</td><td>Suited nahi</td><td>Suited</td></tr>
<tr><td>Cost shape</td><td>Profile ka base fee plus per request aur data transfer (verify)</td><td>Per DNS query aur per endpoint health check (verify)</td></tr></table>

<div class="eg"><b>Worked example.</b> Ek shop Central India aur West Europe mein chalti hai. Front Door ke paas ek endpoint, dono regions wala ek origin group (latency-based, priority tie-break) aur Prevention mode mein WAF policy hai. Mumbai ka user Central India origin ko jaata hai. 10:00 par Central India probe fail karta hai; 10:00:20 par Mumbai ki saari nayi requests bina DNS change aur bina client action ke West Europe ko jaati hain.</div>

<div class="warn"><b>Common mistakes.</b> Traffic Manager se caching ya TLS termination ki ummeed; origin ko internet ke liye khula chhodna jisse WAF bypass ho; lamba DNS TTL rakhkar instant failover expect karna; non-HTTP protocol ke liye Front Door use karna; bhoolna ki Traffic Manager zone apex par plain A record nahi ho sakta bina alias record ke.</div>
<div class="exam"><b>Exam trap.</b> "Kaunsi service WAF ke saath global HTTP load balancing deti hai aur proxy ki tarah kaam karti hai?" Front Door. "Kaunsi sirf DNS answers return karti hai aur kisi bhi protocol ke saath chalti hai?" Traffic Manager.</div>

<div class="scn"><h4>Failover jisme chaar minute lage</h4><p>Ek game studio ne UDP game service ke liye do regions ke beech Traffic Manager (Priority) use kiya. Primary fail hua to players lagbhag chaar minute disconnect rahe kyunki resolvers ne TTL tak purana answer cache kiya, plus probe delays. Studio ne TTL 30 second kiya, probe interval aur tolerated failures tune kiye, aur client retry logic jodi. Apni HTTPS website ke liye unhone Front Door use kiya, jahan failover seconds mein hua.</p><p><b>Lesson:</b> DNS failover TTL aur client behaviour se bounded hai; proxy failover nahi.</p></div>

<div class="iv"><p class="q">"Global web app ke liye Front Door ya Traffic Manager?"</p><p>HTTP(S) ke liye Front Door: anycast edge, WAF, caching, TLS offload, lagbhag instant health-based failover. Traffic Manager jab protocol HTTP na ho, ya simple DNS layer ke roop mein, DNS caching delays accept karke. Dono combine bhi ho sakte hain, jaise Front Door aur kisi aur CDN ke upar Traffic Manager.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Front Door WAF aur caching wala global layer-7 proxy hai; failover seconds mein.</li>
<li>Traffic Manager sirf DNS hai; client seedha connect hota hai; failover TTL se bounded.</li>
<li>Origins lock karo taaki sirf Front Door pahunch sake.</li>
<li>Traffic Manager routing: Priority, Weighted, Performance, Geographic, MultiValue, Subnet.</li>
<li>Classic Front Door retire ho raha hai (date verify karo); Standard ya Premium use karo.</li>
</ul></div>
`}};export{i as default};