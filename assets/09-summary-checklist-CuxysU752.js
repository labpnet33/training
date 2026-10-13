var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a pilot flies, there is a checklist on the knee: not to teach flying, but to make sure nothing obvious is forgotten. This chapter is the same for the operations module of the FortiAnalyzer track. Read it after the labs, tick what you can do without looking, and go back to the chapter for anything you cannot. The skills in this track overlap with vendor administrator-level skills, but the course is independent training and does not claim to prepare you for any certification exam.</p>

<h3>What you should be able to do</h3>
<ul>
<li>Add a site: configure <code>config log fortianalyzer setting</code> with the server and the FAZ-1 serial, check <code>execute log fortianalyzer test-connectivity</code>, register the device in an ADOM, generate a test log and find it in Log View.</li>
<li>Move a device by registering it in another ADOM and explain why old logs stay in the old ADOM.</li>
<li>Retire a device in two steps: delete the device entry on FAZ-1, then disable the logging on the FortiGate; prove that the unregistered list is empty and the other devices are untouched.</li>
<li>Explain why a deleted device appears again as unregistered while the FortiGate still logs.</li>
<li>Walk the ordered checks of a logging connection and match each message to its cause and fix.</li>
<li>Separate two faults in one connection and know that the first hides the second.</li>
<li>Do the sizing arithmetic and read the storage output (Used percent, Overwritten, Rejected).</li>
<li>Say, in one sentence each, what HA, forwarding, aggregation, backup and the Security Fabric are, and that they are theory here.</li>
<li>Explain that authorizing in FortiManager does not register in FortiAnalyzer.</li>
<li>Keep a register, run daily and weekly checks, write a runbook and close a ticket with proof.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Summary of the module">
<rect x="10" y="20" width="190" height="60" rx="8" fill="#bae6fd"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="13">Add / move</text><text x="105" y="64" text-anchor="middle" class="svg-muted" font-size="12">both sides, then a log</text>
<rect x="225" y="20" width="190" height="60" rx="8" fill="#fed7aa"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Retire</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">delete row + stop source</text>
<rect x="440" y="20" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="535" y="46" text-anchor="middle" class="svg-ink" font-size="13">Troubleshoot</text><text x="535" y="64" text-anchor="middle" class="svg-muted" font-size="12">ordered checks</text>
<rect x="10" y="100" width="300" height="52" rx="8" fill="#bbf7d0"/><text x="160" y="124" text-anchor="middle" class="svg-ink" font-size="13">Operate: register, daily checks, runbooks</text>
<rect x="330" y="100" width="300" height="52" rx="8" fill="#e2e8f0"/><text x="480" y="124" text-anchor="middle" class="svg-ink" font-size="13">Theory: HA, forwarding, backup, fabric</text>
</svg><p class="cap">The module on one picture.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Registered / unregistered</dt><dd>A device with a row in the device table, or a connected FortiGate without one (its logs are discarded and counted).</dd>
<dt>OFTP</dt><dd>The log transport from FortiGate to FortiAnalyzer on port 514, UDP or TCP with <code>reliable</code>.</dd>
<dt>Serial list</dt><dd>The <code>serial</code> setting of a FortiGate; it must contain the FortiAnalyzer serial.</dd>
<dt>Analytics / archive</dt><dd>Searchable recent logs and older compressed logs that are not searchable.</dd>
<dt>Quota</dt><dd>The disk limit of an ADOM; overwrite deletes the oldest logs, drop rejects the newest.</dd>
<dt>HA, collector, analyzer</dt><dd>Theory: more than one unit, a receiving unit and a searching unit.</dd>
<dt>Runbook</dt><dd>A short written procedure for a known situation.</dd>
</dl>

