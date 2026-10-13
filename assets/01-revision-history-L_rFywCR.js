var e={id:`revision-history`,h:{en:`The revision history: what creates a revision`,hi:`Revision history: revision kaun banata hai`},body:{en:`
<div class="note"><p><b>What you will learn.</b> What a revision is, which three events create one (retrieve, install and auto update), how to read the revision list of a device, and why a failed install leaves no trace. <b>Prerequisites:</b> the module fmg-start (you can authorize a FortiGate, you know that FortiManager keeps a copy of each device configuration) and basic policy packages and install from fmg-policy. Nothing about drift or auditing is assumed.</p></div>

<p>Think of a bank passbook. Every deposit or withdrawal adds one printed line: a number, a date and a short description. You never erase a line; you only add the next one. A FortiManager <b>revision history</b> is the passbook of one FortiGate. Each line is a saved copy of the managed part of the device configuration at one moment, with a number, a creator, a time and a name.</p>

<h3>What a revision is</h3>
<p>A <b>revision</b> is a numbered snapshot of the configuration of one managed device, stored on FortiManager. In the real product it is kept in the device database. In this simulator the snapshot covers the <b>managed scope</b>: system DNS, firewall address, firewall policy and VPN IPsec phase1 and phase2. Anything outside that scope is not in a revision, so it cannot appear in a comparison later.</p>

<h3>The three events that create a revision</h3>
<table class="cmp"><tr><th>Event</th><th>Created by column</th><th>Name</th><th>When it happens</th></tr>
<tr><td>Retrieve</td><td>retrieve</td><td>Retrieved</td><td>When you authorize the device or add it from the FortiManager side. This is always revision 1.</td></tr>
<tr><td>Install</td><td>install</td><td>Installed (package name)</td><td>After a successful install of a package or a device.</td></tr>
<tr><td>Auto update</td><td>auto update</td><td>Auto-Update</td><td>When FortiManager notices a change made directly on the FortiGate and takes it over (chapter 3).</td></tr></table>
<p>Nothing else creates a revision. Looking at a device, running a preview, editing a package or changing a template does not. A <b>failed install</b> also creates nothing: the simulator says that the revision history is unchanged. That is useful when you investigate: if the list does not grow, the device did not change.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Timeline of revisions of MDU-FGT">
<line x1="40" y1="70" x2="600" y2="70" stroke="#64748b" stroke-width="2"/>
<circle cx="90" cy="70" r="14" fill="#bae6fd"/><text x="90" y="75" text-anchor="middle" class="svg-ink" font-size="13">1</text>
<circle cx="260" cy="70" r="14" fill="#bbf7d0"/><text x="260" y="75" text-anchor="middle" class="svg-ink" font-size="13">2</text>
<circle cx="430" cy="70" r="14" fill="#fed7aa"/><text x="430" y="75" text-anchor="middle" class="svg-ink" font-size="13">3</text>
<text x="90" y="110" text-anchor="middle" class="svg-ink" font-size="12">retrieve</text><text x="90" y="128" text-anchor="middle" class="svg-muted" font-size="12">authorize</text>
<text x="260" y="110" text-anchor="middle" class="svg-ink" font-size="12">install</text><text x="260" y="128" text-anchor="middle" class="svg-muted" font-size="12">Branch-PP</text>
<text x="430" y="110" text-anchor="middle" class="svg-ink" font-size="12">auto update</text><text x="430" y="128" text-anchor="middle" class="svg-muted" font-size="12">local change</text>
<text x="520" y="40" class="svg-accent" font-size="12">next revision: 4</text>
</svg><p class="cap">The passbook of MDU-FGT: lines are only added, never removed.</p></div>

<h3>Why it matters</h3>
<p>The revision list answers three everyday questions. What was the last time FortiManager and the device agreed? Did something change behind FortiManager's back? Which install introduced a problem? Without it you can only guess from memory, and memory is poor at three in the morning.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Retail onboards MDU-FGT: revision 1 is created at once. The engineer installs the package Branch-PP: revision 2. Counting the numbers tells the story before you read any detail: two revisions, so only the onboarding and one install have happened.</p></div>

<h3>Reading the list</h3>
<p>The command in the simulator is <code>execute fmgui revision list</code> followed by the device name. As with authorize and install, this is a GUI or API action in the real product; the simulator offers it as an <code>execute fmgui</code> command. The times are the simulator clock, not real time.</p>
<pre class="code"><span class="c">! on FMG-1</span>
execute fmgui install-package Kaveri Branch-PP MDU-FGT
execute fmgui revision list MDU-FGT</pre>
<pre class="out">Task 1: install finished with status success. <span class="hl">Revision 2 created.</span>

Revision history of MDU-FGT:
ID	CREATED BY	TIME			NAME
1	retrieve	2026-10-12 19:19:34	Retrieved
2	install	2026-10-12 19:19:46	Installed Branch-PP</pre>
<p>Look at two things: the CREATED BY column tells you the kind of event, and the highest ID is the newest state FortiManager knows about. If you ask for a device that was never retrieved, you get a message that it has no revision history.</p>

<h3>Session state and the real product</h3>
<p>In the simulator the history lives in the session. If you save and restore a lab, the configuration tables come back but the revision list starts again. The real product keeps its history in its database, lets you add comments, shows the administrator name, and can revert a device to an older revision. <b>Revert is not modelled here</b>; chapter 6 treats it as theory.</p>

<div class="warn"><p><b>Common mistakes.</b> Expecting an entry for every click: a preview or a package edit adds nothing. Treating revision 1 as "the good configuration": it is only what the device held when it was retrieved. Assuming a failed install left a half-written revision: it did not.</p></div>

<div class="exam"><p><b>Exam traps.</b> Retrieve, install and auto update are the only creators. Revision 1 comes from authorize or add-device. A rejected install does not add a revision. The history is per device, not per ADOM.</p></div>

<div class="scn"><h4>Which install broke Madurai?</h4><p>On Monday morning the Madurai users lost access to the intranet. The network team had two installs the previous week. The engineer ran the revision list of MDU-FGT and saw revisions 2 and 3, both installs, with the times. Comparing the two (chapter 5) showed that revision 3 had removed one policy. The package was corrected and installed again as revision 4.</p><p><b>Lesson:</b> the list gives you the order of events in seconds; the comparison tells you what each event changed.</p></div>

<div class="iv"><p class="q">"What is a revision in FortiManager and what creates one?"</p><p>A numbered snapshot of a managed device configuration. It is created by retrieve (authorize or add device), by a successful install, and by auto update when a local change is taken over. A failed install creates none. Mention that the history is per device and that it is the base for comparison and audit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A revision is a numbered snapshot of one device in the managed scope.</li>
<li>Only retrieve, install and auto update create revisions.</li>
<li>Revision 1 always comes from the retrieve at authorize or add.</li>
<li>A failed install leaves the history unchanged.</li>
<li>In the simulator the history is session state; revert is theory only.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Is chapter mein aap seekhoge.</b> Revision kya hota hai, kaun se teen events ek revision banate hain (retrieve, install aur auto update), device ki revision list kaise padhte hain, aur failed install koi nishan kyun nahi chhodta. <b>Prerequisites:</b> module fmg-start (aap FortiGate ko authorize kar sakte ho, aapko pata hai ki FortiManager har device configuration ki copy rakhta hai) aur fmg-policy se basic policy packages aur install. Drift ya auditing ke baare mein kuch assume nahi kiya gaya.</p></div>

<p>Bank ki passbook socho. Har deposit ya withdrawal ek printed line jodta hai: number, date aur chhota description. Aap koi line mitate nahi, bas agli line jodte ho. FortiManager ki <b>revision history</b> ek FortiGate ki passbook hai. Har line ek moment par device configuration ke managed hisse ki saved copy hai, jisme number, creator, time aur naam hota hai.</p>

<h3>Revision kya hai</h3>
<p><b>Revision</b> ek managed device ki configuration ka numbered snapshot hai, jo FortiManager par store hota hai. Real product mein ye device database mein rehta hai. Is simulator mein snapshot <b>managed scope</b> cover karta hai: system DNS, firewall address, firewall policy aur VPN IPsec phase1 aur phase2. Is scope ke bahar ki cheez revision mein nahi hoti, isliye baad ki comparison mein nahi dikhegi.</p>

<h3>Wo teen events jo revision banate hain</h3>
<table class="cmp"><tr><th>Event</th><th>Created by column</th><th>Naam</th><th>Kab hota hai</th></tr>
<tr><td>Retrieve</td><td>retrieve</td><td>Retrieved</td><td>Jab aap device ko authorize karte ho ya FortiManager side se add karte ho. Ye hamesha revision 1 hota hai.</td></tr>
<tr><td>Install</td><td>install</td><td>Installed (package ka naam)</td><td>Package ya device ke successful install ke baad.</td></tr>
<tr><td>Auto update</td><td>auto update</td><td>Auto-Update</td><td>Jab FortiManager FortiGate par seedha hui change dekhta hai aur use apna leta hai (chapter 3).</td></tr></table>
<p>Aur kuch revision nahi banata. Device dekhna, preview chalana, package edit karna ya template badalna kuch nahi jodta. <b>Failed install</b> bhi kuch nahi banata: simulator kehta hai ki revision history unchanged hai. Investigation mein ye kaam aata hai: list agar nahi badhi to device nahi badla.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="MDU-FGT ke revisions ki timeline">
<line x1="40" y1="70" x2="600" y2="70" stroke="#64748b" stroke-width="2"/>
<circle cx="90" cy="70" r="14" fill="#bae6fd"/><text x="90" y="75" text-anchor="middle" class="svg-ink" font-size="13">1</text>
<circle cx="260" cy="70" r="14" fill="#bbf7d0"/><text x="260" y="75" text-anchor="middle" class="svg-ink" font-size="13">2</text>
<circle cx="430" cy="70" r="14" fill="#fed7aa"/><text x="430" y="75" text-anchor="middle" class="svg-ink" font-size="13">3</text>
<text x="90" y="110" text-anchor="middle" class="svg-ink" font-size="12">retrieve</text><text x="90" y="128" text-anchor="middle" class="svg-muted" font-size="12">authorize</text>
<text x="260" y="110" text-anchor="middle" class="svg-ink" font-size="12">install</text><text x="260" y="128" text-anchor="middle" class="svg-muted" font-size="12">Branch-PP</text>
<text x="430" y="110" text-anchor="middle" class="svg-ink" font-size="12">auto update</text><text x="430" y="128" text-anchor="middle" class="svg-muted" font-size="12">local change</text>
<text x="520" y="40" class="svg-accent" font-size="12">agla revision: 4</text>
</svg><p class="cap">MDU-FGT ki passbook: lines sirf jodi jati hain, hatai nahi jati.</p></div>

<h3>Ye kyun zaroori hai</h3>
<p>Revision list teen roz ke sawalon ka jawab deti hai. FortiManager aur device aakhri baar kab agree the? Kya FortiManager ki peeth peeche kuch badla? Kaun sa install problem laya? Iske bina aap sirf yaad se andaza lagate ho, aur raat ke teen baje yaad kamzor hoti hai.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Retail MDU-FGT ko onboard karta hai: revision 1 turant ban jata hai. Engineer package Branch-PP install karta hai: revision 2. Numbers gin lo to kahani samajh aa jati hai: do revisions matlab sirf onboarding aur ek install hua hai.</p></div>

<h3>List padhna</h3>
<p>Simulator mein command <code>execute fmgui revision list</code> hai, uske baad device ka naam. Authorize aur install ki tarah, ye real product mein GUI ya API action hai; simulator ise <code>execute fmgui</code> command ki tarah deta hai. Times simulator clock ke hain, real time nahi.</p>
<pre class="code"><span class="c">! on FMG-1</span>
execute fmgui install-package Kaveri Branch-PP MDU-FGT
execute fmgui revision list MDU-FGT</pre>
<pre class="out">Task 1: install finished with status success. <span class="hl">Revision 2 created.</span>

Revision history of MDU-FGT:
ID	CREATED BY	TIME			NAME
1	retrieve	2026-10-12 19:19:34	Retrieved
2	install	2026-10-12 19:19:46	Installed Branch-PP</pre>
<p>Do cheezein dekho: CREATED BY column event ki kism batata hai, aur sabse bada ID newest state hai jo FortiManager jaanta hai. Jis device ko kabhi retrieve nahi kiya, uske liye message aata hai ki uski koi revision history nahi hai.</p>

<h3>Session state aur real product</h3>
<p>Simulator mein history session mein rehti hai. Lab save aur restore karo to configuration tables wapas aati hain par revision list dobara shuru hoti hai. Real product history apne database mein rakhta hai, comments jodne deta hai, administrator ka naam dikhata hai, aur device ko purani revision par revert kar sakta hai. <b>Revert yahan model nahi hai</b>; chapter 6 ise sirf theory ki tarah leta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Har click par entry expect karna: preview ya package edit kuch nahi jodta. Revision 1 ko "achhi configuration" maan lena: wo sirf wahi hai jo retrieve ke waqt device ke paas thi. Ye maan lena ki failed install ne adhoori revision likh di: nahi likhi.</p></div>

<div class="exam"><p><b>Exam traps.</b> Retrieve, install aur auto update hi creators hain. Revision 1 authorize ya add-device se aata hai. Rejected install revision nahi jodta. History per device hoti hai, per ADOM nahi.</p></div>

<div class="scn"><h4>Madurai ko kaun se install ne toda?</h4><p>Somvar subah Madurai ke users ka intranet access chala gaya. Network team ne pichhle hafte do installs kiye the. Engineer ne MDU-FGT ki revision list chalayi aur revisions 2 aur 3 dekhe, dono installs, times ke saath. Dono ki comparison (chapter 5) se dikha ki revision 3 ne ek policy hata di thi. Package theek karke dobara install hua, revision 4 bana.</p><p><b>Lesson:</b> list events ka order seconds mein deti hai; comparison batati hai ki har event ne kya badla.</p></div>

<div class="iv"><p class="q">"FortiManager mein revision kya hai aur use kaun banata hai?"</p><p>Managed device configuration ka numbered snapshot. Ye retrieve (authorize ya add device), successful install, aur auto update (jab local change apna li jaye) se banta hai. Failed install koi nahi banata. Ye bhi bolo ki history per device hoti hai aur comparison aur audit ki base hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Revision ek device ka managed scope mein numbered snapshot hai.</li>
<li>Sirf retrieve, install aur auto update revisions banate hain.</li>
<li>Revision 1 hamesha authorize ya add ke retrieve se aata hai.</li>
<li>Failed install history ko unchanged chhodta hai.</li>
<li>Simulator mein history session state hai; revert sirf theory hai.</li>
</ul></div>
`}};export{e as default};