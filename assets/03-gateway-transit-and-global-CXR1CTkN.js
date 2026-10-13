var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="{{aria}}">
<rect x="10" y="30" width="130" height="150" rx="8" fill="#fed7aa"/><text x="75" y="55" text-anchor="middle" class="svg-ink" font-size="13">{{onprem}}</text><text x="75" y="75" text-anchor="middle" class="svg-muted" font-size="12">192.168.0.0/16</text>
<rect x="210" y="30" width="200" height="150" rx="8" fill="#ddd6fe"/><text x="310" y="52" text-anchor="middle" class="svg-ink" font-size="13">Hub VNet 10.0.0.0/16</text>
<rect x="235" y="80" width="150" height="40" rx="6" fill="#fde68a"/><text x="310" y="104" text-anchor="middle" class="svg-ink" font-size="12">VPN / ER gateway</text>
<text x="310" y="150" text-anchor="middle" class="svg-accent" font-size="12">allow-gateway-transit</text>
<rect x="500" y="30" width="130" height="150" rx="8" fill="#bbf7d0"/><text x="565" y="52" text-anchor="middle" class="svg-ink" font-size="13">Spoke 10.1.0.0/16</text><text x="565" y="110" text-anchor="middle" class="svg-accent" font-size="12">use-remote-gateways</text>
<line x1="140" y1="100" x2="235" y2="100" stroke="#64748b" stroke-width="3"/><line x1="410" y1="100" x2="500" y2="100" stroke="#16a34a" stroke-width="4"/>
<text x="188" y="92" text-anchor="middle" class="svg-muted" font-size="12">{{tun}}</text><text x="455" y="92" text-anchor="middle" class="svg-muted" font-size="12">{{peer}}</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">{{n}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`Gateway transit hub and spoke`,onprem:`On-premises`,tun:`VPN / ER`,peer:`peering`,n:`One gateway in the hub serves every spoke: spokes need no gateway of their own`,cap:`Gateway transit: the spoke borrows the hub gateway to reach on-premises.`}),r=e(t,{aria:`Gateway transit hub and spoke`,onprem:`On-premises`,tun:`VPN / ER`,peer:`peering`,n:`Hub ka ek gateway har spoke ko serve karta hai: spokes ko apna gateway nahi chahiye`,cap:`Gateway transit: spoke on-premises tak pahunchne ke liye hub ka gateway udhaar leta hai.`}),i={id:`gateway-transit-and-global`,h:{en:`Gateway transit, global peering, limits and cost`,hi:`Gateway transit, global peering, limits aur cost`},body:{en:`
<h3>Why share a gateway?</h3>
<p>A VPN gateway or ExpressRoute gateway is expensive: it bills hourly and takes 30 to 45 minutes to deploy. If you have ten spoke VNets that all need to reach the on-premises network at 192.168.0.0/16, ten gateways would be wasteful. <b>Gateway transit</b> lets spokes use one gateway in a hub VNet.</p>
`+n+`
<h3>The two flags, always as a pair</h3>
<ul>
<li>On the <b>hub-to-spoke</b> link: <code>--allow-gateway-transit</code>. The hub says "you may use my gateway".</li>
<li>On the <b>spoke-to-hub</b> link: <code>--use-remote-gateways</code>. The spoke says "I will use the hub's gateway".</li>
</ul>
<pre class="code"><span class="c"># Hub side: offer the gateway</span>
az network vnet peering create -g nk-rg -n hub-to-spoke1 --vnet-name vnet-hub --remote-vnet vnet-spoke1 \\
  --allow-vnet-access --allow-gateway-transit

<span class="c"># Spoke side: use the hub gateway (the hub must already HAVE a gateway)</span>
az network vnet peering create -g nk-rg -n spoke1-to-hub --vnet-name vnet-spoke1 --remote-vnet vnet-hub \\
  --allow-vnet-access --use-remote-gateways</pre>
