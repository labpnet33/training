var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>At the start of this module you had two ways to check visitors in an office building: a new reception desk with new room numbers (routed mode) or a scanner gate dropped into an existing corridor (transparent mode). You can now build the gate, decide whether the guard at the gate may stop people or only take notes (inline set, inline tap, passive), give one building several independent gates (contexts and multi-instance), and keep the building connected to the outside world when one road is closed (route tracking, ECMP zones, dynamic routing). Use this chapter as your revision sheet before the labs, the SNCF exam and the interview.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module map">
<rect x="10" y="20" width="200" height="80" rx="10" fill="#bae6fd"/><text x="110" y="48" text-anchor="middle" class="svg-ink" font-size="14">How does it sit?</text><text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="12">routed / transparent</text><text x="110" y="88" text-anchor="middle" class="svg-muted" font-size="12">bridge group, BVI, IRB</text>
<rect x="220" y="20" width="200" height="80" rx="10" fill="#ddd6fe"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">Block or watch?</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">inline set, inline tap</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="12">passive, ERSPAN</text>
<rect x="430" y="20" width="200" height="80" rx="10" fill="#bbf7d0"/><text x="530" y="48" text-anchor="middle" class="svg-ink" font-size="14">Which exit?</text><text x="530" y="70" text-anchor="middle" class="svg-muted" font-size="12">SLA + track + floating</text><text x="530" y="88" text-anchor="middle" class="svg-muted" font-size="12">ECMP zone, PBR, BGP</text>
<rect x="10" y="130" width="620" height="70" rx="10" fill="#fde68a"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="14">Survive and prove: failover, cluster, contexts, multi-instance, fail-open</text><text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">show firewall, show bridge-group, show inline-set, show track, show route, syslog 622001</text>
</svg><p class="cap">The whole module in one picture: placement, inspection mode, exits, and resilience, each proven with a show command.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain when to choose routed or transparent mode, and name what transparent mode cannot do (NAT is possible, but no VPN termination for data, no DHCP relay, no transit dynamic routing).</li>
<li>I can build lab 1 from factory default: <code>firewall transparent</code> first, members in bridge group 1 with nameif and security level, BVI1 10.0.1.5/24.</li>
<li>I can explain why a bridge group passes nothing without a BVI address, and why hosts keep 10.0.1.1 as their gateway.</li>
<li>I can read <code>show mac-address-table</code> and say on which nameif a MAC was learned (R-GW on <code>outside</code>).</li>
<li>I can sort traffic into the four buckets: unicast IP (ACLs and inspection), ARP (passes, optional ARP inspection), broadcast/multicast IP (extended ACL), non-IP (EtherType ACL, for example BPDUs).</li>
<li>I can allow only MON 10.0.1.250 to reach SRV 10.0.1.20 on HTTP with <code>OUTSIDE_IN</code>, and fix ping with <code>inspect icmp</code>.</li>
<li>I can compare physical, subinterface, redundant, EtherChannel and IRB interfaces.</li>
<li>I can pick inline set, inline tap, passive or passive ERSPAN from a requirement, and explain fail-open, hardware bypass and propagate link state.</li>
<li>I can compare ASA multiple contexts with Threat Defense multi-instance, and failover pairs with clusters and cloud load balancing.</li>
<li>I can build lab 2: SLA to 4.2.2.2 every 5 s, scheduled, <code>track 1</code>, tracked default via 203.0.113.1, floating default via 198.51.100.1 at 254, then prove failover and fail-back.</li>
<li>I can load-share two ISPs with an ECMP (traffic) zone and explain PBR and dynamic routing on the firewall.</li>
<li>I can close INC-9021: wrong probe target plus missing schedule, fixed and proven with syslog 622001 in both directions.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Transparent mode</dt><dd>The firewall acts as a layer 2 bridge ("bump in the wire"); hosts keep their addressing.</dd>
<dt>Bridge group</dt><dd>A set of member interfaces that form one bridged segment; up to 64 member interfaces per group on recent releases.</dd>
<dt>BVI</dt><dd>Bridge virtual interface: the IP address of a bridge group; mandatory in transparent mode, a routed gateway (with nameif) in IRB.</dd>
<dt>EtherType ACL</dt><dd>An ACL that permits or denies non-IP frames by EtherType, such as <code>bpdu</code> or <code>isis</code>.</dd>
<dt>Inline set</dt><dd>Interface pairs that put Snort in the path without MAC or IP addresses; can drop traffic.</dd>
<dt>Inline tap</dt><dd>An inline set in tap mode: cabled in the path, but Snort only sees a copy; "would have dropped" events.</dd>
<dt>Passive / ERSPAN</dt><dd>Receives a copy from SPAN, a TAP, or GRE-encapsulated ERSPAN; detection only.</dd>
<dt>Multi-instance</dt><dd>Several Threat Defense containers on one chassis, each with dedicated CPU, memory and its own manager registration.</dd>
<dt>SLA monitor</dt><dd>A probe (ICMP echo) to a target out of a named interface; does nothing until scheduled.</dd>
<dt>Floating static</dt><dd>A backup route with a worse administrative distance that enters the table only when the better route is gone.</dd>
<dt>ECMP (traffic) zone</dt><dd>Groups interfaces so equal-cost routes across them are accepted and return traffic may arrive on any member.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Changing firewall mode</td><td>Clears the running configuration (ASA <code>firewall transparent</code>, Threat Defense <code>configure firewall transparent</code>). Choose the mode first.</td></tr>
<tr><td>Transparent policy</td><td>Same security levels, ACLs and inspections as routed mode. Lower to higher still needs an ACL; ICMP replies need <code>inspect icmp</code>.</td></tr>
<tr><td>Unknown destination MAC</td><td>A transparent firewall does not flood unicast; it drops the packet and discovers the MAC with ARP or ping from the BVI.</td></tr>
<tr><td>Non-IP traffic</td><td>ARP passes by default; BPDUs, IS-IS and other EtherTypes need an EtherType ACL. Transparent failover must pass BPDUs.</td></tr>
<tr><td>Inline set vs tap vs passive</td><td>Only inline set (tap off) and routed/switched interfaces can drop. Tap and passive only alert. ERSPAN needs routed mode.</td></tr>
<tr><td>Fail-open vs bypass</td><td>Snort fail-open covers software busy/down; hardware bypass (FTW modules) covers power or software failure at the physical layer.</td></tr>
<tr><td>Clustering</td><td>Spanned EtherChannel works in routed and transparent; individual interfaces are routed only. Size HA for N-1.</td></tr>
<tr><td>Route tracking</td><td>Probe a target beyond the ISP; schedule it; a running SLA cannot be edited (delete and recreate). Log 622001 for add/remove.</td></tr>
<tr><td>ECMP</td><td>Up to 8 equal-cost paths, per-flow hash. Across interfaces only with a traffic zone; members need the same security level.</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! transparent insertion (lab 1)</span>
firewall transparent
interface GigabitEthernet0/1
 nameif inside
 security-level 100
 bridge-group 1
