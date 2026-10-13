var e={id:`cicd`,h:{en:`CI/CD pipelines: benefits, stages, artifacts and reading a pipeline file`,hi:`CI/CD pipelines: fayde, stages, artifacts aur pipeline file padhna`},body:{en:`
<p>A car factory has an assembly line. Parts come in at one end, each station does one job and inspects its work, and a finished, tested car leaves at the other end. If a station finds a defect, the line stops there and the car never reaches the showroom. A <b>CI/CD pipeline</b> is an assembly line for software. This chapter covers the concept level the exam expects (blueprint 4.2). You practise hands-on pipelines in the <code>auto-cicd</code> module.</p>

<h3>CI, CD and CD</h3>
<ul>
<li><b>Continuous Integration (CI):</b> every developer merges small changes into a shared branch often, and each merge automatically <b>builds and tests</b> the code. Problems are found within minutes, while the change is still fresh in the author's mind.</li>
<li><b>Continuous Delivery:</b> every change that passes is automatically prepared for release and can go live with <b>one approval click</b>.</li>
<li><b>Continuous Deployment:</b> the same, but with no click: a passing change goes to production by itself.</li>
</ul>
<p>The two meanings of "CD" are a famous exam confusion: delivery has a human gate before production; deployment does not.</p>

<h3>Benefits</h3>
<table class="cmp"><tr><th>Without a pipeline</th><th>With a pipeline</th></tr>
<tr><td>Builds done by hand on someone's laptop</td><td>Same steps, same environment, every time</td></tr>
<tr><td>Bugs found weeks later by users</td><td>Failures found in minutes, before merge</td></tr>
<tr><td>Big risky releases once a quarter</td><td>Small safe releases many times a week</td></tr>
<tr><td>"Who deployed what, when?" nobody knows</td><td>Every run has a log, an author and a commit</td></tr>
<tr><td>Deploy needs one expert</td><td>Anyone can trigger a tested, repeatable deploy</td></tr></table>

<h3>Stages and artifacts</h3>
<p>A <b>pipeline</b> is one run for one commit. It is split into <b>stages</b> that run in order, and each stage holds one or more <b>jobs</b> that may run in parallel. A <b>runner</b> is the machine that executes a job's script. If a stage fails, later stages are skipped (fail fast).</p>
<ul>
<li><b>Build:</b> compile or package the app, for example <code>docker build</code> to make an image.</li>
<li><b>Test:</b> run unit tests, a linter, and a security scan.</li>
<li><b>Deploy:</b> release to staging, then production.</li>
</ul>
<p>The thing a build produces is the <b>artifact</b>: an image, a wheel file, a zip, a test report. Two rules: <b>build once, promote the same artifact</b> through the environments, and give every artifact a unique <b>version or commit-based tag</b> so you can find and redeploy it. Artifacts are stored in a <b>registry</b> or artifact repository.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Pipeline stages with artifact">
<rect x="10" y="30" width="170" height="80" rx="8" fill="#ddd6fe"/><text x="95" y="52" text-anchor="middle" class="svg-ink" font-size="13">1 Build</text><text x="95" y="72" text-anchor="middle" class="svg-muted" font-size="11">docker build</text><text x="95" y="90" text-anchor="middle" class="svg-muted" font-size="11">image app:7f3a</text>
<rect x="235" y="30" width="170" height="80" rx="8" fill="#fde68a"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="13">2 Test</text><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="11">unit tests, lint</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="11">scan</text>
<rect x="460" y="30" width="170" height="80" rx="8" fill="#bbf7d0"/><text x="545" y="52" text-anchor="middle" class="svg-ink" font-size="13">3 Deploy</text><text x="545" y="72" text-anchor="middle" class="svg-muted" font-size="11">staging then prod</text><text x="545" y="90" text-anchor="middle" class="svg-muted" font-size="11">approval gate</text>
<line x1="180" y1="70" x2="235" y2="70" stroke="#64748b" stroke-width="2"/><line x1="405" y1="70" x2="460" y2="70" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="140" width="260" height="34" rx="8" fill="#fed7aa"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="12">Registry stores artifact app:7f3a</text>
<line x1="95" y1="110" x2="260" y2="140" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="380" y1="140" x2="545" y2="110" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
</svg><p class="cap">Build once, store the artifact, deploy the same artifact everywhere.</p></div>

<h3>Reading a pipeline file</h3>
<p>The pipeline is described in a YAML file kept in the repo; GitLab calls it <code>.gitlab-ci.yml</code> and other platforms use similar files. Read it top to bottom: <code>stages</code> gives the order, each other top-level key is a job, <code>stage</code> says where it runs, <code>script</code> lists its commands, and <code>artifacts</code> says what to keep.</p>
<pre class="code">stages:
  - build
  - test
  - deploy

build-image:
  stage: build
  script:
    - docker build -t registry.example/netops/poller:$CI_COMMIT_SHORT_SHA .
    - docker push registry.example/netops/poller:$CI_COMMIT_SHORT_SHA

unit-tests:
  stage: test
  image: python:3.12-slim
  script:
    - pip install -r requirements.txt
    - python -m pytest --junitxml=report.xml
  artifacts:
    paths:
      - report.xml

deploy-staging:
  stage: deploy
  script:
    - ./deploy.sh staging registry.example/netops/poller:$CI_COMMIT_SHORT_SHA
  environment: staging

deploy-prod:
  stage: deploy
  script:
    - ./deploy.sh prod registry.example/netops/poller:$CI_COMMIT_SHORT_SHA
  environment: prod
  when: manual</pre>
<p>What it says in words: build and push an image tagged with the short commit ID; run the unit tests and keep the report; deploy automatically to staging; deploy to production only when a person presses the button (<code>when: manual</code>, which makes this continuous <b>delivery</b>). The variable <code>$CI_COMMIT_SHORT_SHA</code> is supplied by the platform. Secrets such as the registry password are protected variables, never written in this file.</p>
<div class="note"><p>These snippets are reference code, not run in the simulator. For live practice use the <code>auto-cicd</code> labs.</p></div>

<div class="warn"><p><b>Common mistake:</b> rebuilding the app separately for production. The artifact you tested must be the exact one you deploy. Also never let a pipeline print secrets in its logs.</p></div>
<div class="exam"><p><b>Exam trap:</b> CI = build and test on every change. Continuous delivery = manual approval before prod; continuous deployment = fully automatic. A job runs in a <b>stage</b>; stages run in order; jobs in the same stage may run in parallel.</p></div>

<div class="scn"><h4>The red pipeline that saved a Friday</h4><p>A developer in Kochi pushed a change that removed a required environment variable. The test stage failed in two minutes; the deploy stage never ran. Without the pipeline, the broken build would have gone out Friday evening to 40 branch sites.</p><p><b>Lesson:</b> a failing pipeline is the system working. Read the failed job's log, fix, push again.</p></div>

<div class="iv"><p class="q">"What are the benefits of CI/CD for a network automation team?"</p><p>Faster feedback, consistent repeatable deployments, fewer manual errors, an audit trail, and safer small changes. Add the build-once principle and an approval gate for production. Differentiate delivery from deployment.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CI builds and tests every change; continuous delivery adds a manual gate; continuous deployment has none.</li>
<li>Pipeline = ordered stages (build, test, deploy) made of jobs that run scripts on runners.</li>
<li>Artifacts are the build outputs; version them and promote the same one.</li>
<li>A pipeline file lists stages, jobs, scripts and artifacts; read it top to bottom.</li>
</ul></div>
`,hi:`
<p>Car factory mein assembly line hoti hai. Parts ek end se aate hain, har station ek kaam karta hai aur apna kaam check karta hai, aur doosre end se tested taiyaar car nikalti hai. Station ko defect mile to line wahin ruk jaati hai aur car showroom tak nahi pahunchti. <b>CI/CD pipeline</b> software ki assembly line hai. Yeh chapter woh concept level cover karta hai jo exam chahta hai (blueprint 4.2). Hands-on pipelines ki practice <code>auto-cicd</code> module mein karo.</p>

<h3>CI, CD aur CD</h3>
<ul>
<li><b>Continuous Integration (CI):</b> har developer chhote changes shared branch mein aksar merge karta hai, aur har merge par code apne aap <b>build aur test</b> hota hai. Problems minutes mein pakdi jaati hain, jab change author ke dimaag mein taaza hota hai.</li>
<li><b>Continuous Delivery:</b> jo bhi change pass hota hai woh apne aap release ke liye taiyaar ho jaata hai aur <b>ek approval click</b> se live ja sakta hai.</li>
<li><b>Continuous Deployment:</b> wahi, lekin bina click: pass hua change khud production tak jaata hai.</li>
</ul>
<p>"CD" ke do matlab exam ka famous confusion hai: delivery mein production se pehle insaan ka gate hai; deployment mein nahi.</p>

<h3>Fayde</h3>
<table class="cmp"><tr><th>Pipeline ke bina</th><th>Pipeline ke saath</th></tr>
<tr><td>Builds kisi ke laptop par haath se</td><td>Wahi steps, wahi environment, har baar</td></tr>
<tr><td>Bugs hafton baad users dhoondhte hain</td><td>Failures minutes mein, merge se pehle</td></tr>
<tr><td>Teen mahine mein ek badi risky release</td><td>Hafte mein kai chhoti safe releases</td></tr>
<tr><td>"Kisne kya kab deploy kiya?" kisi ko nahi pata</td><td>Har run ka log, author aur commit hai</td></tr>
<tr><td>Deploy ke liye ek expert chahiye</td><td>Koi bhi tested, repeatable deploy trigger kar sakta hai</td></tr></table>

<h3>Stages aur artifacts</h3>
<p><b>Pipeline</b> ek commit ka ek run hai. Yeh <b>stages</b> mein baanta hota hai jo order mein chalte hain, aur har stage mein ek ya zyada <b>jobs</b> hote hain jo parallel chal sakte hain. <b>Runner</b> woh machine hai jo job ki script execute karti hai. Stage fail ho to baad ke stages skip ho jaate hain (fail fast).</p>
<ul>
<li><b>Build:</b> app compile ya package karo, jaise <code>docker build</code> se image banao.</li>
<li><b>Test:</b> unit tests, linter aur security scan chalao.</li>
<li><b>Deploy:</b> staging, phir production mein release.</li>
</ul>
<p>Build jo chiz banata hai woh <b>artifact</b> hai: image, wheel file, zip, test report. Do rules: <b>ek baar build, wahi artifact promote</b> karo environments mein, aur har artifact ko unique <b>version ya commit-based tag</b> do taaki use dhoondh kar dobara deploy kar sako. Artifacts <b>registry</b> ya artifact repository mein rakhe jaate hain.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Artifact ke saath pipeline stages">
<rect x="10" y="30" width="170" height="80" rx="8" fill="#ddd6fe"/><text x="95" y="52" text-anchor="middle" class="svg-ink" font-size="13">1 Build</text><text x="95" y="72" text-anchor="middle" class="svg-muted" font-size="11">docker build</text><text x="95" y="90" text-anchor="middle" class="svg-muted" font-size="11">image app:7f3a</text>
<rect x="235" y="30" width="170" height="80" rx="8" fill="#fde68a"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="13">2 Test</text><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="11">unit tests, lint</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="11">scan</text>
<rect x="460" y="30" width="170" height="80" rx="8" fill="#bbf7d0"/><text x="545" y="52" text-anchor="middle" class="svg-ink" font-size="13">3 Deploy</text><text x="545" y="72" text-anchor="middle" class="svg-muted" font-size="11">staging phir prod</text><text x="545" y="90" text-anchor="middle" class="svg-muted" font-size="11">approval gate</text>
<line x1="180" y1="70" x2="235" y2="70" stroke="#64748b" stroke-width="2"/><line x1="405" y1="70" x2="460" y2="70" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="140" width="260" height="34" rx="8" fill="#fed7aa"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="12">Registry artifact app:7f3a store karti hai</text>
<line x1="95" y1="110" x2="260" y2="140" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="380" y1="140" x2="545" y2="110" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
</svg><p class="cap">Ek baar build, artifact store karo, wahi artifact har jagah deploy karo.</p></div>

<h3>Pipeline file padhna</h3>
<p>Pipeline repo mein rakhi YAML file mein describe hoti hai; GitLab ise <code>.gitlab-ci.yml</code> kehta hai aur doosre platforms mein milti-julti files hoti hain. Upar se neeche padho: <code>stages</code> order deta hai, baaki har top-level key ek job hai, <code>stage</code> batata hai kahan chalega, <code>script</code> uske commands list karta hai, aur <code>artifacts</code> batata hai kya rakhna hai.</p>
<pre class="code">stages:
  - build
  - test
  - deploy

build-image:
  stage: build
  script:
    - docker build -t registry.example/netops/poller:$CI_COMMIT_SHORT_SHA .
    - docker push registry.example/netops/poller:$CI_COMMIT_SHORT_SHA

unit-tests:
  stage: test
  image: python:3.12-slim
  script:
    - pip install -r requirements.txt
    - python -m pytest --junitxml=report.xml
  artifacts:
    paths:
      - report.xml

deploy-staging:
  stage: deploy
  script:
    - ./deploy.sh staging registry.example/netops/poller:$CI_COMMIT_SHORT_SHA
  environment: staging

deploy-prod:
  stage: deploy
  script:
    - ./deploy.sh prod registry.example/netops/poller:$CI_COMMIT_SHORT_SHA
  environment: prod
  when: manual</pre>
<p>Shabdon mein: short commit ID ke tag ke saath image build aur push karo; unit tests chalao aur report rakho; staging mein apne aap deploy karo; production mein tabhi jab insaan button dabaye (<code>when: manual</code>, yaani continuous <b>delivery</b>). Variable <code>$CI_COMMIT_SHORT_SHA</code> platform deta hai. Registry password jaise secrets protected variables hote hain, is file mein kabhi nahi likhe jaate.</p>
<div class="note"><p>Yeh snippets reference code hain, simulator mein nahi chalte. Live practice ke liye <code>auto-cicd</code> labs use karo.</p></div>

<div class="warn"><p><b>Common mistake:</b> production ke liye app ko alag se rebuild karna. Jo artifact test kiya wahi exact deploy hona chahiye. Aur pipeline ko apne logs mein secrets print mat karne do.</p></div>
<div class="exam"><p><b>Exam trap:</b> CI = har change par build aur test. Continuous delivery = prod se pehle manual approval; continuous deployment = poori tarah automatic. Job <b>stage</b> mein chalta hai; stages order mein chalte hain; same stage ke jobs parallel chal sakte hain.</p></div>

<div class="scn"><h4>Red pipeline jisne Friday bacha liya</h4><p>Kochi ke ek developer ne aisa change push kiya jisne ek required environment variable hata diya. Test stage do minute mein fail hua; deploy stage kabhi chala hi nahi. Pipeline na hoti to toota hua build Friday shaam 40 branch sites par chala jaata.</p><p><b>Lesson:</b> failing pipeline matlab system kaam kar raha hai. Failed job ka log padho, fix karo, phir push karo.</p></div>

<div class="iv"><p class="q">"Network automation team ke liye CI/CD ke kya fayde hain?"</p><p>Tez feedback, consistent repeatable deployments, kam manual errors, audit trail, aur safe chhote changes. Build-once principle aur production ke liye approval gate jodo. Delivery aur deployment ka farq batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CI har change build aur test karta hai; continuous delivery manual gate jodta hai; continuous deployment mein gate nahi.</li>
<li>Pipeline = ordered stages (build, test, deploy), jobs jo runners par scripts chalate hain.</li>
<li>Artifacts build ke outputs hain; version karo aur wahi promote karo.</li>
<li>Pipeline file stages, jobs, scripts aur artifacts list karti hai; upar se neeche padho.</li>
</ul></div>
`}};export{e as default};