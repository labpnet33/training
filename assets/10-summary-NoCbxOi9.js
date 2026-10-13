var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now build, apply, verify and troubleshoot Junos stateless firewall filters and uRPF. This last chapter is your revision sheet for JNCIA-Junos (JN0-106): a map, a can-do checklist, a glossary, the most tested facts and a command cheat-sheet.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module summary map">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Stateless firewall filter</text>
<rect x="10" y="90" width="140" height="55" rx="8" fill="#bae6fd"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="12">Terms</text><text x="80" y="130" text-anchor="middle" class="svg-muted" font-size="11">from / then, order</text>
<rect x="170" y="90" width="140" height="55" rx="8" fill="#ddd6fe"/><text x="240" y="112" text-anchor="middle" class="svg-ink" font-size="12">Actions</text><text x="240" y="130" text-anchor="middle" class="svg-muted" font-size="11">accept discard reject</text>
<rect x="330" y="90" width="140" height="55" rx="8" fill="#fde68a"/><text x="400" y="112" text-anchor="middle" class="svg-ink" font-size="12">Apply</text><text x="400" y="130" text-anchor="middle" class="svg-muted" font-size="11">input, output, lo0</text>
<rect x="490" y="90" width="140" height="55" rx="8" fill="#fed7aa"/><text x="560" y="112" text-anchor="middle" class="svg-ink" font-size="12">uRPF</text><text x="560" y="130" text-anchor="middle" class="svg-muted" font-size="11">strict, loose, fail-filter</text>
<rect x="170" y="175" width="300" height="42" rx="8" fill="#e2e8f0"/><text x="320" y="201" text-anchor="middle" class="svg-ink" font-size="12">Prove: show firewall, counters, tests both ways</text>
<line x1="320" y1="50" x2="80" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="50" x2="240" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="50" x2="400" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="50" x2="560" y2="90" stroke="#64748b" stroke-width="1.5"/>
<line x1="240" y1="145" x2="280" y2="175" stroke="#64748b" stroke-width="1.5"/><line x1="400" y1="145" x2="360" y2="175" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Write terms, choose actions, apply in the right place, prove with counters.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain what stateless means and how filters differ from routing policy.</li>
<li>Write a filter with several terms and predict the result for any packet.</li>
<li>State the effect of the implicit discard and end filters with an explicit last term.</li>
<li>Combine from conditions correctly (AND across types, OR within a list).</li>
<li>Use accept, discard, reject, count, log and next term; know that a modifier-only term accepts.</li>
<li>Attach filters as input or output on an interface unit, and as input on lo0.0.</li>
<li>Build a PROTECT-RE filter that allows SSH from management, ICMP and OSPF, and apply it with commit confirmed.</li>
<li>Block one host while allowing the rest, with counters, and switch to reject plus log.</li>
<li>Explain strict and loose uRPF, fail-filters, and why strict breaks asymmetric routing.</li>
<li>Troubleshoot using the five-step workflow and read counters and logs.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Firewall filter</dt><dd>Stateless, ordered list of terms matching packet headers.</dd>
<dt>Implicit discard</dt><dd>Hidden last rule: a packet matching no term is dropped.</dd>
<dt>Terminating action</dt><dd>accept, discard or reject; ends evaluation.</dd>
<dt>Modifier</dt><dd>count, log or syslog; a term with only modifiers accepts.</dd>
<dt>lo0 filter</dt><dd>Input filter on the loopback; protects the Routing Engine on all addresses.</dd>
<dt>commit confirmed</dt><dd>Commit with an automatic rollback timer unless a second commit confirms.</dd>
<dt>uRPF</dt><dd>Check of the packet source against the routing table.</dd>
<dt>Fail-filter</dt><dd>Filter applied to packets that failed the RPF check.</dd>
<dt>Asymmetric routing</dt><dd>Forward and return traffic take different paths.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Packet that matches no term</td><td>Silently discarded</td></tr>
<tr><td>Different conditions in a term</td><td>AND</td></tr>
<tr><td>Several values of one condition</td><td>OR</td></tr>
<tr><td>Term with only count</td><td>Packet is accepted</td></tr>
<tr><td>discard versus reject</td><td>Silent versus ICMP unreachable returned</td></tr>
<tr><td>Filter to protect the RE</td><td>Input filter on lo0.0</td></tr>
<tr><td>lo0 filter sees</td><td>Only traffic to the router, any address</td></tr>
<tr><td>Safe way to apply risky filter</td><td>commit confirmed</td></tr>
<tr><td>Default uRPF mode</td><td>Strict</td></tr>
<tr><td>Strict uRPF problem</td><td>Asymmetric routing and multihoming</td></tr>
<tr><td>OSPF in a filter</td><td>protocol ospf (not TCP or UDP)</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">set firewall family inet filter NAME term T from source-address 10.0.0.0/24
set firewall family inet filter NAME term T from protocol tcp
set firewall family inet filter NAME term T from destination-port ssh
set firewall family inet filter NAME term T then count C
set firewall family inet filter NAME term T then discard
insert term A before term B
set interfaces ge-0/0/1 unit 0 family inet filter input NAME
set interfaces lo0 unit 0 family inet filter input NAME
set interfaces ge-0/0/1 unit 0 family inet rpf-check [ mode loose ] [ fail-filter F ]
commit confirmed 5
show interfaces filters
show firewall
show firewall filter NAME
show firewall log
clear firewall all</pre>

