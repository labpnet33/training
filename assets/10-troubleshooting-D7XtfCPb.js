var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow for foundation problems`,hi:`Foundation problems ke liye troubleshooting workflow`},body:{en:`
<p>Most early Prisma Access problems come from a small set of causes: a change that was never pushed, an overlap in address space, a missing zone mapping, or a licence problem. A fixed workflow helps you find them quickly instead of guessing. This chapter gives you that workflow and walks through the ticket lab <b>pa-start-3</b>.</p>

<h3>Analogy: a doctor's checklist</h3>
<p>A good doctor does not start with surgery. She asks what changed, takes the temperature, checks the obvious, and only then orders special tests. You do the same: what changed, is the cloud in sync with it, what do the status screens say, and only then deeper tools.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Five step workflow">
<rect x="10" y="50" width="112" height="70" rx="8" fill="#bae6fd"/><text x="66" y="78" text-anchor="middle" class="svg-ink" font-size="12">1 What</text><text x="66" y="96" text-anchor="middle" class="svg-ink" font-size="12">changed?</text>
<rect x="132" y="50" width="112" height="70" rx="8" fill="#fde68a"/><text x="188" y="78" text-anchor="middle" class="svg-ink" font-size="12">2 Was it</text><text x="188" y="96" text-anchor="middle" class="svg-ink" font-size="12">pushed?</text>
<rect x="254" y="50" width="112" height="70" rx="8" fill="#bbf7d0"/><text x="310" y="78" text-anchor="middle" class="svg-ink" font-size="12">3 Read the</text><text x="310" y="96" text-anchor="middle" class="svg-ink" font-size="12">status</text>
<rect x="376" y="50" width="112" height="70" rx="8" fill="#ddd6fe"/><text x="432" y="78" text-anchor="middle" class="svg-ink" font-size="12">4 Check the</text><text x="432" y="96" text-anchor="middle" class="svg-ink" font-size="12">object</text>
<rect x="498" y="50" width="132" height="70" rx="8" fill="#fed7aa"/><text x="564" y="78" text-anchor="middle" class="svg-ink" font-size="12">5 Test with</text><text x="564" y="96" text-anchor="middle" class="svg-ink" font-size="12">real traffic</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Stop at the first step that explains the symptom</text>
</svg><p class="cap">The five-step workflow used for all Prisma Access tickets.</p></div>

<h3>The five steps in detail</h3>
<ol>
<li><b>What changed?</b> Ask for the last change and time. Panorama job history or the SCM Jobs list shows commits and pushes.</li>
<li><b>Was it pushed?</b> Compare Commit to Panorama with Commit and Push, or look for a Push Config job. Look at Config Status.</li>
<li><b>Read the status.</b> Panorama: <code>Cloud Services &gt; Status &gt; Status</code>. SCM: Sync Status and Activity Insights.</li>
<li><b>Check the object.</b> Infrastructure subnet overlap, AS, zone mapping, bandwidth, licence.</li>
<li><b>Test with real traffic.</b> Ping or open the application and read the traffic log.</li>
</ol>

<h3>Lab walkthrough: pa-start-3 "Pushed to Panorama only"</h3>
<p>Ticket: "We added the branch subnet 10.20.0.0/24 an hour ago. The commit succeeded but nothing changed." Evidence from the console:</p>
<pre class="out">Cloud Services &gt; Status &gt; Status (lab console view)
Location     Status   Config Status    Current Users
India West   OK       <span class="hl">Out of sync</span>      0

Jobs
Commit   Panorama   admin   Success   10:02
Push     Prisma Access   (none)
</pre>
<p>Reading it: status is OK, so the service itself is fine. Config Status is Out of sync, and the job list has a Commit but no Push. Step 2 explains the symptom. The fix is <b>Commit and Push</b>, Edit Selections, Prisma Access tab, with the relevant scopes selected. After the push job succeeds, the check is Config Status <b>In sync</b>.</p>

<h3>Other common foundation faults</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Where to look</th></tr>
<tr><td>Config Status Out of sync</td><td>Not pushed, or a scope missed</td><td>Jobs, Status</td></tr>
<tr><td>Branch routes dropped or ambiguous</td><td>Overlap with the infrastructure subnet or pool</td><td>Address register, Service Setup</td></tr>
<tr><td>Internal app blocked though a rule allows it</td><td>Zone left as untrust</td><td>Traffic log zones, Zone Mapping</td></tr>
<tr><td>Push fails with licence text</td><td>Expired or changed licence</td><td>Licence status in the hub</td></tr>
<tr><td>Bandwidth rejected</td><td>Below 50 Mbps, or pool used up</td><td>Bandwidth Management</td></tr>
</table>
<pre class="out">Plugin message (from the knowledge base)
Error getting list of services: Prisma access edition license
capabilities not present
<span class="hl">Failed plugin validation</span>
</pre>
<p>When you see this text, check the licence first. It is caused by licence changes or expired licences.</p>

