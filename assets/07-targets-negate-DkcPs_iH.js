var e={id:`targets-negate`,h:{en:`Targets and negate: aiming a rule, and why to use it sparingly`,hi:`Targets aur negate: rule ko aim karna, aur kam kyun use karna`},body:{en:`
<p><b>Analogy.</b> A school notice says "Class 9 only" or "everyone except Class 9". The notice is the same sheet of paper; what changes is who has to read it. A <b>target</b> on a Panorama rule works like that: the rule stays in the device group, but it is sent only to some of the firewalls in the group.</p>

<h3>What a target does</h3>
<p>Normally a rule in a device group goes to <b>every firewall in that group</b> (and in child groups below). With a target you narrow this:</p>
<table class="tbl"><tr><th>Setting</th><th>Meaning</th><th>Firewalls that receive the rule</th></tr>
<tr><td>No target</td><td>Default</td><td>Every firewall in the group</td></tr>
<tr><td><code>target devices &lt;serial&gt;</code></td><td>Only the listed firewalls</td><td>Just those</td></tr>
<tr><td><code>target negate yes</code> plus <code>target devices &lt;serial&gt;</code></td><td>Everyone except the listed firewalls</td><td>All members minus those</td></tr>
</table>
<p>A targeted rule is not "disabled" on the other firewalls. It is simply <b>absent</b>: it is not pushed, so <code>show running security-policy</code> on a non-target firewall has no trace of it. That is the clean way to read it, and it is also the cause of most confusion.</p>

<h3>Syntax (illustration)</h3>
<pre class="code"><span class="c">! Aim a rule at one firewall only (different rule from the lab)</span>
admin@NK-PANORAMA# set device-group NK-BRANCHES pre-rulebase security rules Allow-Lab-Scan from trust to untrust source any destination any application any service any action allow
admin@NK-PANORAMA# set device-group NK-BRANCHES pre-rulebase security rules Allow-Lab-Scan target devices 0079185321121
<span class="c">! Aim at every firewall except one: add negate</span>
admin@NK-PANORAMA# set device-group NK-BRANCHES pre-rulebase security rules Allow-Lab-Scan target negate yes
admin@NK-PANORAMA# commit</pre>
<p>The second block flips the meaning of the same serial: now the rule goes to every member <i>except</i> that firewall. One word changes who gets a rule, so read targets carefully in reviews.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Target and negate">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="13">target devices FW-A</text>
<rect x="30" y="28" width="90" height="34" rx="6" fill="#bbf7d0"/><text x="75" y="50" text-anchor="middle" class="svg-ink" font-size="12">FW-A gets it</text>
<rect x="130" y="28" width="90" height="34" rx="6" fill="#e2e8f0"/><text x="175" y="50" text-anchor="middle" class="svg-muted" font-size="12">FW-B absent</text>
<rect x="230" y="28" width="90" height="34" rx="6" fill="#e2e8f0"/><text x="275" y="50" text-anchor="middle" class="svg-muted" font-size="12">FW-C absent</text>
<text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="13">negate yes + FW-A</text>
<rect x="350" y="28" width="90" height="34" rx="6" fill="#e2e8f0"/><text x="395" y="50" text-anchor="middle" class="svg-muted" font-size="12">FW-A absent</text>
<rect x="450" y="28" width="90" height="34" rx="6" fill="#bbf7d0"/><text x="495" y="50" text-anchor="middle" class="svg-ink" font-size="12">FW-B gets it</text>
<rect x="550" y="28" width="85" height="34" rx="6" fill="#bbf7d0"/><text x="592" y="50" text-anchor="middle" class="svg-ink" font-size="12">FW-C gets it</text>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Targets change who receives the rule, not its position in the order</text>
<text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">Where it is received, it still sits at its normal pre or post place.</text>
</svg><p class="cap">Left: only FW-A. Right: everyone except FW-A.</p></div>

<h3>Why use it sparingly</h3>
<ul>
<li><b>Hidden exceptions.</b> Two firewalls in the same group no longer have the same policy, and nothing in the group name tells you so.</li>
<li><b>Negate is easy to misread.</b> "Everyone except X" also covers firewalls added later; the rule silently reaches them.</li>
<li><b>Often a group is clearer.</b> If three firewalls always need the exception, a child group says so openly. A target is best for a short-lived or one-off need.</li>
<li><b>Local rules may be better.</b> If one site owns the exception and the rest follow the standard, a local rule on that site with a central deny above it requires no target at all. Choose based on who should own the exception.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Using the firewall's hostname instead of its serial in the target; leaving a targeted rule in place after the project ends; adding a negate rule and later onboarding a firewall that should not have received it.</p></div>
<div class="exam"><p><b>Exam trap.</b> A targeted rule is <b>absent</b> from non-target firewalls, not present-but-disabled. To check, look at the pushed policy on a non-target firewall: the rule name is not there.</p></div>

<div class="scn"><h4>The firewall added next quarter</h4><p>A rule that allowed a risky tool had target negate on the one site that should not have it. A new site was onboarded into the same group and received the risky rule because it was not on the exclusion list. A quarterly audit of "rules with targets" caught it.</p><p><b>Lesson:</b> list your targeted rules, review them every quarter, and prefer a group when the exception is permanent.</p></div>

<div class="iv"><p class="q">"What is a target on a Panorama rule, and when is it a bad idea?"</p><p>It restricts which firewalls in the device group receive the rule; with negate it applies to all except the listed ones. It is a bad idea for permanent differences between sites, where a child group or a local rule is clearer, because hidden exceptions make troubleshooting and audits harder.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A rule goes to every firewall in its group unless a target narrows it.</li>
<li>Negate flips the target: everyone except the listed firewalls.</li>
<li>A targeted rule is absent from non-target firewalls, not disabled.</li>
<li>Use targets sparingly; prefer a child group for permanent differences.</li>
<li>Audit targeted rules regularly, especially negate rules after onboarding new sites.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> School notice kehti hai "sirf Class 9" ya "Class 9 ke alawa sab". Notice wahi kagaz hai; badalta ye hai ki kise padhna hai. Panorama rule par <b>target</b> aise hi kaam karta hai: rule device group mein rehti hai, lekin group ke sirf kuch firewalls ko bheji jati hai.</p>

<h3>Target kya karta hai</h3>
<p>Normally device group ki rule <b>us group ke har firewall</b> ko jati hai (aur neeche ke child groups ko bhi). Target se aap ise narrow karte ho:</p>
<table class="tbl"><tr><th>Setting</th><th>Matlab</th><th>Rule kin firewalls ko milti hai</th></tr>
<tr><td>Koi target nahi</td><td>Default</td><td>Group ka har firewall</td></tr>
<tr><td><code>target devices &lt;serial&gt;</code></td><td>Sirf listed firewalls</td><td>Bas wahi</td></tr>
<tr><td><code>target negate yes</code> aur <code>target devices &lt;serial&gt;</code></td><td>Listed firewalls ko chhodkar sab</td><td>Saare members minus wahi</td></tr>
</table>
<p>Targeted rule doosre firewalls par "disabled" nahi hoti. Wo bas <b>absent</b> hoti hai: push hi nahi hoti, isliye non-target firewall ke <code>show running security-policy</code> mein uska koi nishaan nahi hota. Padhne ka saaf tareeka yahi hai, aur zyadatar confusion ki wajah bhi yahi hai.</p>

<h3>Syntax (illustration)</h3>
<pre class="code"><span class="c">! Rule ko sirf ek firewall par aim karo (lab se alag rule)</span>
admin@NK-PANORAMA# set device-group NK-BRANCHES pre-rulebase security rules Allow-Lab-Scan from trust to untrust source any destination any application any service any action allow
admin@NK-PANORAMA# set device-group NK-BRANCHES pre-rulebase security rules Allow-Lab-Scan target devices 0079185321121
<span class="c">! Ek ko chhodkar sab par aim karo: negate jodo</span>
admin@NK-PANORAMA# set device-group NK-BRANCHES pre-rulebase security rules Allow-Lab-Scan target negate yes
admin@NK-PANORAMA# commit</pre>
<p>Doosra block usi serial ka matlab ulat deta hai: ab rule us firewall ko <i>chhodkar</i> har member ko jati hai. Ek shabd badalta hai ki rule kise milti hai, isliye reviews mein targets dhyan se padho.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Target and negate">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="13">target devices FW-A</text>
<rect x="30" y="28" width="90" height="34" rx="6" fill="#bbf7d0"/><text x="75" y="50" text-anchor="middle" class="svg-ink" font-size="12">FW-A ko milti</text>
<rect x="130" y="28" width="90" height="34" rx="6" fill="#e2e8f0"/><text x="175" y="50" text-anchor="middle" class="svg-muted" font-size="12">FW-B absent</text>
<rect x="230" y="28" width="90" height="34" rx="6" fill="#e2e8f0"/><text x="275" y="50" text-anchor="middle" class="svg-muted" font-size="12">FW-C absent</text>
<text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="13">negate yes + FW-A</text>
<rect x="350" y="28" width="90" height="34" rx="6" fill="#e2e8f0"/><text x="395" y="50" text-anchor="middle" class="svg-muted" font-size="12">FW-A absent</text>
<rect x="450" y="28" width="90" height="34" rx="6" fill="#bbf7d0"/><text x="495" y="50" text-anchor="middle" class="svg-ink" font-size="12">FW-B ko milti</text>
<rect x="550" y="28" width="85" height="34" rx="6" fill="#bbf7d0"/><text x="592" y="50" text-anchor="middle" class="svg-ink" font-size="12">FW-C ko milti</text>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Target badalta hai ki rule kise milti hai, order mein uski jagah nahi</text>
<text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">Jahan milti hai wahan wo apni normal pre ya post jagah par baithti hai.</text>
</svg><p class="cap">Left: sirf FW-A. Right: FW-A ko chhodkar sab.</p></div>

<h3>Kam kyun use karna</h3>
<ul>
<li><b>Hidden exceptions.</b> Ek hi group ke do firewalls ki policy ab same nahi, aur group ka naam ye nahi batata.</li>
<li><b>Negate galat padha ja sakta hai.</b> "X ko chhodkar sab" baad mein add hue firewalls ko bhi cover karta hai; rule chupchaap unhe mil jati hai.</li>
<li><b>Aksar group zyada saaf hota hai.</b> Agar teen firewalls ko hamesha exception chahiye, to child group khulkar kehta hai. Target short-lived ya one-off zaroorat ke liye best hai.</li>
<li><b>Local rule behtar ho sakti hai.</b> Agar ek site exception ki owner hai aur baaki standard follow karte hain, to us site par local rule aur upar central deny bina target ke kaam karti hai. Ye is par choose karo ki exception kiski honi chahiye.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Target mein serial ki jagah hostname use karna; project khatam hone ke baad bhi targeted rule chhod dena; negate rule jodna aur baad mein aisa firewall onboard karna jise wo nahi milni chahiye thi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Targeted rule non-target firewalls se <b>absent</b> hoti hai, present-but-disabled nahi. Check karne ke liye non-target firewall ki pushed policy dekho: rule ka naam wahan nahi hota.</p></div>

<div class="scn"><h4>Agle quarter add hua firewall</h4><p>Ek risky tool allow karne wali rule par us ek site ke liye target negate tha jise wo nahi milni chahiye thi. Usi group mein naya site onboard hua aur use risky rule mil gayi kyunki wo exclusion list mein nahi tha. Quarterly "targets wali rules" audit ne ise pakda.</p><p><b>Lesson:</b> targeted rules ki list rakho, har quarter review karo, aur exception permanent ho to group prefer karo.</p></div>

<div class="iv"><p class="q">"Panorama rule par target kya hai, aur kab bura idea hai?"</p><p>Ye restrict karta hai ki device group ke kaunse firewalls rule receive karein; negate ke saath listed ke alawa sab par lagu hota hai. Sites ke permanent differences ke liye bura idea hai, wahan child group ya local rule zyada saaf hai, kyunki hidden exceptions troubleshooting aur audits ko mushkil banate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule apne group ke har firewall ko jati hai jab tak target narrow na kare.</li>
<li>Negate target ko ulat deta hai: listed firewalls ke alawa sab.</li>
<li>Targeted rule non-target firewalls se absent hoti hai, disabled nahi.</li>
<li>Targets kam use karo; permanent differences ke liye child group prefer karo.</li>
<li>Targeted rules ka regular audit karo, khaaskar naye sites onboard hone ke baad negate rules ka.</li>
</ul></div>
`}};export{e as default};