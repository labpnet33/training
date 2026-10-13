var e={id:`layer2-vlan-interfaces`,h:{en:`Layer 2 interfaces and VLAN interfaces`,hi:`Layer 2 interfaces aur VLAN interfaces`},body:{en:`
<p><b>Analogy: a switch that also has a guard.</b> In Layer 2 mode the firewall acts like a switch with built-in inspection. Ports belong to a VLAN, frames are forwarded by MAC address, and the firewall still checks the traffic between zones.</p>

<div class="warn"><p><b>Simulator note.</b> Layer 2 and VLAN interfaces are not simulated in NK-OS. Every block below is a <b>Reference configuration (not run in the simulator)</b>, and there is no lab for it. For L3 practice use pan-setup; for switching theory use ccna-vlans; for zones and policy use pan-policy and nse4-zones.</p></div>

<h3>The pieces</h3>
<ul>
<li><b>Layer 2 interface:</b> a physical port in Layer 2 mode, assigned to a VLAN object.</li>
<li><b>VLAN object:</b> a named broadcast domain that groups Layer 2 interfaces. Under it the firewall builds a MAC table.</li>
<li><b>VLAN interface:</b> a Layer 3 interface for that VLAN. It gives the VLAN an IP address (a gateway) so traffic can be routed out of it.</li>
<li><b>Layer 2 zone:</b> the zone type for Layer 2 interfaces.</li>
</ul>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code">set network interface ethernet ethernet1/5 layer2
set network interface ethernet ethernet1/6 layer2
set network vlan VLAN-USERS interface [ ethernet1/5 ethernet1/6 ]
set zone l2-users network layer2 [ ethernet1/5 ethernet1/6 ]
set network interface vlan units vlan.10 ip 10.10.10.1/24
set network vlan VLAN-USERS virtual-interface interface vlan.10
set network virtual-router default interface vlan.10
set zone users-gw network layer3 vlan.10
commit</pre>
<p>Hosts in the VLAN reach each other at Layer 2, and if the firewall has a VLAN interface they reach other networks through it as their default gateway at 10.10.10.1.</p>

<h3>Layer 2 subinterfaces</h3>
<p>A Layer 2 interface can also carry tagged traffic. You add Layer 2 subinterfaces with a tag, each assigned to its own VLAN object:</p>
<pre class="code">set network interface ethernet ethernet1/5 layer2 units ethernet1/5.10 tag 10
set network interface ethernet ethernet1/5 layer2 units ethernet1/5.20 tag 20</pre>
<p>VLAN 10 and VLAN 20 traffic then lives in two VLAN objects and can be forced through policy when it crosses between zones.</p>

<h3>Policy in Layer 2 mode</h3>
<p>Two hosts in the same VLAN on the same zone are subject to the intrazone-default (allow), so they talk freely unless you add an explicit deny. Traffic between two Layer 2 zones follows the interzone-default (deny) until a rule exists. Broadcasts and multicast are not forwarded across VLANs and non-IP protocols can be controlled by the zone's protection and by settings such as L2 protocol handling.</p>

<h3>L3 subinterfaces versus Layer 2</h3>
<table>
<tr><th>Question</th><th>L3 subinterfaces</th><th>Layer 2 VLAN</th></tr>
<tr><td>Who is the gateway?</td><td>Subinterface IP</td><td>VLAN interface IP, or an external router</td></tr>
<tr><td>Hosts in one VLAN reach each other</td><td>Switch does it, firewall not involved</td><td>Firewall switches and can inspect</td></tr>
<tr><td>Can the simulator run it?</td><td>Yes</td><td>No</td></tr>
<tr><td>Best for</td><td>Routed segments, policy between VLANs</td><td>Inserting the firewall into an existing flat VLAN without readdressing</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A company wants inspection of traffic within a server VLAN as well as between VLANs. With a Layer 2 design, the server ports connect to the firewall rather than the switch, so server-to-server traffic is inspected. With L3 subinterfaces it would stay on the switch and bypass the firewall.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Creating a VLAN object but forgetting to bind the VLAN interface to it. Putting a Layer 2 interface in a Layer 3 zone. Expecting STP to be forwarded without configuration; a loop between the firewall and a switch is still your problem.</p></div>
<div class="exam"><p><b>Exam trap.</b> The VLAN object is the broadcast domain; the VLAN interface is its Layer 3 gateway. A Layer 2 interface has no IP address of its own.</p></div>

<div class="scn"><h4>A loop at the new firewall</h4><p>A firewall inserted in Layer 2 mode between two switches created a loop because both switches also had a direct link. Spanning tree on the switches blocked one path, and traffic dropped at the next topology change.</p><p><b>Lesson:</b> Layer 2 mode joins you into the switching domain, so treat loops seriously.</p></div>

<div class="iv"><p class="q">"What is the difference between a VLAN object and a VLAN interface?"</p><p>The VLAN object is the Layer 2 domain that groups the Layer 2 interfaces and holds the MAC table. The VLAN interface is the optional Layer 3 interface that gives that VLAN an IP so it can be routed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 2 mode makes the firewall act as a switch with inspection.</li>
<li>VLAN object equals broadcast domain; VLAN interface equals its gateway.</li>
<li>Layer 2 interfaces have no IP.</li>
<li>Same-zone traffic follows the intrazone default (allow).</li>
<li>Not simulated in NK-OS; commands are reference only.</li>
</ul></div>
`,hi:`
<p><b>Analogy: switch jisme guard bhi hai.</b> Layer 2 mode mein firewall inspection wale switch ki tarah kaam karta hai. Ports ek VLAN ke hote hain, frames MAC address se forward hote hain, aur firewall zones ke beech traffic abhi bhi check karta hai.</p>

<div class="warn"><p><b>Simulator note.</b> Layer 2 aur VLAN interfaces NK-OS mein simulate nahi hote. Neeche ka har block <b>Reference configuration (not run in the simulator)</b> hai, aur iska koi lab nahi hai. L3 practice ke liye pan-setup; switching theory ke liye ccna-vlans; zones aur policy ke liye pan-policy aur nse4-zones.</p></div>

<h3>Hisse</h3>
<ul>
<li><b>Layer 2 interface:</b> Layer 2 mode mein physical port, jo VLAN object ko assign hota hai.</li>
<li><b>VLAN object:</b> naam wala broadcast domain jo Layer 2 interfaces ko group karta hai. Iske neeche firewall MAC table banata hai.</li>
<li><b>VLAN interface:</b> us VLAN ka Layer 3 interface. VLAN ko IP address (gateway) deta hai taaki traffic route ho sake.</li>
<li><b>Layer 2 zone:</b> Layer 2 interfaces ke liye zone type.</li>
</ul>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code">set network interface ethernet ethernet1/5 layer2
set network interface ethernet ethernet1/6 layer2
set network vlan VLAN-USERS interface [ ethernet1/5 ethernet1/6 ]
set zone l2-users network layer2 [ ethernet1/5 ethernet1/6 ]
set network interface vlan units vlan.10 ip 10.10.10.1/24
set network vlan VLAN-USERS virtual-interface interface vlan.10
set network virtual-router default interface vlan.10
set zone users-gw network layer3 vlan.10
commit</pre>
<p>VLAN ke hosts Layer 2 par ek doosre tak pahunchte hain, aur firewall ka VLAN interface ho to woh 10.10.10.1 par default gateway ke roop mein doosre networks tak pahunchte hain.</p>

<h3>Layer 2 subinterfaces</h3>
<p>Layer 2 interface tagged traffic bhi carry kar sakta hai. Tag ke saath Layer 2 subinterfaces jodte hain, har ek apne VLAN object ko assign:</p>
<pre class="code">set network interface ethernet ethernet1/5 layer2 units ethernet1/5.10 tag 10
set network interface ethernet ethernet1/5 layer2 units ethernet1/5.20 tag 20</pre>
<p>Tab VLAN 10 aur VLAN 20 ka traffic do VLAN objects mein rehta hai aur zones ke beech paar karte waqt policy se guzarna padta hai.</p>

<h3>Layer 2 mode mein policy</h3>
<p>Ek hi VLAN aur ek hi zone ke do hosts intrazone-default (allow) ke under aate hain, isliye khul kar baat karte hain jab tak explicit deny na ho. Do Layer 2 zones ke beech traffic interzone-default (deny) follow karta hai jab tak rule na ho. Broadcast aur multicast VLANs ke beech forward nahi hote aur non-IP protocols ko zone protection aur L2 protocol handling jaisi settings se control kiya ja sakta hai.</p>

<h3>L3 subinterfaces versus Layer 2</h3>
<table>
<tr><th>Sawal</th><th>L3 subinterfaces</th><th>Layer 2 VLAN</th></tr>
<tr><td>Gateway kaun?</td><td>Subinterface IP</td><td>VLAN interface IP, ya external router</td></tr>
<tr><td>Ek VLAN ke hosts ek doosre tak</td><td>Switch karta hai, firewall shaamil nahi</td><td>Firewall switch karta hai aur inspect kar sakta hai</td></tr>
<tr><td>Simulator chala sakta hai?</td><td>Haan</td><td>Nahi</td></tr>
<tr><td>Kis ke liye best</td><td>Routed segments, VLANs ke beech policy</td><td>Maujooda flat VLAN mein bina readdressing firewall daalna</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Company server VLAN ke andar ke traffic ko bhi inspect karna chahti hai, sirf VLANs ke beech nahi. Layer 2 design mein server ports switch ki jagah firewall se jude hain, isliye server-to-server traffic inspect hota hai. L3 subinterfaces mein woh switch par rehta aur firewall ko bypass karta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> VLAN object banana lekin VLAN interface ko usse bind karna bhool jaana. Layer 2 interface ko Layer 3 zone mein daalna. Yeh ummeed karna ki STP bina configuration forward hoga; firewall aur switch ke beech loop abhi bhi aapki zimmedari hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> VLAN object broadcast domain hai; VLAN interface uska Layer 3 gateway. Layer 2 interface ka apna koi IP nahi hota.</p></div>

<div class="scn"><h4>Naye firewall par loop</h4><p>Do switches ke beech Layer 2 mode mein daale gaye firewall ne loop bana diya kyunki dono switches ka seedha link bhi tha. Switches par spanning tree ne ek path block kiya, aur agle topology change par traffic gir gaya.</p><p><b>Lesson:</b> Layer 2 mode aapko switching domain mein shaamil karta hai, loops ko gambhirta se lo.</p></div>

<div class="iv"><p class="q">"VLAN object aur VLAN interface mein kya fark hai?"</p><p>VLAN object Layer 2 domain hai jo Layer 2 interfaces ko group karta hai aur MAC table rakhta hai. VLAN interface optional Layer 3 interface hai jo us VLAN ko IP deta hai taaki woh route ho sake.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 2 mode firewall ko inspection wale switch ki tarah chalata hai.</li>
<li>VLAN object barabar broadcast domain; VLAN interface barabar uska gateway.</li>
<li>Layer 2 interfaces ka IP nahi hota.</li>
<li>Same-zone traffic intrazone default (allow) follow karta hai.</li>
<li>NK-OS mein simulate nahi; commands sirf reference hain.</li>
</ul></div>
`}};export{e as default};