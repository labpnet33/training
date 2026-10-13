var e={id:`architecture`,h:{en:`Versa architecture: Director, Controller, Analytics, VOS`,hi:`Versa architecture: Director, Controller, Analytics, VOS`},body:{en:`
<p>A Versa SD-WAN is a small family of cooperating components. If you can name each one, say what it does and say which plane it works in, you can read any topology diagram and know where to look when something fails.</p>

<h3>Analogy: an airline</h3>
<p>An airline has a head office that writes the schedule and rules (management), an air traffic control tower that tells each plane where to fly right now (control), the planes and pilots that actually carry passengers (data), and a safety department that studies flight recorders afterwards (analytics). Versa splits its work in a similar way.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Versa architecture">
<rect x="10" y="10" width="620" height="140" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="25" y="30" class="svg-ink" font-size="13">Headend (Mumbai DC, 198.51.100.0/24)</text>
<rect x="30" y="45" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="95" y="70" text-anchor="middle" class="svg-ink" font-size="13">Director</text><text x="95" y="90" text-anchor="middle" class="svg-muted" font-size="11">.10 management</text>
<rect x="180" y="45" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="245" y="70" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="245" y="90" text-anchor="middle" class="svg-muted" font-size="11">.20 control</text>
<rect x="330" y="45" width="130" height="60" rx="8" fill="#fde68a"/><text x="395" y="70" text-anchor="middle" class="svg-ink" font-size="13">Analytics</text><text x="395" y="90" text-anchor="middle" class="svg-muted" font-size="11">.30 logs</text>
<rect x="480" y="45" width="130" height="60" rx="8" fill="#fed7aa"/><text x="545" y="70" text-anchor="middle" class="svg-ink" font-size="13">Concerto</text><text x="545" y="90" text-anchor="middle" class="svg-muted" font-size="11">optional orchestrator</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">Director configures; Controller steers; Analytics collects</text>
<rect x="30" y="200" width="150" height="60" rx="8" fill="#bae6fd"/><text x="105" y="225" text-anchor="middle" class="svg-ink" font-size="13">Branch1 VOS</text><text x="105" y="245" text-anchor="middle" class="svg-muted" font-size="11">Delhi, 101</text>
<rect x="245" y="200" width="150" height="60" rx="8" fill="#bae6fd"/><text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="13">Branch2 VOS</text><text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="11">Bengaluru, 102</text>
<rect x="460" y="200" width="150" height="60" rx="8" fill="#bae6fd"/><text x="535" y="225" text-anchor="middle" class="svg-ink" font-size="13">Branch3 VOS</text><text x="535" y="245" text-anchor="middle" class="svg-muted" font-size="11">Kolkata, 103</text>
<line x1="105" y1="200" x2="245" y2="105" stroke="#64748b"/><line x1="320" y1="200" x2="245" y2="105" stroke="#64748b"/><line x1="535" y1="200" x2="260" y2="105" stroke="#64748b"/>
<line x1="180" y1="230" x2="245" y2="230" stroke="#64748b" stroke-dasharray="4"/><line x1="395" y1="230" x2="460" y2="230" stroke="#64748b" stroke-dasharray="4"/>
<text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="12">Solid: branch to Controller. Dashed: branch-to-branch overlay tunnels.</text>
</svg><p class="cap">Headend at the top, branches below. Branch-to-branch traffic goes directly between branches once the Controller has shared routes.</p></div>

<h3>The components</h3>
<dl class="terms">
<dt>VOS (Versa Operating System)</dt><dd>The software on branch and data center devices (CPE). It forwards user traffic and runs routing, SD-WAN, NGFW and other services in a <b>single-pass</b> architecture: a packet is parsed once and every service acts on it, rather than hopping between separate appliances. VOS is multi-tenant, so one device can serve several organizations. It runs on appliances, on virtual machines and in public clouds. The older name FlexVNF is still used in some documents.</dd>
<dt>Director</dt><dd>The management and orchestration system. Administrators use its web interface and APIs to create devices, templates, device groups and workflows, push configuration to VOS devices, and monitor status. In the Director's workflow wizards a new branch is defined with its serial number, template and bind data (the per-site values). In the lab Director is 198.51.100.10 with hostname Director-1.</dd>
<dt>Controller</dt><dd>The SD-WAN control plane. It authenticates branches, distributes tunnel and key information, and acts as the BGP route reflector: branches send it their LAN prefixes and it tells every branch where the other prefixes live. In the lab Controller is 198.51.100.20 on the Internet transport and 172.31.100.2 on MPLS, hostname Controller-1.</dd>
<dt>Analytics</dt><dd>The log collector and reporting platform. Branches export logs and flow records; dashboards show applications, path quality, SLA violations and security events. Lab Analytics is 198.51.100.30.</dd>
<dt>Concerto</dt><dd>An optional orchestrator on top of Director for large or multi-tenant deployments: a simplified, service-oriented portal for provisioning, policy and onboarding. It is not required and is not used in these labs.</dd>
</dl>

<h3>Three planes</h3>
<table class="cmp"><tr><th>Plane</th><th>Question it answers</th><th>Who does it</th><th>Failure symptom</th></tr>
<tr><td><b>Management</b></td><td>How do I configure and monitor devices?</td><td>Director talks to VOS devices</td><td>Cannot push config, device shows unreachable in Director</td></tr>
<tr><td><b>Control</b></td><td>Who are the sites and where are the prefixes?</td><td>Controller with MP-BGP sessions to branches</td><td>Overlay Idle, no remote prefixes</td></tr>
<tr><td><b>Data</b></td><td>How do user packets travel?</td><td>VOS branches over IPsec tunnels, directly between sites</td><td>Application slow, packet loss, tunnel down</td></tr>
</table>
<p>A key point: user traffic does <b>not</b> go through the Controller. The Controller only exchanges control information; branches then build tunnels and send data directly between themselves. A Controller outage stops new learning but existing flows usually continue for a time.</p>

<h3>MP-BGP as the overlay routing language</h3>
<p>Between each branch and the Controller runs an <b>MP-BGP</b> (multiprotocol BGP) session. It is the same BGP you know from CCNP, extended with address families so that it can carry overlay-specific information like site, tenant and tunnel endpoints. The session state is what <code>show bgp neighbor brief</code> shows: <b>Established</b> means healthy, <b>Idle</b> means it has not started or cannot. The lab model uses AS 64512 for the session and shows the Controller as the neighbor on the branch.</p>

<div class="eg"><p><b>Worked example: a new prefix.</b> Kolkata (site 103) comes online. 1) Its VOS builds IPsec tunnels towards the Controller over each working transport. 2) The MP-BGP session reaches Established. 3) Kolkata advertises 10.1.3.0/24. 4) The Controller reflects that prefix to Delhi and Bengaluru, together with the tunnel endpoints. 5) Delhi can now send 10.1.3.0/24 traffic directly to Kolkata. Remove step 2 and nothing else happens.</p></div>

<div class="note"><p><b>Course model note.</b> The simplified lab combines some real behaviours. For example, each branch has one tunnel per WAN interface to the Controller, and the Director link is checked with <code>show system director status</code> on the Controller. In production, Versa has richer constructs (service chains, VPN profiles, device templates in the Director GUI). The text always says when something is a model helper.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Believing user traffic passes through the Controller. (2) Treating Director and Controller as one box: Director manages, Controller controls. (3) Expecting configuration made directly on a branch to survive if it conflicts with a Director template push; the template wins on the next push.</p></div>
<div class="exam"><p><b>Exam trap.</b> Match the job to the component: configuration templates and onboarding = Director; routes and tunnel peering = Controller; logs and reports = Analytics; forwarding and security = VOS; optional multi-tenant portal = Concerto.</p></div>

<div class="scn"><h4>Director down, network up</h4><p>During a maintenance window the Director was unreachable for two hours. Operations feared an outage. In reality all branches kept forwarding traffic because VOS devices run their last known configuration and the Controller continued MP-BGP and tunnels. The only effect was that no one could push new templates. When Director returned the queued workflow finished.</p><p><b>Lesson:</b> management plane failure is not data plane failure. Know which plane your symptom belongs to.</p></div>

<div class="iv"><p class="q">"Walk me through the components of a Versa SD-WAN."</p><p>Strong answer: VOS devices at branches and DCs forward traffic and run SD-WAN and security services in a single-pass, multi-tenant design. Director is the management and orchestration plane (templates, workflows, config push). The Controller is the control plane, peering with branches over MP-BGP, distributing keys and prefixes. Analytics collects logs and reports. Concerto is an optional orchestrator. User traffic goes branch-to-branch directly over IPsec.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VOS forwards; Director manages; Controller controls; Analytics reports; Concerto is optional.</li>
<li>Management, control and data planes fail differently; identify the plane first.</li>
<li>The Controller reflects overlay routes using MP-BGP; user data does not pass through it.</li>
<li>Branches are multi-tenant capable and managed by templates pushed from Director.</li>
<li>Lab addresses: Director .10, Controller .20 (and 172.31.100.2), Analytics .30.</li>
</ul></div>
`,hi:`
<p>Versa SD-WAN cooperating components ka chhota parivaar hai. Agar aap har component ka naam le sakte ho, bata sakte ho woh kya karta hai aur kis plane mein kaam karta hai, to aap koi bhi topology diagram padh sakte ho aur jaan sakte ho ki kuch fail hone par kahan dekhna hai.</p>

<h3>Analogy: ek airline</h3>
<p>Airline ka ek head office hota hai jo schedule aur rules likhta hai (management), ek air traffic control tower jo har plane ko abhi kahan udna hai batata hai (control), planes aur pilots jo actually passengers le jaate hain (data), aur ek safety department jo baad mein flight recorders ka study karta hai (analytics). Versa apna kaam isi tarah baantta hai.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Versa architecture">
<rect x="10" y="10" width="620" height="140" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="25" y="30" class="svg-ink" font-size="13">Headend (Mumbai DC, 198.51.100.0/24)</text>
<rect x="30" y="45" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="95" y="70" text-anchor="middle" class="svg-ink" font-size="13">Director</text><text x="95" y="90" text-anchor="middle" class="svg-muted" font-size="11">.10 management</text>
<rect x="180" y="45" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="245" y="70" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="245" y="90" text-anchor="middle" class="svg-muted" font-size="11">.20 control</text>
<rect x="330" y="45" width="130" height="60" rx="8" fill="#fde68a"/><text x="395" y="70" text-anchor="middle" class="svg-ink" font-size="13">Analytics</text><text x="395" y="90" text-anchor="middle" class="svg-muted" font-size="11">.30 logs</text>
<rect x="480" y="45" width="130" height="60" rx="8" fill="#fed7aa"/><text x="545" y="70" text-anchor="middle" class="svg-ink" font-size="13">Concerto</text><text x="545" y="90" text-anchor="middle" class="svg-muted" font-size="11">optional orchestrator</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">Director configure karta hai; Controller steer karta hai; Analytics collect karta hai</text>
<rect x="30" y="200" width="150" height="60" rx="8" fill="#bae6fd"/><text x="105" y="225" text-anchor="middle" class="svg-ink" font-size="13">Branch1 VOS</text><text x="105" y="245" text-anchor="middle" class="svg-muted" font-size="11">Delhi, 101</text>
<rect x="245" y="200" width="150" height="60" rx="8" fill="#bae6fd"/><text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="13">Branch2 VOS</text><text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="11">Bengaluru, 102</text>
<rect x="460" y="200" width="150" height="60" rx="8" fill="#bae6fd"/><text x="535" y="225" text-anchor="middle" class="svg-ink" font-size="13">Branch3 VOS</text><text x="535" y="245" text-anchor="middle" class="svg-muted" font-size="11">Kolkata, 103</text>
<line x1="105" y1="200" x2="245" y2="105" stroke="#64748b"/><line x1="320" y1="200" x2="245" y2="105" stroke="#64748b"/><line x1="535" y1="200" x2="260" y2="105" stroke="#64748b"/>
<line x1="180" y1="230" x2="245" y2="230" stroke="#64748b" stroke-dasharray="4"/><line x1="395" y1="230" x2="460" y2="230" stroke="#64748b" stroke-dasharray="4"/>
<text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="12">Solid: branch se Controller. Dashed: branch-to-branch overlay tunnels.</text>
</svg><p class="cap">Upar headend, neeche branches. Controller ke routes share karne ke baad branch-to-branch traffic seedha branches ke beech jaata hai.</p></div>

<h3>Components</h3>
<dl class="terms">
<dt>VOS (Versa Operating System)</dt><dd>Branch aur data center devices (CPE) ka software. Yeh user traffic forward karta hai aur routing, SD-WAN, NGFW aur dusri services <b>single-pass</b> architecture mein chalata hai: packet ek baar parse hota hai aur har service us par act karti hai, alag appliances ke beech hop karne ke bajay. VOS multi-tenant hai, isliye ek device kai organizations ko serve kar sakta hai. Yeh appliances, virtual machines aur public clouds par chalta hai. Purana naam FlexVNF kuch documents mein ab bhi use hota hai.</dd>
<dt>Director</dt><dd>Management aur orchestration system. Administrators iske web interface aur APIs se devices, templates, device groups aur workflows banate hain, VOS devices par configuration push karte hain aur status monitor karte hain. Director ke workflow wizards mein nayi branch serial number, template aur bind data (per-site values) ke saath define hoti hai. Lab mein Director 198.51.100.10 hai, hostname Director-1.</dd>
<dt>Controller</dt><dd>SD-WAN control plane. Yeh branches ko authenticate karta hai, tunnel aur key information distribute karta hai, aur BGP route reflector ka kaam karta hai: branches use apne LAN prefixes bhejti hain aur woh har branch ko batata hai ki baaki prefixes kahan hain. Lab mein Controller Internet transport par 198.51.100.20 aur MPLS par 172.31.100.2 hai, hostname Controller-1.</dd>
<dt>Analytics</dt><dd>Log collector aur reporting platform. Branches logs aur flow records export karti hain; dashboards applications, path quality, SLA violations aur security events dikhate hain. Lab Analytics 198.51.100.30 hai.</dd>
<dt>Concerto</dt><dd>Director ke upar optional orchestrator, bade ya multi-tenant deployments ke liye: provisioning, policy aur onboarding ka simplified, service-oriented portal. Yeh zaroori nahi hai aur in labs mein use nahi hota.</dd>
</dl>

<h3>Teen planes</h3>
<table class="cmp"><tr><th>Plane</th><th>Kaunsa sawaal solve karta hai</th><th>Kaun karta hai</th><th>Failure symptom</th></tr>
<tr><td><b>Management</b></td><td>Devices ko configure aur monitor kaise karun?</td><td>Director VOS devices se baat karta hai</td><td>Config push nahi hota, Director mein device unreachable</td></tr>
<tr><td><b>Control</b></td><td>Sites kaun hain aur prefixes kahan hain?</td><td>Controller, branches ke saath MP-BGP sessions</td><td>Overlay Idle, remote prefixes nahi</td></tr>
<tr><td><b>Data</b></td><td>User packets kaise chalte hain?</td><td>VOS branches IPsec tunnels par, sites ke beech seedha</td><td>Application slow, packet loss, tunnel down</td></tr>
</table>
<p>Ek key point: user traffic Controller se <b>nahi</b> guzarta. Controller sirf control information exchange karta hai; branches phir tunnels banati hain aur data aapas mein seedha bhejti hain. Controller outage naya learning rok deta hai lekin existing flows aam taur par kuch der chalte rehte hain.</p>

<h3>MP-BGP overlay routing ki bhasha ke roop mein</h3>
<p>Har branch aur Controller ke beech ek <b>MP-BGP</b> (multiprotocol BGP) session chalta hai. Yeh wahi BGP hai jo aap CCNP se jaante ho, address families ke saath extended, taaki woh site, tenant aur tunnel endpoints jaisi overlay-specific information le ja sake. Session state wahi hai jo <code>show bgp neighbor brief</code> dikhata hai: <b>Established</b> matlab healthy, <b>Idle</b> matlab shuru nahi hua ya ho nahi sakta. Lab model session ke liye AS 64512 use karta hai aur branch par Controller ko neighbor dikhata hai.</p>

<div class="eg"><p><b>Worked example: naya prefix.</b> Kolkata (site 103) online aata hai. 1) Uska VOS har working transport par Controller ki taraf IPsec tunnels banata hai. 2) MP-BGP session Established ho jaata hai. 3) Kolkata 10.1.3.0/24 advertise karta hai. 4) Controller woh prefix Delhi aur Bengaluru ko reflect karta hai, tunnel endpoints ke saath. 5) Delhi ab 10.1.3.0/24 ka traffic seedha Kolkata bhej sakti hai. Step 2 hata do to aage kuch nahi hota.</p></div>

<div class="note"><p><b>Course model note.</b> Simplified lab kuch real behaviours ko combine karta hai. Jaise har branch ka Controller ki taraf har WAN interface par ek tunnel hota hai, aur Director link Controller par <code>show system director status</code> se check hota hai. Production mein Versa ke paas richer constructs hain (service chains, VPN profiles, Director GUI mein device templates). Text hamesha batata hai jab kuch model helper ho.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Maan lena ki user traffic Controller se guzarta hai. (2) Director aur Controller ko ek box samajhna: Director manage karta hai, Controller control karta hai. (3) Branch par seedha ki hui configuration Director template push se conflict kare to bhi bachegi, yeh expect karna; agle push par template jeetta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kaam ko component se match karo: configuration templates aur onboarding = Director; routes aur tunnel peering = Controller; logs aur reports = Analytics; forwarding aur security = VOS; optional multi-tenant portal = Concerto.</p></div>

<div class="scn"><h4>Director down, network up</h4><p>Maintenance window mein Director do ghante unreachable raha. Operations ko outage ka dar tha. Asal mein saari branches traffic forward karti rahin kyunki VOS devices apni last known configuration chalate hain aur Controller MP-BGP aur tunnels chalata raha. Sirf itna asar hua ki koi naye templates push nahi kar paya. Director wapas aaya to queued workflow poora ho gaya.</p><p><b>Seekh:</b> management plane failure data plane failure nahi hai. Jaano ki aapka symptom kis plane ka hai.</p></div>

<div class="iv"><p class="q">"Versa SD-WAN ke components samjhao."</p><p>Strong answer: branches aur DCs par VOS devices traffic forward karte hain aur single-pass, multi-tenant design mein SD-WAN aur security services chalate hain. Director management aur orchestration plane hai (templates, workflows, config push). Controller control plane hai, branches ke saath MP-BGP peering karta hai, keys aur prefixes distribute karta hai. Analytics logs aur reports collect karta hai. Concerto optional orchestrator hai. User traffic branch-to-branch seedha IPsec par jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VOS forward karta hai; Director manage karta hai; Controller control karta hai; Analytics report karta hai; Concerto optional hai.</li>
<li>Management, control aur data planes alag tarah fail hote hain; pehle plane pehchano.</li>
<li>Controller MP-BGP se overlay routes reflect karta hai; user data uske through nahi jaata.</li>
<li>Branches multi-tenant capable hain aur Director se push hue templates se manage hoti hain.</li>
<li>Lab addresses: Director .10, Controller .20 (aur 172.31.100.2), Analytics .30.</li>
</ul></div>
`}};export{e as default};