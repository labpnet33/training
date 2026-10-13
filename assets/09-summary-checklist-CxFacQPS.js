var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This chapter pulls the module together: what you should now be able to do, the words you must be able to explain, the facts that exams and interviews ask again and again, and a command sheet for the labs. Read it once now and once more the night before a test.</p>

<h3>The big picture in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Four RP methods summary">
<rect x="20" y="15" width="145" height="110" rx="8" fill="#fde68a"/><text x="92" y="38" text-anchor="middle" class="svg-ink" font-size="14">Static</text><text x="92" y="58" text-anchor="middle" class="svg-muted" font-size="12">type it on every</text><text x="92" y="74" text-anchor="middle" class="svg-muted" font-size="12">router, ACL for</text><text x="92" y="90" text-anchor="middle" class="svg-muted" font-size="12">group ranges</text>
<rect x="175" y="15" width="145" height="110" rx="8" fill="#bbf7d0"/><text x="247" y="38" text-anchor="middle" class="svg-ink" font-size="14">Auto-RP</text><text x="247" y="58" text-anchor="middle" class="svg-muted" font-size="12">announce .39</text><text x="247" y="74" text-anchor="middle" class="svg-muted" font-size="12">discovery .40</text><text x="247" y="90" text-anchor="middle" class="svg-muted" font-size="12">listener needed</text>
<rect x="330" y="15" width="145" height="110" rx="8" fill="#bae6fd"/><text x="402" y="38" text-anchor="middle" class="svg-ink" font-size="14">BSR</text><text x="402" y="58" text-anchor="middle" class="svg-muted" font-size="12">elected BSR floods</text><text x="402" y="74" text-anchor="middle" class="svg-muted" font-size="12">RP-set, routers</text><text x="402" y="90" text-anchor="middle" class="svg-muted" font-size="12">choose with hash</text>
<rect x="485" y="15" width="135" height="110" rx="8" fill="#ddd6fe"/><text x="552" y="38" text-anchor="middle" class="svg-ink" font-size="14">Anycast RP</text><text x="552" y="58" text-anchor="middle" class="svg-muted" font-size="12">same /32 on two</text><text x="552" y="74" text-anchor="middle" class="svg-muted" font-size="12">RPs, MSDP shares</text><text x="552" y="90" text-anchor="middle" class="svg-muted" font-size="12">sources</text>
<text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">Order: no-RP groups, static override, learned (longest range), static fallback</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">Always: same RP everywhere, RP address reachable, check from the receiver side</text>
</svg><p class="cap">Four ways to learn the RP, one order of preference, two golden rules.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain the RP with an analogy and say why all routers must agree on it.</li>
<li>Configure a static RP, with and without an ACL, and explain <code>override</code>.</li>
<li>Give two group ranges two different RPs and prove it with <code>show ip pim rp mapping</code> and <code>show ip mroute</code>.</li>
<li>Configure Auto-RP (candidate, agent, listener, scope, group-list) and explain 224.0.1.39 and 224.0.1.40.</li>
<li>Configure BSR (C-BSR, C-RP, priority, hash mask) and predict the elected BSR and the chosen RP.</li>
<li>Build anycast RP with MSDP and demonstrate failover.</li>
<li>Predict the winner when static, Auto-RP and BSR all offer an RP.</li>
<li>Troubleshoot with the six-step method and state the cause behind each fingerprint.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>RP (rendezvous point)</dt><dd>Router where receivers' (*,G) joins and sources' registers meet in PIM sparse mode.</dd>
<dt>Candidate RP (C-RP)</dt><dd>A router that offers to be RP, in Auto-RP or BSR.</dd>
<dt>Mapping agent</dt><dd>Auto-RP router that picks RPs per range and announces the result on 224.0.1.40.</dd>
<dt>BSR</dt><dd>Elected router that floods the RP-set in Bootstrap messages.</dd>
<dt>RP-set</dt><dd>List of all candidate RPs with their ranges and priorities, as flooded by the BSR.</dd>
<dt>Hash mask length</dt><dd>Number of group bits used in the BSR hash; longer spreads groups over C-RPs, 0 sends all to one.</dd>
<dt>Anycast RP</dt><dd>Same address on several RPs; the IGP picks the nearest.</dd>
<dt>MSDP, SA</dt><dd>Protocol between RPs (TCP 639) and its Source-Active message that announces an active source.</dd>
<dt>Autorp listener</dt><dd>Command that lets a sparse-mode router carry the dense Auto-RP groups.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Auto-RP announce group</td><td>224.0.1.39 (candidate RP to mapping agent)</td></tr>
<tr><td>Auto-RP discovery group</td><td>224.0.1.40 (mapping agent to everyone)</td></tr>
<tr><td>Auto-RP agent selects</td><td>highest RP address per range</td></tr>
<tr><td>BSR election</td><td>highest priority, then highest address</td></tr>
<tr><td>BSR RP choice</td><td>longest range, lowest priority, highest hash, highest address</td></tr>
<tr><td>Default C-BSR and C-RP priority, hash mask</td><td>0, 0 (C-RP interval 60 s)</td></tr>
<tr><td>MSDP transport</td><td>TCP 639, between unique addresses</td></tr>
<tr><td>Static RP without ACL</td><td>covers 224.0.0.0/4</td></tr>
<tr><td>Static versus learned</td><td>learned wins; static is fallback unless <code>override</code></td></tr>
<tr><td>Never mapped to an RP</td><td>SSM range, 224.0.1.39 and 224.0.1.40</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! static</span>
ip pim rp-address 2.2.2.2 [acl] [override]
<span class="c">! Auto-RP</span>
ip pim send-rp-announce Loopback0 scope 8 [group-list 10] [interval 30]
ip pim send-rp-discovery Loopback0 scope 8
ip pim autorp listener
<span class="c">! BSR</span>
ip pim bsr-candidate Loopback0 [hash-mask-len [priority]]
ip pim rp-candidate Loopback0 [group-list acl] [priority n] [interval s]
<span class="c">! anycast RP + MSDP</span>
ip msdp peer 4.4.4.4 connect-source Loopback0
<span class="c">! verify</span>
show ip pim rp mapping
show ip pim bsr-router
show ip mroute &lt;group&gt;
show ip msdp summary
show ip msdp sa-cache</pre>
<p><b>Real IOS XE features that the simulator does not model:</b> <code>show ip pim autorp</code>, <code>ip pim accept-rp</code>, <code>ip pim rp-announce-filter</code>, <code>ip pim bsr-border</code>, <code>ip multicast boundary</code>, bidirectional PIM, PIM anycast RP and IGMP snooping. Know that they exist and what they protect.</p>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Reading the Static block as the active RP; reading BSR priority the wrong way; sourcing MSDP from the anycast address; forgetting the listener on a middle router; testing failover only with a running stream.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a question says "the RP is configured on only some routers", the answer is almost always: the router without it has no RP for the group, so its receivers get nothing.</p></div>

