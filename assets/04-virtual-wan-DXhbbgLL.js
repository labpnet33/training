var e=`<svg viewBox="0 0 640 280" role="img" aria-label="Virtual WAN with two hubs: spoke VNet connections, branch VPN and ExpressRoute, secured hub with Azure Firewall and routing intent">
<rect x="20" y="20" width="600" height="30" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Virtual WAN resource (global, one per organisation) - Standard type</text>
<rect x="60" y="80" width="200" height="130" rx="12" fill="#ddd6fe" stroke="#64748b"/><text x="160" y="102" text-anchor="middle" class="svg-ink" font-size="13">Virtual hub: Central India</text><text x="160" y="118" text-anchor="middle" class="svg-muted" font-size="11">address prefix 10.100.0.0/23</text>
<rect x="75" y="130" width="80" height="30" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="115" y="150" text-anchor="middle" class="svg-ink" font-size="11">Firewall</text>
<rect x="165" y="130" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="205" y="150" text-anchor="middle" class="svg-ink" font-size="11">VPN / ER GW</text>
<text x="160" y="185" text-anchor="middle" class="svg-muted" font-size="11">routing intent: 0/0 + private to firewall</text>
<rect x="380" y="80" width="200" height="130" rx="12" fill="#ddd6fe" stroke="#64748b"/><text x="480" y="102" text-anchor="middle" class="svg-ink" font-size="13">Virtual hub: South India</text><text x="480" y="118" text-anchor="middle" class="svg-muted" font-size="11">address prefix 10.101.0.0/23</text>
<rect x="395" y="130" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="435" y="150" text-anchor="middle" class="svg-ink" font-size="11">VPN GW</text>
<line x1="260" y1="145" x2="380" y2="145" stroke="#2563eb" stroke-width="3"/><text x="320" y="138" text-anchor="middle" class="svg-accent" font-size="10">hub-to-hub (managed)</text>
<rect x="20" y="230" width="110" height="36" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="75" y="253" text-anchor="middle" class="svg-ink" font-size="11">spoke1 10.1/16</text>
<rect x="150" y="230" width="110" height="36" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="205" y="253" text-anchor="middle" class="svg-ink" font-size="11">spoke2 10.2/16</text>
<rect x="400" y="230" width="130" height="36" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="465" y="253" text-anchor="middle" class="svg-ink" font-size="11">branch 192.168/16</text>
<g stroke="#64748b" stroke-width="2"><line x1="75" y1="230" x2="115" y2="210"/><line x1="205" y1="230" x2="200" y2="210"/><line x1="465" y1="230" x2="465" y2="210"/></g>
</svg>`,t={id:`virtual-wan`,h:{en:`Virtual WAN: hubs, routing intent and secured hubs`,hi:`Virtual WAN: hubs, routing intent aur secured hubs`},body:{en:`
<h3>Hub-and-spoke, but Microsoft runs the hub</h3>
<p>In the do-it-yourself (DIY) design you build the hub VNet, the peerings, the route tables, the gateway and the firewall, and you keep them correct. <b>Azure Virtual WAN (vWAN)</b> is the managed version: you ask for a <b>virtual hub</b>, and Azure creates and operates a Microsoft-managed hub VNet containing a router, and optionally VPN, ExpressRoute and point-to-site gateways and an Azure Firewall. You connect spokes to the hub with a <b>VNet connection</b> instead of building peerings and routes yourself.</p>

<div class="dia">`+e+`<p class="cap">One Virtual WAN, two virtual hubs in two regions, spokes and a branch connected to them. The hub-to-hub link is managed by Azure.</p></div>

<h3>The building blocks</h3>
<dl class="terms">
<dt>Virtual WAN</dt><dd>The top-level, global resource. Types are Basic and Standard. Standard is needed for ExpressRoute, hub-to-hub transit, VNet-to-VNet transit and secured hubs (verify before publishing).</dd>
<dt>Virtual hub</dt><dd>A managed hub in one region with an address prefix you choose (a /24 or larger is typically recommended, verify). The prefix must not overlap with any connected network.</dd>
<dt>Connections</dt><dd>VNet connections (spokes), site-to-site VPN sites, ExpressRoute circuits, and point-to-site user pools attach to a hub.</dd>
<dt>Hub route tables</dt><dd>Every connection is associated with a route table and propagates its prefixes to one or more. The default route table lets everything reach everything. Custom tables give segmentation, much like Transit Gateway tables.</dd>
<dt>Secured hub</dt><dd>A virtual hub with Azure Firewall deployed in it and managed through Azure Firewall Manager and a Firewall Policy.</dd>
<dt>Routing intent and routing policies</dt><dd>A simple switch: tell the hub to send internet-bound traffic and/or private traffic (spoke, branch) to the firewall or a supported NVA in the hub. Azure then writes the routes for you.</dd>
</dl>

<h3>Routing intent in plain words</h3>
<p>In DIY you write a UDR on every spoke subnet. In a secured virtual hub with routing intent you choose "Internet traffic" and "Private traffic" and pick the firewall as the next hop. Azure programs the hub route tables so spoke-to-spoke, spoke-to-branch and spoke-to-internet go through the firewall, with no UDR in the spokes. The spokes just need the VNet connection. (The exact portal labels are verify before publishing.)</p>
<pre class="code"><span class="c"># create the WAN, a hub and connect a spoke (parameters: confirm with --help)</span>
az network vwan create -g rg-wan -n vwan-nk --type Standard --location centralindia
az network vhub create -g rg-wan -n hub-cin --vwan vwan-nk --address-prefix 10.100.0.0/23 --location centralindia --sku Standard
az network vhub connection create -g rg-wan --vhub-name hub-cin -n conn-spoke1 --remote-vnet spoke1-vnet</pre>
<p>Hub creation is slow (often 30 minutes or more) and the hub bills while it exists (verify the pricing structure: a hourly hub fee plus per-GB data processing and per-connection-unit charges for gateways).</p>

<h3>DIY hub VNet versus Virtual WAN</h3>
<table class="cmp"><tr><th>Question</th><th>DIY hub VNet</th><th>Virtual WAN</th></tr>
<tr><td>Who runs the hub?</td><td>You</td><td>Microsoft</td></tr>
<tr><td>Routing</td><td>UDRs and peering flags you maintain</td><td>Hub route tables, routing intent</td></tr>
<tr><td>Scale</td><td>Fine for a few spokes; you manage limits</td><td>Built for many spokes, branches and regions</td></tr>
<tr><td>Flexibility</td><td>Any NVA, any custom layout, full control</td><td>Opinionated; some constraints on custom shared services in the hub</td></tr>
<tr><td>Cost</td><td>Gateway, firewall, VMs you add</td><td>Hub fee plus gateway scale units plus firewall</td></tr></table>
<p>Choose vWAN for a global network with dozens of branches or many regions, SD-WAN integration, or when you want routing done for you. Choose DIY when you need full control, shared services inside the hub, or a small network.</p>

<div class="note"><p><b>AWS vs Azure.</b> Virtual WAN is roughly Azure's answer to AWS Transit Gateway plus Cloud WAN: a managed transit that connects VNets, VPN, ExpressRoute and branches. Transit Gateway attachments map to vWAN VNet connections; TGW route tables map to hub route tables; a TGW inspection VPC with a firewall maps to a secured hub with routing intent. Differences: vWAN hubs are regional but joined into one global WAN, and the firewall can be a built-in hub component.</p></div>

<div class="warn"><p><b>Common mistakes:</b> overlapping the hub prefix with a spoke, mixing a UDR-based spoke design with vWAN routing intent and getting conflicting routes, and picking the Basic type, which lacks transit features you later need.</p></div>
<div class="exam"><p><b>Exam trap:</b> a virtual hub is not a VNet you can deploy VMs into. Shared services such as DNS servers normally sit in a spoke VNet connected to the hub.</p></div>

<div class="scn"><h4>Forty branches, three admins</h4><p>A retail chain had 40 shops with VPN to Azure and three network admins. The DIY design needed a gateway per region and many hand-written routes. They moved to Virtual WAN with two hubs, branch VPN sites configured from the branch device partner workflow, and routing intent through a secured hub. Onboarding a new shop dropped to adding one site and one connection.</p><p><b>Lesson:</b> pay for managed routing when your scale makes manual routing the bigger risk.</p></div>

<div class="iv"><p class="q">"When would you pick Virtual WAN over a DIY hub-and-spoke?"</p><p>Many branches or regions, need for built-in transit and hub-to-hub, and a small team: vWAN. Small footprint, shared services in the hub, or custom NVAs: DIY. Mention routing intent and secured hubs, and cost model differences.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Virtual WAN is a managed hub-and-spoke: Microsoft runs the hub.</li>
<li>Standard type is needed for transit features and secured hubs.</li>
<li>Routing intent sends private and internet traffic to the firewall without spoke UDRs.</li>
<li>Hub creation is slow and billed hourly; plan labs accordingly.</li>
<li>Compare with Transit Gateway: attachments are connections, TGW tables are hub route tables.</li>
</ul></div>
`,hi:`
<h3>Hub-and-spoke, par hub Microsoft chalata hai</h3>
<p>Do-it-yourself (DIY) design mein aap hub VNet, peerings, route tables, gateway aur firewall khud banate ho aur sahi rakhte ho. <b>Azure Virtual WAN (vWAN)</b> managed version hai: aap ek <b>virtual hub</b> maangte ho, aur Azure ek Microsoft-managed hub VNet banata aur chalata hai jisme ek router hota hai, aur optionally VPN, ExpressRoute aur point-to-site gateways aur Azure Firewall. Spokes ko aap peerings aur routes banane ki jagah ek <b>VNet connection</b> se hub se jodte ho.</p>

<div class="dia">`+e+`<p class="cap">Ek Virtual WAN, do regions mein do virtual hubs, unse jude spokes aur ek branch. Hub-to-hub link Azure manage karta hai.</p></div>

<h3>Building blocks</h3>
<dl class="terms">
<dt>Virtual WAN</dt><dd>Top-level, global resource. Types Basic aur Standard hain. ExpressRoute, hub-to-hub transit, VNet-to-VNet transit aur secured hubs ke liye Standard chahiye (publish se pehle verify karo).</dd>
<dt>Virtual hub</dt><dd>Ek region mein managed hub, aapke chune hue address prefix ke saath (aam taur par /24 ya bada recommended, verify karo). Prefix kisi bhi connected network se overlap nahi hona chahiye.</dd>
<dt>Connections</dt><dd>VNet connections (spokes), site-to-site VPN sites, ExpressRoute circuits aur point-to-site user pools hub se attach hote hain.</dd>
<dt>Hub route tables</dt><dd>Har connection ek route table se associated hota hai aur apne prefixes ek ya zyada tables mein propagate karta hai. Default route table sab ko sab tak pahunchne deti hai. Custom tables segmentation deti hain, Transit Gateway tables ki tarah.</dd>
<dt>Secured hub</dt><dd>Aisa virtual hub jisme Azure Firewall deployed ho aur jo Azure Firewall Manager aur Firewall Policy se manage ho.</dd>
<dt>Routing intent aur routing policies</dt><dd>Ek simple switch: hub ko batao ki internet-bound aur/ya private traffic (spoke, branch) hub ke firewall ya supported NVA ko bheje. Phir Azure routes khud likhta hai.</dd>
</dl>

<h3>Routing intent aasaan shabdon mein</h3>
<p>DIY mein aap har spoke subnet par UDR likhte ho. Routing intent wale secured virtual hub mein aap "Internet traffic" aur "Private traffic" chunte ho aur next hop ke taur par firewall. Azure hub route tables program karta hai taaki spoke-to-spoke, spoke-to-branch aur spoke-to-internet firewall se guzre, spokes mein bina UDR ke. Spokes ko sirf VNet connection chahiye. (Exact portal labels verify before publishing.)</p>
<pre class="code"><span class="c"># WAN banao, ek hub banao aur ek spoke jodo (parameters: --help se confirm karo)</span>
az network vwan create -g rg-wan -n vwan-nk --type Standard --location centralindia
az network vhub create -g rg-wan -n hub-cin --vwan vwan-nk --address-prefix 10.100.0.0/23 --location centralindia --sku Standard
az network vhub connection create -g rg-wan --vhub-name hub-cin -n conn-spoke1 --remote-vnet spoke1-vnet</pre>
<p>Hub creation slow hota hai (aksar 30 minute ya zyada) aur jab tak exist karta hai bill karta hai (pricing structure verify karo: hourly hub fee plus per-GB data processing aur gateways ke liye per-connection-unit charges).</p>

<h3>DIY hub VNet versus Virtual WAN</h3>
<table class="cmp"><tr><th>Sawaal</th><th>DIY hub VNet</th><th>Virtual WAN</th></tr>
<tr><td>Hub kaun chalata hai?</td><td>Aap</td><td>Microsoft</td></tr>
<tr><td>Routing</td><td>UDRs aur peering flags jo aap maintain karte ho</td><td>Hub route tables, routing intent</td></tr>
<tr><td>Scale</td><td>Kuch spokes ke liye theek; limits aap manage karte ho</td><td>Kai spokes, branches aur regions ke liye bana</td></tr>
<tr><td>Flexibility</td><td>Koi bhi NVA, koi bhi custom layout, poora control</td><td>Opinionated; hub mein custom shared services par kuch constraints</td></tr>
<tr><td>Cost</td><td>Gateway, firewall, jo VMs aap jodo</td><td>Hub fee plus gateway scale units plus firewall</td></tr></table>
<p>Dozens of branches ya kai regions wale global network, SD-WAN integration, ya jab aap chahte ho ki routing aapke liye ho, tab vWAN chuno. Poora control, hub ke andar shared services, ya chhota network chahiye to DIY.</p>

<div class="note"><p><b>AWS vs Azure.</b> Virtual WAN lagbhag Azure ka jawab hai AWS Transit Gateway plus Cloud WAN ke liye: ek managed transit jo VNets, VPN, ExpressRoute aur branches jodta hai. Transit Gateway attachments vWAN VNet connections se map hote hain; TGW route tables hub route tables se; firewall wale TGW inspection VPC ka match routing intent wala secured hub hai. Farq: vWAN hubs regional hain par ek global WAN mein jude hote hain, aur firewall built-in hub component ho sakta hai.</p></div>

<div class="warn"><p><b>Common mistakes:</b> hub prefix ko kisi spoke se overlap karna, UDR-based spoke design ko vWAN routing intent ke saath mix karke conflicting routes paana, aur Basic type chun lena jisme baad mein zaroori transit features nahi hote.</p></div>
<div class="exam"><p><b>Exam trap:</b> virtual hub aisa VNet nahi hai jisme aap VMs deploy kar sako. DNS servers jaisi shared services aam taur par hub se jude spoke VNet mein rehti hain.</p></div>

<div class="scn"><h4>Chalis branches, teen admins</h4><p>Ek retail chain ke 40 shops Azure se VPN par the aur teen network admins the. DIY design ko har region mein gateway aur bahut saare hand-written routes chahiye the. Unhone do hubs ke saath Virtual WAN, branch device partner workflow se configured branch VPN sites, aur secured hub ke through routing intent apnaya. Naya shop onboard karna ek site aur ek connection jodne tak simat gaya.</p><p><b>Lesson:</b> managed routing ke paise tab do jab scale ki wajah se manual routing bada risk ban jaye.</p></div>

<div class="iv"><p class="q">"DIY hub-and-spoke ki jagah Virtual WAN kab chunoge?"</p><p>Kai branches ya regions, built-in transit aur hub-to-hub ki zaroorat, aur chhoti team: vWAN. Chhota footprint, hub mein shared services, ya custom NVAs: DIY. Routing intent aur secured hubs, aur cost model ke farq ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Virtual WAN managed hub-and-spoke hai: hub Microsoft chalata hai.</li>
<li>Transit features aur secured hubs ke liye Standard type chahiye.</li>
<li>Routing intent spoke UDRs ke bina private aur internet traffic firewall ko bhejta hai.</li>
<li>Hub creation slow aur hourly billed hai; labs us hisaab se plan karo.</li>
<li>Transit Gateway se tulna: attachments = connections, TGW tables = hub route tables.</li>
</ul></div>
`}};export{t as default};