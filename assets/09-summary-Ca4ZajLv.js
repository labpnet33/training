var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now read a Terraform project and explain what it will do. This chapter gathers the whole module on one page: the can-do checklist, glossary, most-tested facts and a cheat sheet. Everything here is reference material; the simulator has no Terraform program, so to build the neighbouring skills practise in auto-git (version control), auto-ansible (declarative device config), auto-cicd (plan and apply from a pipeline), auto-ssh and cloud-vpc.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Terraform module map">
<rect x="10" y="40" width="100" height="60" rx="10" fill="#bae6fd"/><text x="60" y="66" text-anchor="middle" class="svg-ink" font-size="12">HCL</text><text x="60" y="84" text-anchor="middle" class="svg-muted" font-size="11">blocks, args</text>
<rect x="125" y="40" width="100" height="60" rx="10" fill="#fde68a"/><text x="175" y="66" text-anchor="middle" class="svg-ink" font-size="12">providers</text><text x="175" y="84" text-anchor="middle" class="svg-muted" font-size="11">init, lock file</text>
<rect x="240" y="40" width="100" height="60" rx="10" fill="#ddd6fe"/><text x="290" y="66" text-anchor="middle" class="svg-ink" font-size="12">variables</text><text x="290" y="84" text-anchor="middle" class="svg-muted" font-size="11">in / out</text>
<rect x="355" y="40" width="100" height="60" rx="10" fill="#fed7aa"/><text x="405" y="66" text-anchor="middle" class="svg-ink" font-size="12">plan, apply</text><text x="405" y="84" text-anchor="middle" class="svg-muted" font-size="11">review first</text>
<rect x="470" y="40" width="160" height="60" rx="10" fill="#bbf7d0"/><text x="550" y="66" text-anchor="middle" class="svg-ink" font-size="12">state, drift</text><text x="550" y="84" text-anchor="middle" class="svg-muted" font-size="11">remote, locked</text>
<line x1="110" y1="70" x2="125" y2="70" stroke="#64748b" stroke-width="2"/><line x1="225" y1="70" x2="240" y2="70" stroke="#64748b" stroke-width="2"/><line x1="340" y1="70" x2="355" y2="70" stroke="#64748b" stroke-width="2"/><line x1="455" y1="70" x2="470" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The whole module on one line.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain declarative versus imperative with an example.</li>
<li>Read a resource block: type, local name, arguments, address.</li>
<li>Reference one resource from another and explain the dependency graph.</li>
<li>Declare a provider with a pinned version and say what the lock file does.</li>
<li>Keep secrets out of .tf files using environment variables or a secret store.</li>
<li>Write typed variables, locals and outputs; list the ways to give values and their precedence.</li>
<li>Use for_each and count correctly; describe a module.</li>
<li>Run init, fmt, validate, plan, apply and destroy in the right order and read the plan symbols.</li>
<li>Explain state, remote backend, locking, drift and import.</li>
<li>Follow the troubleshooting workflow: stage, message, inputs, state, one change.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>HCL</dt><dd>HashiCorp Configuration Language, the syntax of .tf files.</dd>
<dt>Provider</dt><dd>Plugin that lets Terraform manage one platform.</dd>
<dt>Resource</dt><dd>A block describing one managed object.</dd>
<dt>Data source</dt><dd>A read-only lookup of something that already exists.</dd>
<dt>Variable / local / output</dt><dd>Input value / named calculation / returned result.</dd>
<dt>Module</dt><dd>A reusable folder of Terraform code called with inputs.</dd>
<dt>State</dt><dd>Terraform's record linking code to real objects.</dd>
<dt>Backend</dt><dd>Where state is stored, ideally remote, encrypted and locked.</dd>
<dt>Plan</dt><dd>The computed difference between code and reality.</dd>
<dt>Drift</dt><dd>Real world changed outside Terraform.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>Terraform is declarative: you state the end result; it works out the steps.</li>
<li>Order: init, validate, plan, apply. plan changes nothing; apply a saved plan applies exactly it.</li>
<li>Plan symbols: + create, ~ update in place, - destroy, -/+ replace.</li>
<li>Variable value precedence: command line over tfvars over default.</li>
<li>State may hold secrets in clear text: never commit it, use an encrypted remote backend with locking.</li>
<li>Commit the .terraform.lock.hcl file; do not commit the .terraform folder or state.</li>
<li>Prefer for_each over count for named items; renames need a moved block.</li>
<li>Manual changes to managed objects cause drift.</li>
</ul>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
terraform init                  <span class="c"># providers and backend</span>
terraform fmt                   <span class="c"># format files</span>
terraform validate              <span class="c"># syntax and references</span>
terraform plan -out=tfplan      <span class="c"># preview, save</span>
terraform apply tfplan          <span class="c"># make exactly that plan</span>
terraform destroy               <span class="c"># remove managed objects</span>
terraform state list            <span class="c"># what is managed</span>
terraform output                <span class="c"># show outputs</span>
terraform plan -refresh-only    <span class="c"># look at drift</span></pre>

