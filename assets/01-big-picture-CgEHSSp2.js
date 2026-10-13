var e={id:`big-picture`,h:{en:`Why controller-based fabrics: the big picture`,hi:`Controller-based fabrics kyun: badi tasveer`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these twelve chapters you will be able to explain, draw, onboard and troubleshoot a <b>Cisco Catalyst SD-WAN</b> fabric (Manager, Controller, Validator and WAN edges, OMP, TLOCs, colours, BFD, IPsec, templates and policies) and describe a <b>Cisco SD-Access</b> campus fabric (control plane, border and edge nodes, LISP, VXLAN, scalable group tags, Catalyst Center and ISE, and how it talks to a traditional campus). These are ENCOR 350-401 v1.2 blueprint items <b>1.4</b> and <b>1.5</b>. You will finish by fixing a real broken branch in the lab <i>Troubleshoot · Bring two sites into the SD-WAN fabric</i>.</p>
<p><b>Prerequisites.</b> You should be comfortable with IP routing (static, OSPF and the idea of BGP route reflectors), VRFs, and what an IPsec tunnel does. The previous module (<i>Enterprise design &amp; high availability</i>) gave you the three-tier and collapsed-core campus; here we replace hand-built WANs and campuses with fabrics. The deep mechanics of LISP and VXLAN come later in <i>LISP &amp; VXLAN</i>, TrustSec and 802.1X in <i>Threat defense</i>, and Catalyst Center assurance in its own module. We only preview them here.</p>

<h3>An analogy: from independent taxis to a dispatch centre</h3>
<p>Imagine a city with 500 taxis and no dispatch. Each driver keeps his own map, phones every other driver to learn which roads are blocked, and decides alone which route to take. When the city adds a new flyover, someone must tell all 500 drivers one by one. That is a <b>traditional WAN</b>: every router is configured by hand, every branch runs routing protocols with the hub over each circuit, and a policy change means logging in to hundreds of boxes.</p>
<p>Now add a <b>dispatch centre</b>. A new taxi calls the gate once, proves who it is, and is told which dispatcher to talk to. The dispatcher knows every taxi's position and every road, tells each driver only what he needs, and can say "for VIP passengers use the expressway, even if it costs more". The taxis still drive the passengers themselves; the dispatcher never carries anyone. That is <b>SD-WAN</b>: a Validator at the gate, a Controller as dispatcher, a Manager as the head office, and WAN edge routers that carry the actual traffic.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Traditional WAN versus SD-WAN">
<rect x="10" y="10" width="300" height="230" rx="10" fill="#e2e8f0"/>
<text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="14">Traditional WAN</text>
<rect x="115" y="50" width="90" height="32" rx="6" fill="#fed7aa"/><text x="160" y="71" text-anchor="middle" class="svg-ink" font-size="12">Hub router</text>
<rect x="30" y="180" width="70" height="30" rx="6" fill="#fed7aa"/><text x="65" y="200" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="125" y="180" width="70" height="30" rx="6" fill="#fed7aa"/><text x="160" y="200" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="220" y="180" width="70" height="30" rx="6" fill="#fed7aa"/><text x="255" y="200" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<line x1="160" y1="82" x2="65" y2="180" stroke="#64748b"/><line x1="160" y1="82" x2="160" y2="180" stroke="#64748b"/><line x1="160" y1="82" x2="255" y2="180" stroke="#64748b"/>
<text x="160" y="232" text-anchor="middle" class="svg-muted" font-size="12">box-by-box CLI, one routing mesh per circuit</text>
<rect x="330" y="10" width="300" height="230" rx="10" fill="#bae6fd"/>
<text x="480" y="32" text-anchor="middle" class="svg-ink" font-size="14">Catalyst SD-WAN</text>
<rect x="345" y="45" width="85" height="30" rx="6" fill="#ddd6fe"/><text x="387" y="65" text-anchor="middle" class="svg-ink" font-size="12">Manager</text>
<rect x="437" y="45" width="85" height="30" rx="6" fill="#ddd6fe"/><text x="480" y="65" text-anchor="middle" class="svg-ink" font-size="12">Controller</text>
<rect x="529" y="45" width="85" height="30" rx="6" fill="#ddd6fe"/><text x="572" y="65" text-anchor="middle" class="svg-ink" font-size="12">Validator</text>
<rect x="350" y="180" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="390" y="200" text-anchor="middle" class="svg-ink" font-size="12">WAN edge</text>
<rect x="530" y="180" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="570" y="200" text-anchor="middle" class="svg-ink" font-size="12">WAN edge</text>
<line x1="480" y1="75" x2="390" y2="180" stroke="#64748b" stroke-dasharray="4 3"/><line x1="480" y1="75" x2="570" y2="180" stroke="#64748b" stroke-dasharray="4 3"/>
<line x1="430" y1="195" x2="530" y2="195" stroke="#64748b" stroke-width="3"/>
<text x="480" y="232" text-anchor="middle" class="svg-muted" font-size="12">dashed = control, thick = IPsec data</text>
</svg><p class="cap">SD-WAN moves decisions into controllers; the edges only forward. The same idea, in the campus, is SD-Access.</p></div>

<h3>The WAN pain that created SD-WAN</h3>
<ul>
<li><b>Expensive, slow circuits.</b> MPLS is reliable but costly and takes weeks to install. Broadband internet and 4G/5G are cheap and fast to order, but a classic WAN cannot use them safely and smartly.</li>
<li><b>Applications moved to the cloud.</b> Backhauling every branch user to the data centre just to reach a SaaS application adds latency and loads the hub.</li>
<li><b>Configuration at scale.</b> DMVPN, per-branch ACLs, QoS and routing on 800 branches means 800 chances for typos.</li>
<li><b>No application awareness.</b> OSPF or BGP picks a path by metric, not by whether the path currently has 3% loss that is ruining voice calls.</li>
</ul>
<p>SD-WAN answers with <b>transport independence</b> (any circuit, secured with IPsec, treated as just a "colour"), <b>central management</b> (templates and policies pushed from one place), <b>zero-touch onboarding</b>, and <b>application-aware routing</b> that measures every path every second.</p>

<h3>The same idea, inside the campus</h3>
<p>A campus has its own pain: VLANs stretched across closets, spanning tree, hundreds of ACLs keyed on IP addresses, and users who move between floors and Wi-Fi. <b>SD-Access</b> builds a routed underlay, runs an overlay on top of it (LISP for "where is this host", VXLAN for carrying the traffic) and applies policy by <b>group</b> instead of IP address, all automated from <b>Catalyst Center</b> with identity from <b>ISE</b>.</p>

<table class="cmp"><tr><th></th><th>Catalyst SD-WAN</th><th>SD-Access</th></tr>
<tr><td>Where</td><td>Between sites (branches, DC, cloud)</td><td>Inside a campus or building</td></tr>
<tr><td>Management</td><td>SD-WAN Manager</td><td>Catalyst Center</td></tr>
<tr><td>Control plane</td><td>OMP via SD-WAN Controller</td><td>LISP via control plane node</td></tr>
<tr><td>Data plane</td><td>IPsec tunnels, BFD-monitored</td><td>VXLAN (with group tag)</td></tr>
<tr><td>Segmentation</td><td>Service VPNs (VRFs)</td><td>Virtual networks (VRFs) + scalable groups</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A retailer has 300 stores, each with one MPLS circuit (20 Mbps) and one broadband line (200 Mbps). With a classic WAN the broadband sits idle as a backup. With SD-WAN both carry encrypted traffic all the time: voice is pinned to MPLS while its loss stays under 1%, guest Wi-Fi goes straight to the internet, and a new store is live the day its router is plugged in, because its configuration waits for it on the Manager.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking "the controller routes the traffic". In both fabrics the controllers only build the <b>control plane</b> and push <b>policy</b>. User packets go edge to edge. If you remember one sentence from this module, make it that one.</p></div>

<div class="exam"><p><b>Exam trap.</b> Cisco renamed the components in 2023. The exam and documentation may use either name: <b>vManage = SD-WAN Manager</b>, <b>vSmart = SD-WAN Controller</b>, <b>vBond = SD-WAN Validator</b>, <b>vEdge/cEdge = WAN edge</b>, <b>DNA Center = Catalyst Center</b>. Learn both sets.</p></div>

<div class="scn"><h4>The branch that took three weeks</h4><p>An insurance company needed a pop-up claims office after a flood. The MPLS provider quoted 21 days. The team shipped an SD-WAN router with a 4G modem and a broadband line instead. The local staff plugged it in; it found the Validator, downloaded its configuration from the Manager, built IPsec tunnels to the data centre and was serving the claims application within an hour. When the MPLS circuit finally arrived, they simply added it as a second colour.</p><p><b>Lesson:</b> transport independence plus zero-touch onboarding turns WAN changes from projects into plug-in events.</p></div>

<div class="iv"><p class="q">"In one minute, what problem does SD-WAN solve that DMVPN does not?"</p><p>Strong answer: DMVPN gives you dynamic tunnels, but you still configure every router, run a routing protocol per cloud, and route by metric. SD-WAN adds a central Manager with templates, a Controller that distributes routes and policy (OMP), zero-touch onboarding with certificates, and per-application path selection based on live loss, latency and jitter measured by BFD. Mention the separation of management, control and data planes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module covers ENCOR 1.4 (Catalyst SD-WAN) and 1.5 (SD-Access).</li>
<li>Both are controller-based fabrics: controllers decide, edges forward.</li>
<li>SD-WAN solves WAN cost, cloud access, configuration scale and application awareness.</li>
<li>SD-Access solves campus VLAN sprawl, mobility and IP-based policy with LISP, VXLAN and group tags.</li>
<li>Know both the old (vManage, vSmart, vBond, DNA Center) and new names.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In barah chapters ke end tak aap <b>Cisco Catalyst SD-WAN</b> fabric (Manager, Controller, Validator aur WAN edges, OMP, TLOCs, colours, BFD, IPsec, templates aur policies) ko explain, draw, onboard aur troubleshoot kar paoge, aur <b>Cisco SD-Access</b> campus fabric (control plane, border aur edge nodes, LISP, VXLAN, scalable group tags, Catalyst Center aur ISE, aur yeh traditional campus se kaise baat karta hai) describe kar paoge. Yeh ENCOR 350-401 v1.2 blueprint ke items <b>1.4</b> aur <b>1.5</b> hain. Aakhir mein aap lab <i>Troubleshoot · Bring two sites into the SD-WAN fabric</i> mein ek asli toota hua branch theek karoge.</p>
<p><b>Prerequisites.</b> Aapko IP routing (static, OSPF aur BGP route reflectors ka idea), VRFs, aur IPsec tunnel kya karta hai, yeh comfortable hona chahiye. Pichle module (<i>Enterprise design &amp; high availability</i>) ne aapko three-tier aur collapsed-core campus diya; yahan hum haath se bane WANs aur campuses ko fabrics se replace karte hain. LISP aur VXLAN ki gehri mechanics baad mein <i>LISP &amp; VXLAN</i> mein aayegi, TrustSec aur 802.1X <i>Threat defense</i> mein, aur Catalyst Center assurance apne module mein. Yahan hum sirf preview karte hain.</p>

<h3>Ek analogy: alag-alag taxis se dispatch centre tak</h3>
<p>Ek sheher socho jahan 500 taxis hain aur koi dispatch nahi. Har driver apna map rakhta hai, har doosre driver ko phone karke poochta hai ki kaunsi sadak band hai, aur akele decide karta hai ki kaunsa route lena hai. Jab sheher naya flyover banata hai, kisi ko 500 drivers ko ek-ek karke batana padta hai. Yahi <b>traditional WAN</b> hai: har router haath se configure hota hai, har branch har circuit par hub ke saath routing protocols chalati hai, aur policy change ka matlab hai sainkdon boxes mein login karna.</p>
<p>Ab ek <b>dispatch centre</b> jodo. Nayi taxi gate ko ek baar call karti hai, sabit karti hai ki woh kaun hai, aur use bataya jaata hai ki kis dispatcher se baat kare. Dispatcher har taxi ki position aur har sadak jaanta hai, har driver ko sirf utna batata hai jitna zaroori hai, aur keh sakta hai "VIP passengers ke liye expressway lo, chahe mehenga ho". Passengers ko taxis khud le jaati hain; dispatcher kabhi kisi ko nahi le jaata. Yahi <b>SD-WAN</b> hai: gate par Validator, dispatcher ke roop mein Controller, head office ke roop mein Manager, aur WAN edge routers jo asli traffic le jaate hain.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Traditional WAN aur SD-WAN">
<rect x="10" y="10" width="300" height="230" rx="10" fill="#e2e8f0"/>
<text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="14">Traditional WAN</text>
<rect x="115" y="50" width="90" height="32" rx="6" fill="#fed7aa"/><text x="160" y="71" text-anchor="middle" class="svg-ink" font-size="12">Hub router</text>
<rect x="30" y="180" width="70" height="30" rx="6" fill="#fed7aa"/><text x="65" y="200" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="125" y="180" width="70" height="30" rx="6" fill="#fed7aa"/><text x="160" y="200" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="220" y="180" width="70" height="30" rx="6" fill="#fed7aa"/><text x="255" y="200" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<line x1="160" y1="82" x2="65" y2="180" stroke="#64748b"/><line x1="160" y1="82" x2="160" y2="180" stroke="#64748b"/><line x1="160" y1="82" x2="255" y2="180" stroke="#64748b"/>
<text x="160" y="232" text-anchor="middle" class="svg-muted" font-size="12">box-by-box CLI, har circuit ka routing mesh</text>
<rect x="330" y="10" width="300" height="230" rx="10" fill="#bae6fd"/>
<text x="480" y="32" text-anchor="middle" class="svg-ink" font-size="14">Catalyst SD-WAN</text>
<rect x="345" y="45" width="85" height="30" rx="6" fill="#ddd6fe"/><text x="387" y="65" text-anchor="middle" class="svg-ink" font-size="12">Manager</text>
<rect x="437" y="45" width="85" height="30" rx="6" fill="#ddd6fe"/><text x="480" y="65" text-anchor="middle" class="svg-ink" font-size="12">Controller</text>
<rect x="529" y="45" width="85" height="30" rx="6" fill="#ddd6fe"/><text x="572" y="65" text-anchor="middle" class="svg-ink" font-size="12">Validator</text>
<rect x="350" y="180" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="390" y="200" text-anchor="middle" class="svg-ink" font-size="12">WAN edge</text>
<rect x="530" y="180" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="570" y="200" text-anchor="middle" class="svg-ink" font-size="12">WAN edge</text>
<line x1="480" y1="75" x2="390" y2="180" stroke="#64748b" stroke-dasharray="4 3"/><line x1="480" y1="75" x2="570" y2="180" stroke="#64748b" stroke-dasharray="4 3"/>
<line x1="430" y1="195" x2="530" y2="195" stroke="#64748b" stroke-width="3"/>
<text x="480" y="232" text-anchor="middle" class="svg-muted" font-size="12">dashed = control, mota = IPsec data</text>
</svg><p class="cap">SD-WAN decisions ko controllers mein le jaata hai; edges sirf forward karte hain. Campus mein yahi idea SD-Access hai.</p></div>

<h3>WAN ka dard jisne SD-WAN banaya</h3>
<ul>
<li><b>Mehenge, dheere circuits.</b> MPLS reliable hai par mehenga hai aur install hone mein hafte lagte hain. Broadband internet aur 4G/5G saste hain aur jaldi milte hain, lekin classic WAN unhe safely aur smartly use nahi kar paata.</li>
<li><b>Applications cloud mein chali gayi.</b> Har branch user ko sirf ek SaaS application tak pahunchne ke liye data centre tak backhaul karna latency badhata hai aur hub par load daalta hai.</li>
<li><b>Scale par configuration.</b> 800 branches par DMVPN, per-branch ACLs, QoS aur routing ka matlab hai typos ke 800 mauke.</li>
<li><b>Application awareness nahi.</b> OSPF ya BGP path metric se chunta hai, is baat se nahi ki us path par abhi 3% loss hai jo voice calls kharab kar raha hai.</li>
</ul>
<p>SD-WAN iska jawab deta hai <b>transport independence</b> se (koi bhi circuit, IPsec se secure, sirf ek "colour" ki tarah treat), <b>central management</b> se (ek jagah se templates aur policies push), <b>zero-touch onboarding</b> se, aur <b>application-aware routing</b> se jo har path ko har second naapta hai.</p>

<h3>Wahi idea, campus ke andar</h3>
<p>Campus ka apna dard hai: closets ke paar faile VLANs, spanning tree, IP addresses par bane sainkdon ACLs, aur users jo floors aur Wi-Fi ke beech ghoomte hain. <b>SD-Access</b> ek routed underlay banata hai, uske upar overlay chalata hai ("yeh host kahan hai" ke liye LISP, traffic le jaane ke liye VXLAN) aur policy IP address ki jagah <b>group</b> se lagata hai, sab kuch <b>Catalyst Center</b> se automate hota hai aur identity <b>ISE</b> se aati hai.</p>

<table class="cmp"><tr><th></th><th>Catalyst SD-WAN</th><th>SD-Access</th></tr>
<tr><td>Kahan</td><td>Sites ke beech (branches, DC, cloud)</td><td>Campus ya building ke andar</td></tr>
<tr><td>Management</td><td>SD-WAN Manager</td><td>Catalyst Center</td></tr>
<tr><td>Control plane</td><td>SD-WAN Controller ke through OMP</td><td>Control plane node ke through LISP</td></tr>
<tr><td>Data plane</td><td>IPsec tunnels, BFD se monitored</td><td>VXLAN (group tag ke saath)</td></tr>
<tr><td>Segmentation</td><td>Service VPNs (VRFs)</td><td>Virtual networks (VRFs) + scalable groups</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Ek retailer ke 300 stores hain, har ek mein ek MPLS circuit (20 Mbps) aur ek broadband line (200 Mbps). Classic WAN mein broadband backup ki tarah bekaar pada rehta hai. SD-WAN mein dono hamesha encrypted traffic le jaate hain: voice MPLS par pinned rehta hai jab tak uska loss 1% se kam hai, guest Wi-Fi seedha internet jaata hai, aur naya store usi din live ho jaata hai jis din uska router plug hota hai, kyunki uski configuration Manager par uska intezaar kar rahi hoti hai.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki "controller traffic route karta hai". Dono fabrics mein controllers sirf <b>control plane</b> banate hain aur <b>policy</b> push karte hain. User packets edge se edge jaate hain. Is module se ek line yaad rakhni ho to yahi rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Cisco ne 2023 mein components ke naam badle. Exam aur documentation dono naam use kar sakte hain: <b>vManage = SD-WAN Manager</b>, <b>vSmart = SD-WAN Controller</b>, <b>vBond = SD-WAN Validator</b>, <b>vEdge/cEdge = WAN edge</b>, <b>DNA Center = Catalyst Center</b>. Dono sets seekho.</p></div>

<div class="scn"><h4>Woh branch jisme teen hafte lagte</h4><p>Ek insurance company ko baadh ke baad ek temporary claims office chahiye tha. MPLS provider ne 21 din bataye. Team ne uski jagah 4G modem aur broadband line ke saath ek SD-WAN router bhej diya. Local staff ne use plug kiya; usne Validator dhoondha, Manager se apni configuration download ki, data centre tak IPsec tunnels banaye aur ek ghante mein claims application serve karne laga. Jab MPLS circuit aakhir mein aaya, unhone use bas doosre colour ki tarah jod diya.</p><p><b>Seekh:</b> transport independence aur zero-touch onboarding milkar WAN changes ko projects se plug-in events bana dete hain.</p></div>

<div class="iv"><p class="q">"Ek minute mein, SD-WAN kaunsi problem solve karta hai jo DMVPN nahi karta?"</p><p>Strong answer: DMVPN dynamic tunnels deta hai, lekin aap phir bhi har router configure karte ho, har cloud ke liye routing protocol chalate ho, aur metric se route karte ho. SD-WAN templates wala central Manager, routes aur policy baantne wala Controller (OMP), certificates ke saath zero-touch onboarding, aur BFD se naapi gayi live loss, latency aur jitter par per-application path selection jodta hai. Management, control aur data planes ke separation ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module ENCOR 1.4 (Catalyst SD-WAN) aur 1.5 (SD-Access) cover karta hai.</li>
<li>Dono controller-based fabrics hain: controllers decide karte hain, edges forward karte hain.</li>
<li>SD-WAN WAN cost, cloud access, configuration scale aur application awareness solve karta hai.</li>
<li>SD-Access LISP, VXLAN aur group tags se campus VLAN sprawl, mobility aur IP-based policy solve karta hai.</li>
<li>Purane (vManage, vSmart, vBond, DNA Center) aur naye dono naam jaano.</li>
</ul></div>
`}};export{e as default};