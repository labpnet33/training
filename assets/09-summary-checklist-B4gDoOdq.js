var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>At the end of a long trip you pack the bag again and check the list: ticket, charger, keys. This chapter is that last check for the module. Revisions, drift and auditing are really one story told in order: FortiManager keeps a history, a local change breaks agreement, auto update records it, an install can erase it, and the history lets you prove what happened. If you can tell that story with real commands, you know the module.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="The module story in five steps">
<rect x="10" y="40" width="112" height="60" rx="8" fill="#bae6fd"/><text x="66" y="66" text-anchor="middle" class="svg-ink" font-size="12">history</text><text x="66" y="84" text-anchor="middle" class="svg-muted" font-size="12">revisions</text>
<rect x="135" y="40" width="112" height="60" rx="8" fill="#fed7aa"/><text x="191" y="66" text-anchor="middle" class="svg-ink" font-size="12">local change</text><text x="191" y="84" text-anchor="middle" class="svg-muted" font-size="12">out of sync</text>
<rect x="260" y="40" width="112" height="60" rx="8" fill="#fde68a"/><text x="316" y="66" text-anchor="middle" class="svg-ink" font-size="12">auto update</text><text x="316" y="84" text-anchor="middle" class="svg-muted" font-size="12">recorded</text>
<rect x="385" y="40" width="112" height="60" rx="8" fill="#ddd6fe"/><text x="441" y="66" text-anchor="middle" class="svg-ink" font-size="12">install</text><text x="441" y="84" text-anchor="middle" class="svg-muted" font-size="12">replaces</text>
<rect x="510" y="40" width="112" height="60" rx="8" fill="#bbf7d0"/><text x="566" y="66" text-anchor="middle" class="svg-ink" font-size="12">diff</text><text x="566" y="84" text-anchor="middle" class="svg-muted" font-size="12">proves it</text>
<line x1="122" y1="70" x2="135" y2="70" stroke="#64748b" stroke-width="2"/><line x1="247" y1="70" x2="260" y2="70" stroke="#64748b" stroke-width="2"/><line x1="372" y1="70" x2="385" y2="70" stroke="#64748b" stroke-width="2"/><line x1="497" y1="70" x2="510" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The whole module in one line.</p></div>

<h3>What you should be able to do</h3>
<ul>
<li>Name the three events that create a revision and say which creates revision 1.</li>
<li>Read <code>diagnose dvm device list</code> and explain dev-db, conf, cond, dm, conn and pkg.</li>
<li>Explain the difference between dev-db modified and conf out of sync.</li>
<li>Describe the three moments after a local change and say what auto update does and does not do.</li>
<li>Read an install preview and spot the delete lines of policies that would be lost.</li>
<li>Keep a local policy by importing it into a new package and installing that package.</li>
<li>List revisions, diff the right pair, and write a five-sentence audit answer.</li>
<li>State what allow-push-configuration disable does and does not protect.</li>
<li>Say what is theory only in this simulator: revision revert and external backups.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Revision</dt><dd>A numbered snapshot of the managed configuration of one device, stored on FortiManager.</dd>
<dt>Retrieve</dt><dd>Reading the configuration of a device into FortiManager; makes revision 1 at authorize or add.</dd>
<dt>Auto update</dt><dd>FortiManager taking over a change made directly on a device, after a few seconds, with a new revision.</dd>
<dt>Drift</dt><dd>Difference between what the central record says and what the device really runs.</dd>
<dt>conf out of sync</dt><dd>The live device differs from FortiManager's last copy, or the device is unreachable.</dd>
<dt>dev-db modified</dt><dd>FortiManager holds changes (for example templates) that are not installed yet.</dd>
<dt>Install preview</dt><dd>The CLI that would be sent by an install, shown without sending it.</dd>
<dt>Import-policy</dt><dd>Building a policy package from the policies and objects already on a device.</dd>
<dt>Revision diff</dt><dd>A comparison of two revisions of one device, with plus and minus lines.</dd>
<dt>Managed scope</dt><dd>The settings that revisions record: system DNS, firewall address, firewall policy and VPN IPsec phase1 and phase2.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>What creates a revision?</td><td>Retrieve, install and auto update. A failed install creates nothing.</td></tr>
<tr><td>What does a local change show at once?</td><td>conf out of sync, cond pending, pkg modified.</td></tr>
<tr><td>What does dm show after the takeover?</td><td>autoupdated, with a revision created by auto update.</td></tr>
<tr><td>Does auto update change the package?</td><td>No. pkg can stay modified.</td></tr>
<tr><td>What does an install do to local policies?</td><td>Deletes those that are not in the package.</td></tr>
<tr><td>How do you keep one?</td><td>Import it into a new package, then install that package.</td></tr>
<tr><td>What does allow-push-configuration disable do?</td><td>Refuses pushes from FortiManager; it does not stop local edits.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Self-test. TRY-FGT shows conn up, conf out of sync and pkg modified. Which three actions come in which order? First read the revision list and diff the last two revisions (what changed and how). Then preview the package (what an install would delete). Then decide: import into a new package if the change is wanted, or install the package if it is not. Write the decision in the ticket.</p></div>

