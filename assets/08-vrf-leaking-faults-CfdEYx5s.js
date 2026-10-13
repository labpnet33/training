var e={id:`vrf-leaking`,h:{en:`Route leaking between VRFs, typical faults, and PBR vs VRF`,hi:`VRFs ke beech route leaking, typical faults, aur PBR vs VRF`},body:{en:`
<p>Separate flats are great until everyone needs the same lift and the same water tank. Shared services are the lift of a network: DNS, DHCP, a printer, a patch server, the internet firewall. <b>Route leaking</b> is how you cut a controlled doorway between two VRFs, or between a VRF and the global table, without knocking down the walls.</p>

<h3>The need in our lab</h3>
<p>After moving guests into VRF GUEST, the office manager asks that guests use the internal DNS server 192.168.10.53, which sits in the staff LAN in the global table. Nothing else in the staff LAN may be reachable. Two routes are needed, one for each direction:</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Static leaking between VRF GUEST and global">
<rect x="20" y="40" width="250" height="150" rx="10" fill="#fde68a"/><text x="145" y="64" text-anchor="middle" class="svg-ink" font-size="14">VRF GUEST</text><text x="145" y="90" text-anchor="middle" class="svg-muted" font-size="12">192.168.20.0/24 on Gi0/3</text><text x="145" y="112" text-anchor="middle" class="svg-muted" font-size="12">0/0 via 10.0.2.1</text><text x="145" y="150" text-anchor="middle" class="svg-accent" font-size="12">+ 192.168.10.53/32 global</text>
<rect x="370" y="40" width="250" height="150" rx="10" fill="#bbf7d0"/><text x="495" y="64" text-anchor="middle" class="svg-ink" font-size="14">Global table</text><text x="495" y="90" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.0/24 on Gi0/2</text><text x="495" y="112" text-anchor="middle" class="svg-muted" font-size="12">0/0 via 10.0.1.1</text><text x="495" y="150" text-anchor="middle" class="svg-accent" font-size="12">+ 192.168.20.0/24 via Gi0/3</text>
<line x1="270" y1="130" x2="370" y2="130" stroke="#64748b" stroke-width="3"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">leak</text>
<text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">Each direction needs its own route</text>
</svg><p class="cap">Static leaking: a /32 toward the DNS server in the VRF, and a return route to the guest subnet in the global table.</p></div>

<pre class="code"><span class="c">! VRF to global: the next hop is resolved in the GLOBAL table</span>
ip route vrf GUEST 192.168.10.53 255.255.255.255 192.168.10.53 global
<span class="c">! Global to VRF: point at the interface that lives in VRF GUEST</span>
ip route 192.168.20.0 255.255.255.0 GigabitEthernet0/3
<span class="c">! Keep the doorway narrow: guests may only send DNS to the server</span>
ip access-list extended GUEST-IN
 permit udp 192.168.20.0 0.0.0.255 host 192.168.10.53 eq domain
 deny   ip 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255
 permit ip 192.168.20.0 0.0.0.255 any
interface GigabitEthernet0/3
 ip access-group GUEST-IN in</pre>
<p>The <code>global</code> keyword tells IOS "look up this next hop in the global table", and 192.168.10.53 is on the connected staff subnet there. The return route in the global table uses an interface that belongs to the VRF; since guests are on-link on Gi0/3, EDGE simply ARPs for each guest address. Hosts on both sides now reach each other, and the ACL limits the doorway to DNS.</p>
<pre class="out">EDGE# show ip route vrf GUEST 192.168.10.53
Routing Table: GUEST
Routing entry for 192.168.10.53/32
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  <span class="hl">* 192.168.10.53 (default)</span>
      Route metric is 0, traffic share count is 1</pre>
<p>The "(default)" after the next hop means it was resolved in the default (global) table.</p>

<h3>Other leaking methods (preview)</h3>
<ul>
<li><b>VRF to VRF with static routes</b>: a route in one VRF that names an exit interface belonging to another VRF plus a next hop.</li>
<li><b>BGP route targets between local VRFs</b>: give each VRF an RD, export and import route targets, and let BGP copy prefixes between them. This is the MPLS L3VPN machinery used locally; the MPLS module covers it.</li>
<li><b>PBR VRF selection</b>: a route map with <code>set vrf NAME</code> or <code>set global</code> can move matched packets into another table. Powerful but hard to troubleshoot; use sparingly.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> You leak 192.168.10.0/24 into GUEST instead of the /32. Guests can now reach 254 staff addresses, including laptops and printers, and one infected guest phone can scan the whole staff LAN. The /32 plus the ACL exposes one address and one port. Leak the smallest prefix that meets the need.</p></div>

<h3>The typical VRF-lite faults</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Interface in VRF has no IP</td><td>Address configured before <code>vrf forwarding</code></td><td><code>show ip vrf interfaces</code></td></tr>
<tr><td>Neighbour up, routes in wrong table</td><td>One side's subinterface is global, the other in the VRF</td><td><code>show run interface</code> on both ends</td></tr>
<tr><td>No OSPF or EIGRP neighbour in VRF</td><td>Process not bound to the VRF, missing EIGRP AS in the AF</td><td><code>show ip protocols vrf NAME</code></td></tr>
<tr><td>"Route missing" but it exists</td><td>Test without <code>vrf</code> keyword</td><td><code>ping vrf</code>, <code>show ip route vrf</code></td></tr>
<tr><td>Leak works one way only</td><td>No return route in the other table</td><td>Route lookup in both tables</td></tr>
<tr><td>Syslog, NTP or TACACS silent</td><td>Service uses global table; server reachable only in a VRF</td><td>Use the service's <code>vrf</code> option, for example <code>logging host 203.0.113.50 vrf MGMT</code></td></tr>
<tr><td>Leaked prefix conflicts</td><td>Overlapping addresses in both tables</td><td>Use NAT instead of leaking</td></tr>
</table>

<h3>PBR or VRF-lite for the guest problem?</h3>
<table class="cmp"><tr><th>Question</th><th>PBR</th><th>VRF-lite</th></tr>
<tr><td>Isolation of guests from staff</td><td>None: guests can still reach staff via the global table</td><td>Complete, until you leak</td></tr>
<tr><td>Failover if ISP2 dies</td><td>Automatic fallback (with tracking)</td><td>Needs a backup route in the VRF, or leaking</td></tr>
<tr><td>Scope</td><td>Per packet, fine-grained (port, length)</td><td>Per interface, whole table</td></tr>
<tr><td>Operational clarity</td><td>Hidden from <code>show ip route</code></td><td>Visible in <code>show ip route vrf</code></td></tr>
</table>
<p>For a guest network that must be isolated, VRF-lite is usually the better design. For "only web from these hosts via ISP2", PBR is the right tool.</p>

<div class="warn"><p><b>Common mistake.</b> Adding only the VRF-to-global route and declaring success because the router can ping from the VRF. Ping from a real guest host and from the server; without the global-to-VRF return route the server's replies go to the global default route and never return.</p></div>

<div class="exam"><p><b>Exam trap.</b> In <code>ip route vrf GUEST 192.168.10.53 255.255.255.255 192.168.10.53 global</code>, the route is installed in GUEST, but its next hop is looked up in the global table. Questions often ask "in which table is the route installed?" Answer: GUEST.</p></div>

<div class="scn"><h4>The printer everybody could see</h4><p>A co-working space isolated each tenant in its own VRF. A tenant asked for access to the shared printer, and an engineer leaked the entire shared-services /24 into every tenant VRF. A month later a tenant's infected laptop scanned and attacked the shared file server in that /24. The review replaced the /24 leaks with /32 routes for the printer and DNS only, plus inbound ACLs permitting only printing and DNS ports.</p><p><b>Lesson:</b> leaking is a hole in your isolation. Make it as small as the requirement.</p></div>

<div class="iv"><p class="q">"How do you let hosts in a VRF reach a server in the global table?"</p><p>Strong answer: static leaking in both directions. In the VRF, <code>ip route vrf NAME prefix mask next-hop global</code> so the next hop resolves in the global table; in the global table, a route to the VRF subnet pointing at the VRF interface (with a next hop on multi-access links where needed). Keep leaked prefixes as small as possible, protect them with ACLs, and verify from real hosts in both directions. Mention BGP route-target import/export for larger designs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Leaking needs a route in each direction; the <code>global</code> keyword resolves a VRF route's next hop in the global table.</li>
<li>Leak the smallest prefix possible and filter with ACLs.</li>
<li>Common faults: address removed, VRF mismatch between neighbours, process not in VRF, tests without <code>vrf</code>, no return route.</li>
<li>Management services need their own <code>vrf</code> options when servers live in a VRF.</li>
<li>VRF-lite isolates; PBR steers. Choose by the requirement.</li>
</ul></div>
`,hi:`
<p>Alag flats tab tak badhiya hain jab tak sabko ek hi lift aur ek hi paani ki tanki na chahiye. Shared services network ki lift hain: DNS, DHCP, printer, patch server, internet firewall. <b>Route leaking</b> woh tareeka hai jisse aap do VRFs ke beech, ya VRF aur global table ke beech, deewaar giraaye bina ek controlled darwaza kaat-te ho.</p>

<h3>Hamari lab mein zaroorat</h3>
<p>Guests ko VRF GUEST mein daalne ke baad office manager kehta hai ki guests internal DNS server 192.168.10.53 use karein, jo global table mein staff LAN mein hai. Staff LAN mein aur kuch reachable nahi hona chahiye. Do routes chahiye, har direction ke liye ek:</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Static leaking between VRF GUEST and global">
<rect x="20" y="40" width="250" height="150" rx="10" fill="#fde68a"/><text x="145" y="64" text-anchor="middle" class="svg-ink" font-size="14">VRF GUEST</text><text x="145" y="90" text-anchor="middle" class="svg-muted" font-size="12">192.168.20.0/24 Gi0/3 par</text><text x="145" y="112" text-anchor="middle" class="svg-muted" font-size="12">0/0 via 10.0.2.1</text><text x="145" y="150" text-anchor="middle" class="svg-accent" font-size="12">+ 192.168.10.53/32 global</text>
<rect x="370" y="40" width="250" height="150" rx="10" fill="#bbf7d0"/><text x="495" y="64" text-anchor="middle" class="svg-ink" font-size="14">Global table</text><text x="495" y="90" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.0/24 Gi0/2 par</text><text x="495" y="112" text-anchor="middle" class="svg-muted" font-size="12">0/0 via 10.0.1.1</text><text x="495" y="150" text-anchor="middle" class="svg-accent" font-size="12">+ 192.168.20.0/24 via Gi0/3</text>
<line x1="270" y1="130" x2="370" y2="130" stroke="#64748b" stroke-width="3"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">leak</text>
<text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">Har direction ko apna route chahiye</text>
</svg><p class="cap">Static leaking: VRF mein DNS server ki taraf ek /32, aur global table mein guest subnet ka return route.</p></div>

<pre class="code"><span class="c">! VRF se global: next hop GLOBAL table mein resolve hota hai</span>
ip route vrf GUEST 192.168.10.53 255.255.255.255 192.168.10.53 global
<span class="c">! Global se VRF: us interface ko point karo jo VRF GUEST mein hai</span>
ip route 192.168.20.0 255.255.255.0 GigabitEthernet0/3
<span class="c">! Darwaza tang rakho: guests server ko sirf DNS bhej sakein</span>
ip access-list extended GUEST-IN
 permit udp 192.168.20.0 0.0.0.255 host 192.168.10.53 eq domain
 deny   ip 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255
 permit ip 192.168.20.0 0.0.0.255 any
interface GigabitEthernet0/3
 ip access-group GUEST-IN in</pre>
<p><code>global</code> keyword IOS ko kehta hai "is next hop ko global table mein dekho", aur 192.168.10.53 wahan connected staff subnet par hai. Global table ka return route ek aise interface ko use karta hai jo VRF ka hai; kyunki guests Gi0/3 par on-link hain, EDGE har guest address ke liye seedha ARP karta hai. Ab dono side ke hosts ek dusre tak pahunchte hain, aur ACL darwaze ko DNS tak limit karta hai.</p>
<pre class="out">EDGE# show ip route vrf GUEST 192.168.10.53
Routing Table: GUEST
Routing entry for 192.168.10.53/32
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  <span class="hl">* 192.168.10.53 (default)</span>
      Route metric is 0, traffic share count is 1</pre>
<p>Next hop ke baad "(default)" ka matlab hai ki woh default (global) table mein resolve hua.</p>

<h3>Leaking ke doosre tareeke (preview)</h3>
<ul>
<li><b>Static routes se VRF se VRF</b>: ek VRF mein route jo doosre VRF ke exit interface aur next hop ka naam leta hai.</li>
<li><b>Local VRFs ke beech BGP route targets</b>: har VRF ko RD do, route targets export aur import karo, aur BGP ko unke beech prefixes copy karne do. Yeh MPLS L3VPN ki machinery locally use hoti hai; MPLS module ise cover karta hai.</li>
<li><b>PBR VRF selection</b>: <code>set vrf NAME</code> ya <code>set global</code> wala route map matched packets ko doosri table mein bhej sakta hai. Powerful lekin troubleshoot karna mushkil; kam use karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Aap /32 ke bajaye 192.168.10.0/24 GUEST mein leak kar dete ho. Ab guests 254 staff addresses tak pahunch sakte hain, laptops aur printers samet, aur ek infected guest phone poore staff LAN ko scan kar sakta hai. /32 plus ACL ek address aur ek port expose karta hai. Zaroorat poori karne wala sabse chhota prefix leak karo.</p></div>

<h3>Typical VRF-lite faults</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit wajah</th><th>Check</th></tr>
<tr><td>VRF wale interface par IP nahi</td><td>Address <code>vrf forwarding</code> se pehle configure hua</td><td><code>show ip vrf interfaces</code></td></tr>
<tr><td>Neighbour up, routes galat table mein</td><td>Ek side ka subinterface global hai, doosri VRF mein</td><td>Dono ends par <code>show run interface</code></td></tr>
<tr><td>VRF mein koi OSPF ya EIGRP neighbour nahi</td><td>Process VRF se bandha nahi, AF mein EIGRP AS missing</td><td><code>show ip protocols vrf NAME</code></td></tr>
<tr><td>"Route missing" lekin exist karta hai</td><td><code>vrf</code> keyword ke bina test</td><td><code>ping vrf</code>, <code>show ip route vrf</code></td></tr>
<tr><td>Leak sirf ek taraf chalta hai</td><td>Doosri table mein return route nahi</td><td>Dono tables mein route lookup</td></tr>
<tr><td>Syslog, NTP ya TACACS chup</td><td>Service global table use karti hai; server sirf VRF mein reachable</td><td>Service ka <code>vrf</code> option use karo, jaise <code>logging host 203.0.113.50 vrf MGMT</code></td></tr>
<tr><td>Leaked prefix conflict karta hai</td><td>Dono tables mein overlapping addresses</td><td>Leaking ke bajaye NAT use karo</td></tr>
</table>

<h3>Guest problem ke liye PBR ya VRF-lite?</h3>
<table class="cmp"><tr><th>Sawaal</th><th>PBR</th><th>VRF-lite</th></tr>
<tr><td>Guests ka staff se isolation</td><td>Nahi: guests abhi bhi global table se staff tak pahunch sakte hain</td><td>Poora, jab tak leak na karo</td></tr>
<tr><td>ISP2 marne par failover</td><td>Automatic fallback (tracking ke saath)</td><td>VRF mein backup route, ya leaking chahiye</td></tr>
<tr><td>Scope</td><td>Per packet, fine-grained (port, length)</td><td>Per interface, poori table</td></tr>
<tr><td>Operational clarity</td><td><code>show ip route</code> se chhupa</td><td><code>show ip route vrf</code> mein dikhta hai</td></tr>
</table>
<p>Jis guest network ko isolated hona hai, uske liye VRF-lite aam taur par behtar design hai. "Sirf in hosts ka web ISP2 se" ke liye PBR sahi tool hai.</p>

<div class="warn"><p><b>Common galti.</b> Sirf VRF-to-global route jodna aur success declare karna kyunki router VRF se ping kar pa raha hai. Asli guest host se aur server se ping karo; global-to-VRF return route ke bina server ke replies global default route par jaate hain aur kabhi wapas nahi aate.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>ip route vrf GUEST 192.168.10.53 255.255.255.255 192.168.10.53 global</code> mein route GUEST mein install hota hai, lekin uska next hop global table mein dekha jaata hai. Sawaal aksar poochte hain "route kis table mein install hota hai?" Jawab: GUEST.</p></div>

<div class="scn"><h4>Woh printer jo sabko dikhta tha</h4><p>Ek co-working space ne har tenant ko apne VRF mein isolate kiya. Ek tenant ne shared printer ka access maanga, aur engineer ne poora shared-services /24 har tenant VRF mein leak kar diya. Ek mahine baad ek tenant ke infected laptop ne us /24 mein shared file server ko scan karke attack kiya. Review ne /24 leaks ko sirf printer aur DNS ke /32 routes se replace kiya, plus inbound ACLs jo sirf printing aur DNS ports permit karte the.</p><p><b>Seekh:</b> leaking aapke isolation mein ek chhed hai. Use requirement jitna hi chhota rakho.</p></div>

<div class="iv"><p class="q">"VRF ke hosts ko global table ke server tak kaise pahunchne doge?"</p><p>Strong answer: dono directions mein static leaking. VRF mein <code>ip route vrf NAME prefix mask next-hop global</code> taaki next hop global table mein resolve ho; global table mein VRF subnet ka route jo VRF interface ki taraf point kare (multi-access links par zaroorat ho to next hop ke saath). Leaked prefixes jitne ho sake chhote rakho, ACLs se protect karo, aur dono directions mein asli hosts se verify karo. Bade designs ke liye BGP route-target import/export ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Leaking ko har direction mein ek route chahiye; <code>global</code> keyword VRF route ka next hop global table mein resolve karta hai.</li>
<li>Sabse chhota possible prefix leak karo aur ACLs se filter karo.</li>
<li>Common faults: address hat gaya, neighbours ke beech VRF mismatch, process VRF mein nahi, <code>vrf</code> ke bina tests, return route nahi.</li>
<li>Jab servers VRF mein hon to management services ko apne <code>vrf</code> options chahiye.</li>
<li>VRF-lite isolate karta hai; PBR steer karta hai. Requirement se chuno.</li>
</ul></div>
`}};export{e as default};