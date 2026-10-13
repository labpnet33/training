var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have reached the end of the commit, validate and push module. This page collects what to be able to do, the vocabulary, and the facts that exams and interviews test most. It also repeats the honest limits of the simulator.</p>

<h3>One-page picture</h3>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Workflow summary">
<rect x="10" y="40" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="12">Edit candidate</text>
<rect x="140" y="40" width="110" height="50" rx="8" fill="#fde68a"/><text x="195" y="70" text-anchor="middle" class="svg-ink" font-size="12">Commit to Pano</text>
<rect x="270" y="40" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="325" y="70" text-anchor="middle" class="svg-ink" font-size="12">Validate-only</text>
<rect x="400" y="40" width="110" height="50" rx="8" fill="#fed7aa"/><text x="455" y="70" text-anchor="middle" class="svg-ink" font-size="12">Push (pilot)</text>
<rect x="530" y="40" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<line x1="120" y1="65" x2="140" y2="65" stroke="#64748b" stroke-width="2"/><line x1="250" y1="65" x2="270" y2="65" stroke="#64748b" stroke-width="2"/><line x1="380" y1="65" x2="400" y2="65" stroke="#64748b" stroke-width="2"/><line x1="510" y1="65" x2="530" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Template before policy; state every option; verify on the firewall.</p></div>

<h3>Can you do these?</h3>
<ul>
<li>Explain candidate versus running, and say which one a push sends.</li>
<li>Name what a commit to Panorama changes (only Panorama) and what a push changes (firewalls).</li>
<li>Choose the right package for a change: device group, template or stack, collector config.</li>
<li>Explain each option: validate-only, include-template, merge-with-candidate-cfg, force-template-values, device.</li>
<li>Explain why the template goes before the policy, and read "is not a valid reference".</li>
<li>Read a partial-success result and classify every message.</li>
<li>Read show jobs all (Commit, CommitAll, Validate) and the two sync columns.</li>
<li>Resolve a rule-name clash with a local rule.</li>
<li>Explain the risk of merge-with-candidate-cfg yes.</li>
<li>Describe a conservative plan for concurrent admins, backups and rollback.</li>
<li>Run the seven-step change routine.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Candidate</dt><dd>Editable draft configuration.</dd>
<dt>Running</dt><dd>Last validated and committed configuration.</dd>
<dt>Commit to Panorama</dt><dd>Makes the candidate Panorama's running configuration. No firewall changes.</dd>
<dt>Push (commit-all)</dt><dd>Sends Panorama's running configuration to firewalls, which validate and commit it.</dd>
<dt>Out of Sync</dt><dd>Panorama is ahead of the firewall, or the last push failed there.</dd>
<dt>Blast radius</dt><dd>How many sites a mistake can hurt.</dd>
<dt>Pilot</dt><dd>First push to one low-risk firewall.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="tbl">
<tr><th>Fact</th><th>Remember</th></tr>
<tr><td>What push sends</td><td>The committed (running) configuration, never the candidate</td></tr>
<tr><td>Failed firewall</td><td>Keeps its previous configuration; others may succeed</td></tr>
<tr><td>Order</td><td>Template first, then device group (or include-template yes)</td></tr>
<tr><td>Rule names</td><td>Unique across pushed and local rules</td></tr>
<tr><td>Local rules</td><td>Between child pre and child post rules</td></tr>
<tr><td>Job types</td><td>Commit, CommitAll, Validate</td></tr>
<tr><td>Pending local edits</td><td>Stay pending with merge no; committed with merge yes</td></tr>
<tr><td>Version-dependent details</td><td>Check the documentation for your PAN-OS version; state options explicitly</td></tr>
</table>

<h3>Honest boundaries of this simulator</h3>
<p>The lab teaches a tested subset. It has no web GUI, no locks or per-administrator commit scope, no config versions or rollback commands, and no real certificates, licences or content updates. Push state is session state. Real products have more options and behaviours, and defaults differ between releases, so confirm details in your own environment's documentation.</p>

<div class="exam"><p><b>Exam trap summary.</b> Commit is not push; candidate is not running; template before policy; validate-only is not deployed; merge yes commits other people's drafts; verify on the firewall.</p></div>

<div class="scn"><h4>Putting it together</h4><p>A new branch is onboarded on Monday. The engineer commits the branch's template changes, pushes the stack, validates the device group, pilots the policy, checks show config pushed-shared-policy on the firewall and a user browse, and records job ids. On Tuesday nobody has a ticket about it.</p><p><b>Lesson:</b> the routine is the skill.</p></div>

<div class="iv"><p class="q">"In one minute, what is the Panorama commit and push workflow?"</p><p>Edit the candidate, commit to Panorama so it becomes Panorama's running configuration, validate-only the push, push the right package in the right order with explicit options (pilot first), then verify on the firewalls and record the jobs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Commit changes Panorama; push changes firewalls; push sends running.</li>
<li>Template before policy; per-firewall results; failures keep old config.</li>
<li>Be explicit with options, especially merge and force-template-values.</li>
<li>Validate, pilot, verify, document.</li>
</ul></div>
`,hi:`
<p>Aap commit, validate aur push module ke end tak pahunch gaye. Ye page wo sab collect karta hai jo aapko kar paana chahiye, vocabulary, aur wo facts jo exams aur interviews sabse zyada test karte hain. Ye simulator ki honest limits bhi repeat karta hai.</p>