<div class="eg"><p><b>Worked example.</b> Interview: "Walk me through creating a VPC with two subnets using Terraform." Answer: declare the provider with a pinned version, define variables for the region and CIDR blocks, write the VPC resource and a for_each subnet resource referencing the VPC id, add an output, run init, validate, plan, review, apply, and keep the state in a locked remote backend with the code in Git.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Learning the commands but skipping the habits: version control, plan review, secrets hygiene and a shared locked state. The habits are what keep real networks safe.</p></div>
<div class="exam"><p><b>Exam trap.</b> Compare tools correctly: Terraform for lifecycle of infrastructure with a state file; Ansible for agent-less configuration and orchestration; both are described as declarative in spirit, but only Terraform is built around state and plan.</p></div>

<div class="scn"><h4>The pipeline that guards the cloud</h4><p>A bank's network team runs fmt, validate and plan on every pull request. The plan is posted as a comment; two reviewers must approve; only the pipeline's role may apply, using a remote locked state. A nightly plan raises an alert if drift appears. In a year they had no outage from a Terraform change, and every network change had a Git record.</p><p><b>Lesson:</b> Terraform is powerful when wrapped in process.</p></div>

<div class="iv"><p class="q">"Summarise how you would manage cloud networking as code safely."</p><p>Define it in Terraform in Git, use modules and variables per environment, keep secrets in a secret store, run fmt, validate and plan in a pull request pipeline, require review of the plan before apply, store state in an encrypted locked remote backend, and monitor drift with scheduled plans.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Describe the end state; review the plan; apply; keep state safe.</li>
<li>Providers, variables, outputs, for_each and modules make designs reusable.</li>
<li>Secrets never go in code or in Git; state can contain them too.</li>
<li>Drift is manual change; schedule plans to spot it.</li>
<li>Practise the surrounding skills in auto-git, auto-ansible, auto-cicd, auto-ssh and cloud-vpc.</li>
</ul></div>
`,hi:`
<p>Ab aap Terraform project padh sakte ho aur samjha sakte ho woh kya karega. Yeh chapter poore module ko ek page par jama karta hai: can-do checklist, glossary, sabse zyada pooche jaane wale facts aur cheat sheet. Yahan sab reference material hai; simulator mein Terraform program nahi hai, isliye aas-paas ke skills banane ke liye auto-git (version control), auto-ansible (declarative device config), auto-cicd (pipeline se plan aur apply), auto-ssh aur cloud-vpc mein practise karo.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Terraform module map">
<rect x="10" y="40" width="100" height="60" rx="10" fill="#bae6fd"/><text x="60" y="66" text-anchor="middle" class="svg-ink" font-size="12">HCL</text><text x="60" y="84" text-anchor="middle" class="svg-muted" font-size="11">blocks, args</text>
<rect x="125" y="40" width="100" height="60" rx="10" fill="#fde68a"/><text x="175" y="66" text-anchor="middle" class="svg-ink" font-size="12">providers</text><text x="175" y="84" text-anchor="middle" class="svg-muted" font-size="11">init, lock file</text>
<rect x="240" y="40" width="100" height="60" rx="10" fill="#ddd6fe"/><text x="290" y="66" text-anchor="middle" class="svg-ink" font-size="12">variables</text><text x="290" y="84" text-anchor="middle" class="svg-muted" font-size="11">in / out</text>
<rect x="355" y="40" width="100" height="60" rx="10" fill="#fed7aa"/><text x="405" y="66" text-anchor="middle" class="svg-ink" font-size="12">plan, apply</text><text x="405" y="84" text-anchor="middle" class="svg-muted" font-size="11">pehle review</text>
<rect x="470" y="40" width="160" height="60" rx="10" fill="#bbf7d0"/><text x="550" y="66" text-anchor="middle" class="svg-ink" font-size="12">state, drift</text><text x="550" y="84" text-anchor="middle" class="svg-muted" font-size="11">remote, locked</text>
<line x1="110" y1="70" x2="125" y2="70" stroke="#64748b" stroke-width="2"/><line x1="225" y1="70" x2="240" y2="70" stroke="#64748b" stroke-width="2"/><line x1="340" y1="70" x2="355" y2="70" stroke="#64748b" stroke-width="2"/><line x1="455" y1="70" x2="470" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Poora module ek line mein.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Declarative aur imperative ko example se samjhao.</li>
<li>Resource block padho: type, local name, arguments, address.</li>
<li>Ek resource ko doosre se reference karo aur dependency graph samjhao.</li>
<li>Pinned version ke saath provider declare karo aur batao lock file kya karti hai.</li>
<li>Environment variables ya secret store se secrets ko .tf files se bahar rakho.</li>
<li>Typed variables, locals aur outputs likho; values dene ke tareeke aur unki precedence batao.</li>
<li>for_each aur count sahi use karo; module describe karo.</li>
<li>init, fmt, validate, plan, apply aur destroy sahi order mein chalao aur plan ke symbols padho.</li>
<li>State, remote backend, locking, drift aur import samjhao.</li>
<li>Troubleshooting workflow follow karo: stage, message, inputs, state, ek change.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>HCL</dt><dd>HashiCorp Configuration Language, .tf files ka syntax.</dd>
<dt>Provider</dt><dd>Plugin jo Terraform ko ek platform manage karne deta hai.</dd>
<dt>Resource</dt><dd>Ek managed object describe karne wala block.</dd>
<dt>Data source</dt><dd>Jo pehle se maujood hai uska read-only lookup.</dd>
<dt>Variable / local / output</dt><dd>Input value / named calculation / lautaya hua result.</dd>
<dt>Module</dt><dd>Terraform code ka reusable folder jo inputs ke saath bulaya jaata hai.</dd>
<dt>State</dt><dd>Terraform ka record jo code ko asli objects se jodta hai.</dd>
<dt>Backend</dt><dd>Jahan state store hoti hai, behtar ho remote, encrypted aur locked.</dd>
<dt>Plan</dt><dd>Code aur reality ke beech computed farak.</dd>
<dt>Drift</dt><dd>Asli duniya Terraform ke bahar badli.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li>Terraform declarative hai: aap end result batate ho; woh steps khud nikalta hai.</li>
<li>Order: init, validate, plan, apply. plan kuch nahi badalta; saved plan ka apply theek wahi plan apply karta hai.</li>
<li>Plan symbols: + create, ~ jagah par update, - destroy, -/+ replace.</li>
<li>Variable value precedence: command line, phir tfvars, phir default.</li>
<li>State mein secrets clear text mein ho sakte hain: kabhi commit mat karo, locking wala encrypted remote backend use karo.</li>
<li>.terraform.lock.hcl file commit karo; .terraform folder ya state commit mat karo.</li>
<li>Named items ke liye count se for_each prefer karo; renames ke liye moved block chahiye.</li>
<li>Managed objects par manual changes drift banate hain.</li>
</ul>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua)</span>
terraform init                  <span class="c"># providers aur backend</span>
terraform fmt                   <span class="c"># files format</span>
terraform validate              <span class="c"># syntax aur references</span>
terraform plan -out=tfplan      <span class="c"># preview, save</span>
terraform apply tfplan          <span class="c"># theek wahi plan karo</span>
terraform destroy               <span class="c"># managed objects hatao</span>
terraform state list            <span class="c"># kya managed hai</span>
terraform output                <span class="c"># outputs dikhao</span>
terraform plan -refresh-only    <span class="c"># drift dekho</span></pre>

