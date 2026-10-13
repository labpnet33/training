var e={id:`state-drift`,h:{en:`State, remote backends and drift`,hi:`State, remote backends aur drift`},body:{en:`
<p>How does Terraform know that the subnet "users" in your file is the same object as subnet-abc in the cloud? It keeps a record called the <b>state</b>. State is the single most important and most dangerous part of Terraform, and the exam loves it. This chapter explains what it holds, where to keep it safely, and what <b>drift</b> is.</p>

<h3>Analogy: the cloakroom ticket</h3>
<p>At a cloakroom you hand in a coat and get a numbered ticket. The ticket links your name to the coat on hook 47. If you lose the ticket the attendant cannot tell which coat is yours. The <b>state file</b> is the stack of tickets: it links each resource block in your code to a real object on the platform. Lose or corrupt it and Terraform no longer knows what it owns.</p>

<h3>What is in the state</h3>
<ul>
<li>For every managed object: its address (aws_subnet.branch["users"]), the platform's real id, and all its attributes as last known.</li>
<li>Dependency information, provider details and outputs.</li>
<li><b>Sensitive values in plain text</b> (passwords, keys) if your resources use them, even when marked sensitive on screen.</li>
</ul>
<p>By default the state is a file named <code>terraform.tfstate</code> in your working folder. That is fine for learning and wrong for teams.</p>

<h3>Rules for state</h3>
<ol>
<li><b>Never edit it by hand.</b> Use terraform state commands.</li>
<li><b>Never commit it to Git.</b> It may contain secrets and it changes constantly.</li>
<li><b>Share it through a remote backend</b> so the whole team and the pipeline see the same state.</li>
<li><b>Lock it</b> so two applies cannot run at once.</li>
<li><b>Encrypt and back it up</b>, and give access only to those who must apply.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Remote state shared by team">
<rect x="15" y="15" width="130" height="45" rx="10" fill="#bae6fd"/><text x="80" y="43" text-anchor="middle" class="svg-ink" font-size="13">Engineer A</text>
<rect x="15" y="70" width="130" height="45" rx="10" fill="#bae6fd"/><text x="80" y="98" text-anchor="middle" class="svg-ink" font-size="13">Engineer B</text>
<rect x="15" y="125" width="130" height="45" rx="10" fill="#bae6fd"/><text x="80" y="153" text-anchor="middle" class="svg-ink" font-size="13">Pipeline</text>
<rect x="250" y="55" width="170" height="70" rx="12" fill="#fde68a"/><text x="335" y="85" text-anchor="middle" class="svg-ink" font-size="14">Remote backend</text><text x="335" y="105" text-anchor="middle" class="svg-muted" font-size="12">state + lock + encryption</text>
<rect x="500" y="55" width="130" height="70" rx="12" fill="#bbf7d0"/><text x="565" y="95" text-anchor="middle" class="svg-ink" font-size="14">Real cloud</text>
<line x1="145" y1="38" x2="250" y2="80" stroke="#64748b" stroke-width="2"/><line x1="145" y1="92" x2="250" y2="92" stroke="#64748b" stroke-width="2"/><line x1="145" y1="148" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="420" y1="90" x2="500" y2="90" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Everyone shares one locked, encrypted state.</p></div>

<h3>Configuring a remote backend</h3>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator): backend.tf</span>
terraform {
  backend "s3" {
    bucket  = "deccan-terraform-state"
    key     = "branch/pune/terraform.tfstate"
    region  = "ap-south-1"
    encrypt = true
  }
}</pre>
<p>This stores the state in an object-storage bucket, encrypted. Other backends exist (Terraform Cloud style services, cloud storage, a database). A good backend supports <b>state locking</b>: when one person runs apply, a second apply must wait. Check your backend's current documentation for how to enable locking. After changing the backend you run <code>terraform init</code> again so Terraform can move the state.</p>

<h3>Useful state commands</h3>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
terraform state list                                  <span class="c"># every address Terraform manages</span>
terraform state show 'aws_subnet.branch["users"]'     <span class="c"># attributes of one object</span>
terraform import 'aws_subnet.branch["users"]' REAL_SUBNET_ID   <span class="c"># adopt an existing object</span></pre>
<p><code>terraform import</code> tells Terraform "this real object already exists; attach it to this block." You must also write the matching resource block, and then run plan until it shows no changes. Newer Terraform versions can also express imports in code with an <code>import</code> block, which is reviewable in a pull request.</p>

<h3>Drift</h3>
<p><b>Drift</b> means the real world no longer matches the state and code, usually because someone changed an object by hand in the console. Every plan first refreshes its knowledge of real objects, so drift appears as a proposed change that will <i>undo</i> the manual edit. You decide: either update the code to accept the manual change, or let apply put it back. To look at drift without proposing other work you can run <code>terraform plan -refresh-only</code>.</p>
<p>Prevent drift with a rule that console access to Terraform-managed objects is read-only, and run a scheduled plan in the pipeline that raises an alert when it is not empty.</p>

<div class="eg"><p><b>Worked example.</b> A colleague adds a tag to the VPC in the console at lunchtime. The afternoon plan shows one in-place update removing that tag, because the code does not mention it. The team decides the tag is useful, adds it to the code, and the plan becomes empty again.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Deleting the state file "to start clean". Terraform then thinks nothing exists and tries to create everything again, which fails or duplicates. Another is two people running apply from laptops with separate local state files.</p></div>
<div class="exam"><p><b>Exam trap.</b> State is not the same as the code or the real network: it is Terraform's record linking them. A state file may contain secrets in clear text, so a marked-sensitive variable is still exposed there. Remote backends with locking solve sharing and concurrency.</p></div>

<div class="scn"><h4>Two laptops, two states</h4><p>Two engineers each ran apply for the same VPC from their own laptops, each with a local state file. Each believed they had created the subnets, and the cloud ended up with duplicate subnets and a failed route attachment. The cleanup took a day. The fix was one remote backend with locking and a rule that only the pipeline may apply.</p><p><b>Lesson:</b> one state, one place, one lock.</p></div>

<div class="iv"><p class="q">"What is Terraform state and how do you manage it in a team?"</p><p>State maps resource blocks to real objects and stores their attributes, so Terraform can plan the difference. In a team use a remote, encrypted backend with locking, never commit it to Git, restrict access because it can contain secrets, and apply only from a pipeline. Mention drift detection with plan and import for adopting existing resources.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>State links code to real objects; it can contain secrets in clear text.</li>
<li>Use a remote, encrypted backend with locking; never commit state.</li>
<li>Never edit or delete the state by hand; use terraform state and import.</li>
<li>Drift is manual change; plan reveals it and proposes to undo it.</li>
<li>Run terraform init again after changing the backend.</li>
</ul></div>
`,hi:`
<p>Terraform ko kaise pata chalta hai ki aapki file ka subnet "users" cloud ke subnet-abc ke saath ek hi object hai? Woh ek record rakhta hai jise <b>state</b> kehte hain. State Terraform ka sabse zaroori aur sabse khatarnak hissa hai, aur exam ise bahut poochta hai. Yeh chapter batata hai usme kya hota hai, ise surakshit kahan rakhein, aur <b>drift</b> kya hai.</p>

<h3>Analogy: cloakroom ka ticket</h3>
<p>Cloakroom mein aap coat dete ho aur numbered ticket paate ho. Ticket aapke naam ko hook 47 ke coat se jodta hai. Ticket kho do to attendant nahi bata sakta kaunsa coat aapka hai. <b>State file</b> tickets ka dher hai: woh aapke code ke har resource block ko platform ke asli object se jodti hai. Ise kho do ya kharab kar do to Terraform ko pata nahi rehta woh kis ka maalik hai.</p>

<h3>State mein kya hota hai</h3>
<ul>
<li>Har managed object ke liye: uska address (aws_subnet.branch["users"]), platform ka asli id, aur uske saare attributes jaise aakhri baar jaane gaye.</li>
<li>Dependency information, provider details aur outputs.</li>
<li>Agar aapke resources use karte hain to <b>sensitive values plain text mein</b> (passwords, keys), chahe screen par sensitive mark ho.</li>
</ul>
<p>Default mein state aapke working folder mein <code>terraform.tfstate</code> naam ki file hoti hai. Seekhne ke liye theek, teams ke liye galat.</p>

<h3>State ke rules</h3>
<ol>
<li><b>Haath se kabhi edit mat karo.</b> terraform state commands use karo.</li>
<li><b>Git mein kabhi commit mat karo.</b> Usme secrets ho sakte hain aur woh lagatar badalti hai.</li>
<li><b>Remote backend se share karo</b> taaki poori team aur pipeline wahi state dekhein.</li>
<li><b>Lock karo</b> taaki do applies ek saath na chalein.</li>
<li><b>Encrypt aur backup karo</b>, aur access sirf unhe do jinhe apply karna hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Team ke saath share hoti remote state">
<rect x="15" y="15" width="130" height="45" rx="10" fill="#bae6fd"/><text x="80" y="43" text-anchor="middle" class="svg-ink" font-size="13">Engineer A</text>
<rect x="15" y="70" width="130" height="45" rx="10" fill="#bae6fd"/><text x="80" y="98" text-anchor="middle" class="svg-ink" font-size="13">Engineer B</text>
<rect x="15" y="125" width="130" height="45" rx="10" fill="#bae6fd"/><text x="80" y="153" text-anchor="middle" class="svg-ink" font-size="13">Pipeline</text>
<rect x="250" y="55" width="170" height="70" rx="12" fill="#fde68a"/><text x="335" y="85" text-anchor="middle" class="svg-ink" font-size="14">Remote backend</text><text x="335" y="105" text-anchor="middle" class="svg-muted" font-size="12">state + lock + encryption</text>
<rect x="500" y="55" width="130" height="70" rx="12" fill="#bbf7d0"/><text x="565" y="95" text-anchor="middle" class="svg-ink" font-size="14">Asli cloud</text>
<line x1="145" y1="38" x2="250" y2="80" stroke="#64748b" stroke-width="2"/><line x1="145" y1="92" x2="250" y2="92" stroke="#64748b" stroke-width="2"/><line x1="145" y1="148" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="420" y1="90" x2="500" y2="90" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Sab ek locked, encrypted state share karte hain.</p></div>

<h3>Remote backend configure karna</h3>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua): backend.tf</span>
terraform {
  backend "s3" {
    bucket  = "deccan-terraform-state"
    key     = "branch/pune/terraform.tfstate"
    region  = "ap-south-1"
    encrypt = true
  }
}</pre>
<p>Yeh state ko object-storage bucket mein encrypted rakhta hai. Aur backends bhi hain (Terraform Cloud jaisi services, cloud storage, database). Achha backend <b>state locking</b> support karta hai: ek insaan apply chalaye to doosre apply ko intezaar karna padta hai. Locking enable karne ke liye apne backend ka current documentation dekho. Backend badalne ke baad <code>terraform init</code> dobara chalao taaki Terraform state ko move kar sake.</p>

<h3>Kaam ke state commands</h3>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua)</span>
terraform state list                                  <span class="c"># Terraform jo har address manage karta hai</span>
terraform state show 'aws_subnet.branch["users"]'     <span class="c"># ek object ke attributes</span>
terraform import 'aws_subnet.branch["users"]' REAL_SUBNET_ID   <span class="c"># maujood object ko adopt karo</span></pre>
<p><code>terraform import</code> Terraform ko kehta hai "yeh asli object pehle se hai; ise is block se jodo." Aapko matching resource block bhi likhna padta hai, phir plan tab tak chalana jab tak woh no changes na dikhaye. Naye Terraform versions code mein <code>import</code> block se bhi imports express kar sakte hain, jo pull request mein reviewable hai.</p>

<h3>Drift</h3>
<p><b>Drift</b> ka matlab asli duniya ab state aur code se match nahi karti, aam taur par kisi ne console mein haath se object badal diya. Har plan pehle asli objects ke baare mein apni jaankari refresh karta hai, isliye drift aise proposed change ke roop mein dikhta hai jo manual edit ko <i>undo</i> karega. Aap faisla karte ho: ya code ko manual change accept karne ke liye update karo, ya apply se wapas rakhwao. Dusra kaam proposal kiye bina drift dekhne ke liye <code>terraform plan -refresh-only</code> chala sakte ho.</p>
<p>Drift rokne ke liye rule rakho ki Terraform-managed objects par console access read-only hai, aur pipeline mein scheduled plan chalao jo khaali na ho to alert uthaye.</p>

<div class="eg"><p><b>Worked example.</b> Ek colleague lunch par console mein VPC par tag jodta hai. Dopahar ka plan ek in-place update dikhata hai jo woh tag hatata hai, kyunki code usse mention nahi karta. Team tay karti hai ki tag useful hai, use code mein jodti hai, aur plan phir khaali ho jaata hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> "Saaf shuru karne ke liye" state file delete kar dena. Terraform tab sochta hai kuch maujood nahi aur sab dobara banane ki koshish karta hai, jo fail hota hai ya duplicate banata hai. Ek aur: do log apne laptops se alag local state files ke saath apply chalate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> State code ya asli network jaisi nahi hai: yeh Terraform ka record hai jo dono ko jodta hai. State file mein secrets clear text mein ho sakte hain, isliye marked-sensitive variable bhi wahan expose hota hai. Locking wale remote backends sharing aur concurrency solve karte hain.</p></div>

<div class="scn"><h4>Do laptops, do states</h4><p>Do engineers ne ek hi VPC ke liye apne-apne laptop se apply chalaya, har ek ke paas local state file. Dono ne maana ki subnets unhone banaye, aur cloud mein duplicate subnets aur ek failed route attachment ban gaye. Safai mein ek din laga. Fix tha ek remote backend with locking aur rule ki sirf pipeline apply karegi.</p><p><b>Lesson:</b> ek state, ek jagah, ek lock.</p></div>

<div class="iv"><p class="q">"Terraform state kya hai aur team mein use kaise manage karte ho?"</p><p>State resource blocks ko asli objects se map karti hai aur unke attributes store karti hai, taaki Terraform farak plan kar sake. Team mein locking wala remote, encrypted backend use karo, Git mein kabhi commit mat karo, access restrict karo kyunki usme secrets ho sakte hain, aur sirf pipeline se apply karo. Plan se drift detection aur maujooda resources adopt karne ke liye import ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>State code ko asli objects se jodti hai; usme secrets clear text mein ho sakte hain.</li>
<li>Locking wala remote, encrypted backend use karo; state kabhi commit mat karo.</li>
<li>State ko haath se edit ya delete mat karo; terraform state aur import use karo.</li>
<li>Drift manual change hai; plan use dikhata hai aur undo karne ka proposal deta hai.</li>
<li>Backend badalne ke baad terraform init dobara chalao.</li>
</ul></div>
`}};export{e as default};