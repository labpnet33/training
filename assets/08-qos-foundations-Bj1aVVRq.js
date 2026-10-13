var e={id:`qos-foundations`,h:{en:`QoS foundations: classify, mark, queue, shape`,hi:`QoS foundations: classify, mark, queue, shape`},body:{en:`
<p>Steering picks the <b>road</b>. QoS decides who goes first <b>on</b> the road. Picture a single-lane bridge with a traffic policeman. Ambulances (voice) get waved through immediately, ordinary cars (business apps) wait their turn, and heavy trucks (backups) are allowed only when the bridge is not busy. The bridge is the WAN link, which is almost always slower than the LAN behind it. When the LAN sends faster than the WAN can carry, packets queue up, and QoS decides the queue order. Steering without QoS is half a solution: voice may be on the right circuit but stuck behind a big file transfer.</p>

<h3>The four QoS building blocks</h3>
<dl class="terms">
<dt>Classification</dt><dd>Deciding which class a packet belongs to: by application, address, port or an existing marking. This reuses the same application identification you studied in chapter 3.</dd>
<dt>Marking</dt><dd>Writing the class into the packet header so that every following device can recognise it. At Layer 3 this is the <b>DSCP</b> value in the IP header (6 bits); at Layer 2 it is the 802.1p CoS bits.</dd>
<dt>Queuing and scheduling</dt><dd>Separate queues per class, with a scheduler that decides which queue to serve next. Typically one <b>strict-priority queue</b> for voice (always served first, but capped so it cannot starve others) and weighted queues for the rest.</dd>
<dt>Shaping and policing</dt><dd>Limiting a rate. <b>Shaping</b> buffers excess packets and sends them later (smooth, adds delay). <b>Policing</b> drops or re-marks excess packets at once (no delay, harsher).</dd>
</dl>

<h3>Common DSCP values</h3>
<table class="cmp"><tr><th>Class</th><th>DSCP name</th><th>Decimal</th><th>Typical use</th></tr>
<tr><td>Voice bearer</td><td>EF</td><td>46</td><td>VoIP audio, strict priority</td></tr>
<tr><td>Video</td><td>AF41</td><td>34</td><td>Interactive video</td></tr>
<tr><td>Business critical</td><td>AF21 (or AF31)</td><td>18 (26)</td><td>ERP, transactional</td></tr>
<tr><td>Network control</td><td>CS6</td><td>48</td><td>Routing and control traffic</td></tr>
<tr><td>Default</td><td>DF / BE</td><td>0</td><td>Best effort, web</td></tr>
<tr><td>Scavenger</td><td>CS1</td><td>8</td><td>Backups, bulk</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="QoS queues on a WAN link">
<rect x="20" y="20" width="150" height="190" rx="8" fill="#f1f5f9" stroke="#64748b"/><text x="95" y="42" text-anchor="middle" class="svg-ink" font-size="13">LAN traffic in</text>
<rect x="35" y="55" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="95" y="75" text-anchor="middle" class="svg-ink" font-size="12">voice EF</text>
<rect x="35" y="95" width="120" height="30" rx="6" fill="#bae6fd"/><text x="95" y="115" text-anchor="middle" class="svg-ink" font-size="12">ERP AF21</text>
<rect x="35" y="135" width="120" height="30" rx="6" fill="#fde68a"/><text x="95" y="155" text-anchor="middle" class="svg-ink" font-size="12">web BE</text>
<rect x="35" y="175" width="120" height="26" rx="6" fill="#fed7aa"/><text x="95" y="193" text-anchor="middle" class="svg-ink" font-size="12">backup CS1</text>
<rect x="260" y="20" width="150" height="190" rx="8" fill="#ddd6fe"/><text x="335" y="42" text-anchor="middle" class="svg-ink" font-size="13">Scheduler</text><text x="335" y="110" text-anchor="middle" class="svg-muted" font-size="12">priority queue first,</text><text x="335" y="128" text-anchor="middle" class="svg-muted" font-size="12">then weighted queues</text>
<rect x="500" y="80" width="120" height="70" rx="8" fill="#e2e8f0"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="13">WAN link</text><text x="560" y="130" text-anchor="middle" class="svg-muted" font-size="12">shaped to 20 Mbps</text>
<line x1="170" y1="110" x2="260" y2="110" stroke="#64748b" stroke-width="2"/><line x1="410" y1="115" x2="500" y2="115" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Classify, queue, schedule, then shape to the circuit rate.</p></div>

<h3>Why shape to the circuit rate</h3>
<p>If a branch has a 20 Mbps Internet circuit but the router believes the interface is 1 Gbps, it will not see congestion and it will not queue. The carrier will then drop packets without regard to your priorities. By shaping the egress to slightly below the real rate, the queue forms <b>inside your device</b>, where your scheduler controls it. That is the standard design: shape to the contracted rate, then prioritise inside the shaper.</p>

<div class="eg"><p><b>Worked example.</b> A 20 Mbps circuit carries 30 voice calls at about 100 kbps each (3 Mbps), ERP bursts of 10 Mbps, and a backup that wants 40 Mbps. Total demand is 53 Mbps. With QoS, voice gets its 3 Mbps first through the priority queue, ERP gets a weighted share, and the backup absorbs the rest of the 20 Mbps (about 7 Mbps) and is delayed. Without QoS, all packets queue together and tail-drop hits voice and backup equally, so calls break up.</p></div>

<h3>QoS and steering together</h3>
<ul>
<li><b>Steering chooses the circuit; QoS protects the packet on that circuit.</b> You need both.</li>
<li>The same application match can set the DSCP and choose the forwarding profile.</li>
<li>Voice steered away from MPLS to LTE (brownout) must still be prioritised on the LTE interface.</li>
<li>DSCP is only trusted inside your own domain. An Internet carrier usually ignores or re-marks it. MPLS carriers often honour it, according to the class-of-service contract.</li>
</ul>

<div class="note"><p><b>Scope.</b> The course lab CLI does <b>not</b> model queues, shapers or DSCP. This chapter is foundation theory so that you can speak about it correctly. In real Versa, QoS is built from forwarding classes, schedulers and QoS profiles or policies applied to the WAN interface and matched by rule, together with rate limits (shaping and policing). The exact object names and menus differ by release; configure them in the Director workflow wizards and templates.</p></div>

<div class="warn"><p><b>Common mistakes:</b> marking everything as EF (then nothing is priority); an unlimited priority queue that starves other classes; not shaping, so the carrier does the dropping; expecting DSCP markings to survive the public Internet; forgetting that QoS cannot fix a circuit that is simply too small.</p></div>
<div class="exam"><p><b>Exam trap:</b> shaping buffers and delays, policing drops or remarks. Voice is marked EF (46). QoS does not create bandwidth; it only decides who loses when there is not enough.</p></div>

<div class="scn"><h4>Great circuit, bad calls</h4><p>Calls from Delhi were choppy although MPLS measured 20 ms, 2 ms and 0.05 % in the SLA monitor. The probes were fine because they are tiny and sent every few seconds. At the top of the hour the backup job saturated the 20 Mbps link. The queue was a single FIFO, so voice sat behind backup packets for 200 ms. A strict-priority queue for EF and shaping at 19 Mbps solved it.</p><p><b>Lesson:</b> SLA probes can look clean while a congested queue ruins real traffic. QoS and steering complement each other.</p></div>

<div class="iv"><p class="q">"What is the difference between shaping and policing, and where would you apply each?"</p><p>Shaping buffers excess traffic and releases it smoothly, adding delay; use it on egress to match a circuit rate. Policing drops or re-marks the excess immediately; use it to enforce limits on ingress or for a class that must not exceed a cap. Add that voice normally rides a strict-priority queue marked EF.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS = classify, mark (DSCP), queue and schedule, shape or police.</li>
<li>Voice EF 46 with strict priority; backup in a low class.</li>
<li>Shape to the circuit rate so the queue forms in your device.</li>
<li>Steering picks the path, QoS protects the packet; the lab CLI does not model QoS.</li>
</ul></div>
`,hi:`
<p>Steering <b>road</b> chunti hai. QoS decide karta hai ki road <b>par</b> kaun pehle jaye. Ek single-lane bridge socho jis par traffic policeman hai. Ambulances (voice) ko turant nikaal diya jaata hai, normal cars (business apps) apni baari ka wait karti hain, aur bhaari trucks (backups) tabhi jaate hain jab bridge busy na ho. Bridge WAN link hai, jo lagbhag hamesha apne peeche wale LAN se slow hota hai. Jab LAN WAN ke carry karne se tez bhejta hai, packets queue mein lag jaate hain, aur QoS queue ka order decide karta hai. QoS ke bina steering aadha solution hai: voice sahi circuit par ho sakti hai lekin bade file transfer ke peeche atki hui.</p>

<h3>QoS ke chaar building blocks</h3>
<dl class="terms">
<dt>Classification</dt><dd>Decide karna ki packet kis class ka hai: application, address, port ya maujooda marking se. Yeh wahi application identification reuse karta hai jo aapne chapter 3 mein padhi.</dd>
<dt>Marking</dt><dd>Class ko packet header mein likhna taaki aage ka har device use pehchaan sake. Layer 3 par yeh IP header mein <b>DSCP</b> value hai (6 bits); Layer 2 par 802.1p CoS bits.</dd>
<dt>Queuing aur scheduling</dt><dd>Har class ki alag queues, aur scheduler jo decide karta hai ki agli kaunsi queue serve karni hai. Aam taur par voice ke liye ek <b>strict-priority queue</b> (hamesha pehle serve hoti hai, lekin cap ke saath taaki baaki ko bhookha na rakhe) aur baaki ke liye weighted queues.</dd>
<dt>Shaping aur policing</dt><dd>Rate limit karna. <b>Shaping</b> extra packets ko buffer karta hai aur baad mein bhejta hai (smooth, delay badhata hai). <b>Policing</b> extra packets ko turant drop ya re-mark karta hai (delay nahi, zyada sakht).</dd>
</dl>

<h3>Common DSCP values</h3>
<table class="cmp"><tr><th>Class</th><th>DSCP name</th><th>Decimal</th><th>Typical use</th></tr>
<tr><td>Voice bearer</td><td>EF</td><td>46</td><td>VoIP audio, strict priority</td></tr>
<tr><td>Video</td><td>AF41</td><td>34</td><td>Interactive video</td></tr>
<tr><td>Business critical</td><td>AF21 (ya AF31)</td><td>18 (26)</td><td>ERP, transactional</td></tr>
<tr><td>Network control</td><td>CS6</td><td>48</td><td>Routing aur control traffic</td></tr>
<tr><td>Default</td><td>DF / BE</td><td>0</td><td>Best effort, web</td></tr>
<tr><td>Scavenger</td><td>CS1</td><td>8</td><td>Backups, bulk</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="WAN link par QoS queues">
<rect x="20" y="20" width="150" height="190" rx="8" fill="#f1f5f9" stroke="#64748b"/><text x="95" y="42" text-anchor="middle" class="svg-ink" font-size="13">LAN traffic in</text>
<rect x="35" y="55" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="95" y="75" text-anchor="middle" class="svg-ink" font-size="12">voice EF</text>
<rect x="35" y="95" width="120" height="30" rx="6" fill="#bae6fd"/><text x="95" y="115" text-anchor="middle" class="svg-ink" font-size="12">ERP AF21</text>
<rect x="35" y="135" width="120" height="30" rx="6" fill="#fde68a"/><text x="95" y="155" text-anchor="middle" class="svg-ink" font-size="12">web BE</text>
<rect x="35" y="175" width="120" height="26" rx="6" fill="#fed7aa"/><text x="95" y="193" text-anchor="middle" class="svg-ink" font-size="12">backup CS1</text>
<rect x="260" y="20" width="150" height="190" rx="8" fill="#ddd6fe"/><text x="335" y="42" text-anchor="middle" class="svg-ink" font-size="13">Scheduler</text><text x="335" y="110" text-anchor="middle" class="svg-muted" font-size="12">priority queue pehle,</text><text x="335" y="128" text-anchor="middle" class="svg-muted" font-size="12">phir weighted queues</text>
<rect x="500" y="80" width="120" height="70" rx="8" fill="#e2e8f0"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="13">WAN link</text><text x="560" y="130" text-anchor="middle" class="svg-muted" font-size="12">20 Mbps par shaped</text>
<line x1="170" y1="110" x2="260" y2="110" stroke="#64748b" stroke-width="2"/><line x1="410" y1="115" x2="500" y2="115" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Classify, queue, schedule, phir circuit rate par shape.</p></div>

<h3>Circuit rate par shape kyun karein</h3>
<p>Agar branch ke paas 20 Mbps Internet circuit hai lekin router sochta hai ki interface 1 Gbps ka hai, to use congestion dikhegi hi nahi aur woh queue nahi karega. Phir carrier aapki priorities ki parwah kiye bina packets drop karega. Egress ko real rate se thoda neeche shape karne par queue <b>aapke device ke andar</b> banti hai, jahan aapka scheduler use control karta hai. Yahi standard design hai: contracted rate par shape karo, phir shaper ke andar prioritise karo.</p>

<div class="eg"><p><b>Worked example.</b> 20 Mbps circuit par 30 voice calls (har ek lagbhag 100 kbps, kul 3 Mbps), 10 Mbps ke ERP bursts, aur ek backup jo 40 Mbps chahta hai. Kul demand 53 Mbps hai. QoS ke saath, voice ko priority queue se pehle 3 Mbps milta hai, ERP ko weighted share milta hai, aur backup 20 Mbps ka bacha hua hissa (lagbhag 7 Mbps) leta hai aur delay hota hai. QoS ke bina sab packets ek saath queue mein hote hain aur tail-drop voice aur backup dono ko barabar maarta hai, isliye calls tootti hain.</p></div>

<h3>QoS aur steering saath mein</h3>
<ul>
<li><b>Steering circuit chunti hai; QoS us circuit par packet ko protect karta hai.</b> Dono chahiye.</li>
<li>Same application match DSCP set kar sakta hai aur forwarding profile bhi chun sakta hai.</li>
<li>Voice jo brownout mein MPLS se LTE par steer hui, use bhi LTE interface par prioritise karna hoga.</li>
<li>DSCP sirf aapke apne domain mein trusted hai. Internet carrier aam taur par ise ignore ya re-mark karta hai. MPLS carriers aksar class-of-service contract ke hisaab se ise maante hain.</li>
</ul>

<div class="note"><p><b>Scope.</b> Course lab CLI queues, shapers ya DSCP model <b>nahi</b> karta. Yeh chapter foundation theory hai taaki aap ise sahi tarah bol sako. Real Versa mein QoS forwarding classes, schedulers aur QoS profiles ya policies se banta hai jo WAN interface par apply hote hain aur rule se match hote hain, rate limits (shaping aur policing) ke saath. Exact object names aur menus release ke hisaab se alag hain; unhe Director workflow wizards aur templates mein configure karo.</p></div>

<div class="warn"><p><b>Common mistakes:</b> sab kuch EF mark karna (phir kuch bhi priority nahi); unlimited priority queue jo baaki classes ko bhookha rakhe; shape na karna, to carrier drop karta hai; yeh umeed karna ki DSCP markings public Internet se survive karengi; yeh bhoolna ki QoS aisi circuit ko fix nahi kar sakta jo bas chhoti hai.</p></div>
<div class="exam"><p><b>Exam trap:</b> shaping buffer aur delay karta hai, policing drop ya remark karta hai. Voice EF (46) se mark hoti hai. QoS bandwidth nahi banata; sirf yeh decide karta hai ki jab kam ho to kaun haarta hai.</p></div>

<div class="scn"><h4>Great circuit, bad calls</h4><p>Delhi se calls choppy thi jabki SLA monitor mein MPLS 20 ms, 2 ms aur 0.05 % measure kar raha tha. Probes theek the kyunki woh bahut chhote hote hain aur kuch seconds mein bheje jaate hain. Har ghante ki shuruaat mein backup job ne 20 Mbps link saturate kar di. Queue ek single FIFO thi, isliye voice backup packets ke peeche 200 ms baithi rahi. EF ke liye strict-priority queue aur 19 Mbps par shaping ne problem solve kar di.</p><p><b>Lesson:</b> SLA probes clean dikh sakte hain jabki congested queue real traffic bigaad rahi ho. QoS aur steering ek doosre ke complement hain.</p></div>

<div class="iv"><p class="q">"Shaping aur policing mein kya fark hai, aur har ek kahan apply karoge?"</p><p>Shaping extra traffic ko buffer karta hai aur smoothly release karta hai, delay add hota hai; ise egress par circuit rate match karne ke liye use karo. Policing extra ko turant drop ya re-mark karta hai; ise ingress par limits enforce karne ke liye ya us class ke liye use karo jo cap se upar nahi jaani chahiye. Yeh jodo ki voice aam taur par EF mark hokar strict-priority queue mein jaati hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS = classify, mark (DSCP), queue aur schedule, shape ya police.</li>
<li>Voice EF 46 strict priority ke saath; backup low class mein.</li>
<li>Circuit rate par shape karo taaki queue aapke device mein bane.</li>
<li>Steering path chunti hai, QoS packet ko protect karta hai; lab CLI QoS model nahi karta.</li>
</ul></div>
`}};export{e as default};