interface BVI1
 ip address 10.0.1.5 255.255.255.0
access-list NONIP ethertype permit bpdu
<span class="c">! dual ISP (lab 2)</span>
sla monitor 1
 type echo protocol ipIcmpEcho 4.2.2.2 interface outside
 frequency 5
sla monitor schedule 1 life forever start-time now
track 1 rtr 1 reachability
route outside 0.0.0.0 0.0.0.0 203.0.113.1 1 track 1
route backup 0.0.0.0 0.0.0.0 198.51.100.1 254
<span class="c">! ECMP across two ISPs</span>
zone ISPS
interface GigabitEthernet0/0
 zone-member ISPS</pre>
<pre class="out">show firewall | show bridge-group | show mac-address-table | show arp-inspection
show inline-set | show interface ip brief | show port-channel summary | show zone
show sla monitor configuration 1 | <span class="hl">show sla monitor operational-state</span>
<span class="hl">show track 1</span> | show route | show logging | include 622001</pre>

<div class="eg"><p><b>Worked example: one design, every decision.</b> A branch with 10.0.1.0/24 and no permission to re-address gets a transparent ASA (lab 1). The head office has ISP1 (flat-rate) and ISP2 (metered), so its routed edge firewall uses a tracked default route to 4.2.2.2 and a floating route at 254 (lab 2). The data centre gets a Threat Defense pair with an inline set in tap mode for two weeks, then tap off with Snort fail-open disabled because security wins over availability there. Each decision answers one question from the module map.</p></div>