<div class="warn"><p><b>Last common mistakes.</b> Treating autoupdated as protected. Installing to make the status green. Believing revisions are backups. Quoting a person's name from the revision list. Forgetting that revert is not modelled here.</p></div>

<div class="exam"><p><b>Exam traps.</b> The pair dev-db and conf points in opposite directions. In sync after auto update does not mean the package contains the change. The preview sends nothing. The diff order is older first. This track is independent training and overlaps with practical administration skills tested elsewhere, but it does not prepare you for any particular exam.</p></div>

<div class="scn"><h4>The new engineer's first week</h4><p>Anita joined a team that manages 40 branch firewalls. On day two the status board showed three devices with conf out of sync. She did not install anything. She listed the revisions, diffed them, found two emergency rules and one stray address object, wrote the findings in tickets, imported the two rules into packages and removed the object in a change window. The lead said it was the calmest cleanup the team had done.</p><p><b>Lesson:</b> observe, compare, decide, then install.</p></div>

<div class="iv"><p class="q">"Summarise how FortiManager handles configuration drift."</p><p>It keeps a revision history per device; a local change shows as conf out of sync; auto update records it with a new revision; the package still does not contain it, so a later install replaces it. I use the preview, import what must stay, and use revision diffs for audit evidence. I add a change-control rule for emergencies.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Revisions come from retrieve, install and auto update only.</li>
<li>Out of sync means FortiGate ahead or unreachable; modified means FortiManager ahead.</li>
<li>Auto update records, it does not protect; the package decides what an install leaves.</li>
<li>Preview, import, install is the safe order; diff and list are the audit tools.</li>
<li>Revert and external backups are theory in this simulator.</li>
</ul></div>
`,hi:`
<p>Lambi trip ke end mein aap bag dobara pack karte ho aur list check karte ho: ticket, charger, chabiyan. Ye chapter module ka wahi aakhri check hai. Revisions, drift aur auditing asal mein ek hi kahani hai, order mein: FortiManager history rakhta hai, local change agreement todti hai, auto update use record karta hai, install use mita sakta hai, aur history aapko saabit karne deti hai ki kya hua. Ye kahani real commands ke saath suna sako to module aa gaya.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module ki kahani paanch steps mein">
<rect x="10" y="40" width="112" height="60" rx="8" fill="#bae6fd"/><text x="66" y="66" text-anchor="middle" class="svg-ink" font-size="12">history</text><text x="66" y="84" text-anchor="middle" class="svg-muted" font-size="12">revisions</text>
<rect x="135" y="40" width="112" height="60" rx="8" fill="#fed7aa"/><text x="191" y="66" text-anchor="middle" class="svg-ink" font-size="12">local change</text><text x="191" y="84" text-anchor="middle" class="svg-muted" font-size="12">out of sync</text>
<rect x="260" y="40" width="112" height="60" rx="8" fill="#fde68a"/><text x="316" y="66" text-anchor="middle" class="svg-ink" font-size="12">auto update</text><text x="316" y="84" text-anchor="middle" class="svg-muted" font-size="12">record</text>
<rect x="385" y="40" width="112" height="60" rx="8" fill="#ddd6fe"/><text x="441" y="66" text-anchor="middle" class="svg-ink" font-size="12">install</text><text x="441" y="84" text-anchor="middle" class="svg-muted" font-size="12">replace</text>
<rect x="510" y="40" width="112" height="60" rx="8" fill="#bbf7d0"/><text x="566" y="66" text-anchor="middle" class="svg-ink" font-size="12">diff</text><text x="566" y="84" text-anchor="middle" class="svg-muted" font-size="12">saabit</text>
<line x1="122" y1="70" x2="135" y2="70" stroke="#64748b" stroke-width="2"/><line x1="247" y1="70" x2="260" y2="70" stroke="#64748b" stroke-width="2"/><line x1="372" y1="70" x2="385" y2="70" stroke="#64748b" stroke-width="2"/><line x1="497" y1="70" x2="510" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Poora module ek line mein.</p></div>