<div class="warn"><p><b>Final reminder.</b> Before you leave any filter change: does it end with an explicit last term, is it attached in the right direction, did you test both an allowed and a blocked source, and did you check routing neighbours?</p></div>
<div class="exam"><p><b>Exam trap.</b> Do not mix filter and policy vocabulary. Filters have terms with from and then, count and discard, and attach to interfaces. Policies have route-filters, metric and tag, and attach to protocols.</p></div>

<div class="scn"><h4>The checklist that ended lock-outs</h4><p>An operations team that had two lock-outs in a quarter wrote a six-line filter checklist: explicit last term, correct direction, routing protocols accepted, commit confirmed, test allowed and denied sources, read counters. They printed it next to the change calendar. The next four quarters had no filter-related outages, and a junior engineer reported that the checklist helped him catch a missing OSPF term himself before commit.</p><p><b>Lesson:</b> a short checklist beats long documentation.</p></div>

<div class="iv"><p class="q">"Describe how you would protect a Junos router's control plane end to end."</p><p>Strong answer: a lo0 input filter with ordered terms: management SSH and SNMP from known subnets, ICMP, routing protocols, final count and discard; apply with commit confirmed; verify neighbours; test allowed and denied sources; monitor counters. Add uRPF on single-homed edges and consider rate-limiting. Mention that SSH stays enabled but only reachable from approved sources.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Filters are stateless term lists attached to interface units; the first match decides.</li>
<li>Implicit discard is the top cause of outages; end with an explicit last term.</li>
<li>lo0.0 protects the RE; use commit confirmed and allow routing protocols.</li>
<li>count gives numbers; discard is silent, reject answers with ICMP.</li>
<li>Strict uRPF only on single-homed edges; loose on asymmetric uplinks.</li>
</ul></div>
`,hi:`
<p>Ab aap Junos stateless firewall filters aur uRPF banana, apply karna, verify karna aur troubleshoot karna jaante ho. Yeh aakhri chapter JNCIA-Junos (JN0-106) ke liye aapki revision sheet hai: ek map, can-do checklist, glossary, sabse zyada poochhe jaane wale facts aur command cheat-sheet.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module summary map">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Stateless firewall filter</text>
<rect x="10" y="90" width="140" height="55" rx="8" fill="#bae6fd"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="12">Terms</text><text x="80" y="130" text-anchor="middle" class="svg-muted" font-size="11">from / then, order</text>
<rect x="170" y="90" width="140" height="55" rx="8" fill="#ddd6fe"/><text x="240" y="112" text-anchor="middle" class="svg-ink" font-size="12">Actions</text><text x="240" y="130" text-anchor="middle" class="svg-muted" font-size="11">accept discard reject</text>
<rect x="330" y="90" width="140" height="55" rx="8" fill="#fde68a"/><text x="400" y="112" text-anchor="middle" class="svg-ink" font-size="12">Apply</text><text x="400" y="130" text-anchor="middle" class="svg-muted" font-size="11">input, output, lo0</text>
<rect x="490" y="90" width="140" height="55" rx="8" fill="#fed7aa"/><text x="560" y="112" text-anchor="middle" class="svg-ink" font-size="12">uRPF</text><text x="560" y="130" text-anchor="middle" class="svg-muted" font-size="11">strict, loose, fail-filter</text>
<rect x="170" y="175" width="300" height="42" rx="8" fill="#e2e8f0"/><text x="320" y="201" text-anchor="middle" class="svg-ink" font-size="12">Prove: show firewall, counters, dono taraf test</text>
<line x1="320" y1="50" x2="80" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="50" x2="240" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="50" x2="400" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="50" x2="560" y2="90" stroke="#64748b" stroke-width="1.5"/>
<line x1="240" y1="145" x2="280" y2="175" stroke="#64748b" stroke-width="1.5"/><line x1="400" y1="145" x2="360" y2="175" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Terms likho, actions chuno, sahi jagah apply karo, counters se prove karo.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao stateless ka matlab kya hai aur filters routing policy se kaise alag hain.</li>
<li>Kai terms wala filter likho aur kisi bhi packet ka result predict karo.</li>
<li>Implicit discard ka asar batao aur filters ko explicit last term se khatam karo.</li>
<li>from conditions sahi combine karo (types ke beech AND, list ke andar OR).</li>
<li>accept, discard, reject, count, log aur next term use karo; jaano ki modifier-only term accept karta hai.</li>
<li>Filters ko interface unit par input ya output, aur lo0.0 par input ke roop mein attach karo.</li>
<li>PROTECT-RE filter banao jo management se SSH, ICMP aur OSPF allow kare, aur commit confirmed se apply karo.</li>
<li>Ek host block karo aur baaki ko chalne do, counters ke saath, aur reject plus log par switch karo.</li>
<li>Strict aur loose uRPF, fail-filters, aur strict asymmetric routing kyun todta hai, samjhao.</li>
<li>Paanch-step workflow se troubleshoot karo aur counters aur logs padho.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Firewall filter</dt><dd>Packet headers match karne wali stateless, ordered terms ki list.</dd>
<dt>Implicit discard</dt><dd>Chhupa hua last rule: jo packet kisi term se match na kare woh drop hota hai.</dd>
<dt>Terminating action</dt><dd>accept, discard ya reject; evaluation khatam karta hai.</dd>
<dt>Modifier</dt><dd>count, log ya syslog; sirf modifiers wala term accept karta hai.</dd>
<dt>lo0 filter</dt><dd>Loopback par input filter; sabhi addresses par Routing Engine ko bachata hai.</dd>
<dt>commit confirmed</dt><dd>Automatic rollback timer wala commit jab tak doosra commit confirm na kare.</dd>
<dt>uRPF</dt><dd>Packet ke source ko routing table se check karna.</dd>
<dt>Fail-filter</dt><dd>RPF check fail hue packets par lagne wala filter.</dd>
<dt>Asymmetric routing</dt><dd>Forward aur return traffic alag paths lete hain.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>Jo packet kisi term se match na kare</td><td>Chupchap discard</td></tr>
<tr><td>Term ki alag conditions</td><td>AND</td></tr>
<tr><td>Ek condition ki kai values</td><td>OR</td></tr>
<tr><td>Sirf count wala term</td><td>Packet accept hota hai</td></tr>
<tr><td>discard versus reject</td><td>Silent versus ICMP unreachable wapas</td></tr>
<tr><td>RE bachane wala filter</td><td>lo0.0 par input filter</td></tr>
<tr><td>lo0 filter kya dekhta hai</td><td>Sirf router ko jaane wala traffic, kisi bhi address par</td></tr>
<tr><td>Risky filter safely apply karna</td><td>commit confirmed</td></tr>
<tr><td>Default uRPF mode</td><td>Strict</td></tr>
<tr><td>Strict uRPF ki problem</td><td>Asymmetric routing aur multihoming</td></tr>
<tr><td>Filter mein OSPF</td><td>protocol ospf (TCP ya UDP nahi)</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">set firewall family inet filter NAME term T from source-address 10.0.0.0/24
set firewall family inet filter NAME term T from protocol tcp
set firewall family inet filter NAME term T from destination-port ssh
set firewall family inet filter NAME term T then count C
set firewall family inet filter NAME term T then discard
insert term A before term B
set interfaces ge-0/0/1 unit 0 family inet filter input NAME
set interfaces lo0 unit 0 family inet filter input NAME
set interfaces ge-0/0/1 unit 0 family inet rpf-check [ mode loose ] [ fail-filter F ]
commit confirmed 5
show interfaces filters
show firewall
show firewall filter NAME
show firewall log
clear firewall all</pre>

