var e={id:`providers-init`,h:{en:`Providers, terraform init and keeping secrets out of the files`,hi:`Providers, terraform init aur secrets ko files se bahar rakhna`},body:{en:`
<p>Terraform itself knows nothing about clouds or routers. It learns about them from <b>providers</b>. This chapter explains what a provider is, how to declare one, what <code>terraform init</code> does, and the most important safety rule: never put secrets in your .tf files.</p>

<h3>Analogy: a universal remote and its device codes</h3>
<p>A universal remote can control any TV, but only after you load the code for that brand. Terraform is the remote. A <b>provider</b> is the code for one brand: AWS, Azure, Google Cloud, Cisco platforms, DNS services, and many more. Each provider is a plugin that translates "I want a subnet" into the API calls of that platform. The resource type prefix tells you which provider owns it: <code>aws_vpc</code> belongs to the aws provider.</p>

<h3>Declaring the provider and its version</h3>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator): providers.tf</span>
terraform {
  required_version = "&gt;= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~&gt; 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}</pre>
<ul>
<li>The <code>terraform</code> block holds settings for Terraform itself. <code>required_version</code> says which Terraform versions may run this code.</li>
<li><code>required_providers</code> lists the plugins you need. <code>source = "hashicorp/aws"</code> is the plugin's name in the public registry (publisher slash name); you never type a web address.</li>
<li><code>version = "~&gt; 5.0"</code> is a <b>version constraint</b>: any 5.x release, but not 6.0. Pinning versions keeps a plan the same next month.</li>
<li>The <code>provider</code> block configures the plugin. Here only the region, taken from a variable (chapter 5).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Terraform core and providers">
<rect x="20" y="55" width="150" height="60" rx="10" fill="#bae6fd"/><text x="95" y="82" text-anchor="middle" class="svg-ink" font-size="14">Terraform core</text><text x="95" y="100" text-anchor="middle" class="svg-muted" font-size="12">reads .tf, plans</text>
<rect x="260" y="15" width="130" height="45" rx="10" fill="#fde68a"/><text x="325" y="43" text-anchor="middle" class="svg-ink" font-size="13">aws provider</text>
<rect x="260" y="70" width="130" height="45" rx="10" fill="#ddd6fe"/><text x="325" y="98" text-anchor="middle" class="svg-ink" font-size="13">iosxe provider</text>
<rect x="260" y="125" width="130" height="35" rx="10" fill="#fed7aa"/><text x="325" y="148" text-anchor="middle" class="svg-ink" font-size="13">dns provider</text>
<rect x="470" y="55" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="545" y="82" text-anchor="middle" class="svg-ink" font-size="14">Real platforms</text><text x="545" y="100" text-anchor="middle" class="svg-muted" font-size="12">cloud, devices, DNS</text>
<line x1="170" y1="85" x2="260" y2="38" stroke="#64748b" stroke-width="2"/><line x1="170" y1="85" x2="260" y2="92" stroke="#64748b" stroke-width="2"/><line x1="170" y1="85" x2="260" y2="142" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="38" x2="470" y2="80" stroke="#64748b" stroke-width="2"/><line x1="390" y1="92" x2="470" y2="88" stroke="#64748b" stroke-width="2"/><line x1="390" y1="142" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Core plans; providers talk to each platform.</p></div>

<h3>What terraform init does</h3>
<p>The first command in any folder is <code>terraform init</code>. It reads the <code>required_providers</code> list, downloads the matching plugins into a hidden <code>.terraform</code> folder, prepares the backend where state is kept (chapter 7), and writes a file called <code>.terraform.lock.hcl</code> that records the exact provider versions and checksums chosen. Commit the lock file to Git so your colleagues and your pipeline use the same plugin. Do not commit the <code>.terraform</code> folder itself.</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator): first commands in a new folder</span>
terraform init        <span class="c"># download providers, prepare backend</span>
terraform fmt         <span class="c"># tidy the formatting of the .tf files</span>
terraform validate    <span class="c"># check syntax and references, without touching anything real</span></pre>
<p><code>fmt</code> and <code>validate</code> are safe, fast and worth running on every change. They fit perfectly as the first two steps of a pipeline (module auto-cicd).</p>

<h3>Secrets: the rule that matters most</h3>
<p>Providers need credentials. <b>Never write a password, access key or token into a .tf file</b>, a .tfvars file that you commit, or an example. Files go to Git, and Git remembers forever. Safe patterns:</p>
<ul>
<li><b>Environment variables</b> read by the provider, for example the AWS provider reads the standard AWS key variables and region. Your shell or the pipeline's secret store sets them.</li>
<li><b>Short-lived credentials</b> from a role or single sign-on, so there is no long-lived key to leak.</li>
<li><b>Sensitive variables</b>: if a value must pass through Terraform, mark the variable <code>sensitive = true</code> (chapter 5) and supply it from a secret store or <code>TF_VAR_name</code> environment variable.</li>
<li>Add <code>*.tfstate</code>, <code>.terraform/</code> and any secrets file to <code>.gitignore</code>.</li>
</ul>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator): the shell supplies the secrets</span>
export AWS_ACCESS_KEY_ID="REPLACE_WITH_KEY_FROM_SECRET_STORE"
export AWS_SECRET_ACCESS_KEY="REPLACE_WITH_SECRET_FROM_SECRET_STORE"
export AWS_REGION="ap-south-1"</pre>
<p>The values above are obvious placeholders. In real life they come from your secret manager and never appear in the repository.</p>

<div class="eg"><p><b>Worked example.</b> A new engineer clones the repository and runs terraform init. Terraform reads the lock file and installs exactly the same aws provider version everyone else uses. They export their own short-lived credentials and run terraform validate. No secret was ever in the repository.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Committing a key "just for testing". Bots scan public and private repositories for keys within minutes. If a secret was ever committed, treat it as leaked: revoke it, then clean the history.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>terraform init</code> must be re-run when you add a provider, change a provider version constraint or change the backend. And remember that the state file can also contain secret values in plain text, so protect it as well.</p></div>

<div class="scn"><h4>The key in the example file</h4><p>A team kept a file variables.example.tf with a real access key "so newcomers could copy it". A scanner flagged it two days later. The key was revoked, an hour of cloud usage that nobody recognised was investigated, and the team moved to environment variables and a secret store with a pre-commit scanner.</p><p><b>Lesson:</b> the repository must be safe to publish at any moment.</p></div>

<div class="iv"><p class="q">"What does terraform init do and how do you handle provider credentials?"</p><p>Init downloads the required providers, sets up the backend and writes the dependency lock file. Credentials are never stored in code: use environment variables, a role or SSO, or a secret store in the pipeline, and mark sensitive variables as sensitive. Add state and local plugin folders to gitignore.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Providers are plugins that translate resources into platform API calls.</li>
<li>Pin provider versions; commit .terraform.lock.hcl.</li>
<li>terraform init downloads providers and prepares the backend; fmt and validate are safe checks.</li>
<li>Never put secrets in .tf or committed .tfvars files; use environment variables or a secret store.</li>
<li>Re-run init after changing providers or the backend.</li>
</ul></div>
`,hi:`
<p>Terraform ko khud clouds ya routers ke baare mein kuch nahi pata. Woh <b>providers</b> se seekhta hai. Yeh chapter samjhata hai provider kya hai, ise declare kaise karte hain, <code>terraform init</code> kya karta hai, aur sabse zaroori safety rule: .tf files mein kabhi secrets mat rakho.</p>

<h3>Analogy: universal remote aur device codes</h3>
<p>Universal remote koi bhi TV control kar sakta hai, par pehle us brand ka code load karna padta hai. Terraform remote hai. <b>Provider</b> ek brand ka code hai: AWS, Azure, Google Cloud, Cisco platforms, DNS services, aur bahut aur. Har provider ek plugin hai jo "mujhe subnet chahiye" ko us platform ke API calls mein badalta hai. Resource type ka prefix batata hai kaunsa provider maalik hai: <code>aws_vpc</code> aws provider ka hai.</p>

<h3>Provider aur uska version declare karna</h3>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua): providers.tf</span>
terraform {
  required_version = "&gt;= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~&gt; 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}</pre>
<ul>
<li><code>terraform</code> block Terraform ki apni settings rakhta hai. <code>required_version</code> batata hai kaunse Terraform versions yeh code chala sakte hain.</li>
<li><code>required_providers</code> aapko chahiye plugins ki list hai. <code>source = "hashicorp/aws"</code> public registry mein plugin ka naam hai (publisher slash naam); aap web address kabhi type nahi karte.</li>
<li><code>version = "~&gt; 5.0"</code> <b>version constraint</b> hai: koi bhi 5.x release, par 6.0 nahi. Versions pin karne se plan agle mahine bhi wahi rehta hai.</li>
<li><code>provider</code> block plugin ko configure karta hai. Yahan sirf region, variable se (chapter 5).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Terraform core aur providers">
<rect x="20" y="55" width="150" height="60" rx="10" fill="#bae6fd"/><text x="95" y="82" text-anchor="middle" class="svg-ink" font-size="14">Terraform core</text><text x="95" y="100" text-anchor="middle" class="svg-muted" font-size="12">.tf padhta, plan</text>
<rect x="260" y="15" width="130" height="45" rx="10" fill="#fde68a"/><text x="325" y="43" text-anchor="middle" class="svg-ink" font-size="13">aws provider</text>
<rect x="260" y="70" width="130" height="45" rx="10" fill="#ddd6fe"/><text x="325" y="98" text-anchor="middle" class="svg-ink" font-size="13">iosxe provider</text>
<rect x="260" y="125" width="130" height="35" rx="10" fill="#fed7aa"/><text x="325" y="148" text-anchor="middle" class="svg-ink" font-size="13">dns provider</text>
<rect x="470" y="55" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="545" y="82" text-anchor="middle" class="svg-ink" font-size="14">Asli platforms</text><text x="545" y="100" text-anchor="middle" class="svg-muted" font-size="12">cloud, devices, DNS</text>
<line x1="170" y1="85" x2="260" y2="38" stroke="#64748b" stroke-width="2"/><line x1="170" y1="85" x2="260" y2="92" stroke="#64748b" stroke-width="2"/><line x1="170" y1="85" x2="260" y2="142" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="38" x2="470" y2="80" stroke="#64748b" stroke-width="2"/><line x1="390" y1="92" x2="470" y2="88" stroke="#64748b" stroke-width="2"/><line x1="390" y1="142" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Core plan banata hai; providers har platform se baat karte hain.</p></div>

<h3>terraform init kya karta hai</h3>
<p>Kisi bhi folder mein pehla command <code>terraform init</code> hai. Woh <code>required_providers</code> list padhta hai, matching plugins ko hidden <code>.terraform</code> folder mein download karta hai, woh backend taiyar karta hai jahan state rakhi jaati hai (chapter 7), aur <code>.terraform.lock.hcl</code> file likhta hai jisme chune hue exact provider versions aur checksums hote hain. Lock file ko Git mein commit karo taaki colleagues aur pipeline wahi plugin use karein. <code>.terraform</code> folder commit mat karo.</p>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua): naye folder mein pehle commands</span>
terraform init        <span class="c"># providers download, backend taiyar</span>
terraform fmt         <span class="c"># .tf files ki formatting saaf karo</span>
terraform validate    <span class="c"># syntax aur references check, asli cheez ko chhue bina</span></pre>
<p><code>fmt</code> aur <code>validate</code> safe, tez aur har change par chalane layak hain. Yeh pipeline (module auto-cicd) ke pehle do steps ke roop mein bilkul fit hote hain.</p>

<h3>Secrets: sabse zaroori rule</h3>
<p>Providers ko credentials chahiye. <b>Password, access key ya token kabhi .tf file mein mat likho</b>, na committed .tfvars file mein, na example mein. Files Git mein jaati hain, aur Git hamesha yaad rakhta hai. Safe patterns:</p>
<ul>
<li><b>Environment variables</b> jo provider padhta hai, jaise AWS provider standard AWS key variables aur region padhta hai. Aapka shell ya pipeline ka secret store unhe set karta hai.</li>
<li>Role ya single sign-on se <b>short-lived credentials</b>, taaki leak hone wali koi lambi-umra key hi na ho.</li>
<li><b>Sensitive variables</b>: agar koi value Terraform se guzarni hi ho to variable ko <code>sensitive = true</code> mark karo (chapter 5) aur secret store ya <code>TF_VAR_name</code> environment variable se do.</li>
<li><code>*.tfstate</code>, <code>.terraform/</code> aur kisi bhi secrets file ko <code>.gitignore</code> mein daalo.</li>
</ul>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua): shell secrets deta hai</span>
export AWS_ACCESS_KEY_ID="REPLACE_WITH_KEY_FROM_SECRET_STORE"
export AWS_SECRET_ACCESS_KEY="REPLACE_WITH_SECRET_FROM_SECRET_STORE"
export AWS_REGION="ap-south-1"</pre>
<p>Upar ki values saaf placeholders hain. Real life mein woh aapke secret manager se aati hain aur repository mein kabhi nahi dikhti.</p>

<div class="eg"><p><b>Worked example.</b> Naya engineer repository clone karke terraform init chalata hai. Terraform lock file padhta hai aur bilkul wahi aws provider version install karta hai jo sab use karte hain. Woh apne short-lived credentials export karta hai aur terraform validate chalata hai. Repository mein koi secret kabhi tha hi nahi.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> "Sirf testing ke liye" key commit kar dena. Bots public aur private repositories mein minutes mein keys scan karte hain. Agar secret kabhi commit hua, use leaked maano: revoke karo, phir history saaf karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Provider add karne, provider version constraint badalne ya backend badalne par <code>terraform init</code> dobara chalana padta hai. Aur yaad rakho state file mein bhi secret values plain text mein ho sakti hain, use bhi protect karo.</p></div>

<div class="scn"><h4>Example file mein key</h4><p>Ek team ne variables.example.tf file mein asli access key rakhi thi "taaki newcomers copy kar sakein". Do din baad scanner ne flag kiya. Key revoke hui, ek ghante ki aisi cloud usage ki jaanch hui jise koi pehchanta nahi tha, aur team environment variables, secret store aur pre-commit scanner par shift ho gayi.</p><p><b>Lesson:</b> repository kisi bhi pal publish karne layak surakshit hona chahiye.</p></div>

<div class="iv"><p class="q">"terraform init kya karta hai aur provider credentials kaise sambhalte ho?"</p><p>Init zaroori providers download karta hai, backend set up karta hai aur dependency lock file likhta hai. Credentials code mein kabhi nahi: environment variables, role ya SSO, ya pipeline ka secret store use karo, aur sensitive variables ko sensitive mark karo. State aur local plugin folders ko gitignore mein daalo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Providers plugins hain jo resources ko platform API calls mein badalte hain.</li>
<li>Provider versions pin karo; .terraform.lock.hcl commit karo.</li>
<li>terraform init providers download karta aur backend taiyar karta hai; fmt aur validate safe checks hain.</li>
<li>Secrets kabhi .tf ya committed .tfvars mein nahi; environment variables ya secret store use karo.</li>
<li>Providers ya backend badalne ke baad init dobara chalao.</li>
</ul></div>
`}};export{e as default};