<h3>Aap kya kar sakte ho</h3>
<ul>
<li>Revision banane wale teen events ke naam batao aur kaun revision 1 banata hai.</li>
<li><code>diagnose dvm device list</code> padho aur dev-db, conf, cond, dm, conn aur pkg samjhao.</li>
<li>Dev-db modified aur conf out of sync ka farak samjhao.</li>
<li>Local change ke baad ke teen moments batao aur ye ki auto update kya karta hai aur kya nahi.</li>
<li>Install preview padho aur wo policies ki delete lines pehchano jo kho jayengi.</li>
<li>Local policy ko naye package mein import karke aur wo package install karke rakho.</li>
<li>Revisions list karo, sahi jodi ka diff karo, aur paanch sentences ka audit jawab likho.</li>
<li>Batao ki allow-push-configuration disable kya bachata hai aur kya nahi.</li>
<li>Batao is simulator mein kya sirf theory hai: revision revert aur external backups.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Revision</dt><dd>Ek device ki managed configuration ka numbered snapshot, jo FortiManager par store hota hai.</dd>
<dt>Retrieve</dt><dd>Device ki configuration ko FortiManager mein padhna; authorize ya add par revision 1 banata hai.</dd>
<dt>Auto update</dt><dd>FortiManager ka device par seedha hui change ko kuch seconds baad, nayi revision ke saath, apna lena.</dd>
<dt>Drift</dt><dd>Central record kya kehta hai aur device asal mein kya chala raha hai, inke beech ka difference.</dd>
<dt>conf out of sync</dt><dd>Live device FortiManager ki last copy se alag hai, ya device unreachable hai.</dd>
<dt>dev-db modified</dt><dd>FortiManager ke paas aisi changes hain (jaise templates) jo abhi install nahi hui.</dd>
<dt>Install preview</dt><dd>Install jo CLI bhejega, bhejne ke bina dikhana.</dd>
<dt>Import-policy</dt><dd>Device par pehle se maujood policies aur objects se policy package banana.</dd>
<dt>Revision diff</dt><dd>Ek device ki do revisions ki comparison, plus aur minus lines ke saath.</dd>
<dt>Managed scope</dt><dd>Wo settings jo revisions record karti hain: system DNS, firewall address, firewall policy aur VPN IPsec phase1 aur phase2.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Sawal</th><th>Jawab</th></tr>
<tr><td>Revision kaun banata hai?</td><td>Retrieve, install aur auto update. Failed install kuch nahi banata.</td></tr>
<tr><td>Local change turant kya dikhati hai?</td><td>conf out of sync, cond pending, pkg modified.</td></tr>
<tr><td>Takeover ke baad dm kya dikhata hai?</td><td>autoupdated, aur auto update se bani revision.</td></tr>
<tr><td>Kya auto update package badalta hai?</td><td>Nahi. pkg modified reh sakta hai.</td></tr>
<tr><td>Install local policies ke saath kya karta hai?</td><td>Jo package mein nahi hain unhe delete karta hai.</td></tr>
<tr><td>Ek ko kaise rakhte hain?</td><td>Naye package mein import karo, phir wo package install karo.</td></tr>
<tr><td>allow-push-configuration disable kya karta hai?</td><td>FortiManager ke pushes refuse karta hai; local edits nahi rokta.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Self-test. TRY-FGT par conn up, conf out of sync aur pkg modified hai. Kaun se teen actions kis order mein? Pehle revision list padho aur aakhri do revisions ka diff karo (kya badla aur kaise). Phir package ka preview (install kya delete karega). Phir decide: change chahiye to naye package mein import, nahi chahiye to package install. Decision ticket mein likho.</p></div>

<div class="warn"><p><b>Aakhri aam galtiyan.</b> Autoupdated ko protected maanna. Status green karne ke liye install karna. Revisions ko backup maanna. Revision list se kisi insaan ka naam batana. Ye bhoolna ki revert yahan model nahi hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Dev-db aur conf ki jodi ulti directions batati hai. Auto update ke baad in sync ka matlab ye nahi ki package mein change hai. Preview kuch nahi bhejta. Diff ka order purani pehle. Ye track independent training hai aur practical administration skills se overlap karta hai jo kahin aur bhi test hoti hain, par ye aapko kisi khaas exam ke liye taiyar nahi karta.</p></div>

<div class="scn"><h4>Naye engineer ka pehla hafta</h4><p>Anita ek aisi team mein aayi jo 40 branch firewalls manage karti hai. Doosre din status board par teen devices conf out of sync dikha rahe the. Usne kuch install nahi kiya. Usne revisions list ki, diff kiya, do emergency rules aur ek stray address object mile, findings tickets mein likhe, do rules ko packages mein import kiya aur object ko change window mein hataya. Lead ne kaha ye team ka sabse shaant cleanup tha.</p><p><b>Lesson:</b> dekho, compare karo, decide karo, phir install karo.</p></div>

<div class="iv"><p class="q">"FortiManager configuration drift ko kaise handle karta hai, summary do."</p><p>Wo har device ki revision history rakhta hai; local change conf out of sync dikhati hai; auto update use nayi revision ke saath record karta hai; package mein abhi bhi wo nahi hai, isliye baad ka install use replace karta hai. Main preview use karta hoon, jo rehna hai use import karta hoon, aur audit evidence ke liye revision diffs use karta hoon. Emergencies ke liye change-control rule jodta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Revisions sirf retrieve, install aur auto update se aati hain.</li>
<li>Out of sync matlab FortiGate aage ya unreachable; modified matlab FortiManager aage.</li>
<li>Auto update record karta hai, protect nahi; install kya chhodega ye package decide karta hai.</li>
<li>Preview, import, install safe order hai; diff aur list audit tools hain.</li>
<li>Revert aur external backups is simulator mein theory hain.</li>
</ul></div>
`}};export{e as default};