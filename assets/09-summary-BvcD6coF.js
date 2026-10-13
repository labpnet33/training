var e={id:`bgp-summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Think of BGP as international trade between countries. Each country (AS) has its own internal rules (the IGP), but at the border there are treaties (sessions), declarations on each parcel (attributes), customs rules (policy) and a standard way to choose between routes (best path selection). If you can name each of those four parts and show it on the router, you know BGP at the level of the exam.</p>

<h3>The module on one page</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="BGP module map">
<rect x="20" y="20" width="180" height="70" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="110" y="48" text-anchor="middle" class="svg-ink" font-size="13">Sessions</text><text x="110" y="68" text-anchor="middle" class="svg-muted" font-size="11">TCP 179, states, groups</text>
<rect x="230" y="20" width="180" height="70" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">EBGP and IBGP</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="11">loopbacks, full mesh</text>
<rect x="440" y="20" width="180" height="70" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="530" y="48" text-anchor="middle" class="svg-ink" font-size="13">Attributes</text><text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="11">AS path, next hop, LP, MED</text>
<rect x="125" y="115" width="180" height="70" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="215" y="143" text-anchor="middle" class="svg-ink" font-size="13">Next hop and hidden</text><text x="215" y="163" text-anchor="middle" class="svg-muted" font-size="11">next-hop self</text>
<rect x="335" y="115" width="180" height="70" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="425" y="143" text-anchor="middle" class="svg-ink" font-size="13">Best path and policy</text><text x="425" y="163" text-anchor="middle" class="svg-muted" font-size="11">LP in, prepend out</text>
<line x1="200" y1="55" x2="230" y2="55" stroke="#64748b" stroke-width="2"/><line x1="410" y1="55" x2="440" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">From a TCP session to a policy-controlled route choice.</p></div>

<h3>Facts to memorise</h3>
<table class="cmp"><tr><th>Topic</th><th>What to remember</th></tr>
<tr><td>Transport</td><td>TCP 179. Messages: OPEN, UPDATE, KEEPALIVE, NOTIFICATION. Hold 90 s, keepalive 30 s.</td></tr>
<tr><td>States</td><td>Idle, Connect, Active, OpenSent, OpenConfirm, Established. Active means TCP failing.</td></tr>
<tr><td>Config</td><td>routing-options autonomous-system, group type external or internal, peer-as, neighbour, local-address for loopbacks.</td></tr>
<tr><td>EBGP vs IBGP</td><td>EBGP: next hop self, own AS added. IBGP: next hop kept, no AS added, split horizon, full mesh.</td></tr>
<tr><td>Attributes</td><td>AS path, next hop, origin (well-known mandatory); local preference (well-known discretionary); MED (optional non-transitive); community (optional transitive).</td></tr>
<tr><td>Preference</td><td>BGP 170 for internal and external. OSPF internal 10, static 5.</td></tr>
<tr><td>Hidden</td><td>Unresolved protocol next hop. Fix: next-hop self export policy on the edge router, or IGP reachability.</td></tr>
<tr><td>Best path</td><td>Resolvable, preference, local preference, AS path, origin, MED, EBGP over IBGP, IGP metric, router ID.</td></tr>
<tr><td>Steering</td><td>Outbound: local preference on import. Inbound: prepending or MED on export (advisory).</td></tr>
<tr><td>Export</td><td>Default export advertises active BGP routes only; direct and static need a policy.</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">show bgp summary
show bgp neighbor 100.65.1.1
show route receive-protocol bgp 100.65.1.1
show route advertising-protocol bgp 10.20.255.1
show route protocol bgp
show route hidden detail
show route 192.0.2.0/24 detail</pre>

<div class="eg"><p><b>Worked example.</b> Design check for AS 65030 with R1 to ISP-A and R2 to ISP-B. IBGP between the loopbacks of R1 and R2 with local-address (2 routers need 1 session). R1 imports ISP-A routes with local preference 200 so both routers exit through ISP-A. R2 prepends twice towards ISP-B, so ISP-B prefers the ISP-A path to reach us. Next-hop self on both edge routers keeps ISP links out of the IGP. You can check every sentence of this design with one of the commands above.</p></div>

<div class="warn"><p><b>Common mistake.</b> Learning commands without the cause. Exam questions give an output and ask for the reason; read the state, the active/received counts, the next hop and the Inactive reason before choosing an answer.</p></div>
<div class="exam"><p><b>Exam checklist.</b> (1) Can I explain each BGP state and what Active means? (2) Can I configure EBGP and IBGP over loopbacks with local-address? (3) Do I know split horizon and the full-mesh formula? (4) Can I classify every attribute and say which are mandatory? (5) Can I recognise a hidden route and fix it with next-hop self? (6) Can I list the best path rules in order? (7) Can I steer outbound with local preference and inbound with prepending? (8) Can I follow the five stages of troubleshooting?</p></div>

<div class="scn"><h4>The design question</h4><p>An interviewer draws two routers, two ISPs and asks "make ISP-A primary". A strong answer names the direction first: outbound with local preference on import from ISP-A, inbound with prepending on the export to ISP-B. Then it says how to verify: show route detail on both routers and the Inactive reason, and a check from the ISP side if possible.</p><p><b>Lesson:</b> a clear direction, a clear tool and a clear check.</p></div>

<div class="iv"><p class="q">"Summarise BGP in one minute."</p><p>BGP is the path-vector protocol between autonomous systems, running over TCP 179 with manually configured neighbours. EBGP connects ASes and changes the next hop; IBGP spreads the routes inside and needs a full mesh because of split horizon, usually over loopbacks. Each route carries attributes such as AS path and local preference, and Junos picks the best path by a fixed order, with policy used to steer traffic. For faults I check the session, the received routes, hidden routes and the Inactive reason.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sessions, attributes, next hop and policy are the four ideas.</li>
<li>IBGP needs loopbacks, local-address, a full mesh, and next-hop self at the edge.</li>
<li>Local preference decides your exit; prepending suggests the entry.</li>
<li>Troubleshoot in stages. Next: practise the three labs, then move on to the next module.</li>
</ul></div>
`,hi:`
<p>BGP ko deshon ke beech antarrashtriya vyapar ki tarah socho. Har desh (AS) ke apne andar ke niyam (IGP) hain, par seema par sandhiyan (sessions), har parcel par ghoshnayein (attributes), customs rules (policy) aur routes chunne ka ek standard tareeka (best path selection) hota hai. In chaaron hisson ka naam le sakte ho aur router par dikha sakte ho, to aap exam level par BGP jaante ho.</p>

<h3>Module ek page mein</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="BGP module map">
<rect x="20" y="20" width="180" height="70" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="110" y="48" text-anchor="middle" class="svg-ink" font-size="13">Sessions</text><text x="110" y="68" text-anchor="middle" class="svg-muted" font-size="11">TCP 179, states, groups</text>
<rect x="230" y="20" width="180" height="70" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">EBGP aur IBGP</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="11">loopbacks, full mesh</text>
<rect x="440" y="20" width="180" height="70" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="530" y="48" text-anchor="middle" class="svg-ink" font-size="13">Attributes</text><text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="11">AS path, next hop, LP, MED</text>
<rect x="125" y="115" width="180" height="70" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="215" y="143" text-anchor="middle" class="svg-ink" font-size="13">Next hop aur hidden</text><text x="215" y="163" text-anchor="middle" class="svg-muted" font-size="11">next-hop self</text>
<rect x="335" y="115" width="180" height="70" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="425" y="143" text-anchor="middle" class="svg-ink" font-size="13">Best path aur policy</text><text x="425" y="163" text-anchor="middle" class="svg-muted" font-size="11">LP in, prepend out</text>
<line x1="200" y1="55" x2="230" y2="55" stroke="#64748b" stroke-width="2"/><line x1="410" y1="55" x2="440" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">TCP session se policy-controlled route choice tak.</p></div>

<h3>Yaad rakhne wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Kya yaad rakhna hai</th></tr>
<tr><td>Transport</td><td>TCP 179. Messages: OPEN, UPDATE, KEEPALIVE, NOTIFICATION. Hold 90 s, keepalive 30 s.</td></tr>
<tr><td>States</td><td>Idle, Connect, Active, OpenSent, OpenConfirm, Established. Active ka matlab TCP fail.</td></tr>
<tr><td>Config</td><td>routing-options autonomous-system, group type external ya internal, peer-as, neighbour, loopbacks ke liye local-address.</td></tr>
<tr><td>EBGP vs IBGP</td><td>EBGP: next hop self, apna AS jodta. IBGP: next hop wahi, AS nahi jodta, split horizon, full mesh.</td></tr>
<tr><td>Attributes</td><td>AS path, next hop, origin (well-known mandatory); local preference (well-known discretionary); MED (optional non-transitive); community (optional transitive).</td></tr>
<tr><td>Preference</td><td>BGP internal aur external dono 170. OSPF internal 10, static 5.</td></tr>
<tr><td>Hidden</td><td>Unresolved protocol next hop. Fix: edge router par next-hop self export policy, ya IGP reachability.</td></tr>
<tr><td>Best path</td><td>Resolvable, preference, local preference, AS path, origin, MED, EBGP over IBGP, IGP metric, router ID.</td></tr>
<tr><td>Steering</td><td>Outbound: import par local preference. Inbound: export par prepending ya MED (salaah).</td></tr>
<tr><td>Export</td><td>Default export sirf active BGP routes advertise karta hai; direct aur static ke liye policy chahiye.</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">show bgp summary
show bgp neighbor 100.65.1.1
show route receive-protocol bgp 100.65.1.1
show route advertising-protocol bgp 10.20.255.1
show route protocol bgp
show route hidden detail
show route 192.0.2.0/24 detail</pre>

<div class="eg"><p><b>Worked example.</b> AS 65030 ke liye design check, R1 ISP-A se aur R2 ISP-B se. R1 aur R2 ke loopbacks ke beech local-address ke saath IBGP (2 routers ko 1 session chahiye). R1 ISP-A ke routes local preference 200 se import karta hai, taaki dono routers ISP-A se nikalein. R2 ISP-B ki taraf do baar prepend karta hai, taaki ISP-B hum tak pahunchne ke liye ISP-A wala path prefer kare. Dono edge routers par next-hop self ISP links ko IGP se bahar rakhta hai. Is design ke har vaakya ko upar ki ek command se check kar sakte ho.</p></div>

<div class="warn"><p><b>Common mistake.</b> Karan ke bina commands seekhna. Exam questions output dete hain aur karan poochte hain; jawab chunne se pehle state, active/received counts, next hop aur Inactive reason padho.</p></div>
<div class="exam"><p><b>Exam checklist.</b> (1) Kya main har BGP state samjha sakta hoon aur Active ka matlab? (2) Kya main loopbacks par local-address ke saath EBGP aur IBGP configure kar sakta hoon? (3) Kya split horizon aur full-mesh formula aata hai? (4) Kya har attribute ko classify karke bata sakta hoon kaun mandatory hain? (5) Kya hidden route pehchan kar next-hop self se fix kar sakta hoon? (6) Kya best path rules order mein likh sakta hoon? (7) Kya outbound local preference se aur inbound prepending se steer kar sakta hoon? (8) Kya troubleshooting ke paanch stages follow kar sakta hoon?</p></div>

<div class="scn"><h4>Design ka sawal</h4><p>Interviewer do routers, do ISPs banakar poochta hai "ISP-A ko primary banao". Achha jawab pehle disha batata hai: outbound ISP-A se import par local preference se, inbound ISP-B ko export par prepending se. Phir batata hai verify kaise: dono routers par show route detail aur Inactive reason, aur sambhav ho to ISP ki taraf se check.</p><p><b>Lesson:</b> saaf disha, saaf tool aur saaf check.</p></div>

<div class="iv"><p class="q">"BGP ko ek minute mein summarise karo."</p><p>BGP autonomous systems ke beech path-vector protocol hai, TCP 179 par, haath se configured neighbours ke saath. EBGP ASes jodta hai aur next hop badalta hai; IBGP andar routes baantta hai aur split horizon ki wajah se full mesh chahiye, aam taur par loopbacks par. Har route AS path aur local preference jaise attributes carry karta hai, aur Junos tay order se best path chunta hai, aur traffic steer karne ke liye policy use hoti hai. Faults ke liye main session, received routes, hidden routes aur Inactive reason check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sessions, attributes, next hop aur policy chaar ideas hain.</li>
<li>IBGP ko loopbacks, local-address, full mesh, aur edge par next-hop self chahiye.</li>
<li>Local preference aapka exit tay karti hai; prepending entry ka sujhav deta hai.</li>
<li>Stages mein troubleshoot karo. Agla: teeno labs practise karo, phir agle module par jao.</li>
</ul></div>
`}};export{e as default};