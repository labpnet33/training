var e={id:`lab-fm-onboard`,h:{en:`Lab fm-onboard: bring the first FortiGate under management`,hi:`Lab fm-onboard: pehle FortiGate ko management mein laao`},body:{en:`
<p>A good lab is like a driving lesson on an empty road: you already know the controls, so now you practise the order. In this lab you take HQ-FGT, the Chennai head office firewall, from "managed by hand" to "managed by FMG-1". It has four tasks and takes about 25 minutes. The topology is the Kaveri Retail network: FMG-1 at 192.0.2.5, HQ-FGT at 192.0.2.11 and MDU-FGT at 192.0.2.12 on the management network, with the PCs and switches behind them.</p>

<div class="note"><p><b>Before you start.</b> Open FMG-1 and HQ-FGT. Authorize and import-policy are written as <code>execute fmgui</code> commands in the simulator because they are GUI or API actions in the real product. Do not paste a finished script; do each step and read the reply.</p></div>

<h3>Goal and approach</h3>
<p>The goal is that FMG-1 owns the HQ-FGT configuration inside an ADOM called Kaveri. The order is fixed by dependencies: the ADOM must exist before you can authorize into it, the FortiGate must call in before it can be authorized, and the configuration must be retrieved before its policy can be imported. If you change the order you will see an error message that names the missing piece.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Dependencies in the lab">
<rect x="10" y="40" width="130" height="64" rx="8" fill="#ddd6fe"/><text x="75" y="68" text-anchor="middle" class="svg-ink" font-size="13">Task 1</text><text x="75" y="88" text-anchor="middle" class="svg-muted" font-size="12">ADOM Kaveri</text>
<rect x="170" y="40" width="130" height="64" rx="8" fill="#bae6fd"/><text x="235" y="68" text-anchor="middle" class="svg-ink" font-size="13">Task 2</text><text x="235" y="88" text-anchor="middle" class="svg-muted" font-size="12">call in, port 541</text>
<rect x="330" y="40" width="130" height="64" rx="8" fill="#bbf7d0"/><text x="395" y="68" text-anchor="middle" class="svg-ink" font-size="13">Task 3</text><text x="395" y="88" text-anchor="middle" class="svg-muted" font-size="12">authorize</text>
<rect x="490" y="40" width="140" height="64" rx="8" fill="#fde68a"/><text x="560" y="68" text-anchor="middle" class="svg-ink" font-size="13">Task 4</text><text x="560" y="88" text-anchor="middle" class="svg-muted" font-size="12">import-policy</text>
<line x1="140" y1="72" x2="170" y2="72" stroke="#64748b" stroke-width="2"/><line x1="300" y1="72" x2="330" y2="72" stroke="#64748b" stroke-width="2"/><line x1="460" y1="72" x2="490" y2="72" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Each task needs the result of the one before it.</p></div>

<h3>Task 1: turn on ADOMs and create Kaveri</h3>
<p>Why: ADOMs are off, so only <code>root</code> exists. Think about which section holds the switch (<code>config system global</code>) and which table holds ADOMs (<code>config dvmdb adom</code>). Set the version to 7.6, because the FortiGates run 7.6. Confirm with <code>diagnose dvm adom list</code>. What to look for: a second row named Kaveri, version 7.6, state enabled, 0 devices, and the line about disabled ADOMs gone.</p>
<pre class="out">FMG-1 # diagnose dvm adom list
--- There are currently 2 ADOMs ---
OID   STATE    NAME    VERSION  MODE  DEVICES
3     enabled  root    7.6      GMS   0
464   enabled  <span class="hl">Kaveri</span>  7.6      GMS   <span class="hl">0</span></pre>
<p>Wrong turns: creating the ADOM with <code>edit "Kaveri"</code> but forgetting <code>set version 7.6</code>; typing <code>next</code> and <code>end</code> in the wrong order so the entry is not saved.</p>

<h3>Task 2: point HQ-FGT at the FortiManager</h3>
<p>Why: the FortiGate must call in before FMG-1 knows it. On HQ-FGT use <code>config system central-management</code> with the type and the FortiManager address (chapter 3). Then on FMG-1 list the unauthorized devices. The question asks for a TCP port: it is the port of the FGFM tunnel from chapter 2.</p>
<pre class="out">FMG-1 # execute fmgui unauthorized list
Unauthorized devices (connected through FGFM, waiting to be authorized):
NAME        SERIAL            IP          VERSION
<span class="hl">HQ-FGT</span>      FGVMEV1RGF38I000  192.0.2.11  7.6 MR0</pre>
<p>Wrong turns: setting only <code>fmg</code> and leaving the type at fortiguard (the list stays empty); using a wrong address; waiting too little. If HQ-FGT is missing, use the checks of chapter 5 before you change anything else.</p>

<h3>Task 3: authorize into Kaveri</h3>
<p>Why: authorize moves the device from the waiting list to the device database and retrieves its configuration. Run it, then check the device list. The three words you want in the status line are <code>conf: in sync</code>, <code>dm: retrieved</code> and <code>conn: up</code>. What to look for:</p>
<pre class="out">FMG-1 # execute fmgui authorize HQ-FGT Kaveri
Device HQ-FGT (FGVMEV1RGF38I000) authorized in ADOM Kaveri.
Configuration retrieved: revision 1 created.

|- STATUS: dev-db: not modified; <span class="hl">conf: in sync</span>; cond: OK; <span class="hl">dm: retrieved</span>; <span class="hl">conn: up</span></pre>
<p>Wrong turns: "ADOM 'Kaveri' does not exist" means task 1 was not done or the name is spelled differently; "not in the list of unauthorized devices" means HQ-FGT is already authorized (or never called in).</p>

<h3>Task 4: import the existing policy</h3>
<p>Why: until you import, the policy database knows nothing of the HQ-FGT rules. Import into a new package called HQ-Imported in the ADOM Kaveri, naming the device as the source. The reply states how many policies and address objects came across. Then read the pkg field of <code>diagnose dvm device list</code>; the lab asks for the word in the brackets.</p>
<pre class="out">Import finished: policy package HQ-Imported created in ADOM Kaveri with 1 policies and 0 address objects (installation target HQ-FGT).

|- vdom:[3]root flags:0 adom:Kaveri pkg:[<span class="hl">imported</span>]HQ-Imported</pre>

<div class="warn"><p><b>Common mistakes.</b> Running the commands in the wrong mode; checking the status before authorize; and treating the lab as done after task 3. The pkg field still reads unknown until the import is done. Do not run an install in this lab; it is not asked for.</p></div>

<div class="exam"><p><b>Exam traps.</b> Revision 1 is created by the retrieve during authorize, not by import. Import creates a package and sets the pkg field; it does not send anything to the FortiGate. In the real product, import also offers normalized interface mapping, which the simulator keeps simple.</p></div>

<div class="scn"><h4>The head-office firewall nobody wanted to touch</h4><p>Kaveri's head-office FortiGate had grown a policy table nobody dared to edit. The engineer onboarded it exactly as in this lab, importing before doing anything else. FMG-1 then showed the same policy in the package, so the first change was made centrally and installed with a preview.</p><p><b>Lesson:</b> onboarding is safe when you import first; it turns a risky device into a documented one.</p></div>

<div class="iv"><p class="q">"You have just authorized a FortiGate. What do you do before the first install?"</p><p>Check that the status shows conf in sync and conn up, then import the existing policy into a package so FortiManager does not overwrite it with an empty table. Mention revision 1 as the safe baseline.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The order is ADOM, call in, authorize, import.</li>
<li>Authorize retrieves the configuration as revision 1.</li>
<li>The healthy status is conf in sync, dm retrieved, conn up.</li>
<li>Import fills the package and the pkg field shows imported.</li>
<li>Error messages name the missing earlier step.</li>
</ul></div>
`,hi:`
<p>Achha lab khaali sadak par driving lesson jaisa hai: controls aap jaante ho, ab aap order ki practice karte ho. Is lab mein aap Chennai head office firewall HQ-FGT ko "haath se managed" se "FMG-1 se managed" tak le jate ho. Isme chaar tasks hain aur lagbhag 25 minute lagte hain. Topology Kaveri Retail network hai: FMG-1 192.0.2.5 par, HQ-FGT 192.0.2.11 par aur MDU-FGT 192.0.2.12 par management network par, PCs aur switches unke peeche.</p>

<div class="note"><p><b>Shuru karne se pehle.</b> FMG-1 aur HQ-FGT kholo. Authorize aur import-policy simulator mein <code>execute fmgui</code> commands ki tarah likhe hain kyunki real product mein ye GUI ya API actions hain. Taiyar script paste mat karo; har step karo aur reply padho.</p></div>

<h3>Goal aur approach</h3>
<p>Goal ye hai ki FMG-1 HQ-FGT ki configuration ADOM Kaveri ke andar own kare. Order dependencies se tay hota hai: ADOM authorize se pehle exist karna chahiye, FortiGate ko authorize hone se pehle call in karna chahiye, aur policy import hone se pehle configuration retrieve honi chahiye. Order badloge to error message missing piece ka naam batayega.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab ki dependencies">
<rect x="10" y="40" width="130" height="64" rx="8" fill="#ddd6fe"/><text x="75" y="68" text-anchor="middle" class="svg-ink" font-size="13">Task 1</text><text x="75" y="88" text-anchor="middle" class="svg-muted" font-size="12">ADOM Kaveri</text>
<rect x="170" y="40" width="130" height="64" rx="8" fill="#bae6fd"/><text x="235" y="68" text-anchor="middle" class="svg-ink" font-size="13">Task 2</text><text x="235" y="88" text-anchor="middle" class="svg-muted" font-size="12">call in, port 541</text>
<rect x="330" y="40" width="130" height="64" rx="8" fill="#bbf7d0"/><text x="395" y="68" text-anchor="middle" class="svg-ink" font-size="13">Task 3</text><text x="395" y="88" text-anchor="middle" class="svg-muted" font-size="12">authorize</text>
<rect x="490" y="40" width="140" height="64" rx="8" fill="#fde68a"/><text x="560" y="68" text-anchor="middle" class="svg-ink" font-size="13">Task 4</text><text x="560" y="88" text-anchor="middle" class="svg-muted" font-size="12">import-policy</text>
<line x1="140" y1="72" x2="170" y2="72" stroke="#64748b" stroke-width="2"/><line x1="300" y1="72" x2="330" y2="72" stroke="#64748b" stroke-width="2"/><line x1="460" y1="72" x2="490" y2="72" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har task ko pichhle task ka result chahiye.</p></div>

<h3>Task 1: ADOMs on karo aur Kaveri banao</h3>
<p>Kyun: ADOMs off hain, isliye sirf <code>root</code> exist karta hai. Socho switch kaun se section mein hai (<code>config system global</code>) aur ADOMs kaun si table mein (<code>config dvmdb adom</code>). Version 7.6 rakho, kyunki FortiGates 7.6 chalate hain. <code>diagnose dvm adom list</code> se confirm karo. Kya dekhna hai: Kaveri naam ki doosri row, version 7.6, state enabled, 0 devices, aur disabled ADOMs wali line gayab.</p>
<pre class="out">FMG-1 # diagnose dvm adom list
--- There are currently 2 ADOMs ---
OID   STATE    NAME    VERSION  MODE  DEVICES
3     enabled  root    7.6      GMS   0
464   enabled  <span class="hl">Kaveri</span>  7.6      GMS   <span class="hl">0</span></pre>
<p>Wrong turns: <code>edit "Kaveri"</code> karke <code>set version 7.6</code> bhool jana; <code>next</code> aur <code>end</code> galat order mein type karna jisse entry save nahi hoti.</p>

<h3>Task 2: HQ-FGT ko FortiManager par point karo</h3>
<p>Kyun: FMG-1 use tabhi jaanta hai jab FortiGate call in kare. HQ-FGT par type aur FortiManager address ke saath <code>config system central-management</code> use karo (chapter 3). Phir FMG-1 par unauthorized devices list karo. Sawaal TCP port poochta hai: wo chapter 2 ke FGFM tunnel ka port hai.</p>
<pre class="out">FMG-1 # execute fmgui unauthorized list
Unauthorized devices (connected through FGFM, waiting to be authorized):
NAME        SERIAL            IP          VERSION
<span class="hl">HQ-FGT</span>      FGVMEV1RGF38I000  192.0.2.11  7.6 MR0</pre>
<p>Wrong turns: sirf <code>fmg</code> set karna aur type fortiguard chhod dena (list khaali rehti hai); galat address; bahut kam wait karna. HQ-FGT missing ho to kuch aur badalne se pehle chapter 5 ke checks karo.</p>

<h3>Task 3: Kaveri mein authorize karo</h3>
<p>Kyun: authorize device ko waiting list se device database mein le jata hai aur uski configuration retrieve karta hai. Chalao, phir device list check karo. Status line mein jo teen words chahiye wo hain <code>conf: in sync</code>, <code>dm: retrieved</code> aur <code>conn: up</code>. Kya dekhna hai:</p>
<pre class="out">FMG-1 # execute fmgui authorize HQ-FGT Kaveri
Device HQ-FGT (FGVMEV1RGF38I000) authorized in ADOM Kaveri.
Configuration retrieved: revision 1 created.

|- STATUS: dev-db: not modified; <span class="hl">conf: in sync</span>; cond: OK; <span class="hl">dm: retrieved</span>; <span class="hl">conn: up</span></pre>
<p>Wrong turns: "ADOM 'Kaveri' does not exist" ka matlab task 1 nahi hua ya naam alag spell hai; "not in the list of unauthorized devices" ka matlab HQ-FGT pehle se authorized hai (ya kabhi call in nahi hua).</p>

<h3>Task 4: existing policy import karo</h3>
<p>Kyun: import tak policy database HQ-FGT ke rules ke baare mein kuch nahi jaanta. ADOM Kaveri mein HQ-Imported naam ke naye package mein import karo, device ko source ke roop mein naam dekar. Reply batata hai kitni policies aur address objects aaye. Phir <code>diagnose dvm device list</code> ka pkg field padho; lab brackets ka word poochta hai.</p>
<pre class="out">Import finished: policy package HQ-Imported created in ADOM Kaveri with 1 policies and 0 address objects (installation target HQ-FGT).

|- vdom:[3]root flags:0 adom:Kaveri pkg:[<span class="hl">imported</span>]HQ-Imported</pre>

<div class="warn"><p><b>Common mistakes.</b> Commands galat mode mein chalana; authorize se pehle status dekhna; aur task 3 ke baad lab khatam maan lena. Import hone tak pkg field unknown padhta hai. Is lab mein install mat chalao; wo maanga nahi gaya.</p></div>

<div class="exam"><p><b>Exam traps.</b> Revision 1 authorize ke dauran retrieve se banta hai, import se nahi. Import package banata hai aur pkg field set karta hai; wo FortiGate ko kuch nahi bhejta. Real product mein import normalized interface mapping bhi offer karta hai, jo simulator simple rakhta hai.</p></div>

<div class="scn"><h4>Head-office firewall jise koi chhoona nahi chahta tha</h4><p>Kaveri ke head-office FortiGate ki policy table itni badh gayi thi ki koi edit karne ki himmat nahi karta tha. Engineer ne use bilkul is lab ki tarah onboard kiya, kuch aur karne se pehle import karke. FMG-1 ne package mein wahi policy dikhayi, aur pehla change centrally kiya gaya aur preview ke saath install hua.</p><p><b>Lesson:</b> import pehle karo to onboarding safe hai; risky device documented device ban jata hai.</p></div>

<div class="iv"><p class="q">"Aapne abhi FortiGate authorize kiya hai. Pehle install se pehle kya karoge?"</p><p>Check karo ki status conf in sync aur conn up dikhata hai, phir existing policy ek package mein import karo taaki FortiManager use khaali table se overwrite na kare. Revision 1 ko safe baseline ki tarah mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order hai ADOM, call in, authorize, import.</li>
<li>Authorize configuration ko revision 1 ki tarah retrieve karta hai.</li>
<li>Healthy status hai conf in sync, dm retrieved, conn up.</li>
<li>Import package bharta hai aur pkg field imported dikhata hai.</li>
<li>Error messages pichhle missing step ka naam batate hain.</li>
</ul></div>
`}};export{e as default};