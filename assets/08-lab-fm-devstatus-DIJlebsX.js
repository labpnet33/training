var e={id:`lab-fm-devstatus`,h:{en:`Lab fm-devstatus: read the config status of three devices`,hi:`Lab fm-devstatus: teen devices ka config status padho`},body:{en:`
<p>In a cricket match the scoreboard tells you everything if you know how to read it: runs, wickets, overs, required rate. You do not need to watch every ball. In this lab the scoreboard is <code>diagnose dvm device list</code>, and the match is Kaveri's network. FMG-1 manages HQ-FGT, MDU-FGT and TRY-FGT in the ADOM Kaveri, and the NOC says something is wrong with two of them. Your job is to name the problem of each device from the status line, and then fix both. Four tasks, about 25 minutes.</p>

<div class="note"><p><b>Before you start.</b> Install-preview and install-device are <code>execute fmgui</code> commands in the simulator because they are GUI or API actions in the real product. Chapter 5 explains every field you will meet here. Keep it open.</p></div>

<h3>Goal and approach</h3>
<p>The goal is a device list in which all three devices show conn up and dev-db not modified. Approach: read first, change nothing until you can say in one sentence what is wrong with each device, and notice that the two problems live on different sides. One is a FortiGate problem (it cannot reach FortiManager), the other is a FortiManager problem (a change waiting to be installed).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Two problems on two sides">
<rect x="20" y="20" width="270" height="130" rx="8" fill="#fed7aa"/><text x="155" y="46" text-anchor="middle" class="svg-ink" font-size="13">FortiGate side: MDU-FGT</text><text x="155" y="76" text-anchor="middle" class="svg-muted" font-size="12">conn: down, conf: out of sync</text><text x="155" y="98" text-anchor="middle" class="svg-muted" font-size="12">central-management is empty</text><text x="155" y="126" text-anchor="middle" class="svg-ink" font-size="12">fix: type and fmg address</text>
<rect x="350" y="20" width="270" height="130" rx="8" fill="#bae6fd"/><text x="485" y="46" text-anchor="middle" class="svg-ink" font-size="13">FortiManager side: TRY-FGT</text><text x="485" y="76" text-anchor="middle" class="svg-muted" font-size="12">dev-db: modified, change waiting</text><text x="485" y="98" text-anchor="middle" class="svg-muted" font-size="12">DNS template not installed</text><text x="485" y="126" text-anchor="middle" class="svg-ink" font-size="12">fix: preview, then install-device</text>
</svg><p class="cap">Same list, two different owners of the fix.</p></div>

<h3>Task 1: which device shows conn: down?</h3>
<p>Why: conn is the first field you read. Run the list and scan the third column of the status line. The answer is a device name. What to look for in the output of MDU-FGT:</p>
<pre class="out">FMG-1 # diagnose dvm device list MDU-FGT
fmgfaz-managed 171 FGVMEV1JOS6TJ000 - - MDU-FGT Kaveri - 7.6 MR0 (3401)
   |- STATUS: dev-db: not modified; <span class="hl">conf: out of sync; cond: unknown; dm: unknown; conn: down</span>; source: FMG
   |- vdom:[3]root flags:0 adom:Kaveri pkg:[never-installed]null</pre>
<p>Notice the dashes where the IP address should be: FortiManager has no live connection from this device. The device list accepts a name, so you can ask for one device only. Wrong turn: reading conf out of sync alone and concluding that someone changed the device. With conn down, out of sync only means "cannot compare".</p>

<h3>Task 2: which device shows dev-db: modified?</h3>
<p>Why: a modified database means that FortiManager holds a change that the device does not have. In this lab TRY-FGT has a system template for DNS assigned and not yet installed. The status line is the quickest signal; the preview is the proof, because it lists exactly what would be sent:</p>
<pre class="out">FMG-1 # execute fmgui install-preview Kaveri TRY-FGT
Install preview for TRY-FGT (5 CLI lines, nothing is sent to the device):
  config system dns
  set primary 192.0.2.53
  set secondary 192.0.2.54
  set domain "kaveri.example"
  end</pre>
<p>If the preview shows nothing, there is nothing waiting. Here it lists the DNS change: five lines, nothing sent. The task answer is the device name.</p>

<h3>Task 3: bring MDU-FGT back</h3>
<p>Why: the tunnel is down because the FortiGate has no central management setting. Compare with the fmg-start module: the output of <code>show system central-management</code> on MDU-FGT is an empty section, so neither the type nor the address is set:</p>
<pre class="out">MDU-FGT # show system central-management
config system central-management
end</pre>
<p>Set the type to fortimanager and the fmg address to 192.0.2.5, then give the tunnel several seconds to come up. What to look for on FMG-1: conn up, conf in sync, dm retrieved, and the IP column filled again. Wrong turns: setting only the address (the default type fortiguard ignores it), a typo in the address, or reading the list a second after the change and calling it a failure.</p>

<h3>Task 4: send the waiting changes to TRY-FGT</h3>
<p>Why: a modified dev-db is cleared by an install. Preview, then install-device. What to look for: dev-db not modified and dm installed, and a new revision. This is the real output after the solution:</p>
<pre class="out">TRY-FGT |- STATUS: dev-db: not modified; conf: in sync; cond: OK; <span class="hl">dm: installed</span>; conn: up; source: FMG

FMG-1 # execute fmgui revision list TRY-FGT
ID	CREATED BY	NAME
1	retrieve	Retrieved
2	install		Installed device settings</pre>
<p>Verify on the FortiGate too: <code>show system dns</code> on TRY-FGT must print primary 192.0.2.53. A status line tells you what FortiManager believes; the device shows what is true.</p>

<div class="eg"><p><b>Worked example.</b> Your one-sentence diagnosis for the report: "MDU-FGT is unreachable because central management is not set on the FortiGate; TRY-FGT has a DNS template waiting in FortiManager." Two sentences, two owners, two fixes. A manager can act on that without reading a single log.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Running install-device on MDU-FGT while it is down: the install is refused with "the FGFM tunnel to MDU-FGT is down". Installing to TRY-FGT without a preview. Fixing MDU-FGT and not waiting before you check.</p></div>

<div class="exam"><p><b>Exam traps.</b> Out of sync with conn down is not drift. Modified dev-db is cleared by install, not by retrieve. The dm field changes to installed only after a real install.</p></div>

<div class="scn"><h4>Two amber lights, one phone call</h4><p>The Kaveri NOC raised a ticket that the Madurai and Trichy branches were unhealthy. The engineer ran the device list and answered within a minute: Madurai had no tunnel, Trichy had an uninstalled DNS template. A call to the Madurai branch found a replaced FortiGate with a blank central-management section. Trichy was fixed from the desk after a preview.</p><p><b>Lesson:</b> status fields decide who should act, which saves a wrong escalation.</p></div>

<div class="iv"><p class="q">"How do you tell whether a problem is on the FortiGate or on FortiManager?"</p><p>Look at conn first. Down means the FortiGate side or the path: check central management, address, route. Up with dev-db modified means FortiManager holds a waiting change: preview and install. Up with conf out of sync means a local change: compare revisions.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>conn: down plus conf out of sync plus cond unknown means the tunnel, not drift.</li>
<li>dev-db: modified means a change is waiting inside FortiManager.</li>
<li>install-preview shows what an install would send and sends nothing.</li>
<li>An empty central-management section means the default type is in use.</li>
<li>After install-device the status reads dev-db not modified and dm installed.</li>
</ul></div>
`,hi:`
<p>Cricket match mein scoreboard sab bata deta hai agar padhna aata ho: runs, wickets, overs, required rate. Har gend dekhne ki zaroorat nahi. Is lab mein scoreboard <code>diagnose dvm device list</code> hai, aur match Kaveri ka network hai. FMG-1 ADOM Kaveri mein HQ-FGT, MDU-FGT aur TRY-FGT manage karta hai, aur NOC kehta hai ki do mein kuch galat hai. Aapka kaam status line se har device ki problem ka naam batana hai, aur phir dono theek karna. Chaar tasks, lagbhag 25 minute.</p>

<div class="note"><p><b>Shuru karne se pehle.</b> Install-preview aur install-device simulator mein <code>execute fmgui</code> commands hain kyunki real product mein ye GUI ya API actions hain. Chapter 5 yahan milne wale har field ko samjhata hai. Use khula rakho.</p></div>

<h3>Goal aur approach</h3>
<p>Goal hai aisi device list jisme teeno devices conn up aur dev-db not modified dikhayein. Approach: pehle padho, tab tak kuch mat badlo jab tak har device ki problem ek sentence mein na bata sako, aur dhyan do ki dono problems alag sides par hain. Ek FortiGate problem hai (wo FortiManager tak nahi pahunch pa raha), doosri FortiManager problem hai (install hone ka intezaar karta change).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Do sides par do problems">
<rect x="20" y="20" width="270" height="130" rx="8" fill="#fed7aa"/><text x="155" y="46" text-anchor="middle" class="svg-ink" font-size="13">FortiGate side: MDU-FGT</text><text x="155" y="76" text-anchor="middle" class="svg-muted" font-size="12">conn: down, conf: out of sync</text><text x="155" y="98" text-anchor="middle" class="svg-muted" font-size="12">central-management khaali hai</text><text x="155" y="126" text-anchor="middle" class="svg-ink" font-size="12">fix: type aur fmg address</text>
<rect x="350" y="20" width="270" height="130" rx="8" fill="#bae6fd"/><text x="485" y="46" text-anchor="middle" class="svg-ink" font-size="13">FortiManager side: TRY-FGT</text><text x="485" y="76" text-anchor="middle" class="svg-muted" font-size="12">dev-db: modified, change waiting</text><text x="485" y="98" text-anchor="middle" class="svg-muted" font-size="12">DNS template install nahi hua</text><text x="485" y="126" text-anchor="middle" class="svg-ink" font-size="12">fix: preview, phir install-device</text>
</svg><p class="cap">Ek hi list, fix ke do alag malik.</p></div>

<h3>Task 1: kaun sa device conn: down dikhata hai?</h3>
<p>Kyun: conn pehla field hai jo aap padhte ho. List chalao aur status line ka teesra column scan karo. Jawab device ka naam hai. MDU-FGT ke output mein kya dekhna hai:</p>
<pre class="out">FMG-1 # diagnose dvm device list MDU-FGT
fmgfaz-managed 171 FGVMEV1JOS6TJ000 - - MDU-FGT Kaveri - 7.6 MR0 (3401)
   |- STATUS: dev-db: not modified; <span class="hl">conf: out of sync; cond: unknown; dm: unknown; conn: down</span>; source: FMG
   |- vdom:[3]root flags:0 adom:Kaveri pkg:[never-installed]null</pre>
<p>Dhyan do jahan IP address hona chahiye wahan dash hain: FortiManager ke paas is device se live connection nahi hai. Device list naam leti hai, isliye ek hi device pooch sakte ho. Wrong turn: sirf conf out of sync padhkar maan lena ki kisi ne device badla. Conn down ho to out of sync ka matlab sirf "compare nahi kar sakte".</p>

<h3>Task 2: kaun sa device dev-db: modified dikhata hai?</h3>
<p>Kyun: modified database ka matlab FortiManager ke paas aisa change hai jo device ke paas nahi. Is lab mein TRY-FGT par DNS ka system template assigned hai aur install nahi hua. Status line sabse tez signal hai; preview saboot hai, kyunki wo theek wahi list karta hai jo bheja jayega:</p>
<pre class="out">FMG-1 # execute fmgui install-preview Kaveri TRY-FGT
Install preview for TRY-FGT (5 CLI lines, nothing is sent to the device):
  config system dns
  set primary 192.0.2.53
  set secondary 192.0.2.54
  set domain "kaveri.example"
  end</pre>
<p>Preview kuch na dikhaye to kuch wait nahi kar raha. Yahan wo DNS change list karta hai: paanch lines, kuch bheja nahi. Task ka jawab device ka naam hai.</p>

<h3>Task 3: MDU-FGT ko wapas lao</h3>
<p>Kyun: tunnel isliye down hai kyunki FortiGate par central management setting nahi hai. fmg-start module se compare karo: MDU-FGT par <code>show system central-management</code> ka output khaali section hai, yaani na type set hai na address:</p>
<pre class="out">MDU-FGT # show system central-management
config system central-management
end</pre>
<p>Type ko fortimanager aur fmg address ko 192.0.2.5 karo, phir tunnel ko up hone ke liye kuch seconds do. FMG-1 par kya dekhna hai: conn up, conf in sync, dm retrieved, aur IP column dobara bhara hua. Wrong turns: sirf address set karna (default type fortiguard use ignore karta hai), address mein typo, ya change ke ek second baad list padhkar failure bol dena.</p>

<h3>Task 4: waiting changes TRY-FGT ko bhejo</h3>
<p>Kyun: modified dev-db install se saaf hota hai. Preview, phir install-device. Kya dekhna hai: dev-db not modified aur dm installed, aur ek nayi revision. Solution ke baad ka real output:</p>
<pre class="out">TRY-FGT |- STATUS: dev-db: not modified; conf: in sync; cond: OK; <span class="hl">dm: installed</span>; conn: up; source: FMG

FMG-1 # execute fmgui revision list TRY-FGT
ID	CREATED BY	NAME
1	retrieve	Retrieved
2	install		Installed device settings</pre>
<p>FortiGate par bhi verify karo: TRY-FGT par <code>show system dns</code> primary 192.0.2.53 print kare. Status line batati hai FortiManager kya maanta hai; device batata hai sach kya hai.</p>

<div class="eg"><p><b>Worked example.</b> Report ke liye aapka ek-sentence diagnosis: "MDU-FGT unreachable hai kyunki FortiGate par central management set nahi hai; TRY-FGT ka DNS template FortiManager mein waiting hai." Do sentences, do malik, do fix. Manager ek bhi log padhe bina action le sakta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> MDU-FGT down hone par uspar install-device chalana: install "the FGFM tunnel to MDU-FGT is down" ke saath refuse hota hai. TRY-FGT ko preview ke bina install karna. MDU-FGT theek karke check karne se pehle wait na karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Conn down ke saath out of sync drift nahi hai. Modified dev-db install se saaf hota hai, retrieve se nahi. dm sirf asli install ke baad installed hota hai.</p></div>

<div class="scn"><h4>Do amber lights, ek phone call</h4><p>Kaveri NOC ne ticket banaya ki Madurai aur Trichy branches unhealthy hain. Engineer ne device list chalayi aur ek minute mein jawab diya: Madurai ka tunnel nahi hai, Trichy ka DNS template install nahi hua. Madurai branch ko call karne par pata chala ki FortiGate badla gaya tha aur central-management section khaali tha. Trichy ko preview ke baad desk se theek kar diya.</p><p><b>Lesson:</b> status fields tay karte hain ki action kise lena hai, jisse galat escalation bachta hai.</p></div>

<div class="iv"><p class="q">"Kaise batate ho ki problem FortiGate par hai ya FortiManager par?"</p><p>Pehle conn dekho. Down matlab FortiGate side ya path: central management, address, route check karo. Up ke saath dev-db modified matlab FortiManager mein waiting change: preview aur install. Up ke saath conf out of sync matlab local change: revisions compare karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>conn: down ke saath conf out of sync aur cond unknown ka matlab tunnel hai, drift nahi.</li>
<li>dev-db: modified ka matlab FortiManager ke andar change wait kar raha hai.</li>
<li>install-preview dikhata hai install kya bhejega aur kuch bhejta nahi.</li>
<li>Khaali central-management section ka matlab default type use ho raha hai.</li>
<li>install-device ke baad status dev-db not modified aur dm installed padhta hai.</li>
</ul></div>
`}};export{e as default};