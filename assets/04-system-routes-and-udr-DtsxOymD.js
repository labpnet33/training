var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="{{aria}}">
<rect x="20" y="15" width="600" height="46" rx="8" fill="#bae6fd"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">{{s1}}</text>
<line x1="320" y1="61" x2="320" y2="78" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="78" width="600" height="46" rx="8" fill="#fde68a"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="13">{{s2}}</text>
<line x1="320" y1="124" x2="320" y2="141" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="141" width="600" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="13">{{s3}}</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">{{n1}}</text><text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">{{n2}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`Route selection order`,s1:`1. Longest prefix match wins (most specific route)`,s2:`2. Same prefix: user-defined route beats BGP route`,s3:`3. Then BGP beats system (default) route`,n1:`Example: 10.2.0.0/16 (peering) beats 0.0.0.0/0 (UDR) for a packet to 10.2.1.4`,n2:`because /16 is more specific than /0, whatever the source of the route.`,cap:`Azure picks the route with the longest matching prefix first, and only on a tie looks at the source: UDR, then BGP, then system.`}),r=e(t,{aria:`Route selection order`,s1:`1. Longest prefix match jeetta hai (sabse specific route)`,s2:`2. Same prefix: user-defined route BGP route se upar`,s3:`3. Phir BGP system (default) route se upar`,n1:`Example: 10.2.1.4 ke packet ke liye 10.2.0.0/16 (peering) 0.0.0.0/0 (UDR) ko haraata hai`,n2:`kyunki /16 /0 se zyada specific hai, route ka source kuch bhi ho.`,cap:`Azure pehle longest matching prefix wala route chunta hai, aur tie par hi source dekhta hai: UDR, phir BGP, phir system.`}),i={id:`system-routes-and-udr`,h:{en:`System routes, user-defined routes and precedence`,hi:`System routes, user-defined routes aur precedence`},body:{en:`
<h3>Every subnet already has a route table</h3>
<p>You never see it, but Azure gives every subnet a default set of <b>system routes</b>. They are why VMs in a VNet can talk to each other and to the internet without you configuring anything. Typical entries:</p>
<table class="cmp"><tr><th>Address prefix</th><th>Next hop type</th><th>Why</th></tr>
<tr><td>VNet address space, e.g. 10.60.0.0/16</td><td>Virtual network</td><td>Local VNet traffic</td></tr>
<tr><td>0.0.0.0/0</td><td>Internet</td><td>Everything not matched goes to the internet (through whichever outbound method applies)</td></tr>
<tr><td>10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</td><td>None</td><td>Private ranges with no VNet match are dropped (verify: ranges you actually use are overridden by more specific routes)</td></tr>
<tr><td>100.64.0.0/10</td><td>None</td><td>Shared address space, dropped (verify)</td></tr>
<tr><td>Peered VNet's range, e.g. 10.20.0.0/16</td><td>VNet peering</td><td>Added automatically by peering</td></tr>
<tr><td>Gateway-learned prefixes, e.g. 192.168.0.0/16</td><td>Virtual network gateway</td><td>BGP or configured from VPN and ExpressRoute</td></tr></table>

<h3>The five next-hop types</h3>
<dl class="terms">
<dt>Virtual network</dt><dd>Deliver within the VNet (also used for peered VNets: reported as VNet peering).</dd>
<dt>Internet</dt><dd>Send to the internet through the outbound method (public IP, NAT Gateway, etc.).</dd>
<dt>Virtual appliance</dt><dd>Send to the IP address of an NVA or Azure Firewall that you name in the route. Requires the next-hop IP.</dd>
<dt>Virtual network gateway</dt><dd>Send into a VPN or ExpressRoute gateway. Used for on-premises prefixes.</dd>
<dt>None</dt><dd>Drop the traffic (a blackhole). Useful to deliberately block a prefix.</dd>
</dl>
<p>Another type, <b>VirtualNetworkServiceEndpoint</b>, appears when service endpoints are enabled for Azure PaaS prefixes.</p>

<h3>User-defined routes (UDRs)</h3>
<p>A <b>route table</b> is a standalone resource containing routes you define. You <b>associate it with subnets</b> (one route table per subnet; one table can serve many subnets in the same region and subscription). The routes override or add to the system routes. Also relevant: the setting <b>disable BGP route propagation</b>, which stops gateway-learned routes from appearing on that subnet (common on a firewall subnet or to avoid on-premises routes overriding yours).</p>
<pre class="code"><span class="c"># Create a route table and a route that sends spoke-to-spoke traffic to an NVA at 10.0.1.4</span>
az network route-table create -g nk-rg -n rt-spoke1 --disable-bgp-route-propagation true
az network route-table route create -g nk-rg --route-table-name rt-spoke1 -n to-spoke2 \\
  --address-prefix 10.2.0.0/16 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.1.4

<span class="c"># Black-hole a prefix on purpose</span>
az network route-table route create -g nk-rg --route-table-name rt-spoke1 -n block-test \\
  --address-prefix 198.51.100.0/24 --next-hop-type None

<span class="c"># Associate the table with a subnet</span>
az network vnet subnet update -g nk-rg --vnet-name vnet-spoke1 -n sn-spoke1 --route-table rt-spoke1</pre>
`+n+`
<h3>Route selection</h3>
<p>For each packet Azure finds all routes whose prefix contains the destination, then picks the <b>longest prefix</b> (most specific). Only when two routes have an identical prefix does it use the source to break the tie: <b>user-defined, then BGP, then system</b>. A very common beginner error is to think a UDR always wins; a /16 system peering route is more specific than a 0.0.0.0/0 UDR, so the peering route still wins for that range, and a UDR for the same /16 would replace it.</p>
<pre class="out">Illustrative output: effective routes on a spoke NIC
Source   State    Address Prefix   Next Hop Type      Next Hop IP
Default  Active   10.1.0.0/16      VnetLocal
Default  Active   10.0.0.0/16      VNetPeering
<span class="hl">User     Active   10.2.0.0/16      VirtualAppliance   10.0.1.4</span>
User     Active   0.0.0.0/0        VirtualAppliance   10.0.1.4
Default  Invalid  0.0.0.0/0        Internet</pre>
<p>The last line shows a system route marked <b>Invalid</b> because a user route with the same prefix replaced it.</p>

<div class="eg"><b>Worked example.</b> Spoke1 sends a packet to 10.2.1.4. Candidates: 10.2.0.0/16 (user, appliance 10.0.1.4) and 0.0.0.0/0 (user, appliance). The /16 is longer, so it wins: next hop 10.0.1.4. Without the UDR for 10.2.0.0/16 there would be no route to spoke 2 at all, because peering with the hub is non-transitive (the system routes list only the hub and spoke1), and the packet would match 0.0.0.0/0.</div>

<div class="warn"><b>Common mistakes.</b> Forgetting to associate the route table with the subnet; using the wrong next-hop IP; creating a route to an appliance whose NIC has IP forwarding off (traffic is dropped); putting a 0.0.0.0/0 UDR on a subnet that needs a different path for platform traffic (the Azure platform uses special addresses that must not be blackholed, verify before using None on wide ranges).</div>
<div class="exam"><b>Exam trap.</b> Precedence is "longest prefix first, then UDR over BGP over system". A UDR for 0.0.0.0/0 does not override a more specific peering or local VNet route.</div>

<div class="scn"><h4>The route that did not apply</h4><p>An engineer added a UDR to send 10.2.0.0/16 to the hub firewall but spoke traffic still bypassed it. Effective routes showed no user route at all. The table existed but had never been associated with the subnet. One association command later, the route appeared as Active with next hop VirtualAppliance.</p><p><b>Lesson:</b> a route table does nothing until it is associated with a subnet. Always check effective routes on a NIC.</p></div>

<div class="iv"><p class="q">"How does Azure choose between two routes to the same destination?"</p><p>Longest prefix match first. If the prefixes are equal, user-defined wins over BGP, which wins over system routes. Mention that effective routes on the NIC show the result and that a user route with the same prefix invalidates the system route.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>System routes exist by default; peering and gateways add more automatically.</li>
<li>Next-hop types: virtual network, internet, virtual appliance, virtual network gateway, none.</li>
<li>UDRs live in route tables associated to subnets.</li>
<li>Selection: longest prefix, then UDR over BGP over system.</li>
<li>Always verify with effective routes on the NIC.</li>
</ul></div>
`,hi:`
<h3>Har subnet ke paas pehle se route table hota hai</h3>
<p>Aap use dekhte nahi, par Azure har subnet ko <b>system routes</b> ka default set deta hai. Isi wajah se VNet ke VMs bina kuch configure kiye ek doosre se aur internet se baat kar paate hain. Typical entries:</p>
<table class="cmp"><tr><th>Address prefix</th><th>Next hop type</th><th>Kyun</th></tr>
<tr><td>VNet address space, jaise 10.60.0.0/16</td><td>Virtual network</td><td>Local VNet traffic</td></tr>
<tr><td>0.0.0.0/0</td><td>Internet</td><td>Jo match nahi hua woh internet ko jaata hai (jo bhi outbound method lagu ho uske through)</td></tr>
<tr><td>10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</td><td>None</td><td>VNet match ke bina private ranges drop hoti hain (verify: jo ranges aap use karte ho woh zyada specific routes se override hoti hain)</td></tr>
<tr><td>100.64.0.0/10</td><td>None</td><td>Shared address space, drop (verify)</td></tr>
<tr><td>Peered VNet ki range, jaise 10.20.0.0/16</td><td>VNet peering</td><td>Peering se automatically jodi jaati hai</td></tr>
<tr><td>Gateway se seekhe prefixes, jaise 192.168.0.0/16</td><td>Virtual network gateway</td><td>VPN aur ExpressRoute se BGP ya configured</td></tr></table>

<h3>Paanch next-hop types</h3>
<dl class="terms">
<dt>Virtual network</dt><dd>VNet ke andar deliver karo (peered VNets ke liye bhi: VNet peering ki tarah report hota hai).</dd>
<dt>Internet</dt><dd>Outbound method (public IP, NAT Gateway, etc.) ke through internet ko bhejo.</dd>
<dt>Virtual appliance</dt><dd>NVA ya Azure Firewall ke us IP address ko bhejo jo aap route mein naam dete ho. Next-hop IP chahiye.</dd>
<dt>Virtual network gateway</dt><dd>VPN ya ExpressRoute gateway mein bhejo. On-premises prefixes ke liye.</dd>
<dt>None</dt><dd>Traffic drop karo (blackhole). Kisi prefix ko jaanboojhkar block karne ke liye.</dd>
</dl>
<p>Ek aur type, <b>VirtualNetworkServiceEndpoint</b>, tab dikhta hai jab Azure PaaS prefixes ke liye service endpoints on hon.</p>

<h3>User-defined routes (UDRs)</h3>
<p><b>Route table</b> alag resource hai jisme aapke define kiye routes hote hain. Use <b>subnets se associate</b> karte ho (ek subnet ko ek route table; ek table same region aur subscription ke kai subnets ko serve kar sakti hai). Yeh routes system routes ko override karte hain ya unmein jodte hain. Ek aur zaroori setting <b>disable BGP route propagation</b> hai, jo us subnet par gateway se seekhe routes dikhne se rokti hai (firewall subnet par common, ya on-premises routes aapke routes ko override na karein iske liye).</p>
<pre class="code"><span class="c"># Route table banao aur spoke-to-spoke traffic ko 10.0.1.4 ke NVA ko bhejne wala route</span>
az network route-table create -g nk-rg -n rt-spoke1 --disable-bgp-route-propagation true
az network route-table route create -g nk-rg --route-table-name rt-spoke1 -n to-spoke2 \\
  --address-prefix 10.2.0.0/16 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.1.4

<span class="c"># Kisi prefix ko jaanboojhkar blackhole karo</span>
az network route-table route create -g nk-rg --route-table-name rt-spoke1 -n block-test \\
  --address-prefix 198.51.100.0/24 --next-hop-type None

<span class="c"># Table ko subnet se associate karo</span>
az network vnet subnet update -g nk-rg --vnet-name vnet-spoke1 -n sn-spoke1 --route-table rt-spoke1</pre>
`+r+`
<h3>Route selection</h3>
<p>Har packet ke liye Azure un sab routes ko dhoondhta hai jinka prefix destination ko contain karta hai, phir <b>longest prefix</b> (sabse specific) chunta hai. Sirf jab do routes ka prefix bilkul same ho tab source se tie todta hai: <b>user-defined, phir BGP, phir system</b>. Beginners ki aam galti hai yeh sochna ki UDR hamesha jeetta hai; /16 system peering route 0.0.0.0/0 UDR se zyada specific hai, isliye us range ke liye peering route hi jeetta hai, aur usi /16 ke liye UDR use replace kar dega.</p>
<pre class="out">Illustrative output: spoke NIC ke effective routes
Source   State    Address Prefix   Next Hop Type      Next Hop IP
Default  Active   10.1.0.0/16      VnetLocal
Default  Active   10.0.0.0/16      VNetPeering
<span class="hl">User     Active   10.2.0.0/16      VirtualAppliance   10.0.1.4</span>
User     Active   0.0.0.0/0        VirtualAppliance   10.0.1.4
Default  Invalid  0.0.0.0/0        Internet</pre>
<p>Aakhri line mein system route <b>Invalid</b> hai kyunki same prefix wale user route ne use replace kar diya.</p>

<div class="eg"><b>Worked example.</b> Spoke1 10.2.1.4 ko packet bhejta hai. Candidates: 10.2.0.0/16 (user, appliance 10.0.1.4) aur 0.0.0.0/0 (user, appliance). /16 lamba hai, isliye jeetta hai: next hop 10.0.1.4. 10.2.0.0/16 ke UDR ke bina spoke 2 tak koi route hi nahi hota, kyunki hub ke saath peering non-transitive hai (system routes mein sirf hub aur spoke1 hain), aur packet 0.0.0.0/0 se match hota.</div>

<div class="warn"><b>Common mistakes.</b> Route table ko subnet se associate karna bhool jaana; galat next-hop IP; aise appliance ko route banana jiski NIC par IP forwarding off hai (traffic drop hota hai); aise subnet par 0.0.0.0/0 UDR lagana jise platform traffic ke liye alag path chahiye (Azure platform special addresses use karta hai jinhe blackhole nahi karna chahiye, wide ranges par None use karne se pehle verify karo).</div>
<div class="exam"><b>Exam trap.</b> Precedence hai "pehle longest prefix, phir UDR BGP se upar, BGP system se upar". 0.0.0.0/0 ka UDR zyada specific peering ya local VNet route ko override nahi karta.</div>

<div class="scn"><h4>Route jo lagu nahi hua</h4><p>Engineer ne 10.2.0.0/16 ko hub firewall ko bhejne wala UDR jodha par spoke traffic phir bhi use bypass karta raha. Effective routes mein koi user route tha hi nahi. Table exist karti thi par subnet se kabhi associate nahi hui thi. Ek association command ke baad route Active dikha next hop VirtualAppliance ke saath.</p><p><b>Lesson:</b> route table subnet se associate hone tak kuch nahi karti. Hamesha NIC ke effective routes check karo.</p></div>

<div class="iv"><p class="q">"Same destination ke do routes mein Azure kaise chunta hai?"</p><p>Pehle longest prefix match. Prefix barabar hon to user-defined BGP se jeetta hai, jo system routes se jeetta hai. Batao ki NIC ke effective routes result dikhate hain aur same prefix wala user route system route ko invalidate kar deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>System routes default hain; peering aur gateways aur jodte hain.</li>
<li>Next-hop types: virtual network, internet, virtual appliance, virtual network gateway, none.</li>
<li>UDRs route tables mein rehte hain jo subnets se associate hoti hain.</li>
<li>Selection: longest prefix, phir UDR over BGP over system.</li>
<li>Hamesha NIC ke effective routes se verify karo.</li>
</ul></div>
`}};export{i as default};