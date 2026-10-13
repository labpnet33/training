var e={id:`hcl-resources`,h:{en:`HCL basics: blocks, arguments and your first resources`,hi:`HCL basics: blocks, arguments aur aapke pehle resources`},body:{en:`
<p>Terraform files look strange until you see how little there is to learn. HCL is built from only two ideas: <b>blocks</b> and <b>arguments</b>. This chapter teaches both, then writes the first two resources of our cloud branch: a VPC and a subnet.</p>

<h3>Analogy: a form with sections</h3>
<p>Think of a paper form. It has sections ("Personal details", "Address"). Inside each section are labelled fields ("Name: Asha"). An HCL <b>block</b> is a section; an <b>argument</b> is a labelled field inside it. That is all the grammar you need.</p>

<h3>The shape of a block</h3>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator): main.tf</span>
resource "aws_vpc" "branch" {
  cidr_block = "10.20.0.0/16"
  tags = {
    Name = "deccan-branch"
  }
}</pre>
<ul>
<li><code>resource</code> is the <b>block type</b>: it says "I want to manage a thing".</li>
<li><code>"aws_vpc"</code> is the <b>resource type</b>: what kind of thing. The prefix <code>aws</code> says which provider owns it (more in chapter 3).</li>
<li><code>"branch"</code> is the <b>local name</b>, a label you choose so other parts of the file can point at this object.</li>
<li>Inside the curly braces are <b>arguments</b>, written <code>name = value</code>. Here <code>cidr_block</code> is a string with the address range.</li>
<li><code>tags</code> takes a <b>map</b>, a set of key and value pairs in braces.</li>
<li>Anything after <code>#</code> is a comment.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Anatomy of a resource block">
<rect x="90" y="15" width="460" height="160" rx="12" fill="#e2e8f0"/>
<text x="110" y="42" class="svg-ink" font-size="13">resource  "aws_vpc"  "branch"  {</text>
<text x="130" y="70" class="svg-ink" font-size="13">cidr_block = "10.20.0.0/16"</text>
<text x="130" y="95" class="svg-ink" font-size="13">tags = { Name = "deccan-branch" }</text>
<text x="110" y="120" class="svg-ink" font-size="13">}</text>
<text x="590" y="42" text-anchor="end" class="svg-accent" font-size="11">block type, resource type, local name</text>
<text x="590" y="70" text-anchor="end" class="svg-accent" font-size="11">argument</text>
<text x="590" y="150" text-anchor="middle" class="svg-muted" font-size="12">address of this object: aws_vpc.branch</text>
</svg><p class="cap">Block type, resource type, local name, then arguments.</p></div>

<h3>Value types you will meet</h3>
<table class="cmp"><tr><th>Type</th><th>Example</th><th>Used for</th></tr>
<tr><td>string</td><td><code>"10.20.0.0/16"</code></td><td>names, CIDR blocks</td></tr>
<tr><td>number</td><td><code>2</code></td><td>counts, sizes</td></tr>
<tr><td>bool</td><td><code>true</code></td><td>on and off switches</td></tr>
<tr><td>list</td><td><code>["a", "b"]</code></td><td>ordered collections</td></tr>
<tr><td>map</td><td><code>{ Name = "x" }</code></td><td>key and value tags</td></tr></table>

<h3>Referencing one resource from another</h3>
<p>A subnet must live inside a VPC. We do not copy the VPC's ID (we do not even know it until the VPC exists). We <b>refer</b> to it by its address: resource type, a dot, local name, a dot, attribute.</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
resource "aws_subnet" "users" {
  vpc_id     = aws_vpc.branch.id
  cidr_block = "10.20.1.0/24"
  tags = {
    Name = "users"
  }
}</pre>
<p><code>aws_vpc.branch.id</code> means "the id attribute of the aws_vpc named branch". Terraform sees this reference and works out the <b>dependency</b>: the VPC must be created first, because the subnet needs its id. You never write the order yourself; Terraform builds a graph from the references and creates things in the right order, in parallel where it can.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Dependency graph">
<rect x="40" y="35" width="160" height="55" rx="10" fill="#bae6fd"/><text x="120" y="68" text-anchor="middle" class="svg-ink" font-size="13">aws_vpc.branch</text>
<rect x="440" y="35" width="160" height="55" rx="10" fill="#bbf7d0"/><text x="520" y="68" text-anchor="middle" class="svg-ink" font-size="13">aws_subnet.users</text>
<line x1="200" y1="62" x2="440" y2="62" stroke="#64748b" stroke-width="2"/><text x="320" y="55" text-anchor="middle" class="svg-accent" font-size="12">vpc_id = aws_vpc.branch.id</text>
<text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">the reference creates the order: VPC first, subnet second</text>
</svg><p class="cap">References build the dependency graph.</p></div>

<h3>File layout</h3>
<p>Terraform reads <b>every</b> .tf file in the folder together, so the file names are for humans. A common layout is <code>main.tf</code> (resources), <code>variables.tf</code>, <code>outputs.tf</code> and <code>providers.tf</code>. Keep one folder per environment or per project.</p>

<div class="eg"><p><b>Worked example.</b> Add a second subnet for servers: copy the subnet block, change the local name to <code>servers</code> and the CIDR to 10.20.2.0/24. Both point at aws_vpc.branch.id. Terraform will create the VPC, then both subnets at the same time, because the subnets do not depend on each other.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Typing the argument value of another resource by hand, such as a made-up VPC ID. Always use a reference. Another mistake is changing the <i>local name</i> of a resource later: Terraform treats it as "destroy the old object and create a new one" unless you tell it the two names are the same thing.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the three names in a resource block: type, local name, and the real name the platform shows (often set through tags). The address used in references is type.localname, never the Name tag.</p></div>

<div class="scn"><h4>The rename that deleted a network</h4><p>An engineer tidied a file by renaming the local name of a production subnet from "users" to "user_lan". The plan showed one destroy and one create. A reviewer noticed the red minus line before approval. They added a moved block so Terraform understood it was the same subnet, and the plan became "no changes".</p><p><b>Lesson:</b> read the plan; renames are not harmless.</p></div>

<div class="iv"><p class="q">"How does Terraform decide the order in which to create resources?"</p><p>It builds a dependency graph from references between resources, for example a subnet using the VPC's id. Resources with no dependency between them are created in parallel. You can force an order with depends_on, but references are preferred because they are explicit and self-documenting.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HCL has blocks (sections) and arguments (name = value).</li>
<li>A resource block has a type and a local name; its address is type.localname.</li>
<li>Reference attributes like aws_vpc.branch.id instead of typing IDs.</li>
<li>References create the dependency graph and the creation order.</li>
<li>Terraform reads all .tf files in a folder together.</li>
</ul></div>
`,hi:`
<p>Terraform files tab tak ajeeb lagti hain jab tak aap dekhte nahi ki seekhne ko kitna kam hai. HCL sirf do ideas se bani hai: <b>blocks</b> aur <b>arguments</b>. Yeh chapter dono sikhata hai, phir hamare cloud branch ke pehle do resources likhta hai: ek VPC aur ek subnet.</p>

<h3>Analogy: sections wala form</h3>
<p>Kaagaz ka form socho. Usme sections hote hain ("Personal details", "Address"). Har section ke andar labelled fields ("Name: Asha"). HCL <b>block</b> ek section hai; <b>argument</b> uske andar ka labelled field. Itna hi grammar chahiye.</p>

<h3>Block ki shape</h3>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua): main.tf</span>
resource "aws_vpc" "branch" {
  cidr_block = "10.20.0.0/16"
  tags = {
    Name = "deccan-branch"
  }
}</pre>
<ul>
<li><code>resource</code> <b>block type</b> hai: kehta hai "main ek cheez manage karna chahta hoon".</li>
<li><code>"aws_vpc"</code> <b>resource type</b> hai: kis tarah ki cheez. Prefix <code>aws</code> batata hai kaunsa provider iska maalik hai (chapter 3 mein aur).</li>
<li><code>"branch"</code> <b>local name</b> hai, aapka chuna label jisse file ke dusre hisse is object ki taraf point kar sakein.</li>
<li>Curly braces ke andar <b>arguments</b> hain, <code>name = value</code> ke roop mein. Yahan <code>cidr_block</code> address range wali string hai.</li>
<li><code>tags</code> ek <b>map</b> leta hai, braces mein key aur value jodiyan.</li>
<li><code>#</code> ke baad ka sab comment hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Resource block ki anatomy">
<rect x="90" y="15" width="460" height="160" rx="12" fill="#e2e8f0"/>
<text x="110" y="42" class="svg-ink" font-size="13">resource  "aws_vpc"  "branch"  {</text>
<text x="130" y="70" class="svg-ink" font-size="13">cidr_block = "10.20.0.0/16"</text>
<text x="130" y="95" class="svg-ink" font-size="13">tags = { Name = "deccan-branch" }</text>
<text x="110" y="120" class="svg-ink" font-size="13">}</text>
<text x="590" y="42" text-anchor="end" class="svg-accent" font-size="11">block type, resource type, local name</text>
<text x="590" y="70" text-anchor="end" class="svg-accent" font-size="11">argument</text>
<text x="590" y="150" text-anchor="middle" class="svg-muted" font-size="12">is object ka address: aws_vpc.branch</text>
</svg><p class="cap">Block type, resource type, local name, phir arguments.</p></div>

<h3>Value types jo milenge</h3>
<table class="cmp"><tr><th>Type</th><th>Example</th><th>Kis liye</th></tr>
<tr><td>string</td><td><code>"10.20.0.0/16"</code></td><td>naam, CIDR blocks</td></tr>
<tr><td>number</td><td><code>2</code></td><td>counts, sizes</td></tr>
<tr><td>bool</td><td><code>true</code></td><td>on aur off switches</td></tr>
<tr><td>list</td><td><code>["a", "b"]</code></td><td>ordered collections</td></tr>
<tr><td>map</td><td><code>{ Name = "x" }</code></td><td>key aur value tags</td></tr></table>

<h3>Ek resource se doosre ko reference karna</h3>
<p>Subnet ko VPC ke andar rehna hota hai. Hum VPC ki ID copy nahi karte (VPC ban jaane tak hume pata bhi nahi). Hum use uske address se <b>refer</b> karte hain: resource type, dot, local name, dot, attribute.</p>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua)</span>
resource "aws_subnet" "users" {
  vpc_id     = aws_vpc.branch.id
  cidr_block = "10.20.1.0/24"
  tags = {
    Name = "users"
  }
}</pre>
<p><code>aws_vpc.branch.id</code> ka matlab "branch naam ke aws_vpc ka id attribute". Terraform yeh reference dekhkar <b>dependency</b> nikalta hai: VPC pehle banega, kyunki subnet ko uska id chahiye. Order aap khud nahi likhte; Terraform references se graph banata hai aur sahi order mein cheezein banata hai, jahan ho sake parallel.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Dependency graph">
<rect x="40" y="35" width="160" height="55" rx="10" fill="#bae6fd"/><text x="120" y="68" text-anchor="middle" class="svg-ink" font-size="13">aws_vpc.branch</text>
<rect x="440" y="35" width="160" height="55" rx="10" fill="#bbf7d0"/><text x="520" y="68" text-anchor="middle" class="svg-ink" font-size="13">aws_subnet.users</text>
<line x1="200" y1="62" x2="440" y2="62" stroke="#64748b" stroke-width="2"/><text x="320" y="55" text-anchor="middle" class="svg-accent" font-size="12">vpc_id = aws_vpc.branch.id</text>
<text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">reference order banata hai: pehle VPC, phir subnet</text>
</svg><p class="cap">References dependency graph banate hain.</p></div>

<h3>File layout</h3>
<p>Terraform folder ki <b>har</b> .tf file ko saath padhta hai, isliye file ke naam insaano ke liye hain. Aam layout: <code>main.tf</code> (resources), <code>variables.tf</code>, <code>outputs.tf</code> aur <code>providers.tf</code>. Har environment ya project ke liye ek folder rakho.</p>

<div class="eg"><p><b>Worked example.</b> Servers ke liye doosra subnet jodo: subnet block copy karo, local name <code>servers</code> aur CIDR 10.20.2.0/24 karo. Dono aws_vpc.branch.id ki taraf point karte hain. Terraform VPC banayega, phir dono subnets ek saath, kyunki subnets ek-doosre par depend nahi karte.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Doosre resource ki argument value haath se type karna, jaise banayi hui VPC ID. Hamesha reference use karo. Ek aur galti: resource ka <i>local name</i> baad mein badalna: Terraform ise "purana object destroy karo aur naya banao" maanta hai jab tak aap na bataye ki dono naam ek hi cheez hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Resource block ke teen naam jaano: type, local name, aur platform par dikhne wala asli naam (aksar tags se). References mein use hone wala address type.localname hai, Name tag kabhi nahi.</p></div>

<div class="scn"><h4>Rename jisne network delete kar diya</h4><p>Ek engineer ne file saaf karte hue production subnet ka local name "users" se "user_lan" kar diya. Plan ne ek destroy aur ek create dikhaya. Reviewer ne approval se pehle laal minus line dekh li. Unhone moved block jodha taaki Terraform samjhe ki yeh wahi subnet hai, aur plan "no changes" ban gaya.</p><p><b>Lesson:</b> plan padho; rename harmless nahi hote.</p></div>

<div class="iv"><p class="q">"Terraform resources banane ka order kaise decide karta hai?"</p><p>Woh resources ke beech references se dependency graph banata hai, jaise subnet ka VPC ka id use karna. Jinke beech dependency nahi unhe parallel banata hai. depends_on se order force kar sakte ho, par references behtar hain kyunki explicit aur self-documenting hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HCL mein blocks (sections) aur arguments (name = value) hote hain.</li>
<li>Resource block ka type aur local name hota hai; address type.localname hai.</li>
<li>IDs type karne ki jagah aws_vpc.branch.id jaise attributes reference karo.</li>
<li>References dependency graph aur creation order banate hain.</li>
<li>Terraform folder ki saari .tf files saath padhta hai.</li>
</ul></div>
`}};export{e as default};