<div class="eg"><p><b>Worked example.</b> A ticket says "branch cannot reach HQ". Step 1: the engineer changed the BGP AS yesterday. Step 2: Jobs shows a push on the same day. Step 3: Config Status is In sync, so it is not a push problem. Step 4: the infrastructure subnet 10.255.0.0/24 overlaps nothing. Step 5: a ping to 10.10.0.50 fails; the traffic log shows a deny in the untrust zone, which points to zone mapping. Five steps, one root cause, no guessing.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Jumping to deep tools before checking In sync. (2) Re-entering the same change several times instead of reading the job list. (3) Treating the lab simulator as if it were the cloud: remember it models the console in a simplified way.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which screen confirms that Prisma Access has the latest configuration?" On Panorama it is Cloud Services &gt; Status &gt; Status, where Config Status should be In sync. Do not answer with the commit job on Panorama alone.</p></div>

<div class="scn"><h4>Three people, one missing push</h4><p>Three administrators each edited something and each committed to Panorama on the same afternoon. None pushed, because each assumed another would. The next morning several branches showed different behaviour. The senior engineer read the Jobs history, saw three commits and no push, and ran one Commit and Push including all scopes. The status turned In sync.</p><p><b>Lesson:</b> agree who pushes, and always verify with Config Status.</p></div>

<div class="iv"><p class="q">"A change was committed but users do not see it. What do you check?"</p><p>Strong answer: confirm whether it was pushed; check the job history and Config Status. If Out of sync, run Commit and Push with the right Prisma Access selections (or Push Config on SCM) and re-check In sync. If it is already in sync, look at zones, addressing and licence, then test with real traffic and the traffic log.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five steps: what changed, pushed, status, object, real traffic.</li>
<li>Out of sync plus a commit with no push is the classic foundation fault.</li>
<li>Check overlap, zone mapping, bandwidth and licence for the other faults.</li>
<li>Verify with Config Status, not with a green commit message.</li>
<li>Stop at the first step that explains the symptom.</li>
</ul></div>
`,hi:`
<p>Prisma Access ki shuruaati problems zyadatar chhote set ki wajahon se aati hain: aisa change jo kabhi push nahi hua, address space ka overlap, zone mapping ki kami, ya licence problem. Fixed workflow andaaza lagane ke bajaye jaldi dhoondhne mein madad karta hai. Yeh chapter woh workflow deta hai aur ticket lab <b>pa-start-3</b> walk through karta hai.</p>

<h3>Analogy: doctor ki checklist</h3>
<p>Achha doctor surgery se shuru nahi karta. Woh poochhti hai kya badla, temperature leti hai, obvious cheezein check karti hai, aur tab special tests order karti hai. Aap bhi wahi karo: kya badla, kya cloud us ke saath in sync hai, status screens kya kehti hain, aur tab deeper tools.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Paanch step workflow">
<rect x="10" y="50" width="112" height="70" rx="8" fill="#bae6fd"/><text x="66" y="78" text-anchor="middle" class="svg-ink" font-size="12">1 Kya</text><text x="66" y="96" text-anchor="middle" class="svg-ink" font-size="12">badla?</text>
<rect x="132" y="50" width="112" height="70" rx="8" fill="#fde68a"/><text x="188" y="78" text-anchor="middle" class="svg-ink" font-size="12">2 Push</text><text x="188" y="96" text-anchor="middle" class="svg-ink" font-size="12">hua?</text>
<rect x="254" y="50" width="112" height="70" rx="8" fill="#bbf7d0"/><text x="310" y="78" text-anchor="middle" class="svg-ink" font-size="12">3 Status</text><text x="310" y="96" text-anchor="middle" class="svg-ink" font-size="12">padho</text>
<rect x="376" y="50" width="112" height="70" rx="8" fill="#ddd6fe"/><text x="432" y="78" text-anchor="middle" class="svg-ink" font-size="12">4 Object</text><text x="432" y="96" text-anchor="middle" class="svg-ink" font-size="12">check karo</text>
<rect x="498" y="50" width="132" height="70" rx="8" fill="#fed7aa"/><text x="564" y="78" text-anchor="middle" class="svg-ink" font-size="12">5 Asli traffic</text><text x="564" y="96" text-anchor="middle" class="svg-ink" font-size="12">se test</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Jo pehla step symptom explain kare, wahin ruk jao</text>
</svg><p class="cap">Prisma Access ke har ticket mein use hone wala paanch-step workflow.</p></div>

<h3>Paanch steps detail mein</h3>
<ol>
<li><b>Kya badla?</b> Last change aur time poochho. Panorama job history ya SCM Jobs list commits aur pushes dikhati hai.</li>
<li><b>Push hua?</b> Commit to Panorama ko Commit and Push se compare karo, ya Push Config job dhoondho. Config Status dekho.</li>
<li><b>Status padho.</b> Panorama: <code>Cloud Services &gt; Status &gt; Status</code>. SCM: Sync Status aur Activity Insights.</li>
<li><b>Object check karo.</b> Infrastructure subnet overlap, AS, zone mapping, bandwidth, licence.</li>
<li><b>Asli traffic se test karo.</b> Ping karo ya application kholo aur traffic log padho.</li>
</ol>

