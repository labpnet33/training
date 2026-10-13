var e=`<svg viewBox="0 0 640 290" role="img" aria-label="ExpressRoute circuit: customer edge, provider edge, Microsoft Enterprise Edge routers, private peering to the VNet gateway and Microsoft peering to Microsoft services">
<rect x="10" y="60" width="120" height="70" rx="10" fill="#e2e8f0" stroke="#64748b"/><text x="70" y="90" text-anchor="middle" class="svg-ink" font-size="12">Customer edge</text><text x="70" y="108" text-anchor="middle" class="svg-muted" font-size="10">192.168.0.0/16</text>
<rect x="170" y="40" width="130" height="110" rx="10" fill="#fed7aa" stroke="#64748b"/><text x="235" y="68" text-anchor="middle" class="svg-ink" font-size="12">Provider network</text><text x="235" y="86" text-anchor="middle" class="svg-muted" font-size="10">L2 or L3, VLANs</text><text x="235" y="104" text-anchor="middle" class="svg-muted" font-size="10">peering location</text>
<rect x="340" y="40" width="130" height="110" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="405" y="68" text-anchor="middle" class="svg-ink" font-size="12">Microsoft edge (MSEE)</text><text x="405" y="86" text-anchor="middle" class="svg-muted" font-size="10">two routers = two links</text><text x="405" y="104" text-anchor="middle" class="svg-muted" font-size="10">primary + secondary /30</text>
<rect x="510" y="30" width="125" height="50" rx="10" fill="#ddd6fe" stroke="#64748b"/><text x="572" y="52" text-anchor="middle" class="svg-ink" font-size="12">Hub VNet</text><text x="572" y="68" text-anchor="middle" class="svg-muted" font-size="10">ER gateway (private)</text>
<rect x="510" y="105" width="125" height="50" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="572" y="127" text-anchor="middle" class="svg-ink" font-size="12">Microsoft services</text><text x="572" y="143" text-anchor="middle" class="svg-muted" font-size="10">public IPs (M365...)</text>
<g stroke="#64748b" stroke-width="3"><line x1="130" y1="95" x2="170" y2="95"/><line x1="300" y1="95" x2="340" y2="95"/></g>
<g stroke="#2563eb" stroke-width="2.5"><line x1="470" y1="70" x2="510" y2="55"/><line x1="470" y1="125" x2="510" y2="130"/></g>
<text x="490" y="45" text-anchor="middle" class="svg-accent" font-size="9">private</text><text x="492" y="152" text-anchor="middle" class="svg-accent" font-size="9">Microsoft</text>
<rect x="30" y="185" width="580" height="85" rx="10" fill="#f1f5f9" stroke="#64748b"/>
<text x="320" y="208" text-anchor="middle" class="svg-ink" font-size="12">Circuit = service key + bandwidth + provider + location + SKU (Local, Standard, Premium)</text>
<text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="11">Billing model: metered data or unlimited data; circuit fee starts when the circuit is created</text>
<text x="320" y="250" text-anchor="middle" class="svg-muted" font-size="11">Redundancy: two connections on two Microsoft routers; also add a second location for site resilience</text>
</svg>`,t={id:`expressroute`,h:{en:`ExpressRoute: circuits, peerings and redundancy`,hi:`ExpressRoute: circuits, peerings aur redundancy`},body:{en:`
<h3>A private line into Microsoft</h3>
<p><b>ExpressRoute</b> is a private connection between your network and Microsoft. Traffic goes through a <b>connectivity provider</b> (a carrier or exchange) and never over the public internet. It gives more predictable latency, higher bandwidth and a service-level agreement (check the current SLA, verify before publishing). It takes weeks to arrange because a provider and a physical or virtual link are involved.</p>

<div class="dia">`+e+`<p class="cap">The path of one ExpressRoute circuit: your edge router, the provider, the Microsoft Enterprise Edge (MSEE) routers, then a peering towards the VNet gateway or Microsoft services.</p></div>

<h3>Circuit</h3>
<p>The unit you order is the <b>ExpressRoute circuit</b>. When you create it in Azure you get a <b>service key</b>, which you give to the provider. Once the provider has provisioned it, the circuit shows as <code>Provisioned</code> and you can configure peerings. You pick:</p>
<ul>
<li><b>Provider and peering location</b>, such as a metro facility. Pick a location near your site and, for resilience, a second one.</li>
<li><b>Bandwidth</b>, for example 50 Mbps up to 10 Gbps for provider circuits (verify the current list). It can be increased without recreating the circuit.</li>
<li><b>SKU tier</b>: Local (reach within the metro area, limited egress cost), Standard (all regions in the same geopolitical area) and Premium (global reach, more routes, more VNet links). Verify the current details.</li>
<li><b>Billing model</b>: metered (pay for outbound data) or unlimited. Billing for the circuit starts when you create it, not when the provider finishes (verify).</li>
</ul>
<p><b>ExpressRoute Direct</b> connects you straight to Microsoft routers at 10 or 100 Gbps ports, for very large or special needs such as MACsec encryption (verify).</p>

<h3>Peerings</h3>
<table class="cmp"><tr><th>Peering</th><th>Reaches</th><th>Addressing</th></tr>
<tr><td>Azure private peering</td><td>Your VNets (private IPs) through an ExpressRoute gateway</td><td>Two /30 subnets (primary, secondary), a VLAN ID, your ASN, MD5 optional. Private BGP.</td></tr>
<tr><td>Microsoft peering</td><td>Microsoft public services such as Microsoft 365 and public IPs of Azure PaaS</td><td>Public IPs you own, advertised and validated; use route filters or communities to select services (verify current model)</td></tr></table>
<p>Each peering is a BGP session on each of the two links. Azure's ASN for ExpressRoute is 12076. Your edge advertises 192.168.0.0/16; Microsoft advertises the VNet prefixes (10.0.0.0/16 and peered spokes if gateway transit is set).</p>
<pre class="code"><span class="c"># concept only: needs a real provider before it works (parameters: confirm with --help)</span>
az network express-route create -g rg-hub -n er-cin --bandwidth 200 --provider "Example Provider" --peering-location "Mumbai" --sku-tier Standard --sku-family MeteredData -l centralindia
az network express-route peering create -g rg-hub --circuit-name er-cin --peering-type AzurePrivatePeering --peer-asn 65010 --primary-peer-subnet 172.31.255.0/30 --secondary-peer-subnet 172.31.255.4/30 --vlan-id 100
az network vnet-gateway create -g rg-hub -n er-gw-hub --vnet hub-vnet --public-ip-addresses pip-ergw --gateway-type ExpressRoute --sku ErGw1AZ --no-wait
az network vpn-connection create -g rg-hub -n cn-er --vnet-gateway1 er-gw-hub --express-route-circuit2 er-cin <span class="c"># link the circuit to the gateway (verify)</span></pre>
<pre class="out"><span class="c">Illustrative output</span>
CircuitProvisioningState   ServiceProviderProvisioningState   Peering
Enabled                    <span class="hl">Provisioned</span>                        AzurePrivatePeering: Enabled</pre>
<p>The ExpressRoute gateway lives in the same GatewaySubnet as a VPN gateway if you want both. Gateway SKUs (Standard, High Performance, Ultra Performance and the AZ versions) set throughput and routes (verify the current names).</p>

<h3>Redundancy: do not buy one line</h3>
<ul>
<li>Every circuit has two connections, on two Microsoft routers (primary and secondary). Configure BGP on both. If you configure only one, you lose the SLA and the protection.</li>
<li>For site-level resilience, use circuits in two peering locations or through two providers.</li>
<li><b>Global Reach</b> links two of your ExpressRoute circuits so that two of your own on-premises sites can talk to each other over the Microsoft backbone (verify availability).</li>
<li><b>FastPath</b> sends traffic directly to VMs, bypassing the gateway on the data path, for higher performance (verify current limitations).</li>
<li>Keep a VPN as backup (next chapter).</li>
</ul>

<h3>Cost shape and lead time</h3>
<p>You pay for the circuit (monthly, by bandwidth and SKU), the ExpressRoute gateway (hourly), outbound data if metered, and the provider's own charges and cross-connect. Lead time depends on the provider: days to weeks. This is why we do <b>not</b> run an ExpressRoute lab on a personal account: it needs a provider and a contract.</p>
<div class="eg"><p><b>Worked example.</b> 192.168.0.0/16 reaches 10.0.0.0/16 over a 200 Mbps Standard circuit. Primary link: 172.31.255.0/30 (office .1 and Microsoft .2), secondary 172.31.255.4/30. BGP carries 192.168.0.0/16 into Azure and 10.0.0.0/16 plus 10.1.0.0/16 and 10.2.0.0/16 back. If the primary link fails, the secondary BGP session keeps the path.</p></div>

<div class="warn"><p><b>Common mistakes:</b> ordering a circuit and forgetting that billing started, configuring a single link, overlapping address space, expecting ExpressRoute to encrypt, and using Microsoft peering when private peering was needed (or the reverse).</p></div>
<div class="exam"><p><b>Exam trap:</b> private peering reaches your VNets through the ExpressRoute gateway; Microsoft peering reaches Microsoft public services. The service key goes to the provider. Both links of the circuit must be configured.</p></div>

<div class="scn"><h4>The circuit with one cable</h4><p>An ExpressRoute circuit went live and worked. Months later the provider rebooted one router for maintenance and users lost the connection to Azure for twenty minutes. The investigation found that BGP had been configured only on the primary link; the secondary was never set up, so there was no failover. After configuring the second peering and adding a VPN backup, maintenance windows stopped causing outages.</p><p><b>Lesson:</b> two links per circuit, two circuits per critical site, and a tested backup.</p></div>

<div class="iv"><p class="q">"Explain ExpressRoute private peering versus Microsoft peering."</p><p>Private peering extends your network to your VNets using private addresses through the ExpressRoute gateway. Microsoft peering reaches Microsoft public services with your public IPs. Both run BGP over two /30 links on a circuit identified by a service key. Add that ExpressRoute is private but not encrypted by default.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Circuit = provider + location + bandwidth + SKU, activated with a service key.</li>
<li>Private peering reaches VNets; Microsoft peering reaches Microsoft public services.</li>
<li>Always configure both links (two /30s, BGP on each).</li>
<li>Resilience: two locations or providers, Global Reach and a VPN backup.</li>
<li>Billing starts at circuit creation; labs need a provider, so we only study it.</li>
</ul></div>
`,hi:`
<h3>Microsoft tak private line</h3>
<p><b>ExpressRoute</b> aapke network aur Microsoft ke beech private connection hai. Traffic ek <b>connectivity provider</b> (carrier ya exchange) se guzarta hai aur public internet par kabhi nahi jaata. Yeh zyada predictable latency, zyada bandwidth aur service-level agreement deta hai (current SLA check karo, publish se pehle verify karo). Ise arrange karne mein hafte lagte hain kyunki provider aur physical ya virtual link shamil hain.</p>

<div class="dia">`+e+`<p class="cap">Ek ExpressRoute circuit ka path: aapka edge router, provider, Microsoft Enterprise Edge (MSEE) routers, phir VNet gateway ya Microsoft services ki taraf peering.</p></div>

<h3>Circuit</h3>
<p>Jo unit aap order karte ho woh <b>ExpressRoute circuit</b> hai. Azure mein banane par aapko ek <b>service key</b> milti hai, jo aap provider ko dete ho. Provider provision kar de to circuit <code>Provisioned</code> dikhta hai aur aap peerings configure kar sakte ho. Aap chunte ho:</p>
<ul>
<li><b>Provider aur peering location</b>, jaise koi metro facility. Apni site ke paas wali location chuno aur resilience ke liye doosri bhi.</li>
<li><b>Bandwidth</b>, jaise provider circuits ke liye 50 Mbps se 10 Gbps tak (current list verify karo). Circuit dobara banaye bina badhayi ja sakti hai.</li>
<li><b>SKU tier</b>: Local (metro area ke andar reach, limited egress cost), Standard (same geopolitical area ke sab regions) aur Premium (global reach, zyada routes, zyada VNet links). Current details verify karo.</li>
<li><b>Billing model</b>: metered (outbound data ka paisa) ya unlimited. Circuit ki billing banate hi shuru hoti hai, provider ke khatam karne par nahi (verify).</li>
</ul>
<p><b>ExpressRoute Direct</b> aapko 10 ya 100 Gbps ports par seedha Microsoft routers se jodta hai, bahut bade ya khaas needs ke liye jaise MACsec encryption (verify).</p>

<h3>Peerings</h3>
<table class="cmp"><tr><th>Peering</th><th>Kya reach hota hai</th><th>Addressing</th></tr>
<tr><td>Azure private peering</td><td>Aapke VNets (private IPs), ExpressRoute gateway ke through</td><td>Do /30 subnets (primary, secondary), ek VLAN ID, aapka ASN, MD5 optional. Private BGP.</td></tr>
<tr><td>Microsoft peering</td><td>Microsoft public services jaise Microsoft 365 aur Azure PaaS ke public IPs</td><td>Aapke apne public IPs, advertise aur validate; services chunne ke liye route filters ya communities (current model verify karo)</td></tr></table>
<p>Har peering har do links par ek BGP session hai. ExpressRoute ke liye Microsoft ka ASN 12076 hai. Aapka edge 192.168.0.0/16 advertise karta hai; Microsoft VNet prefixes (10.0.0.0/16 aur gateway transit set ho to peered spokes) advertise karta hai.</p>
<pre class="code"><span class="c"># sirf concept: asli provider ke bina kaam nahi karega (parameters: --help se confirm karo)</span>
az network express-route create -g rg-hub -n er-cin --bandwidth 200 --provider "Example Provider" --peering-location "Mumbai" --sku-tier Standard --sku-family MeteredData -l centralindia
az network express-route peering create -g rg-hub --circuit-name er-cin --peering-type AzurePrivatePeering --peer-asn 65010 --primary-peer-subnet 172.31.255.0/30 --secondary-peer-subnet 172.31.255.4/30 --vlan-id 100
az network vnet-gateway create -g rg-hub -n er-gw-hub --vnet hub-vnet --public-ip-addresses pip-ergw --gateway-type ExpressRoute --sku ErGw1AZ --no-wait
az network vpn-connection create -g rg-hub -n cn-er --vnet-gateway1 er-gw-hub --express-route-circuit2 er-cin <span class="c"># circuit ko gateway se link karo (verify)</span></pre>
<pre class="out"><span class="c">Illustrative output</span>
CircuitProvisioningState   ServiceProviderProvisioningState   Peering
Enabled                    <span class="hl">Provisioned</span>                        AzurePrivatePeering: Enabled</pre>
<p>Dono chahiye ho to ExpressRoute gateway VPN gateway wale hi GatewaySubnet mein rehta hai. Gateway SKUs (Standard, High Performance, Ultra Performance aur AZ versions) throughput aur routes set karte hain (current names verify karo).</p>

<h3>Redundancy: ek line mat kharido</h3>
<ul>
<li>Har circuit mein do connections hote hain, do Microsoft routers par (primary aur secondary). Dono par BGP configure karo. Sirf ek configure karoge to SLA aur protection dono khoyoge.</li>
<li>Site-level resilience ke liye do peering locations ya do providers ke circuits use karo.</li>
<li><b>Global Reach</b> aapke do ExpressRoute circuits ko jodta hai taaki aapki do on-premises sites Microsoft backbone par ek doosre se baat kar sakein (availability verify karo).</li>
<li><b>FastPath</b> data path par gateway ko bypass karke traffic seedha VMs ko bhejta hai, zyada performance ke liye (current limitations verify karo).</li>
<li>VPN ko backup ke taur par rakho (agle chapter mein).</li>
</ul>

<h3>Cost shape aur lead time</h3>
<p>Aap circuit ka (monthly, bandwidth aur SKU ke hisaab se), ExpressRoute gateway ka (hourly), metered ho to outbound data ka, aur provider ke apne charges aur cross-connect ka paisa dete ho. Lead time provider par depend karta hai: din se hafte. Isiliye hum personal account par ExpressRoute lab <b>nahi</b> chalate: ise provider aur contract chahiye.</p>
<div class="eg"><p><b>Worked example.</b> 192.168.0.0/16 200 Mbps Standard circuit par 10.0.0.0/16 tak pahunchta hai. Primary link: 172.31.255.0/30 (office .1 aur Microsoft .2), secondary 172.31.255.4/30. BGP 192.168.0.0/16 ko Azure mein aur 10.0.0.0/16 plus 10.1.0.0/16 aur 10.2.0.0/16 ko wapas le jaata hai. Primary link fail ho to secondary BGP session path bachaye rakhta hai.</p></div>

<div class="warn"><p><b>Common mistakes:</b> circuit order karke bhool jaana ki billing shuru ho gayi, ek hi link configure karna, overlapping address space, ExpressRoute se encryption ki ummeed, aur private peering ki jagah Microsoft peering (ya ulta) use karna.</p></div>
<div class="exam"><p><b>Exam trap:</b> private peering ExpressRoute gateway ke through aapke VNets tak pahunchti hai; Microsoft peering Microsoft public services tak. Service key provider ko jaati hai. Circuit ke dono links configure hone chahiye.</p></div>

<div class="scn"><h4>Ek cable wala circuit</h4><p>Ek ExpressRoute circuit live hua aur chala. Mahino baad provider ne maintenance ke liye ek router reboot kiya aur users ka Azure se connection bees minute ke liye toot gaya. Jaanch mein pata chala ki BGP sirf primary link par configure thi; secondary kabhi set hi nahi hui thi, isliye failover nahi tha. Doosri peering configure karne aur VPN backup jodne ke baad maintenance windows outage nahi banate.</p><p><b>Lesson:</b> har circuit mein do links, har critical site ke liye do circuits, aur tested backup.</p></div>

<div class="iv"><p class="q">"ExpressRoute private peering aur Microsoft peering samjhao."</p><p>Private peering aapke network ko private addresses se VNets tak ExpressRoute gateway ke through badhati hai. Microsoft peering aapke public IPs se Microsoft public services tak pahunchti hai. Dono service key se pehchaane gaye circuit par do /30 links par BGP chalate hain. Jodo ki ExpressRoute private hai par default mein encrypted nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Circuit = provider + location + bandwidth + SKU, service key se activate.</li>
<li>Private peering VNets tak; Microsoft peering Microsoft public services tak.</li>
<li>Hamesha dono links configure karo (do /30, har par BGP).</li>
<li>Resilience: do locations ya providers, Global Reach aur VPN backup.</li>
<li>Billing circuit banate hi shuru; labs ko provider chahiye, isliye hum sirf padhte hain.</li>
</ul></div>
`}};export{t as default};