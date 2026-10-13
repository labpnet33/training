var e={id:`summary`,h:{en:`Summary and exam checklist: policy design`,hi:`Summary aur exam checklist: policy design`},body:{en:`
<p>This last chapter pulls the module together. Read it the day before a practice test, and use the checklist to find the topics you still answer slowly.</p>
<h3>The whole module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Policy design summary">
<rect x="10" y="20" width="120" height="50" rx="8" fill="#bae6fd"/><text x="70" y="50" text-anchor="middle" class="svg-ink" font-size="13">Application</text>
<rect x="150" y="20" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="210" y="50" text-anchor="middle" class="svg-ink" font-size="13">Rule</text>
<rect x="290" y="20" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="350" y="50" text-anchor="middle" class="svg-ink" font-size="13">Set</text>
<rect x="430" y="20" width="120" height="50" rx="8" fill="#fde68a"/><text x="490" y="50" text-anchor="middle" class="svg-ink" font-size="13">Stack</text>
<rect x="430" y="100" width="120" height="50" rx="8" fill="#fed7aa"/><text x="490" y="130" text-anchor="middle" class="svg-ink" font-size="13">Site binding</text>
<line x1="130" y1="45" x2="150" y2="45" stroke="#64748b" stroke-width="2"/><line x1="270" y1="45" x2="290" y2="45" stroke="#64748b" stroke-width="2"/><line x1="410" y1="45" x2="430" y2="45" stroke="#64748b" stroke-width="2"/><line x1="490" y1="70" x2="490" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="170" width="100" height="40" rx="8" fill="#e2e8f0"/><text x="60" y="195" text-anchor="middle" class="svg-ink" font-size="12">Path</text>
<rect x="125" y="170" width="100" height="40" rx="8" fill="#e2e8f0"/><text x="175" y="195" text-anchor="middle" class="svg-ink" font-size="12">Performance</text>
<rect x="240" y="170" width="100" height="40" rx="8" fill="#e2e8f0"/><text x="290" y="195" text-anchor="middle" class="svg-ink" font-size="12">QoS</text>
<rect x="355" y="170" width="100" height="40" rx="8" fill="#e2e8f0"/><text x="405" y="195" text-anchor="middle" class="svg-ink" font-size="12">Security</text>
<rect x="470" y="170" width="100" height="40" rx="8" fill="#e2e8f0"/><text x="520" y="195" text-anchor="middle" class="svg-ink" font-size="12">NAT</text>
</svg><p class="cap">Every policy type follows rule, set, stack, binding. Five types answer five different questions.</p></div>
<h3>Five types, five questions</h3>
<table class="cmp"><tr><th>Type</th><th>Question it answers</th><th>Design reminder</th></tr>
<tr><td>Path</td><td>Which circuit and which overlay?</td><td>Active, backup, Layer 3 failure; first match wins</td></tr>
<tr><td>Performance</td><td>How good must the path be?</td><td>SLA thresholds, FEC, duplication, realistic numbers</td></tr>
<tr><td>QoS</td><td>Who goes first when the circuit is full?</td><td>Priority class, transfer type, DSCP, circuit capacity</td></tr>
<tr><td>Security</td><td>Is this flow allowed?</td><td>Zones, rule order, default rules</td></tr>
<tr><td>NAT</td><td>How is the address translated?</td><td>No NAT before Source NAT, ALG, pools</td></tr></table>
<h3>Exam checklist</h3>
<ul>
<li>I can explain rule, set, stack and why binding is per policy type and per site.</li>
<li>I can separate application definitions, network contexts, and global and local prefixes, and say when a local prefix must be attached.</li>
<li>I can describe active, backup and Layer 3 failure paths, and the difference between SLA-compliant and best path.</li>
<li>I can choose realistic SLA thresholds and say what FEC and packet duplication cost.</li>
<li>I can map applications to priority classes and transfer types, and explain why circuit capacity matters.</li>
<li>I can trace a flow through security zones and default rules, and through NAT rule order.</li>
<li>I can run the eight-step troubleshooting order: bound, classified, rule, path, performance, QoS, security, NAT.</li>
<li>I can check capacity in normal and failure cases with numbers.</li>
</ul>
<div class="warn"><p><b>Last-minute traps.</b> Policies not bound to the site do nothing. Rule order shadows later rules. Thresholds that are too lax never fire. QoS sample numbers in documents are examples, not defaults. Always say what you verified and what you did not.</p></div>
<div class="exam"><p><b>Exam habit.</b> Read the whole scenario, find the policy type the symptom belongs to, then look for the single break in that type before changing anything.</p></div>
<div class="scn"><h4>Final scenario: new branch, nothing works as planned</h4><p>A new branch comes up and traffic uses the wrong circuit, voice is not prioritised and a payment flow is blocked. Check bindings first: only the path stack was bound. Bind QoS and security stacks, attach the local prefix for the payment gateway, then re-verify each flow. One cause explained three symptoms.</p></div>
<div class="iv"><p class="q">"Summarise how you design policy for a new site."</p><p>I list the applications and their needs, write one recipe per traffic class across path, performance, QoS, security and NAT, check capacity in normal and failure cases, bind the stacks to the site, and verify with monitoring and the troubleshooting order. I change one thing at a time and document why each rule exists.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule, set, stack, binding: the same model for all five types.</li>
<li>Design per traffic class, not per policy type.</li>
<li>Verify, do not assume; the simulator does not run these portals, so practise on paper.</li>
<li>Next module: PAN-OS SD-WAN versus Prisma SD-WAN.</li>
</ul></div>
`,hi:`
<p>Yeh aakhri chapter module ko jodta hai. Practice test se ek din pehle ise padho, aur checklist se wo topics dhoondho jinka jawab abhi bhi dheere dete ho.</p>
<h3>Poora module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Policy design summary">
<rect x="10" y="20" width="120" height="50" rx="8" fill="#bae6fd"/><text x="70" y="50" text-anchor="middle" class="svg-ink" font-size="13">Application</text>
<rect x="150" y="20" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="210" y="50" text-anchor="middle" class="svg-ink" font-size="13">Rule</text>
<rect x="290" y="20" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="350" y="50" text-anchor="middle" class="svg-ink" font-size="13">Set</text>
<rect x="430" y="20" width="120" height="50" rx="8" fill="#fde68a"/><text x="490" y="50" text-anchor="middle" class="svg-ink" font-size="13">Stack</text>
<rect x="430" y="100" width="120" height="50" rx="8" fill="#fed7aa"/><text x="490" y="130" text-anchor="middle" class="svg-ink" font-size="13">Site binding</text>
<line x1="130" y1="45" x2="150" y2="45" stroke="#64748b" stroke-width="2"/><line x1="270" y1="45" x2="290" y2="45" stroke="#64748b" stroke-width="2"/><line x1="410" y1="45" x2="430" y2="45" stroke="#64748b" stroke-width="2"/><line x1="490" y1="70" x2="490" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="170" width="100" height="40" rx="8" fill="#e2e8f0"/><text x="60" y="195" text-anchor="middle" class="svg-ink" font-size="12">Path</text>
<rect x="125" y="170" width="100" height="40" rx="8" fill="#e2e8f0"/><text x="175" y="195" text-anchor="middle" class="svg-ink" font-size="12">Performance</text>
<rect x="240" y="170" width="100" height="40" rx="8" fill="#e2e8f0"/><text x="290" y="195" text-anchor="middle" class="svg-ink" font-size="12">QoS</text>
<rect x="355" y="170" width="100" height="40" rx="8" fill="#e2e8f0"/><text x="405" y="195" text-anchor="middle" class="svg-ink" font-size="12">Security</text>
<rect x="470" y="170" width="100" height="40" rx="8" fill="#e2e8f0"/><text x="520" y="195" text-anchor="middle" class="svg-ink" font-size="12">NAT</text>
</svg><p class="cap">Har policy type rule, set, stack, binding follow karta hai. Paanch types paanch alag sawalon ka jawab dete hain.</p></div>
<h3>Paanch types, paanch sawal</h3>
<table class="cmp"><tr><th>Type</th><th>Kaunsa sawal solve karta hai</th><th>Design reminder</th></tr>
<tr><td>Path</td><td>Kaunsa circuit aur kaunsa overlay?</td><td>Active, backup, Layer 3 failure; pehla match jeetta hai</td></tr>
<tr><td>Performance</td><td>Path kitna achha hona chahiye?</td><td>SLA thresholds, FEC, duplication, realistic numbers</td></tr>
<tr><td>QoS</td><td>Circuit bhar jaye to kaun pehle jaye?</td><td>Priority class, transfer type, DSCP, circuit capacity</td></tr>
<tr><td>Security</td><td>Kya yeh flow allowed hai?</td><td>Zones, rule order, default rules</td></tr>
<tr><td>NAT</td><td>Address kaise translate hota hai?</td><td>Source NAT se pehle No NAT, ALG, pools</td></tr></table>
<h3>Exam checklist</h3>
<ul>
<li>Main rule, set, stack samjha sakta hoon aur yeh bhi ki binding har policy type aur har site ke hisaab se kyun hoti hai.</li>
<li>Main application definitions, network contexts, aur global aur local prefixes alag kar sakta hoon, aur bata sakta hoon ki local prefix kab attach karna padta hai.</li>
<li>Main active, backup aur Layer 3 failure paths describe kar sakta hoon, aur SLA-compliant versus best path ka farak.</li>
<li>Main realistic SLA thresholds chun sakta hoon aur bata sakta hoon ki FEC aur packet duplication ki kya keemat hai.</li>
<li>Main applications ko priority classes aur transfer types se map kar sakta hoon, aur circuit capacity ka mahatva samjha sakta hoon.</li>
<li>Main flow ko security zones aur default rules se, aur NAT rule order se trace kar sakta hoon.</li>
<li>Main aath-step troubleshooting order chala sakta hoon: bound, classified, rule, path, performance, QoS, security, NAT.</li>
<li>Main normal aur failure cases mein capacity numbers ke saath check kar sakta hoon.</li>
</ul>
<div class="warn"><p><b>Aakhri minute ke traps.</b> Site se bound na hui policies kuch nahi karti. Rule order baad ke rules ko shadow karta hai. Bahut lax thresholds kabhi fire nahi hote. Documents ke QoS sample numbers examples hain, defaults nahi. Hamesha batao ki kya verify kiya aur kya nahi.</p></div>
<div class="exam"><p><b>Exam habit.</b> Poora scenario padho, symptom jis policy type ka hai use pehchano, phir kuch badalne se pehle us type mein ek break dhoondho.</p></div>
<div class="scn"><h4>Final scenario: naya branch, kuch bhi plan ke hisaab se nahi chal raha</h4><p>Naya branch up aata hai aur traffic galat circuit use karta hai, voice prioritise nahi hoti aur ek payment flow block hai. Pehle bindings check karo: sirf path stack bound tha. QoS aur security stacks bind karo, payment gateway ka local prefix attach karo, phir har flow dobara verify karo. Ek hi karan ne teeno symptoms samjha diye.</p></div>
<div class="iv"><p class="q">"Naye site ke liye policy kaise design karte ho, summarise karo."</p><p>Main applications aur unki zarooratein list karta hoon, har traffic class ke liye path, performance, QoS, security aur NAT mein ek recipe likhta hoon, normal aur failure cases mein capacity check karta hoon, stacks site se bind karta hoon, aur monitoring tatha troubleshooting order se verify karta hoon. Main ek samay mein ek cheez badalta hoon aur document karta hoon ki har rule kyun hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule, set, stack, binding: paanchon types ke liye wahi model.</li>
<li>Policy type ke hisaab se nahi, traffic class ke hisaab se design karo.</li>
<li>Verify karo, assume mat karo; simulator in portals ko run nahi karta, isliye paper par practise karo.</li>
<li>Agla module: PAN-OS SD-WAN versus Prisma SD-WAN.</li>
</ul></div>
`}};export{e as default};