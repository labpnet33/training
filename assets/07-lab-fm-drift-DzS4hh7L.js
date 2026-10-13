var e={id:`lab-fm-drift`,h:{en:`Lab fm-drift: the emergency policy that FortiManager erased`,hi:`Lab fm-drift: emergency policy jise FortiManager ne mita diya`},body:{en:`
<p>A fire drill is the best way to learn where the exits are. This lab is a drill for the drift trap. You will recreate last night's emergency, read what FortiManager made of it, and then save the emergency policy the right way. It takes about 35 minutes. Devices: FMG-1, MDU-FGT, TRY-FGT, SRV-WEB, the switches and the PCs. The simulator offers install and import as <code>execute fmgui</code> commands on FMG-1, because they are GUI or API actions in the real product.</p>

<h3>The goal</h3>
<p>MDU-FGT runs the package Branch-PP. An engineer typed policy 99 TEMP-SSH directly on the FortiGate. FortiManager noticed, and the next install would erase it. You must (1) install Branch-PP so that both sides agree, (2) type the emergency policy and read the dm field, and (3) keep the policy by importing it into a package called MDU-Keep and installing that package. At the end TEMP-SSH must still be on the FortiGate.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab plan in three tasks">
<rect x="20" y="30" width="180" height="70" rx="8" fill="#bbf7d0"/><text x="110" y="58" text-anchor="middle" class="svg-ink" font-size="13">Task 1</text><text x="110" y="78" text-anchor="middle" class="svg-muted" font-size="12">install Branch-PP</text>
<rect x="230" y="30" width="180" height="70" rx="8" fill="#fed7aa"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">Task 2</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="12">type policy 99, read dm</text>
<rect x="440" y="30" width="180" height="70" rx="8" fill="#ddd6fe"/><text x="530" y="58" text-anchor="middle" class="svg-ink" font-size="13">Task 3</text><text x="530" y="78" text-anchor="middle" class="svg-muted" font-size="12">import, install MDU-Keep</text>
<line x1="200" y1="65" x2="230" y2="65" stroke="#64748b" stroke-width="2"/><line x1="410" y1="65" x2="440" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Agree, drift, then keep.</p></div>

<h3>Task 1: start from a clean agreement</h3>
<p>Why first? A comparison only means something if you know the starting point. Install the package Branch-PP on MDU-FGT with <code>execute fmgui install-package</code>, giving the ADOM, the package and the device. Then run <code>diagnose dvm device list MDU-FGT</code>. Look for these values:</p>
<pre class="out">STATUS: dev-db: not modified; <span class="hl">conf: in sync; cond: OK; dm: installed</span>; conn: up
vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[installed]Branch-PP</span></pre>
<p>If conf is out of sync here, wait a few seconds and look again. If pkg is never-installed, the install did not run or failed; read its message.</p>

<h3>Task 2: create the drift and watch it</h3>
<p>Go to the MDU-FGT CLI, enter <code>config firewall policy</code>, edit number 99 and give it the name TEMP-SSH, source interface port1, destination interface port2, source and destination address all, action accept, schedule always and service SSH. Finish with <code>next</code> and <code>end</code>. Chapter 2 shows the full shape of this block.</p>
<p>Then go back to FMG-1 and run the status command twice: at once, and after you have waited several seconds. The question of the lab is the dm field. At once it still reads installed, while conf is out of sync. After the wait it reads autoupdated, conf is in sync, and the revision list has a third line created by auto update. The answer to the task is <b>autoupdated</b>.</p>
<p>Notice what did not change: <code>pkg:[modified]Branch-PP</code> and <code>cond: pending</code>. Auto update recorded the policy; it did not teach the package about it.</p>

<div class="eg"><p><b>Worked example.</b> Suppose you run the status command three times: at once, after one second and after six seconds. The first two show <code>dm: installed</code>, the third <code>dm: autoupdated</code>. If you answer the task after the first look, you answer wrongly, not because the idea is wrong but because FortiManager had not yet taken the change over. In real operations the same patience is needed before you conclude anything from a status board.</p></div>

<h3>Task 3: keep the policy the right way</h3>
<p>Think before you type. What would an install of Branch-PP do now? Use <code>execute fmgui install-preview</code> with the ADOM, the package and the device, and read the delete lines. If you see a delete for policy 99 and no matching create, you have proved the trap without losing anything.</p>
<p>Now the fix has two steps. First <code>execute fmgui import-policy</code> with the ADOM, the device and a new package name, MDU-Keep. The message should say that the package was created with 2 policies and 1 address object and that MDU-FGT is its installation target. Second, install MDU-Keep on MDU-FGT with <code>execute fmgui install-package</code>.</p>
<pre class="out">Import finished: policy package MDU-Keep created in ADOM Kaveri with <span class="hl">2 policies</span> and 1 address objects (installation target MDU-FGT).
...
Task 2: install finished with status success. Revision 4 created.</pre>
<p>To verify, run <code>show firewall policy</code> on MDU-FGT. Both policy 1 LAN-TO-SRV and policy 99 TEMP-SSH must be present. The revision list now has four lines.</p>

<h3>Common wrong turns</h3>
<ul>
<li><b>Installing Branch-PP again</b> "to clean up". It removes policy 99, and the revision list shows a new install revision. In this lab you may do it only to see the effect, not before the task is finished.</li>
<li><b>Importing before the policy exists</b>. The new package will have one policy, and the final check fails.</li>
<li><b>Typing the wrong policy number</b>, for example 9, or forgetting <code>end</code>. The config block is not saved until you leave it.</li>
<li><b>Reading pkg modified after Task 3 as a failure.</b> Both packages list MDU-FGT as an installation target in this lab, so the pkg field can keep naming Branch-PP. The check that matters is the policy table on the FortiGate.</li>
</ul>

<div class="warn"><p><b>Take-away risk.</b> The simulator forgives mistakes because it can be reset. A real branch cannot. Practise the order: preview, import, install.</p></div>

<div class="scn"><h4>Drill on a real estate</h4><p>A managed service provider ran this drill as a team exercise before a migration. Two engineers discovered that their runbook said "install, then check", which would have removed an emergency rule. They changed it to "status, preview, import if needed, install". The first real emergency after that went smoothly.</p><p><b>Lesson:</b> the order of the steps is the real content of the lab.</p></div>

<div class="iv"><p class="q">"Walk me through keeping a local emergency policy on a FortiManager-managed device."</p><p>Check status (conf, dm, pkg), read the revision diff to see exactly what was added, preview the package install to confirm what would be deleted, import the device policies into a new package, install that package, and verify on the FortiGate. Mention the ticket and the review.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start the lab from a known agreement: conf in sync and pkg installed.</li>
<li>The dm field shows installed at first and autoupdated after a few seconds.</li>
<li>Auto update leaves pkg modified and cond pending.</li>
<li>The preview proves the trap before you lose anything.</li>
<li>Import into a new package and install it; verify with show firewall policy.</li>
</ul></div>
`,hi:`
<p>Fire drill se exits kahan hain ye sabse achhe se seekhte hain. Ye lab drift trap ka drill hai. Aap kal raat ki emergency dobara banaoge, dekhoge ki FortiManager ne use kya banaya, aur phir emergency policy ko sahi tareeke se bachaoge. Lagbhag 35 minute lagte hain. Devices: FMG-1, MDU-FGT, TRY-FGT, SRV-WEB, switches aur PCs. Simulator install aur import ko FMG-1 par <code>execute fmgui</code> commands ki tarah deta hai, kyunki real product mein ye GUI ya API actions hain.</p>

<h3>Goal</h3>
<p>MDU-FGT package Branch-PP chalata hai. Ek engineer ne policy 99 TEMP-SSH seedha FortiGate par type ki. FortiManager ne notice kiya, aur agla install use mita dega. Aapko (1) Branch-PP install karna hai taaki dono sides agree karein, (2) emergency policy type karke dm field padhna hai, aur (3) policy ko MDU-Keep naam ke package mein import karke wo package install karke bachana hai. End mein TEMP-SSH FortiGate par bachi honi chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Teen tasks mein lab plan">
<rect x="20" y="30" width="180" height="70" rx="8" fill="#bbf7d0"/><text x="110" y="58" text-anchor="middle" class="svg-ink" font-size="13">Task 1</text><text x="110" y="78" text-anchor="middle" class="svg-muted" font-size="12">Branch-PP install</text>
<rect x="230" y="30" width="180" height="70" rx="8" fill="#fed7aa"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">Task 2</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="12">policy 99 type, dm padho</text>
<rect x="440" y="30" width="180" height="70" rx="8" fill="#ddd6fe"/><text x="530" y="58" text-anchor="middle" class="svg-ink" font-size="13">Task 3</text><text x="530" y="78" text-anchor="middle" class="svg-muted" font-size="12">import, MDU-Keep install</text>
<line x1="200" y1="65" x2="230" y2="65" stroke="#64748b" stroke-width="2"/><line x1="410" y1="65" x2="440" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Agree, drift, phir keep.</p></div>

<h3>Task 1: saaf agreement se shuru karo</h3>
<p>Pehle kyun? Comparison tabhi matlab rakhti hai jab starting point pata ho. <code>execute fmgui install-package</code> se package Branch-PP ko MDU-FGT par install karo, ADOM, package aur device dete hue. Phir <code>diagnose dvm device list MDU-FGT</code> chalao. Ye values dekho:</p>
<pre class="out">STATUS: dev-db: not modified; <span class="hl">conf: in sync; cond: OK; dm: installed</span>; conn: up
vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[installed]Branch-PP</span></pre>
<p>Yahan conf out of sync ho to kuch seconds wait karke dobara dekho. Pkg never-installed ho to install chala hi nahi ya fail hua; uska message padho.</p>

<h3>Task 2: drift banao aur dekho</h3>
<p>MDU-FGT CLI mein jao, <code>config firewall policy</code> likho, number 99 edit karo aur naam TEMP-SSH do, source interface port1, destination interface port2, source aur destination address all, action accept, schedule always aur service SSH. <code>next</code> aur <code>end</code> se khatam karo. Chapter 2 mein is block ka poora shape hai.</p>
<p>Phir FMG-1 par wapas jao aur status command do baar chalao: turant, aur kuch seconds wait karne ke baad. Lab ka sawal dm field hai. Turant wo installed padhta hai, jabki conf out of sync hai. Wait ke baad autoupdated padhta hai, conf in sync hai, aur revision list mein auto update se bani teesri line hai. Task ka jawab <b>autoupdated</b> hai.</p>
<p>Dhyaan do kya nahi badla: <code>pkg:[modified]Branch-PP</code> aur <code>cond: pending</code>. Auto update ne policy record kar li; package ko usne sikhayi nahi.</p>

<div class="eg"><p><b>Worked example.</b> Maan lo status command teen baar chalate ho: turant, ek second baad aur chhe seconds baad. Pehle do <code>dm: installed</code> dikhate hain, teesra <code>dm: autoupdated</code>. Pehli dekh par jawab doge to galat hoga, isliye nahi ki idea galat hai, balki isliye ki FortiManager ne abhi change apna nahi liya tha. Real operations mein status board se kuch conclude karne se pehle yahi sabr chahiye.</p></div>

<h3>Task 3: policy ko sahi tareeke se bachao</h3>
<p>Type karne se pehle socho. Ab Branch-PP ka install kya karega? ADOM, package aur device ke saath <code>execute fmgui install-preview</code> use karo aur delete lines padho. Agar policy 99 ka delete dikhe aur uska koi create nahi, to aapne kuch khoye bina trap saabit kar diya.</p>
<p>Ab fix ke do steps hain. Pehle <code>execute fmgui import-policy</code> ADOM, device aur naye package naam MDU-Keep ke saath. Message kehna chahiye ki package 2 policies aur 1 address object ke saath bana aur MDU-FGT uska installation target hai. Doosra, <code>execute fmgui install-package</code> se MDU-Keep ko MDU-FGT par install karo.</p>
<pre class="out">Import finished: policy package MDU-Keep created in ADOM Kaveri with <span class="hl">2 policies</span> and 1 address objects (installation target MDU-FGT).
...
Task 2: install finished with status success. Revision 4 created.</pre>
<p>Verify karne ke liye MDU-FGT par <code>show firewall policy</code> chalao. Policy 1 LAN-TO-SRV aur policy 99 TEMP-SSH dono hone chahiye. Revision list mein ab chaar lines hain.</p>

<h3>Aam galat mod</h3>
<ul>
<li><b>Branch-PP dobara install karna</b> "saaf karne ke liye". Ye policy 99 hata deta hai, aur revision list mein nayi install revision aati hai. Is lab mein sirf asar dekhne ke liye karo, task poora hone se pehle nahi.</li>
<li><b>Policy ban ne se pehle import karna</b>. Naye package mein ek hi policy hogi, aur final check fail hoga.</li>
<li><b>Galat policy number type karna</b>, jaise 9, ya <code>end</code> bhool jana. Config block tab tak save nahi hota jab tak aap use chhodte nahi.</li>
<li><b>Task 3 ke baad pkg modified ko failure padhna.</b> Is lab mein dono packages MDU-FGT ko installation target ginte hain, isliye pkg field Branch-PP ka naam dikha sakta hai. Jo check matter karta hai wo FortiGate ki policy table hai.</li>
</ul>

<div class="warn"><p><b>Ghar le jaane wala risk.</b> Simulator galtiyan maaf karta hai kyunki reset ho sakta hai. Real branch nahi. Order ki practice karo: preview, import, install.</p></div>

<div class="scn"><h4>Real estate par drill</h4><p>Ek managed service provider ne migration se pehle ye drill team exercise ki tarah chalayi. Do engineers ko pata chala ki unke runbook mein likha tha "install, phir check", jisse emergency rule hat jata. Unhone use "status, preview, zaroorat ho to import, install" kar diya. Uske baad ki pehli asli emergency smoothly nikal gayi.</p><p><b>Lesson:</b> steps ka order hi lab ka asli content hai.</p></div>

<div class="iv"><p class="q">"FortiManager-managed device par local emergency policy ko rakhne ka process batao."</p><p>Status check (conf, dm, pkg), revision diff se dekhna ki exactly kya joda gaya, package install ka preview karke confirm karna ki kya delete hoga, device policies ko naye package mein import karna, wo package install karna, aur FortiGate par verify karna. Ticket aur review ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lab ko known agreement se shuru karo: conf in sync aur pkg installed.</li>
<li>dm field pehle installed aur kuch seconds baad autoupdated dikhata hai.</li>
<li>Auto update pkg modified aur cond pending chhod deta hai.</li>
<li>Preview kuch khoye bina trap saabit kar deta hai.</li>
<li>Naye package mein import karo aur install karo; show firewall policy se verify karo.</li>
</ul></div>
`}};export{e as default};