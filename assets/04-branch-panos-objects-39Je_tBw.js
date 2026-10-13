var e={id:`branch-panos-objects`,h:{en:`Building the branch PAN-OS side: objects step by step`,hi:`Branch PAN-OS side banana: objects step by step`},body:{en:`
<p>Setting up a tunnel on the branch firewall is like preparing the van: you need the lock (crypto), the driver's papers (IKE gateway), the loading door (tunnel interface), the security gate (zone), the road map (virtual router) and the road sign (route). Miss one and the van stays in the garage. This chapter builds each object on BR-FW, in the right order.</p>

<h3>The object list</h3>
<ol>
<li><b>IKE crypto profile</b> (Network &gt; Network Profiles &gt; IKE Crypto).</li>
<li><b>IPsec crypto profile</b> (Network &gt; Network Profiles &gt; IPSec Crypto).</li>
<li><b>IKE gateway</b> (Network &gt; Network Profiles &gt; IKE Gateways).</li>
<li><b>Tunnel interface</b> (Network &gt; Interfaces &gt; Tunnel), placed in a <b>zone</b> and a <b>virtual router</b>.</li>
<li><b>IPsec tunnel</b> (Network &gt; IPSec Tunnels) that ties the gateway, the crypto profile and the tunnel interface together.</li>
<li><b>Route</b> to the cloud: a static route or BGP on the virtual router, pointing at the tunnel interface.</li>
<li><b>Security policy</b> between the LAN zone and the tunnel zone.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Object chain on BR-FW">
<rect x="10" y="60" width="95" height="60" rx="8" fill="#bae6fd"/><text x="57" y="86" text-anchor="middle" class="svg-ink" font-size="12">IKE crypto</text><text x="57" y="104" text-anchor="middle" class="svg-muted" font-size="11">profile</text>
<rect x="125" y="60" width="95" height="60" rx="8" fill="#bae6fd"/><text x="172" y="86" text-anchor="middle" class="svg-ink" font-size="12">IKE gateway</text><text x="172" y="104" text-anchor="middle" class="svg-muted" font-size="11">peer + PSK</text>
<rect x="240" y="60" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="287" y="86" text-anchor="middle" class="svg-ink" font-size="12">IPsec tunnel</text><text x="287" y="104" text-anchor="middle" class="svg-muted" font-size="11">auto key</text>
<rect x="355" y="60" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="402" y="86" text-anchor="middle" class="svg-ink" font-size="12">tunnel.1</text><text x="402" y="104" text-anchor="middle" class="svg-muted" font-size="11">zone + VR</text>
<rect x="470" y="60" width="95" height="60" rx="8" fill="#fde68a"/><text x="517" y="86" text-anchor="middle" class="svg-ink" font-size="12">Route</text><text x="517" y="104" text-anchor="middle" class="svg-muted" font-size="11">static or BGP</text>
<rect x="240" y="140" width="95" height="44" rx="8" fill="#bbf7d0"/><text x="287" y="166" text-anchor="middle" class="svg-ink" font-size="12">IPsec crypto</text>
<line x1="105" y1="90" x2="125" y2="90" stroke="#64748b" stroke-width="2"/><line x1="220" y1="90" x2="240" y2="90" stroke="#64748b" stroke-width="2"/><line x1="335" y1="90" x2="355" y2="90" stroke="#64748b" stroke-width="2"/><line x1="450" y1="90" x2="470" y2="90" stroke="#64748b" stroke-width="2"/><line x1="287" y1="140" x2="287" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Each object points at the next. Build them from the left.</p></div>

<h3>Configuration for the lab</h3>
<pre class="code"><span class="c"># 1 IKE crypto profile: IKEv2, AES-256-CBC, SHA256, DH14, 8 hours</span>
set network ike crypto-profiles ike-crypto-profiles PA-IKE dh-group group14 encryption aes-256-cbc hash sha256 lifetime hours 8
<span class="c"># 2 IPsec crypto profile: ESP AES-256-GCM, 1 hour (PFS group14 or no-pfs, per your design)</span>
set network ike crypto-profiles ipsec-crypto-profiles PA-IPSEC esp encryption aes-256-gcm
set network ike crypto-profiles ipsec-crypto-profiles PA-IPSEC dh-group group14 lifetime hours 1
<span class="c"># 3 IKE gateway: peer is the Service Endpoint Address. NkPrisma2026 is a LAB value only</span>
set network ike gateway PA-GW protocol ikev2 ike-crypto-profile PA-IKE
set network ike gateway PA-GW local-address interface ethernet1/1
set network ike gateway PA-GW peer-address ip 203.0.113.101
set network ike gateway PA-GW authentication pre-shared-key key NkPrisma2026
<span class="c"># 4 tunnel interface, zone and virtual router</span>
set network interface tunnel units tunnel.1 ip 10.254.1.2/32
set zone PRISMA network layer3 tunnel.1
set network virtual-router default interface tunnel.1
<span class="c"># 5 IPsec tunnel binds gateway, crypto and interface</span>
set network tunnel ipsec PA-TUN auto-key ike-gateway PA-GW
set network tunnel ipsec PA-TUN auto-key ipsec-crypto-profile PA-IPSEC
set network tunnel ipsec PA-TUN tunnel-interface tunnel.1
<span class="c"># 6 route: everything to the cloud (static remote network)</span>
set network virtual-router default routing-table ip static-route TO-PRISMA destination 0.0.0.0/0 interface tunnel.1
<span class="c"># 7 policy: LAN to PRISMA</span>
set rulebase security rules LAN-TO-PA from LAN to PRISMA source any destination any application any service application-default action allow
commit</pre>
<p>Command order and keywords follow the PAN-OS hierarchy; confirm with <code>?</code> on your release. In the lab's GUI you fill the same fields in the same order. The full policy model is taught in the policy module; here we only need a rule that lets traffic flow.</p>

<h3>Tunnel monitor and interface IP</h3>
<p>The tunnel interface is allowed to have an IPv4 address (here 10.254.1.2/32). That address is required for <b>Tunnel Monitoring</b> on the PAN-OS tunnel, and it is the address Prisma Access peers with for BGP. Under Show Advanced Options you will also find Enable Replay Protection (anti-replay window 64 to 4096, default 1024), Copy TOS Header and the Proxy IDs tab for policy-based peers.</p>

<h3>Zone and virtual router: do not forget them</h3>
<p>An interface not placed in a zone cannot pass traffic, and an interface not in a virtual router has no routing. These two missing steps are the number one "tunnel is up but nothing works" cause on new branches.</p>

<div class="eg"><p><b>Worked example.</b> PC-BR (10.20.0.100) pings the internet. BR-FW looks up the default route, finds <code>0.0.0.0/0 via tunnel.1</code>, encrypts the packet with ESP and sends it from 198.51.100.10 to 203.0.113.101. If the static route is missing, the packet leaves through the ISP default route in clear text instead. In a real design the WAN keeps a more specific host route to the endpoint so that tunnel packets themselves do not loop into the tunnel.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting the tunnel interface in the wrong virtual router; forgetting the security policy to the tunnel zone; typing the PSK with a hidden trailing space; using a different IKE version than the cloud side expects.</p></div>
<div class="exam"><p><b>Exam trap.</b> PAN-OS VPNs are route-based. The route decides which traffic enters the tunnel. Proxy IDs matter only for policy-based peers.</p></div>

<div class="scn"><h4>Tunnel up, no pings</h4><p>A new branch showed an IPsec SA on BR-FW, yet PC-BR could not reach anything. The engineer found tunnel.1 had been created without a virtual router. Adding it to the default virtual router and adding a route to the tunnel made traffic flow.</p><p><b>Lesson:</b> a tunnel needs zone, virtual router and a route, not only IKE and IPsec objects.</p></div>

<div class="iv"><p class="q">"List the PAN-OS objects for a branch tunnel to Prisma Access."</p><p>IKE crypto profile, IPsec crypto profile, IKE gateway pointing at the Service Endpoint Address, tunnel interface in a zone and virtual router, the IPsec tunnel tying them, a route (static or BGP), and a security rule for the tunnel zone. Then commit and verify with show vpn commands.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Seven items: two crypto profiles, gateway, tunnel interface (zone and VR), tunnel, route, policy.</li>
<li>The IKE gateway peer is the Service Endpoint Address.</li>
<li>Tunnel monitoring needs an IP on the tunnel interface.</li>
<li>No zone or no virtual router means no traffic.</li>
<li>Lab PSK NkPrisma2026 is a lab value only.</li>
</ul></div>
`,hi:`
<p>Branch firewall par tunnel setup karna van taiyaar karne jaisa hai: lock (crypto), driver ke papers (IKE gateway), loading door (tunnel interface), security gate (zone), road map (virtual router) aur road sign (route) chahiye. Ek bhi miss hua to van garage mein hi rahegi. Yeh chapter BR-FW par har object sahi order mein banata hai.</p>

<h3>Object list</h3>
<ol>
<li><b>IKE crypto profile</b> (Network &gt; Network Profiles &gt; IKE Crypto).</li>
<li><b>IPsec crypto profile</b> (Network &gt; Network Profiles &gt; IPSec Crypto).</li>
<li><b>IKE gateway</b> (Network &gt; Network Profiles &gt; IKE Gateways).</li>
<li><b>Tunnel interface</b> (Network &gt; Interfaces &gt; Tunnel), ek <b>zone</b> aur <b>virtual router</b> mein.</li>
<li><b>IPsec tunnel</b> (Network &gt; IPSec Tunnels) jo gateway, crypto profile aur tunnel interface ko jodta hai.</li>
<li>Cloud ki taraf <b>route</b>: virtual router par static route ya BGP, tunnel interface ko point karta hua.</li>
<li>LAN zone aur tunnel zone ke beech <b>security policy</b>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Object chain on BR-FW">
<rect x="10" y="60" width="95" height="60" rx="8" fill="#bae6fd"/><text x="57" y="86" text-anchor="middle" class="svg-ink" font-size="12">IKE crypto</text><text x="57" y="104" text-anchor="middle" class="svg-muted" font-size="11">profile</text>
<rect x="125" y="60" width="95" height="60" rx="8" fill="#bae6fd"/><text x="172" y="86" text-anchor="middle" class="svg-ink" font-size="12">IKE gateway</text><text x="172" y="104" text-anchor="middle" class="svg-muted" font-size="11">peer + PSK</text>
<rect x="240" y="60" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="287" y="86" text-anchor="middle" class="svg-ink" font-size="12">IPsec tunnel</text><text x="287" y="104" text-anchor="middle" class="svg-muted" font-size="11">auto key</text>
<rect x="355" y="60" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="402" y="86" text-anchor="middle" class="svg-ink" font-size="12">tunnel.1</text><text x="402" y="104" text-anchor="middle" class="svg-muted" font-size="11">zone + VR</text>
<rect x="470" y="60" width="95" height="60" rx="8" fill="#fde68a"/><text x="517" y="86" text-anchor="middle" class="svg-ink" font-size="12">Route</text><text x="517" y="104" text-anchor="middle" class="svg-muted" font-size="11">static ya BGP</text>
<rect x="240" y="140" width="95" height="44" rx="8" fill="#bbf7d0"/><text x="287" y="166" text-anchor="middle" class="svg-ink" font-size="12">IPsec crypto</text>
<line x1="105" y1="90" x2="125" y2="90" stroke="#64748b" stroke-width="2"/><line x1="220" y1="90" x2="240" y2="90" stroke="#64748b" stroke-width="2"/><line x1="335" y1="90" x2="355" y2="90" stroke="#64748b" stroke-width="2"/><line x1="450" y1="90" x2="470" y2="90" stroke="#64748b" stroke-width="2"/><line x1="287" y1="140" x2="287" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har object agle ko point karta hai. Left se banana shuru karo.</p></div>

<h3>Lab ke liye configuration</h3>
<pre class="code"><span class="c"># 1 IKE crypto profile: IKEv2, AES-256-CBC, SHA256, DH14, 8 hours</span>
set network ike crypto-profiles ike-crypto-profiles PA-IKE dh-group group14 encryption aes-256-cbc hash sha256 lifetime hours 8
<span class="c"># 2 IPsec crypto profile: ESP AES-256-GCM, 1 hour (PFS group14 ya no-pfs, design ke hisaab se)</span>
set network ike crypto-profiles ipsec-crypto-profiles PA-IPSEC esp encryption aes-256-gcm
set network ike crypto-profiles ipsec-crypto-profiles PA-IPSEC dh-group group14 lifetime hours 1
<span class="c"># 3 IKE gateway: peer Service Endpoint Address hai. NkPrisma2026 sirf LAB value hai</span>
set network ike gateway PA-GW protocol ikev2 ike-crypto-profile PA-IKE
set network ike gateway PA-GW local-address interface ethernet1/1
set network ike gateway PA-GW peer-address ip 203.0.113.101
set network ike gateway PA-GW authentication pre-shared-key key NkPrisma2026
<span class="c"># 4 tunnel interface, zone aur virtual router</span>
set network interface tunnel units tunnel.1 ip 10.254.1.2/32
set zone PRISMA network layer3 tunnel.1
set network virtual-router default interface tunnel.1
<span class="c"># 5 IPsec tunnel gateway, crypto aur interface bind karta hai</span>
set network tunnel ipsec PA-TUN auto-key ike-gateway PA-GW
set network tunnel ipsec PA-TUN auto-key ipsec-crypto-profile PA-IPSEC
set network tunnel ipsec PA-TUN tunnel-interface tunnel.1
<span class="c"># 6 route: sab kuch cloud ki taraf (static remote network)</span>
set network virtual-router default routing-table ip static-route TO-PRISMA destination 0.0.0.0/0 interface tunnel.1
<span class="c"># 7 policy: LAN to PRISMA</span>
set rulebase security rules LAN-TO-PA from LAN to PRISMA source any destination any application any service application-default action allow
commit</pre>
<p>Command order aur keywords PAN-OS hierarchy follow karte hain; apni release par <code>?</code> se confirm karo. Lab ke GUI mein wahi fields wahi order mein bharte ho. Poora policy model policy module mein hai; yahan sirf ek rule chahiye jo traffic flow karne de.</p>

<h3>Tunnel monitor aur interface IP</h3>
<p>Tunnel interface par IPv4 address ho sakta hai (yahan 10.254.1.2/32). PAN-OS tunnel par <b>Tunnel Monitoring</b> ke liye yeh address zaroori hai, aur isi address se Prisma Access BGP peering karta hai. Show Advanced Options mein Enable Replay Protection (anti-replay window 64 se 4096, default 1024), Copy TOS Header aur policy-based peers ke liye Proxy IDs tab bhi milta hai.</p>

<h3>Zone aur virtual router: mat bhoolo</h3>
<p>Jo interface zone mein nahi hai woh traffic pass nahi kar sakta, aur jo virtual router mein nahi hai uski routing nahi hoti. Naye branches par "tunnel up hai par kuch kaam nahi karta" ka number one kaaran yahi do missing steps hain.</p>

<div class="eg"><p><b>Worked example.</b> PC-BR (10.20.0.100) internet ko ping karta hai. BR-FW default route dekhta hai, <code>0.0.0.0/0 via tunnel.1</code> milta hai, packet ko ESP se encrypt karke 198.51.100.10 se 203.0.113.101 bhejta hai. Static route missing ho to packet ISP default route se clear text mein nikalta hai. Real design mein WAN par endpoint ka more specific host route rakhte hain taaki tunnel packets khud tunnel mein loop na ho.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Tunnel interface ko galat virtual router mein daalna; tunnel zone ke liye security policy bhoolna; PSK mein hidden trailing space; cloud side se alag IKE version use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> PAN-OS VPNs route-based hote hain. Route decide karta hai kaun sa traffic tunnel mein jaaye. Proxy IDs sirf policy-based peers ke liye zaroori hain.</p></div>

<div class="scn"><h4>Tunnel up, ping nahi</h4><p>Naye branch par BR-FW par IPsec SA dikha, phir bhi PC-BR kuch reach nahi kar paaya. Engineer ne dekha tunnel.1 bina virtual router ke bana tha. Default virtual router mein daalne aur tunnel ki taraf route add karne se traffic chalne laga.</p><p><b>Lesson:</b> tunnel ko zone, virtual router aur route chahiye, sirf IKE aur IPsec objects nahi.</p></div>

<div class="iv"><p class="q">"Prisma Access ke branch tunnel ke liye PAN-OS objects list karo."</p><p>IKE crypto profile, IPsec crypto profile, Service Endpoint Address ko point karta IKE gateway, zone aur virtual router mein tunnel interface, unhe jodta IPsec tunnel, route (static ya BGP), aur tunnel zone ke liye security rule. Phir commit aur show vpn commands se verify.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Saat cheezein: do crypto profiles, gateway, tunnel interface (zone aur VR), tunnel, route, policy.</li>
<li>IKE gateway ka peer Service Endpoint Address hai.</li>
<li>Tunnel monitoring ke liye tunnel interface par IP chahiye.</li>
<li>Zone ya virtual router nahi to traffic nahi.</li>
<li>Lab PSK NkPrisma2026 sirf lab value hai.</li>
</ul></div>
`}};export{e as default};