var e={id:`name-clashes`,h:{en:`Name clashes with local configuration`,hi:`Local configuration ke saath name clashes`},body:{en:`
<p>Panorama pushes rules and objects to firewalls that may already have their own local configuration. When a pushed name collides with a local name, the push for that firewall stops. This chapter explains why, how to recognise it, and how to fix it without breaking local intent.</p>

<h3>Analogy: two files, one name</h3>
<p>You copy a folder from a colleague into your documents. Inside is "Report.docx", and you already have a different "Report.docx". The computer refuses to merge them silently, because one would overwrite the other. A firewall treats rule names the same way.</p>

<h3>How rules sit together on a firewall</h3>
<p>On the firewall the final order is: Shared pre, parent device group pre, child pre, <b>local rules</b>, child post, parent post, Shared post, then default rules. Pushed and local rules live in one list, so <b>rule names must be unique across pushed and local rules</b>. NAT pre and post rules follow the same pattern.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Rule order">
<rect x="20" y="10" width="600" height="22" rx="4" fill="#fed7aa"/><text x="320" y="26" text-anchor="middle" class="svg-ink" font-size="12">Shared pre, parent pre, child pre (pushed)</text>
<rect x="20" y="38" width="600" height="22" rx="4" fill="#bbf7d0"/><text x="320" y="54" text-anchor="middle" class="svg-ink" font-size="12">Local rules (configured on the firewall)</text>
<rect x="20" y="66" width="600" height="22" rx="4" fill="#fed7aa"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="12">Child post, parent post, Shared post (pushed)</text>
<rect x="20" y="94" width="600" height="22" rx="4" fill="#e2e8f0"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="12">Default rules</text>
<text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">One namespace for all of them</text>
</svg><p class="cap">Local rules sit between pre and post rules. Names are shared across the whole list.</p></div>

<h3>What a clash looks like</h3>
<pre class="out">0079134988264     NK-DELHI-PA       <span class="hl">commit failed</span>: rulebase -&gt; security -&gt; rules -&gt; Allow-Web-Out is already in use by a local rule: rename one of them</pre>
<p>The message names the rule and tells you the conflict is with a <b>local</b> rule. Only Delhi fails; the other firewalls have no local rule with that name. This is why "it was fine yesterday" is common: a local admin added a rule since the last push, or the central team introduced a new name.</p>

<h3>Fixing it</h3>
<ol>
<li>Decide who owns the name. Usually the central rule keeps it (other firewalls use it) and the local rule is renamed.</li>
<li>On the firewall, rename the local rule and commit locally.</li>
<li>Run validate-only from Panorama, then push for real.</li>
</ol>
<pre class="code">PA2&gt; configure
PA2# rename rulebase security rules Allow-Web-Out to Local-Web-Out
PA2# commit
PA2# exit
PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no validate-only yes</pre>
<p>Objects behave a little differently: in the lab a local object with the same name as a pushed object wins on that firewall (a simplification), which can silently change what a pushed rule matches. Check the documentation for your PAN-OS version for the exact override rules.</p>

<h3>Prevention</h3>
<ul>
<li>Agree a naming convention: central rules without a site prefix, local rules with a local prefix such as Local-.</li>
<li>Record every local rule in the change ticket so the central team can see it.</li>
<li>Run validate-only before pushes; clashes show up there first.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Renaming the central rule (it is used on every firewall); deleting the local rule without asking why it exists; ignoring same-named local objects.</p></div>
<div class="exam"><p><b>Exam trap.</b> The clash is detected at the firewall during validation, not at commit to Panorama, because Panorama does not know the firewall's local rules.</p></div>

<div class="scn"><h4>The helpful local admin</h4><p>Delhi's local admin had added a web allow rule with the same name as the new central rule, to fix a complaint quickly. Next push: Delhi alone failed with a local-rule clash. Renaming the local rule to Local-Web-Out kept the local fix and let the central rule land.</p><p><b>Lesson:</b> one name space, so agree naming.</p></div>

<div class="iv"><p class="q">"Why would a push fail on only one firewall with a rule-name error?"</p><p>That firewall has a local rule with the same name as the pushed rule. Rule names must be unique across pushed and local rules. I rename the local one, validate-only, then push.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pushed and local rules share one name space.</li>
<li>Local rules sit between pre and post rules.</li>
<li>The clash is found per firewall at validation.</li>
<li>Rename the local rule, validate-only, push.</li>
</ul></div>
`,hi:`
<p>Panorama rules aur objects aise firewalls ko push karta hai jinke paas pehle se apni local configuration ho sakti hai. Jab pushed name local name se takra jaata hai, us firewall ka push ruk jaata hai. Ye chapter batata hai kyun, pehchaan kaise karein, aur local intent tode bina fix kaise karein.</p>

<h3>Analogy: do files, ek naam</h3>
<p>Aap colleague ka folder apne documents mein copy karte ho. Andar "Report.docx" hai, aur aapke paas pehle se alag "Report.docx" hai. Computer chupchaap merge nahi karta, kyunki ek doosre ko overwrite kar dega. Firewall rule names ko isi tarah treat karta hai.</p>

<h3>Firewall par rules kaise baithti hain</h3>
<p>Firewall par final order hai: Shared pre, parent device group pre, child pre, <b>local rules</b>, child post, parent post, Shared post, phir default rules. Pushed aur local rules ek hi list mein rehti hain, isliye <b>rule names pushed aur local rules mein unique hone chahiye</b>. NAT pre aur post rules bhi isi pattern par chalti hain.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Rule order">
<rect x="20" y="10" width="600" height="22" rx="4" fill="#fed7aa"/><text x="320" y="26" text-anchor="middle" class="svg-ink" font-size="12">Shared pre, parent pre, child pre (pushed)</text>
<rect x="20" y="38" width="600" height="22" rx="4" fill="#bbf7d0"/><text x="320" y="54" text-anchor="middle" class="svg-ink" font-size="12">Local rules (firewall par configured)</text>
<rect x="20" y="66" width="600" height="22" rx="4" fill="#fed7aa"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="12">Child post, parent post, Shared post (pushed)</text>
<rect x="20" y="94" width="600" height="22" rx="4" fill="#e2e8f0"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="12">Default rules</text>
<text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">Sab ke liye ek hi namespace</text>
</svg><p class="cap">Local rules pre aur post ke beech baithti hain. Names poori list mein shared hain.</p></div>

<h3>Clash kaisa dikhta hai</h3>
<pre class="out">0079134988264     NK-DELHI-PA       <span class="hl">commit failed</span>: rulebase -&gt; security -&gt; rules -&gt; Allow-Web-Out is already in use by a local rule: rename one of them</pre>
<p>Message rule ka naam batata hai aur kehta hai ki conflict ek <b>local</b> rule ke saath hai. Sirf Delhi fail hota hai; baaki firewalls mein us naam ki local rule nahi hai. Isliye "kal tak theek tha" aam baat hai: pichhle push ke baad local admin ne rule add ki, ya central team ne naya name introduce kiya.</p>

<h3>Fix karna</h3>
<ol>
<li>Decide karo naam kiska hai. Aam taur par central rule naam rakhti hai (baaki firewalls use karte hain) aur local rule rename hoti hai.</li>
<li>Firewall par local rule rename karo aur locally commit karo.</li>
<li>Panorama se validate-only chalao, phir asli push karo.</li>
</ol>
<pre class="code">PA2&gt; configure
PA2# rename rulebase security rules Allow-Web-Out to Local-Web-Out
PA2# commit
PA2# exit
PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no validate-only yes</pre>
<p>Objects thoda alag behave karte hain: lab mein pushed object ke same naam ka local object us firewall par jeetta hai (simplification), jisse pushed rule kya match karti hai wo chupchaap badal sakta hai. Exact override rules ke liye apne PAN-OS version ki documentation dekho.</p>

<h3>Prevention</h3>
<ul>
<li>Naming convention agree karo: central rules bina site prefix ke, local rules local prefix ke saath jaise Local-.</li>
<li>Har local rule change ticket mein record karo taaki central team dekh sake.</li>
<li>Pushes se pehle validate-only chalao; clashes wahin pehle dikhte hain.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Central rule rename karna (wo har firewall par use hoti hai); local rule bina poochhe delete karna ki wo kyun hai; same-named local objects ignore karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Clash firewall par validation ke dauraan detect hota hai, commit to Panorama par nahi, kyunki Panorama ko firewall ki local rules pata nahi hoti.</p></div>

<div class="scn"><h4>Madadgaar local admin</h4><p>Delhi ke local admin ne complaint jaldi fix karne ke liye naye central rule ke same naam ki web allow rule add kar di thi. Agle push mein sirf Delhi fail hua local-rule clash ke saath. Local rule ko Local-Web-Out rename karne se local fix bhi bacha aur central rule bhi land hui.</p><p><b>Lesson:</b> ek name space hai, isliye naming agree karo.</p></div>

<div class="iv"><p class="q">"Rule-name error ke saath sirf ek firewall par push kyun fail hoga?"</p><p>Us firewall par pushed rule ke same naam ki local rule hai. Rule names pushed aur local rules mein unique hone chahiye. Local wali rename karta hoon, validate-only, phir push.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pushed aur local rules ek name space share karti hain.</li>
<li>Local rules pre aur post ke beech baithti hain.</li>
<li>Clash per firewall validation par milta hai.</li>
<li>Local rule rename karo, validate-only, push.</li>
</ul></div>
`}};export{e as default};