<p>Rules to remember: the spoke itself must <b>not</b> have its own gateway when using remote gateways; the hub gateway must exist before you enable "use remote gateways"; only one peering of a spoke can use remote gateways; and a spoke cannot use transit through another spoke (non-transitive again). On-premises sees the spoke's address space only if BGP or the configured prefixes advertise it, so check the learned routes on both sides.</p>
<pre class="out">Illustrative output: effective routes on a spoke NIC after use-remote-gateways
Source                 State   Address Prefix   Next Hop Type
Default                Active  10.1.0.0/16      VnetLocal
Default                Active  10.0.0.0/16      VNetPeering
<span class="hl">VirtualNetworkGateway  Active  192.168.0.0/16   VirtualNetworkGateway</span></pre>

<h3>Global VNet peering</h3>
<p>Peering works between VNets in the <b>same region</b> (regional) or <b>different regions</b> (global). The user experience is the same: two links, non-overlapping spaces. Differences to remember:</p>
<ul>
<li><b>Cost.</b> Both ingress and egress data on a peering are charged, and global peering costs more than regional because of inter-region data transfer (verify the current rates in your pricing calculator).</li>
<li><b>Some resources are restricted.</b> Historically, resources behind a Basic internal load balancer were not reachable across global peering, and some services have constraints (verify current limits for your service).</li>
<li><b>Latency.</b> Physical distance still applies: Central India to West Europe is not low latency.</li>
<li><b>Gateway transit</b> works across regions in many cases, but check support for your gateway SKU (verify).</li>
</ul>

<h3>Limits and design thoughts</h3>
<ul>
<li>A VNet can have a limited number of peerings (the default limit was 500, higher with Azure Virtual Network Manager; verify).</li>
<li>Peering bandwidth is bounded by the VM NIC and size, not by the peering.</li>
<li>Private IPs work; public IPs are not involved.</li>
<li>Use hub-and-spoke to centralise shared services: firewall, DNS, gateways. Use mesh only for a handful of VNets.</li>
</ul>

<h3>Peering versus VPN versus Private Link</h3>
<table class="cmp"><tr><th>Need</th><th>Best fit</th></tr>
<tr><td>Full private IP connectivity between two VNets</td><td>VNet peering</td></tr>
<tr><td>Connectivity across clouds or to on-premises</td><td>VPN gateway or ExpressRoute</td></tr>
<tr><td>Expose one service (not a whole network)</td><td>Private Link / private endpoint</td></tr>
<tr><td>Encrypt VNet-to-VNet at the IPsec layer</td><td>VNet-to-VNet VPN (extra cost)</td></tr></table>

<div class="eg"><b>Worked example.</b> Cost shape with ASSUMED rates only: regional peering 0.01 USD per GB in each direction, global 0.035 USD per GB (illustrative, verify). A job copying 500 GB from spoke-web to spoke-db regionally costs about 500 x 0.01 x 2 = 10 USD for ingress and egress sides combined. Move the same data across regions and the same assumptions give about 35 USD. Use these numbers only to compare structures, not as prices.</div>

<div class="warn"><b>Common mistakes.</b> Enabling use-remote-gateways before the hub gateway exists (the portal or CLI refuses); leaving a gateway in the spoke; forgetting that peering data transfer is billed; expecting transit from one spoke through another.</div>
<div class="exam"><b>Exam trap.</b> Gateway transit needs <b>allow gateway transit</b> on the hub link and <b>use remote gateways</b> on the spoke link. If the question says a spoke VNet "has its own VPN gateway", it cannot use remote gateways.</div>

<div class="scn"><h4>The ten gateways nobody needed</h4><p>A company had ten spoke VNets, each with its own VPN gateway to head office, costing a fortune and ten tunnels to maintain. They built a hub with one VPN gateway, peered all spokes with transit and removed the spoke gateways. Operations dropped to one tunnel and the monthly bill fell by roughly 90 percent of the gateway cost.</p><p><b>Lesson:</b> share the gateway in a hub; avoid duplicating expensive resources.</p></div>

