var e={id:`lab-fm-audit`,h:{en:`Lab fm-audit: who changed TRY-FGT and when`,hi:`Lab fm-audit: TRY-FGT ko kisne aur kab badla`},body:{en:`
<p>An auditor visits on Monday morning with a short list of questions and no patience for guesses. This lab prepares you for that meeting. You will create a clean install, let one local change happen, and then answer from the revision list and the revision diff, as you would for a real audit. It takes about 30 minutes. The devices are FMG-1, TRY-FGT and the usual neighbours. Install, revision list and revision diff are GUI or API actions in the real product, and the simulator provides them as <code>execute fmgui</code> commands on FMG-1.</p>

<h3>The goal</h3>
<p>The auditor asks what changed on TRY-FGT after the package was installed and who made the change. You will install Branch-PP on TRY-FGT, create the address LOCAL-LAB (10.9.9.0/24) directly on the FortiGate, wait, list the revisions, diff the install revision against the auto update revision, and name the object that was added and the creator of revision 3.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Audit lab sequence">
<rect x="20" y="40" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="85" y="66" text-anchor="middle" class="svg-ink" font-size="13">install</text><text x="85" y="84" text-anchor="middle" class="svg-muted" font-size="12">revision 2</text>
<rect x="175" y="40" width="130" height="60" rx="8" fill="#fed7aa"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="13">local change</text><text x="240" y="84" text-anchor="middle" class="svg-muted" font-size="12">LOCAL-LAB</text>
<rect x="330" y="40" width="130" height="60" rx="8" fill="#fde68a"/><text x="395" y="66" text-anchor="middle" class="svg-ink" font-size="13">wait</text><text x="395" y="84" text-anchor="middle" class="svg-muted" font-size="12">a few seconds</text>
<rect x="485" y="40" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="550" y="66" text-anchor="middle" class="svg-ink" font-size="13">list + diff</text><text x="550" y="84" text-anchor="middle" class="svg-muted" font-size="12">2 against 3</text>
<line x1="150" y1="70" x2="175" y2="70" stroke="#64748b" stroke-width="2"/><line x1="305" y1="70" x2="330" y2="70" stroke="#64748b" stroke-width="2"/><line x1="460" y1="70" x2="485" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Create the evidence, wait for it to be recorded, then read it.</p></div>

<h3>Task 1: create revision 2</h3>
<p>Install the package Branch-PP on TRY-FGT with <code>execute fmgui install-package</code>. Why do this first? An audit compares two known points, and the install is the last point where FortiManager and the device agreed. Check the result with the revision list for TRY-FGT. You expect two lines: 1 retrieve and 2 install, named "Installed Branch-PP". If the list has only line 1, the install did not happen; read its message.</p>

<h3>Task 2: make the change and wait</h3>
<p>On the TRY-FGT CLI enter <code>config firewall address</code>, edit the entry named LOCAL-LAB, set its subnet to 10.9.9.0 with mask 255.255.255.0, and finish with <code>next</code> and <code>end</code>. Now be patient. FortiManager needs a few seconds to notice and take over the change. In the status you will first see conf out of sync, then dm autoupdated. If you list revisions at once, the list may still show two lines. Wait, and list again.</p>
<pre class="out">Revision history of TRY-FGT:
ID	CREATED BY	TIME			NAME
1	retrieve	2026-10-12 19:19:44	Retrieved
2	install	2026-10-12 19:19:56	Installed Branch-PP
3	<span class="hl">auto update</span>	2026-10-12 19:20:12	Auto-Update</pre>
<p>The three lines already tell the story: onboarding, a managed install, and then a change that came from the device.</p>

<h3>Task 3: diff the right pair</h3>
<p>Use <code>execute fmgui revision diff</code> with the device name and two numbers. Which pair? The question is "what changed after the install", so you want the install revision (2) first and the auto update revision (3) second. The older number comes first. Look for plus lines. You should find exactly one new object name.</p>
<pre class="out">Difference between revision 2 (Installed Branch-PP) and revision 3 (Auto-Update):
<span class="hl">+     edit "LOCAL-LAB"</span>
+         set subnet 10.9.9.0 255.255.255.0
+     next</pre>
<p>The answer for the task is <b>LOCAL-LAB</b>. Try also 1 against 3 to see what a wide comparison looks like. It lists SRV-WEB and the policy LAN-TO-SRV from the install as well as LOCAL-LAB, which is correct but too noisy for the auditor's question.</p>

<h3>Task 4: name the creator</h3>
<p>The creator of revision 3 is shown in the CREATED BY column. It has two words: <b>auto update</b>. Do not write the name of a person or the word "install". The correct reading is "the change was made on the device and taken over by FortiManager's auto update", which also answers the auditor's "how".</p>

<div class="eg"><p><b>Worked example.</b> Write the answer you would give the auditor. "After revision 2 (Installed Branch-PP at 19:19:56), revision 3 was created at 19:20:12 by auto update. The only difference is a new address object, LOCAL-LAB, 10.9.9.0/24. It was typed on TRY-FGT and was not part of the package. The administrator account is in the device event log; the simulator does not show it. Action: import the object into a package or delete it." Five sentences, each backed by output you can show.</p></div>

<h3>Common wrong turns</h3>
<ul>
<li><b>Listing before the wait</b> and concluding that nothing happened.</li>
<li><b>Swapping the numbers</b>, so that the change reads as the wrong way round, or using a number that does not exist, which gives the message Revision not found.</li>
<li><b>Using a device name with a typo</b>: the answer is a message that the device has no revision history.</li>
<li><b>Comparing 1 and 3</b> and then reporting the install content as the unauthorized change.</li>
<li><b>Looking for a person's name</b> in the revision list and deciding the simulator is broken. It records the creator type only.</li>
</ul>

<div class="warn"><p><b>Remember the scope.</b> Only system DNS, firewall address, firewall policy and VPN IPsec appear in the diff. A change to something outside the scope would leave no revision at all.</p></div>

<div class="scn"><h4>The Monday morning audit</h4><p>A retailer's internal auditor asked for proof that no unmanaged object existed on the branch firewalls. The network lead showed the revision lists of all three branches. Two had only retrieve and install revisions. The third had an auto update revision, and its diff showed one address object created locally the week before. The team showed the ticket for it, imported it and closed the finding in under an hour.</p><p><b>Lesson:</b> a revision list with no auto update line is itself evidence.</p></div>

<div class="iv"><p class="q">"An auditor asks who changed a firewall last week. What can FortiManager tell you?"</p><p>When and how: the revision list shows the time and whether the change came from an install or from the device through auto update, and the diff shows exactly what changed. For the person I add the administrator information recorded by the product and the device login logs, because the revision alone is not a user audit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Install first, so that revision 2 is a known good point.</li>
<li>Wait a few seconds after a local change before listing revisions.</li>
<li>Diff the older revision first; the added object LOCAL-LAB shows as plus lines.</li>
<li>The creator of revision 3 is auto update, which means the change came from the device.</li>
<li>Narrow comparisons answer audit questions; wide ones are noisy.</li>
</ul></div>
`,hi:`
<p>Somvar subah auditor chhoti si sawalon ki list lekar aata hai aur andaze ke liye usme sabr nahi. Ye lab aapko us meeting ke liye taiyar karta hai. Aap clean install banaoge, ek local change hone doge, aur phir revision list aur revision diff se jawab doge, jaise real audit mein. Lagbhag 30 minute lagte hain. Devices FMG-1, TRY-FGT aur usual padosi hain. Install, revision list aur revision diff real product mein GUI ya API actions hain, aur simulator unhe FMG-1 par <code>execute fmgui</code> commands ki tarah deta hai.</p>

<h3>Goal</h3>
<p>Auditor poochhta hai ki package install hone ke baad TRY-FGT par kya badla aur kisne badla. Aap TRY-FGT par Branch-PP install karoge, FortiGate par seedha address LOCAL-LAB (10.9.9.0/24) banaoge, wait karoge, revisions list karoge, install revision ka auto update revision se diff karoge, aur jo object joda gaya uska naam aur revision 3 ka creator batayoge.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Audit lab sequence">
<rect x="20" y="40" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="85" y="66" text-anchor="middle" class="svg-ink" font-size="13">install</text><text x="85" y="84" text-anchor="middle" class="svg-muted" font-size="12">revision 2</text>
<rect x="175" y="40" width="130" height="60" rx="8" fill="#fed7aa"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="13">local change</text><text x="240" y="84" text-anchor="middle" class="svg-muted" font-size="12">LOCAL-LAB</text>
<rect x="330" y="40" width="130" height="60" rx="8" fill="#fde68a"/><text x="395" y="66" text-anchor="middle" class="svg-ink" font-size="13">wait</text><text x="395" y="84" text-anchor="middle" class="svg-muted" font-size="12">kuch seconds</text>
<rect x="485" y="40" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="550" y="66" text-anchor="middle" class="svg-ink" font-size="13">list + diff</text><text x="550" y="84" text-anchor="middle" class="svg-muted" font-size="12">2 vs 3</text>
<line x1="150" y1="70" x2="175" y2="70" stroke="#64748b" stroke-width="2"/><line x1="305" y1="70" x2="330" y2="70" stroke="#64748b" stroke-width="2"/><line x1="460" y1="70" x2="485" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Evidence banao, record hone ka intezaar karo, phir padho.</p></div>

<h3>Task 1: revision 2 banao</h3>
<p><code>execute fmgui install-package</code> se package Branch-PP ko TRY-FGT par install karo. Pehle kyun? Audit do known points compare karta hai, aur install wo aakhri point hai jahan FortiManager aur device agree the. Result TRY-FGT ki revision list se check karo. Do lines expect karo: 1 retrieve aur 2 install, naam "Installed Branch-PP". List mein sirf line 1 ho to install hua hi nahi; uska message padho.</p>

<h3>Task 2: change karo aur wait karo</h3>
<p>TRY-FGT CLI mein <code>config firewall address</code> likho, LOCAL-LAB naam ki entry edit karo, subnet 10.9.9.0 mask 255.255.255.0 set karo, aur <code>next</code> aur <code>end</code> se khatam karo. Ab sabr rakho. FortiManager ko change notice karne aur apna lene mein kuch seconds lagte hain. Status mein pehle conf out of sync, phir dm autoupdated dikhega. Turant revisions list karoge to list abhi do lines dikha sakti hai. Wait karo, aur dobara list karo.</p>
<pre class="out">Revision history of TRY-FGT:
ID	CREATED BY	TIME			NAME
1	retrieve	2026-10-12 19:19:44	Retrieved
2	install	2026-10-12 19:19:56	Installed Branch-PP
3	<span class="hl">auto update</span>	2026-10-12 19:20:12	Auto-Update</pre>
<p>Teen lines pehle hi kahani bata deti hain: onboarding, managed install, aur phir device se aayi change.</p>

<h3>Task 3: sahi jodi ka diff karo</h3>
<p>Device naam aur do numbers ke saath <code>execute fmgui revision diff</code> use karo. Kaun si jodi? Sawal hai "install ke baad kya badla", isliye install revision (2) pehle aur auto update revision (3) baad mein chahiye. Purana number pehle. Plus lines dhoondho. Aapko exactly ek naya object naam milna chahiye.</p>
<pre class="out">Difference between revision 2 (Installed Branch-PP) and revision 3 (Auto-Update):
<span class="hl">+     edit "LOCAL-LAB"</span>
+         set subnet 10.9.9.0 255.255.255.0
+     next</pre>
<p>Task ka jawab <b>LOCAL-LAB</b> hai. Wide comparison kaisi dikhti hai ye dekhne ke liye 1 aur 3 bhi try karo. Wo install se SRV-WEB aur policy LAN-TO-SRV ke saath LOCAL-LAB bhi list karta hai, jo sahi hai par auditor ke sawal ke liye bahut noisy.</p>

<h3>Task 4: creator ka naam batao</h3>
<p>Revision 3 ka creator CREATED BY column mein dikhta hai. Ye do words hai: <b>auto update</b>. Kisi insaan ka naam ya shabd "install" mat likho. Sahi reading hai "change device par hui aur FortiManager ke auto update ne apna li", jo auditor ke "kaise" ka jawab bhi hai.</p>

<div class="eg"><p><b>Worked example.</b> Wo jawab likho jo auditor ko doge. "Revision 2 (19:19:56 par Installed Branch-PP) ke baad revision 3 19:20:12 par auto update se bani. Sirf difference ek naya address object hai, LOCAL-LAB, 10.9.9.0/24. Ye TRY-FGT par type hua aur package ka hissa nahi tha. Administrator account device event log mein hai; simulator use nahi dikhata. Action: object ko package mein import karo ya delete karo." Paanch sentences, har ek output se backed jo dikha sakte ho.</p></div>

<h3>Aam galat mod</h3>
<ul>
<li><b>Wait se pehle list karna</b> aur conclude karna ki kuch hua hi nahi.</li>
<li><b>Numbers ulte karna</b>, jisse change ulti direction mein padhi jati hai, ya aisa number use karna jo exist nahi karta, jisse message aata hai Revision not found.</li>
<li><b>Device naam mein typo</b>: jawab ek message hota hai ki device ki revision history nahi hai.</li>
<li><b>1 aur 3 compare karke</b> install ka content unauthorized change ki tarah report karna.</li>
<li><b>Revision list mein insaan ka naam dhoondhna</b> aur simulator ko kharab maan lena. Wo sirf creator type record karta hai.</li>
</ul>

<div class="warn"><p><b>Scope yaad rakho.</b> Diff mein sirf system DNS, firewall address, firewall policy aur VPN IPsec aate hain. Scope ke bahar ki change ka koi revision hi nahi banega.</p></div>

<div class="scn"><h4>Somvar subah ka audit</h4><p>Ek retailer ke internal auditor ne saabit karne ko kaha ki branch firewalls par koi unmanaged object nahi hai. Network lead ne teeno branches ki revision lists dikhayin. Do mein sirf retrieve aur install revisions thi. Teesri mein auto update revision thi, aur uske diff ne pichhle hafte locally bana ek address object dikhaya. Team ne uska ticket dikhaya, use import kiya aur finding ek ghante se kam mein band kar di.</p><p><b>Lesson:</b> auto update line ke bina revision list khud ek saboot hai.</p></div>

<div class="iv"><p class="q">"Auditor poochhta hai pichhle hafte firewall ko kisne badla. FortiManager kya bata sakta hai?"</p><p>Kab aur kaise: revision list time aur ye dikhati hai ki change install se aayi ya device se auto update ke through, aur diff exactly kya badla ye dikhata hai. Insaan ke liye product ki recorded administrator information aur device login logs jodta hoon, kyunki akeli revision user audit nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle install karo, taaki revision 2 known good point ho.</li>
<li>Local change ke baad revisions list karne se pehle kuch seconds wait karo.</li>
<li>Purani revision pehle diff karo; joda gaya object LOCAL-LAB plus lines mein dikhta hai.</li>
<li>Revision 3 ka creator auto update hai, matlab change device se aayi.</li>
<li>Narrow comparisons audit sawalon ka jawab deti hain; wide noisy hoti hain.</li>
</ul></div>
`}};export{e as default};