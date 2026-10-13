var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module knowing how EIGRP works. You finish it knowing how EIGRP <b>breaks</b>, and how to prove each fault with one command. Use this page the night before the exam and the morning of a hard ticket.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Blueprint map">
<rect x="20" y="20" width="290" height="130" rx="10" fill="#bae6fd"/><text x="165" y="46" text-anchor="middle" class="svg-ink" font-size="14">1.8 Troubleshoot EIGRP</text>
<text x="40" y="72" class="svg-ink" font-size="12">Named mode, IPv4/IPv6 (ch 2-3)</text><text x="40" y="92" class="svg-ink" font-size="12">Neighbours, auth (ch 4-5)</text><text x="40" y="112" class="svg-ink" font-size="12">DUAL, SIA, stubs (ch 6-8)</text><text x="40" y="132" class="svg-ink" font-size="12">Metrics, load balancing (ch 10)</text>
<rect x="330" y="20" width="290" height="130" rx="10" fill="#bbf7d0"/><text x="475" y="46" text-anchor="middle" class="svg-ink" font-size="14">1.5 Summarisation</text>
<text x="350" y="72" class="svg-ink" font-size="12">EIGRP manual, Null0 AD 5 (ch 9)</text><text x="350" y="92" class="svg-ink" font-size="12">Auto-summary, discontiguous</text><text x="350" y="112" class="svg-ink" font-size="12">OSPF, BGP, RIP comparison</text><text x="350" y="132" class="svg-ink" font-size="12">Filtering, DMVPN preview (ch 11)</text>
</svg><p class="cap">Where each blueprint item is covered in this module.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can configure named mode (address-family, af-interface, topology base) and place every command at the right level.</li>
<li>I can convert classic to named with <code>eigrp upgrade-cli</code> and explain what changes (metric scale, interface commands).</li>
<li>I can run the IPv6 address family and explain link-local neighbours, FF02::A and the router-ID requirement.</li>
<li>I can separate "never forms" from "forms and flaps" and name the causes of each.</li>
<li>I can configure and troubleshoot MD5 key chains (key ID rule, lifetimes) and HMAC-SHA-256.</li>
<li>I can apply the feasibility condition from topology output and explain why a path is or is not a feasible successor.</li>
<li>I can trace a stuck-in-active route with <code>show ip eigrp topology active</code> and prevent SIA with stubs and summaries.</li>
<li>I can choose stub options, including leak-maps for dual-homed branches.</li>
<li>I can summarise exactly, verify the Null0 route, and troubleshoot auto-summary and summaries in OSPF and BGP.</li>
<li>I can explain wide metrics and RIB scale, and make ECMP, variance, offset-lists and distribute-lists work.</li>
<li>I can walk both labs: named mode with stubs and summaries, and the three-fault flapping ticket.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>af-interface</dt><dd>Named-mode per-interface settings; <code>af-interface default</code> applies to all.</dd>
<dt>topology base</dt><dd>Named-mode route policy: variance, paths, filters, redistribution, distance, active timer.</dd>
<dt>Wide metric / RIB scale</dt><dd>64-bit named-mode metric; divided by the RIB scale (128) for the routing table.</dd>
<dt>Feasibility condition</dt><dd>Neighbour's RD strictly less than your FD.</dd>
<dt>Active / SIA</dt><dd>A route being recomputed with Queries; stuck in active when a neighbour neither replies nor answers the SIA-Query.</dd>
<dt>SIA-Query / SIA-Reply</dt><dd>"Are you still working?" / "Yes", sent at half the active timer.</dd>
<dt>Stub</dt><dd>A router never queried and never transit; advertises only listed route types.</dd>
<dt>Leak-map</dt><dd>Route map that lets a stub (or a summary) advertise selected extra routes.</dd>
<dt>Summary Null0 route</dt><dd>Discard route created by summarisation, AD 5 in EIGRP.</dd>
<dt>Offset-list</dt><dd>Adds a value to the metric of matched routes in or out of an interface.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Must match</td><td>AS, K values, primary subnet, authentication; timers and MTU need not</td></tr>
<tr><td>Silent vs logged</td><td>AS mismatch silent; K-value mismatch and "not on common subnet" logged</td></tr>
<tr><td>Flapping</td><td>Retry limit exceeded + Q Cnt = one-way reliable delivery (auth, unicast ACL, MTU)</td></tr>
<tr><td>MD5</td><td>Lowest valid key sent; receiver needs same key ID and string</td></tr>
<tr><td>HMAC-SHA-256</td><td>Named mode only, per af-interface</td></tr>
<tr><td>Active timer</td><td>3 minutes; SIA-Query at half; SIA-Reply prevents reset</td></tr>
<tr><td>Stub default</td><td>connected summary; stubs are never queried</td></tr>
<tr><td>Summary</td><td>Per interface, Null0 AD 5, metric = lowest component</td></tr>
<tr><td>Auto-summary</td><td>Off by default; breaks discontiguous networks</td></tr>
<tr><td>Load balancing</td><td>maximum-paths 4; variance uses only feasible successors below variance x FD</td></tr>
<tr><td>Named RIB metric</td><td>Wide metric / 128</td></tr>
<tr><td>AD</td><td>Summary 5, internal 90, external 170</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! verification</span>
show ip eigrp neighbors [detail]          show eigrp address-family ipv4 neighbors [detail]
show ip eigrp interfaces [detail]         show eigrp address-family ipv6 neighbors
show ip eigrp topology [all-links|active] show ip protocols
show ip route eigrp                       show ip route 10.1.0.0 255.255.252.0
show key chain                            show ip prefix-list detail
<span class="c">! debugs (stop with undebug all)</span>
debug eigrp packets hello                 debug eigrp fsm
<span class="c">! named-mode fixes</span>
af-interface Gi0/0 → no passive-interface | summary-address | authentication mode md5 / hmac-sha-256
topology base → variance | maximum-paths | distribute-list | offset-list | timers active-time
address-family → eigrp stub connected summary [leak-map] | eigrp router-id | metric weights 0 1 0 1 0 0 0
router eigrp 10 → eigrp upgrade-cli NK-WAN</pre>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Comparing total metrics for the feasibility condition; forgetting the mask when looking for a summary; changing hello without hold; a prefix-list with no final permit; a stub without <code>summary</code> on a summarising branch.</p></div>

