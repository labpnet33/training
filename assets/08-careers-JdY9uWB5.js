var e={id:`careers`,h:{en:`Hiring and career context: who works on SD-WAN and what employers ask`,hi:`Hiring aur career context: SD-WAN par kaun kaam karta hai aur employers kya poochte hain`},body:{en:`
<p>You now know what SD-WAN is. This chapter answers the practical question: <i>why should I invest my time in it, and what will employers expect?</i> It speaks in general terms because job markets, pay and titles change by city and year; treat it as a guide to the kinds of work and the questions you will meet, not as a promise.</p>

<h3>Where SD-WAN work exists</h3>
<p>Organisations that need to connect many sites buy SD-WAN, and many of them do not want to run it alone. Work therefore appears in four kinds of employer:</p>
<ul>
<li><b>Enterprises</b> with many branches: banks, insurers, retailers, manufacturers, hospital groups, logistics and education chains. They run the network with an in-house team or share it with a partner.</li>
<li><b>Managed-service providers and telecom carriers</b> that sell "managed SD-WAN" to many customers. They hire large NOC and engineering teams.</li>
<li><b>System integrators and consulting firms</b> that design and roll out the network for a customer project.</li>
<li><b>Global capability centres and IT-service companies</b> that support overseas customers' networks from India, often around the clock.</li>
</ul>

<h3>Typical roles and what they do</h3>
<table class="cmp"><tr><th>Role</th><th>Day-to-day work</th><th>What you should be able to do</th></tr>
<tr><td>NOC / L1 engineer</td><td>Watches alarms and dashboards, raises tickets, does first checks</td><td>Read the Manager dashboard; know control, OMP and BFD states; basic CLI show commands</td></tr>
<tr><td>L2 / support engineer</td><td>Fixes branch outages and policy faults, coordinates with carriers</td><td>Troubleshoot control connections, tunnels and routing; read error codes; use templates safely</td></tr>
<tr><td>Implementation / deployment engineer</td><td>Onboards sites, builds templates, migrates from the old WAN</td><td>Edge bootstrap, TLOCs, templates or configuration groups, cut-over planning</td></tr>
<tr><td>Network architect / L3</td><td>Designs overlays, policies, security and high availability</td><td>Centralized policy, application-aware routing, scale, controller design, cloud integration</td></tr>
<tr><td>Pre-sales / solutions engineer</td><td>Explains and sizes SD-WAN for customers</td><td>Business case, architecture, licensing and comparisons with other vendors</td></tr>
<tr><td>Network automation engineer</td><td>Uses the Manager API and scripts for repeatable operations</td><td>REST API, Python, templates as code</td></tr></table>

<h3>What interviewers actually ask</h3>
<p>Interview questions follow the same ladder as this track. Freshers are asked for definitions: what is SD-WAN, what are the four components, what is a TLOC, what is OMP. Mid-level candidates get "what would you check" questions: a branch shows no tunnels, a site cannot reach another, voice quality is bad. Senior candidates discuss design: how many Controllers, where to place Validators, how to migrate 500 sites with minimal outage, how to do local internet breakout securely. Each module in this track includes interview questions at all three levels so you can rehearse.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Career ladder for SD-WAN">
<rect x="20" y="140" width="130" height="44" rx="8" fill="#e2e8f0"/><text x="85" y="160" text-anchor="middle" class="svg-ink" font-size="12">NOC / L1</text><text x="85" y="176" text-anchor="middle" class="svg-muted" font-size="11">read and report</text>
<rect x="170" y="110" width="130" height="44" rx="8" fill="#bae6fd"/><text x="235" y="130" text-anchor="middle" class="svg-ink" font-size="12">L2 support</text><text x="235" y="146" text-anchor="middle" class="svg-muted" font-size="11">fix and explain</text>
<rect x="320" y="80" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="395" y="100" text-anchor="middle" class="svg-ink" font-size="12">Implementation</text><text x="395" y="116" text-anchor="middle" class="svg-muted" font-size="11">build and migrate</text>
<rect x="490" y="50" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="555" y="70" text-anchor="middle" class="svg-ink" font-size="12">Architect</text><text x="555" y="86" text-anchor="middle" class="svg-muted" font-size="11">design and decide</text>
<path d="M85 140 L235 110 M235 110 L395 80 M395 80 L555 50" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Skills deepen with each step: show commands, then troubleshooting, then build, then design</text>
</svg><p class="cap">A common progression. The commands you learn in this track support every step.</p></div>

<h3>Certifications and where this track fits</h3>
<p>The exam this track prepares you for is <b>Cisco 300-415 ENSDWI</b>, <i>Implementing Cisco SD-WAN Solutions</i>, version 1.2. It is one of the concentration exams for the <b>CCNP Enterprise</b> certification: you pass the core exam (350-401 ENCOR) and one concentration of your choice. SD-WAN is also part of the CCIE Enterprise Infrastructure lab. The official blueprint groups the topics into architecture, controller deployment, router deployment, policies, security and QoS, and management and operations; the track follows those groupings, which is why modules are named after them.</p>
<p>Because the concepts (overlay, central controller, application-aware routing, zero-touch) are shared by Fortinet, Palo Alto, Versa, HPE Aruba and others, the learning also helps you with other vendors' products. The vocabulary changes; the architecture does not.</p>

<div class="eg"><p><b>Worked example: a 90-day plan.</b> A CCNA-level engineer wants an SD-WAN support role. Days 1 to 15: this starter module plus the architecture module, until you can draw the four planes and explain a TLOC. Days 16 to 45: controller deployment and WAN edge onboarding, practising control-connection troubleshooting in the simulator labs of those modules. Days 46 to 75: templates, policies and application-aware routing. Days 76 to 90: troubleshooting module, interview questions aloud, and a mock exam. The plan trades breadth for the sequence that employers test.</p></div>

<h3>How to talk about your skills</h3>
<ul>
<li>Use the product names and the older names: "SD-WAN Manager, formerly vManage."</li>
<li>Describe what you checked and why, in order: control connections, OMP, BFD, then policy.</li>
<li>Be honest about hands-on level. Employers prefer "I built this in a lab and fixed these three faults" to a long list of buzzwords.</li>
</ul>

<div class="warn"><p><b>Common beginner mistake.</b> Learning only the GUI. The Manager GUI is useful, but a NOC at 3 a.m. often has only a console or SSH session. Show commands, read outputs and an understanding of what the GUI is doing underneath are what separate a candidate from a button-clicker.</p></div>

<div class="scn"><h4>The interview that turned on one command</h4><p>A candidate for an L2 role was shown a branch that was "up but slow" and asked what he would check. He started with the Manager dashboard, then said he would log in to the edge and compare control connections, BFD sessions and loss figures per tunnel, and he named the commands. He did not know the exact fix, but he explained the order and why. He was hired over a candidate who had a longer certificate list but could not describe a single verification command.</p><p><b>Lesson:</b> methodical, command-backed thinking is the skill employers cannot easily teach.</p></div>

<div class="iv"><p class="q">"Why did you choose to learn SD-WAN, and how have you practised?"</p><p>Strong answer: connect it to the market (branches moving to cloud, many carriers, need for central operations), name the exam and the topics you covered, and describe the practice you did: onboarding an edge, reading control connections, building a segment, troubleshooting a faulty tunnel. End with what you want to learn next, for example policy design or automation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN work exists in enterprises, managed-service providers, integrators and capability centres.</li>
<li>Roles run from NOC and support to implementation, architecture, pre-sales and automation.</li>
<li>The 300-415 ENSDWI exam is a CCNP Enterprise concentration; the track follows its blueprint.</li>
<li>Interviews climb from definitions to troubleshooting order to design trade-offs.</li>
<li>Command-line understanding matters as much as the GUI; the ideas transfer to other vendors.</li>
</ul></div>
`,hi:`
<p>Ab aap jaante ho ki SD-WAN kya hai. Yeh chapter practical sawaal ka jawab deta hai: <i>mujhe isme apna time kyun lagana chahiye, aur employers kya expect karenge?</i> Yeh general terms mein baat karta hai kyunki job markets, pay aur titles shehar aur saal ke saath badalte hain; ise kaam ke prakaar aur aapko milne wale sawaalon ki guide samjho, wade ki tarah nahi.</p>

<h3>SD-WAN ka kaam kahan hai</h3>
<p>Jin organisations ko bahut saari sites jodni hoti hain woh SD-WAN kharidti hain, aur unme se bahut si ise akele chalana nahi chahti. Isliye kaam chaar tarah ke employers mein dikhta hai:</p>
<ul>
<li><b>Enterprises</b> jinki bahut saari branches hain: banks, insurers, retailers, manufacturers, hospital groups, logistics aur education chains. Woh network in-house team se chalate hain ya partner ke saath share karte hain.</li>
<li><b>Managed-service providers aur telecom carriers</b> jo bahut saare customers ko "managed SD-WAN" bechte hain. Woh bade NOC aur engineering teams hire karte hain.</li>
<li><b>System integrators aur consulting firms</b> jo customer project ke liye network design aur roll out karte hain.</li>
<li><b>Global capability centres aur IT-service companies</b> jo videshi customers ke networks ko India se support karte hain, aksar 24 ghante.</li>
</ul>

<h3>Typical roles aur woh kya karte hain</h3>
<table class="cmp"><tr><th>Role</th><th>Roz ka kaam</th><th>Aapko kya aana chahiye</th></tr>
<tr><td>NOC / L1 engineer</td><td>Alarms aur dashboards dekhta hai, tickets raise karta hai, pehle checks karta hai</td><td>Manager dashboard padhna; control, OMP aur BFD states jaanna; basic CLI show commands</td></tr>
<tr><td>L2 / support engineer</td><td>Branch outages aur policy faults theek karta hai, carriers se coordinate karta hai</td><td>Control connections, tunnels aur routing troubleshoot karna; error codes padhna; templates safely use karna</td></tr>
<tr><td>Implementation / deployment engineer</td><td>Sites onboard karta hai, templates banata hai, purane WAN se migrate karta hai</td><td>Edge bootstrap, TLOCs, templates ya configuration groups, cut-over planning</td></tr>
<tr><td>Network architect / L3</td><td>Overlays, policies, security aur high availability design karta hai</td><td>Centralized policy, application-aware routing, scale, controller design, cloud integration</td></tr>
<tr><td>Pre-sales / solutions engineer</td><td>Customers ko SD-WAN samjhata aur size karta hai</td><td>Business case, architecture, licensing aur doosre vendors se comparison</td></tr>
<tr><td>Network automation engineer</td><td>Repeatable operations ke liye Manager API aur scripts use karta hai</td><td>REST API, Python, templates as code</td></tr></table>

<h3>Interviewers asal mein kya poochte hain</h3>
<p>Interview questions isi track ki seedhi ka follow karte hain. Freshers se definitions poochi jaati hain: SD-WAN kya hai, chaar components kaun se hain, TLOC kya hai, OMP kya hai. Mid-level candidates ko "aap kya check karoge" wale sawaal milte hain: branch mein koi tunnel nahi dikh raha, ek site doosri tak nahi pahunch rahi, voice quality kharab hai. Senior candidates design discuss karte hain: kitne Controllers, Validators kahan rakhne hain, 500 sites ko kam se kam outage ke saath kaise migrate karna hai, local internet breakout secure tareeke se kaise karna hai. Is track ka har module teeno levels ke interview questions rakhta hai taaki aap rehearse kar sako.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="SD-WAN ke liye career ladder">
<rect x="20" y="140" width="130" height="44" rx="8" fill="#e2e8f0"/><text x="85" y="160" text-anchor="middle" class="svg-ink" font-size="12">NOC / L1</text><text x="85" y="176" text-anchor="middle" class="svg-muted" font-size="11">padho aur report karo</text>
<rect x="170" y="110" width="130" height="44" rx="8" fill="#bae6fd"/><text x="235" y="130" text-anchor="middle" class="svg-ink" font-size="12">L2 support</text><text x="235" y="146" text-anchor="middle" class="svg-muted" font-size="11">theek karo, samjhao</text>
<rect x="320" y="80" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="395" y="100" text-anchor="middle" class="svg-ink" font-size="12">Implementation</text><text x="395" y="116" text-anchor="middle" class="svg-muted" font-size="11">banao aur migrate karo</text>
<rect x="490" y="50" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="555" y="70" text-anchor="middle" class="svg-ink" font-size="12">Architect</text><text x="555" y="86" text-anchor="middle" class="svg-muted" font-size="11">design aur faisla</text>
<path d="M85 140 L235 110 M235 110 L395 80 M395 80 L555 50" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Har step par skills gehri hoti hain: show commands, phir troubleshooting, phir build, phir design</text>
</svg><p class="cap">Ek common progression. Is track mein seekhi commands har step ko support karti hain.</p></div>

<h3>Certifications aur yeh track kahan fit hota hai</h3>
<p>Jis exam ki taiyaari yeh track karwata hai woh <b>Cisco 300-415 ENSDWI</b> hai, <i>Implementing Cisco SD-WAN Solutions</i>, version 1.2. Yeh <b>CCNP Enterprise</b> certification ke concentration exams mein se ek hai: aap core exam (350-401 ENCOR) aur apni choice ka ek concentration pass karte ho. SD-WAN CCIE Enterprise Infrastructure lab ka bhi hissa hai. Official blueprint topics ko architecture, controller deployment, router deployment, policies, security aur QoS, aur management aur operations mein group karta hai; track in groupings ko follow karta hai, isiliye modules unhi ke naam par hain.</p>
<p>Kyunki concepts (overlay, central controller, application-aware routing, zero-touch) Fortinet, Palo Alto, Versa, HPE Aruba aur doosre vendors mein bhi share hote hain, yeh seekhna doosre vendors ke products mein bhi madad karta hai. Vocabulary badalti hai; architecture nahi.</p>

<div class="eg"><p><b>Worked example: 90 din ka plan.</b> Ek CCNA-level engineer SD-WAN support role chahta hai. Din 1 se 15: yeh starter module plus architecture module, jab tak aap chaar planes draw na kar sako aur TLOC explain na kar sako. Din 16 se 45: controller deployment aur WAN edge onboarding, in modules ke simulator labs mein control-connection troubleshooting ki practice ke saath. Din 46 se 75: templates, policies aur application-aware routing. Din 76 se 90: troubleshooting module, interview questions zor se bol kar, aur ek mock exam. Plan breadth ko us sequence ke badle rakhta hai jise employers test karte hain.</p></div>

<h3>Apni skills ke baare mein kaise baat karein</h3>
<ul>
<li>Product names aur purane names dono use karo: "SD-WAN Manager, pehle vManage."</li>
<li>Batao ki aapne kya check kiya aur kyun, order mein: control connections, OMP, BFD, phir policy.</li>
<li>Hands-on level ke baare mein honest raho. Employers buzzwords ki lambi list se "maine yeh lab mein banaya aur yeh teen faults theek kiye" ko pasand karte hain.</li>
</ul>

<div class="warn"><p><b>Beginners ki common galti.</b> Sirf GUI seekhna. Manager GUI kaam ka hai, par raat ke 3 baje NOC ke paas aksar sirf console ya SSH session hota hai. Show commands, outputs padhna aur yeh samajhna ki GUI neeche kya kar raha hai, yahi candidate ko button-clicker se alag karta hai.</p></div>

<div class="scn"><h4>Woh interview jo ek command par tika</h4><p>L2 role ke ek candidate ko ek branch dikhayi gayi jo "up hai par slow" thi aur poocha gaya ki woh kya check karega. Usne Manager dashboard se shuru kiya, phir kaha ki woh edge par login karke control connections, BFD sessions aur per-tunnel loss figures compare karega, aur commands ke naam bataye. Use exact fix nahi pata tha, par usne order aur kyun samjhaya. Use us candidate par chuna gaya jiske paas certificate ki lambi list thi par jo ek bhi verification command describe nahi kar paaya.</p><p><b>Seekh:</b> systematic, command-backed soch woh skill hai jo employers aasaani se sikha nahi sakte.</p></div>

<div class="iv"><p class="q">"Aapne SD-WAN seekhna kyun chuna, aur practice kaise ki?"</p><p>Strong answer: ise market se jodo (branches cloud ki taraf, kai carriers, central operations ki zaroorat), exam aur jo topics cover kiye unka naam lo, aur apni practice batao: edge onboard karna, control connections padhna, segment banana, faulty tunnel troubleshoot karna. Ant mein batao ki aap aage kya seekhna chahte ho, jaise policy design ya automation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN ka kaam enterprises, managed-service providers, integrators aur capability centres mein hai.</li>
<li>Roles NOC aur support se implementation, architecture, pre-sales aur automation tak jaate hain.</li>
<li>300-415 ENSDWI exam CCNP Enterprise ka concentration hai; track uske blueprint ko follow karta hai.</li>
<li>Interviews definitions se troubleshooting order aur phir design trade-offs tak chadhte hain.</li>
<li>Command-line samajh GUI jitni hi matter karti hai; ideas doosre vendors par bhi lagu hote hain.</li>
</ul></div>
`}};export{e as default};