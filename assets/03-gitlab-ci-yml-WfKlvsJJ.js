var e={id:`gitlab-ci-yml`,h:{en:`Anatomy of .gitlab-ci.yml: writing the pipeline file`,hi:`.gitlab-ci.yml ki banawat: pipeline file likhna`},body:{en:`

<p><b>One idea in this chapter:</b> the whole pipeline is one small YAML file called <code>.gitlab-ci.yml</code> in the root of the repository. You already know YAML from the Ansible module. Here is how this file is read.</p>

<h3>The finished file, line by line</h3>
<pre class="code"><span class="c"># .gitlab-ci.yml - lint, then test, then deploy (a failed stage stops the rest)</span>
stages:
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
<ul>
<li><b><code>stages:</code></b> is a list that fixes the <i>order</i> of the stages. Here: validate first, then test, then deploy. The names are your choice, but each one must appear here to be used.</li>
<li><b><code>lint:</code></b> is a <b>job</b>. Any top-level key that is not a reserved word (like <code>stages</code>) is a job, and its name is yours to choose. Use clear names: <code>lint</code>, <code>unit-test</code>, <code>push-vlans</code>.</li>
<li><b><code>stage: validate</code></b> says which stage the job belongs to. It must be one of the names in <code>stages</code>.</li>
<li><b><code>script:</code></b> is the list of commands the job runs, each starting with a dash. A command is exactly what you would type in a terminal. <code>yamllint vlans.yml</code> checks the file; <code>python3 check.py</code> runs the test; <code>python3 deploy.py</code> pushes to the switch.</li>
<li>Comments start with <code>#</code>. Indentation is two spaces, no tabs, as in every YAML file.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="The file has two parts: the stage order at the top, and the jobs that belong to those stages."><rect x="30" y="20" width="260" height="170" rx="10" fill="#1e293b"/><text x="45" y="45" fill="#e2e8f0" font-size="12" font-family="monospace">stages:</text><text x="45" y="63" fill="#e2e8f0" font-size="12" font-family="monospace">  - validate</text><text x="45" y="81" fill="#e2e8f0" font-size="12" font-family="monospace">  - test</text><text x="45" y="105" fill="#e2e8f0" font-size="12" font-family="monospace">lint:</text><text x="45" y="123" fill="#e2e8f0" font-size="12" font-family="monospace">  stage: validate</text><text x="45" y="141" fill="#e2e8f0" font-size="12" font-family="monospace">  script:</text><text x="45" y="159" fill="#e2e8f0" font-size="12" font-family="monospace">    - yamllint vlans.yml</text><line x1="290" y1="55" x2="360" y2="55" stroke="#64748b" stroke-width="2"/><text x="330" y="45" text-anchor="middle" class="svg-accent" font-size="11">order</text><rect x="360" y="35" width="120" height="40" rx="8" fill="#bae6fd"/><text x="420" y="60" text-anchor="middle" class="svg-ink" font-size="13">validate</text><rect x="500" y="35" width="120" height="40" rx="8" fill="#fde68a"/><text x="560" y="60" text-anchor="middle" class="svg-ink" font-size="13">test</text><line x1="290" y1="125" x2="360" y2="125" stroke="#64748b" stroke-width="2"/><text x="330" y="115" text-anchor="middle" class="svg-accent" font-size="11">job</text><rect x="360" y="105" width="260" height="40" rx="8" fill="#ffffff" stroke="#64748b"/><text x="490" y="130" text-anchor="middle" class="svg-ink" font-size="13">lint in stage validate runs a command</text></svg><p class="cap">The file has two parts: the stage order at the top, and the jobs that belong to those stages.</p></div>

<h3>Lab 1: finishing a half-written pipeline</h3>
<p>Narmada Retail gives you a pipeline with two TODO comments: the <code>deploy</code> stage is missing from <code>stages</code>, and the job <code>push-vlans</code> does not exist yet. The <code>nl</code> command prints a file with line numbers, so you can say exactly where to edit:</p>
<pre class="code">nl .gitlab-ci.yml</pre>
<pre class="out">     1  # .gitlab-ci.yml - the pipeline. Stages run in this order; every job belongs to one stage.
     2  stages:
     3    - validate
     4    - test
     5  <span class="hl"># TODO 1: add the deploy stage here</span>
     6  
     7  lint:
     8    stage: validate
     9    script:
    10      - yamllint vlans.yml
    11  
    12  unit-test:
    13    stage: test
    14    script:
    15      - python3 check.py
    16  
    17  <span class="hl"># TODO 2: add a job called push-vlans, in stage deploy, that runs: python3 deploy.py</span></pre>
<p>Replace line 5 with the new stage using <code>edit</code> (file, line number, new text), then append the job with four <code>echo</code> commands. The text in quotes keeps the leading spaces, and <code>&gt;&gt;</code> adds to the end of the file:</p>
<pre class="code">edit .gitlab-ci.yml 5   - deploy
echo "push-vlans:" &gt;&gt; .gitlab-ci.yml
echo "  stage: deploy" &gt;&gt; .gitlab-ci.yml
echo "  script:" &gt;&gt; .gitlab-ci.yml
echo "    - python3 deploy.py" &gt;&gt; .gitlab-ci.yml
yamllint .gitlab-ci.yml</pre>
<pre class="out">     5    - deploy
.gitlab-ci.yml: <span class="hl">valid YAML</span> (mapping with keys: stages, lint, unit-test, push-vlans)</pre>
<p>The checker lists the top-level keys it found: the stage order plus three jobs. That is the finished file. In a real project you would edit with an editor; the commands only avoid the need for one. Make sure the indentation matches: a job key at column 0, its <code>stage</code> and <code>script</code> two spaces in, and the command with a dash four spaces in.</p>

<h3>What the runner checks before it starts</h3>
<p>If a job names a stage that is not in the <code>stages</code> list, the pipeline cannot be built. The lab host shows it (here the job's stage was misspelled as <code>ship</code>):</p>
<pre class="out">Pipeline #102 created for main (working)
Pipeline failed: job deploy: chosen stage ship does not exist</pre>
<p>The message names the job and the stage. Real GitLab reports the same kind of mistake as a pipeline configuration error with a slightly different wording; the lesson is the same. If the pipeline file is not valid YAML at all, the push still succeeds but no jobs run, and GitLab shows the file error on the pipeline page. Always check the file with <code>yamllint</code> before you push.</p>

<h3>Rules of thumb</h3>
<ul><li>One purpose per job: <code>lint</code> lints, <code>unit-test</code> tests, <code>push-vlans</code> deploys.</li><li>Order the stages cheap to expensive, and deploy last.</li><li>Keep scripts short. A long script belongs in a file in the repository (like check.py) that the job calls.</li><li>The pipeline file lives in the repository, so changes to it are commits and can be reviewed.</li></ul>

<div class="eg"><p><b>Worked example.</b> Lab 1, task 2. You use nl to see the TODO lines, edit line 5 to add the deploy stage, append the push-vlans job, and run yamllint .gitlab-ci.yml. It reports valid YAML with the four keys. The check passes because the file contains a deploy stage, a stage: deploy line and the command python3 deploy.py.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Using a stage in a job that is not listed under stages. Wrong indentation of script lines. Forgetting the dash before a command. Naming the file .gitlab-ci.yaml or without the leading dot, so no pipeline runs.</p></div>
<div class="exam"><p><b>Exam trap.</b> stages defines order; each job has a stage and a script. The file name is .gitlab-ci.yml in the repository root. A job without a valid stage breaks the pipeline configuration.</p></div>

<div class="scn"><h4>The missing dot</h4><p>A team copied their pipeline file into a new repository and pushed, but nothing ran. After an hour of looking at runners and permissions, someone noticed the file was called gitlab-ci.yml, without the leading dot. They renamed it, pushed, and the pipeline started at once. They then added a one-line note to their onboarding page.</p><p><b>Lesson:</b> the pipeline file name is exact; check it before blaming the runner.</p></div>
<div class="iv"><p class="q">"What are the minimum parts of a GitLab CI file?"</p><p>A stages list that fixes the order, and one or more jobs, each with a stage and a script of commands. The file is named .gitlab-ci.yml and sits in the repository root. Extra keywords such as when, allow_failure, variables and rules refine behaviour. I validate the YAML before pushing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>The pipeline is the file .gitlab-ci.yml in the repository root.</li><li>stages gives the order; every other top-level key is a job with a stage and a script.</li><li>A job stage must appear in the stages list.</li><li>edit, echo and yamllint (lab host) help you edit and check the file.</li><li>The pipeline file is versioned and reviewed like any other change.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> poori pipeline repository ke root mein <code>.gitlab-ci.yml</code> naam ki ek chhoti YAML file hai. YAML aap Ansible module se jaante ho. Yeh file kaise padhi jaati hai dekho.</p>

<h3>Poori file, line by line</h3>
<pre class="code"><span class="c"># .gitlab-ci.yml - lint, then test, then deploy (a failed stage stops the rest)</span>
stages:
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
<ul>
<li><b><code>stages:</code></b> ek list hai jo stages ka <i>order</i> tay karti hai. Yahan: pehle validate, phir test, phir deploy. Naam aapki pasand ke hain, par use karne ke liye har ek yahan aana chahiye.</li>
<li><b><code>lint:</code></b> ek <b>job</b> hai. Koi bhi top-level key jo reserved word (jaise <code>stages</code>) nahi hai woh job hai, aur uska naam aapka hai. Saaf naam rakho: <code>lint</code>, <code>unit-test</code>, <code>push-vlans</code>.</li>
<li><b><code>stage: validate</code></b> batata hai job kis stage ka hai. Yeh <code>stages</code> ke naamon mein se ek hona chahiye.</li>
<li><b><code>script:</code></b> job ke commands ki list hai, har ek dash se shuru. Command bilkul woh hai jo aap terminal mein type karte. <code>yamllint vlans.yml</code> file check karta hai; <code>python3 check.py</code> test chalata hai; <code>python3 deploy.py</code> switch par push karta hai.</li>
<li>Comments <code>#</code> se shuru hote hain. Indentation do spaces, tabs nahi, jaise har YAML file mein.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="File ke do hisse hain: upar stage order, aur un stages ke jobs."><rect x="30" y="20" width="260" height="170" rx="10" fill="#1e293b"/><text x="45" y="45" fill="#e2e8f0" font-size="12" font-family="monospace">stages:</text><text x="45" y="63" fill="#e2e8f0" font-size="12" font-family="monospace">  - validate</text><text x="45" y="81" fill="#e2e8f0" font-size="12" font-family="monospace">  - test</text><text x="45" y="105" fill="#e2e8f0" font-size="12" font-family="monospace">lint:</text><text x="45" y="123" fill="#e2e8f0" font-size="12" font-family="monospace">  stage: validate</text><text x="45" y="141" fill="#e2e8f0" font-size="12" font-family="monospace">  script:</text><text x="45" y="159" fill="#e2e8f0" font-size="12" font-family="monospace">    - yamllint vlans.yml</text><line x1="290" y1="55" x2="360" y2="55" stroke="#64748b" stroke-width="2"/><text x="330" y="45" text-anchor="middle" class="svg-accent" font-size="11">order</text><rect x="360" y="35" width="120" height="40" rx="8" fill="#bae6fd"/><text x="420" y="60" text-anchor="middle" class="svg-ink" font-size="13">validate</text><rect x="500" y="35" width="120" height="40" rx="8" fill="#fde68a"/><text x="560" y="60" text-anchor="middle" class="svg-ink" font-size="13">test</text><line x1="290" y1="125" x2="360" y2="125" stroke="#64748b" stroke-width="2"/><text x="330" y="115" text-anchor="middle" class="svg-accent" font-size="11">job</text><rect x="360" y="105" width="260" height="40" rx="8" fill="#ffffff" stroke="#64748b"/><text x="490" y="130" text-anchor="middle" class="svg-ink" font-size="13">stage validate ka lint ek command chalata hai</text></svg><p class="cap">File ke do hisse hain: upar stage order, aur un stages ke jobs.</p></div>

<h3>Lab 1: aadhi likhi pipeline poori karna</h3>
<p>Narmada Retail aapko do TODO comments wali pipeline deta hai: <code>stages</code> mein <code>deploy</code> stage missing hai, aur job <code>push-vlans</code> abhi hai hi nahi. <code>nl</code> command file ko line numbers ke saath print karta hai, taaki aap bata sako exactly kahan edit karna hai:</p>
<pre class="code">nl .gitlab-ci.yml</pre>
<pre class="out">     1  # .gitlab-ci.yml - the pipeline. Stages run in this order; every job belongs to one stage.
     2  stages:
     3    - validate
     4    - test
     5  <span class="hl"># TODO 1: add the deploy stage here</span>
     6  
     7  lint:
     8    stage: validate
     9    script:
    10      - yamllint vlans.yml
    11  
    12  unit-test:
    13    stage: test
    14    script:
    15      - python3 check.py
    16  
    17  <span class="hl"># TODO 2: add a job called push-vlans, in stage deploy, that runs: python3 deploy.py</span></pre>
<p>Line 5 ko naye stage se <code>edit</code> (file, line number, naya text) se badlo, phir chaar <code>echo</code> commands se job append karo. Quotes ka text aage ke spaces bachata hai, aur <code>&gt;&gt;</code> file ke end mein jodta hai:</p>
<pre class="code">edit .gitlab-ci.yml 5   - deploy
echo "push-vlans:" &gt;&gt; .gitlab-ci.yml
echo "  stage: deploy" &gt;&gt; .gitlab-ci.yml
echo "  script:" &gt;&gt; .gitlab-ci.yml
echo "    - python3 deploy.py" &gt;&gt; .gitlab-ci.yml
yamllint .gitlab-ci.yml</pre>
<pre class="out">     5    - deploy
.gitlab-ci.yml: <span class="hl">valid YAML</span> (mapping with keys: stages, lint, unit-test, push-vlans)</pre>
<p>Checker woh top-level keys list karta hai jo use mile: stage order plus teen jobs. Yeh poori file hai. Asli project mein aap editor se edit karte; commands bas editor ki zaroorat bachate hain. Dhyan rakho ki indentation match kare: job key column 0 par, uske <code>stage</code> aur <code>script</code> do spaces andar, aur dash wala command chaar spaces andar.</p>

<h3>Runner shuru karne se pehle kya check karta hai</h3>
<p>Agar job aisa stage naam leta hai jo <code>stages</code> list mein nahi hai, to pipeline ban hi nahi sakti. Lab host ise dikhata hai (yahan job ka stage <code>ship</code> galat likha tha):</p>
<pre class="out">Pipeline #102 created for main (working)
Pipeline failed: job deploy: chosen stage ship does not exist</pre>
<p>Message job aur stage ka naam batata hai. Asli GitLab isi tarah ki galti ko thode alag wording ke saath pipeline configuration error ke roop mein report karta hai; seekh wahi hai. Agar pipeline file valid YAML hi nahi hai, to push phir bhi ho jaata hai par koi job nahi chalta, aur GitLab pipeline page par file error dikhata hai. Push se pehle hamesha file ko <code>yamllint</code> se check karo.</p>

<h3>Anguthe ke niyam</h3>
<ul><li>Ek job ka ek maqsad: <code>lint</code> lint karta hai, <code>unit-test</code> test karta hai, <code>push-vlans</code> deploy karta hai.</li><li>Stages ko sasti se mehengi tak order karo, aur deploy aakhir mein.</li><li>Scripts chhoti rakho. Lambi script repository ki file mein jaati hai (jaise check.py) jise job bulata hai.</li><li>Pipeline file repository mein rehti hai, isliye usme changes commits hain aur review ho sakte hain.</li></ul>

<div class="eg"><p><b>Worked example.</b> Lab 1, task 2. Aap nl se TODO lines dekhte ho, line 5 edit karke deploy stage jodte ho, push-vlans job append karte ho, aur yamllint .gitlab-ci.yml chalate ho. Woh chaar keys ke saath valid YAML report karta hai. Check pass hota hai kyunki file mein deploy stage, stage: deploy line aur command python3 deploy.py hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Job mein aisa stage use karna jo stages ke neeche list nahi hai. Script lines ki galat indentation. Command se pehle dash bhool jaana. File ka naam .gitlab-ci.yaml ya shuru ke dot ke bina rakhna, jisse koi pipeline nahi chalti.</p></div>
<div class="exam"><p><b>Exam trap.</b> stages order define karta hai; har job mein stage aur script hota hai. File ka naam repository root mein .gitlab-ci.yml hai. Valid stage ke bina job pipeline configuration tod deta hai.</p></div>

<div class="scn"><h4>Gayab dot</h4><p>Ek team ne apni pipeline file naye repository mein copy ki aur push kiya, par kuch nahi chala. Runners aur permissions dekhte ek ghanta nikal gaya, tab kisi ne dekha ki file ka naam shuru ke dot ke bina gitlab-ci.yml tha. Unhone rename kiya, push kiya, aur pipeline turant shuru ho gayi. Phir unhone onboarding page par ek line ka note joda.</p><p><b>Lesson:</b> pipeline file ka naam exact hota hai; runner ko dosh dene se pehle use check karo.</p></div>
<div class="iv"><p class="q">"GitLab CI file ke minimum parts kaun se hain?"</p><p>Stages ki ek list jo order tay karti hai, aur ek ya zyada jobs, har ek mein stage aur commands ki script. File ka naam .gitlab-ci.yml hai aur repository root mein hoti hai. when, allow_failure, variables aur rules jaise extra keywords behaviour refine karte hain. Main push se pehle YAML validate karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Pipeline repository root ki .gitlab-ci.yml file hai.</li><li>stages order deta hai; baaki har top-level key stage aur script wala job hai.</li><li>Job ka stage stages list mein hona chahiye.</li><li>edit, echo aur yamllint (lab host) file edit aur check karne mein madad karte hain.</li><li>Pipeline file versioned hai aur baaki changes ki tarah review hoti hai.</li></ul></div>

`}};export{e as default};