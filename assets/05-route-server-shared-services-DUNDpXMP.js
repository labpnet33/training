var e=`<svg viewBox="0 0 640 250" role="img" aria-label="Azure Route Server in the hub exchanging BGP routes with a network virtual appliance and the VNet">
<rect x="20" y="20" width="600" height="210" rx="12" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">hub-vnet 10.0.0.0/16</text>
<rect x="50" y="70" width="170" height="70" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="135" y="96" text-anchor="middle" class="svg-ink" font-size="12">Route Server</text><text x="135" y="114" text-anchor="middle" class="svg-muted" font-size="11">RouteServerSubnet /27</text><text x="135" y="130" text-anchor="middle" class="svg-muted" font-size="11">ASN 65515</text>
<rect x="420" y="70" width="170" height="70" rx="10" fill="#fed7aa" stroke="#64748b"/><text x="505" y="96" text-anchor="middle" class="svg-ink" font-size="12">NVA (SD-WAN / firewall)</text><text x="505" y="114" text-anchor="middle" class="svg-muted" font-size="11">10.0.4.4, ASN 65001</text>
<line x1="220" y1="105" x2="420" y2="105" stroke="#2563eb" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="96" text-anchor="middle" class="svg-accent" font-size="11">eBGP session</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="10">NVA announces 192.168.0.0/16</text>
<rect x="50" y="165" width="540" height="45" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="12">Route Server injects learned routes into the VNet and peered spokes' effective routes</text><text x="320" y="201" text-anchor="middle" class="svg-muted" font-size="11">no UDRs to maintain; traffic does not pass through Route Server itself</text>
</svg>`,t={id:`route-server-shared-services`,h:{en:`Route Server and shared services in the hub`,hi:`Hub mein Route Server aur shared services`},body:{en:`
<h3>Two questions every hub must answer</h3>
<p>Once the firewall and the routes work, two practical questions remain. First: how do you keep routes up to date when a network appliance in the hub learns routes dynamically (an SD-WAN device, for instance)? Second: where do DNS, directory, logging and admin tools live, and how do spokes reach them? This chapter answers both.</p>

<h3>Azure Route Server (concept)</h3>
<p>An <b>NVA</b> (network virtual appliance) is a VM-based router or firewall from a vendor. If it learns branch prefixes through BGP, you would normally copy each prefix into UDRs by hand, and keep editing them when the branch network changes. <b>Azure Route Server</b> removes that chore. It is a managed service in the hub VNet that speaks BGP with your NVA and with Azure's routing. The NVA announces its prefixes to Route Server; Route Server programs them into the VNet routes, including peered spokes that use the hub's gateway or accept remote routes. In the other direction, Route Server announces the VNet's prefixes to the NVA.</p>
<div class="dia">`+e+`<p class="cap">Route Server exchanges routes by BGP. The data path still goes through the NVA; Route Server only handles the control plane.</p></div>
<dl class="terms">
<dt>RouteServerSubnet</dt><dd>A dedicated subnet with exactly that name, /27 or larger.</dd>
<dt>ASN 65515</dt><dd>Route Server always uses this autonomous system number. The NVA must use a different ASN, and Azure reserves some ASN ranges (verify before publishing).</dd>
<dt>Peer</dt><dd>Each NVA is configured as a BGP peer by IP and ASN, and the NVA configures the two Route Server instance IPs as its neighbours.</dd>
<dt>Branch-to-branch</dt><dd>A setting that lets Route Server exchange routes between the VPN or ExpressRoute gateway and the NVA, so branches learn each other (verify exact behaviour before publishing).</dd>
</dl>
<pre class="code"><span class="c"># concept only: create Route Server and one BGP peer (parameters: confirm with --help)</span>
az network routeserver create -g rg-hub -n rs-hub --hosted-subnet <span class="c">&lt;RouteServerSubnet-id&gt;</span> --public-ip-address pip-rs --location centralindia
az network routeserver peering create -g rg-hub --routeserver rs-hub -n nva1 --peer-ip 10.0.4.4 --peer-asn 65001</pre>
<p>Use it when an NVA or SD-WAN appliance must advertise routes dynamically. If you only have a firewall with static rules and a handful of prefixes, plain UDRs are simpler and cheaper. Route Server bills hourly while it exists (verify pricing structure).</p>

<h3>Shared services: build them once</h3>
<p>The hub is the natural home for things every workload needs:</p>
<ul>
<li><b>DNS.</b> Either DNS servers (or Azure DNS Private Resolver, covered in the hybrid module) in a hub subnet, or the firewall's DNS proxy. Point each spoke VNet's DNS settings at the chosen address so all spokes resolve the same names. Private DNS zones for Private Link are usually linked to the hub VNet.</li>
<li><b>Identity.</b> Domain controllers or other directory services in a shared subnet, reachable from spokes through the firewall.</li>
<li><b>Administration.</b> Azure Bastion in AzureBastionSubnet (/26 or larger) for browser access, and a small management subnet for jump hosts.</li>
<li><b>Monitoring and logging.</b> A Log Analytics workspace in a central subscription, with diagnostic settings from firewall, gateways and NSGs sending to it.</li>
<li><b>Private endpoints</b> for shared PaaS, such as a common storage account or Key Vault, placed in a hub subnet or a dedicated services spoke.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Hub plan, 10.0.0.0/16: AzureFirewallSubnet 10.0.1.0/26, GatewaySubnet 10.0.2.0/27, shared services 10.0.3.0/24 (DNS at 10.0.3.4), AzureBastionSubnet 10.0.5.0/26, RouteServerSubnet 10.0.6.0/27. Spokes set DNS to 10.0.3.4. Their route tables send other-spoke traffic to the firewall at 10.0.1.4, but the DNS subnet is allowed through a firewall network rule UDP/TCP 53.</p></div>

<h3>Keep shared services reachable without making a loop</h3>
<p>If the hub's shared-services subnet has a UDR that sends everything to the firewall, and the firewall is in the same VNet, traffic can take a long path through the firewall just to get to the next subnet. Decide deliberately: either let spokes reach the shared subnet directly via the peering (simpler, less inspection) or send it through the firewall (more control, one more hop, a rule to maintain). Document the choice.</p>

<div class="warn"><p><b>Common mistakes:</b> putting Route Server in a subnet with the wrong name, using the same ASN on the NVA as Route Server, expecting Route Server to carry data traffic, and giving every spoke a different DNS setting.</p></div>
<div class="exam"><p><b>Exam trap:</b> Route Server is a control-plane BGP service. It does not forward packets and it does not replace the NVA.</p></div>

<div class="scn"><h4>The SD-WAN routes nobody updated</h4><p>An SD-WAN appliance in the hub learned new branch prefixes every week, and an engineer copied them into UDRs by hand. A prefix was missed and a branch became unreachable on a Monday. The team deployed Route Server, peered it with the appliance and removed the hand-written routes. New branches then appeared in spoke effective routes within minutes.</p><p><b>Lesson:</b> let BGP carry dynamic routes; reserve UDRs for stable policy.</p></div>

<div class="iv"><p class="q">"What is Azure Route Server and when do you need it?"</p><p>A managed BGP route exchange service in a VNet that lets an NVA or SD-WAN device and Azure routing share prefixes dynamically, without hand-maintained UDRs. Needed when appliances learn routes dynamically; not needed for a static firewall design. It does not forward traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route Server is control plane only; it peers by BGP with NVAs (ASN 65515).</li>
<li>It needs RouteServerSubnet, /27 or larger.</li>
<li>Put shared services (DNS, identity, Bastion, logging) in the hub once.</li>
<li>Point every spoke at the same DNS and decide deliberately which flows cross the firewall.</li>
<li>Use UDRs for stable policy, BGP for dynamic routes.</li>
</ul></div>
`,hi:`
<h3>Do sawaal jinka jawab har hub ko dena hota hai</h3>
<p>Jab firewall aur routes kaam kar rahe hon, do practical sawaal bachte hain. Pehla: jab hub ka network appliance routes dynamically seekhta hai (jaise SD-WAN device), to routes up to date kaise rakhoge? Doosra: DNS, directory, logging aur admin tools kahan rehte hain, aur spokes unhe kaise reach karte hain? Yeh chapter dono ka jawab deta hai.</p>

<h3>Azure Route Server (concept)</h3>
<p><b>NVA</b> (network virtual appliance) vendor ka VM-based router ya firewall hota hai. Agar woh BGP se branch prefixes seekhta hai, to aap normally har prefix UDRs mein haath se copy karte, aur branch network badalne par edit karte rehte. <b>Azure Route Server</b> yeh kaam hata deta hai. Yeh hub VNet ki managed service hai jo aapke NVA se aur Azure routing se BGP bolti hai. NVA apne prefixes Route Server ko announce karta hai; Route Server unhe VNet routes mein program karta hai, un peered spokes mein bhi jo hub ka gateway use karte hain ya remote routes accept karte hain. Ulti taraf Route Server VNet ke prefixes NVA ko announce karta hai.</p>
<div class="dia">`+e+`<p class="cap">Route Server routes BGP se exchange karta hai. Data path ab bhi NVA se guzarta hai; Route Server sirf control plane sambhalta hai.</p></div>
<dl class="terms">
<dt>RouteServerSubnet</dt><dd>Bilkul isi naam ka dedicated subnet, /27 ya bada.</dd>
<dt>ASN 65515</dt><dd>Route Server hamesha yahi autonomous system number use karta hai. NVA ka ASN alag hona chahiye, aur Azure kuch ASN ranges reserve rakhta hai (publish se pehle verify karo).</dd>
<dt>Peer</dt><dd>Har NVA ko IP aur ASN se BGP peer configure kiya jaata hai, aur NVA Route Server ke do instance IPs ko apna neighbour configure karta hai.</dd>
<dt>Branch-to-branch</dt><dd>Setting jo Route Server ko VPN ya ExpressRoute gateway aur NVA ke beech routes exchange karne deti hai, taaki branches ek doosre ko seekh lein (exact behaviour publish se pehle verify karo).</dd>
</dl>
<pre class="code"><span class="c"># sirf concept: Route Server aur ek BGP peer banao (parameters: --help se confirm karo)</span>
az network routeserver create -g rg-hub -n rs-hub --hosted-subnet <span class="c">&lt;RouteServerSubnet-id&gt;</span> --public-ip-address pip-rs --location centralindia
az network routeserver peering create -g rg-hub --routeserver rs-hub -n nva1 --peer-ip 10.0.4.4 --peer-asn 65001</pre>
<p>Tab use karo jab NVA ya SD-WAN appliance ko routes dynamically advertise karne hon. Agar sirf static rules wala firewall aur kuch prefixes hain to plain UDRs simple aur sasta hain. Route Server jab tak exist karta hai hourly bill karta hai (pricing structure verify karo).</p>

<h3>Shared services: ek baar banao</h3>
<p>Hub un cheezon ka natural ghar hai jo har workload ko chahiye:</p>
<ul>
<li><b>DNS.</b> Ya to hub subnet mein DNS servers (ya Azure DNS Private Resolver, jo hybrid module mein hai), ya firewall ka DNS proxy. Har spoke VNet ki DNS settings chune hue address par point karo taaki sab spokes same names resolve karein. Private Link ke Private DNS zones aam taur par hub VNet se linked hote hain.</li>
<li><b>Identity.</b> Domain controllers ya doosri directory services shared subnet mein, spokes se firewall ke through reachable.</li>
<li><b>Administration.</b> Browser access ke liye AzureBastionSubnet (/26 ya bada) mein Azure Bastion, aur jump hosts ke liye chhota management subnet.</li>
<li><b>Monitoring aur logging.</b> Central subscription mein Log Analytics workspace, jisme firewall, gateways aur NSGs ke diagnostic settings bhejte hain.</li>
<li>Shared PaaS ke liye <b>private endpoints</b>, jaise common storage account ya Key Vault, hub subnet ya dedicated services spoke mein.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Hub plan, 10.0.0.0/16: AzureFirewallSubnet 10.0.1.0/26, GatewaySubnet 10.0.2.0/27, shared services 10.0.3.0/24 (DNS 10.0.3.4 par), AzureBastionSubnet 10.0.5.0/26, RouteServerSubnet 10.0.6.0/27. Spokes DNS 10.0.3.4 set karte hain. Unki route tables doosre spoke ka traffic firewall 10.0.1.4 ko bhejti hain, par DNS subnet firewall network rule UDP/TCP 53 se allow hota hai.</p></div>

<h3>Shared services reachable rakho, loop banaye bina</h3>
<p>Agar hub ke shared-services subnet par aisa UDR hai jo sab kuch firewall ko bhejta hai, aur firewall usi VNet mein hai, to traffic agle subnet tak pahunchne ke liye firewall ke through lamba raasta le sakta hai. Soch-samajhkar decide karo: ya to spokes peering se seedha shared subnet tak jaayein (simple, kam inspection) ya firewall ke through (zyada control, ek aur hop, ek aur rule maintain karna). Choice document karo.</p>

<div class="warn"><p><b>Common mistakes:</b> Route Server ko galat naam wale subnet mein rakhna, NVA par Route Server wala hi ASN use karna, Route Server se data traffic carry hone ki ummeed rakhna, aur har spoke ko alag DNS setting dena.</p></div>
<div class="exam"><p><b>Exam trap:</b> Route Server control-plane BGP service hai. Woh packets forward nahi karta aur NVA ki jagah nahi leta.</p></div>

<div class="scn"><h4>SD-WAN routes jo kisi ne update nahi kiye</h4><p>Hub ka SD-WAN appliance har hafte naye branch prefixes seekhta tha, aur ek engineer unhe UDRs mein haath se copy karta tha. Ek prefix chhoot gaya aur Monday ko ek branch unreachable ho gaya. Team ne Route Server deploy kiya, appliance se peer kiya aur hand-written routes hata diye. Naye branches ab minutes mein spoke effective routes mein dikhne lage.</p><p><b>Lesson:</b> dynamic routes BGP carry kare; UDRs stable policy ke liye rakho.</p></div>

<div class="iv"><p class="q">"Azure Route Server kya hai aur kab chahiye?"</p><p>VNet mein managed BGP route exchange service jo NVA ya SD-WAN device aur Azure routing ko prefixes dynamically share karne deti hai, hand-maintained UDRs ke bina. Tab chahiye jab appliances routes dynamically seekhte hain; static firewall design ke liye nahi. Woh traffic forward nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route Server sirf control plane hai; NVAs se BGP peer karta hai (ASN 65515).</li>
<li>Use RouteServerSubnet chahiye, /27 ya bada.</li>
<li>Shared services (DNS, identity, Bastion, logging) hub mein ek baar rakho.</li>
<li>Har spoke ko same DNS par point karo aur soch-samajhkar decide karo ki kaunse flows firewall se guzrein.</li>
<li>Stable policy ke liye UDRs, dynamic routes ke liye BGP.</li>
</ul></div>
`}};export{t as default};