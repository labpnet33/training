var e={id:`exam-strategy`,h:{en:`Exam strategy for troubleshooting simlets and tickets`,hi:`Troubleshooting simlets aur tickets ke liye exam strategy`},body:{en:`
<p>An emergency-room doctor does not start with a full body scan. She reads the ambulance note, checks the vital signs, and treats the one thing that will kill the patient first, without causing new damage along the way. Troubleshooting items in ENARSI reward the same discipline: read the ticket carefully, isolate the fault quickly with a fixed routine, fix only what is broken, and leave everything else exactly as you found it.</p>

<h3>The item types you will meet</h3>
<dl class="terms">
<dt>Multiple choice</dt><dd>One or more correct answers, often built around a piece of <code>show</code> or <code>debug</code> output. Read the question stem before the output so you know what to look for.</dd>
<dt>Drag and drop</dt><dd>Order process steps, match commands to their function, or match symptoms to causes.</dd>
<dt>Simlet</dt><dd>A topology where you can run show commands (not change configuration) and answer several multiple-choice questions about it.</dd>
<dt>Testlet</dt><dd>A scenario description followed by several questions about the same scenario.</dd>
<dt>Simulation</dt><dd>A lab-style task where you configure or fix devices to meet stated requirements.</dd>
</dl>
<p>You cannot return to an earlier item, so make each decision before you move on.</p>

<h3>Reading the ticket</h3>
<p>Most mistakes in troubleshooting items are reading mistakes. Before you type anything, extract four things from the ticket:</p>
<ol>
<li><b>The symptom and scope</b>: which source, which destination, which traffic type. Write down the exact addresses.</li>
<li><b>The expected result</b>: what must work when you are finished, which becomes your verification test.</li>
<li><b>The constraints</b>: "do not use static routes", "do not modify R2", "use a route map", "do not change the OSPF area design". Violating a constraint can make a technically working fix wrong.</li>
<li><b>The hints</b>: words like "after a recent change", "intermittently", "only from branch 2" narrow the search at once.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Ticket to fix funnel">
<polygon points="40,20 600,20 520,70 120,70" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Read: symptom, scope, expected result, constraints</text>
<polygon points="120,78 520,78 460,128 180,128" fill="#fde68a"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="13">Draw the path, pick the checklist</text>
<polygon points="180,136 460,136 410,186 230,186" fill="#fed7aa"/><text x="320" y="166" text-anchor="middle" class="svg-ink" font-size="13">Isolate the device and cause</text>
<rect x="250" y="194" width="140" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="214" text-anchor="middle" class="svg-ink" font-size="13">Minimal fix + verify</text>
</svg><p class="cap">From a wide ticket to one precise, minimal fix.</p></div>

<h3>Isolating fast</h3>
<p>Draw the path on your scratch board: source, each router, destination. Then apply the checklists from chapters 4 and 5 in a fixed order, starting at the router nearest the source:</p>
<ul>
<li><code>show ip route &lt;destination&gt;</code> on each hop until the route is missing or wrong. That router, or its upstream neighbour, is your fault domain.</li>
<li>In the fault domain: neighbours, then what is advertised and received, then filters, AD and redistribution.</li>
<li>If routing is correct end to end: ACLs, NAT, PBR on the path, and the return path.</li>
</ul>
<p>Do not read full running configurations first. They are long, and the fault usually hides in one line that a targeted command reveals faster, for example <code>show ip protocols</code> showing a distribute list, or <code>show ip ospf interface brief</code> showing an interface missing.</p>

<h3>The ENARSI fault library</h3>
<p>Exam faults come from a fairly small family. Train your eyes to spot them:</p>
<table class="cmp"><tr><th>Area</th><th>Typical injected faults</th></tr>
<tr><td>Neighbours</td><td>Passive interface, wrong area or AS, authentication key mismatch, timer mismatch, MTU mismatch, wrong BGP <code>remote-as</code> or <code>update-source</code>, missing <code>ebgp-multihop</code></td></tr>
<tr><td>Routes</td><td>Missing seed metric, distribute list or route-map deny, stub or area type hiding routes, missing <code>next-hop-self</code>, changed AD, wrong summary</td></tr>
<tr><td>Data plane</td><td>ACL in the wrong direction or missing permit, PBR with wrong next hop, uRPF strict on an asymmetric path, CoPP dropping a protocol</td></tr>
<tr><td>VPN</td><td>Wrong tunnel source or destination, NHRP network ID or mapping mismatch, IPsec profile mismatch, MTU on tunnels</td></tr>
<tr><td>Services</td><td>Missing <code>ip helper-address</code>, SNMP community or ACL, syslog level too low, IP SLA not scheduled, track object wrong</td></tr>
</table>

<h3>Not breaking other things</h3>
<ul>
<li>Make the <b>smallest</b> change that fixes the cause. Removing an ACL completely "fixes" reachability but breaks the security requirement.</li>
<li>Respect every constraint in the ticket; if it says "use a route map", a distribute list with a prefix list is wrong.</li>
<li>After the fix, verify the ticket's expected result <b>and</b> re-check anything that worked before (other neighbours, other routes).</li>
<li>Save the configuration if the task asks you to (<code>copy running-config startup-config</code>).</li>
</ul>

<div class="eg"><p><b>Worked example: a time budget.</b> Assume 60 items in 90 minutes, with two simlets and one simulation. Budget 10 minutes for each simlet and 12 for the simulation: 32 minutes. That leaves 58 minutes for 57 other items, just over a minute each. If you notice after 45 minutes that you are on item 25, you are behind: answer the next few multiple-choice items quickly to recover. Check the clock at roughly every 15 items.</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing the first thing that looks odd and moving on. A simulation often contains two or three faults on the same path; after each fix, run the end-to-end test again. The next fault only becomes visible once the first is gone.</p></div>

<div class="exam"><p><b>Exam trap.</b> In simlets, the question often asks <b>why</b> something happens, not how to fix it. Answers that describe a correct fix for a different problem are common distractors. Match the answer to the evidence you actually saw in the output.</p></div>

<div class="scn"><h4>The fix that broke the security requirement</h4><p>In a practice lab the ticket said: "Branch users must reach the web server on TCP 443. The server must remain protected: only ICMP, SSH and HTTPS allowed." A student found the outbound ACL on R3 denying TCP 443 and simply removed the <code>ip access-group</code> command. Reachability worked, but the grader failed the task, because all traffic to the server was now permitted. The correct fix was one line in the ACL: <code>25 permit tcp any host 10.3.30.10 eq 443</code>, placed before the deny.</p><p><b>Lesson:</b> a fix must satisfy the whole ticket, including the parts that were already working.</p></div>

<div class="iv"><p class="q">"You are given a ticket in a live environment. What do you do in the first five minutes?"</p><p>Read and restate the problem with exact addresses and expected result, confirm scope and recent changes, note constraints and change windows, draw the path, and run read-only checks from the source hop outward (<code>show ip route</code>, neighbours, <code>show ip protocols</code>). Say you do not change anything until you have a hypothesis backed by evidence, and that you plan verification and rollback before the fix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know the item types: multiple choice, drag and drop, simlets, testlets and simulations; there is no going back.</li>
<li>Extract symptom, scope, expected result, constraints and hints before touching the CLI.</li>
<li>Isolate with <code>show ip route</code> hop by hop, then the protocol and forwarding checklists.</li>
<li>Learn the common fault library; exam faults repeat in patterns.</li>
<li>Smallest fix, respect constraints, re-test end to end, look for a second fault, save if asked.</li>
</ul></div>
`,hi:`
<p>Emergency-room doctor full body scan se shuru nahi karti. Woh ambulance note padhti hai, vital signs check karti hai, aur us ek cheez ka ilaaj karti hai jo patient ko sabse pehle maar degi, raaste mein naya nuksaan kiye bina. ENARSI ke troubleshooting items yahi discipline reward karte hain: ticket dhyan se padho, fixed routine se fault jaldi isolate karo, sirf jo toota hai use theek karo, aur baaki sab bilkul waisa hi chhodo jaisa mila tha.</p>

<h3>Item types jo aapko milenge</h3>
<dl class="terms">
<dt>Multiple choice</dt><dd>Ek ya zyada sahi answers, aksar <code>show</code> ya <code>debug</code> output ke tukde par bane. Output se pehle question stem padho taaki pata ho kya dhoondhna hai.</dd>
<dt>Drag and drop</dt><dd>Process steps ko order karo, commands ko unke function se match karo, ya symptoms ko causes se match karo.</dd>
<dt>Simlet</dt><dd>Ek topology jahan aap show commands chala sakte ho (configuration badal nahi sakte) aur uske baare mein kai multiple-choice sawaalon ke jawab dete ho.</dd>
<dt>Testlet</dt><dd>Ek scenario description jiske baad usi scenario par kai sawaal.</dd>
<dt>Simulation</dt><dd>Lab-style task jahan aap stated requirements poori karne ke liye devices configure ya fix karte ho.</dd>
</dl>
<p>Aap pichhle item par wapas nahi jaa sakte, isliye aage badhne se pehle har decision le lo.</p>

<h3>Ticket padhna</h3>
<p>Troubleshooting items ki zyada tar galtiyan padhne ki galtiyan hoti hain. Kuch bhi type karne se pehle ticket se chaar cheezein nikaalo:</p>
<ol>
<li><b>Symptom aur scope</b>: kaunsa source, kaunsa destination, kaunsa traffic type. Exact addresses likh lo.</li>
<li><b>Expected result</b>: khatam hone par kya chalna chahiye, jo aapka verification test ban jaata hai.</li>
<li><b>Constraints</b>: "static routes use mat karo", "R2 modify mat karo", "route map use karo", "OSPF area design mat badlo". Constraint todna technically working fix ko bhi galat bana sakta hai.</li>
<li><b>Hints</b>: "haal ke change ke baad", "beech beech mein", "sirf branch 2 se" jaise shabd search ko turant chhota kar dete hain.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Ticket to fix funnel">
<polygon points="40,20 600,20 520,70 120,70" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Padho: symptom, scope, expected result, constraints</text>
<polygon points="120,78 520,78 460,128 180,128" fill="#fde68a"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="13">Path draw karo, checklist chuno</text>
<polygon points="180,136 460,136 410,186 230,186" fill="#fed7aa"/><text x="320" y="166" text-anchor="middle" class="svg-ink" font-size="13">Device aur cause isolate karo</text>
<rect x="250" y="194" width="140" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="214" text-anchor="middle" class="svg-ink" font-size="13">Minimal fix + verify</text>
</svg><p class="cap">Chaude ticket se ek precise, minimal fix tak.</p></div>

<h3>Jaldi isolate karna</h3>
<p>Apne scratch board par path draw karo: source, har router, destination. Phir chapters 4 aur 5 ki checklists fixed order mein lagao, source ke sabse paas wale router se shuru karke:</p>
<ul>
<li>Har hop par <code>show ip route &lt;destination&gt;</code> jab tak route missing ya galat na mile. Woh router, ya uska upstream neighbour, aapka fault domain hai.</li>
<li>Fault domain mein: neighbours, phir kya advertise aur receive hua, phir filters, AD aur redistribution.</li>
<li>Agar routing end to end sahi hai: path par ACLs, NAT, PBR, aur return path.</li>
</ul>
<p>Pehle poori running configurations mat padho. Woh lambi hoti hain, aur fault aam taur par ek line mein chhupa hota hai jo targeted command jaldi dikha deta hai, jaise distribute list dikhata <code>show ip protocols</code>, ya missing interface dikhata <code>show ip ospf interface brief</code>.</p>

<h3>ENARSI fault library</h3>
<p>Exam faults ek kaafi chhote parivaar se aate hain. Apni aankhon ko unhe pakadne ki training do:</p>
<table class="cmp"><tr><th>Area</th><th>Typical injected faults</th></tr>
<tr><td>Neighbours</td><td>Passive interface, galat area ya AS, authentication key mismatch, timer mismatch, MTU mismatch, galat BGP <code>remote-as</code> ya <code>update-source</code>, missing <code>ebgp-multihop</code></td></tr>
<tr><td>Routes</td><td>Missing seed metric, distribute list ya route-map deny, routes chhupata stub ya area type, missing <code>next-hop-self</code>, badla hua AD, galat summary</td></tr>
<tr><td>Data plane</td><td>Galat direction mein ya missing permit wala ACL, galat next hop wala PBR, asymmetric path par uRPF strict, protocol drop karta CoPP</td></tr>
<tr><td>VPN</td><td>Galat tunnel source ya destination, NHRP network ID ya mapping mismatch, IPsec profile mismatch, tunnels par MTU</td></tr>
<tr><td>Services</td><td>Missing <code>ip helper-address</code>, SNMP community ya ACL, bahut kam syslog level, IP SLA scheduled nahi, galat track object</td></tr>
</table>

<h3>Doosri cheezein na todna</h3>
<ul>
<li>Cause theek karne wala <b>sabse chhota</b> change karo. ACL poora hata dena reachability "theek" kar deta hai par security requirement tod deta hai.</li>
<li>Ticket ke har constraint ka samman karo; agar woh kehta hai "route map use karo", to prefix list wali distribute list galat hai.</li>
<li>Fix ke baad ticket ka expected result verify karo <b>aur</b> jo pehle chal raha tha use dobara check karo (doosre neighbours, doosre routes).</li>
<li>Agar task kahe to configuration save karo (<code>copy running-config startup-config</code>).</li>
</ul>

<div class="eg"><p><b>Worked example: time budget.</b> Maan lo 90 minute mein 60 items, do simlets aur ek simulation ke saath. Har simlet ke liye 10 minute aur simulation ke liye 12 budget karo: 32 minute. 57 baaki items ke liye 58 minute bachte hain, har ek ke liye ek minute se thoda zyada. Agar 45 minute baad aap dekhte ho ki aap item 25 par ho, to aap peeche ho: recover karne ke liye agle kuch multiple-choice items jaldi karo. Lagbhag har 15 items par ghadi dekho.</p></div>

<div class="warn"><p><b>Common galti.</b> Jo pehli ajeeb cheez dikhe use theek karke aage badh jaana. Simulation mein aksar same path par do ya teen faults hote hain; har fix ke baad end-to-end test dobara chalao. Agla fault tabhi dikhta hai jab pehla chala jaaye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Simlets mein sawaal aksar poochta hai ki kuch <b>kyun</b> ho raha hai, use theek kaise karein yeh nahi. Kisi doosri problem ka sahi fix describe karne wale answers common distractors hain. Answer ko us saboot se match karo jo aapne output mein asal mein dekha.</p></div>

<div class="scn"><h4>Woh fix jisne security requirement tod di</h4><p>Ek practice lab mein ticket kehta tha: "Branch users ko web server tak TCP 443 par pahunchna chahiye. Server protected rehna chahiye: sirf ICMP, SSH aur HTTPS allowed." Ek student ne R3 par TCP 443 deny karta outbound ACL dhoondha aur seedha <code>ip access-group</code> command hata diya. Reachability chal gayi, par grader ne task fail kar diya, kyunki ab server tak saara traffic permitted tha. Sahi fix ACL mein ek line thi: <code>25 permit tcp any host 10.3.30.10 eq 443</code>, deny se pehle.</p><p><b>Seekh:</b> fix ko poora ticket satisfy karna chahiye, un hisson samet jo pehle se chal rahe the.</p></div>

<div class="iv"><p class="q">"Aapko live environment mein ek ticket diya gaya hai. Pehle paanch minute mein aap kya karte ho?"</p><p>Problem ko exact addresses aur expected result ke saath padho aur dohrao, scope aur haal ke changes confirm karo, constraints aur change windows note karo, path draw karo, aur source hop se bahar ki taraf read-only checks chalao (<code>show ip route</code>, neighbours, <code>show ip protocols</code>). Batao ki jab tak saboot wala hypothesis na ho aap kuch nahi badalte, aur fix se pehle verification aur rollback plan karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Item types jaano: multiple choice, drag and drop, simlets, testlets aur simulations; wapas jaana nahi hai.</li>
<li>CLI chhune se pehle symptom, scope, expected result, constraints aur hints nikaalo.</li>
<li>Hop by hop <code>show ip route</code> se isolate karo, phir protocol aur forwarding checklists.</li>
<li>Common fault library seekho; exam faults patterns mein dohraaye jaate hain.</li>
<li>Sabse chhota fix, constraints ka samman, end to end re-test, doosra fault dhoondho, kaha jaaye to save karo.</li>
</ul></div>
`}};export{e as default};