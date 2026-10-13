var e={id:`ipv6-deploy`,h:{en:`IPv6 deployment strategies: dual stack, tunnels and NAT64`,hi:`IPv6 deployment strategies: dual stack, tunnels aur NAT64`},body:{en:`
<h3>Customer case: Sundara State University</h3>
<div class="eg"><p><b>Organisation:</b> Sundara State University, 28,000 students, 3,500 staff. <b>Sites:</b> a main campus, two satellite campuses linked by an MPLS service, and a data center hosting the learning portal. <b>Drivers:</b> a government mandate requires public-facing services to be reachable over IPv6 within 12 months; the student Wi-Fi has run out of private IPv4 address space and uses heavy carrier-grade NAT; a new research grant needs IPv6-only lab segments. <b>Constraints:</b> the MPLS provider offers IPv4 only today, the legacy student-records server speaks IPv4 only, the team is 6 engineers, and the budget allows software upgrades but no new core routers. Documentation prefix used here: 2001:db8::/32.</p></div>

<h3>Why IPv6, in plain words</h3>
<p>Analogy: IPv4 is a phone system that ran out of numbers, so everyone shares extensions behind one switchboard (NAT). IPv6 gives every device its own full number (128 bits, about 3.4 times 10 to the power 38 addresses). It removes the need for NAT for address saving, simplifies headers, and is required by some governments and mobile networks. But your applications, firewalls, monitoring and staff are all IPv4 today, so the real design problem is <b>transition</b>, not addressing.</p>

<h3>The three transition families</h3>
<table class="cmp"><tr><th>Strategy</th><th>What it is</th><th>Use when</th><th>Trade-off</th></tr>
<tr><td><b>Dual stack</b></td><td>Every device and link runs IPv4 and IPv6 side by side</td><td>You control the network end to end</td><td>Doubles routing, ACLs, monitoring and TCAM use; still needs IPv4 addresses</td></tr>
<tr><td><b>Tunnelling</b></td><td>IPv6 packets carried inside IPv4 (manual tunnel, GRE, 6to4, ISATAP, 6rd) or across MPLS with 6PE/6VPE</td><td>The underlying path (provider, core) is IPv4 only</td><td>MTU issues, harder troubleshooting, performance; a temporary tool</td></tr>
<tr><td><b>Translation</b></td><td>NAT64 plus DNS64 let IPv6-only clients reach IPv4-only servers</td><td>You want IPv6-only clients while IPv4 services remain</td><td>Breaks IPv4 literals and some protocols; needs DNS64</td></tr></table>
<p><b>NAT64 and DNS64.</b> An IPv6-only client asks the DNS64 resolver for a name that only has an IPv4 address. DNS64 invents a synthetic AAAA record using the well-known prefix 64:ff9b::/96 with the IPv4 address embedded. The client sends to that address, the NAT64 gateway maps it to IPv4, and returns the reply. In 464XLAT, a client-side translator also helps IPv4-literal apps.</p>

<h3>Design options for Sundara</h3>
<table class="cmp"><tr><th>Area</th><th>Option A</th><th>Option B</th><th>Chosen</th></tr>
<tr><td>Campus LAN</td><td>Dual stack</td><td>IPv6-only</td><td>Dual stack on wired and staff Wi-Fi</td></tr>
<tr><td>Student Wi-Fi</td><td>Dual stack with CGNAT</td><td>IPv6-only plus NAT64/DNS64</td><td>IPv6-only SSID with NAT64/DNS64 (frees IPv4)</td></tr>
<tr><td>Satellite campuses over IPv4 MPLS</td><td>Wait for provider</td><td>Tunnel IPv6 over IPv4 (GRE)</td><td>GRE tunnels now, native when provider adds IPv6</td></tr>
<tr><td>Public services</td><td>Dual stack on servers</td><td>Dual-stack load balancer or reverse proxy in front</td><td>Dual-stack proxy; legacy server stays IPv4 behind it</td></tr></table>
<p><b>Addressing plan.</b> Obtain a /32 from the regional registry (or a /48 from the provider if small). Give each campus a /40 and each building a /48; give each VLAN a /64 (always /64 for SLAAC). Use subnets that summarise per site so the WAN carries a few prefixes. Use OSPFv3 or MP-BGP with the IPv6 address family; use IPv6 first-hop security: <b>RA Guard</b> (blocks rogue router advertisements), <b>DHCPv6 Guard</b>, and ND inspection, which matter because a student can otherwise advertise a fake default router. For address assignment, SLAAC is simplest; DHCPv6 gives audit trails for staff networks; the two can be combined (managed or other-config flags in the router advertisement).</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="IPv6 transition at Sundara University">
<rect x="10" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="50" text-anchor="middle" class="svg-ink" font-size="13">IPv6-only Wi-Fi</text>
<rect x="10" y="100" width="130" height="50" rx="8" fill="#bae6fd"/><text x="75" y="130" text-anchor="middle" class="svg-ink" font-size="13">Dual-stack LAN</text>
<rect x="200" y="50" width="120" height="70" rx="10" fill="#ddd6fe"/><text x="260" y="80" text-anchor="middle" class="svg-ink" font-size="13">Campus core</text><text x="260" y="100" text-anchor="middle" class="svg-muted" font-size="12">dual stack</text>
<rect x="380" y="10" width="110" height="50" rx="8" fill="#fde68a"/><text x="435" y="40" text-anchor="middle" class="svg-ink" font-size="13">NAT64 + DNS64</text>
<rect x="380" y="80" width="110" height="50" rx="8" fill="#fed7aa"/><text x="435" y="110" text-anchor="middle" class="svg-ink" font-size="13">GRE tunnel</text>
<rect x="540" y="10" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="585" y="40" text-anchor="middle" class="svg-ink" font-size="13">IPv4 apps</text>
<rect x="540" y="80" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="585" y="102" text-anchor="middle" class="svg-ink" font-size="12">Satellite</text><text x="585" y="119" text-anchor="middle" class="svg-ink" font-size="12">campuses</text>
<line x1="140" y1="45" x2="200" y2="75" stroke="#64748b" stroke-width="2"/><line x1="140" y1="125" x2="200" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="75" x2="380" y2="35" stroke="#64748b" stroke-width="2"/><line x1="320" y1="95" x2="380" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="490" y1="35" x2="540" y2="35" stroke="#64748b" stroke-width="2"/><line x1="490" y1="105" x2="540" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="200" width="14" height="14" fill="#bbf7d0"/><text x="30" y="212" class="svg-ink" font-size="12">IPv6-only</text>
<rect x="120" y="200" width="14" height="14" fill="#bae6fd"/><text x="140" y="212" class="svg-ink" font-size="12">dual stack</text>
<rect x="240" y="200" width="14" height="14" fill="#fde68a"/><text x="260" y="212" class="svg-ink" font-size="12">translation</text>
<rect x="360" y="200" width="14" height="14" fill="#fed7aa"/><text x="380" y="212" class="svg-ink" font-size="12">tunnel</text>
<rect x="450" y="200" width="14" height="14" fill="#e2e8f0"/><text x="470" y="212" class="svg-ink" font-size="12">IPv4-only</text>
</svg><p class="cap">Each segment uses the lightest tool that works: dual stack inside, translation for IPv6-only clients, tunnels where the WAN is IPv4 only.</p></div>

<pre class="code">ipv6 unicast-routing
interface GigabitEthernet0/0/0
 description Campus-core-uplink
 ip address 192.0.2.1 255.255.255.0
 ipv6 address 2001:db8:10:1::1/64
 ipv6 ospf 1 area 0
ipv6 router ospf 1
 router-id 192.0.2.1
<span class="c">! Temporary GRE tunnel to a satellite campus over the IPv4 WAN</span>
interface Tunnel10
 ipv6 address 2001:db8:ff:10::1/64
 tunnel source GigabitEthernet0/0/0
 tunnel destination 198.51.100.20
 tunnel mode gre ip
 ipv6 ospf 1 area 1</pre>
<pre class="out">Router# show ipv6 ospf neighbor
Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
198.51.100.20     1   <span class="hl">FULL/  -</span>        00:00:34    14              Tunnel10</pre>

<h3>Transition planning steps</h3>
<ol>
<li><b>Inventory:</b> which devices, applications, firewalls and monitoring tools support IPv6.</li>
<li><b>Address plan and DNS:</b> prefix hierarchy, AAAA records, reverse zones.</li>
<li><b>Edge first:</b> make public services reachable over IPv6 (satisfies the mandate fast).</li>
<li><b>Core and campus:</b> dual stack with security parity: the same ACL and firewall policy for both protocols.</li>
<li><b>Retire IPv4 where it makes sense</b> (IPv6-only segments).</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Enabling IPv6 without IPv6 security (hosts get an address and routes silently, bypassing IPv4-only firewalls); forgetting tunnel MTU (GRE adds 24 bytes, causing PMTUD blackholes); using a non-/64 subnet with SLAAC.</p></div>
<div class="exam"><p><b>Exam trap.</b> DNS64 plus NAT64 is for IPv6-only clients reaching IPv4 servers, not the reverse. Dual stack is the preferred default; tunnelling is a transition aid. Well-known NAT64 prefix is 64:ff9b::/96.</p></div>

<div class="scn"><h4>Post-mortem: the invisible IPv6 path</h4><p>After enabling dual stack in the library, the security team saw a student laptop reaching the research network. The IPv4 ACLs blocked it, but nobody had written IPv6 equivalents, and hosts preferred IPv6. The team copied the policy to IPv6 ACLs, enabled RA Guard on access ports and added IPv6 to the SIEM.</p><p><b>Lesson:</b> every IPv6 rollout needs IPv6 security parity on day one.</p></div>

<div class="iv"><p class="q">"Dual stack, tunnel or NAT64: how do you decide?"</p><p>Start with dual stack where I control the path. Use tunnels only where the transport is IPv4-only and as a temporary measure. Use NAT64/DNS64 when I want IPv6-only clients that still reach IPv4 services. Mention security parity and the addressing plan.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dual stack is the default; tunnelling bridges IPv4-only transport; NAT64/DNS64 serves IPv6-only clients.</li>
<li>Plan addresses hierarchically: /48 per site, /64 per VLAN.</li>
<li>Apply RA Guard, DHCPv6 Guard and equal ACL policy for IPv6.</li>
<li>Do the public edge first, then campus, then retire IPv4 selectively.</li>
<li>Watch MTU on tunnels.</li>
</ul></div>
`,hi:`
<h3>Customer case: Sundara State University</h3>
<div class="eg"><p><b>Organisation:</b> Sundara State University, 28,000 students, 3,500 staff. <b>Sites:</b> ek main campus, MPLS service se jude do satellite campuses, aur learning portal host karne wala data center. <b>Drivers:</b> government mandate ke mutabiq public-facing services 12 mahine mein IPv6 par reachable honi chahiye; student Wi-Fi ka private IPv4 address space khatam ho gaya hai aur heavy carrier-grade NAT use hota hai; ek naye research grant ko IPv6-only lab segments chahiye. <b>Constraints:</b> MPLS provider abhi sirf IPv4 deta hai, legacy student-records server sirf IPv4 bolta hai, team mein 6 engineers hain, aur budget software upgrades allow karta hai lekin naye core routers nahi. Yahan documentation prefix 2001:db8::/32 use hua hai.</p></div>

<h3>IPv6 kyun, saral shabdon mein</h3>
<p>Analogy: IPv4 aisa phone system hai jiske numbers khatam ho gaye, isliye sab ek switchboard (NAT) ke peeche extensions share karte hain. IPv6 har device ko apna poora number deta hai (128 bits, lagbhag 3.4 guna 10 ki power 38 addresses). Yeh address bachane ke liye NAT ki zaroorat hata deta hai, headers simple karta hai, aur kuch governments aur mobile networks ke liye zaroori hai. Lekin aapki applications, firewalls, monitoring aur staff sab aaj IPv4 par hain, isliye asli design problem addressing nahi, <b>transition</b> hai.</p>

<h3>Transition ke teen families</h3>
<table class="cmp"><tr><th>Strategy</th><th>Kya hai</th><th>Kab use karein</th><th>Trade-off</th></tr>
<tr><td><b>Dual stack</b></td><td>Har device aur link IPv4 aur IPv6 saath saath chalata hai</td><td>Network par end to end control ho</td><td>Routing, ACLs, monitoring aur TCAM use double; phir bhi IPv4 addresses chahiye</td></tr>
<tr><td><b>Tunnelling</b></td><td>IPv6 packets IPv4 ke andar carry (manual tunnel, GRE, 6to4, ISATAP, 6rd) ya MPLS par 6PE/6VPE</td><td>Underlying path (provider, core) sirf IPv4 ho</td><td>MTU issues, troubleshooting mushkil, performance; temporary tool</td></tr>
<tr><td><b>Translation</b></td><td>NAT64 aur DNS64 se IPv6-only clients IPv4-only servers tak pahunchte hain</td><td>IPv6-only clients chahiye jabki IPv4 services bachi hain</td><td>IPv4 literals aur kuch protocols toot sakte hain; DNS64 chahiye</td></tr></table>
<p><b>NAT64 aur DNS64.</b> IPv6-only client DNS64 resolver se aise naam ka jawab maangta hai jiska sirf IPv4 address hai. DNS64 well-known prefix 64:ff9b::/96 mein IPv4 address embed karke synthetic AAAA record banata hai. Client us address par bhejta hai, NAT64 gateway use IPv4 mein map karta hai aur reply wapas deta hai. 464XLAT mein client-side translator IPv4-literal apps ki bhi madad karta hai.</p>

<h3>Sundara ke liye design options</h3>
<table class="cmp"><tr><th>Area</th><th>Option A</th><th>Option B</th><th>Chosen</th></tr>
<tr><td>Campus LAN</td><td>Dual stack</td><td>IPv6-only</td><td>Wired aur staff Wi-Fi par dual stack</td></tr>
<tr><td>Student Wi-Fi</td><td>CGNAT ke saath dual stack</td><td>IPv6-only plus NAT64/DNS64</td><td>NAT64/DNS64 ke saath IPv6-only SSID (IPv4 free hota hai)</td></tr>
<tr><td>IPv4 MPLS par satellite campuses</td><td>Provider ka wait</td><td>IPv4 par IPv6 tunnel (GRE)</td><td>Abhi GRE tunnels, provider IPv6 de to native</td></tr>
<tr><td>Public services</td><td>Servers par dual stack</td><td>Aage dual-stack load balancer ya reverse proxy</td><td>Dual-stack proxy; legacy server uske peeche IPv4 par</td></tr></table>
<p><b>Addressing plan.</b> Regional registry se /32 lo (ya chhote ke liye provider se /48). Har campus ko /40, har building ko /48, har VLAN ko /64 do (SLAAC ke liye hamesha /64). Subnets aise rakho ki har site summarise ho, taaki WAN kam prefixes carry kare. OSPFv3 ya IPv6 address family wala MP-BGP use karo; IPv6 first-hop security lagao: <b>RA Guard</b> (rogue router advertisements block karta hai), <b>DHCPv6 Guard</b>, aur ND inspection, kyunki warna koi student fake default router advertise kar sakta hai. Address assignment ke liye SLAAC sabse simple hai; staff networks ke liye DHCPv6 audit trail deta hai; dono router advertisement ke managed ya other-config flags se combine ho sakte hain.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Sundara University mein IPv6 transition">
<rect x="10" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="50" text-anchor="middle" class="svg-ink" font-size="13">IPv6-only Wi-Fi</text>
<rect x="10" y="100" width="130" height="50" rx="8" fill="#bae6fd"/><text x="75" y="130" text-anchor="middle" class="svg-ink" font-size="13">Dual-stack LAN</text>
<rect x="200" y="50" width="120" height="70" rx="10" fill="#ddd6fe"/><text x="260" y="80" text-anchor="middle" class="svg-ink" font-size="13">Campus core</text><text x="260" y="100" text-anchor="middle" class="svg-muted" font-size="12">dual stack</text>
<rect x="380" y="10" width="110" height="50" rx="8" fill="#fde68a"/><text x="435" y="40" text-anchor="middle" class="svg-ink" font-size="13">NAT64 + DNS64</text>
<rect x="380" y="80" width="110" height="50" rx="8" fill="#fed7aa"/><text x="435" y="110" text-anchor="middle" class="svg-ink" font-size="13">GRE tunnel</text>
<rect x="540" y="10" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="585" y="40" text-anchor="middle" class="svg-ink" font-size="13">IPv4 apps</text>
<rect x="540" y="80" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="585" y="102" text-anchor="middle" class="svg-ink" font-size="12">Satellite</text><text x="585" y="119" text-anchor="middle" class="svg-ink" font-size="12">campuses</text>
<line x1="140" y1="45" x2="200" y2="75" stroke="#64748b" stroke-width="2"/><line x1="140" y1="125" x2="200" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="75" x2="380" y2="35" stroke="#64748b" stroke-width="2"/><line x1="320" y1="95" x2="380" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="490" y1="35" x2="540" y2="35" stroke="#64748b" stroke-width="2"/><line x1="490" y1="105" x2="540" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="200" width="14" height="14" fill="#bbf7d0"/><text x="30" y="212" class="svg-ink" font-size="12">IPv6-only</text>
<rect x="120" y="200" width="14" height="14" fill="#bae6fd"/><text x="140" y="212" class="svg-ink" font-size="12">dual stack</text>
<rect x="240" y="200" width="14" height="14" fill="#fde68a"/><text x="260" y="212" class="svg-ink" font-size="12">translation</text>
<rect x="360" y="200" width="14" height="14" fill="#fed7aa"/><text x="380" y="212" class="svg-ink" font-size="12">tunnel</text>
<rect x="450" y="200" width="14" height="14" fill="#e2e8f0"/><text x="470" y="212" class="svg-ink" font-size="12">IPv4-only</text>
</svg><p class="cap">Har segment sabse halka tool use karta hai jo kaam kare: andar dual stack, IPv6-only clients ke liye translation, jahan WAN sirf IPv4 hai wahan tunnels.</p></div>

<pre class="code">ipv6 unicast-routing
interface GigabitEthernet0/0/0
 description Campus-core-uplink
 ip address 192.0.2.1 255.255.255.0
 ipv6 address 2001:db8:10:1::1/64
 ipv6 ospf 1 area 0
ipv6 router ospf 1
 router-id 192.0.2.1
<span class="c">! Temporary GRE tunnel to a satellite campus over the IPv4 WAN</span>
interface Tunnel10
 ipv6 address 2001:db8:ff:10::1/64
 tunnel source GigabitEthernet0/0/0
 tunnel destination 198.51.100.20
 tunnel mode gre ip
 ipv6 ospf 1 area 1</pre>
<pre class="out">Router# show ipv6 ospf neighbor
Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
198.51.100.20     1   <span class="hl">FULL/  -</span>        00:00:34    14              Tunnel10</pre>

<h3>Transition planning ke steps</h3>
<ol>
<li><b>Inventory:</b> kaunse devices, applications, firewalls aur monitoring tools IPv6 support karte hain.</li>
<li><b>Address plan aur DNS:</b> prefix hierarchy, AAAA records, reverse zones.</li>
<li><b>Pehle edge:</b> public services ko IPv6 par reachable banao (mandate jaldi poora hota hai).</li>
<li><b>Core aur campus:</b> security parity ke saath dual stack: dono protocols ke liye same ACL aur firewall policy.</li>
<li><b>Jahan sense bane wahan IPv4 retire karo</b> (IPv6-only segments).</li>
</ol>

<div class="warn"><p><b>Common galtiyan.</b> IPv6 security ke bina IPv6 enable karna (hosts ko address aur routes chupchap mil jaate hain aur IPv4-only firewalls bypass ho jaate hain); tunnel MTU bhool jana (GRE 24 bytes jodta hai, jisse PMTUD blackholes hote hain); SLAAC ke saath non-/64 subnet use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> DNS64 plus NAT64 IPv6-only clients ko IPv4 servers tak pahunchane ke liye hai, ulta nahi. Dual stack preferred default hai; tunnelling transition aid hai. Well-known NAT64 prefix 64:ff9b::/96 hai.</p></div>

<div class="scn"><h4>Post-mortem: invisible IPv6 path</h4><p>Library mein dual stack enable karne ke baad security team ne dekha ki ek student laptop research network tak pahunch raha hai. IPv4 ACLs use block kar rahe the, lekin kisi ne IPv6 equivalents likhe hi nahi the, aur hosts IPv6 prefer karte hain. Team ne policy ko IPv6 ACLs mein copy kiya, access ports par RA Guard enable kiya aur SIEM mein IPv6 jodi.</p><p><b>Seekh:</b> har IPv6 rollout ko pehle din se IPv6 security parity chahiye.</p></div>

<div class="iv"><p class="q">"Dual stack, tunnel ya NAT64: kaise decide karoge?"</p><p>Jahan path par mera control hai wahan dual stack se shuru. Tunnels sirf wahan jahan transport IPv4-only ho, aur temporary measure ke taur par. NAT64/DNS64 tab jab mujhe IPv6-only clients chahiye jo phir bhi IPv4 services tak pahunchen. Security parity aur addressing plan ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dual stack default hai; tunnelling IPv4-only transport ko bridge karti hai; NAT64/DNS64 IPv6-only clients ke liye.</li>
<li>Addresses hierarchically plan karo: har site /48, har VLAN /64.</li>
<li>RA Guard, DHCPv6 Guard aur IPv6 ke liye barabar ACL policy lagao.</li>
<li>Pehle public edge, phir campus, phir selectively IPv4 retire karo.</li>
<li>Tunnels par MTU dhyan se dekho.</li>
</ul></div>
`}};export{e as default};