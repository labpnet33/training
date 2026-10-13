var e={id:`sd-wan`,h:{en:`SD-WAN: application-aware, transport-agnostic branch networking`,hi:`SD-WAN: application-aware, transport-agnostic branch networking`},body:{en:`
<p>Think of a delivery company with several ways to reach each town: an expensive express highway, a free but busy city road and a motorbike courier. A smart dispatcher watches live traffic on all three and sends urgent medicine by the fastest route right now, bulk parcels by the cheapest, and switches instantly when one road jams. Drivers do not need new training for each road; the dispatcher's rules apply everywhere. That dispatcher is <b>SD-WAN</b>.</p>

<h3>Why the old WAN stopped working</h3>
<p>Harbourline's twelve branches were connected by <b>MPLS</b> circuits to HQ. All traffic, including traffic to the internet and to cloud apps, went to HQ first and then out through the HQ firewall (backhauling). Once email moved to SaaS and the tracking portal moved to the cloud, every branch user's traffic made a long detour, the MPLS links filled up, and adding a new branch meant months of waiting for a circuit and a visit by an engineer.</p>

<h3>What SD-WAN is</h3>
<p><b>Software-defined WAN (SD-WAN)</b> applies SDN ideas to the wide area network. Each branch gets an SD-WAN <b>edge</b> device (physical, or a VNF on a uCPE). The edges build encrypted <b>IPsec overlay tunnels</b> to each other, to HQ and to the cloud over whatever links the branch has. A central <b>orchestrator/controller</b> holds the policy and pushes it to every edge. Network+ lists four characteristics:</p>
<dl class="terms">
<dt>Transport agnostic</dt><dd>The overlay runs over any underlay: MPLS, broadband, fibre internet, 4G/5G, satellite. The branch can mix cheap and premium links and use all of them at once.</dd>
<dt>Application aware</dt><dd>The edge identifies applications (by deep packet inspection, DNS or known cloud addresses), not just ports, and continuously measures each path's <b>latency, jitter and packet loss</b> with probes. It then steers each application over the path that meets its requirements, and moves it when the path degrades.</dd>
<dt>Zero-touch provisioning (ZTP)</dt><dd>A new edge is shipped to the branch unconfigured. Local staff plug in power and WAN cables; the device gets an address by DHCP, contacts the vendor's onboarding service using its serial number and certificate, is authenticated, and downloads its full configuration from the orchestrator. No engineer on site.</dd>
<dt>Central policy management</dt><dd>Policies (routing, application SLAs, security, segmentation, quality of service) are written once in the orchestrator and applied to all sites, instead of logging into every router.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="SD-WAN overlay">
<rect x="220" y="10" width="200" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Orchestrator / controller</text><text x="320" y="46" text-anchor="middle" class="svg-muted" font-size="12">central policy</text>
<rect x="20" y="200" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="95" y="225" text-anchor="middle" class="svg-ink" font-size="13">Branch 7 edge</text><text x="95" y="243" text-anchor="middle" class="svg-muted" font-size="12">10.30.7.0/24</text>
<rect x="245" y="200" width="150" height="60" rx="8" fill="#e2e8f0"/><text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="13">HQ edge</text><text x="320" y="243" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/16</text>
<rect x="470" y="200" width="150" height="60" rx="8" fill="#bae6fd"/><text x="545" y="225" text-anchor="middle" class="svg-ink" font-size="13">Cloud edge (VNF)</text><text x="545" y="243" text-anchor="middle" class="svg-muted" font-size="12">VPC 10.20.0.0/16</text>
<rect x="140" y="100" width="100" height="36" rx="18" fill="#fde68a"/><text x="190" y="123" text-anchor="middle" class="svg-ink" font-size="12">MPLS</text>
<rect x="270" y="100" width="100" height="36" rx="18" fill="#fde68a"/><text x="320" y="123" text-anchor="middle" class="svg-ink" font-size="12">Broadband</text>
<rect x="400" y="100" width="100" height="36" rx="18" fill="#fde68a"/><text x="450" y="123" text-anchor="middle" class="svg-ink" font-size="12">5G</text>
<line x1="95" y1="200" x2="320" y2="200" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<path d="M95 200 Q 320 160 545 200" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="12">IPsec overlay tunnels over every transport</text>
<line x1="320" y1="54" x2="190" y2="100" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="54" x2="450" y2="100" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="54" x2="320" y2="100" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="12">policy pushed from the controller to every edge</text>
</svg><p class="cap">Harbourline's SD-WAN: each edge builds tunnels over MPLS, broadband and 5G to HQ and directly to the cloud edge, all controlled by one central policy.</p></div>

<h3>Local breakout and direct cloud access</h3>
<p>Because the overlay reaches the cloud edge directly, and because each branch has its own internet link, SaaS traffic can leave the branch locally (<b>local internet breakout</b>) instead of being backhauled to HQ. Security then has to be applied at the branch or in a cloud security service, which leads to SASE in the next chapter.</p>

<div class="eg"><p><b>Worked example: steering voice at Branch 7.</b> Meera's central policy says voice needs latency under 150 ms, jitter under 30 ms and loss under 1%; bulk backup should prefer the cheapest link. Branch 7's edge measures its three paths to HQ:</p></div>
<pre class="out">Branch-7 path quality to HQ (5-minute average, exported from the orchestrator)
Path          Latency   Jitter   Loss    Voice SLA
mpls          38 ms     3 ms     0.0%    met
broadband     61 ms     42 ms    2.4%    <span class="hl">violated</span>
5g            55 ms     12 ms    0.3%    met
Voice traffic: <span class="hl">mpls (preferred), 5g (standby)</span>
Backup traffic: broadband</pre>
<p>Broadband is congested (jitter 42 ms, loss 2.4%), so voice stays on MPLS with 5G as the standby, while the nightly backup uses the cheaper broadband link where a little loss only means retransmissions. If MPLS degrades, voice moves to 5G within seconds, without anyone logging in. Exact output formats differ by vendor, but every SD-WAN shows per-path latency, jitter and loss like this.</p>

<div class="warn"><p><b>Common mistakes.</b> Buying two broadband links from the same provider over the same street cable: "transport diversity" that fails together. Enabling local internet breakout without a matching security policy. Treating SD-WAN as only a cheaper MPLS replacement and never defining application policies, so the application-aware benefits are lost.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match each keyword: "any link type" = transport agnostic; "identifies apps and picks the best path" = application aware; "device configures itself when plugged in" = zero-touch provisioning; "one console for all branches" = central policy management. SD-WAN tunnels are normally IPsec over the underlay.</p></div>

<div class="scn"><h4>Video calls froze every afternoon</h4><p>A retail chain's branches used SD-WAN with MPLS and broadband, but staff complained that video calls froze after 2 p.m. The orchestrator showed broadband loss above 3% every afternoon when a nearby school came online. The video application had been left in the default class, which load-balanced it across both links. The engineer added an application policy for video with an SLA of loss under 1%, which pinned video to MPLS during the congestion window.</p><p><b>Lesson:</b> SD-WAN is only application aware if you classify applications and give them SLA policies.</p></div>

<div class="iv"><p class="q">"What is SD-WAN and how is it different from a traditional MPLS WAN?"</p><p>Strong answer: SD-WAN is an overlay of encrypted tunnels built by edge devices over any transport, managed from a central controller. It is transport agnostic (mix MPLS, broadband, 5G), application aware (identifies apps and steers them by measured latency, jitter and loss), uses zero-touch provisioning for new sites, and has central policy management. A traditional WAN is usually a single MPLS transport, configured box by box, often backhauling internet traffic. Mention local breakout for SaaS and the need for security at the edge or in SASE.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN = SDN for the WAN: edges, IPsec overlay tunnels and a central orchestrator.</li>
<li>Transport agnostic: MPLS, broadband, 4G/5G, satellite used together.</li>
<li>Application aware: steers each app by live latency, jitter and loss against an SLA.</li>
<li>Zero-touch provisioning: plug in, authenticate, download config, no engineer on site.</li>
<li>Central policy management: define once, apply to every branch; pair local breakout with cloud security.</li>
</ul></div>
`,hi:`
<p>Ek delivery company socho jiske paas har town tak pahunchne ke kai raaste hain: ek mehnga express highway, ek free par bheed wali city road aur ek motorbike courier. Ek smart dispatcher teeno par live traffic dekhta hai aur urgent dawai abhi ke sabse tez raaste se bhejta hai, bulk parcels sabse saste raaste se, aur jab ek raasta jam hota hai to turant switch karta hai. Drivers ko har road ke liye nayi training nahi chahiye; dispatcher ke rules har jagah lagte hain. Woh dispatcher <b>SD-WAN</b> hai.</p>

<h3>Purana WAN kaam karna kyun band ho gaya</h3>
<p>Harbourline ki barah branches <b>MPLS</b> circuits se HQ se judi thi. Saara traffic, internet aur cloud apps ka traffic bhi, pehle HQ jaata tha aur phir HQ firewall se bahar (backhauling). Jab email SaaS mein gaya aur tracking portal cloud mein gaya, har branch user ka traffic lamba chakkar lagane laga, MPLS links bhar gaye, aur nayi branch jodne ka matlab tha circuit ke liye mahino intezaar aur engineer ka visit.</p>

<h3>SD-WAN kya hai</h3>
<p><b>Software-defined WAN (SD-WAN)</b> SDN ideas ko wide area network par lagata hai. Har branch ko ek SD-WAN <b>edge</b> device milta hai (physical, ya uCPE par VNF). Edges branch ke paas jo bhi links hain unke upar ek doosre se, HQ se aur cloud se encrypted <b>IPsec overlay tunnels</b> banate hain. Ek central <b>orchestrator/controller</b> policy rakhta hai aur use har edge par push karta hai. Network+ chaar characteristics list karta hai:</p>
<dl class="terms">
<dt>Transport agnostic</dt><dd>Overlay kisi bhi underlay par chalta hai: MPLS, broadband, fibre internet, 4G/5G, satellite. Branch saste aur premium links mix kar sakti hai aur sab ek saath use kar sakti hai.</dd>
<dt>Application aware</dt><dd>Edge applications ko pehchanta hai (deep packet inspection, DNS ya known cloud addresses se), sirf ports ko nahi, aur probes se har path ki <b>latency, jitter aur packet loss</b> lagatar measure karta hai. Phir har application ko us path par steer karta hai jo uski requirements poori karta hai, aur path kharab hone par use shift karta hai.</dd>
<dt>Zero-touch provisioning (ZTP)</dt><dd>Naya edge branch par bina configuration ke bheja jaata hai. Local staff power aur WAN cables lagata hai; device DHCP se address leta hai, apne serial number aur certificate se vendor ki onboarding service se contact karta hai, authenticate hota hai, aur orchestrator se apni poori configuration download karta hai. Site par koi engineer nahi.</dd>
<dt>Central policy management</dt><dd>Policies (routing, application SLAs, security, segmentation, quality of service) orchestrator mein ek baar likhi jaati hain aur saari sites par lagti hain, har router mein login karne ki jagah.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="SD-WAN overlay">
<rect x="220" y="10" width="200" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Orchestrator / controller</text><text x="320" y="46" text-anchor="middle" class="svg-muted" font-size="12">central policy</text>
<rect x="20" y="200" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="95" y="225" text-anchor="middle" class="svg-ink" font-size="13">Branch 7 edge</text><text x="95" y="243" text-anchor="middle" class="svg-muted" font-size="12">10.30.7.0/24</text>
<rect x="245" y="200" width="150" height="60" rx="8" fill="#e2e8f0"/><text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="13">HQ edge</text><text x="320" y="243" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/16</text>
<rect x="470" y="200" width="150" height="60" rx="8" fill="#bae6fd"/><text x="545" y="225" text-anchor="middle" class="svg-ink" font-size="13">Cloud edge (VNF)</text><text x="545" y="243" text-anchor="middle" class="svg-muted" font-size="12">VPC 10.20.0.0/16</text>
<rect x="140" y="100" width="100" height="36" rx="18" fill="#fde68a"/><text x="190" y="123" text-anchor="middle" class="svg-ink" font-size="12">MPLS</text>
<rect x="270" y="100" width="100" height="36" rx="18" fill="#fde68a"/><text x="320" y="123" text-anchor="middle" class="svg-ink" font-size="12">Broadband</text>
<rect x="400" y="100" width="100" height="36" rx="18" fill="#fde68a"/><text x="450" y="123" text-anchor="middle" class="svg-ink" font-size="12">5G</text>
<line x1="95" y1="200" x2="320" y2="200" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<path d="M95 200 Q 320 160 545 200" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="12">har transport par IPsec overlay tunnels</text>
<line x1="320" y1="54" x2="190" y2="100" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="54" x2="450" y2="100" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="54" x2="320" y2="100" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="12">controller se har edge par policy push hoti hai</text>
</svg><p class="cap">Harbourline ka SD-WAN: har edge MPLS, broadband aur 5G par HQ tak aur seedha cloud edge tak tunnels banata hai, sab ek central policy se controlled.</p></div>

<h3>Local breakout aur direct cloud access</h3>
<p>Kyunki overlay seedha cloud edge tak pahunchta hai, aur kyunki har branch ka apna internet link hai, SaaS traffic HQ tak backhaul hone ki jagah branch se hi bahar nikal sakta hai (<b>local internet breakout</b>). Tab security branch par ya kisi cloud security service mein lagani padti hai, jo agle chapter mein SASE tak le jaata hai.</p>

<div class="eg"><p><b>Worked example: Branch 7 par voice steer karna.</b> Meera ki central policy kehti hai voice ko 150 ms se kam latency, 30 ms se kam jitter aur 1% se kam loss chahiye; bulk backup ko sabse sasta link prefer karna chahiye. Branch 7 ka edge HQ tak apne teen paths measure karta hai:</p></div>
<pre class="out">Branch-7 path quality to HQ (5-minute average, exported from the orchestrator)
Path          Latency   Jitter   Loss    Voice SLA
mpls          38 ms     3 ms     0.0%    met
broadband     61 ms     42 ms    2.4%    <span class="hl">violated</span>
5g            55 ms     12 ms    0.3%    met
Voice traffic: <span class="hl">mpls (preferred), 5g (standby)</span>
Backup traffic: broadband</pre>
<p>Broadband congested hai (jitter 42 ms, loss 2.4%), isliye voice MPLS par rehta hai aur 5G standby hai, jabki nightly backup sasta broadband link use karta hai jahan thoda loss sirf retransmissions ka matlab hai. Agar MPLS kharab hota hai, to voice seconds mein 5G par chala jaata hai, bina kisi ke login kiye. Exact output formats vendor ke hisaab se alag hain, par har SD-WAN aise hi per-path latency, jitter aur loss dikhata hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Same provider se same street cable par do broadband links khareedna: "transport diversity" jo ek saath fail hoti hai. Matching security policy ke bina local internet breakout enable karna. SD-WAN ko sirf sasta MPLS replacement maanna aur kabhi application policies define na karna, jisse application-aware fayde kho jaate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Har keyword match karo: "koi bhi link type" = transport agnostic; "apps pehchanta hai aur best path chunta hai" = application aware; "plug karte hi device khud configure ho jaata hai" = zero-touch provisioning; "saari branches ke liye ek console" = central policy management. SD-WAN tunnels normally underlay par IPsec hote hain.</p></div>

<div class="scn"><h4>Har dopahar video calls freeze hoti thi</h4><p>Ek retail chain ki branches MPLS aur broadband ke saath SD-WAN use karti thi, par staff ki shikayat thi ki 2 baje ke baad video calls freeze hoti hain. Orchestrator ne dikhaya ki har dopahar jab paas ka ek school online aata tha, broadband loss 3% se upar chala jaata tha. Video application default class mein chhodi gayi thi, jo use dono links par load-balance karti thi. Engineer ne video ke liye 1% se kam loss ke SLA wali application policy jodi, jisne congestion window ke dauraan video ko MPLS par pin kar diya.</p><p><b>Seekh:</b> SD-WAN tabhi application aware hai jab aap applications classify karo aur unhe SLA policies do.</p></div>

<div class="iv"><p class="q">"SD-WAN kya hai aur yeh traditional MPLS WAN se kaise alag hai?"</p><p>Strong answer: SD-WAN encrypted tunnels ka overlay hai jo edge devices kisi bhi transport par banate hain, central controller se managed. Yeh transport agnostic hai (MPLS, broadband, 5G mix karo), application aware hai (apps pehchanta hai aur measured latency, jitter aur loss ke hisaab se steer karta hai), nayi sites ke liye zero-touch provisioning use karta hai, aur central policy management rakhta hai. Traditional WAN aam taur par ek hi MPLS transport hota hai, box by box configure, aksar internet traffic backhaul karta hua. SaaS ke liye local breakout aur edge par ya SASE mein security ki zaroorat ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN = WAN ke liye SDN: edges, IPsec overlay tunnels aur ek central orchestrator.</li>
<li>Transport agnostic: MPLS, broadband, 4G/5G, satellite ek saath use hote hain.</li>
<li>Application aware: har app ko SLA ke against live latency, jitter aur loss se steer karta hai.</li>
<li>Zero-touch provisioning: plug in, authenticate, config download, site par koi engineer nahi.</li>
<li>Central policy management: ek baar define karo, har branch par lagao; local breakout ke saath cloud security jodo.</li>
</ul></div>
`}};export{e as default};