var e={id:`addressing-vlans`,h:{en:`Addressing and VLANs: routed mode, VLAN table and LAN ports`,hi:`Addressing aur VLANs: routed mode, VLAN table aur LAN ports`},body:{en:`
<h3>Why VLANs at a branch?</h3>
<p>A <b>VLAN</b> (virtual LAN) splits one physical switch network into several separate broadcast domains, each with its own subnet. At Bharat Retail Co every site uses the same four VLANs so that staff laptops, servers, guests and the network devices themselves never share one flat network.</p>
<table class="cmp"><tr><th>VLAN</th><th>Name</th><th>Subnet (Bengaluru)</th><th>MX address</th><th>Who lives here</th></tr>
<tr><td>10</td><td>Staff</td><td>10.2.10.0/24</td><td>10.2.10.1</td><td>PC-BLR, LAPTOP-BLR, staff Wi-Fi</td></tr>
<tr><td>20</td><td>Servers</td><td>10.2.20.0/24</td><td>10.2.20.1</td><td>SRV-BLR (static)</td></tr>
<tr><td>30</td><td>Guest</td><td>10.2.30.0/24</td><td>10.2.30.1</td><td>Guest Wi-Fi</td></tr>
<tr><td>99</td><td>Management</td><td>10.2.99.0/24</td><td>10.2.99.1</td><td>SW-BLR, AP-BLR (static .2 to .20)</td></tr>
</table>
<p>The pattern is 10.&lt;site&gt;.&lt;vlan&gt;.0/24: site 1 is Mumbai, 2 Bengaluru, 3 Delhi. The MX owns the .1 address in every subnet. That makes planning easy: from the address 10.3.30.114 you know instantly it is a Delhi guest.</p>

<h3>Routed mode and the VLAN table</h3>
<p>The appliance in this track works in <b>routed mode</b>: it is a Layer 3 device that has an address in each VLAN subnet, routes between them, and performs NAT to the internet. (The alternative, passthrough, is outside this module's scope.) The place to configure it is the <b>Addressing and VLANs</b> page. Its <b>VLAN table</b> has one row per VLAN: id, name, subnet, MX IP, DHCP mode. Adding a row creates a gateway interface on the appliance.</p>
<pre class="out">Addressing and VLANs  (network: Bengaluru Branch)
VLAN  Name         Subnet         MX IP        DHCP     
10    Staff        10.2.10.0/24   10.2.10.1    server   
20    Servers      10.2.20.0/24   10.2.20.1    off      
30    Guest        10.2.30.0/24   10.2.30.1    server   
99    Management   10.2.99.0/24   10.2.99.1    off      
<span class="hl">LAN ports: port 3 = trunk, native VLAN 99, allowed 10,20,30,99</span></pre>

<h3>MX LAN ports: access and trunk</h3>
<p>The appliance's LAN-side ports can behave in two ways:</p>
<ul>
<li><b>Access port</b>: carries exactly one VLAN, untagged. Use it to plug in a single device such as a server in VLAN 20.</li>
<li><b>Trunk port</b>: carries several VLANs. Frames of every VLAN are <b>tagged</b> (an extra 802.1Q label with the VLAN id) except the <b>native VLAN</b>, which travels untagged. A trunk also has an <b>allowed VLAN list</b>: VLANs not on the list are dropped on that port.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Trunk between MX and switch">
<rect x="20" y="70" width="160" height="70" rx="10" fill="#bae6fd"/><text x="100" y="100" text-anchor="middle" class="svg-ink" font-size="14">MX-BLR</text><text x="100" y="120" text-anchor="middle" class="svg-muted" font-size="12">LAN port 3 (trunk)</text>
<rect x="460" y="70" width="160" height="70" rx="10" fill="#bbf7d0"/><text x="540" y="100" text-anchor="middle" class="svg-ink" font-size="14">SW-BLR</text><text x="540" y="120" text-anchor="middle" class="svg-muted" font-size="12">uplink port 1 (trunk)</text>
<line x1="180" y1="105" x2="460" y2="105" stroke="#64748b" stroke-width="4"/>
<text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">Tagged: 10, 20, 30   Untagged (native): 99</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">allowed list 10,20,30,99 on both ends; native must match</text>
<rect x="150" y="165" width="340" height="30" rx="6" fill="#fde68a"/><text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="12">Management VLAN 99 must arrive untagged for the switch to be online</text>
</svg><p class="cap">The switch reaches the dashboard through VLAN 99, which travels untagged as the native VLAN.</p></div>

<h3>Why the native VLAN matters for the cloud</h3>
<p>A switch or access point is <b>online</b> in the dashboard only if its management VLAN (99) reaches the appliance untagged. For that, the trunk's native VLAN must be 99 on both the MX LAN port and the switch uplink, the allowed list must include 99, and the MX must have an addressing plan for VLAN 99 with DHCP or static addresses that work. A <b>native VLAN mismatch</b> (99 on one end, 1 on the other) or a missing management VLAN in the allowed list takes the switch, and everything behind it, offline in the dashboard. This is a classic exam topic and you will practise it in the switching module.</p>

<h3>Inter-VLAN routing</h3>
<p>Hosts in different VLANs are in different subnets, so they cannot talk directly. Traffic from PC-BLR (10.2.10.x) to SRV-BLR (10.2.20.10) goes to its default gateway 10.2.10.1 on the appliance, the appliance routes it into VLAN 20, and the <b>firewall rules</b> (next chapters) decide whether it is allowed. This is <b>inter-VLAN routing</b>. At Mumbai the core switch SW-MUM also has interfaces (SVIs) for VLAN 10 and 20; the appliance remains the edge to the internet.</p>

<div class="eg"><p><b>Worked example.</b> You add VLAN 40 for CCTV at Delhi: id 40, name CCTV, subnet 10.3.40.0/24, MX IP 10.3.40.1, DHCP off. Then you add 40 to the allowed list of the MX trunk port and of the switch uplink. If you forget the trunk step the VLAN exists on the MX but never reaches the cameras.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Adding a VLAN row creates a new gateway interface (10.3.40.1) on the MX and makes it route that subnet. Changing the trunk allowed list changes which tagged VLANs the port accepts and sends. Changing the native VLAN changes which VLAN travels untagged, and can cut off management traffic instantly.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Overlapping subnets between sites (a problem later for VPN); typing the wrong mask; creating the VLAN but not adding it to the trunk; changing the native VLAN on one end only; using a host address as MX IP outside the subnet.</p></div>
<div class="exam"><p><b>Exam trap.</b> A trunk's native VLAN carries untagged frames. If the two ends disagree, frames land in the wrong VLAN, and for the management VLAN the device goes offline in the dashboard.</p></div>

<div class="scn"><h4>The camera VLAN that stayed dark</h4><p>An engineer added VLAN 40 for new cameras at Delhi, set the subnet and gateway, and saw no devices. The cameras were on switch ports set to VLAN 40, and the MX had the VLAN, but the MX trunk's allowed list still read 10,20,30,99. Frames tagged 40 were dropped at the trunk. After adding 40 to the allowed list on the MX and the switch uplink, the cameras received addresses.</p><p><b>Lesson:</b> a VLAN needs three things: a subnet on the gateway, a place on the switch ports, and permission on every trunk in between.</p></div>

<div class="iv"><p class="q">"Explain access versus trunk ports and the native VLAN."</p><p>Strong answer: an access port carries one VLAN untagged for an end device; a trunk carries many VLANs tagged with 802.1Q, except the native VLAN, which is untagged. Both ends must agree on the native VLAN and on the allowed list. In a cloud-managed design the management VLAN usually travels as the native VLAN, so a mismatch makes the switch unreachable from the dashboard.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every site uses VLANs 10 Staff, 20 Servers, 30 Guest, 99 Management in 10.&lt;site&gt;.&lt;vlan&gt;.0/24.</li>
<li>The MX is in routed mode and owns .1 in each subnet: it is the gateway and routes between VLANs.</li>
<li>Access = one untagged VLAN; trunk = tagged VLANs plus one native VLAN and an allowed list.</li>
<li>Management VLAN 99 must reach the MX untagged for devices to be online.</li>
<li>Adding a VLAN needs the gateway row and trunk permission end to end.</li>
</ul></div>
`,hi:`
<h3>Branch par VLANs kyun?</h3>
<p><b>VLAN</b> (virtual LAN) ek physical switch network ko kai alag broadcast domains mein baant deta hai, har ek ka apna subnet. Bharat Retail Co mein har site wahi chaar VLANs use karti hai taaki staff laptops, servers, guests aur network devices kabhi ek flat network share na karein.</p>
<table class="cmp"><tr><th>VLAN</th><th>Name</th><th>Subnet (Bengaluru)</th><th>MX address</th><th>Yahan kaun rehta hai</th></tr>
<tr><td>10</td><td>Staff</td><td>10.2.10.0/24</td><td>10.2.10.1</td><td>PC-BLR, LAPTOP-BLR, staff Wi-Fi</td></tr>
<tr><td>20</td><td>Servers</td><td>10.2.20.0/24</td><td>10.2.20.1</td><td>SRV-BLR (static)</td></tr>
<tr><td>30</td><td>Guest</td><td>10.2.30.0/24</td><td>10.2.30.1</td><td>Guest Wi-Fi</td></tr>
<tr><td>99</td><td>Management</td><td>10.2.99.0/24</td><td>10.2.99.1</td><td>SW-BLR, AP-BLR (static .2 se .20)</td></tr>
</table>
<p>Pattern hai 10.&lt;site&gt;.&lt;vlan&gt;.0/24: site 1 Mumbai, 2 Bengaluru, 3 Delhi. MX har subnet mein .1 address rakhta hai. Isse planning aasaan hai: address 10.3.30.114 dekhte hi pata chal jaata hai ki yeh Delhi ka guest hai.</p>

<h3>Routed mode aur VLAN table</h3>
<p>Is track ka appliance <b>routed mode</b> mein kaam karta hai: yeh Layer 3 device hai jiska har VLAN subnet mein address hota hai, woh unke beech route karta hai, aur internet ke liye NAT karta hai. (Alternative, passthrough, is module ke scope ke bahar hai.) Ise configure karne ki jagah <b>Addressing and VLANs</b> page hai. Uski <b>VLAN table</b> mein har VLAN ke liye ek row hoti hai: id, name, subnet, MX IP, DHCP mode. Row add karne se appliance par ek gateway interface ban jaata hai.</p>
<pre class="out">Addressing and VLANs  (network: Bengaluru Branch)
VLAN  Name         Subnet         MX IP        DHCP     
10    Staff        10.2.10.0/24   10.2.10.1    server   
20    Servers      10.2.20.0/24   10.2.20.1    off      
30    Guest        10.2.30.0/24   10.2.30.1    server   
99    Management   10.2.99.0/24   10.2.99.1    off      
<span class="hl">LAN ports: port 3 = trunk, native VLAN 99, allowed 10,20,30,99</span></pre>

<h3>MX LAN ports: access aur trunk</h3>
<p>Appliance ke LAN-side ports do tarah se behave kar sakte hain:</p>
<ul>
<li><b>Access port</b>: bilkul ek VLAN untagged carry karta hai. Ek single device jaise VLAN 20 ke server ko plug karne ke liye use karo.</li>
<li><b>Trunk port</b>: kai VLANs carry karta hai. Har VLAN ke frames <b>tagged</b> hote hain (VLAN id wala extra 802.1Q label) sirf <b>native VLAN</b> ko chhodkar, jo untagged jaata hai. Trunk ki ek <b>allowed VLAN list</b> bhi hoti hai: list mein na hone wale VLANs us port par drop ho jaate hain.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="MX aur switch ke beech trunk">
<rect x="20" y="70" width="160" height="70" rx="10" fill="#bae6fd"/><text x="100" y="100" text-anchor="middle" class="svg-ink" font-size="14">MX-BLR</text><text x="100" y="120" text-anchor="middle" class="svg-muted" font-size="12">LAN port 3 (trunk)</text>
<rect x="460" y="70" width="160" height="70" rx="10" fill="#bbf7d0"/><text x="540" y="100" text-anchor="middle" class="svg-ink" font-size="14">SW-BLR</text><text x="540" y="120" text-anchor="middle" class="svg-muted" font-size="12">uplink port 1 (trunk)</text>
<line x1="180" y1="105" x2="460" y2="105" stroke="#64748b" stroke-width="4"/>
<text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">Tagged: 10, 20, 30   Untagged (native): 99</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">allowed list 10,20,30,99 dono ends par; native match karna chahiye</text>
<rect x="150" y="165" width="340" height="30" rx="6" fill="#fde68a"/><text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="12">Switch online hone ke liye Management VLAN 99 untagged aani chahiye</text>
</svg><p class="cap">Switch dashboard tak VLAN 99 se pahunchta hai, jo native VLAN ke roop mein untagged jaati hai.</p></div>

<h3>Cloud ke liye native VLAN kyun matter karta hai</h3>
<p>Switch ya access point dashboard mein tabhi <b>online</b> hota hai jab uski management VLAN (99) appliance tak untagged pahunche. Iske liye trunk ka native VLAN MX LAN port aur switch uplink dono par 99 hona chahiye, allowed list mein 99 hona chahiye, aur MX ke paas VLAN 99 ka addressing plan hona chahiye jisme DHCP ya static addresses sahi kaam karein. <b>Native VLAN mismatch</b> (ek end par 99, doosre par 1) ya allowed list mein management VLAN ka na hona switch aur uske peeche ki har cheez ko dashboard mein offline kar deta hai. Yeh classic exam topic hai aur aap switching module mein practise karoge.</p>

<h3>Inter-VLAN routing</h3>
<p>Alag VLANs ke hosts alag subnets mein hote hain, isliye woh seedhe baat nahi kar sakte. PC-BLR (10.2.10.x) se SRV-BLR (10.2.20.10) ka traffic apne default gateway 10.2.10.1 par appliance ke paas jaata hai, appliance use VLAN 20 mein route karta hai, aur <b>firewall rules</b> (agle chapters) decide karte hain ki allowed hai ya nahi. Yeh <b>inter-VLAN routing</b> hai. Mumbai mein core switch SW-MUM ke paas bhi VLAN 10 aur 20 ke interfaces (SVIs) hain; appliance internet ka edge rehta hai.</p>

<div class="eg"><p><b>Worked example.</b> Aap Delhi mein CCTV ke liye VLAN 40 add karte ho: id 40, name CCTV, subnet 10.3.40.0/24, MX IP 10.3.40.1, DHCP off. Phir 40 ko MX trunk port aur switch uplink ki allowed list mein add karte ho. Agar trunk step bhool gaye to VLAN MX par to hai lekin cameras tak kabhi nahi pahunchta.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> VLAN row add karne se MX par ek naya gateway interface (10.3.40.1) ban jaata hai aur woh us subnet ko route karne lagta hai. Trunk allowed list badalne se port kaunse tagged VLANs accept aur send karega woh badalta hai. Native VLAN badalne se woh VLAN badalti hai jo untagged jaati hai, aur management traffic turant kat sakta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sites ke beech overlapping subnets (baad mein VPN ke liye problem); mask galat likhna; VLAN banana lekin trunk mein add na karna; native VLAN sirf ek end par badalna; MX IP subnet ke bahar ka host address rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Trunk ka native VLAN untagged frames carry karta hai. Agar dono ends alag hon, frames galat VLAN mein jaate hain, aur management VLAN ke liye device dashboard mein offline ho jaata hai.</p></div>

<div class="scn"><h4>Camera VLAN jo andhera raha</h4><p>Ek engineer ne Delhi mein naye cameras ke liye VLAN 40 add kiya, subnet aur gateway set kiya, aur koi device nahi dikha. Cameras VLAN 40 wale switch ports par the, aur MX ke paas VLAN thi, lekin MX trunk ki allowed list ab bhi 10,20,30,99 thi. 40 se tagged frames trunk par drop ho rahe the. MX aur switch uplink ki allowed list mein 40 add karne ke baad cameras ko addresses mil gaye.</p><p><b>Seekh:</b> VLAN ko teen cheezein chahiye: gateway par subnet, switch ports par jagah, aur beech ke har trunk par permission.</p></div>

<div class="iv"><p class="q">"Access aur trunk ports aur native VLAN samjhao."</p><p>Strong answer: access port end device ke liye ek VLAN untagged carry karta hai; trunk kai VLANs 802.1Q se tagged carry karta hai, sirf native VLAN ko chhodkar jo untagged hai. Dono ends ko native VLAN aur allowed list par agree karna chahiye. Cloud-managed design mein management VLAN aksar native VLAN ke roop mein jaati hai, isliye mismatch switch ko dashboard se unreachable bana deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har site VLANs 10 Staff, 20 Servers, 30 Guest, 99 Management use karti hai, 10.&lt;site&gt;.&lt;vlan&gt;.0/24 mein.</li>
<li>MX routed mode mein hai aur har subnet mein .1 rakhta hai: yeh gateway hai aur VLANs ke beech route karta hai.</li>
<li>Access = ek untagged VLAN; trunk = tagged VLANs plus ek native VLAN aur allowed list.</li>
<li>Devices ke online hone ke liye management VLAN 99 MX tak untagged pahunchni chahiye.</li>
<li>VLAN add karne ke liye gateway row aur end-to-end trunk permission chahiye.</li>
</ul></div>
`}};export{e as default};