<div class="eg"><p><b>Worked example.</b> Interview: "Terraform se do subnets wala VPC banane ka process samjhao." Jawab: provider pinned version ke saath declare karo, region aur CIDR blocks ke liye variables define karo, VPC resource aur VPC id ko reference karne wala for_each subnet resource likho, ek output jodo, init, validate, plan, review, apply chalao, aur state locked remote backend mein aur code Git mein rakho.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Commands seekhna par aadatein chhod dena: version control, plan review, secrets hygiene aur shared locked state. Aadatein hi asli networks ko safe rakhti hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tools ko sahi compare karo: infrastructure ke lifecycle ke liye state file ke saath Terraform; agent-less configuration aur orchestration ke liye Ansible; dono spirit mein declarative kahe jaate hain, par sirf Terraform state aur plan ke gird bana hai.</p></div>

<div class="scn"><h4>Pipeline jo cloud ki raksha karta hai</h4><p>Ek bank ki network team har pull request par fmt, validate aur plan chalati hai. Plan comment ke roop mein post hota hai; do reviewers ko approve karna hota hai; sirf pipeline ka role apply kar sakta hai, remote locked state ke saath. Raat ka plan drift dikhe to alert uthata hai. Ek saal mein Terraform change se koi outage nahi hua, aur har network change ka Git record tha.</p><p><b>Lesson:</b> Terraform process mein lipta ho tab taakatwar hai.</p></div>

<div class="iv"><p class="q">"Cloud networking ko code ke roop mein safely kaise manage karoge, summarise karo."</p><p>Use Terraform mein Git mein define karo, har environment ke liye modules aur variables, secrets secret store mein, pull request pipeline mein fmt, validate aur plan chalao, apply se pehle plan ka review zaroori, state encrypted locked remote backend mein, aur scheduled plans se drift monitor karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>End state describe karo; plan review karo; apply karo; state surakshit rakho.</li>
<li>Providers, variables, outputs, for_each aur modules designs ko reusable banate hain.</li>
<li>Secrets kabhi code ya Git mein nahi; state mein bhi ho sakte hain.</li>
<li>Drift manual change hai; use pakadne ke liye scheduled plans chalao.</li>
<li>Aas-paas ke skills auto-git, auto-ansible, auto-cicd, auto-ssh aur cloud-vpc mein practise karo.</li>
</ul></div>
`}};export{e as default};