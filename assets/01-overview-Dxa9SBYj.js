var e={id:`overview`,h:{en:`Terraform and declarative config: what you will learn and the big picture`,hi:`Terraform aur declarative config: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to describe networks and cloud infrastructure in text files, and let a tool called <b>Terraform</b> make the real world match those files. You will read and write the Terraform language (HCL), understand providers, resources, variables, outputs, state, and the <code>init</code>, <code>plan</code>, <code>apply</code> and <code>destroy</code> workflow. This is the <b>Infrastructure as Code</b> part of the CCNP Automation (350-901 AUTOCOR) blueprint.</p>
<p><b>Prerequisites.</b> You should have seen JSON and YAML (module auto-formats) and know what a VPC, a subnet and a CIDR block are. You do not need to have used Terraform before, and you do not need to know how to code. Every file shown here is explained line by line.</p>

<div class="note"><p><b>How to practise this module.</b> The NK-OS simulator has no Terraform program, so every Terraform file in this module is labelled <b>Reference configuration (not run in the simulator)</b> and no output is shown that was not produced by a real tool. To build the surrounding habits use these modules: auto-git (version control for your .tf files), auto-ansible (another declarative-style tool, with idempotency), auto-cicd (run plan and apply from a pipeline), auto-ssh (talk to devices) and cloud-vpc (the VPC concepts that Terraform will describe).</p></div>

<h3>Analogy: an architect's blueprint versus a list of instructions</h3>
<p>Imagine you tell a builder: "Lay a brick. Now another brick. Now a door here." That is a list of <b>instructions</b>. If you repeat it tomorrow, you will build a second house. Now imagine you hand the builder a <b>blueprint</b> that shows the finished house. The builder looks at the plot, sees what is already built, and does only the missing work. Hand over the same blueprint a second time and nothing happens, because the house already matches. A blueprint is <b>declarative</b>: you say <i>what</i> you want. A list of instructions is <b>imperative</b>: you say <i>how</i> to do it.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Declarative versus imperative">
<rect x="15" y="25" width="290" height="140" rx="12" fill="#fde68a"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="14">Imperative (how)</text>
<text x="160" y="80" text-anchor="middle" class="svg-muted" font-size="12">1. create VPC</text><text x="160" y="100" text-anchor="middle" class="svg-muted" font-size="12">2. add subnet</text><text x="160" y="120" text-anchor="middle" class="svg-muted" font-size="12">3. add subnet again?</text><text x="160" y="148" text-anchor="middle" class="svg-accent" font-size="12">run twice = duplicates</text>
<rect x="335" y="25" width="290" height="140" rx="12" fill="#bbf7d0"/><text x="480" y="52" text-anchor="middle" class="svg-ink" font-size="14">Declarative (what)</text>
<text x="480" y="80" text-anchor="middle" class="svg-muted" font-size="12">one VPC, 10.20.0.0/16</text><text x="480" y="100" text-anchor="middle" class="svg-muted" font-size="12">one subnet, 10.20.1.0/24</text><text x="480" y="148" text-anchor="middle" class="svg-accent" font-size="12">run twice = no change</text>
</svg><p class="cap">Declare the end state; the tool works out the steps.</p></div>

<h3>What is Terraform?</h3>
<p><b>Terraform</b> is an open tool that reads files describing the infrastructure you want and talks to platforms (clouds, network controllers, devices) to create, change or remove things until reality matches the files. Its files are written in <b>HCL</b> (HashiCorp Configuration Language), a small, readable language designed for this one job. The loop is always the same:</p>
<ol>
<li><b>Write</b> the desired state in .tf files.</li>
<li><b>Plan</b>: Terraform compares your files with what exists and shows a list of changes. Nothing changes yet.</li>
<li><b>Apply</b>: after you approve, Terraform makes the changes.</li>
</ol>
<p>Because the files are text, you can keep them in Git (module auto-git), review changes in a pull request, and run them from a pipeline (module auto-cicd). The network stops being "what someone typed last Tuesday" and becomes something you can read, review and reproduce.</p>

<h3>Why it matters for network engineers</h3>
<ul>
<li><b>Repeatable</b>: the same files build a test network and a production network.</li>
<li><b>Reviewable</b>: a colleague reads the plan before anything changes.</li>
<li><b>Auditable</b>: Git history shows who changed what and why.</li>
<li><b>Drift-aware</b>: Terraform notices when the real world no longer matches the files.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Deccan Net needs a VPC 10.20.0.0/16 with two subnets for a new cloud branch. By hand it is a dozen console clicks that nobody records. In Terraform it is about twenty lines in one file. The same file can later be reused for a second region by changing one variable. You will write this very file across the chapters of this module.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Mixing Terraform with manual console changes on the same objects. Terraform then fights the human: it will try to undo the manual change on the next apply. Pick one owner for each object.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Declarative" does not mean "no steps happen"; it means you describe the desired end state and the tool computes the steps. Ansible modules and Terraform are both declarative in spirit, but Terraform keeps a <b>state file</b> and Ansible mostly does not.</p></div>

<div class="scn"><h4>The second branch in an afternoon</h4><p>A retailer needed an identical cloud network for a second city. The first one had been built by hand over two days and nobody remembered every setting. A cloud engineer exported the design into Terraform files for the second site, reviewed the plan with the team, applied it, and finished before lunch. A later audit found the two networks identical because both came from one set of files.</p><p><b>Lesson:</b> what you can read, you can repeat.</p></div>

<div class="iv"><p class="q">"What is Infrastructure as Code and why use Terraform for it?"</p><p>Infrastructure as Code means defining infrastructure in version-controlled text files rather than manual steps. Terraform is declarative: you describe the desired end state, it plans the difference from reality, and applies it after approval. Benefits are repeatability, peer review, audit history and drift detection. Mention providers for many platforms and the state file.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Declarative means you describe what you want; the tool works out how.</li>
<li>Terraform reads .tf files written in HCL and makes reality match them.</li>
<li>The loop is write, plan (preview), apply (change).</li>
<li>Text files can live in Git, be reviewed and run from pipelines.</li>
<li>Do not mix manual changes with Terraform on the same objects.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap networks aur cloud infrastructure ko text files mein describe karna seekhoge, aur <b>Terraform</b> naam ka tool asli duniya ko un files se match karayega. Aap Terraform language (HCL) padhna aur likhna, providers, resources, variables, outputs, state, aur <code>init</code>, <code>plan</code>, <code>apply</code> aur <code>destroy</code> workflow samjhoge. Yeh CCNP Automation (350-901 AUTOCOR) blueprint ka <b>Infrastructure as Code</b> hissa hai.</p>
<p><b>Prerequisites.</b> Aapne JSON aur YAML (module auto-formats) dekhe hone chahiye aur pata hona chahiye ki VPC, subnet aur CIDR block kya hote hain. Terraform pehle use kiya hona zaroori nahi, aur coding aani zaroori nahi. Yahan dikhayi gayi har file line by line explain hai.</p>

<div class="note"><p><b>Is module ki practice kaise karein.</b> NK-OS simulator mein Terraform program nahi hai, isliye is module ki har Terraform file par <b>Reference configuration (not run in the simulator)</b> likha hai aur koi aisa output nahi dikhaya gaya jo asli tool ne na banaya ho. Aas-paas ki aadatein banane ke liye yeh modules use karo: auto-git (.tf files ka version control), auto-ansible (ek aur declarative-style tool, idempotency ke saath), auto-cicd (pipeline se plan aur apply chalana), auto-ssh (devices se baat) aur cloud-vpc (VPC concepts jo Terraform describe karega).</p></div>

<h3>Analogy: architect ka blueprint aur instructions ki list</h3>
<p>Maan lo aap builder se kehte ho: "Ek eent lagao. Ab ek aur. Ab yahan darwaza." Yeh <b>instructions</b> ki list hai. Kal dohraoge to doosra ghar ban jaayega. Ab socho aap builder ko <b>blueprint</b> dete ho jo taiyar ghar dikhata hai. Builder plot dekhta hai, jo ban chuka hai woh dekhta hai, aur sirf baaki kaam karta hai. Wahi blueprint dobara do to kuch nahi hota, kyunki ghar pehle se match karta hai. Blueprint <b>declarative</b> hai: aap bolte ho <i>kya</i> chahiye. Instructions ki list <b>imperative</b> hai: aap bolte ho <i>kaise</i> karna hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Declarative aur imperative">
<rect x="15" y="25" width="290" height="140" rx="12" fill="#fde68a"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="14">Imperative (kaise)</text>
<text x="160" y="80" text-anchor="middle" class="svg-muted" font-size="12">1. VPC banao</text><text x="160" y="100" text-anchor="middle" class="svg-muted" font-size="12">2. subnet jodo</text><text x="160" y="120" text-anchor="middle" class="svg-muted" font-size="12">3. subnet phir jodo?</text><text x="160" y="148" text-anchor="middle" class="svg-accent" font-size="12">do baar chalao = duplicates</text>
<rect x="335" y="25" width="290" height="140" rx="12" fill="#bbf7d0"/><text x="480" y="52" text-anchor="middle" class="svg-ink" font-size="14">Declarative (kya)</text>
<text x="480" y="80" text-anchor="middle" class="svg-muted" font-size="12">ek VPC, 10.20.0.0/16</text><text x="480" y="100" text-anchor="middle" class="svg-muted" font-size="12">ek subnet, 10.20.1.0/24</text><text x="480" y="148" text-anchor="middle" class="svg-accent" font-size="12">do baar chalao = koi change nahi</text>
</svg><p class="cap">End state declare karo; tool steps khud nikalta hai.</p></div>

<h3>Terraform kya hai?</h3>
<p><b>Terraform</b> ek open tool hai jo aapki chahi hui infrastructure describe karti files padhta hai aur platforms (clouds, network controllers, devices) se baat karke cheezein banata, badalta ya hatata hai jab tak reality files se match na kare. Iski files <b>HCL</b> (HashiCorp Configuration Language) mein likhi jaati hain, ek chhoti, padhne layak language jo isi ek kaam ke liye bani hai. Loop hamesha wahi hai:</p>
<ol>
<li>.tf files mein desired state <b>likho</b>.</li>
<li><b>Plan</b>: Terraform aapki files ko jo maujood hai usse compare karke changes ki list dikhata hai. Abhi kuch nahi badalta.</li>
<li><b>Apply</b>: aapke approve karne ke baad Terraform changes karta hai.</li>
</ol>
<p>Files text hain, isliye Git (module auto-git) mein rakh sakte ho, pull request mein changes review kar sakte ho, aur pipeline (module auto-cicd) se chala sakte ho. Network "pichhle mangalwar kisi ne jo type kiya" nahi rehta, balki aisi cheez ban jaata hai jo aap padh, review aur reproduce kar sakte ho.</p>

<h3>Network engineers ke liye yeh kyun zaroori hai</h3>
<ul>
<li><b>Repeatable</b>: wahi files test network aur production network dono banati hain.</li>
<li><b>Reviewable</b>: kuch badalne se pehle colleague plan padhta hai.</li>
<li><b>Auditable</b>: Git history batati hai kisne kya aur kyun badla.</li>
<li><b>Drift-aware</b>: asli duniya files se match nahi karti to Terraform notice karta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Deccan Net ko naye cloud branch ke liye do subnets ke saath VPC 10.20.0.0/16 chahiye. Haath se yeh darjan bhar console clicks hain jo koi record nahi karta. Terraform mein yeh ek file ki lagbhag bees lines hain. Wahi file baad mein ek variable badalkar doosre region ke liye reuse ho sakti hai. Aap isi file ko is module ke chapters mein likhoge.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Same objects par Terraform aur manual console changes ko milana. Phir Terraform insaan se ladta hai: agle apply mein manual change ko undo karne ki koshish karega. Har object ka ek hi owner chuno.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Declarative" ka matlab "koi step nahi hote" nahi hai; matlab aap desired end state describe karte ho aur tool steps compute karta hai. Ansible modules aur Terraform dono spirit mein declarative hain, par Terraform <b>state file</b> rakhta hai aur Ansible aam taur par nahi.</p></div>

<div class="scn"><h4>Dopahar tak doosri branch</h4><p>Ek retailer ko doosre shehar ke liye wahi cloud network chahiye tha. Pehla haath se do din mein bana tha aur har setting kisi ko yaad nahi thi. Ek cloud engineer ne design ko doosri site ke liye Terraform files mein likha, team ke saath plan review kiya, apply kiya, aur lunch se pehle khatam kiya. Baad ke audit mein dono networks identical nikle kyunki dono ek hi files se bane the.</p><p><b>Lesson:</b> jo aap padh sakte ho, woh dohra sakte ho.</p></div>

<div class="iv"><p class="q">"Infrastructure as Code kya hai aur uske liye Terraform kyun?"</p><p>Infrastructure as Code ka matlab infrastructure ko manual steps ki jagah version-controlled text files mein define karna. Terraform declarative hai: aap desired end state describe karte ho, woh reality se farak plan karta hai, aur approval ke baad apply karta hai. Fayde: repeatability, peer review, audit history aur drift detection. Kai platforms ke liye providers aur state file ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Declarative matlab aap bolte ho kya chahiye; tool kaise khud nikalta hai.</li>
<li>Terraform HCL mein likhi .tf files padhta hai aur reality ko unse match karta hai.</li>
<li>Loop hai write, plan (preview), apply (change).</li>
<li>Text files Git mein rehti hain, review hoti hain aur pipelines se chalti hain.</li>
<li>Same objects par manual changes aur Terraform mat milao.</li>
</ul></div>
`}};export{e as default};