<div class="warn"><p><b>Aakhri reminder.</b> Kisi bhi filter change se pehle: kya woh explicit last term se khatam hota hai, kya sahi direction mein attached hai, kya allowed aur blocked dono source test kiye, aur kya routing neighbours check kiye?</p></div>
<div class="exam"><p><b>Exam trap.</b> Filter aur policy ki vocabulary mix mat karo. Filters mein from aur then wale terms, count aur discard hote hain, aur woh interfaces par attach hote hain. Policies mein route-filters, metric aur tag hote hain, aur woh protocols par attach hoti hain.</p></div>

<div class="scn"><h4>Woh checklist jisne lock-outs khatam kiye</h4><p>Ek operations team ke ek quarter mein do lock-outs hue the. Unhone chhe-line ki filter checklist likhi: explicit last term, sahi direction, routing protocols accepted, commit confirmed, allowed aur denied sources test, counters padho. Use change calendar ke paas print kiya. Agle chaar quarters mein koi filter-related outage nahi hua, aur ek junior engineer ne bataya ki checklist ne commit se pehle khud missing OSPF term pakadne mein madad ki.</p><p><b>Lesson:</b> chhoti checklist lambi documentation se behtar hai.</p></div>

<div class="iv"><p class="q">"Junos router ke control plane ko end to end kaise bachaoge?"</p><p>Strong answer: lo0 input filter jiske ordered terms hon: known subnets se management SSH aur SNMP, ICMP, routing protocols, aakhir mein count aur discard; commit confirmed se apply karo; neighbours verify karo; allowed aur denied sources test karo; counters monitor karo. Single-homed edges par uRPF jodo aur rate-limiting ka vichar karo. Bolo ki SSH enabled rehta hai lekin sirf approved sources se reachable.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Filters interface units par lagi stateless term lists hain; pehla match decide karta hai.</li>
<li>Implicit discard outage ka sabse bada kaaran hai; explicit last term par khatam karo.</li>
<li>lo0.0 RE ko bachata hai; commit confirmed use karo aur routing protocols allow karo.</li>
<li>count numbers deta hai; discard silent hai, reject ICMP se jawab deta hai.</li>
<li>Strict uRPF sirf single-homed edges par; asymmetric uplinks par loose.</li>
</ul></div>
`}};export{e as default};