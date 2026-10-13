var e={id:`overview`,h:{en:`The Prisma SD-WAN policy model: what you will learn and the big picture`,hi:`Prisma SD-WAN policy model: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how Prisma SD-WAN decides what happens to every flow: which application it is, which circuit it should use, how good that circuit must be, how much bandwidth it gets, whether the firewall zones allow it, and whether it is translated. That is the policy part of the Planning and Design domain: <b>policy design for path, security, QoS, performance and NAT</b>. You will build sets, stacks and rules, bind them to sites, work out rule order, design real examples with numbers (voice, video, SaaS, bulk) and check them in monitoring.</p>
<div class="note"><p><b>Note.</b> <b>Honest note about the simulator.</b> The NK-OS simulator does not model the Prisma SD-WAN portal or ION devices, so this module has no labs. Each portal walk-through is labelled <b>Portal walk-through (not run in the simulator)</b> and each CLI or configuration listing is labelled <b>Reference configuration (not run in the simulator)</b>. I use only portal paths, field names and commands that appear in the Palo Alto Networks documentation; where I could not verify a detail I describe it in words and show no invented output.</p></div>
<p><b>Prerequisites.</b> Read <b>psd-start</b> (sites, ION devices, controller, fabric) and <b>psd-design</b> (sizing, circuits, zones). You should know what a circuit category is and what a zone is.</p>
<h3>Analogy: a city traffic department</h3>
<p>A city decides which vehicles may use which roads. Ambulances get priority lanes (QoS), heavy trucks must use the ring road (path), roads must be in good condition or traffic is diverted (performance), some districts need a pass (security) and some addresses are renamed at the border (NAT). The policy model of Prisma SD-WAN is that traffic department, written as rules and applied to every site.</p>
<h3>Five policy types, five questions</h3>
<table class="cmp"><tr><th>Policy type</th><th>Question it answers</th><th>Typical content</th></tr>
<tr><td><b>Path</b></td><td>Which circuits and overlay should this flow use?</td><td>Active, backup and Layer 3 failure paths, SLA or best-path selection</td></tr>
<tr><td><b>Performance</b></td><td>What is good enough, and what do we do when it is not?</td><td>Latency, jitter, loss thresholds; move flows, FEC, packet duplication</td></tr>
<tr><td><b>QoS</b></td><td>How much bandwidth and which queue?</td><td>Priority (Platinum to Bronze), transfer type, DSCP</td></tr>
<tr><td><b>Security</b></td><td>May these zones talk, for this application?</td><td>Zones, prefix filters, allow or deny</td></tr>
<tr><td><b>NAT</b></td><td>Is the address translated?</td><td>Source NAT, destination NAT, static NAT, No NAT, ALG disable</td></tr></table>
<p>The documentation names them together: <i>stacked Path, QoS, Security, NAT and Performance policies</i>, which let ION devices select paths automatically, shape traffic and balance load across active paths, while the controller gives visibility into application performance.</p>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Policy building blocks">
<rect x="10" y="10" width="180" height="70" rx="10" fill="#bae6fd"/><text x="100" y="38" text-anchor="middle" class="svg-ink" font-size="13">Rule</text><text x="100" y="58" text-anchor="middle" class="svg-muted" font-size="11">match + action</text>
<rect x="230" y="10" width="180" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">Policy set</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="11">ordered rules</text>
<rect x="450" y="10" width="180" height="70" rx="10" fill="#ddd6fe"/><text x="540" y="38" text-anchor="middle" class="svg-ink" font-size="13">Stack</text><text x="540" y="58" text-anchor="middle" class="svg-muted" font-size="11">one set (simple) or several (advanced)</text>
<line x1="190" y1="45" x2="230" y2="45" stroke="#64748b" stroke-width="2"/><line x1="410" y1="45" x2="450" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="120" width="620" height="60" rx="10" fill="#fde68a"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">Stack is bound to one or more sites</text><text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="11">same stack on 40 branches = one change reaches 40 sites</text>
<line x1="540" y1="80" x2="540" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="200" width="620" height="50" rx="10" fill="#e2e8f0"/><text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="13">Types: Path, Performance, QoS, Security, NAT</text>
</svg><p class="cap">The same three building blocks exist in every policy type: rule, set, stack. The stack is what you bind to sites.</p></div>
<h3>Sets, stacks and rules</h3>
<ul>
<li>A <b>rule</b> has a match (who, what, where) and an action.</li>
<li>A <b>policy set</b> is an ordered list of rules. You can clone a set to reuse it.</li>
<li>A <b>stack</b> is what a site uses. A <b>simple stack</b> contains one set; an <b>advanced stack</b> contains several ordered sets so you can layer, for example, a global set, a regional set and a site-type set. The documentation says to use simple stacks unless you need the modular flexibility of advanced ones.</li>
<li>Security stacks hold up to four user-defined sets plus a default set; NAT advanced stacks hold up to four sets.</li>
<li>Stacks are <b>bound to sites</b>. A change to a set reaches every site whose stack contains it.</li>
</ul>
<h3>History that explains exam wording</h3>
<p>Older releases had <i>original</i> policies: network policies (now path) and priority policies (now QoS). For new deployments from release 6.0.1 only stacked policies are available, and devices on original policies must be migrated before upgrading, otherwise the upgrade fails. You may still see the old names in notes and CLI, for example the command <code>dump priority-policy config policy-sets all</code>, which shows the QoS policy sets on a device.</p>
<div class="eg"><p><b>Worked example: one request, five questions.</b> A cashier at STORE-007 submits a card payment to the payment gateway. Path: payment traffic prefers MPLS, backup internet, failure path 5G. Performance: move the flow if loss exceeds 1 percent. QoS: Platinum priority, transactional type. Security: payment zone to corporate WAN zone, allow only the gateway prefix. NAT: No NAT because the destination is inside the enterprise. Each question is answered by a different policy type.</p></div>
<div class="warn"><p><b>Common mistake.</b> Treating policy as one big rule list. Each type has its own sets and stacks, and you bind each type to the site separately. A site with a perfect path policy but no bound security stack will not behave as you expect.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know which policy answers which question, and that original network policy equals stacked path policy and original priority policy equals stacked QoS policy. For new deployments from 6.0.1, only stacked policies exist.</p></div>
<div class="scn"><h4>The same fix, 40 times</h4><p>A retailer had edited each of its 40 stores by hand when voice quality dropped. After moving to a simple path stack and a simple QoS stack bound to all stores, the next voice change was one edit in one set and was live on every store within minutes. Exceptions for three stores with different circuits became a second set in an advanced stack for only those sites.</p><p><b>Lesson:</b> think in sets and stacks, not in sites.</p></div>
<div class="iv"><p class="q">"What is the difference between a policy set and a policy stack?"</p><p>A set is an ordered list of rules. A stack is the unit that is bound to a site: simple stacks hold one set, advanced stacks hold several ordered sets. Each policy type (path, QoS, security, NAT, performance) has its own sets and stacks, and I bind them to sites separately.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five policy types: path, performance, QoS, security, NAT; each answers a different question.</li>
<li>Rule, set, stack: stacks are bound to sites; simple (one set) versus advanced (several).</li>
<li>Original network policy became stacked path policy; original priority policy became stacked QoS policy.</li>
<li>From 6.0.1 new deployments use only stacked policies.</li>
<li>No simulator labs: walk-throughs and listings are labelled as not run in the simulator.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki Prisma SD-WAN har flow ke saath kya hoga yeh kaise tay karta hai: woh kaunsi application hai, kaunsa circuit use kare, circuit kitna achha hona chahiye, use kitni bandwidth milegi, firewall zones allow karte hain ya nahi, aur kya woh translate hoga. Yeh Planning and Design domain ka policy hissa hai: <b>path, security, QoS, performance aur NAT ke liye policy design</b>. Aap sets, stacks aur rules banaoge, unhe sites se bind karoge, rule order samjhoge, numbers ke saath real examples (voice, video, SaaS, bulk) design karoge aur monitoring mein check karoge.</p>
<div class="note"><p><b>Note.</b> <b>Simulator ke baare mein imaandaar note.</b> NK-OS simulator Prisma SD-WAN portal ya ION devices ko model nahi karta, isliye is module mein labs nahi hain. Har portal walk-through ko <b>Portal walk-through (not run in the simulator)</b> label diya gaya hai aur har CLI ya configuration listing ko <b>Reference configuration (not run in the simulator)</b>. Main sirf wohi portal paths, field names aur commands use karta hoon jo Palo Alto Networks documentation mein hain; jahan detail verify nahi kar paya wahan use shabdon mein describe karta hoon aur koi invented output nahi dikhata.</p></div>
<p><b>Prerequisites.</b> <b>psd-start</b> (sites, ION devices, controller, fabric) aur <b>psd-design</b> (sizing, circuits, zones) padho. Aapko pata hona chahiye ki circuit category kya hai aur zone kya hai.</p>
<h3>Analogy: shehar ka traffic department</h3>
<p>Shehar tay karta hai ki kaun si gaadi kaun si sadak use kare. Ambulances ko priority lanes milti hain (QoS), bhaari trucks ring road use karte hain (path), sadkein achhi condition mein hon warna traffic divert hota hai (performance), kuch districts ke liye pass chahiye (security) aur kuch addresses border par rename hote hain (NAT). Prisma SD-WAN ka policy model wahi traffic department hai, rules ke roop mein likha aur har site par lagu.</p>
<h3>Paanch policy types, paanch sawal</h3>
<table class="cmp"><tr><th>Policy type</th><th>Kaunsa sawal answer karta hai</th><th>Typical content</th></tr>
<tr><td><b>Path</b></td><td>Is flow ko kaunse circuits aur overlay use karne chahiye?</td><td>Active, backup aur Layer 3 failure paths, SLA ya best-path selection</td></tr>
<tr><td><b>Performance</b></td><td>Kya kaafi achha hai, aur jab na ho to kya karein?</td><td>Latency, jitter, loss thresholds; move flows, FEC, packet duplication</td></tr>
<tr><td><b>QoS</b></td><td>Kitni bandwidth aur kaunsi queue?</td><td>Priority (Platinum se Bronze), transfer type, DSCP</td></tr>
<tr><td><b>Security</b></td><td>Kya yeh zones is application ke liye baat kar sakte hain?</td><td>Zones, prefix filters, allow ya deny</td></tr>
<tr><td><b>NAT</b></td><td>Kya address translate hota hai?</td><td>Source NAT, destination NAT, static NAT, No NAT, ALG disable</td></tr></table>
<p>Documentation unhe saath mein naam deti hai: <i>stacked Path, QoS, Security, NAT aur Performance policies</i>, jo ION devices ko automatically paths chunne, traffic shape karne aur active paths par load balance karne dete hain, jabki controller application performance ki visibility deta hai.</p>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Policy building blocks">
<rect x="10" y="10" width="180" height="70" rx="10" fill="#bae6fd"/><text x="100" y="38" text-anchor="middle" class="svg-ink" font-size="13">Rule</text><text x="100" y="58" text-anchor="middle" class="svg-muted" font-size="11">match + action</text>
<rect x="230" y="10" width="180" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">Policy set</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="11">ordered rules</text>
<rect x="450" y="10" width="180" height="70" rx="10" fill="#ddd6fe"/><text x="540" y="38" text-anchor="middle" class="svg-ink" font-size="13">Stack</text><text x="540" y="58" text-anchor="middle" class="svg-muted" font-size="11">ek set (simple) ya kai (advanced)</text>
<line x1="190" y1="45" x2="230" y2="45" stroke="#64748b" stroke-width="2"/><line x1="410" y1="45" x2="450" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="120" width="620" height="60" rx="10" fill="#fde68a"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">Stack ek ya zyada sites se bound hota hai</text><text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="11">40 branches par same stack = ek change 40 sites tak</text>
<line x1="540" y1="80" x2="540" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="200" width="620" height="50" rx="10" fill="#e2e8f0"/><text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="13">Types: Path, Performance, QoS, Security, NAT</text>
</svg><p class="cap">Har policy type mein wahi teen building blocks hain: rule, set, stack. Stack woh hai jo aap sites se bind karte ho.</p></div>
<h3>Sets, stacks aur rules</h3>
<ul>
<li><b>Rule</b> mein match (kaun, kya, kahan) aur action hota hai.</li>
<li><b>Policy set</b> rules ki ordered list hai. Reuse ke liye set ko clone kar sakte ho.</li>
<li><b>Stack</b> woh hai jo site use karti hai. <b>Simple stack</b> mein ek set hota hai; <b>advanced stack</b> mein kai ordered sets hote hain taaki aap layer kar sako, jaise global set, regional set aur site-type set. Documentation kehti hai ki jab tak advanced stacks ki modular flexibility na chahiye, simple stacks use karo.</li>
<li>Security stacks mein chaar tak user-defined sets plus ek default set hota hai; NAT advanced stacks mein chaar tak sets hote hain.</li>
<li>Stacks <b>sites se bound</b> hote hain. Set mein change un sab sites tak pahunchta hai jinke stack mein woh set hai.</li>
</ul>
<h3>History jo exam ki wording samjhati hai</h3>
<p>Purane releases mein <i>original</i> policies thi: network policies (ab path) aur priority policies (ab QoS). Release 6.0.1 se naye deployments ke liye sirf stacked policies available hain, aur original policies par chalte devices ko upgrade se pehle migrate karna padta hai, warna upgrade fail hota hai. Purane naam aapko notes aur CLI mein ab bhi dikh sakte hain, jaise command <code>dump priority-policy config policy-sets all</code>, jo device ke QoS policy sets dikhata hai.</p>
<div class="eg"><p><b>Worked example: ek request, paanch sawal.</b> STORE-007 ka cashier payment gateway ko card payment submit karta hai. Path: payment traffic MPLS prefer karta hai, backup internet, failure path 5G. Performance: loss 1 percent se zyada ho to flow move karo. QoS: Platinum priority, transactional type. Security: payment zone se corporate WAN zone, sirf gateway prefix allow. NAT: No NAT kyunki destination enterprise ke andar hai. Har sawal ka jawab alag policy type deta hai.</p></div>
<div class="warn"><p><b>Common galti.</b> Policy ko ek badi rule list samajhna. Har type ke apne sets aur stacks hain, aur aap har type ko site se alag bind karte ho. Perfect path policy wali site jisme security stack bound nahi hai woh aapki umeed jaisa behave nahi karegi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jaano ki kaunsi policy kaunsa sawal answer karti hai, aur ki original network policy = stacked path policy aur original priority policy = stacked QoS policy. 6.0.1 se naye deployments ke liye sirf stacked policies hain.</p></div>
<div class="scn"><h4>Ek hi fix, 40 baar</h4><p>Ek retailer ne voice quality girne par apne 40 stores ko haath se edit kiya tha. Simple path stack aur simple QoS stack ko saare stores se bind karne ke baad agla voice change ek set mein ek edit tha aur kuch minutes mein har store par live ho gaya. Alag circuits wale teen stores ke exceptions sirf un sites ke liye advanced stack mein doosra set ban gaye.</p><p><b>Seekh:</b> sites mein nahi, sets aur stacks mein socho.</p></div>
<div class="iv"><p class="q">"Policy set aur policy stack mein kya farak hai?"</p><p>Set rules ki ordered list hai. Stack woh unit hai jo site se bind hoti hai: simple stacks mein ek set, advanced stacks mein kai ordered sets. Har policy type (path, QoS, security, NAT, performance) ke apne sets aur stacks hain, aur main unhe sites se alag bind karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch policy types: path, performance, QoS, security, NAT; har ek alag sawal answer karta hai.</li>
<li>Rule, set, stack: stacks sites se bound hote hain; simple (ek set) versus advanced (kai).</li>
<li>Original network policy stacked path policy bani; original priority policy stacked QoS policy bani.</li>
<li>6.0.1 se naye deployments sirf stacked policies use karte hain.</li>
<li>Simulator labs nahi hain: walk-throughs aur listings ko not run in the simulator label diya gaya hai.</li>
</ul></div>
`}};export{e as default};