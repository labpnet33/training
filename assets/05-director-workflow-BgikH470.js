var e={id:`director-workflow`,h:{en:`The Director workflow for adding a device`,hi:`Device add karne ka Director workflow`},body:{en:`
<p>Think of a hospital admission desk. A patient does not walk to a ward on their own. A clerk checks the identity, picks the right department, fills the details, and only then sends the patient to the ward. In Versa, the <b>Director workflow</b> is the admission desk for a new branch: it records who the device is, where it belongs and what values it gets, and then sends it to the network.</p>

<h3>The real Director wizard, conceptually</h3>
<p>In the real Director GUI you add a branch from the workflows area, using a device wizard. We do not quote exact menu paths because they differ between Director releases; what matters is the set of decisions the wizard walks you through. They are the same in every release:</p>
<ol>
<li><b>Basic information:</b> device name, organization (tenant), the <b>device group</b> or template to use, and the controller the device will connect to.</li>
<li><b>Identity and staging:</b> the hardware <b>serial number</b> and the way the device will reach the Controller for the first time (staging or ZTP options, chapter 7).</li>
<li><b>Bind data:</b> device-specific variables: site-id, LAN, WAN addresses and gateways.</li>
<li><b>Review and deploy:</b> the Director builds the configuration for review and, when you deploy, saves the workflow so the device can be pushed.</li>
</ol>

<div class="note"><p>The course model compresses the wizard into four objects you create with commands, in this order: <b>template</b>, <b>device group</b>, <b>device</b> (serial + group), <b>bind data</b>. The final action, <code>request devices workflow deploy device Branch3</code>, matches "Deploy" in the wizard. The names and command are course-model helpers.</p></div>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Wizard steps">
<rect x="10" y="30" width="135" height="70" rx="8" fill="#bae6fd"/><text x="77" y="58" text-anchor="middle" class="svg-ink" font-size="13">1 Template</text><text x="77" y="78" text-anchor="middle" class="svg-muted" font-size="12">BR-DUAL</text>
<rect x="170" y="30" width="135" height="70" rx="8" fill="#ddd6fe"/><text x="237" y="58" text-anchor="middle" class="svg-ink" font-size="13">2 Group</text><text x="237" y="78" text-anchor="middle" class="svg-muted" font-size="12">BRANCHES</text>
<rect x="330" y="30" width="135" height="70" rx="8" fill="#bbf7d0"/><text x="397" y="58" text-anchor="middle" class="svg-ink" font-size="13">3 Device</text><text x="397" y="78" text-anchor="middle" class="svg-muted" font-size="12">serial + group</text>
<rect x="490" y="30" width="135" height="70" rx="8" fill="#fde68a"/><text x="557" y="58" text-anchor="middle" class="svg-ink" font-size="13">4 Bind data</text><text x="557" y="78" text-anchor="middle" class="svg-muted" font-size="12">site, LAN, WANs</text>
<line x1="145" y1="65" x2="170" y2="65" stroke="#64748b" stroke-width="2"/><line x1="305" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><line x1="465" y1="65" x2="490" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="13">then: deploy the workflow</text>
</svg><p class="cap">Create objects in dependency order: each step refers to the one before it.</p></div>

<h3>Why the order matters</h3>
<p>A group points at a template, so the template should exist first. A device points at a group, so the group comes before the device. Bind data needs the device. The Director often lets you commit in a different order, but a missing referenced object shows up later as a post-staging failure, which is harder to read than a simple "create it first".</p>

<h3>The whole sequence in one commit</h3>
<pre class="code">admin@Director-1-cli% set director templates BR-DUAL tenant Acme
admin@Director-1-cli% set director templates BR-DUAL wan-interface vni-0/0 transport Internet
admin@Director-1-cli% set director templates BR-DUAL wan-interface vni-0/1 transport MPLS
admin@Director-1-cli% set director templates BR-DUAL lan-interface vni-0/3
admin@Director-1-cli% set director groups BRANCHES template BR-DUAL
admin@Director-1-cli% set director devices Branch3 serial VOS-BR3-0001
admin@Director-1-cli% set director devices Branch3 group BRANCHES
<span class="c">! ... the six bind lines from chapter 4 ...</span>
admin@Director-1-cli% commit
admin@Director-1-cli% exit</pre>
<pre class="out">admin@Director-1-cli&gt; show templates
admin@Director-1-cli&gt; show device-groups
admin@Director-1-cli&gt; show devices device Branch3
<span class="c">(read: org Acme, group BRANCHES, Missing bind data: none)</span></pre>

<h3>Prerequisites in the headend</h3>
<p>Before any branch can be onboarded the headend must be ready: the <b>Controller</b> must know its Director (<code>system director 198.51.100.10</code>) and the Director must have the Controller registered (<code>director controllers Controller-1 address 198.51.100.20</code>). You built this link in the platform module. If it is missing, the branch cannot even finish staging. Ask: does the Director know my Controller, and does my Controller know its Director?</p>

<div class="eg"><p><b>Worked example.</b> Adding Branch3 to a network with Branch1 and Branch2 already online. Objects needed: 0 new templates (BR-DUAL exists), 0 new groups, 1 new device, 6 bind values, 1 deploy. Total new commands: 2 identity + 6 bind + 1 deploy = 9. Reuse is why onboarding the hundredth site costs the same effort as the second.</p></div>

<div class="warn"><p><b>Common mistakes:</b> deploying before the commit (the Director only sees committed configuration, and a device not yet committed is reported as not defined); creating the device but leaving group empty; assuming deploy equals Online.</p></div>
<div class="exam"><p><b>Exam trap:</b> in the course model <code>request devices workflow deploy</code> is an operational command run from the Director in operational mode, not a configuration statement.</p></div>

<div class="scn"><h4>Deploy clicked, nothing happened</h4><p>An engineer prepared everything in a draft but ran deploy before committing. The Director replied that the device is not defined in its committed configuration. After commit and deploy, the status moved from Staged - waiting for Director to Online.</p><p><b>Lesson:</b> commit first, then deploy, then verify.</p></div>

<div class="iv"><p class="q">"Walk me through adding a branch in the Director."</p><p>Template and group exist first. Create the device with name, organization, group and serial, fill the bind data, check for missing values, review the generated configuration, then deploy the workflow. Finally verify the device state in the Director and on the branch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The wizard decides: identity, group or template, serial, bind data, deploy.</li>
<li>Course order: template, group, device, bind data, commit, then deploy.</li>
<li>Controller and Director must already be linked and registered.</li>
<li>Deploy only works for committed devices.</li>
<li>Deploy submits the push; it does not prove the branch is Online.</li>
</ul></div>
`,hi:`
<p>Hospital ke admission desk ke baare mein socho. Patient khud ward mein nahi chala jata. Clerk identity check karta hai, sahi department chunta hai, details bharta hai, aur tab patient ko ward bhejta hai. Versa mein <b>Director workflow</b> naye branch ka admission desk hai: ye record karta hai ki device kaun hai, kahan belong karta hai aur use kaunsi values milengi, aur phir use network mein bhejta hai.</p>

<h3>Real Director wizard, conceptually</h3>
<p>Real Director GUI mein aap workflows area se device wizard use karke branch add karte ho. Exact menu paths hum quote nahi karte kyunki Director releases mein alag hote hain; zaroori wo decisions hain jinse wizard guzarta hai. Wo har release mein same hain:</p>
<ol>
<li><b>Basic information:</b> device name, organization (tenant), use hone wala <b>device group</b> ya template, aur wo controller jisse device connect hoga.</li>
<li><b>Identity aur staging:</b> hardware <b>serial number</b> aur device pehli baar Controller tak kaise pahunchega (staging ya ZTP options, chapter 7).</li>
<li><b>Bind data:</b> device-specific variables: site-id, LAN, WAN addresses aur gateways.</li>
<li><b>Review aur deploy:</b> Director review ke liye configuration banata hai aur deploy karne par workflow save karta hai taaki device push ho sake.</li>
</ol>

<div class="note"><p>Course model wizard ko chaar objects mein compress karta hai jo aap commands se banate ho, is order mein: <b>template</b>, <b>device group</b>, <b>device</b> (serial + group), <b>bind data</b>. Aakhri action <code>request devices workflow deploy device Branch3</code> wizard ke "Deploy" ke barabar hai. Ye names aur command course-model helpers hain.</p></div>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Wizard steps">
<rect x="10" y="30" width="135" height="70" rx="8" fill="#bae6fd"/><text x="77" y="58" text-anchor="middle" class="svg-ink" font-size="13">1 Template</text><text x="77" y="78" text-anchor="middle" class="svg-muted" font-size="12">BR-DUAL</text>
<rect x="170" y="30" width="135" height="70" rx="8" fill="#ddd6fe"/><text x="237" y="58" text-anchor="middle" class="svg-ink" font-size="13">2 Group</text><text x="237" y="78" text-anchor="middle" class="svg-muted" font-size="12">BRANCHES</text>
<rect x="330" y="30" width="135" height="70" rx="8" fill="#bbf7d0"/><text x="397" y="58" text-anchor="middle" class="svg-ink" font-size="13">3 Device</text><text x="397" y="78" text-anchor="middle" class="svg-muted" font-size="12">serial + group</text>
<rect x="490" y="30" width="135" height="70" rx="8" fill="#fde68a"/><text x="557" y="58" text-anchor="middle" class="svg-ink" font-size="13">4 Bind data</text><text x="557" y="78" text-anchor="middle" class="svg-muted" font-size="12">site, LAN, WANs</text>
<line x1="145" y1="65" x2="170" y2="65" stroke="#64748b" stroke-width="2"/><line x1="305" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><line x1="465" y1="65" x2="490" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="13">phir: workflow deploy karo</text>
</svg><p class="cap">Objects dependency order mein banao: har step pichhle ko refer karta hai.</p></div>

<h3>Order kyun matter karta hai</h3>
<p>Group template ko point karta hai, isliye template pehle exist hona chahiye. Device group ko point karta hai, isliye group device se pehle aata hai. Bind data ko device chahiye. Director aksar alag order mein commit karne deta hai, lekin missing referenced object baad mein post-staging failure ban kar dikhta hai, jo simple "pehle ise banao" se padhna mushkil hai.</p>

<h3>Poora sequence ek commit mein</h3>
<pre class="code">admin@Director-1-cli% set director templates BR-DUAL tenant Acme
admin@Director-1-cli% set director templates BR-DUAL wan-interface vni-0/0 transport Internet
admin@Director-1-cli% set director templates BR-DUAL wan-interface vni-0/1 transport MPLS
admin@Director-1-cli% set director templates BR-DUAL lan-interface vni-0/3
admin@Director-1-cli% set director groups BRANCHES template BR-DUAL
admin@Director-1-cli% set director devices Branch3 serial VOS-BR3-0001
admin@Director-1-cli% set director devices Branch3 group BRANCHES
<span class="c">! ... chapter 4 ki chhe bind lines ...</span>
admin@Director-1-cli% commit
admin@Director-1-cli% exit</pre>
<pre class="out">admin@Director-1-cli&gt; show templates
admin@Director-1-cli&gt; show device-groups
admin@Director-1-cli&gt; show devices device Branch3
<span class="c">(padho: org Acme, group BRANCHES, Missing bind data: none)</span></pre>

<h3>Headend ke prerequisites</h3>
<p>Koi bhi branch onboard hone se pehle headend ready hona chahiye: <b>Controller</b> ko apna Director pata ho (<code>system director 198.51.100.10</code>) aur Director mein Controller registered ho (<code>director controllers Controller-1 address 198.51.100.20</code>). Ye link aapne platform module mein banaya tha. Ye missing ho to branch staging bhi finish nahi kar sakta. Poocho: kya Director mera Controller jaanta hai, aur kya mera Controller apne Director ko jaanta hai?</p>

<div class="eg"><p><b>Worked example.</b> Branch1 aur Branch2 pehle se online hain, Branch3 add karna hai. Zaroori objects: 0 naye templates (BR-DUAL hai), 0 naye groups, 1 naya device, 6 bind values, 1 deploy. Naye commands: 2 identity + 6 bind + 1 deploy = 9. Reuse isliye sau waan site onboard karne ki mehnat doosri site jitni hi hai.</p></div>

<div class="warn"><p><b>Common mistakes:</b> commit se pehle deploy karna (Director sirf committed configuration dekhta hai, aur abhi commit na hua device not defined report hota hai); device banana lekin group khali chhod dena; deploy ko Online samajh lena.</p></div>
<div class="exam"><p><b>Exam trap:</b> course model mein <code>request devices workflow deploy</code> Director par operational mode ka command hai, configuration statement nahi.</p></div>

<div class="scn"><h4>Deploy kiya, kuch nahi hua</h4><p>Ek engineer ne draft mein sab prepare kiya lekin commit se pehle deploy chala diya. Director ne bataya ki device committed configuration mein defined nahi hai. Commit aur deploy ke baad status Staged - waiting for Director se Online ho gaya.</p><p><b>Lesson:</b> pehle commit, phir deploy, phir verify.</p></div>

<div class="iv"><p class="q">"Director mein branch add karna samjhao."</p><p>Pehle template aur group exist hon. Device banao name, organization, group aur serial ke saath, bind data bharo, missing values check karo, generated configuration review karo, phir workflow deploy karo. Aakhir mein Director aur branch dono par device state verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wizard ke decisions: identity, group ya template, serial, bind data, deploy.</li>
<li>Course order: template, group, device, bind data, commit, phir deploy.</li>
<li>Controller aur Director pehle se linked aur registered hone chahiye.</li>
<li>Deploy sirf committed devices ke liye kaam karta hai.</li>
<li>Deploy push submit karta hai; ye prove nahi karta ki branch Online hai.</li>
</ul></div>
`}};export{e as default};