<div class="scn"><h4>Putting it together: the Deccan Broadcast migration</h4><p>Deccan Broadcast started with a static RP, grew to 40 routers, and moved to anycast RP in two cities. The engineer kept the static lines but changed the address to the anycast address, added MSDP between the two RPs, tested with a new source and a new receiver, and left no <code>override</code> lines anywhere. Total user impact: one change window of five minutes.</p><p><b>Lesson:</b> the best RP design is the simplest one that survives a failure.</p></div>

<div class="iv"><p class="q">"Summarise the four ways of learning the RP in one minute."</p><p>Strong answer: static is typed everywhere and simple; Auto-RP is Cisco, candidate RPs announce on 224.0.1.39 and a mapping agent distributes on 224.0.1.40, and it needs a listener; BSR is the open standard where an elected BSR floods the RP-set and routers pick by range, priority and hash; anycast RP is about redundancy, two RPs with one address and MSDP between them. Finish with the order of preference and the two golden rules.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Same RP everywhere and a reachable RP address solve most faults.</li>
<li>Dynamic methods save typing; anycast RP gives fast failover.</li>
<li>Know the numbers: .39, .40, TCP 639, priority 0, hash mask 0.</li>
<li>Next in the track: RPF checks and mroute troubleshooting, where you read every field of the tree.</li>
</ul></div>
`,hi:`
<p>Yeh chapter module ko ek saath jodta hai: ab aap kya kar sakte ho, kaunse words aap samjha sakte ho, kaunse facts exams aur interviews baar baar poochte hain, aur labs ke liye ek command sheet. Ise ab ek baar padho aur test se pehle raat ek baar aur.</p>

