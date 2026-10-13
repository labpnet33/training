var e={id:`four-categories`,h:{en:`The four categories: what each one is for`,hi:`Chaar categories: har ek kis kaam ki hai`},body:{en:`
<h3>What you will learn</h3>
<p>In this module you stop only <i>reading</i> policy and start <i>building</i> it. By the end you will be able to place a rule in the right category, explain why a rule did not fire, harden the default rule without an outage, read hit counters, and understand where application-aware matching fits in. This first chapter covers the four policy categories and a worked plan for Narmada Cloud Services.</p>
<p><b>Prerequisites:</b> the earlier modules of this track. You should know what a vNIC is, what a rule is made of (source, destination, service, action), what a group and a tag are, and how to run a Traceflow and click Publish changes.</p>

<h3>An analogy: rules of an office building</h3>
<p>Think of a large office building. The <b>fire marshal</b> can override everything: in an emergency, a door is shut, no questions asked. The <b>building services</b> team has rules that everyone needs: lifts, lights, the shared network. Each <b>floor</b> has house rules, for example "visitors from the construction floor never enter the finance floor". Finally each <b>tenant</b> has its own rules for its own rooms. When you walk through, the guard checks the highest authority first. A distributed firewall policy is organised in the same way, and each level is a <b>category</b>.</p>

<h3>The categories, in the order they are read</h3>
<p>A security policy is a list of rules. To keep a big list manageable, rules are grouped into <b>categories</b>, and the categories are read in a fixed order. In the simulator, and in the published product documentation, the order is: Emergency, Infrastructure, Environment, Application, and finally the <b>default rule</b>. Inside a category the rules are read top to bottom and the <b>first match wins</b>. As soon as one rule matches, the search stops.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Categories read in order: Emergency, Infrastructure, Environment, Application, default rule">
<rect x="10" y="40" width="108" height="70" rx="10" fill="#fed7aa"/><text x="64" y="70" text-anchor="middle" class="svg-ink" font-size="13">Emergency</text><text x="64" y="90" text-anchor="middle" class="svg-muted" font-size="11">read 1st</text>
<rect x="138" y="40" width="108" height="70" rx="10" fill="#bae6fd"/><text x="192" y="70" text-anchor="middle" class="svg-ink" font-size="13">Infrastructure</text><text x="192" y="90" text-anchor="middle" class="svg-muted" font-size="11">read 2nd</text>
<rect x="266" y="40" width="108" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">Environment</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="11">read 3rd</text>
<rect x="394" y="40" width="108" height="70" rx="10" fill="#bbf7d0"/><text x="448" y="70" text-anchor="middle" class="svg-ink" font-size="13">Application</text><text x="448" y="90" text-anchor="middle" class="svg-muted" font-size="11">read 4th</text>
<rect x="522" y="40" width="108" height="70" rx="10" fill="#e2e8f0"/><text x="576" y="70" text-anchor="middle" class="svg-ink" font-size="13">Default rule</text><text x="576" y="90" text-anchor="middle" class="svg-muted" font-size="11">last resort</text>
<line x1="118" y1="75" x2="138" y2="75" stroke="#64748b" stroke-width="2"/><line x1="246" y1="75" x2="266" y2="75" stroke="#64748b" stroke-width="2"/><line x1="374" y1="75" x2="394" y2="75" stroke="#64748b" stroke-width="2"/><line x1="502" y1="75" x2="522" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">first match wins, then reading stops</text>
</svg><p class="cap">The fixed reading order. A match in an earlier category ends the search; later categories are never consulted.</p></div>

<table class="cmp">
<tr><th>Category</th><th>What it is for</th><th>Who usually owns it</th><th>Narmada example</th></tr>
<tr><td>Emergency</td><td>Urgent blocks and quarantine that must win over everything below</td><td>Security operations</td><td>Isolate any VM tagged quarantine=true; block RDP everywhere</td></tr>
<tr><td>Infrastructure</td><td>Services every workload needs: DNS, time, monitoring</td><td>Platform or infrastructure team</td><td>Rule "Allow DNS" (any to any on dns)</td></tr>
<tr><td>Environment</td><td>Walls between whole environments such as prod and dev</td><td>Security architecture</td><td>"Deny dev to prod" (all dev group to all prod group)</td></tr>
<tr><td>Application</td><td>The flows one application needs, tier by tier</td><td>Application owners with security review</td><td>Web to app on h&#116;tps, app to DB on sql</td></tr>
</table>
<p>The "who owns it" column is a common working practice, not a rule of the product. The point is that the broad, high-stakes rules sit high up and few people edit them, while the many small application rules sit low and change often.</p>

<div class="note"><p><b>What the simulator does not model.</b> The documented policy also has an Ethernet (layer 2) category read before Emergency, and the Environment category has a "Jump to Application" action. Neither is modelled here. Inside the simulator you work with four categories, the default rule, and the actions allow and deny.</p></div>

<h3>Worked category plan</h3>
<div class="eg"><p><b>Worked example.</b> Narmada's seeded policy has one Infrastructure rule, one Environment rule and four Application rules; Emergency is empty. Run a Traceflow for a developer VM asking the production database a DNS question, WEB-D to DB-P on dns:</p></div>
<pre class="out">Flow: WEB-D -&gt; DB-P (dns)
Category infrastructure (1 rule)
  <span class="hl">MATCH Allow DNS -&gt; ALLOW (applied to DFW)</span>
Result: ALLOW by rule "Allow DNS" in infrastructure</pre>
<p>Dev is denied production by "Deny dev to prod", yet DNS from dev to prod works. The reason is the category order: Infrastructure is read before Environment, so "Allow DNS" matches first and the Environment deny is never reached. Now the same developer asks for sql:</p>
<pre class="out">Flow: WEB-D -&gt; DB-P (sql)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  <span class="hl">MATCH Deny dev to prod -&gt; DENY (applied to DFW)</span>
Result: DENY by rule "Deny dev to prod" in environment</pre>
<p>Notice that empty categories are not printed: Emergency has no rules, so the trace starts at Infrastructure. Notice also that a no-match line tells you <i>why</i>: source, destination, service and applied-to each say yes or no.</p>

<h3>Choosing the category for a new rule</h3>
<ol>
<li>Is it an urgent, blanket block that nothing may override? Emergency.</li>
<li>Does every workload need it regardless of application? Infrastructure.</li>
<li>Does it describe a wall or a bridge between environments? Environment.</li>
<li>Is it a flow of one application? Application.</li>
</ol>
<p>Putting an application rule in Environment "because it works there" is a trap: it will be read before the Application rules and may hide the rules below it.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Thinking the position of a rule inside a category can beat a rule in an earlier category: it cannot, category order wins. (2) Putting a one-off application exception into Infrastructure. (3) Forgetting that an empty category still exists; you can add to it later. (4) Assuming a rule you typed is live before Publish changes.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which is read first, Application or Environment?" Environment. "Which category would you use for a rule that must override all application rules?" Emergency.</p></div>

<div class="scn"><h4>The DNS rule nobody understood</h4><p>A new Narmada engineer saw "Deny dev to prod" and reported a bug because dev machines could still resolve names on a prod DNS VM. She ran a Traceflow on dns and saw the match in Infrastructure, not Environment. The wall was working; the DNS rule was a deliberate hole made in the category above it.</p><p><b>Lesson:</b> always read the trace for the category that decided before calling a rule broken.</p></div>

<div class="iv"><p class="q">"Why are firewall rules split into categories at all?"</p><p>Strong answer: categories give a fixed order of authority, so a security team can place broad blocks above and application teams can manage many small rules below without being able to override them. Mention that the order is Emergency, Infrastructure, Environment, Application, then the default rule, and that first match wins inside a category.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Categories are read in a fixed order: Emergency, Infrastructure, Environment, Application, then the default rule.</li>
<li>Inside a category rules run top to bottom and the first match wins.</li>
<li>Emergency is for urgent blocks, Infrastructure for shared services, Environment for walls between environments, Application for per-app flows.</li>
<li>Category order beats rule position: an earlier category always decides first.</li>
<li>The Ethernet category and Jump to Application are not modelled in the simulator.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<p>Is module mein aap policy ko sirf <i>padhna</i> band karke use <i>banana</i> shuru karte ho. Ant tak aap rule ko sahi category mein rakh paoge, samjha paoge ki rule fire kyun nahi hua, default rule ko bina outage ke harden kar paoge, hit counters padh paoge, aur samajh paoge ki application-aware matching kahan fit hoti hai. Yeh pehla chapter chaar policy categories aur Narmada Cloud Services ke liye ek worked plan cover karta hai.</p>
<p><b>Prerequisites:</b> is track ke pichhle modules. Aapko pata hona chahiye ki vNIC kya hai, rule kin cheezon se bana hai (source, destination, service, action), group aur tag kya hain, aur Traceflow kaise chalate hain aur Publish changes kaise dabate hain.</p>

<h3>Ek analogy: office building ke rules</h3>
<p>Ek badi office building socho. <b>Fire marshal</b> sab kuch override kar sakta hai: emergency mein darwaza band, koi sawal nahi. <b>Building services</b> team ke rules sab ke liye hote hain: lifts, lights, shared network. Har <b>floor</b> ke apne house rules hote hain, jaise "construction floor ke visitors finance floor mein kabhi nahi jaate". Aakhir mein har <b>tenant</b> ke apne rooms ke apne rules hote hain. Jab aap andar chalte ho, guard pehle sabse bade authority ko check karta hai. Distributed firewall policy isi tarah organise hoti hai, aur har level ek <b>category</b> hai.</p>

<h3>Categories, us order mein jisme woh padhi jaati hain</h3>
<p>Security policy rules ki list hai. Badi list sambhalne ke liye rules ko <b>categories</b> mein baanta jaata hai, aur categories ek fixed order mein padhi jaati hain. Simulator mein, aur published product documentation mein, order yeh hai: Emergency, Infrastructure, Environment, Application, aur aakhir mein <b>default rule</b>. Category ke andar rules ooper se neeche padhe jaate hain aur <b>pehla match jeetta hai</b>. Jaise hi ek rule match hota hai, search ruk jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Categories ka reading order: Emergency, Infrastructure, Environment, Application, default rule">
<rect x="10" y="40" width="108" height="70" rx="10" fill="#fed7aa"/><text x="64" y="70" text-anchor="middle" class="svg-ink" font-size="13">Emergency</text><text x="64" y="90" text-anchor="middle" class="svg-muted" font-size="11">pehle padhi</text>
<rect x="138" y="40" width="108" height="70" rx="10" fill="#bae6fd"/><text x="192" y="70" text-anchor="middle" class="svg-ink" font-size="13">Infrastructure</text><text x="192" y="90" text-anchor="middle" class="svg-muted" font-size="11">doosri</text>
<rect x="266" y="40" width="108" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">Environment</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="11">teesri</text>
<rect x="394" y="40" width="108" height="70" rx="10" fill="#bbf7d0"/><text x="448" y="70" text-anchor="middle" class="svg-ink" font-size="13">Application</text><text x="448" y="90" text-anchor="middle" class="svg-muted" font-size="11">chauthi</text>
<rect x="522" y="40" width="108" height="70" rx="10" fill="#e2e8f0"/><text x="576" y="70" text-anchor="middle" class="svg-ink" font-size="13">Default rule</text><text x="576" y="90" text-anchor="middle" class="svg-muted" font-size="11">aakhri raasta</text>
<line x1="118" y1="75" x2="138" y2="75" stroke="#64748b" stroke-width="2"/><line x1="246" y1="75" x2="266" y2="75" stroke="#64748b" stroke-width="2"/><line x1="374" y1="75" x2="394" y2="75" stroke="#64748b" stroke-width="2"/><line x1="502" y1="75" x2="522" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">pehla match jeetta hai, phir reading ruk jaati hai</text>
</svg><p class="cap">Fixed reading order. Pehle ki category mein match mila to search wahin khatam; baad ki categories dekhi hi nahi jaati.</p></div>

<table class="cmp">
<tr><th>Category</th><th>Kis kaam ki hai</th><th>Aam taur par kaun sambhalta hai</th><th>Narmada ka example</th></tr>
<tr><td>Emergency</td><td>Urgent block aur quarantine jo neeche ke sab par bhaari pade</td><td>Security operations</td><td>quarantine=true tag wale VM ko isolate karo; RDP har jagah block karo</td></tr>
<tr><td>Infrastructure</td><td>Woh services jo har workload ko chahiye: DNS, time, monitoring</td><td>Platform ya infrastructure team</td><td>Rule "Allow DNS" (dns par any se any)</td></tr>
<tr><td>Environment</td><td>Prod aur dev jaise poore environments ke beech deewar</td><td>Security architecture</td><td>"Deny dev to prod" (poora dev group se poora prod group)</td></tr>
<tr><td>Application</td><td>Ek application ke zaroori flows, tier by tier</td><td>Application owners, security review ke saath</td><td>Web to app h&#116;tps par, app to DB sql par</td></tr>
</table>
<p>"Kaun sambhalta hai" column ek common working practice hai, product ka rule nahi. Baat yeh hai ki bade, high-stakes rules ooper rehte hain aur unhe kam log edit karte hain, jabki bahut saare chhote application rules neeche rehte hain aur aksar badalte hain.</p>

<div class="note"><p><b>Simulator kya model nahi karta.</b> Documented policy mein Emergency se pehle padhi jaane wali Ethernet (layer 2) category bhi hoti hai, aur Environment category mein "Jump to Application" action hota hai. Dono yahan model nahi hain. Simulator ke andar aap chaar categories, default rule, aur actions allow aur deny ke saath kaam karte ho.</p></div>

<h3>Worked category plan</h3>
<div class="eg"><p><b>Worked example.</b> Narmada ki seeded policy mein ek Infrastructure rule, ek Environment rule aur chaar Application rules hain; Emergency khaali hai. Ek developer VM jab production database se DNS sawal poochta hai, yaani WEB-D se DB-P dns par, tab Traceflow chalao:</p></div>
<pre class="out">Flow: WEB-D -&gt; DB-P (dns)
Category infrastructure (1 rule)
  <span class="hl">MATCH Allow DNS -&gt; ALLOW (applied to DFW)</span>
Result: ALLOW by rule "Allow DNS" in infrastructure</pre>
<p>Dev ko production se deny hai ("Deny dev to prod"), phir bhi dev se prod DNS chalta hai. Wajah category order hai: Infrastructure Environment se pehle padhi jaati hai, to "Allow DNS" pehle match karta hai aur Environment ka deny kabhi dekha hi nahi jaata. Ab wahi developer sql maangta hai:</p>
<pre class="out">Flow: WEB-D -&gt; DB-P (sql)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  <span class="hl">MATCH Deny dev to prod -&gt; DENY (applied to DFW)</span>
Result: DENY by rule "Deny dev to prod" in environment</pre>
<p>Dhyan do ki khaali categories print nahi hoti: Emergency mein koi rule nahi, isliye trace Infrastructure se shuru hota hai. Yeh bhi dekho ki no-match line aapko <i>kyun</i> batati hai: source, destination, service aur applied-to har ek yes ya no bolta hai.</p>

<h3>Naye rule ke liye category kaise chunein</h3>
<ol>
<li>Kya yeh urgent, blanket block hai jise koi override na kar sake? Emergency.</li>
<li>Kya har workload ko iski zaroorat hai, application chahe jo ho? Infrastructure.</li>
<li>Kya yeh environments ke beech deewar ya pul describe karta hai? Environment.</li>
<li>Kya yeh ek application ka flow hai? Application.</li>
</ol>
<p>Application rule ko Environment mein rakhna "kyunki wahan chal jaata hai" ek trap hai: woh Application rules se pehle padha jaayega aur neeche ke rules ko chhupa sakta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Yeh sochna ki category ke andar rule ki position pehle ki category ke rule ko haraa sakti hai: nahi, category order jeetta hai. (2) Ek application ka one-off exception Infrastructure mein daal dena. (3) Yeh bhool jaana ki khaali category bhi maujood hai; baad mein usme add kar sakte ho. (4) Publish changes se pehle hi maan lena ki typed rule live hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Application ya Environment, pehle kaunsi padhi jaati hai?" Environment. "Jo rule saare application rules ko override kare uske liye kaunsi category?" Emergency.</p></div>

<div class="scn"><h4>DNS rule jo kisi ko samajh nahi aaya</h4><p>Narmada ki ek nayi engineer ne "Deny dev to prod" dekha aur bug report kiya kyunki dev machines prod DNS VM par names resolve kar pa rahi thi. Usne dns par Traceflow chalaya aur match Infrastructure mein dikha, Environment mein nahi. Deewar kaam kar rahi thi; DNS rule uske ooper ki category mein jaanbujhkar banaya gaya chhed tha.</p><p><b>Seekh:</b> rule ko broken kehne se pehle trace mein dekho ki kaunsi category ne decide kiya.</p></div>

<div class="iv"><p class="q">"Firewall rules ko categories mein kyun baanta jaata hai?"</p><p>Strong answer: categories authority ka fixed order deti hain, to security team broad blocks ooper rakh sakti hai aur application teams neeche ke bahut saare chhote rules sambhal sakti hain bina unhe override kiye. Bolo ki order Emergency, Infrastructure, Environment, Application, phir default rule hai, aur category ke andar pehla match jeetta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Categories fixed order mein padhi jaati hain: Emergency, Infrastructure, Environment, Application, phir default rule.</li>
<li>Category ke andar rules ooper se neeche chalte hain aur pehla match jeetta hai.</li>
<li>Emergency urgent blocks ke liye, Infrastructure shared services ke liye, Environment environments ke beech deewar ke liye, Application per-app flows ke liye.</li>
<li>Category order rule position se bada hai: pehle ki category hamesha pehle decide karti hai.</li>
<li>Ethernet category aur Jump to Application simulator mein model nahi hain.</li>
</ul></div>
`}};export{e as default};