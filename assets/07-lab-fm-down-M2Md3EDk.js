var e={id:`lab-fm-down`,h:{en:`Lab fm-down: the new Madurai FortiGate cannot be managed`,hi:`Lab fm-down: naya Madurai FortiGate manage nahi ho raha`},body:{en:`
<p>This is a troubleshooting lab with a real-life shape: a ticket, four independent faults and no map. A good engineer behaves like a doctor taking a history: ask what the system says, test one cause, treat it, and check again. This chapter tells you the goal, the approach and what to look for. It does not paste the solution, because the point is to find each fault yourself. Use the workflow from chapter 1 and the catalogue from chapter 2.</p>

<div class="eg"><p><b>The ticket (KR-2420).</b> "MDU-FGT was set up for central management by the branch engineer. It does not appear in FortiManager, and when we tried to add it later nothing could be installed." Devices: FMG-1, SW-NET, SRV-WEB, MDU-FGT, SW-MDU, PC-MDU. FMG-1 already has the ADOM Kaveri, the objects and the package Branch-PP (no installation target yet). Time: about 30 minutes. The goal: MDU-FGT managed in Kaveri, Branch-PP installed, and PC-MDU reaching SRV-WEB at 192.0.2.80.</p></div>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Four faults in order">
<rect x="10" y="20" width="140" height="56" rx="6" fill="#fed7aa"/><text x="80" y="44" text-anchor="middle" class="svg-ink" font-size="12">Fault 1</text><text x="80" y="62" text-anchor="middle" class="svg-muted" font-size="12">wrong fmg address</text>
<rect x="170" y="20" width="140" height="56" rx="6" fill="#fed7aa"/><text x="240" y="44" text-anchor="middle" class="svg-ink" font-size="12">Fault 2</text><text x="240" y="62" text-anchor="middle" class="svg-muted" font-size="12">ADOM version</text>
<rect x="330" y="20" width="140" height="56" rx="6" fill="#fed7aa"/><text x="400" y="44" text-anchor="middle" class="svg-ink" font-size="12">Fault 3</text><text x="400" y="62" text-anchor="middle" class="svg-muted" font-size="12">push disabled</text>
<rect x="490" y="20" width="140" height="56" rx="6" fill="#fed7aa"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="12">Fault 4</text><text x="560" y="62" text-anchor="middle" class="svg-muted" font-size="12">missing mapping</text>
<line x1="150" y1="48" x2="170" y2="48" stroke="#64748b" stroke-width="2"/><line x1="310" y1="48" x2="330" y2="48" stroke="#64748b" stroke-width="2"/><line x1="470" y1="48" x2="490" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="10" y="112" class="svg-muted" font-size="12">Each fault hides the next one. You only see fault 3 after fault 2 is fixed.</text>
</svg><p class="cap">The lab is a chain: fixing one fault reveals the next.</p></div>

<h3>Task 1: find the address the branch really uses</h3>
<p>Start on the FortiGate, not on FMG-1. FMG-1 has nothing to show, because no tunnel exists. Switch on the FGFM debug and read it for a few seconds:</p>
<pre class="code">diagnose debug application fgfmsd -1
diagnose debug enable
<span class="c">! read the log, then</span>
diagnose debug disable</pre>
<p>Look for the line that names the address and port. In the simulator the lines have this shape:</p>
<pre class="out">[fgfm_connect] connecting to <span class="hl">192.0.2.50</span>:541
[fgfm_connect] failed: connection to 192.0.2.50:541 timed out (no response from the FortiManager)</pre>
<p>The question asks which address the branch tries. Next, compare it with <code>show system central-management</code>. The lab shows <code>set type fortimanager</code>, a wrong <code>fmg</code> value and <code>set allow-push-configuration disable</code>. Correct the fmg value only; leave the push setting for later, because you are meant to meet that fault on its own. Then look at <code>execute fmgui unauthorized list</code> (a GUI action in the real product). MDU-FGT should now be listed with serial FGVMEV1JOS6TJ000.</p>
<p><b>Wrong turn:</b> checking routes. The error says timed out, not no route, and the path to 192.0.2.5 is fine. A timeout on a typed address is a typing problem.</p>

<h3>Task 2: authorize and read the version</h3>
<p>Authorize MDU-FGT into Kaveri. It is refused. The message names two versions, and the task asks you for the ADOM version in it.</p>
<pre class="out">Authorization failed: Device firmware version 7.6 does not match the version of ADOM Kaveri (<span class="hl">7.4</span>).</pre>
<p>The device runs 7.6, so the ADOM was created with the wrong version. You can confirm with <code>diagnose dvm adom list</code>. The fix is in the ADOM table of FMG-1 (<code>config dvmdb adom</code>, edit Kaveri, set the version). Do not create a second ADOM for this; the objects and package are already in Kaveri. After authorize, confirm with <code>diagnose dvm device list</code> and look for revision 1 and <code>dm: retrieved</code>.</p>
<p><b>Wrong turn:</b> trying to change the FortiGate firmware. The rule is that the ADOM follows the device.</p>

<h3>Task 3: installation target and the push setting</h3>
<p>Branch-PP has no installation target. First install attempt: "device 'MDU-FGT' is not an installation target of package 'Branch-PP'". Add the target in <code>config pm pkg</code>. The next attempt names the second fault, and the task asks which FortiGate setting blocks it:</p>
<pre class="out">Install failed: MDU-FGT does not accept configuration changes from FortiManager (<span class="hl">allow-push-configuration</span> is disabled).</pre>
<p>This setting lives on MDU-FGT under <code>config system central-management</code>. It is a decision of the branch, not of FortiManager. In the lab you may enable it; in a company you would ask why it was disabled first.</p>
<p><b>Wrong turn:</b> looking for the setting on FMG-1. The cause is on the device.</p>

<h3>Task 4: the missing mapping and the proof</h3>
<p>The third attempt fails on content: normalized interface LAN has no mapping for MDU-FGT. Read the device to find which port is the LAN side (the lab topology uses the port with the 10.20.0.1 address) and add a dynamic-mapping row named MDU-FGT in the interface LAN. Then run <code>execute fmgui install-preview Kaveri Branch-PP MDU-FGT</code> to read the 21 CLI lines, install, and prove the result from PC-MDU with <code>ping 192.0.2.80</code>. Five replies is the success picture.</p>
<pre class="out">FMG-1 # diagnose dvm device list
... MDU-FGT  Kaveri ...
  |- STATUS: dev-db: not modified; conf: in sync; cond: OK; <span class="hl">dm: installed</span>; conn: up
  |- vdom:[3]root flags:0 adom:Kaveri pkg:[installed]Branch-PP</pre>

<div class="warn"><p><b>Common mistakes in this lab.</b> Fixing everything at once from memory instead of reading each message. Entering a mapping for the wrong port. Forgetting the preview. Declaring success without the ping.</p></div>

<div class="exam"><p><b>Exam traps.</b> The version message appears at authorize, not at install. The push setting is on the FortiGate. A mapping is per device and per normalized interface.</p></div>

<div class="scn"><h4>One ticket, four owners</h4><p>In a real company the four faults of this lab belong to four people: the branch engineer (address), the FortiManager administrator (ADOM version), the branch security owner (push permission) and the policy author (mapping). The ticket owner who worked from the FortiGate outwards could name the owner of each fault as it appeared, and so each fix went to the right person the same day.</p><p><b>Lesson:</b> a fault list with owners is part of the fix.</p></div>

<div class="iv"><p class="q">"Walk me through a ticket where a branch is not manageable and nothing installs."</p><p>Debug on the FortiGate first, then the device database and ADOM, then the install messages one by one. Give each fault by name: wrong fmg address, ADOM version, allow-push-configuration, missing mapping, and say how you proved the end result with a ping.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start from the FortiGate when FMG-1 shows nothing.</li>
<li>The debug names the address the FortiGate really uses.</li>
<li>The ADOM version must equal the firmware; fix the ADOM.</li>
<li>Installation target, push permission and mapping are three separate gates.</li>
<li>Finish with preview, install and a real ping.</li>
</ul></div>
`,hi:`
<p>Ye ek troubleshooting lab hai jiska shape real life jaisa hai: ek ticket, chaar independent faults aur koi map nahi. Achha engineer doctor ki tarah history leta hai: system kya kehta hai poocho, ek cause test karo, ilaaj karo, aur dobara check karo. Ye chapter aapko goal, approach aur kya dekhna hai batata hai. Ye solution paste nahi karta, kyunki maksad har fault khud dhoondhna hai. Chapter 1 ka workflow aur chapter 2 ka catalogue use karo.</p>

<div class="eg"><p><b>Ticket (KR-2420).</b> "MDU-FGT ko branch engineer ne central management ke liye set kiya. Wo FortiManager mein nahi dikhta, aur baad mein add karne par kuch install nahi ho paya." Devices: FMG-1, SW-NET, SRV-WEB, MDU-FGT, SW-MDU, PC-MDU. FMG-1 mein ADOM Kaveri, objects aur package Branch-PP pehle se hain (abhi installation target nahi). Time: lagbhag 30 minute. Goal: MDU-FGT Kaveri mein managed ho, Branch-PP install ho, aur PC-MDU 192.0.2.80 par SRV-WEB tak pahunche.</p></div>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Four faults in order">
<rect x="10" y="20" width="140" height="56" rx="6" fill="#fed7aa"/><text x="80" y="44" text-anchor="middle" class="svg-ink" font-size="12">Fault 1</text><text x="80" y="62" text-anchor="middle" class="svg-muted" font-size="12">galat fmg address</text>
<rect x="170" y="20" width="140" height="56" rx="6" fill="#fed7aa"/><text x="240" y="44" text-anchor="middle" class="svg-ink" font-size="12">Fault 2</text><text x="240" y="62" text-anchor="middle" class="svg-muted" font-size="12">ADOM version</text>
<rect x="330" y="20" width="140" height="56" rx="6" fill="#fed7aa"/><text x="400" y="44" text-anchor="middle" class="svg-ink" font-size="12">Fault 3</text><text x="400" y="62" text-anchor="middle" class="svg-muted" font-size="12">push disabled</text>
<rect x="490" y="20" width="140" height="56" rx="6" fill="#fed7aa"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="12">Fault 4</text><text x="560" y="62" text-anchor="middle" class="svg-muted" font-size="12">missing mapping</text>
<line x1="150" y1="48" x2="170" y2="48" stroke="#64748b" stroke-width="2"/><line x1="310" y1="48" x2="330" y2="48" stroke="#64748b" stroke-width="2"/><line x1="470" y1="48" x2="490" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="10" y="112" class="svg-muted" font-size="12">Har fault agla fault chhupata hai. Fault 3 tabhi dikhta hai jab fault 2 fix ho.</text>
</svg><p class="cap">Lab ek chain hai: ek fault fix karo to agla dikhta hai.</p></div>

<h3>Task 1: branch asal mein kaun sa address use karta hai</h3>
<p>FortiGate se shuru karo, FMG-1 se nahi. FMG-1 ke paas dikhane ko kuch nahi, kyunki tunnel hai hi nahi. FGFM debug on karo aur kuch second ka log padho:</p>
<pre class="code">diagnose debug application fgfmsd -1
diagnose debug enable
<span class="c">! log padho, phir</span>
diagnose debug disable</pre>
<p>Wo line dhoondho jo address aur port batati hai. Simulator mein lines is shape ki hoti hain:</p>
<pre class="out">[fgfm_connect] connecting to <span class="hl">192.0.2.50</span>:541
[fgfm_connect] failed: connection to 192.0.2.50:541 timed out (no response from the FortiManager)</pre>
<p>Sawal poochta hai ki branch kaun sa address try karta hai. Phir use <code>show system central-management</code> se compare karo. Lab mein <code>set type fortimanager</code>, galat <code>fmg</code> value aur <code>set allow-push-configuration disable</code> dikhta hai. Sirf fmg value sahi karo; push setting baad ke liye chhod do, kyunki aapko wo fault alag se milna chahiye. Phir <code>execute fmgui unauthorized list</code> dekho (real product mein GUI action). MDU-FGT ab serial FGVMEV1JOS6TJ000 ke saath listed hona chahiye.</p>
<p><b>Wrong turn:</b> routes check karna. Error timed out kehta hai, no route nahi, aur 192.0.2.5 tak path theek hai. Type kiye gaye address par timeout typing problem hai.</p>

<h3>Task 2: authorize karo aur version padho</h3>
<p>MDU-FGT ko Kaveri mein authorize karo. Refuse hota hai. Message do versions batata hai, aur task usme se ADOM version poochta hai.</p>
<pre class="out">Authorization failed: Device firmware version 7.6 does not match the version of ADOM Kaveri (<span class="hl">7.4</span>).</pre>
<p>Device 7.6 chalata hai, to ADOM galat version ke saath bana tha. <code>diagnose dvm adom list</code> se confirm kar sakte ho. Fix FMG-1 ki ADOM table mein hai (<code>config dvmdb adom</code>, edit Kaveri, version set karo). Iske liye doosra ADOM mat banao; objects aur package pehle se Kaveri mein hain. Authorize ke baad <code>diagnose dvm device list</code> se confirm karo aur revision 1 aur <code>dm: retrieved</code> dekho.</p>
<p><b>Wrong turn:</b> FortiGate firmware badalne ki koshish. Rule ye hai ki ADOM device ko follow karta hai.</p>

<h3>Task 3: installation target aur push setting</h3>
<p>Branch-PP ka koi installation target nahi hai. Pehli install attempt: "device 'MDU-FGT' is not an installation target of package 'Branch-PP'". <code>config pm pkg</code> mein target jodo. Agli attempt doosra fault batati hai, aur task poochta hai ki FortiGate ki kaun si setting use rok rahi hai:</p>
<pre class="out">Install failed: MDU-FGT does not accept configuration changes from FortiManager (<span class="hl">allow-push-configuration</span> is disabled).</pre>
<p>Ye setting MDU-FGT par <code>config system central-management</code> ke neeche hai. Ye branch ka decision hai, FortiManager ka nahi. Lab mein aap ise enable kar sakte ho; company mein pehle poochoge ki ye disabled kyun thi.</p>
<p><b>Wrong turn:</b> setting FMG-1 par dhoondhna. Cause device par hai.</p>

<h3>Task 4: missing mapping aur proof</h3>
<p>Teesri attempt content par fail hoti hai: normalized interface LAN ka MDU-FGT ke liye mapping nahi hai. Device padho aur pata karo ki LAN side kaun sa port hai (lab topology mein wo port jiska address 10.20.0.1 hai) aur interface LAN mein MDU-FGT naam ki dynamic-mapping row jodo. Phir <code>execute fmgui install-preview Kaveri Branch-PP MDU-FGT</code> chalakar 21 CLI lines padho, install karo, aur PC-MDU se <code>ping 192.0.2.80</code> se result prove karo. Paanch replies success ki tasveer hai.</p>
<pre class="out">FMG-1 # diagnose dvm device list
... MDU-FGT  Kaveri ...
  |- STATUS: dev-db: not modified; conf: in sync; cond: OK; <span class="hl">dm: installed</span>; conn: up
  |- vdom:[3]root flags:0 adom:Kaveri pkg:[installed]Branch-PP</pre>

<div class="warn"><p><b>Is lab ki common mistakes.</b> Har message padhne ki jagah yaad se sab ek saath fix karna. Galat port ka mapping dalna. Preview bhool jana. Ping ke bina success declare karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Version message authorize par aata hai, install par nahi. Push setting FortiGate par hai. Mapping har device aur har normalized interface ke liye hota hai.</p></div>

<div class="scn"><h4>Ek ticket, chaar owners</h4><p>Real company mein is lab ke chaar faults chaar logon ke hote hain: branch engineer (address), FortiManager administrator (ADOM version), branch security owner (push permission) aur policy author (mapping). Jis ticket owner ne FortiGate se bahar ki taraf kaam kiya, wo har fault ke saath uska owner bata saka, aur isliye har fix usi din sahi vyakti ke paas gaya.</p><p><b>Lesson:</b> owners ke saath fault list bhi fix ka hissa hai.</p></div>

<div class="iv"><p class="q">"Ek aisa ticket samjhao jisme branch manage nahi ho raha aur kuch install nahi hota."</p><p>Pehle FortiGate par debug, phir device database aur ADOM, phir install messages ek-ek karke. Har fault naam se batao: galat fmg address, ADOM version, allow-push-configuration, missing mapping, aur batao ki final result ping se kaise prove kiya.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FMG-1 kuch na dikhaye to FortiGate se shuru karo.</li>
<li>Debug batata hai ki FortiGate asal mein kaun sa address use karta hai.</li>
<li>ADOM version firmware ke barabar ho; ADOM fix karo.</li>
<li>Installation target, push permission aur mapping teen alag gates hain.</li>
<li>Preview, install aur real ping se khatam karo.</li>
</ul></div>
`}};export{e as default};