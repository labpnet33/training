var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now have the map for the whole JNCIP-ENT track: the exam topics as layers of one network, a way to turn requirements into design choices, a method for troubleshooting across protocols, a habit for safe change, and a plan for lab practice. This chapter is your checklist before you move on to the protocol modules.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Course path">
<rect x="10" y="50" width="100" height="50" rx="8" fill="#bae6fd"/><text x="60" y="80" text-anchor="middle" class="svg-ink" font-size="12">Start here</text>
<rect x="130" y="50" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="180" y="80" text-anchor="middle" class="svg-ink" font-size="12">OSPF, IS-IS</text>
<rect x="250" y="50" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="300" y="80" text-anchor="middle" class="svg-ink" font-size="12">BGP</text>
<rect x="370" y="50" width="130" height="50" rx="8" fill="#fde68a"/><text x="435" y="80" text-anchor="middle" class="svg-ink" font-size="12">L2, mcast, CoS</text>
<rect x="520" y="50" width="100" height="50" rx="8" fill="#fed7aa"/><text x="570" y="80" text-anchor="middle" class="svg-ink" font-size="12">EVPN, review</text>
<line x1="110" y1="75" x2="130" y2="75" stroke="#64748b" stroke-width="2"/><line x1="230" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><line x1="350" y1="75" x2="370" y2="75" stroke="#64748b" stroke-width="2"/><line x1="500" y1="75" x2="520" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">A suggested order; adjust to your strengths.</text>
</svg><p class="cap">A suggested route through the JNCIP-ENT modules.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can describe the enterprise stack and place each exam topic in it.</li>
<li>I can state what each topic solves and name a dependency between two of them.</li>
<li>I can turn a requirement into: failure domain, mechanism, proof.</li>
<li>I can read neighbours, database and routes for OSPF and IS-IS and explain the difference between them.</li>
<li>I know the default route preferences and can predict which protocol wins.</li>
<li>I can read a policy term by term and say what it matches and does.</li>
<li>I can use show | compare, commit confirmed and rollback, and write a back-out.</li>
<li>I can follow the six-step troubleshooting method on an unfamiliar topology.</li>
<li>I have a lab plan with timed repetition and a command notebook.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Failure domain</dt><dd>The set of devices affected when one component fails or flaps.</dd>
<dt>Underlay</dt><dd>The routed IP network, usually an IGP, that gives loopback reachability to everything above it.</dd>
<dt>Overlay</dt><dd>A service network, such as EVPN-VXLAN, carried over the underlay.</dd>
<dt>Routing policy</dt><dd>Terms of match conditions and actions that control routes entering or leaving a protocol.</dd>
<dt>Import / export</dt><dd>Protocol to routing table / routing table to protocol.</dd>
<dt>Preference</dt><dd>Junos value that ranks routes from different protocols; lower wins.</dd>
<dt>Overload</dt><dd>A router signal to avoid transit through it while keeping it reachable.</dd>
<dt>Commit confirmed</dt><dd>A commit that automatically rolls back unless confirmed in time.</dd>
<dt>Hidden route</dt><dd>A route learned but unusable, for example because its next hop is unresolved.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>OSPF internal / external preference</td><td>10 / 150</td></tr>
<tr><td>IS-IS L1 / L2 internal preference</td><td>15 / 18</td></tr>
<tr><td>IS-IS L1 / L2 external preference</td><td>160 / 165</td></tr>
<tr><td>OSPF overload metric on transit links</td><td>65535</td></tr>
<tr><td>OSPF hello / dead on broadcast links</td><td>10 s / 40 s</td></tr>
<tr><td>Import policy in OSPF or IS-IS</td><td>Does not change the database</td></tr>
<tr><td>Default OSPF and IS-IS export</td><td>Nothing from other sources</td></tr>
<tr><td>Virtual link neighbor-id</td><td>Remote router ID, configured on both ABRs</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">show interfaces terse
show ospf neighbor / interface / database / route
show isis adjacency / interface / database / overview
show route X / show route protocol ospf / show route hidden
show route forwarding-table destination X
show configuration | display set | match ospf
show | compare        commit check        commit confirmed 5
rollback 1            show system commit
ping X count 3        traceroute X no-resolve</pre>

<div class="eg"><p><b>Worked example: self-test.</b> Without notes, explain what happens when you run <code>set protocols ospf overload timeout 900</code> on R2 in a four-router ring. Expected answer: after commit, R2 advertises its transit links with metric 65535 for 900 seconds, R1 prefers the other path to the server LAN, R2's loopback is still reachable, and after the timer the router returns to normal. If you can say it and show the commands, you are ready for the OSPF module.</p></div>

