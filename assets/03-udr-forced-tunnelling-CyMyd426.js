var e=`<svg viewBox="0 0 640 260" role="img" aria-label="Spoke-to-spoke traffic forced through the hub firewall using user-defined routes">
<rect x="15" y="90" width="150" height="80" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="90" y="116" text-anchor="middle" class="svg-ink" font-size="13">spoke1 10.1.0.0/16</text><text x="90" y="138" text-anchor="middle" class="svg-muted" font-size="11">VM 10.1.1.4</text><text x="90" y="156" text-anchor="middle" class="svg-muted" font-size="11">rt-spoke1</text>
<rect x="475" y="90" width="150" height="80" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="550" y="116" text-anchor="middle" class="svg-ink" font-size="13">spoke2 10.2.0.0/16</text><text x="550" y="138" text-anchor="middle" class="svg-muted" font-size="11">VM 10.2.1.4</text><text x="550" y="156" text-anchor="middle" class="svg-muted" font-size="11">rt-spoke2</text>
<rect x="240" y="60" width="160" height="140" rx="12" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="13">hub 10.0.0.0/16</text>
<rect x="260" y="104" width="120" height="44" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">Azure Firewall</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="11">10.0.1.4</text>
<g stroke="#2563eb" stroke-width="2.5" fill="none"><path d="M165 120 L260 120"/><path d="M380 130 L475 130"/></g>
<text x="212" y="112" text-anchor="middle" class="svg-accent" font-size="10">1 UDR</text><text x="428" y="122" text-anchor="middle" class="svg-accent" font-size="10">2 UDR back</text>
<text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="12">rt-spoke1: 10.2.0.0/16 -&gt; VirtualAppliance 10.0.1.4   |   rt-spoke2: 10.1.0.0/16 -&gt; VirtualAppliance 10.0.1.4</text>
<text x="320" y="248" text-anchor="middle" class="svg-muted" font-size="11">Both directions must cross the same firewall, or the return packet is dropped (asymmetric routing)</text>
</svg>`,t={id:`udr-forced-tunnelling`,h:{en:`User-defined routes and forced tunnelling`,hi:`User-defined routes aur forced tunnelling`},body:{en:`
<h3>Why the firewall sits idle by default</h3>
<p>If you only deploy a firewall in the hub, nothing changes. Azure's <b>system routes</b> already deliver spoke traffic wherever peering and VNet rules say, and packets never visit the firewall. A guard who stands in the lobby but is bypassed by the stairs checks nobody. To make traffic pass the firewall you must change the routes with a <b>route table</b> that holds <b>user-defined routes (UDRs)</b>, attached to the subnets whose traffic you want to steer.</p>

<h3>How Azure picks a route</h3>
<ol>
<li><b>Longest prefix match</b> wins: 10.2.1.0/24 beats 10.2.0.0/16 beats 0.0.0.0/0.</li>
<li>If prefixes are equal, the source decides: <b>UDR beats BGP beats system route</b>.</li>
</ol>
<p>System routes include the VNet's own address space, peered VNets (next hop type <code>VNetPeering</code>), and the default <code>0.0.0.0/0</code> to the internet. Routes learned from a gateway over BGP have next hop <code>VirtualNetworkGateway</code>. A UDR sets its own next hop type: <code>VirtualAppliance</code> (with the firewall's private IP), <code>VirtualNetworkGateway</code>, <code>VnetLocal</code>, <code>Internet</code> or <code>None</code> (drop).</p>

<div class="dia">`+e+`<p class="cap">Spoke-to-spoke through the firewall. Each spoke subnet gets a route table that sends the other spoke's prefix to 10.0.1.4.</p></div>

<h3>Building the spoke-to-spoke path</h3>
<p>Step by step, for traffic between spoke1 (10.1.0.0/16) and spoke2 (10.2.0.0/16):</p>
<ol>
<li>Peer both spokes to the hub, with <i>allow forwarded traffic</i> enabled on the spoke-to-hub peerings.</li>
<li>Create a route table for each spoke. In rt-spoke1 add 10.2.0.0/16 with next hop <code>VirtualAppliance</code> 10.0.1.4. In rt-spoke2 add 10.1.0.0/16 the same way.</li>
<li>Associate each route table with the workload subnets (not with AzureFirewallSubnet).</li>
<li>In the firewall policy, add a network rule that allows the flow you want.</li>
</ol>
<pre class="code">az network route-table create -g rg-spoke1 -n rt-spoke1 --location centralindia
az network route-table route create -g rg-spoke1 --route-table-name rt-spoke1 -n to-spoke2 --address-prefix 10.2.0.0/16 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.1.4
az network vnet subnet update -g rg-spoke1 --vnet-name spoke1-vnet -n workload --route-table rt-spoke1</pre>
<p>The same-VNet traffic (inside one spoke) still uses the system VNet route and is not sent to the firewall unless you add a more specific UDR. Intra-subnet traffic is never routed.</p>

<h3>Internet egress through the firewall</h3>
<p>Add <code>0.0.0.0/0</code> with next hop <code>VirtualAppliance</code> 10.0.1.4 to a spoke route table. All internet-bound traffic now goes to the firewall, which SNATs it to its public IP and applies application rules. This gives you one controlled egress address and FQDN allow lists.</p>

<h3>Forced tunnelling</h3>
<p><b>Forced tunnelling</b> means sending all internet-bound traffic to on-premises (or another inspection point) instead of straight out to the internet. For Azure Firewall you configure a management subnet with its own public IP so that Azure can still manage the firewall, and you then set the 0.0.0.0/0 route on AzureFirewallSubnet to the gateway or an on-premises next hop (verify the exact steps before publishing). Do <b>not</b> advertise 0.0.0.0/0 casually from on-premises over BGP: it can hijack every spoke's default route.</p>

<h3>Asymmetric routing: the classic failure</h3>
<p>The firewall is stateful. It must see both the request and the reply. If spoke1 sends via the firewall but spoke2 replies directly over its system peering route, the firewall sees only half the conversation and drops it. The fix is symmetrical UDRs on both sides, as in the diagram. Also watch the gateway: traffic from on-premises to a spoke arrives through GatewaySubnet. Put a UDR on <b>GatewaySubnet</b> for each spoke prefix with next hop 10.0.1.4 if you want inbound traffic inspected too.</p>
<div class="warn"><p><b>Common mistakes:</b> forgetting the return-path route, associating a 0.0.0.0/0 route table with GatewaySubnet or AzureFirewallSubnet without planning it (it can break the gateway or loop traffic), pointing next hop at a public IP instead of the private IP, and leaving BGP route propagation on a table when you meant to block learned routes.</p></div>
<div class="exam"><p><b>Exam trap:</b> UDR beats BGP beats system route only when the prefixes are the same length. A longer prefix always wins first. Also, <i>Disable BGP route propagation</i> on a route table stops gateway-learned routes from being added to the associated subnets.</p></div>

<h3>Proving it with Network Watcher</h3>
<p>Do not guess. Ask Azure which hop a packet takes, or read the effective routes of a NIC.</p>
<pre class="code">az network watcher show-next-hop -g rg-spoke1 --vm vm-spoke1 --source-ip 10.1.1.4 --dest-ip 10.2.1.4
az network nic show-effective-route-table -g rg-spoke1 -n vm-spoke1-nic -o table</pre>
<pre class="out"><span class="c">Illustrative output</span>
NextHopType        NextHopIpAddress   RouteTableId
<span class="hl">VirtualAppliance</span>   10.0.1.4           .../routeTables/rt-spoke1</pre>

<div class="scn"><h4>One-way pings through the hub</h4><p>An engineer added the UDR in rt-spoke1 and the firewall rule, and spoke1 could not reach spoke2. Firewall logs showed packets arriving from 10.1.1.4 and being allowed, but no reply ever came back. The spoke2 route table did not exist: replies took the direct peering path and never touched the firewall. After adding rt-spoke2 with the mirror UDR, the flow worked.</p><p><b>Lesson:</b> always build both directions, then verify with next hop on both VMs.</p></div>

<div class="iv"><p class="q">"How do you force spoke traffic through a firewall in the hub?"</p><p>User-defined routes on each spoke subnet with next hop type VirtualAppliance pointing at the firewall's private IP, matching routes on the return path, allow-forwarded-traffic on the peerings, and a rule on the firewall. Mention asymmetric routing and checking with next hop and effective routes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A firewall does nothing until routes send traffic to it.</li>
<li>Longest prefix wins; then UDR over BGP over system routes.</li>
<li>Use next hop VirtualAppliance with the firewall's private IP.</li>
<li>Build both directions or the stateful firewall drops the flow.</li>
<li>Verify with next hop and effective routes, not by assumption.</li>
</ul></div>
`,hi:`
<h3>Firewall default mein idle kyun rehta hai</h3>
<p>Agar aap sirf hub mein firewall deploy karte ho to kuch nahi badalta. Azure ke <b>system routes</b> pehle se spoke traffic wahin deliver karte hain jahan peering aur VNet rules kehte hain, aur packets firewall ko visit hi nahi karte. Lobby mein khada guard jise seedhiyon se bypass kar diya jaaye, kisi ko check nahi karta. Traffic ko firewall se guzarne ke liye routes badalne padte hain, ek <b>route table</b> se jisme <b>user-defined routes (UDRs)</b> hon, aur jo un subnets se attach ho jinka traffic aap steer karna chahte ho.</p>

<h3>Azure route kaise chunta hai</h3>
<ol>
<li><b>Longest prefix match</b> jeetta hai: 10.2.1.0/24 beats 10.2.0.0/16 beats 0.0.0.0/0.</li>
<li>Prefixes barabar hon to source decide karta hai: <b>UDR beats BGP beats system route</b>.</li>
</ol>
<p>System routes mein VNet ka apna address space, peered VNets (next hop type <code>VNetPeering</code>), aur internet ka default <code>0.0.0.0/0</code> aate hain. Gateway se BGP par seekhe routes ka next hop <code>VirtualNetworkGateway</code> hota hai. UDR apna next hop type set karta hai: <code>VirtualAppliance</code> (firewall ke private IP ke saath), <code>VirtualNetworkGateway</code>, <code>VnetLocal</code>, <code>Internet</code> ya <code>None</code> (drop).</p>

<div class="dia">`+e+`<p class="cap">Firewall ke through spoke-to-spoke. Har spoke subnet ko route table milti hai jo doosre spoke ka prefix 10.0.1.4 ko bhejti hai.</p></div>

<h3>Spoke-to-spoke path banana</h3>
<p>Step by step, spoke1 (10.1.0.0/16) aur spoke2 (10.2.0.0/16) ke beech traffic ke liye:</p>
<ol>
<li>Dono spokes ko hub se peer karo, spoke-to-hub peerings par <i>allow forwarded traffic</i> enabled ke saath.</li>
<li>Har spoke ke liye route table banao. rt-spoke1 mein 10.2.0.0/16, next hop <code>VirtualAppliance</code> 10.0.1.4 jodo. rt-spoke2 mein 10.1.0.0/16 isi tarah.</li>
<li>Har route table ko workload subnets se associate karo (AzureFirewallSubnet se nahi).</li>
<li>Firewall policy mein jo flow chahiye use allow karne wala network rule jodo.</li>
</ol>
<pre class="code">az network route-table create -g rg-spoke1 -n rt-spoke1 --location centralindia
az network route-table route create -g rg-spoke1 --route-table-name rt-spoke1 -n to-spoke2 --address-prefix 10.2.0.0/16 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.1.4
az network vnet subnet update -g rg-spoke1 --vnet-name spoke1-vnet -n workload --route-table rt-spoke1</pre>
<p>Ek hi VNet ke andar ka traffic (ek spoke ke andar) system VNet route use karta hai aur firewall ko tab tak nahi jaata jab tak aap zyada specific UDR na jodo. Intra-subnet traffic kabhi route nahi hota.</p>

<h3>Firewall ke through internet egress</h3>
<p>Spoke route table mein <code>0.0.0.0/0</code>, next hop <code>VirtualAppliance</code> 10.0.1.4 jodo. Ab saara internet-bound traffic firewall ko jaata hai, jo use apne public IP par SNAT karta hai aur application rules lagata hai. Isse ek controlled egress address aur FQDN allow lists milti hain.</p>

<h3>Forced tunnelling</h3>
<p><b>Forced tunnelling</b> ka matlab saara internet-bound traffic seedha internet ki jagah on-premises (ya kisi aur inspection point) ko bhejna. Azure Firewall ke liye aap apne public IP wala management subnet configure karte ho taaki Azure firewall ko manage kar sake, aur phir AzureFirewallSubnet ka 0.0.0.0/0 route gateway ya on-premises next hop par set karte ho (publish se pehle exact steps verify karo). On-premises se BGP par 0.0.0.0/0 casually advertise <b>mat</b> karo: yeh har spoke ka default route hijack kar sakta hai.</p>

<h3>Asymmetric routing: classic failure</h3>
<p>Firewall stateful hai. Use request aur reply dono dikhne chahiye. Agar spoke1 firewall ke through bhejta hai par spoke2 apne system peering route se seedha reply karta hai, to firewall ko aadhi conversation dikhti hai aur woh drop kar deta hai. Fix: diagram jaisa dono sides par symmetrical UDRs. Gateway par bhi dhyan do: on-premises se spoke ka traffic GatewaySubnet se aata hai. Agar inbound traffic bhi inspect karna hai to <b>GatewaySubnet</b> par har spoke prefix ke liye next hop 10.0.1.4 ka UDR lagao.</p>
<div class="warn"><p><b>Common mistakes:</b> return-path route bhoolna, plan kiye bina GatewaySubnet ya AzureFirewallSubnet ke saath 0.0.0.0/0 route table associate karna (gateway toot sakta hai ya traffic loop ho sakta hai), next hop mein private IP ki jagah public IP dena, aur jab learned routes block karne the tab table par BGP route propagation on chhod dena.</p></div>
<div class="exam"><p><b>Exam trap:</b> UDR beats BGP beats system route tabhi jab prefixes ki length same ho. Lamba prefix hamesha pehle jeetta hai. Aur <i>Disable BGP route propagation</i> route table par gateway-learned routes ko associated subnets mein add hone se rokta hai.</p></div>

<h3>Network Watcher se saabit karo</h3>
<p>Andaza mat lagao. Azure se poochho ki packet kaunsa hop leta hai, ya NIC ke effective routes padho.</p>
<pre class="code">az network watcher show-next-hop -g rg-spoke1 --vm vm-spoke1 --source-ip 10.1.1.4 --dest-ip 10.2.1.4
az network nic show-effective-route-table -g rg-spoke1 -n vm-spoke1-nic -o table</pre>
<pre class="out"><span class="c">Illustrative output</span>
NextHopType        NextHopIpAddress   RouteTableId
<span class="hl">VirtualAppliance</span>   10.0.1.4           .../routeTables/rt-spoke1</pre>

<div class="scn"><h4>Hub ke through ek-taraf ping</h4><p>Ek engineer ne rt-spoke1 mein UDR aur firewall rule jode, aur spoke1 spoke2 tak nahi pahunch paya. Firewall logs mein 10.1.1.4 se packets aate aur allow hote dikhe, par koi reply wapas nahi aaya. Spoke2 ki route table thi hi nahi: replies direct peering path se gaye aur firewall ko chhua tak nahi. Mirror UDR ke saath rt-spoke2 jodne ke baad flow chal pada.</p><p><b>Lesson:</b> hamesha dono directions banao, phir dono VMs par next hop se verify karo.</p></div>

<div class="iv"><p class="q">"Hub ke firewall se spoke traffic kaise force karoge?"</p><p>Har spoke subnet par user-defined routes, next hop type VirtualAppliance jo firewall ke private IP ko point kare, return path par matching routes, peerings par allow-forwarded-traffic, aur firewall par rule. Asymmetric routing ka zikr karo aur next hop aur effective routes se check karne ka.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routes traffic bhejte nahi to firewall kuch nahi karta.</li>
<li>Longest prefix jeetta hai; phir UDR over BGP over system routes.</li>
<li>Next hop VirtualAppliance firewall ke private IP ke saath use karo.</li>
<li>Dono directions banao warna stateful firewall flow drop karta hai.</li>
<li>Next hop aur effective routes se verify karo, assumption se nahi.</li>
</ul></div>
`}};export{t as default};