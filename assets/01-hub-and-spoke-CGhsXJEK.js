var e=`<svg viewBox="0 0 640 300" role="img" aria-label="Hub-and-spoke topology: hub VNet 10.0.0.0/16 with firewall, gateway and shared services, two spoke VNets, on-premises site">
<rect x="215" y="70" width="210" height="160" rx="12" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="14">hub-vnet 10.0.0.0/16</text>
<rect x="230" y="104" width="86" height="34" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="273" y="125" text-anchor="middle" class="svg-ink" font-size="11">Azure Firewall</text>
<rect x="324" y="104" width="86" height="34" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="367" y="125" text-anchor="middle" class="svg-ink" font-size="11">VPN / ER GW</text>
<rect x="230" y="148" width="86" height="34" rx="6" fill="#fde68a" stroke="#64748b"/><text x="273" y="169" text-anchor="middle" class="svg-ink" font-size="11">DNS, AD, logs</text>
<rect x="324" y="148" width="86" height="34" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="367" y="169" text-anchor="middle" class="svg-ink" font-size="11">Bastion</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="11">shared services live once, here</text>
<rect x="15" y="100" width="150" height="90" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="90" y="130" text-anchor="middle" class="svg-ink" font-size="13">spoke1-vnet</text><text x="90" y="150" text-anchor="middle" class="svg-muted" font-size="11">10.1.0.0/16 (app)</text>
<rect x="475" y="100" width="150" height="90" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="550" y="130" text-anchor="middle" class="svg-ink" font-size="13">spoke2-vnet</text><text x="550" y="150" text-anchor="middle" class="svg-muted" font-size="11">10.2.0.0/16 (data)</text>
<rect x="240" y="250" width="160" height="40" rx="10" fill="#e2e8f0" stroke="#64748b"/><text x="320" y="275" text-anchor="middle" class="svg-ink" font-size="12">On-premises 192.168.0.0/16</text>
<g stroke="#64748b" stroke-width="2"><line x1="165" y1="145" x2="215" y2="145"/><line x1="425" y1="145" x2="475" y2="145"/><line x1="320" y1="230" x2="320" y2="250" stroke-dasharray="5 4"/></g>
<text x="190" y="136" text-anchor="middle" class="svg-muted" font-size="10">peering</text><text x="450" y="136" text-anchor="middle" class="svg-muted" font-size="10">peering</text>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">Spokes do not peer with each other: the hub is the meeting point</text>
</svg>`,t={id:`hub-and-spoke`,h:{en:`Hub-and-spoke: the shape of a real Azure network`,hi:`Hub-and-spoke: real Azure network ka shape`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.nwkings.com. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>What you will learn</h3>
<ul>
<li>Why companies build a hub-and-spoke network instead of one giant VNet or a mesh of peerings.</li>
<li>What lives in the hub (firewall, gateway, DNS, Bastion) and what lives in a spoke (workloads).</li>
<li>How VNet peering works, why it is not transitive, and the three peering flags that matter.</li>
<li>How this module continues: Azure Firewall, UDRs, Virtual WAN, Route Server, then two guided labs.</li>
</ul>
<p><b>Prerequisites:</b> you should already know VNets, subnets, NSGs and basic peering from the earlier Azure modules. Here we build on them, we do not re-teach them.</p>

<h3>The airport analogy</h3>
<p>Think of a big airport hub. Small cities (the spokes) do not run flights to every other small city. Each city has one route to the hub, and the hub handles security, customs and connections. A hub-and-spoke network is the same: each workload VNet (spoke) connects once to a central VNet (hub). Security checks, the link to head office, and shared tools sit in the hub, once, instead of being copied into every spoke.</p>

<div class="dia">`+e+`<p class="cap">Hub VNet 10.0.0.0/16 with two spokes and an on-premises site. These addresses are reused in every chapter and lab of this module.</p></div>

<h3>Why not one big VNet, or a full mesh?</h3>
<ul>
<li><b>One big VNet:</b> simple at first, but every team shares one address space, one set of subnets and one blast radius. Governance and cost allocation become painful.</li>
<li><b>Full mesh of peerings:</b> peering is a one-to-one link and is <b>not transitive</b>. If spoke1 peers with the hub and spoke2 peers with the hub, spoke1 still cannot reach spoke2 through the hub by default. A mesh needs n(n-1)/2 peerings; ten spokes need 45.</li>
<li><b>Hub-and-spoke:</b> n spokes need n peerings. The hub gives you one place to inspect traffic and one place to terminate VPN or ExpressRoute.</li>
</ul>

<h3>What goes in the hub</h3>
<table class="cmp"><tr><th>Hub component</th><th>Why it is in the hub</th></tr>
<tr><td>Azure Firewall (or another NVA)</td><td>One inspection point for spoke-to-spoke, spoke-to-internet and spoke-to-on-premises traffic.</td></tr>
<tr><td>VPN Gateway or ExpressRoute gateway</td><td>One connection to head office, shared by all spokes (GatewaySubnet).</td></tr>
<tr><td>Azure Bastion</td><td>Browser-based admin access to VMs without public IPs.</td></tr>
<tr><td>DNS servers or DNS Private Resolver, domain controllers, logging</td><td>Shared services every spoke needs.</td></tr></table>
<p>Spokes hold the actual workloads: one spoke per application, environment or team. A common split is spoke1 for the app tier and spoke2 for data, or one spoke per subscription.</p>

<h3>Peering in one page</h3>
<p>VNet peering connects two VNets over the Microsoft backbone. Traffic is private, low latency, and needs no gateway. Each side of a peering is a separate object, so you create two. Three flags decide the behaviour:</p>
<dl class="terms">
<dt>Allow forwarded traffic</dt><dd>Accepts traffic that did not originate in the peered VNet, for example traffic forwarded by a firewall in the hub. Needed on the spoke side for hub-forwarded flows.</dd>
<dt>Allow gateway transit (hub side)</dt><dd>Lets spokes use the hub's VPN or ExpressRoute gateway.</dd>
<dt>Use remote gateways (spoke side)</dt><dd>Makes the spoke use the hub's gateway. Needs gateway transit on the hub side, and the spoke must not have its own gateway.</dd>
</dl>
<pre class="code"><span class="c"># hub-to-spoke1 side, then spoke1-to-hub side</span>
az network vnet peering create -g rg-hub -n hub-to-spoke1 --vnet-name hub-vnet --remote-vnet spoke1-vnet --allow-vnet-access --allow-forwarded-traffic --allow-gateway-transit
az network vnet peering create -g rg-spoke1 -n spoke1-to-hub --vnet-name spoke1-vnet --remote-vnet hub-vnet --allow-vnet-access --allow-forwarded-traffic</pre>
<pre class="out"><span class="c">Illustrative output</span>
Name            PeeringState   AllowForwardedTraffic   AllowGatewayTransit
hub-to-spoke1   <span class="hl">Connected</span>      True                    True</pre>
<p>The state must read <code>Connected</code> on both sides. <code>Initiated</code> means only one side exists.</p>

<div class="warn"><p><b>Common mistakes:</b> overlapping address spaces (peering is refused), creating only one side of the peering, and expecting spoke1 to reach spoke2 just because both peer with the hub.</p></div>
<div class="exam"><p><b>Exam trap:</b> peering is non-transitive. To make spokes talk through the hub you need a forwarding device in the hub plus user-defined routes (next chapters), or Virtual WAN.</p></div>

<div class="scn"><h4>Fifteen peerings nobody could draw</h4><p>A team grew from four to ten VNets by peering each new one with whichever VNet it needed. After a year there were 22 peerings, nobody could explain which VNet could reach which, and the security team had no single place to inspect traffic. The re-design moved shared services and a firewall into a hub, converted everything to ten spoke-to-hub peerings, and added routes so that spoke-to-spoke traffic crossed the firewall.</p><p><b>Lesson:</b> hub-and-spoke is as much about control and visibility as about saving peerings.</p></div>

<div class="iv"><p class="q">"Why is hub-and-spoke preferred over a full mesh in Azure?"</p><p>Say that peering is non-transitive, so a mesh grows as n(n-1)/2 while hub-and-spoke grows linearly. Add that the hub concentrates the firewall, the VPN or ExpressRoute gateway, DNS and Bastion, which gives one inspection point, lower cost and simpler governance.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Spokes hold workloads; the hub holds shared and security services.</li>
<li>Peering is private, backbone-speed and non-transitive; create both sides.</li>
<li>Gateway transit on the hub plus use remote gateways on the spoke shares one gateway.</li>
<li>Spoke-to-spoke needs a forwarding device and routes, or Virtual WAN.</li>
<li>Address spaces must not overlap, including with on-premises.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.nwkings.com. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>Aap kya seekhoge</h3>
<ul>
<li>Companies ek giant VNet ya peerings ke mesh ki jagah hub-and-spoke network kyun banati hain.</li>
<li>Hub mein kya rehta hai (firewall, gateway, DNS, Bastion) aur spoke mein kya (workloads).</li>
<li>VNet peering kaise kaam karti hai, woh transitive kyun nahi hai, aur kaunse teen peering flags important hain.</li>
<li>Yeh module aage kaise chalta hai: Azure Firewall, UDRs, Virtual WAN, Route Server, phir do guided labs.</li>
</ul>
<p><b>Prerequisites:</b> aapko pichhle Azure modules se VNets, subnets, NSGs aur basic peering aani chahiye. Yahan hum unpar build karte hain, dobara nahi padhate.</p>

<h3>Airport ki analogy</h3>
<p>Ek bade airport hub ko socho. Chhote shehar (spokes) har doosre chhote shehar ke liye flights nahi chalate. Har shehar ka hub tak ek route hota hai, aur hub security, customs aur connections sambhalta hai. Hub-and-spoke network bhi aisa hi hai: har workload VNet (spoke) ek central VNet (hub) se ek baar judta hai. Security checks, head office ka link aur shared tools hub mein ek baar rehte hain, har spoke mein copy nahi hote.</p>

<div class="dia">`+e+`<p class="cap">Hub VNet 10.0.0.0/16, do spokes aur ek on-premises site. Yeh addresses is module ke har chapter aur lab mein reuse hote hain.</p></div>

<h3>Ek bada VNet ya full mesh kyun nahi?</h3>
<ul>
<li><b>Ek bada VNet:</b> shuru mein simple, par har team ek hi address space, ek hi subnets aur ek hi blast radius share karti hai. Governance aur cost allocation mushkil ho jaata hai.</li>
<li><b>Peerings ka full mesh:</b> peering one-to-one link hai aur <b>transitive nahi</b> hai. Agar spoke1 hub se peer hai aur spoke2 bhi hub se peer hai, tab bhi spoke1 default mein hub ke through spoke2 tak nahi pahunch sakta. Mesh ko n(n-1)/2 peerings chahiye; das spokes ko 45.</li>
<li><b>Hub-and-spoke:</b> n spokes ko n peerings. Hub traffic inspect karne ki ek jagah deta hai aur VPN ya ExpressRoute terminate karne ki bhi ek jagah.</li>
</ul>

<h3>Hub mein kya jaata hai</h3>
<table class="cmp"><tr><th>Hub component</th><th>Hub mein kyun</th></tr>
<tr><td>Azure Firewall (ya koi doosra NVA)</td><td>Spoke-to-spoke, spoke-to-internet aur spoke-to-on-premises traffic ke liye ek inspection point.</td></tr>
<tr><td>VPN Gateway ya ExpressRoute gateway</td><td>Head office se ek connection, sab spokes share karte hain (GatewaySubnet).</td></tr>
<tr><td>Azure Bastion</td><td>Public IP ke bina VMs ka browser-based admin access.</td></tr>
<tr><td>DNS servers ya DNS Private Resolver, domain controllers, logging</td><td>Shared services jo har spoke ko chahiye.</td></tr></table>
<p>Spokes mein asli workloads hote hain: har application, environment ya team ke liye ek spoke. Aam split: spoke1 app tier ke liye aur spoke2 data ke liye, ya har subscription ke liye ek spoke.</p>

<h3>Peering ek page mein</h3>
<p>VNet peering do VNets ko Microsoft backbone par jodti hai. Traffic private hota hai, latency kam, aur gateway ki zaroorat nahi. Peering ki har side alag object hai, isliye aap do banate ho. Teen flags behaviour decide karte hain:</p>
<dl class="terms">
<dt>Allow forwarded traffic</dt><dd>Aisa traffic accept karta hai jo peered VNet mein originate nahi hua, jaise hub ke firewall dwara forward kiya traffic. Hub-forwarded flows ke liye spoke side par chahiye.</dd>
<dt>Allow gateway transit (hub side)</dt><dd>Spokes ko hub ka VPN ya ExpressRoute gateway use karne deta hai.</dd>
<dt>Use remote gateways (spoke side)</dt><dd>Spoke ko hub ka gateway use karwata hai. Hub side par gateway transit chahiye, aur spoke ka apna gateway nahi hona chahiye.</dd>
</dl>
<pre class="code"><span class="c"># hub-to-spoke1 side, phir spoke1-to-hub side</span>
az network vnet peering create -g rg-hub -n hub-to-spoke1 --vnet-name hub-vnet --remote-vnet spoke1-vnet --allow-vnet-access --allow-forwarded-traffic --allow-gateway-transit
az network vnet peering create -g rg-spoke1 -n spoke1-to-hub --vnet-name spoke1-vnet --remote-vnet hub-vnet --allow-vnet-access --allow-forwarded-traffic</pre>
<pre class="out"><span class="c">Illustrative output</span>
Name            PeeringState   AllowForwardedTraffic   AllowGatewayTransit
hub-to-spoke1   <span class="hl">Connected</span>      True                    True</pre>
<p>State dono sides par <code>Connected</code> hona chahiye. <code>Initiated</code> ka matlab sirf ek side bani hai.</p>

<div class="warn"><p><b>Common mistakes:</b> overlapping address spaces (peering refuse hoti hai), peering ki sirf ek side banana, aur yeh expect karna ki spoke1 spoke2 tak pahunch jayega kyunki dono hub se peer hain.</p></div>
<div class="exam"><p><b>Exam trap:</b> peering non-transitive hai. Spokes ko hub ke through baat karwane ke liye hub mein forwarding device aur user-defined routes chahiye (agle chapters), ya Virtual WAN.</p></div>

<div class="scn"><h4>Pandrah peerings jo koi draw nahi kar paya</h4><p>Ek team chaar se das VNets tak badhi, har naye VNet ko jis VNet se zaroorat thi usse peer karke. Ek saal baad 22 peerings thi, koi nahi bata sakta tha ki kaunsa VNet kisse reach kar sakta hai, aur security team ke paas traffic inspect karne ki ek jagah nahi thi. Re-design mein shared services aur firewall hub mein gaye, sab kuch das spoke-to-hub peerings mein convert hua, aur routes jode gaye taaki spoke-to-spoke traffic firewall se guzre.</p><p><b>Lesson:</b> hub-and-spoke peerings bachane se zyada control aur visibility ke baare mein hai.</p></div>

<div class="iv"><p class="q">"Azure mein full mesh ki jagah hub-and-spoke kyun prefer kiya jaata hai?"</p><p>Bolo ki peering non-transitive hai, isliye mesh n(n-1)/2 se badhta hai jabki hub-and-spoke linearly. Jodo ki hub mein firewall, VPN ya ExpressRoute gateway, DNS aur Bastion concentrate hote hain, jisse ek inspection point, kam cost aur simple governance milti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Spokes mein workloads; hub mein shared aur security services.</li>
<li>Peering private, backbone-speed aur non-transitive hai; dono sides banao.</li>
<li>Hub par gateway transit aur spoke par use remote gateways ek gateway share karwate hain.</li>
<li>Spoke-to-spoke ke liye forwarding device aur routes chahiye, ya Virtual WAN.</li>
<li>Address spaces overlap nahi hone chahiye, on-premises ke saath bhi.</li>
</ul></div>
`}};export{t as default};