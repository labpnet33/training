var e={id:`labs-adom-units-quota`,h:{en:`Labs fa-adom-units and fa-quota: walkthrough`,hi:`Labs fa-adom-units aur fa-quota: walkthrough`},body:{en:`
<p>A driving instructor does not drive for you. He tells you where to look, what the mirror should show and which mistake beginners make at the first turn. This chapter is that instructor for two labs. It explains the goal, the approach, the output you should see and the wrong turns. The exact commands are for you to type; the key forms are in the hints.</p>

<div class="note"><p><b>Before you start.</b> Both labs use the Kaveri topology: FAZ-1 (192.0.2.6), SRV-WEB (192.0.2.80), the FortiGates HQ-FGT, MDU-FGT, TRY-FGT and one PC per site. Traffic comes from a web request made with <code>curl</code> on a PC towards SRV-WEB, as in the lab task text. Registration and storage commands are the <code>execute fazui</code> stand-ins for GUI actions. Run time data such as stored logs is lost when you save and restore a lab; the configuration stays.</p></div>

<h3>Lab 1: fa-adom-units (30 minutes, config)</h3>
<p><b>Goal.</b> All three FortiGates already log to FAZ-1 but ADOM mode is off. Head-office analysts must not see branch logs and the other way round. You turn ADOM mode on, create Corporate and Retail, register every FortiGate in the right ADOM and prove that a branch's logs land in its own ADOM.</p>

<h4>Step 1: read the starting point</h4>
<p>Look at what FAZ-1 knows before you change anything. The three devices are connected but unregistered, so every log they send is counted and discarded:</p>
<pre class="out">FAZ-1 # execute fazui unregistered list
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
HQ-FGT          FGVMEV1RGF38I000    192.0.2.11      1               2026-10-12 20:47:17
MDU-FGT         FGVMEV1JOS6TJ000    192.0.2.12      1               2026-10-12 20:47:17
TRY-FGT         FGVMEV3X688U0000    192.0.2.13      1               2026-10-12 20:47:17
FAZ-1 # get system status
Admin Domain Configuration      : <span class="hl">Disabled</span></pre>
<p><b>Why:</b> you need to know the problem is "ADOM mode off", not "device missing". Trying to register in Corporate now gives the message you saw in chapter 1, which is a useful check that you are in the starting state.</p>

<h4>Step 2: enable ADOM mode and create the ADOMs</h4>
<p><b>Hint:</b> two tables are involved, <code>config system global</code> for the switch and <code>config dvmdb adom</code> for the containers. Create both names exactly as in the task, with <code>set version 7.6</code>, because the FortiGates run 7.6. After <code>end</code>, run <code>diagnose dvm adom list</code>: you should see root plus your two ADOMs with 0 devices each.</p>

<h4>Step 3: register the devices</h4>
<p><b>Hint:</b> <code>execute fazui register &lt;device&gt; &lt;adom&gt;</code>, one device at a time. HQ-FGT belongs to head office (Corporate), the two branches to Retail. After the registrations the list should show device counts of 1 and 2:</p>
<pre class="out">OID	STATE	NAME		VERSION	MODE	DEVICES
3	enabled	root		7.6	GMS	0
283	enabled	Corporate		7.6	GMS	<span class="hl">1</span>
259	enabled	Retail		7.6	GMS	<span class="hl">2</span></pre>
<p>Keep in mind that logs sent before the registration were discarded and are not recoverable. The registration message tells you how many.</p>

<h4>Step 4: prove it with traffic</h4>
<p>From PC-MDU make web requests to SRV-WEB, then ask Log View of the right ADOM for the device. Then ask root the same question. The proof has two halves: the logs are present where they should be, and absent where they should not be.</p>
<pre class="out">FAZ-1 # execute fazui logview Retail MDU-FGT traffic limit 1
Log View  adom=Retail device=MDU-FGT type=traffic
4 logs match, 1 shown (newest first).
1: ... devname="MDU-FGT" ... srcip=10.20.0.10 ... dstip=192.0.2.80 dstport=80 ... action="accept" policyid=1 ...
FAZ-1 # execute fazui logview root MDU-FGT traffic
Log View  adom=root device=MDU-FGT type=traffic
<span class="hl">0 logs match, 0 shown (newest first).</span></pre>
<p><b>Task 5</b> asks which ADOM exists from the start. You have already seen it in every list.</p>

<h4>Wrong turns in lab 1</h4>
<ul>
<li>Registering before <code>adom-status enable</code>: the message tells you to enable ADOM mode first.</li>
<li>A typo in the ADOM name such as "retail": the register command says the ADOM does not exist.</li>
<li>Creating an ADOM with another version: the registration fails with both version numbers in the message.</li>
<li>Asking the wrong ADOM in Log View and concluding that logs are missing.</li>
</ul>

<h3>Lab 2: fa-quota (30 minutes, config)</h3>
<p><b>Goal.</b> The ADOM Kaveri holds the logs of HQ-FGT and MDU-FGT with default settings. The audit policy asks for 30 days searchable, 180 days archive, a 500 MB quota and overwrite when full. You read the current storage, set the values and watch the counters with real traffic.</p>

<h4>Step 1: read before you write</h4>
<p>Run the storage command for Kaveri and find the retention line. The default analytics value is the answer to the first task. Also note the quota line and the "When the quota is full" line.</p>
<pre class="out">FAZ-1 # execute fazui storage Kaveri
  Disk quota          : 1000 MB (default; set it in config system log quota)
  When the quota is full: overwrite the oldest logs
  <span class="hl">Retention           : analytics 60 days, archive 365 days</span></pre>

<h4>Step 2: set the values</h4>
<p><b>Hint:</b> the table is <code>config system log quota</code> with the ADOM name as key; the three settings are <code>quota-mb</code>, <code>analytics-retention</code> and <code>archive-retention</code>. Read the storage again to confirm that the output now shows 500 MB, 30 days and 180 days. If the output still shows the defaults, you probably misspelled the ADOM name in <code>edit</code>.</p>

<h4>Step 3: policy question</h4>
<p>The storage output tells you what happens when the quota is full. Kaveri wants overwrite, which is already the default. The lesson of this task is to <i>check</i> rather than to change; <code>show system log settings</code> prints nothing special when the default is in force.</p>

<h4>Step 4: traffic and the archive question</h4>
<p>Make web requests from PC-HQ and PC-MDU, twice each, and run the storage command again. Watch "Logs stored" and "Received so far" grow together, and "Overwritten" and "Rejected" stay at 0 because 500 MB is far from full.</p>
<pre class="out">  Disk quota          : 500 MB
  Retention           : analytics 30 days, archive 180 days
  Logs stored         : analytics 8 (traffic 8, utm 0, event 0), archive 0
  Received so far     : 8
  Overwritten (quota) : <span class="hl">0</span>   Rejected (quota): 0</pre>
<p>The last question, where analytics logs older than the retention go, is theory in this lab: no log can age in a session. You answer it from chapter 4.</p>

<h4>Wrong turns in lab 2</h4>
<ul>
<li>Setting archive retention below analytics retention.</li>
<li>Typing the quota in the wrong unit; the value is in MB.</li>
<li>Changing <code>quota-policy</code> to drop "to be safe", when Kaveri asked for overwrite.</li>
<li>Expecting a log to move to the archive during the lab.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A learner got "Disk quota: 1000 MB" after setting the values. The cause: the key in <code>edit</code> was typed as "kaveri" in lower case, so a second entry with that name was created and the ADOM Kaveri kept the defaults. Showing the table with <code>show system log quota</code> revealed the wrong key.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating the lab checker as the proof. The real proof is the output: ADOM counts, empty root, quota and retention lines. Learn to read these; the checker only agrees with them.</p></div>

<div class="exam"><p><b>Exam traps.</b> Default analytics retention in the simulator is 60 days and archive 365. Logs of a branch appear only in its own ADOM. Retention aging cannot be watched in a lab session.</p></div>

<div class="scn"><h4>The root that stayed empty</h4><p>A trainee finished lab 1 and saw no logs in Retail, so he registered the devices again in root. The register command answered "already registered in ADOM Retail". The logs were there all along; he had asked Log View for the device with the type set to utm, and web sessions without a security profile write traffic logs only.</p><p><b>Lesson:</b> check the ADOM, the device and the log type before assuming the logs are missing.</p></div>

<div class="iv"><p class="q">"Walk me through splitting one FortiAnalyzer into head-office and branch ADOMs."</p><p>Enable ADOM mode, create the ADOMs with the device firmware version, register each device in its ADOM, generate traffic and prove the result: device counts in the ADOM list, logs visible in the right ADOM and absent in root. Mention that logs sent before registration are lost.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read the starting state first: unregistered list and ADOM mode.</li>
<li>Order for lab 1: enable, create with version, register, prove with traffic.</li>
<li>Prove both halves: logs in the right ADOM and none in root.</li>
<li>For lab 2, set quota, analytics and archive days per ADOM and confirm in the storage output.</li>
<li>Archive aging is theory in the lab; counters are what you can observe.</li>
</ul></div>
`,hi:`
<p>Driving instructor aapke liye gaadi nahi chalata. Wo batata hai kahan dekhna hai, mirror mein kya dikhna chahiye aur pehle turn par beginners kaun si galti karte hain. Ye chapter do labs ke liye wahi instructor hai. Ye goal, approach, kaun sa output dikhna chahiye aur galat modon ko samjhata hai. Exact commands aapko khud type karne hain; key forms hints mein hain.</p>

<div class="note"><p><b>Shuru karne se pehle.</b> Dono labs Kaveri topology use karte hain: FAZ-1 (192.0.2.6), SRV-WEB (192.0.2.80), FortiGates HQ-FGT, MDU-FGT, TRY-FGT aur har site par ek PC. Traffic PC se SRV-WEB ki taraf <code>curl</code> se kiye gaye web request se aata hai, jaisa lab task text mein hai. Registration aur storage commands GUI actions ke <code>execute fazui</code> stand-ins hain. Stored logs jaisa run time data lab save aur restore karne par chala jata hai; configuration rehti hai.</p></div>

<h3>Lab 1: fa-adom-units (30 minutes, config)</h3>
<p><b>Goal.</b> Teeno FortiGates pehle se FAZ-1 ko log bhejte hain par ADOM mode off hai. Head-office analysts ko branch logs nahi dikhne chahiye aur ulta bhi. Aap ADOM mode on karte ho, Corporate aur Retail banate ho, har FortiGate ko sahi ADOM mein register karte ho aur saabit karte ho ki branch ke logs uske apne ADOM mein aate hain.</p>

<h4>Step 1: starting point padho</h4>
<p>Kuch badalne se pehle dekho FAZ-1 kya jaanta hai. Teeno devices connected hain par unregistered, isliye unke bheje har log ginke jate hain aur discard hote hain:</p>
<pre class="out">FAZ-1 # execute fazui unregistered list
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
HQ-FGT          FGVMEV1RGF38I000    192.0.2.11      1               2026-10-12 20:47:17
MDU-FGT         FGVMEV1JOS6TJ000    192.0.2.12      1               2026-10-12 20:47:17
TRY-FGT         FGVMEV3X688U0000    192.0.2.13      1               2026-10-12 20:47:17
FAZ-1 # get system status
Admin Domain Configuration      : <span class="hl">Disabled</span></pre>
<p><b>Kyun:</b> aapko pata hona chahiye ki problem "ADOM mode off" hai, "device missing" nahi. Ab Corporate mein register karne par wahi message milta hai jo chapter 1 mein dekha, jo is baat ka achha check hai ki aap starting state mein ho.</p>

<h4>Step 2: ADOM mode enable karo aur ADOMs banao</h4>
<p><b>Hint:</b> do tables lagte hain, switch ke liye <code>config system global</code> aur containers ke liye <code>config dvmdb adom</code>. Dono naam task jaise exactly banao, <code>set version 7.6</code> ke saath, kyunki FortiGates 7.6 chalate hain. <code>end</code> ke baad <code>diagnose dvm adom list</code> chalao: root aur aapke do ADOMs 0 devices ke saath dikhne chahiye.</p>

<h4>Step 3: devices register karo</h4>
<p><b>Hint:</b> <code>execute fazui register &lt;device&gt; &lt;adom&gt;</code>, ek-ek device. HQ-FGT head office (Corporate) ka hai, do branches Retail ki. Registrations ke baad list mein device counts 1 aur 2 dikhne chahiye:</p>
<pre class="out">OID	STATE	NAME		VERSION	MODE	DEVICES
3	enabled	root		7.6	GMS	0
283	enabled	Corporate		7.6	GMS	<span class="hl">1</span>
259	enabled	Retail		7.6	GMS	<span class="hl">2</span></pre>
<p>Yaad rakho ki registration se pehle bheje gaye logs discard ho gaye aur recover nahi hote. Registration message batata hai kitne.</p>

<h4>Step 4: traffic se saabit karo</h4>
<p>PC-MDU se SRV-WEB par web requests karo, phir sahi ADOM ke Log View se device ke logs maango. Phir root se wahi sawaal poochho. Saboot ke do hisse hain: logs wahan hain jahan hone chahiye, aur wahan nahi hain jahan nahi hone chahiye.</p>
<pre class="out">FAZ-1 # execute fazui logview Retail MDU-FGT traffic limit 1
Log View  adom=Retail device=MDU-FGT type=traffic
4 logs match, 1 shown (newest first).
1: ... devname="MDU-FGT" ... srcip=10.20.0.10 ... dstip=192.0.2.80 dstport=80 ... action="accept" policyid=1 ...
FAZ-1 # execute fazui logview root MDU-FGT traffic
Log View  adom=root device=MDU-FGT type=traffic
<span class="hl">0 logs match, 0 shown (newest first).</span></pre>
<p><b>Task 5</b> poochhta hai ki shuru se kaun sa ADOM exist karta hai. Aap ise har list mein dekh chuke ho.</p>

<h4>Lab 1 ke galat mod</h4>
<ul>
<li><code>adom-status enable</code> se pehle register karna: message pehle ADOM mode enable karne ko kehta hai.</li>
<li>ADOM naam mein typo jaise "retail": register command kehta hai ADOM exist nahi karta.</li>
<li>Alag version ke saath ADOM banana: registration fail hota hai aur message mein dono version numbers hote hain.</li>
<li>Log View mein galat ADOM poochh kar maan lena ki logs missing hain.</li>
</ul>

<h3>Lab 2: fa-quota (30 minutes, config)</h3>
<p><b>Goal.</b> ADOM Kaveri mein HQ-FGT aur MDU-FGT ke logs default settings ke saath hain. Audit policy 30 din searchable, 180 din archive, 500 MB quota aur full hone par overwrite maangti hai. Aap current storage padhte ho, values set karte ho aur real traffic ke saath counters dekhte ho.</p>

<h4>Step 1: likhne se pehle padho</h4>
<p>Kaveri ke liye storage command chalao aur retention line dhoondho. Default analytics value pehle task ka jawab hai. Quota line aur "When the quota is full" line bhi note karo.</p>
<pre class="out">FAZ-1 # execute fazui storage Kaveri
  Disk quota          : 1000 MB (default; set it in config system log quota)
  When the quota is full: overwrite the oldest logs
  <span class="hl">Retention           : analytics 60 days, archive 365 days</span></pre>

<h4>Step 2: values set karo</h4>
<p><b>Hint:</b> table <code>config system log quota</code> hai, ADOM naam key ke roop mein; teen settings <code>quota-mb</code>, <code>analytics-retention</code> aur <code>archive-retention</code> hain. Storage dobara padho aur confirm karo ki output ab 500 MB, 30 din aur 180 din dikhata hai. Output abhi bhi defaults dikhaye to shayad <code>edit</code> mein ADOM naam galat likha gaya.</p>

<h4>Step 3: policy ka sawaal</h4>
<p>Storage output batata hai ki quota full hone par kya hota hai. Kaveri overwrite chahta hai, jo pehle se default hai. Is task ka seekh badalna nahi balki <i>check</i> karna hai; default lagu ho to <code>show system log settings</code> kuch khaas print nahi karta.</p>

<h4>Step 4: traffic aur archive ka sawaal</h4>
<p>PC-HQ aur PC-MDU se web requests karo, do-do baar, aur storage command dobara chalao. "Logs stored" aur "Received so far" ko saath badhte dekho, aur "Overwritten" aur "Rejected" 0 par rehte hain kyunki 500 MB bhara nahi hai.</p>
<pre class="out">  Disk quota          : 500 MB
  Retention           : analytics 30 days, archive 180 days
  Logs stored         : analytics 8 (traffic 8, utm 0, event 0), archive 0
  Received so far     : 8
  Overwritten (quota) : <span class="hl">0</span>   Rejected (quota): 0</pre>
<p>Aakhri sawaal, retention se purane analytics logs kahan jate hain, is lab mein theory hai: session mein koi log age nahi ho sakta. Aap ise chapter 4 se jawab doge.</p>

<h4>Lab 2 ke galat mod</h4>
<ul>
<li>Archive retention ko analytics retention se kam set karna.</li>
<li>Quota galat unit mein type karna; value MB mein hai.</li>
<li>"Safe rahe" soch kar <code>quota-policy</code> ko drop karna, jabki Kaveri ne overwrite maanga tha.</li>
<li>Lab ke dauran log ke archive mein jaane ki ummeed.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek learner ko values set karne ke baad bhi "Disk quota: 1000 MB" mila. Wajah: <code>edit</code> mein key lower case "kaveri" type hui thi, isliye us naam ki doosri entry ban gayi aur ADOM Kaveri defaults par raha. <code>show system log quota</code> se table dekha to galat key dikh gayi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Lab checker ko saboot samajhna. Asli saboot output hai: ADOM counts, khaali root, quota aur retention lines. In ko padhna seekho; checker sirf inse sahmat hota hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Simulator mein default analytics retention 60 din aur archive 365 hai. Branch ke logs sirf uske apne ADOM mein aate hain. Retention aging lab session mein dekhi nahi ja sakti.</p></div>

<div class="scn"><h4>Root jo khaali raha</h4><p>Ek trainee ne lab 1 poora kiya aur Retail mein koi log nahi dikhe, to usne devices ko root mein dobara register kiya. Register command ne jawab diya "already registered in ADOM Retail". Logs wahin the; usne device ke logs Log View se type utm ke saath maange the, aur security profile ke bina web sessions sirf traffic logs likhte hain.</p><p><b>Lesson:</b> logs missing maanne se pehle ADOM, device aur log type check karo.</p></div>

<div class="iv"><p class="q">"Ek FortiAnalyzer ko head-office aur branch ADOMs mein kaise todoge, batao."</p><p>ADOM mode enable karo, device firmware version ke saath ADOMs banao, har device ko uske ADOM mein register karo, traffic generate karo aur result saabit karo: ADOM list mein device counts, sahi ADOM mein dikhte logs aur root mein na dikhte logs. Batao ki registration se pehle bheje logs lost hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle starting state padho: unregistered list aur ADOM mode.</li>
<li>Lab 1 ka order: enable, version ke saath create, register, traffic se saabit karo.</li>
<li>Dono hisse saabit karo: sahi ADOM mein logs aur root mein koi nahi.</li>
<li>Lab 2 ke liye per ADOM quota, analytics aur archive days set karo aur storage output mein confirm karo.</li>
<li>Archive aging lab mein theory hai; counters wo hain jo aap dekh sakte ho.</li>
</ul></div>
`}};export{e as default};