var e={id:`summary`,h:{en:`Summary: checklist, glossary and key facts`,hi:`Summary: checklist, glossary aur key facts`},body:{en:`
<p>This chapter pulls the whole starter module together. Use it before you move to the switching and spanning tree modules, and again on the evening before an exam. It is a checklist, a glossary and a list of facts worth memorising.</p>

<h3>What you should now be able to do</h3>
<ul>
<li>Explain what JNCIS-ENT covers and how its topic areas depend on each other.</li>
<li>Describe the three-tier and collapsed-core campus designs and where each Junos platform fits.</li>
<li>Separate Layer 2 behaviour (MAC learning, VLANs, trunks) from Layer 3 behaviour (routes, preference).</li>
<li>Read a show output in order: command, header, state columns, symptom match.</li>
<li>Run a safe lab session with show | compare, commit check and commit confirmed.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Learning path">
<rect x="20" y="80" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="13">Start here</text>
<rect x="165" y="80" width="120" height="50" rx="8" fill="#bae6fd"/><text x="225" y="110" text-anchor="middle" class="svg-ink" font-size="13">Switching</text>
<rect x="310" y="80" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="370" y="110" text-anchor="middle" class="svg-ink" font-size="13">Spanning tree</text>
<rect x="455" y="80" width="165" height="50" rx="8" fill="#fde68a"/><text x="537" y="110" text-anchor="middle" class="svg-ink" font-size="13">Routing and more</text>
<line x1="140" y1="105" x2="165" y2="105" stroke="#64748b" stroke-width="2"/><line x1="285" y1="105" x2="310" y2="105" stroke="#64748b" stroke-width="2"/><line x1="430" y1="105" x2="455" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">Each stage builds on the one before it</text>
</svg><p class="cap">Your path through the JNCIS-ENT track.</p></div>

<h3>Glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Meaning</th></tr>
<tr><td>VLAN</td><td>A logical Layer 2 network, identified by a tag (1 to 4094)</td></tr>
<tr><td>Access port</td><td>Carries one VLAN, frames are untagged</td></tr>
<tr><td>Trunk port</td><td>Carries several VLANs with 802.1Q tags</td></tr>
<tr><td>Native VLAN</td><td>VLAN used for untagged frames on a trunk; set explicitly with native-vlan-id</td></tr>
<tr><td>IRB</td><td>Integrated routing and bridging interface; the Layer 3 gateway of a VLAN</td></tr>
<tr><td>RSTP</td><td>Rapid spanning tree; fast convergence with roles and states</td></tr>
<tr><td>Root bridge</td><td>Switch with the lowest bridge ID; every other switch finds its root port toward it</td></tr>
<tr><td>Route preference</td><td>Junos value for choosing between protocols; lower wins</td></tr>
<tr><td>Active route</td><td>The chosen route, marked with an asterisk</td></tr>
<tr><td>IGP / EGP</td><td>Routing protocol inside / between organisations</td></tr>
<tr><td>Routing instance</td><td>A separate routing table on one device</td></tr>
<tr><td>ELS</td><td>Enhanced Layer 2 Software, the modern switching configuration style</td></tr></table>

<h3>Key facts to memorise</h3>
<ul>
<li>Exam: multiple choice, around 65 questions in about 90 minutes, with many exhibits. Confirm current details on the official page.</li>
<li>Route preference: Direct and Local 0, static 5, OSPF 10, IS-IS 15 and 18, RIP 100, OSPF external 150, BGP 170.</li>
<li>Default RSTP bridge priority 32768; lower is better; priorities move in steps of 4096.</li>
<li>Default RSTP cost of a 1 Gbps port is 20000.</li>
<li>An IRB is down while its VLAN has no up member port.</li>
<li>Junos does not set a native VLAN by default; configure native-vlan-id on the physical interface.</li>
<li>Longest prefix match comes before route preference.</li>
</ul>

<h3>Self-check before you continue</h3>
<ol>
<li>Draw the stack from JNCIA skills to resilience and name the course module for each layer.</li>
<li>Explain in one minute why hosts in a VLAN can fail to reach their gateway even when the IRB address is right.</li>
<li>List three commands you will always use before committing a risky change.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> A candidate writes a one-page cheat sheet after this module: the stack diagram, the preference table, the reading routine and the commit commands. During revision she reads only this sheet and the quiz explanations for the first pass, then goes into each module for detail. The sheet turns a large syllabus into something she can recall in a few minutes.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Rushing to OSPF or BGP before Layer 2 is solid. Memorising the exam format but not the topics. Treating the starter module as optional revision and not practising the reading routine.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions mix layers. If a routing symptom appears, check Layer 2 state first; if a VLAN symptom appears, check trunk membership and native VLAN before blaming the gateway.</p></div>

<div class="scn"><h4>Choosing what to study next</h4><p>A learner finished this module and wanted to jump straight to BGP because it felt advanced. A mentor asked them to explain what keeps an IRB up. The learner could not. They went to the switching module first, finished it, and found the later routing chapters much easier.</p><p><b>Lesson:</b> follow the stack order.</p></div>

<div class="iv"><p class="q">"How would you plan your JNCIS-ENT preparation?"</p><p>I would start at Layer 2 with switching and spanning tree, add Layer 2 security, then move to the routing base, OSPF, IS-IS and BGP, and finish with tunnels and high availability. I practise each in labs with a plan, build, verify, break and fix loop, then do timed mixed questions before booking the exam.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JNCIS-ENT builds bottom up: Layer 2, routing base, dynamic routing, resilience.</li>
<li>Read output in a fixed order and look at state columns.</li>
<li>Lower route preference wins; longest prefix match is applied first.</li>
<li>Practise with the plan, build, verify, break, fix loop and use commit confirmed.</li>
<li>Next: the JNCIS switching module, then spanning tree.</li>
</ul></div>
`,hi:`
<p>Yeh chapter poore starter module ko ek jagah samet deta hai. Switching aur spanning tree modules par jaane se pehle aur exam se pehli shaam ko ise use karo. Yeh checklist, glossary aur yaad rakhne layak facts ki list hai.</p>

<h3>Ab aap kya kar sakte ho</h3>
<ul>
<li>Samjha sakte ho ki JNCIS-ENT kya cover karta hai aur uske topic areas ek doosre par kaise depend karte hain.</li>
<li>Three-tier aur collapsed-core campus designs bata sakte ho aur har Junos platform kahan fit hota hai.</li>
<li>Layer 2 behaviour (MAC learning, VLANs, trunks) ko Layer 3 behaviour (routes, preference) se alag kar sakte ho.</li>
<li>Show output order mein padh sakte ho: command, header, state columns, symptom match.</li>
<li>show | compare, commit check aur commit confirmed ke saath surakshit lab session chala sakte ho.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Learning path">
<rect x="20" y="80" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="13">Start here</text>
<rect x="165" y="80" width="120" height="50" rx="8" fill="#bae6fd"/><text x="225" y="110" text-anchor="middle" class="svg-ink" font-size="13">Switching</text>
<rect x="310" y="80" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="370" y="110" text-anchor="middle" class="svg-ink" font-size="13">Spanning tree</text>
<rect x="455" y="80" width="165" height="50" rx="8" fill="#fde68a"/><text x="537" y="110" text-anchor="middle" class="svg-ink" font-size="13">Routing and more</text>
<line x1="140" y1="105" x2="165" y2="105" stroke="#64748b" stroke-width="2"/><line x1="285" y1="105" x2="310" y2="105" stroke="#64748b" stroke-width="2"/><line x1="430" y1="105" x2="455" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">Har stage pichli stage par banta hai</text>
</svg><p class="cap">JNCIS-ENT track mein aapka raasta.</p></div>

<h3>Glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Matlab</th></tr>
<tr><td>VLAN</td><td>Logical Layer 2 network, tag (1 se 4094) se pehchana jaata hai</td></tr>
<tr><td>Access port</td><td>Ek VLAN carry karta hai, frames untagged</td></tr>
<tr><td>Trunk port</td><td>Kai VLANs ko 802.1Q tags ke saath carry karta hai</td></tr>
<tr><td>Native VLAN</td><td>Trunk par untagged frames ke liye VLAN; native-vlan-id se explicitly set hota hai</td></tr>
<tr><td>IRB</td><td>Integrated routing and bridging interface; VLAN ka Layer 3 gateway</td></tr>
<tr><td>RSTP</td><td>Rapid spanning tree; roles aur states ke saath tez convergence</td></tr>
<tr><td>Root bridge</td><td>Sabse kam bridge ID wala switch; baaki switches root port uski taraf dhoondhte hain</td></tr>
<tr><td>Route preference</td><td>Protocols ke beech chunne ki Junos value; kam jeetti hai</td></tr>
<tr><td>Active route</td><td>Chuna gaya route, asterisk se mark</td></tr>
<tr><td>IGP / EGP</td><td>Organisation ke andar / beech ka routing protocol</td></tr>
<tr><td>Routing instance</td><td>Ek device par alag routing table</td></tr>
<tr><td>ELS</td><td>Enhanced Layer 2 Software, aadhunik switching configuration style</td></tr></table>

<h3>Yaad rakhne layak key facts</h3>
<ul>
<li>Exam: multiple choice, lagbhag 65 questions lagbhag 90 minute mein, kai exhibits ke saath. Current details official page par confirm karo.</li>
<li>Route preference: Direct aur Local 0, static 5, OSPF 10, IS-IS 15 aur 18, RIP 100, OSPF external 150, BGP 170.</li>
<li>Default RSTP bridge priority 32768; kam behtar hai; priorities 4096 ke steps mein chalti hain.</li>
<li>1 Gbps port ki default RSTP cost 20000 hai.</li>
<li>IRB tab tak down hai jab tak uske VLAN mein koi up member port na ho.</li>
<li>Junos default mein native VLAN set nahi karta; physical interface par native-vlan-id configure karo.</li>
<li>Longest prefix match route preference se pehle aata hai.</li>
</ul>

<h3>Aage badhne se pehle self-check</h3>
<ol>
<li>JNCIA skills se resilience tak ka stack banao aur har layer ka course module batao.</li>
<li>Ek minute mein samjhao ki IRB address sahi hone par bhi VLAN ke hosts gateway tak kyun nahi pahunch sakte.</li>
<li>Risky change commit karne se pehle jo teen commands hamesha use karoge, unhe list karo.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Ek candidate is module ke baad ek page ki cheat sheet likhti hai: stack diagram, preference table, padhne ka routine aur commit commands. Revision mein pehle pass ke liye woh sirf yeh sheet aur quiz explanations padhti hai, phir detail ke liye har module mein jaati hai. Sheet bade syllabus ko aisi cheez bana deti hai jo woh kuch minuton mein yaad kar sake.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Layer 2 pakka hone se pehle OSPF ya BGP par bhaag jaana. Exam format yaad karna lekin topics nahi. Starter module ko optional revision samajhna aur padhne ka routine practise na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions layers mix karte hain. Routing symptom aaye to pehle Layer 2 state check karo; VLAN symptom aaye to gateway par ilzaam lagane se pehle trunk membership aur native VLAN check karo.</p></div>

<div class="scn"><h4>Aage kya padhna hai chunna</h4><p>Ek learner ne yeh module khatam kiya aur seedha BGP par jaana chaha kyunki woh advanced lagta tha. Mentor ne poochha ki IRB ko up kaun rakhta hai. Learner jawab nahi de paaya. Woh pehle switching module par gaya, use khatam kiya, aur baad ke routing chapters bahut aasan lage.</p><p><b>Lesson:</b> stack order follow karo.</p></div>

<div class="iv"><p class="q">"Aap JNCIS-ENT ki taiyari kaise plan karoge?"</p><p>Main Layer 2 se shuru karunga: switching aur spanning tree, phir Layer 2 security, phir routing base, OSPF, IS-IS aur BGP, aur tunnels tatha high availability par khatam karunga. Har ek ko labs mein plan, build, verify, break aur fix loop se practise karunga, phir exam book karne se pehle timed mixed questions karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JNCIS-ENT neeche se upar banta hai: Layer 2, routing base, dynamic routing, resilience.</li>
<li>Output ek tay order mein padho aur state columns dekho.</li>
<li>Kam route preference jeetti hai; longest prefix match pehle lagta hai.</li>
<li>Plan, build, verify, break, fix loop se practise karo aur commit confirmed use karo.</li>
<li>Aage: JNCIS switching module, phir spanning tree.</li>
</ul></div>
`}};export{e as default};