<div class="exam"><p><b>Final exam trap.</b> When output shows <code>VR(NAME)</code>, the router is in named mode: look for settings under af-interface and topology base, expect wide metrics in the topology table and scaled metrics in the RIB, and remember HMAC-SHA-256 is possible.</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A candidate for a network operations role was given this: "Branch users cannot reach the data centre; the hub logs the branch going up and down every 80 seconds." She drew the four layers, said "retry limit exceeded plus a non-zero Q Cnt means one-way reliable delivery", and listed one-sided authentication, an ACL permitting only 224.0.0.10, and MTU loss of large updates, with the command for each. Then she added that the branch should be a stub to keep the hub's query domain small. She got the job.</p><p><b>Lesson:</b> the facts in this module become powerful when you can chain symptom, cause, proof and prevention in one breath.</p></div>

<div class="iv"><p class="q">"Summarise the most important EIGRP troubleshooting commands and what each tells you."</p><p>Neighbors (who, uptime, Q Cnt, stub), interfaces detail (timers, split horizon, authentication), protocols (AS, K values, networks, passive, filters, stub, variance), topology with all-links and active (FD, RD, feasible successors, outstanding replies), route with mask (what was installed, AD), key chain (IDs and lifetimes). End with debugs as confirmation only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Named mode: AS in the address family, per-link settings in af-interface, policy in topology base.</li>
<li>Neighbour faults: never forms (mismatch, passive, ACL, auth) or flaps (one-way delivery, timers, MTU).</li>
<li>DUAL: RD &lt; FD for a feasible successor; no FS means Active, Queries and possible SIA.</li>
<li>Stubs and exact summaries shrink the query domain and keep the network stable.</li>
<li>Variance, offset-lists and distribute-lists shape traffic, and each has one classic trap.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module yeh jaante hue shuru kiya ki EIGRP kaise kaam karta hai. Aap ise yeh jaante hue khatam karte ho ki EIGRP kaise <b>toot-ta</b> hai, aur har fault ko ek command se kaise prove karein. Yeh page exam se pehle ki raat aur mushkil ticket ki subah use karo.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Blueprint map">
<rect x="20" y="20" width="290" height="130" rx="10" fill="#bae6fd"/><text x="165" y="46" text-anchor="middle" class="svg-ink" font-size="14">1.8 EIGRP troubleshoot</text>
<text x="40" y="72" class="svg-ink" font-size="12">Named mode, IPv4/IPv6 (ch 2-3)</text><text x="40" y="92" class="svg-ink" font-size="12">Neighbours, auth (ch 4-5)</text><text x="40" y="112" class="svg-ink" font-size="12">DUAL, SIA, stubs (ch 6-8)</text><text x="40" y="132" class="svg-ink" font-size="12">Metrics, load balancing (ch 10)</text>
<rect x="330" y="20" width="290" height="130" rx="10" fill="#bbf7d0"/><text x="475" y="46" text-anchor="middle" class="svg-ink" font-size="14">1.5 Summarisation</text>
<text x="350" y="72" class="svg-ink" font-size="12">EIGRP manual, Null0 AD 5 (ch 9)</text><text x="350" y="92" class="svg-ink" font-size="12">Auto-summary, discontiguous</text><text x="350" y="112" class="svg-ink" font-size="12">OSPF, BGP, RIP comparison</text><text x="350" y="132" class="svg-ink" font-size="12">Filtering, DMVPN preview (ch 11)</text>
</svg><p class="cap">Har blueprint item is module mein kahan cover hua hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main named mode (address-family, af-interface, topology base) configure kar sakta hoon aur har command sahi level par rakh sakta hoon.</li>
<li>Main <code>eigrp upgrade-cli</code> se classic ko named mein convert kar sakta hoon aur samjha sakta hoon kya badalta hai (metric scale, interface commands).</li>
<li>Main IPv6 address family chala sakta hoon aur link-local neighbours, FF02::A aur router-ID requirement samjha sakta hoon.</li>
<li>Main "kabhi nahi banta" ko "banta hai aur flap karta hai" se alag kar sakta hoon aur dono ki wajahon ke naam le sakta hoon.</li>
<li>Main MD5 key chains (key ID rule, lifetimes) aur HMAC-SHA-256 configure aur troubleshoot kar sakta hoon.</li>
<li>Main topology output se feasibility condition apply kar sakta hoon aur samjha sakta hoon ki koi path feasible successor kyun hai ya nahi.</li>
<li>Main <code>show ip eigrp topology active</code> se stuck-in-active route trace kar sakta hoon aur stubs aur summaries se SIA rok sakta hoon.</li>
<li>Main stub options chun sakta hoon, dual-homed branches ke liye leak-maps samet.</li>
<li>Main exact summarise kar sakta hoon, Null0 route verify kar sakta hoon, aur auto-summary aur OSPF aur BGP ke summaries troubleshoot kar sakta hoon.</li>
<li>Main wide metrics aur RIB scale samjha sakta hoon, aur ECMP, variance, offset-lists aur distribute-lists ko kaam karwa sakta hoon.</li>
<li>Main dono labs walk kar sakta hoon: stubs aur summaries ke saath named mode, aur teen-fault wala flapping ticket.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>af-interface</dt><dd>Named-mode per-interface settings; <code>af-interface default</code> sab par apply hota hai.</dd>
<dt>topology base</dt><dd>Named-mode route policy: variance, paths, filters, redistribution, distance, active timer.</dd>
<dt>Wide metric / RIB scale</dt><dd>64-bit named-mode metric; routing table ke liye RIB scale (128) se divide hota hai.</dd>
<dt>Feasibility condition</dt><dd>Neighbour ka RD aapke FD se strictly kam.</dd>
<dt>Active / SIA</dt><dd>Queries ke saath recompute hota route; stuck in active jab koi neighbour na reply kare na SIA-Query ka jawab de.</dd>
<dt>SIA-Query / SIA-Reply</dt><dd>"Kya tum abhi bhi kaam kar rahe ho?" / "Haan", active timer ke aadhe par bheja jaata hai.</dd>
<dt>Stub</dt><dd>Aisa router jo kabhi query nahi hota aur kabhi transit nahi banta; sirf listed route types advertise karta hai.</dd>
<dt>Leak-map</dt><dd>Route map jo stub (ya summary) ko chune hue extra routes advertise karne deta hai.</dd>
<dt>Summary Null0 route</dt><dd>Summarisation se bana discard route, EIGRP mein AD 5.</dd>
<dt>Offset-list</dt><dd>Interface ke in ya out par match hue routes ke metric mein value jodta hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Match hona chahiye</td><td>AS, K values, primary subnet, authentication; timers aur MTU zaroori nahi</td></tr>
<tr><td>Silent vs logged</td><td>AS mismatch silent; K-value mismatch aur "not on common subnet" logged</td></tr>
<tr><td>Flapping</td><td>Retry limit exceeded + Q Cnt = one-way reliable delivery (auth, unicast ACL, MTU)</td></tr>
<tr><td>MD5</td><td>Sabse chhoti valid key bheji jaati hai; receiver ko same key ID aur string chahiye</td></tr>
<tr><td>HMAC-SHA-256</td><td>Sirf named mode, har af-interface par</td></tr>
<tr><td>Active timer</td><td>3 minute; SIA-Query aadhe par; SIA-Reply reset rokta hai</td></tr>
<tr><td>Stub default</td><td>connected summary; stubs kabhi query nahi hote</td></tr>
<tr><td>Summary</td><td>Per interface, Null0 AD 5, metric = sabse kam component</td></tr>
<tr><td>Auto-summary</td><td>Default off; discontiguous networks todta hai</td></tr>
<tr><td>Load balancing</td><td>maximum-paths 4; variance sirf variance x FD se neeche wale feasible successors use karta hai</td></tr>
<tr><td>Named RIB metric</td><td>Wide metric / 128</td></tr>
<tr><td>AD</td><td>Summary 5, internal 90, external 170</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! verification</span>
show ip eigrp neighbors [detail]          show eigrp address-family ipv4 neighbors [detail]
show ip eigrp interfaces [detail]         show eigrp address-family ipv6 neighbors
show ip eigrp topology [all-links|active] show ip protocols
show ip route eigrp                       show ip route 10.1.0.0 255.255.252.0
show key chain                            show ip prefix-list detail
<span class="c">! debugs (undebug all se band karo)</span>
debug eigrp packets hello                 debug eigrp fsm
<span class="c">! named-mode fixes</span>
af-interface Gi0/0 → no passive-interface | summary-address | authentication mode md5 / hmac-sha-256
topology base → variance | maximum-paths | distribute-list | offset-list | timers active-time
address-family → eigrp stub connected summary [leak-map] | eigrp router-id | metric weights 0 1 0 1 0 0 0
router eigrp 10 → eigrp upgrade-cli NK-WAN</pre>