<div class="iv"><p class="q">"How does a spoke VNet reach on-premises through a hub?"</p><p>The hub has a VPN or ExpressRoute gateway. The hub-to-spoke link enables allow gateway transit; the spoke-to-hub link enables use remote gateways. The spoke has no gateway of its own. Verify with effective routes on a spoke NIC showing the on-premises prefix with next hop VirtualNetworkGateway.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Gateway transit shares one hub gateway with spokes using two flags in a pair.</li>
<li>The spoke must not have its own gateway; the hub gateway must exist first.</li>
<li>Global peering works across regions but costs more; both directions are billed (verify).</li>
<li>Peering is for VNet-to-VNet; VPN or ExpressRoute for on-premises; Private Link for single services.</li>
<li>Check effective routes after every transit change.</li>
</ul></div>
`,hi:`
<h3>Gateway share kyun karein?</h3>
<p>VPN gateway ya ExpressRoute gateway mehnga hota hai: ghante ke hisaab se bill hota hai aur deploy hone mein 30 se 45 minute lagte hain. Agar das spoke VNets ko on-premises network 192.168.0.0/16 tak pahunchna hai, to das gateways fizool hain. <b>Gateway transit</b> spokes ko hub VNet ke ek gateway ko use karne deta hai.</p>
`+r+`
<h3>Do flags, hamesha jodi mein</h3>
<ul>
<li><b>Hub-to-spoke</b> link par: <code>--allow-gateway-transit</code>. Hub kehta hai "aap mera gateway use kar sakte ho".</li>
<li><b>Spoke-to-hub</b> link par: <code>--use-remote-gateways</code>. Spoke kehta hai "main hub ka gateway use karunga".</li>
</ul>
<pre class="code"><span class="c"># Hub side: gateway offer karo</span>
az network vnet peering create -g nk-rg -n hub-to-spoke1 --vnet-name vnet-hub --remote-vnet vnet-spoke1 \\
  --allow-vnet-access --allow-gateway-transit

<span class="c"># Spoke side: hub ka gateway use karo (hub ke paas pehle se gateway HONA chahiye)</span>
az network vnet peering create -g nk-rg -n spoke1-to-hub --vnet-name vnet-spoke1 --remote-vnet vnet-hub \\
  --allow-vnet-access --use-remote-gateways</pre>
<p>Yaad rakhne ke rules: remote gateways use karte waqt spoke ke paas khud ka gateway <b>nahi</b> hona chahiye; "use remote gateways" on karne se pehle hub gateway exist karna chahiye; spoke ki sirf ek peering remote gateways use kar sakti hai; aur spoke kisi doosre spoke ke through transit nahi kar sakta (phir non-transitive). On-premises ko spoke ka address space tabhi dikhta hai jab BGP ya configured prefixes use advertise karein, isliye dono taraf learned routes check karo.</p>
<pre class="out">Illustrative output: use-remote-gateways ke baad spoke NIC ke effective routes
Source                 State   Address Prefix   Next Hop Type
Default                Active  10.1.0.0/16      VnetLocal
Default                Active  10.0.0.0/16      VNetPeering
<span class="hl">VirtualNetworkGateway  Active  192.168.0.0/16   VirtualNetworkGateway</span></pre>

<h3>Global VNet peering</h3>
<p>Peering <b>same region</b> (regional) ya <b>alag regions</b> (global) ke VNets ke beech chalti hai. User experience same: do links, non-overlapping spaces. Yaad rakhne ke farq:</p>
<ul>
<li><b>Cost.</b> Peering par ingress aur egress dono data charge hota hai, aur inter-region data transfer ki wajah se global peering regional se mehngi hai (current rates pricing calculator mein verify karo).</li>
<li><b>Kuch resources restricted.</b> Pehle Basic internal load balancer ke peeche ke resources global peering par reachable nahi the, aur kuch services ki constraints hain (apni service ki current limits verify karo).</li>
<li><b>Latency.</b> Physical distance abhi bhi lagti hai: Central India se West Europe low latency nahi.</li>
<li><b>Gateway transit</b> kai cases mein regions ke beech chalta hai, par apne gateway SKU ka support check karo (verify).</li>
</ul>

