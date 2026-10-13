var e={id:`troubleshooting`,h:{en:`Troubleshooting Terraform, and Terraform for network devices`,hi:`Terraform troubleshooting, aur network devices ke liye Terraform`},body:{en:`
<p>Sooner or later a plan will fail or show something you did not expect. Terraform's errors are usually precise if you read them slowly. This chapter gives a repeatable workflow, a table of common errors, and then shows how the same ideas apply to network devices, not only to clouds.</p>

<h3>Analogy: a doctor's routine</h3>
<p>A good doctor does not guess. Symptoms first, then tests, then a diagnosis, then one treatment. Do the same: read the message, locate the block, check the inputs, change one thing, run plan again.</p>

<h3>The workflow</h3>
<ol>
<li><b>Which stage failed?</b> init (providers and backend), validate (syntax), plan (comparison with reality), or apply (the platform refused something).</li>
<li><b>Read the error to the end.</b> It names the file, the line, the resource address and usually the platform's own reason.</li>
<li><b>Run the cheap checks</b>: <code>terraform fmt</code>, <code>terraform validate</code>.</li>
<li><b>Check the inputs</b>: which variable values and which tfvars file are in effect?</li>
<li><b>Check the state</b>: <code>terraform state list</code>, <code>terraform state show</code> for the address in the error.</li>
<li><b>Change one thing</b>, run plan again, compare the new plan with the last.</li>
</ol>
<p>For more detail you can set the environment variable <code>TF_LOG</code> to a level such as DEBUG for one run. The log can contain sensitive data, so do not paste it into public tickets.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Which stage failed">
<rect x="10" y="40" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="66" text-anchor="middle" class="svg-ink" font-size="13">init</text><text x="65" y="84" text-anchor="middle" class="svg-muted" font-size="11">providers, backend</text>
<rect x="150" y="40" width="110" height="60" rx="10" fill="#fde68a"/><text x="205" y="66" text-anchor="middle" class="svg-ink" font-size="13">validate</text><text x="205" y="84" text-anchor="middle" class="svg-muted" font-size="11">syntax, references</text>
<rect x="290" y="40" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="345" y="66" text-anchor="middle" class="svg-ink" font-size="13">plan</text><text x="345" y="84" text-anchor="middle" class="svg-muted" font-size="11">state vs reality</text>
<rect x="430" y="40" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="485" y="66" text-anchor="middle" class="svg-ink" font-size="13">apply</text><text x="485" y="84" text-anchor="middle" class="svg-muted" font-size="11">platform answers</text>
<line x1="120" y1="70" x2="150" y2="70" stroke="#64748b" stroke-width="2"/><line x1="260" y1="70" x2="290" y2="70" stroke="#64748b" stroke-width="2"/><line x1="400" y1="70" x2="430" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">find the stage first; each stage has its own usual suspects</text>
</svg><p class="cap">Locate the failing stage before you debug.</p></div>

<h3>Common problems and what they mean</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>What to do</th></tr>
<tr><td>init cannot find a provider</td><td>wrong source name or version constraint</td><td>check required_providers spelling and version</td></tr>
<tr><td>validate: reference to undeclared variable or resource</td><td>typo in var. or resource address</td><td>fix the name; fmt and validate again</td></tr>
<tr><td>authentication or permission error</td><td>missing or wrong credentials, role lacks permission</td><td>check environment variables and the role, never paste keys into code</td></tr>
<tr><td>invalid CIDR or overlap error from the platform</td><td>bad value in a variable</td><td>check the tfvars file in use</td></tr>
<tr><td>error acquiring the state lock</td><td>another run is active or crashed</td><td>wait; confirm nobody is running; only then force-unlock</td></tr>
<tr><td>dependency cycle</td><td>A references B and B references A</td><td>break the loop by moving an attribute or splitting resources</td></tr>
<tr><td>plan wants to destroy and recreate</td><td>changed an argument that cannot update in place, or renamed a block</td><td>revert, or use a moved block for renames</td></tr>
<tr><td>plan shows changes you never made</td><td>drift from a manual edit</td><td>accept it in code or let apply undo it</td></tr>
<tr><td>resource already exists</td><td>object was created outside Terraform</td><td>import it into the state</td></tr></table>

<h3>Reference: a typical error and its fix</h3>
<p>Reference configuration (not run in the simulator): suppose a plan stops because the subnet CIDR is outside the VPC range.</p>
<pre class="code">variable "vpc_cidr" { default = "10.20.0.0/16" }
<span class="c"># mistake: this subnet is outside 10.20.0.0/16</span>
cidr_block = "10.30.1.0/24"
<span class="c"># fix: stay inside the VPC range</span>
cidr_block = "10.20.1.0/24"</pre>
<p>The platform refuses the subnet and Terraform reports its message against the resource address. Read the address, open that block, and compare the value with the variable.</p>

<h3>The same ideas for network devices</h3>
<p>Terraform is not only for clouds. Providers exist for network controllers and for some devices, where a resource represents a piece of device configuration, such as an interface. The workflow is identical: write the desired state, plan, review, apply. The names of the resource types and arguments depend on the provider and version, so always check its documentation. An illustration:</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator). Illustration only:</span>
<span class="c"># argument names depend on the provider version; check its documentation.</span>
resource "iosxe_interface_ethernet" "uplink" {
  type                 = "GigabitEthernet"
  name                 = "1"
  description          = "Uplink to R2"
  ipv4_address         = "10.20.1.1"
  ipv4_address_mask    = "255.255.255.252"
  shutdown             = false
}</pre>
<p>If someone changes the interface description by hand on the device, the next plan shows the difference, exactly like drift in the cloud. For many device fleets teams use Ansible (module auto-ansible) for configuration, and Terraform for the cloud and controller layer underneath; the exam expects you to know the strengths of each. Terraform keeps state and is excellent at lifecycle (create, change, destroy); Ansible is agent-less, push-based and strong for device changes and orchestration.</p>

<div class="eg"><p><b>Worked example.</b> Apply fails with a permission error on creating a route table. Stage: apply. The message names aws_route_table.branch and an authorisation reason. The cloud role used by the pipeline lacks route table permission. The fix is in the role, not the code. A rerun of plan and apply continues from where the earlier apply stopped.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Using force-unlock as soon as a lock error appears. Check first that no pipeline job or colleague is running; forcing a lock during a real apply can corrupt the state. Another is fixing by hand in the console and leaving the code unchanged, creating drift.</p></div>
<div class="exam"><p><b>Exam trap.</b> Match the symptom to the stage: syntax errors appear at validate, credential errors at plan or apply, backend errors at init. And know the difference: plan is read-only, so a permission error at plan time is about <i>read</i> access.</p></div>

<div class="scn"><h4>The lock that would not release</h4><p>A pipeline job was cancelled halfway and left a state lock. The next job waited, then failed with a lock error. An engineer first checked the pipeline: nothing was running. Only then did they use force-unlock with the lock id from the error message, and reran plan to confirm the state was consistent. Total outage of the pipeline: ten minutes.</p><p><b>Lesson:</b> verify, then unlock.</p></div>

<div class="iv"><p class="q">"Terraform plan shows a resource will be destroyed and recreated. What do you do?"</p><p>Do not apply. Read which argument is marked as forcing replacement, decide whether the change is intended, and whether the object can tolerate an outage. If it was a rename, use a moved block. If it was a deliberate change, schedule it, take backups, and possibly use create_before_destroy so the new object exists before the old one goes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Find the failing stage first: init, validate, plan or apply.</li>
<li>Read errors to the end; they name the address and the platform's reason.</li>
<li>Change one thing, rerun plan, compare plans.</li>
<li>Force-unlock only after confirming no run is active.</li>
<li>Device and controller providers follow the same write, plan, apply loop.</li>
</ul></div>
`,hi:`
<p>Kabhi na kabhi plan fail hoga ya aisa kuch dikhayega jo aapne expect nahi kiya. Terraform ke errors aam taur par precise hote hain agar aap unhe dheere padho. Yeh chapter ek repeatable workflow, common errors ki table deta hai, aur phir dikhata hai ki wahi ideas network devices par bhi lagte hain, sirf clouds par nahi.</p>

<h3>Analogy: doctor ka routine</h3>
<p>Achha doctor andaaza nahi lagata. Pehle symptoms, phir tests, phir diagnosis, phir ek ilaaj. Aap bhi aisa hi karo: message padho, block dhoondho, inputs check karo, ek cheez badlo, plan dobara chalao.</p>

<h3>Workflow</h3>
<ol>
<li><b>Kaunsa stage fail hua?</b> init (providers aur backend), validate (syntax), plan (reality se comparison), ya apply (platform ne kuch mana kiya).</li>
<li><b>Error ko ant tak padho.</b> Woh file, line, resource address aur aam taur par platform ki apni wajah batata hai.</li>
<li><b>Sasti checks chalao</b>: <code>terraform fmt</code>, <code>terraform validate</code>.</li>
<li><b>Inputs check karo</b>: kaunsi variable values aur kaunsi tfvars file effect mein hai?</li>
<li><b>State check karo</b>: error ke address ke liye <code>terraform state list</code>, <code>terraform state show</code>.</li>
<li><b>Ek cheez badlo</b>, plan dobara chalao, naye plan ko pichhle se compare karo.</li>
</ol>
<p>Zyada detail ke liye ek run ke liye environment variable <code>TF_LOG</code> ko DEBUG jaise level par set kar sakte ho. Log mein sensitive data ho sakta hai, isliye use public tickets mein paste mat karo.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Kaunsa stage fail hua">
<rect x="10" y="40" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="66" text-anchor="middle" class="svg-ink" font-size="13">init</text><text x="65" y="84" text-anchor="middle" class="svg-muted" font-size="11">providers, backend</text>
<rect x="150" y="40" width="110" height="60" rx="10" fill="#fde68a"/><text x="205" y="66" text-anchor="middle" class="svg-ink" font-size="13">validate</text><text x="205" y="84" text-anchor="middle" class="svg-muted" font-size="11">syntax, references</text>
<rect x="290" y="40" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="345" y="66" text-anchor="middle" class="svg-ink" font-size="13">plan</text><text x="345" y="84" text-anchor="middle" class="svg-muted" font-size="11">state vs reality</text>
<rect x="430" y="40" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="485" y="66" text-anchor="middle" class="svg-ink" font-size="13">apply</text><text x="485" y="84" text-anchor="middle" class="svg-muted" font-size="11">platform ka jawab</text>
<line x1="120" y1="70" x2="150" y2="70" stroke="#64748b" stroke-width="2"/><line x1="260" y1="70" x2="290" y2="70" stroke="#64748b" stroke-width="2"/><line x1="400" y1="70" x2="430" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">pehle stage dhoondho; har stage ke apne aam suspects hain</text>
</svg><p class="cap">Debug se pehle fail hone wala stage pehchano.</p></div>

<h3>Aam problems aur unka matlab</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit wajah</th><th>Kya karein</th></tr>
<tr><td>init ko provider nahi milta</td><td>galat source naam ya version constraint</td><td>required_providers ki spelling aur version dekho</td></tr>
<tr><td>validate: undeclared variable ya resource ka reference</td><td>var. ya resource address mein typo</td><td>naam theek karo; fmt aur validate dobara</td></tr>
<tr><td>authentication ya permission error</td><td>credentials missing ya galat, role ko permission nahi</td><td>environment variables aur role dekho, keys kabhi code mein paste mat karo</td></tr>
<tr><td>platform se invalid CIDR ya overlap error</td><td>variable mein buri value</td><td>istemal ho rahi tfvars file dekho</td></tr>
<tr><td>error acquiring the state lock</td><td>doosra run chal raha hai ya crash hua</td><td>ruko; confirm karo koi nahi chala raha; tabhi force-unlock</td></tr>
<tr><td>dependency cycle</td><td>A, B ko aur B, A ko reference karta hai</td><td>attribute hatao ya resources todo, loop tod do</td></tr>
<tr><td>plan destroy aur recreate chahta hai</td><td>aisa argument badla jo jagah par update nahi hota, ya block rename kiya</td><td>revert karo, ya renames ke liye moved block</td></tr>
<tr><td>plan woh changes dikhata hai jo aapne nahi kiye</td><td>manual edit se drift</td><td>code mein accept karo ya apply se undo hone do</td></tr>
<tr><td>resource already exists</td><td>object Terraform ke bahar bana tha</td><td>use state mein import karo</td></tr></table>

<h3>Reference: ek aam error aur uska fix</h3>
<p>Reference configuration (simulator mein run nahi hua): maan lo plan isliye ruk jaata hai kyunki subnet CIDR VPC range ke bahar hai.</p>
<pre class="code">variable "vpc_cidr" { default = "10.20.0.0/16" }
<span class="c"># galti: yeh subnet 10.20.0.0/16 ke bahar hai</span>
cidr_block = "10.30.1.0/24"
<span class="c"># fix: VPC range ke andar rehna</span>
cidr_block = "10.20.1.0/24"</pre>
<p>Platform subnet mana karta hai aur Terraform uska message resource address ke saath report karta hai. Address padho, wahi block kholo, aur value ko variable se compare karo.</p>

<h3>Network devices ke liye wahi ideas</h3>
<p>Terraform sirf clouds ke liye nahi hai. Network controllers aur kuch devices ke liye providers hain, jahan resource device configuration ka ek tukda hota hai, jaise interface. Workflow wahi hai: desired state likho, plan, review, apply. Resource types aur arguments ke naam provider aur version par depend karte hain, isliye hamesha uska documentation dekho. Ek illustration:</p>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua). Sirf illustration:</span>
<span class="c"># argument ke naam provider version par depend karte hain; documentation dekho.</span>
resource "iosxe_interface_ethernet" "uplink" {
  type                 = "GigabitEthernet"
  name                 = "1"
  description          = "Uplink to R2"
  ipv4_address         = "10.20.1.1"
  ipv4_address_mask    = "255.255.255.252"
  shutdown             = false
}</pre>
<p>Koi device par haath se interface description badal de to agla plan farak dikhata hai, bilkul cloud ke drift jaisa. Device fleets ke liye bahut si teams configuration ke liye Ansible (module auto-ansible) use karti hain, aur neeche ki cloud aur controller layer ke liye Terraform; exam umeed karta hai ki aap dono ki taakat jaano. Terraform state rakhta hai aur lifecycle (create, change, destroy) mein behtar hai; Ansible agent-less, push-based hai aur device changes aur orchestration mein mazboot.</p>

<div class="eg"><p><b>Worked example.</b> Route table banate waqt apply permission error deta hai. Stage: apply. Message aws_route_table.branch aur authorisation ki wajah batata hai. Pipeline jo cloud role use karta hai usme route table permission nahi hai. Fix role mein hai, code mein nahi. Plan aur apply ka rerun wahin se aage badhta hai jahan pehla apply ruka tha.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Lock error aate hi force-unlock chala dena. Pehle check karo ki koi pipeline job ya colleague nahi chala raha; asli apply ke dauraan lock force karna state corrupt kar sakta hai. Ek aur: console mein haath se fix karna aur code ko waisa hi chhodna, jisse drift banta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Symptom ko stage se match karo: syntax errors validate par, credential errors plan ya apply par, backend errors init par. Aur farak jaano: plan read-only hai, isliye plan time par permission error <i>read</i> access ke baare mein hai.</p></div>

<div class="scn"><h4>Lock jo release nahi hua</h4><p>Ek pipeline job beech mein cancel hua aur state lock chhod gaya. Agle job ne intezaar kiya, phir lock error ke saath fail hua. Engineer ne pehle pipeline check ki: kuch nahi chal raha tha. Tabhi unhone error message ke lock id ke saath force-unlock use kiya, aur plan dobara chalakar confirm kiya ki state consistent hai. Pipeline ka kul outage: das minute.</p><p><b>Lesson:</b> pehle verify, phir unlock.</p></div>

<div class="iv"><p class="q">"Terraform plan kehta hai resource destroy aur recreate hoga. Kya karoge?"</p><p>Apply nahi karunga. Dekhunga kaunsa argument replacement force kar raha hai, tay karunga ki change intended hai ya nahi, aur object outage jhel sakta hai ya nahi. Rename tha to moved block use karunga. Jaan-boojh kar change tha to schedule karunga, backups lunga, aur shayad create_before_destroy use karunga taaki naya object purane ke jaane se pehle maujood ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle fail hone wala stage dhoondho: init, validate, plan ya apply.</li>
<li>Errors ko ant tak padho; woh address aur platform ki wajah batate hain.</li>
<li>Ek cheez badlo, plan dobara chalao, plans compare karo.</li>
<li>Force-unlock sirf tab jab confirm ho ki koi run active nahi.</li>
<li>Device aur controller providers bhi wahi write, plan, apply loop follow karte hain.</li>
</ul></div>
`}};export{e as default};