<h3>The most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Delete the device row on FAZ-1 while the FortiGate logs</td><td>It becomes unregistered; logs discarded</td></tr>
<tr><td>What ends the unregistered entry</td><td><code>set status disable</code> on the FortiGate</td></tr>
<tr><td>Stored logs after a device is deleted</td><td>Stay and stay searchable</td></tr>
<tr><td>Timeout versus serial mismatch</td><td>Timeout is checked first and hides the mismatch</td></tr>
<tr><td>Allow plus unregistered</td><td>Connected, but logs are discarded; register</td></tr>
<tr><td>FortiManager authorization</td><td>Does not register in FortiAnalyzer</td></tr>
<tr><td>Ports</td><td>FGFM TCP 541, logs port 514</td></tr>
<tr><td>Theory only here</td><td>HA, forwarding, aggregation, backup, upgrade, Security Fabric views</td></tr></table>

<h3>Reminder of what is a stand-in</h3>
<p>The commands <code>execute fazui ...</code>, <code>config system log quota</code> and <code>config faz ...</code> are simulator stand-ins for GUI actions of the real product. Real names are the FortiGate logging settings, <code>test-connectivity</code>, <code>miglogd 6</code> (output approximated), <code>get system status</code>, <code>diagnose dvm device list</code> and <code>diagnose device list</code>. Sizes in the simulator (700 bytes per log, 1000 MB default quota, a quarter for the archive) are stand-ins too.</p>

<div class="eg"><p><b>Self-test.</b> A new store FortiGate is connected, test-connectivity says Allow, but Log View is empty. What are the three most likely reasons, in order? Not registered (check the unregistered list); registered but no traffic or logtraffic disabled on the policy (check the Traffic count and last log); a filter or the wrong ADOM in Log View. If you can name the command for each, you have the module.</p></div>

<div class="warn"><p><b>Common mistakes to avoid on the day.</b> Answering with a command that exists only in the simulator when the question is about the real product. Forgetting that retire is two steps. Calling anything in the theory list "configured in the lab". Writing the delete order the wrong way round.</p></div>

<div class="exam"><p><b>Exam traps.</b> Questions often hide a trap in one word: "stored" versus "searchable", "connected" versus "registered", "delete" versus "disable", "FortiManager" versus "FortiAnalyzer". Read each word.</p></div>

<div class="scn"><h4>The handover file</h4><p>When the engineer who built FAZ-1 moved to another team, the new owner received three things: the register of devices, five runbooks (onboard, retire, logs missing, unregistered device, storage full) and the last month of daily check outputs. The first week had two tickets and both were closed from the runbooks without calling the previous owner.</p><p><b>Lesson:</b> day-two operations are good when somebody else can do them.</p></div>

<div class="iv"><p class="q">"Summarize how you would operate a FortiAnalyzer in production."</p><p>Onboard both sides and prove with a log, retire in two steps, troubleshoot in the order of the connection checks, monitor device status, unregistered devices and storage regularly, size from measured log rates, protect configuration and logs separately, and keep a register, runbooks and tickets with proof. Name HA, forwarding and fabric topology as design topics beyond the simulator.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Add and retire are two-sided jobs; the proof is a log, or an empty unregistered list.</li>
<li>The connection checks run in a fixed order and the first fault hides the next.</li>
<li>Stored logs outlive device deletion and follow retention and quota.</li>
<li>FortiManager authorization and FortiAnalyzer registration are separate.</li>
<li>HA, forwarding, backup and fabric views are theory in this simulator.</li>
<li>Good operations means register, checks, runbooks and tickets with proof.</li>
</ul></div>
`,hi:`
<p>Pilot ke udne se pehle ghutne par ek checklist hoti hai: udna sikhane ke liye nahi, balki ye pakka karne ke liye ki koi aam cheez na chhut jaye. FortiAnalyzer track ke operations module ke liye ye chapter wahi hai. Labs ke baad ise padho, jo bina dekhe kar sakte ho uspar tick lagao, aur jo nahi kar sakte uske chapter par wapas jao. Is track ke skills vendor administrator-level skills se overlap karte hain, par ye course independent training hai aur kisi certification exam ki taiyari ka claim nahi karta.</p>

