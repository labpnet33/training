var e={id:`summary`,h:{en:`Summary: checklist, cheat-sheet and glossary`,hi:`Summary: checklist, cheat-sheet aur glossary`},body:{en:`

<p><b>One idea in this chapter:</b> put it together. You can now take a change from a text file to a verified switch, with a safety net in between. This chapter is your review sheet.</p>

<h3>The story in five sentences</h3>
<ol>
<li>The network data lives in a file in Git (<code>vlans.yml</code>), and Git records every change.</li>
<li>A push creates a <b>pipeline</b>, defined in <code>.gitlab-ci.yml</code>.</li>
<li>The <b>validate</b> stage lints the file, the <b>test</b> stage checks the values, and only then does the <b>deploy</b> stage touch the device.</li>
<li>If any stage fails, the rest are skipped, and the log says what to fix.</li>
<li>You verify on the device, and the commit, pipeline and log are your audit trail.</li>
</ol>

<h3>Cheat-sheet: lab commands</h3>
<table class="cmp"><tr><th>Command</th><th>Purpose</th></tr><tr><td>nl FILE</td><td>show a file with line numbers</td></tr><tr><td>yamllint FILE</td><td>check YAML syntax</td></tr><tr><td>python3 check.py</td><td>run the unit test on the data</td></tr><tr><td>edit FILE N text</td><td>replace line N of a file</td></tr><tr><td>git init, git add ., git commit -m "..."</td><td>create the repository and save the first version</td></tr><tr><td>git push origin main</td><td>send the commit; this starts the pipeline</td></tr><tr><td>ci run</td><td>run the pipeline on the working folder before committing</td></tr><tr><td>ci status</td><td>result of the latest pipeline, job by job</td></tr><tr><td>ci log JOB</td><td>full log of one job</td></tr><tr><td>show vlan brief</td><td>verify the result on the switch</td></tr></table>

<h3>Cheat-sheet: pipeline file</h3>
<pre class="code">stages:
  - validate
  - test
  - deploy

lint:
  stage: validate
  script:
    - yamllint vlans.yml

unit-test:
  stage: test
  script:
    - python3 check.py

push-vlans:
  stage: deploy
  script:
    - python3 deploy.py</pre>
<p>Add <code>when: manual</code> to a job for a human gate, <code>allow_failure: true</code> for a non-blocking check, and <code>before_script</code> for setup lines.</p>

<h3>Pre-change checklist</h3>
<ul><li>The data file passes <code>yamllint</code> and <code>python3 check.py</code> on my laptop.</li><li>The pipeline file lists every stage that a job uses.</li><li>No secret is in any file I am about to commit.</li><li>The deploy job is manual for production, or I have approval.</li><li>I know how to verify on the device, and how to roll back with <code>git revert</code>.</li><li>The commit message says what and why.</li></ul>

<h3>Glossary</h3>
<dl class="terms"><dt>CI (continuous integration)</dt><dd>automatically checking every change as it arrives</dd><dt>CD (continuous delivery or deployment)</dt><dd>automatically moving a checked change toward the live network</dd><dt>Pipeline</dt><dd>one complete run of the stages for one commit</dd><dt>Stage</dt><dd>an ordered step; a failure skips the later ones</dd><dt>Job</dt><dd>a named unit of work in a stage</dd><dt>Script</dt><dd>the commands a job runs</dd><dt>Runner</dt><dd>the machine that executes jobs</dd><dt>Lint</dt><dd>a check of syntax and style</dd><dt>Unit test</dt><dd>a check of logic and values</dd><dt>Artifact</dt><dd>a file kept from a job (reference)</dd><dt>Masked variable</dt><dd>a CI variable hidden in logs (reference)</dd><dt>Source of truth</dt><dd>the one place the intended data lives</dd><dt>Rollback</dt><dd>returning to a previous good state, for example by git revert</dd></dl>

<h3>Where this fits: the bigger picture</h3>
<p><b>Infrastructure as code and GitOps.</b> Treating network configuration as files in a repository, changed through reviewed commits and applied by automation, is called infrastructure as code. When the repository is the only way to change the live system, teams call it GitOps. This module is a small, honest version of that idea.</p>
<p><b>Other tools.</b> Reference configuration (not run in the simulator) GitLab CI is one product. Jenkins describes a pipeline in a Jenkinsfile, GitHub Actions in workflow files, and cloud providers have their own services. The words differ a little (workflow, step, action), but pipeline, stage, job, script and the habits from this module carry over.</p>
<p><b>With Ansible.</b> In the Ansible module you wrote a playbook. A pipeline can run that playbook: a lint job runs <code>ansible-playbook --syntax-check</code>, a test job runs a <code>--check</code> dry run, and a manual deploy job runs the real play. The same stages, a different script.</p>

<h3>Lab recap</h3>
<table class="cmp"><tr><th>Lab</th><th>You did</th><th>Result</th></tr><tr><td>Lab 1: Store 7, Bhopal</td><td>completed .gitlab-ci.yml, pushed</td><td>pipeline #101 green; VLANs 10, 20, 30 on the switch</td></tr><tr><td>Lab 2: Store 14, Indore</td><td>fixed indentation, then VLAN 4100 to 40</td><td>pipelines #101 and #102 red, #103 green; VLAN 40 GUEST-WIFI on the switch</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Your manager asks: "Can we add VLAN 50 for printers in store 7 without anyone logging in to the switch?" You edit vlans.yml, run yamllint and python3 check.py, commit with a clear message, push, watch lint and unit-test go green, start the manual deploy, and confirm with show vlan brief. The answer is yes, and you can show the pipeline number as proof.</p></div>
<div class="warn"><p><b>Last reminders.</b> Never commit secrets. Do not trust green alone: verify on the device. Keep changes small. Keep the repository and the network in agreement.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the order and purpose of stages, the meaning of manual and allow_failure, where secrets belong, and what a failed stage does to later stages.</p></div>

<div class="scn"><h4>Nobody logs in</h4><p>A regional office asked for a new VLAN on a Monday morning. The engineer changed one file, pushed, and approved the manual deploy while the tests ran. By the time the coffee was ready, the VLAN was live and the pipeline link was in the change ticket. The auditor later asked who made the change; the commit answered in one line.</p><p><b>Lesson:</b> the same steps every time, with proof, is the real gain of automation.</p></div>
<div class="iv"><p class="q">"Summarise the CI/CD workflow for network changes."</p><p>Data is stored in Git. A push triggers a pipeline that lints, tests, and then deploys, with a manual gate for production. Failures stop the pipeline early and skip later stages. Secrets live in masked variables or a vault. I verify on the device, and I can roll back with a revert. The commits and logs give an audit trail.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Git file, push, pipeline, lint, test, deploy, verify: that is the workflow.</li><li>A failed stage skips the rest; read the first failed job.</li><li>Secrets are variables, not text in the repository.</li><li>Manual gates and pilots limit risk; git revert is the way back.</li><li>The same ideas apply in Jenkins, GitHub Actions and with Ansible.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> sab kuch jodo. Ab aap ek change ko text file se verified switch tak le ja sakte ho, beech mein safety net ke saath. Yeh chapter aapki review sheet hai.</p>

<h3>Paanch vakyon mein kahani</h3>
<ol>
<li>Network data Git ki ek file mein rehta hai (<code>vlans.yml</code>), aur Git har change record karta hai.</li>
<li>Push ek <b>pipeline</b> banata hai, jo <code>.gitlab-ci.yml</code> mein define hai.</li>
<li><b>validate</b> stage file lint karta hai, <b>test</b> stage values check karta hai, aur tabhi <b>deploy</b> stage device ko chhuta hai.</li>
<li>Agar koi stage fail ho, to baaki skipped hote hain, aur log batata hai kya fix karna hai.</li>
<li>Aap device par verify karte ho, aur commit, pipeline aur log aapka audit trail hain.</li>
</ol>

<h3>Cheat-sheet: lab commands</h3>
<table class="cmp"><tr><th>Command</th><th>Maqsad</th></tr><tr><td>nl FILE</td><td>file ko line numbers ke saath dikhao</td></tr><tr><td>yamllint FILE</td><td>YAML syntax check karo</td></tr><tr><td>python3 check.py</td><td>data par unit test chalao</td></tr><tr><td>edit FILE N text</td><td>file ki line N badlo</td></tr><tr><td>git init, git add ., git commit -m "..."</td><td>repository banao aur pehla version save karo</td></tr><tr><td>git push origin main</td><td>commit bhejo; isse pipeline shuru hoti hai</td></tr><tr><td>ci run</td><td>commit se pehle working folder par pipeline chalao</td></tr><tr><td>ci status</td><td>latest pipeline ka result, job by job</td></tr><tr><td>ci log JOB</td><td>ek job ka poora log</td></tr><tr><td>show vlan brief</td><td>switch par result verify karo</td></tr></table>

<h3>Cheat-sheet: pipeline file</h3>
<pre class="code">stages:
  - validate
  - test
  - deploy

lint:
  stage: validate
  script:
    - yamllint vlans.yml

unit-test:
  stage: test
  script:
    - python3 check.py

push-vlans:
  stage: deploy
  script:
    - python3 deploy.py</pre>
<p>Insaani gate ke liye job mein <code>when: manual</code>, non-blocking check ke liye <code>allow_failure: true</code>, aur setup lines ke liye <code>before_script</code> jodo.</p>

<h3>Change se pehle ki checklist</h3>
<ul><li>Data file mere laptop par <code>yamllint</code> aur <code>python3 check.py</code> pass karti hai.</li><li>Pipeline file mein har woh stage list hai jo koi job use karta hai.</li><li>Jo files main commit karne wala hoon unme koi secret nahi hai.</li><li>Production ke liye deploy job manual hai, ya mere paas approval hai.</li><li>Mujhe pata hai device par verify kaise karna hai, aur <code>git revert</code> se rollback kaise karna hai.</li><li>Commit message batata hai kya aur kyun.</li></ul>

<h3>Glossary</h3>
<dl class="terms"><dt>CI (continuous integration)</dt><dd>har aate hue change ko apne aap check karna</dd><dt>CD (continuous delivery ya deployment)</dt><dd>checked change ko apne aap live network ki taraf badhana</dd><dt>Pipeline</dt><dd>ek commit ke liye stages ka ek poora run</dd><dt>Stage</dt><dd>ek ordered step; failure baad ke stages skip kar deta hai</dd><dt>Job</dt><dd>stage mein ek named kaam ki ikai</dd><dt>Script</dt><dd>woh commands jo job chalata hai</dd><dt>Runner</dt><dd>woh machine jo jobs chalati hai</dd><dt>Lint</dt><dd>syntax aur style ka check</dd><dt>Unit test</dt><dd>logic aur values ka check</dd><dt>Artifact</dt><dd>job se rakhi gayi file (reference)</dd><dt>Masked variable</dt><dd>logs mein chhupa CI variable (reference)</dd><dt>Source of truth</dt><dd>woh ek jagah jahan iraada kiya data rehta hai</dd><dt>Rollback</dt><dd>pichhle achhe state par lautna, jaise git revert se</dd></dl>

<h3>Yeh kahan fit hota hai: bada picture</h3>
<p><b>Infrastructure as code aur GitOps.</b> Network configuration ko repository ki files ki tarah rakhna, reviewed commits se badalna aur automation se lagana infrastructure as code kehlata hai. Jab repository live system badalne ka akela raasta ho, to teams ise GitOps kehti hain. Yeh module us idea ka chhota, imaandaar roop hai.</p>
<p><b>Doosre tools.</b> Reference configuration (not run in the simulator) GitLab CI ek product hai. Jenkins pipeline Jenkinsfile mein describe karta hai, GitHub Actions workflow files mein, aur cloud providers ki apni services hain. Words thode alag hain (workflow, step, action), par pipeline, stage, job, script aur is module ki aadatein saath jaati hain.</p>
<p><b>Ansible ke saath.</b> Ansible module mein aapne playbook likhi. Pipeline woh playbook chala sakti hai: lint job <code>ansible-playbook --syntax-check</code> chalata hai, test job <code>--check</code> dry run chalata hai, aur manual deploy job asli play chalata hai. Wahi stages, alag script.</p>

<h3>Lab recap</h3>
<table class="cmp"><tr><th>Lab</th><th>Aapne kya kiya</th><th>Result</th></tr><tr><td>Lab 1: Store 7, Bhopal</td><td>.gitlab-ci.yml poori ki, push kiya</td><td>pipeline #101 green; switch par VLAN 10, 20, 30</td></tr><tr><td>Lab 2: Store 14, Indore</td><td>indentation fix ki, phir VLAN 4100 ko 40</td><td>pipelines #101 aur #102 red, #103 green; switch par VLAN 40 GUEST-WIFI</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Manager poochta hai: "Kya hum store 7 mein printers ke liye VLAN 50 bina kisi ke switch mein login kiye jod sakte hain?" Aap vlans.yml edit karte ho, yamllint aur python3 check.py chalate ho, saaf message se commit karte ho, push karte ho, lint aur unit-test green hote dekhte ho, manual deploy start karte ho, aur show vlan brief se confirm karte ho. Jawab haan hai, aur saboot ke roop mein pipeline number dikha sakte ho.</p></div>
<div class="warn"><p><b>Aakhri yaaddashtein.</b> Kabhi secrets commit mat karo. Sirf green par bharosa mat karo: device par verify karo. Changes chhote rakho. Repository aur network ko ek jaisa rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Stages ka order aur maqsad, manual aur allow_failure ka matlab, secrets kahan rehte hain, aur failed stage baad ke stages ke saath kya karta hai: yeh jaano.</p></div>

<div class="scn"><h4>Koi login nahi karta</h4><p>Ek regional office ne Monday subah naya VLAN maanga. Engineer ne ek file badli, push kiya, aur tests chalte waqt manual deploy approve kiya. Chai taiyaar hone tak VLAN live tha aur pipeline link change ticket mein tha. Auditor ne baad mein poochha ki change kisne kiya; commit ne ek line mein jawab diya.</p><p><b>Lesson:</b> har baar wahi steps, saboot ke saath, automation ka asli fayda hai.</p></div>
<div class="iv"><p class="q">"Network changes ke liye CI/CD workflow ka summary do."</p><p>Data Git mein rehta hai. Push ek pipeline trigger karta hai jo lint, test, phir deploy karti hai, production ke liye manual gate ke saath. Failures pipeline ko jaldi rok dete hain aur baad ke stages skip karte hain. Secrets masked variables ya vault mein rehte hain. Main device par verify karta hoon, aur revert se rollback kar sakta hoon. Commits aur logs audit trail dete hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Git file, push, pipeline, lint, test, deploy, verify: yahi workflow hai.</li><li>Failed stage baaki skip karta hai; pehla failed job padho.</li><li>Secrets variables hain, repository mein text nahi.</li><li>Manual gates aur pilots risk kam karte hain; git revert wapas jaane ka raasta hai.</li><li>Wahi ideas Jenkins, GitHub Actions aur Ansible ke saath bhi lagu hote hain.</li></ul></div>

`}};export{e as default};