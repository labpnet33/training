var e={id:`pipeline-controls`,h:{en:`Pipeline controls: manual, allow_failure, before_script`,hi:`Pipeline controls: manual, allow_failure, before_script`},body:{en:`

<p><b>One idea in this chapter:</b> a few keywords change how a job behaves. The most useful for network work are three: <code>when: manual</code> (a human presses the button), <code>allow_failure</code> (a red job that does not block) and <code>before_script</code> (setup commands before every job).</p>

<h3>A small pipeline that uses all three</h3>
<p>This file was built in the lab with <code>echo</code> commands. Read it first, then see what the pipeline does with it:</p>
<pre class="code">stages:
  - validate
  - deploy
before_script:
  - echo preparing
lint:
  stage: validate
  allow_failure: true
  script:
    - exit 1
push:
  stage: deploy
  when: manual
  script:
    - python3 deploy.py</pre>
<ul>
<li><code>before_script</code> at the top level runs before the script of <b>every</b> job. Here it only prints a word. In real life it might activate a Python environment or print tool versions.</li>
<li><code>allow_failure: true</code> on lint means: if this job fails, do not stop the pipeline. The script is <code>exit 1</code>, which always fails, so we can watch the effect.</li>
<li><code>when: manual</code> on push means the job does not start by itself. A person has to start it.</li>
</ul>
<pre class="code">ci run</pre>
<pre class="out">Pipeline #103 created for main (working)
  <span class="hl">!</span> validate   lint               <span class="hl">warning</span>
  <span class="hl">–</span> deploy     push               <span class="hl">manual</span>
Pipeline #103 passed — see: ci log &lt;job&gt;</pre>
<p>Three results to learn:</p>
<table class="cmp"><tr><th>Status</th><th>Meaning</th><th>Does the pipeline continue?</th></tr><tr><td>passed</td><td>the script ended without error</td><td>yes</td></tr><tr><td>failed</td><td>the script ended with an error</td><td>no, later stages are skipped</td></tr><tr><td>warning</td><td>failed, but allow_failure is set</td><td>yes</td></tr><tr><td>manual</td><td>waiting for a person to start it</td><td>pipeline shows passed; the job has not run</td></tr></table>

<h3>Reading the logs</h3>
<pre class="code">ci log lint</pre>
<pre class="out">Job "lint" (warning)
Running with nk-runner 17.x on shell executor
$ git checkout working
$ <span class="hl">echo preparing</span>
preparing
$ exit 1
ERROR: Job failed: command "exit 1" exited with a non-zero status</pre>
<p>The line <code>echo preparing</code> came from <code>before_script</code>, which ran first. The job failed, but its status is "warning" and the pipeline carried on. The manual job has no log, because it never ran:</p>
<pre class="code">ci log push</pre>
<pre class="out">Job "push" (manual)
(no log: manual)</pre>

<h3>Which jobs should be manual?</h3>
<p><b>Manual</b> jobs are the "are you sure?" button. In network automation the typical choice is: lint and tests are automatic, and the deploy to production is manual. A senior colleague reads the results, checks the change window, and then starts the deploy. You keep the speed of automation and the safety of a human decision. A manual job is not a failure: the pipeline is reported as passed, but remember that the deploy has not happened. Do not close the change ticket until it has.</p>
<p><b>allow_failure</b> suits checks that are informative, not blocking: a style warning, a slow optional test, a new rule you are trying out. Use it with care. A real safety check must never be allowed to fail, otherwise the stage after it will run on bad data.</p>

<h3>A pipeline is triggered two ways</h3>
<table class="cmp"><tr><th>Trigger</th><th>Command</th><th>What it builds</th></tr><tr><td>Your own trial</td><td>ci run</td><td>the working folder, before you commit (pipeline says "(working)")</td></tr><tr><td>A real change</td><td>git push origin main</td><td>the pushed commit, with its commit id</td></tr></table>
<p>Both give the same style of output. After a push of the file above, the status looks like this:</p>
<pre class="code">ci status</pre>
<pre class="out">Pipeline #104 passed on main (ea90b84)
  validate   lint               warning
  deploy     push               manual</pre>
<p>Use <code>ci run</code> as many times as you like while editing. Push only when you are happy with the result.</p>

<h3>More controls in real GitLab</h3>
<p>Reference configuration (not run in the simulator) Real pipelines have many more keywords. You only need to know they exist and what problem each solves:</p>
<ul><li><code>rules</code> and <code>only</code>/<code>except</code>: run a job only on certain branches, tags or changed files.</li><li><code>environment</code>: names where a job deploys (test, production) and records the history.</li><li><code>needs</code>: let a job start as soon as the jobs it depends on finish, instead of waiting for the whole stage.</li><li><code>artifacts</code>: keep files produced by a job, such as a test report or a config backup.</li><li><code>variables</code>: values passed into the job; used for non-secret settings and, in masked form, for secrets (next chapter).</li><li>Merge request pipelines: run the checks on a proposed change before it is merged.</li></ul>

<div class="eg"><p><b>Worked example.</b> You want pushes to run lint and the test automatically, but the production deploy to wait for approval. You set when: manual on the deploy job. After the push the pipeline shows validate passed, test passed and push-vlans manual. You review, start the job, and the log shows "deployed 3 VLANs". The change ticket is closed only after show vlan brief confirms it.</p></div>
<div class="warn"><p><b>Common beginner mistakes.</b> Putting allow_failure on a safety check. Closing a ticket because the pipeline is "passed" while the deploy job is still manual. Forgetting that before_script runs for every job, so a slow setup command makes the whole pipeline slow.</p></div>
<div class="exam"><p><b>Exam trap.</b> when: manual needs a human to start the job. allow_failure: true lets the pipeline continue after a failure and shows a warning. before_script runs before each job script. Pipeline status "passed" can still hide a manual job that has not run.</p></div>

<div class="scn"><h4>The manual gate</h4><p>A retail chain moved deploys to a manual job after a Friday-evening mistake. Pushes still ran lint and tests automatically, but nobody could reach production until the duty engineer started the job. The next bad change, a wrong VLAN, was caught by the test, and the one after it was held back by the engineer because of a freeze window. Nobody missed the old speed.</p><p><b>Lesson:</b> a manual deploy keeps automation for checks and a human for the risky step.</p></div>
<div class="iv"><p class="q">"What is a manual job and when would you use it?"</p><p>A manual job waits until a person starts it, using when: manual. I use it for risky steps such as production deploys: the automatic stages prove the change is valid, then a human confirms the timing and the scope. The pipeline does not count a manual job as failed, so I track that the deploy still has to happen.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>when: manual makes a person start the job.</li><li>allow_failure: true turns a failure into a warning and lets the pipeline continue.</li><li>before_script runs before the script of every job.</li><li>ci run tries the working folder; git push builds the pushed commit.</li><li>rules, environment, needs and artifacts exist in real GitLab (reference).</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> kuch keywords job ka behaviour badal dete hain. Network kaam ke liye teen sabse kaam ke hain: <code>when: manual</code> (insaan button dabata hai), <code>allow_failure</code> (red job jo rokta nahi) aur <code>before_script</code> (har job se pehle setup commands).</p>

<h3>Ek chhoti pipeline jo teeno use karti hai</h3>
<p>Yeh file lab mein <code>echo</code> commands se banayi gayi thi. Pehle padho, phir dekho pipeline iske saath kya karti hai:</p>
<pre class="code">stages:
  - validate
  - deploy
before_script:
  - echo preparing
lint:
  stage: validate
  allow_failure: true
  script:
    - exit 1
push:
  stage: deploy
  when: manual
  script:
    - python3 deploy.py</pre>
<ul>
<li>Top-level <code>before_script</code> <b>har</b> job ki script se pehle chalta hai. Yahan yeh bas ek word print karta hai. Asli zindagi mein yeh Python environment activate kar sakta hai ya tool versions print kar sakta hai.</li>
<li>lint par <code>allow_failure: true</code> ka matlab: agar yeh job fail ho, to pipeline mat roko. Script <code>exit 1</code> hai, jo hamesha fail hoti hai, taaki hum asar dekh sakein.</li>
<li>push par <code>when: manual</code> ka matlab job apne aap shuru nahi hota. Kisi insaan ko shuru karna padta hai.</li>
</ul>
<pre class="code">ci run</pre>
<pre class="out">Pipeline #103 created for main (working)
  <span class="hl">!</span> validate   lint               <span class="hl">warning</span>
  <span class="hl">–</span> deploy     push               <span class="hl">manual</span>
Pipeline #103 passed — see: ci log &lt;job&gt;</pre>
<p>Seekhne ke liye teen results:</p>
<table class="cmp"><tr><th>Status</th><th>Matlab</th><th>Kya pipeline aage badhti hai?</th></tr><tr><td>passed</td><td>script bina error ke khatam hui</td><td>haan</td></tr><tr><td>failed</td><td>script error ke saath khatam hui</td><td>nahi, baad ke stages skipped</td></tr><tr><td>warning</td><td>fail hui, par allow_failure set hai</td><td>haan</td></tr><tr><td>manual</td><td>insaan ke start karne ka intezaar</td><td>pipeline passed dikhati hai; job chala nahi</td></tr></table>

<h3>Logs padhna</h3>
<pre class="code">ci log lint</pre>
<pre class="out">Job "lint" (warning)
Running with nk-runner 17.x on shell executor
$ git checkout working
$ <span class="hl">echo preparing</span>
preparing
$ exit 1
ERROR: Job failed: command "exit 1" exited with a non-zero status</pre>
<p>Line <code>echo preparing</code> <code>before_script</code> se aayi, jo pehle chala. Job fail hua, par uska status "warning" hai aur pipeline aage badhi. Manual job ka koi log nahi, kyunki woh chala hi nahi:</p>
<pre class="code">ci log push</pre>
<pre class="out">Job "push" (manual)
(no log: manual)</pre>

<h3>Kaun se jobs manual hone chahiye?</h3>
<p><b>Manual</b> jobs "kya aap sure ho?" button hain. Network automation mein typical choice: lint aur tests automatic, aur production deploy manual. Senior colleague results padhta hai, change window dekhta hai, phir deploy start karta hai. Aapko automation ki speed bhi milti hai aur insaani faisle ki safety bhi. Manual job failure nahi hai: pipeline passed report hoti hai, par yaad rakho ki deploy hua nahi. Jab tak hua nahi, change ticket band mat karo.</p>
<p><b>allow_failure</b> un checks ke liye theek hai jo jaankari dete hain, rokte nahi: style warning, dheema optional test, ya naya rule jo aap try kar rahe ho. Dhyan se use karo. Asli safety check ko kabhi fail hone ki ijazat nahi honi chahiye, warna agla stage kharab data par chalega.</p>

<h3>Pipeline do tarah se trigger hoti hai</h3>
<table class="cmp"><tr><th>Trigger</th><th>Command</th><th>Kya banata hai</th></tr><tr><td>Aapka apna trial</td><td>ci run</td><td>working folder, commit se pehle (pipeline "(working)" kehti hai)</td></tr><tr><td>Asli change</td><td>git push origin main</td><td>pushed commit, commit id ke saath</td></tr></table>
<p>Dono ek jaisa output dete hain. Upar ki file ke push ke baad status aisa dikhta hai:</p>
<pre class="code">ci status</pre>
<pre class="out">Pipeline #104 passed on main (ea90b84)
  validate   lint               warning
  deploy     push               manual</pre>
<p>Edit karte waqt <code>ci run</code> jitni baar chaho chalao. Result se khush hone par hi push karo.</p>

<h3>Asli GitLab mein aur controls</h3>
<p>Reference configuration (not run in the simulator) Asli pipelines mein bahut zyada keywords hote hain. Aapko bas yeh pata hona chahiye ki woh hain aur har ek kaun si samasya hal karta hai:</p>
<ul><li><code>rules</code> aur <code>only</code>/<code>except</code>: job sirf kuch branches, tags ya badli hui files par chalao.</li><li><code>environment</code>: batata hai job kahan deploy karta hai (test, production) aur history record karta hai.</li><li><code>needs</code>: job ko tabhi shuru hone do jab uski dependency wale jobs khatam ho jayein, poore stage ka intezaar kiye bina.</li><li><code>artifacts</code>: job ki banayi files rakho, jaise test report ya config backup.</li><li><code>variables</code>: job ko di jaane wali values; non-secret settings ke liye aur, masked roop mein, secrets ke liye (agla chapter).</li><li>Merge request pipelines: change merge hone se pehle checks chalao.</li></ul>

<div class="eg"><p><b>Worked example.</b> Aap chahte ho ki push par lint aur test apne aap chalein, par production deploy approval ka intezaar kare. Aap deploy job par when: manual lagate ho. Push ke baad pipeline validate passed, test passed aur push-vlans manual dikhati hai. Aap review karke job start karte ho, aur log "deployed 3 VLANs" dikhata hai. Change ticket tabhi band hota hai jab show vlan brief confirm kare.</p></div>
<div class="warn"><p><b>Common beginner mistakes.</b> Safety check par allow_failure lagana. Pipeline "passed" dekhkar ticket band kar dena jabki deploy job abhi manual hai. Yeh bhool jaana ki before_script har job ke liye chalta hai, to dheema setup command poori pipeline dheemi kar deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> when: manual ke liye insaan job start karta hai. allow_failure: true failure ke baad pipeline ko jaari rakhta hai aur warning dikhata hai. before_script har job script se pehle chalta hai. Pipeline status "passed" ek aise manual job ko chhupa sakta hai jo chala nahi.</p></div>

<div class="scn"><h4>Manual gate</h4><p>Ek retail chain ne Friday shaam ki galti ke baad deploys ko manual job bana diya. Push par lint aur tests tab bhi apne aap chalte the, par jab tak duty engineer job start na kare koi production tak nahi pahunch sakta tha. Agla kharab change, galat VLAN, test ne pakda, aur uske baad wala freeze window ki wajah se engineer ne rok diya. Purani speed kisi ne miss nahi ki.</p><p><b>Lesson:</b> manual deploy checks ke liye automation aur risky step ke liye insaan rakhta hai.</p></div>
<div class="iv"><p class="q">"Manual job kya hai aur kab use karoge?"</p><p>Manual job tab tak ruka rehta hai jab tak koi insaan use start na kare, when: manual se. Main ise production deploy jaise risky steps ke liye use karta hoon: automatic stages saabit karte hain ki change valid hai, phir insaan timing aur scope confirm karta hai. Pipeline manual job ko failed nahi maanti, isliye main track karta hoon ki deploy abhi hona baaki hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>when: manual mein insaan job start karta hai.</li><li>allow_failure: true failure ko warning bana deta hai aur pipeline ko jaari rakhta hai.</li><li>before_script har job ki script se pehle chalta hai.</li><li>ci run working folder try karta hai; git push pushed commit banata hai.</li><li>rules, environment, needs aur artifacts asli GitLab mein hain (reference).</li></ul></div>

`}};export{e as default};