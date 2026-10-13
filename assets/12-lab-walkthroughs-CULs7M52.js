var e={id:`lab-walkthroughs`,h:{en:`Lab walkthroughs: pn-dg-hier, pn-objects-shadow, pn-local-vs-pushed`,hi:`Lab walkthroughs: pn-dg-hier, pn-objects-shadow, pn-local-vs-pushed`},body:{en:`
<p><b>How to use this chapter.</b> Three labs in this module let you build what the earlier chapters explained. This chapter does not hand you the answers. It shows how to <i>think</i> each lab through, which question to ask first, and which verification command proves you finished. Solve each lab by reasoning, then check your reasoning on the firewall.</p>

<div class="note"><p><b>Honest boundaries.</b> The simulator teaches a tested subset: no web interface, no vsys, no certificates or licences, and templates are flattened. The behaviour you practise (order of evaluation, shadowing, targets, push scope) matches the model taught in this module; for exact limits and defaults, check the documentation for your PAN-OS version.</p></div>

<h3>Lab 1: pn-dg-hier, Shared, parent and child in the right order</h3>
<p><b>Situation.</b> Policy must come from three levels: a company-wide SSH block, a standard allow rule for normal web and DNS traffic, and a final deny that logs. Two firewalls sit in a child group.</p>
<p><b>Think it through.</b></p>
<ol>
<li>For each of the three requirements, ask the placement questions of chapter 2: which level, and pre or post?</li>
<li>Which of the three must come <i>first</i> in the final list, and which <i>last</i>? Use the sandwich from chapter 3 to check that your placement gives that order.</li>
<li>The hierarchy itself is a relationship you must create before rules in the parent can reach the child. Read the task line: it tells you the command family.</li>
<li>Remember the commit-versus-push distinction. After you commit on Panorama, nothing has reached a firewall.</li>
</ol>
<p><b>Prove it.</b> On the firewall, <code>show running security-policy</code> must show your three rules in the intended order; <code>test security-policy-match</code> with an SSH flow names the deciding rule; and a real web test from the PC works while SSH does not.</p>

<h3>Lab 2: pn-objects-shadow, one name, two values</h3>
<p><b>Situation.</b> One Shared rule allows ping to a partner network named by an address object. One firewall reaches that partner over a different range than the others.</p>
<p><b>Think it through.</b></p>
<ol>
<li>Should the rule be copied or should the <i>object</i> differ? Chapter 6 gives the principle that keeps the rule single.</li>
<li>Where must the different object live so only one firewall's group resolves it differently? Which location do the other two groups use?</li>
<li>How many device groups do you have to push for the result to be correct everywhere, and why?</li>
</ol>
<p><b>Prove it.</b> <code>show config pushed-shared-policy</code> on each firewall prints the address block it received. Compare the value on the single different firewall with the value on the other two.</p>

<h3>Lab 3: pn-local-vs-pushed, pre-rules, local rules, post-rules and targets</h3>
<p><b>Situation.</b> Block outbound SSH everywhere except one site that has an approved vendor and a local rule, and deny and log everything left over after all local rules.</p>
<p><b>Think it through.</b></p>
<ol>
<li>Which site must not receive the block rule? Is it better to aim the rule at everyone-but-that-site, or at the sites that need it? Think about what happens when a new firewall joins the group (chapter 7).</li>
<li>Where does the final deny belong so that the vendor's local rule is reached first (chapter 4)?</li>
<li>Look at the starting policy on both firewalls with <code>show running security-policy</code> before you change anything: what is already local?</li>
</ol>
<p><b>Prove it.</b> Compare the running lists of both firewalls; a firewall that does not receive a targeted rule has no trace of it in <code>show config pushed-shared-policy</code>. Finish with real SSH and web tests from each PC.</p>

<table class="tbl"><tr><th>Lab</th><th>Main idea tested</th><th>Best proof command</th></tr>
<tr><td>pn-dg-hier</td><td>Hierarchy and order across levels</td><td>show running security-policy</td></tr>
<tr><td>pn-objects-shadow</td><td>Object override per device group</td><td>show config pushed-shared-policy</td></tr>
<tr><td>pn-local-vs-pushed</td><td>Pre, local, post and targets</td><td>show config pushed-shared-policy on each firewall</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Lab method">
<rect x="10" y="25" width="140" height="55" rx="8" fill="#ddd6fe"/><text x="80" y="48" text-anchor="middle" class="svg-ink" font-size="12">Read the brief</text><text x="80" y="66" text-anchor="middle" class="svg-muted" font-size="12">list requirements</text>
<rect x="170" y="25" width="140" height="55" rx="8" fill="#bae6fd"/><text x="240" y="48" text-anchor="middle" class="svg-ink" font-size="12">Place each one</text><text x="240" y="66" text-anchor="middle" class="svg-muted" font-size="12">level, pre or post</text>
<rect x="330" y="25" width="140" height="55" rx="8" fill="#bbf7d0"/><text x="400" y="48" text-anchor="middle" class="svg-ink" font-size="12">Commit, then push</text><text x="400" y="66" text-anchor="middle" class="svg-muted" font-size="12">right group</text>
<rect x="490" y="25" width="140" height="55" rx="8" fill="#fde68a"/><text x="560" y="48" text-anchor="middle" class="svg-ink" font-size="12">Verify on firewall</text><text x="560" y="66" text-anchor="middle" class="svg-muted" font-size="12">list, test, pushed</text>
<line x1="150" y1="52" x2="170" y2="52" stroke="#64748b"/><line x1="310" y1="52" x2="330" y2="52" stroke="#64748b"/><line x1="470" y1="52" x2="490" y2="52" stroke="#64748b"/>
</svg><p class="cap">The same four-step method works for all three labs.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Committing but not pushing; pushing the wrong device group; judging success from "push completed" instead of reading the firewall; skipping the starting-state check on the firewall.</p></div>
<div class="exam"><p><b>Exam trap.</b> The lab questions often ask "which rule decides this flow" or "which value does this firewall use". Both are answered by a command on the firewall, not by reading Panorama's configuration.</p></div>

<div class="scn"><h4>Reasoning before typing</h4><p>Two trainees solved the same lab. One typed commands from memory and spent twenty minutes debugging an order problem. The other wrote three lines first: which level, pre or post, which group to push. The second finished in half the time and could explain every command.</p><p><b>Lesson:</b> a two-minute plan beats twenty minutes of debugging.</p></div>

<div class="iv"><p class="q">"Walk me through how you would roll out a new company-wide block rule to many branches."</p><p>I place it in Shared pre so nobody below overrides it, give it a clear name and logging, commit on Panorama, push the affected device groups, and verify on one firewall in each group with the running list and a policy-match test. I check for name clashes with local rules and confirm a user-side test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Plan before typing: list each requirement, place it by level and by pre or post.</li>
<li>Remember commit versus push, and push the right group.</li>
<li>Use running list, test match and pushed policy to prove the result.</li>
<li>Check starting state first so you know what is already local.</li>
<li>Reasoning beats memorising commands.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ko kaise use karein.</b> Is module ke teen labs aapko wo banane dete hain jo pichhle chapters ne samjhaya. Ye chapter aapko answers nahi deta. Ye dikhata hai ki har lab ko <i>kaise sochna</i> hai, pehla sawal kya puchna hai, aur kaunsa verification command prove karta hai ki aap khatam kar chuke ho. Har lab reasoning se solve karo, phir firewall par apni reasoning check karo.</p>

<div class="note"><p><b>Honest boundaries.</b> Simulator ek tested subset sikhata hai: web interface nahi, vsys nahi, certificates ya licences nahi, aur templates flattened hain. Jo behaviour aap practise karte ho (evaluation order, shadowing, targets, push scope) wo is module ke model se match karta hai; exact limits aur defaults ke liye apne PAN-OS version ki documentation check karo.</p></div>

<h3>Lab 1: pn-dg-hier, Shared, parent aur child sahi order mein</h3>
<p><b>Situation.</b> Policy teen levels se aani chahiye: company-wide SSH block, normal web aur DNS traffic ke liye standard allow rule, aur logging wali final deny. Do firewalls child group mein hain.</p>
<p><b>Sochne ka tareeka.</b></p>
<ol>
<li>Teeno requirements ke liye chapter 2 ke placement sawal pucho: kaunsa level, aur pre ya post?</li>
<li>Teeno mein se kaunsi final list mein <i>sabse pehle</i> aani chahiye, aur kaunsi <i>sabse aakhir</i> mein? Chapter 3 ke sandwich se check karo ki aapki placement wahi order deti hai.</li>
<li>Hierarchy khud ek relationship hai jo parent ki rules child tak pahunchne se pehle banani padti hai. Task line padho: wo command family batati hai.</li>
<li>Commit versus push ka fark yaad rakho. Panorama par commit ke baad firewall tak kuch nahi pahuncha.</li>
</ol>
<p><b>Prove karo.</b> Firewall par <code>show running security-policy</code> mein teeno rules intended order mein dikhni chahiye; SSH flow ke saath <code>test security-policy-match</code> deciding rule ka naam deta hai; aur PC se real web test chalta hai jabki SSH nahi.</p>

<h3>Lab 2: pn-objects-shadow, ek naam, do values</h3>
<p><b>Situation.</b> Ek Shared rule address object se naam wale partner network tak ping allow karti hai. Ek firewall us partner tak baaki se alag range se pahunchta hai.</p>
<p><b>Sochne ka tareeka.</b></p>
<ol>
<li>Rule copy karni chahiye ya <i>object</i> alag hona chahiye? Chapter 6 wo principle deta hai jo rule ko ek rakhta hai.</li>
<li>Alag object kahan rehna chahiye taaki sirf ek firewall ka group use alag resolve kare? Baaki do groups kaunsi location use karte hain?</li>
<li>Result sab jagah sahi hone ke liye kitne device groups push karne padenge, aur kyun?</li>
</ol>
<p><b>Prove karo.</b> Har firewall par <code>show config pushed-shared-policy</code> wo address block print karta hai jo use mila. Akele alag firewall ki value ko baaki do ki value se compare karo.</p>

<h3>Lab 3: pn-local-vs-pushed, pre-rules, local rules, post-rules aur targets</h3>
<p><b>Situation.</b> Outbound SSH har jagah block, sirf us site ko chhodkar jiske paas approved vendor aur local rule hai, aur saari local rules ke baad jo bache use deny aur log karo.</p>
<p><b>Sochne ka tareeka.</b></p>
<ol>
<li>Kaunsi site ko block rule nahi milni chahiye? Behtar hai rule ko "us site ke alawa sab" par aim karna ya un sites par jinhe chahiye? Socho ki naya firewall group mein aaye to kya hoga (chapter 7).</li>
<li>Final deny kahan belong karti hai taaki vendor ki local rule pehle reach ho (chapter 4)?</li>
<li>Kuch badalne se pehle dono firewalls par <code>show running security-policy</code> se starting policy dekho: pehle se kya local hai?</li>
</ol>
<p><b>Prove karo.</b> Dono firewalls ki running lists compare karo; jis firewall ko targeted rule nahi milti uske <code>show config pushed-shared-policy</code> mein uska koi nishaan nahi hota. Har PC se real SSH aur web tests ke saath khatam karo.</p>

<table class="tbl"><tr><th>Lab</th><th>Main idea jo test hota hai</th><th>Best proof command</th></tr>
<tr><td>pn-dg-hier</td><td>Levels ke beech hierarchy aur order</td><td>show running security-policy</td></tr>
<tr><td>pn-objects-shadow</td><td>Device group ke hisaab se object override</td><td>show config pushed-shared-policy</td></tr>
<tr><td>pn-local-vs-pushed</td><td>Pre, local, post aur targets</td><td>har firewall par show config pushed-shared-policy</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Lab method">
<rect x="10" y="25" width="140" height="55" rx="8" fill="#ddd6fe"/><text x="80" y="48" text-anchor="middle" class="svg-ink" font-size="12">Brief padho</text><text x="80" y="66" text-anchor="middle" class="svg-muted" font-size="12">requirements list karo</text>
<rect x="170" y="25" width="140" height="55" rx="8" fill="#bae6fd"/><text x="240" y="48" text-anchor="middle" class="svg-ink" font-size="12">Har ek ko place karo</text><text x="240" y="66" text-anchor="middle" class="svg-muted" font-size="12">level, pre ya post</text>
<rect x="330" y="25" width="140" height="55" rx="8" fill="#bbf7d0"/><text x="400" y="48" text-anchor="middle" class="svg-ink" font-size="12">Commit, phir push</text><text x="400" y="66" text-anchor="middle" class="svg-muted" font-size="12">sahi group</text>
<rect x="490" y="25" width="140" height="55" rx="8" fill="#fde68a"/><text x="560" y="48" text-anchor="middle" class="svg-ink" font-size="12">Firewall par verify</text><text x="560" y="66" text-anchor="middle" class="svg-muted" font-size="12">list, test, pushed</text>
<line x1="150" y1="52" x2="170" y2="52" stroke="#64748b"/><line x1="310" y1="52" x2="330" y2="52" stroke="#64748b"/><line x1="470" y1="52" x2="490" y2="52" stroke="#64748b"/>
</svg><p class="cap">Wahi chaar-step method teeno labs mein chalta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Commit karna par push nahi; galat device group push karna; "push completed" se success judge karna, firewall padhne ki jagah; firewall par starting-state check skip karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Lab questions aksar puchte hain "ye flow kaunsi rule decide karti hai" ya "ye firewall kaunsi value use karta hai". Dono ka jawab firewall par command se milta hai, Panorama ki configuration padhne se nahi.</p></div>

<div class="scn"><h4>Type karne se pehle reasoning</h4><p>Do trainees ne wahi lab solve kiya. Ek ne yaad se commands type kiye aur order problem debug karne mein bees minute lagaye. Doosre ne pehle teen lines likhi: kaunsa level, pre ya post, kaunsa group push karna hai. Doosra aadhe time mein khatam hua aur har command samjha sakta tha.</p><p><b>Lesson:</b> do minute ka plan bees minute ki debugging se behtar hai.</p></div>

<div class="iv"><p class="q">"Kai branches par nayi company-wide block rule kaise roll out karoge, batao."</p><p>Use Shared pre mein rakhta hoon taaki neeche koi override na kare, clear naam aur logging deta hoon, Panorama par commit karta hoon, affected device groups push karta hoon, aur har group ke ek firewall par running list aur policy-match test se verify karta hoon. Local rules ke saath name clash check karta hoon aur user-side test confirm karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type karne se pehle plan: har requirement list karo, level aur pre ya post se place karo.</li>
<li>Commit versus push yaad rakho, aur sahi group push karo.</li>
<li>Result prove karne ke liye running list, test match aur pushed policy use karo.</li>
<li>Pehle starting state check karo taaki pata ho pehle se kya local hai.</li>
<li>Reasoning commands rattne se behtar hai.</li>
</ul></div>
`}};export{e as default};