<h3>Big picture ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Chaar RP methods ka summary">
<rect x="20" y="15" width="145" height="110" rx="8" fill="#fde68a"/><text x="92" y="38" text-anchor="middle" class="svg-ink" font-size="14">Static</text><text x="92" y="58" text-anchor="middle" class="svg-muted" font-size="12">har router par type,</text><text x="92" y="74" text-anchor="middle" class="svg-muted" font-size="12">group ranges ke liye</text><text x="92" y="90" text-anchor="middle" class="svg-muted" font-size="12">ACL</text>
<rect x="175" y="15" width="145" height="110" rx="8" fill="#bbf7d0"/><text x="247" y="38" text-anchor="middle" class="svg-ink" font-size="14">Auto-RP</text><text x="247" y="58" text-anchor="middle" class="svg-muted" font-size="12">announce .39</text><text x="247" y="74" text-anchor="middle" class="svg-muted" font-size="12">discovery .40</text><text x="247" y="90" text-anchor="middle" class="svg-muted" font-size="12">listener chahiye</text>
<rect x="330" y="15" width="145" height="110" rx="8" fill="#bae6fd"/><text x="402" y="38" text-anchor="middle" class="svg-ink" font-size="14">BSR</text><text x="402" y="58" text-anchor="middle" class="svg-muted" font-size="12">elected BSR RP-set</text><text x="402" y="74" text-anchor="middle" class="svg-muted" font-size="12">flood karta hai,</text><text x="402" y="90" text-anchor="middle" class="svg-muted" font-size="12">routers hash se chunte</text>
<rect x="485" y="15" width="135" height="110" rx="8" fill="#ddd6fe"/><text x="552" y="38" text-anchor="middle" class="svg-ink" font-size="14">Anycast RP</text><text x="552" y="58" text-anchor="middle" class="svg-muted" font-size="12">do RPs par same</text><text x="552" y="74" text-anchor="middle" class="svg-muted" font-size="12">/32, MSDP sources</text><text x="552" y="90" text-anchor="middle" class="svg-muted" font-size="12">share karta hai</text>
<text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">Order: no-RP groups, static override, learned (longest range), static fallback</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">Hamesha: har jagah same RP, RP address reachable, receiver side se check</text>
</svg><p class="cap">RP seekhne ke chaar tareeke, preference ka ek order, do golden rules.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>RP ko analogy se samjhao aur batao ki saare routers ko us par agree kyun karna chahiye.</li>
<li>ACL ke saath aur bina ACL ke static RP configure karo aur <code>override</code> samjhao.</li>
<li>Do group ranges ko do alag RPs do aur <code>show ip pim rp mapping</code> aur <code>show ip mroute</code> se prove karo.</li>
<li>Auto-RP configure karo (candidate, agent, listener, scope, group-list) aur 224.0.1.39 aur 224.0.1.40 samjhao.</li>
<li>BSR configure karo (C-BSR, C-RP, priority, hash mask) aur elected BSR aur chuna hua RP predict karo.</li>
<li>MSDP ke saath anycast RP banao aur failover demonstrate karo.</li>
<li>Jab static, Auto-RP aur BSR sab RP offer karein to winner predict karo.</li>
<li>Chhe-step method se troubleshoot karo aur har fingerprint ke peeche ka kaaran batao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>RP (rendezvous point)</dt><dd>Woh router jahan PIM sparse mode mein receivers ke (*,G) joins aur sources ke registers milte hain.</dd>
<dt>Candidate RP (C-RP)</dt><dd>Woh router jo Auto-RP ya BSR mein RP banne ki offer deta hai.</dd>
<dt>Mapping agent</dt><dd>Auto-RP router jo har range ke liye RP chunta hai aur result 224.0.1.40 par announce karta hai.</dd>
<dt>BSR</dt><dd>Elected router jo RP-set ko Bootstrap messages mein flood karta hai.</dd>
<dt>RP-set</dt><dd>BSR ke flood kiye saare candidate RPs ki unki ranges aur priorities ke saath list.</dd>
<dt>Hash mask length</dt><dd>BSR hash mein use hone wale group bits ki sankhya; lambi groups ko C-RPs mein failati hai, 0 sabko ek ke paas bhejta hai.</dd>
<dt>Anycast RP</dt><dd>Kai RPs par same address; IGP nazdeeki ko chunta hai.</dd>
<dt>MSDP, SA</dt><dd>RPs ke beech protocol (TCP 639) aur uska Source-Active message jo active source announce karta hai.</dd>
<dt>Autorp listener</dt><dd>Command jo sparse-mode router ko dense Auto-RP groups carry karne deta hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Auto-RP announce group</td><td>224.0.1.39 (candidate RP se mapping agent)</td></tr>
<tr><td>Auto-RP discovery group</td><td>224.0.1.40 (mapping agent se sabko)</td></tr>
<tr><td>Auto-RP agent chunta hai</td><td>har range par sabse high RP address</td></tr>
<tr><td>BSR election</td><td>sabse high priority, phir sabse high address</td></tr>
<tr><td>BSR RP choice</td><td>longest range, lowest priority, highest hash, highest address</td></tr>
<tr><td>Default C-BSR aur C-RP priority, hash mask</td><td>0, 0 (C-RP interval 60 s)</td></tr>
<tr><td>MSDP transport</td><td>TCP 639, unique addresses ke beech</td></tr>
<tr><td>ACL ke bina static RP</td><td>224.0.0.0/4 cover karta hai</td></tr>
<tr><td>Static versus learned</td><td>learned jeetta hai; <code>override</code> na ho to static fallback hai</td></tr>
<tr><td>Kabhi RP se map nahi hote</td><td>SSM range, 224.0.1.39 aur 224.0.1.40</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! static</span>
ip pim rp-address 2.2.2.2 [acl] [override]
<span class="c">! Auto-RP</span>
ip pim send-rp-announce Loopback0 scope 8 [group-list 10] [interval 30]
ip pim send-rp-discovery Loopback0 scope 8
ip pim autorp listener
<span class="c">! BSR</span>
ip pim bsr-candidate Loopback0 [hash-mask-len [priority]]
ip pim rp-candidate Loopback0 [group-list acl] [priority n] [interval s]
<span class="c">! anycast RP + MSDP</span>
ip msdp peer 4.4.4.4 connect-source Loopback0
<span class="c">! verify</span>
show ip pim rp mapping
show ip pim bsr-router
show ip mroute &lt;group&gt;
show ip msdp summary
show ip msdp sa-cache</pre>
<p><b>Real IOS XE ke features jo simulator model nahi karta:</b> <code>show ip pim autorp</code>, <code>ip pim accept-rp</code>, <code>ip pim rp-announce-filter</code>, <code>ip pim bsr-border</code>, <code>ip multicast boundary</code>, bidirectional PIM, PIM anycast RP aur IGMP snooping. Jaano ki yeh hain aur kis cheez se bachate hain.</p>

