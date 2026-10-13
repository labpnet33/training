var e={id:`variables-outputs`,h:{en:`Variables, locals and outputs: reusable configuration`,hi:`Variables, locals aur outputs: reusable configuration`},body:{en:`
<p>Hard-coding "10.20.0.0/16" in five places is a trap: change it once and forget the other four. Terraform solves this with <b>input variables</b> (values you give), <b>locals</b> (values Terraform calculates once) and <b>outputs</b> (values Terraform hands back). This chapter turns our branch network into a reusable design.</p>

<h3>Analogy: a recipe card</h3>
<p>A recipe says "serves 4". If you cook for 8, you change one number, not every ingredient line by hand. <b>Variables</b> are the numbers at the top of the recipe. <b>Locals</b> are small helper calculations ("total flour = 2 x per-person flour"). <b>Outputs</b> are what the recipe tells you at the end ("the dish weighs 1.2 kg").</p>

<h3>Input variables</h3>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator): variables.tf</span>
variable "region" {
  type        = string
  description = "Cloud region for the branch network"
  default     = "ap-south-1"
}

variable "vpc_cidr" {
  type        = string
  description = "Address range of the branch VPC"
  default     = "10.20.0.0/16"
}

variable "subnets" {
  type        = map(string)
  description = "Subnet name and its CIDR block"
  default = {
    users   = "10.20.1.0/24"
    servers = "10.20.2.0/24"
  }
}</pre>
<ul>
<li><code>type</code> restricts what is accepted: string, number, bool, list(...), map(...). Terraform rejects a wrong type before touching anything.</li>
<li><code>description</code> is documentation for the next person.</li>
<li><code>default</code> is used if nobody supplies a value. Without a default the variable is required and Terraform asks for it.</li>
</ul>
<p>Inside the code you read a variable as <code>var.vpc_cidr</code>:</p>
<pre class="code">resource "aws_vpc" "branch" {
  cidr_block = var.vpc_cidr
}</pre>

<h3>Giving values: four ways, one winner</h3>
<table class="cmp"><tr><th>Source</th><th>Example</th><th>Typical use</th></tr>
<tr><td>default in the file</td><td>default = "ap-south-1"</td><td>safe fallback</td></tr>
<tr><td>terraform.tfvars file</td><td>vpc_cidr = "10.30.0.0/16"</td><td>one environment's values</td></tr>
<tr><td>command line</td><td>-var "vpc_cidr=10.30.0.0/16"</td><td>one-off override</td></tr>
<tr><td>environment variable</td><td>TF_VAR_vpc_cidr</td><td>pipelines and secrets</td></tr></table>
<p>Command-line values override the tfvars file, which overrides the default. Keep one tfvars file per environment, for example <code>prod.tfvars</code> and <code>lab.tfvars</code>, and pick it with <code>-var-file</code>. Do not put secrets in a committed tfvars file.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Variables in, outputs out">
<rect x="15" y="55" width="150" height="60" rx="10" fill="#fde68a"/><text x="90" y="82" text-anchor="middle" class="svg-ink" font-size="14">Variables</text><text x="90" y="100" text-anchor="middle" class="svg-muted" font-size="12">region, vpc_cidr</text>
<rect x="245" y="35" width="150" height="100" rx="12" fill="#bae6fd"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="14">Your .tf design</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">locals inside</text>
<rect x="475" y="55" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="550" y="82" text-anchor="middle" class="svg-ink" font-size="14">Outputs</text><text x="550" y="100" text-anchor="middle" class="svg-muted" font-size="12">vpc id, subnet ids</text>
<line x1="165" y1="85" x2="245" y2="85" stroke="#64748b" stroke-width="2"/><line x1="395" y1="85" x2="475" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Variables in, outputs out.</p></div>

<h3>Locals and outputs</h3>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
locals {
  common_tags = {
    Owner   = "network-team"
    Project = "deccan-branch"
  }
}

output "vpc_id" {
  description = "ID of the branch VPC"
  value       = aws_vpc.branch.id
}</pre>
<p>A <code>locals</code> block names a value once so you can reuse it as <code>local.common_tags</code>. An <code>output</code> block prints a value after apply and makes it available to other Terraform folders and to scripts. Outputs are how one team's Terraform hands the VPC id to another team's.</p>

<h3>Sensitive values</h3>
<pre class="code">variable "bgp_password" {
  type      = string
  sensitive = true       <span class="c"># Terraform hides it in plan and apply output</span>
}</pre>
<p>Marking a variable sensitive hides it from the screen, but it can still be stored in the state file, so protect the state (chapter 7). Supply the value through the environment, for example <code>TF_VAR_bgp_password</code>, from your secret store.</p>

<div class="eg"><p><b>Worked example.</b> To build a lab copy of the branch in a different range, run with <code>-var "vpc_cidr=10.30.0.0/16"</code>. No file is edited. The same code now builds a second, non-overlapping network, and the output vpc_id tells you which VPC it made.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Using a variable but forgetting to declare it, or declaring it but never using it. <code>terraform validate</code> catches the first. Another mistake is putting a real secret in <code>default</code>; a default is visible to everyone who can read the code.</p></div>
<div class="exam"><p><b>Exam trap.</b> Precedence: command-line values beat tfvars, which beat defaults. Also, <code>sensitive = true</code> hides display only; it does not encrypt the state.</p></div>

<div class="scn"><h4>The overlapping lab</h4><p>A team built a lab VPC from production code and forgot to change the address range. When someone later connected the two for testing, routes overlapped and traffic went to the wrong place. After this they made the range a required variable with no default, so every new environment had to choose a range on purpose.</p><p><b>Lesson:</b> a required variable is a deliberate decision that nobody can forget.</p></div>

<div class="iv"><p class="q">"How do you make a Terraform design reusable across environments?"</p><p>Replace hard-coded values with typed, documented input variables, supply per-environment values through tfvars files or pipeline variables, use locals for shared calculations and outputs to expose ids. Keep secrets in a secret store and mark them sensitive.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Variables are inputs (var.name); locals are named calculations (local.name); outputs are results.</li>
<li>Typed variables fail early on wrong values.</li>
<li>Value sources: default, tfvars, -var, TF_VAR environment variable; command line wins.</li>
<li>sensitive = true hides values on screen but not in state.</li>
<li>One tfvars file per environment keeps code identical and data separate.</li>
</ul></div>
`,hi:`
<p>"10.20.0.0/16" ko paanch jagah hard-code karna jaal hai: ek jagah badla aur baaki chaar bhool gaye. Terraform iska hal deta hai <b>input variables</b> (jo values aap dete ho), <b>locals</b> (jo Terraform ek baar calculate karta hai) aur <b>outputs</b> (jo Terraform wapas deta hai) se. Yeh chapter hamare branch network ko reusable design bana deta hai.</p>

<h3>Analogy: recipe card</h3>
<p>Recipe kehti hai "4 logon ke liye". 8 ke liye banana ho to aap ek number badalte ho, har ingredient line haath se nahi. <b>Variables</b> recipe ke upar ke numbers hain. <b>Locals</b> chhoti helper calculations hain ("total aata = 2 x per-person aata"). <b>Outputs</b> woh hain jo recipe ant mein batati hai ("dish ka vajan 1.2 kg").</p>

<h3>Input variables</h3>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua): variables.tf</span>
variable "region" {
  type        = string
  description = "Cloud region for the branch network"
  default     = "ap-south-1"
}

variable "vpc_cidr" {
  type        = string
  description = "Address range of the branch VPC"
  default     = "10.20.0.0/16"
}

variable "subnets" {
  type        = map(string)
  description = "Subnet name and its CIDR block"
  default = {
    users   = "10.20.1.0/24"
    servers = "10.20.2.0/24"
  }
}</pre>
<ul>
<li><code>type</code> restrict karta hai kya accept hoga: string, number, bool, list(...), map(...). Galat type ko Terraform kuch chhune se pehle reject kar deta hai.</li>
<li><code>description</code> agle insaan ke liye documentation hai.</li>
<li><code>default</code> tab use hota hai jab koi value na de. Default ke bina variable required hai aur Terraform use maangta hai.</li>
</ul>
<p>Code ke andar variable ko <code>var.vpc_cidr</code> ke roop mein padhte hain:</p>
<pre class="code">resource "aws_vpc" "branch" {
  cidr_block = var.vpc_cidr
}</pre>

<h3>Values dena: chaar tareeke, ek jeetta hai</h3>
<table class="cmp"><tr><th>Source</th><th>Example</th><th>Aam use</th></tr>
<tr><td>file mein default</td><td>default = "ap-south-1"</td><td>safe fallback</td></tr>
<tr><td>terraform.tfvars file</td><td>vpc_cidr = "10.30.0.0/16"</td><td>ek environment ki values</td></tr>
<tr><td>command line</td><td>-var "vpc_cidr=10.30.0.0/16"</td><td>ek baar ka override</td></tr>
<tr><td>environment variable</td><td>TF_VAR_vpc_cidr</td><td>pipelines aur secrets</td></tr></table>
<p>Command-line values tfvars file ko override karti hain, jo default ko. Har environment ke liye ek tfvars file rakho, jaise <code>prod.tfvars</code> aur <code>lab.tfvars</code>, aur <code>-var-file</code> se chuno. Committed tfvars file mein secrets mat rakho.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Variables andar, outputs bahar">
<rect x="15" y="55" width="150" height="60" rx="10" fill="#fde68a"/><text x="90" y="82" text-anchor="middle" class="svg-ink" font-size="14">Variables</text><text x="90" y="100" text-anchor="middle" class="svg-muted" font-size="12">region, vpc_cidr</text>
<rect x="245" y="35" width="150" height="100" rx="12" fill="#bae6fd"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="14">Aapka .tf design</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">andar locals</text>
<rect x="475" y="55" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="550" y="82" text-anchor="middle" class="svg-ink" font-size="14">Outputs</text><text x="550" y="100" text-anchor="middle" class="svg-muted" font-size="12">vpc id, subnet ids</text>
<line x1="165" y1="85" x2="245" y2="85" stroke="#64748b" stroke-width="2"/><line x1="395" y1="85" x2="475" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Variables andar, outputs bahar.</p></div>

<h3>Locals aur outputs</h3>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua)</span>
locals {
  common_tags = {
    Owner   = "network-team"
    Project = "deccan-branch"
  }
}

output "vpc_id" {
  description = "ID of the branch VPC"
  value       = aws_vpc.branch.id
}</pre>
<p><code>locals</code> block ek value ko ek baar naam deta hai taaki use <code>local.common_tags</code> ke roop mein reuse kar sako. <code>output</code> block apply ke baad value print karta hai aur use dusre Terraform folders aur scripts ke liye available karata hai. Outputs se hi ek team ka Terraform VPC id doosri team ke Terraform ko deta hai.</p>

<h3>Sensitive values</h3>
<pre class="code">variable "bgp_password" {
  type      = string
  sensitive = true       <span class="c"># Terraform plan aur apply output mein ise chhupata hai</span>
}</pre>
<p>Variable ko sensitive mark karne se woh screen par chhup jaata hai, par state file mein phir bhi store ho sakta hai, isliye state ko protect karo (chapter 7). Value environment se do, jaise <code>TF_VAR_bgp_password</code>, apne secret store se.</p>

<div class="eg"><p><b>Worked example.</b> Branch ki lab copy alag range mein banane ke liye <code>-var "vpc_cidr=10.30.0.0/16"</code> ke saath chalao. Koi file edit nahi hoti. Wahi code ab doosra, non-overlapping network banata hai, aur output vpc_id batata hai kaunsa VPC bana.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Variable use karna par declare karna bhool jaana, ya declare karna par kabhi use na karna. <code>terraform validate</code> pehla pakadta hai. Ek aur galti: <code>default</code> mein asli secret rakhna; default code padhne wale har insaan ko dikhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Precedence: command-line values tfvars ko haraati hain, jo defaults ko. Aur <code>sensitive = true</code> sirf display chhupata hai; state ko encrypt nahi karta.</p></div>

<div class="scn"><h4>Overlap hota lab</h4><p>Ek team ne production code se lab VPC banaya aur address range badalna bhool gayi. Baad mein jab kisi ne testing ke liye dono jode, routes overlap hue aur traffic galat jagah gaya. Iske baad unhone range ko bina default ka required variable bana diya, taaki har naye environment ko jaan-boojh kar range chunni pade.</p><p><b>Lesson:</b> required variable ek soch-samajh ka faisla hai jise koi bhool nahi sakta.</p></div>

<div class="iv"><p class="q">"Terraform design ko environments ke beech reusable kaise banate ho?"</p><p>Hard-coded values ko typed, documented input variables se badlo, per-environment values tfvars files ya pipeline variables se do, shared calculations ke liye locals aur ids expose karne ke liye outputs use karo. Secrets secret store mein rakho aur sensitive mark karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Variables inputs hain (var.name); locals named calculations (local.name); outputs results.</li>
<li>Typed variables galat values par jaldi fail hote hain.</li>
<li>Value sources: default, tfvars, -var, TF_VAR environment variable; command line jeetti hai.</li>
<li>sensitive = true screen par chhupata hai, state mein nahi.</li>
<li>Har environment ke liye ek tfvars file code ko identical aur data ko alag rakhti hai.</li>
</ul></div>
`}};export{e as default};