var e={id:`operating`,h:{en:`Operating it: schedules, exit codes, pipelines and the incident workflow`,hi:`Ise chalana: schedules, exit codes, pipelines aur incident workflow`},body:{en:`
<p>A toolkit that only works while its author is sitting at it is a demo. Operating a tool means: it runs on a schedule without you, it tells the right person when something is wrong, someone else can fix it, and the way it fails is documented. This chapter covers the four things that turn the chain into something you can hand over.</p>

<h3>1. A schedule that checks, not one that changes</h3>
<p>Run <code>verify</code> every night. Do not run <code>apply</code> every night: a change needs a human decision, a change window and a plan that someone read. The verify run is read-only, so it is safe to run unattended.</p>
<pre class="out">AUTO01$ echo "15 2 * * * cd /home/netadmin/mvtoolkit &amp;&amp; python3 mvtool.py verify &gt;&gt; logs/verify.log 2&gt;&amp;1" | crontab -
AUTO01$ crontab -l
15 2 * * * cd /home/netadmin/mvtoolkit &amp;&amp; python3 mvtool.py verify &gt;&gt; logs/verify.log 2&gt;&amp;1</pre>
<p>Three details make this line work. <code>cd</code> first: cron starts in the home folder, and the toolkit looks for <code>.env</code>, <code>schema/</code> and <code>templates/</code> relative to the project. Absolute paths: cron has an almost empty environment and no <code>PATH</code> you can rely on. <code>&gt;&gt; ... 2&gt;&amp;1</code>: output and errors both go to a file you can read in the morning, because there is no terminal to print to.</p>

<h3>2. The exit code is the alarm</h3>
<p>The toolkit speaks to machines through exit codes: 0 means everything is as intended, 1 means a person must look. <code>verify</code> exits 1 on drift, <code>gate</code> exits 1 when blocked, <code>apply</code> exits 1 when any device failed or rolled back. A scheduler, a mail rule or a pipeline needs nothing else. If the toolkit printed "ERROR" and exited 0, no automation could notice. The reports (<code>reports/gate.json</code>, <code>reports/verify.json</code>) add the detail for the person who looks.</p>

<h3>3. A pipeline in the same words</h3>
<p>The stages of the chain map one to one onto a pipeline in any CI system. You met pipelines in <code>auto-cicd</code>; this is a design sketch and not a lab step.</p>
<pre class="code">stage 1 (every commit)   python3 -m pytest -q
                         python3 mvtool.py intent &amp;&amp; python3 mvtool.py render &amp;&amp; python3 mvtool.py gate
stage 2 (on request)     python3 mvtool.py plan             # the diff is the review artifact
stage 3 (manual approval) python3 mvtool.py apply
stage 4 (after, and nightly) python3 mvtool.py verify</pre>
<p>Stage 1 needs no network access to the devices, so it can run on every commit by anybody. Stage 2 needs a runner that can reach the devices and a read-only account if you have one. Stage 3 waits for a person. Stage 4 closes the loop. The gate sits between a change in NetBox or in the templates and the first device: that is the whole point.</p>

<h3>4. The incident workflow</h3>
<p>When the exit code is 1, the person on call does the same six things every time. The order matters, because the early steps are read-only.</p>
<ol>
<li><b>Read the log and the report.</b> <code>tail logs/mvtool.log</code>, <code>cat reports/verify.json</code>. Which action, which device, which message?</li>
<li><b>Place it in the chain.</b> Scope (inventory), data (intent), text (render), gate, change, read-back. The message usually names the stage.</li>
<li><b>Reproduce with a read-only command.</b> <code>inventory</code>, <code>intent</code>, <code>plan</code>, <code>verify</code> change nothing. Never start with <code>apply</code>.</li>
<li><b>Fix the cause, not the symptom.</b> If NetBox is wrong, fix NetBox; if a check never fires, fix the check and add a test.</li>
<li><b>Prove it with a clean run</b> and an exit code of 0.</li>
<li><b>Write it down</b> in the handover note: what, why, how it was found.</li>
</ol>
<table class="cmp">
<tr><th>Symptom</th><th>First read-only command</th><th>Stage</th></tr>
<tr><td>Fewer devices than expected</td><td>inventory</td><td>Scope: filter, tag, site</td></tr>
<tr><td>Strange value in a diff</td><td>intent, then cat the JSON</td><td>Data or schema</td></tr>
<tr><td>Typo in a candidate</td><td>gate</td><td>Text or Batfish</td></tr>
<tr><td>Device failed with a merge error</td><td>plan, then read the message</td><td>Change</td></tr>
<tr><td>Success in the log, wrong on the device</td><td>verify, after a wait</td><td>Read-back or timer</td></tr>
</table>

<div class="warn"><p><b>Do not apply to investigate.</b> Under pressure, the quickest-looking move is to run the whole chain again. If the problem is a timer or a stale scope, a second apply says "already compliant" and hides it. Use the read-only commands to see; use apply only to repair a cause you understand.</p></div>

<div class="scn"><h4>"Everything is green"</h4><p>A handover note said: "finished, tested, everything is green; nothing to do except keep it running." The new owner ran the documented command and it printed success. A week later a branch router had no NTP. The branch had never been in scope, because its NetBox record lacked a tag, and a tool that handles zero devices is also green. The note did not say how many devices the tool should find.</p><p><b>Lesson:</b> a handover note names the numbers: how many devices, which exit code, which files prove it. "Green" without a count is not evidence.</p></div>

<div class="iv"><p class="q">"What do you hand over with a tool?"</p><p>The commands for each stage and what a normal run prints, including counts such as "2 hosts in scope". Where secrets live and how to rotate them. What the exit codes mean and who receives the alarm. The read-only commands for an investigation and the one rule: never apply to find out. A short list of known limits, such as "merge does not remove lines".</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Schedule verify, not apply; apply needs a human decision.</li>
<li>Cron needs <code>cd</code>, absolute paths and a log redirect.</li>
<li>Exit codes are the alarm: 0 as intended, 1 a person must look.</li>
<li>CI stages mirror the chain: tests and gate on every commit, plan as artifact, approved apply, verify.</li>
<li>Incident workflow: read, place in the chain, reproduce read-only, fix the cause, prove, write down.</li>
</ul></div>
`,hi:`
<p>Jo toolkit tabhi chalti hai jab author uske saamne baitha ho woh demo hai. Tool ko operate karne ka matlab: woh bina aapke schedule par chalta hai, kuch galat ho to sahi insaan ko batata hai, koi aur use theek kar sakta hai, aur woh kaise fail hota hai yeh documented hai. Yeh chapter un chaar cheezon ko cover karta hai jo chain ko aisa bana deti hain jo aap hand over kar sako.</p>

<h3>1. Schedule jo check kare, badle nahi</h3>
<p>Har raat <code>verify</code> chalao. Har raat <code>apply</code> mat chalao: change ke liye insaan ka faisla, change window aur kisi ka padha hua plan chahiye. Verify read-only hai, isliye bina dekhe chalana safe hai.</p>
<pre class="out">AUTO01$ echo "15 2 * * * cd /home/netadmin/mvtoolkit &amp;&amp; python3 mvtool.py verify &gt;&gt; logs/verify.log 2&gt;&amp;1" | crontab -
AUTO01$ crontab -l
15 2 * * * cd /home/netadmin/mvtoolkit &amp;&amp; python3 mvtool.py verify &gt;&gt; logs/verify.log 2&gt;&amp;1</pre>
<p>Teen details is line ko chalati hain. Pehle <code>cd</code>: cron home folder mein start hota hai, aur toolkit <code>.env</code>, <code>schema/</code> aur <code>templates/</code> ko project ke relative dhoondhti hai. Absolute paths: cron ka environment lagbhag khali hota hai aur uske <code>PATH</code> par bharosa nahi. <code>&gt;&gt; ... 2&gt;&amp;1</code>: output aur errors dono file mein jaate hain jo aap subah padh sako, kyunki print karne ke liye terminal nahi hai.</p>

<h3>2. Exit code hi alarm hai</h3>
<p>Toolkit machines se exit codes ke zariye baat karti hai: 0 matlab sab intent ke hisaab se, 1 matlab insaan dekhe. <code>verify</code> drift par 1 deta hai, <code>gate</code> blocked hone par 1, <code>apply</code> kisi device ke fail ya rollback hone par 1. Scheduler, mail rule ya pipeline ko aur kuch nahi chahiye. Toolkit "ERROR" print karke 0 deti to koi automation notice nahi kar sakta. Reports (<code>reports/gate.json</code>, <code>reports/verify.json</code>) dekhne wale insaan ke liye detail jodte hain.</p>

<h3>3. Wahi shabdon mein pipeline</h3>
<p>Chain ke stages kisi bhi CI system ke pipeline se ek ek karke mel khaate hain. Aap <code>auto-cicd</code> mein pipelines mil chuke ho; yeh design sketch hai, lab step nahi.</p>
<pre class="code">stage 1 (har commit)    python3 -m pytest -q
                         python3 mvtool.py intent &amp;&amp; python3 mvtool.py render &amp;&amp; python3 mvtool.py gate
stage 2 (maangne par)    python3 mvtool.py plan             # diff hi review artifact hai
stage 3 (manual approval) python3 mvtool.py apply
stage 4 (baad mein, aur nightly) python3 mvtool.py verify</pre>
<p>Stage 1 ko devices ka network access nahi chahiye, isliye woh har commit par koi bhi chala sakta hai. Stage 2 ko aisa runner chahiye jo devices tak pahunche aur ho sake to read-only account. Stage 3 insaan ka intezaar karta hai. Stage 4 loop band karta hai. Gate NetBox ya templates ke change aur pehle device ke beech baithta hai: yahi poora point hai.</p>

<h3>4. Incident workflow</h3>
<p>Exit code 1 aaye to on-call insaan har baar wahi chhe kaam karta hai. Kram matter karta hai, kyunki shuru ke steps read-only hain.</p>
<ol>
<li><b>Log aur report padho.</b> <code>tail logs/mvtool.log</code>, <code>cat reports/verify.json</code>. Kaunsa action, kaunsa device, kaunsa message?</li>
<li><b>Chain mein jagah dhoondho.</b> Scope (inventory), data (intent), text (render), gate, change, read-back. Message aksar stage ka naam leta hai.</li>
<li><b>Read-only command se reproduce karo.</b> <code>inventory</code>, <code>intent</code>, <code>plan</code>, <code>verify</code> kuch nahi badalte. <code>apply</code> se kabhi shuru mat karo.</li>
<li><b>Wajah theek karo, lakshan nahi.</b> NetBox galat hai to NetBox theek karo; check kabhi fire nahi hota to check theek karo aur test jodo.</li>
<li><b>Saaf run se saabit karo</b> aur exit code 0 lao.</li>
<li><b>Likh do</b> handover note mein: kya, kyon, kaise mila.</li>
</ol>
<table class="cmp">
<tr><th>Lakshan</th><th>Pehla read-only command</th><th>Stage</th></tr>
<tr><td>Umeed se kam devices</td><td>inventory</td><td>Scope: filter, tag, site</td></tr>
<tr><td>Diff mein ajeeb value</td><td>intent, phir JSON cat karo</td><td>Data ya schema</td></tr>
<tr><td>Candidate mein typo</td><td>gate</td><td>Text ya Batfish</td></tr>
<tr><td>Device merge error ke saath fail</td><td>plan, phir message padho</td><td>Change</td></tr>
<tr><td>Log mein success, device par galat</td><td>verify, thodi der ruk kar</td><td>Read-back ya timer</td></tr>
</table>

<div class="warn"><p><b>Investigate karne ke liye apply mat karo.</b> Dabav mein sabse tez dikhne wali chaal poori chain dobara chalana hai. Problem timer ya purana scope ho to doosra apply "already compliant" kehta hai aur use chhupa deta hai. Dekhne ke liye read-only commands use karo; apply sirf us wajah ki repair ke liye jo aap samajh chuke ho.</p></div>

<div class="scn"><h4>"Sab green hai"</h4><p>Ek handover note mein likha tha: "finished, tested, sab green hai; sirf chalate rehna hai." Naye owner ne documented command chalayi aur success print hua. Ek hafte baad ek branch router par NTP nahi tha. Woh branch kabhi scope mein thi hi nahi, kyunki uske NetBox record par tag nahi tha, aur jo tool zero devices handle karta hai woh bhi green dikhta hai. Note ne nahi bataya ki tool ko kitne devices milne chahiye.</p><p><b>Lesson:</b> handover note numbers batata hai: kitne devices, kaunsa exit code, kaunsi files saboot hain. Ginti ke bina "green" evidence nahi hai.</p></div>

<div class="iv"><p class="q">"Tool ke saath kya hand over karte ho?"</p><p>Har stage ke commands aur normal run kya print karti hai, "2 hosts in scope" jaisi ginti ke saath. Secrets kahan rehte hain aur rotate kaise hote hain. Exit codes ka matlab aur alarm kisko jata hai. Investigation ke read-only commands aur ek rule: pata karne ke liye kabhi apply nahi. Known limits ki chhoti list, jaise "merge lines nahi hatata".</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Verify schedule karo, apply nahi; apply ko insaan ka faisla chahiye.</li>
<li>Cron ko <code>cd</code>, absolute paths aur log redirect chahiye.</li>
<li>Exit codes alarm hain: 0 intent ke hisaab se, 1 insaan dekhe.</li>
<li>CI stages chain ko dohraate hain: har commit par tests aur gate, plan artifact, approved apply, verify.</li>
<li>Incident workflow: padho, chain mein jagah, read-only reproduce, wajah theek, saabit, likh do.</li>
</ul></div>
`}};export{e as default};