<div class="warn"><p><b>Common mistake.</b> Moving to advanced modules with a shaky JNCIS base. If chapters 4 or 5 felt new, revisit JNCIS routing and policy first; it will save time later.</p></div>
<div class="exam"><p><b>Exam trap.</b> Memorised numbers help, but the exam rewards reasoning. When two answers look right, pick the one that matches the symptom and respects the dependency between layers.</p></div>

<div class="scn"><h4>The calm engineer</h4><p>During a major incident bridge call, three teams argued about the cause. One engineer asked only: "what is the last hop that works?" The answer pointed to one ABR. Neighbours, database and route told the story in four commands, and the fix was a single changed line with a confirmed commit.</p><p><b>Lesson:</b> method wins arguments and shortens outages.</p></div>

<div class="iv"><p class="q">"What will you do in your first week when you inherit a complex network?"</p><p>Draw the topology from the devices, record neighbours and key routes as a baseline, list the policies and who they affect, and find the failure domains. Then I would fix nothing on day one, but prepare a safe-change process with confirmed commits and a back-out for each change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The topics are layers; faults low in the stack appear high in the stack.</li>
<li>Design with requirement, failure domain, mechanism, proof.</li>
<li>Troubleshoot with a fixed method and verify end to end.</li>
<li>Change safely: baseline, drain, compare, commit confirmed, prove.</li>
<li>Practise in the labs with timed repetition and deliberate faults.</li>
</ul></div>
`,hi:`
<p>Ab aapke paas poore JNCIP-ENT track ka map hai: exam topics ek network ki layers ke roop mein, requirements ko design choices mein badalne ka tareeka, protocols ke paar troubleshooting ka method, safe change ki aadat aur lab practice ka plan. Protocol modules par jaane se pehle yeh chapter aapki checklist hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Course path">
<rect x="10" y="50" width="100" height="50" rx="8" fill="#bae6fd"/><text x="60" y="80" text-anchor="middle" class="svg-ink" font-size="12">Start here</text>
<rect x="130" y="50" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="180" y="80" text-anchor="middle" class="svg-ink" font-size="12">OSPF, IS-IS</text>
<rect x="250" y="50" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="300" y="80" text-anchor="middle" class="svg-ink" font-size="12">BGP</text>
<rect x="370" y="50" width="130" height="50" rx="8" fill="#fde68a"/><text x="435" y="80" text-anchor="middle" class="svg-ink" font-size="12">L2, mcast, CoS</text>
<rect x="520" y="50" width="100" height="50" rx="8" fill="#fed7aa"/><text x="570" y="80" text-anchor="middle" class="svg-ink" font-size="12">EVPN, review</text>
<line x1="110" y1="75" x2="130" y2="75" stroke="#64748b" stroke-width="2"/><line x1="230" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><line x1="350" y1="75" x2="370" y2="75" stroke="#64748b" stroke-width="2"/><line x1="500" y1="75" x2="520" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Suggested order; apni taakat ke hisaab se badlo.</text>
</svg><p class="cap">JNCIP-ENT modules se guzarne ka suggested raasta.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main enterprise stack bata sakta hoon aur har exam topic ko usmein rakh sakta hoon.</li>
<li>Main bata sakta hoon ki har topic kya solve karta hai aur do topics ke beech ek dependency naam le sakta hoon.</li>
<li>Main requirement ko badal sakta hoon: failure domain, mechanism, proof mein.</li>
<li>Main OSPF aur IS-IS ke neighbours, database aur routes padh sakta hoon aur unka difference samjha sakta hoon.</li>
<li>Mujhe default route preferences pata hain aur predict kar sakta hoon ki kaunsa protocol jeetega.</li>
<li>Main policy ko term-by-term padh sakta hoon aur bata sakta hoon ki woh kya match aur kya karti hai.</li>
<li>Main show | compare, commit confirmed aur rollback use kar sakta hoon, aur back-out likh sakta hoon.</li>
<li>Main anjaan topology par chhe-step troubleshooting method follow kar sakta hoon.</li>
<li>Mere paas timed repetition aur command notebook ke saath lab plan hai.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Failure domain</dt><dd>Devices ka woh set jo ek component fail ya flap hone par asar mein aata hai.</dd>
<dt>Underlay</dt><dd>Routed IP network, aksar IGP, jo apne upar ki har cheez ko loopback reachability deta hai.</dd>
<dt>Overlay</dt><dd>Service network, jaise EVPN-VXLAN, jo underlay par chalta hai.</dd>
<dt>Routing policy</dt><dd>Match conditions aur actions ke terms jo protocol mein aane-jaane wale routes ko control karte hain.</dd>
<dt>Import / export</dt><dd>Protocol se routing table / routing table se protocol.</dd>
<dt>Preference</dt><dd>Junos value jo alag protocols ke routes ko rank karti hai; chhoti jeetti hai.</dd>
<dt>Overload</dt><dd>Router ka signal ki mere through transit se bacho, par mujhe reachable rakho.</dd>
<dt>Commit confirmed</dt><dd>Aisa commit jo samay par confirm na ho to khud rollback ho jaata hai.</dd>
<dt>Hidden route</dt><dd>Seekha hua par unusable route, jaise next hop unresolved hone par.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>OSPF internal / external preference</td><td>10 / 150</td></tr>
<tr><td>IS-IS L1 / L2 internal preference</td><td>15 / 18</td></tr>
<tr><td>IS-IS L1 / L2 external preference</td><td>160 / 165</td></tr>
<tr><td>Transit links par OSPF overload metric</td><td>65535</td></tr>
<tr><td>Broadcast links par OSPF hello / dead</td><td>10 s / 40 s</td></tr>
<tr><td>OSPF ya IS-IS mein import policy</td><td>Database nahi badalti</td></tr>
<tr><td>Default OSPF aur IS-IS export</td><td>Doosre sources se kuch nahi</td></tr>
<tr><td>Virtual link neighbor-id</td><td>Remote router ID, dono ABRs par configure</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">show interfaces terse
show ospf neighbor / interface / database / route
show isis adjacency / interface / database / overview
show route X / show route protocol ospf / show route hidden
show route forwarding-table destination X
show configuration | display set | match ospf
show | compare        commit check        commit confirmed 5
rollback 1            show system commit
ping X count 3        traceroute X no-resolve</pre>

