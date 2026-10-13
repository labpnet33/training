var e={id:`backup-restore-upgrade`,h:{en:`Snapshots, rollback, backup and upgrade (concept)`,hi:`Snapshots, rollback, backup aur upgrade (concept)`},body:{en:`
<p>Every engineer eventually installs a policy that breaks something. What separates a calm engineer from a panicking one is a way back. This chapter has two halves. The first half is <b>modelled and practised</b> in lab fp-ops-3: policy snapshots and Restore to SMC. The second half, backup and upgrade, is <b>concept only</b> and is not run in the simulator.</p>

<h3>Analogy: photocopying the rulebook before each change</h3>
<p>Before the manager changes the gate rulebook, the clerk photocopies the current version and files it with a revision number. If the new rules cause chaos, the clerk takes the last good copy from the file, puts it on the manager desk, and the manager signs it again. Two steps: fetch the copy, sign it. Nothing changes at the gate until the signature.</p>

<h3>Policy snapshots</h3>
<p>Each successful Install policy stores a <b>policy snapshot</b> with a revision number. It records the policies and inspection policies as they were at that install. The simulator keeps the last six per engine, so you can go back up to six installs. A failed install changes nothing and stores nothing, because validation rolls back. Warnings (a shadowed rule, allow any-any-any) do not block an install, but they are worth reading, since they often explain the next ticket.</p>
<p>The Monitoring and alerts page lists the snapshots of an engine with revision, time and policy name. You can see which revision is installed and compare it with what you are editing.</p>

<h3>Restore to SMC, then Install</h3>
<p><b>Restore to SMC</b> takes a chosen snapshot and copies its policy content back into the SMC database. It does <b>not</b> touch the engine. The engine keeps running the bad installed policy until you press Install policy. That is the same boundary you learned in the first module: the SMC is where you edit, the installed snapshot is what runs.</p>
<ol>
<li>Confirm the problem: logs show traffic denied by a rule that did not exist in the older revision.</li>
<li>Open the snapshots of the engine and pick the last good revision.</li>
<li>Use Restore to SMC. The audit trail records that the revision was restored but not installed.</li>
<li>Review the pending changes shown by the Install policy bar. This is your safety check.</li>
<li>Install policy. A new revision is created (the engine moves forward, with old content).</li>
<li>Test with the same traffic that failed, and read the new log line.</li>
</ol>
<p>Note the last point of step 5: a rollback is a <b>new install</b> with old content, so the revision number goes up. It does not rewind the counter.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Rollback with snapshots">
<rect x="20" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="13">Rev 5 good</text>
<rect x="160" y="60" width="110" height="60" rx="8" fill="#fed7aa"/><text x="215" y="95" text-anchor="middle" class="svg-ink" font-size="13">Rev 6 bad</text>
<rect x="320" y="60" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="385" y="85" text-anchor="middle" class="svg-ink" font-size="13">SMC database</text><text x="385" y="105" text-anchor="middle" class="svg-muted" font-size="12">holds rev 5 text</text>
<rect x="500" y="60" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="85" text-anchor="middle" class="svg-ink" font-size="13">Rev 7</text><text x="560" y="105" text-anchor="middle" class="svg-muted" font-size="12">content of rev 5</text>
<line x1="270" y1="90" x2="320" y2="90" stroke="#64748b" stroke-width="2"/><line x1="450" y1="90" x2="500" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="295" y="50" text-anchor="middle" class="svg-accent" font-size="12">Restore to SMC</text><text x="475" y="50" text-anchor="middle" class="svg-accent" font-size="12">Install</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">between the two steps the engine still runs revision 6</text>
</svg><p class="cap">Restore changes the SMC, Install changes the engine. Between them, the engine is unchanged.</p></div>

<div class="eg"><p><b>Worked example (fp-ops-3).</b> At 11:05 an engineer installs revision 6 with a new rule above the Staff web rule. At 11:07 Staff cannot browse. Logs show Discard by the new rule 4. Rollback: open the snapshots, choose revision 5, Restore to SMC, check the pending changes (rule 4 will disappear), Install policy, retest from STAFF-PC at 10.1.1.10. Browsing works; the log shows Allow by the original rule. Revision 7 now sits at the top of the list.</p></div>

<h3>Discard pending changes is not rollback</h3>
<p>If you only edited and have not installed, you can discard the pending edits of the engine and return the SMC to the installed state. That is for unsaved experiments. Once a bad policy has been installed, you need a snapshot.</p>

<h3>Backup and restore (concept)</h3>
<p><b>Reference configuration (not run in the simulator).</b> A real deployment backs up the SMC database, the Log Server data and engine configuration on a schedule and stores the files off the server. Restore means loading a backup into a clean or damaged SMC and then re-establishing contact where needed. Policy snapshots are small, quick and per engine; backups are whole-system. They answer different questions: "undo the last change" versus "recover from loss". The exact tools, file formats and steps depend on your NGFW version, so check the documentation for your NGFW version.</p>

<h3>Upgrade (concept)</h3>
<p><b>Reference configuration (not run in the simulator).</b> A careful upgrade has a pattern that you can describe in interviews: read the release notes and the supported upgrade path, take a backup, upgrade the SMC first (a newer SMC can usually manage older engines within a supported range), upgrade one engine node at a time in a cluster so that service continues, verify the node, then move to the next. In a standby cluster, you put the node you are not upgrading in charge, upgrade its partner, then switch. After each stage you confirm contact, status and the installed policy. Version compatibility is not modelled; check the documentation for your NGFW version.</p>

<div class="warn"><p><b>Common mistake.</b> Thinking Restore to SMC fixes the engine. It only prepares the SMC. Also, forgetting that only the last six snapshots are kept in the lab: a very old revision may no longer exist.</p></div>

<div class="exam"><p><b>Exam trap.</b> Snapshot restore needs two steps, restore and install. Backup is not the same as a snapshot. In an upgrade, the management server comes before the engines.</p></div>

<div class="scn"><h4>Friday evening rule</h4><p>On a Friday at 6 pm, a colleague pushed a policy to tighten DMZ access. Fifteen minutes later the branch call centre could not reach the web portal. Instead of editing under pressure, the on-call engineer opened the snapshots, restored the previous revision to the SMC, checked that exactly one rule would disappear, installed, and tested. Service returned in four minutes. The next morning the team fixed the real rule calmly in the SMC and installed it again.</p><p><b>Lesson:</b> restore first, investigate later.</p></div>

<div class="iv"><p class="q">"You installed a policy and users are down. What do you do?"</p><p>Strong answer: confirm with the logs that the new policy is the cause, restore the previous snapshot to the SMC, check pending changes, install, retest, then investigate offline. Say that a rollback creates a new revision, and that Restore alone does not change the engine.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Each successful install stores a numbered policy snapshot; the lab keeps six.</li>
<li>Restore to SMC copies a snapshot into the SMC; the engine changes only after Install policy.</li>
<li>A rollback is a new install, so the revision number increases.</li>
<li>Backup and upgrade are reference concepts here; follow your version documentation.</li>
<li>Upgrade order: backup, SMC first, then one cluster node at a time.</li>
</ul></div>
`,hi:`
<p>Har engineer kabhi na kabhi aisi policy install karta hai jo kuch tod deti hai. Shant engineer aur ghabraye engineer mein farak wapas jaane ka rasta hai. Is chapter ke do hisse hain. Pehla hissa lab fp-ops-3 mein <b>model aur practise</b> hota hai: policy snapshots aur Restore to SMC. Doosra hissa, backup aur upgrade, sirf <b>concept</b> hai aur simulator mein run nahi hota.</p>

<h3>Analogy: har change se pehle rulebook ki photocopy</h3>
<p>Manager gate ka rulebook badalne se pehle, clerk current version ki photocopy karke revision number ke saath file mein rakhta hai. Naye rules se chaos ho jaye to clerk file se last good copy nikalta hai, manager ki desk par rakhta hai, aur manager use dobara sign karta hai. Do steps: copy lao, sign karo. Signature tak gate par kuch nahi badalta.</p>

<h3>Policy snapshots</h3>
<p>Har successful Install policy ek revision number ke saath <b>policy snapshot</b> store karta hai. Isme us install ke waqt ki policies aur inspection policies hoti hain. Simulator har engine ke liye aakhri chhe rakhta hai, isliye aap chhe installs tak peeche ja sakte ho. Failed install kuch nahi badalta aur kuch store nahi karta, kyunki validation rollback kar deta hai. Warnings (shadowed rule, allow any-any-any) install block nahi karti, lekin padhne layak hain, kyunki woh aksar agle ticket ki wajah batati hain.</p>
<p>Monitoring and alerts page engine ke snapshots revision, time aur policy name ke saath dikhata hai. Aap dekh sakte ho ki kaunsi revision installed hai aur use apne edit se compare kar sakte ho.</p>

<h3>Restore to SMC, phir Install</h3>
<p><b>Restore to SMC</b> chuna hua snapshot lekar uska policy content SMC database mein wapas copy karta hai. Yeh engine ko <b>nahi</b> chhuta. Engine bad installed policy chalata rehta hai jab tak aap Install policy na dabao. Yeh wahi boundary hai jo aapne pehle module mein seekhi: SMC mein edit hota hai, installed snapshot chalta hai.</p>
<ol>
<li>Problem confirm karo: logs dikhate hain ki traffic aise rule se deny hua jo purani revision mein nahi tha.</li>
<li>Engine ke snapshots kholo aur last good revision chuno.</li>
<li>Restore to SMC use karo. Audit trail likhta hai ki revision restore hui lekin install nahi hui.</li>
<li>Install policy bar mein dikhe pending changes review karo. Yeh aapka safety check hai.</li>
<li>Install policy. Nayi revision banti hai (engine aage badhta hai, purane content ke saath).</li>
<li>Usi traffic se test karo jo fail hua tha, aur nayi log line padho.</li>
</ol>
<p>Step 5 ka aakhri point note karo: rollback purane content ke saath ek <b>naya install</b> hai, isliye revision number badhta hai. Counter peeche nahi jata.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Snapshots ke saath rollback">
<rect x="20" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="13">Rev 5 good</text>
<rect x="160" y="60" width="110" height="60" rx="8" fill="#fed7aa"/><text x="215" y="95" text-anchor="middle" class="svg-ink" font-size="13">Rev 6 bad</text>
<rect x="320" y="60" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="385" y="85" text-anchor="middle" class="svg-ink" font-size="13">SMC database</text><text x="385" y="105" text-anchor="middle" class="svg-muted" font-size="12">rev 5 ka text</text>
<rect x="500" y="60" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="85" text-anchor="middle" class="svg-ink" font-size="13">Rev 7</text><text x="560" y="105" text-anchor="middle" class="svg-muted" font-size="12">rev 5 ka content</text>
<line x1="270" y1="90" x2="320" y2="90" stroke="#64748b" stroke-width="2"/><line x1="450" y1="90" x2="500" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="295" y="50" text-anchor="middle" class="svg-accent" font-size="12">Restore to SMC</text><text x="475" y="50" text-anchor="middle" class="svg-accent" font-size="12">Install</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">dono steps ke beech engine abhi bhi revision 6 chalata hai</text>
</svg><p class="cap">Restore SMC badalta hai, Install engine badalta hai. Dono ke beech engine unchanged rehta hai.</p></div>

<div class="eg"><p><b>Worked example (fp-ops-3).</b> 11:05 par engineer revision 6 install karta hai jisme Staff web rule ke upar naya rule hai. 11:07 par Staff browse nahi kar pa raha. Logs naye rule 4 se Discard dikhate hain. Rollback: snapshots kholo, revision 5 chuno, Restore to SMC, pending changes check karo (rule 4 gayab hoga), Install policy, 10.1.1.10 wale STAFF-PC se retest. Browsing chalti hai; log original rule se Allow dikhata hai. Revision 7 ab list ke top par hai.</p></div>

<h3>Discard pending changes rollback nahi hai</h3>
<p>Agar aapne sirf edit kiya hai aur install nahi kiya, to engine ke pending edits discard karke SMC ko installed state par la sakte ho. Yeh unsaved experiments ke liye hai. Bad policy install ho chuki ho to snapshot chahiye.</p>

<h3>Backup aur restore (concept)</h3>
<p><b>Reference configuration (not run in the simulator).</b> Real deployment SMC database, Log Server data aur engine configuration ka schedule par backup leta hai aur files server ke bahar rakhta hai. Restore ka matlab backup ko clean ya damaged SMC mein load karna aur zaroorat par contact dobara establish karna. Policy snapshots chhote, tez aur per engine hain; backups poore system ke hain. Yeh alag sawalon ka jawab dete hain: "last change undo karo" versus "loss se recover karo". Exact tools, file formats aur steps aapke NGFW version par depend karte hain, isliye apne NGFW version ki documentation check karo.</p>

<h3>Upgrade (concept)</h3>
<p><b>Reference configuration (not run in the simulator).</b> Careful upgrade ka ek pattern hai jo aap interview mein bata sakte ho: release notes aur supported upgrade path padho, backup lo, pehle SMC upgrade karo (naya SMC aam taur par supported range mein purane engines manage kar sakta hai), cluster mein ek time par ek engine node upgrade karo taaki service chalti rahe, node verify karo, phir agle par jao. Standby cluster mein, jis node ko upgrade nahi kar rahe use charge do, uska partner upgrade karo, phir switch karo. Har stage ke baad contact, status aur installed policy confirm karo. Version compatibility model nahi hai; apne NGFW version ki documentation check karo.</p>

<div class="warn"><p><b>Common galti.</b> Sochna ki Restore to SMC engine ko theek kar deta hai. Yeh sirf SMC ko taiyar karta hai. Aur yeh bhulna ki lab mein sirf aakhri chhe snapshots rakhe jate hain: bahut purani revision shayad exist hi na kare.</p></div>

<div class="exam"><p><b>Exam trap.</b> Snapshot restore ke do steps hain, restore aur install. Backup snapshot ke barabar nahi hai. Upgrade mein management server engines se pehle aata hai.</p></div>

<div class="scn"><h4>Friday shaam ka rule</h4><p>Friday ko shaam 6 baje ek colleague ne DMZ access tight karne wali policy push ki. Pandrah minute baad branch ka call centre web portal tak nahi pahunch paya. Dabav mein edit karne ke bajaye on-call engineer ne snapshots kholi, pichli revision SMC mein restore ki, check kiya ki exactly ek rule hatega, install kiya aur test kiya. Service chaar minute mein wapas aa gayi. Agli subah team ne asli rule ko SMC mein shanti se theek kiya aur dobara install kiya.</p><p><b>Seekh:</b> pehle restore, baad mein investigate.</p></div>

<div class="iv"><p class="q">"Aapne policy install ki aur users down hain. Kya karoge?"</p><p>Strong answer: logs se confirm karo ki nayi policy cause hai, pichla snapshot SMC mein restore karo, pending changes check karo, install karo, retest karo, phir offline investigate karo. Batao ki rollback nayi revision banata hai, aur akela Restore engine ko nahi badalta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har successful install ek numbered policy snapshot store karta hai; lab chhe rakhta hai.</li>
<li>Restore to SMC snapshot ko SMC mein copy karta hai; engine Install policy ke baad hi badalta hai.</li>
<li>Rollback ek naya install hai, isliye revision number badhta hai.</li>
<li>Backup aur upgrade yahan reference concepts hain; apne version ki documentation follow karo.</li>
<li>Upgrade order: backup, pehle SMC, phir ek time par ek cluster node.</li>
</ul></div>
`}};export{e as default};