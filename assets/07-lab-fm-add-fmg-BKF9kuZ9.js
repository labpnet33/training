var e={id:`lab-fm-add-fmg`,h:{en:`Lab fm-add-fmg: add a FortiGate from the FortiManager side`,hi:`Lab fm-add-fmg: FortiManager side se FortiGate add karo`},body:{en:`
<p>In the last lab the FortiGate called in and you accepted it. This time you do the calling. It is like inviting two colleagues to a meeting room: one has the door open, the other has it locked, and you have to work out why from the message you get back. The lab has four tasks and takes about 25 minutes. Devices: FMG-1, HQ-FGT, MDU-FGT, the switches and the PCs of the Kaveri Retail network.</p>

<div class="note"><p><b>Reminder.</b> <code>execute fmgui add-device</code> is the simulator's form of the Add Device wizard of the real product. Neither FortiGate has central-management configured at the start; FortiManager will do that for you.</p></div>

<h3>Goal and approach</h3>
<p>The goal is that both HQ-FGT (192.0.2.11) and MDU-FGT (192.0.2.12) become managed devices in the ADOM Kaveri without you typing anything under central-management on them. You prepare the ADOM, add the first device, then add the second and fix what stops it. The approach is to read every reply carefully; the lab teaches you that the FortiManager message already contains the fix.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Two devices, one works">
<rect x="10" y="50" width="150" height="56" rx="8" fill="#ddd6fe"/><text x="85" y="76" text-anchor="middle" class="svg-ink" font-size="13">FMG-1</text><text x="85" y="94" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.5</text>
<rect x="470" y="14" width="160" height="56" rx="8" fill="#bbf7d0"/><text x="550" y="40" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text><text x="550" y="58" text-anchor="middle" class="svg-muted" font-size="12">allowaccess ping fgfm</text>
<rect x="470" y="88" width="160" height="56" rx="8" fill="#fed7aa"/><text x="550" y="114" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="550" y="132" text-anchor="middle" class="svg-muted" font-size="12">allowaccess ping</text>
<line x1="160" y1="70" x2="470" y2="42" stroke="#64748b" stroke-width="2"/><line x1="160" y1="86" x2="470" y2="116" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
</svg><p class="cap">The dashed line is a connection that port 541 refuses.</p></div>

<h3>Task 1: ADOMs and the ADOM Kaveri</h3>
<p>This repeats task 1 of the last lab, on a fresh FMG-1. It is on purpose: you should now be able to do it from memory. Turn on <code>adom-status</code>, create Kaveri with version 7.6 and confirm with the list command. If you have to look it up, re-read chapter 6.</p>

<h3>Task 2: add HQ-FGT and name the keyword</h3>
<p>Why it works: the question hints that the port1 interface of HQ-FGT already allows one management keyword that makes it work. Look at the interface with <code>show system interface port1</code> before you add the device and find the word in the allowaccess line. Then run the add from FMG-1. The reply tells you the connection was made on port 541 and the configuration was retrieved.</p>
<pre class="out">HQ-FGT # show system interface port1
    set ip 192.0.2.11 255.255.255.0
    set allowaccess ping <span class="hl">fgfm</span>

FMG-1 # execute fmgui add-device HQ-FGT 192.0.2.11 Kaveri
Device HQ-FGT added to ADOM Kaveri (FortiManager connected to 192.0.2.11:541, central-management configured on the device).
Configuration retrieved: revision 1.</pre>
<p>Wrong turns: running the add before the ADOM exists produces "ADOM 'Kaveri' does not exist". The order of tasks 1 and 2 matters.</p>

<h3>Task 3: add MDU-FGT, read the refusal, fix, add again</h3>
<p>Run the same add for MDU-FGT with its own name and address. This time FMG-1 refuses.</p>
<pre class="out">FMG-1 # execute fmgui add-device MDU-FGT 192.0.2.12 Kaveri
<span class="hl">Add device failed: 192.0.2.12 refused the connection on TCP/541. Allow FortiManager access (allowaccess fgfm) on the FortiGate interface.</span></pre>
<p>Think before you type: the message says "refused", so the device is reachable and the fault is a permission. Compare the two interfaces. HQ-FGT lists fgfm and MDU-FGT does not. On MDU-FGT edit interface port1 and set the allowaccess list so that it keeps ping and adds fgfm. Then repeat the add on FMG-1 and look for the success line and revision 1.</p>
<p>Wrong turns worth knowing about:</p>
<ul>
<li>Writing only <code>set allowaccess fgfm</code>. It works for the lab but removes ping, so you can no longer ping the device from the management network. Real operators keep their old services.</li>
<li>Changing the wrong interface. The management network is on port1, not on the LAN interface port2.</li>
<li>Changing central-management on MDU-FGT. You do not have to; FortiManager sets it.</li>
</ul>
<p>After the successful add, confirm with <code>show system central-management</code> on MDU-FGT that FortiManager has written the type and the address, and read <code>diagnose dvm device list</code> on FMG-1 to see two devices with conn up.</p>

<h3>Task 4: which TCP port?</h3>
<p>The lab asks one more question about the port that FortiManager uses to reach a FortiGate. It is the same number as in the previous lab, and the refusal message already printed it. The answer is 541 whichever side starts the tunnel.</p>

<div class="eg"><p><b>Worked example.</b> After both adds, the device list shows HQ-FGT and MDU-FGT in Kaveri, each with <code>dm: retrieved</code>. The list reads <code>pkg:[unknown]null</code> because nothing was imported. That is correct: add-device retrieves, it does not import.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Re-typing the whole allowaccess list wrongly; adding a device name that already exists in the other ADOM (names are global in the simulator); and trying to fix a refusal on FortiManager. The fault of a refusal is always on the FortiGate that refused.</p></div>

<div class="exam"><p><b>Exam traps.</b> FortiManager-initiated add needs fgfm in allowaccess; FortiGate-initiated registration does not. Add-device also configures central-management on the device. The real wizard asks for an admin login, which the simulator does not need.</p></div>

<div class="scn"><h4>The pilot that worked on the first device only</h4><p>A team followed a runbook that added the first branch successfully and then expected the same for the rest. The second site refused on TCP 541. The team nearly opened a ticket with the network provider, until a colleague pointed out that the first site had fgfm in its allowaccess and the second did not.</p><p><b>Lesson:</b> a pilot proves the method, not the readiness of every device. Check allowaccess on each interface before a batch add.</p></div>

<div class="iv"><p class="q">"FortiManager says the connection was refused on TCP 541. Where do you look?"</p><p>On the FortiGate, at the allowaccess list of the interface that faces the FortiManager, because a refusal means the device answered. Add fgfm while keeping the existing services, then repeat the add.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>add-device is the FortiManager-initiated way; it needs the ADOM first.</li>
<li>The refusal message names the fix: allowaccess fgfm.</li>
<li>Keep existing services when you edit allowaccess.</li>
<li>FortiManager configures central-management on the device itself.</li>
<li>FGFM is TCP 541 in both directions.</li>
</ul></div>
`,hi:`
<p>Pichhle lab mein FortiGate ne call in kiya aur aapne use accept kiya. Is baar aap call karte ho. Ye do colleagues ko meeting room mein bulane jaisa hai: ek ka darwaza khula hai, doosre ka band, aur aapko mile hue message se wajah nikalni hai. Lab mein chaar tasks hain aur lagbhag 25 minute lagte hain. Devices: FMG-1, HQ-FGT, MDU-FGT, switches aur Kaveri Retail network ke PCs.</p>

<div class="note"><p><b>Reminder.</b> <code>execute fmgui add-device</code> real product ke Add Device wizard ka simulator form hai. Shuru mein kisi FortiGate par central-management configured nahi hai; wo FortiManager aapke liye karega.</p></div>

<h3>Goal aur approach</h3>
<p>Goal ye hai ki HQ-FGT (192.0.2.11) aur MDU-FGT (192.0.2.12) dono ADOM Kaveri mein managed devices ban jayein, bina aapke unke central-management mein kuch type kiye. Aap ADOM taiyar karte ho, pehla device add karte ho, phir doosra add karte ho aur jo rokta hai use fix karte ho. Approach ye hai ki har reply dhyan se padho; lab sikhata hai ki FortiManager ke message mein hi fix likha hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Do devices, ek chalta hai">
<rect x="10" y="50" width="150" height="56" rx="8" fill="#ddd6fe"/><text x="85" y="76" text-anchor="middle" class="svg-ink" font-size="13">FMG-1</text><text x="85" y="94" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.5</text>
<rect x="470" y="14" width="160" height="56" rx="8" fill="#bbf7d0"/><text x="550" y="40" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text><text x="550" y="58" text-anchor="middle" class="svg-muted" font-size="12">allowaccess ping fgfm</text>
<rect x="470" y="88" width="160" height="56" rx="8" fill="#fed7aa"/><text x="550" y="114" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="550" y="132" text-anchor="middle" class="svg-muted" font-size="12">allowaccess ping</text>
<line x1="160" y1="70" x2="470" y2="42" stroke="#64748b" stroke-width="2"/><line x1="160" y1="86" x2="470" y2="116" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
</svg><p class="cap">Dashed line wo connection hai jise port 541 refuse karta hai.</p></div>

<h3>Task 1: ADOMs aur ADOM Kaveri</h3>
<p>Ye pichhle lab ke task 1 ka repeat hai, fresh FMG-1 par. Ye jaan-boojhkar hai: ab aapko ye yaad se aana chahiye. <code>adom-status</code> on karo, Kaveri version 7.6 ke saath banao aur list command se confirm karo. Dekhna pade to chapter 6 dobara padho.</p>

<h3>Task 2: HQ-FGT add karo aur keyword batao</h3>
<p>Ye kyun chalta hai: sawaal hint deta hai ki HQ-FGT ka port1 interface pehle se ek management keyword allow karta hai jisse ye chalta hai. Device add karne se pehle <code>show system interface port1</code> se interface dekho aur allowaccess line mein wo word dhoondho. Phir FMG-1 se add chalao. Reply batata hai ki connection port 541 par bana aur configuration retrieve hui.</p>
<pre class="out">HQ-FGT # show system interface port1
    set ip 192.0.2.11 255.255.255.0
    set allowaccess ping <span class="hl">fgfm</span>

FMG-1 # execute fmgui add-device HQ-FGT 192.0.2.11 Kaveri
Device HQ-FGT added to ADOM Kaveri (FortiManager connected to 192.0.2.11:541, central-management configured on the device).
Configuration retrieved: revision 1.</pre>
<p>Wrong turns: ADOM ke exist karne se pehle add chalane par "ADOM 'Kaveri' does not exist" aata hai. Task 1 aur 2 ka order matter karta hai.</p>

<h3>Task 3: MDU-FGT add karo, refusal padho, fix karo, phir add karo</h3>
<p>MDU-FGT ke liye uske apne naam aur address ke saath wahi add chalao. Is baar FMG-1 refuse karta hai.</p>
<pre class="out">FMG-1 # execute fmgui add-device MDU-FGT 192.0.2.12 Kaveri
<span class="hl">Add device failed: 192.0.2.12 refused the connection on TCP/541. Allow FortiManager access (allowaccess fgfm) on the FortiGate interface.</span></pre>
<p>Type karne se pehle socho: message "refused" kehta hai, to device reachable hai aur fault ek permission hai. Dono interfaces ki tulna karo. HQ-FGT fgfm list karta hai aur MDU-FGT nahi. MDU-FGT par interface port1 edit karo aur allowaccess list aise set karo ki ping rahe aur fgfm jud jaye. Phir FMG-1 par add dobara chalao aur success line aur revision 1 dekho.</p>
<p>Jaanne layak wrong turns:</p>
<ul>
<li>Sirf <code>set allowaccess fgfm</code> likhna. Lab ke liye chalta hai par ping hata deta hai, to aap management network se device ko ping nahi kar paoge. Real operators purani services rakhte hain.</li>
<li>Galat interface badalna. Management network port1 par hai, LAN interface port2 par nahi.</li>
<li>MDU-FGT par central-management badalna. Zaroorat nahi; FortiManager use set karta hai.</li>
</ul>
<p>Successful add ke baad MDU-FGT par <code>show system central-management</code> se confirm karo ki FortiManager ne type aur address likh diye, aur FMG-1 par <code>diagnose dvm device list</code> padho jisme do devices conn up ke saath dikhein.</p>

<h3>Task 4: kaun sa TCP port?</h3>
<p>Lab ek aur sawaal poochta hai us port ke baare mein jo FortiManager FortiGate tak pahunchne ke liye use karta hai. Ye pichhle lab wala hi number hai, aur refusal message ne use pehle hi print kiya tha. Jawab 541 hai, chahe tunnel kisi bhi side se start ho.</p>

<div class="eg"><p><b>Worked example.</b> Dono adds ke baad device list mein HQ-FGT aur MDU-FGT Kaveri mein dikhte hain, har ek <code>dm: retrieved</code> ke saath. List <code>pkg:[unknown]null</code> padhti hai kyunki kuch import nahi hua. Ye sahi hai: add-device retrieve karta hai, import nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Poori allowaccess list galat dobara type karna; aisa device name add karna jo doosre ADOM mein pehle se hai (simulator mein names global hain); aur refusal ko FortiManager par fix karne ki koshish. Refusal ka fault hamesha us FortiGate par hota hai jisne refuse kiya.</p></div>

<div class="exam"><p><b>Exam traps.</b> FortiManager-initiated add ko allowaccess mein fgfm chahiye; FortiGate-initiated registration ko nahi. Add-device device par central-management bhi configure karta hai. Real wizard admin login poochta hai, jo simulator ko nahi chahiye.</p></div>

<div class="scn"><h4>Pilot jo sirf pehle device par chala</h4><p>Ek team ne runbook follow kiya jisne pehli branch successfully add ki aur baaki se bhi wahi umeed ki. Doosri site TCP 541 par refuse hui. Team network provider ko ticket kholne wali thi, jab ek colleague ne bataya ki pehli site ki allowaccess mein fgfm tha aur doosri mein nahi.</p><p><b>Lesson:</b> pilot method prove karta hai, har device ki readiness nahi. Batch add se pehle har interface ki allowaccess check karo.</p></div>

<div class="iv"><p class="q">"FortiManager kehta hai TCP 541 par connection refuse hua. Aap kahan dekhoge?"</p><p>FortiGate par, us interface ki allowaccess list mein jo FortiManager ki taraf hai, kyunki refusal ka matlab device ne jawab diya. Existing services rakhte hue fgfm jodo, phir add dobara chalao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>add-device FortiManager-initiated tareeka hai; pehle ADOM chahiye.</li>
<li>Refusal message fix batata hai: allowaccess fgfm.</li>
<li>allowaccess edit karte waqt existing services rakho.</li>
<li>FortiManager device par khud central-management configure karta hai.</li>
<li>FGFM dono directions mein TCP 541 hai.</li>
</ul></div>
`}};export{e as default};