<div class="eg"><p><b>Worked example: self-test.</b> Bina notes ke samjhao ki chaar-router ring mein R2 par <code>set protocols ospf overload timeout 900</code> chalane se kya hota hai. Expected jawab: commit ke baad R2 apne transit links 900 seconds ke liye metric 65535 se advertise karta hai, R1 server LAN ke liye doosra path prefer karta hai, R2 ka loopback abhi bhi reachable rehta hai, aur timer ke baad router normal ho jaata hai. Aap yeh keh sako aur commands dikha sako to OSPF module ke liye ready ho.</p></div>

<div class="warn"><p><b>Common mistake.</b> Kamzor JNCIS base ke saath advanced modules mein jaana. Chapter 4 ya 5 naye lage to pehle JNCIS routing aur policy dobara dekho; baad mein samay bachega.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ratte hue numbers madad karte hain, par exam reasoning ko inaam deta hai. Do jawab sahi lagein to woh chuno jo symptom se match kare aur layers ki dependency ka dhyan rakhe.</p></div>

<div class="scn"><h4>Shaant engineer</h4><p>Badi incident bridge call mein teen teams cause par behas kar rahi thi. Ek engineer ne sirf poocha: "aakhri hop kaunsa hai jo chalta hai?" Jawab ek ABR par le gaya. Neighbours, database aur route ne chaar commands mein kahani bata di, aur fix ek badli hui line thi, confirmed commit ke saath.</p><p><b>Lesson:</b> method behas jeetta hai aur outage chhota karta hai.</p></div>

<div class="iv"><p class="q">"Complex network inherit karne par pehle hafte mein kya karoge?"</p><p>Devices se topology banaunga, neighbours aur key routes ka baseline record karunga, policies aur unka asar list karunga, aur failure domains dhoondhunga. Pehle din kuch fix nahi karunga, par har change ke liye confirmed commits aur back-out ke saath safe-change process taiyar karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Topics layers hain; stack mein neeche ke faults upar dikhte hain.</li>
<li>Requirement, failure domain, mechanism, proof se design karo.</li>
<li>Fixed method se troubleshoot karo aur end to end verify karo.</li>
<li>Safely change karo: baseline, drain, compare, commit confirmed, prove.</li>
<li>Labs mein timed repetition aur jaanbujhkar faults ke saath practice karo.</li>
</ul></div>
`}};export{e as default};