var e={id:`fortianalyzer-side`,h:{en:`The FortiAnalyzer side: registration, the unregistered list and the device table`,hi:`FortiAnalyzer side: registration, unregistered list aur device table`},body:{en:`
<p>Picture a hostel gate. A visitor arrives, the guard calls out the name, and checks the visitor register. If the name is there, the visitor is let in and the entry is recorded. If it is not, the guard notes "someone came" on a separate sheet, but nothing the visitor says is written down. A FortiAnalyzer treats logs the same way. The FortiGate at the gate is <b>connected</b>, but until its serial number is in the device table it is only <b>unregistered</b>.</p>

<h3>Three states of a FortiGate on FAZ-1</h3>
<table class="cmp"><tr><th>State</th><th>Meaning</th><th>What happens to its logs</th></tr>
<tr><td>Not connected</td><td>No OFTP connection reaches FAZ-1 (chapter 5)</td><td>They wait in the queue on the FortiGate</td></tr>
<tr><td>Connected, unregistered</td><td>The FortiGate talks to FAZ-1, but no device-table row has its serial</td><td><b>Discarded and counted</b>, nothing is stored</td></tr>
<tr><td>Registered</td><td>A device-table row holds its serial number</td><td>Stored</td></tr>
</table>
<p>The <b>serial number</b> identifies the hardware or virtual machine; it is the key of the device table. A serial number can be in only one row. A <b>device table</b> is the list of FortiGates that FAZ-1 accepts logs from.</p>

<h3>The unregistered list</h3>
<p>In the real product, a FortiGate that connects but is not registered shows up for an administrator to accept in the GUI. In the simulator, that list is the stand-in command <code>execute fazui unregistered list</code>. It does not exist on a real FortiAnalyzer.</p>
<pre class="out">FAZ-1 # execute fazui unregistered list
Unregistered devices (connected through OFTP/514, logs are discarded until they are registered):
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
HQ-FGT          FGVMEV1RGF38I000    192.0.2.11      <span class="hl">8</span>               2026-10-12 20:44:03</pre>
<p>Read the LOGS DISCARDED column. It is not a failure of the network; it is the FortiAnalyzer telling you "I received these and threw them away". Note that the simulator lists an unregistered device only while it is connected.</p>

<h3>Registering a device</h3>
<p>Registration adds the serial to the device table, in an ADOM. With ADOM mode off, the only choice is <code>root</code>.</p>
<pre class="code">FAZ-1 # <span class="c">! stand-in for the GUI action "add device"</span>
execute fazui register HQ-FGT root</pre>
<pre class="out">FAZ-1 # execute fazui register HQ-FGT root
Device HQ-FGT (FGVMEV1RGF38I000) registered in ADOM root.
<span class="hl">5 logs received while it was unregistered were discarded.</span> Logs received from now on are stored.</pre>
<p>This is the key fact of the module: <b>logs sent before registration are gone for good</b>. Registering later does not bring them back.</p>

<h3>Looking at the device table</h3>
<p>Three commands show the result, all real names with approximated layout.</p>
<pre class="out">FAZ-1 # diagnose device list
Registered devices (0):
NAME            SERIAL              ADOM        IP              CONN  LOGS (traffic/utm/event)  LAST LOG

Unregistered devices (1): connected, logs discarded until the device is registered
NAME            SERIAL              IP              LOGS DISCARDED
HQ-FGT          FGVMEV1RGF38I000    192.0.2.11      8</pre>
<pre class="out">FAZ-1 # diagnose log device
Device          SN                  ADOM      Traffic  UTM    Event  Rejected  Last log
HQ-FGT          FGVMEV1RGF38I000    (unreg)   6        0      2      <span class="hl">discarded</span> 2026-10-12 20:44:03</pre>
<p><code>diagnose log device</code> is the quickest health check: per device it shows the ADOM, how many traffic, UTM and event logs arrived, and the word <code>discarded</code> for an unregistered one. Once HQ-FGT is registered, the ADOM column shows root and the counters count stored logs. The commands <code>diagnose dvm device list</code> and <code>show dvmdb device</code> show the device-table rows themselves.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Decision at FAZ-1 on arrival of a log">
<rect x="20" y="70" width="130" height="56" rx="8" fill="#bae6fd"/><text x="85" y="94" text-anchor="middle" class="svg-ink" font-size="13">Log arrives</text><text x="85" y="112" text-anchor="middle" class="svg-muted" font-size="12">serial + data</text>
<polygon points="260,56 340,98 260,140 180,98" fill="#fde68a"/><text x="260" y="95" text-anchor="middle" class="svg-ink" font-size="12">Serial in</text><text x="260" y="111" text-anchor="middle" class="svg-ink" font-size="12">device table?</text>
<rect x="430" y="20" width="190" height="56" rx="8" fill="#bbf7d0"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">Stored in ADOM</text><text x="525" y="62" text-anchor="middle" class="svg-muted" font-size="12">searchable, in reports</text>
<rect x="430" y="124" width="190" height="56" rx="8" fill="#fed7aa"/><text x="525" y="148" text-anchor="middle" class="svg-ink" font-size="13">Discarded + counted</text><text x="525" y="166" text-anchor="middle" class="svg-muted" font-size="12">unregistered list</text>
<line x1="150" y1="98" x2="180" y2="98" stroke="#64748b" stroke-width="2"/><line x1="340" y1="98" x2="385" y2="48" stroke="#64748b" stroke-width="2"/><line x1="385" y1="48" x2="430" y2="48" stroke="#64748b" stroke-width="2"/><line x1="340" y1="98" x2="385" y2="152" stroke="#64748b" stroke-width="2"/><line x1="385" y1="152" x2="430" y2="152" stroke="#64748b" stroke-width="2"/>
<text x="372" y="40" class="svg-accent" font-size="12">yes</text><text x="372" y="172" class="svg-accent" font-size="12">no</text>
</svg><p class="cap">The registration check at FAZ-1 decides between storage and discard.</p></div>

<div class="eg"><p><b>Worked example.</b> HQ-FGT is connected from 10:00. At 10:10 an administrator registers it. During those ten minutes it sent 600 logs. FAZ-1 discarded all 600 and counted them in the unregistered list. From 10:10 the logs are stored. A search for 10:05 finds nothing, and no setting can recover those logs. Only the FortiGate log memory would still hold a few, if the analyst is lucky.</p></div>

<h3>Deleting a device</h3>
<p>If you delete the device-table row, the FortiGate becomes unregistered again at once if it still sends logs. Logs already stored stay. This is the basis of the retirement procedure in a later module.</p>

<div class="warn"><p><b>Common mistakes.</b> Reading "Connection: Allow" as "my logs are safe". Registering a device and then searching for logs from before the registration. Trying to register the same serial twice (the second attempt is refused as already registered). Typing an ADOM that does not exist; the simulator answers that the ADOM does not exist. Looking for the unregistered list in a FortiGate command: it is on the FortiAnalyzer.</p></div>

<div class="exam"><p><b>Exam traps.</b> Unregistered means connected but not in the device table. Logs of an unregistered device are discarded, not queued. Registration is by serial number. A serial can be in one row only. Registration is a GUI action on the real product; <code>execute fazui</code> exists only in the simulator.</p></div>

<div class="scn"><h4>Three weeks of nothing</h4><p>A new FortiAnalyzer was installed and three FortiGates were pointed at it. Everyone assumed logs were arriving. Three weeks later an analyst opened Log View and found it empty. The unregistered list showed all three devices with large discarded counters. After registration logs flowed, but the first three weeks were lost.</p><p><b>Lesson:</b> after configuring the FortiGate, always look at the FortiAnalyzer side the same day; connected does not mean stored.</p></div>

<div class="iv"><p class="q">"A FortiGate shows Connection Allow but Log View is empty. What do you check?"</p><p>I look at Registration in test-connectivity and the unregistered list on FAZ-1. An unregistered device has its logs discarded. I register it, generate traffic, and confirm with diagnose log device that the counters rise under an ADOM. I also explain that earlier logs cannot be recovered.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connected and registered are different things; only registered devices have logs stored.</li>
<li>Logs of an unregistered device are discarded and counted, not queued.</li>
<li>Registration puts the serial number into the device table in an ADOM (root with ADOMs off).</li>
<li>Logs sent before registration are lost for good.</li>
<li><code>diagnose log device</code> and <code>diagnose device list</code> show registration and counters.</li>
</ul></div>
`,hi:`
<p>Hostel ka gate socho. Visitor aata hai, guard naam pukarta hai aur visitor register dekhta hai. Naam ho to visitor andar jata hai aur entry likhi jati hai. Na ho to guard alag kaagaz par likhta hai "koi aaya tha", par visitor ne jo bola wo kuch likha nahi jata. FortiAnalyzer logs ke saath aisa hi karta hai. Gate par khada FortiGate <b>connected</b> hai, par jab tak uska serial number device table mein nahi hai, wo sirf <b>unregistered</b> hai.</p>

<h3>FAZ-1 par FortiGate ki teen states</h3>
<table class="cmp"><tr><th>State</th><th>Matlab</th><th>Uske logs ka kya hota hai</th></tr>
<tr><td>Not connected</td><td>Koi OFTP connection FAZ-1 tak nahi pahunchta (chapter 5)</td><td>FortiGate par queue mein wait karte hain</td></tr>
<tr><td>Connected, unregistered</td><td>FortiGate FAZ-1 se baat karta hai, par kisi device-table row mein uska serial nahi</td><td><b>Discard aur count</b>, kuch store nahi hota</td></tr>
<tr><td>Registered</td><td>Device-table row mein uska serial number hai</td><td>Store hote hain</td></tr>
</table>
<p><b>Serial number</b> hardware ya virtual machine ki pehchan hai; ye device table ki key hai. Ek serial number sirf ek row mein ho sakta hai. <b>Device table</b> un FortiGates ki list hai jinke logs FAZ-1 accept karta hai.</p>

<h3>Unregistered list</h3>
<p>Real product mein jo FortiGate connect hota hai par registered nahi hota, wo GUI mein administrator ke accept karne ke liye dikhta hai. Simulator mein wo list stand-in command <code>execute fazui unregistered list</code> hai. Ye real FortiAnalyzer par exist nahi karta.</p>
<pre class="out">FAZ-1 # execute fazui unregistered list
Unregistered devices (connected through OFTP/514, logs are discarded until they are registered):
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
HQ-FGT          FGVMEV1RGF38I000    192.0.2.11      <span class="hl">8</span>               2026-10-12 20:44:03</pre>
<p>LOGS DISCARDED column padho. Ye network ki failure nahi hai; ye FortiAnalyzer keh raha hai "ye mujhe mile aur maine phenk diye". Dhyan rahe, simulator unregistered device ko tabhi list karta hai jab wo connected ho.</p>

<h3>Device register karna</h3>
<p>Registration serial ko device table mein, ek ADOM mein, jodti hai. ADOM mode off ho to sirf <code>root</code> ka choice hai.</p>
<pre class="code">FAZ-1 # <span class="c">! GUI action "add device" ka stand-in</span>
execute fazui register HQ-FGT root</pre>
<pre class="out">FAZ-1 # execute fazui register HQ-FGT root
Device HQ-FGT (FGVMEV1RGF38I000) registered in ADOM root.
<span class="hl">5 logs received while it was unregistered were discarded.</span> Logs received from now on are stored.</pre>
<p>Is module ka sabse zaroori fact: <b>registration se pehle bheje gaye logs hamesha ke liye gaye</b>. Baad mein register karne se wo wapas nahi aate.</p>

<h3>Device table dekhna</h3>
<p>Teen commands result dikhate hain, sab real names, layout approximate.</p>
<pre class="out">FAZ-1 # diagnose device list
Registered devices (0):
NAME            SERIAL              ADOM        IP              CONN  LOGS (traffic/utm/event)  LAST LOG

Unregistered devices (1): connected, logs discarded until the device is registered
NAME            SERIAL              IP              LOGS DISCARDED
HQ-FGT          FGVMEV1RGF38I000    192.0.2.11      8</pre>
<pre class="out">FAZ-1 # diagnose log device
Device          SN                  ADOM      Traffic  UTM    Event  Rejected  Last log
HQ-FGT          FGVMEV1RGF38I000    (unreg)   6        0      2      <span class="hl">discarded</span> 2026-10-12 20:44:03</pre>
<p><code>diagnose log device</code> sabse tez health check hai: har device ke liye ADOM, kitne traffic, UTM aur event logs aaye, aur unregistered ke liye shabd <code>discarded</code>. HQ-FGT register hone par ADOM column root dikhata hai aur counters stored logs ginte hain. Commands <code>diagnose dvm device list</code> aur <code>show dvmdb device</code> device-table rows khud dikhate hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Log aane par FAZ-1 ka decision">
<rect x="20" y="70" width="130" height="56" rx="8" fill="#bae6fd"/><text x="85" y="94" text-anchor="middle" class="svg-ink" font-size="13">Log aata hai</text><text x="85" y="112" text-anchor="middle" class="svg-muted" font-size="12">serial + data</text>
<polygon points="260,56 340,98 260,140 180,98" fill="#fde68a"/><text x="260" y="95" text-anchor="middle" class="svg-ink" font-size="12">Serial device</text><text x="260" y="111" text-anchor="middle" class="svg-ink" font-size="12">table mein?</text>
<rect x="430" y="20" width="190" height="56" rx="8" fill="#bbf7d0"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">ADOM mein stored</text><text x="525" y="62" text-anchor="middle" class="svg-muted" font-size="12">searchable, reports mein</text>
<rect x="430" y="124" width="190" height="56" rx="8" fill="#fed7aa"/><text x="525" y="148" text-anchor="middle" class="svg-ink" font-size="13">Discard + count</text><text x="525" y="166" text-anchor="middle" class="svg-muted" font-size="12">unregistered list</text>
<line x1="150" y1="98" x2="180" y2="98" stroke="#64748b" stroke-width="2"/><line x1="340" y1="98" x2="385" y2="48" stroke="#64748b" stroke-width="2"/><line x1="385" y1="48" x2="430" y2="48" stroke="#64748b" stroke-width="2"/><line x1="340" y1="98" x2="385" y2="152" stroke="#64748b" stroke-width="2"/><line x1="385" y1="152" x2="430" y2="152" stroke="#64748b" stroke-width="2"/>
<text x="372" y="40" class="svg-accent" font-size="12">haan</text><text x="372" y="172" class="svg-accent" font-size="12">nahi</text>
</svg><p class="cap">FAZ-1 par registration check tay karta hai ki storage hoga ya discard.</p></div>

<div class="eg"><p><b>Worked example.</b> HQ-FGT 10:00 se connected hai. 10:10 par administrator use register karta hai. Un das minute mein usne 600 logs bheje. FAZ-1 ne sab 600 discard kiye aur unregistered list mein ginti rakhi. 10:10 se logs store hote hain. 10:05 ki search kuch nahi dikhati, aur koi setting wo logs wapas nahi laa sakti. Sirf FortiGate ki log memory mein kuch bache ho sakte hain, agar kismat achhi ho.</p></div>

<h3>Device delete karna</h3>
<p>Device-table row delete karo to FortiGate, agar abhi bhi logs bhej raha hai, turant phir unregistered ho jata hai. Pehle se stored logs rehte hain. Aage ke module ka retirement procedure isi par based hai.</p>

<div class="warn"><p><b>Common mistakes.</b> "Connection: Allow" ko "mere logs safe hain" padh lena. Device register karke registration se pehle ke logs search karna. Wahi serial do baar register karne ki koshish (doosri baar already registered kehkar refuse hoti hai). Aisa ADOM type karna jo exist nahi karta; simulator batata hai ki ADOM exist nahi karta. Unregistered list ko FortiGate command mein dhoondhna: wo FortiAnalyzer par hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Unregistered matlab connected par device table mein nahi. Unregistered device ke logs discard hote hain, queue nahi hote. Registration serial number se hoti hai. Ek serial sirf ek row mein ho sakta hai. Registration real product mein GUI action hai; <code>execute fazui</code> sirf simulator mein hai.</p></div>

<div class="scn"><h4>Teen hafte kuch nahi</h4><p>Naya FortiAnalyzer install hua aur teen FortiGates ko uski taraf point kiya gaya. Sabne maan liya logs aa rahe hain. Teen hafte baad ek analyst ne Log View kholi to wo khaali thi. Unregistered list mein teeno devices bade discarded counters ke saath dikhe. Registration ke baad logs aane lage, par pehle teen hafte gaye.</p><p><b>Lesson:</b> FortiGate configure karne ke baad usi din FortiAnalyzer side bhi dekho; connected ka matlab stored nahi.</p></div>

<div class="iv"><p class="q">"FortiGate par Connection Allow hai par Log View khaali hai. Kya check karoge?"</p><p>test-connectivity mein Registration aur FAZ-1 par unregistered list dekhta hoon. Unregistered device ke logs discard hote hain. Main register karta hoon, traffic generate karta hoon, aur diagnose log device se confirm karta hoon ki counters ek ADOM ke neeche badh rahe hain. Ye bhi samjhata hoon ki pehle ke logs wapas nahi aate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connected aur registered alag cheezein hain; sirf registered devices ke logs store hote hain.</li>
<li>Unregistered device ke logs discard aur count hote hain, queue nahi.</li>
<li>Registration serial number ko ADOM mein device table mein daalti hai (ADOMs off ho to root).</li>
<li>Registration se pehle bheje logs hamesha ke liye gaye.</li>
<li><code>diagnose log device</code> aur <code>diagnose device list</code> registration aur counters dikhate hain.</li>
</ul></div>
`}};export{e as default};