<h3>Limits aur design soch</h3>
<ul>
<li>Ek VNet ki peerings ki limit hoti hai (default limit 500 thi, Azure Virtual Network Manager ke saath zyada; verify).</li>
<li>Peering ka bandwidth VM NIC aur size se bounded hai, peering se nahi.</li>
<li>Private IPs chalte hain; public IPs involve nahi hote.</li>
<li>Shared services (firewall, DNS, gateways) ko centralise karne ke liye hub-and-spoke use karo. Mesh sirf gine-chune VNets ke liye.</li>
</ul>

<h3>Peering versus VPN versus Private Link</h3>
<table class="cmp"><tr><th>Zaroorat</th><th>Best fit</th></tr>
<tr><td>Do VNets ke beech poori private IP connectivity</td><td>VNet peering</td></tr>
<tr><td>Clouds ke beech ya on-premises tak connectivity</td><td>VPN gateway ya ExpressRoute</td></tr>
<tr><td>Ek service expose karna (poora network nahi)</td><td>Private Link / private endpoint</td></tr>
<tr><td>VNet-to-VNet ko IPsec layer par encrypt karna</td><td>VNet-to-VNet VPN (extra cost)</td></tr></table>

<div class="eg"><b>Worked example.</b> Sirf ASSUMED rates ke saath cost shape: regional peering 0.01 USD per GB har direction mein, global 0.035 USD per GB (illustrative, verify). spoke-web se spoke-db ko regionally 500 GB copy karne wala job lagbhag 500 x 0.01 x 2 = 10 USD (ingress aur egress dono sides milakar). Wahi data regions ke beech bhejo to wahi assumptions lagbhag 35 USD dete hain. In numbers ko sirf structures compare karne ke liye use karo, prices ki tarah nahi.</div>

<div class="warn"><b>Common mistakes.</b> Hub gateway exist hone se pehle use-remote-gateways on karna (portal ya CLI refuse karta hai); spoke mein gateway chhod dena; bhoolna ki peering data transfer bill hota hai; ek spoke ke through doosre spoke se transit ki ummeed.</div>
<div class="exam"><b>Exam trap.</b> Gateway transit ke liye hub link par <b>allow gateway transit</b> aur spoke link par <b>use remote gateways</b> chahiye. Agar question kahe ki spoke VNet ka "apna VPN gateway hai", to woh remote gateways use nahi kar sakta.</div>

<div class="scn"><h4>Das gateways jinki kisi ko zaroorat nahi thi</h4><p>Ek company ke das spoke VNets the, har ek ka head office ko apna VPN gateway, bahut mehnga aur das tunnels maintain karne padte the. Unhone ek VPN gateway wala hub banaya, saare spokes ko transit ke saath peer kiya aur spoke gateways hata diye. Operations ek tunnel par aa gaye aur monthly bill mein gateway cost ka lagbhag 90 percent ghata.</p><p><b>Lesson:</b> hub mein gateway share karo; mehnge resources ko duplicate mat karo.</p></div>

<div class="iv"><p class="q">"Spoke VNet hub ke through on-premises tak kaise pahunchta hai?"</p><p>Hub ke paas VPN ya ExpressRoute gateway hota hai. Hub-to-spoke link par allow gateway transit enable hota hai; spoke-to-hub link par use remote gateways. Spoke ka apna gateway nahi hota. Spoke NIC ke effective routes mein on-premises prefix next hop VirtualNetworkGateway ke saath dikhe to verify ho gaya.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Gateway transit hub ka ek gateway spokes ke saath share karta hai, do flags ki jodi se.</li>
<li>Spoke ka apna gateway nahi hona chahiye; hub gateway pehle exist karna chahiye.</li>
<li>Global peering regions ke beech chalti hai par mehngi hai; dono directions bill hoti hain (verify).</li>
<li>Peering VNet-to-VNet ke liye; on-premises ke liye VPN ya ExpressRoute; single services ke liye Private Link.</li>
<li>Har transit change ke baad effective routes check karo.</li>
</ul></div>
`}};export{i as default};