var e={id:`for-each-modules`,h:{en:`Many objects from one block: for_each, count and modules`,hi:`Ek block se kai objects: for_each, count aur modules`},body:{en:`
<p>A branch has two subnets today and will have ten next year. Copying a block ten times is error-prone. This chapter shows how one block can create many similar objects (<code>for_each</code> and <code>count</code>) and how a <b>module</b> packages a whole design so you can reuse it like a function.</p>

<h3>Analogy: a cookie cutter and a franchise manual</h3>
<p>A cookie cutter stamps many identical cookies from one shape; <code>for_each</code> is the cutter, the list of names is the dough. A <b>module</b> is a franchise manual: a complete, tested recipe for opening one shop, which you hand to every new city.</p>

<h3>for_each: one object per item of a map</h3>
<p>In chapter 4 we defined the variable <code>subnets</code> as a map of name to CIDR. We can create one subnet per entry:</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
resource "aws_subnet" "branch" {
  for_each   = var.subnets
  vpc_id     = aws_vpc.branch.id
  cidr_block = each.value
  tags = {
    Name = each.key
  }
}</pre>
<ul>
<li><code>for_each = var.subnets</code> tells Terraform: make one copy of this block for every entry in the map.</li>
<li><code>each.key</code> is the entry's name (users, servers); <code>each.value</code> is its CIDR block.</li>
<li>The objects get addresses like <code>aws_subnet.branch["users"]</code> and <code>aws_subnet.branch["servers"]</code>. The name is part of the address.</li>
</ul>
<p>To add a third subnet, add one line to the variable. The plan will show exactly one object to add and leave the others alone. To remove one, delete its line and the plan will show one destroy.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="for_each expands a map">
<rect x="15" y="40" width="190" height="90" rx="10" fill="#fde68a"/><text x="110" y="65" text-anchor="middle" class="svg-ink" font-size="13">map variable</text><text x="110" y="87" text-anchor="middle" class="svg-muted" font-size="12">users = 10.20.1.0/24</text><text x="110" y="107" text-anchor="middle" class="svg-muted" font-size="12">servers = 10.20.2.0/24</text>
<rect x="255" y="55" width="130" height="60" rx="10" fill="#bae6fd"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">one block</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">for_each</text>
<rect x="435" y="25" width="190" height="55" rx="10" fill="#bbf7d0"/><text x="530" y="58" text-anchor="middle" class="svg-ink" font-size="12">subnet["users"]</text>
<rect x="435" y="90" width="190" height="55" rx="10" fill="#bbf7d0"/><text x="530" y="123" text-anchor="middle" class="svg-ink" font-size="12">subnet["servers"]</text>
<line x1="205" y1="85" x2="255" y2="85" stroke="#64748b" stroke-width="2"/><line x1="385" y1="80" x2="435" y2="52" stroke="#64748b" stroke-width="2"/><line x1="385" y1="90" x2="435" y2="117" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One block, one object per map entry.</p></div>

<h3>count: a simple number of copies</h3>
<pre class="code">resource "aws_subnet" "spare" {
  count      = 2
  vpc_id     = aws_vpc.branch.id
  cidr_block = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
}</pre>
<p><code>count = 2</code> makes two copies, numbered by <code>count.index</code> starting from 0. <code>cidrsubnet</code> is a built-in function that cuts a smaller block out of a bigger one: from 10.20.0.0/16, adding 8 bits gives /24 blocks, and index 10 and 11 give 10.20.10.0/24 and 10.20.11.0/24. <b>Prefer for_each over count</b> for things that have names. With count the objects are numbered, so removing the first one shifts all the others and Terraform wants to rebuild them.</p>

<h3>Modules: reuse a whole design</h3>
<p>A <b>module</b> is simply a folder of .tf files that you call from another folder. The calling code is called the <b>root module</b>. You pass inputs as arguments, and read outputs back.</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator): root main.tf</span>
module "pune" {
  source   = "./modules/branch"
  vpc_cidr = "10.20.0.0/16"
  subnets  = { users = "10.20.1.0/24", servers = "10.20.2.0/24" }
}

module "nagpur" {
  source   = "./modules/branch"
  vpc_cidr = "10.21.0.0/16"
  subnets  = { users = "10.21.1.0/24" }
}

output "pune_vpc" {
  value = module.pune.vpc_id
}</pre>
<p>The folder <code>modules/branch</code> holds the VPC, the subnets and an <code>output "vpc_id"</code>. Two branches, one design. If you fix a mistake in the module, every branch gets the fix on its next plan. Modules can also come from a public registry or a private one; always pin the version you use.</p>

<h3>A word of caution</h3>
<p>Modules and loops make mistakes <b>bigger</b> as well as faster. One wrong CIDR in a module affects every branch. This is exactly why Terraform's plan step and code review exist.</p>

<div class="eg"><p><b>Worked example.</b> Deccan Net adds a Nagpur branch. The engineer copies four lines: a new module block with a new name, a new /16 and one subnet. The plan shows the new VPC and subnet only; Pune is untouched. Total effort: five minutes and one pull request.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Using count for named items and then deleting one from the middle: Terraform wants to destroy and recreate everything after it. Use for_each with stable keys. Another mistake: overlapping CIDRs between modules, which only shows up later when you connect the networks.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the difference: count gives objects numbered by index; for_each gives objects keyed by a string. Addresses look like thing[0] for count and thing["name"] for for_each. And a module's resources are addressed with a module. prefix, such as module.pune.aws_vpc.branch.</p></div>

<div class="scn"><h4>The count that rebuilt the firewall rules</h4><p>A team created six security rules with count. Someone removed the second rule from the list. The plan showed four rules destroyed and recreated, which would have dropped connections for a few seconds each. The reviewer caught it, and the team converted the code to for_each keyed by rule name; deleting one rule then showed exactly one destroy.</p><p><b>Lesson:</b> use stable names, not positions.</p></div>

<div class="iv"><p class="q">"When would you choose for_each over count, and what is a module?"</p><p>for_each when items have identity (names) because removing one affects only that one; count for plain repeats of identical items. A module is a reusable folder of Terraform code called with inputs and returning outputs, used to package a standard design such as a branch network and to keep environments consistent.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>for_each creates one object per map or set entry, addressed by key.</li>
<li>count creates numbered copies; prefer for_each for named items.</li>
<li>cidrsubnet carves smaller blocks out of a larger one.</li>
<li>A module is a reusable folder called with inputs and outputs.</li>
<li>Reuse multiplies mistakes as well as speed; always read the plan.</li>
</ul></div>
`,hi:`
<p>Ek branch ke aaj do subnets hain aur agle saal das honge. Block ko das baar copy karna galtiyon ka ghar hai. Yeh chapter dikhata hai ki ek block kaise kai similar objects bana sakta hai (<code>for_each</code> aur <code>count</code>) aur <b>module</b> poore design ko package karke function ki tarah reuse kaise karwata hai.</p>

<h3>Analogy: cookie cutter aur franchise manual</h3>
<p>Cookie cutter ek shape se kai ek jaise cookies stamp karta hai; <code>for_each</code> cutter hai, naamon ki list aata. <b>Module</b> franchise manual hai: ek shop kholne ki poori, tested recipe, jo aap har naye shehar ko dete ho.</p>

<h3>for_each: map ke har item ke liye ek object</h3>
<p>Chapter 4 mein humne variable <code>subnets</code> ko naam se CIDR ke map ke roop mein define kiya tha. Har entry ke liye ek subnet bana sakte hain:</p>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua)</span>
resource "aws_subnet" "branch" {
  for_each   = var.subnets
  vpc_id     = aws_vpc.branch.id
  cidr_block = each.value
  tags = {
    Name = each.key
  }
}</pre>
<ul>
<li><code>for_each = var.subnets</code> Terraform ko kehta hai: map ki har entry ke liye is block ki ek copy banao.</li>
<li><code>each.key</code> entry ka naam hai (users, servers); <code>each.value</code> uska CIDR block.</li>
<li>Objects ke address aise bante hain <code>aws_subnet.branch["users"]</code> aur <code>aws_subnet.branch["servers"]</code>. Naam address ka hissa hai.</li>
</ul>
<p>Teesra subnet jodne ke liye variable mein ek line jodo. Plan theek ek object add dikhayega aur baaki ko chhodega. Hatane ke liye uski line delete karo aur plan ek destroy dikhayega.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="for_each map ko failata hai">
<rect x="15" y="40" width="190" height="90" rx="10" fill="#fde68a"/><text x="110" y="65" text-anchor="middle" class="svg-ink" font-size="13">map variable</text><text x="110" y="87" text-anchor="middle" class="svg-muted" font-size="12">users = 10.20.1.0/24</text><text x="110" y="107" text-anchor="middle" class="svg-muted" font-size="12">servers = 10.20.2.0/24</text>
<rect x="255" y="55" width="130" height="60" rx="10" fill="#bae6fd"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">ek block</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">for_each</text>
<rect x="435" y="25" width="190" height="55" rx="10" fill="#bbf7d0"/><text x="530" y="58" text-anchor="middle" class="svg-ink" font-size="12">subnet["users"]</text>
<rect x="435" y="90" width="190" height="55" rx="10" fill="#bbf7d0"/><text x="530" y="123" text-anchor="middle" class="svg-ink" font-size="12">subnet["servers"]</text>
<line x1="205" y1="85" x2="255" y2="85" stroke="#64748b" stroke-width="2"/><line x1="385" y1="80" x2="435" y2="52" stroke="#64748b" stroke-width="2"/><line x1="385" y1="90" x2="435" y2="117" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek block, map ki har entry ke liye ek object.</p></div>

<h3>count: copies ki seedhi sankhya</h3>
<pre class="code">resource "aws_subnet" "spare" {
  count      = 2
  vpc_id     = aws_vpc.branch.id
  cidr_block = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
}</pre>
<p><code>count = 2</code> do copies banata hai, <code>count.index</code> se numbered, 0 se shuru. <code>cidrsubnet</code> built-in function hai jo bade block se chhota block kaatta hai: 10.20.0.0/16 se 8 bits jodne par /24 blocks milte hain, aur index 10 aur 11 se 10.20.10.0/24 aur 10.20.11.0/24 milte hain. Naam wali cheezon ke liye <b>count ki jagah for_each ko prefer karo</b>. Count mein objects numbered hote hain, isliye pehla hatane se baaki sab khisak jaate hain aur Terraform unhe dobara banana chahta hai.</p>

<h3>Modules: poora design reuse karo</h3>
<p><b>Module</b> bas .tf files ka folder hai jise aap doosre folder se bulate ho. Bulane wale code ko <b>root module</b> kehte hain. Inputs arguments ki tarah dete ho, aur outputs wapas padhte ho.</p>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua): root main.tf</span>
module "pune" {
  source   = "./modules/branch"
  vpc_cidr = "10.20.0.0/16"
  subnets  = { users = "10.20.1.0/24", servers = "10.20.2.0/24" }
}

module "nagpur" {
  source   = "./modules/branch"
  vpc_cidr = "10.21.0.0/16"
  subnets  = { users = "10.21.1.0/24" }
}

output "pune_vpc" {
  value = module.pune.vpc_id
}</pre>
<p>Folder <code>modules/branch</code> mein VPC, subnets aur ek <code>output "vpc_id"</code> hai. Do branches, ek design. Module mein galti theek karo to har branch ko agle plan par fix mil jaata hai. Modules public ya private registry se bhi aa sakte hain; jo version use karo use hamesha pin karo.</p>

<h3>Ek savdhani</h3>
<p>Modules aur loops galtiyon ko tez ke saath <b>bada</b> bhi karte hain. Module mein ek galat CIDR har branch ko affect karta hai. Isi liye Terraform ka plan step aur code review hote hain.</p>

<div class="eg"><p><b>Worked example.</b> Deccan Net Nagpur branch jodta hai. Engineer chaar lines copy karta hai: naye naam ka module block, naya /16 aur ek subnet. Plan sirf naya VPC aur subnet dikhata hai; Pune ko chhua bhi nahi. Kul mehnat: paanch minute aur ek pull request.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Naam wali cheezon ke liye count use karke beech se ek delete karna: Terraform uske baad ka sab destroy aur recreate karna chahta hai. Stable keys ke saath for_each use karo. Ek aur galti: modules ke beech overlapping CIDRs, jo tab dikhti hai jab baad mein networks jodte ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Farak jaano: count index se numbered objects deta hai; for_each string key se keyed objects. Addresses count ke liye thing[0] aur for_each ke liye thing["name"] jaise dikhte hain. Aur module ke resources module. prefix ke saath address hote hain, jaise module.pune.aws_vpc.branch.</p></div>

<div class="scn"><h4>Count jisne firewall rules rebuild kiye</h4><p>Ek team ne count se chhe security rules banaye. Kisi ne list se doosra rule hata diya. Plan ne chaar rules destroy aur recreate dikhaye, jisse har ek ke liye kuch seconds connections gir jaate. Reviewer ne pakda, aur team ne code ko rule ke naam se keyed for_each mein badal diya; ab ek rule hatane par theek ek destroy dikhta tha.</p><p><b>Lesson:</b> position nahi, stable naam use karo.</p></div>

<div class="iv"><p class="q">"for_each ko count par kab chunoge, aur module kya hai?"</p><p>for_each jab items ki pehchaan (naam) ho kyunki ek hatane se sirf wahi affect hota hai; count identical items ki seedhi repeats ke liye. Module Terraform code ka reusable folder hai jo inputs ke saath bulaya jaata hai aur outputs lautata hai, branch network jaise standard design ko package karne aur environments ko consistent rakhne ke liye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>for_each map ya set ki har entry ke liye ek object banata hai, key se addressed.</li>
<li>count numbered copies banata hai; named items ke liye for_each prefer karo.</li>
<li>cidrsubnet bade block se chhote blocks kaatta hai.</li>
<li>Module inputs aur outputs ke saath bulaya jaane wala reusable folder hai.</li>
<li>Reuse galtiyon ko bhi multiply karta hai; plan hamesha padho.</li>
</ul></div>
`}};export{e as default};