<div class="warn"><p><b>Common mistake.</b> Revising commands but not the <i>reasons</i>. Exam and interview questions are nearly always "which mode fits this requirement" or "why did this fail", so for every command above make sure you can say what breaks without it.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch for questions that mix <b>firewall mode</b> (routed or transparent) with <b>interface mode</b> (inline set, passive). A routed Threat Defense can still have an inline set on other ports, and "transparent" does not mean "IPS-only".</p></div>

<div class="scn"><h4>The design review that took ten minutes</h4><p>A new engineer was asked to review a proposal: "Transparent FTD at the branch, inline set for the new IPS, one default route to the ISP." Using this checklist he asked three questions. Can the tills be re-addressed? No, so transparent is right. Will the inline set start in tap mode? It was not planned, so a two-week tap pilot was added. What happens if the ISP's upstream dies? Nothing would notice, so a second provider with a tracked route was budgeted.</p><p><b>Lesson:</b> the checklist is not just for exams; it is a design review template.</p></div>

<div class="iv"><p class="q">"Walk me through how you would deploy a firewall into an existing network."</p><p>Go in order: placement (routed or transparent, and why: re-addressing, NAT, VPN, routing); interfaces (EtherChannel, redundant, IRB, inline set or passive for IPS); resilience (failover or cluster sized for N-1, fail-open or bypass for inline sets, contexts or multi-instance for tenants); exits (tracked static routes, ECMP zones, PBR, or BGP); and verification (the exact show commands and syslog messages you would check). Finish with how you would roll back.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Placement: routed for NAT, VPN and routing; transparent when nothing may be re-addressed.</li>
<li>Transparent mode needs a BVI address and still enforces the full security policy.</li>
<li>Inline set blocks, inline tap and passive only watch; plan fail-open and bypass before go-live.</li>
<li>Route tracking = scheduled SLA to a target beyond the ISP + track + tracked route + floating static.</li>
<li>ECMP across two ISPs needs a traffic zone; prove every change with show commands and syslog.</li>
</ul></div>
`,hi:`
<p>Is module ki shuruaat mein office building mein visitors check karne ke do tareeke the: naye room numbers ke saath ek nayi reception desk (routed mode), ya existing corridor mein rakha ek scanner gate (transparent mode). Ab aap gate bana sakte ho, tay kar sakte ho ki gate ka guard logon ko rok sakta hai ya sirf notes leta hai (inline set, inline tap, passive), ek building ko kai independent gates de sakte ho (contexts aur multi-instance), aur ek road band hone par building ko bahar ki duniya se jode rakh sakte ho (route tracking, ECMP zones, dynamic routing). Labs, SNCF exam aur interview se pehle is chapter ko apni revision sheet ki tarah use karo.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module map">
<rect x="10" y="20" width="200" height="80" rx="10" fill="#bae6fd"/><text x="110" y="48" text-anchor="middle" class="svg-ink" font-size="14">Kaise baithta hai?</text><text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="12">routed / transparent</text><text x="110" y="88" text-anchor="middle" class="svg-muted" font-size="12">bridge group, BVI, IRB</text>
<rect x="220" y="20" width="200" height="80" rx="10" fill="#ddd6fe"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">Block ya sirf dekhna?</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">inline set, inline tap</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="12">passive, ERSPAN</text>
<rect x="430" y="20" width="200" height="80" rx="10" fill="#bbf7d0"/><text x="530" y="48" text-anchor="middle" class="svg-ink" font-size="14">Kaunsa exit?</text><text x="530" y="70" text-anchor="middle" class="svg-muted" font-size="12">SLA + track + floating</text><text x="530" y="88" text-anchor="middle" class="svg-muted" font-size="12">ECMP zone, PBR, BGP</text>
<rect x="10" y="130" width="620" height="70" rx="10" fill="#fde68a"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="14">Bacho aur saabit karo: failover, cluster, contexts, multi-instance, fail-open</text><text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">show firewall, show bridge-group, show inline-set, show track, show route, syslog 622001</text>
</svg><p class="cap">Poora module ek tasveer mein: placement, inspection mode, exits aur resilience, har ek show command se saabit.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main samjha sakta hoon ki routed ya transparent mode kab chunna hai, aur bata sakta hoon ki transparent mode kya nahi kar sakta (NAT possible hai, lekin data ke liye VPN termination nahi, DHCP relay nahi, transit dynamic routing nahi).</li>
<li>Main lab 1 factory default se bana sakta hoon: pehle <code>firewall transparent</code>, members bridge group 1 mein nameif aur security level ke saath, BVI1 10.0.1.5/24.</li>
<li>Main samjha sakta hoon ki BVI address ke bina bridge group kuch pass kyun nahi karta, aur hosts 10.0.1.1 ko hi gateway kyun rakhte hain.</li>
<li>Main <code>show mac-address-table</code> padh kar bata sakta hoon ki MAC kis nameif par seekha gaya (R-GW <code>outside</code> par).</li>
<li>Main traffic ko chaar buckets mein baant sakta hoon: unicast IP (ACLs aur inspection), ARP (pass hota hai, optional ARP inspection), broadcast/multicast IP (extended ACL), non-IP (EtherType ACL, jaise BPDUs).</li>
<li>Main <code>OUTSIDE_IN</code> se sirf MON 10.0.1.250 ko SRV 10.0.1.20 tak HTTP par allow kar sakta hoon, aur <code>inspect icmp</code> se ping theek kar sakta hoon.</li>
<li>Main physical, subinterface, redundant, EtherChannel aur IRB interfaces compare kar sakta hoon.</li>
<li>Main requirement se inline set, inline tap, passive ya passive ERSPAN chun sakta hoon, aur fail-open, hardware bypass aur propagate link state samjha sakta hoon.</li>
<li>Main ASA multiple contexts ko Threat Defense multi-instance se, aur failover pairs ko clusters aur cloud load balancing se compare kar sakta hoon.</li>
<li>Main lab 2 bana sakta hoon: har 5 s 4.2.2.2 ka SLA, scheduled, <code>track 1</code>, 203.0.113.1 ke through tracked default, 198.51.100.1 ke through 254 par floating default, phir failover aur fail-back saabit karna.</li>
<li>Main ECMP (traffic) zone se do ISPs par load-share kar sakta hoon aur firewall par PBR aur dynamic routing samjha sakta hoon.</li>
<li>Main INC-9021 band kar sakta hoon: galat probe target plus missing schedule, theek kiya aur dono directions mein syslog 622001 se saabit kiya.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Transparent mode</dt><dd>Firewall layer 2 bridge ("bump in the wire") ki tarah kaam karta hai; hosts apni addressing rakhte hain.</dd>
<dt>Bridge group</dt><dd>Member interfaces ka set jo ek bridged segment banata hai; recent releases par ek group mein 64 tak member interfaces.</dd>
<dt>BVI</dt><dd>Bridge virtual interface: bridge group ka IP address; transparent mode mein zaroori, IRB mein (nameif ke saath) routed gateway.</dd>
<dt>EtherType ACL</dt><dd>ACL jo non-IP frames ko EtherType se permit ya deny karti hai, jaise <code>bpdu</code> ya <code>isis</code>.</dd>
<dt>Inline set</dt><dd>Interface pairs jo bina MAC ya IP address ke Snort ko path mein rakhte hain; traffic drop kar sakta hai.</dd>
<dt>Inline tap</dt><dd>Tap mode mein inline set: path mein cabled, lekin Snort sirf copy dekhta hai; "would have dropped" events.</dd>
<dt>Passive / ERSPAN</dt><dd>SPAN, TAP, ya GRE-encapsulated ERSPAN se copy leta hai; sirf detection.</dd>
<dt>Multi-instance</dt><dd>Ek chassis par kai Threat Defense containers, har ek ke dedicated CPU, memory aur apna manager registration.</dd>
<dt>SLA monitor</dt><dd>Named interface se target ko probe (ICMP echo); schedule hone tak kuch nahi karta.</dd>
<dt>Floating static</dt><dd>Kharab administrative distance wala backup route jo table mein tabhi aata hai jab behtar route chala jaaye.</dd>
<dt>ECMP (traffic) zone</dt><dd>Interfaces ko group karta hai taaki unke paar equal-cost routes accept hon aur return traffic kisi bhi member par aa sake.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Firewall mode badalna</td><td>Running configuration clear hoti hai (ASA <code>firewall transparent</code>, Threat Defense <code>configure firewall transparent</code>). Mode pehle chuno.</td></tr>
<tr><td>Transparent policy</td><td>Routed mode jaise hi security levels, ACLs aur inspections. Lower se higher ko ab bhi ACL chahiye; ICMP replies ko <code>inspect icmp</code> chahiye.</td></tr>
<tr><td>Unknown destination MAC</td><td>Transparent firewall unicast flood nahi karta; packet drop karta hai aur BVI se ARP ya ping karke MAC discover karta hai.</td></tr>
<tr><td>Non-IP traffic</td><td>ARP default se pass hota hai; BPDUs, IS-IS aur baaki EtherTypes ko EtherType ACL chahiye. Transparent failover ko BPDUs pass karne chahiye.</td></tr>
<tr><td>Inline set vs tap vs passive</td><td>Sirf inline set (tap off) aur routed/switched interfaces drop kar sakte hain. Tap aur passive sirf alert karte hain. ERSPAN ko routed mode chahiye.</td></tr>
<tr><td>Fail-open vs bypass</td><td>Snort fail-open software busy/down cover karta hai; hardware bypass (FTW modules) power ya software failure ko physical layer par cover karta hai.</td></tr>
<tr><td>Clustering</td><td>Spanned EtherChannel routed aur transparent dono mein chalta hai; individual interfaces sirf routed. HA ko N-1 ke liye size karo.</td></tr>
<tr><td>Route tracking</td><td>ISP ke aage ka target probe karo; schedule karo; chalta hua SLA edit nahi hota (delete karke dobara banao). Add/remove ke liye log 622001.</td></tr>
<tr><td>ECMP</td><td>8 tak equal-cost paths, per-flow hash. Alag interfaces par sirf traffic zone ke saath; members ka security level same hona chahiye.</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! transparent insertion (lab 1)</span>
firewall transparent
interface GigabitEthernet0/1
 nameif inside
 security-level 100
 bridge-group 1
