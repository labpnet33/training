var e={id:`models`,h:{en:`Waterfall, Agile and Lean compared`,hi:`Waterfall, Agile aur Lean ki tulna`},body:{en:`
<p>Every team runs the SDLC phases, but they differ in <b>how they order and repeat them</b>. A software development <b>model</b> (or methodology) is the team's agreement on that order. The blueprint asks you to compare three: Waterfall, Agile and Lean. You must be able to say what each one is, what it is good at and where it hurts.</p>

<h3>Analogy: three ways to cook for a wedding</h3>
<p><b>Waterfall</b> is a printed menu approved months ahead: the cook shops once, cooks everything, and serves at the wedding. If the bride then says she wanted less spice, it is too late. <b>Agile</b> is a tasting kitchen: the cook sends out a small plate every few days, the family tastes, and the next plate improves. <b>Lean</b> is a kitchen obsessed with waste: cook only what guests will eat, never let food sit, and stop making dishes nobody orders.</p>

<h3>Waterfall</h3>
<p>Work flows downhill through the phases once: requirements, design, implementation, testing, deployment, maintenance. A phase finishes and is signed off before the next begins. The customer sees working software only near the end.</p>
<ul>
<li><b>Good for:</b> projects where requirements are fixed and well understood, safety or regulation demands heavy documentation, or the cost of change late is huge (hardware, a firmware release with a fixed ship date).</li>
<li><b>Hurts when:</b> requirements change, which they usually do. Problems found in testing may trace back to a wrong requirement written months ago, and fixing that is expensive.</li>
</ul>

<h3>Agile</h3>
<p>Agile (from the Agile Manifesto) delivers software in <b>short iterations</b>, usually 1 to 4 weeks, called sprints in Scrum. Each iteration runs a mini-SDLC: plan, build, test and deliver a small, working slice. The team talks to the customer constantly and welcomes changing requirements. The manifesto's four values: individuals and interactions over processes and tools; working software over comprehensive documentation; customer collaboration over contract negotiation; responding to change over following a plan.</p>
<ul>
<li><b>Good for:</b> products where learning what users need is part of the job, such as an internal automation tool whose users keep discovering new needs.</li>
<li><b>Hurts when:</b> nobody owns priorities (the backlog becomes a dumping ground), the fixed-price contract demands a complete scope up front, or "no documentation" is misread as "no design".</li>
</ul>
<p>Common Agile vocabulary: <b>user story</b> (a small requirement from the user's view), <b>backlog</b> (the ordered to-do list), <b>sprint</b> (the time box), <b>stand-up</b> (a short daily sync), <b>retrospective</b> (what to improve next sprint). Scrum and Kanban are two popular ways to practise Agile.</p>

<h3>Lean</h3>
<p>Lean software development comes from lean manufacturing. Its aim is to <b>maximise value and remove waste</b>. Waste means anything the customer would not pay for: features nobody uses, waiting for approvals, half-finished work, handoffs, rework and bugs. Typical Lean principles: eliminate waste; build quality in (do not inspect it in at the end); deliver fast; decide as late as responsible; optimise the whole flow, not one department; limit work in progress so things finish rather than pile up. A Kanban board with a "max 3 items doing" limit is a Lean tool.</p>
<ul>
<li><b>Good for:</b> operations and automation teams with a steady stream of small requests, where flow and fast delivery matter more than big releases.</li>
<li><b>Hurts when:</b> a team measures speed only and cuts testing, or the "waste" label is used to drop work that is boring but necessary, such as documentation or security.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Waterfall versus Agile timelines">
<text x="10" y="22" class="svg-ink" font-size="13" font-weight="bold">Waterfall</text>
<rect x="10" y="30" width="100" height="26" fill="#bae6fd"/><text x="60" y="48" text-anchor="middle" class="svg-ink" font-size="11">Require</text>
<rect x="110" y="56" width="100" height="26" fill="#ddd6fe"/><text x="160" y="74" text-anchor="middle" class="svg-ink" font-size="11">Design</text>
<rect x="210" y="82" width="140" height="26" fill="#bbf7d0"/><text x="280" y="100" text-anchor="middle" class="svg-ink" font-size="11">Build</text>
<rect x="350" y="108" width="110" height="26" fill="#fde68a"/><text x="405" y="126" text-anchor="middle" class="svg-ink" font-size="11">Test</text>
<rect x="460" y="134" width="90" height="26" fill="#fed7aa"/><text x="505" y="152" text-anchor="middle" class="svg-ink" font-size="11">Release</text>
<text x="10" y="190" class="svg-ink" font-size="13" font-weight="bold">Agile</text>
<rect x="10" y="198" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="60" y="222" text-anchor="middle" class="svg-ink" font-size="11">Sprint 1 ship</text>
<rect x="125" y="198" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="175" y="222" text-anchor="middle" class="svg-ink" font-size="11">Sprint 2 ship</text>
<rect x="240" y="198" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="290" y="222" text-anchor="middle" class="svg-ink" font-size="11">Sprint 3 ship</text>
<rect x="355" y="198" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="405" y="222" text-anchor="middle" class="svg-ink" font-size="11">Sprint 4 ship</text>
<text x="590" y="222" text-anchor="middle" class="svg-muted" font-size="11">feedback each time</text>
</svg><p class="cap">Waterfall delivers once at the end. Agile delivers a working slice every sprint and learns from it.</p></div>

<h3>Side by side</h3>
<table class="cmp"><tr><th></th><th>Waterfall</th><th>Agile</th><th>Lean</th></tr>
<tr><td><b>Shape</b></td><td>Sequential, one pass</td><td>Iterative, short cycles</td><td>Continuous flow</td></tr>
<tr><td><b>Change</b></td><td>Costly, needs a change process</td><td>Expected and welcomed</td><td>Welcome if it adds value</td></tr>
<tr><td><b>Customer sees software</b></td><td>At the end</td><td>Every iteration</td><td>As each small item finishes</td></tr>
<tr><td><b>Documentation</b></td><td>Heavy, up front</td><td>Light, enough to proceed</td><td>Only what adds value</td></tr>
<tr><td><b>Testing</b></td><td>After building</td><td>Inside every iteration</td><td>Built in; defects are waste</td></tr>
<tr><td><b>Main idea</b></td><td>Plan the work, work the plan</td><td>Respond to change</td><td>Eliminate waste</td></tr>
</table>
<div class="exam"><p><b>Exam trap.</b> Agile and Lean are not opposites and they combine well (Kanban is used in both). Waterfall is not "wrong": it fits fixed requirements. Expect questions that describe a team in one sentence ("requirements are frozen and signed off, testing starts after coding is complete") and ask you to name the model.</p></div>

<div class="warn"><p><b>Common mistake.</b> Saying "Agile means no planning or documentation". Agile plans continuously in small pieces and documents what is useful. Another: calling DevOps a model on the same level; it is a culture and set of practices (automation, CI/CD) that works well with Agile.</p></div>

<div class="scn"><h4>Choosing the model for a firmware rollout and an internal tool</h4><p>Metro Cargo runs two projects. The first is a data-centre switch upgrade with a fixed maintenance window, a regulator checklist and no room to change scope: the project manager plans it Waterfall-style, with sign-offs. The second is an internal VLAN self-service portal. Users keep asking for new fields, so the team ships every two weeks, shows the portal to three branch admins each Friday and reorders the backlog. After a month they add a Kanban limit of three items in progress because half-done work was piling up, which is a Lean move.</p><p><b>Lesson:</b> pick the model by how well the requirements are known and how costly change is, not by fashion. Real teams mix them.</p></div>

<div class="iv"><p class="q">"Compare Agile and Waterfall. When would you use each?"</p><p>Waterfall is sequential: finish and sign off each phase, deliver at the end. It suits fixed, well-understood requirements and heavy compliance. Agile works in short iterations, delivers working software often and expects requirements to change, so it suits products where users' needs are still being discovered. Mention Lean as the third: focus on removing waste and limiting work in progress. A strong answer ends with "and many teams combine them".</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Waterfall: sequential phases, one delivery, change is expensive.</li>
<li>Agile: short iterations, working software every sprint, welcomes change, customer collaboration.</li>
<li>Lean: maximise value, remove waste, limit work in progress, build quality in.</li>
<li>Pick the model by how stable the requirements are, not by trend.</li>
<li>Agile does not mean no planning; Waterfall is not always wrong.</li>
</ul></div>
`,hi:`
<p>Har team SDLC ke phases chalati hai, par woh <b>unka order aur repeat karne ka tareeka</b> alag rakhte hain. Software development <b>model</b> (ya methodology) us order par team ka agreement hota hai. Blueprint aapse teen ki tulna maangta hai: Waterfall, Agile aur Lean. Aapko batana aana chahiye ki har ek kya hai, kis mein achha hai aur kahan dard deta hai.</p>

<h3>Analogy: shaadi ke khaane ke teen tareeke</h3>
<p><b>Waterfall</b> mahino pehle approve hua printed menu hai: cook ek baar shopping karta hai, sab pakata hai, aur shaadi par serve karta hai. Agar phir dulhan kahe ki masala kam chahiye tha, to der ho chuki hai. <b>Agile</b> tasting kitchen hai: cook har kuch din mein ek chhoti plate bhejta hai, parivar chakhta hai, aur agli plate behtar hoti hai. <b>Lean</b> waste se chidhne wali kitchen hai: sirf wahi pakao jo mehmaan khayenge, khaana kabhi padha na rahe, aur woh dishes banana band karo jo koi order nahi karta.</p>

<h3>Waterfall</h3>
<p>Kaam phases se ek hi baar neeche behta hai: requirements, design, implementation, testing, deployment, maintenance. Ek phase khatam hokar sign-off hota hai tab agla shuru hota hai. Customer ko working software lagbhag end mein dikhta hai.</p>
<ul>
<li><b>Kahan achha:</b> jahan requirements fixed aur achhe se samjhe hue hon, safety ya regulation bhaari documentation maange, ya late change ki keemat bahut zyada ho (hardware, fixed ship date wala firmware release).</li>
<li><b>Kab dard deta hai:</b> jab requirements badalti hain, aur woh aksar badalti hain. Testing mein mili problem mahino pehle likhi galat requirement se aa sakti hai, aur use fix karna mehnga hota hai.</li>
</ul>

<h3>Agile</h3>
<p>Agile (Agile Manifesto se) software <b>chhote iterations</b> mein deliver karta hai, aam taur par 1 se 4 hafte, jinhe Scrum mein sprint kehte hain. Har iteration ek mini-SDLC chalata hai: plan, build, test aur ek chhota working slice deliver. Team customer se lagatar baat karti hai aur badalti requirements ka swagat karti hai. Manifesto ki chaar values: processes aur tools se upar individuals aur interactions; poore documentation se upar working software; contract negotiation se upar customer collaboration; plan follow karne se upar change ka jawab dena.</p>
<ul>
<li><b>Kahan achha:</b> jahan users ko kya chahiye yeh seekhna kaam ka hissa ho, jaise internal automation tool jiske users nayi zarooratein dhoondhte rehte hain.</li>
<li><b>Kab dard deta hai:</b> jab priorities ka koi malik na ho (backlog kachra-ghar ban jaata hai), fixed-price contract poora scope pehle maange, ya "no documentation" ko "no design" samajh liya jaye.</li>
</ul>
<p>Agile ki aam vocabulary: <b>user story</b> (user ke nazariye se chhoti requirement), <b>backlog</b> (order mein lagi to-do list), <b>sprint</b> (time box), <b>stand-up</b> (chhota daily sync), <b>retrospective</b> (agle sprint mein kya sudharna hai). Scrum aur Kanban Agile practise karne ke do popular tareeke hain.</p>

<h3>Lean</h3>
<p>Lean software development lean manufacturing se aaya hai. Iska maqsad <b>value badhana aur waste hatana</b> hai. Waste matlab woh sab jiske liye customer paisa nahi dega: aisi features jo koi use nahi karta, approvals ka intezaar, aadha-adhoora kaam, handoffs, rework aur bugs. Typical Lean principles: waste hatao; quality andar se banao (end mein inspect mat karo); tez deliver karo; zimmedari se jitna late ho sake decide karo; poore flow ko optimise karo, ek department ko nahi; work in progress limit karo taaki cheezein khatam hon, dher na lagein. "Max 3 items doing" limit wala Kanban board ek Lean tool hai.</p>
<ul>
<li><b>Kahan achha:</b> operations aur automation teams jahan chhoti requests ki steady dhaar ho, aur bade releases se zyada flow aur tez delivery matter kare.</li>
<li><b>Kab dard deta hai:</b> jab team sirf speed napti hai aur testing kaat deti hai, ya "waste" label se woh kaam chhod diya jaata hai jo boring par zaroori hai, jaise documentation ya security.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Waterfall aur Agile timelines">
<text x="10" y="22" class="svg-ink" font-size="13" font-weight="bold">Waterfall</text>
<rect x="10" y="30" width="100" height="26" fill="#bae6fd"/><text x="60" y="48" text-anchor="middle" class="svg-ink" font-size="11">Require</text>
<rect x="110" y="56" width="100" height="26" fill="#ddd6fe"/><text x="160" y="74" text-anchor="middle" class="svg-ink" font-size="11">Design</text>
<rect x="210" y="82" width="140" height="26" fill="#bbf7d0"/><text x="280" y="100" text-anchor="middle" class="svg-ink" font-size="11">Build</text>
<rect x="350" y="108" width="110" height="26" fill="#fde68a"/><text x="405" y="126" text-anchor="middle" class="svg-ink" font-size="11">Test</text>
<rect x="460" y="134" width="90" height="26" fill="#fed7aa"/><text x="505" y="152" text-anchor="middle" class="svg-ink" font-size="11">Release</text>
<text x="10" y="190" class="svg-ink" font-size="13" font-weight="bold">Agile</text>
<rect x="10" y="198" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="60" y="222" text-anchor="middle" class="svg-ink" font-size="11">Sprint 1 ship</text>
<rect x="125" y="198" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="175" y="222" text-anchor="middle" class="svg-ink" font-size="11">Sprint 2 ship</text>
<rect x="240" y="198" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="290" y="222" text-anchor="middle" class="svg-ink" font-size="11">Sprint 3 ship</text>
<rect x="355" y="198" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="405" y="222" text-anchor="middle" class="svg-ink" font-size="11">Sprint 4 ship</text>
<text x="590" y="222" text-anchor="middle" class="svg-muted" font-size="11">har baar feedback</text>
</svg><p class="cap">Waterfall end mein ek baar deliver karta hai. Agile har sprint mein working slice deliver karke usse seekhta hai.</p></div>

<h3>Side by side</h3>
<table class="cmp"><tr><th></th><th>Waterfall</th><th>Agile</th><th>Lean</th></tr>
<tr><td><b>Shape</b></td><td>Sequential, ek pass</td><td>Iterative, chhote cycles</td><td>Continuous flow</td></tr>
<tr><td><b>Change</b></td><td>Mehnga, change process chahiye</td><td>Expected aur welcome</td><td>Value badhaye to welcome</td></tr>
<tr><td><b>Customer software kab dekhta hai</b></td><td>End mein</td><td>Har iteration mein</td><td>Jaise hi chhota item khatam ho</td></tr>
<tr><td><b>Documentation</b></td><td>Bhaari, pehle se</td><td>Halka, aage badhne layak</td><td>Sirf jo value jode</td></tr>
<tr><td><b>Testing</b></td><td>Building ke baad</td><td>Har iteration ke andar</td><td>Built in; defects waste hain</td></tr>
<tr><td><b>Main idea</b></td><td>Kaam plan karo, plan par kaam karo</td><td>Change ka jawab do</td><td>Waste hatao</td></tr>
</table>
<div class="exam"><p><b>Exam trap.</b> Agile aur Lean ulte nahi hain aur saath achhe chalte hain (Kanban dono mein use hota hai). Waterfall "galat" nahi hai: woh fixed requirements ke liye fit hai. Aise questions aayenge jo team ko ek line mein describe karte hain ("requirements frozen aur signed off hain, coding poori hone ke baad testing shuru hoti hai") aur model ka naam poochte hain.</p></div>

<div class="warn"><p><b>Aam galti.</b> Yeh kehna ki "Agile ka matlab no planning ya documentation". Agile chhote tukdon mein lagatar plan karta hai aur jo useful hai woh document karta hai. Ek aur: DevOps ko usi level ka model kehna; woh ek culture aur practices ka set hai (automation, CI/CD) jo Agile ke saath achha chalta hai.</p></div>

<div class="scn"><h4>Firmware rollout aur internal tool ke liye model chunna</h4><p>Metro Cargo do projects chalata hai. Pehla data-centre switch upgrade hai jisme fixed maintenance window, regulator checklist aur scope badalne ki jagah nahi: project manager use Waterfall-style mein sign-offs ke saath plan karta hai. Doosra internal VLAN self-service portal hai. Users nayi fields maangte rehte hain, to team har do hafte ship karti hai, har Friday teen branch admins ko portal dikhati hai aur backlog reorder karti hai. Ek mahine baad woh teen items in progress ka Kanban limit jodte hain kyunki aadha kaam dher ho raha tha, jo ek Lean move hai.</p><p><b>Lesson:</b> model is hisaab se chuno ki requirements kitni pata hain aur change kitna mehnga hai, fashion se nahi. Asli teams mix karti hain.</p></div>

<div class="iv"><p class="q">"Agile aur Waterfall ki tulna karo. Kab kaun sa use karoge?"</p><p>Waterfall sequential hai: har phase khatam karke sign off karo, end mein deliver karo. Yeh fixed, achhe samjhe hue requirements aur bhaari compliance ke liye fit hai. Agile chhote iterations mein kaam karta hai, working software baar baar deliver karta hai aur requirements badalne ki umeed rakhta hai, isliye un products ke liye theek hai jahan users ki zarooratein abhi dhoondhi ja rahi hain. Lean ko teesre ke roop mein bolo: waste hatana aur work in progress limit karna. Strong answer "aur kai teams dono mix karti hain" par khatam hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Waterfall: sequential phases, ek delivery, change mehnga.</li>
<li>Agile: chhote iterations, har sprint working software, change ka swagat, customer collaboration.</li>
<li>Lean: value badhao, waste hatao, work in progress limit karo, quality andar se banao.</li>
<li>Model ko requirements ki stability se chuno, trend se nahi.</li>
<li>Agile ka matlab no planning nahi; Waterfall hamesha galat nahi.</li>
</ul></div>
`}};export{e as default};