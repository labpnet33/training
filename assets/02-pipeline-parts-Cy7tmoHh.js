var e={id:`pipeline-parts`,h:{en:`Pipeline, stage, job, script: the four building blocks`,hi:`Pipeline, stage, job, script: chaar building blocks`},body:{en:`

<p><b>One idea in this chapter:</b> a pipeline is a short list of ordered steps. Learn four words and you can read any pipeline, in any tool.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="One pipeline, three stages in order, one job in each."><rect x="20" y="30" width="170" height="110" rx="12" fill="#bae6fd"/><text x="105" y="55" text-anchor="middle" class="svg-ink" font-size="14">Stage: validate</text><rect x="40" y="75" width="130" height="44" rx="8" fill="#ffffff" stroke="#64748b"/><text x="105" y="102" text-anchor="middle" class="svg-ink" font-size="13">job: lint</text><rect x="235" y="30" width="170" height="110" rx="12" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="14">Stage: test</text><rect x="255" y="75" width="130" height="44" rx="8" fill="#ffffff" stroke="#64748b"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">job: unit-test</text><rect x="450" y="30" width="170" height="110" rx="12" fill="#bbf7d0"/><text x="535" y="55" text-anchor="middle" class="svg-ink" font-size="14">Stage: deploy</text><rect x="470" y="75" width="130" height="44" rx="8" fill="#ffffff" stroke="#64748b"/><text x="535" y="102" text-anchor="middle" class="svg-ink" font-size="13">job: push-vlans</text><line x1="190" y1="85" x2="235" y2="85" stroke="#64748b" stroke-width="2"/><polygon points="229,80 235,85 229,90" fill="#64748b"/><line x1="405" y1="85" x2="450" y2="85" stroke="#64748b" stroke-width="2"/><polygon points="444,80 450,85 444,90" fill="#64748b"/><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">stages run in order; if one fails, the rest are skipped</text></svg><p class="cap">One pipeline, three stages in order, one job in each.</p></div>

<h3>The four words</h3>
<ul><li><b>Pipeline</b>: one complete run of all the checks for one commit. It ends green (passed) or red (failed). Every push creates a new pipeline with a number such as #101.</li><li><b>Stage</b>: a step of the pipeline, such as <code>validate</code>, <code>test</code> or <code>deploy</code>. Stages run <b>in order</b>: the next stage starts only if the previous one passed.</li><li><b>Job</b>: a named piece of work inside a stage, such as <code>lint</code> or <code>unit-test</code>. Several jobs in the same stage may run side by side.</li><li><b>Script</b>: the shell commands a job runs, one per line. If any command fails (returns an error), the job fails.</li></ul>
<p>Behind the scenes a machine called a <b>runner</b> picks up the job, fetches the exact commit, and runs the script. In the lab log you will see the line <code>Running with nk-runner 17.x on shell executor</code>: that is the runner announcing itself. A "shell executor" simply means it types the script commands in a shell, like you would.</p>

<h3>Order matters: fail fast</h3>
<p>Put cheap, quick checks first and expensive or risky steps last. <b>Fail fast</b> means a mistake should stop the pipeline as early as possible.</p>
<table class="cmp"><tr><th>Stage</th><th>Job</th><th>Question it answers</th><th>Cost</th></tr><tr><td>validate</td><td>lint</td><td>Is the file well-formed YAML?</td><td>a second</td></tr><tr><td>test</td><td>unit-test</td><td>Is the data valid, for example VLAN ids in range?</td><td>seconds</td></tr><tr><td>deploy</td><td>push-vlans</td><td>Apply it to the switch</td><td>touches production</td></tr></table>
<p>When a stage fails, the remaining stages are marked <b>skipped</b>. They did not run, they are not the problem. A broken file therefore never reaches a switch. This is shown on the real lab host when lint fails:</p>
<pre class="out">Pipeline #101 failed on main (7d546f7)
  validate   lint               <span class="hl">failed</span>
  test       unit-test          <span class="hl">skipped</span>
  deploy     push-vlans         <span class="hl">skipped</span></pre>
<p>Always look for the <b>first</b> failed job. The skipped ones below it say nothing about their own scripts.</p>

<h3>Running a pipeline locally: ci run</h3>
<p>On the lab host you can try the pipeline on your files before you push. The command <code>ci run</code> builds the current working tree. It needs a Git repository, so on a bare folder it tells you:</p>
<pre class="code">ci run</pre>
<pre class="out">ci: run inside a git repository (git init) so the pipeline knows which commit it builds</pre>
<p>After <code>git init</code>, the same command runs the pipeline file in the folder. In Lab 1 the file is half-written: it has only the <code>validate</code> and <code>test</code> stages and no deploy job yet, so the local run shows two jobs:</p>
<pre class="code">git init
ci run</pre>
<pre class="out">Initialized empty Git repository in /home/netops/.git/

Pipeline #101 created for main (working)
  ✔ validate   lint               passed
  ✔ test       unit-test          passed
Pipeline #101 passed — see: ci log &lt;job&gt;</pre>
<p>The tick marks show passed jobs, a cross shows failed, a dash shows skipped. The hint at the end tells you the next command: <code>ci log JOBNAME</code> prints the full log of one job. The three <code>ci</code> commands are:</p>
<table class="cmp"><tr><th>Command</th><th>What it shows</th></tr><tr><td>ci status</td><td>every job of the latest pipeline and its result</td></tr><tr><td>ci log JOB</td><td>the full log of one job: its commands and their output</td></tr><tr><td>ci run</td><td>a pipeline run on your files right now, without pushing</td></tr></table>
<p>In real GitLab the same information is on the pipeline page of the website, and a "lint" of the pipeline file itself is available in the editor. Running the checks on your own laptop first is a good habit; the pipeline is the final gate, not the first time you see the error.</p>

<h3>Where does the pipeline get its instructions?</h3>
<p>From a file in the repository, so it is versioned like everything else. That is the next chapter. The pipeline definition lives with the code it checks: a change to the pipeline is itself a commit, reviewed like any other change.</p>

<div class="eg"><p><b>Worked example.</b> You push a change and the pipeline shows lint passed, unit-test failed, push-vlans skipped. The deploy job is not the problem. You open the log of unit-test, read the last lines, fix the data, and push again. Pipeline #2 passes all three stages.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Reading the skipped jobs as errors. Putting an expensive or risky job early in the order. Assuming that jobs in different stages run at the same time; they do not. Forgetting that one failing command is enough to fail the whole job.</p></div>
<div class="exam"><p><b>Exam trap.</b> A pipeline is made of stages; stages contain jobs; jobs run scripts. Stages run in sequence; jobs in the same stage can run in parallel. A failed stage causes later stages to be skipped.</p></div>

<div class="scn"><h4>Red at the first stage</h4><p>A new engineer pushed a change and saw a red pipeline. He opened the deploy job first, found "skipped", and thought the deploy was broken. A senior colleague showed him how to read it: the first failed stage was validate, the lint job, and the skipped deploy simply never started. The lint log pointed to one line of YAML. He fixed it in a minute.</p><p><b>Lesson:</b> start at the first red job and ignore the skipped ones.</p></div>
<div class="iv"><p class="q">"What is the difference between a pipeline, a stage and a job?"</p><p>A pipeline is one full run for a commit. It is divided into stages that run in order, such as validate, test and deploy. Each stage has one or more jobs, and a job is a named unit of work that runs a script on a runner. A failing job fails its stage and the remaining stages are skipped, which is how a bad change is stopped before deploy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Pipeline, stage, job and script form the hierarchy; a runner executes the scripts.</li><li>Stages run in order; a failure skips the later stages.</li><li>Fail fast: put cheap checks first and deploy last.</li><li>ci status, ci log JOB and ci run are the lab commands; start at the first failed job.</li><li>The pipeline is described in a file in the repository.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> pipeline ordered steps ki ek chhoti list hai. Chaar words seekho aur aap kisi bhi tool ki koi bhi pipeline padh sakte ho.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Ek pipeline, order mein teen stages, har ek mein ek job."><rect x="20" y="30" width="170" height="110" rx="12" fill="#bae6fd"/><text x="105" y="55" text-anchor="middle" class="svg-ink" font-size="14">Stage: validate</text><rect x="40" y="75" width="130" height="44" rx="8" fill="#ffffff" stroke="#64748b"/><text x="105" y="102" text-anchor="middle" class="svg-ink" font-size="13">job: lint</text><rect x="235" y="30" width="170" height="110" rx="12" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="14">Stage: test</text><rect x="255" y="75" width="130" height="44" rx="8" fill="#ffffff" stroke="#64748b"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">job: unit-test</text><rect x="450" y="30" width="170" height="110" rx="12" fill="#bbf7d0"/><text x="535" y="55" text-anchor="middle" class="svg-ink" font-size="14">Stage: deploy</text><rect x="470" y="75" width="130" height="44" rx="8" fill="#ffffff" stroke="#64748b"/><text x="535" y="102" text-anchor="middle" class="svg-ink" font-size="13">job: push-vlans</text><line x1="190" y1="85" x2="235" y2="85" stroke="#64748b" stroke-width="2"/><polygon points="229,80 235,85 229,90" fill="#64748b"/><line x1="405" y1="85" x2="450" y2="85" stroke="#64748b" stroke-width="2"/><polygon points="444,80 450,85 444,90" fill="#64748b"/><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">stages order mein chalte hain; ek fail ho to baaki skip ho jaate hain</text></svg><p class="cap">One pipeline, three stages in order, one job in each.</p></div>

<h3>Chaar words</h3>
<ul><li><b>Pipeline</b>: ek commit ke liye saare checks ka ek poora run. Ya green (passed) ya red (failed). Har push ek nayi pipeline banata hai, number ke saath jaise #101.</li><li><b>Stage</b>: pipeline ka ek step, jaise <code>validate</code>, <code>test</code> ya <code>deploy</code>. Stages <b>order mein</b> chalte hain: agla stage tabhi shuru hota hai jab pichhla pass ho.</li><li><b>Job</b>: stage ke andar ek naam wala kaam, jaise <code>lint</code> ya <code>unit-test</code>. Ek hi stage ke kai jobs saath-saath chal sakte hain.</li><li><b>Script</b>: job jo shell commands chalata hai, har line ek. Agar koi bhi command fail ho (error de), to job fail.</li></ul>
<p>Peeche ek machine jise <b>runner</b> kehte hain job uthati hai, exact commit fetch karti hai, aur script chalati hai. Lab log mein aapko line milegi <code>Running with nk-runner 17.x on shell executor</code>: yeh runner khud ko announce kar raha hai. "Shell executor" ka matlab woh script ke commands shell mein type karta hai, jaise aap karte.</p>

<h3>Order matter karta hai: fail fast</h3>
<p>Sasti, tez checks pehle rakho aur mehengi ya risky steps aakhir mein. <b>Fail fast</b> ka matlab galti ko jitna jaldi ho sake pipeline rok de.</p>
<table class="cmp"><tr><th>Stage</th><th>Job</th><th>Kaun sa sawaal</th><th>Cost</th></tr><tr><td>validate</td><td>lint</td><td>File sahi YAML hai?</td><td>ek second</td></tr><tr><td>test</td><td>unit-test</td><td>Data valid hai, jaise VLAN ids range mein?</td><td>seconds</td></tr><tr><td>deploy</td><td>push-vlans</td><td>Switch par apply karo</td><td>production ko chhoota hai</td></tr></table>
<p>Jab ek stage fail hota hai, baaki stages <b>skipped</b> mark hote hain. Woh chale nahi, woh problem nahi hain. Isliye toota hua file kabhi switch tak nahi pahunchta. Lint fail hone par asli lab host par yeh aisa dikhta hai:</p>
<pre class="out">Pipeline #101 failed on main (7d546f7)
  validate   lint               <span class="hl">failed</span>
  test       unit-test          <span class="hl">skipped</span>
  deploy     push-vlans         <span class="hl">skipped</span></pre>
<p>Hamesha <b>pehla</b> failed job dhoondo. Uske neeche ke skipped jobs apni scripts ke baare mein kuch nahi kehte.</p>

<h3>Local mein pipeline chalana: ci run</h3>
<p>Lab host par aap push karne se pehle apni files par pipeline try kar sakte ho. <code>ci run</code> command current working tree build karta hai. Use Git repository chahiye, isliye bare folder par woh batata hai:</p>
<pre class="code">ci run</pre>
<pre class="out">ci: run inside a git repository (git init) so the pipeline knows which commit it builds</pre>
<p><code>git init</code> ke baad wahi command folder ki pipeline file chalata hai. Lab 1 mein file aadhi likhi hai: usme sirf <code>validate</code> aur <code>test</code> stages hain aur abhi koi deploy job nahi, isliye local run do jobs dikhata hai:</p>
<pre class="code">git init
ci run</pre>
<pre class="out">Initialized empty Git repository in /home/netops/.git/

Pipeline #101 created for main (working)
  ✔ validate   lint               passed
  ✔ test       unit-test          passed
Pipeline #101 passed — see: ci log &lt;job&gt;</pre>
<p>Tick marks passed jobs dikhate hain, cross failed, dash skipped. Aakhir ka hint agla command batata hai: <code>ci log JOBNAME</code> ek job ka poora log print karta hai. Teen <code>ci</code> commands:</p>
<table class="cmp"><tr><th>Command</th><th>Kya dikhata hai</th></tr><tr><td>ci status</td><td>latest pipeline ka har job aur uska result</td></tr><tr><td>ci log JOB</td><td>ek job ka poora log: uske commands aur unka output</td></tr><tr><td>ci run</td><td>abhi aapki files par pipeline run, bina push kiye</td></tr></table>
<p>Asli GitLab mein wahi jaankari website ke pipeline page par hoti hai, aur pipeline file ka khud ka "lint" editor mein milta hai. Pehle apne laptop par checks chalana achhi aadat hai; pipeline aakhri gate hai, error pehli baar dekhne ki jagah nahi.</p>

<h3>Pipeline ko instructions kahan se milte hain?</h3>
<p>Repository ki ek file se, isliye woh baaki sab ki tarah versioned hai. Yeh agla chapter hai. Pipeline definition us code ke saath rehti hai jise woh check karti hai: pipeline ka change khud ek commit hai, jo baaki changes ki tarah review hota hai.</p>

<div class="eg"><p><b>Worked example.</b> Aap change push karte ho aur pipeline dikhati hai lint passed, unit-test failed, push-vlans skipped. Deploy job problem nahi hai. Aap unit-test ka log kholte ho, aakhri lines padhte ho, data theek karte ho, aur dobara push karte ho. Pipeline #2 teeno stages pass karti hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Skipped jobs ko errors samajhna. Mehenga ya risky job order mein pehle rakhna. Yeh maanna ki alag stages ke jobs ek saath chalte hain; nahi chalte. Yeh bhoolna ki ek failing command poore job ko fail karne ke liye kaafi hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pipeline stages se bani hai; stages mein jobs hote hain; jobs scripts chalate hain. Stages sequence mein chalte hain; ek hi stage ke jobs parallel chal sakte hain. Failed stage ki wajah se baad ke stages skip hote hain.</p></div>

<div class="scn"><h4>Pehle stage par red</h4><p>Ek naye engineer ne change push kiya aur red pipeline dekhi. Usne pehle deploy job kholi, "skipped" dekha, aur socha deploy toota hai. Senior colleague ne padhna sikhaya: pehla failed stage validate tha, lint job, aur skipped deploy kabhi shuru hi nahi hua. Lint log ne YAML ki ek line ki taraf ishaara kiya. Usne ek minute mein theek kar di.</p><p><b>Lesson:</b> pehle red job se shuru karo aur skipped ones ko ignore karo.</p></div>
<div class="iv"><p class="q">"Pipeline, stage aur job mein kya difference hai?"</p><p>Pipeline ek commit ke liye ek poora run hai. Woh stages mein bati hoti hai jo order mein chalte hain, jaise validate, test aur deploy. Har stage mein ek ya zyada jobs hote hain, aur job ek naam wali kaam ki unit hai jo runner par script chalati hai. Failing job apne stage ko fail karta hai aur baaki stages skip ho jaate hain, isi tarah kharab change deploy se pehle rukta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Pipeline, stage, job aur script hierarchy banate hain; runner scripts chalata hai.</li><li>Stages order mein chalte hain; failure baad ke stages ko skip karwata hai.</li><li>Fail fast: sasti checks pehle, deploy aakhir mein.</li><li>ci status, ci log JOB aur ci run lab commands hain; pehle failed job se shuru karo.</li><li>Pipeline repository ki ek file mein describe hoti hai.</li></ul></div>

`}};export{e as default};