interface BVI1
 ip address 10.0.1.5 255.255.255.0
access-list NONIP ethertype permit bpdu
<span class="c">! dual ISP (lab 2)</span>
sla monitor 1
 type echo protocol ipIcmpEcho 4.2.2.2 interface outside
 frequency 5
sla monitor schedule 1 life forever start-time now
track 1 rtr 1 reachability
route outside 0.0.0.0 0.0.0.0 203.0.113.1 1 track 1
route backup 0.0.0.0 0.0.0.0 198.51.100.1 254
<span class="c">! do ISPs par ECMP</span>
zone ISPS
interface GigabitEthernet0/0
 zone-member ISPS</pre>
<pre class="out">show firewall | show bridge-group | show mac-address-table | show arp-inspection
show inline-set | show interface ip brief | show port-channel summary | show zone
show sla monitor configuration 1 | <span class="hl">show sla monitor operational-state</span>
<span class="hl">show track 1</span> | show route | show logging | include 622001</pre>

<div class="eg"><p><b>Worked example: ek design, har decision.</b> 10.0.1.0/24 wali branch jise re-address karne ki permission nahi hai, use transparent ASA milta hai (lab 1). Head office mein ISP1 (flat-rate) aur ISP2 (metered) hain, isliye uska routed edge firewall 4.2.2.2 ke liye tracked default route aur 254 par floating route use karta hai (lab 2). Data centre ko do hafte ke liye tap mode mein inline set wala Threat Defense pair milta hai, phir tap off aur Snort fail-open disabled, kyunki wahan security availability se upar hai. Har decision module map ke ek sawaal ka jawab hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Commands revise karna lekin <i>reasons</i> nahi. Exam aur interview ke sawaal lagbhag hamesha "is requirement ke liye kaunsa mode sahi hai" ya "yeh fail kyun hua" hote hain, isliye upar ki har command ke liye pakka karo ki aap bata sako uske bina kya tootega.</p></div>

