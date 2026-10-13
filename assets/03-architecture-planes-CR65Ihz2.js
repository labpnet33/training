var e={id:`architecture-planes`,h:{en:`Architecture: management plane and data plane`,hi:`Architecture: management plane aur data plane`},body:{en:`
<p>Think of a restaurant. The kitchen cooks and serves food; that is the work customers see. Upstairs, the owner's office holds the menu, the recipes and the staff roster. The owner can change the menu from the office, and the kitchen follows the new menu. If the office phone line is cut for an hour, the kitchen still serves customers from the menu it already has. Firewalls and Panorama split their duties in the same way.</p>

<h3>Two planes</h3>
<p>Every firewall has a <b>data plane</b>, which inspects and forwards user traffic, and a <b>management plane</b>, which holds configuration, handles administrator logins, and talks to Panorama. The management plane has its own address: the <b>management interface</b> IP. In the labs it sits on a separate out-of-band network, 192.0.2.0/24 with gateway 192.0.2.1. That network is not drawn in the lab diagrams, but it is essential: it is the road along which Panorama and the firewalls talk.</p>
<table class="tbl"><tr><th>Plane</th><th>Does</th><th>Lab example</th></tr>
<tr><td>Data plane</td><td>Moves user traffic, applies security rules</td><td>ethernet1/1 (WAN, zone untrust), ethernet1/2 (LAN, zone trust)</td></tr>
<tr><td>Management plane</td><td>Configuration, admin access, Panorama connection, log forwarding</td><td>Management IP 192.0.2.11 on NK-PUNE-PA</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Two planes">
<rect x="20" y="20" width="600" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Management network 192.0.2.0/24 (out of band)</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">Panorama .50 - PA1 .11 - PA2 .12 - PA3 .13 - gateway .1</text>
<rect x="60" y="130" width="200" height="70" rx="8" fill="#bae6fd"/><text x="160" y="158" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text><text x="160" y="178" text-anchor="middle" class="svg-muted" font-size="12">mgmt plane + data plane</text>
<rect x="380" y="130" width="200" height="70" rx="8" fill="#bbf7d0"/><text x="480" y="158" text-anchor="middle" class="svg-ink" font-size="13">User traffic</text><text x="480" y="178" text-anchor="middle" class="svg-muted" font-size="12">trust to untrust, WAN, ISP</text>
<line x1="160" y1="80" x2="160" y2="130" stroke="#64748b" stroke-width="2"/><line x1="260" y1="165" x2="380" y2="165" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Panorama reaches the management plane over the management network. User traffic uses the data plane only.</p></div>

<h3>What flows over the management connection</h3>
<p>Panorama and each managed firewall keep a management connection. Over it travel configuration pushes from Panorama, status and job results from the firewall, and, when log forwarding is enabled, the firewall's logs. In real deployments the firewall connects to Panorama on TCP port 3978 for management and log forwarding; check the documentation for your PAN-OS version for any other ports your design needs. The simulator models the decision "can they connect" but does not carry real network sessions on that port.</p>

<h3>Why separate management from user traffic</h3>
<p>Management traffic should not compete with user traffic or depend on the same path. If a WAN link fails, you still want to reach the firewall to fix it. A dedicated management network also lets you restrict who may reach management addresses at all, which is a basic security practice.</p>

<div class="eg"><p><b>Worked example.</b> NK-PUNE-PA has WAN address 203.0.113.2/30 and management IP 192.0.2.11/24. The two addresses live on different networks for different reasons. Pinging the WAN address tests the data plane path; the Panorama connection depends only on the management address, the gateway if the networks differ, and the settings that name Panorama.</p></div>

<div class="warn"><p><b>Common mistake.</b> Diagnosing a Panorama connection problem by testing user traffic. A broken WAN link does not stop a firewall from being Connected to Panorama, and a working WAN does not make it Connected. Look at the management side.</p></div>

<div class="scn"><h4>The firewall that stayed online</h4><p>During a Panorama upgrade window, a branch manager phoned in a panic: "is the internet down?" It was not. The engineer showed that the firewall was still enforcing its last pushed configuration and staff were browsing normally; only central changes were paused for an hour.</p><p><b>Lesson:</b> explain management-plane outages in terms of what is paused (changes and visibility) and what continues (traffic).</p></div>

<div class="iv"><p class="q">"What happens to traffic if Panorama goes down?"</p><p>Traffic keeps flowing; firewalls continue with their last received configuration. You lose central changes, central visibility, and possibly log forwarding (logs queue on the firewall and are delivered later, subject to buffer limits for your PAN-OS version).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data plane forwards user traffic; management plane handles configuration and the Panorama connection.</li>
<li>The management interface has its own IP, often on an out-of-band network.</li>
<li>Real firewalls connect to Panorama on TCP 3978 for management and log forwarding.</li>
<li>A Panorama outage pauses central changes, not traffic.</li>
<li>Test the management path, not user traffic, when a firewall will not connect.</li>
</ul></div>
`,hi:`
<p>Socho ek restaurant. Kitchen khana banata aur serve karta hai; wahi kaam customers dekhte hain. Upar owner ka office hai jahan menu, recipes aur staff roster rakhe hain. Owner office se menu badal sakta hai aur kitchen naya menu follow karti hai. Office ki phone line ek ghante ke liye kat jaye to bhi kitchen apne paas ke menu se customers ko serve karti rehti hai. Firewalls aur Panorama apni duties isi tarah baant te hain.</p>

<h3>Do planes</h3>
<p>Har firewall ka ek <b>data plane</b> hota hai jo user traffic inspect aur forward karta hai, aur ek <b>management plane</b> jo configuration rakhta hai, administrator logins handle karta hai, aur Panorama se baat karta hai. Management plane ka apna address hota hai: <b>management interface</b> IP. Labs mein ye alag out-of-band network par hai, 192.0.2.0/24 gateway 192.0.2.1 ke saath. Ye network lab diagrams mein nahi dikhaya gaya par bahut zaroori hai: isi road par Panorama aur firewalls baat karte hain.</p>
<table class="tbl"><tr><th>Plane</th><th>Kya karta hai</th><th>Lab example</th></tr>
<tr><td>Data plane</td><td>User traffic move karta hai, security rules lagata hai</td><td>ethernet1/1 (WAN, zone untrust), ethernet1/2 (LAN, zone trust)</td></tr>
<tr><td>Management plane</td><td>Configuration, admin access, Panorama connection, log forwarding</td><td>NK-PUNE-PA ka management IP 192.0.2.11</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Do planes">
<rect x="20" y="20" width="600" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Management network 192.0.2.0/24 (out of band)</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">Panorama .50 - PA1 .11 - PA2 .12 - PA3 .13 - gateway .1</text>
<rect x="60" y="130" width="200" height="70" rx="8" fill="#bae6fd"/><text x="160" y="158" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text><text x="160" y="178" text-anchor="middle" class="svg-muted" font-size="12">mgmt plane + data plane</text>
<rect x="380" y="130" width="200" height="70" rx="8" fill="#bbf7d0"/><text x="480" y="158" text-anchor="middle" class="svg-ink" font-size="13">User traffic</text><text x="480" y="178" text-anchor="middle" class="svg-muted" font-size="12">trust se untrust, WAN, ISP</text>
<line x1="160" y1="80" x2="160" y2="130" stroke="#64748b" stroke-width="2"/><line x1="260" y1="165" x2="380" y2="165" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Panorama management plane tak management network se pahunchta hai. User traffic sirf data plane use karta hai.</p></div>

<h3>Management connection par kya chalta hai</h3>
<p>Panorama aur har managed firewall ke beech ek management connection rehta hai. Usi par Panorama se configuration push, firewall se status aur job results, aur log forwarding enabled ho to firewall ke logs chalte hain. Real deployments mein firewall management aur log forwarding ke liye Panorama se TCP port 3978 par connect hota hai; apne design ko aur kaun se ports chahiye ye apne PAN-OS version ki documentation mein check karo. Simulator "connect ho sakte hain ya nahi" ka decision model karta hai par us port par real network sessions nahi chalata.</p>

<h3>Management ko user traffic se alag kyun rakhein</h3>
<p>Management traffic ko user traffic se compete nahi karna chahiye aur na usi path par depend karna chahiye. WAN link fail ho jaye tab bhi aap firewall tak pahunchna chahte ho taaki fix kar sako. Dedicated management network se ye bhi control hota hai ki management addresses tak kaun pahunch sakta hai, jo basic security practice hai.</p>

<div class="eg"><p><b>Worked example.</b> NK-PUNE-PA ka WAN address 203.0.113.2/30 hai aur management IP 192.0.2.11/24. Dono addresses alag networks par alag wajah se hain. WAN address ping karna data plane path test karta hai; Panorama connection sirf management address, gateway (agar networks alag hon) aur Panorama ka naam batane wali settings par depend karta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Panorama connection problem ko user traffic test karke diagnose karna. Toota WAN link firewall ko Panorama se Connected hone se nahi rokta, aur chalta WAN use Connected nahi banata. Management side dekho.</p></div>

<div class="scn"><h4>Firewall jo online raha</h4><p>Panorama upgrade window mein ek branch manager ne ghabrakar phone kiya: "kya internet band hai?" Nahi tha. Engineer ne dikhaya ki firewall last pushed configuration enforce kar raha tha aur staff normally browse kar raha tha; sirf central changes ek ghante ke liye ruke the.</p><p><b>Lesson:</b> management-plane outage ko is tarah samjhao: kya ruka hai (changes aur visibility) aur kya chal raha hai (traffic).</p></div>

<div class="iv"><p class="q">"Panorama down ho jaye to traffic ka kya hota hai?"</p><p>Traffic chalta rehta hai; firewalls last mili configuration par chalte rehte hain. Central changes, central visibility aur shayad log forwarding ruk jati hai (logs firewall par queue hote hain aur baad mein deliver hote hain, buffer limits aapke PAN-OS version par depend karti hain).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data plane user traffic forward karta hai; management plane configuration aur Panorama connection handle karta hai.</li>
<li>Management interface ka apna IP hota hai, aksar out-of-band network par.</li>
<li>Real firewalls management aur log forwarding ke liye TCP 3978 par Panorama se connect hote hain.</li>
<li>Panorama outage central changes rokta hai, traffic nahi.</li>
<li>Firewall na jure to user traffic nahi, management path test karo.</li>
</ul></div>
`}};export{e as default};