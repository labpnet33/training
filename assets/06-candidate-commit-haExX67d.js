var e={id:`candidate-commit`,h:{en:`Candidate configuration, commit and validation`,hi:`Candidate configuration, commit aur validation`},body:{en:`
<p><b>Analogy: a draft and a publish button.</b> If you used the Junos or "document with a Publish button" idea earlier in the academy, you already know it. PAN-OS keeps two copies of the configuration. The <b>running configuration</b> is what the firewall enforces now. The <b>candidate configuration</b> is your working draft. Every <code>set</code> or <code>delete</code> changes only the candidate. Nothing touches traffic until you <b>commit</b>.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Candidate and running configuration">
<rect x="20" y="40" width="190" height="70" rx="10" fill="#fde68a"/><text x="115" y="70" text-anchor="middle" class="svg-ink" font-size="14">Candidate</text><text x="115" y="92" text-anchor="middle" class="svg-muted" font-size="12">set, delete, edit</text>
<rect x="250" y="40" width="190" height="70" rx="10" fill="#bbf7d0"/><text x="345" y="70" text-anchor="middle" class="svg-ink" font-size="14">Running</text><text x="345" y="92" text-anchor="middle" class="svg-muted" font-size="12">enforced on traffic</text>
<rect x="480" y="40" width="150" height="70" rx="10" fill="#e2e8f0"/><text x="555" y="70" text-anchor="middle" class="svg-ink" font-size="14">Commit job</text><text x="555" y="92" text-anchor="middle" class="svg-muted" font-size="12">validate, then apply</text>
<line x1="210" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><text x="230" y="65" text-anchor="middle" class="svg-accent" font-size="12">commit</text>
<path d="M345 110 Q345 145 115 145 Q115 125 115 110" fill="none" stroke="#64748b" stroke-width="2"/><text x="230" y="158" text-anchor="middle" class="svg-muted" font-size="12">revert config</text>
</svg><p class="cap">Edit the candidate; commit validates and applies it; revert config throws the draft away.</p></div>

<h3>Seeing the difference</h3>
<p>From operational mode you can print either copy. Here the hostname was changed in the candidate but not committed (output in <code>set</code> format):</p>
<pre class="out">admin@PA1&gt; show config candidate
<span class="hl">set deviceconfig system hostname NK-PUNE-PA</span>
set network virtual-router default

admin@PA1&gt; show config running
<span class="hl">set deviceconfig system hostname PA1</span>
set network virtual-router default</pre>
<p>The firewall is still called PA1 on the wire and in its prompt. The candidate already says NK-PUNE-PA. Inside configure mode, <code>show</code> prints the candidate.</p>

<h3>Commit validates the whole candidate</h3>
<p>A commit is an all-or-nothing job. First PAN-OS validates the candidate. If anything is invalid, <b>nothing</b> is applied. This simulator capture shows a rule that names a zone with a typo, and a zone that refers to an interface that is not configured as Layer 3:</p>
<pre class="out">admin@PA1# set zone trust network layer3 ethernet1/2
admin@PA1# set rulebase security rules Allow-Out from trustt to untrust application any action allow
admin@PA1# commit

Validation Error:
 zone -&gt; trust -&gt; network -&gt; layer3  'ethernet1/2' is not a valid reference
 rulebase -&gt; security -&gt; rules -&gt; Allow-Out source is missing
 rulebase -&gt; security -&gt; rules -&gt; Allow-Out destination is missing
 rulebase -&gt; security -&gt; rules -&gt; Allow-Out service is missing
 <span class="hl">rulebase -&gt; security -&gt; rules -&gt; Allow-Out from 'trustt' is not a valid reference</span>
 rulebase -&gt; security -&gt; rules -&gt; Allow-Out to 'untrust' is not a valid reference
Commit failed</pre>
<p>Read it as a to-do list. Each line is a path in the tree and a reason. Required fields (source, destination, service) were missing, <code>trustt</code> is a misspelt zone, and the zones do not exist yet. Fix the candidate and commit again. The running configuration was never touched.</p>

<h3>A successful commit is a job</h3>
<pre class="out">admin@PA1# commit

Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>

admin@PA1&gt; show jobs all
Enqueued              Dequeued              ID    Type        Status  Result  Completed
-----------------------------------------------------------------------------------------------
2026-10-02 03:43:46   2026-10-02 03:43:46   3     Commit      FIN     OK      2026-10-02 03:43:46</pre>
<p>Every commit has a job ID. <code>show jobs all</code> lists them with status (FIN = finished) and result (OK or FAIL). On a real firewall the commit also compiles the policy for the data plane, which is why a large rulebase takes longer.</p>

<h3>Undoing, and what the simulator does not have</h3>
<p>To throw away uncommitted edits, use <code>revert config</code> in configure mode. The simulator replies "Candidate configuration reverted to the running configuration". Real PAN-OS also offers: <code>save config to</code> a named snapshot, <code>load config</code> from a snapshot or an earlier version, <code>validate full</code> (check without applying), <code>commit force</code>, a <b>commit lock</b> so two admins do not collide, and a configuration audit that compares versions. These real commands are not implemented in the simulator, so practise the core flow here and learn the extras from the product documentation.</p>

<div class="eg"><p><b>Worked example.</b> At 10:00 you add a DMZ interface and a rule. At 10:05 a colleague also edits the candidate and commits. On a real firewall a plain commit applies <i>all</i> pending candidate changes of all admins unless you use a partial commit by admin. This is why teams use commit locks and change windows. Always review what is pending before you press commit.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing set commands and forgetting to commit, then wondering why the network did not change. Committing with someone else's half-finished edits in the candidate. Assuming a failed commit applied part of the change: it applied none.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which configuration does the firewall enforce?" Running. "Where do set commands write?" Candidate. "What happens if the candidate has one invalid reference?" The whole commit fails.</p></div>

<div class="scn"><h4>The rule that only worked after lunch</h4><p>An engineer added a rule at 11:50 and tested at 12:10 with no effect. He had not committed. A colleague, who needed an unrelated change, committed at 13:30 and the rule suddenly went live, also publishing the half-tested rule to the whole company. After that the team adopted commit locks and a rule: commit your own work, immediately, and read the pending changes first.</p><p><b>Lesson:</b> the candidate is shared between admins, and commit is a deliberate act.</p></div>

<div class="iv"><p class="q">"Explain candidate versus running configuration and what a commit does."</p><p>Running is what the firewall enforces; candidate is the editable draft. A commit validates the candidate as a whole and, if valid, makes it the running configuration; if anything is invalid it fails and changes nothing. Mention commit jobs, locks and partial commits, and that Panorama pushes configuration to firewalls with its own commit and push.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>set and delete change the candidate only; commit makes it running.</li>
<li>Validation is all or nothing; read the error list line by line.</li>
<li>show jobs all lists commit jobs and their results.</li>
<li>revert config discards uncommitted edits.</li>
<li>Review pending changes and use locks when several admins share a firewall.</li>
</ul></div>
`,hi:`
<p><b>Analogy: draft aur publish button.</b> Agar aapne academy mein pehle Junos ya "Publish button wale document" ka idea dekha hai to aap yeh jaante ho. PAN-OS configuration ki do copies rakhta hai. <b>Running configuration</b> woh hai jo firewall abhi enforce kar raha hai. <b>Candidate configuration</b> aapka working draft hai. Har <code>set</code> ya <code>delete</code> sirf candidate badalta hai. Jab tak aap <b>commit</b> nahi karte, traffic ko kuch nahi chhuta.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Candidate aur running configuration">
<rect x="20" y="40" width="190" height="70" rx="10" fill="#fde68a"/><text x="115" y="70" text-anchor="middle" class="svg-ink" font-size="14">Candidate</text><text x="115" y="92" text-anchor="middle" class="svg-muted" font-size="12">set, delete, edit</text>
<rect x="250" y="40" width="190" height="70" rx="10" fill="#bbf7d0"/><text x="345" y="70" text-anchor="middle" class="svg-ink" font-size="14">Running</text><text x="345" y="92" text-anchor="middle" class="svg-muted" font-size="12">traffic par enforce</text>
<rect x="480" y="40" width="150" height="70" rx="10" fill="#e2e8f0"/><text x="555" y="70" text-anchor="middle" class="svg-ink" font-size="14">Commit job</text><text x="555" y="92" text-anchor="middle" class="svg-muted" font-size="12">validate, phir apply</text>
<line x1="210" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><text x="230" y="65" text-anchor="middle" class="svg-accent" font-size="12">commit</text>
<path d="M345 110 Q345 145 115 145 Q115 125 115 110" fill="none" stroke="#64748b" stroke-width="2"/><text x="230" y="158" text-anchor="middle" class="svg-muted" font-size="12">revert config</text>
</svg><p class="cap">Candidate edit karo; commit use validate karke apply karta hai; revert config draft phenk deta hai.</p></div>

<h3>Fark dekhna</h3>
<p>Operational mode se aap dono copies print kar sakte ho. Yahan hostname candidate mein badla gaya lekin commit nahi hua (output <code>set</code> format mein):</p>
<pre class="out">admin@PA1&gt; show config candidate
<span class="hl">set deviceconfig system hostname NK-PUNE-PA</span>
set network virtual-router default

admin@PA1&gt; show config running
<span class="hl">set deviceconfig system hostname PA1</span>
set network virtual-router default</pre>
<p>Firewall ab bhi wire par aur apne prompt mein PA1 hai. Candidate mein NK-PUNE-PA likha hai. Configure mode ke andar <code>show</code> candidate print karta hai.</p>

<h3>Commit poore candidate ko validate karta hai</h3>
<p>Commit all-or-nothing job hai. Pehle PAN-OS candidate validate karta hai. Kuch bhi invalid ho to <b>kuch bhi</b> apply nahi hota. Yeh simulator capture ek rule dikhata hai jo typo wale zone ka naam leta hai, aur ek zone jo aise interface ko refer karta hai jo Layer 3 configured nahi hai:</p>
<pre class="out">admin@PA1# set zone trust network layer3 ethernet1/2
admin@PA1# set rulebase security rules Allow-Out from trustt to untrust application any action allow
admin@PA1# commit

Validation Error:
 zone -&gt; trust -&gt; network -&gt; layer3  'ethernet1/2' is not a valid reference
 rulebase -&gt; security -&gt; rules -&gt; Allow-Out source is missing
 rulebase -&gt; security -&gt; rules -&gt; Allow-Out destination is missing
 rulebase -&gt; security -&gt; rules -&gt; Allow-Out service is missing
 <span class="hl">rulebase -&gt; security -&gt; rules -&gt; Allow-Out from 'trustt' is not a valid reference</span>
 rulebase -&gt; security -&gt; rules -&gt; Allow-Out to 'untrust' is not a valid reference
Commit failed</pre>
<p>Ise to-do list ki tarah padho. Har line tree mein ek path aur ek wajah hai. Required fields (source, destination, service) missing the, <code>trustt</code> galat spelling ka zone hai, aur zones abhi exist nahi karte. Candidate theek karo aur dobara commit karo. Running configuration ko kabhi chhua hi nahi gaya.</p>

<h3>Successful commit ek job hai</h3>
<pre class="out">admin@PA1# commit

Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>

admin@PA1&gt; show jobs all
Enqueued              Dequeued              ID    Type        Status  Result  Completed
-----------------------------------------------------------------------------------------------
2026-10-02 03:43:46   2026-10-02 03:43:46   3     Commit      FIN     OK      2026-10-02 03:43:46</pre>
<p>Har commit ka ek job ID hota hai. <code>show jobs all</code> unhe status (FIN = finished) aur result (OK ya FAIL) ke saath list karta hai. Real firewall par commit data plane ke liye policy compile bhi karta hai, isliye bade rulebase mein zyada time lagta hai.</p>

<h3>Undo karna, aur simulator mein kya nahi hai</h3>
<p>Uncommitted edits phenkne ke liye configure mode mein <code>revert config</code> use karo. Simulator "Candidate configuration reverted to the running configuration" bolta hai. Real PAN-OS mein aur bhi hain: <code>save config to</code> named snapshot, snapshot ya purane version se <code>load config</code>, <code>validate full</code> (apply kiye bina check), <code>commit force</code>, <b>commit lock</b> taaki do admins takraayein nahi, aur versions compare karne wala configuration audit. Yeh real commands simulator mein implement nahi hain, isliye core flow yahan practise karo aur extras product documentation se seekho.</p>

<div class="eg"><p><b>Worked example.</b> 10:00 baje aap DMZ interface aur rule jodte ho. 10:05 par ek colleague bhi candidate edit karke commit karta hai. Real firewall par plain commit saare admins ke <i>saare</i> pending candidate changes apply karta hai jab tak aap admin ke hisaab se partial commit na karo. Isiliye teams commit locks aur change windows use karti hain. Commit dabane se pehle hamesha pending changes review karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Set commands type karke commit bhool jaana, phir sochna ki network kyun nahi badla. Candidate mein kisi aur ke adhoore edits ke saath commit karna. Maan lena ki fail hue commit ne change ka kuch hissa apply kiya: usne kuch apply nahi kiya.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Firewall kaunsi configuration enforce karta hai?" Running. "Set commands kahan likhte hain?" Candidate. "Candidate mein ek bhi invalid reference ho to?" Poora commit fail.</p></div>

<div class="scn"><h4>Woh rule jo lunch ke baad chala</h4><p>Ek engineer ne 11:50 par rule jodi aur 12:10 par test kiya, koi asar nahi. Usne commit nahi kiya tha. Ek colleague ne, jise unrelated change chahiye tha, 13:30 par commit kiya aur rule achanak live ho gayi, aadhi test hui rule poori company par lag gayi. Uske baad team ne commit locks aur ek niyam apnaya: apna kaam turant khud commit karo, aur pehle pending changes padho.</p><p><b>Lesson:</b> candidate admins ke beech shared hai, aur commit ek soch-samajh kar kiya jaane wala kaam hai.</p></div>

<div class="iv"><p class="q">"Candidate versus running configuration aur commit kya karta hai, samjhao."</p><p>Running woh hai jo firewall enforce karta hai; candidate editable draft hai. Commit candidate ko poora validate karta hai aur valid ho to use running configuration bana deta hai; kuch invalid ho to fail hota hai aur kuch nahi badalta. Commit jobs, locks aur partial commits ka zikr karo, aur yeh bhi ki Panorama firewalls ko apne commit aur push se configuration bhejta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>set aur delete sirf candidate badalte hain; commit use running banata hai.</li>
<li>Validation all or nothing hai; error list line by line padho.</li>
<li>show jobs all commit jobs aur unke results list karta hai.</li>
<li>revert config uncommitted edits phenk deta hai.</li>
<li>Pending changes review karo aur kai admins hon to locks use karo.</li>
</ul></div>
`}};export{e as default};