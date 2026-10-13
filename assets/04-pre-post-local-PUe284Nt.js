var e={id:`pre-post-local`,h:{en:`Pre-rules, post-rules and local rules: what each is for`,hi:`Pre-rules, post-rules aur local rules: har ek kis kaam ki`},body:{en:`
<p><b>Analogy.</b> A school has rules from the education board (always first), rules from the principal for the whole school, rules from each teacher in the classroom, and finally a "if nothing else applies, ask the principal" rule. The board's rules cannot be overridden by the teacher. The teacher's classroom rules cannot be spoiled by a vague catch-all at the end. Pre-rules, local rules and post-rules map to exactly this idea.</p>

<h3>Three places to put a rule</h3>
<table class="tbl"><tr><th>Where</th><th>Who owns it</th><th>Position</th><th>Typical use</th></tr>
<tr><td><b>Pre-rule</b></td><td>Central team, on Panorama</td><td>Above local rules</td><td>Must-have decisions: block risky applications, allow management and monitoring traffic, allow DNS and NTP for everyone</td></tr>
<tr><td><b>Local rule</b></td><td>Site engineer, on the firewall</td><td>Between pre and post</td><td>Site-specific needs: a printer VLAN, a local vendor, a lab</td></tr>
<tr><td><b>Post-rule</b></td><td>Central team, on Panorama</td><td>Below local rules</td><td>Safety net: final deny with logging, a default allow to the Internet for sites that have nothing else</td></tr>
</table>
<p>In the lab you create a pre-rule with <code>pre-rulebase</code> and a post-rule with <code>post-rulebase</code> in the command. The rest of the rule is the same:</p>
<pre class="code">admin@NK-PANORAMA# set device-group NK-BRANCHES pre-rulebase security rules Block-Telnet-Out from any to any source any destination any application telnet service application-default action deny
admin@NK-PANORAMA# set device-group NK-BRANCHES post-rulebase security rules Deny-Rest from any to any source any destination any application any service any action deny
admin@NK-PANORAMA# commit</pre>
<p>Both rule types can also be created under <code>shared</code>, which makes them apply to every device group. After a push, each firewall merges the pieces into its running policy as shown in the previous chapter.</p>

<h3>Choosing: three questions</h3>
<ol>
<li><b>Must this decision override anything a site engineer could type?</b> Use a pre-rule. Example: block a protocol the company bans.</li>
<li><b>Is this a default that a site may need to refine?</b> Use a post-rule. Example: a final deny; a local rule above it can allow what that site needs before the deny catches it.</li>
<li><b>Is it true for one firewall only and managed by the site?</b> It can stay a local rule. Panorama does not touch it.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Pre local post sandwich">
<rect x="20" y="10" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="115" y="36" text-anchor="middle" class="svg-ink" font-size="13">Pre-rules</text><text x="115" y="54" text-anchor="middle" class="svg-muted" font-size="12">central, strict, first</text>
<rect x="225" y="10" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Local rules</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">site-owned, flexible</text>
<rect x="430" y="10" width="190" height="60" rx="8" fill="#bae6fd"/><text x="525" y="36" text-anchor="middle" class="svg-ink" font-size="13">Post-rules</text><text x="525" y="54" text-anchor="middle" class="svg-muted" font-size="12">central, catch-all, last</text>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Traffic is tested left to right</text>
<line x1="120" y1="95" x2="520" y2="95" stroke="#64748b"/><polygon points="520,90 532,95 520,100" fill="#64748b"/>
</svg><p class="cap">Pre decides first, local handles the site, post catches what is left.</p></div>

<div class="eg"><p><b>Worked example.</b> The company bans Telnet everywhere: a Shared pre-rule. Delhi has an approved vendor who needs SSH out: a local rule on the Delhi firewall. The company wants anything not allowed by any rule to be denied and logged: a post-rule. Delhi's local rule sits above the post-rule, so the vendor works; Pune has no local rule, so SSH falls to the post-rule deny. One set of central rules, one site exception, no conflict.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting the final "deny any" as a pre-rule (it would block everything the local rules and later rules were meant to allow); putting a company ban as a post-rule (a local rule above it could then allow what the company banned); assuming Panorama can see or edit local rules (it cannot; they live on the firewall).</p></div>
<div class="exam"><p><b>Exam trap.</b> A "deny any" at the end of the <i>pre</i> rulebase makes every local rule and every post-rule unreachable. The safe place for a catch-all deny is the post-rulebase.</p></div>

<div class="scn"><h4>The catch-all in the wrong place</h4><p>A new administrator wanted every site to end with a logged deny and added a deny-any pre-rule in the parent group. After the push, three sites lost access to their local print servers and the Delhi vendor link. Local rules existed on those firewalls but were never reached because traffic hit the pre-rule deny first. Moving the rule into the post-rulebase restored the local rules and kept the safety net.</p><p><b>Lesson:</b> a final deny belongs in the post-rulebase.</p></div>

<div class="iv"><p class="q">"Where would you put a global block rule, a regional exception and a final deny?"</p><p>The global block as a Shared pre-rule so nobody below can override it, the regional exception as a rule in the child group or a local rule if the site owns it, and the final deny as a post-rule so local rules and regional rules are reached first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pre-rules are central and run before local rules; post-rules are central and run after.</li>
<li>Local rules are typed on the firewall and sit between pre and post.</li>
<li>Use pre-rules for must-have decisions, post-rules for defaults and catch-alls.</li>
<li>Never put a deny-any in a pre-rulebase unless you really mean it.</li>
<li>Shared pre and post rules apply to every device group.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> School mein education board ke rules (hamesha pehle), principal ke rules poore school ke liye, har teacher ke classroom rules, aur aakhir mein "agar kuch aur lagu na ho to principal se pucho" wali rule. Board ke rules ko teacher override nahi kar sakta. Teacher ke classroom rules ko end ki vague catch-all kharab nahi kar sakti. Pre-rules, local rules aur post-rules bilkul isi idea se map hote hain.</p>

<h3>Rule rakhne ki teen jagah</h3>
<table class="tbl"><tr><th>Kahan</th><th>Kiski hai</th><th>Position</th><th>Typical use</th></tr>
<tr><td><b>Pre-rule</b></td><td>Central team, Panorama par</td><td>Local rules ke upar</td><td>Must-have decisions: risky applications block, management aur monitoring traffic allow, sabke liye DNS aur NTP allow</td></tr>
<tr><td><b>Local rule</b></td><td>Site engineer, firewall par</td><td>Pre aur post ke beech</td><td>Site-specific zarooratein: printer VLAN, local vendor, lab</td></tr>
<tr><td><b>Post-rule</b></td><td>Central team, Panorama par</td><td>Local rules ke neeche</td><td>Safety net: logging ke saath final deny, jin sites ke paas kuch aur nahi unke liye Internet ka default allow</td></tr>
</table>
<p>Lab mein pre-rule <code>pre-rulebase</code> se aur post-rule <code>post-rulebase</code> se banti hai. Baaki rule same hai:</p>
<pre class="code">admin@NK-PANORAMA# set device-group NK-BRANCHES pre-rulebase security rules Block-Telnet-Out from any to any source any destination any application telnet service application-default action deny
admin@NK-PANORAMA# set device-group NK-BRANCHES post-rulebase security rules Deny-Rest from any to any source any destination any application any service any action deny
admin@NK-PANORAMA# commit</pre>
<p>Dono rule types <code>shared</code> ke neeche bhi ban sakte hain, jisse wo har device group par lagu hote hain. Push ke baad har firewall tukdon ko apni running policy mein merge karta hai, jaisa pichhle chapter mein dikhaya.</p>

<h3>Chunna: teen sawal</h3>
<ol>
<li><b>Kya ye decision site engineer ke type kiye kisi bhi cheez ko override kare?</b> Pre-rule use karo. Example: company ne jo protocol ban kiya use block karo.</li>
<li><b>Kya ye default hai jise site ko refine karna pad sakta hai?</b> Post-rule use karo. Example: final deny; uske upar local rule wo allow kar sakti hai jo us site ko chahiye, deny pakadne se pehle.</li>
<li><b>Kya ye sirf ek firewall ke liye sach hai aur site manage karti hai?</b> Ye local rule reh sakti hai. Panorama ise chhoota nahi.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Pre local post sandwich">
<rect x="20" y="10" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="115" y="36" text-anchor="middle" class="svg-ink" font-size="13">Pre-rules</text><text x="115" y="54" text-anchor="middle" class="svg-muted" font-size="12">central, strict, pehle</text>
<rect x="225" y="10" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Local rules</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">site ki, flexible</text>
<rect x="430" y="10" width="190" height="60" rx="8" fill="#bae6fd"/><text x="525" y="36" text-anchor="middle" class="svg-ink" font-size="13">Post-rules</text><text x="525" y="54" text-anchor="middle" class="svg-muted" font-size="12">central, catch-all, aakhir mein</text>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Traffic left se right test hota hai</text>
<line x1="120" y1="95" x2="520" y2="95" stroke="#64748b"/><polygon points="520,90 532,95 520,100" fill="#64748b"/>
</svg><p class="cap">Pre pehle decide karti hai, local site sambhalti hai, post bachi hui cheez pakadti hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Company Telnet har jagah ban karti hai: Shared pre-rule. Delhi ke ek approved vendor ko SSH out chahiye: Delhi firewall par local rule. Company chahti hai ki jo kisi rule se allow nahi hua wo deny aur log ho: post-rule. Delhi ki local rule post-rule ke upar hai, isliye vendor chalta hai; Pune ke paas local rule nahi, to SSH post-rule deny par girta hai. Central rules ka ek set, ek site exception, koi conflict nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Final "deny any" ko pre-rule banana (ye wo sab block kar dega jo local rules aur baad ki rules allow karne wali thi); company ban ko post-rule banana (uske upar local rule wo allow kar sakti hai jo company ne ban kiya); sochna ki Panorama local rules dekh ya edit kar sakta hai (nahi kar sakta; wo firewall par rehti hain).</p></div>
<div class="exam"><p><b>Exam trap.</b> <i>Pre</i> rulebase ke end par "deny any" har local rule aur har post-rule ko unreachable bana deta hai. Catch-all deny ki safe jagah post-rulebase hai.</p></div>

<div class="scn"><h4>Galat jagah par catch-all</h4><p>Ek naye administrator ne chaha ki har site logged deny par khatam ho aur parent group mein deny-any pre-rule jod di. Push ke baad teen sites ne apne local print servers aur Delhi vendor link kho diye. In firewalls par local rules thi par kabhi reach nahi hui kyunki traffic pehle pre-rule deny se takra gaya. Rule ko post-rulebase mein le jaane se local rules wapas chali aur safety net bhi raha.</p><p><b>Lesson:</b> final deny post-rulebase mein jaati hai.</p></div>

<div class="iv"><p class="q">"Global block rule, regional exception aur final deny kahan rakhoge?"</p><p>Global block Shared pre-rule ki tarah taaki neeche koi override na kare, regional exception child group ki rule ya local rule agar site owner hai, aur final deny post-rule taaki local aur regional rules pehle reach hon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pre-rules central hain aur local rules se pehle chalti hain; post-rules central hain aur baad mein.</li>
<li>Local rules firewall par type hoti hain aur pre aur post ke beech baithti hain.</li>
<li>Must-have decisions ke liye pre-rules, defaults aur catch-alls ke liye post-rules.</li>
<li>Pre-rulebase mein deny-any tab tak mat daalo jab tak sach mein na chahiye.</li>
<li>Shared pre aur post rules har device group par lagu hoti hain.</li>
</ul></div>
`}};export{e as default};