var e={id:`troubleshooting`,h:{en:`Troubleshooting filters and uRPF: workflow and the lab ticket`,hi:`Filters aur uRPF troubleshooting: workflow aur lab ticket`},body:{en:`
<p>When a filter misbehaves, users complain about connectivity, not about "firewall filters". Your job is to connect the symptom to the rule. This chapter gives a repeatable workflow, a table of classic faults, and the full walk-through of the module's troubleshooting lab: uRPF in the wrong place.</p>

<h3>Analogy: a doctor's checklist</h3>
<p>A doctor does not guess. They check pulse, then temperature, then ask where it hurts. Filters have equivalent vital signs: is it attached, which direction, do counters move, what is the order of terms. Following the same sequence every time makes you fast.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Filter troubleshooting steps">
<rect x="10" y="60" width="115" height="65" rx="8" fill="#e2e8f0"/><text x="67" y="88" text-anchor="middle" class="svg-ink" font-size="12">1. Symptom</text><text x="67" y="106" text-anchor="middle" class="svg-muted" font-size="11">who, what, where</text>
<rect x="135" y="60" width="115" height="65" rx="8" fill="#bae6fd"/><text x="192" y="88" text-anchor="middle" class="svg-ink" font-size="12">2. Attached?</text><text x="192" y="106" text-anchor="middle" class="svg-muted" font-size="11">interface, direction</text>
<rect x="260" y="60" width="115" height="65" rx="8" fill="#ddd6fe"/><text x="317" y="88" text-anchor="middle" class="svg-ink" font-size="12">3. Terms</text><text x="317" y="106" text-anchor="middle" class="svg-muted" font-size="11">order, last term</text>
<rect x="385" y="60" width="115" height="65" rx="8" fill="#fde68a"/><text x="442" y="88" text-anchor="middle" class="svg-ink" font-size="12">4. Counters</text><text x="442" y="106" text-anchor="middle" class="svg-muted" font-size="11">show firewall</text>
<rect x="510" y="60" width="115" height="65" rx="8" fill="#bbf7d0"/><text x="567" y="88" text-anchor="middle" class="svg-ink" font-size="12">5. Fix + re-test</text><text x="567" y="106" text-anchor="middle" class="svg-muted" font-size="11">both sides</text>
<line x1="125" y1="92" x2="135" y2="92" stroke="#64748b" stroke-width="2"/><line x1="250" y1="92" x2="260" y2="92" stroke="#64748b" stroke-width="2"/><line x1="375" y1="92" x2="385" y2="92" stroke="#64748b" stroke-width="2"/><line x1="500" y1="92" x2="510" y2="92" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Counters tell you whether packets reach the term at all</text>
</svg><p class="cap">Five stages, in this order, find nearly every filter fault.</p></div>

<h3>The five-step workflow</h3>
<ol>
<li><b>Define the symptom exactly.</b> Which source, which destination, which protocol, since when? "Cannot reach the server" is vague; "PC1 to 172.16.30.10 ping fails since the contractor change" is useful.</li>
<li><b>Is a filter attached where the packet passes?</b> <code>show interfaces filters</code>; check both input and output on every hop, plus the lo0 filter for traffic to the router, plus rpf-check on the interface.</li>
<li><b>Read the terms in order.</b> <code>show firewall family inet filter NAME</code>. Is there a final accept? Is a block placed after an accept? Is a count-only term accepting early?</li>
<li><b>Read the counters.</b> <code>clear firewall all</code>, repeat the test, <code>show firewall</code>. A counter that rises means the term matches. A counter that stays at zero means the packet takes a different term or never arrives.</li>
<li><b>Fix and re-test both sides:</b> the traffic that must pass and the traffic that must be blocked.</li>
</ol>

<h3>Classic faults and signatures</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>All traffic dropped after applying filter</td><td>No final accept; implicit discard</td><td>show firewall family inet filter NAME</td></tr>
<tr><td>Routing neighbour drops after lo0 filter</td><td>No term for OSPF, BGP or BFD</td><td>show ospf neighbor, show bgp summary</td></tr>
<tr><td>Block has no effect, counter 0</td><td>Wrong direction, wrong interface, or an earlier accept</td><td>show interfaces filters, term order</td></tr>
<tr><td>Only some replies fail while links are up</td><td>Strict uRPF with asymmetric paths</td><td>show interfaces IFACE extensive, RPF Failures</td></tr>
<tr><td>Cannot log in after change</td><td>lo0 filter missing the management source</td><td>console; rollback 1</td></tr>
<tr><td>Commit rolled back by itself</td><td>commit confirmed not confirmed</td><td>show system commit</td></tr></table>

<h3>Lab ticket: strict uRPF in the wrong place (fw-urpf)</h3>
<p>A contractor enabled strict uRPF on both uplinks of R1-BRANCH. Since then PC1 (10.20.20.10) cannot reach the payroll server SRV (172.16.30.10). Also, PC2 (10.30.30.77 forged) is spoofing the finance subnet 10.30.30.0/24.</p>
<p><b>Symptom and step 2.</b> PC1 ping fails. On R1, interfaces and OSPF are up. <code>show configuration interfaces</code> reveals <code>rpf-check</code> on ge-0/0/0 and ge-0/0/2. The check is strict.</p>
<p><b>Step 3, find the failing interface.</b></p>
<pre class="out">lab@R1-BRANCH&gt; show route 172.16.30.10
172.16.30.0/24     *[OSPF/10] 00:20:10, metric 2
                    &gt; to 10.0.12.2 via ge-0/0/0.0

lab@R1-BRANCH&gt; show interfaces ge-0/0/2.0 extensive
    <span class="hl">RPF Failures: 14</span></pre>
<p>The path out is ge-0/0/0 (R1 cost 1; the ge-0/0/2 side has cost 50). The hub's costs are mirrored: it prefers ge-0/0/2 for the return, so replies arrive on <b>ge-0/0/2</b>, where R1's route to the server does not point. Answer to the lab question: <b>ge-0/0/2</b>.</p>
<p><b>Step 5, fix 1: the uplinks.</b></p>
<pre class="code">lab@R1-BRANCH# set interfaces ge-0/0/0 unit 0 family inet rpf-check mode loose
lab@R1-BRANCH# set interfaces ge-0/0/2 unit 0 family inet rpf-check mode loose
lab@R1-BRANCH# commit</pre>
<p>PC1 can ping 172.16.30.10 again. Removing rpf-check from the uplinks would also work; loose keeps a basic bogus-source check.</p>
<p><b>Fix 2: strict uRPF where it belongs, with evidence.</b></p>
<pre class="code">lab@R1-BRANCH# set firewall family inet filter RPF-FAIL term SPOOF then count spoofed
lab@R1-BRANCH# set firewall family inet filter RPF-FAIL term SPOOF then discard
lab@R1-BRANCH# set interfaces ge-0/0/1 unit 0 family inet rpf-check fail-filter RPF-FAIL
lab@R1-BRANCH# commit and-quit</pre>
<p><b>Re-test both sides.</b></p>
<pre class="out">PC1&gt; ping 172.16.30.10 -c 2
84 bytes from 172.16.30.10: icmp_seq=1 ttl=62 time=2.1 ms     <i>legitimate: works</i>

PC2&gt; ping 172.16.30.10 -c 3
172.16.30.10 icmp_seq=1 timeout                                   <i>forged source: dropped</i>

lab@R1-BRANCH&gt; show firewall

Filter: RPF-FAIL
Counters:
Name                                                Bytes              Packets
<span class="hl">spoofed                                              252                    3</span></pre>
<p>The legitimate host works, the forger is blocked, and the counter holds the evidence.</p>

<h3>A second mini-case: the lockout</h3>
<p>You applied a lo0 filter and lost your SSH session. Do not panic. If you used <code>commit confirmed</code>, wait for the timer. Otherwise use the console or a permitted management host and run <code>rollback 1</code>, then <code>commit</code>. Afterwards, add the missing source to the SSH term and re-apply with commit confirmed.</p>

<div class="warn"><p><b>Common mistake.</b> Fixing a problem by deleting the whole filter. You lose the protection and the evidence. Edit the one wrong term and keep the counters.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Pings fail although every link and routing protocol is up, and strict uRPF is configured" points to asymmetric routing and RPF failures. The answer is loose mode or removing the check, not changing routes.</p></div>

<div class="scn"><h4>Monday morning, payroll is down</h4><p>On Monday the payroll server became unreachable for one branch. The weekend change record said only "security hardening". The engineer started with the five steps: PC1 could ping the next hop, so links were fine. A look at interface configuration found rpf-check on both uplinks. The extensive output showed RPF failures on the second uplink. The hub preferred that uplink for the return because of cost settings. Loose mode on both uplinks restored service in two minutes. They then proposed a standard: strict uRPF on access interfaces only, and an explicit check of routing symmetry before enabling it elsewhere.</p><p><b>Lesson:</b> "everything is up" is the signature of an RPF or filter problem, not a link problem.</p></div>

<div class="iv"><p class="q">"Ping from a branch to the data centre fails but every link and OSPF neighbour is up. What do you check?"</p><p>Strong answer: first, route in both directions. Then filters on the path, input and output, including lo0 for traffic to the router. Then uRPF on interfaces: strict mode with asymmetric paths silently drops replies; show interfaces extensive shows RPF failures. Fix with loose mode on uplinks and strict only on single-homed edges. Re-test both the allowed and the spoofed case.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: symptom, attached, terms, counters, fix and re-test both sides.</li>
<li>Counters zero means no match or wrong place; rising means the term is hit.</li>
<li>Links up but replies fail suggests strict uRPF with asymmetric routing.</li>
<li>Fix uplinks with loose mode; keep strict with a fail-filter on single-homed LANs.</li>
<li>Edit the wrong term, do not delete the filter; use rollback 1 after a lockout.</li>
</ul></div>
`,hi:`
<p>Jab filter galat behave kare to users connectivity ki shikayat karte hain, "firewall filters" ki nahi. Aapka kaam symptom ko rule se jodna hai. Yeh chapter ek repeatable workflow, classic faults ki table, aur module ki troubleshooting lab ka poora walk-through deta hai: uRPF galat jagah par.</p>

<h3>Analogy: doctor ki checklist</h3>
<p>Doctor andaaza nahi lagata. Woh pehle pulse, phir temperature check karta hai, phir poochta hai kahan dard hai. Filters ke vital signs ke equivalent hain: kya attached hai, kaunsi direction, counters hilte hain ya nahi, terms ka order kya hai. Har baar wahi sequence follow karne se aap tez ho jaate ho.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Filter troubleshooting steps">
<rect x="10" y="60" width="115" height="65" rx="8" fill="#e2e8f0"/><text x="67" y="88" text-anchor="middle" class="svg-ink" font-size="12">1. Symptom</text><text x="67" y="106" text-anchor="middle" class="svg-muted" font-size="11">kaun, kya, kahan</text>
<rect x="135" y="60" width="115" height="65" rx="8" fill="#bae6fd"/><text x="192" y="88" text-anchor="middle" class="svg-ink" font-size="12">2. Attached?</text><text x="192" y="106" text-anchor="middle" class="svg-muted" font-size="11">interface, direction</text>
<rect x="260" y="60" width="115" height="65" rx="8" fill="#ddd6fe"/><text x="317" y="88" text-anchor="middle" class="svg-ink" font-size="12">3. Terms</text><text x="317" y="106" text-anchor="middle" class="svg-muted" font-size="11">order, last term</text>
<rect x="385" y="60" width="115" height="65" rx="8" fill="#fde68a"/><text x="442" y="88" text-anchor="middle" class="svg-ink" font-size="12">4. Counters</text><text x="442" y="106" text-anchor="middle" class="svg-muted" font-size="11">show firewall</text>
<rect x="510" y="60" width="115" height="65" rx="8" fill="#bbf7d0"/><text x="567" y="88" text-anchor="middle" class="svg-ink" font-size="12">5. Fix + re-test</text><text x="567" y="106" text-anchor="middle" class="svg-muted" font-size="11">dono sides</text>
<line x1="125" y1="92" x2="135" y2="92" stroke="#64748b" stroke-width="2"/><line x1="250" y1="92" x2="260" y2="92" stroke="#64748b" stroke-width="2"/><line x1="375" y1="92" x2="385" y2="92" stroke="#64748b" stroke-width="2"/><line x1="500" y1="92" x2="510" y2="92" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Counters batate hain ki packets term tak pahunchte bhi hain ya nahi</text>
</svg><p class="cap">Paanch stages, isi order mein, lagbhag har filter fault dhoondh dete hain.</p></div>

<h3>Paanch-step workflow</h3>
<ol>
<li><b>Symptom exactly define karo.</b> Kaunsa source, kaunsa destination, kaunsa protocol, kab se? "Server tak nahi pahunch pa raha" vague hai; "contractor ke change ke baad se PC1 se 172.16.30.10 ka ping fail" useful hai.</li>
<li><b>Kya jahan se packet guzarta hai wahan filter attached hai?</b> <code>show interfaces filters</code>; har hop par input aur output dono check karo, router ko jaane wale traffic ke liye lo0 filter, aur interface par rpf-check.</li>
<li><b>Terms order mein padho.</b> <code>show firewall family inet filter NAME</code>. Kya final accept hai? Kya block accept ke baad rakha hai? Kya count-only term jaldi accept kar raha hai?</li>
<li><b>Counters padho.</b> <code>clear firewall all</code>, test dohrao, <code>show firewall</code>. Badhta counter matlab term match hota hai. Zero counter matlab packet doosre term se jaata hai ya aata hi nahi.</li>
<li><b>Fix karo aur dono sides re-test karo:</b> jo traffic jaana chahiye aur jo block hona chahiye.</li>
</ol>

<h3>Classic faults aur unki pehchan</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Filter lagane ke baad sab traffic drop</td><td>Final accept nahi; implicit discard</td><td>show firewall family inet filter NAME</td></tr>
<tr><td>lo0 filter ke baad routing neighbour gira</td><td>OSPF, BGP ya BFD ka term nahi</td><td>show ospf neighbor, show bgp summary</td></tr>
<tr><td>Block ka asar nahi, counter 0</td><td>Galat direction, galat interface, ya pehle ka accept</td><td>show interfaces filters, term order</td></tr>
<tr><td>Links up hain par kuch replies fail</td><td>Asymmetric paths ke saath strict uRPF</td><td>show interfaces IFACE extensive, RPF Failures</td></tr>
<tr><td>Change ke baad login nahi ho pa raha</td><td>lo0 filter mein management source missing</td><td>console; rollback 1</td></tr>
<tr><td>Commit apne aap rollback ho gaya</td><td>commit confirmed confirm nahi hua</td><td>show system commit</td></tr></table>

<h3>Lab ticket: galat jagah par strict uRPF (fw-urpf)</h3>
<p>Ek contractor ne R1-BRANCH ke dono uplinks par strict uRPF on kiya. Tab se PC1 (10.20.20.10) payroll server SRV (172.16.30.10) tak nahi pahunch pa raha. Saath hi PC2 (10.30.30.77 forged) finance subnet 10.30.30.0/24 spoof kar raha hai.</p>
<p><b>Symptom aur step 2.</b> PC1 ka ping fail. R1 par interfaces aur OSPF up hain. <code>show configuration interfaces</code> ge-0/0/0 aur ge-0/0/2 par <code>rpf-check</code> dikhata hai. Check strict hai.</p>
<p><b>Step 3, failing interface dhoondo.</b></p>
<pre class="out">lab@R1-BRANCH&gt; show route 172.16.30.10
172.16.30.0/24     *[OSPF/10] 00:20:10, metric 2
                    &gt; to 10.0.12.2 via ge-0/0/0.0

lab@R1-BRANCH&gt; show interfaces ge-0/0/2.0 extensive
    <span class="hl">RPF Failures: 14</span></pre>
<p>Bahar ka path ge-0/0/0 hai (R1 cost 1; ge-0/0/2 side par cost 50). Hub ki costs mirrored hain: woh return ke liye ge-0/0/2 prefer karta hai, isliye replies <b>ge-0/0/2</b> par aate hain, jahan R1 ka server ka route point nahi karta. Lab ke sawal ka jawab: <b>ge-0/0/2</b>.</p>
<p><b>Step 5, fix 1: uplinks.</b></p>
<pre class="code">lab@R1-BRANCH# set interfaces ge-0/0/0 unit 0 family inet rpf-check mode loose
lab@R1-BRANCH# set interfaces ge-0/0/2 unit 0 family inet rpf-check mode loose
lab@R1-BRANCH# commit</pre>
<p>PC1 phir 172.16.30.10 ping kar sakta hai. Uplinks se rpf-check hata dena bhi chalta; loose basic bogus-source check bachaye rakhta hai.</p>
<p><b>Fix 2: strict uRPF wahan jahan uska ghar hai, saboot ke saath.</b></p>
<pre class="code">lab@R1-BRANCH# set firewall family inet filter RPF-FAIL term SPOOF then count spoofed
lab@R1-BRANCH# set firewall family inet filter RPF-FAIL term SPOOF then discard
lab@R1-BRANCH# set interfaces ge-0/0/1 unit 0 family inet rpf-check fail-filter RPF-FAIL
lab@R1-BRANCH# commit and-quit</pre>
<p><b>Dono sides re-test karo.</b></p>
<pre class="out">PC1&gt; ping 172.16.30.10 -c 2
84 bytes from 172.16.30.10: icmp_seq=1 ttl=62 time=2.1 ms     <i>legitimate: chalta hai</i>

PC2&gt; ping 172.16.30.10 -c 3
172.16.30.10 icmp_seq=1 timeout                                   <i>forged source: drop</i>

lab@R1-BRANCH&gt; show firewall

Filter: RPF-FAIL
Counters:
Name                                                Bytes              Packets
<span class="hl">spoofed                                              252                    3</span></pre>
<p>Legitimate host chalta hai, forger block hota hai, aur counter mein saboot hai.</p>

<h3>Doosra mini-case: lockout</h3>
<p>Aapne lo0 filter lagaya aur SSH session kho diya. Ghabrao mat. Agar <code>commit confirmed</code> use kiya tha to timer ka wait karo. Warna console ya permitted management host se <code>rollback 1</code> chalao, phir <code>commit</code>. Baad mein SSH term mein missing source jodo aur commit confirmed ke saath dobara apply karo.</p>

<div class="warn"><p><b>Common mistake.</b> Problem ko poora filter delete karke theek karna. Aap protection aur saboot dono kho dete ho. Sirf ek galat term edit karo aur counters bachao.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Har link aur routing protocol up hone ke bawajood pings fail hote hain, aur strict uRPF configured hai" asymmetric routing aur RPF failures ki taraf ishara karta hai. Jawab loose mode ya check hatana hai, routes badalna nahi.</p></div>

<div class="scn"><h4>Monday subah, payroll down</h4><p>Monday ko ek branch ke liye payroll server unreachable ho gaya. Weekend ke change record mein sirf "security hardening" likha tha. Engineer ne paanch steps se shuru kiya: PC1 next hop ko ping kar sakta tha, isliye links theek the. Interface configuration dekhne par dono uplinks par rpf-check mila. Extensive output ne doosre uplink par RPF failures dikhaye. Hub cost settings ki wajah se return ke liye wahi uplink prefer karta tha. Dono uplinks par loose mode se service do minute mein wapas aayi. Phir unhone standard propose kiya: strict uRPF sirf access interfaces par, aur doosri jagah on karne se pehle routing symmetry ka explicit check.</p><p><b>Lesson:</b> "sab up hai" RPF ya filter problem ki pehchan hai, link problem ki nahi.</p></div>

<div class="iv"><p class="q">"Branch se data centre ka ping fail hota hai lekin har link aur OSPF neighbour up hai. Kya check karoge?"</p><p>Strong answer: pehle dono directions ka route. Phir path ke filters, input aur output, router ko jaane wale traffic ke liye lo0 bhi. Phir interfaces par uRPF: asymmetric paths ke saath strict mode replies chupchap drop karta hai; show interfaces extensive RPF failures dikhata hai. Fix: uplinks par loose mode aur strict sirf single-homed edges par. Allowed aur spoofed dono case re-test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: symptom, attached, terms, counters, fix aur dono sides re-test.</li>
<li>Counter zero matlab no match ya galat jagah; badhta matlab term hit ho raha hai.</li>
<li>Links up par replies fail ho to asymmetric routing ke saath strict uRPF ka shak.</li>
<li>Uplinks ko loose mode se fix karo; strict ko fail-filter ke saath single-homed LANs par rakho.</li>
<li>Galat term edit karo, filter delete mat karo; lockout ke baad rollback 1 use karo.</li>
</ul></div>
`}};export{e as default};