var e={id:`troubleshooting`,h:{en:`Troubleshooting routing: a step-by-step workflow`,hi:`Routing troubleshooting: step-by-step workflow`},body:{en:`
<p>"It does not ping" is the most common ticket a network engineer receives. Guessing wastes hours; a fixed order of checks finds almost every routing fault in minutes. This chapter gives you that order, ties it to the CompTIA troubleshooting methodology, and applies it to faults you can recreate in both labs.</p>

<h3>An analogy: following a lost parcel</h3>
<p>When a parcel does not arrive, you do not phone every depot in the country. You check the tracking: the last depot that scanned it is where the problem is. Traceroute is your tracking page, and the last router that answered is where you start asking questions.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Routing troubleshooting workflow">
<rect x="10" y="10" width="200" height="40" rx="8" fill="#fde68a"/><text x="110" y="35" text-anchor="middle" class="svg-ink" font-size="13">1. Define the problem</text>
<rect x="220" y="10" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">2. Check the host</text>
<rect x="430" y="10" width="200" height="40" rx="8" fill="#bae6fd"/><text x="530" y="35" text-anchor="middle" class="svg-ink" font-size="13">3. Trace: where it stops</text>
<rect x="430" y="80" width="200" height="40" rx="8" fill="#bae6fd"/><text x="530" y="105" text-anchor="middle" class="svg-ink" font-size="13">4. Route on that router?</text>
<rect x="220" y="80" width="200" height="40" rx="8" fill="#bae6fd"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">5. Interfaces, next hop</text>
<rect x="10" y="80" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="110" y="105" text-anchor="middle" class="svg-ink" font-size="13">6. Check return path</text>
<rect x="10" y="150" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="110" y="175" text-anchor="middle" class="svg-ink" font-size="13">7. Protocol neighbours</text>
<rect x="220" y="150" width="200" height="40" rx="8" fill="#fed7aa"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">8. ACL, NAT, FHRP</text>
<rect x="430" y="150" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="175" text-anchor="middle" class="svg-ink" font-size="13">9. Fix, verify, document</text>
<line x1="210" y1="30" x2="220" y2="30" stroke="#64748b" stroke-width="2"/><line x1="420" y1="30" x2="430" y2="30" stroke="#64748b" stroke-width="2"/>
<line x1="530" y1="50" x2="530" y2="80" stroke="#64748b" stroke-width="2"/><line x1="430" y1="100" x2="420" y2="100" stroke="#64748b" stroke-width="2"/><line x1="220" y1="100" x2="210" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="110" y1="120" x2="110" y2="150" stroke="#64748b" stroke-width="2"/><line x1="210" y1="170" x2="220" y2="170" stroke="#64748b" stroke-width="2"/><line x1="420" y1="170" x2="430" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="12">Work from the host outward, and always in both directions.</text>
</svg><p class="cap">Nine steps. Most routing tickets end at step 4, 5 or 6.</p></div>
<ol>
<li><b>Define the problem.</b> Which source, which destination, what works, what does not, and what changed recently? (CompTIA step 1: identify the problem, question users, determine if anything changed.)</li>
<li><b>Check the host.</b> <code>ipconfig</code> or <code>ip addr</code>: correct IP, mask and default gateway? Can it ping its gateway?</li>
<li><b>Trace.</b> <code>tracert</code> / <code>traceroute</code> to the destination. The last hop that answers is your suspect; the next one is where packets die.</li>
<li><b>Look up the route on the suspect router.</b> <code>show ip route &lt;destination&gt;</code>. No route? You found it. Wrong route (too broad, wrong next hop)? Longest prefix match may be sending traffic somewhere unexpected.</li>
<li><b>Check interfaces and next hop.</b> <code>show ip interface brief</code>: up/up? Is the next hop on a connected subnet and does it answer a ping?</li>
<li><b>Check the return path.</b> Repeat steps 3 to 5 from the destination back to the source. Half of all routing faults are one-way.</li>
<li><b>Check the routing protocol.</b> <code>show ip ospf neighbor</code>, <code>show ip protocols</code>, <code>show ip ospf interface</code>: are neighbours FULL, are the right interfaces included, do area, timers and masks match?</li>
<li><b>Check what else touches the packet.</b> ACLs, NAT translations, the FHRP active router, a firewall.</li>
<li><b>Fix, verify, document.</b> Make one change at a time, re-test end to end in both directions, and record cause and fix. (CompTIA: establish a plan, implement, verify full functionality, document.)</li>
</ol>

<h3>Fault 1 (Lab 1): the missing return route</h3>
<p>Suppose you added HQ's routes but forgot BR's default route. PC-HQ cannot ping PC-BR.</p>
<pre class="out">PC-HQ&gt; trace 10.2.2.10
Tracing the route to 10.2.2.10
  1 10.1.1.1 1 msec 1 msec 1 msec
<span class="hl">  2  *  *  *</span>
  3  *  *  *

BR#show ip route 10.1.1.10
<span class="hl">% Subnet not in table</span></pre>
<p>The trace dies right after HQ. Tempting conclusion: HQ has no route to the branch. But <code>show ip route 10.2.2.10</code> on HQ shows the S route, and packets do reach BR. The problem is the reply: BR has no route back to 10.1.1.0/24 and no default route, so it cannot even send the "time exceeded" messages traceroute depends on. The fix is <code>ip route 0.0.0.0 0.0.0.0 10.0.12.1</code> on BR.</p>

<div class="eg"><p><b>Worked example: reading the host view.</b> From PC-BR, the same fault looks different: <code>ping 10.1.1.10</code> returns "Destination host unreachable" (or <b>U</b> on a router), sent by BR itself, because BR has no route at all for that destination. A reply of "unreachable" points at the router that sent it; silent timeouts (<code>*</code> or <code>.</code>) point at a path where replies are being lost, very often the return path.</p></div>

<h3>Fault 2 (Lab 2): neighbours up, LAN missing</h3>
<p>PC1 cannot ping PC2. R1's neighbours are both FULL, yet there is no route to 192.168.2.0/24.</p>
<pre class="out">R2#show ip protocols
  Routing for Networks:
    10.0.0.0 0.255.255.255 area 0
<span class="hl">  (no 192.168.0.0 statement)</span>

R2#show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/1        1     0               10.0.23.1/30       1     DR    1/1
Gi0/0        1     0               10.0.12.2/30       1     DR    1/1</pre>
<p>Gi0/2 (the LAN) is not listed, so R2 never advertises 192.168.2.0/24. Adding <code>network 192.168.0.0 0.0.255.255 area 0</code> under <code>router ospf 1</code> on R2 fixes it.</p>

<h3>Fault 3 (Lab 2): the failover that does not happen</h3>
<p>After shutting R1 Gi0/0, PC1 loses PC2 completely. On R1, <code>show ip ospf neighbor</code> shows no neighbour on Gi0/1. On R3, <code>show ip ospf interface</code> reveals area 1 on Gi0/0 while R1 uses area 0. The backup path never existed. Correct the area on R3 and the failover works, with the route changing to [110/3] via 10.0.13.2.</p>

<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Host reaches its subnet only</td><td>Wrong or missing default gateway</td><td>ipconfig, ping gateway</td></tr>
<tr><td>Trace stops after a router, no "unreachable"</td><td>Missing return route further on</td><td>show ip route from the far side</td></tr>
<tr><td>"Destination unreachable" from a router</td><td>That router has no route</td><td>show ip route on that router</td></tr>
<tr><td>Static route missing from table</td><td>Next hop unreachable, interface down</td><td>show ip interface brief</td></tr>
<tr><td>OSPF neighbour absent</td><td>Area, subnet, timers, auth mismatch; passive interface</td><td>show ip ospf interface</td></tr>
<tr><td>Stuck in ExStart/Exchange</td><td>MTU mismatch</td><td>show interfaces (MTU)</td></tr>
<tr><td>Neighbours FULL, prefix missing</td><td>Interface not included in OSPF</td><td>show ip protocols</td></tr>
<tr><td>Traffic takes an odd path</td><td>More specific route or lower AD elsewhere</td><td>show ip route &lt;dest&gt;</td></tr>
<tr><td>Packets loop, TTL expires</td><td>Two routers default-routing at each other</td><td>traceroute shows repeating hops</td></tr>
</table>

<div class="warn"><p><b>Common mistake.</b> Changing several things at once. If you add a route, change an area and bounce an interface together, you will not know which change fixed it, or which one broke something else. One change, one test.</p></div>

<div class="exam"><p><b>Exam trap.</b> CompTIA's methodology order matters: identify the problem, establish a theory, test the theory, establish a plan of action, implement or escalate, verify full system functionality (and preventive measures), document findings. "Document" is always last; "question the obvious" belongs to establishing a theory.</p></div>

<div class="scn"><h4>The routing loop after a migration</h4><p>After a WAN migration, users at a branch reported that some HQ servers timed out. A traceroute showed hops alternating between 10.0.99.1 and 10.0.99.2 until it gave up. HQ-CORE's route to 10.2.9.0/24 had been removed with the old circuit, so HQ-CORE fell back to its default route, which pointed at the new WAN router, and the WAN router's own default route pointed straight back at HQ-CORE. The engineer added the missing specific route toward the branch and the loop disappeared.</p><p><b>Lesson:</b> repeating hops in a traceroute mean a routing loop. Find the two routers and read both tables for that destination.</p></div>

<div class="iv"><p class="q">"A user says they cannot reach a server in another office. Walk me through your troubleshooting."</p><p>Strong answer: gather scope and recent changes; check the host IP, mask, gateway and ping the gateway; traceroute to see where it stops; on that router use <code>show ip route</code> for the destination and <code>show ip interface brief</code>; check the return path from the far side; check routing protocol neighbours and included interfaces; then ACLs and NAT. Fix one thing, verify both directions, document. Mention a concrete example such as a missing return route.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work in order: define, host, trace, route lookup, interfaces, return path, protocol, other features, fix and document.</li>
<li>Traceroute shows where packets die; the router just before the silence is your starting point.</li>
<li>"Unreachable" comes from a router with no route; silent timeouts often mean a missing return route.</li>
<li>For OSPF, check neighbours, included interfaces, area, timers, masks and MTU.</li>
<li>Change one thing at a time and verify in both directions.</li>
</ul></div>
`,hi:`
<p>"Ping nahi ho raha" network engineer ko milne wala sabse common ticket hai. Andaaze lagaane mein ghante barbaad hote hain; checks ka ek fixed order lagbhag har routing fault minutes mein dhoondh leta hai. Yeh chapter aapko woh order deta hai, use CompTIA troubleshooting methodology se jodta hai, aur un faults par apply karta hai jo aap dono labs mein dobara bana sakte ho.</p>

<h3>Ek analogy: khoye hue parcel ka peecha</h3>
<p>Jab parcel nahi pahunchta, aap desh ke har depot ko phone nahi karte. Aap tracking check karte ho: jis aakhri depot ne use scan kiya, problem wahin hai. Traceroute aapka tracking page hai, aur jis aakhri router ne jawab diya, sawaal wahin se shuru hote hain.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Routing troubleshooting workflow">
<rect x="10" y="10" width="200" height="40" rx="8" fill="#fde68a"/><text x="110" y="35" text-anchor="middle" class="svg-ink" font-size="13">1. Problem define karo</text>
<rect x="220" y="10" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">2. Host check karo</text>
<rect x="430" y="10" width="200" height="40" rx="8" fill="#bae6fd"/><text x="530" y="35" text-anchor="middle" class="svg-ink" font-size="13">3. Trace: kahan rukta hai</text>
<rect x="430" y="80" width="200" height="40" rx="8" fill="#bae6fd"/><text x="530" y="105" text-anchor="middle" class="svg-ink" font-size="13">4. Us router par route?</text>
<rect x="220" y="80" width="200" height="40" rx="8" fill="#bae6fd"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">5. Interfaces, next hop</text>
<rect x="10" y="80" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="110" y="105" text-anchor="middle" class="svg-ink" font-size="13">6. Return path check</text>
<rect x="10" y="150" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="110" y="175" text-anchor="middle" class="svg-ink" font-size="13">7. Protocol neighbours</text>
<rect x="220" y="150" width="200" height="40" rx="8" fill="#fed7aa"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">8. ACL, NAT, FHRP</text>
<rect x="430" y="150" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="175" text-anchor="middle" class="svg-ink" font-size="13">9. Fix, verify, document</text>
<line x1="210" y1="30" x2="220" y2="30" stroke="#64748b" stroke-width="2"/><line x1="420" y1="30" x2="430" y2="30" stroke="#64748b" stroke-width="2"/>
<line x1="530" y1="50" x2="530" y2="80" stroke="#64748b" stroke-width="2"/><line x1="430" y1="100" x2="420" y2="100" stroke="#64748b" stroke-width="2"/><line x1="220" y1="100" x2="210" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="110" y1="120" x2="110" y2="150" stroke="#64748b" stroke-width="2"/><line x1="210" y1="170" x2="220" y2="170" stroke="#64748b" stroke-width="2"/><line x1="420" y1="170" x2="430" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="12">Host se bahar ki taraf kaam karo, aur hamesha dono directions mein.</text>
</svg><p class="cap">Nau steps. Zyada tar routing tickets step 4, 5 ya 6 par khatam hote hain.</p></div>
<ol>
<li><b>Problem define karo.</b> Kaunsa source, kaunsa destination, kya chalta hai, kya nahi, aur haal mein kya badla? (CompTIA step 1: problem identify karo, users se poochho, dekho kuch badla to nahi.)</li>
<li><b>Host check karo.</b> <code>ipconfig</code> ya <code>ip addr</code>: IP, mask aur default gateway sahi hain? Kya woh apne gateway ko ping kar sakta hai?</li>
<li><b>Trace karo.</b> Destination tak <code>tracert</code> / <code>traceroute</code>. Jawab dene wala aakhri hop aapka suspect hai; agla woh jagah hai jahan packets marte hain.</li>
<li><b>Suspect router par route lookup karo.</b> <code>show ip route &lt;destination&gt;</code>. Route nahi? Mil gaya. Galat route (bahut broad, galat next hop)? Longest prefix match traffic ko kahin unexpected bhej raha ho sakta hai.</li>
<li><b>Interfaces aur next hop check karo.</b> <code>show ip interface brief</code>: up/up? Kya next hop connected subnet par hai aur ping ka jawab deta hai?</li>
<li><b>Return path check karo.</b> Destination se source ki taraf steps 3 se 5 dohraao. Aadhe routing faults one-way hote hain.</li>
<li><b>Routing protocol check karo.</b> <code>show ip ospf neighbor</code>, <code>show ip protocols</code>, <code>show ip ospf interface</code>: neighbours FULL hain, sahi interfaces included hain, area, timers aur masks match karte hain?</li>
<li><b>Aur kya packet ko chhoota hai woh check karo.</b> ACLs, NAT translations, FHRP active router, firewall.</li>
<li><b>Fix, verify, document.</b> Ek baar mein ek change karo, dono directions mein end to end dobara test karo, aur cause aur fix record karo. (CompTIA: plan banao, implement karo, full functionality verify karo, document karo.)</li>
</ol>

<h3>Fault 1 (Lab 1): missing return route</h3>
<p>Maan lo aapne HQ ke routes add kiye lekin BR ka default route bhool gaye. PC-HQ PC-BR ko ping nahi kar paata.</p>
<pre class="out">PC-HQ&gt; trace 10.2.2.10
Tracing the route to 10.2.2.10
  1 10.1.1.1 1 msec 1 msec 1 msec
<span class="hl">  2  *  *  *</span>
  3  *  *  *

BR#show ip route 10.1.1.10
<span class="hl">% Subnet not in table</span></pre>
<p>Trace HQ ke turant baad mar jaata hai. Lalchane wala conclusion: HQ ke paas branch ka route nahi hai. Lekin HQ par <code>show ip route 10.2.2.10</code> S route dikhata hai, aur packets BR tak pahunchte hain. Problem reply hai: BR ke paas 10.1.1.0/24 ka wapas route nahi aur default route bhi nahi, isliye woh "time exceeded" messages bhi nahi bhej sakta jin par traceroute depend karta hai. Fix hai BR par <code>ip route 0.0.0.0 0.0.0.0 10.0.12.1</code>.</p>

<div class="eg"><p><b>Worked example: host ka view padhna.</b> PC-BR se yahi fault alag dikhta hai: <code>ping 10.1.1.10</code> "Destination host unreachable" (ya router par <b>U</b>) deta hai, jo BR khud bhejta hai, kyunki BR ke paas us destination ka koi route hi nahi. "Unreachable" reply us router ki taraf ishaara karta hai jisne use bheja; khamosh timeouts (<code>*</code> ya <code>.</code>) aise path ki taraf ishaara karte hain jahan replies kho rahe hain, bahut baar return path.</p></div>

<h3>Fault 2 (Lab 2): neighbours up, LAN missing</h3>
<p>PC1 PC2 ko ping nahi kar paata. R1 ke dono neighbours FULL hain, phir bhi 192.168.2.0/24 ka route nahi hai.</p>
<pre class="out">R2#show ip protocols
  Routing for Networks:
    10.0.0.0 0.255.255.255 area 0
<span class="hl">  (no 192.168.0.0 statement)</span>

R2#show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/1        1     0               10.0.23.1/30       1     DR    1/1
Gi0/0        1     0               10.0.12.2/30       1     DR    1/1</pre>
<p>Gi0/2 (LAN) list mein nahi hai, isliye R2 kabhi 192.168.2.0/24 advertise nahi karta. R2 par <code>router ospf 1</code> ke neeche <code>network 192.168.0.0 0.0.255.255 area 0</code> add karne se theek ho jaata hai.</p>

<h3>Fault 3 (Lab 2): failover jo hota hi nahi</h3>
<p>R1 Gi0/0 shut karne ke baad PC1 PC2 ko poori tarah kho deta hai. R1 par <code>show ip ospf neighbor</code> Gi0/1 par koi neighbour nahi dikhata. R3 par <code>show ip ospf interface</code> Gi0/0 par area 1 dikhata hai jabki R1 area 0 use karta hai. Backup path kabhi tha hi nahi. R3 par area theek karo aur failover kaam karta hai, route [110/3] via 10.0.13.2 mein badal jaata hai.</p>

<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Host sirf apne subnet tak pahunchta hai</td><td>Galat ya missing default gateway</td><td>ipconfig, gateway ping</td></tr>
<tr><td>Trace ek router ke baad rukta hai, koi "unreachable" nahi</td><td>Aage kahin missing return route</td><td>Door wali side se show ip route</td></tr>
<tr><td>Router se "Destination unreachable"</td><td>Us router ke paas route nahi</td><td>Us router par show ip route</td></tr>
<tr><td>Static route table se gayab</td><td>Next hop unreachable, interface down</td><td>show ip interface brief</td></tr>
<tr><td>OSPF neighbour nahi</td><td>Area, subnet, timers, auth mismatch; passive interface</td><td>show ip ospf interface</td></tr>
<tr><td>ExStart/Exchange mein atka</td><td>MTU mismatch</td><td>show interfaces (MTU)</td></tr>
<tr><td>Neighbours FULL, prefix missing</td><td>Interface OSPF mein included nahi</td><td>show ip protocols</td></tr>
<tr><td>Traffic ajeeb path leta hai</td><td>Kahin aur zyada specific route ya kam AD</td><td>show ip route &lt;dest&gt;</td></tr>
<tr><td>Packets loop karte hain, TTL expire</td><td>Do routers ek doosre ki taraf default-routing</td><td>traceroute mein repeat hote hops</td></tr>
</table>

<div class="warn"><p><b>Common galti.</b> Ek saath kai cheezein badalna. Agar aap ek saath route add karte ho, area badalte ho aur interface bounce karte ho, to aapko pata nahi chalega ki kis change ne theek kiya, ya kisne kuch aur tod diya. Ek change, ek test.</p></div>

<div class="exam"><p><b>Exam trap.</b> CompTIA methodology ka order matter karta hai: problem identify karo, theory establish karo, theory test karo, plan of action banao, implement ya escalate karo, full system functionality verify karo (aur preventive measures), findings document karo. "Document" hamesha aakhri hai; "question the obvious" theory establish karne ka hissa hai.</p></div>

<div class="scn"><h4>Migration ke baad routing loop</h4><p>WAN migration ke baad ek branch ke users ne report kiya ki kuch HQ servers time out ho rahe hain. Traceroute mein hops 10.0.99.1 aur 10.0.99.2 ke beech baari baari aate rahe jab tak woh haar nahi gaya. HQ-CORE ka 10.2.9.0/24 wala route purane circuit ke saath hat gaya tha, isliye HQ-CORE apne default route par gira, jo naye WAN router ki taraf point karta tha, aur WAN router ka apna default route seedha wapas HQ-CORE ki taraf point karta tha. Engineer ne branch ki taraf missing specific route add kiya aur loop gayab ho gaya.</p><p><b>Seekh:</b> traceroute mein repeat hote hops ka matlab routing loop hai. Do routers dhoondho aur us destination ke liye dono ki tables padho.</p></div>

<div class="iv"><p class="q">"User kehta hai ki woh doosre office ke server tak nahi pahunch paa raha. Apna troubleshooting samjhao."</p><p>Strong answer: scope aur recent changes collect karo; host ka IP, mask, gateway check karo aur gateway ping karo; traceroute se dekho kahan rukta hai; us router par destination ke liye <code>show ip route</code> aur <code>show ip interface brief</code> use karo; door wali side se return path check karo; routing protocol neighbours aur included interfaces check karo; phir ACLs aur NAT. Ek cheez fix karo, dono directions verify karo, document karo. Missing return route jaisa concrete example do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein kaam karo: define, host, trace, route lookup, interfaces, return path, protocol, doosre features, fix aur document.</li>
<li>Traceroute dikhata hai packets kahan marte hain; khamoshi se theek pehle wala router aapka starting point hai.</li>
<li>"Unreachable" us router se aata hai jiske paas route nahi; khamosh timeouts aksar missing return route ka matlab hain.</li>
<li>OSPF ke liye neighbours, included interfaces, area, timers, masks aur MTU check karo.</li>
<li>Ek baar mein ek cheez badlo aur dono directions mein verify karo.</li>
</ul></div>
`}};export{e as default};