<div class="warn"><p><b>Aakhri waqt ki galtiyan jo avoid karni hain.</b> Static block ko active RP padhna; BSR priority ulta padhna; MSDP ko anycast address se source karna; beech ke router par listener bhoolna; failover ko sirf chalti stream se test karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Agar sawal kahe "RP sirf kuch routers par configured hai", to jawab lagbhag hamesha yeh hota hai: jis router par nahi hai uske paas group ka RP nahi hai, isliye uske receivers ko kuch nahi milta.</p></div>

<div class="scn"><h4>Sab kuch ek saath: Deccan Broadcast migration</h4><p>Deccan Broadcast ne static RP se shuru kiya, 40 routers tak badha, aur do cities mein anycast RP par move hua. Engineer ne static lines rakhi par address anycast address kar diya, dono RPs ke beech MSDP jodi, naye source aur naye receiver se test kiya, aur kahin koi <code>override</code> line nahi chhodi. Total user impact: paanch minute ki ek change window.</p><p><b>Seekh:</b> sabse achha RP design woh hai jo sabse simple ho aur failure jhel sake.</p></div>

<div class="iv"><p class="q">"RP seekhne ke chaar tareeke ek minute mein summarise karo."</p><p>Strong answer: static har jagah type hota hai aur simple hai; Auto-RP Cisco hai, candidate RPs 224.0.1.39 par announce karte hain aur mapping agent 224.0.1.40 par distribute karta hai, aur listener chahiye; BSR open standard hai jahan elected BSR RP-set flood karta hai aur routers range, priority aur hash se chunte hain; anycast RP redundancy ke baare mein hai, ek address ke saath do RPs aur unke beech MSDP. End mein preference ka order aur do golden rules batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har jagah same RP aur reachable RP address zyada tar faults solve kar dete hain.</li>
<li>Dynamic methods typing bachate hain; anycast RP fast failover deta hai.</li>
<li>Numbers jaano: .39, .40, TCP 639, priority 0, hash mask 0.</li>
<li>Track mein agla: RPF checks aur mroute troubleshooting, jahan aap tree ka har field padhoge.</li>
</ul></div>
`}};export{e as default};