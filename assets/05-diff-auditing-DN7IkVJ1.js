var e={id:`diff-auditing`,h:{en:`Revision diff and auditing: who changed what and when`,hi:`Revision diff aur auditing: kisne kya aur kab badla`},body:{en:`
<p>When two people edit a school timetable, the principal compares the old printout with the new one, line by line, and circles what is different. Nobody has to remember anything. <b>Revision diff</b> is that circling pen. It compares two stored revisions of one device and prints only the lines that differ. Together with the revision list, it is the main tool of a configuration audit.</p>

<h3>What an audit asks</h3>
<p>An <b>audit</b> is a check, done by someone who did not make the changes, that the configuration is what it should be and that every difference is explained. An auditor usually asks four questions about a device.</p>
<ol>
<li><b>What</b> changed between two points in time?</li>
<li><b>When</b> did each change enter the record?</li>
<li><b>How</b> did it enter: installed by FortiManager, or typed on the device?</li>
<li><b>Who</b> was responsible?</li>
</ol>
<p>The revision list answers when and how. The revision diff answers what. For who, see the limits below.</p>

<h3>The two commands</h3>
<p>Both are GUI or API actions in the real product, offered in the simulator as <code>execute fmgui</code> commands.</p>
<pre class="code"><span class="c">! on FMG-1</span>
execute fmgui revision list TRY-FGT
execute fmgui revision diff TRY-FGT &lt;a&gt; &lt;b&gt;</pre>
<p>The diff takes the device name and two revision numbers, the older first. Lines starting with <code>+</code> exist in the second revision and not in the first. Lines starting with <code>-</code> exist in the first only. Lines without a sign are not shown. The compared text is the managed scope: system DNS, firewall address, firewall policy and VPN IPsec.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Comparing two revisions">
<rect x="40" y="30" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="125" y="56" text-anchor="middle" class="svg-ink" font-size="13">revision 2</text><text x="125" y="75" text-anchor="middle" class="svg-muted" font-size="12">install, Branch-PP</text>
<rect x="430" y="30" width="170" height="60" rx="8" fill="#fed7aa"/><text x="515" y="56" text-anchor="middle" class="svg-ink" font-size="13">revision 3</text><text x="515" y="75" text-anchor="middle" class="svg-muted" font-size="12">auto update</text>
<line x1="210" y1="60" x2="430" y2="60" stroke="#64748b" stroke-width="2"/><text x="320" y="52" text-anchor="middle" class="svg-accent" font-size="12">revision diff 2 3</text>
<rect x="190" y="112" width="260" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="13">+ edit "LOCAL-LAB"</text><text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">the added lines are the answer</text>
</svg><p class="cap">The diff between two neighbouring revisions isolates one event.</p></div>

<h3>A worked audit on TRY-FGT</h3>
<p>The package Branch-PP is installed on TRY-FGT. Later, on the FortiGate itself, someone creates the address LOCAL-LAB with subnet 10.9.9.0/24. After a few seconds FortiManager takes it over. The auditor asks what changed after the install.</p>
<pre class="out">Revision history of TRY-FGT:
ID	CREATED BY	TIME			NAME
1	retrieve	2026-10-12 19:19:44	Retrieved
2	install	2026-10-12 19:19:56	Installed Branch-PP
3	<span class="hl">auto update</span>	2026-10-12 19:20:12	Auto-Update

Difference between revision 2 (Installed Branch-PP) and revision 3 (Auto-Update):
<span class="hl">+     edit "LOCAL-LAB"</span>
+         set subnet 10.9.9.0 255.255.255.0
+     next</pre>
<p>The answer reads like a sentence. Revision 3 was created by auto update, so the change was made directly on the device, not through an install. It added one address object, LOCAL-LAB, 10.9.9.0/24, and nothing else. It entered the record at the time shown. Nobody had to remember anything.</p>
<p>Now compare two revisions that are far apart, for example 1 and 3. The diff then shows everything that arrived since onboarding: SRV-WEB and the policy LAN-TO-SRV from the install, and LOCAL-LAB from the local change. Wide comparisons answer "how does the device differ from the day we took it over"; narrow ones answer "what did this one event do". Auditors usually want narrow ones.</p>

<div class="eg"><p><b>Worked example.</b> Vikram must explain a new open path to the auditor. He lists the revisions of MDU-FGT: 1 retrieve, 2 install, 3 auto update. He diffs 2 and 3, sees the added policy 99 TEMP-SSH with source port1 and service SSH, and writes: "Added locally after the Branch-PP install, recorded by auto update, remove or import by the end of the week." The record and the decision both exist.</p></div>

<h3>Useful messages</h3>
<ul>
<li><code>(no difference)</code> means the two revisions have equal managed text, even if they are different revisions.</li>
<li><code>Revision not found.</code> means one number does not exist. List first, then diff.</li>
<li>A message that the device has no revision history means it was never retrieved or has the wrong name.</li>
</ul>

<h3>The limits of "who"</h3>
<p>In this simulator the list shows the <b>kind of creator</b> (retrieve, install, auto update), not a person's name. For an install you know FortiManager did it; for an auto update you know it came from the device side. In the real product the revision also records the administrator who ran an install, and the FortiGate event log records the account and the address of a local login. Treat the revision as the "what and when", and combine it with logs for the "who". Remember also that the simulator history is session state and is lost on save and restore.</p>

<div class="warn"><p><b>Common mistakes.</b> Reading the diff in the wrong order, so that additions look like removals. Comparing revisions that are not neighbours and blaming one event for several. Assuming the diff covers every setting: it covers the managed scope only. Promising an auditor a person's name from the revision list alone.</p></div>

<div class="exam"><p><b>Exam traps.</b> Diff needs the device and two revision numbers. A plus line is in the second revision. Auto update revisions mean local changes; install revisions mean FortiManager pushes. The history gives what and when, and the creator type gives how.</p></div>

<div class="scn"><h4>The unexplained address object</h4><p>During a yearly review an auditor found an address object LOCAL-LAB in the configuration of a branch FortiGate and asked who approved it. The team listed the revisions, found that it appeared in an auto update revision after the last package install, and diffed the neighbouring revisions to prove that nothing else had changed with it. They then searched the change tickets for that week and found a lab request for the object. The object was either imported into the package or deleted according to the ticket.</p><p><b>Lesson:</b> the revision list and diff turn an argument into a two-minute check.</p></div>

<div class="iv"><p class="q">"How do you prove what changed on a managed firewall between two dates?"</p><p>I list the revisions, choose the two that surround the period, and run a revision diff. The plus and minus lines are the change, the creator column shows whether it came from an install or a local change, and the times give the order. For the person I add the administrator record and the device logs. I mention that narrow comparisons isolate one event.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Revision list gives when and how; revision diff gives what.</li>
<li>Diff compares two revisions of one device, older first, plus lines are additions.</li>
<li>Neighbouring revisions isolate one event; wide comparisons show the whole history.</li>
<li>Only the managed scope is compared.</li>
<li>The simulator shows the creator type, not a person; use logs for who.</li>
</ul></div>
`,hi:`
<p>Jab do log school timetable edit karte hain, principal purani printout ko nayi se line by line compare karta hai aur jo alag hai use circle kar deta hai. Kisi ko kuch yaad nahi rakhna padta. <b>Revision diff</b> wahi circle karne wala pen hai. Ye ek device ki do stored revisions compare karta hai aur sirf alag lines print karta hai. Revision list ke saath ye configuration audit ka main tool hai.</p>

<h3>Audit kya poochhta hai</h3>
<p><b>Audit</b> ek check hai, jo wo vyakti karta hai jisne changes nahi kiye, ki configuration wahi hai jo honi chahiye aur har difference samjhaya ja chuka hai. Auditor aksar device ke baare mein chaar sawal poochhta hai.</p>
<ol>
<li>Do time points ke beech <b>kya</b> badla?</li>
<li>Har change record mein <b>kab</b> aaya?</li>
<li>Wo <b>kaise</b> aaya: FortiManager ne install kiya, ya device par type hua?</li>
<li><b>Kaun</b> zimmedaar tha?</li>
</ol>
<p>Revision list kab aur kaise batati hai. Revision diff kya batata hai. Kaun ke liye neeche limits dekho.</p>

<h3>Do commands</h3>
<p>Dono real product mein GUI ya API actions hain, simulator mein <code>execute fmgui</code> commands ki tarah milte hain.</p>
<pre class="code"><span class="c">! on FMG-1</span>
execute fmgui revision list TRY-FGT
execute fmgui revision diff TRY-FGT &lt;a&gt; &lt;b&gt;</pre>
<p>Diff device ka naam aur do revision numbers leta hai, purani pehle. <code>+</code> se shuru hone wali lines doosri revision mein hain, pehli mein nahi. <code>-</code> wali lines sirf pehli mein hain. Bina sign wali lines dikhai nahi jaati. Compare hone wala text managed scope hai: system DNS, firewall address, firewall policy aur VPN IPsec.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Do revisions ki comparison">
<rect x="40" y="30" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="125" y="56" text-anchor="middle" class="svg-ink" font-size="13">revision 2</text><text x="125" y="75" text-anchor="middle" class="svg-muted" font-size="12">install, Branch-PP</text>
<rect x="430" y="30" width="170" height="60" rx="8" fill="#fed7aa"/><text x="515" y="56" text-anchor="middle" class="svg-ink" font-size="13">revision 3</text><text x="515" y="75" text-anchor="middle" class="svg-muted" font-size="12">auto update</text>
<line x1="210" y1="60" x2="430" y2="60" stroke="#64748b" stroke-width="2"/><text x="320" y="52" text-anchor="middle" class="svg-accent" font-size="12">revision diff 2 3</text>
<rect x="190" y="112" width="260" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="13">+ edit "LOCAL-LAB"</text><text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">added lines hi jawab hain</text>
</svg><p class="cap">Paas ki do revisions ka diff ek event ko alag kar deta hai.</p></div>

<h3>TRY-FGT par ek worked audit</h3>
<p>Package Branch-PP TRY-FGT par installed hai. Baad mein FortiGate par hi koi address LOCAL-LAB, subnet 10.9.9.0/24, banata hai. Kuch seconds baad FortiManager use apna leta hai. Auditor poochhta hai install ke baad kya badla.</p>
<pre class="out">Revision history of TRY-FGT:
ID	CREATED BY	TIME			NAME
1	retrieve	2026-10-12 19:19:44	Retrieved
2	install	2026-10-12 19:19:56	Installed Branch-PP
3	<span class="hl">auto update</span>	2026-10-12 19:20:12	Auto-Update

Difference between revision 2 (Installed Branch-PP) and revision 3 (Auto-Update):
<span class="hl">+     edit "LOCAL-LAB"</span>
+         set subnet 10.9.9.0 255.255.255.0
+     next</pre>
<p>Jawab ek sentence ki tarah padhta hai. Revision 3 auto update ne banayi, isliye change device par seedha hui, install se nahi. Usne ek address object jodha, LOCAL-LAB, 10.9.9.0/24, aur kuch nahi. Wo dikhaye time par record mein aaya. Kisi ko kuch yaad nahi rakhna pada.</p>
<p>Ab door ki do revisions compare karo, jaise 1 aur 3. Diff tab onboarding ke baad ka sab dikhata hai: install se SRV-WEB aur policy LAN-TO-SRV, aur local change se LOCAL-LAB. Wide comparison jawab deti hai "device onboarding ke din se kaise alag hai"; narrow comparison jawab deti hai "is ek event ne kya kiya". Auditors aksar narrow wali chahte hain.</p>

<div class="eg"><p><b>Worked example.</b> Vikram ko auditor ko ek naya open path samjhana hai. Wo MDU-FGT ki revisions list karta hai: 1 retrieve, 2 install, 3 auto update. 2 aur 3 ka diff karta hai, added policy 99 TEMP-SSH source port1 aur service SSH dekhta hai, aur likhta hai: "Branch-PP install ke baad locally jodi gayi, auto update ne record ki, hafte ke end tak remove ya import karni hai." Record aur decision dono maujood hain.</p></div>

<h3>Kaam ke messages</h3>
<ul>
<li><code>(no difference)</code> matlab dono revisions ka managed text barabar hai, chahe revisions alag hon.</li>
<li><code>Revision not found.</code> matlab ek number exist nahi karta. Pehle list karo, phir diff.</li>
<li>Device ki revision history nahi hai wala message matlab use kabhi retrieve nahi kiya gaya ya naam galat hai.</li>
</ul>

<h3>"Kaun" ki limits</h3>
<p>Is simulator mein list <b>creator ki kism</b> (retrieve, install, auto update) dikhati hai, kisi insaan ka naam nahi. Install ke liye pata hai FortiManager ne kiya; auto update ke liye pata hai device side se aaya. Real product mein revision install chalane wale administrator ko bhi record karti hai, aur FortiGate event log local login ka account aur address record karta hai. Revision ko "kya aur kab" maano, aur "kaun" ke liye logs ke saath milao. Ye bhi yaad rakho ki simulator history session state hai aur save aur restore par chali jati hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Diff ko ulte order mein padhna, jisse additions removals jaise dikhte hain. Aisi revisions compare karna jo paas ki nahi hain aur ek event ko kai changes ka doshi maan lena. Ye maan lena ki diff har setting cover karta hai: wo sirf managed scope cover karta hai. Sirf revision list se auditor ko kisi insaan ka naam promise karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Diff ko device aur do revision numbers chahiye. Plus line doosri revision mein hai. Auto update revisions local changes batati hain; install revisions FortiManager ke push batati hain. History kya aur kab deti hai, creator type kaise deta hai.</p></div>

<div class="scn"><h4>Unexplained address object</h4><p>Saalana review mein auditor ko ek branch FortiGate ki configuration mein address object LOCAL-LAB mila aur usne poochha kisne approve kiya. Team ne revisions list ki, dekha ki wo last package install ke baad ek auto update revision mein aaya, aur paas ki revisions ka diff karke saabit kiya ki uske saath aur kuch nahi badla. Phir us hafte ke change tickets mein dhoondha aur object ki lab request mili. Ticket ke hisaab se object package mein import hua ya delete.</p><p><b>Lesson:</b> revision list aur diff behes ko do minute ke check mein badal dete hain.</p></div>

<div class="iv"><p class="q">"Do dates ke beech managed firewall par kya badla, ye kaise saabit karoge?"</p><p>Main revisions list karta hoon, period ko gher lene wali do revisions chunta hoon, aur revision diff chalata hoon. Plus aur minus lines hi change hain, creator column batata hai install se aaya ya local change se, aur times order dete hain. Insaan ke liye administrator record aur device logs jodta hoon. Bolta hoon ki narrow comparisons ek event ko alag karti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Revision list kab aur kaise deti hai; revision diff kya deta hai.</li>
<li>Diff ek device ki do revisions compare karta hai, purani pehle, plus lines additions hain.</li>
<li>Paas ki revisions ek event ko alag karti hain; wide comparisons poori history dikhati hain.</li>
<li>Sirf managed scope compare hota hai.</li>
<li>Simulator creator type dikhata hai, insaan nahi; kaun ke liye logs use karo.</li>
</ul></div>
`}};export{e as default};