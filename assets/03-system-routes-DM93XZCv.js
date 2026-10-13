var e=`<svg viewBox="0 0 640 260" role="img" aria-label="System routes and next hop types">
<rect x="10" y="10" width="300" height="240" rx="8" fill="#e2e8f0"/><text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="13">Effective route table of a NIC</text>
<text x="24" y="62" class="svg-ink" font-size="12">Prefix</text><text x="190" y="62" class="svg-ink" font-size="12">Next hop</text>
<line x1="20" y1="70" x2="300" y2="70" stroke="#64748b"/>
<text x="24" y="95" class="svg-ink" font-size="12">10.10.0.0/16</text><text x="190" y="95" class="svg-accent" font-size="12">Virtual network</text>
<text x="24" y="125" class="svg-ink" font-size="12">0.0.0.0/0</text><text x="190" y="125" class="svg-accent" font-size="12">Internet</text>
<text x="24" y="155" class="svg-ink" font-size="12">10.0.0.0/8</text><text x="190" y="155" class="svg-accent" font-size="12">None</text>
<text x="24" y="185" class="svg-ink" font-size="12">172.16.0.0/12</text><text x="190" y="185" class="svg-accent" font-size="12">None</text>
<text x="24" y="215" class="svg-ink" font-size="12">192.168.0.0/16</text><text x="190" y="215" class="svg-accent" font-size="12">None</text>
<rect x="340" y="10" width="290" height="70" rx="8" fill="#bbf7d0"/><text x="485" y="35" text-anchor="middle" class="svg-ink" font-size="13">Destination 10.10.2.4</text><text x="485" y="58" text-anchor="middle" class="svg-muted" font-size="12">longest match /16 wins: stays in VNet</text>
<rect x="340" y="95" width="290" height="70" rx="8" fill="#bae6fd"/><text x="485" y="120" text-anchor="middle" class="svg-ink" font-size="13">Destination 203.0.113.50</text><text x="485" y="143" text-anchor="middle" class="svg-muted" font-size="12">only 0.0.0.0/0 matches: Internet</text>
<rect x="340" y="180" width="290" height="70" rx="8" fill="#fed7aa"/><text x="485" y="205" text-anchor="middle" class="svg-ink" font-size="13">Destination 10.99.0.5</text><text x="485" y="228" text-anchor="middle" class="svg-muted" font-size="12">/8 route says None: dropped</text>
</svg>`,t={id:`system-routes`,h:{en:`System routes, user-defined routes and effective routes`,hi:`System routes, user-defined routes aur effective routes`},body:{en:`
<h3>Where is the router?</h3>
<p>Beginners from physical networks ask "which router do I configure?" In Azure you never see one. Each NIC receives a <b>route table built by the platform</b>. Packets leaving a VM are matched against it. You can add your own routes, but you start with working ones.</p>

<h3>The default system routes</h3>
<p>Every subnet starts with these <b>system routes</b> (verify the exact list on the Azure routing page before publishing):</p>
<table class="cmp"><tr><th>Address prefix</th><th>Next hop type</th><th>Meaning</th></tr>
<tr><td>Your VNet address space, per prefix</td><td>Virtual network</td><td>Traffic stays inside the VNet, even between subnets</td></tr>
<tr><td>0.0.0.0/0</td><td>Internet</td><td>Everything else goes toward the Internet</td></tr>
<tr><td>10.0.0.0/8</td><td>None</td><td>Dropped, unless a more specific route exists</td></tr>
<tr><td>172.16.0.0/12</td><td>None</td><td>Dropped, unless a more specific route exists</td></tr>
<tr><td>192.168.0.0/16</td><td>None</td><td>Dropped, unless a more specific route exists</td></tr>
<tr><td>100.64.0.0/10</td><td>None</td><td>Dropped, unless a more specific route exists</td></tr>
</table>
<p>Azure adds further system routes when you use peering (next hop type <b>VNet peering</b>), a VPN or ExpressRoute gateway (<b>Virtual network gateway</b>) and service endpoints (<b>VirtualNetworkServiceEndpoint</b>).</p>

<h3>Longest prefix match</h3>
<p>When more than one route matches, Azure picks the one with the <b>longest prefix</b> (most specific). Your VNet range 10.10.0.0/16 beats 10.0.0.0/8, so internal traffic works. A destination 10.99.0.5 is not in your VNet: it matches only 10.0.0.0/8 with next hop None and is dropped. This is how Azure stops accidental leaks of private ranges to the Internet.</p>

<div class="dia">`+e+`<p class="cap">Three destinations, three outcomes, decided by the longest matching prefix.</p></div>

<h3>User-defined routes (UDR)</h3>
<p>You create a <b>route table</b> resource, add routes and <b>associate</b> it with a subnet. Each route has a prefix and a next hop type:</p>
<ul>
<li><b>Virtual appliance</b>: send traffic to a specific private IP, for example an Azure Firewall at 10.10.250.4.</li>
<li><b>Virtual network gateway</b>, <b>Virtual network</b>, <b>Internet</b>, <b>None</b>.</li>
</ul>
<p>When prefixes tie, the order of preference is: user-defined route, then BGP route, then system route. A common design is a route 0.0.0.0/0 to a firewall, which forces Internet-bound traffic through inspection.</p>
<pre class="code">az network route-table create -g rg-nk-lab -n rt-app --location centralindia
az network route-table route create -g rg-nk-lab --route-table-name rt-app -n to-fw --address-prefix 0.0.0.0/0 --next-hop-type VirtualAppliance --next-hop-ip-address 10.10.250.4
az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-app --route-table rt-app</pre>

<h3>Effective routes: what the VM really uses</h3>
<p>The truth is the <b>effective route table</b> of a NIC. In the portal open the NIC, then Effective routes (verify wording). The NIC must be attached to a running VM for this to work (verify before publishing).</p>
<pre class="code">az network nic show-effective-route-table -g rg-nk-lab -n nic-web --output table</pre>
<p>Illustrative output:</p>
<pre class="out">Source    State    Address Prefix    Next Hop Type    Next Hop IP
--------  -------  ----------------  ---------------  -------------
Default   Active   10.10.0.0/16      VnetLocal
Default   Active   0.0.0.0/0         Internet
Default   Active   10.0.0.0/8        None
Default   Active   172.16.0.0/12     None
Default   Active   192.168.0.0/16    None</pre>
<p>Interpret: <span class="hl">VnetLocal</span> is the Virtual network next hop. The Source column tells you whether a route is Default (system), User or a gateway.</p>

<h3>Next Hop with Network Watcher</h3>
<p>Network Watcher can answer "where would a packet to this IP go?"</p>
<pre class="code">az network watcher show-next-hop -g rg-nk-lab --vm vm-web --source-ip 10.10.1.4 --dest-ip 203.0.113.50</pre>
<p>Network Watcher needs to be enabled in the region (often automatic) and the VM agent extension may be installed (verify before publishing).</p>

<div class="eg"><p><b>Worked example.</b> Asha attaches route table <code>rt-app</code> with 0.0.0.0/0 to a virtual appliance 10.10.250.4 on snet-app. A VM at 10.10.2.4 sends to 203.0.113.50: the longest match is 0.0.0.0/0, now owned by the User route, so the packet goes to the firewall. A packet to 10.10.1.4 matches the system 10.10.0.0/16 route, which is more specific, so it still goes direct and bypasses the firewall unless she adds a route for 10.10.1.0/24 too.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding 0.0.0.0/0 to a firewall and forgetting that the firewall must be reachable, must forward, and must have a return path. Another: expecting traffic inside the VNet to hit the firewall without more specific routes.</p></div>

<div class="exam"><p><b>Exam trap.</b> Priority between equal prefixes: UDR beats BGP beats system. Different prefixes: longest prefix wins first. Next hop type None drops traffic. AWS needs route tables on every subnet; Azure has defaults you do not manage.</p></div>

<div class="scn"><h4>Everything slow after the firewall route</h4><p>After adding a 0.0.0.0/0 route to a firewall, a team's VM could no longer reach package repositories. The firewall had no rule allowing outbound web traffic. Effective routes were correct. They added an application rule, and updates worked.</p><p><b>Lesson:</b> routing sends traffic to the appliance; the appliance still has to allow it.</p></div>

<div class="iv"><p class="q">"How does Azure decide where to send a packet from a VM?"</p><p>It builds an effective route table per NIC from system routes, BGP routes and UDRs. Longest prefix match wins; on a tie, UDR beats BGP beats system. Say how you inspect it: effective routes on the NIC and Next hop in Network Watcher.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Azure builds system routes for you; there is no router to configure.</li>
<li>Default routes: VNet space to Virtual network, 0.0.0.0/0 to Internet, private ranges to None.</li>
<li>Longest prefix wins; on tie UDR, then BGP, then system.</li>
<li>UDRs live in a route table associated with a subnet.</li>
<li>Check effective routes and Next hop when diagnosing.</li>
</ul></div>
`,hi:`
<h3>Router kahan hai?</h3>
<p>Physical networks se aane wale beginners poochte hain "kaun sa router configure karun?" Azure mein aap use kabhi nahi dekhte. Har NIC ko <b>platform ka banaya route table</b> milta hai. VM se nikalne wale packets ko usi se match kiya jata hai. Aap apne routes add kar sakte ho, lekin shuru mein chalte hue routes milte hain.</p>

<h3>Default system routes</h3>
<p>Har subnet in <b>system routes</b> ke saath shuru hota hai (exact list publish karne se pehle Azure routing page par verify karo):</p>
<table class="cmp"><tr><th>Address prefix</th><th>Next hop type</th><th>Matlab</th></tr>
<tr><td>Aapka VNet address space, har prefix ke liye</td><td>Virtual network</td><td>Traffic VNet ke andar rehta hai, subnets ke beech bhi</td></tr>
<tr><td>0.0.0.0/0</td><td>Internet</td><td>Baaki sab Internet ki taraf jata hai</td></tr>
<tr><td>10.0.0.0/8</td><td>None</td><td>Drop hota hai, jab tak zyada specific route na ho</td></tr>
<tr><td>172.16.0.0/12</td><td>None</td><td>Drop hota hai, jab tak zyada specific route na ho</td></tr>
<tr><td>192.168.0.0/16</td><td>None</td><td>Drop hota hai, jab tak zyada specific route na ho</td></tr>
<tr><td>100.64.0.0/10</td><td>None</td><td>Drop hota hai, jab tak zyada specific route na ho</td></tr>
</table>
<p>Peering (next hop type <b>VNet peering</b>), VPN ya ExpressRoute gateway (<b>Virtual network gateway</b>) aur service endpoints (<b>VirtualNetworkServiceEndpoint</b>) use karne par Azure aur system routes add karta hai.</p>

<h3>Longest prefix match</h3>
<p>Jab ek se zyada routes match karte hain, Azure <b>sabse lamba prefix</b> (sabse specific) chunta hai. Aapki VNet range 10.10.0.0/16, 10.0.0.0/8 ko haraati hai, isliye internal traffic chalta hai. Destination 10.99.0.5 aapke VNet mein nahi hai: woh sirf 10.0.0.0/8 se match karta hai jiska next hop None hai aur drop ho jata hai. Isi tareeke se Azure private ranges ko galti se Internet par leak hone se rokta hai.</p>

<div class="dia">`+e+`<p class="cap">Teen destinations, teen outcomes, sabse lambe matching prefix se decide hote hain.</p></div>

<h3>User-defined routes (UDR)</h3>
<p>Aap ek <b>route table</b> resource banate ho, routes add karte ho aur use subnet se <b>associate</b> karte ho. Har route mein prefix aur next hop type hota hai:</p>
<ul>
<li><b>Virtual appliance</b>: traffic ko kisi specific private IP par bhejo, jaise 10.10.250.4 par Azure Firewall.</li>
<li><b>Virtual network gateway</b>, <b>Virtual network</b>, <b>Internet</b>, <b>None</b>.</li>
</ul>
<p>Prefixes tie hone par preference order: user-defined route, phir BGP route, phir system route. Common design hai 0.0.0.0/0 ka route firewall ki taraf, jo Internet-bound traffic ko inspection se guzaarta hai.</p>
<pre class="code">az network route-table create -g rg-nk-lab -n rt-app --location centralindia
az network route-table route create -g rg-nk-lab --route-table-name rt-app -n to-fw --address-prefix 0.0.0.0/0 --next-hop-type VirtualAppliance --next-hop-ip-address 10.10.250.4
az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-app --route-table rt-app</pre>

<h3>Effective routes: VM asal mein kya use karta hai</h3>
<p>Sach NIC ka <b>effective route table</b> hai. Portal mein NIC kholo, phir Effective routes (verify wording). Iske kaam karne ke liye NIC kisi running VM se attached hona chahiye (verify before publishing).</p>
<pre class="code">az network nic show-effective-route-table -g rg-nk-lab -n nic-web --output table</pre>
<p>Illustrative output:</p>
<pre class="out">Source    State    Address Prefix    Next Hop Type    Next Hop IP
--------  -------  ----------------  ---------------  -------------
Default   Active   10.10.0.0/16      VnetLocal
Default   Active   0.0.0.0/0         Internet
Default   Active   10.0.0.0/8        None
Default   Active   172.16.0.0/12     None
Default   Active   192.168.0.0/16    None</pre>
<p>Matlab: <span class="hl">VnetLocal</span> Virtual network next hop hai. Source column batata hai ki route Default (system), User ya gateway ka hai.</p>

<h3>Network Watcher ke saath Next Hop</h3>
<p>Network Watcher jawab de sakta hai "is IP ka packet kahan jayega?"</p>
<pre class="code">az network watcher show-next-hop -g rg-nk-lab --vm vm-web --source-ip 10.10.1.4 --dest-ip 203.0.113.50</pre>
<p>Region mein Network Watcher enabled hona chahiye (aksar automatic) aur VM agent extension install ho sakta hai (verify before publishing).</p>

<div class="eg"><p><b>Worked example.</b> Asha route table <code>rt-app</code> ko snet-app par attach karti hai jisme 0.0.0.0/0 virtual appliance 10.10.250.4 ki taraf hai. 10.10.2.4 ka VM 203.0.113.50 ko bhejta hai: sabse lamba match 0.0.0.0/0 hai, jo ab User route ka hai, isliye packet firewall ke paas jata hai. 10.10.1.4 ka packet system 10.10.0.0/16 route se match karta hai, jo zyada specific hai, isliye woh seedha jata hai aur firewall ko bypass karta hai jab tak woh 10.10.1.0/24 ka route bhi na jode.</p></div>

<div class="warn"><p><b>Common mistake.</b> 0.0.0.0/0 ko firewall par bhej dena aur bhool jana ki firewall reachable ho, forward kare, aur return path ho. Ek aur: bina zyada specific routes ke VNet ke andar ka traffic firewall se guzarne ki umeed rakhna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Equal prefixes ke beech priority: UDR, BGP se aage, BGP system se aage. Alag prefixes: pehle longest prefix jeetta hai. Next hop type None traffic drop karta hai. AWS ko har subnet par route tables chahiye; Azure ke defaults aap manage nahi karte.</p></div>

<div class="scn"><h4>Firewall route ke baad sab slow</h4><p>0.0.0.0/0 route firewall ki taraf jodne ke baad team ka VM package repositories tak nahi pahunch pa raha tha. Firewall mein outbound web traffic allow karne wala rule nahi tha. Effective routes sahi the. Unhone application rule add kiya, aur updates chal gaye.</p><p><b>Lesson:</b> routing traffic ko appliance tak bhejta hai; appliance ko phir bhi allow karna padta hai.</p></div>

<div class="iv"><p class="q">"Azure VM se packet kahan bhejna hai yeh kaise decide karta hai?"</p><p>Woh har NIC ke liye system routes, BGP routes aur UDRs se effective route table banata hai. Longest prefix match jeetta hai; tie par UDR, BGP se aage, BGP system se aage. Batao kaise inspect karte ho: NIC par effective routes aur Network Watcher mein Next hop.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Azure system routes aapke liye banata hai; configure karne ke liye router nahi hai.</li>
<li>Default routes: VNet space Virtual network ko, 0.0.0.0/0 Internet ko, private ranges None ko.</li>
<li>Longest prefix jeetta hai; tie par UDR, phir BGP, phir system.</li>
<li>UDRs subnet se associated route table mein rehte hain.</li>
<li>Diagnose karte waqt effective routes aur Next hop check karo.</li>
</ul></div>
`}};export{t as default};