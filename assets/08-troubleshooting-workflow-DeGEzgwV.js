var e={id:`workflow-tools`,h:{en:`Troubleshooting workflow, tools and the four labs`,hi:`Troubleshooting workflow, tools aur chaaron labs`},body:{en:`
<p>You now have the pieces: RPF, the mroute table, the layered method and the fault catalogue. This chapter puts them into a routine you can repeat under pressure, introduces the test tools, and walks through the four labs of this module. For the labs we describe the <b>method and the clues</b>, never the full fix: you must find it yourself.</p>

<h3>The routine in seven moves</h3>
<ol>
<li><b>Define the symptom precisely:</b> which receiver, which group, since when, what changed.</li>
<li><b>Prove the source is sending:</b> first-hop router has the (S,G) entry with flag F.</li>
<li><b>Walk the six layers</b> from the receiver (chapter 4).</li>
<li><b>At the first wrong layer, collect one piece of evidence</b> with the command from the catalogue.</li>
<li><b>Make the smallest change</b> that fixes that layer.</li>
<li><b>Re-test every receiver</b>, not only the one you fixed.</li>
<li><b>Write down</b> what was wrong and what you changed.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Troubleshooting loop">
<rect x="10" y="50" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="80" text-anchor="middle" class="svg-ink" font-size="13">Symptom</text>
<rect x="150" y="50" width="110" height="50" rx="8" fill="#bae6fd"/><text x="205" y="80" text-anchor="middle" class="svg-ink" font-size="13">Walk layers</text>
<rect x="290" y="50" width="110" height="50" rx="8" fill="#fde68a"/><text x="345" y="80" text-anchor="middle" class="svg-ink" font-size="13">Evidence</text>
<rect x="430" y="50" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="475" y="80" text-anchor="middle" class="svg-ink" font-size="13">Fix</text>
<rect x="550" y="50" width="80" height="50" rx="8" fill="#fed7aa"/><text x="590" y="80" text-anchor="middle" class="svg-ink" font-size="13">Re-test</text>
<line x1="120" y1="75" x2="150" y2="75" stroke="#64748b" stroke-width="2"/><line x1="260" y1="75" x2="290" y2="75" stroke="#64748b" stroke-width="2"/><line x1="400" y1="75" x2="430" y2="75" stroke="#64748b" stroke-width="2"/><line x1="520" y1="75" x2="550" y2="75" stroke="#64748b" stroke-width="2"/>
<path d="M590 100 L590 130 L205 130 L205 100" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="400" y="145" text-anchor="middle" class="svg-muted" font-size="11">still failing: walk the layers again</text>
</svg><p class="cap">The loop repeats until every receiver is served.</p></div>

<h3>The test tools</h3>
<table class="cmp"><tr><th>Tool</th><th>What it proves</th></tr>
<tr><td>Host shell on the PC: <code>join G</code>, <code>mcast G 10</code>, <code>show mcast</code></td><td>A receiver joined, a source sent ten datagrams, how many arrived. This is the end-to-end proof</td></tr>
<tr><td><code>ip igmp join-group G</code> on a router, then <code>ping G</code></td><td>Tests the tree without an application: every member router replies. On a real router, ping from the source side</td></tr>
<tr><td><code>mtrace</code> (concept)</td><td>On real equipment it walks the reverse path hop by hop from receiver to source and prints where RPF fails. The simulator does not provide it</td></tr>
<tr><td><code>show ip mroute count</code> (concept)</td><td>Real routers print per-group packet counters and drops; the simulator shows the mroute table and the host counters instead</td></tr></table>
<div class="warn"><p><b>Debug cautions.</b> On a real router <code>debug ip mpacket</code> prints every multicast packet and can freeze a router carrying a video stream. Prefer show commands; if you must debug, filter by an ACL and keep the session short.</p></div>

<div class="note"><p><b>Junos note.</b> The same tools on Junos: <code>show multicast route</code> (the forwarding entries, like show ip mroute), <code>show pim join extensive</code> (upstream neighbour, upstream state and downstream interfaces per group), <code>show multicast rpf 192.0.2.10</code> (the RPF interface and route), <code>show pim neighbors</code> and <code>show pim rps</code>. A static RPF override uses the multicast table inet.2:</p>
<pre class="code">set routing-options rib inet.2 static route 203.0.113.0/24 next-hop 10.9.9.2
set routing-options rib-groups MCAST-RPF import-rib inet.2
set protocols pim rib-group inet MCAST-RPF</pre></div>

<h3>Lab 1: mq-mroute-rpf-static (one RPF failure)</h3>
<p>A university lecture hall has a black screen after maintenance. Work the layers: IGMP and the neighbour to R2 are healthy, so go straight to layers 4 and 5. Read the (*,G) on R3, then ask R3 how it reaches the RP. The clue is the note printed by <code>show ip rpf</code>. Two rules from the customer: the backup cable is another team's, so no PIM on it, and its cost stays. Your tool is the one from chapter 2, and both the RP and the source need it.</p>
<h3>Lab 2: mq-mroute-iptv-branch (one branch fails)</h3>
<p>Pune works, Delhi does not. First prove Pune receives the stream, which clears the head end and the RP. Then compare the RPF interface of Delhi toward the RP with the circuits in the diagram: which circuit is labelled unicast only? The repair has the same shape as lab 1 but the evidence is yours to collect.</p>
<h3>Lab 3: mq-mroute-two-faults (two independent faults)</h3>
<p>Two warehouses, two causes. Do not guess which is which. Run the RP mapping on the first router and the RPF check on the second, and compare each with a router that works. Fix one fault, re-test, then the other. A common slip is to fix one and declare victory because one PC now receives the stream.</p>
<h3>Lab 4: mq-mroute-capstone (four cities, three faults)</h3>
<p>Three evidence tasks ask what you found: the interface without PIM in Pune, the RP address in Delhi, the RPF interface in Chennai. The tasks are independent, so you may collect them in any order, but write each answer from the real output, not from memory. Then repair each city with the smallest change, keeping the Internet circuits free of PIM, and prove all three receivers.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Changing several things before testing. (2) Believing a PC that "looks fine" instead of reading the counters. (3) Reaching for debug first. (4) Forgetting to write down the change.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pinging a group address from a PC does not always get a reply: only members answer, and a host may not answer at all. Use <code>show mcast</code> on the receiver for proof.</p></div>

<div class="scn"><h4>The fix that hid a second fault</h4><p>At a logistics company the engineer corrected an RP typo at one warehouse and marked the ticket solved. The second warehouse stayed dark for two more days because its RPF was pointing at a carrier cable. The first fix looked complete because one of the two receivers worked.</p><p><b>Lesson:</b> close a multicast ticket only after every receiver in the ticket has been proved.</p></div>

<div class="iv"><p class="q">"What is your first command when a receiver reports no multicast stream?"</p><p>Say that you first make sure the source is sending (first-hop mroute with flag F), then start from the receiver's last-hop router with the group's mroute entry and its flags, because the incoming interface and the flags tell you which layer to open next. Mention that you do not use debug on a busy router.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Seven moves: symptom, source, layers, evidence, smallest fix, re-test every receiver, record.</li>
<li>The host shell counters are the end-to-end proof of delivery.</li>
<li>Avoid debug on production routers; use show commands and ACL-filtered debugs.</li>
<li>Junos: show multicast route, show pim join extensive, show multicast rpf, inet.2 for static RPF.</li>
<li>Faults come in groups: test every receiver before closing the ticket.</li>
</ul></div>
`,hi:`
<p>Ab aapke paas tukde hain: RPF, mroute table, layered method aur fault catalogue. Yeh chapter inhe ek routine mein jodta hai jo pressure mein bhi dohra sako, test tools batata hai, aur is module ke chaaron labs ka raasta dikhata hai. Labs ke liye hum <b>method aur clues</b> batate hain, poora fix kabhi nahi: use aapko khud dhoondhna hai.</p>

<h3>Saat moves ka routine</h3>
<ol>
<li><b>Symptom saaf likho:</b> kaunsa receiver, kaunsa group, kab se, kya badla.</li>
<li><b>Prove karo source bhej raha hai:</b> first-hop router par flag F wali (S,G) entry.</li>
<li><b>Chhe layers chalo</b> receiver se (chapter 4).</li>
<li><b>Pehli galat layer par ek evidence lo</b> catalogue ke command se.</li>
<li><b>Sabse chhota change karo</b> jo us layer ko theek kare.</li>
<li><b>Har receiver dobara test karo</b>, sirf jo theek kiya woh nahi.</li>
<li><b>Likh lo</b> kya galat tha aur aapne kya badla.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Troubleshooting loop">
<rect x="10" y="50" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="80" text-anchor="middle" class="svg-ink" font-size="13">Symptom</text>
<rect x="150" y="50" width="110" height="50" rx="8" fill="#bae6fd"/><text x="205" y="80" text-anchor="middle" class="svg-ink" font-size="13">Layers chalo</text>
<rect x="290" y="50" width="110" height="50" rx="8" fill="#fde68a"/><text x="345" y="80" text-anchor="middle" class="svg-ink" font-size="13">Evidence</text>
<rect x="430" y="50" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="475" y="80" text-anchor="middle" class="svg-ink" font-size="13">Fix</text>
<rect x="550" y="50" width="80" height="50" rx="8" fill="#fed7aa"/><text x="590" y="80" text-anchor="middle" class="svg-ink" font-size="13">Re-test</text>
<line x1="120" y1="75" x2="150" y2="75" stroke="#64748b" stroke-width="2"/><line x1="260" y1="75" x2="290" y2="75" stroke="#64748b" stroke-width="2"/><line x1="400" y1="75" x2="430" y2="75" stroke="#64748b" stroke-width="2"/><line x1="520" y1="75" x2="550" y2="75" stroke="#64748b" stroke-width="2"/>
<path d="M590 100 L590 130 L205 130 L205 100" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="400" y="145" text-anchor="middle" class="svg-muted" font-size="11">abhi bhi fail: layers dobara chalo</text>
</svg><p class="cap">Loop tab tak chalta hai jab tak har receiver serve na ho jaye.</p></div>

<h3>Test tools</h3>
<table class="cmp"><tr><th>Tool</th><th>Kya prove karta hai</th></tr>
<tr><td>PC par host shell: <code>join G</code>, <code>mcast G 10</code>, <code>show mcast</code></td><td>Receiver ne join kiya, source ne das datagrams bheje, kitne pahunche. Yeh end-to-end proof hai</td></tr>
<tr><td>Router par <code>ip igmp join-group G</code>, phir <code>ping G</code></td><td>Application ke bina tree test: har member router jawab deta hai. Asli router par source side se ping karo</td></tr>
<tr><td><code>mtrace</code> (concept)</td><td>Asli equipment par yeh receiver se source tak reverse path hop by hop chalta hai aur print karta hai RPF kahan fail hua. Simulator mein nahi hai</td></tr>
<tr><td><code>show ip mroute count</code> (concept)</td><td>Asli routers per-group packet counters aur drops print karte hain; simulator uski jagah mroute table aur host counters dikhata hai</td></tr></table>
<div class="warn"><p><b>Debug ki savdhaani.</b> Asli router par <code>debug ip mpacket</code> har multicast packet print karta hai aur video stream wale router ko freeze kar sakta hai. Show commands ko prefer karo; debug zaroori ho to ACL se filter karo aur session chhota rakho.</p></div>

<div class="note"><p><b>Junos note.</b> Junos par wahi tools: <code>show multicast route</code> (forwarding entries, show ip mroute jaisa), <code>show pim join extensive</code> (har group ka upstream neighbour, upstream state aur downstream interfaces), <code>show multicast rpf 192.0.2.10</code> (RPF interface aur route), <code>show pim neighbors</code> aur <code>show pim rps</code>. Static RPF override multicast table inet.2 use karta hai:</p>
<pre class="code">set routing-options rib inet.2 static route 203.0.113.0/24 next-hop 10.9.9.2
set routing-options rib-groups MCAST-RPF import-rib inet.2
set protocols pim rib-group inet MCAST-RPF</pre></div>

<h3>Lab 1: mq-mroute-rpf-static (ek RPF failure)</h3>
<p>Ek university lecture hall maintenance ke baad black screen dikha raha hai. Layers chalo: IGMP aur R2 ka neighbour theek hain, to seedha layers 4 aur 5 par jao. R3 par (*,G) padho, phir R3 se poochho woh RP tak kaise pahunchta hai. Clue <code>show ip rpf</code> ka note hai. Customer ke do niyam: backup cable doosri team ka hai, to us par PIM nahi aur uski cost wahi rahegi. Aapka tool chapter 2 wala hai, aur RP aur source dono ko iski zaroorat hai.</p>
<h3>Lab 2: mq-mroute-iptv-branch (ek branch fail)</h3>
<p>Pune chalta hai, Delhi nahi. Pehle prove karo Pune ko stream mil rahi hai, jisse head end aur RP clear ho jaate hain. Phir Delhi ka RP ki taraf RPF interface diagram ke circuits se compare karo: kaunsa circuit unicast only labelled hai? Repair ka shape lab 1 jaisa hai par evidence aapko khud ikattha karna hai.</p>
<h3>Lab 3: mq-mroute-two-faults (do independent faults)</h3>
<p>Do warehouses, do karan. Andaza mat lagao ki kaunsa kaunsa hai. Pehle router par RP mapping aur doosre par RPF check chalao, aur har ek ko kaam karte router se compare karo. Ek fault theek karo, re-test karo, phir doosra. Aam chook hai ek theek karke jeet maan lena kyunki ab ek PC ko stream mil rahi hai.</p>
<h3>Lab 4: mq-mroute-capstone (chaar cities, teen faults)</h3>
<p>Teen evidence tasks poochte hain aapne kya paya: Pune mein PIM-rahit interface, Delhi mein RP address, Chennai mein RPF interface. Tasks independent hain, to kisi bhi kram mein ikattha kar sakte ho, par har jawab asli output se likho, yaad se nahi. Phir har city ko sabse chhote change se theek karo, Internet circuits ko PIM se door rakhte hue, aur teeno receivers prove karo.</p>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Test se pehle kai cheezein badalna. (2) Counters padhne ki jagah us PC par bharosa karna jo "theek dikhta hai". (3) Pehle debug uthana. (4) Change likhna bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> PC se group address ping karne par hamesha reply nahi milta: sirf members jawab dete hain, aur host shayad bilkul jawab na de. Proof ke liye receiver par <code>show mcast</code> use karo.</p></div>

<div class="scn"><h4>Woh fix jisne doosra fault chhupa diya</h4><p>Ek logistics company mein engineer ne ek warehouse ka RP typo theek kiya aur ticket solved mark kar diya. Doosra warehouse do din aur andhera raha kyunki uska RPF carrier cable ki taraf point kar raha tha. Pehla fix poora lagta tha kyunki do mein se ek receiver chalne laga.</p><p><b>Lesson:</b> multicast ticket tabhi band karo jab ticket ka har receiver prove ho chuka ho.</p></div>

<div class="iv"><p class="q">"Jab receiver kehta hai multicast stream nahi, aapka pehla command kya hota hai?"</p><p>Kaho ki pehle pakka karte ho source bhej raha hai (first-hop mroute mein flag F), phir receiver ke last-hop router se group ki mroute entry aur uske flags dekhte ho, kyunki incoming interface aur flags batate hain agli layer kaunsi kholni hai. Yeh bhi kaho ki busy router par debug use nahi karte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Saat moves: symptom, source, layers, evidence, sabse chhota fix, har receiver re-test, record.</li>
<li>Host shell counters delivery ka end-to-end proof hain.</li>
<li>Production routers par debug se bacho; show commands aur ACL-filtered debugs use karo.</li>
<li>Junos: show multicast route, show pim join extensive, show multicast rpf, static RPF ke liye inet.2.</li>
<li>Faults jhund mein aate hain: ticket band karne se pehle har receiver test karo.</li>
</ul></div>
`}};export{e as default};