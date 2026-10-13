var e={id:`devsecops`,h:{en:`DevSecOps: secure SDLC, CI/CD scanning and IaC`,hi:`DevSecOps: secure SDLC, CI/CD scanning aur IaC`},body:{en:`
<p>In a car factory, quality inspectors used to check cars only at the end of the line. A badly fitted door meant taking apart a finished car. Modern factories put a check at every station: the door is checked when it is fitted, so a fault costs a minute, not a day. <b>DevSecOps</b> applies this to software. Security checks run at every stage of the pipeline, owned by the same teams who write and ship the code. This idea is called <b>shift left</b>: move security earlier, where fixes are cheap.</p>

<h3>The secure SDLC and the CI/CD pipeline</h3>
<p>The <b>software development life cycle</b> (plan, code, build, test, release, deploy, operate) gets a security activity at each step. <b>CI</b> (continuous integration) builds and tests every change automatically; <b>CD</b> (continuous delivery or deployment) releases it. The pipeline is where you put automatic gates.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="DevSecOps pipeline">
<rect x="5" y="40" width="95" height="50" rx="8" fill="#e2e8f0"/><text x="52" y="70" text-anchor="middle" class="svg-ink" font-size="13">Plan</text>
<rect x="110" y="40" width="95" height="50" rx="8" fill="#bae6fd"/><text x="157" y="70" text-anchor="middle" class="svg-ink" font-size="13">Code</text>
<rect x="215" y="40" width="95" height="50" rx="8" fill="#bae6fd"/><text x="262" y="70" text-anchor="middle" class="svg-ink" font-size="13">Build</text>
<rect x="320" y="40" width="95" height="50" rx="8" fill="#ddd6fe"/><text x="367" y="70" text-anchor="middle" class="svg-ink" font-size="13">Test</text>
<rect x="425" y="40" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="472" y="70" text-anchor="middle" class="svg-ink" font-size="13">Deploy</text>
<rect x="530" y="40" width="105" height="50" rx="8" fill="#fde68a"/><text x="582" y="70" text-anchor="middle" class="svg-ink" font-size="13">Operate</text>
<text x="52" y="115" text-anchor="middle" class="svg-muted" font-size="12">threat model</text>
<text x="157" y="115" text-anchor="middle" class="svg-muted" font-size="12">SAST, secrets</text>
<text x="262" y="115" text-anchor="middle" class="svg-muted" font-size="12">SCA, SBOM, IaC</text>
<text x="367" y="115" text-anchor="middle" class="svg-muted" font-size="12">DAST, fuzzing</text>
<text x="472" y="115" text-anchor="middle" class="svg-muted" font-size="12">signing, admission</text>
<text x="582" y="115" text-anchor="middle" class="svg-muted" font-size="12">CSPM, SIEM</text>
<text x="320" y="155" text-anchor="middle" class="svg-accent" font-size="13">Shift left: the earlier the check, the cheaper the fix</text>
</svg><p class="cap">A security check at every station of the pipeline.</p></div>

<h3>The scanning toolbox</h3>
<table class="cmp"><tr><th>Type</th><th>What it examines</th><th>When</th><th>Finds</th></tr>
<tr><td><b>SAST</b> (static)</td><td>Source code, without running it</td><td>Code, pull request</td><td>Injection flaws, hard-coded passwords, unsafe functions</td></tr>
<tr><td><b>Secret scanning</b></td><td>Commits and history</td><td>Pre-commit, pull request</td><td>API keys, tokens, private keys</td></tr>
<tr><td><b>SCA</b></td><td>Open-source dependencies and licences; produces an <b>SBOM</b></td><td>Build</td><td>Known-vulnerable libraries (Log4Shell-type)</td></tr>
<tr><td><b>Container image scanning</b></td><td>OS packages and libraries in an image</td><td>Build, registry</td><td>CVEs in base images, root user, secrets in layers</td></tr>
<tr><td><b>IaC scanning</b></td><td>Terraform, CloudFormation, Kubernetes YAML, Helm</td><td>Pull request, build</td><td>Public buckets, open security groups, no encryption</td></tr>
<tr><td><b>DAST</b> (dynamic)</td><td>The running application, from outside</td><td>Test / staging</td><td>Runtime injection, misconfigured headers, auth issues</td></tr>
<tr><td><b>IAST</b></td><td>The running app, with an agent inside during tests</td><td>Test</td><td>Flaws with exact code location</td></tr>
</table>
<p>A <b>quality gate</b> fails the build when findings above a threshold appear, for example any critical or high. Without a gate, scanning is only a report.</p>

<h3>Securing the pipeline itself</h3>
<p>The pipeline holds deploy rights to production, so it is a prime target for <b>software supply-chain attacks</b>. Controls: short-lived <b>OIDC tokens</b> from the CI system to the cloud instead of stored keys; protected branches and mandatory reviews; signed commits and <b>signed artifacts</b> (images verified at deploy time); pinned, scanned third-party actions and plug-ins; isolated, ephemeral build runners; and an SBOM for every release. Frameworks such as SLSA describe these supply-chain levels.</p>

<h3>Lab 1, task 4: fixing the Terraform</h3>
<p>You fixed the bucket and the security group in the console, but the Terraform in <b>CLOUD &gt; IaC Scan</b> still declares the old settings. The next pipeline run would apply them again and undo your work. That is <b>configuration drift in reverse</b>: the code is wrong, so the console fix will not last. Run the scan first:</p>
<pre class="out">Check: <span class="hl">CKV_NK_20</span>: "Ensure the bucket ACL does not grant public read"   CRITICAL
	FAILED for resource: nk_storage_bucket.payroll_exports
Check: <span class="hl">CKV_NK_19</span>: "Ensure the bucket is encrypted with a KMS key"   MEDIUM
	FAILED for resource: nk_storage_bucket.payroll_exports
Check: <span class="hl">CKV_NK_24</span>: "Ensure no security group allows ingress from 0.0.0.0/0 to port 22"   HIGH
	FAILED for resource: nk_security_group.sg_web
Failed checks: 3    Pipeline: <span class="hl">blocked</span></pre>
<p>Edit the code so the declared state matches the fix:</p>
<pre class="code">resource "nk_storage_bucket" "payroll_exports" {
  name = "nk-payroll-exports"
  acl  = "private"                            <span class="c"># was public-read (CKV_NK_20)</span>
  public_access_block = true
  encryption { kms_key = "alias/nk-data" }    <span class="c"># was commented out (CKV_NK_19)</span>
}

resource "nk_security_group" "sg_web" {
  name = "sg-web"
  ingress {
    protocol    = "tcp"
    port        = 443
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    protocol    = "tcp"
    port        = 22
    cidr_blocks = ["10.99.0.0/24"]   <span class="c"># admin VPN only (CKV_NK_24)</span>
  }
}</pre>
<pre class="out">Passed checks: 6, Failed checks: 0
<span class="hl">Scan: Passed    Pipeline: passed</span></pre>

<div class="eg"><p><b>Worked example: severity and the gate.</b> In this lab the gate blocks on CRITICAL or HIGH. If you fix only CKV_NK_20 and CKV_NK_24, the pipeline shows "passed" because the remaining CKV_NK_19 is MEDIUM, but the scan itself still reports 1 failed check, and the lab requires 0. Real teams make the same decision: which severities block, and how long a lower finding may stay open.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fixing in the console only and letting IaC overwrite it. Suppressing a failing check with a skip comment without a reason or an expiry. Running scanners but not failing the build. Storing cloud keys as CI variables instead of using OIDC.</p></div>
<div class="exam"><p><b>Exam traps.</b> SAST = source code, not running. DAST = running app, from outside. SCA = third-party components and SBOM. IaC scanning catches cloud misconfigurations before deployment. "Shift left" means earlier in the life cycle, not "move work to another team".</p></div>

<div class="scn"><h4>The pipeline that shipped a public bucket</h4><p>A Terraform change set a data bucket to public-read. Two reviewers approved it because the diff was 300 lines long and the ACL line was in the middle. The bucket stayed public for nine days. The team added an IaC scanner to the pull-request checks with a gate on critical and high findings, and an organisation guardrail that rejects public bucket ACLs on all production accounts. A month later the same mistake was made again by a new joiner; this time the pull request failed in 40 seconds with a clear message, and the bucket was never created.</p><p><b>Lesson:</b> people miss lines in big diffs; automated gates do not. Combine shift-left scanning with a preventive guardrail.</p></div>

<div class="iv"><p class="q">"Explain SAST, DAST and SCA, and where each fits in a pipeline."</p><p>SAST reads source code without running it and fits at commit and pull-request time. SCA inventories open-source dependencies, matches them to known CVEs and licences, produces an SBOM and fits at build time. DAST attacks the running application from outside in a test environment. Add IaC and container image scanning, a quality gate that fails the build, and protecting the pipeline itself with OIDC, signing and protected branches.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Shift left: a security check at every SDLC stage, owned by the delivery team.</li>
<li>SAST, secret scanning, SCA/SBOM, image scanning, IaC scanning, DAST, IAST each have a place.</li>
<li>A quality gate turns scanning into enforcement.</li>
<li>Protect the pipeline: OIDC tokens, signed artifacts, protected branches, ephemeral runners.</li>
<li>Fix the IaC, not just the console, or the next run undoes your fix.</li>
</ul></div>
`,hi:`
<p>Car factory mein pehle quality inspectors cars ko sirf line ke end mein check karte the. Galat fit hua darwaza matlab tayyar car ko khol kar theek karna. Modern factories har station par check rakhti hain: darwaza fit hote hi check hota hai, isliye fault ki keemat ek minute hai, ek din nahi. <b>DevSecOps</b> yahi software par apply karta hai. Security checks pipeline ke har stage par chalte hain, aur unke owner wahi teams hain jo code likhti aur ship karti hain. Is idea ko <b>shift left</b> kehte hain: security ko pehle le aao, jahan fixes saste hain.</p>

<h3>Secure SDLC aur CI/CD pipeline</h3>
<p><b>Software development life cycle</b> (plan, code, build, test, release, deploy, operate) ke har step par ek security activity judti hai. <b>CI</b> (continuous integration) har change ko automatically build aur test karta hai; <b>CD</b> (continuous delivery ya deployment) use release karta hai. Pipeline woh jagah hai jahan aap automatic gates lagate ho.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="DevSecOps pipeline">
<rect x="5" y="40" width="95" height="50" rx="8" fill="#e2e8f0"/><text x="52" y="70" text-anchor="middle" class="svg-ink" font-size="13">Plan</text>
<rect x="110" y="40" width="95" height="50" rx="8" fill="#bae6fd"/><text x="157" y="70" text-anchor="middle" class="svg-ink" font-size="13">Code</text>
<rect x="215" y="40" width="95" height="50" rx="8" fill="#bae6fd"/><text x="262" y="70" text-anchor="middle" class="svg-ink" font-size="13">Build</text>
<rect x="320" y="40" width="95" height="50" rx="8" fill="#ddd6fe"/><text x="367" y="70" text-anchor="middle" class="svg-ink" font-size="13">Test</text>
<rect x="425" y="40" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="472" y="70" text-anchor="middle" class="svg-ink" font-size="13">Deploy</text>
<rect x="530" y="40" width="105" height="50" rx="8" fill="#fde68a"/><text x="582" y="70" text-anchor="middle" class="svg-ink" font-size="13">Operate</text>
<text x="52" y="115" text-anchor="middle" class="svg-muted" font-size="12">threat model</text>
<text x="157" y="115" text-anchor="middle" class="svg-muted" font-size="12">SAST, secrets</text>
<text x="262" y="115" text-anchor="middle" class="svg-muted" font-size="12">SCA, SBOM, IaC</text>
<text x="367" y="115" text-anchor="middle" class="svg-muted" font-size="12">DAST, fuzzing</text>
<text x="472" y="115" text-anchor="middle" class="svg-muted" font-size="12">signing, admission</text>
<text x="582" y="115" text-anchor="middle" class="svg-muted" font-size="12">CSPM, SIEM</text>
<text x="320" y="155" text-anchor="middle" class="svg-accent" font-size="13">Shift left: jitna pehle check, utna sasta fix</text>
</svg><p class="cap">Pipeline ke har station par ek security check.</p></div>

<h3>Scanning toolbox</h3>
<table class="cmp"><tr><th>Type</th><th>Kya examine karta hai</th><th>Kab</th><th>Kya dhoondhta hai</th></tr>
<tr><td><b>SAST</b> (static)</td><td>Source code, bina chalaye</td><td>Code, pull request</td><td>Injection flaws, hard-coded passwords, unsafe functions</td></tr>
<tr><td><b>Secret scanning</b></td><td>Commits aur history</td><td>Pre-commit, pull request</td><td>API keys, tokens, private keys</td></tr>
<tr><td><b>SCA</b></td><td>Open-source dependencies aur licences; <b>SBOM</b> banata hai</td><td>Build</td><td>Known-vulnerable libraries (Log4Shell-type)</td></tr>
<tr><td><b>Container image scanning</b></td><td>Image ke OS packages aur libraries</td><td>Build, registry</td><td>Base images mein CVEs, root user, layers mein secrets</td></tr>
<tr><td><b>IaC scanning</b></td><td>Terraform, CloudFormation, Kubernetes YAML, Helm</td><td>Pull request, build</td><td>Public buckets, khule security groups, encryption nahi</td></tr>
<tr><td><b>DAST</b> (dynamic)</td><td>Chalti application, bahar se</td><td>Test / staging</td><td>Runtime injection, misconfigured headers, auth issues</td></tr>
<tr><td><b>IAST</b></td><td>Chalti app, tests ke dauraan andar agent ke saath</td><td>Test</td><td>Exact code location ke saath flaws</td></tr>
</table>
<p><b>Quality gate</b> build fail karta hai jab threshold se upar findings aayein, jaise koi bhi critical ya high. Gate ke bina scanning sirf ek report hai.</p>

<h3>Pipeline ko khud secure karna</h3>
<p>Pipeline ke paas production ke deploy rights hote hain, isliye woh <b>software supply-chain attacks</b> ka bada target hai. Controls: stored keys ki jagah CI system se cloud tak short-lived <b>OIDC tokens</b>; protected branches aur mandatory reviews; signed commits aur <b>signed artifacts</b> (deploy time par images verify); pinned, scanned third-party actions aur plug-ins; isolated, ephemeral build runners; aur har release ke liye SBOM. SLSA jaise frameworks in supply-chain levels ko describe karte hain.</p>

<h3>Lab 1, task 4: Terraform theek karna</h3>
<p>Aapne console mein bucket aur security group theek kar diye, lekin <b>CLOUD &gt; IaC Scan</b> ka Terraform ab bhi purani settings declare karta hai. Agla pipeline run unhe dobara apply karega aur aapka kaam undo kar dega. Yeh <b>ulta configuration drift</b> hai: code galat hai, isliye console fix tikega nahi. Pehle scan chalao:</p>
<pre class="out">Check: <span class="hl">CKV_NK_20</span>: "Ensure the bucket ACL does not grant public read"   CRITICAL
	FAILED for resource: nk_storage_bucket.payroll_exports
Check: <span class="hl">CKV_NK_19</span>: "Ensure the bucket is encrypted with a KMS key"   MEDIUM
	FAILED for resource: nk_storage_bucket.payroll_exports
Check: <span class="hl">CKV_NK_24</span>: "Ensure no security group allows ingress from 0.0.0.0/0 to port 22"   HIGH
	FAILED for resource: nk_security_group.sg_web
Failed checks: 3    Pipeline: <span class="hl">blocked</span></pre>
<p>Code edit karo taaki declared state fix se match kare:</p>
<pre class="code">resource "nk_storage_bucket" "payroll_exports" {
  name = "nk-payroll-exports"
  acl  = "private"                            <span class="c"># pehle public-read (CKV_NK_20)</span>
  public_access_block = true
  encryption { kms_key = "alias/nk-data" }    <span class="c"># pehle commented out (CKV_NK_19)</span>
}

resource "nk_security_group" "sg_web" {
  name = "sg-web"
  ingress {
    protocol    = "tcp"
    port        = 443
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    protocol    = "tcp"
    port        = 22
    cidr_blocks = ["10.99.0.0/24"]   <span class="c"># sirf admin VPN (CKV_NK_24)</span>
  }
}</pre>
<pre class="out">Passed checks: 6, Failed checks: 0
<span class="hl">Scan: Passed    Pipeline: passed</span></pre>

<div class="eg"><p><b>Worked example: severity aur gate.</b> Is lab mein gate CRITICAL ya HIGH par block karta hai. Agar aap sirf CKV_NK_20 aur CKV_NK_24 theek karte ho, to pipeline "passed" dikhati hai kyunki bacha hua CKV_NK_19 MEDIUM hai, lekin scan khud ab bhi 1 failed check report karta hai, aur lab ko 0 chahiye. Real teams bhi yahi decision leti hain: kaunsi severities block karengi, aur kam severity wali finding kitne din khuli reh sakti hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sirf console mein theek karna aur IaC ko use overwrite karne dena. Failing check ko skip comment se suppress karna bina reason ya expiry ke. Scanners chalana lekin build fail na karna. OIDC ki jagah cloud keys ko CI variables mein store karna.</p></div>
<div class="exam"><p><b>Exam traps.</b> SAST = source code, chalta hua nahi. DAST = chalti app, bahar se. SCA = third-party components aur SBOM. IaC scanning cloud misconfigurations ko deployment se pehle pakadta hai. "Shift left" ka matlab life cycle mein pehle, "kaam doosri team ko dena" nahi.</p></div>

<div class="scn"><h4>Woh pipeline jisne public bucket ship kiya</h4><p>Ek Terraform change ne data bucket ko public-read kar diya. Do reviewers ne approve kar diya kyunki diff 300 lines lamba tha aur ACL line beech mein thi. Bucket nau din public raha. Team ne pull-request checks mein critical aur high findings par gate ke saath IaC scanner joda, aur ek organisation guardrail jo saare production accounts par public bucket ACLs reject kare. Ek mahine baad ek naye joiner ne wahi galti dobara ki; is baar pull request 40 second mein clear message ke saath fail hua, aur bucket kabhi bana hi nahi.</p><p><b>Seekh:</b> bade diffs mein log lines miss karte hain; automated gates nahi karte. Shift-left scanning ko preventive guardrail ke saath jodo.</p></div>

<div class="iv"><p class="q">"SAST, DAST aur SCA explain karo, aur pipeline mein har ek kahan fit hota hai."</p><p>SAST source code ko bina chalaye padhta hai aur commit aur pull-request time par fit hota hai. SCA open-source dependencies ki inventory banata hai, unhe known CVEs aur licences se match karta hai, SBOM banata hai aur build time par fit hota hai. DAST test environment mein chalti application par bahar se attack karta hai. IaC aur container image scanning, build fail karne wala quality gate, aur OIDC, signing aur protected branches se pipeline ko khud protect karna bhi jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Shift left: har SDLC stage par security check, delivery team ki ownership mein.</li>
<li>SAST, secret scanning, SCA/SBOM, image scanning, IaC scanning, DAST, IAST sabki apni jagah hai.</li>
<li>Quality gate scanning ko enforcement mein badalta hai.</li>
<li>Pipeline protect karo: OIDC tokens, signed artifacts, protected branches, ephemeral runners.</li>
<li>Sirf console nahi, IaC theek karo, warna agla run aapka fix undo kar dega.</li>
</ul></div>
`}};export{e as default};