var e={id:`cloud`,h:{en:`On-premises versus cloud infrastructure`,hi:`On-premises vs cloud infrastructure`},body:{en:`
<p>Owning a car and using a ride-hailing app both get you to work. Owning costs a lot up front, but the car is always in your driveway, you can modify it, and daily trips are cheap once it is paid for. Ride-hailing costs nothing up front, scales instantly when your whole family needs to travel, and someone else handles servicing, but you pay every trip, depend on the app and the roads, and cannot choose the engine. <b>On-premises</b> infrastructure is the owned car; <b>public cloud</b> is ride-hailing. ENCOR expects you to explain the difference and know how a network engineer connects the two.</p>

<h3>Deployment models</h3>
<dl class="terms">
<dt>On-premises</dt><dd>The organisation owns and runs the hardware in its own data centre or a rented colocation space. Full control, full responsibility.</dd>
<dt>Private cloud</dt><dd>On-premises (or dedicated hosted) infrastructure run with cloud-style self-service, automation and virtualisation for one organisation.</dd>
<dt>Public cloud</dt><dd>A provider's shared infrastructure, rented on demand and billed by use, reached over the internet or private interconnects.</dd>
<dt>Hybrid cloud</dt><dd>On-premises or private cloud connected to public cloud, with workloads placed where they fit best. This is what most enterprises actually run.</dd>
<dt>Multicloud</dt><dd>Using two or more public cloud providers, for resilience, features or commercial reasons.</dd>
</dl>
<p>Service models describe how much the provider manages: <b>IaaS</b> (you get virtual machines, storage and virtual networks and manage the OS and everything above), <b>PaaS</b> (you deploy code or containers onto a managed platform) and <b>SaaS</b> (you just use the application, for example hosted email or CRM). Networking itself can also be consumed as a service, such as cloud-managed switches and access points whose management plane lives in the provider's cloud.</p>

<h3>Comparing on-premises and cloud</h3>
<table class="cmp"><tr><th>Factor</th><th>On-premises</th><th>Public cloud</th></tr>
<tr><td>Cost model</td><td>CapEx: buy hardware up front, depreciate over years</td><td>OpEx: pay per hour, per GB and per request</td></tr>
<tr><td>Scaling</td><td>Size for peak; adding capacity takes weeks</td><td>Elastic; scale in minutes, scale down to save money</td></tr>
<tr><td>Control</td><td>Full control of hardware, software versions, topology</td><td>Limited to what the provider exposes</td></tr>
<tr><td>Latency and locality</td><td>Close to campus users and factory systems</td><td>Depends on WAN or internet path to the region</td></tr>
<tr><td>Compliance</td><td>Data stays where you put it</td><td>Choose regions carefully; shared-responsibility model</td></tr>
<tr><td>Operations</td><td>Your team patches, replaces and cools everything</td><td>Provider runs facilities, hardware and hypervisor</td></tr>
</table>
<p>The <b>shared-responsibility model</b> is key. With IaaS, the provider secures the buildings, hardware and hypervisor; you still own the guest operating systems, applications, identities, data and your virtual network rules such as security groups and route tables. Moving to the cloud does not move security responsibility away from you.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Hybrid cloud connectivity">
<rect x="20" y="70" width="170" height="80" rx="10" fill="#bae6fd"/><text x="105" y="100" text-anchor="middle" class="svg-ink" font-size="13">Campus / DC</text><text x="105" y="120" text-anchor="middle" class="svg-muted" font-size="12">EDGE1, EDGE2</text>
<rect x="450" y="30" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="13">Cloud region</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="12">VPC / VNet</text>
<rect x="450" y="130" width="170" height="60" rx="10" fill="#ddd6fe"/><text x="535" y="165" text-anchor="middle" class="svg-ink" font-size="13">SaaS apps</text>
<line x1="190" y1="90" x2="450" y2="55" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="300" y="60" class="svg-muted" font-size="12">IPsec over internet</text>
<line x1="190" y1="115" x2="450" y2="80" stroke="#64748b" stroke-width="3"/><text x="300" y="118" class="svg-muted" font-size="12">Private interconnect</text>
<line x1="190" y1="140" x2="450" y2="160" stroke="#64748b" stroke-width="2"/><text x="300" y="168" class="svg-muted" font-size="12">Direct internet</text>
</svg><p class="cap">Hybrid connectivity: VPN tunnels, dedicated interconnects and direct internet access to SaaS.</p></div>

<h3>How the network connects to the cloud</h3>
<ul>
<li><b>Site-to-site IPsec VPN over the internet</b>: quick and cheap; use two tunnels to two provider gateways and run BGP over them.</li>
<li><b>Private or dedicated interconnect</b>: a physical circuit from your router, usually in a colocation facility, into the provider's network. Predictable latency and bandwidth; build two in different locations for resilience.</li>
<li><b>SD-WAN cloud on-ramp</b>: virtual SD-WAN routers (for example Catalyst 8000V) inside the cloud region become part of the SD-WAN fabric, and branches can reach SaaS directly instead of hairpinning through the head office.</li>
<li><b>Virtual network functions</b> in the cloud: virtual routers, firewalls and even wireless controllers (Catalyst 9800-CL) run as cloud instances.</li>
</ul>
<pre class="out">EDGE1# show ip bgp summary
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">169.254.10.1    4        64512     220     218       14    0    0 03:12:41        2</span>
<span class="hl">169.254.11.1    4        64512     219     218       14    0    0 03:12:39        2</span></pre>
<p>Two VPN tunnels to the cloud gateway, each with an eBGP session learning the two cloud prefixes. If one tunnel fails, BGP converges to the other. Link-local 169.254.x.x addresses inside the tunnels are common with cloud VPN gateways.</p>

<div class="eg"><p><b>Worked example.</b> An online shop needs 20 web servers all year and 100 during a three-week festival sale. On-premises, it must buy and power 100 servers that sit 80 percent idle for 49 weeks. In the cloud it runs 20 instances and scales to 100 for three weeks, paying only for what it uses. Its payroll database, however, is steady, small and bound by data-residency rules, so it stays on-premises. The result is hybrid, and the network must now provide resilient, low-latency connectivity between the two.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Moving applications to the cloud but leaving one VPN tunnel from one site as the only path. Forgetting that data leaving the cloud (egress) is usually charged. Assuming the provider patches your virtual machines. Ignoring latency for chatty applications split between cloud and on-premises.</p></div>

<div class="exam"><p><b>Exam trap.</b> CapEx versus OpEx, elasticity, and shared responsibility are the most tested points. Questions often give a workload (steady, regulated, latency-critical versus spiky, global, fast-changing) and ask where it belongs. "Hybrid" is right only when the scenario really needs both.</p></div>

<div class="scn"><h4>The ERP that lived behind one tunnel</h4><p>A distributor moved its ERP system to a public cloud region. All 30 branches reached it through the head office, which had one ISP and one IPsec tunnel to the cloud. When the head-office ISP failed for four hours, the ERP was down for every branch even though the cloud itself was healthy. The post-incident review found a single failure domain: one ISP, one router, one tunnel. The fix: a second ISP and edge router at head office with two tunnels and BGP to the cloud, and SD-WAN at the branches so they could reach the cloud directly over their own internet links if the head office was unreachable.</p><p><b>Lesson:</b> moving to the cloud moves the critical path onto the WAN; design that path with the same redundancy as the data centre.</p></div>

<div class="iv"><p class="q">"How do you decide whether a workload should run on-premises or in the cloud?"</p><p>Ask about the load pattern (steady versus spiky), latency and locality needs, data residency and compliance, integration with other systems, team skills and total cost over several years including egress. Steady, regulated or latency-critical workloads often stay on-premises; spiky, global or fast-changing ones fit the cloud. Then explain how you would connect them: redundant VPN or interconnects with BGP, SD-WAN for branches, and the shared-responsibility model for security.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Models: on-premises, private, public, hybrid and multicloud; services: IaaS, PaaS, SaaS.</li>
<li>On-premises is CapEx with full control; cloud is OpEx with elasticity and less control.</li>
<li>Shared responsibility: the provider secures the platform, you secure what you put on it.</li>
<li>Connect with redundant IPsec tunnels or private interconnects running BGP, or through SD-WAN.</li>
<li>Most enterprises are hybrid; the WAN path to the cloud becomes a critical failure domain.</li>
</ul></div>
`,hi:`
<p>Apni car rakhna aur ride-hailing app use karna, dono aapko office pahunchate hain. Car rakhne mein shuru mein bahut kharcha hai, lekin car hamesha aapke ghar ke bahar hoti hai, aap use modify kar sakte ho, aur paise chukane ke baad roz ki trips sasti hain. Ride-hailing mein shuru mein kuch kharcha nahi, jab poori family ko jaana ho to turant scale ho jaata hai, aur servicing koi aur sambhaalta hai, lekin har trip ka paisa dena padta hai, app aur sadkon par depend rehna padta hai, aur engine nahi chun sakte. <b>On-premises</b> infrastructure apni car hai; <b>public cloud</b> ride-hailing hai. ENCOR expect karta hai ki aap fark samjha sako aur jaano ki network engineer dono ko kaise jodta hai.</p>

<h3>Deployment models</h3>
<dl class="terms">
<dt>On-premises</dt><dd>Organisation apne data centre ya kiraye ki colocation space mein hardware ki maalik hai aur use chalati hai. Poora control, poori zimmedari.</dd>
<dt>Private cloud</dt><dd>On-premises (ya dedicated hosted) infrastructure jo ek organisation ke liye cloud jaisi self-service, automation aur virtualisation ke saath chalta hai.</dd>
<dt>Public cloud</dt><dd>Provider ka shared infrastructure, demand par kiraye par, use ke hisaab se bill, internet ya private interconnects se pahuncha jaata hai.</dd>
<dt>Hybrid cloud</dt><dd>On-premises ya private cloud public cloud se juda hua, workloads wahan jahan woh best fit hon. Zyada tar enterprises asal mein yahi chalati hain.</dd>
<dt>Multicloud</dt><dd>Do ya zyada public cloud providers use karna, resilience, features ya commercial wajahon se.</dd>
</dl>
<p>Service models batate hain ki provider kitna manage karta hai: <b>IaaS</b> (aapko virtual machines, storage aur virtual networks milte hain aur OS aur uske upar sab aap manage karte ho), <b>PaaS</b> (aap managed platform par code ya containers deploy karte ho) aur <b>SaaS</b> (aap bas application use karte ho, jaise hosted email ya CRM). Networking khud bhi service ki tarah li ja sakti hai, jaise cloud-managed switches aur access points jinka management plane provider ke cloud mein hota hai.</p>

<h3>On-premises aur cloud ki tulna</h3>
<table class="cmp"><tr><th>Factor</th><th>On-premises</th><th>Public cloud</th></tr>
<tr><td>Cost model</td><td>CapEx: hardware shuru mein khareedo, saalon mein depreciate karo</td><td>OpEx: har ghante, har GB aur har request ka paisa</td></tr>
<tr><td>Scaling</td><td>Peak ke hisaab se size; capacity jodne mein hafte lagte hain</td><td>Elastic; minutes mein scale, paisa bachane ke liye scale down</td></tr>
<tr><td>Control</td><td>Hardware, software versions, topology par poora control</td><td>Sirf jitna provider expose kare</td></tr>
<tr><td>Latency aur locality</td><td>Campus users aur factory systems ke paas</td><td>Region tak ke WAN ya internet path par depend</td></tr>
<tr><td>Compliance</td><td>Data wahin rehta hai jahan aap rakho</td><td>Regions dhyan se chuno; shared-responsibility model</td></tr>
<tr><td>Operations</td><td>Aapki team sab patch, replace aur cool karti hai</td><td>Provider facilities, hardware aur hypervisor chalata hai</td></tr>
</table>
<p><b>Shared-responsibility model</b> key hai. IaaS mein provider buildings, hardware aur hypervisor secure karta hai; guest operating systems, applications, identities, data aur security groups aur route tables jaise virtual network rules ab bhi aapke hain. Cloud mein jaane se security ki zimmedari aapse door nahi jaati.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Hybrid cloud connectivity">
<rect x="20" y="70" width="170" height="80" rx="10" fill="#bae6fd"/><text x="105" y="100" text-anchor="middle" class="svg-ink" font-size="13">Campus / DC</text><text x="105" y="120" text-anchor="middle" class="svg-muted" font-size="12">EDGE1, EDGE2</text>
<rect x="450" y="30" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="13">Cloud region</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="12">VPC / VNet</text>
<rect x="450" y="130" width="170" height="60" rx="10" fill="#ddd6fe"/><text x="535" y="165" text-anchor="middle" class="svg-ink" font-size="13">SaaS apps</text>
<line x1="190" y1="90" x2="450" y2="55" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="300" y="60" class="svg-muted" font-size="12">Internet par IPsec</text>
<line x1="190" y1="115" x2="450" y2="80" stroke="#64748b" stroke-width="3"/><text x="300" y="118" class="svg-muted" font-size="12">Private interconnect</text>
<line x1="190" y1="140" x2="450" y2="160" stroke="#64748b" stroke-width="2"/><text x="300" y="168" class="svg-muted" font-size="12">Direct internet</text>
</svg><p class="cap">Hybrid connectivity: VPN tunnels, dedicated interconnects aur SaaS tak direct internet access.</p></div>

<h3>Network cloud se kaise judta hai</h3>
<ul>
<li><b>Internet par site-to-site IPsec VPN</b>: jaldi aur sasta; do provider gateways tak do tunnels use karo aur unpar BGP chalao.</li>
<li><b>Private ya dedicated interconnect</b>: aapke router se, aam taur par colocation facility mein, provider ke network tak physical circuit. Predictable latency aur bandwidth; resilience ke liye alag locations mein do banao.</li>
<li><b>SD-WAN cloud on-ramp</b>: cloud region ke andar virtual SD-WAN routers (jaise Catalyst 8000V) SD-WAN fabric ka hissa ban jaate hain, aur branches head office se hairpin kiye bina seedha SaaS tak pahunch sakti hain.</li>
<li>Cloud mein <b>virtual network functions</b>: virtual routers, firewalls aur wireless controllers (Catalyst 9800-CL) bhi cloud instances ki tarah chalte hain.</li>
</ul>
<pre class="out">EDGE1# show ip bgp summary
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">169.254.10.1    4        64512     220     218       14    0    0 03:12:41        2</span>
<span class="hl">169.254.11.1    4        64512     219     218       14    0    0 03:12:39        2</span></pre>
<p>Cloud gateway tak do VPN tunnels, har ek par eBGP session jo do cloud prefixes seekhta hai. Ek tunnel fail ho to BGP doosre par converge karta hai. Tunnels ke andar link-local 169.254.x.x addresses cloud VPN gateways ke saath common hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek online shop ko saal bhar 20 web servers chahiye aur teen hafte ki festival sale mein 100. On-premises use 100 servers khareedne aur chalane padenge jo 49 hafte 80 percent idle rahenge. Cloud mein woh 20 instances chalati hai aur teen hafte ke liye 100 tak scale karti hai, sirf use ka paisa deti hai. Lekin uska payroll database steady, chhota aur data-residency rules se bandha hai, isliye on-premises rehta hai. Result hybrid hai, aur ab network ko dono ke beech resilient, low-latency connectivity deni hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Applications cloud mein le jaana lekin ek site ka ek VPN tunnel hi akela path chhod dena. Bhool jaana ki cloud se bahar jaane wale data (egress) ka aam taur par charge lagta hai. Maan lena ki provider aapki virtual machines patch karta hai. Cloud aur on-premises mein bati chatty applications ki latency ignore karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> CapEx vs OpEx, elasticity aur shared responsibility sabse zyada test hote hain. Questions aksar ek workload dete hain (steady, regulated, latency-critical vs spiky, global, tezi se badalta) aur poochte hain woh kahan jaaye. "Hybrid" tabhi sahi hai jab scenario ko sach mein dono chahiye.</p></div>

<div class="scn"><h4>Woh ERP jo ek tunnel ke peeche rehta tha</h4><p>Ek distributor ne apna ERP system public cloud region mein shift kiya. Saari 30 branches head office ke through wahan pahunchti thi, jiske paas ek ISP aur cloud tak ek IPsec tunnel tha. Jab head-office ISP chaar ghante fail raha, ERP har branch ke liye down tha jabki cloud khud healthy tha. Post-incident review ne ek single failure domain paaya: ek ISP, ek router, ek tunnel. Fix: head office par doosra ISP aur edge router, cloud tak do tunnels aur BGP ke saath, aur branches par SD-WAN taaki head office unreachable ho to woh apne internet links se seedha cloud tak pahunch sakein.</p><p><b>Seekh:</b> cloud mein jaane se critical path WAN par aa jaata hai; us path ko data centre jitni redundancy ke saath design karo.</p></div>

<div class="iv"><p class="q">"Aap kaise decide karte ho ki workload on-premises chalega ya cloud mein?"</p><p>Load pattern (steady vs spiky), latency aur locality needs, data residency aur compliance, doosre systems ke saath integration, team skills aur egress samet kai saalon ka total cost poochho. Steady, regulated ya latency-critical workloads aksar on-premises rehte hain; spiky, global ya tezi se badalne wale cloud mein fit hote hain. Phir samjhao ki unhe kaise jodoge: BGP ke saath redundant VPN ya interconnects, branches ke liye SD-WAN, aur security ke liye shared-responsibility model.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Models: on-premises, private, public, hybrid aur multicloud; services: IaaS, PaaS, SaaS.</li>
<li>On-premises CapEx hai poore control ke saath; cloud OpEx hai elasticity aur kam control ke saath.</li>
<li>Shared responsibility: provider platform secure karta hai, aap uspar jo rakhte ho woh secure karte ho.</li>
<li>BGP chalane wale redundant IPsec tunnels ya private interconnects se, ya SD-WAN ke through jodo.</li>
<li>Zyada tar enterprises hybrid hain; cloud tak ka WAN path critical failure domain ban jaata hai.</li>
</ul></div>
`}};export{e as default};