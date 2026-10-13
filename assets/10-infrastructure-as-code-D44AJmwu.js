var e={id:`iac`,h:{en:`Infrastructure as code: automation and source control`,hi:`Infrastructure as code: automation aur source control`},body:{en:`
<p>A good restaurant chain does not let every cook improvise. There is one recipe book, kept at head office. Every branch cooks from the same recipes, so a dish tastes the same everywhere. When a chef improves a recipe, the change is written down, tested in one kitchen, approved and only then sent to every branch; if customers dislike it, the old page is still there. <b>Infrastructure as code (IaC)</b> is the recipe book for networks and cloud.</p>

<h3>What IaC means</h3>
<p><b>Infrastructure as code</b> describes infrastructure (VPCs, subnets, security groups, router and switch configurations) in text files that a tool reads and applies, instead of clicking in consoles or typing commands device by device. The files are the single source of truth. Two common styles:</p>
<ul>
<li><b>Declarative</b>: you describe the desired end state and the tool works out the steps. Example: Terraform for cloud resources.</li>
<li><b>Procedural / task-based</b>: you list tasks to run in order. Example: Ansible playbooks for network devices and servers.</li>
</ul>

<h3>Automation building blocks</h3>
<dl class="terms">
<dt>Playbooks, templates and reusable tasks</dt><dd>A <b>playbook</b> is a file of tasks run against a group of devices. A <b>template</b> is a configuration with variables (hostname, IP, VLAN) filled in per device, so twelve branch configs come from one file. <b>Reusable tasks</b> (roles, modules) are written once and used by many playbooks.</dd>
<dt>Configuration drift and compliance</dt><dd><b>Drift</b> is when the live configuration no longer matches the code, usually after a manual "quick fix". IaC tools detect drift by comparing the real state with the code, and a <b>compliance</b> check reports devices that break the standard (no NTP, telnet enabled, SSH open to the world) and can put them back.</dd>
<dt>Upgrades</dt><dd>Software upgrades are automated as a repeatable workflow: pre-checks, copy the image, upgrade in small <b>rolling batches</b>, post-checks, stop on failure.</dd>
<dt>Dynamic inventories</dt><dd>Instead of a hand-written list of hosts, the inventory is pulled at run time from the source of truth: a cloud API, a CMDB or an IPAM. Autoscaled VMs that did not exist yesterday are included automatically.</dd>
</dl>

<pre class="code"><span class="c"># Terraform (declarative): the VPC and one public subnet</span>
resource "aws_vpc" "hl_prod" {
  cidr_block = "10.20.0.0/16"
  tags       = { Name = "hl-prod" }
}

resource "aws_subnet" "public_a" {
  vpc_id     = aws_vpc.hl_prod.id
  cidr_block = "10.20.1.0/24"
}

<span class="c"># Ansible (task-based): baseline for every branch router</span>
- name: Branch router baseline
  hosts: branch_routers
  gather_facts: false
  serial: 2
  tasks:
    - name: NTP and syslog servers
      cisco.ios.ios_config:
        lines:
          - ntp server 10.10.1.10
          - logging host 10.10.1.20
        save_when: modified</pre>
<p><code>serial: 2</code> makes Ansible work on two routers at a time, the same rolling idea used for upgrades.</p>

<h3>Source control</h3>
<p>Code needs <b>version control</b>, usually <b>Git</b>. Every change is a commit with an author, a time and a message, so you can see who changed what and roll back.</p>
<ul>
<li><b>Central repository</b>: one shared copy (on a Git server) that everyone pulls from and pushes to; the automation pipeline deploys only from it.</li>
<li><b>Branching</b>: work happens on a separate <b>branch</b> (for example <code>feature/branch13</code>) so the main branch always stays deployable. Changes return to main through a reviewed merge (pull or merge request).</li>
<li><b>Conflict identification</b>: when two people change the same lines on different branches, Git refuses to guess and marks a <b>merge conflict</b> for a human to resolve.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Git branching and deployment pipeline">
<line x1="30" y1="60" x2="430" y2="60" stroke="#64748b" stroke-width="3"/><text x="30" y="45" class="svg-ink" font-size="13">main</text>
<circle cx="70" cy="60" r="9" fill="#bae6fd" stroke="#64748b"/><circle cx="200" cy="60" r="9" fill="#bae6fd" stroke="#64748b"/><circle cx="380" cy="60" r="9" fill="#bbf7d0" stroke="#64748b"/>
<path d="M70 60 Q 110 130 150 130 L 300 130 Q 350 130 380 60" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<circle cx="170" cy="130" r="8" fill="#fde68a" stroke="#64748b"/><circle cx="270" cy="130" r="8" fill="#fde68a" stroke="#64748b"/>
<text x="220" y="160" text-anchor="middle" class="svg-muted" font-size="12">feature/branch13 commits</text>
<text x="330" y="105" text-anchor="middle" class="svg-accent" font-size="12">review + merge</text>
<rect x="450" y="35" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="535" y="57" text-anchor="middle" class="svg-ink" font-size="13">Pipeline</text><text x="535" y="75" text-anchor="middle" class="svg-muted" font-size="12">plan, test, apply</text>
<line x1="430" y1="60" x2="450" y2="60" stroke="#64748b" stroke-width="3"/>
<rect x="450" y="120" width="170" height="40" rx="8" fill="#bae6fd"/><text x="535" y="145" text-anchor="middle" class="svg-ink" font-size="12">Cloud VPC</text>
<rect x="450" y="170" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="535" y="195" text-anchor="middle" class="svg-ink" font-size="12">Branch routers</text>
<line x1="535" y1="85" x2="535" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Changes are made on a branch, reviewed, merged to main in the central repository, and only then deployed by the pipeline.</p></div>

<div class="eg"><p><b>Worked example: drift and a conflict at Harbourline.</b> During an outage, someone opened SSH to 0.0.0.0/0 on sg-web in the console and forgot it. The nightly <code>terraform plan</code> shows the drift and proposes removing the extra rule:</p></div>
<pre class="out">Terraform will perform the following actions:

  # aws_security_group.web will be updated in-place
  ~ resource "aws_security_group" "web" {
        id      = "sg-0123456789abcdef0"
      ~ ingress = [
          <span class="hl">- {
              - cidr_blocks = ["0.0.0.0/0"]
              - from_port   = 22
              - protocol    = "tcp"
              - to_port     = 22
                # (3 unchanged attributes hidden)
            },</span>
            # (1 unchanged element hidden)
        ]
        name    = "sg-web"
        # (6 unchanged attributes hidden)
    }

<span class="hl">Plan: 0 to add, 1 to change, 0 to destroy.</span></pre>
<p>Meanwhile two engineers both claimed 10.20.3.0/24 for different new subnets on two branches. The second merge stops:</p>
<pre class="out">$ git merge feature/warehouse-subnet
Auto-merging vpc/subnets.tf
<span class="hl">CONFLICT (content): Merge conflict in vpc/subnets.tf</span>
Automatic merge failed; fix conflicts and then commit the result.

$ grep -n -A6 "&lt;&lt;&lt;&lt;&lt;&lt;&lt;" vpc/subnets.tf
41:&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
42-  cidr_block = "10.20.3.0/24"   # branch13 staging
43-=======
44-  cidr_block = "10.20.3.0/24"   # warehouse scanners
45-&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/warehouse-subnet</pre>
<p>Git caught the overlap before it reached production. The team gives the warehouse 10.20.4.0/24, commits the fix and merges.</p>

<div class="warn"><p><b>Common mistakes.</b> Making "just one quick change" in the console, which creates drift that the next pipeline run silently reverts. Storing passwords and keys in the repository in plain text; use a secrets vault. Committing straight to main without review. Running a playbook against every device at once instead of in batches.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match the words: reusable configuration with variables = template; ordered tasks = playbook; live config differs from code = drift; inventory built from a cloud API at run time = dynamic inventory; separate line of work = branch; two changes to the same lines = conflict; single shared copy = central repository.</p></div>

<div class="scn"><h4>The rule that kept coming back</h4><p>A firewall team kept deleting a risky rule from a cloud security group, and every Monday it reappeared. The cause: the rule was still in the Terraform code, and the weekly pipeline "fixed the drift" by re-creating it. The engineer removed the rule in a branch, got it reviewed and merged, and the next run removed it for good.</p><p><b>Lesson:</b> with IaC, the code is the truth. Change the code, not the device.</p></div>

<div class="iv"><p class="q">"What is infrastructure as code and why does it matter for networks?"</p><p>Strong answer: IaC defines infrastructure and configuration in version-controlled files that tools such as Terraform or Ansible apply automatically. Benefits: consistency through templates and reusable tasks, speed, drift detection and compliance, safe rolling upgrades, and dynamic inventories from the cloud API. Source control gives history, rollback, branching, peer review and conflict detection in a central repository. Mention storing secrets outside the repo and the rule "change the code, not the device".</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IaC describes infrastructure in files; tools apply them repeatably (declarative Terraform, task-based Ansible).</li>
<li>Playbooks, templates and reusable tasks give consistent configuration across many devices.</li>
<li>Drift = live state differs from code; compliance checks find and fix it; upgrades run in rolling batches.</li>
<li>Dynamic inventories pull hosts from a cloud API, CMDB or IPAM at run time.</li>
<li>Git: version control, central repository, branching, reviewed merges and conflict identification.</li>
</ul></div>
`,hi:`
<p>Ek achhi restaurant chain har cook ko improvise nahi karne deti. Ek recipe book hoti hai, head office mein rakhi. Har branch same recipes se khana banati hai, isliye dish har jagah same taste karti hai. Jab koi chef recipe behtar karta hai, change likha jaata hai, ek kitchen mein test hota hai, approve hota hai aur tab jaakar har branch ko bheja jaata hai; agar customers ko pasand na aaye, to purana page abhi bhi wahan hai. <b>Infrastructure as code (IaC)</b> networks aur cloud ki recipe book hai.</p>

<h3>IaC ka matlab kya hai</h3>
<p><b>Infrastructure as code</b> infrastructure (VPCs, subnets, security groups, router aur switch configurations) ko text files mein describe karta hai jinhe ek tool padhta aur apply karta hai, consoles mein click karne ya device by device commands type karne ki jagah. Files hi single source of truth hain. Do common styles:</p>
<ul>
<li><b>Declarative</b>: aap desired end state describe karte ho aur tool steps khud nikalta hai. Example: cloud resources ke liye Terraform.</li>
<li><b>Procedural / task-based</b>: aap order mein chalne wale tasks list karte ho. Example: network devices aur servers ke liye Ansible playbooks.</li>
</ul>

<h3>Automation building blocks</h3>
<dl class="terms">
<dt>Playbooks, templates aur reusable tasks</dt><dd><b>Playbook</b> tasks ki ek file hai jo devices ke group par chalti hai. <b>Template</b> variables (hostname, IP, VLAN) wali configuration hai jo har device ke liye bhari jaati hai, taaki barah branch configs ek hi file se aayein. <b>Reusable tasks</b> (roles, modules) ek baar likhe jaate hain aur kai playbooks use karti hain.</dd>
<dt>Configuration drift aur compliance</dt><dd><b>Drift</b> tab hota hai jab live configuration code se match nahi karti, aam taur par kisi manual "quick fix" ke baad. IaC tools real state ko code se compare karke drift detect karte hain, aur <b>compliance</b> check un devices ko report karta hai jo standard todte hain (NTP nahi, telnet enabled, SSH duniya ke liye khula) aur unhe wapas theek kar sakta hai.</dd>
<dt>Upgrades</dt><dd>Software upgrades ek repeatable workflow ki tarah automate hote hain: pre-checks, image copy, chhote <b>rolling batches</b> mein upgrade, post-checks, failure par ruk jaana.</dd>
<dt>Dynamic inventories</dt><dd>Haath se likhi hosts ki list ki jagah, inventory run time par source of truth se li jaati hai: cloud API, CMDB ya IPAM. Kal tak jo autoscaled VMs exist nahi karte the woh automatically shamil ho jaate hain.</dd>
</dl>

<pre class="code"><span class="c"># Terraform (declarative): VPC aur ek public subnet</span>
resource "aws_vpc" "hl_prod" {
  cidr_block = "10.20.0.0/16"
  tags       = { Name = "hl-prod" }
}

resource "aws_subnet" "public_a" {
  vpc_id     = aws_vpc.hl_prod.id
  cidr_block = "10.20.1.0/24"
}

<span class="c"># Ansible (task-based): har branch router ki baseline</span>
- name: Branch router baseline
  hosts: branch_routers
  gather_facts: false
  serial: 2
  tasks:
    - name: NTP and syslog servers
      cisco.ios.ios_config:
        lines:
          - ntp server 10.10.1.10
          - logging host 10.10.1.20
        save_when: modified</pre>
<p><code>serial: 2</code> Ansible ko ek samay mein do routers par kaam karwata hai, wahi rolling idea jo upgrades mein use hota hai.</p>

<h3>Source control</h3>
<p>Code ko <b>version control</b> chahiye, aam taur par <b>Git</b>. Har change ek commit hai jismein author, time aur message hota hai, taaki aap dekh sako kisne kya badla aur roll back kar sako.</p>
<ul>
<li><b>Central repository</b>: ek shared copy (Git server par) jisse sab pull aur jismein push karte hain; automation pipeline sirf isi se deploy karti hai.</li>
<li><b>Branching</b>: kaam ek alag <b>branch</b> par hota hai (jaise <code>feature/branch13</code>) taaki main branch hamesha deployable rahe. Changes reviewed merge (pull ya merge request) se main mein wapas aate hain.</li>
<li><b>Conflict identification</b>: jab do log alag branches par same lines badalte hain, Git guess karne se mana karta hai aur insaan ke resolve karne ke liye <b>merge conflict</b> mark karta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Git branching and deployment pipeline">
<line x1="30" y1="60" x2="430" y2="60" stroke="#64748b" stroke-width="3"/><text x="30" y="45" class="svg-ink" font-size="13">main</text>
<circle cx="70" cy="60" r="9" fill="#bae6fd" stroke="#64748b"/><circle cx="200" cy="60" r="9" fill="#bae6fd" stroke="#64748b"/><circle cx="380" cy="60" r="9" fill="#bbf7d0" stroke="#64748b"/>
<path d="M70 60 Q 110 130 150 130 L 300 130 Q 350 130 380 60" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<circle cx="170" cy="130" r="8" fill="#fde68a" stroke="#64748b"/><circle cx="270" cy="130" r="8" fill="#fde68a" stroke="#64748b"/>
<text x="220" y="160" text-anchor="middle" class="svg-muted" font-size="12">feature/branch13 commits</text>
<text x="330" y="105" text-anchor="middle" class="svg-accent" font-size="12">review + merge</text>
<rect x="450" y="35" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="535" y="57" text-anchor="middle" class="svg-ink" font-size="13">Pipeline</text><text x="535" y="75" text-anchor="middle" class="svg-muted" font-size="12">plan, test, apply</text>
<line x1="430" y1="60" x2="450" y2="60" stroke="#64748b" stroke-width="3"/>
<rect x="450" y="120" width="170" height="40" rx="8" fill="#bae6fd"/><text x="535" y="145" text-anchor="middle" class="svg-ink" font-size="12">Cloud VPC</text>
<rect x="450" y="170" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="535" y="195" text-anchor="middle" class="svg-ink" font-size="12">Branch routers</text>
<line x1="535" y1="85" x2="535" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Changes branch par hote hain, review hote hain, central repository mein main mein merge hote hain, aur tab jaakar pipeline deploy karti hai.</p></div>

<div class="eg"><p><b>Worked example: Harbourline mein drift aur conflict.</b> Ek outage ke dauraan, kisi ne console mein sg-web par SSH ko 0.0.0.0/0 ke liye khol diya aur bhool gaya. Raat ka <code>terraform plan</code> drift dikhata hai aur extra rule hatane ka proposal deta hai:</p></div>
<pre class="out">Terraform will perform the following actions:

  # aws_security_group.web will be updated in-place
  ~ resource "aws_security_group" "web" {
        id      = "sg-0123456789abcdef0"
      ~ ingress = [
          <span class="hl">- {
              - cidr_blocks = ["0.0.0.0/0"]
              - from_port   = 22
              - protocol    = "tcp"
              - to_port     = 22
                # (3 unchanged attributes hidden)
            },</span>
            # (1 unchanged element hidden)
        ]
        name    = "sg-web"
        # (6 unchanged attributes hidden)
    }

<span class="hl">Plan: 0 to add, 1 to change, 0 to destroy.</span></pre>
<p>Isi beech do engineers ne do branches par alag naye subnets ke liye 10.20.3.0/24 claim kar liya. Doosra merge ruk jaata hai:</p>
<pre class="out">$ git merge feature/warehouse-subnet
Auto-merging vpc/subnets.tf
<span class="hl">CONFLICT (content): Merge conflict in vpc/subnets.tf</span>
Automatic merge failed; fix conflicts and then commit the result.

$ grep -n -A6 "&lt;&lt;&lt;&lt;&lt;&lt;&lt;" vpc/subnets.tf
41:&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
42-  cidr_block = "10.20.3.0/24"   # branch13 staging
43-=======
44-  cidr_block = "10.20.3.0/24"   # warehouse scanners
45-&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/warehouse-subnet</pre>
<p>Git ne overlap ko production tak pahunchne se pehle pakad liya. Team warehouse ko 10.20.4.0/24 deti hai, fix commit karti hai aur merge karti hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Console mein "bas ek quick change" karna, jo drift banata hai jise agla pipeline run chupchaap revert kar deta hai. Passwords aur keys ko repository mein plain text mein rakhna; secrets vault use karo. Bina review ke seedha main par commit karna. Batches ki jagah ek saath har device par playbook chalana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Words match karo: variables wali reusable configuration = template; ordered tasks = playbook; live config code se alag = drift; run time par cloud API se bani inventory = dynamic inventory; kaam ki alag line = branch; same lines par do changes = conflict; single shared copy = central repository.</p></div>

<div class="scn"><h4>Woh rule jo baar baar wapas aata tha</h4><p>Ek firewall team cloud security group se ek risky rule baar baar delete karti thi, aur har Monday woh wapas aa jaata tha. Wajah: rule abhi bhi Terraform code mein tha, aur weekly pipeline use dobara banakar "drift theek" kar deti thi. Engineer ne rule ek branch mein hataya, review karwaya aur merge kiya, aur agle run ne use hamesha ke liye hata diya.</p><p><b>Seekh:</b> IaC ke saath code hi sach hai. Code badlo, device nahi.</p></div>

<div class="iv"><p class="q">"Infrastructure as code kya hai aur networks ke liye yeh kyun matter karta hai?"</p><p>Strong answer: IaC infrastructure aur configuration ko version-controlled files mein define karta hai jinhe Terraform ya Ansible jaise tools automatically apply karte hain. Fayde: templates aur reusable tasks se consistency, speed, drift detection aur compliance, safe rolling upgrades, aur cloud API se dynamic inventories. Source control central repository mein history, rollback, branching, peer review aur conflict detection deta hai. Secrets ko repo ke bahar rakhne aur "code badlo, device nahi" rule ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IaC infrastructure ko files mein describe karta hai; tools unhe repeatably apply karte hain (declarative Terraform, task-based Ansible).</li>
<li>Playbooks, templates aur reusable tasks kai devices par consistent configuration dete hain.</li>
<li>Drift = live state code se alag; compliance checks use dhoondte aur theek karte hain; upgrades rolling batches mein chalte hain.</li>
<li>Dynamic inventories run time par cloud API, CMDB ya IPAM se hosts laati hain.</li>
<li>Git: version control, central repository, branching, reviewed merges aur conflict identification.</li>
</ul></div>
`}};export{e as default};