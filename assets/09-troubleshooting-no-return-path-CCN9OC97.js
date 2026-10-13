var e={id:`troubleshooting-no-return-path`,h:{en:`Troubleshooting: the no-return-path ticket and other service connection faults`,hi:`Troubleshooting: no-return-path ticket aur doosre service connection faults`},body:{en:`
<p>When a user says "the app does not open", a good engineer does not guess. They follow the packet. Does it leave the laptop? Does it enter the tunnel? Does it arrive at HQ? Does the reply find its way home? This chapter gives a workflow that follows the packet and walks through the lab ticket "No return path", where HQ-FW has no route to the mobile pool 10.200.0.0/23.</p>

<h3>The workflow: follow the packet</h3>
<ol>
<li><b>Client:</b> is LAPTOP-HOME connected and does it have a 10.200.x.x address? (Covered in pa-mobile.)</li>
<li><b>Cloud log:</b> in Log Viewer, is the session allowed? Which rule matched? Which destination zone?</li>
<li><b>Tunnel:</b> Monitor or Insights: Data Centers, Tunnel Status and BGP Status.</li>
<li><b>HQ-FW session:</b> <code>show session all filter source 10.200.0.15</code>. Does the session exist?</li>
<li><b>HQ-FW return route:</b> where does HQ-FW send the reply?</li>
<li><b>Policy and server:</b> security rule from tunnel zone to LAN, server host firewall.</li>
</ol>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Tunnel never forms</td><td>Wrong peer IP (not the service-connection endpoint), PSK, crypto, proxy ID</td><td>show vpn ike-sa, ikemgr.log, Network Details</td></tr>
<tr><td>Tunnel up, BGP Connect</td><td>No HQ route to the Prisma Local Address; wrong Peer AS or Peer Address</td><td>BGP Status dialog</td></tr>
<tr><td>Cloud log allows, no reply (the lab ticket)</td><td>Missing HQ return route to the mobile pool, branch subnets or infrastructure subnet</td><td>show routing route, fib-lookup</td></tr>
<tr><td>Some users work, others not</td><td>Source NAT pool mismatch, or overlap with an HQ network</td><td>Address plan, NAT pool route</td></tr>
<tr><td>Tunnel flaps</td><td>Tunnel monitor host down or unrouted; unstable ISP</td><td>Monitor IP route, link quality</td></tr>
<tr><td>Config change not visible</td><td>Pushed without Service Setup, or not pushed</td><td>Config Status, Sync Status</td></tr>
<tr><td>Random resets with two service connections</td><td>Asymmetric routing through stateful firewalls</td><td>Backbone Routing setting</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Follow the packet">
<rect x="10" y="60" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="60" y="88" text-anchor="middle" class="svg-ink" font-size="12">Client</text><text x="60" y="106" text-anchor="middle" class="svg-muted" font-size="11">10.200.0.15</text>
<rect x="140" y="60" width="100" height="60" rx="8" fill="#bae6fd"/><text x="190" y="88" text-anchor="middle" class="svg-ink" font-size="12">Cloud log</text><text x="190" y="106" text-anchor="middle" class="svg-muted" font-size="11">allowed?</text>
<rect x="270" y="60" width="100" height="60" rx="8" fill="#bae6fd"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="12">Tunnel</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="11">up + BGP</text>
<rect x="400" y="60" width="100" height="60" rx="8" fill="#fde68a"/><text x="450" y="88" text-anchor="middle" class="svg-ink" font-size="12">HQ-FW</text><text x="450" y="106" text-anchor="middle" class="svg-muted" font-size="11">session?</text>
<rect x="530" y="60" width="100" height="60" rx="8" fill="#fed7aa"/><text x="580" y="88" text-anchor="middle" class="svg-ink" font-size="12">Return route</text><text x="580" y="106" text-anchor="middle" class="svg-muted" font-size="11">to pool?</text>
<line x1="110" y1="90" x2="140" y2="90" stroke="#64748b" stroke-width="2"/><line x1="240" y1="90" x2="270" y2="90" stroke="#64748b" stroke-width="2"/><line x1="370" y1="90" x2="400" y2="90" stroke="#64748b" stroke-width="2"/><line x1="500" y1="90" x2="530" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">find the first hop where the packet disappears</text>
</svg><p class="cap">Follow the packet hop by hop. The fault is at the first hop where it vanishes.</p></div>

<h3>Lab ticket: no return path</h3>
<p>LAPTOP-HOME is connected (10.200.0.15) and the tunnel is up. The portal on 10.10.0.50 does not open. The Prisma Access traffic log shows the session allowed.</p>
<pre class="out">admin@HQ-FW&gt; show session all filter source 10.200.0.15
ID    State   Src[sport]/zone/proto           Dst[dport]/zone
1204  ACTIVE  10.200.0.15[51522]/PRISMA/6     10.10.0.50[443]/LAN
<span class="hl">(request seen, no return traffic counted on tunnel.1)</span>

admin@HQ-FW&gt; show routing route
0.0.0.0/0       S   ethernet1/1   192.0.2.1
10.10.0.0/24    C   ethernet1/2
<span class="hl">(no route for 10.200.0.0/23)</span>

admin@HQ-FW&gt; test routing fib-lookup virtual-router default ip 10.200.0.15
<span class="hl">interface ethernet1/1  next-hop 192.0.2.1</span></pre>
<p>HQ-FW sends the reply to the internet gateway. Fix: add a route to 10.200.0.0/23 via tunnel.1 (or make BGP learn it) and run the lookup again:</p>
<pre class="code">set network virtual-router default routing-table ip static-route PA-MOBILE destination 10.200.0.0/23 interface tunnel.1
commit</pre>
<pre class="out">admin@HQ-FW&gt; test routing fib-lookup virtual-router default ip 10.200.0.15
<span class="hl">interface tunnel.1</span></pre>
<p>Retest from the laptop; the session now completes. Do the same check for 10.20.0.0/24 (branch) and 10.255.0.0/24 (infrastructure).</p>

<div class="eg"><p><b>Worked example.</b> Three tests prove success: LAPTOP-HOME opens 10.10.0.50, PC-BR (10.20.0.100) pings 10.10.0.50, and DNS to 10.10.0.53 resolves an internal name. If only the first passes, the branch return route is missing.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading only the cloud log; adding the route to the wrong interface or virtual router; changing the Prisma Access side when HQ is the problem; trying Source NAT as a quick fix without understanding the routing.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Allowed in the traffic log but no reply" is a return-path clue. Evidence is the HQ routing table. Also remember that Panorama needs Commit and Push with Service Setup for service connection changes.</p></div>

<div class="scn"><h4>The route that lived in a spreadsheet</h4><p>A migration plan said "add return routes" but the HQ network change was never raised. Mobile users connected fine but could not use any HQ app. The cloud logs were clean. The engineer ran fib-lookup for a pool address and saw the internet gateway. After a change ticket added the routes, every app worked.</p><p><b>Lesson:</b> cross-team dependencies cause more outages than commands do. Put HQ routes in the plan.</p></div>

<div class="iv"><p class="q">"Users connect but cannot reach the data centre, and cloud logs show allow. What next?"</p><p>I follow the packet to HQ-FW: check the session exists, then the routing table for the mobile pool, branch and infrastructure prefixes, using fib-lookup. If the reply goes to the internet gateway, I add or learn the return routes via the tunnel, confirm the tunnel-zone-to-LAN rule, and retest.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow the packet hop by hop and stop at the first failure.</li>
<li>Allow in the cloud log plus no reply equals a return-path problem.</li>
<li>Prove it with show session and test routing fib-lookup on HQ-FW.</li>
<li>Fix with return routes for pool, branch and infrastructure subnets.</li>
<li>Also check endpoint address, PSK, crypto, tunnel monitor, push and overlap.</li>
</ul></div>
`,hi:`
<p>User kahe "app nahi khulta", to achha engineer guess nahi karta. Woh packet ko follow karta hai. Kya laptop se nikalta hai? Kya tunnel mein jaata hai? Kya HQ tak pahunchta hai? Kya reply ghar ka raasta dhoondh leta hai? Yeh chapter packet follow karne wala workflow deta hai aur lab ticket "No return path" walk-through karta hai, jahan HQ-FW ke paas mobile pool 10.200.0.0/23 ka route nahi hai.</p>

<h3>Workflow: packet ko follow karo</h3>
<ol>
<li><b>Client:</b> LAPTOP-HOME connected hai aur 10.200.x.x address hai? (pa-mobile mein covered.)</li>
<li><b>Cloud log:</b> Log Viewer mein session allowed hai? Kaun sa rule match hua? Destination zone kaun si?</li>
<li><b>Tunnel:</b> Monitor ya Insights: Data Centers, Tunnel Status aur BGP Status.</li>
<li><b>HQ-FW session:</b> <code>show session all filter source 10.200.0.15</code>. Session maujood hai?</li>
<li><b>HQ-FW return route:</b> HQ-FW reply kahan bhejta hai?</li>
<li><b>Policy aur server:</b> tunnel zone se LAN tak security rule, server ka host firewall.</li>
</ol>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Tunnel kabhi nahi banta</td><td>Galat peer IP (service-connection endpoint nahi), PSK, crypto, proxy ID</td><td>show vpn ike-sa, ikemgr.log, Network Details</td></tr>
<tr><td>Tunnel up, BGP Connect</td><td>Prisma Local Address ka HQ route nahi; galat Peer AS ya Peer Address</td><td>BGP Status dialog</td></tr>
<tr><td>Cloud log allow, reply nahi (lab ticket)</td><td>Mobile pool, branch subnets ya infrastructure subnet ka HQ return route missing</td><td>show routing route, fib-lookup</td></tr>
<tr><td>Kuch users chalte hain, kuch nahi</td><td>Source NAT pool mismatch, ya HQ network se overlap</td><td>Address plan, NAT pool route</td></tr>
<tr><td>Tunnel flap</td><td>Tunnel monitor host down ya unrouted; unstable ISP</td><td>Monitor IP route, link quality</td></tr>
<tr><td>Config change dikhta nahi</td><td>Service Setup ke bina push, ya push hi nahi hua</td><td>Config Status, Sync Status</td></tr>
<tr><td>Do service connections ke saath random resets</td><td>Stateful firewalls ke through asymmetric routing</td><td>Backbone Routing setting</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Follow the packet">
<rect x="10" y="60" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="60" y="88" text-anchor="middle" class="svg-ink" font-size="12">Client</text><text x="60" y="106" text-anchor="middle" class="svg-muted" font-size="11">10.200.0.15</text>
<rect x="140" y="60" width="100" height="60" rx="8" fill="#bae6fd"/><text x="190" y="88" text-anchor="middle" class="svg-ink" font-size="12">Cloud log</text><text x="190" y="106" text-anchor="middle" class="svg-muted" font-size="11">allowed?</text>
<rect x="270" y="60" width="100" height="60" rx="8" fill="#bae6fd"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="12">Tunnel</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="11">up + BGP</text>
<rect x="400" y="60" width="100" height="60" rx="8" fill="#fde68a"/><text x="450" y="88" text-anchor="middle" class="svg-ink" font-size="12">HQ-FW</text><text x="450" y="106" text-anchor="middle" class="svg-muted" font-size="11">session?</text>
<rect x="530" y="60" width="100" height="60" rx="8" fill="#fed7aa"/><text x="580" y="88" text-anchor="middle" class="svg-ink" font-size="12">Return route</text><text x="580" y="106" text-anchor="middle" class="svg-muted" font-size="11">pool tak?</text>
<line x1="110" y1="90" x2="140" y2="90" stroke="#64748b" stroke-width="2"/><line x1="240" y1="90" x2="270" y2="90" stroke="#64748b" stroke-width="2"/><line x1="370" y1="90" x2="400" y2="90" stroke="#64748b" stroke-width="2"/><line x1="500" y1="90" x2="530" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">pehla hop dhoondho jahan packet gayab hota hai</text>
</svg><p class="cap">Packet ko hop by hop follow karo. Fault pehle us hop par hai jahan woh gayab hota hai.</p></div>

<h3>Lab ticket: no return path</h3>
<p>LAPTOP-HOME connected hai (10.200.0.15) aur tunnel up hai. 10.10.0.50 ka portal nahi khulta. Prisma Access traffic log mein session allowed dikhta hai.</p>
<pre class="out">admin@HQ-FW&gt; show session all filter source 10.200.0.15
ID    State   Src[sport]/zone/proto           Dst[dport]/zone
1204  ACTIVE  10.200.0.15[51522]/PRISMA/6     10.10.0.50[443]/LAN
<span class="hl">(request dikhi, tunnel.1 par return traffic count nahi)</span>

admin@HQ-FW&gt; show routing route
0.0.0.0/0       S   ethernet1/1   192.0.2.1
10.10.0.0/24    C   ethernet1/2
<span class="hl">(10.200.0.0/23 ka route nahi)</span>

admin@HQ-FW&gt; test routing fib-lookup virtual-router default ip 10.200.0.15
<span class="hl">interface ethernet1/1  next-hop 192.0.2.1</span></pre>
<p>HQ-FW reply internet gateway ko bhejta hai. Fix: tunnel.1 ke through 10.200.0.0/23 ka route add karo (ya BGP se seekhao) aur lookup dobara chalao:</p>
<pre class="code">set network virtual-router default routing-table ip static-route PA-MOBILE destination 10.200.0.0/23 interface tunnel.1
commit</pre>
<pre class="out">admin@HQ-FW&gt; test routing fib-lookup virtual-router default ip 10.200.0.15
<span class="hl">interface tunnel.1</span></pre>
<p>Laptop se dobara test karo; session ab complete hota hai. Yahi check 10.20.0.0/24 (branch) aur 10.255.0.0/24 (infrastructure) ke liye bhi karo.</p>

<div class="eg"><p><b>Worked example.</b> Teen tests success prove karte hain: LAPTOP-HOME 10.10.0.50 kholta hai, PC-BR (10.20.0.100) 10.10.0.50 ko ping karta hai, aur 10.10.0.53 se DNS internal naam resolve karta hai. Sirf pehla pass ho to branch ka return route missing hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf cloud log padhna; route galat interface ya virtual router par daalna; HQ problem ho to Prisma Access side badalna; routing samjhe bina Source NAT ko quick fix banana.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Traffic log mein allowed par reply nahi" return-path ka clue hai. Evidence HQ routing table hai. Yeh bhi yaad rakho ki service connection changes ke liye Panorama ko Service Setup ke saath Commit and Push chahiye.</p></div>

<div class="scn"><h4>Woh route jo spreadsheet mein rehta tha</h4><p>Migration plan mein likha tha "return routes add karo" par HQ network change kabhi raise nahi hua. Mobile users theek se connect hue par koi HQ app use nahi kar paaye. Cloud logs clean the. Engineer ne pool address ke liye fib-lookup chalaya aur internet gateway dikha. Change ticket se routes add hone ke baad har app chala.</p><p><b>Lesson:</b> cross-team dependencies commands se zyada outages karti hain. HQ routes ko plan mein daalo.</p></div>

<div class="iv"><p class="q">"Users connect hote hain par data centre nahi pahunchte, cloud logs allow dikhate hain. Agla step?"</p><p>Main packet ko HQ-FW tak follow karta hoon: session maujood hai check karta hoon, phir routing table mein mobile pool, branch aur infrastructure prefixes fib-lookup se. Reply internet gateway ko jaata ho to tunnel ke through return routes add ya learn karta hoon, tunnel-zone-to-LAN rule confirm karta hoon, aur retest.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Packet ko hop by hop follow karo aur pehli failure par ruk jao.</li>
<li>Cloud log mein allow aur reply nahi matlab return-path problem.</li>
<li>HQ-FW par show session aur test routing fib-lookup se prove karo.</li>
<li>Pool, branch aur infrastructure subnets ke return routes se fix karo.</li>
<li>Endpoint address, PSK, crypto, tunnel monitor, push aur overlap bhi check karo.</li>
</ul></div>
`}};export{e as default};