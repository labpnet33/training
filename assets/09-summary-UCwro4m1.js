var e=`<svg viewBox="0 0 640 190" role="img" aria-label="Module summary: choose VPN or ExpressRoute, add BGP and redundancy, resolve names, verify and troubleshoot">
<rect x="15" y="20" width="140" height="60" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="85" y="46" text-anchor="middle" class="svg-ink" font-size="13">Choose</text><text x="85" y="64" text-anchor="middle" class="svg-muted" font-size="11">S2S, P2S, ER</text>
<rect x="175" y="20" width="140" height="60" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="245" y="46" text-anchor="middle" class="svg-ink" font-size="13">Build</text><text x="245" y="64" text-anchor="middle" class="svg-muted" font-size="11">gateway, LNG, circuit</text>
<rect x="335" y="20" width="140" height="60" rx="10" fill="#fed7aa" stroke="#64748b"/><text x="405" y="46" text-anchor="middle" class="svg-ink" font-size="13">Harden</text><text x="405" y="64" text-anchor="middle" class="svg-muted" font-size="11">BGP, active-active</text>
<rect x="495" y="20" width="130" height="60" rx="10" fill="#ddd6fe" stroke="#64748b"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="13">Resolve</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="11">Private Resolver</text>
<rect x="175" y="110" width="300" height="60" rx="10" fill="#fde68a" stroke="#64748b"/><text x="325" y="136" text-anchor="middle" class="svg-ink" font-size="13">Verify and troubleshoot</text><text x="325" y="154" text-anchor="middle" class="svg-muted" font-size="11">tunnel, BGP, routes, filters, DNS</text>
<g stroke="#64748b" stroke-width="2"><line x1="155" y1="50" x2="175" y2="50"/><line x1="315" y1="50" x2="335" y2="50"/><line x1="475" y1="50" x2="495" y2="50"/><line x1="325" y1="80" x2="325" y2="110"/></g>
</svg>`,t={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The module in one picture</h3>
<div class="dia">`+e+`<p class="cap">Choose the link, build it, harden it with BGP and redundancy, make names resolve, and verify layer by layer.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Compare S2S VPN, P2S VPN and ExpressRoute on cost, security, bandwidth and lead time.</li>
<li>Create a GatewaySubnet and explain why /27 or larger is wise.</li>
<li>Name the three objects of a S2S tunnel and create them with the CLI.</li>
<li>Explain route-based versus policy-based VPN, IKEv2 and the VPN Gateway SKU families.</li>
<li>Configure BGP (ASNs, peer addresses) and read peer status, learned routes and advertised routes.</li>
<li>Explain active-active gateways and why the device needs two tunnels.</li>
<li>Describe P2S tunnel types and authentication methods.</li>
<li>Describe an ExpressRoute circuit, service key, private versus Microsoft peering and the two links.</li>
<li>Design ExpressRoute with VPN failover and avoid the more-specific-prefix trap.</li>
<li>Build hybrid DNS with DNS Private Resolver: inbound, outbound, forwarding ruleset.</li>
<li>Troubleshoot with the six-rung ladder, including MTU and MSS.</li>
<li>Run the two guided labs safely and clean up the same day.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>GatewaySubnet</dt><dd>The dedicated subnet that holds VPN and ExpressRoute gateways.</dd>
<dt>Local network gateway</dt><dd>An Azure record of the on-premises VPN device: its public IP and prefixes or BGP details.</dd>
<dt>Connection</dt><dd>The object that links a gateway to a local network gateway or another gateway, with key and policy.</dd>
<dt>IKEv2 / IPsec</dt><dd>The protocols that authenticate peers and encrypt the tunnel.</dd>
<dt>ASN 65515</dt><dd>Default ASN of Azure VPN Gateway (and Route Server).</dd>
<dt>Active-active</dt><dd>Two gateway instances each with a public IP and a live tunnel.</dd>
<dt>Circuit / service key</dt><dd>The ExpressRoute order and the key that tells the provider which circuit to provision.</dd>
<dt>Private peering</dt><dd>ExpressRoute peering to VNets through the ExpressRoute gateway.</dd>
<dt>Microsoft peering</dt><dd>ExpressRoute peering to Microsoft public services.</dd>
<dt>DNS Private Resolver</dt><dd>Managed DNS forwarder with inbound and outbound endpoints.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Subnet</td><td>GatewaySubnet, /27 or larger recommended; VPN and ExpressRoute gateways can share it</td></tr>
<tr><td>VPN</td><td>Route-based, IKEv2, BGP, 30 to 45 minute deployment, hourly billing</td></tr>
<tr><td>BGP</td><td>Azure default ASN 65515; on-premises needs a different ASN</td></tr>
<tr><td>Active-active</td><td>Two public IPs and two tunnels from your device</td></tr>
<tr><td>P2S</td><td>OpenVPN, IKEv2, SSTP; Entra ID auth needs OpenVPN</td></tr>
<tr><td>ExpressRoute</td><td>Private, not encrypted by default; two links per circuit; service key; Microsoft ASN 12076</td></tr>
<tr><td>Preference</td><td>ExpressRoute over VPN for the same prefix; longest prefix always first</td></tr>
<tr><td>DNS</td><td>168.63.129.16 is not reachable from on-premises; use the Private Resolver inbound endpoint</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">az network vnet-gateway create -g RG -n GW --vnet VNET --public-ip-addresses PIP --gateway-type Vpn --vpn-type RouteBased --sku VpnGw1AZ --asn 65515 --no-wait
az network local-gateway create -g RG -n LNG --gateway-ip-address 203.0.113.20 --local-address-prefixes 192.168.0.0/16
az network vpn-connection create -g RG -n CN --vnet-gateway1 GW --local-gateway2 LNG --shared-key KEY --enable-bgp true
az network vnet-gateway list-bgp-peer-status -g RG -n GW -o table
az network vnet-gateway list-learned-routes -g RG -n GW -o table
az network express-route show -g RG -n CIRCUIT
az network nic show-effective-route-table -g RG -n NIC -o table
az group delete -n RG --yes --no-wait</pre>

<div class="exam"><p><b>Last-minute exam traps:</b> ExpressRoute is private not encrypted; Connected does not prove routes work; a more specific prefix on the VPN beats ExpressRoute; the local network gateway is a record, not a device; Entra ID P2S authentication uses OpenVPN.</p></div>

<div class="scn"><h4>Interview day, design question</h4><p>A candidate was asked to connect a head office to Azure with the least risk. They proposed ExpressRoute with two circuits in two locations as primary, a BGP VPN with active-active gateways as backup, the same prefixes advertised on both, a Private Resolver for DNS, monitoring on gateway BGP status, and a failover test. They closed with the cost of hourly gateways and circuits.</p><p><b>Lesson:</b> primary, backup, DNS, monitoring and cost: complete answers win.</p></div>

<div class="iv"><p class="q">"Give me a two-minute summary of hybrid connectivity in Azure."</p><p>S2S VPN for sites with route-based IKEv2 and BGP, active-active for resilience; P2S for users; ExpressRoute for private high-volume links with two links per circuit; VPN as backup advertising the same prefixes; Private Resolver for DNS; and a layered troubleshooting method from underlay to application.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPN is quick and cheap; ExpressRoute is private and predictable.</li>
<li>BGP and active-active give automatic, partial failover.</li>
<li>ExpressRoute plus VPN is the classic resilient design.</li>
<li>Private connectivity needs private DNS.</li>
<li>Gateways and endpoints bill hourly: clean up labs the same day.</li>
</ul></div>
`,hi:`
<h3>Module ek picture mein</h3>
<div class="dia">`+e+`<p class="cap">Link chuno, banao, BGP aur redundancy se mazboot karo, names resolve karwao, aur layer by layer verify karo.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>S2S VPN, P2S VPN aur ExpressRoute ko cost, security, bandwidth aur lead time par compare karo.</li>
<li>GatewaySubnet banao aur samjhao ki /27 ya bada kyun samajhdari hai.</li>
<li>S2S tunnel ke teen objects ke naam batao aur CLI se banao.</li>
<li>Route-based versus policy-based VPN, IKEv2 aur VPN Gateway SKU families samjhao.</li>
<li>BGP configure karo (ASNs, peer addresses) aur peer status, learned routes aur advertised routes padho.</li>
<li>Active-active gateways samjhao aur ki device ko do tunnels kyun chahiye.</li>
<li>P2S tunnel types aur authentication methods batao.</li>
<li>ExpressRoute circuit, service key, private versus Microsoft peering aur do links describe karo.</li>
<li>VPN failover ke saath ExpressRoute design karo aur more-specific-prefix trap se bacho.</li>
<li>DNS Private Resolver se hybrid DNS banao: inbound, outbound, forwarding ruleset.</li>
<li>Chhe-rung ladder se troubleshoot karo, MTU aur MSS sahit.</li>
<li>Do guided labs safely chalao aur usi din clean up karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>GatewaySubnet</dt><dd>Dedicated subnet jisme VPN aur ExpressRoute gateways rehte hain.</dd>
<dt>Local network gateway</dt><dd>On-premises VPN device ka Azure record: uska public IP aur prefixes ya BGP details.</dd>
<dt>Connection</dt><dd>Gateway ko local network gateway ya doosre gateway se jodne wala object, key aur policy ke saath.</dd>
<dt>IKEv2 / IPsec</dt><dd>Protocols jo peers ko authenticate karte hain aur tunnel encrypt karte hain.</dd>
<dt>ASN 65515</dt><dd>Azure VPN Gateway (aur Route Server) ka default ASN.</dd>
<dt>Active-active</dt><dd>Do gateway instances, har ek ka public IP aur live tunnel.</dd>
<dt>Circuit / service key</dt><dd>ExpressRoute order aur woh key jo provider ko batati hai kaunsa circuit provision karna hai.</dd>
<dt>Private peering</dt><dd>ExpressRoute gateway ke through VNets tak ExpressRoute peering.</dd>
<dt>Microsoft peering</dt><dd>Microsoft public services tak ExpressRoute peering.</dd>
<dt>DNS Private Resolver</dt><dd>Inbound aur outbound endpoints wala managed DNS forwarder.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Subnet</td><td>GatewaySubnet, /27 ya bada recommended; VPN aur ExpressRoute gateways ise share kar sakte hain</td></tr>
<tr><td>VPN</td><td>Route-based, IKEv2, BGP, 30 se 45 minute deployment, hourly billing</td></tr>
<tr><td>BGP</td><td>Azure default ASN 65515; on-premises ko alag ASN chahiye</td></tr>
<tr><td>Active-active</td><td>Do public IPs aur aapke device se do tunnels</td></tr>
<tr><td>P2S</td><td>OpenVPN, IKEv2, SSTP; Entra ID auth ko OpenVPN chahiye</td></tr>
<tr><td>ExpressRoute</td><td>Private, default mein encrypted nahi; har circuit mein do links; service key; Microsoft ASN 12076</td></tr>
<tr><td>Preference</td><td>Same prefix ke liye ExpressRoute VPN se pehle; longest prefix hamesha pehle</td></tr>
<tr><td>DNS</td><td>168.63.129.16 on-premises se reachable nahi; Private Resolver inbound endpoint use karo</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">az network vnet-gateway create -g RG -n GW --vnet VNET --public-ip-addresses PIP --gateway-type Vpn --vpn-type RouteBased --sku VpnGw1AZ --asn 65515 --no-wait
az network local-gateway create -g RG -n LNG --gateway-ip-address 203.0.113.20 --local-address-prefixes 192.168.0.0/16
az network vpn-connection create -g RG -n CN --vnet-gateway1 GW --local-gateway2 LNG --shared-key KEY --enable-bgp true
az network vnet-gateway list-bgp-peer-status -g RG -n GW -o table
az network vnet-gateway list-learned-routes -g RG -n GW -o table
az network express-route show -g RG -n CIRCUIT
az network nic show-effective-route-table -g RG -n NIC -o table
az group delete -n RG --yes --no-wait</pre>

<div class="exam"><p><b>Aakhri minute ke exam traps:</b> ExpressRoute private hai encrypted nahi; Connected se routes kaam karte hain yeh saabit nahi hota; VPN par zyada specific prefix ExpressRoute ko haraata hai; local network gateway record hai, device nahi; Entra ID P2S authentication OpenVPN use karta hai.</p></div>

<div class="scn"><h4>Interview day, design question</h4><p>Ek candidate se kam se kam risk ke saath head office ko Azure se jodne ko kaha gaya. Unhone do locations mein do circuits wala ExpressRoute primary, active-active gateways wala BGP VPN backup, dono par same prefixes advertise, DNS ke liye Private Resolver, gateway BGP status par monitoring, aur failover test suggest kiya. Aakhir mein hourly gateways aur circuits ke cost ka zikr kiya.</p><p><b>Lesson:</b> primary, backup, DNS, monitoring aur cost: poora jawab jeetta hai.</p></div>

<div class="iv"><p class="q">"Azure mein hybrid connectivity ka do minute ka summary do."</p><p>Sites ke liye route-based IKEv2 aur BGP ke saath S2S VPN, resilience ke liye active-active; users ke liye P2S; private high-volume links ke liye har circuit mein do links ke saath ExpressRoute; same prefixes advertise karne wala VPN backup; DNS ke liye Private Resolver; aur underlay se application tak layered troubleshooting method.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPN jaldi aur sasta hai; ExpressRoute private aur predictable.</li>
<li>BGP aur active-active automatic, partial failover dete hain.</li>
<li>ExpressRoute plus VPN classic resilient design hai.</li>
<li>Private connectivity ko private DNS chahiye.</li>
<li>Gateways aur endpoints hourly bill karte hain: labs usi din clean up karo.</li>
</ul></div>
`}};export{t as default};