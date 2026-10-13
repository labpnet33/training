var e={id:`shared-responsibility`,h:{en:`Shared responsibility in IaaS, PaaS and SaaS`,hi:`IaaS, PaaS aur SaaS mein shared responsibility`},body:{en:`
<p>Think about food. If you cook at home, you buy the vegetables, own the kitchen, cook and wash up (on-premises). If you rent a kitchen with a stove, you still buy, cook and clean, but the landlord fixes the gas line (IaaS). If you order a meal kit, the ingredients come prepared and you only assemble the dish (PaaS). If you eat at a restaurant, you only choose what to order and who sits at your table (SaaS). The less you do, the less you control, and the less you are responsible for. But you always decide who sits at your table.</p>

<h3>The three service models</h3>
<dl class="terms">
<dt>IaaS (Infrastructure as a Service)</dt><dd>You rent virtual machines, virtual networks, storage and load balancers. You install and patch the guest operating system and everything on top. Examples: virtual machines, block storage, virtual private clouds.</dd>
<dt>PaaS (Platform as a Service)</dt><dd>The provider runs the operating system and runtime; you deploy code or use a managed service. Examples: managed databases, app platforms, serverless functions (often called FaaS), managed Kubernetes control planes.</dd>
<dt>SaaS (Software as a Service)</dt><dd>A complete application delivered over the internet. You configure users, sharing and data. Examples: e-mail and office suites, CRM, Webex, HR systems.</dd>
</dl>

<h3>The responsibility matrix</h3>
<table class="cmp"><tr><th>Layer</th><th>On-prem</th><th>IaaS</th><th>PaaS</th><th>SaaS</th></tr>
<tr><td>Data, classification, accounts and access</td><td>Customer</td><td>Customer</td><td>Customer</td><td>Customer</td></tr>
<tr><td>Endpoints and identities (MFA, keys)</td><td>Customer</td><td>Customer</td><td>Customer</td><td>Customer</td></tr>
<tr><td>Application code and its settings</td><td>Customer</td><td>Customer</td><td>Customer</td><td>Provider (you configure it)</td></tr>
<tr><td>Runtime, middleware, guest OS</td><td>Customer</td><td>Customer</td><td>Provider</td><td>Provider</td></tr>
<tr><td>Virtual network controls (security groups)</td><td>Customer</td><td>Customer</td><td>Shared</td><td>Provider</td></tr>
<tr><td>Hypervisor, hosts, storage hardware</td><td>Customer</td><td>Provider</td><td>Provider</td><td>Provider</td></tr>
<tr><td>Physical data center, power, cooling</td><td>Customer</td><td>Provider</td><td>Provider</td><td>Provider</td></tr>
</table>
<p>Read it from the bottom up. The provider's part grows as you move from IaaS to SaaS. The top two rows never move: <b>data, identity and access configuration always belong to the customer</b>. This is the single most tested idea in the domain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Responsibility line per service model">
<text x="95" y="20" text-anchor="middle" class="svg-ink" font-size="13">IaaS</text><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">PaaS</text><text x="545" y="20" text-anchor="middle" class="svg-ink" font-size="13">SaaS</text>
<rect x="10" y="30" width="170" height="110" rx="8" fill="#bae6fd"/><text x="95" y="80" text-anchor="middle" class="svg-ink" font-size="13">Customer:</text><text x="95" y="98" text-anchor="middle" class="svg-ink" font-size="12">data, IAM, app, OS</text>
<rect x="10" y="145" width="170" height="65" rx="8" fill="#e2e8f0"/><text x="95" y="182" text-anchor="middle" class="svg-ink" font-size="12">Provider: hypervisor, DC</text>
<rect x="235" y="30" width="170" height="70" rx="8" fill="#bae6fd"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">Customer:</text><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">data, IAM, app code</text>
<rect x="235" y="105" width="170" height="105" rx="8" fill="#e2e8f0"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">Provider: OS, runtime, DC</text>
<rect x="460" y="30" width="170" height="40" rx="8" fill="#bae6fd"/><text x="545" y="55" text-anchor="middle" class="svg-ink" font-size="12">Customer: data, users</text>
<rect x="460" y="75" width="170" height="135" rx="8" fill="#e2e8f0"/><text x="545" y="145" text-anchor="middle" class="svg-ink" font-size="12">Provider: app and below</text>
</svg><p class="cap">The blue customer area shrinks from IaaS to SaaS, but it never disappears.</p></div>

<h3>Why it matters in practice</h3>
<p>Shared responsibility decides three things in a real job. First, <b>who patches</b>: in IaaS a missing Ubuntu kernel patch is your finding; in PaaS the managed database engine is patched by the provider, but you still choose the maintenance window and the version. Second, <b>who you call</b>: a hypervisor issue goes to the provider's support, a public bucket goes to your own team. Third, <b>what the auditor asks you for</b>: for provider layers you show the provider's attestation reports (SOC 2, ISO 27001, CSA STAR); for your layers you show your own evidence.</p>

<div class="eg"><p><b>Worked example from Lab 1.</b> The CLOUD console for account <code>nk-prod</code> lists five findings. CSP-101 (public bucket), CSP-102 (SSH from 0.0.0.0/0), CSP-103 (no customer-managed key) and CSP-104 (public static-website bucket, risk accepted) all show Owner = Customer. <b>CSP-105</b> says "Host firmware update scheduled by the provider (maintenance window 2026-10-03)" on the hypervisor host pool, Owner = Provider, severity Informational. In IaaS the hypervisor sits below the guest OS, so CSP-105 is the provider's job. Your job is only to know the window and make sure your application survives a host reboot.</p></div>

<pre class="out">ID       Severity       Resource                          Owner
CSP-101  Critical       bucket nk-payroll-exports         Customer
CSP-102  High           security group sg-web             Customer
CSP-103  Medium         bucket nk-payroll-exports         Customer
CSP-104  Low            bucket nk-web-assets (accepted)   Customer
<span class="hl">CSP-105  Informational  hypervisor host pool ap-south-1b  Provider</span></pre>

<h3>Grey areas you will meet</h3>
<ul>
<li><b>Serverless (FaaS)</b>: the provider runs the OS and runtime, but your function code, its dependencies, its IAM role and its environment-variable secrets are yours.</li>
<li><b>Managed Kubernetes</b>: the provider runs the control plane (API server, etcd); worker nodes, pods, images, RBAC and network policies are usually yours.</li>
<li><b>SaaS configuration</b>: the provider builds the sharing feature, you decide that "anyone with the link" is not allowed. Many SaaS leaks are sharing settings, which is why CASB exists (chapter 5).</li>
<li><b>Encryption</b>: the provider offers encryption; choosing it, choosing a customer-managed key and controlling who can use that key is yours.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Assuming PaaS means "no security work". You still own identity, data, application code and the network exposure of the service. Another mistake is sending a provider-owned informational finding to your patch team, which wastes a change window.</p></div>
<div class="exam"><p><b>Exam traps.</b> "In PaaS, who is responsible for the operating system?" The provider. "In IaaS, who patches the guest OS?" The customer. "Which responsibility stays with the customer in every model?" Data and identity/access. If an answer says the provider is responsible for customer data classification, it is wrong.</p></div>

<div class="scn"><h4>The auditor and the hypervisor</h4><p>During a PCI DSS audit, an auditor asked the infrastructure team to show patch evidence for the hypervisors running their payment VMs. The team lead panicked and opened a ticket with the cloud provider to request "hypervisor patch logs". A senior engineer pointed out that the service was IaaS: hypervisors are provider-owned, so the right evidence was the provider's attestation of compliance plus the shared responsibility matrix. The team then showed its own evidence for the guest OS patching, the security groups and the IAM reviews.</p><p><b>Lesson:</b> draw the responsibility line first. It tells you what to fix, whom to call and what evidence to produce.</p></div>

<div class="iv"><p class="q">"Your web app runs on IaaS VMs. Who patches the hypervisor and who patches the guest OS?"</p><p>Answer crisply: the provider patches the hypervisor and the physical hosts; the customer patches the guest OS, middleware and application. Then add the part juniors forget: in every model the customer owns data, identities and access configuration, and must use the provider's attestation reports as audit evidence for the provider's layers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IaaS: you own the guest OS and up. PaaS: you own code, data and identity. SaaS: you own data, users and settings.</li>
<li>Data, identity and access configuration are always the customer's responsibility.</li>
<li>In Lab 1, CSP-105 (hypervisor firmware) is the only provider-owned finding.</li>
<li>Serverless, managed Kubernetes and SaaS sharing are the grey areas; read the provider's matrix.</li>
<li>Use provider attestations (SOC 2, ISO 27001, CSA STAR) as evidence for provider layers.</li>
</ul></div>
`,hi:`
<p>Khaane ke baare mein socho. Agar aap ghar par khaana banate ho, to sabzi khud kharidte ho, kitchen aapka hai, khud pakate ho aur bartan dhote ho (on-premises). Agar aap stove wala kitchen kiraye par lete ho, to ab bhi kharidna, pakana aur saaf karna aapka kaam hai, lekin gas line landlord theek karta hai (IaaS). Agar aap meal kit order karte ho, to ingredients ready aate hain aur aap sirf dish jodte ho (PaaS). Agar aap restaurant mein khaate ho, to aap sirf choose karte ho ki kya order karna hai aur aapki table par kaun baithega (SaaS). Jitna kam aap karte ho, utna kam control aur utni kam zimmedari. Lekin aapki table par kaun baithega, yeh hamesha aap decide karte ho.</p>

<h3>Teen service models</h3>
<dl class="terms">
<dt>IaaS (Infrastructure as a Service)</dt><dd>Aap virtual machines, virtual networks, storage aur load balancers kiraye par lete ho. Guest operating system aur uske upar sab kuch aap install aur patch karte ho. Examples: virtual machines, block storage, virtual private clouds.</dd>
<dt>PaaS (Platform as a Service)</dt><dd>Provider operating system aur runtime chalata hai; aap code deploy karte ho ya managed service use karte ho. Examples: managed databases, app platforms, serverless functions (aksar FaaS kehte hain), managed Kubernetes control planes.</dd>
<dt>SaaS (Software as a Service)</dt><dd>Internet par deliver hui poori application. Aap users, sharing aur data configure karte ho. Examples: e-mail aur office suites, CRM, Webex, HR systems.</dd>
</dl>

<h3>Responsibility matrix</h3>
<table class="cmp"><tr><th>Layer</th><th>On-prem</th><th>IaaS</th><th>PaaS</th><th>SaaS</th></tr>
<tr><td>Data, classification, accounts aur access</td><td>Customer</td><td>Customer</td><td>Customer</td><td>Customer</td></tr>
<tr><td>Endpoints aur identities (MFA, keys)</td><td>Customer</td><td>Customer</td><td>Customer</td><td>Customer</td></tr>
<tr><td>Application code aur uski settings</td><td>Customer</td><td>Customer</td><td>Customer</td><td>Provider (configure aap karte ho)</td></tr>
<tr><td>Runtime, middleware, guest OS</td><td>Customer</td><td>Customer</td><td>Provider</td><td>Provider</td></tr>
<tr><td>Virtual network controls (security groups)</td><td>Customer</td><td>Customer</td><td>Shared</td><td>Provider</td></tr>
<tr><td>Hypervisor, hosts, storage hardware</td><td>Customer</td><td>Provider</td><td>Provider</td><td>Provider</td></tr>
<tr><td>Physical data center, power, cooling</td><td>Customer</td><td>Provider</td><td>Provider</td><td>Provider</td></tr>
</table>
<p>Ise neeche se upar padho. IaaS se SaaS ki taraf jaate hue provider ka hissa badhta jaata hai. Upar ki do rows kabhi nahi hilti: <b>data, identity aur access configuration hamesha customer ke hain</b>. Is domain ka yahi sabse zyada test hone wala idea hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Har service model mein responsibility line">
<text x="95" y="20" text-anchor="middle" class="svg-ink" font-size="13">IaaS</text><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">PaaS</text><text x="545" y="20" text-anchor="middle" class="svg-ink" font-size="13">SaaS</text>
<rect x="10" y="30" width="170" height="110" rx="8" fill="#bae6fd"/><text x="95" y="80" text-anchor="middle" class="svg-ink" font-size="13">Customer:</text><text x="95" y="98" text-anchor="middle" class="svg-ink" font-size="12">data, IAM, app, OS</text>
<rect x="10" y="145" width="170" height="65" rx="8" fill="#e2e8f0"/><text x="95" y="182" text-anchor="middle" class="svg-ink" font-size="12">Provider: hypervisor, DC</text>
<rect x="235" y="30" width="170" height="70" rx="8" fill="#bae6fd"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">Customer:</text><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">data, IAM, app code</text>
<rect x="235" y="105" width="170" height="105" rx="8" fill="#e2e8f0"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">Provider: OS, runtime, DC</text>
<rect x="460" y="30" width="170" height="40" rx="8" fill="#bae6fd"/><text x="545" y="55" text-anchor="middle" class="svg-ink" font-size="12">Customer: data, users</text>
<rect x="460" y="75" width="170" height="135" rx="8" fill="#e2e8f0"/><text x="545" y="145" text-anchor="middle" class="svg-ink" font-size="12">Provider: app aur neeche</text>
</svg><p class="cap">Neela customer area IaaS se SaaS tak chhota hota hai, lekin kabhi gayab nahi hota.</p></div>

<h3>Practice mein yeh kyun matter karta hai</h3>
<p>Real job mein shared responsibility teen cheezein decide karti hai. Pehla, <b>patch kaun karega</b>: IaaS mein missing Ubuntu kernel patch aapki finding hai; PaaS mein managed database engine provider patch karta hai, lekin maintenance window aur version aap chunte ho. Doosra, <b>call kisko karoge</b>: hypervisor issue provider ke support ko jaata hai, public bucket aapki apni team ko. Teesra, <b>auditor aapse kya maangega</b>: provider layers ke liye aap provider ki attestation reports (SOC 2, ISO 27001, CSA STAR) dikhate ho; apni layers ke liye apna evidence.</p>

<div class="eg"><p><b>Lab 1 se worked example.</b> Account <code>nk-prod</code> ka CLOUD console paanch findings dikhata hai. CSP-101 (public bucket), CSP-102 (0.0.0.0/0 se SSH), CSP-103 (customer-managed key nahi) aur CSP-104 (public static-website bucket, risk accepted) sabmein Owner = Customer hai. <b>CSP-105</b> kehta hai "Host firmware update scheduled by the provider (maintenance window 2026-10-03)" hypervisor host pool par, Owner = Provider, severity Informational. IaaS mein hypervisor guest OS ke neeche hota hai, isliye CSP-105 provider ka kaam hai. Aapka kaam sirf window jaanna aur yeh pakka karna hai ki aapki application host reboot jhel le.</p></div>

<pre class="out">ID       Severity       Resource                          Owner
CSP-101  Critical       bucket nk-payroll-exports         Customer
CSP-102  High           security group sg-web             Customer
CSP-103  Medium         bucket nk-payroll-exports         Customer
CSP-104  Low            bucket nk-web-assets (accepted)   Customer
<span class="hl">CSP-105  Informational  hypervisor host pool ap-south-1b  Provider</span></pre>

<h3>Grey areas jo aapko milenge</h3>
<ul>
<li><b>Serverless (FaaS)</b>: provider OS aur runtime chalata hai, lekin aapka function code, uski dependencies, uska IAM role aur environment-variable secrets aapke hain.</li>
<li><b>Managed Kubernetes</b>: provider control plane (API server, etcd) chalata hai; worker nodes, pods, images, RBAC aur network policies aam taur par aapke hain.</li>
<li><b>SaaS configuration</b>: sharing feature provider banata hai, aap decide karte ho ki "anyone with the link" allowed nahi hai. Bahut saare SaaS leaks sharing settings hote hain, isiliye CASB exist karta hai (chapter 5).</li>
<li><b>Encryption</b>: provider encryption offer karta hai; use chunna, customer-managed key chunna aur us key ko kaun use kar sakta hai yeh control karna aapka kaam hai.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Yeh maan lena ki PaaS ka matlab "koi security kaam nahi". Identity, data, application code aur service ka network exposure ab bhi aapka hai. Ek aur galti hai provider-owned informational finding ko apni patch team ko bhej dena, jisse change window waste hoti hai.</p></div>
<div class="exam"><p><b>Exam traps.</b> "PaaS mein operating system ki zimmedari kiski?" Provider ki. "IaaS mein guest OS kaun patch karta hai?" Customer. "Har model mein kaunsi zimmedari customer ke paas rehti hai?" Data aur identity/access. Agar koi answer kahe ki customer data classification provider ki zimmedari hai, to woh galat hai.</p></div>

<div class="scn"><h4>Auditor aur hypervisor</h4><p>PCI DSS audit ke dauraan ek auditor ne infrastructure team se unke payment VMs chalane wale hypervisors ka patch evidence maanga. Team lead ghabra gaya aur cloud provider ke paas "hypervisor patch logs" maangne ka ticket khol diya. Ek senior engineer ne bataya ki service IaaS thi: hypervisors provider-owned hain, isliye sahi evidence provider ka attestation of compliance plus shared responsibility matrix tha. Phir team ne guest OS patching, security groups aur IAM reviews ka apna evidence dikhaya.</p><p><b>Seekh:</b> pehle responsibility line kheencho. Woh batati hai ki kya theek karna hai, kisko call karna hai aur kaunsa evidence dena hai.</p></div>

<div class="iv"><p class="q">"Aapki web app IaaS VMs par chalti hai. Hypervisor kaun patch karta hai aur guest OS kaun?"</p><p>Crisp answer do: provider hypervisor aur physical hosts patch karta hai; customer guest OS, middleware aur application patch karta hai. Phir woh hissa jodo jo juniors bhool jaate hain: har model mein data, identities aur access configuration customer ke hain, aur provider ki layers ke liye audit evidence ke roop mein provider ki attestation reports use karni hoti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IaaS: guest OS aur upar aapka. PaaS: code, data aur identity aapke. SaaS: data, users aur settings aapke.</li>
<li>Data, identity aur access configuration hamesha customer ki zimmedari hai.</li>
<li>Lab 1 mein CSP-105 (hypervisor firmware) akeli provider-owned finding hai.</li>
<li>Serverless, managed Kubernetes aur SaaS sharing grey areas hain; provider ka matrix padho.</li>
<li>Provider layers ke evidence ke liye provider attestations (SOC 2, ISO 27001, CSA STAR) use karo.</li>
</ul></div>
`}};export{e as default};