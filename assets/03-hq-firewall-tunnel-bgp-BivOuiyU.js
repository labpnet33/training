var e={id:`hq-firewall-tunnel-bgp`,h:{en:`The HQ firewall: tunnel and BGP`,hi:`HQ firewall: tunnel aur BGP`},body:{en:`
<p>The cloud side of the corridor is built. Now the warehouse door must match: same lock, same key, same address book. The HQ-FW builds almost the same objects you saw on BR-FW, with two differences: it talks to the <b>service-connection endpoint</b>, and it must announce HQ prefixes and learn Prisma Access prefixes with BGP (or static routes).</p>

<h3>Objects on HQ-FW (a recap with new names)</h3>
<ol>
<li>IKE crypto profile: IKEv2, AES-256-CBC, SHA256, DH14, 8 hours.</li>
<li>IPsec crypto profile: ESP AES-256-GCM, 1 hour.</li>
<li>IKE gateway: local address 192.0.2.10, peer address 203.0.113.102 (the service-connection endpoint), pre-shared key (lab value NkPrisma2026).</li>
<li>Tunnel interface in its own zone and the virtual router. The IP is a /32 used for BGP and tunnel monitoring.</li>
<li>IPsec tunnel tying gateway, profile and interface.</li>
<li>Routes or BGP.</li>
<li>Security policy between the HQ LAN zone and the tunnel zone.</li>
</ol>
<p>For addressing we choose, for this course, tunnel.1 10.254.2.2/32 on HQ-FW and 10.254.2.1/32 as the Prisma Access BGP Local Address. These are course choices, not product defaults. They must not overlap the infrastructure subnet 10.255.0.0/24 or any LAN.</p>

<pre class="code"><span class="c"># HQ-FW: IKE and IPsec crypto (same values as the cloud side)</span>
set network ike crypto-profiles ike-crypto-profiles PA-IKE dh-group group14 encryption aes-256-cbc hash sha256 lifetime hours 8
set network ike crypto-profiles ipsec-crypto-profiles PA-IPSEC esp encryption aes-256-gcm
set network ike crypto-profiles ipsec-crypto-profiles PA-IPSEC dh-group group14 lifetime hours 1
<span class="c"># gateway to the service connection endpoint (NkPrisma2026 is a LAB value only)</span>
set network ike gateway SC-GW protocol ikev2 ike-crypto-profile PA-IKE
set network ike gateway SC-GW local-address interface ethernet1/1
set network ike gateway SC-GW peer-address ip 203.0.113.102
set network ike gateway SC-GW authentication pre-shared-key key NkPrisma2026
<span class="c"># tunnel interface, zone, virtual router, tunnel</span>
set network interface tunnel units tunnel.1 ip 10.254.2.2/32
set zone PRISMA network layer3 tunnel.1
set network virtual-router default interface tunnel.1
set network tunnel ipsec SC-TUN auto-key ike-gateway SC-GW
set network tunnel ipsec SC-TUN auto-key ipsec-crypto-profile PA-IPSEC
set network tunnel ipsec SC-TUN tunnel-interface tunnel.1
commit</pre>
<p>Confirm keywords with <code>?</code> on your PAN-OS release. In the lab GUI you fill the same fields.</p>

<h3>Static route or BGP on the HQ side?</h3>
<p>For the Prisma Access cloud side you also choose static routes or BGP on the service connection. BGP is recommended for HQ because it carries many prefixes (branch subnets, mobile pools, infrastructure) and adapts to changes.</p>
<table class="cmp"><tr><th>Field (cloud side)</th><th>Value in our lab</th><th>Notes</th></tr>
<tr><td>Peer Address</td><td>10.254.2.2</td><td>Router ID of the HQ eBGP router</td></tr>
<tr><td>Peer AS</td><td>65002</td><td>Private AS (RFC 6996) of HQ-FW</td></tr>
<tr><td>Local Address</td><td>10.254.2.1</td><td>Optional; HQ needs a static route to it through the tunnel</td></tr>
<tr><td>Secret</td><td>lab value</td><td>Optional</td></tr>
<tr><td>MRAI</td><td>30</td><td>1 to 600 s</td></tr>
<tr><td>Summarize Mobile User Routes</td><td>on</td><td>One summary for the pools</td></tr>
<tr><td>No-export community</td><td>off</td><td>SCM: Enabled-In / Enabled-Out / Enabled-Both; Panorama: Enabled Out</td></tr>
<tr><td>Don't Advertise Prisma Access Routes</td><td>off</td><td>Turn on only if HQ should not learn them</td></tr>
</table>
<ul>
<li>eBGP TTL is 8.</li>
<li>Prisma Access does <b>not</b> accept a default route from the HQ peer.</li>
<li>IPv6 is optional.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="BGP between Prisma and HQ-FW">
<rect x="20" y="40" width="200" height="110" rx="10" fill="#bae6fd"/><text x="120" y="68" text-anchor="middle" class="svg-ink" font-size="14">Prisma AS 65534</text><text x="120" y="92" text-anchor="middle" class="svg-muted" font-size="12">Local 10.254.2.1/32</text><text x="120" y="112" text-anchor="middle" class="svg-muted" font-size="12">announces pools, branch</text>
<rect x="420" y="40" width="200" height="110" rx="10" fill="#fde68a"/><text x="520" y="68" text-anchor="middle" class="svg-ink" font-size="14">HQ-FW AS 65002</text><text x="520" y="92" text-anchor="middle" class="svg-muted" font-size="12">tunnel.1 10.254.2.2/32</text><text x="520" y="112" text-anchor="middle" class="svg-muted" font-size="12">announces 10.10.0.0/24</text>
<line x1="220" y1="95" x2="420" y2="95" stroke="#64748b" stroke-width="3"/><text x="320" y="85" text-anchor="middle" class="svg-accent" font-size="12">eBGP in IPsec, TTL 8</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">HQ route to 10.254.2.1</text>
</svg><p class="cap">The HQ announces its LAN; Prisma Access announces the cloud-side prefixes.</p></div>

<h3>HQ BGP outline</h3>
<pre class="code"><span class="c"># outline only; confirm keywords with ? on your release</span>
<span class="c"># 1 static route to the Prisma Access Local Address through the tunnel</span>
set network virtual-router default routing-table ip static-route TO-PA-BGP destination 10.254.2.1/32 interface tunnel.1
<span class="c"># 2 enable BGP, router ID 10.254.2.2, local AS 65002</span>
<span class="c"># 3 eBGP peer 10.254.2.1, peer AS 65534, local address tunnel.1</span>
<span class="c"># 4 export 10.10.0.0/24; import and accept Prisma Access prefixes</span></pre>

<div class="eg"><p><b>Worked example.</b> After the push and commit, HQ-FW learns 10.200.0.0/23 (or a summary), 10.20.0.0/24 and 10.255.0.0/24 from AS 65534. The cloud side learns 10.10.0.0/24 from AS 65002. LAPTOP-HOME can now reach 10.10.0.50, and HQ can reply.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Peering HQ to the remote network endpoint 203.0.113.101 instead of 203.0.113.102; forgetting the HQ route to the Local Address; using a public AS; announcing a default route and expecting Prisma Access to accept it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Service connection BGP: Peer Address, Peer AS, Local Address, secret, MRAI 1 to 600 (default 30), Summarize Mobile User Routes, no-export community, Don't Advertise Prisma Access Routes, TTL 8, no default route accepted.</p></div>

<div class="scn"><h4>Wrong endpoint, silent tunnel</h4><p>An HQ engineer used the first endpoint address from an old email. IKE never answered. The service-connection endpoint in Network Details was different from the branch one. Pointing the HQ gateway at the right peer brought the tunnel up.</p><p><b>Lesson:</b> remote networks and service connections have separate endpoint addresses.</p></div>

<div class="iv"><p class="q">"What do you configure on the HQ firewall for a service connection?"</p><p>IKE and IPsec crypto profiles, an IKE gateway to the service-connection endpoint, a tunnel interface in a zone and virtual router, an IPsec tunnel, a security rule, and BGP with Prisma Access (peer AS 65534, local AS private) or static routes. I add a route to the Prisma Access local address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HQ-FW mirrors the branch objects but uses the service-connection endpoint.</li>
<li>BGP: HQ private AS, Prisma infrastructure AS 65534, TTL 8.</li>
<li>HQ needs a route to the Prisma Access Local Address.</li>
<li>Prisma Access does not accept a default route from HQ.</li>
<li>Course addresses 10.254.2.1 and 10.254.2.2 are examples, not defaults.</li>
</ul></div>
`,hi:`
<p>Corridor ka cloud side ban gaya. Ab warehouse ka darwaza match karna hai: same lock, same key, same address book. HQ-FW lagbhag wahi objects banata hai jo aapne BR-FW par dekhe, do farq ke saath: yeh <b>service-connection endpoint</b> se baat karta hai, aur isse BGP (ya static routes) se HQ prefixes announce karne aur Prisma Access prefixes seekhne padte hain.</p>

<h3>HQ-FW ke objects (naye naamon ke saath recap)</h3>
<ol>
<li>IKE crypto profile: IKEv2, AES-256-CBC, SHA256, DH14, 8 hours.</li>
<li>IPsec crypto profile: ESP AES-256-GCM, 1 hour.</li>
<li>IKE gateway: local address 192.0.2.10, peer address 203.0.113.102 (service-connection endpoint), pre-shared key (lab value NkPrisma2026).</li>
<li>Apne zone mein tunnel interface aur virtual router. IP ek /32 hai jo BGP aur tunnel monitoring ke liye use hota hai.</li>
<li>Gateway, profile aur interface ko jodta IPsec tunnel.</li>
<li>Routes ya BGP.</li>
<li>HQ LAN zone aur tunnel zone ke beech security policy.</li>
</ol>
<p>Addressing ke liye is course mein hum HQ-FW par tunnel.1 10.254.2.2/32 aur Prisma Access BGP Local Address 10.254.2.1/32 choose karte hain. Yeh course ke choices hain, product defaults nahi. Inhe infrastructure subnet 10.255.0.0/24 ya kisi LAN se overlap nahi karna chahiye.</p>

<pre class="code"><span class="c"># HQ-FW: IKE aur IPsec crypto (cloud side jaisi same values)</span>
set network ike crypto-profiles ike-crypto-profiles PA-IKE dh-group group14 encryption aes-256-cbc hash sha256 lifetime hours 8
set network ike crypto-profiles ipsec-crypto-profiles PA-IPSEC esp encryption aes-256-gcm
set network ike crypto-profiles ipsec-crypto-profiles PA-IPSEC dh-group group14 lifetime hours 1
<span class="c"># service connection endpoint ka gateway (NkPrisma2026 sirf LAB value hai)</span>
set network ike gateway SC-GW protocol ikev2 ike-crypto-profile PA-IKE
set network ike gateway SC-GW local-address interface ethernet1/1
set network ike gateway SC-GW peer-address ip 203.0.113.102
set network ike gateway SC-GW authentication pre-shared-key key NkPrisma2026
<span class="c"># tunnel interface, zone, virtual router, tunnel</span>
set network interface tunnel units tunnel.1 ip 10.254.2.2/32
set zone PRISMA network layer3 tunnel.1
set network virtual-router default interface tunnel.1
set network tunnel ipsec SC-TUN auto-key ike-gateway SC-GW
set network tunnel ipsec SC-TUN auto-key ipsec-crypto-profile PA-IPSEC
set network tunnel ipsec SC-TUN tunnel-interface tunnel.1
commit</pre>
<p>Apni PAN-OS release par keywords <code>?</code> se confirm karo. Lab GUI mein wahi fields bharte ho.</p>

<h3>HQ side par static route ya BGP?</h3>
<p>Prisma Access cloud side par bhi service connection mein static routes ya BGP chunna hota hai. HQ ke liye BGP recommended hai kyunki yeh bahut prefixes (branch subnets, mobile pools, infrastructure) carry karta hai aur changes ke saath adapt hota hai.</p>
<table class="cmp"><tr><th>Field (cloud side)</th><th>Hamari lab mein value</th><th>Notes</th></tr>
<tr><td>Peer Address</td><td>10.254.2.2</td><td>HQ eBGP router ka router ID</td></tr>
<tr><td>Peer AS</td><td>65002</td><td>HQ-FW ka private AS (RFC 6996)</td></tr>
<tr><td>Local Address</td><td>10.254.2.1</td><td>Optional; HQ ko tunnel ke through uska static route chahiye</td></tr>
<tr><td>Secret</td><td>lab value</td><td>Optional</td></tr>
<tr><td>MRAI</td><td>30</td><td>1 se 600 s</td></tr>
<tr><td>Summarize Mobile User Routes</td><td>on</td><td>Pools ke liye ek summary</td></tr>
<tr><td>No-export community</td><td>off</td><td>SCM: Enabled-In / Enabled-Out / Enabled-Both; Panorama: Enabled Out</td></tr>
<tr><td>Don't Advertise Prisma Access Routes</td><td>off</td><td>Sirf tab on karo jab HQ ko woh routes nahi seekhne</td></tr>
</table>
<ul>
<li>eBGP TTL 8 hai.</li>
<li>Prisma Access HQ peer se default route <b>accept nahi</b> karta.</li>
<li>IPv6 optional hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="BGP between Prisma and HQ-FW">
<rect x="20" y="40" width="200" height="110" rx="10" fill="#bae6fd"/><text x="120" y="68" text-anchor="middle" class="svg-ink" font-size="14">Prisma AS 65534</text><text x="120" y="92" text-anchor="middle" class="svg-muted" font-size="12">Local 10.254.2.1/32</text><text x="120" y="112" text-anchor="middle" class="svg-muted" font-size="12">pools, branch announce</text>
<rect x="420" y="40" width="200" height="110" rx="10" fill="#fde68a"/><text x="520" y="68" text-anchor="middle" class="svg-ink" font-size="14">HQ-FW AS 65002</text><text x="520" y="92" text-anchor="middle" class="svg-muted" font-size="12">tunnel.1 10.254.2.2/32</text><text x="520" y="112" text-anchor="middle" class="svg-muted" font-size="12">announces 10.10.0.0/24</text>
<line x1="220" y1="95" x2="420" y2="95" stroke="#64748b" stroke-width="3"/><text x="320" y="85" text-anchor="middle" class="svg-accent" font-size="12">eBGP in IPsec, TTL 8</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">HQ route to 10.254.2.1</text>
</svg><p class="cap">HQ apna LAN announce karta hai; Prisma Access cloud-side prefixes announce karta hai.</p></div>

<h3>HQ BGP outline</h3>
<pre class="code"><span class="c"># sirf outline; apni release par ? se keywords confirm karo</span>
<span class="c"># 1 tunnel ke through Prisma Access Local Address ka static route</span>
set network virtual-router default routing-table ip static-route TO-PA-BGP destination 10.254.2.1/32 interface tunnel.1
<span class="c"># 2 BGP enable, router ID 10.254.2.2, local AS 65002</span>
<span class="c"># 3 eBGP peer 10.254.2.1, peer AS 65534, local address tunnel.1</span>
<span class="c"># 4 10.10.0.0/24 export; Prisma Access prefixes import aur accept</span></pre>

<div class="eg"><p><b>Worked example.</b> Push aur commit ke baad HQ-FW AS 65534 se 10.200.0.0/23 (ya summary), 10.20.0.0/24 aur 10.255.0.0/24 seekhta hai. Cloud side AS 65002 se 10.10.0.0/24 seekhti hai. LAPTOP-HOME ab 10.10.0.50 tak pahunch sakta hai, aur HQ jawab de sakta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> HQ ko 203.0.113.102 ki jagah remote network endpoint 203.0.113.101 se peer karna; Local Address ka HQ route bhoolna; public AS use karna; default route announce karke Prisma Access se accept hone ki ummeed.</p></div>
<div class="exam"><p><b>Exam trap.</b> Service connection BGP: Peer Address, Peer AS, Local Address, secret, MRAI 1 se 600 (default 30), Summarize Mobile User Routes, no-export community, Don't Advertise Prisma Access Routes, TTL 8, default route accept nahi.</p></div>

<div class="scn"><h4>Galat endpoint, khamosh tunnel</h4><p>HQ engineer ne purane email ka pehla endpoint address use kiya. IKE ko kabhi jawab nahi mila. Network Details mein service-connection endpoint branch wale se alag tha. HQ gateway ko sahi peer par point karne se tunnel up ho gaya.</p><p><b>Lesson:</b> remote networks aur service connections ke endpoint addresses alag hote hain.</p></div>

<div class="iv"><p class="q">"Service connection ke liye HQ firewall par kya configure karte ho?"</p><p>IKE aur IPsec crypto profiles, service-connection endpoint ka IKE gateway, zone aur virtual router mein tunnel interface, IPsec tunnel, security rule, aur Prisma Access ke saath BGP (peer AS 65534, local AS private) ya static routes. Prisma Access local address ka route bhi add karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HQ-FW branch objects ki tarah banta hai par service-connection endpoint use karta hai.</li>
<li>BGP: HQ private AS, Prisma infrastructure AS 65534, TTL 8.</li>
<li>HQ ko Prisma Access Local Address ka route chahiye.</li>
<li>Prisma Access HQ se default route accept nahi karta.</li>
<li>Course addresses 10.254.2.1 aur 10.254.2.2 examples hain, defaults nahi.</li>
</ul></div>
`}};export{e as default};