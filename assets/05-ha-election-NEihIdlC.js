var e={id:`ha-election`,h:{en:`The primary election: the order, the age and the margin`,hi:`Primary election: order, age aur margin`},body:{en:`
<p>A cricket team needs a captain for today's match. The selectors ask four questions in a fixed order: who is fully fit, who has been in the squad longest, who has the higher rank, and, if everything is equal, who has the higher shirt number. The first question that gives a clear winner ends the discussion. A FortiGate cluster elects its <b>primary</b> in exactly the same way. This chapter is the heart of the exam: learn the order, then practise it with numbers. It prepares lab <b>n7-ha-election</b>, tasks 3 and 4.</p>

<h3>The order without override</h3>
<ol>
<li><b>Failures.</b> The unit with fewer failures wins: down monitored interfaces plus remote-IP-monitoring failures. History text: <code>the value of link-failure + pingsvr-failure is less than peer member</code>.</li>
<li><b>HA age.</b> The unit that has been up and healthy longer wins, but only when the difference is larger than <code>ha-uptime-diff-margin</code> (default <b>300 s</b>). Text: <code>its uptime is larger than peer member</code>.</li>
<li><b>Priority.</b> The higher <code>priority</code> wins (default 128). Text: <code>its priority is larger than peer member</code>.</li>
<li><b>Serial number.</b> The higher serial wins. Text: <code>its serial number is larger than peer member</code>.</li>
</ol>
<p>With <code>override enable</code> (on either unit) the priority moves in front of the age: failures, then <b>priority</b> (<code>its override priority is larger than peer member</code>), then age, then serial. A lone unit says <code>it is the only member in the cluster</code>.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Election order">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">override disable (default)</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">override enable</text>
<rect x="40" y="35" width="240" height="38" rx="8" fill="#fed7aa"/><text x="160" y="59" text-anchor="middle" class="svg-ink" font-size="13">1. fewer failures</text>
<rect x="40" y="83" width="240" height="38" rx="8" fill="#bae6fd"/><text x="160" y="107" text-anchor="middle" class="svg-ink" font-size="13">2. HA age (diff over 300 s)</text>
<rect x="40" y="131" width="240" height="38" rx="8" fill="#bbf7d0"/><text x="160" y="155" text-anchor="middle" class="svg-ink" font-size="13">3. priority</text>
<rect x="40" y="179" width="240" height="38" rx="8" fill="#ddd6fe"/><text x="160" y="203" text-anchor="middle" class="svg-ink" font-size="13">4. serial, higher wins</text>
<rect x="360" y="35" width="240" height="38" rx="8" fill="#fed7aa"/><text x="480" y="59" text-anchor="middle" class="svg-ink" font-size="13">1. fewer failures</text>
<rect x="360" y="83" width="240" height="38" rx="8" fill="#bbf7d0"/><text x="480" y="107" text-anchor="middle" class="svg-ink" font-size="13">2. priority</text>
<rect x="360" y="131" width="240" height="38" rx="8" fill="#bae6fd"/><text x="480" y="155" text-anchor="middle" class="svg-ink" font-size="13">3. HA age</text>
<rect x="360" y="179" width="240" height="38" rx="8" fill="#ddd6fe"/><text x="480" y="203" text-anchor="middle" class="svg-ink" font-size="13">4. serial, higher wins</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Override only swaps age and priority. Failures always come first.</text>
</svg><p class="cap">The first criterion that differs decides; the rest are never looked at.</p></div>

<h3>What is the HA age?</h3>
<p>The age is how long a unit has been running healthy in the cluster. It starts when HA starts or the unit boots. It is <b>reset to zero</b> when a monitored interface goes down, when remote link monitoring fails, with <code>diagnose sys ha reset-uptime</code>, and by <code>execute ha failover set</code>. Age is the reason a repaired old primary does not take its role back: while it was broken its age was reset, so the healthy peer is now "older". The 300-second margin avoids elections caused by tiny differences, for example two units booted a few seconds apart: if the ages differ by 300 s or less, the age is ignored and the next rule (priority) decides.</p>

<h3>Worked examples (FGT-A priority 200, FGT-B priority 100)</h3>
<div class="eg"><p><b>Example 1: normal boot.</b> Both units start together. FGT-A age 17 s, FGT-B age 15 s. Failures 0/0. The difference is 2 s, which is below 300 s, so age is skipped. Priority 200 beats 100: <b>FGT-A is primary</b> ("its priority is larger").</p></div>
<div class="eg"><p><b>Example 2: failure, then repair.</b> After one hour the cable on FGT-A:port1 is pulled. FGT-A has 1 failure, FGT-B has 0: <b>FGT-B wins on failures</b>, and FGT-A's age resets to 0. You re-plug the cable 10 minutes later: FGT-A age 600 s, FGT-B age 4200 s. Failures are 0/0. Difference 3600 s is larger than 300 s, so the older unit wins: <b>FGT-B stays primary</b>. Priority 200 never gets a vote.</p></div>
<div class="eg"><p><b>Example 3: ages inside the margin.</b> Suppose FGT-B was rebooted recently, so FGT-A age is 3500 s and FGT-B age is 3700 s... in this case FGT-B is older by only 200 s. That is below 300 s, so age is ignored, priority 200 beats 100, and FGT-A is primary. Compare with example 2, where the difference of 3600 s decided the election.</p></div>
<div class="eg"><p><b>Example 4: override on both.</b> Same as example 2, but <code>override enable</code> on both units. After repair the failures are 0/0, and now the priority is next: 200 beats 100, so <b>FGT-A takes the role back</b> at once, whatever the ages ("its override priority is larger").</p></div>
<div class="eg"><p><b>Example 5: everything equal.</b> Both units have priority 128, no failures, ages within the margin. The serials decide: FGVMEV1NU41WS000 (FGT-A) against FGVMEV1OO2UZP000 (FGT-B). The characters are compared from the left; the first seven are equal (FGVMEV1), then <code>N</code> against <code>O</code>. O is higher, so <b>FGT-B</b> wins ("its serial number is larger").</p></div>

<h3>Reading the evidence</h3>
<p>The election history is the first command in any "why is that unit primary?" ticket. The newest line is on top.</p>
<pre class="out">FGT-A # diagnose sys ha history read
&lt;2026/10/04 21:13:31&gt; vcluster-1: <span class="hl">FGVMEV1OO2UZP000 is selected as the primary because the value of link-failure + pingsvr-failure is less than peer member FGVMEV1NU41WS000.</span>
&lt;2026/10/04 21:13:31&gt; remote link monitoring failed, HA uptime of FGVMEV1NU41WS000 is reset
&lt;2026/10/04 21:13:31&gt; ping server 198.51.100.1 of port1 is not reachable
&lt;2026/10/04 21:13:00&gt; vcluster-1: FGVMEV1NU41WS000 is selected as the primary because its priority is larger than peer member FGVMEV1OO2UZP000.</pre>
<p>Read it bottom to top as a story: at 21:13:00 FGT-A became primary by priority; at 21:13:31 its ping server became unreachable, its age was reset, and FGT-B won on failures. The second command shows the live counters behind that decision.</p>
<pre class="out">FGT-A # diagnose sys ha dump-by vcluster
HA information
vcluster_nr=1
vcluster_0: start_time=1791147499(2026-10-04 20:58:19), state/o_state=work/work, <span class="hl">ha_prio/o_ha_prio=0/0</span>, <span class="hl">link_failure=0, pingsvr_failure=0</span>, flag=0x00000001, mem_failover=0, <span class="hl">uptime/reset_cnt=17/1</span>
  'FGVMEV1NU41WS000': ha_prio/o_ha_prio=0/0
  'FGVMEV1OO2UZP000': ha_prio/o_ha_prio=1/1</pre>
<p>Here <code>ha_prio</code> is the rank in the cluster, not the priority you typed: 0 is the primary, 1 the secondary. <code>link_failure</code> and <code>pingsvr_failure</code> are the first election criterion; <code>uptime</code> and <code>reset_cnt</code> are the age and how often it was reset; <code>state</code> <code>work</code> means the unit is active.</p>
<div class="note"><p>Honest scope: the real command prints more fields and the numbers move constantly. The lab prints the shape above, which is enough to answer "who is primary and why".</p></div>

<h3>Lab 2, tasks 3 and 4</h3>
<p>Task 3: with the uplink down and remote link monitoring on, read <code>diagnose sys ha history read</code> on FGT-B. The answer is the failures line and FGT-B is primary. Task 4: repair the uplink, then run <code>get system ha status</code>: FGT-B is still primary because of the age. Then enable <code>override</code> on <b>both</b> units to give the role back to FGT-A. Override is not synchronised.</p>

<div class="warn"><p><b>Common mistake.</b> Raising a unit's priority and expecting an immediate switch. Without override, priority only counts after failures and age, and a running cluster does not renegotiate on a priority change alone.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which criterion is compared first with override enabled?" Failures, not priority. Override swaps only age and priority. Also the margin is compared against the age <i>difference</i>, and the higher serial wins.</p></div>

<div class="scn"><h4>The pair that would not obey</h4><p>An engineer set priority 250 on the old primary and saw nothing happen for hours. The cluster was healthy, override was disabled, and the other unit had been up for 40 days. History showed the last election by failures and the secondary being older. The fix was a planned <code>execute ha failover set 1</code> window, or override with an override-wait-time.</p><p><b>Lesson:</b> priority alone does not move a healthy cluster; know the order before you touch it.</p></div>

<div class="iv"><p class="q">"How does a FortiGate cluster choose the primary?"</p><p>State the order: fewer failures, then HA age when the difference exceeds 300 seconds, then priority, then the higher serial number; with override, priority moves in front of age. Add one example, such as why a repaired unit does not preempt, and name <code>diagnose sys ha history read</code> as the proof.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order without override: failures, age (margin 300 s), priority, higher serial.</li>
<li>With override: failures, priority, age, serial.</li>
<li>Age is reset by interface or ping-server failure, reset-uptime and failover set.</li>
<li>A repaired old primary stays secondary unless override is on or ages are within the margin.</li>
<li>Use history read for the reason and dump-by vcluster for the live counters.</li>
</ul></div>
`,hi:`
<p>Aaj ke match ke liye cricket team ko captain chahiye. Selectors ek fixed order mein chaar sawal puchte hain: kaun poori tarah fit hai, kaun squad mein sabse lamba hai, kiska rank zyada hai, aur agar sab barabar ho to kiska shirt number bada hai. Jis pehle sawal se saaf winner mil jaye, wahin discussion khatam. FortiGate cluster apna <b>primary</b> bilkul isi tarah chunta hai. Yeh chapter exam ka dil hai: order seekho, phir numbers ke saath practice karo. Yeh lab <b>n7-ha-election</b>, tasks 3 aur 4 ki taiyari hai.</p>

<h3>Override ke bina order</h3>
<ol>
<li><b>Failures.</b> Kam failures wala unit jeetta hai: down monitored interfaces plus remote-IP-monitoring failures. History text: <code>the value of link-failure + pingsvr-failure is less than peer member</code>.</li>
<li><b>HA age.</b> Jo unit zyada der se up aur healthy hai woh jeetta hai, par sirf tab jab difference <code>ha-uptime-diff-margin</code> (default <b>300 s</b>) se bada ho. Text: <code>its uptime is larger than peer member</code>.</li>
<li><b>Priority.</b> Zyada <code>priority</code> jeetti hai (default 128). Text: <code>its priority is larger than peer member</code>.</li>
<li><b>Serial number.</b> Zyada serial jeetta hai. Text: <code>its serial number is larger than peer member</code>.</li>
</ol>
<p><code>override enable</code> ke saath (kisi bhi ek unit par) priority age se aage aa jaati hai: failures, phir <b>priority</b> (<code>its override priority is larger than peer member</code>), phir age, phir serial. Akela unit kehta hai <code>it is the only member in the cluster</code>.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Election order">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">override disable (default)</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">override enable</text>
<rect x="40" y="35" width="240" height="38" rx="8" fill="#fed7aa"/><text x="160" y="59" text-anchor="middle" class="svg-ink" font-size="13">1. kam failures</text>
<rect x="40" y="83" width="240" height="38" rx="8" fill="#bae6fd"/><text x="160" y="107" text-anchor="middle" class="svg-ink" font-size="13">2. HA age (diff 300 s se zyada)</text>
<rect x="40" y="131" width="240" height="38" rx="8" fill="#bbf7d0"/><text x="160" y="155" text-anchor="middle" class="svg-ink" font-size="13">3. priority</text>
<rect x="40" y="179" width="240" height="38" rx="8" fill="#ddd6fe"/><text x="160" y="203" text-anchor="middle" class="svg-ink" font-size="13">4. serial, zyada jeetta hai</text>
<rect x="360" y="35" width="240" height="38" rx="8" fill="#fed7aa"/><text x="480" y="59" text-anchor="middle" class="svg-ink" font-size="13">1. kam failures</text>
<rect x="360" y="83" width="240" height="38" rx="8" fill="#bbf7d0"/><text x="480" y="107" text-anchor="middle" class="svg-ink" font-size="13">2. priority</text>
<rect x="360" y="131" width="240" height="38" rx="8" fill="#bae6fd"/><text x="480" y="155" text-anchor="middle" class="svg-ink" font-size="13">3. HA age</text>
<rect x="360" y="179" width="240" height="38" rx="8" fill="#ddd6fe"/><text x="480" y="203" text-anchor="middle" class="svg-ink" font-size="13">4. serial, zyada jeetta hai</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Override sirf age aur priority swap karta hai. Failures hamesha pehle.</text>
</svg><p class="cap">Jo pehla criterion alag ho wahi decide karta hai; baaki dekhe hi nahi jaate.</p></div>

<h3>HA age kya hai?</h3>
<p>Age yeh hai ki unit cluster mein kitni der se healthy chal raha hai. Yeh tab shuru hoti hai jab HA start hota hai ya unit boot hota hai. Yeh <b>zero par reset</b> hoti hai jab monitored interface down ho, remote link monitoring fail ho, <code>diagnose sys ha reset-uptime</code> se, aur <code>execute ha failover set</code> se. Age ki wajah se hi repaired purana primary apna role wapas nahi leta: jab woh toota tha to uski age reset ho gayi, ab healthy peer "purana" hai. 300-second margin chhote differences se hone wali elections se bachata hai, jaise do units kuch second ke gap se boot hue: agar ages 300 s ya kam se alag hain to age ignore hoti hai aur agla rule (priority) decide karta hai.</p>

<h3>Worked examples (FGT-A priority 200, FGT-B priority 100)</h3>
<div class="eg"><p><b>Example 1: normal boot.</b> Dono units saath start hote hain. FGT-A age 17 s, FGT-B age 15 s. Failures 0/0. Difference 2 s hai, 300 s se kam, isliye age skip hoti hai. Priority 200 beats 100: <b>FGT-A primary hai</b> ("its priority is larger").</p></div>
<div class="eg"><p><b>Example 2: failure, phir repair.</b> Ek ghante baad FGT-A:port1 ki cable nikal gayi. FGT-A ke paas 1 failure, FGT-B ke paas 0: <b>FGT-B failures par jeetta hai</b>, aur FGT-A ki age 0 ho jaati hai. 10 minute baad cable wapas lagate ho: FGT-A age 600 s, FGT-B age 4200 s. Failures 0/0. Difference 3600 s, 300 s se bada, isliye purana unit jeetta hai: <b>FGT-B primary rehta hai</b>. Priority 200 ko vote hi nahi milta.</p></div>
<div class="eg"><p><b>Example 3: ages margin ke andar.</b> Maan lo FGT-B abhi reboot hua tha, isliye FGT-A age 3500 s aur FGT-B age 3700 s hai... is case mein FGT-B sirf 200 s purana hai. Yeh 300 s se kam hai, isliye age ignore hoti hai, priority 200 beats 100, aur FGT-A primary hai. Example 2 se compare karo, jahan 3600 s ke difference ne election decide kiya.</p></div>
<div class="eg"><p><b>Example 4: dono par override.</b> Example 2 jaisa, par dono units par <code>override enable</code>. Repair ke baad failures 0/0, ab priority agli hai: 200 beats 100, isliye <b>FGT-A role turant wapas le leta hai</b>, ages chahe kuch bhi hon ("its override priority is larger").</p></div>
<div class="eg"><p><b>Example 5: sab barabar.</b> Dono units ki priority 128, koi failure nahi, ages margin ke andar. Serials decide karte hain: FGVMEV1NU41WS000 (FGT-A) banam FGVMEV1OO2UZP000 (FGT-B). Characters left se compare hote hain; pehle saat (FGVMEV1) barabar hain, phir <code>N</code> banam <code>O</code>. O bada hai, isliye <b>FGT-B</b> jeetta hai ("its serial number is larger").</p></div>

<h3>Evidence padhna</h3>
<p>"Yeh unit primary kyun hai?" wale har ticket mein election history pehli command hai. Sabse nayi line upar hoti hai.</p>
<pre class="out">FGT-A # diagnose sys ha history read
&lt;2026/10/04 21:13:31&gt; vcluster-1: <span class="hl">FGVMEV1OO2UZP000 is selected as the primary because the value of link-failure + pingsvr-failure is less than peer member FGVMEV1NU41WS000.</span>
&lt;2026/10/04 21:13:31&gt; remote link monitoring failed, HA uptime of FGVMEV1NU41WS000 is reset
&lt;2026/10/04 21:13:31&gt; ping server 198.51.100.1 of port1 is not reachable
&lt;2026/10/04 21:13:00&gt; vcluster-1: FGVMEV1NU41WS000 is selected as the primary because its priority is larger than peer member FGVMEV1OO2UZP000.</pre>
<p>Ise neeche se upar ek kahani ki tarah padho: 21:13:00 par FGT-A priority se primary bana; 21:13:31 par uska ping server unreachable hua, uski age reset hui, aur FGT-B failures par jeet gaya. Doosri command us faisle ke peeche ke live counters dikhati hai.</p>
<pre class="out">FGT-A # diagnose sys ha dump-by vcluster
HA information
vcluster_nr=1
vcluster_0: start_time=1791147499(2026-10-04 20:58:19), state/o_state=work/work, <span class="hl">ha_prio/o_ha_prio=0/0</span>, <span class="hl">link_failure=0, pingsvr_failure=0</span>, flag=0x00000001, mem_failover=0, <span class="hl">uptime/reset_cnt=17/1</span>
  'FGVMEV1NU41WS000': ha_prio/o_ha_prio=0/0
  'FGVMEV1OO2UZP000': ha_prio/o_ha_prio=1/1</pre>
<p>Yahan <code>ha_prio</code> cluster mein rank hai, woh priority nahi jo aapne type ki: 0 primary hai, 1 secondary. <code>link_failure</code> aur <code>pingsvr_failure</code> pehla election criterion hain; <code>uptime</code> aur <code>reset_cnt</code> age hain aur kitni baar reset hui; <code>state</code> <code>work</code> ka matlab unit active hai.</p>
<div class="note"><p>Honest scope: real command mein aur fields hote hain aur numbers lagatar badalte hain. Lab upar wali shape print karti hai, jo "primary kaun hai aur kyun" ka jawab dene ke liye kaafi hai.</p></div>

<h3>Lab 2, tasks 3 aur 4</h3>
<p>Task 3: uplink down aur remote link monitoring on hone par FGT-B par <code>diagnose sys ha history read</code> padho. Jawab failures wali line hai aur FGT-B primary hai. Task 4: uplink repair karo, phir <code>get system ha status</code> chalao: age ki wajah se FGT-B abhi bhi primary hai. Phir role FGT-A ko wapas dene ke liye <b>dono</b> units par <code>override</code> enable karo. Override synchronise nahi hota.</p>

<div class="warn"><p><b>Common mistake.</b> Unit ki priority badhana aur turant switch ki ummeed karna. Override ke bina priority sirf failures aur age ke baad count hoti hai, aur running cluster sirf priority badalne par renegotiate nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Override enabled ho to pehle kaunsa criterion compare hota hai?" Failures, priority nahi. Override sirf age aur priority swap karta hai. Margin age ke <i>difference</i> se compare hota hai, aur zyada serial jeetta hai.</p></div>

<div class="scn"><h4>Jo pair maanta nahi tha</h4><p>Ek engineer ne purane primary par priority 250 set ki aur ghanton tak kuch nahi hua. Cluster healthy tha, override disabled tha, aur doosra unit 40 din se up tha. History mein aakhri election failures se dikha aur secondary purani thi. Fix tha planned <code>execute ha failover set 1</code> window, ya override ke saath override-wait-time.</p><p><b>Lesson:</b> sirf priority healthy cluster ko nahi hilati; haath lagane se pehle order jaano.</p></div>

<div class="iv"><p class="q">"FortiGate cluster primary kaise chunta hai?"</p><p>Order batao: kam failures, phir HA age jab difference 300 seconds se zyada ho, phir priority, phir zyada serial number; override ke saath priority age se aage aati hai. Ek example do, jaise repaired unit preempt kyun nahi karta, aur saboot ke liye <code>diagnose sys ha history read</code> ka naam lo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Override ke bina order: failures, age (margin 300 s), priority, zyada serial.</li>
<li>Override ke saath: failures, priority, age, serial.</li>
<li>Age interface ya ping-server failure, reset-uptime aur failover set se reset hoti hai.</li>
<li>Repaired purana primary secondary rehta hai jab tak override on na ho ya ages margin ke andar na hon.</li>
<li>Wajah ke liye history read, live counters ke liye dump-by vcluster use karo.</li>
</ul></div>
`}};export{e as default};