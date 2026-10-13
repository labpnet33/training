var e={id:`lab-connect-register`,h:{en:`Labs fa-connect and fa-register: send the logs, then register the devices`,hi:`Labs fa-connect aur fa-register: logs bhejo, phir devices register karo`},body:{en:`
<p>Two short labs, one story. In the first you make a FortiGate send logs and discover that sending is not the same as storing. In the second you fix that on the FortiAnalyzer. Do them in this order, with this chapter next to you. We explain the goal, the approach and what to look for; the exact commands are in the lab, and you should type them yourself.</p>

<h3>Lab fa-connect: send the logs of a FortiGate to the FortiAnalyzer</h3>
<p><b>Goal.</b> Kaveri Retail has a new FortiAnalyzer, FAZ-1 at 192.0.2.6. The security team wants the logs of HQ-FGT (192.0.2.11) on it. Four tasks: configure the logging, read the Registration line, find the OFTP port, and see what FAZ-1 does with logs from a device it does not know.</p>
<p><b>Approach, task by task.</b></p>
<ol>
<li><b>Configure logging on HQ-FGT.</b> You need only two settings in <code>config log fortianalyzer setting</code>: the status and the server. Everything else keeps its default. Before you start, run <code>show log fortianalyzer setting</code>. It is empty, because nothing differs from the defaults yet. The task is complete when the connection comes up, so do not stop at "end" without an error; check the next step.</li>
<li><b>Run test-connectivity.</b> The task asks what the Registration line says. Read the two key lines together.</li>
</ol>
<pre class="out">HQ-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: FAZ-1
FortiAnalyzer Serial: FAZ-VMEVYXM9SG00
<span class="hl">FortiAnalyzer Registration: unregistered</span>
<span class="hl">Connection: Allow</span></pre>
<ol start="3">
<li><b>Find the port.</b> The answer is in <code>diagnose test application miglogd 6</code>, in the server field. Read the mode too: it says udp, because reliable is off.</li>
<li><b>Generate traffic and look at FAZ-1.</b> Open sessions from PC-HQ with <code>curl 192.0.2.80</code> (three times). Then on FAZ-1 run <code>execute fazui unregistered list</code>. The one-word answer is in the heading of the list and in the counter.</li>
</ol>
<pre class="out">FAZ-1 # execute fazui unregistered list
Unregistered devices (connected through OFTP/514, logs are discarded until they are registered):
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
HQ-FGT          FGVMEV1RGF38I000    192.0.2.11      <span class="hl">8</span>               2026-10-12 20:44:03</pre>
<p><b>Why 8 and not 3?</b> Each web session writes a traffic log, but the configuration changes you made on HQ-FGT also wrote event logs. Your own commands become logs. In the lab you may see another number; what matters is that it is greater than zero and rises when you create traffic.</p>
<p><b>Common wrong turns.</b></p>
<ul>
<li>Enabling the status but typing the server address wrongly. Always read the Connection line after <code>end</code>.</li>
<li>Expecting Log View to show something at this stage. Nothing is stored yet.</li>
<li>Reading "Allow" as "all good". It is the first half of the answer.</li>
</ul>

<h3>Lab fa-register: register the FortiGates so that their logs are stored</h3>
<p><b>Goal.</b> HQ-FGT and MDU-FGT already log to FAZ-1, but the analyst sees nothing in Log View. Register both in the ADOM root and prove it with new traffic.</p>
<p><b>Approach, task by task.</b></p>
<ol>
<li><b>Count the unregistered devices.</b> Run the list command on FAZ-1. The answer is a number; count the rows. You will see both devices, with discarded counters at zero because no traffic has flowed yet.</li>
</ol>
<pre class="out">FAZ-1 # execute fazui unregistered list
Unregistered devices (connected through OFTP/514, logs are discarded until they are registered):
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
HQ-FGT          FGVMEV1RGF38I000    192.0.2.11      0               -
MDU-FGT         FGVMEV1JOS6TJ000    192.0.2.12      0               -</pre>
<ol start="2">
<li><b>Register both in root.</b> The command form is <code>execute fazui register &lt;device&gt; &lt;adom&gt;</code>. Run it once per device. Read the answer: it tells you how many earlier logs were discarded. This is the only moment you see that number.</li>
<li><b>Generate traffic from PC-HQ and PC-MDU.</b> Twice each is enough. Then run <code>execute fazui logview root HQ-FGT traffic</code> and the same for MDU-FGT. Each must show matching logs. If one shows zero, check the next steps below.</li>
</ol>
<pre class="out">FAZ-1 # diagnose log device
Device          SN                  ADOM      Traffic  UTM    Event  Rejected  Last log
HQ-FGT          FGVMEV1RGF38I000    root      4        0      0      0         2026-10-12 21:32:43
MDU-FGT         FGVMEV1JOS6TJ000    root      4        0      0      0         2026-10-12 21:32:43</pre>
<p>Notice the ADOM column now says root, not (unreg), and the word discarded is gone. The unregistered list is empty: <code>There are no unregistered devices.</code></p>
<ol start="4">
<li><b>Were the earlier logs stored or lost?</b> One word. Look at the line printed when you registered. The logs that arrived before registration were lost, and no setting recovers them.</li>
</ol>
<p><b>Common wrong turns.</b></p>
<ul>
<li>Searching Log View before generating new traffic. Only logs received after registration exist.</li>
<li>Typing a wrong device name. Use the name shown in the unregistered list.</li>
<li>Registering and forgetting the second device. Check the list is empty at the end.</li>
<li>Searching the wrong device: use the name of the FortiGate whose PC you used.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> After registration, <code>diagnose log device</code> shows HQ-FGT with Traffic 4. You created two web requests from PC-HQ. Why four? In these labs the simulated firewall writes two traffic logs for every curl (three requests gave a traffic count of 6 in fa-connect). Use the counter to confirm that the number rises when you generate more traffic, not to predict an exact count.</p></div>

<div class="warn"><p><b>Honest boundaries.</b> <code>execute fazui unregistered list</code>, <code>register</code> and <code>logview</code> are simulator commands for GUI actions. The traffic logs carry 84 sent bytes each. If you save and restore the lab, stored logs are gone and you must generate traffic again; the registration stays.</p></div>

<div class="exam"><p><b>Exam traps.</b> OFTP port 514. Registration comes from the FortiAnalyzer side; the FortiGate setting alone never stores a log. Logs received before registration are lost.</p></div>

<div class="scn"><h4>The analyst who saw nothing</h4><p>An analyst opened Log View on a new FortiAnalyzer and found it empty although the network team swore that logging was configured. Test-connectivity on the FortiGate said Allow. The unregistered list on FAZ-1 held the device with a large discarded counter. A single register action fixed future logs; the old ones were gone.</p><p><b>Lesson:</b> check both sides every time you bring a new device online.</p></div>

<div class="iv"><p class="q">"Walk me through bringing a new FortiGate's logs into a FortiAnalyzer."</p><p>Enable logging on the FortiGate with the server address, check test-connectivity for Connection and Registration, register the device on the FortiAnalyzer by serial number, generate traffic and confirm in Log View and the device counters. Mention that logs before registration are lost.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>fa-connect: two settings bring the connection up; Registration stays unregistered.</li>
<li>Logs from an unregistered device are discarded and counted; the answer word is discarded.</li>
<li>fa-register: one register command per device into root; logs after that are stored.</li>
<li>Logs that arrived before registration are lost.</li>
<li>Verify with the unregistered list, diagnose log device and Log View.</li>
</ul></div>
`,hi:`
<p>Do chhote labs, ek kahani. Pehle mein aap FortiGate se logs bhijwate ho aur dekhte ho ki bhejna aur store karna ek cheez nahi. Doosre mein aap FortiAnalyzer par use theek karte ho. Inhe isi order mein karo, ye chapter paas rakhkar. Hum goal, approach aur kya dekhna hai samjhate hain; exact commands lab mein hain, aur unhe khud type karo.</p>

<h3>Lab fa-connect: FortiGate ke logs FortiAnalyzer ko bhejo</h3>
<p><b>Goal.</b> Kaveri Retail ke paas naya FortiAnalyzer hai, FAZ-1 192.0.2.6 par. Security team ko HQ-FGT (192.0.2.11) ke logs us par chahiye. Chaar tasks: logging configure karo, Registration line padho, OFTP port dhoondho, aur dekho ki FAZ-1 us device ke logs ka kya karta hai jise wo nahi jaanta.</p>
<p><b>Approach, task by task.</b></p>
<ol>
<li><b>HQ-FGT par logging configure karo.</b> <code>config log fortianalyzer setting</code> mein sirf do settings chahiye: status aur server. Baaki sab default rehta hai. Shuru karne se pehle <code>show log fortianalyzer setting</code> chalao. Wo khaali hai, kyunki abhi kuch default se alag nahi. Task tab poora hota hai jab connection up ho jaye, isliye bina error ke "end" par mat ruko; agla step check karo.</li>
<li><b>test-connectivity chalao.</b> Task poochta hai Registration line kya kehti hai. Dono key lines saath padho.</li>
</ol>
<pre class="out">HQ-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: FAZ-1
FortiAnalyzer Serial: FAZ-VMEVYXM9SG00
<span class="hl">FortiAnalyzer Registration: unregistered</span>
<span class="hl">Connection: Allow</span></pre>
<ol start="3">
<li><b>Port dhoondho.</b> Jawab <code>diagnose test application miglogd 6</code> mein server field mein hai. Mode bhi padho: udp kehta hai, kyunki reliable off hai.</li>
<li><b>Traffic generate karo aur FAZ-1 dekho.</b> PC-HQ se <code>curl 192.0.2.80</code> se sessions kholo (teen baar). Phir FAZ-1 par <code>execute fazui unregistered list</code> chalao. Ek shabd ka jawab list ke heading aur counter mein hai.</li>
</ol>
<pre class="out">FAZ-1 # execute fazui unregistered list
Unregistered devices (connected through OFTP/514, logs are discarded until they are registered):
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
HQ-FGT          FGVMEV1RGF38I000    192.0.2.11      <span class="hl">8</span>               2026-10-12 20:44:03</pre>
<p><b>3 nahi, 8 kyun?</b> Har web session ek traffic log likhta hai, par HQ-FGT par aapki configuration changes ne bhi event logs likhe. Aapki apni commands logs ban jati hain. Lab mein aapko doosra number dikh sakta hai; zaroori ye hai ki wo zero se zyada ho aur traffic banane par badhe.</p>
<p><b>Common wrong turns.</b></p>
<ul>
<li>Status enable karna par server address galat type karna. <code>end</code> ke baad hamesha Connection line padho.</li>
<li>Is stage par Log View se kuch dikhne ki ummeed karna. Abhi kuch store nahi hua.</li>
<li>"Allow" ko "sab theek" padhna. Wo jawab ka pehla aadha hissa hai.</li>
</ul>

<h3>Lab fa-register: FortiGates register karo taaki unke logs store hon</h3>
<p><b>Goal.</b> HQ-FGT aur MDU-FGT pehle se FAZ-1 ko logs bhejte hain, par analyst ko Log View mein kuch nahi dikhta. Dono ko ADOM root mein register karo aur naye traffic se saabit karo.</p>
<p><b>Approach, task by task.</b></p>
<ol>
<li><b>Unregistered devices ginti karo.</b> FAZ-1 par list command chalao. Jawab ek number hai; rows gino. Aapko dono devices dikhenge, discarded counters zero ke saath kyunki abhi traffic nahi chala.</li>
</ol>
<pre class="out">FAZ-1 # execute fazui unregistered list
Unregistered devices (connected through OFTP/514, logs are discarded until they are registered):
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
HQ-FGT          FGVMEV1RGF38I000    192.0.2.11      0               -
MDU-FGT         FGVMEV1JOS6TJ000    192.0.2.12      0               -</pre>
<ol start="2">
<li><b>Dono ko root mein register karo.</b> Command form hai <code>execute fazui register &lt;device&gt; &lt;adom&gt;</code>. Har device ke liye ek baar chalao. Jawab padho: wo batata hai pehle ke kitne logs discard hue. Yahi ek moment hai jab ye number dikhta hai.</li>
<li><b>PC-HQ aur PC-MDU se traffic generate karo.</b> Dono se do baar kaafi hai. Phir <code>execute fazui logview root HQ-FGT traffic</code> aur MDU-FGT ke liye wahi chalao. Har ek mein matching logs dikhne chahiye. Ek mein zero ho to neeche ke steps dekho.</li>
</ol>
<pre class="out">FAZ-1 # diagnose log device
Device          SN                  ADOM      Traffic  UTM    Event  Rejected  Last log
HQ-FGT          FGVMEV1RGF38I000    root      4        0      0      0         2026-10-12 21:32:43
MDU-FGT         FGVMEV1JOS6TJ000    root      4        0      0      0         2026-10-12 21:32:43</pre>
<p>Dhyan do, ADOM column ab root kehta hai, (unreg) nahi, aur discarded shabd chala gaya. Unregistered list khaali hai: <code>There are no unregistered devices.</code></p>
<ol start="4">
<li><b>Pehle ke logs stored the ya lost?</b> Ek shabd. Register karte waqt jo line print hui wo dekho. Registration se pehle aaye logs lost ho gaye, aur koi setting unhe wapas nahi laati.</li>
</ol>
<p><b>Common wrong turns.</b></p>
<ul>
<li>Naya traffic banane se pehle Log View search karna. Sirf registration ke baad receive hue logs exist karte hain.</li>
<li>Device ka naam galat type karna. Unregistered list mein dikhne wala naam use karo.</li>
<li>Register karke doosra device bhool jana. Ant mein list khaali hone ki jaanch karo.</li>
<li>Galat device search karna: us FortiGate ka naam use karo jiske PC se traffic bheja.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Registration ke baad <code>diagnose log device</code> HQ-FGT ke liye Traffic 4 dikhata hai. Aapne PC-HQ se do web requests banaye. Chaar kyun? In labs mein simulated firewall har curl par do traffic logs likhta hai (fa-connect mein teen requests par traffic count 6 tha). Counter se confirm karo ki aur traffic banane par number badhta hai, exact count predict karne ke liye nahi.</p></div>

<div class="warn"><p><b>Honest boundaries.</b> <code>execute fazui unregistered list</code>, <code>register</code> aur <code>logview</code> GUI actions ke liye simulator commands hain. Traffic logs mein har ek ke 84 sent bytes hain. Lab save aur restore karoge to stored logs chale jate hain aur traffic dobara generate karna padega; registration rehti hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> OFTP port 514. Registration FortiAnalyzer side se hoti hai; akeli FortiGate setting kabhi log store nahi karwati. Registration se pehle receive hue logs lost hain.</p></div>

<div class="scn"><h4>Analyst ko kuch nahi dikha</h4><p>Ek analyst ne naye FortiAnalyzer par Log View kholi to wo khaali thi, jabki network team kasam khati thi ki logging configure hai. FortiGate par test-connectivity Allow keh raha tha. FAZ-1 ki unregistered list mein device bade discarded counter ke saath tha. Ek register action ne aage ke logs theek kiye; purane gaye.</p><p><b>Lesson:</b> naya device online lao to har baar dono sides check karo.</p></div>

<div class="iv"><p class="q">"Mujhe batao naye FortiGate ke logs FortiAnalyzer mein kaise laate hain."</p><p>FortiGate par server address ke saath logging enable karo, test-connectivity mein Connection aur Registration check karo, FortiAnalyzer par device ko serial number se register karo, traffic generate karo aur Log View aur device counters mein confirm karo. Batao ki registration se pehle ke logs lost hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>fa-connect: do settings connection up kar dete hain; Registration unregistered rehti hai.</li>
<li>Unregistered device ke logs discard aur count hote hain; jawab ka shabd discarded hai.</li>
<li>fa-register: har device ke liye root mein ek register command; uske baad logs store hote hain.</li>
<li>Registration se pehle aaye logs lost hain.</li>
<li>Unregistered list, diagnose log device aur Log View se verify karo.</li>
</ul></div>
`}};export{e as default};