<div class="exam"><p><b>Exam trap.</b> Aise sawaalon se savdhaan raho jo <b>firewall mode</b> (routed ya transparent) ko <b>interface mode</b> (inline set, passive) se mix karte hain. Routed Threat Defense ke doosre ports par bhi inline set ho sakta hai, aur "transparent" ka matlab "IPS-only" nahi hai.</p></div>

<div class="scn"><h4>Das minute ka design review</h4><p>Ek naye engineer ko ek proposal review karne ko kaha gaya: "Branch par transparent FTD, naye IPS ke liye inline set, ISP ki taraf ek default route." Is checklist se usne teen sawaal pooche. Kya tills re-address ho sakte hain? Nahi, isliye transparent sahi hai. Kya inline set tap mode mein shuru hoga? Plan nahi tha, isliye do hafte ka tap pilot joda gaya. ISP ka upstream mar gaya to kya hoga? Kisi ko pata nahi chalega, isliye tracked route ke saath doosre provider ka budget rakha gaya.</p><p><b>Seekh:</b> checklist sirf exams ke liye nahi hai; yeh design review template hai.</p></div>

<div class="iv"><p class="q">"Mujhe batao ki aap existing network mein firewall kaise deploy karoge."</p><p>Kram se chalo: placement (routed ya transparent, aur kyun: re-addressing, NAT, VPN, routing); interfaces (EtherChannel, redundant, IRB, IPS ke liye inline set ya passive); resilience (N-1 ke liye sized failover ya cluster, inline sets ke liye fail-open ya bypass, tenants ke liye contexts ya multi-instance); exits (tracked static routes, ECMP zones, PBR, ya BGP); aur verification (exact show commands aur syslog messages jo aap check karoge). Rollback kaise karoge, yeh batakar khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Placement: NAT, VPN aur routing ke liye routed; jab kuch bhi re-address nahi ho sakta tab transparent.</li>
<li>Transparent mode ko BVI address chahiye aur yeh poori security policy enforce karta hai.</li>
<li>Inline set block karta hai, inline tap aur passive sirf dekhte hain; go-live se pehle fail-open aur bypass plan karo.</li>
<li>Route tracking = ISP ke aage ke target ka scheduled SLA + track + tracked route + floating static.</li>
<li>Do ISPs par ECMP ko traffic zone chahiye; har change show commands aur syslog se saabit karo.</li>
</ul></div>
`}};export{e as default};