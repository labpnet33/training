var e={id:`templates`,h:{en:`Policy templates and inheritance`,hi:`Policy templates aur inheritance`},body:{en:`
<p>One branch is easy. Ten branches are not: if every branch has its own hand-written copy of "allow DNS, block Telnet, allow the SMC", the copies drift apart. A <b>policy template</b> solves this. It holds rules every branch must have, and each branch policy is built on top of it.</p>

<h3>Analogy: the company rule book and the site notice board</h3>
<p>Network Kings has one company rule book printed by head office: badges must be worn, visitors sign in. Each branch then adds its own notice board: Pune has a canteen timing, Delhi has a parking note. The branch cannot tear out a page of the company book. In policy terms, the company book is the template and the notice board is the branch policy.</p>

<h3>What a template is</h3>
<p>A policy has a type. A <b>template</b> is a policy that other policies are based on. A normal <b>policy</b> picks one template and inherits its rules. The template's rules appear <b>on top</b> of the branch policy, and the engine evaluates them first. They are numbered <code>T1</code>, <code>T2</code> and so on, so you can tell them apart from the branch's own rules, which are numbered <code>1</code>, <code>2</code> and so on.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Template rules above branch rules">
<rect x="20" y="15" width="260" height="190" rx="10" fill="#ddd6fe"/><text x="150" y="38" text-anchor="middle" class="svg-ink" font-size="14">Template: NK-BASE</text>
<rect x="40" y="50" width="220" height="30" rx="5" fill="#fff"/><text x="50" y="70" class="svg-ink" font-size="12">T1 any to srv-smc  SMC contact  Allow</text>
<rect x="40" y="88" width="220" height="30" rx="5" fill="#fff"/><text x="50" y="108" class="svg-ink" font-size="12">T2 any to any  Telnet  Discard</text>
<text x="150" y="150" text-anchor="middle" class="svg-muted" font-size="12">shared by every branch</text>
<rect x="360" y="15" width="260" height="190" rx="10" fill="#bae6fd"/><text x="490" y="38" text-anchor="middle" class="svg-ink" font-size="14">Policy: NK-PUNE</text>
<rect x="380" y="50" width="220" height="30" rx="5" fill="#ddd6fe"/><text x="390" y="70" class="svg-ink" font-size="12">T1 and T2 inherited, first</text>
<rect x="380" y="88" width="220" height="30" rx="5" fill="#fff"/><text x="390" y="108" class="svg-ink" font-size="12">1 net-staff to any  HTTPS  Allow</text>
<rect x="380" y="126" width="220" height="30" rx="5" fill="#fff"/><text x="390" y="146" class="svg-ink" font-size="12">2 net-staff to any  DNS (UDP)  Allow</text>
<line x1="285" y1="110" x2="355" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="102" text-anchor="middle" class="svg-accent" font-size="12">based on</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">The branch cannot reorder or edit T-rules; it can only add its own below them</text>
</svg><p class="cap">Evaluation order for the Pune engine: T1, T2, then 1, 2, then the implicit discard.</p></div>

<h3>Why branches share a template</h3>
<ul>
<li><b>One change, many branches.</b> Edit the template once; every policy based on it picks up the change at the next install.</li>
<li><b>Guaranteed baseline.</b> Because template rules sit on top, no branch rule can be placed above them. A branch cannot accidentally allow Telnet above the company ban.</li>
<li><b>Consistent numbering.</b> A support engineer on any branch reads T1 as the same rule.</li>
<li><b>Smaller policies.</b> Branch policies show only what is local.</li>
</ul>
<p>The same idea appears in other vendors as pre-rules or parent groups. Do not carry their exact behaviour over: in this console, template rules always come first, and that is the behaviour the labs check.</p>

<div class="eg"><p><b>Worked example.</b> The template NK-BASE has T1 allowing every host to reach <code>srv-smc</code> with the SMC contact service, and T2 discarding Telnet. The branch policy NK-PUNE is based on it and adds rule 1 (staff HTTPS) and rule 2 (staff DNS). STAFF-PC opens Telnet to 203.0.113.80. T1: destination is not srv-smc, skip. T2: matches, Discard. Even if someone adds a rule 3 that allows staff to any service, Telnet never reaches it. The engine, not the person, enforces the baseline.</p></div>

<h3>What the labs ask for</h3>
<p>In lab <b>fp-policy-1</b> you build the branch policy from a template, assign it to the engine NK-PUNE-FW and install. You use the Policies page to create the policy, choose its template, add the local rules, and then use the Install policy bar. Remember the checks read the installed snapshot only.</p>
<pre class="out">Engine NK-PUNE-FW   installed policy: NK-PUNE   template: NK-BASE
 T1  any -&gt; srv-smc   SMC contact   Allow
 T2  any -&gt; any       Telnet        Discard
 1   net-staff -&gt; any HTTPS         Allow
 2   net-staff -&gt; any DNS (UDP)     Allow
<span class="hl">Rules compiled: 4   Warnings: 0</span></pre>

<div class="warn"><p><b>Common mistake.</b> Trying to fix a branch problem by editing the template. A template change affects every branch based on it, not only Pune. Make the change in the branch policy unless the rule truly belongs to everyone.</p></div>
<div class="exam"><p><b>Exam trap.</b> Template rules are evaluated before the policy's own rules, and carry the T prefix in the rule numbers. A missing template is a validation error that blocks install (chapter nine).</p></div>

<div class="scn"><h4>The Telnet rule nobody could override</h4><p>A Pune team lead asked for a one-off Telnet allow to a legacy switch. The admin added an Allow rule in the branch policy and installed, but Telnet still failed. The Policy match test showed T2 matching first. The company baseline was working as designed. The lead was told to raise the request with the central security team, who added a narrow exception to the template for the legacy switch address only.</p><p><b>Lesson:</b> template rules cannot be overridden from below; that is the point.</p></div>
<div class="iv"><p class="q">"Why use a policy template for a multi-branch network?"</p><p>Say that it gives one place to maintain the company baseline, the rules sit on top so branches cannot override them, and a change reaches every branch at the next install. Add the trade-off: a bad template edit affects everyone, so you review and install it carefully.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A template holds shared rules; a policy is based on one template.</li>
<li>Template rules sit on top and are numbered T1, T2; own rules are 1, 2.</li>
<li>Branches cannot reorder or override template rules.</li>
<li>A template edit affects every branch; install and review with care.</li>
</ul></div>
`,hi:`
<p>Ek branch aasan hai. Das branches aasan nahi: agar har branch ki apni hand-written copy hai "DNS allow karo, Telnet block karo, SMC allow karo" ki, to copies alag hone lagti hain. <b>Policy template</b> yeh solve karta hai. Isme woh rules hote hain jo har branch ko chahiye, aur har branch policy uske upar bani hoti hai.</p>

<h3>Analogy: company rule book aur site notice board</h3>
<p>Network Kings ki ek company rule book head office chhapta hai: badge pehenna hai, visitors sign in karenge. Phir har branch apna notice board lagata hai: Pune mein canteen timing, Delhi mein parking note. Branch company book ka ek page nahi faad sakta. Policy ke terms mein, company book template hai aur notice board branch policy.</p>

<h3>Template kya hai</h3>
<p>Policy ka ek type hota hai. <b>Template</b> woh policy hai jis par dusri policies based hoti hain. Normal <b>policy</b> ek template chunti hai aur uske rules inherit karti hai. Template ke rules branch policy ke <b>upar</b> dikhte hain, aur engine unhe pehle evaluate karta hai. Unka number <code>T1</code>, <code>T2</code> aise hota hai, taaki branch ke apne rules (<code>1</code>, <code>2</code>) se alag pehchane jaayein.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Template rules branch rules ke upar">
<rect x="20" y="15" width="260" height="190" rx="10" fill="#ddd6fe"/><text x="150" y="38" text-anchor="middle" class="svg-ink" font-size="14">Template: NK-BASE</text>
<rect x="40" y="50" width="220" height="30" rx="5" fill="#fff"/><text x="50" y="70" class="svg-ink" font-size="12">T1 any to srv-smc  SMC contact  Allow</text>
<rect x="40" y="88" width="220" height="30" rx="5" fill="#fff"/><text x="50" y="108" class="svg-ink" font-size="12">T2 any to any  Telnet  Discard</text>
<text x="150" y="150" text-anchor="middle" class="svg-muted" font-size="12">har branch ke saath shared</text>
<rect x="360" y="15" width="260" height="190" rx="10" fill="#bae6fd"/><text x="490" y="38" text-anchor="middle" class="svg-ink" font-size="14">Policy: NK-PUNE</text>
<rect x="380" y="50" width="220" height="30" rx="5" fill="#ddd6fe"/><text x="390" y="70" class="svg-ink" font-size="12">T1 aur T2 inherited, pehle</text>
<rect x="380" y="88" width="220" height="30" rx="5" fill="#fff"/><text x="390" y="108" class="svg-ink" font-size="12">1 net-staff to any  HTTPS  Allow</text>
<rect x="380" y="126" width="220" height="30" rx="5" fill="#fff"/><text x="390" y="146" class="svg-ink" font-size="12">2 net-staff to any  DNS (UDP)  Allow</text>
<line x1="285" y1="110" x2="355" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="102" text-anchor="middle" class="svg-accent" font-size="12">based on</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Branch T-rules reorder ya edit nahi kar sakta; sirf neeche apne rules add karta hai</text>
</svg><p class="cap">Pune engine ka evaluation order: T1, T2, phir 1, 2, phir implicit discard.</p></div>

<h3>Branches template kyun share karte hain</h3>
<ul>
<li><b>Ek change, kai branches.</b> Template ek baar edit karo; us par based har policy agle install par change utha leti hai.</li>
<li><b>Guaranteed baseline.</b> Template rules upar hote hain, to koi branch rule unke upar nahi rakha ja sakta. Branch galti se company ban ke upar Telnet allow nahi kar sakti.</li>
<li><b>Consistent numbering.</b> Kisi bhi branch ka support engineer T1 ko wahi rule padhta hai.</li>
<li><b>Chhoti policies.</b> Branch policies sirf local cheezein dikhati hain.</li>
</ul>
<p>Yahi idea dusre vendors mein pre-rules ya parent groups ke naam se milta hai. Unka exact behaviour yahan mat le aao: is console mein template rules hamesha pehle aate hain, aur labs yahi check karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Template NK-BASE mein T1 har host ko SMC contact service se <code>srv-smc</code> tak allow karta hai, aur T2 Telnet discard karta hai. Branch policy NK-PUNE uske upar based hai aur rule 1 (staff HTTPS) aur rule 2 (staff DNS) add karti hai. STAFF-PC 203.0.113.80 par Telnet kholta hai. T1: destination srv-smc nahi, skip. T2: match, Discard. Agar koi rule 3 add kare jo staff ko kisi bhi service par allow kare, tab bhi Telnet wahan nahi pahunchta. Baseline engine enforce karta hai, insaan nahi.</p></div>

<h3>Labs kya maangte hain</h3>
<p>Lab <b>fp-policy-1</b> mein aap template se branch policy banate ho, use engine NK-PUNE-FW ko assign karte ho aur install karte ho. Policies page par policy banao, uska template chuno, local rules add karo, phir Install policy bar use karo. Yaad rakho checks sirf installed snapshot padhte hain.</p>
<pre class="out">Engine NK-PUNE-FW   installed policy: NK-PUNE   template: NK-BASE
 T1  any -&gt; srv-smc   SMC contact   Allow
 T2  any -&gt; any       Telnet        Discard
 1   net-staff -&gt; any HTTPS         Allow
 2   net-staff -&gt; any DNS (UDP)     Allow
<span class="hl">Rules compiled: 4   Warnings: 0</span></pre>

<div class="warn"><p><b>Common mistake.</b> Branch problem ko template edit karke fix karna. Template change us par based har branch ko affect karta hai, sirf Pune ko nahi. Change branch policy mein karo, jab tak rule sach mein sabka na ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Template rules policy ke apne rules se pehle evaluate hote hain, aur rule numbers mein T prefix hota hai. Missing template validation error hai jo install block karta hai (chapter nine).</p></div>

<div class="scn"><h4>Telnet rule jo koi override nahi kar paaya</h4><p>Pune ke team lead ne ek purane switch ke liye one-off Telnet allow maanga. Admin ne branch policy mein Allow rule add karke install kiya, par Telnet phir bhi fail hua. Policy match test ne dikhaya ki T2 pehle match hota hai. Company baseline design ke hisaab se kaam kar rahi thi. Lead ko bola gaya ki central security team ko request bheje, jinhone template mein sirf us purane switch ke address ke liye narrow exception add kiya.</p><p><b>Lesson:</b> template rules neeche se override nahi hote; yahi iska point hai.</p></div>
<div class="iv"><p class="q">"Multi-branch network ke liye policy template kyun use karte hain?"</p><p>Bolo ki company baseline maintain karne ki ek jagah milti hai, rules upar hone se branches override nahi kar sakti, aur change agle install par har branch tak pahunchta hai. Trade-off bhi bolo: kharab template edit sabko affect karta hai, isliye review aur careful install karte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template mein shared rules hote hain; policy ek template par based hoti hai.</li>
<li>Template rules upar hote hain aur T1, T2 number paate hain; apne rules 1, 2.</li>
<li>Branch template rules ko reorder ya override nahi kar sakti.</li>
<li>Template edit har branch ko affect karta hai; review aur careful install karo.</li>
</ul></div>
`}};export{e as default};