<h3>Aapko kya aana chahiye</h3>
<ul>
<li>Site add karna: server aur FAZ-1 serial ke saath <code>config log fortianalyzer setting</code> configure karo, <code>execute log fortianalyzer test-connectivity</code> check karo, device ko ADOM mein register karo, test log banao aur Log View mein dhoondho.</li>
<li>Device ko doosre ADOM mein register karke move karna aur samjhana ki purane logs purane ADOM mein kyun rehte hain.</li>
<li>Device ko do steps mein retire karna: FAZ-1 par device entry delete, phir FortiGate par logging disable; prove karo ki unregistered list khaali hai aur baaki devices untouched hain.</li>
<li>Samjhana ki delete kiya device phir unregistered ki tarah kyun dikhta hai jab tak FortiGate log karta hai.</li>
<li>Logging connection ke ordered checks chalna aur har message ko uske cause aur fix se jodna.</li>
<li>Ek connection ke do faults alag karna aur jaanna ki pehla doosre ko chhupata hai.</li>
<li>Sizing arithmetic karna aur storage output padhna (Used percent, Overwritten, Rejected).</li>
<li>HA, forwarding, aggregation, backup aur Security Fabric ko ek-ek sentence mein batana, aur ye ki yahan wo theory hain.</li>
<li>Samjhana ki FortiManager mein authorize karne se FortiAnalyzer mein register nahi hota.</li>
<li>Register rakhna, daily aur weekly checks chalana, runbook likhna aur ticket proof ke saath close karna.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module ka summary">
<rect x="10" y="20" width="190" height="60" rx="8" fill="#bae6fd"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="13">Add / move</text><text x="105" y="64" text-anchor="middle" class="svg-muted" font-size="12">dono sides, phir log</text>
<rect x="225" y="20" width="190" height="60" rx="8" fill="#fed7aa"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Retire</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">row delete + source band</text>
<rect x="440" y="20" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="535" y="46" text-anchor="middle" class="svg-ink" font-size="13">Troubleshoot</text><text x="535" y="64" text-anchor="middle" class="svg-muted" font-size="12">ordered checks</text>
<rect x="10" y="100" width="300" height="52" rx="8" fill="#bbf7d0"/><text x="160" y="124" text-anchor="middle" class="svg-ink" font-size="13">Operate: register, daily checks, runbooks</text>
<rect x="330" y="100" width="300" height="52" rx="8" fill="#e2e8f0"/><text x="480" y="124" text-anchor="middle" class="svg-ink" font-size="13">Theory: HA, forwarding, backup, fabric</text>
</svg><p class="cap">Poora module ek picture mein.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Registered / unregistered</dt><dd>Device table mein row wala device, ya row ke bina connected FortiGate (uske logs discard aur count hote hain).</dd>
<dt>OFTP</dt><dd>FortiGate se FortiAnalyzer ka log transport, port 514 par, UDP ya <code>reliable</code> ke saath TCP.</dd>
<dt>Serial list</dt><dd>FortiGate ki <code>serial</code> setting; usme FortiAnalyzer ka serial hona chahiye.</dd>
<dt>Analytics / archive</dt><dd>Searchable recent logs aur purane compressed logs jo searchable nahi.</dd>
<dt>Quota</dt><dd>ADOM ki disk limit; overwrite sabse purane logs delete karta hai, drop sabse naye reject karta hai.</dd>
<dt>HA, collector, analyzer</dt><dd>Theory: ek se zyada unit, receive karne wala unit aur search karne wala unit.</dd>
<dt>Runbook</dt><dd>Known situation ki chhoti likhi procedure.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>FortiGate ke log karte hue FAZ-1 par device row delete karna</td><td>Wo unregistered ho jaata hai; logs discard</td></tr>
<tr><td>Unregistered entry kya khatam karta hai</td><td>FortiGate par <code>set status disable</code></td></tr>
<tr><td>Device delete ke baad stored logs</td><td>Rehte hain aur searchable rehte hain</td></tr>
<tr><td>Timeout versus serial mismatch</td><td>Timeout pehle check hota hai aur mismatch ko chhupata hai</td></tr>
<tr><td>Allow plus unregistered</td><td>Connected, par logs discard; register karo</td></tr>
<tr><td>FortiManager authorization</td><td>FortiAnalyzer mein register nahi karta</td></tr>
<tr><td>Ports</td><td>FGFM TCP 541, logs port 514</td></tr>
<tr><td>Yahan sirf theory</td><td>HA, forwarding, aggregation, backup, upgrade, Security Fabric views</td></tr></table>