<h3>Ek page ki picture</h3>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Workflow summary">
<rect x="10" y="40" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="12">Candidate edit</text>
<rect x="140" y="40" width="110" height="50" rx="8" fill="#fde68a"/><text x="195" y="70" text-anchor="middle" class="svg-ink" font-size="12">Commit to Pano</text>
<rect x="270" y="40" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="325" y="70" text-anchor="middle" class="svg-ink" font-size="12">Validate-only</text>
<rect x="400" y="40" width="110" height="50" rx="8" fill="#fed7aa"/><text x="455" y="70" text-anchor="middle" class="svg-ink" font-size="12">Push (pilot)</text>
<rect x="530" y="40" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<line x1="120" y1="65" x2="140" y2="65" stroke="#64748b" stroke-width="2"/><line x1="250" y1="65" x2="270" y2="65" stroke="#64748b" stroke-width="2"/><line x1="380" y1="65" x2="400" y2="65" stroke="#64748b" stroke-width="2"/><line x1="510" y1="65" x2="530" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Policy se pehle template; har option explicit; firewall par verify.</p></div>

<h3>Kya ye kar sakte ho?</h3>
<ul>
<li>Candidate versus running samjhao, aur batao push kaunsa bhejta hai.</li>
<li>Batao commit to Panorama kya badalta hai (sirf Panorama) aur push kya badalta hai (firewalls).</li>
<li>Change ke liye sahi package chuno: device group, template ya stack, collector config.</li>
<li>Har option samjhao: validate-only, include-template, merge-with-candidate-cfg, force-template-values, device.</li>
<li>Samjhao template policy se pehle kyun jaata hai, aur "is not a valid reference" padho.</li>
<li>Partial-success result padho aur har message classify karo.</li>
<li>show jobs all (Commit, CommitAll, Validate) aur do sync columns padho.</li>
<li>Local rule ke saath rule-name clash resolve karo.</li>
<li>merge-with-candidate-cfg yes ka risk samjhao.</li>
<li>Concurrent admins, backups aur rollback ka conservative plan batao.</li>
<li>Seven-step change routine chalao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Candidate</dt><dd>Editable draft configuration.</dd>
<dt>Running</dt><dd>Aakhri validated aur committed configuration.</dd>
<dt>Commit to Panorama</dt><dd>Candidate ko Panorama ki running configuration banata hai. Koi firewall nahi badalta.</dd>
<dt>Push (commit-all)</dt><dd>Panorama ki running configuration firewalls ko bhejta hai, jo validate karke commit karte hain.</dd>
<dt>Out of Sync</dt><dd>Panorama firewall se aage hai, ya wahan last push fail hua.</dd>
<dt>Blast radius</dt><dd>Galti kitni sites ko hurt kar sakti hai.</dd>
<dt>Pilot</dt><dd>Ek low-risk firewall par pehla push.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="tbl">
<tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Push kya bhejta hai</td><td>Committed (running) configuration, candidate kabhi nahi</td></tr>
<tr><td>Failed firewall</td><td>Purani configuration rakhta hai; baaki succeed ho sakte hain</td></tr>
<tr><td>Order</td><td>Pehle template, phir device group (ya include-template yes)</td></tr>
<tr><td>Rule names</td><td>Pushed aur local rules mein unique</td></tr>
<tr><td>Local rules</td><td>Child pre aur child post rules ke beech</td></tr>
<tr><td>Job types</td><td>Commit, CommitAll, Validate</td></tr>
<tr><td>Pending local edits</td><td>Merge no mein pending; merge yes mein committed</td></tr>
<tr><td>Version-dependent details</td><td>Apne PAN-OS version ki documentation dekho; options explicitly likho</td></tr>
</table>

<h3>Is simulator ki honest boundaries</h3>
<p>Lab ek tested subset sikhata hai. Isme web GUI nahi hai, locks ya per-administrator commit scope nahi hai, config versions ya rollback commands nahi hain, aur real certificates, licences ya content updates nahi hain. Push state session state hai. Real products mein zyada options aur behaviours hain, aur defaults releases ke beech alag hote hain, isliye details apne environment ki documentation mein confirm karo.</p>

<div class="exam"><p><b>Exam trap summary.</b> Commit push nahi hai; candidate running nahi hai; policy se pehle template; validate-only deployed nahi hai; merge yes doosron ke drafts commit karta hai; firewall par verify karo.</p></div>

<div class="scn"><h4>Sab ek saath</h4><p>Monday ko naya branch onboard hota hai. Engineer branch ke template changes commit karta hai, stack push karta hai, device group validate karta hai, policy ka pilot karta hai, firewall par show config pushed-shared-policy aur user browse check karta hai, aur job ids record karta hai. Tuesday ko is bare mein kisi ka ticket nahi aata.</p><p><b>Lesson:</b> routine hi skill hai.</p></div>

<div class="iv"><p class="q">"Ek minute mein Panorama commit aur push workflow kya hai?"</p><p>Candidate edit karo, commit to Panorama taaki wo Panorama ki running configuration bane, push ka validate-only, sahi package sahi order mein explicit options ke saath push (pehle pilot), phir firewalls par verify aur jobs record.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Commit Panorama badalta hai; push firewalls badalta hai; push running bhejta hai.</li>
<li>Policy se pehle template; per-firewall results; failures purani config rakhte hain.</li>
<li>Options explicit rakho, khaaskar merge aur force-template-values.</li>
<li>Validate, pilot, verify, document.</li>
</ul></div>
`}};export{e as default};