<h3>Lab walkthrough: pa-start-3 "Pushed to Panorama only"</h3>
<p>Ticket: "Humne ek ghanta pehle branch subnet 10.20.0.0/24 add kiya. Commit succeed hua lekin kuch nahi badla." Console se evidence:</p>
<pre class="out">Cloud Services &gt; Status &gt; Status (lab console view)
Location     Status   Config Status    Current Users
India West   OK       <span class="hl">Out of sync</span>      0

Jobs
Commit   Panorama   admin   Success   10:02
Push     Prisma Access   (none)
</pre>
<p>Padhna: status OK hai, to service theek hai. Config Status Out of sync hai, aur job list mein Commit hai lekin Push nahi. Step 2 symptom explain karta hai. Fix: <b>Commit and Push</b>, Edit Selections, Prisma Access tab, relevant scopes ke saath. Push job succeed hone ke baad check hai Config Status <b>In sync</b>.</p>

<h3>Doosre common foundation faults</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Kahan dekhein</th></tr>
<tr><td>Config Status Out of sync</td><td>Push nahi hua, ya scope miss</td><td>Jobs, Status</td></tr>
<tr><td>Branch routes drop ya ambiguous</td><td>Infrastructure subnet ya pool se overlap</td><td>Address register, Service Setup</td></tr>
<tr><td>Rule allow karta hai phir bhi internal app blocked</td><td>Zone untrust chhoda hua</td><td>Traffic log zones, Zone Mapping</td></tr>
<tr><td>Push licence text ke saath fail</td><td>Expired ya badla hua licence</td><td>Hub mein licence status</td></tr>
<tr><td>Bandwidth reject</td><td>50 Mbps se kam, ya pool khatam</td><td>Bandwidth Management</td></tr>
</table>
<pre class="out">Plugin message (knowledge base se)
Error getting list of services: Prisma access edition license
capabilities not present
<span class="hl">Failed plugin validation</span>
</pre>
<p>Yeh text dikhe to pehle licence check karo. Yeh licence changes ya expired licences se hota hai.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "branch HQ tak nahi pahunch rahi". Step 1: engineer ne kal BGP AS badla tha. Step 2: Jobs usi din ka push dikhata hai. Step 3: Config Status In sync hai, to push problem nahi hai. Step 4: infrastructure subnet 10.255.0.0/24 kisi se overlap nahi karta. Step 5: 10.10.0.50 par ping fail hota hai; traffic log untrust zone mein deny dikhata hai, jo zone mapping ki taraf ishara karta hai. Paanch steps, ek root cause, koi andaaza nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) In sync check kiye bina deep tools par kood jaana. (2) Job list padhne ke bajaye wahi change kai baar enter karna. (3) Lab simulator ko asli cloud samajhna: yaad rakho yeh console ko simplified tareeke se model karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaunsi screen confirm karti hai ki Prisma Access ke paas latest configuration hai?" Panorama par Cloud Services &gt; Status &gt; Status, jahan Config Status In sync hona chahiye. Sirf Panorama ke commit job se jawab mat do.</p></div>

<div class="scn"><h4>Teen log, ek missing push</h4><p>Teen administrators ne ek hi dopahar kuch edit kiya aur teeno ne Panorama mein commit kiya. Kisi ne push nahi kiya, kyunki har ek ne maana ki koi aur karega. Agli subah kai branches alag behave kar rahi thi. Senior engineer ne Jobs history padhi, teen commits aur koi push nahi dekha, aur sabhi scopes ke saath ek Commit and Push chalaya. Status In sync ho gaya.</p><p><b>Seekh:</b> tay karo kaun push karega, aur hamesha Config Status se verify karo.</p></div>

<div class="iv"><p class="q">"Change commit ho gaya lekin users ko dikh nahi raha. Kya check karoge?"</p><p>Strong answer: pehle confirm karo push hua ya nahi; job history aur Config Status dekho. Out of sync ho to sahi Prisma Access selections ke saath Commit and Push (ya SCM par Push Config) chalao aur In sync dobara check karo. Pehle se in sync ho to zones, addressing aur licence dekho, phir asli traffic aur traffic log se test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch steps: kya badla, push, status, object, asli traffic.</li>
<li>Out of sync aur commit bina push classic foundation fault hai.</li>
<li>Baaki faults ke liye overlap, zone mapping, bandwidth aur licence check karo.</li>
<li>Green commit message se nahi, Config Status se verify karo.</li>
<li>Jo pehla step symptom explain kare wahin ruk jao.</li>
</ul></div>
`}};export{e as default};