var e={id:`order-verify-troubleshoot`,h:{en:`Order of installation, verification and templates that do not arrive`,hi:`Installation ka order, verification aur templates jo pahunchte nahi`},body:{en:`
<p>Posting a parcel has three parts: you pack it, you hand it to the post office, and the receiver signs for it. A template follows the same path: you <b>build and assign</b> it, you <b>install</b> it, and you <b>verify on the FortiGate</b> that it arrived. Most template problems are a missing part of this chain, so this chapter gives you the full order and a short checklist for when something does not arrive.</p>

<h3>The order of an install</h3>
<p>One install builds a list of CLI lines from several sources and sends it in this order:</p>
<ol>
<li>the <b>system template</b> (DNS),</li>
<li>the <b>IPsec template</b> (phase 1 and phase 2),</li>
<li>the <b>CLI template</b> (your script, line by line),</li>
<li>the <b>policy package</b>, if the install includes one (it first deletes the device's policies, then installs the used address objects, then the policies).</li>
</ol>
<p><code>install-device</code> sends steps 1 to 3 and says "policy package: not part of this install". <code>install-package</code> sends the package and also the device settings. The preview prints the exact lines in this order.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Install order">
<rect x="10" y="30" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="80" y="54" text-anchor="middle" class="svg-ink" font-size="13">1 System</text><text x="80" y="72" text-anchor="middle" class="svg-muted" font-size="12">DNS</text>
<rect x="170" y="30" width="140" height="56" rx="8" fill="#bae6fd"/><text x="240" y="54" text-anchor="middle" class="svg-ink" font-size="13">2 IPsec</text><text x="240" y="72" text-anchor="middle" class="svg-muted" font-size="12">tunnel</text>
<rect x="330" y="30" width="140" height="56" rx="8" fill="#fde68a"/><text x="400" y="54" text-anchor="middle" class="svg-ink" font-size="13">3 CLI</text><text x="400" y="72" text-anchor="middle" class="svg-muted" font-size="12">script</text>
<rect x="490" y="30" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="560" y="54" text-anchor="middle" class="svg-ink" font-size="13">4 Package</text><text x="560" y="72" text-anchor="middle" class="svg-muted" font-size="12">policies</text>
<line x1="150" y1="58" x2="170" y2="58" stroke="#64748b" stroke-width="2"/><line x1="310" y1="58" x2="330" y2="58" stroke="#64748b" stroke-width="2"/><line x1="470" y1="58" x2="490" y2="58" stroke="#64748b" stroke-width="2"/>
<text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">install-device stops after step 3; install-package goes to step 4</text>
</svg><p class="cap">Later steps can rely on earlier ones, never the other way round.</p></div>

<h3>Before the install FortiManager checks</h3>
<p>FortiManager first checks that the ADOM and the device exist together, that the FGFM tunnel is up, and that the device allows configuration from FortiManager. Only then does it build the lines. If any check fails, the install stops, the device is not touched and no revision is created. The messages you meet most often:</p>
<table class="cmp"><tr><th>Message</th><th>Meaning and fix</th></tr>
<tr><td>device 'X' is not managed in ADOM 'Kaveri'</td><td>Wrong device name or wrong ADOM in the command</td></tr>
<tr><td>the FGFM tunnel to X is down</td><td>Fix the connection first (fmg-start chapters)</td></tr>
<tr><td>X does not accept configuration changes ... allow-push-configuration is disabled</td><td>Enable allow-push-configuration under central-management on the FortiGate</td></tr>
<tr><td>Install failed on X: value parse error ...</td><td>A line of a script was refused; the install was rolled back</td></tr>
</table>

<h3>Worked example and real output</h3>
<div class="eg"><p><b>Worked example.</b> TRY-FGT has KR-DNS assigned and the three installs have not happened. The engineer runs the preview, then the install, then checks the device and the status.</p></div>
<pre class="out">FMG-1 # execute fmgui install-device Kaveri TRY-FGT
Starting installation to TRY-FGT (ADOM Kaveri)...
  device settings: copied
  policy package: not part of this install
Task 1: install finished with status success. Revision 2 created.

FMG-1 # diagnose dvm device list TRY-FGT
        |- STATUS: <span class="hl">dev-db: not modified</span>; conf: in sync; cond: OK; dm: installed; conn: up; source: FMG

TRY-FGT # show system dns
config system dns
    set primary 192.0.2.53
    set secondary 192.0.2.54
    set domain "kaveri.example"
end</pre>
<p>Three sources of proof agree: the task says success, the status says dev-db is not modified and dm is installed, and the FortiGate holds the values. Only the third is the real proof. Note that installing again with nothing changed still copies the settings and creates another revision. So a revision count is not a count of changes.</p>

<h3>Troubleshooting: the template did not arrive</h3>
<ol>
<li><b>Is it assigned?</b> <code>show dvmdb device TRY-FGT</code> must list template, ipsec-template or cli-template.</li>
<li><b>Does the status show pending?</b> dev-db: modified plus cond: pending means not yet installed. If it says not modified but the device lacks the settings, check the assignment and the install-preview line count.</li>
<li><b>Did the install run?</b> Use <code>revision list TRY-FGT</code>: the install should show as a revision created by install.</li>
<li><b>Did a check stop it?</b> Read the message: ADOM, tunnel, allow-push-configuration.</li>
<li><b>Did the device reject a line?</b> Read the failed line in the error, fix the script, install again.</li>
<li><b>Is the content right?</b> Compare the template with the device output, for example the remote gateway.</li>
</ol>
<p>A status that claims no pending change can still be misleading while a device is out of reach, so use two proofs: the preview line count before the install and a show command after it.</p>

<div class="warn"><p><b>Common mistakes.</b> Believing that install-device also sends the policy package; stopping at the task message "success" without looking at the FortiGate; editing a template after the install and forgetting that dev-db is modified again; running the install against the wrong ADOM name; reinstalling in a panic when the real fault is a disabled allow-push-configuration.</p></div>

<div class="exam"><p><b>Exam traps.</b> The order is system, IPsec, CLI, package. Install-device excludes the package; install-package includes the device settings. Failure leaves the device and the revision history unchanged. Revisions are created by retrieve, install and auto update. Revert of a revision, workspace locking and template groups are theory here.</p></div>

<div class="scn"><h4>The DNS template that was assigned to the wrong branch name</h4><p>An engineer typed install-device for MDU-FGT while the template was assigned to TRY-FGT. The task finished with success and the preview had said "no changes", which he ignored. Madurai stayed without DNS and Trichy stayed modified. Reading dvmdb device for both branches showed the mismatch within a minute. He installed the settings to TRY-FGT, checked show system dns on the device, and wrote the result in the ticket.</p><p><b>Lesson:</b> an install that succeeds with no changes proves nothing. Read the preview line count, and verify on the device you meant.</p></div>

<div class="iv"><p class="q">"A template shows assigned, but the FortiGate does not have the settings. What do you check?"</p><p>Assignment in the device entry, the dev-db and cond status, the revision list for an install, the install message for a failed check such as a down tunnel or a disabled allow-push-configuration, and the rejected line if a script failed. Finish with a show command on the FortiGate. State the order system, IPsec, CLI, package so it is clear which part you expect where.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Install order: system template, IPsec template, CLI template, then the policy package.</li>
<li>install-device sends templates only; install-package sends the package and the device settings.</li>
<li>Checks run first (ADOM, device, tunnel, allow-push-configuration); failures leave everything unchanged.</li>
<li>Verify on the FortiGate: status lines and task messages are not proof by themselves.</li>
<li>Troubleshoot in order: assigned, pending, installed, checks, rejected line, content.</li>
</ul></div>
`,hi:`
<p>Parcel bhejne ke teen hisse hote hain: aap pack karte ho, post office ko dete ho, aur receiver sign karke leta hai. Template bhi wahi raasta follow karta hai: aap use <b>build aur assign</b> karte ho, <b>install</b> karte ho, aur FortiGate par <b>verify</b> karte ho ki wo pahuncha. Zyadatar template problems is chain ka koi missing hissa hoti hain, isliye ye chapter aapko poora order aur ek chhoti checklist deta hai jab kuch na pahunche.</p>

<h3>Install ka order</h3>
<p>Ek install kai sources se CLI lines ki list banata hai aur is order mein bhejta hai:</p>
<ol>
<li><b>system template</b> (DNS),</li>
<li><b>IPsec template</b> (phase 1 aur phase 2),</li>
<li><b>CLI template</b> (aapki script, line by line),</li>
<li><b>policy package</b>, agar install mein ho (pehle device ki policies delete karta hai, phir used address objects, phir policies install karta hai).</li>
</ol>
<p><code>install-device</code> steps 1 se 3 bhejta hai aur kehta hai "policy package: not part of this install". <code>install-package</code> package bhejta hai aur device settings bhi. Preview exact lines isi order mein print karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Install order">
<rect x="10" y="30" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="80" y="54" text-anchor="middle" class="svg-ink" font-size="13">1 System</text><text x="80" y="72" text-anchor="middle" class="svg-muted" font-size="12">DNS</text>
<rect x="170" y="30" width="140" height="56" rx="8" fill="#bae6fd"/><text x="240" y="54" text-anchor="middle" class="svg-ink" font-size="13">2 IPsec</text><text x="240" y="72" text-anchor="middle" class="svg-muted" font-size="12">tunnel</text>
<rect x="330" y="30" width="140" height="56" rx="8" fill="#fde68a"/><text x="400" y="54" text-anchor="middle" class="svg-ink" font-size="13">3 CLI</text><text x="400" y="72" text-anchor="middle" class="svg-muted" font-size="12">script</text>
<rect x="490" y="30" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="560" y="54" text-anchor="middle" class="svg-ink" font-size="13">4 Package</text><text x="560" y="72" text-anchor="middle" class="svg-muted" font-size="12">policies</text>
<line x1="150" y1="58" x2="170" y2="58" stroke="#64748b" stroke-width="2"/><line x1="310" y1="58" x2="330" y2="58" stroke="#64748b" stroke-width="2"/><line x1="470" y1="58" x2="490" y2="58" stroke="#64748b" stroke-width="2"/>
<text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">install-device step 3 par ruk jata hai; install-package step 4 tak jata hai</text>
</svg><p class="cap">Baad ke steps pehle wale par rely kar sakte hain, ulta kabhi nahi.</p></div>

<h3>Install se pehle FortiManager kya check karta hai</h3>
<p>FortiManager pehle check karta hai ki ADOM aur device saath exist karte hain, FGFM tunnel up hai, aur device FortiManager se configuration allow karta hai. Tabhi wo lines banata hai. Koi check fail ho to install ruk jata hai, device ko haath nahi lagta aur koi revision nahi banta. Sabse zyada milne wale messages:</p>
<table class="cmp"><tr><th>Message</th><th>Matlab aur fix</th></tr>
<tr><td>device 'X' is not managed in ADOM 'Kaveri'</td><td>Command mein galat device name ya galat ADOM</td></tr>
<tr><td>the FGFM tunnel to X is down</td><td>Pehle connection fix karo (fmg-start chapters)</td></tr>
<tr><td>X does not accept configuration changes ... allow-push-configuration is disabled</td><td>FortiGate par central-management ke andar allow-push-configuration enable karo</td></tr>
<tr><td>Install failed on X: value parse error ...</td><td>Script ki ek line refuse hui; install rollback ho gaya</td></tr>
</table>

<h3>Worked example aur real output</h3>
<div class="eg"><p><b>Worked example.</b> TRY-FGT ko KR-DNS assigned hai aur install abhi nahi hua. Engineer preview chalata hai, phir install, phir device aur status check karta hai.</p></div>
<pre class="out">FMG-1 # execute fmgui install-device Kaveri TRY-FGT
Starting installation to TRY-FGT (ADOM Kaveri)...
  device settings: copied
  policy package: not part of this install
Task 1: install finished with status success. Revision 2 created.

FMG-1 # diagnose dvm device list TRY-FGT
        |- STATUS: <span class="hl">dev-db: not modified</span>; conf: in sync; cond: OK; dm: installed; conn: up; source: FMG

TRY-FGT # show system dns
config system dns
    set primary 192.0.2.53
    set secondary 192.0.2.54
    set domain "kaveri.example"
end</pre>
<p>Teen proofs agree karte hain: task kehta hai success, status kehta hai dev-db not modified aur dm installed, aur FortiGate ke paas values hain. Asli proof sirf teesra hai. Dhyan do ki kuch badle bina dobara install karne par bhi settings copy hoti hain aur ek aur revision banta hai. Isliye revision count changes ki ginti nahi hai.</p>

<h3>Troubleshooting: template pahuncha nahi</h3>
<ol>
<li><b>Assigned hai?</b> <code>show dvmdb device TRY-FGT</code> mein template, ipsec-template ya cli-template dikhna chahiye.</li>
<li><b>Status pending dikhata hai?</b> dev-db: modified aur cond: pending matlab abhi install nahi hua. Agar not modified likha hai par device ke paas settings nahi, to assignment aur install-preview ki line count check karo.</li>
<li><b>Install chala?</b> <code>revision list TRY-FGT</code> use karo: install ek revision ki tarah dikhna chahiye jo install ne banaya.</li>
<li><b>Kisi check ne roka?</b> Message padho: ADOM, tunnel, allow-push-configuration.</li>
<li><b>Device ne line reject ki?</b> Error mein failed line padho, script fix karo, dobara install karo.</li>
<li><b>Content sahi hai?</b> Template ko device output se compare karo, jaise remote gateway.</li>
</ol>
<p>Jab device pahunch ke bahar ho tab "koi pending change nahi" wala status bhi gumrah kar sakta hai, isliye do proofs use karo: install se pehle preview line count aur baad mein show command.</p>

<div class="warn"><p><b>Common mistakes.</b> Ye maanna ki install-device policy package bhi bhejta hai; FortiGate dekhe bina task message "success" par ruk jana; install ke baad template edit karke bhool jana ki dev-db phir modified hai; galat ADOM name ke against install chalana; asli fault disabled allow-push-configuration ho tab ghabrakar dobara install karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Order hai system, IPsec, CLI, package. Install-device package ko exclude karta hai; install-package device settings include karta hai. Failure device aur revision history ko unchanged chhodta hai. Revisions retrieve, install aur auto update se banti hain. Revision revert, workspace locking aur template groups yahan theory hain.</p></div>

<div class="scn"><h4>DNS template galat branch name par install</h4><p>Engineer ne MDU-FGT ke liye install-device type kiya jabki template TRY-FGT ko assigned tha. Task success se khatam hua aur preview ne "no changes" kaha tha, jise usne ignore kiya. Madurai bina DNS ke reh gayi aur Trichy modified reh gayi. Dono branches ke dvmdb device padhne se ek minute mein mismatch dikh gaya. Usne TRY-FGT par settings install ki, device par show system dns check kiya, aur result ticket mein likha.</p><p><b>Lesson:</b> jo install no changes ke saath succeed hota hai wo kuch sabit nahi karta. Preview line count padho, aur jis device ka irada tha uspar verify karo.</p></div>

<div class="iv"><p class="q">"Template assigned dikhta hai, par FortiGate ke paas settings nahi hain. Kya check karoge?"</p><p>Device entry mein assignment, dev-db aur cond status, install ke liye revision list, down tunnel ya disabled allow-push-configuration jaise failed check ke liye install message, aur script fail hui ho to rejected line. Aakhir mein FortiGate par show command. Order system, IPsec, CLI, package bolo taaki saaf ho ki aap kaunsa hissa kahan expect karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Install order: system template, IPsec template, CLI template, phir policy package.</li>
<li>install-device sirf templates bhejta hai; install-package package aur device settings bhejta hai.</li>
<li>Checks pehle chalte hain (ADOM, device, tunnel, allow-push-configuration); failure sab unchanged chhodta hai.</li>
<li>FortiGate par verify karo: status lines aur task messages khud proof nahi hain.</li>
<li>Order mein troubleshoot karo: assigned, pending, installed, checks, rejected line, content.</li>
</ul></div>
`}};export{e as default};