<h3>Stand-in kya hai, yaad dilana</h3>
<p>Commands <code>execute fazui ...</code>, <code>config system log quota</code> aur <code>config faz ...</code> real product ke GUI actions ke simulator stand-ins hain. Real names hain FortiGate logging settings, <code>test-connectivity</code>, <code>miglogd 6</code> (output approximate), <code>get system status</code>, <code>diagnose dvm device list</code> aur <code>diagnose device list</code>. Simulator ke sizes (700 bytes per log, 1000 MB default quota, archive ke liye ek chauthai) bhi stand-ins hain.</p>

<div class="eg"><p><b>Self-test.</b> Naye store ka FortiGate connected hai, test-connectivity Allow kehta hai, par Log View khaali hai. Order mein teen sabse likely reasons kya hain? Registered nahi (unregistered list check karo); registered par traffic nahi ya policy par logtraffic disabled (Traffic count aur last log check karo); Log View mein filter ya galat ADOM. Agar har ek ka command bata sakte ho to aapko module aa gaya.</p></div>

<div class="warn"><p><b>Exam ke din bachne wali galtiyan.</b> Jab sawal real product ke baare mein ho tab aisa command batana jo sirf simulator mein hai. Bhool jaana ki retire do steps hai. Theory list ki kisi cheez ko "lab mein configure kiya" kehna. Delete ka order ulta likhna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Sawaalon mein aksar ek word mein trap hota hai: "stored" versus "searchable", "connected" versus "registered", "delete" versus "disable", "FortiManager" versus "FortiAnalyzer". Har word padho.</p></div>

<div class="scn"><h4>Handover file</h4><p>Jab FAZ-1 banane wala engineer doosri team mein gaya, naye owner ko teen cheezein mili: devices ka register, paanch runbooks (onboard, retire, logs missing, unregistered device, storage full) aur pichhle mahine ke daily check outputs. Pehle hafte mein do tickets aaye aur dono runbooks se bina purane owner ko call kiye close hue.</p><p><b>Lesson:</b> day-two operations tab achhe hain jab koi aur bhi unhe kar sake.</p></div>

<div class="iv"><p class="q">"Production mein FortiAnalyzer kaise operate karoge, summary do."</p><p>Dono sides onboard karo aur log se prove karo, do steps mein retire karo, connection checks ke order mein troubleshoot karo, device status, unregistered devices aur storage regularly monitor karo, measured log rates se size karo, configuration aur logs ko alag protect karo, aur register, runbooks aur proof wale tickets rakho. HA, forwarding aur fabric topology ko simulator se bahar ke design topics bolo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Add aur retire do-sided jobs hain; proof ek log hai, ya khaali unregistered list.</li>
<li>Connection checks fixed order mein chalte hain aur pehla fault agle ko chhupata hai.</li>
<li>Stored logs device deletion se bachte hain aur retention aur quota follow karte hain.</li>
<li>FortiManager authorization aur FortiAnalyzer registration alag hain.</li>
<li>HA, forwarding, backup aur fabric views is simulator mein theory hain.</li>
<li>Achhe operations matlab register, checks, runbooks aur proof wale tickets.</li>
</ul></div>
`}};export{e as default};