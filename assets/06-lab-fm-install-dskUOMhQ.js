var e={id:`lab-fm-install`,h:{en:`Lab fm-install: package, preview, install and a change behind FortiManager's back`,hi:`Lab fm-install: package, preview, install aur FortiManager ki peeth peeche change`},body:{en:`
<p>This is a guided walk through the lab <b>fm-install</b> (config lab, about 35 minutes). Open the lab and follow along. We explain the goal, the approach and what to look for, but we do not paste the whole solution; the hints in the lab and the command forms from chapters 1 to 4 are enough.</p>

<div class="note"><p><b>Situation.</b> MDU-FGT (Madurai) and TRY-FGT (Trichy) are authorized in the ADOM Kaveri and have no firewall policy at all, so the branch PCs cannot reach the intranet web server SRV-WEB (192.0.2.80). You work on FMG-1. Remember that <code>execute fmgui ...</code> is a simulator command; in the real product these are GUI actions.</p></div>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Lab fm-install topology">
<rect x="250" y="10" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">FMG-1 192.0.2.5</text>
<rect x="250" y="76" width="140" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="99" text-anchor="middle" class="svg-ink" font-size="13">SW-NET</text>
<rect x="500" y="76" width="130" height="36" rx="8" fill="#bbf7d0"/><text x="565" y="99" text-anchor="middle" class="svg-ink" font-size="13">SRV-WEB .80</text>
<rect x="60" y="140" width="130" height="40" rx="8" fill="#bae6fd"/><text x="125" y="165" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT .12</text>
<rect x="450" y="140" width="130" height="40" rx="8" fill="#bae6fd"/><text x="515" y="165" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT .13</text>
<line x1="320" y1="54" x2="320" y2="76" stroke="#64748b" stroke-width="2"/><line x1="290" y1="112" x2="125" y2="140" stroke="#64748b" stroke-width="2"/><line x1="350" y1="112" x2="515" y2="140" stroke="#64748b" stroke-width="2"/><line x1="390" y1="94" x2="500" y2="94" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Management network 192.0.2.0/24. Each branch has its PC behind port2.</p></div>

<h3>Task 1: objects</h3>
<p><b>Goal:</b> create the address SRV-WEB (192.0.2.80/32) and the normalized interfaces LAN and WAN, with a dynamic mapping for MDU-FGT and TRY-FGT (LAN is port2, WAN is port1).</p>
<p><b>Approach:</b> use <code>config pm address</code> and <code>config pm interface</code> with <code>config dynamic-mapping</code> (chapters 1 and 2). Every table needs <code>set adom "Kaveri"</code>. Write both interfaces and both mapping rows for each.</p>
<p><b>Check:</b> <code>show pm interface</code> must list four mapping rows in total. <b>Wrong turn:</b> mapping only MDU-FGT because that is the first device you install to. The lab will let you carry on until the second install fails, which is the topic of lab fm-map-ts.</p>

<h3>Task 2: the package</h3>
<p><b>Goal:</b> package Branch-PP with installation targets MDU-FGT and TRY-FGT and policy 1 LAN-TO-SRV (LAN to WAN, srcaddr all, destination SRV-WEB, service ALL, accept, NAT).</p>
<p><b>Approach:</b> <code>config pm pkg</code>, then <code>config policy</code> inside it. Type both device names in a single <code>set install-target</code> line. <b>Check:</b> <code>show pm pkg</code> must show the install-target line and the policy. <b>Wrong turn:</b> writing port2 and port1 in the policy. Use the normalized names; the mapping does the translation.</p>

<h3>Task 3: preview, install, test</h3>
<p><b>Goal:</b> preview and install to MDU-FGT, then ping SRV-WEB from PC-MDU and read the package field in the device list.</p>
<p><b>Approach:</b> <code>install-preview</code> first, with the three arguments adom, package, device. Read the lines before you install. The device had no policies, so you see no delete lines.</p>
<pre class="out">Install preview for MDU-FGT (18 CLI lines, nothing is sent to the device):
  config firewall address
  edit "SRV-WEB"
  set subnet 192.0.2.80 255.255.255.255
  ...
  config firewall policy
  edit 1
  set name "LAN-TO-SRV"
  <span class="hl">set srcintf "port2"</span>
  <span class="hl">set dstintf "port1"</span></pre>
<p>This is the translation from LAN and WAN to real ports. Then install:</p>
<pre class="out">Starting installation to MDU-FGT (ADOM Kaveri)...
  device settings: nothing to copy
  policy package: Branch-PP installed (1 policies)
<span class="hl">Task 1: install finished with status success. Revision 2 created.</span></pre>
<p><b>Verify</b> two ways. From PC-MDU, <code>ping 192.0.2.80</code> must answer (the FortiGate translates the PC address because of NAT). On FMG-1, <code>diagnose dvm device list</code> must read <code>pkg:[installed]Branch-PP</code> and <code>dm: installed</code> for MDU-FGT. <b>Wrong turns:</b> an install error about the installation target means the install-target line is missing a name; a mapping error means a row is missing. Read the message, it names both.</p>

<h3>Task 4: a change behind FortiManager's back</h3>
<p><b>Goal:</b> see what FortiManager does with a policy added directly on the branch FortiGate, and prove that the next install removes it.</p>
<p><b>Approach:</b> on MDU-FGT, add policy 99 named TEMP-SSH (port1 to port2, service SSH, accept) with <code>config firewall policy</code>; the lab hint has the lines. Then read the device list at once and again after a few seconds.</p>
<pre class="out">|- STATUS: dev-db: not modified; <span class="hl">conf: out of sync</span>; cond: pending; dm: installed; conn: up
|- vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[modified]Branch-PP</span></pre>
<p>Right after the change, <code>conf</code> turns <code>out of sync</code> and the package shows <code>modified</code>: FortiManager notices that the device differs from what it installed. After a few seconds FortiManager takes the local change over (the task answer for dm is <b>autoupdated</b>) and records a new revision created by "auto update".</p>
<pre class="out">FMG-1 # execute fmgui revision list MDU-FGT
ID  CREATED BY   TIME                 NAME
1   retrieve     ...                  Retrieved
2   install      ...                  Installed Branch-PP
<span class="hl">3   auto update  ...                  Auto-Update</span>

FMG-1 # execute fmgui revision diff MDU-FGT 2 3
+     edit 99
+         set name "TEMP-SSH"</pre>
<p>The diff shows with plus lines exactly what was added. Now install Branch-PP to MDU-FGT again. The package does not contain policy 99, and an install replaces the table, so the device no longer has it. After the reinstall, <code>show firewall policy</code> on MDU-FGT lists only policy 1, the device list is back to <code>dm: installed</code> and <code>pkg:[installed]Branch-PP</code>, and the revision list has a fourth entry from the install.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Reading the device list too early or too late and missing the out of sync state: the second reading is the one that shows autoupdated. (2) Believing that auto update adds policy 99 to the package. It only records the device state as a revision; the package is unchanged. (3) Installing to TRY-FGT before its mapping rows exist.</p></div>

<div class="exam"><p><b>Exam traps.</b> Out of sync means the device differs from FortiManager's last copy. Auto update records the device change as a revision; it does not edit the package. The next install replaces the table, so a local rule not in the package disappears.</p></div>

<div class="scn"><h4>The emergency SSH rule</h4><p>During an outage a branch administrator opened SSH with a temporary policy directly on the FortiGate. The device list went out of sync, and a day later a scheduled install of the branch package silently removed the rule, and the administrator lost access again. The auditor found the rule in the auto-update revision and the install revision that followed it.</p><p><b>Lesson:</b> a local emergency fix must either be imported into the package or be removed on purpose; otherwise the next install decides for you.</p></div>

<div class="iv"><p class="q">"A colleague changed a managed FortiGate directly. What does FortiManager show and what happens at the next install?"</p><p>The config status becomes out of sync and the package is marked modified; a few seconds later the change is recorded as an auto-update revision. The package does not contain it, so the next install replaces the policy table and removes it. To keep it, import it into the package first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Objects first, then package, then preview, then install, then test.</li>
<li>The preview shows how LAN and WAN become port2 and port1.</li>
<li>pkg:[installed]Branch-PP and a working ping prove success.</li>
<li>A local change gives conf: out of sync, then an auto-update revision.</li>
<li>The next install of the package removes the local rule; revision diff shows what it was.</li>
</ul></div>
`,hi:`
<p>Ye lab <b>fm-install</b> (config lab, lagbhag 35 minute) ka guided walk-through hai. Lab kholo aur saath chalo. Hum goal, approach aur kya dekhna hai batate hain, par poora solution paste nahi karte; lab ke hints aur chapters 1 se 4 ke command forms kaafi hain.</p>

<div class="note"><p><b>Situation.</b> MDU-FGT (Madurai) aur TRY-FGT (Trichy) ADOM Kaveri mein authorized hain aur unke paas koi firewall policy nahi hai, isliye branch PCs intranet web server SRV-WEB (192.0.2.80) tak nahi pahunch sakte. Aap FMG-1 par kaam karte ho. Yaad rakho <code>execute fmgui ...</code> simulator command hai; real product mein ye GUI actions hain.</p></div>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Lab fm-install topology">
<rect x="250" y="10" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">FMG-1 192.0.2.5</text>
<rect x="250" y="76" width="140" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="99" text-anchor="middle" class="svg-ink" font-size="13">SW-NET</text>
<rect x="500" y="76" width="130" height="36" rx="8" fill="#bbf7d0"/><text x="565" y="99" text-anchor="middle" class="svg-ink" font-size="13">SRV-WEB .80</text>
<rect x="60" y="140" width="130" height="40" rx="8" fill="#bae6fd"/><text x="125" y="165" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT .12</text>
<rect x="450" y="140" width="130" height="40" rx="8" fill="#bae6fd"/><text x="515" y="165" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT .13</text>
<line x1="320" y1="54" x2="320" y2="76" stroke="#64748b" stroke-width="2"/><line x1="290" y1="112" x2="125" y2="140" stroke="#64748b" stroke-width="2"/><line x1="350" y1="112" x2="515" y2="140" stroke="#64748b" stroke-width="2"/><line x1="390" y1="94" x2="500" y2="94" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Management network 192.0.2.0/24. Har branch ka PC port2 ke peeche hai.</p></div>

<h3>Task 1: objects</h3>
<p><b>Goal:</b> address SRV-WEB (192.0.2.80/32) aur normalized interfaces LAN aur WAN banao, MDU-FGT aur TRY-FGT ke dynamic mapping ke saath (LAN port2, WAN port1).</p>
<p><b>Approach:</b> <code>config pm address</code> aur <code>config pm interface</code> with <code>config dynamic-mapping</code> use karo (chapters 1 aur 2). Har table ko <code>set adom "Kaveri"</code> chahiye. Dono interfaces aur har ek ki dono mapping rows likho.</p>
<p><b>Check:</b> <code>show pm interface</code> mein kul chaar mapping rows dikhni chahiye. <b>Wrong turn:</b> sirf MDU-FGT map karna kyunki pehle usi par install karoge. Lab dusre install tak chalne dega, jo lab fm-map-ts ka topic hai.</p>

<h3>Task 2: package</h3>
<p><b>Goal:</b> package Branch-PP, installation targets MDU-FGT aur TRY-FGT, aur policy 1 LAN-TO-SRV (LAN se WAN, srcaddr all, destination SRV-WEB, service ALL, accept, NAT).</p>
<p><b>Approach:</b> <code>config pm pkg</code>, phir uske andar <code>config policy</code>. Dono device names ek hi <code>set install-target</code> line mein likho. <b>Check:</b> <code>show pm pkg</code> mein install-target line aur policy dikhni chahiye. <b>Wrong turn:</b> policy mein port2 aur port1 likhna. Normalized names use karo; translation mapping karti hai.</p>

<h3>Task 3: preview, install, test</h3>
<p><b>Goal:</b> MDU-FGT par preview aur install, phir PC-MDU se SRV-WEB ko ping karo aur device list ka package field padho.</p>
<p><b>Approach:</b> pehle <code>install-preview</code>, teen arguments adom, package, device ke saath. Install se pehle lines padho. Device par policies nahi thi, isliye delete lines nahi dikhti.</p>
<pre class="out">Install preview for MDU-FGT (18 CLI lines, nothing is sent to the device):
  config firewall address
  edit "SRV-WEB"
  set subnet 192.0.2.80 255.255.255.255
  ...
  config firewall policy
  edit 1
  set name "LAN-TO-SRV"
  <span class="hl">set srcintf "port2"</span>
  <span class="hl">set dstintf "port1"</span></pre>
<p>Ye LAN aur WAN se real ports ka translation hai. Phir install:</p>
<pre class="out">Starting installation to MDU-FGT (ADOM Kaveri)...
  device settings: nothing to copy
  policy package: Branch-PP installed (1 policies)
<span class="hl">Task 1: install finished with status success. Revision 2 created.</span></pre>
<p><b>Verify</b> do tarah se. PC-MDU se <code>ping 192.0.2.80</code> ka jawab aana chahiye (NAT ki wajah se FortiGate PC ka address translate karta hai). FMG-1 par <code>diagnose dvm device list</code> mein MDU-FGT ke liye <code>pkg:[installed]Branch-PP</code> aur <code>dm: installed</code> hona chahiye. <b>Wrong turns:</b> installation target wala install error ka matlab install-target line mein naam missing hai; mapping error ka matlab ek row missing hai. Message padho, wo dono batata hai.</p>

<h3>Task 4: FortiManager ki peeth peeche change</h3>
<p><b>Goal:</b> dekho ki branch FortiGate par seedha jodi hui policy ke saath FortiManager kya karta hai, aur saabit karo ki agla install use hata deta hai.</p>
<p><b>Approach:</b> MDU-FGT par <code>config firewall policy</code> se policy 99 TEMP-SSH (port1 se port2, service SSH, accept) jodo; lines lab ke hint mein hain. Phir device list turant padho aur kuch second baad dobara.</p>
<pre class="out">|- STATUS: dev-db: not modified; <span class="hl">conf: out of sync</span>; cond: pending; dm: installed; conn: up
|- vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[modified]Branch-PP</span></pre>
<p>Change ke turant baad <code>conf</code> <code>out of sync</code> ho jata hai aur package <code>modified</code> dikhta hai: FortiManager dekhta hai ki device uske install kiye hue se alag hai. Kuch second baad FortiManager local change ko le leta hai (dm ka task answer <b>autoupdated</b> hai) aur "auto update" ke naam se naya revision record karta hai.</p>
<pre class="out">FMG-1 # execute fmgui revision list MDU-FGT
ID  CREATED BY   TIME                 NAME
1   retrieve     ...                  Retrieved
2   install      ...                  Installed Branch-PP
<span class="hl">3   auto update  ...                  Auto-Update</span>

FMG-1 # execute fmgui revision diff MDU-FGT 2 3
+     edit 99
+         set name "TEMP-SSH"</pre>
<p>Diff plus lines se exactly dikhata hai kya jodha gaya. Ab Branch-PP ko MDU-FGT par dobara install karo. Package mein policy 99 nahi hai, aur install table replace karta hai, isliye device se wo chali jati hai. Reinstall ke baad MDU-FGT par <code>show firewall policy</code> sirf policy 1 dikhata hai, device list wapas <code>dm: installed</code> aur <code>pkg:[installed]Branch-PP</code> dikhati hai, aur revision list mein install se chautha entry aati hai.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Device list bahut jaldi ya bahut der se padhna aur out of sync state miss karna: autoupdated dusri reading mein dikhta hai. (2) Maan lena ki auto update policy 99 ko package mein jodta hai. Wo sirf device state ko revision ki tarah record karta hai; package unchanged rehta hai. (3) Mapping rows bane bina TRY-FGT par install karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Out of sync ka matlab device FortiManager ki last copy se alag hai. Auto update device change ko revision ki tarah record karta hai; package edit nahi karta. Agla install table replace karta hai, isliye package mein na hone wala local rule gayab ho jata hai.</p></div>

<div class="scn"><h4>Emergency SSH rule</h4><p>Outage ke dauran ek branch administrator ne FortiGate par seedha temporary policy se SSH khola. Device list out of sync ho gayi, aur ek din baad branch package ke scheduled install ne rule chupchap hata diya, aur administrator ka access phir chala gaya. Auditor ne rule auto-update revision mein aur uske baad ke install revision mein dhoondha.</p><p><b>Lesson:</b> local emergency fix ya to package mein import ho ya jaan-boojhkar hataya jaye; warna agla install tumhare liye faisla karta hai.</p></div>

<div class="iv"><p class="q">"Colleague ne managed FortiGate seedha badal diya. FortiManager kya dikhata hai aur agle install par kya hota hai?"</p><p>Config status out of sync ho jata hai aur package modified dikhta hai; kuch second baad change auto-update revision ki tarah record hota hai. Package mein wo nahi hai, isliye agla install policy table replace karke use hata deta hai. Rakhna ho to pehle use package mein import karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle objects, phir package, phir preview, phir install, phir test.</li>
<li>Preview dikhata hai LAN aur WAN kaise port2 aur port1 bante hain.</li>
<li>pkg:[installed]Branch-PP aur kaam karta ping success ka saboot hain.</li>
<li>Local change se conf: out of sync, phir auto-update revision aata hai.</li>
<li>Agla install local rule hata deta hai; revision diff dikhata hai wo kya tha.</li>
</ul></div>
`}};export{e as default};