var e={id:`cfg-mgmt`,h:{en:`Configuration management: Ansible, Puppet, Chef and Terraform`,hi:`Configuration management: Ansible, Puppet, Chef aur Terraform`},body:{en:`
<p>A school can share homework in two ways. The teacher can walk into every classroom and hand out the sheets: that is <b>push</b>. Or the sheets are pinned on a notice board and every student checks the board every half hour and takes what is new: that is <b>pull</b>. Configuration management tools work in one of these two ways, and knowing which is which answers half the exam questions on this topic.</p>

<h3>What configuration management means</h3>
<p><b>Configuration management</b> tools keep many devices or servers in a known, repeatable state defined in text files. Because the configuration is written as code, stored in Git and reviewed like software, the idea is called <b>Infrastructure as Code (IaC)</b>. The tools share a few core ideas:</p>
<dl class="terms">
<dt>Desired state</dt><dd>You describe what the device should look like (VLAN 10 exists and is named SALES), not every keystroke.</dd>
<dt>Idempotency</dt><dd>Running the same automation many times gives the same result. If the device already matches, nothing is changed.</dd>
<dt>Agent vs agentless</dt><dd>An <b>agent</b> is software installed on each managed node. <b>Agentless</b> tools need nothing on the node except a normal access method such as SSH or an API.</dd>
<dt>Push vs pull</dt><dd><b>Push</b>: a central machine connects out and applies changes when you run it. <b>Pull</b>: agents on the nodes contact a server on a schedule and fetch their configuration.</dd>
<dt>Declarative vs procedural</dt><dd><b>Declarative</b>: describe the end state and let the tool work out the steps. <b>Procedural</b> (imperative): list the steps in order.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Push model and pull model">
<rect x="20" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">Ansible control</text>
<rect x="20" y="150" width="60" height="40" rx="8" fill="#bae6fd"/><text x="50" y="175" text-anchor="middle" class="svg-ink" font-size="12">SW1</text>
<rect x="95" y="150" width="60" height="40" rx="8" fill="#bae6fd"/><text x="125" y="175" text-anchor="middle" class="svg-ink" font-size="12">SW2</text>
<rect x="170" y="150" width="60" height="40" rx="8" fill="#bae6fd"/><text x="200" y="175" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<line x1="70" y1="70" x2="50" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="95" y1="70" x2="125" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="120" y1="70" x2="200" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="210" y="110" class="svg-accent" font-size="12">push over SSH</text>
<text x="125" y="212" text-anchor="middle" class="svg-muted" font-size="12">agentless, you run it</text>
<rect x="420" y="20" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="500" y="50" text-anchor="middle" class="svg-ink" font-size="13">Puppet / Chef server</text>
<rect x="400" y="150" width="60" height="40" rx="8" fill="#fde68a"/><text x="430" y="175" text-anchor="middle" class="svg-ink" font-size="12">agent</text>
<rect x="475" y="150" width="60" height="40" rx="8" fill="#fde68a"/><text x="505" y="175" text-anchor="middle" class="svg-ink" font-size="12">agent</text>
<rect x="550" y="150" width="60" height="40" rx="8" fill="#fde68a"/><text x="580" y="175" text-anchor="middle" class="svg-ink" font-size="12">agent</text>
<line x1="430" y1="150" x2="470" y2="70" stroke="#64748b" stroke-width="2"/>
<line x1="505" y1="150" x2="500" y2="70" stroke="#64748b" stroke-width="2"/>
<line x1="580" y1="150" x2="530" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="330" y="110" class="svg-accent" font-size="12">pull over HTTPS</text>
<text x="505" y="212" text-anchor="middle" class="svg-muted" font-size="12">agents check in on a schedule</text>
</svg><p class="cap">Left: Ansible pushes from a control node. Right: Puppet and Chef agents pull from a server.</p></div>

<h3>The four tools</h3>
<p><b>Ansible</b> (Red Hat) is <b>agentless</b> and <b>push</b>-based. You run it from a <b>control node</b> (a Linux machine). It connects to network devices over <b>SSH</b> (connection type <code>network_cli</code>), NETCONF or an HTTPS API (<code>h&#116;tpapi</code>). Playbooks are written in <b>YAML</b> and call <b>modules</b>, most of which are idempotent. Because network devices rarely allow agents, Ansible is the most common tool in networking.</p>
<p><b>Puppet</b> uses an <b>agent</b> on each node that <b>pulls</b> its configuration from a <b>Puppet server</b> over HTTPS, by default on <b>TCP 8140</b> and every 30 minutes. Configuration is written in <b>manifests</b> using Puppet's own <b>declarative</b> language, grouped into modules. Devices that cannot run an agent can be managed through a proxy agent.</p>
<p><b>Chef</b> also uses an <b>agent</b> (chef-client) that <b>pulls</b> from a <b>Chef server</b> over HTTPS. Configuration is written in <b>Ruby</b> as <b>recipes</b>, grouped into <b>cookbooks</b>; the style is more procedural. Engineers work from a workstation and upload cookbooks to the server.</p>
<p><b>Terraform</b> (HashiCorp) is an agentless, <b>declarative</b> IaC tool best known for <b>provisioning</b>: creating infrastructure such as cloud networks, virtual machines or controller objects. You write <b>HCL</b> (HashiCorp Configuration Language) files; <b>providers</b> translate them into API calls (public clouds, Cisco ACI, Catalyst Center, Meraki and many more). Terraform keeps a <b>state file</b> that maps your code to the real resources, so it can calculate exactly what must change. The workflow is <code>terraform init</code>, <code>terraform plan</code> (preview), <code>terraform apply</code>.</p>

<table class="cmp"><tr><th></th><th>Ansible</th><th>Puppet</th><th>Chef</th><th>Terraform</th></tr>
<tr><td>Agent</td><td>Agentless</td><td>Agent</td><td>Agent</td><td>Agentless</td></tr>
<tr><td>Model</td><td>Push</td><td>Pull</td><td>Pull</td><td>Push via APIs</td></tr>
<tr><td>Language</td><td>YAML playbooks</td><td>Puppet DSL manifests</td><td>Ruby recipes, cookbooks</td><td>HCL</td></tr>
<tr><td>Transport</td><td>SSH, NETCONF, HTTPS</td><td>HTTPS, TCP 8140</td><td>HTTPS</td><td>Provider APIs</td></tr>
<tr><td>Best known for</td><td>Configuration, tasks</td><td>Server configuration</td><td>Server configuration</td><td>Provisioning, state file</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A team uses Terraform to create a new tenant and three network segments on a data center controller. <code>terraform plan</code> shows what it will do before anything changes:</p>
<pre class="out">$ terraform plan
  # aci_tenant.nk will be created
  + resource "aci_tenant" "nk" {
      + name = "NK-PROD"
    }
...
<span class="hl">Plan: 4 to add, 0 to change, 0 to destroy.</span></pre>
<p>After <code>terraform apply</code>, a second <code>plan</code> reports "No changes", which is Terraform's version of idempotency. They then use Ansible to push day-to-day settings such as NTP and banners to the switches.</p></div>

<div class="warn"><p><b>Common mistake.</b> Saying "agentless means no requirements". Ansible still needs SSH (or an API) enabled on the device, valid credentials in the inventory, and reachability from the control node. Most failures in the Fix the playbook lab come from exactly these.</p></div>

<div class="exam"><p><b>Exam trap.</b> Ansible = agentless, push, YAML, SSH. Puppet = agent, pull, manifests, TCP 8140. Chef = agent, pull, Ruby recipes and cookbooks. Terraform = declarative, HCL, state file, plan and apply, provisioning. The current CCNA blueprint names Ansible and Terraform, but questions comparing Puppet and Chef still appear in practice material.</p></div>

<div class="scn"><h4>The segment someone deleted by hand</h4><p>A cloud team built its branch VPN hub with Terraform. One night an engineer deleted a route table by hand in the cloud console while testing. The next morning <code>terraform plan</code> reported "1 to add", showing exactly what had drifted from the code. The team applied the plan, the route table came back identical, and they added a rule: changes only through reviewed code.</p><p><b>Lesson:</b> a desired-state tool doubles as a drift detector; the code, not memory, is the source of truth.</p></div>

<div class="iv"><p class="q">"Compare Ansible, Puppet and Chef. Where does Terraform fit?"</p><p>Strong answer: Ansible is agentless and push-based, written in YAML, connecting over SSH or APIs, which suits network devices. Puppet and Chef are agent-based and pull from a server: Puppet uses declarative manifests on TCP 8140, Chef uses Ruby recipes and cookbooks. Terraform is declarative IaC in HCL that uses provider APIs and a state file, mainly for provisioning; it is often combined with Ansible for configuration. Finish with idempotency as the shared goal.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IaC: configuration as code in Git, applied by tools, with drift detection.</li>
<li>Know the terms: desired state, idempotency, agent vs agentless, push vs pull, declarative vs procedural.</li>
<li>Ansible: agentless, push, YAML, SSH. Puppet: agent, pull, manifests, TCP 8140. Chef: agent, pull, Ruby cookbooks.</li>
<li>Terraform: declarative HCL, providers, state file, init/plan/apply, mainly provisioning.</li>
<li>A second run with nothing to change proves idempotency.</li>
</ul></div>
`,hi:`
<p>School homework do tareeke se baant sakta hai. Teacher har classroom mein jaakar sheets de sakti hai: yeh <b>push</b> hai. Ya sheets notice board par lagi hon aur har student har aadhe ghante board check karke jo naya hai woh le le: yeh <b>pull</b> hai. Configuration management tools in do mein se ek tareeke se kaam karte hain, aur kaunsa kaunsa hai yeh jaanna is topic ke aadhe exam questions ka jawab de deta hai.</p>

<h3>Configuration management ka matlab</h3>
<p><b>Configuration management</b> tools bahut saare devices ya servers ko text files mein define ki gayi ek known, repeatable state mein rakhte hain. Kyunki configuration code ki tarah likhi jaati hai, Git mein rakhi jaati hai aur software ki tarah review hoti hai, is idea ko <b>Infrastructure as Code (IaC)</b> kehte hain. Tools kuch core ideas share karte hain:</p>
<dl class="terms">
<dt>Desired state</dt><dd>Aap batate ho ki device kaisa dikhna chahiye (VLAN 10 exist kare aur uska naam SALES ho), har keystroke nahi.</dd>
<dt>Idempotency</dt><dd>Same automation kai baar chalao to result same. Agar device pehle se match karta hai, kuch nahi badalta.</dd>
<dt>Agent vs agentless</dt><dd><b>Agent</b> har managed node par install kiya gaya software hai. <b>Agentless</b> tools ko node par SSH ya API jaise normal access method ke alawa kuch nahi chahiye.</dd>
<dt>Push vs pull</dt><dd><b>Push</b>: ek central machine bahar connect karke changes apply karti hai jab aap use chalate ho. <b>Pull</b>: nodes par agents schedule par ek server se contact karke apni configuration laate hain.</dd>
<dt>Declarative vs procedural</dt><dd><b>Declarative</b>: end state batao aur tool ko steps khud nikalne do. <b>Procedural</b> (imperative): steps order mein list karo.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Push model aur pull model">
<rect x="20" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">Ansible control</text>
<rect x="20" y="150" width="60" height="40" rx="8" fill="#bae6fd"/><text x="50" y="175" text-anchor="middle" class="svg-ink" font-size="12">SW1</text>
<rect x="95" y="150" width="60" height="40" rx="8" fill="#bae6fd"/><text x="125" y="175" text-anchor="middle" class="svg-ink" font-size="12">SW2</text>
<rect x="170" y="150" width="60" height="40" rx="8" fill="#bae6fd"/><text x="200" y="175" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<line x1="70" y1="70" x2="50" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="95" y1="70" x2="125" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="120" y1="70" x2="200" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="210" y="110" class="svg-accent" font-size="12">SSH par push</text>
<text x="125" y="212" text-anchor="middle" class="svg-muted" font-size="12">agentless, aap chalate ho</text>
<rect x="420" y="20" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="500" y="50" text-anchor="middle" class="svg-ink" font-size="13">Puppet / Chef server</text>
<rect x="400" y="150" width="60" height="40" rx="8" fill="#fde68a"/><text x="430" y="175" text-anchor="middle" class="svg-ink" font-size="12">agent</text>
<rect x="475" y="150" width="60" height="40" rx="8" fill="#fde68a"/><text x="505" y="175" text-anchor="middle" class="svg-ink" font-size="12">agent</text>
<rect x="550" y="150" width="60" height="40" rx="8" fill="#fde68a"/><text x="580" y="175" text-anchor="middle" class="svg-ink" font-size="12">agent</text>
<line x1="430" y1="150" x2="470" y2="70" stroke="#64748b" stroke-width="2"/>
<line x1="505" y1="150" x2="500" y2="70" stroke="#64748b" stroke-width="2"/>
<line x1="580" y1="150" x2="530" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="330" y="110" class="svg-accent" font-size="12">HTTPS par pull</text>
<text x="505" y="212" text-anchor="middle" class="svg-muted" font-size="12">agents schedule par check in karte hain</text>
</svg><p class="cap">Left: Ansible control node se push karta hai. Right: Puppet aur Chef agents server se pull karte hain.</p></div>

<h3>Chaar tools</h3>
<p><b>Ansible</b> (Red Hat) <b>agentless</b> aur <b>push</b>-based hai. Aap ise ek <b>control node</b> (Linux machine) se chalate ho. Yeh network devices se <b>SSH</b> (connection type <code>network_cli</code>), NETCONF ya HTTPS API (<code>h&#116;tpapi</code>) par connect karta hai. Playbooks <b>YAML</b> mein likhe jaate hain aur <b>modules</b> call karte hain, jinmein se zyada tar idempotent hain. Kyunki network devices par agents kam hi allow hote hain, networking mein Ansible sabse common tool hai.</p>
<p><b>Puppet</b> har node par ek <b>agent</b> use karta hai jo <b>Puppet server</b> se HTTPS par apni configuration <b>pull</b> karta hai, default mein <b>TCP 8140</b> par aur har 30 minute. Configuration Puppet ki apni <b>declarative</b> language mein <b>manifests</b> mein likhi jaati hai, modules mein grouped. Jo devices agent nahi chala sakte unhe proxy agent se manage kiya ja sakta hai.</p>
<p><b>Chef</b> bhi ek <b>agent</b> (chef-client) use karta hai jo <b>Chef server</b> se HTTPS par <b>pull</b> karta hai. Configuration <b>Ruby</b> mein <b>recipes</b> ke roop mein likhi jaati hai, <b>cookbooks</b> mein grouped; style zyada procedural hai. Engineers ek workstation se kaam karte hain aur cookbooks server par upload karte hain.</p>
<p><b>Terraform</b> (HashiCorp) ek agentless, <b>declarative</b> IaC tool hai jo <b>provisioning</b> ke liye mashhoor hai: cloud networks, virtual machines ya controller objects jaisa infrastructure banana. Aap <b>HCL</b> (HashiCorp Configuration Language) files likhte ho; <b>providers</b> unhe API calls mein translate karte hain (public clouds, Cisco ACI, Catalyst Center, Meraki aur bahut saare). Terraform ek <b>state file</b> rakhta hai jo aapke code ko asli resources se map karti hai, taaki woh exactly calculate kar sake ki kya badalna hai. Workflow hai <code>terraform init</code>, <code>terraform plan</code> (preview), <code>terraform apply</code>.</p>

<table class="cmp"><tr><th></th><th>Ansible</th><th>Puppet</th><th>Chef</th><th>Terraform</th></tr>
<tr><td>Agent</td><td>Agentless</td><td>Agent</td><td>Agent</td><td>Agentless</td></tr>
<tr><td>Model</td><td>Push</td><td>Pull</td><td>Pull</td><td>APIs se push</td></tr>
<tr><td>Language</td><td>YAML playbooks</td><td>Puppet DSL manifests</td><td>Ruby recipes, cookbooks</td><td>HCL</td></tr>
<tr><td>Transport</td><td>SSH, NETCONF, HTTPS</td><td>HTTPS, TCP 8140</td><td>HTTPS</td><td>Provider APIs</td></tr>
<tr><td>Kis liye mashhoor</td><td>Configuration, tasks</td><td>Server configuration</td><td>Server configuration</td><td>Provisioning, state file</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek team Terraform se data center controller par ek naya tenant aur teen network segments banati hai. <code>terraform plan</code> kuch bhi badalne se pehle dikhata hai ki woh kya karega:</p>
<pre class="out">$ terraform plan
  # aci_tenant.nk will be created
  + resource "aci_tenant" "nk" {
      + name = "NK-PROD"
    }
...
<span class="hl">Plan: 4 to add, 0 to change, 0 to destroy.</span></pre>
<p><code>terraform apply</code> ke baad doosra <code>plan</code> "No changes" report karta hai, jo Terraform ka idempotency wala version hai. Phir woh switches par NTP aur banners jaisi rozana ki settings push karne ke liye Ansible use karte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Kehna ki "agentless ka matlab koi requirement nahi". Ansible ko abhi bhi device par SSH (ya API) enabled, inventory mein valid credentials, aur control node se reachability chahiye. Fix the playbook lab ke zyada tar failures bilkul inhi se aate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Ansible = agentless, push, YAML, SSH. Puppet = agent, pull, manifests, TCP 8140. Chef = agent, pull, Ruby recipes aur cookbooks. Terraform = declarative, HCL, state file, plan aur apply, provisioning. Current CCNA blueprint Ansible aur Terraform ka naam leta hai, par Puppet aur Chef compare karne wale sawaal practice material mein abhi bhi aate hain.</p></div>

<div class="scn"><h4>Woh segment jo kisi ne haath se delete kiya</h4><p>Ek cloud team ne apna branch VPN hub Terraform se banaya. Ek raat ek engineer ne testing ke dauraan cloud console mein haath se ek route table delete kar di. Agli subah <code>terraform plan</code> ne "1 to add" report kiya, jo exactly dikhata tha ki code se kya drift hua. Team ne plan apply kiya, route table bilkul same wapas aa gayi, aur unhone ek rule joda: changes sirf reviewed code se.</p><p><b>Seekh:</b> desired-state tool drift detector ka kaam bhi karta hai; source of truth code hai, yaad nahi.</p></div>

<div class="iv"><p class="q">"Ansible, Puppet aur Chef compare karo. Terraform kahan fit hota hai?"</p><p>Strong answer: Ansible agentless aur push-based hai, YAML mein likha jaata hai, SSH ya APIs par connect karta hai, jo network devices ke liye suit karta hai. Puppet aur Chef agent-based hain aur server se pull karte hain: Puppet TCP 8140 par declarative manifests use karta hai, Chef Ruby recipes aur cookbooks. Terraform HCL mein declarative IaC hai jo provider APIs aur state file use karta hai, mainly provisioning ke liye; ise aksar configuration ke liye Ansible ke saath combine kiya jaata hai. End mein idempotency ko common goal batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IaC: configuration code ki tarah Git mein, tools se apply, drift detection ke saath.</li>
<li>Terms jaano: desired state, idempotency, agent vs agentless, push vs pull, declarative vs procedural.</li>
<li>Ansible: agentless, push, YAML, SSH. Puppet: agent, pull, manifests, TCP 8140. Chef: agent, pull, Ruby cookbooks.</li>
<li>Terraform: declarative HCL, providers, state file, init/plan/apply, mainly provisioning.</li>
<li>Doosra run jismein kuch badalna na ho, idempotency saabit karta hai.</li>
</ul></div>
`}};export{e as default};