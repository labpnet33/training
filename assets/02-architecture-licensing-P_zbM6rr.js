var e={id:`architecture-licensing`,h:{en:`PAN-OS SD-WAN architecture: Panorama plugin, hubs, branches and licensing`,hi:`PAN-OS SD-WAN architecture: Panorama plugin, hubs, branches aur licensing`},body:{en:`
<p>PAN-OS SD-WAN is built from parts you already know if you manage Palo Alto firewalls: firewalls, Panorama, virtual routers, IPsec tunnels and zones. What is new is the SD-WAN layer added on top. This chapter names the parts, the two firewall roles, the topologies and the licensing. Everything here comes from the Palo Alto Networks documentation; where a detail depends on the release, the text says so.</p>
<h3>Analogy: head office and branch counters</h3>
<p>A bank has a head office (hub) with the big vault and branch counters (branches) that serve customers. A central administrator (Panorama) writes the rulebook and sends it to all of them. The SD-WAN plugin is the chapter of the rulebook that deals with moving parcels between locations over several roads.</p>
<h3>The parts</h3>
<table class="cmp"><tr><th>Part</th><th>Role</th></tr>
<tr><td><b>Next-generation firewall</b></td><td>The edge device at a site; forwards traffic, builds VPN tunnels, measures path quality</td></tr>
<tr><td><b>Panorama</b></td><td>Central management; the documentation describes it as the centralised control platform for SD-WAN configuration and administration, with dashboards for performance</td></tr>
<tr><td><b>SD-WAN plugin</b></td><td>The software integrated with Panorama that provides the SD-WAN configuration, Auto VPN and monitoring; features depend on the plugin version</td></tr>
<tr><td><b>Hub</b></td><td>A firewall at a central site (for example a data center) that branches connect to</td></tr>
<tr><td><b>Branch</b></td><td>A firewall at a remote site that connects to one or more hubs</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="PAN-OS SD-WAN architecture">
<rect x="240" y="10" width="160" height="45" rx="10" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">Panorama + plugin</text>
<rect x="60" y="110" width="150" height="50" rx="10" fill="#bae6fd"/><text x="135" y="140" text-anchor="middle" class="svg-ink" font-size="13">Hub (DC-EAST)</text>
<rect x="430" y="110" width="150" height="50" rx="10" fill="#bae6fd"/><text x="505" y="140" text-anchor="middle" class="svg-ink" font-size="13">Hub (DC-WEST)</text>
<rect x="30" y="205" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="230" text-anchor="middle" class="svg-ink" font-size="12">Branch STORE-001</text>
<rect x="255" y="205" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="12">Branch STORE-007</text>
<rect x="480" y="205" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="545" y="230" text-anchor="middle" class="svg-ink" font-size="12">Branch STORE-020</text>
<line x1="320" y1="55" x2="135" y2="110" stroke="#64748b" stroke-dasharray="4"/><line x1="320" y1="55" x2="505" y2="110" stroke="#64748b" stroke-dasharray="4"/>
<line x1="95" y1="205" x2="135" y2="160" stroke="#2563eb" stroke-width="2"/><line x1="320" y1="205" x2="135" y2="160" stroke="#2563eb" stroke-width="2"/><line x1="320" y1="205" x2="505" y2="160" stroke="#2563eb" stroke-width="2"/><line x1="545" y1="205" x2="505" y2="160" stroke="#2563eb" stroke-width="2"/>
</svg><p class="cap">Dashed lines: management from Panorama. Solid lines: VPN tunnels from branches to hubs.</p></div>
<h3>Hub and branch roles</h3>
<p>The documentation describes a hub-and-spoke design in which branches connect to central hubs, and the firewall uses VPN tunnels for path health monitoring between a branch and a hub, so that connection problems are detected quickly. A hub often has several ISP links and carries traffic between branches, or onward to data center applications. A branch usually has two or more links, such as broadband and 4G or 5G.</p>
<h3>Topologies</h3>
<ul>
<li><b>Hub-and-spoke with VPN links.</b> Branches connect to hubs; traffic between branches passes through a hub.</li>
<li><b>Mesh.</b> Branches also connect to each other directly. The VPN cluster documentation names this as available from SD-WAN plugin 2.0.1.</li>
<li><b>Direct Internet Access (DIA).</b> A branch sends internet-bound traffic out of its own ISP link instead of through a hub.</li>
<li><b>Mixed with Prisma Access.</b> The overview documentation lists mixed topologies that combine on-premises SD-WAN firewalls with Prisma Access cloud hubs, available from SD-WAN plugin 2.2.0.</li>
</ul>
<h3>Licensing</h3>
<p>The overview documentation states that Advanced SD-WAN licensing is required for NGFW deployments. Application-experience integration with ADEM needs its own licence (ADEM or Strata Cloud Manager Pro) and a minimum PAN-OS version stated in the documentation. Licence names, bundles and PAN-OS version minimums change between releases, so treat the current compatibility pages as the authority when you design. The point for the exam: SD-WAN on a firewall is a licensed feature of the plugin, not a free toggle.</p>
<h3>Limits worth remembering</h3>
<ul>
<li>SD-WAN interfaces must be in the same virtual router; they cannot be split among virtual routers.</li>
<li>Multi-VSYS configurations are not supported for SD-WAN, according to the documentation.</li>
</ul>
<div class="eg"><p><b>Worked example: planning STORE-007.</b> The branch firewall has ISP-A broadband and ISP-B 5G, both Layer 3 interfaces in the default virtual router. It needs tunnels to hubs DC-EAST and DC-WEST, and direct internet for SaaS. Design checks: both links in the same virtual router (yes), no multi-VSYS (yes), Advanced SD-WAN licence on the firewall (to confirm), plugin version supports the topology (to confirm).</p></div>
<div class="warn"><p><b>Common mistakes.</b> Planning SD-WAN on a firewall that uses multiple virtual systems. Putting the two WAN links in different virtual routers. Assuming a plugin feature exists in every plugin version. Forgetting the licence.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which device manages SD-WAN configuration centrally?" Panorama with the SD-WAN plugin. "Where do you configure the physical links?" On the firewalls, through interface profiles, pushed from Panorama templates in the managed design.</p></div>
<div class="scn"><h4>Two virtual routers</h4><p>A design places ISP-A in the default virtual router and ISP-B in a separate virtual router for isolation. The SD-WAN virtual interface cannot be built across them. The fix is a design change: both ISP interfaces in one virtual router, with security zones and NAT used for separation instead.</p></div>
<div class="iv"><p class="q">"What do you need before turning on PAN-OS SD-WAN at a branch?"</p><p>Panorama with the SD-WAN plugin, firewalls registered as managed devices, the Advanced SD-WAN licence, Layer 3 WAN interfaces in a single virtual router, no multi-VSYS, and a hub or cluster plan. I also check the plugin and PAN-OS versions against the features I need.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Parts: firewalls, Panorama, SD-WAN plugin, hub and branch roles.</li>
<li>Topologies: hub-and-spoke, mesh (2.0.1 or later), DIA, mixed with Prisma Access (2.2.0 or later).</li>
<li>Advanced SD-WAN licence is required; check version matrices.</li>
<li>Same virtual router, no multi-VSYS.</li>
</ul></div>
`,hi:`
<p>PAN-OS SD-WAN un parts se bana hai jinhe aap jaante ho agar Palo Alto firewalls manage karte ho: firewalls, Panorama, virtual routers, IPsec tunnels aur zones. Naya hai upar jodi gayi SD-WAN layer. Yeh chapter parts, do firewall roles, topologies aur licensing ke naam batata hai. Yahan sab kuch Palo Alto Networks documentation se hai; jahan detail release par depend karti hai wahan text bata deta hai.</p>
<h3>Analogy: head office aur branch counters</h3>
<p>Bank mein head office (hub) hota hai jahan bada vault hai aur branch counters (branches) jo customers ko serve karte hain. Ek central administrator (Panorama) rulebook likhta hai aur sabko bhejta hai. SD-WAN plugin rulebook ka woh chapter hai jo kai roads par locations ke beech parcels ki movement sambhalta hai.</p>
<h3>Parts</h3>
<table class="cmp"><tr><th>Part</th><th>Role</th></tr>
<tr><td><b>Next-generation firewall</b></td><td>Site par edge device; traffic forward karta hai, VPN tunnels banata hai, path quality measure karta hai</td></tr>
<tr><td><b>Panorama</b></td><td>Central management; documentation ise SD-WAN configuration aur administration ke liye centralised control platform kehti hai, performance dashboards ke saath</td></tr>
<tr><td><b>SD-WAN plugin</b></td><td>Panorama mein integrated software jo SD-WAN configuration, Auto VPN aur monitoring deta hai; features plugin version par depend karte hain</td></tr>
<tr><td><b>Hub</b></td><td>Central site (jaise data center) ka firewall jisse branches connect hote hain</td></tr>
<tr><td><b>Branch</b></td><td>Remote site ka firewall jo ek ya zyada hubs se connect hota hai</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="PAN-OS SD-WAN architecture">
<rect x="240" y="10" width="160" height="45" rx="10" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">Panorama + plugin</text>
<rect x="60" y="110" width="150" height="50" rx="10" fill="#bae6fd"/><text x="135" y="140" text-anchor="middle" class="svg-ink" font-size="13">Hub (DC-EAST)</text>
<rect x="430" y="110" width="150" height="50" rx="10" fill="#bae6fd"/><text x="505" y="140" text-anchor="middle" class="svg-ink" font-size="13">Hub (DC-WEST)</text>
<rect x="30" y="205" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="230" text-anchor="middle" class="svg-ink" font-size="12">Branch STORE-001</text>
<rect x="255" y="205" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="12">Branch STORE-007</text>
<rect x="480" y="205" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="545" y="230" text-anchor="middle" class="svg-ink" font-size="12">Branch STORE-020</text>
<line x1="320" y1="55" x2="135" y2="110" stroke="#64748b" stroke-dasharray="4"/><line x1="320" y1="55" x2="505" y2="110" stroke="#64748b" stroke-dasharray="4"/>
<line x1="95" y1="205" x2="135" y2="160" stroke="#2563eb" stroke-width="2"/><line x1="320" y1="205" x2="135" y2="160" stroke="#2563eb" stroke-width="2"/><line x1="320" y1="205" x2="505" y2="160" stroke="#2563eb" stroke-width="2"/><line x1="545" y1="205" x2="505" y2="160" stroke="#2563eb" stroke-width="2"/>
</svg><p class="cap">Dashed lines: Panorama se management. Solid lines: branches se hubs tak VPN tunnels.</p></div>
<h3>Hub aur branch roles</h3>
<p>Documentation hub-and-spoke design describe karti hai jisme branches central hubs se connect hote hain, aur firewall branch aur hub ke beech path health monitoring ke liye VPN tunnels use karta hai, taaki connection problems jaldi pakdi jayein. Hub ke paas aksar kai ISP links hote hain aur woh branches ke beech ya data center applications tak traffic carry karta hai. Branch ke paas aam taur par do ya zyada links hote hain, jaise broadband aur 4G ya 5G.</p>
<h3>Topologies</h3>
<ul>
<li><b>VPN links ke saath hub-and-spoke.</b> Branches hubs se connect hote hain; branches ke beech traffic hub se guzarta hai.</li>
<li><b>Mesh.</b> Branches aapas mein bhi seedha connect hote hain. VPN cluster documentation ise SD-WAN plugin 2.0.1 se available batati hai.</li>
<li><b>Direct Internet Access (DIA).</b> Branch internet-bound traffic hub ke bajay apne ISP link se bahar bhejta hai.</li>
<li><b>Prisma Access ke saath mixed.</b> Overview documentation on-premises SD-WAN firewalls ko Prisma Access cloud hubs ke saath jodne wali mixed topologies list karti hai, SD-WAN plugin 2.2.0 se available.</li>
</ul>
<h3>Licensing</h3>
<p>Overview documentation kehti hai ki NGFW deployments ke liye Advanced SD-WAN licensing zaroori hai. ADEM ke saath application-experience integration ko apna licence (ADEM ya Strata Cloud Manager Pro) aur documentation mein likha minimum PAN-OS version chahiye. Licence names, bundles aur PAN-OS version minimums releases ke beech badalte hain, isliye design karte waqt current compatibility pages ko authority maano. Exam ke liye point: firewall par SD-WAN plugin ka licensed feature hai, free toggle nahi.</p>
<h3>Yaad rakhne layak limits</h3>
<ul>
<li>SD-WAN interfaces ek hi virtual router mein hone chahiye; unhe virtual routers mein baanta nahi ja sakta.</li>
<li>Documentation ke anusaar SD-WAN ke liye multi-VSYS configurations supported nahi hain.</li>
</ul>
<div class="eg"><p><b>Worked example: STORE-007 plan karna.</b> Branch firewall ke paas ISP-A broadband aur ISP-B 5G hai, dono default virtual router mein Layer 3 interfaces. Use hubs DC-EAST aur DC-WEST tak tunnels chahiye, aur SaaS ke liye direct internet. Design checks: dono links ek virtual router mein (haan), multi-VSYS nahi (haan), firewall par Advanced SD-WAN licence (confirm karna hai), plugin version topology support karta hai (confirm karna hai).</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Multiple virtual systems wale firewall par SD-WAN plan karna. Do WAN links ko alag virtual routers mein rakhna. Maan lena ki har plugin version mein har feature hai. Licence bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> "SD-WAN configuration ko centrally kaun manage karta hai?" SD-WAN plugin ke saath Panorama. "Physical links kahan configure hote hain?" Firewalls par, interface profiles ke zariye, managed design mein Panorama templates se push hokar.</p></div>
<div class="scn"><h4>Do virtual routers</h4><p>Ek design ISP-A ko default virtual router mein aur ISP-B ko isolation ke liye alag virtual router mein rakhta hai. SD-WAN virtual interface unke across nahi ban sakta. Fix design change hai: dono ISP interfaces ek virtual router mein, aur separation ke liye security zones aur NAT.</p></div>
<div class="iv"><p class="q">"Branch par PAN-OS SD-WAN on karne se pehle kya chahiye?"</p><p>SD-WAN plugin ke saath Panorama, managed devices ke roop mein registered firewalls, Advanced SD-WAN licence, ek virtual router mein Layer 3 WAN interfaces, multi-VSYS nahi, aur hub ya cluster plan. Main plugin aur PAN-OS versions ko apne chahiye features ke against bhi check karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Parts: firewalls, Panorama, SD-WAN plugin, hub aur branch roles.</li>
<li>Topologies: hub-and-spoke, mesh (2.0.1 ya baad), DIA, Prisma Access ke saath mixed (2.2.0 ya baad).</li>
<li>Advanced SD-WAN licence zaroori hai; version matrices check karo.</li>
<li>Ek virtual router, multi-VSYS nahi.</li>
</ul></div>
`}};export{e as default};