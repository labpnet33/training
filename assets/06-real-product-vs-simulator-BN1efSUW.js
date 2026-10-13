var e={id:`real-product-vs-simulator`,h:{en:`Real product versus simulator: GUI, root mode, serial numbers and licences`,hi:`Real product versus simulator: GUI, root mode, serial numbers aur licences`},body:{en:`
<p>A driving school has a practice car with a simple dashboard. The controls that matter are the same as in a real car, but the school has removed the radio, the sunroof and the traffic. Our simulator is that practice car. It teaches the ideas and the CLI that exist on both sides, and it replaces some real GUI actions with commands so that you can practise them on a keyboard. This chapter draws the line clearly so that you never learn a command that does not exist.</p>

<h3>What is CLI on both sides</h3>
<p>These work the same way in name on a real FortiGate and in the simulator (the output layout is approximated in the simulator):</p>
<ul>
<li><code>config log fortianalyzer setting</code> and <code>config log fortianalyzer filter</code> on the FortiGate.</li>
<li><code>execute log fortianalyzer test-connectivity</code> on the FortiGate.</li>
<li><code>diagnose test application miglogd 6</code> on the FortiGate.</li>
<li><code>get system status</code>, <code>diagnose dvm device list</code>, <code>diagnose device list</code>, <code>diagnose test application oftpd 3</code> and <code>diagnose log device</code> on the FortiAnalyzer.</li>
</ul>

<h3>What is a GUI action in the real product</h3>
<table class="cmp"><tr><th>Task</th><th>Real product</th><th>Simulator stand-in</th></tr>
<tr><td>Accept or add a device</td><td>GUI: device list, add or authorize an unregistered device</td><td><code>execute fazui register &lt;device&gt; &lt;adom&gt;</code></td></tr>
<tr><td>See unregistered devices</td><td>GUI list (they stay listed until deleted)</td><td><code>execute fazui unregistered list</code> (only while connected)</td></tr>
<tr><td>Search logs</td><td>GUI Log View</td><td><code>execute fazui logview ...</code></td></tr>
<tr><td>Event handlers, incidents, reports</td><td>GUI</td><td><code>execute fazui handler | incident | report</code></td></tr>
<tr><td>Disk quota of an ADOM</td><td>GUI, ADOM properties</td><td><code>config system log quota</code></td></tr>
</table>
<div class="warn"><p><b>Names that do not exist on a real FortiAnalyzer:</b> <code>execute fazui ...</code>, <code>config system log quota</code>, <code>config faz event-handler</code> and <code>config faz incident</code>. We use them only because a lab cannot click in a GUI. In an interview, say "in the GUI I would add the device"; do not quote <code>execute fazui</code>.</p></div>

<h3>Root mode: ADOMs off</h3>
<p>By default the FortiAnalyzer works without administrative domains. Every device and every log lives in one built-in domain called <code>root</code>. The command <code>get system status</code> shows <code>Admin Domain Configuration : Disabled</code>. In this module all three labs use root, which is why <code>execute fazui register HQ-FGT root</code> is the only form you need. Turning ADOM mode on, creating domains and their version rule are the topic of the next module.</p>
<pre class="out">FAZ-1 # get system status
Platform Full Name              : FortiAnalyzer-VM64
Version                         : v7.6.0-build3340 240627 (GA.F)
Serial Number                   : FAZ-VMEVYXM9SG00
Hostname                        : FAZ-1
Max Number of Admin Domains     : 5
<span class="hl">Admin Domain Configuration      : Disabled</span>
HA Mode                         : Stand Alone
<span class="hl">Devices Registered              : 0</span>
Log Database                    : 0 analytics logs
Notice: NK-OS is an educational simulator, not FortiAnalyzer.</pre>
<p>Use this output as a starting check: Devices Registered counts the device-table rows, and Log Database counts stored analytics logs.</p>

<h3>Serial numbers (and a little licence theory)</h3>
<p>Every FortiGate and every FortiAnalyzer has a serial number. The FortiAnalyzer identifies devices by it, and the FortiGate may be told which FortiAnalyzer serial to trust (the <code>serial</code> option). In the simulator the numbers are synthetic, such as FGVMEV1RGF38I000 for HQ-FGT.</p>
<p><b>Theory only, not modelled:</b> in the real product a FortiAnalyzer licence limits how many GB of logs per day it may take in, and how many devices or ADOMs it supports. If the daily limit is exceeded, behaviour depends on the product version and licence. The simulator has no licence limits except a fixed note that the unit allows 5 admin domains. Firmware upgrades, HA and log forwarding are also theory here (see the later modules).</p>

<h3>Other honest limits of the simulator</h3>
<ul>
<li>Logs are real in the sense that the simulated firewall writes them from the traffic you create. Event logs are synthetic: only configuration changes produce them.</li>
<li>Traffic logs carry 84 sent bytes each, duration 0 and an empty <code>user</code>; they are stand-ins.</li>
<li>Names are not resolved, so use IP addresses. TLS settings are recorded, not negotiated. The maximum log rate is shown as 0.</li>
<li>Stored logs, counters and events are run-time data and are lost when a lab is saved and restored. The configuration stays: device table, FortiGate logging settings. After a restore, generate traffic again.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Kaveri wants HQ-FGT registered. In the real product the administrator opens the device list, sees HQ-FGT in the unregistered devices, ticks it and chooses the domain. In the simulator the same step is <code>execute fazui register HQ-FGT root</code>. The outcome is identical: a row with serial FGVMEV1RGF38I000 appears in the device table, and logs from then on are stored.</p></div>

<div class="scn"><h4>The command nobody could find</h4><p>A trainee wrote in his project notes that he "ran execute fazui register" on the customer FortiAnalyzer. The customer engineer could not find the command and doubted the notes. The trainee had practised on a simulator; on the real unit the registration is done in the GUI. The notes were corrected to describe the GUI path.</p><p><b>Lesson:</b> know which commands are stand-ins, and describe real work in real terms.</p></div>

<div class="iv"><p class="q">"Where do you configure the log connection and where do you register the device?"</p><p>The log connection is configured on the FortiGate with config log fortianalyzer setting (CLI or GUI there). The registration is done on the FortiAnalyzer, normally in the GUI, by adding or accepting the device by serial number. I verify both sides: test-connectivity on the FortiGate and the device list on the FortiAnalyzer.</p></div>

<div class="exam"><p><b>Exam traps.</b> Registration is on the FortiAnalyzer, the log settings are on the FortiGate. With ADOMs disabled, everything is in root. A serial number is the identity of a device. Licence limits are theory in this course. Authorizing a device in a FortiManager does not register it in a FortiAnalyzer (see the later module).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CLI on both sides: log fortianalyzer setting and filter, test-connectivity, miglogd 6, diagnose device and log commands.</li>
<li>GUI in the real product, commands in the simulator: register, unregistered list, Log View, handlers, incidents, reports, quota.</li>
<li><code>execute fazui</code>, <code>config system log quota</code> and <code>config faz ...</code> do not exist on a real FortiAnalyzer.</li>
<li>With ADOMs off, every device and log is in root.</li>
<li>Licences, HA and forwarding are theory in this module.</li>
</ul></div>
`,hi:`
<p>Driving school ke paas ek practice car hoti hai jiska dashboard simple hai. Zaroori controls real car jaise hi hain, par school ne radio, sunroof aur traffic hata diya hai. Humara simulator wahi practice car hai. Ye wo ideas aur CLI sikhata hai jo dono taraf hain, aur kuch real GUI actions ko commands se badal deta hai taaki aap keyboard par practise kar sako. Ye chapter line saaf kheenchta hai taaki aap aisi command na seekh lo jo exist hi nahi karti.</p>

<h3>Dono taraf CLI kya hai</h3>
<p>Ye naam ke hisaab se real FortiGate aur simulator dono mein same kaam karte hain (simulator mein output layout approximate hai):</p>
<ul>
<li>FortiGate par <code>config log fortianalyzer setting</code> aur <code>config log fortianalyzer filter</code>.</li>
<li>FortiGate par <code>execute log fortianalyzer test-connectivity</code>.</li>
<li>FortiGate par <code>diagnose test application miglogd 6</code>.</li>
<li>FortiAnalyzer par <code>get system status</code>, <code>diagnose dvm device list</code>, <code>diagnose device list</code>, <code>diagnose test application oftpd 3</code> aur <code>diagnose log device</code>.</li>
</ul>

<h3>Real product mein GUI action kya hai</h3>
<table class="cmp"><tr><th>Kaam</th><th>Real product</th><th>Simulator stand-in</th></tr>
<tr><td>Device accept ya add karna</td><td>GUI: device list, unregistered device add ya authorize</td><td><code>execute fazui register &lt;device&gt; &lt;adom&gt;</code></td></tr>
<tr><td>Unregistered devices dekhna</td><td>GUI list (delete hone tak listed rehte hain)</td><td><code>execute fazui unregistered list</code> (sirf connected hone par)</td></tr>
<tr><td>Logs search karna</td><td>GUI Log View</td><td><code>execute fazui logview ...</code></td></tr>
<tr><td>Event handlers, incidents, reports</td><td>GUI</td><td><code>execute fazui handler | incident | report</code></td></tr>
<tr><td>ADOM ka disk quota</td><td>GUI, ADOM properties</td><td><code>config system log quota</code></td></tr>
</table>
<div class="warn"><p><b>Real FortiAnalyzer par jo names exist nahi karte:</b> <code>execute fazui ...</code>, <code>config system log quota</code>, <code>config faz event-handler</code> aur <code>config faz incident</code>. Hum inhe sirf isliye use karte hain kyunki lab GUI mein click nahi kar sakta. Interview mein kaho "GUI mein main device add karunga"; <code>execute fazui</code> quote mat karo.</p></div>

<h3>Root mode: ADOMs off</h3>
<p>Default mein FortiAnalyzer administrative domains ke bina chalta hai. Har device aur har log ek built-in domain <code>root</code> mein rehta hai. <code>get system status</code> command <code>Admin Domain Configuration : Disabled</code> dikhati hai. Is module ke teeno labs root use karte hain, isliye <code>execute fazui register HQ-FGT root</code> hi ek form chahiye. ADOM mode on karna, domains banana aur unka version rule agle module ka topic hai.</p>
<pre class="out">FAZ-1 # get system status
Platform Full Name              : FortiAnalyzer-VM64
Version                         : v7.6.0-build3340 240627 (GA.F)
Serial Number                   : FAZ-VMEVYXM9SG00
Hostname                        : FAZ-1
Max Number of Admin Domains     : 5
<span class="hl">Admin Domain Configuration      : Disabled</span>
HA Mode                         : Stand Alone
<span class="hl">Devices Registered              : 0</span>
Log Database                    : 0 analytics logs
Notice: NK-OS is an educational simulator, not FortiAnalyzer.</pre>
<p>Is output ko starting check ki tarah use karo: Devices Registered device-table rows ginta hai, aur Log Database stored analytics logs.</p>

<h3>Serial numbers (aur thodi licence theory)</h3>
<p>Har FortiGate aur har FortiAnalyzer ka serial number hota hai. FortiAnalyzer devices ko usi se pehchanta hai, aur FortiGate ko bataya ja sakta hai ki kaun sa FortiAnalyzer serial trust karna hai (<code>serial</code> option). Simulator mein numbers synthetic hain, jaise HQ-FGT ke liye FGVMEV1RGF38I000.</p>
<p><b>Sirf theory, modelled nahi:</b> real product mein FortiAnalyzer licence tay karta hai ki wo roz kitne GB logs le sakta hai, aur kitne devices ya ADOMs support karta hai. Daily limit paar ho jaye to behaviour product version aur licence par depend karta hai. Simulator mein licence limits nahi hain, sirf ek fixed note ki unit 5 admin domains allow karta hai. Firmware upgrade, HA aur log forwarding bhi yahan theory hain (aage ke modules dekho).</p>

<h3>Simulator ki baaki honest limits</h3>
<ul>
<li>Logs is arth mein real hain ki simulated firewall unhe aapke banaye traffic se likhta hai. Event logs synthetic hain: sirf configuration changes unhe banate hain.</li>
<li>Traffic logs mein har ek ke 84 sent bytes, duration 0 aur khaali <code>user</code> hota hai; ye stand-ins hain.</li>
<li>Names resolve nahi hote, isliye IP addresses use karo. TLS settings record hoti hain, negotiate nahi. Maximum log rate 0 dikhta hai.</li>
<li>Stored logs, counters aur events run-time data hain aur lab save aur restore karne par chale jate hain. Configuration rehti hai: device table, FortiGate logging settings. Restore ke baad traffic dobara generate karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Kaveri HQ-FGT ko register karwana chahta hai. Real product mein administrator device list kholta hai, HQ-FGT ko unregistered devices mein dekhta hai, tick karta hai aur domain chunta hai. Simulator mein wahi step <code>execute fazui register HQ-FGT root</code> hai. Result same hai: device table mein serial FGVMEV1RGF38I000 wali row aati hai, aur us waqt se logs store hote hain.</p></div>

<div class="scn"><h4>Wo command jo kisi ko nahi mili</h4><p>Ek trainee ne project notes mein likha ki usne customer ke FortiAnalyzer par "execute fazui register" chalaya. Customer engineer ko command nahi mili aur usne notes par shak kiya. Trainee ne simulator par practise kiya tha; real unit par registration GUI mein hoti hai. Notes ko GUI path ke hisaab se theek kiya gaya.</p><p><b>Lesson:</b> jaano kaun si commands stand-in hain, aur real kaam ko real terms mein describe karo.</p></div>

<div class="iv"><p class="q">"Log connection kahan configure karte ho aur device kahan register karte ho?"</p><p>Log connection FortiGate par config log fortianalyzer setting se configure hota hai (wahan CLI ya GUI). Registration FortiAnalyzer par hoti hai, aam taur par GUI mein, device ko serial number se add ya accept karke. Main dono sides verify karta hoon: FortiGate par test-connectivity aur FortiAnalyzer par device list.</p></div>

<div class="exam"><p><b>Exam traps.</b> Registration FortiAnalyzer par hai, log settings FortiGate par. ADOMs disabled hon to sab root mein hota hai. Serial number device ki pehchan hai. Licence limits is course mein theory hain. FortiManager mein device authorize karna use FortiAnalyzer mein register nahi karta (aage ka module dekho).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dono taraf CLI: log fortianalyzer setting aur filter, test-connectivity, miglogd 6, diagnose device aur log commands.</li>
<li>Real product mein GUI, simulator mein commands: register, unregistered list, Log View, handlers, incidents, reports, quota.</li>
<li><code>execute fazui</code>, <code>config system log quota</code> aur <code>config faz ...</code> real FortiAnalyzer par exist nahi karte.</li>
<li>ADOMs off hon to har device aur log root mein hai.</li>
<li>Licences, HA aur forwarding is module mein theory hain.</li>
</ul></div>
`}};export{e as default};