var e={id:`goals`,h:{en:`Where does the firewall sit? The big picture`,hi:`Firewall kahan baithta hai? Big picture`},body:{en:`
<p>Picture an office building that already works: people walk the same corridors every day, every room has a number, and visitors find their way without help. Security now wants to check everybody. There are two ways to do it. You can build a <b>new reception desk</b> between two wings, give each wing a new set of room numbers and send every visitor to the desk for directions. Or you can drop a <b>scanner gate into an existing corridor</b>: nobody's room number changes, people walk exactly the same route, but everyone now passes through the gate. The first is a <b>routed</b> firewall, the second a <b>transparent</b> firewall. This module is about choosing and building the right one, and then keeping traffic flowing when a link or an internet provider fails.</p>

<h3>What you will learn</h3>
<ul>
<li>How to choose between <b>routed</b> and <b>transparent</b> firewall mode, and what each one can and cannot do.</li>
<li>How a transparent firewall really forwards: <b>bridge groups</b>, the <b>BVI</b> (bridge virtual interface), the <b>MAC address table</b>, <b>ARP inspection</b>, and which traffic passes by default.</li>
<li>How to allow non-IP traffic (BPDUs, IS-IS, MPLS) with <b>EtherType ACLs</b>.</li>
<li>The interface types you design with: physical, subinterfaces, <b>redundant</b> interfaces, <b>EtherChannel</b>, bridge groups and IRB.</li>
<li>The IPS-only modes on Threat Defense: <b>inline set</b>, <b>inline tap</b>, <b>passive</b> (SPAN) and <b>passive ERSPAN</b>, plus <b>fail-open</b> and hardware bypass.</li>
<li>High-availability and form-factor pointers: failover, clustering, ASA multiple contexts and Threat Defense multi-instance, virtual and cloud firewalls, and the managers that run them.</li>
<li><b>Static route tracking</b> with <code>sla monitor</code> and <code>track</code> for dual-ISP designs, on the ASA and on Threat Defense.</li>
<li><b>ECMP</b> and <b>ECMP (traffic) zones</b>, load sharing across two providers, and running dynamic routing on the firewall.</li>
<li>A repeatable troubleshooting workflow for all of the above.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should already be comfortable with the ASA basics from earlier modules: <code>nameif</code>, security levels, static routes, PAT (sec-asa-basics), ACLs and object groups (sec-asa-acl), NAT (sec-asa-nat), and <code>packet-tracer</code>, captures and syslog (sec-asa-tshoot). Failover and clustering were built in sec-asa-ha; here we only point to them where they change a design decision. Threat Defense policies, deployment from the Management Center and intrusion policies come in the next modules (sec-ftd and sec-ftd-ips); this module previews only the <i>interface modes</i> those policies run on.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Three deployment questions">
<rect x="20" y="20" width="190" height="90" rx="10" fill="#bae6fd"/><text x="115" y="48" text-anchor="middle" class="svg-ink" font-size="14">1. How does it sit?</text><text x="115" y="70" text-anchor="middle" class="svg-muted" font-size="12">routed or transparent</text><text x="115" y="88" text-anchor="middle" class="svg-muted" font-size="12">bridge groups, BVI</text>
<rect x="225" y="20" width="190" height="90" rx="10" fill="#ddd6fe"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">2. Which interfaces?</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">EtherChannel, redundant</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="12">inline set, tap, passive</text>
<rect x="430" y="20" width="190" height="90" rx="10" fill="#bbf7d0"/><text x="525" y="48" text-anchor="middle" class="svg-ink" font-size="14">3. Which exits?</text><text x="525" y="70" text-anchor="middle" class="svg-muted" font-size="12">tracked dual ISP</text><text x="525" y="88" text-anchor="middle" class="svg-muted" font-size="12">ECMP zones, dynamic</text>
<rect x="120" y="160" width="400" height="60" rx="10" fill="#fde68a"/><text x="320" y="186" text-anchor="middle" class="svg-ink" font-size="14">Plus: how does it survive failure?</text><text x="320" y="206" text-anchor="middle" class="svg-muted" font-size="12">failover, cluster, fail-open, cloud load balancers</text>
<line x1="115" y1="110" x2="220" y2="160" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="110" x2="320" y2="160" stroke="#64748b" stroke-width="1.5"/><line x1="525" y1="110" x2="420" y2="160" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Every firewall deployment answers the same questions, whatever the box or the manager.</p></div>

<h3>Why deployment design matters</h3>
<p>Most firewall outages are not caused by a bad rule. They are caused by a <b>deployment</b> decision: a transparent firewall that blocks spanning tree BPDUs and creates a loop, an inline IPS with fail-closed interfaces that drops the whole data centre during a software restart, or a default route that stays in the table while the provider behind it is dead. Rules decide <i>what</i> is allowed; deployment decides whether anything flows at all. That is why the SNCF exam opens with this domain, and why interviewers love to ask "routed or transparent, and why?"</p>

<h3>The three labs in this module</h3>
<table class="cmp"><tr><th>Lab</th><th>What you build</th><th>Chapters</th></tr>
<tr><td>Insert a transparent firewall without re-addressing</td><td>ASA1 between SW-IN and SW-OUT in 10.0.1.0/24, bridge group 1, BVI1 10.0.1.5, <code>inspect icmp</code>, an ACL for MON 10.0.1.250 to reach SRV 10.0.1.20 on HTTP, then read the MAC table</td><td>3, 4, 5</td></tr>
<tr><td>Dual ISP with IP SLA static route tracking</td><td>NK-ASA with ISP1 on <code>outside</code> (203.0.113.1) and ISP2 on <code>backup</code> (198.51.100.1), probe 4.2.2.2 every 5 s, tracked default route, floating route distance 254, failover and fail-back</td><td>9, 10</td></tr>
<tr><td>Ticket: route tracking that never tracks</td><td>INC-9021: an SLA that targets the wrong address and was never scheduled; find, fix and prove</td><td>11</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A branch LAN is 10.0.1.0/24 with its router R-GW at 10.0.1.1. Forty PCs, two printers and a web server SRV (10.0.1.20) all use 10.0.1.1 as their gateway. A routed firewall would need a new transit subnet and a new gateway on every host, or a renumbered router. A transparent firewall with one management address, BVI1 10.0.1.5, goes between the LAN switch and the router tonight, and not a single host setting changes. Next door, the head office has two internet providers; there the firewall must be routed (it does NAT for both exits), and the design question becomes route tracking.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking "transparent" means "no security policy". A transparent firewall enforces exactly the same security levels, ACLs and inspections as a routed one. The day you insert it, inbound connections that used to work will be denied until you write the rules.</p></div>

<div class="exam"><p><b>Exam trap.</b> Firewall mode (routed or transparent) and IPS interface modes (inline set, inline tap, passive) are different things. A Threat Defense device in <b>routed</b> mode can still have an inline set or a passive interface on other ports. Read the question for which one is being asked.</p></div>

<div class="scn"><h4>The firewall nobody could find</h4><p>A retail company asked a contractor to "put a firewall in front of the POS VLAN" during a Sunday window with a strict rule: no IP changes on the tills. The contractor installed a routed firewall and planned to change the tills' gateway through DHCP. Half the tills had static addresses, and on Monday morning they could not reach the payment host. The rollback took two hours. The second attempt used transparent mode: the tills kept 10.20.5.1 as their gateway, the firewall bridged the VLAN, and the change took 20 minutes.</p><p><b>Lesson:</b> "no re-addressing allowed" is the classic requirement that points to transparent mode.</p></div>

<div class="iv"><p class="q">"You must add a firewall to an existing network. How do you decide how to deploy it?"</p><p>A strong answer walks through the questions in order: can hosts or routers be re-addressed (if not, transparent); do we need NAT, VPN termination or dynamic routing on the box (if so, routed); does the IPS need to block or only watch (inline set or passive); how many exits and how do we detect a dead provider (route tracking, ECMP); and how does it survive failure (failover, clustering, fail-open). Mention that the decision is made up front because changing firewall mode erases the configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routed = a layer 3 hop with its own subnets; transparent = a layer 2 "bump in the wire" that keeps all addressing.</li>
<li>Deployment decisions (mode, interface type, exits, HA) cause more outages than individual rules.</li>
<li>IPS-only interface modes are separate from firewall mode and can coexist with it on Threat Defense.</li>
<li>Route tracking detects a dead provider that an "interface up" check misses.</li>
<li>The three labs map to transparent insertion, dual-ISP tracking and a tracking troubleshooting ticket.</li>
</ul></div>
`,hi:`
<p>Ek office building socho jo pehle se chal rahi hai: log roz same corridors mein chalte hain, har room ka ek number hai, aur visitors bina madad ke rasta dhoondh lete hain. Ab security sabko check karna chahti hai. Iske do tareeke hain. Aap do wings ke beech ek <b>naya reception desk</b> bana sakte ho, har wing ko naye room numbers de sakte ho aur har visitor ko directions ke liye desk par bhej sakte ho. Ya aap <b>existing corridor mein ek scanner gate</b> laga sakte ho: kisi ka room number nahi badalta, log bilkul same raste chalte hain, lekin ab har koi gate se guzarta hai. Pehla <b>routed</b> firewall hai, doosra <b>transparent</b> firewall. Yeh module sahi wala chunne aur banane ke baare mein hai, aur phir link ya internet provider fail hone par traffic chalu rakhne ke baare mein.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li><b>Routed</b> aur <b>transparent</b> firewall mode ke beech kaise chunein, aur har ek kya kar sakta hai aur kya nahi.</li>
<li>Transparent firewall asal mein kaise forward karta hai: <b>bridge groups</b>, <b>BVI</b> (bridge virtual interface), <b>MAC address table</b>, <b>ARP inspection</b>, aur default mein kaunsa traffic pass hota hai.</li>
<li>Non-IP traffic (BPDUs, IS-IS, MPLS) ko <b>EtherType ACLs</b> se kaise allow karein.</li>
<li>Design ke interface types: physical, subinterfaces, <b>redundant</b> interfaces, <b>EtherChannel</b>, bridge groups aur IRB.</li>
<li>Threat Defense par IPS-only modes: <b>inline set</b>, <b>inline tap</b>, <b>passive</b> (SPAN) aur <b>passive ERSPAN</b>, plus <b>fail-open</b> aur hardware bypass.</li>
<li>High-availability aur form-factor pointers: failover, clustering, ASA multiple contexts aur Threat Defense multi-instance, virtual aur cloud firewalls, aur unhe chalane wale managers.</li>
<li>Dual-ISP designs ke liye <code>sla monitor</code> aur <code>track</code> ke saath <b>static route tracking</b>, ASA aur Threat Defense dono par.</li>
<li><b>ECMP</b> aur <b>ECMP (traffic) zones</b>, do providers par load sharing, aur firewall par dynamic routing chalana.</li>
<li>In sab ke liye ek repeatable troubleshooting workflow.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko pichhle modules ke ASA basics pehle se aane chahiye: <code>nameif</code>, security levels, static routes, PAT (sec-asa-basics), ACLs aur object groups (sec-asa-acl), NAT (sec-asa-nat), aur <code>packet-tracer</code>, captures aur syslog (sec-asa-tshoot). Failover aur clustering sec-asa-ha mein bane the; yahan hum unki taraf sirf wahan ishara karte hain jahan woh design decision badalte hain. Threat Defense policies, Management Center se deployment aur intrusion policies agle modules (sec-ftd aur sec-ftd-ips) mein aati hain; yeh module sirf un <i>interface modes</i> ka preview deta hai jin par woh policies chalti hain.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Teen deployment sawaal">
<rect x="20" y="20" width="190" height="90" rx="10" fill="#bae6fd"/><text x="115" y="48" text-anchor="middle" class="svg-ink" font-size="14">1. Kaise baithta hai?</text><text x="115" y="70" text-anchor="middle" class="svg-muted" font-size="12">routed ya transparent</text><text x="115" y="88" text-anchor="middle" class="svg-muted" font-size="12">bridge groups, BVI</text>
<rect x="225" y="20" width="190" height="90" rx="10" fill="#ddd6fe"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">2. Kaunse interfaces?</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">EtherChannel, redundant</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="12">inline set, tap, passive</text>
<rect x="430" y="20" width="190" height="90" rx="10" fill="#bbf7d0"/><text x="525" y="48" text-anchor="middle" class="svg-ink" font-size="14">3. Kaunse exits?</text><text x="525" y="70" text-anchor="middle" class="svg-muted" font-size="12">tracked dual ISP</text><text x="525" y="88" text-anchor="middle" class="svg-muted" font-size="12">ECMP zones, dynamic</text>
<rect x="120" y="160" width="400" height="60" rx="10" fill="#fde68a"/><text x="320" y="186" text-anchor="middle" class="svg-ink" font-size="14">Plus: failure mein kaise bachta hai?</text><text x="320" y="206" text-anchor="middle" class="svg-muted" font-size="12">failover, cluster, fail-open, cloud load balancers</text>
<line x1="115" y1="110" x2="220" y2="160" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="110" x2="320" y2="160" stroke="#64748b" stroke-width="1.5"/><line x1="525" y1="110" x2="420" y2="160" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Har firewall deployment inhi sawaalon ka jawab deta hai, box ya manager koi bhi ho.</p></div>

<h3>Deployment design kyun matter karta hai</h3>
<p>Zyadatar firewall outages kisi kharab rule se nahi hote. Woh ek <b>deployment</b> decision se hote hain: ek transparent firewall jo spanning tree BPDUs block karke loop bana deta hai, fail-closed interfaces wala inline IPS jo software restart ke dauraan poora data centre drop kar deta hai, ya ek default route jo table mein rehta hai jabki uske peeche ka provider mar chuka hai. Rules decide karte hain <i>kya</i> allowed hai; deployment decide karta hai ki kuch flow hoga bhi ya nahi. Isiliye SNCF exam isi domain se shuru hota hai, aur isiliye interviewers ko "routed ya transparent, aur kyun?" poochna bahut pasand hai.</p>

<h3>Is module ke teen labs</h3>
<table class="cmp"><tr><th>Lab</th><th>Aap kya banate ho</th><th>Chapters</th></tr>
<tr><td>Bina re-addressing ke transparent firewall daalo</td><td>10.0.1.0/24 mein SW-IN aur SW-OUT ke beech ASA1, bridge group 1, BVI1 10.0.1.5, <code>inspect icmp</code>, MON 10.0.1.250 ko SRV 10.0.1.20 tak HTTP ke liye ACL, phir MAC table padhna</td><td>3, 4, 5</td></tr>
<tr><td>IP SLA static route tracking ke saath dual ISP</td><td>NK-ASA jiska ISP1 <code>outside</code> par (203.0.113.1) aur ISP2 <code>backup</code> par (198.51.100.1), har 5 s 4.2.2.2 probe, tracked default route, distance 254 wala floating route, failover aur fail-back</td><td>9, 10</td></tr>
<tr><td>Ticket: route tracking jo kabhi track nahi karti</td><td>INC-9021: ek SLA jo galat address target karta hai aur kabhi schedule nahi hua; dhoondo, theek karo aur saabit karo</td><td>11</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek branch LAN 10.0.1.0/24 hai jiska router R-GW 10.0.1.1 par hai. Chaalees PCs, do printers aur ek web server SRV (10.0.1.20) sab 10.0.1.1 ko gateway use karte hain. Routed firewall ko ek naya transit subnet aur har host par naya gateway chahiye hota, ya renumbered router. Ek management address, BVI1 10.0.1.5, wala transparent firewall aaj raat LAN switch aur router ke beech lag jaata hai, aur ek bhi host setting nahi badalti. Bagal mein head office ke do internet providers hain; wahan firewall routed hona chahiye (woh dono exits ke liye NAT karta hai), aur design ka sawaal route tracking ban jaata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki "transparent" ka matlab "koi security policy nahi". Transparent firewall bilkul wahi security levels, ACLs aur inspections enforce karta hai jo routed karta hai. Jis din aap ise daaloge, jo inbound connections pehle chalte the woh tab tak deny honge jab tak aap rules nahi likhte.</p></div>

<div class="exam"><p><b>Exam trap.</b> Firewall mode (routed ya transparent) aur IPS interface modes (inline set, inline tap, passive) alag cheezein hain. <b>Routed</b> mode wala Threat Defense device doosre ports par inline set ya passive interface rakh sakta hai. Question padho ki kaunsi cheez poochi ja rahi hai.</p></div>

<div class="scn"><h4>Woh firewall jise koi dhoondh nahi paaya</h4><p>Ek retail company ne contractor se Sunday window mein "POS VLAN ke aage firewall lagao" kaha, ek sakht rule ke saath: tills par koi IP change nahi. Contractor ne routed firewall lagaya aur DHCP se tills ka gateway badalne ka plan banaya. Aadhe tills ke static addresses the, aur Monday subah woh payment host tak nahi pahunch paaye. Rollback mein do ghante lage. Doosri koshish mein transparent mode use hua: tills ne 10.20.5.1 hi gateway rakha, firewall ne VLAN bridge kiya, aur change 20 minute mein ho gaya.</p><p><b>Seekh:</b> "re-addressing allowed nahi" woh classic requirement hai jo transparent mode ki taraf ishara karti hai.</p></div>

<div class="iv"><p class="q">"Aapko existing network mein firewall jodna hai. Aap kaise decide karoge ki ise kaise deploy karein?"</p><p>Strong answer sawaalon ko kram se chalta hai: kya hosts ya routers re-address ho sakte hain (nahi to transparent); kya box par NAT, VPN termination ya dynamic routing chahiye (haan to routed); kya IPS ko block karna hai ya sirf dekhna hai (inline set ya passive); kitne exits hain aur dead provider kaise pakdein (route tracking, ECMP); aur failure mein kaise bache (failover, clustering, fail-open). Batao ki yeh decision shuru mein hota hai kyunki firewall mode badalne se configuration mit jaati hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routed = apne subnets wala layer 3 hop; transparent = layer 2 "bump in the wire" jo saari addressing rakhta hai.</li>
<li>Deployment decisions (mode, interface type, exits, HA) individual rules se zyada outages karte hain.</li>
<li>IPS-only interface modes firewall mode se alag hain aur Threat Defense par uske saath reh sakte hain.</li>
<li>Route tracking woh dead provider pakadta hai jo "interface up" check miss karta hai.</li>
<li>Teen labs transparent insertion, dual-ISP tracking aur ek tracking troubleshooting ticket se map hote hain.</li>
</ul></div>
`}};export{e as default};