<div class="warn"><p><b>Aakhri waqt ki galtiyan jinse bachna hai.</b> Feasibility condition ke liye total metrics compare karna; summary dhoondhte waqt mask bhool jaana; hold ke bina hello badalna; bina final permit ki prefix-list; summarise karne wali branch par bina <code>summary</code> ka stub.</p></div>

<div class="exam"><p><b>Final exam trap.</b> Jab output <code>VR(NAME)</code> dikhaye, router named mode mein hai: settings af-interface aur topology base ke neeche dhoondho, topology table mein wide metrics aur RIB mein scaled metrics ki umeed rakho, aur yaad rakho ki HMAC-SHA-256 possible hai.</p></div>

<div class="scn"><h4>Interview whiteboard</h4><p>Network operations role ke ek candidate ko yeh diya gaya: "Branch users data centre tak nahi pahunch pa rahe; hub har 80 second mein branch ke up-down hone ka log karta hai." Usne chaar layers draw ki, boli "retry limit exceeded plus non-zero Q Cnt matlab one-way reliable delivery", aur ek side authentication, sirf 224.0.0.10 permit karti ACL, aur bade updates ka MTU loss, har ek ke command ke saath list kiya. Phir usne joda ki hub ka query domain chhota rakhne ke liye branch stub honi chahiye. Use job mil gayi.</p><p><b>Seekh:</b> is module ke facts tab powerful bante hain jab aap symptom, wajah, saboot aur prevention ko ek saans mein jod sako.</p></div>

<div class="iv"><p class="q">"Sabse important EIGRP troubleshooting commands summarise karo aur batao har ek kya batata hai."</p><p>Neighbors (kaun, uptime, Q Cnt, stub), interfaces detail (timers, split horizon, authentication), protocols (AS, K values, networks, passive, filters, stub, variance), all-links aur active ke saath topology (FD, RD, feasible successors, outstanding replies), mask ke saath route (kya install hua, AD), key chain (IDs aur lifetimes). Debugs ke saath khatam karo, sirf confirmation ke liye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Named mode: AS address family mein, per-link settings af-interface mein, policy topology base mein.</li>
<li>Neighbour faults: kabhi nahi banta (mismatch, passive, ACL, auth) ya flap karta hai (one-way delivery, timers, MTU).</li>
<li>DUAL: feasible successor ke liye RD &lt; FD; FS nahi matlab Active, Queries aur sambhav SIA.</li>
<li>Stubs aur exact summaries query domain chhota karte hain aur network stable rakhte hain.</li>
<li>Variance, offset-lists aur distribute-lists traffic shape karte hain, aur har ek ka ek classic trap hai.</li>
</ul></div>
`}};export{e as default};