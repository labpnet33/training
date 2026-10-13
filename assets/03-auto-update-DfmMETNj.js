var e={id:`auto-update`,h:{en:`Auto update: what FortiManager does with a local change and when`,hi:`Auto update: local change ke saath FortiManager kya karta hai aur kab`},body:{en:`
<p>A shop owner keeps a ledger. If a salesman sells something and forgets to write it in, the owner finds a gap at closing time. A better owner has an assistant who walks around, notices a sale that is not in the ledger, and writes it down within a few moments. The assistant does not approve or reject the sale; he only records it. <b>Auto update</b> is that assistant. It keeps FortiManager's copy of a device equal to reality, but it never decides whether the change was a good idea.</p>

<h3>What auto update does</h3>
<p>When FortiManager sees that the live configuration of a managed device differs from its stored copy, it waits for a short moment to make sure the change is complete, then copies the live configuration into the device database. This takes three steps.</p>
<ol>
<li>The difference is noticed: <code>conf</code> becomes out of sync.</li>
<li>FortiManager waits a few seconds, because an engineer is often still typing and the change should not be copied half finished.</li>
<li>FortiManager takes over the new state: <code>dm</code> becomes autoupdated, a new revision is created (creator "auto update", name Auto-Update), and <code>conf</code> returns to in sync.</li>
</ol>
<p>In the simulator the wait is about three seconds after the change has been noticed. The exact number belongs to the simulator; in the real product the timing depends on the FortiGate reporting the change over the management tunnel. What matters for learning is the order of the three states.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Three moments after a local change">
<rect x="20" y="30" width="180" height="80" rx="8" fill="#fed7aa"/><text x="110" y="55" text-anchor="middle" class="svg-ink" font-size="13">moment 1</text><text x="110" y="75" text-anchor="middle" class="svg-muted" font-size="12">conf: out of sync</text><text x="110" y="93" text-anchor="middle" class="svg-muted" font-size="12">dm: installed</text>
<rect x="230" y="30" width="180" height="80" rx="8" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">moment 2: waiting</text><text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="12">conf: out of sync</text><text x="320" y="93" text-anchor="middle" class="svg-muted" font-size="12">dm: installed</text>
<rect x="440" y="30" width="180" height="80" rx="8" fill="#bbf7d0"/><text x="530" y="55" text-anchor="middle" class="svg-ink" font-size="13">moment 3</text><text x="530" y="75" text-anchor="middle" class="svg-muted" font-size="12">conf: in sync</text><text x="530" y="93" text-anchor="middle" class="svg-muted" font-size="12">dm: autoupdated</text>
<line x1="200" y1="70" x2="230" y2="70" stroke="#64748b" stroke-width="2"/><line x1="410" y1="70" x2="440" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">a few seconds, then revision 3 is written</text>
</svg><p class="cap">The status moves through three states; only the last one has a new revision.</p></div>

<h3>Watching it step by step</h3>
<p>Take the lab fm-drift. Branch-PP is installed on MDU-FGT, then policy 99 TEMP-SSH is typed directly on the FortiGate. Run the status command at once, after one second and after six seconds.</p>
<pre class="out"><span class="c">immediately</span>
	|- STATUS: dev-db: not modified; conf: out of sync; cond: pending; dm: installed; conn: up; source: FMG
	|- vdom:[3]root flags:0 adom:Kaveri pkg:[modified]Branch-PP

<span class="c">one second later: still the same</span>

<span class="c">six seconds later</span>
	|- STATUS: dev-db: not modified; <span class="hl">conf: in sync</span>; cond: pending; <span class="hl">dm: autoupdated</span>; conn: up; source: FMG
	|- vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[modified]Branch-PP</span>

Revision history of MDU-FGT:
ID	CREATED BY	TIME			NAME
1	retrieve	2026-10-12 19:19:34	Retrieved
2	install	2026-10-12 19:19:46	Installed Branch-PP
3	auto update	2026-10-12 19:20:02	Auto-Update</pre>
<p>Read the last status carefully. <code>conf</code> is in sync again, so the first line looks healthy. But <code>cond</code> is still pending and <code>pkg</code> is still modified. Why? FortiManager copied the policy into its <b>device database</b>, which is the record of what the device holds. It did not copy it into the <b>policy package</b> Branch-PP, which is the record of what should be installed. The device database and the package now disagree: the device has policy 99 and the package does not.</p>

<div class="eg"><p><b>Worked example.</b> Priya, a junior engineer, sees the status turn green (conf in sync) and closes the ticket "FortiManager accepted the change". A colleague asks her to check pkg. It still says modified. The honest summary is: "FortiManager recorded the change, but the approved source of truth, the package, still does not contain it." She adds the policy to a package through an import (chapter 4) and the status settles.</p></div>

<h3>Why it matters</h3>
<p>Many people read in sync as "all is well" and relax. That is the central trap of this module. Auto update makes FortiManager <b>informed</b>, not <b>aligned</b>. It gives you a record and a revision to audit. It does not protect the change from the next install.</p>

<div class="warn"><p><b>Common mistakes.</b> Reading dm autoupdated as "the policy is now managed by the package". Running the status once, seeing out of sync, and assuming auto update is broken: wait a few seconds and look again. Expecting a revision to appear at the moment of the change: the revision appears only when FortiManager takes the change over. Expecting auto update to take a change from FortiManager to the device: it only goes from device to FortiManager.</p></div>

<div class="exam"><p><b>Exam traps.</b> Auto update creates a revision and sets dm to autoupdated. It does not change the policy package. After auto update conf is in sync, but cond and pkg can still show pending and modified. Install and auto update are different directions.</p></div>

<div class="scn"><h4>The ticket that closed too early</h4><p>A vendor needed a temporary rule on the Madurai FortiGate and a network engineer typed it locally at night. In the morning the monitoring board showed conf in sync and dm autoupdated, so the shift lead assumed the change was approved and recorded. Three days later a package install for a different reason wiped the rule, and the vendor lost access in the middle of a migration.</p><p><b>Lesson:</b> autoupdated means "recorded", not "protected". Check pkg, and move any needed local rule into a package.</p></div>

<div class="iv"><p class="q">"What does auto update do when someone changes a FortiGate directly?"</p><p>FortiManager notices the difference, waits briefly, then copies the live configuration into the device database and writes a new revision created by auto update. conf returns to in sync and dm shows autoupdated. It does not update the policy package, so a later install can remove the change. Add that you would review the revision and decide to import or revert the change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Auto update copies a local change from the FortiGate into the device database after a few seconds.</li>
<li>It creates a revision with the creator "auto update" and sets dm to autoupdated.</li>
<li>conf returns to in sync, but pkg can remain modified and cond pending.</li>
<li>Auto update records the change; it does not add it to a policy package.</li>
<li>Check the status again after a few seconds before drawing conclusions.</li>
</ul></div>
`,hi:`
<p>Ek dukaandar ledger rakhta hai. Agar salesman kuch bechta hai aur likhna bhool jata hai to closing ke waqt gap milta hai. Behtar dukaandar ke paas assistant hota hai jo ghoomta hai, ledger mein na likhi hui sale dekhta hai, aur kuch hi pal mein likh deta hai. Assistant sale ko approve ya reject nahi karta; sirf record karta hai. <b>Auto update</b> wahi assistant hai. Ye FortiManager ki copy ko reality ke barabar rakhta hai, par kabhi decide nahi karta ki change achhi thi ya nahi.</p>

<h3>Auto update kya karta hai</h3>
<p>Jab FortiManager dekhta hai ki managed device ki live configuration uski stored copy se alag hai, to wo thodi der wait karta hai taaki change poori ho jaye, phir live configuration ko device database mein copy kar leta hai. Ye teen steps mein hota hai.</p>
<ol>
<li>Difference notice hota hai: <code>conf</code> out of sync ho jata hai.</li>
<li>FortiManager kuch seconds wait karta hai, kyunki engineer aksar abhi type kar raha hota hai aur change adhoori copy nahi honi chahiye.</li>
<li>FortiManager nayi state apna leta hai: <code>dm</code> autoupdated ho jata hai, nayi revision banti hai (creator "auto update", naam Auto-Update), aur <code>conf</code> wapas in sync ho jata hai.</li>
</ol>
<p>Simulator mein wait change notice hone ke baad lagbhag teen seconds ka hai. Exact number simulator ka hai; real product mein timing is par depend karti hai ki FortiGate management tunnel par change kab report karta hai. Seekhne ke liye teen states ka order zaroori hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Local change ke baad teen moments">
<rect x="20" y="30" width="180" height="80" rx="8" fill="#fed7aa"/><text x="110" y="55" text-anchor="middle" class="svg-ink" font-size="13">moment 1</text><text x="110" y="75" text-anchor="middle" class="svg-muted" font-size="12">conf: out of sync</text><text x="110" y="93" text-anchor="middle" class="svg-muted" font-size="12">dm: installed</text>
<rect x="230" y="30" width="180" height="80" rx="8" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">moment 2: wait</text><text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="12">conf: out of sync</text><text x="320" y="93" text-anchor="middle" class="svg-muted" font-size="12">dm: installed</text>
<rect x="440" y="30" width="180" height="80" rx="8" fill="#bbf7d0"/><text x="530" y="55" text-anchor="middle" class="svg-ink" font-size="13">moment 3</text><text x="530" y="75" text-anchor="middle" class="svg-muted" font-size="12">conf: in sync</text><text x="530" y="93" text-anchor="middle" class="svg-muted" font-size="12">dm: autoupdated</text>
<line x1="200" y1="70" x2="230" y2="70" stroke="#64748b" stroke-width="2"/><line x1="410" y1="70" x2="440" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">kuch seconds, phir revision 3 likhi jati hai</text>
</svg><p class="cap">Status teen states se guzarta hai; nayi revision sirf aakhri state mein hoti hai.</p></div>

<h3>Step by step dekhna</h3>
<p>Lab fm-drift lo. MDU-FGT par Branch-PP install hai, phir policy 99 TEMP-SSH seedha FortiGate par type hui. Status command turant, ek second baad aur chhe seconds baad chalao.</p>
<pre class="out"><span class="c">turant</span>
	|- STATUS: dev-db: not modified; conf: out of sync; cond: pending; dm: installed; conn: up; source: FMG
	|- vdom:[3]root flags:0 adom:Kaveri pkg:[modified]Branch-PP

<span class="c">ek second baad: wahi</span>

<span class="c">chhe seconds baad</span>
	|- STATUS: dev-db: not modified; <span class="hl">conf: in sync</span>; cond: pending; <span class="hl">dm: autoupdated</span>; conn: up; source: FMG
	|- vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[modified]Branch-PP</span>

Revision history of MDU-FGT:
ID	CREATED BY	TIME			NAME
1	retrieve	2026-10-12 19:19:34	Retrieved
2	install	2026-10-12 19:19:46	Installed Branch-PP
3	auto update	2026-10-12 19:20:02	Auto-Update</pre>
<p>Aakhri status dhyaan se padho. <code>conf</code> phir in sync hai, isliye pehli line healthy dikhti hai. Par <code>cond</code> abhi pending hai aur <code>pkg</code> abhi modified hai. Kyun? FortiManager ne policy ko <b>device database</b> mein copy kiya, jo record hai ki device ke paas kya hai. Usne use <b>policy package</b> Branch-PP mein copy nahi kiya, jo record hai ki kya install hona chahiye. Ab device database aur package disagree karte hain: device ke paas policy 99 hai aur package ke paas nahi.</p>

<div class="eg"><p><b>Worked example.</b> Priya, junior engineer, status green (conf in sync) dekhti hai aur ticket "FortiManager ne change accept kar liya" likhkar band kar deti hai. Ek colleague kehta hai pkg check karo. Wo abhi bhi modified hai. Sahi summary hai: "FortiManager ne change record kar li, par approved source of truth, yaani package, mein wo abhi bhi nahi hai." Wo import (chapter 4) se policy ko package mein jodti hai aur status settle ho jata hai.</p></div>

<h3>Ye kyun zaroori hai</h3>
<p>Bahut log in sync ko "sab theek" padhkar relax ho jate hain. Ye is module ka central trap hai. Auto update FortiManager ko <b>informed</b> banata hai, <b>aligned</b> nahi. Ye aapko record aur audit ke liye revision deta hai. Ye change ko agle install se nahi bachata.</p>

<div class="warn"><p><b>Common mistakes.</b> Dm autoupdated ko "policy ab package manage karta hai" padhna. Status ek baar chalakar out of sync dekhna aur maan lena ki auto update toota hai: kuch seconds wait karo aur dobara dekho. Change ke moment par revision expect karna: revision tabhi aati hai jab FortiManager change apna leta hai. Ye expect karna ki auto update FortiManager se device ki taraf change le jayega: wo sirf device se FortiManager ki taraf jata hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Auto update revision banata hai aur dm ko autoupdated karta hai. Ye policy package nahi badalta. Auto update ke baad conf in sync hota hai, par cond aur pkg pending aur modified reh sakte hain. Install aur auto update alag directions hain.</p></div>

<div class="scn"><h4>Ticket jo bahut jaldi band hua</h4><p>Ek vendor ko Madurai FortiGate par temporary rule chahiye tha aur network engineer ne raat ko locally type kar diya. Subah monitoring board par conf in sync aur dm autoupdated dikha, to shift lead ne maan liya ki change approved aur recorded hai. Teen din baad kisi aur wajah se package install ne rule mita diya, aur migration ke beech vendor ka access chala gaya.</p><p><b>Lesson:</b> autoupdated ka matlab "recorded" hai, "protected" nahi. Pkg check karo, aur zaroori local rule ko package mein le jao.</p></div>

<div class="iv"><p class="q">"Koi FortiGate ko seedha badle to auto update kya karta hai?"</p><p>FortiManager difference notice karta hai, thodi der wait karta hai, phir live configuration ko device database mein copy karta hai aur auto update se bani nayi revision likhta hai. conf wapas in sync, dm autoupdated. Ye policy package update nahi karta, isliye baad ka install change hata sakta hai. Jodo ki aap revision review karke import ya revert ka decision loge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Auto update kuch seconds baad local change ko FortiGate se device database mein copy karta hai.</li>
<li>Ye creator "auto update" ki revision banata hai aur dm ko autoupdated karta hai.</li>
<li>conf in sync ho jata hai, par pkg modified aur cond pending reh sakte hain.</li>
<li>Auto update change record karta hai; policy package mein nahi jodta.</li>
<li>Conclusion se pehle kuch seconds baad status dobara dekho.</li>
</ul></div>
`}};export{e as default};