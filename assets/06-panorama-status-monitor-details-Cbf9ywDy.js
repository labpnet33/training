var e={id:`panorama-status-monitor-details`,h:{en:`Panorama Cloud Services: Status, Monitor and Network Details`,hi:`Panorama Cloud Services: Status, Monitor aur Network Details`},body:{en:`
<p>A car dashboard has three kinds of information. The warning lights tell you quickly if something is wrong. The speed and fuel gauges tell you how the car is doing right now. The service manual page tells you the exact part numbers when you need to fix something. Panorama's Cloud Services section has the same three layers under <b>Panorama, Cloud Services, Status</b>: <b>Status</b> (warning lights), <b>Monitor</b> (gauges) and <b>Network Details</b> (part numbers).</p>

<h3>Where to click</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Panorama pages">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Cloud Services, Status</text>
<rect x="20" y="100" width="170" height="80" rx="8" fill="#bbf7d0"/><text x="105" y="128" text-anchor="middle" class="svg-ink" font-size="14">Status</text><text x="105" y="150" text-anchor="middle" class="svg-muted" font-size="12">Status, Config Status,</text><text x="105" y="166" text-anchor="middle" class="svg-muted" font-size="12">Current Users</text>
<rect x="235" y="100" width="170" height="80" rx="8" fill="#fde68a"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="14">Monitor</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">map, tunnels, BGP,</text><text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="12">bandwidth</text>
<rect x="450" y="100" width="170" height="80" rx="8" fill="#bae6fd"/><text x="535" y="128" text-anchor="middle" class="svg-ink" font-size="14">Network Details</text><text x="535" y="150" text-anchor="middle" class="svg-muted" font-size="12">endpoint addresses,</text><text x="535" y="166" text-anchor="middle" class="svg-muted" font-size="12">BGP status dialogs</text>
<line x1="270" y1="50" x2="130" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><line x1="370" y1="50" x2="510" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three pages. Start at Status, drill into Monitor, use Network Details for exact addresses.</p></div>

<h3>Status: the warning lights</h3>
<p>The Status page lists each Prisma Access location with its <b>Status</b>, <b>Config Status</b> (In sync or Out of sync) and <b>Current Users</b>. After every push you open this page and confirm OK and In sync. Per location it also helps you answer "are users connecting in India West?".</p>
<pre class="out">Cloud Services, Status, Status (teaching view)
Location       Status   Config Status   Current Users
India West     OK       <span class="hl">In sync</span>         12
India South    OK       In sync         7</pre>

<h3>Monitor: the gauges</h3>
<p>Monitor has a map and tabs. <b>Monitor, Remote Networks</b> shows a table with these columns:</p>
<table class="cmp">
<tr><th>Column</th><th>What it tells you</th></tr>
<tr><td>Location</td><td>Where the remote network attaches</td></tr>
<tr><td>Remote Peer</td><td>The branch device's peer address (BR-FW 198.51.100.10 in the lab)</td></tr>
<tr><td>IPSec Termination Node</td><td>Which node terminates the tunnel</td></tr>
<tr><td>ECMP</td><td>Whether ECMP load balancing is configured</td></tr>
<tr><td>Config Status</td><td>In sync or Out of sync</td></tr>
<tr><td>BGP Status</td><td>Connect, Established, Warning or Error</td></tr>
<tr><td>Tunnel Status</td><td>Whether the IPsec tunnel is up</td></tr>
<tr><td>Bandwidth</td><td>Utilisation, shown in red above 80 percent</td></tr>
</table>
<p>BGP Status values: <b>Established</b> is good; <b>Connect</b> means the session is trying; <b>Warning</b> means no update for more than eight minutes; <b>Error</b> means a problem. <b>Monitor, Mobile Users</b> is the matching view for GlobalProtect users.</p>

<h3>Network Details: the part numbers</h3>
<p>Network Details shows the exact addresses you need to configure the other end. Choose the <b>Remote Networks</b> or <b>Service Connection</b> radio button. For a remote network you see the <b>Service Endpoint Address</b> (the peer IP to use on the branch firewall; lab: 203.0.113.101) and the Local IP. For a service connection you see the endpoint for the corporate IPsec device (lab: 203.0.113.102 for HQ-FW). The BGP status dialog gives three views: <b>Peer</b>, <b>Local RIB</b> (routes learned) and <b>RIB Out</b> (routes advertised).</p>

<div class="eg"><p><b>Worked example (lab pa-remote-2 style check).</b> BR-FW (AS 65001, tunnel address 10.254.1.2) peers with the Prisma side (local IP 10.254.1.1). In Monitor, Remote Networks the row for BR-FW shows Tunnel Status up and BGP Status Established. In Network Details, BGP Status, Local RIB lists 10.20.0.0/24 learned from the branch, and RIB Out lists the HQ and mobile prefixes advertised to the branch. All five items agree: tunnel, BGP, learned route, advertised route, config In sync.</p></div>
<pre class="out">Network Details, Remote Networks, BGP Status (teaching view)
Peer          Peer AS   State
10.254.1.2    65001     <span class="hl">Established</span>

Local RIB
10.20.0.0/24   learned from 10.254.1.2</pre>

<h3>Reading in order</h3>
<ol>
<li><b>Status:</b> is the location OK and In sync?</li>
<li><b>Monitor:</b> is the remote network's tunnel up, BGP Established, bandwidth under 80 percent?</li>
<li><b>Network Details:</b> are the peer addresses the same ones configured on the branch device?</li>
<li><b>BGP dialog:</b> is the expected prefix in Local RIB or RIB Out?</li>
<li>Only then move to firewall CLI and logs.</li>
</ol>

<div class="note"><p><b>Names can differ.</b> Panorama menu labels and column order can change between plugin releases. Learn the questions each page answers; the documentation for your plugin version has the exact layout.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading only Tunnel Status and ignoring BGP Status; configuring the branch with an old peer address instead of the Service Endpoint Address in Network Details; ignoring a Warning state because "it is not Error"; looking at the page right after a push and concluding it failed (wait for the job).</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the three BGP views (Peer, Local RIB, RIB Out), the Warning meaning (no update for over eight minutes) and the 80 percent bandwidth threshold in red. The remote network peer IP on the branch must be the Service Endpoint Address from Network Details.</p></div>

<div class="scn"><h4>Tunnel up, no branch routes</h4><p>The branch said it was connected, and Monitor showed Tunnel Status up, but users at the branch could not reach HQ. BGP Status showed Connect for ten minutes. In Network Details the Local IP was 10.254.1.1 but the branch router was peering with a different address. Correcting the peer address on BR-FW brought BGP to Established and RIB Out filled with the HQ prefixes.</p><p><b>Lesson:</b> an up tunnel is not working routing. Read BGP Status too.</p></div>

<div class="iv"><p class="q">"How do you check the health of a remote network in Panorama?"</p><p>Status page for OK and In sync; Monitor, Remote Networks for Tunnel Status, BGP Status and bandwidth; Network Details for Service Endpoint Address and Local IP, and the BGP dialog for Peer, Local RIB and RIB Out. Then confirm from the branch firewall.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cloud Services, Status has three pages: Status, Monitor, Network Details.</li>
<li>Status shows Status, Config Status and Current Users per location.</li>
<li>Monitor, Remote Networks shows tunnel, BGP, ECMP and bandwidth (red above 80 percent).</li>
<li>BGP Status values: Connect, Established, Warning (no update over eight minutes), Error.</li>
<li>Network Details gives the Service Endpoint Address and Local IP and the Peer, Local RIB, RIB Out views.</li>
</ul></div>
`,hi:`
<p>Car dashboard par teen tarah ki information hoti hai. Warning lights jaldi batati hain ki kuch galat hai. Speed aur fuel gauges batate hain ki car abhi kaisi chal rahi hai. Service manual ka page exact part numbers batata hai jab kuch theek karna ho. Panorama ke Cloud Services section mein <b>Panorama, Cloud Services, Status</b> ke neeche wahi teen layers hain: <b>Status</b> (warning lights), <b>Monitor</b> (gauges) aur <b>Network Details</b> (part numbers).</p>

<h3>Kahan click karein</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Panorama pages">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Cloud Services, Status</text>
<rect x="20" y="100" width="170" height="80" rx="8" fill="#bbf7d0"/><text x="105" y="128" text-anchor="middle" class="svg-ink" font-size="14">Status</text><text x="105" y="150" text-anchor="middle" class="svg-muted" font-size="12">Status, Config Status,</text><text x="105" y="166" text-anchor="middle" class="svg-muted" font-size="12">Current Users</text>
<rect x="235" y="100" width="170" height="80" rx="8" fill="#fde68a"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="14">Monitor</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">map, tunnels, BGP,</text><text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="12">bandwidth</text>
<rect x="450" y="100" width="170" height="80" rx="8" fill="#bae6fd"/><text x="535" y="128" text-anchor="middle" class="svg-ink" font-size="14">Network Details</text><text x="535" y="150" text-anchor="middle" class="svg-muted" font-size="12">endpoint addresses,</text><text x="535" y="166" text-anchor="middle" class="svg-muted" font-size="12">BGP status dialogs</text>
<line x1="270" y1="50" x2="130" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><line x1="370" y1="50" x2="510" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Teen pages. Status se shuru karo, Monitor mein drill karo, exact addresses ke liye Network Details use karo.</p></div>

<h3>Status: warning lights</h3>
<p>Status page har Prisma Access location ko uske <b>Status</b>, <b>Config Status</b> (In sync ya Out of sync) aur <b>Current Users</b> ke saath list karta hai. Har push ke baad ye page kholkar OK aur In sync confirm karte ho. Per location ye "India West mein users connect ho rahe hain?" ka jawab bhi deta hai.</p>
<pre class="out">Cloud Services, Status, Status (teaching view)
Location       Status   Config Status   Current Users
India West     OK       <span class="hl">In sync</span>         12
India South    OK       In sync         7</pre>

<h3>Monitor: gauges</h3>
<p>Monitor mein ek map aur tabs hain. <b>Monitor, Remote Networks</b> ek table dikhata hai in columns ke saath:</p>
<table class="cmp">
<tr><th>Column</th><th>Kya batata hai</th></tr>
<tr><td>Location</td><td>Remote network kahan attach hai</td></tr>
<tr><td>Remote Peer</td><td>Branch device ka peer address (lab mein BR-FW 198.51.100.10)</td></tr>
<tr><td>IPSec Termination Node</td><td>Kaunsa node tunnel terminate karta hai</td></tr>
<tr><td>ECMP</td><td>ECMP load balancing configured hai ya nahi</td></tr>
<tr><td>Config Status</td><td>In sync ya Out of sync</td></tr>
<tr><td>BGP Status</td><td>Connect, Established, Warning ya Error</td></tr>
<tr><td>Tunnel Status</td><td>IPsec tunnel up hai ya nahi</td></tr>
<tr><td>Bandwidth</td><td>Utilisation, 80 percent se upar red mein</td></tr>
</table>
<p>BGP Status values: <b>Established</b> achha hai; <b>Connect</b> matlab session koshish kar raha hai; <b>Warning</b> matlab aath minute se zyada koi update nahi; <b>Error</b> matlab problem. <b>Monitor, Mobile Users</b> GlobalProtect users ka matching view hai.</p>

<h3>Network Details: part numbers</h3>
<p>Network Details wo exact addresses dikhata hai jo doosre end ko configure karne ke liye chahiye. <b>Remote Networks</b> ya <b>Service Connection</b> radio button chuno. Remote network ke liye aapko <b>Service Endpoint Address</b> milta hai (branch firewall par use hone wala peer IP; lab: 203.0.113.101) aur Local IP. Service connection ke liye corporate IPsec device ka endpoint milta hai (lab: HQ-FW ke liye 203.0.113.102). BGP status dialog teen views deta hai: <b>Peer</b>, <b>Local RIB</b> (learned routes) aur <b>RIB Out</b> (advertised routes).</p>

<div class="eg"><p><b>Worked example (lab pa-remote-2 style check).</b> BR-FW (AS 65001, tunnel address 10.254.1.2) Prisma side (local IP 10.254.1.1) se peer karta hai. Monitor, Remote Networks mein BR-FW ki row Tunnel Status up aur BGP Status Established dikhati hai. Network Details, BGP Status, Local RIB mein branch se learn hua 10.20.0.0/24 hai, aur RIB Out mein branch ko advertise hue HQ aur mobile prefixes hain. Paanchon cheezein agree karti hain: tunnel, BGP, learned route, advertised route, config In sync.</p></div>
<pre class="out">Network Details, Remote Networks, BGP Status (teaching view)
Peer          Peer AS   State
10.254.1.2    65001     <span class="hl">Established</span>

Local RIB
10.20.0.0/24   learned from 10.254.1.2</pre>

<h3>Order mein padhna</h3>
<ol>
<li><b>Status:</b> location OK aur In sync hai?</li>
<li><b>Monitor:</b> remote network ka tunnel up, BGP Established, bandwidth 80 percent se neeche?</li>
<li><b>Network Details:</b> branch device par configured peer addresses wahi hain?</li>
<li><b>BGP dialog:</b> expected prefix Local RIB ya RIB Out mein hai?</li>
<li>Uske baad hi firewall CLI aur logs par jao.</li>
</ol>

<div class="note"><p><b>Names alag ho sakte hain.</b> Panorama menu labels aur column order plugin releases ke beech badal sakte hain. Har page kaunse sawal answer karta hai wo seekho; exact layout aapke plugin version ki documentation mein hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf Tunnel Status padhna aur BGP Status ignore karna; branch ko Network Details ke Service Endpoint Address ke bajay purane peer address se configure karna; Warning state ko "Error nahi hai" kehkar ignore karna; push ke turant baad page dekhkar maan lena ki fail hua (job ka wait karo).</p></div>
<div class="exam"><p><b>Exam trap.</b> Teen BGP views (Peer, Local RIB, RIB Out), Warning ka matlab (aath minute se zyada update nahi) aur red mein 80 percent bandwidth threshold jaano. Branch par remote network ka peer IP Network Details ka Service Endpoint Address hona chahiye.</p></div>

<div class="scn"><h4>Tunnel up, branch routes nahi</h4><p>Branch ne kaha connected hai, aur Monitor Tunnel Status up dikha raha tha, lekin branch ke users HQ tak nahi pahunch paa rahe the. BGP Status das minute tak Connect dikha. Network Details mein Local IP 10.254.1.1 tha lekin branch router kisi doosre address se peer kar raha tha. BR-FW par peer address sahi karne se BGP Established hua aur RIB Out HQ prefixes se bhar gaya.</p><p><b>Lesson:</b> tunnel up ka matlab routing working nahi. BGP Status bhi padho.</p></div>

<div class="iv"><p class="q">"Panorama mein remote network ki health kaise check karte ho?"</p><p>Status page par OK aur In sync; Monitor, Remote Networks par Tunnel Status, BGP Status aur bandwidth; Network Details par Service Endpoint Address aur Local IP, aur BGP dialog mein Peer, Local RIB, RIB Out. Phir branch firewall se confirm karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cloud Services, Status ke teen pages hain: Status, Monitor, Network Details.</li>
<li>Status har location ka Status, Config Status aur Current Users dikhata hai.</li>
<li>Monitor, Remote Networks tunnel, BGP, ECMP aur bandwidth dikhata hai (80 percent se upar red).</li>
<li>BGP Status values: Connect, Established, Warning (aath minute se zyada update nahi), Error.</li>
<li>Network Details Service Endpoint Address, Local IP aur Peer, Local RIB, RIB Out views deta hai.</li>
</ul></div>
`}};export{e as default};