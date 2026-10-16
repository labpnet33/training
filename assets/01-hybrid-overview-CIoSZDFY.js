var e=`<svg viewBox="0 0 640 280" role="img" aria-label="Three ways to connect on-premises to Azure: site-to-site VPN over the internet, point-to-site VPN for users, ExpressRoute through a provider">
<rect x="20" y="95" width="150" height="90" rx="10" fill="#e2e8f0" stroke="#64748b"/><text x="95" y="125" text-anchor="middle" class="svg-ink" font-size="13">On-premises</text><text x="95" y="145" text-anchor="middle" class="svg-muted" font-size="11">192.168.0.0/16</text><text x="95" y="163" text-anchor="middle" class="svg-muted" font-size="11">edge router / firewall</text>
<rect x="470" y="75" width="150" height="130" rx="10" fill="#ddd6fe" stroke="#64748b"/><text x="545" y="100" text-anchor="middle" class="svg-ink" font-size="13">Azure hub VNet</text><text x="545" y="118" text-anchor="middle" class="svg-muted" font-size="11">10.0.0.0/16</text>
<rect x="485" y="135" width="120" height="30" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="545" y="155" text-anchor="middle" class="svg-ink" font-size="11">GatewaySubnet</text>
<rect x="485" y="170" width="120" height="26" rx="6" fill="#fde68a" stroke="#64748b"/><text x="545" y="188" text-anchor="middle" class="svg-ink" font-size="11">shared services</text>
<rect x="250" y="20" width="130" height="40" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="315" y="45" text-anchor="middle" class="svg-ink" font-size="12">Internet (IPsec)</text>
<rect x="250" y="200" width="130" height="40" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="315" y="225" text-anchor="middle" class="svg-ink" font-size="12">Provider network</text>
<g stroke="#64748b" stroke-width="2" fill="none"><path d="M170 120 L250 40"/><path d="M380 40 L485 140"/><path d="M170 165 L250 220"/><path d="M380 220 L485 160"/></g>
<text x="210" y="70" text-anchor="middle" class="svg-accent" font-size="11">S2S VPN</text><text x="210" y="205" text-anchor="middle" class="svg-accent" font-size="11">ExpressRoute</text>
<rect x="250" y="105" width="130" height="40" rx="8" fill="#bae6fd" stroke="#64748b" stroke-dasharray="5 4"/><text x="315" y="130" text-anchor="middle" class="svg-ink" font-size="11">Laptop: P2S VPN</text>
<line x1="380" y1="125" x2="485" y2="148" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="268" text-anchor="middle" class="svg-muted" font-size="11">All three can terminate on the same GatewaySubnet in the hub</text>
</svg>`,t={id:`hybrid-overview`,h:{en:`Hybrid connectivity: the options and how to choose`,hi:`Hybrid connectivity: options aur kaise chunein`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>What you will learn</h3>
<ul>
<li>The three ways to join an on-premises network to Azure: site-to-site VPN, point-to-site VPN and ExpressRoute.</li>
<li>How to choose between them on cost, security, bandwidth, latency and lead time.</li>
<li>What the GatewaySubnet is and what lives in it.</li>
<li>How this module continues: VPN Gateway and BGP, ExpressRoute, failover and DNS, two guided labs and a troubleshooting workflow.</li>
</ul>
<p><b>Prerequisites:</b> VNets, subnets and routes, basics of IPsec and BGP, and the hub-and-spoke module before this one. We keep using the hub 10.0.0.0/16 and an office at 192.168.0.0/16.</p>

<h3>The road and the private railway</h3>
<p>Imagine two cities that need to move goods. They can use the public highway with sealed, locked trucks (cheap, quick to start, but traffic and weather affect the journey): that is a <b>VPN</b> over the internet. Or they can lease a private railway line from a rail operator (stable, predictable, takes weeks to build, costs more): that is <b>ExpressRoute</b>. A lone traveller who needs a locked car to reach the city is a <b>point-to-site</b> user.</p>
<div class="dia">`+e+`<p class="cap">Three connection types between the office and the hub VNet. Each terminates on a virtual network gateway in the hub's GatewaySubnet.</p></div>

<h3>The three options</h3>
<table class="cmp"><tr><th>Option</th><th>Path</th><th>Best for</th><th>Watch out for</th></tr>
<tr><td>Site-to-site (S2S) VPN</td><td>IPsec/IKE tunnel over the public internet between an on-premises VPN device and an Azure VPN Gateway</td><td>Offices, branch sites, backup path, quick start</td><td>Internet variability, per-tunnel throughput limits</td></tr>
<tr><td>Point-to-site (P2S) VPN</td><td>A client (laptop) connects to the VPN Gateway</td><td>Remote users and admins</td><td>Client management; not for site traffic</td></tr>
<tr><td>ExpressRoute</td><td>Private circuit through a connectivity provider, no public internet</td><td>Large, steady, latency-sensitive or regulated traffic</td><td>Lead time, monthly fees, provider dependency; not encrypted by default</td></tr></table>
<p>"Not encrypted by default" matters for exams: ExpressRoute is private, not encrypted. If your policy requires encryption, add MACsec (on ExpressRoute Direct) or run IPsec over the circuit (verify the options before publishing).</p>

<h3>Choosing: a quick decision table</h3>
<ul>
<li>One small office, low volume, need it this week: S2S VPN.</li>
<li>Mission-critical or high volume, predictable latency, or compliance wants no public internet: ExpressRoute, with a VPN as backup.</li>
<li>People working from home: P2S VPN.</li>
<li>Many branches across regions: Virtual WAN (covered earlier) with VPN and ExpressRoute attached to hubs.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Office 192.168.0.0/16 must reach hub 10.0.0.0/16 (and through it spoke1 10.1.0.0/16 and spoke2 10.2.0.0/16). Start with a S2S VPN: one VPN Gateway in the hub, one local network gateway describing the office, and one connection. The routes appear as soon as the tunnel is up; no peering changes are needed except gateway transit and use remote gateways on the spokes.</p></div>

<h3>The GatewaySubnet</h3>
<p>A virtual network gateway (VPN or ExpressRoute) lives in a subnet named exactly <code>GatewaySubnet</code>. Use /27 or larger so that you can add active-active or coexisting gateways later. Do not put VMs in it and, as a rule, do not attach an NSG to it (verify the current guidance before publishing). A VNet has one VPN gateway and one ExpressRoute gateway at most, and both can share the GatewaySubnet.</p>
<pre class="code">az network vnet subnet create -g rg-hub --vnet-name hub-vnet -n GatewaySubnet --address-prefixes 10.0.2.0/27</pre>

<h3>Planning checklist</h3>
<ol>
<li>No overlapping address space between Azure VNets and on-premises (RFC1918 ranges collide easily).</li>
<li>Pick route-based VPN with BGP unless your device only supports static policy-based.</li>
<li>Decide the resilience level: single tunnel, active-active, plus VPN as backup to ExpressRoute.</li>
<li>Plan DNS for names across the link (covered in this module).</li>
<li>Estimate cost: gateways bill per hour whether or not they carry traffic (verify the pricing structure).</li>
</ol>

<div class="warn"><p><b>Common mistakes:</b> overlapping 192.168.x.x ranges between a home lab and Azure, undersized GatewaySubnet, and assuming ExpressRoute is encrypted.</p></div>
<div class="exam"><p><b>Exam trap:</b> ExpressRoute does not traverse the public internet, but it does not encrypt your data on its own. Also, S2S is for sites, P2S is for individual clients.</p></div>

<div class="scn"><h4>The branch that outgrew its VPN</h4><p>A logistics firm connected its warehouse to Azure with a S2S VPN. Months later nightly database copies crawled and sometimes failed when the internet was busy. The team kept the VPN as a backup and ordered an ExpressRoute circuit through a provider. After the circuit went live, copy jobs finished in a third of the time with stable latency, and the VPN took over automatically during a provider outage.</p><p><b>Lesson:</b> start with VPN, graduate to ExpressRoute when volume or predictability demands it, keep VPN as backup.</p></div>

<div class="iv"><p class="q">"VPN or ExpressRoute: how do you decide?"</p><p>Compare volume, latency sensitivity, compliance, cost and lead time. VPN is quick, cheap and encrypted over the internet; ExpressRoute is private, predictable and high bandwidth but takes time and money, and is not encrypted by default. Many designs use both: ExpressRoute primary, VPN backup.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>S2S VPN for sites, P2S for users, ExpressRoute for private high-volume links.</li>
<li>Gateways live in GatewaySubnet (/27 or larger).</li>
<li>ExpressRoute is private, not encrypted by default.</li>
<li>Avoid overlapping address space with on-premises.</li>
<li>VPN is also the natural backup for ExpressRoute.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>Aap kya seekhoge</h3>
<ul>
<li>On-premises network ko Azure se jodne ke teen tareeke: site-to-site VPN, point-to-site VPN aur ExpressRoute.</li>
<li>Cost, security, bandwidth, latency aur lead time par inme se kaise chunein.</li>
<li>GatewaySubnet kya hai aur usme kya rehta hai.</li>
<li>Yeh module aage kaise chalta hai: VPN Gateway aur BGP, ExpressRoute, failover aur DNS, do guided labs aur troubleshooting workflow.</li>
</ul>
<p><b>Prerequisites:</b> VNets, subnets aur routes, IPsec aur BGP ki basics, aur is se pehle hub-and-spoke module. Hum hub 10.0.0.0/16 aur office 192.168.0.0/16 use karte rahenge.</p>

<h3>Sadak aur private railway</h3>
<p>Do shehar ko saaman bhejna hai. Woh public highway par sealed, locked trucks use kar sakte hain (sasta, jaldi shuru, par traffic aur mausam asar daalte hain): yeh internet par <b>VPN</b> hai. Ya woh rail operator se private railway line lease kar sakte hain (stable, predictable, banne mein hafte lagte hain, mehengi): yeh <b>ExpressRoute</b> hai. Akela musafir jise shehar pahunchne ke liye locked car chahiye woh <b>point-to-site</b> user hai.</p>
<div class="dia">`+e+`<p class="cap">Office aur hub VNet ke beech teen connection types. Har ek hub ke GatewaySubnet mein virtual network gateway par terminate hota hai.</p></div>

<h3>Teen options</h3>
<table class="cmp"><tr><th>Option</th><th>Path</th><th>Kiske liye best</th><th>Dhyan rakho</th></tr>
<tr><td>Site-to-site (S2S) VPN</td><td>On-premises VPN device aur Azure VPN Gateway ke beech public internet par IPsec/IKE tunnel</td><td>Offices, branch sites, backup path, jaldi shuru</td><td>Internet variability, per-tunnel throughput limits</td></tr>
<tr><td>Point-to-site (P2S) VPN</td><td>Ek client (laptop) VPN Gateway se connect hota hai</td><td>Remote users aur admins</td><td>Client management; site traffic ke liye nahi</td></tr>
<tr><td>ExpressRoute</td><td>Connectivity provider ke through private circuit, public internet nahi</td><td>Bada, steady, latency-sensitive ya regulated traffic</td><td>Lead time, monthly fees, provider dependency; default mein encrypted nahi</td></tr></table>
<p>"Default mein encrypted nahi" exams ke liye important hai: ExpressRoute private hai, encrypted nahi. Policy encryption maange to MACsec (ExpressRoute Direct par) jodo ya circuit par IPsec chalao (publish se pehle options verify karo).</p>

<h3>Chunna: quick decision table</h3>
<ul>
<li>Ek chhota office, kam volume, isi hafte chahiye: S2S VPN.</li>
<li>Mission-critical ya high volume, predictable latency, ya compliance public internet nahi chahti: ExpressRoute, VPN backup ke saath.</li>
<li>Ghar se kaam karne wale log: P2S VPN.</li>
<li>Kai regions mein kai branches: Virtual WAN (pehle cover kiya) jisme hubs se VPN aur ExpressRoute jude hon.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Office 192.168.0.0/16 ko hub 10.0.0.0/16 (aur uske through spoke1 10.1.0.0/16 aur spoke2 10.2.0.0/16) tak pahunchna hai. S2S VPN se shuru karo: hub mein ek VPN Gateway, office ko describe karne wala ek local network gateway, aur ek connection. Tunnel up hote hi routes aa jaate hain; spokes par gateway transit aur use remote gateways ke alawa peering mein badlav nahi chahiye.</p></div>

<h3>GatewaySubnet</h3>
<p>Virtual network gateway (VPN ya ExpressRoute) bilkul <code>GatewaySubnet</code> naam ke subnet mein rehta hai. /27 ya bada use karo taaki baad mein active-active ya coexisting gateways jod sako. Usme VMs mat rakho aur aam taur par NSG attach mat karo (publish se pehle current guidance verify karo). Ek VNet mein zyada se zyada ek VPN gateway aur ek ExpressRoute gateway hota hai, aur dono ek hi GatewaySubnet share kar sakte hain.</p>
<pre class="code">az network vnet subnet create -g rg-hub --vnet-name hub-vnet -n GatewaySubnet --address-prefixes 10.0.2.0/27</pre>

<h3>Planning checklist</h3>
<ol>
<li>Azure VNets aur on-premises ke beech address space overlap nahi (RFC1918 ranges aasani se takrate hain).</li>
<li>Route-based VPN with BGP chuno, jab tak aapka device sirf static policy-based support na kare.</li>
<li>Resilience level decide karo: single tunnel, active-active, ExpressRoute ke backup ke taur par VPN.</li>
<li>Link ke paar names ke liye DNS plan karo (is module mein cover hai).</li>
<li>Cost estimate karo: gateways traffic ho ya na ho hourly bill karte hain (pricing structure verify karo).</li>
</ol>

<div class="warn"><p><b>Common mistakes:</b> home lab aur Azure ke beech overlapping 192.168.x.x ranges, chhota GatewaySubnet, aur ExpressRoute ko encrypted maan lena.</p></div>
<div class="exam"><p><b>Exam trap:</b> ExpressRoute public internet se nahi guzarta, par apne aap data encrypt bhi nahi karta. Aur S2S sites ke liye hai, P2S individual clients ke liye.</p></div>

<div class="scn"><h4>Branch jo apne VPN se bada ho gaya</h4><p>Ek logistics firm ne warehouse ko S2S VPN se Azure se joda. Mahino baad nightly database copies dheeri ho gayi aur internet busy hone par kabhi fail bhi hui. Team ne VPN backup ke taur par rakha aur provider se ExpressRoute circuit mangwaya. Circuit live hone ke baad copy jobs ek tihai samay mein stable latency ke saath khatam hone lagi, aur provider outage mein VPN ne apne aap kaam sambhal liya.</p><p><b>Lesson:</b> VPN se shuru karo, volume ya predictability maange to ExpressRoute par jao, VPN backup rakho.</p></div>

<div class="iv"><p class="q">"VPN ya ExpressRoute: kaise decide karte ho?"</p><p>Volume, latency sensitivity, compliance, cost aur lead time compare karo. VPN jaldi, sasta aur internet par encrypted hai; ExpressRoute private, predictable aur high bandwidth hai par time aur paise leta hai, aur default mein encrypted nahi. Kai designs dono use karte hain: ExpressRoute primary, VPN backup.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sites ke liye S2S VPN, users ke liye P2S, private high-volume links ke liye ExpressRoute.</li>
<li>Gateways GatewaySubnet (/27 ya bada) mein rehte hain.</li>
<li>ExpressRoute private hai, default mein encrypted nahi.</li>
<li>On-premises ke saath overlapping address space se bacho.</li>
<li>VPN ExpressRoute ka natural backup bhi hai.</li>
</ul></div>
`}};export{t as default};