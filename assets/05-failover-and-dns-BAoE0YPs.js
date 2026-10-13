var e=`<svg viewBox="0 0 640 290" role="img" aria-label="ExpressRoute primary with VPN backup, and DNS Private Resolver with inbound and outbound endpoints between Azure and on-premises DNS">
<rect x="15" y="20" width="610" height="115" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="30" y="40" class="svg-accent" font-size="12">A. ExpressRoute primary, VPN backup</text>
<rect x="30" y="55" width="120" height="60" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="90" y="82" text-anchor="middle" class="svg-ink" font-size="12">Office</text><text x="90" y="100" text-anchor="middle" class="svg-muted" font-size="10">192.168.0.0/16</text>
<rect x="490" y="55" width="120" height="60" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="550" y="82" text-anchor="middle" class="svg-ink" font-size="12">Hub GatewaySubnet</text><text x="550" y="100" text-anchor="middle" class="svg-muted" font-size="10">ER GW + VPN GW</text>
<line x1="150" y1="75" x2="490" y2="75" stroke="#16a34a" stroke-width="4"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="11">ExpressRoute: preferred (same prefix)</text>
<line x1="150" y1="98" x2="490" y2="98" stroke="#64748b" stroke-width="3" stroke-dasharray="7 5"/><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="11">VPN over the internet: takes over if ER fails</text>
<rect x="15" y="150" width="610" height="130" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="30" y="170" class="svg-accent" font-size="12">B. DNS Private Resolver in the hub</text>
<rect x="30" y="185" width="140" height="75" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="100" y="208" text-anchor="middle" class="svg-ink" font-size="12">On-prem DNS</text><text x="100" y="226" text-anchor="middle" class="svg-muted" font-size="10">192.168.1.53</text><text x="100" y="242" text-anchor="middle" class="svg-muted" font-size="10">corp.example</text>
<rect x="230" y="185" width="180" height="75" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="12">DNS Private Resolver</text><text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="10">inbound 10.0.7.4 (dns-in)</text><text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="10">outbound 10.0.8.0/28 (dns-out)</text>
<rect x="470" y="185" width="140" height="75" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="540" y="208" text-anchor="middle" class="svg-ink" font-size="12">Private DNS zone</text><text x="540" y="226" text-anchor="middle" class="svg-muted" font-size="10">azure.example</text><text x="540" y="242" text-anchor="middle" class="svg-muted" font-size="10">linked to hub VNet</text>
<g stroke="#2563eb" stroke-width="2.5"><line x1="170" y1="215" x2="230" y2="215"/><line x1="410" y1="215" x2="470" y2="215"/></g>
</svg>`,t={id:`failover-and-dns`,h:{en:`ExpressRoute plus VPN failover, and DNS Private Resolver`,hi:`ExpressRoute plus VPN failover, aur DNS Private Resolver`},body:{en:`
<h3>Two problems left after the link is up</h3>
<p>You can now build a tunnel or a circuit. Two practical issues remain. First: what happens when the main link fails? Second: how do names resolve across the link, so that a server in Azure can look up <code>files.corp.example</code> on-premises and an on-premises PC can find a private endpoint in Azure? This chapter answers both.</p>

<div class="dia">`+e+`<p class="cap">A: ExpressRoute with VPN as the standby path. B: DNS Private Resolver with an inbound endpoint (on-premises asks Azure) and an outbound endpoint (Azure asks on-premises).</p></div>

<h3>Part A: ExpressRoute with VPN failover</h3>
<p>You can deploy an ExpressRoute gateway and a VPN gateway in the same VNet and the same GatewaySubnet. This is called <b>coexistence</b>. When both advertise the same prefix, Azure prefers the ExpressRoute path, so the VPN is idle until ExpressRoute fails. Then BGP withdraws the ExpressRoute routes and traffic uses the VPN automatically. When ExpressRoute recovers, traffic returns.</p>
<ul>
<li>Use a GatewaySubnet of /27 or larger so both gateways fit.</li>
<li>Run BGP on the VPN so that routes shift by themselves. A static VPN will not fail back cleanly.</li>
<li>Advertise <b>the same prefixes</b> over both paths. If the VPN advertises more specific prefixes, it will win by longest prefix match and traffic will use the VPN even though ExpressRoute is healthy. Check with effective routes.</li>
<li>Expect the backup path to have lower bandwidth and higher latency. Size the VPN SKU for the traffic you must keep alive, and decide which workloads degrade gracefully.</li>
<li><b>Test the failover</b> on a quiet day, and document the result.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Office 192.168.0.0/16 is advertised over ExpressRoute (200 Mbps) and over VPN (BGP, AS path longer through the VPN). Azure's effective route for 192.168.0.0/16 is next hop <code>VirtualNetworkGateway</code> via ExpressRoute. A router at the provider fails; BGP hold timers expire, and the same prefix now comes only from the VPN. Traffic continues at VPN speed. The on-call engineer sees this in gateway BGP peer status and an alert.</p></div>
<pre class="code">az network vnet-gateway list-learned-routes -g rg-hub -n er-gw-hub -o table
az network vnet-gateway list-learned-routes -g rg-hub -n vpn-gw-hub -o table</pre>

<h3>Part B: DNS across the link</h3>
<p>Azure gives every VNet a built-in resolver at <code>168.63.129.16</code>. It resolves Azure names and linked <b>Private DNS zones</b>, but it cannot be queried from on-premises, and by default it knows nothing about <code>corp.example</code>. Before, teams ran DNS servers on VMs to bridge the gap. <b>Azure DNS Private Resolver</b> is the managed replacement. It has two endpoints:</p>
<dl class="terms">
<dt>Inbound endpoint</dt><dd>A private IP in a subnet of your VNet (for example 10.0.7.4) that on-premises DNS can forward queries to. The query is answered with Azure DNS knowledge, including Private DNS zones linked to that VNet.</dd>
<dt>Outbound endpoint</dt><dd>A subnet that sends queries from Azure to other DNS servers. You attach a <b>DNS forwarding ruleset</b> with rules such as "corp.example forwards to 192.168.1.53".</dd>
<dt>Forwarding ruleset</dt><dd>Rules by domain name and target DNS servers, linked to the VNets that should use them (hub and spokes). Linked VNets follow the rules without custom DNS settings on each VNet.</dd>
</dl>
<p>Each endpoint needs its own dedicated subnet <b>delegated</b> to <code>Microsoft.Network/dnsResolvers</code>, at least /28 (verify the current minimum before publishing).</p>
<pre class="code"><span class="c"># concept (the dns-resolver extension may be required; confirm parameters with --help)</span>
az dns-resolver create -g rg-hub -n dnspr-hub --id <span class="c">&lt;hub-vnet-id&gt;</span> -l centralindia
az dns-resolver inbound-endpoint create -g rg-hub --dns-resolver-name dnspr-hub -n dns-in -l centralindia --ip-configurations "[{private-ip-allocation-method:Dynamic,id:<span class="c">&lt;inbound-subnet-id&gt;</span>}]"
az dns-resolver outbound-endpoint create -g rg-hub --dns-resolver-name dnspr-hub -n dns-out -l centralindia --id <span class="c">&lt;outbound-subnet-id&gt;</span>
az dns-resolver forwarding-ruleset create -g rg-hub -n frs-hub -l centralindia --outbound-endpoints "[{id:<span class="c">&lt;dns-out-id&gt;</span>}]"
az dns-resolver forwarding-rule create -g rg-hub --ruleset-name frs-hub -n corp --domain-name "corp.example." --forwarding-rule-state Enabled --target-dns-servers "[{ip-address:192.168.1.53,port:53}]"</pre>
<p>Then set the on-premises DNS to conditionally forward <code>azure.example</code> (or privatelink zones) to the inbound endpoint IP, over the VPN or ExpressRoute.</p>
<pre class="out"><span class="c">Illustrative output (from a VM in a linked spoke)</span>
$ nslookup files.corp.example
Server:   168.63.129.16
Name:     files.corp.example
Address:  <span class="hl">192.168.1.20</span></pre>

<h3>Private endpoints and DNS</h3>
<p>A private endpoint for a storage account is reached by a name like <code>mystore.privatelink.blob.core.windows.net</code>. The matching <b>Private DNS zone</b> must exist, be linked to the VNet, and on-premises clients must resolve through the inbound endpoint to get the private IP. If a client gets the public IP instead, it will either fail (public access disabled) or go over the internet. Most hybrid DNS tickets are this.</p>

<div class="warn"><p><b>Common mistakes:</b> forgetting to link the Private DNS zone, pointing on-premises DNS at 168.63.129.16 (which is not reachable from outside), a VPN that advertises more specific prefixes than ExpressRoute, and subnets that are not delegated.</p></div>
<div class="exam"><p><b>Exam trap:</b> 168.63.129.16 is the Azure-provided resolver and is only reachable from inside a VNet; on-premises must query the Private Resolver inbound endpoint. Also: ExpressRoute is preferred over VPN for the same prefix; a more specific VPN prefix beats it.</p></div>

<div class="scn"><h4>The storage account that resolved to a public IP</h4><p>After a storage private endpoint was created, on-premises users still reached the public address and were blocked. The Private DNS zone existed but on-premises DNS forwarded to a legacy resolver that did not know it. The team deployed a Private Resolver, linked the zone to the hub, and forwarded the privatelink zone from on-premises DNS to the inbound endpoint. The name then resolved to 10.0.3.50 and the traffic used the VPN.</p><p><b>Lesson:</b> private connectivity needs private name resolution too.</p></div>

<div class="iv"><p class="q">"How do you do DNS between on-premises and Azure without DNS VMs?"</p><p>Azure DNS Private Resolver in the hub: an inbound endpoint that on-premises DNS forwards to, and an outbound endpoint with a forwarding ruleset that sends corp.example to on-premises DNS. Private DNS zones are linked to the VNets. Mention delegated subnets and that 168.63.129.16 is not reachable from on-premises.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ExpressRoute plus VPN coexist; same prefix means ExpressRoute wins, VPN backs up.</li>
<li>Use BGP on the VPN and advertise the same prefixes; test the failover.</li>
<li>Private Resolver replaces DNS VMs: inbound for on-premises to Azure, outbound for Azure to on-premises.</li>
<li>Endpoints need delegated subnets (Microsoft.Network/dnsResolvers).</li>
<li>Private endpoints work only with matching, linked private DNS zones.</li>
</ul></div>
`,hi:`
<h3>Link up hone ke baad do problems</h3>
<p>Ab aap tunnel ya circuit bana sakte ho. Do practical issues bache hain. Pehla: main link fail ho to kya hota hai? Doosra: link ke paar names kaise resolve hote hain, taaki Azure ka server on-premises <code>files.corp.example</code> look up kar sake aur on-premises PC Azure ka private endpoint dhundh sake? Yeh chapter dono ka jawab deta hai.</p>

<div class="dia">`+e+`<p class="cap">A: ExpressRoute, VPN standby path ke taur par. B: Inbound endpoint (on-premises Azure se poochta hai) aur outbound endpoint (Azure on-premises se poochta hai) wala DNS Private Resolver.</p></div>

<h3>Part A: ExpressRoute ke saath VPN failover</h3>
<p>Aap ExpressRoute gateway aur VPN gateway ek hi VNet aur ek hi GatewaySubnet mein deploy kar sakte ho. Ise <b>coexistence</b> kehte hain. Dono ek hi prefix advertise karein to Azure ExpressRoute path prefer karta hai, isliye VPN tab tak idle rehta hai jab tak ExpressRoute fail na ho. Phir BGP ExpressRoute routes withdraw karta hai aur traffic VPN se apne aap chalne lagta hai. ExpressRoute theek ho to traffic wapas aa jaata hai.</p>
<ul>
<li>/27 ya bada GatewaySubnet use karo taaki dono gateways fit hon.</li>
<li>VPN par BGP chalao taaki routes apne aap shift hon. Static VPN saaf tareeke se fail back nahi karega.</li>
<li>Dono paths par <b>same prefixes</b> advertise karo. VPN zyada specific prefixes advertise kare to woh longest prefix match se jeetega aur ExpressRoute healthy hone par bhi traffic VPN use karega. Effective routes se check karo.</li>
<li>Backup path se kam bandwidth aur zyada latency expect karo. Jo traffic zinda rakhna hai uske liye VPN SKU size karo, aur decide karo kaunse workloads gracefully degrade karenge.</li>
<li>Failover ko kisi shaant din <b>test karo</b>, aur natija document karo.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Office 192.168.0.0/16 ExpressRoute (200 Mbps) aur VPN (BGP, VPN ke through AS path lamba) dono par advertise hota hai. 192.168.0.0/16 ka Azure effective route next hop <code>VirtualNetworkGateway</code> hai ExpressRoute ke through. Provider ka ek router fail hota hai; BGP hold timers expire hote hain, aur wahi prefix ab sirf VPN se aata hai. Traffic VPN speed par chalta rehta hai. On-call engineer ise gateway BGP peer status aur ek alert mein dekhta hai.</p></div>
<pre class="code">az network vnet-gateway list-learned-routes -g rg-hub -n er-gw-hub -o table
az network vnet-gateway list-learned-routes -g rg-hub -n vpn-gw-hub -o table</pre>

<h3>Part B: link ke paar DNS</h3>
<p>Azure har VNet ko <code>168.63.129.16</code> par built-in resolver deta hai. Woh Azure names aur linked <b>Private DNS zones</b> resolve karta hai, par on-premises se query nahi kiya ja sakta, aur default mein <code>corp.example</code> ke baare mein kuch nahi jaanta. Pehle teams gap bharne ke liye VMs par DNS servers chalati thi. <b>Azure DNS Private Resolver</b> managed replacement hai. Isme do endpoints hote hain:</p>
<dl class="terms">
<dt>Inbound endpoint</dt><dd>Aapke VNet ke subnet ka ek private IP (jaise 10.0.7.4) jise on-premises DNS queries forward kar sakta hai. Query ka jawab Azure DNS ki jaankari se milta hai, us VNet se linked Private DNS zones sahit.</dd>
<dt>Outbound endpoint</dt><dd>Aisa subnet jo Azure se doosre DNS servers ko queries bhejta hai. Aap ek <b>DNS forwarding ruleset</b> attach karte ho jisme rules hote hain jaise "corp.example 192.168.1.53 ko forward".</dd>
<dt>Forwarding ruleset</dt><dd>Domain name aur target DNS servers ke rules, un VNets se linked jinhe unhe use karna hai (hub aur spokes). Linked VNets har VNet par custom DNS settings ke bina rules follow karte hain.</dd>
</dl>
<p>Har endpoint ko apna dedicated subnet chahiye jo <code>Microsoft.Network/dnsResolvers</code> ko <b>delegated</b> ho, kam se kam /28 (publish se pehle current minimum verify karo).</p>
<pre class="code"><span class="c"># concept (dns-resolver extension chahiye ho sakti hai; parameters --help se confirm karo)</span>
az dns-resolver create -g rg-hub -n dnspr-hub --id <span class="c">&lt;hub-vnet-id&gt;</span> -l centralindia
az dns-resolver inbound-endpoint create -g rg-hub --dns-resolver-name dnspr-hub -n dns-in -l centralindia --ip-configurations "[{private-ip-allocation-method:Dynamic,id:<span class="c">&lt;inbound-subnet-id&gt;</span>}]"
az dns-resolver outbound-endpoint create -g rg-hub --dns-resolver-name dnspr-hub -n dns-out -l centralindia --id <span class="c">&lt;outbound-subnet-id&gt;</span>
az dns-resolver forwarding-ruleset create -g rg-hub -n frs-hub -l centralindia --outbound-endpoints "[{id:<span class="c">&lt;dns-out-id&gt;</span>}]"
az dns-resolver forwarding-rule create -g rg-hub --ruleset-name frs-hub -n corp --domain-name "corp.example." --forwarding-rule-state Enabled --target-dns-servers "[{ip-address:192.168.1.53,port:53}]"</pre>
<p>Phir on-premises DNS ko <code>azure.example</code> (ya privatelink zones) inbound endpoint IP ko conditionally forward karne ke liye set karo, VPN ya ExpressRoute ke through.</p>
<pre class="out"><span class="c">Illustrative output (linked spoke ki VM se)</span>
$ nslookup files.corp.example
Server:   168.63.129.16
Name:     files.corp.example
Address:  <span class="hl">192.168.1.20</span></pre>

<h3>Private endpoints aur DNS</h3>
<p>Storage account ke private endpoint tak <code>mystore.privatelink.blob.core.windows.net</code> jaise naam se pahunchte hain. Matching <b>Private DNS zone</b> exist karni chahiye, VNet se linked, aur on-premises clients ko private IP paane ke liye inbound endpoint ke through resolve karna chahiye. Client ko public IP mile to ya to fail hoga (public access disabled) ya internet se jaayega. Zyadatar hybrid DNS tickets yahi hote hain.</p>

<div class="warn"><p><b>Common mistakes:</b> Private DNS zone link karna bhool jaana, on-premises DNS ko 168.63.129.16 par point karna (jo bahar se reachable nahi), VPN ka ExpressRoute se zyada specific prefixes advertise karna, aur delegated na kiye gaye subnets.</p></div>
<div class="exam"><p><b>Exam trap:</b> 168.63.129.16 Azure-provided resolver hai aur sirf VNet ke andar se reachable hai; on-premises ko Private Resolver ke inbound endpoint se query karna hoga. Aur: same prefix ke liye ExpressRoute VPN par prefer hota hai; zyada specific VPN prefix use haraata hai.</p></div>

<div class="scn"><h4>Storage account jo public IP par resolve hua</h4><p>Storage private endpoint banne ke baad bhi on-premises users public address tak pahunche aur block hue. Private DNS zone thi par on-premises DNS ek legacy resolver ko forward kar raha tha jo use nahi jaanta tha. Team ne Private Resolver deploy kiya, zone ko hub se link kiya, aur on-premises DNS se privatelink zone inbound endpoint ko forward kiya. Naam ab 10.0.3.50 par resolve hua aur traffic VPN se gaya.</p><p><b>Lesson:</b> private connectivity ko private name resolution bhi chahiye.</p></div>

<div class="iv"><p class="q">"DNS VMs ke bina on-premises aur Azure ke beech DNS kaise karte ho?"</p><p>Hub mein Azure DNS Private Resolver: inbound endpoint jise on-premises DNS forward karta hai, aur outbound endpoint forwarding ruleset ke saath jo corp.example ko on-premises DNS bhejta hai. Private DNS zones VNets se linked hote hain. Delegated subnets ka zikr karo aur ki 168.63.129.16 on-premises se reachable nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ExpressRoute aur VPN coexist karte hain; same prefix par ExpressRoute jeetta hai, VPN backup.</li>
<li>VPN par BGP chalao aur same prefixes advertise karo; failover test karo.</li>
<li>Private Resolver DNS VMs ki jagah leta hai: on-premises se Azure ke liye inbound, Azure se on-premises ke liye outbound.</li>
<li>Endpoints ko delegated subnets chahiye (Microsoft.Network/dnsResolvers).</li>
<li>Private endpoints tabhi chalte hain jab matching, linked private DNS zones hon.</li>
</ul></div>
`}};export{t as default};