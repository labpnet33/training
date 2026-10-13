var e={id:`deployment-models`,h:{en:`Deployment models: Cisco-hosted cloud, on-premises and MSP`,hi:`Deployment models: Cisco-hosted cloud, on-premises aur MSP`},body:{en:`
<p>A company that wants to run SD-WAN must decide who runs the controllers. It is like the choice between hiring a taxi service, owning a car, or using a fleet run by a transport contractor. All three get you to the destination, but they differ in cost, control, effort and responsibility. The decision affects who installs software, who patches it, where the certificates come from and how much of the design the customer can change.</p>

<h3>The three models</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Three deployment models">
<rect x="10" y="15" width="200" height="140" rx="12" fill="#bae6fd"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="14">Cisco-hosted cloud</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="11">Cisco builds and runs</text><text x="110" y="82" text-anchor="middle" class="svg-muted" font-size="11">the three controllers</text><text x="110" y="104" text-anchor="middle" class="svg-muted" font-size="11">Customer: edges, templates,</text><text x="110" y="120" text-anchor="middle" class="svg-muted" font-size="11">policy, monitoring</text><text x="110" y="142" text-anchor="middle" class="svg-ink" font-size="11">Fastest to start</text>
<rect x="225" y="15" width="200" height="140" rx="12" fill="#bbf7d0"/><text x="325" y="40" text-anchor="middle" class="svg-ink" font-size="14">On-premises</text><text x="325" y="64" text-anchor="middle" class="svg-muted" font-size="11">Customer deploys VMs</text><text x="325" y="82" text-anchor="middle" class="svg-muted" font-size="11">in own data centre or cloud</text><text x="325" y="104" text-anchor="middle" class="svg-muted" font-size="11">Customer: everything,</text><text x="325" y="120" text-anchor="middle" class="svg-muted" font-size="11">including upgrades</text><text x="325" y="142" text-anchor="middle" class="svg-ink" font-size="11">Most control</text>
<rect x="440" y="15" width="190" height="140" rx="12" fill="#ddd6fe"/><text x="535" y="40" text-anchor="middle" class="svg-ink" font-size="14">MSP-hosted</text><text x="535" y="64" text-anchor="middle" class="svg-muted" font-size="11">Provider runs controllers</text><text x="535" y="82" text-anchor="middle" class="svg-muted" font-size="11">for many customers</text><text x="535" y="104" text-anchor="middle" class="svg-muted" font-size="11">Multitenancy: one tenant</text><text x="535" y="120" text-anchor="middle" class="svg-muted" font-size="11">per customer</text><text x="535" y="142" text-anchor="middle" class="svg-ink" font-size="11">Managed service</text>
<rect x="30" y="175" width="580" height="45" rx="10" fill="#f1f5f9"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">Same software and the same three controllers in every model.</text><text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="11">What changes is who operates them and how much the customer can configure.</text>
</svg><p class="cap">The model changes ownership, not the architecture.</p></div>
<table class="cmp"><tr><th>Aspect</th><th>Cisco-hosted cloud</th><th>On-premises</th><th>MSP-hosted</th></tr>
<tr><td>Who builds the controllers</td><td>Cisco</td><td>The customer</td><td>The provider</td></tr>
<tr><td>Who upgrades software</td><td>Cisco, on a schedule agreed with the customer</td><td>The customer</td><td>The provider</td></tr>
<tr><td>Certificates</td><td>Cisco PKI, mostly automatic</td><td>Cisco PKI or enterprise CA, the customer chooses</td><td>Set by the provider</td></tr>
<tr><td>Control of design</td><td>Limited by the service</td><td>Full</td><td>Limited by the contract</td></tr>
<tr><td>Typical customer</td><td>Most enterprises</td><td>Regulated or very large networks</td><td>Small and mid-sized businesses buying a service</td></tr>
<tr><td>Staff skill needed</td><td>Lower for controller operations</td><td>Highest</td><td>Lowest</td></tr></table>

<h3>Cisco-hosted cloud</h3>
<p>Cisco deploys and operates the Manager, Controller and Validator for the customer, normally in public-cloud regions, and handles redundancy, backups and upgrades. The customer receives access to the Manager's web interface and API and onboards edges. This is the fastest start and the model most customers choose. The certificate handling is mostly automatic because Cisco PKI is used. The customer still needs to understand the control connections, because the edges must reach the cloud Validator and firewalls must allow the ports.</p>

<h3>On-premises</h3>
<p>The customer deploys the three controllers as virtual machines in their own data centre or in a public cloud account they own. The customer decides placement, sizing, redundancy, certificate method and when to upgrade. This model is chosen for strict data-residency rules, for isolated networks and for very large fabrics that need a tailored design. It needs the most skill: hypervisor, storage, addressing, firewall rules, certificates and backups are all the customer's job. Both the Cisco PKI method and an enterprise root CA can be used.</p>

<h3>MSP-hosted and multitenancy</h3>
<p>A managed service provider runs the controllers and gives each customer a share of them. The Manager supports <b>multitenancy</b>: the provider administers the system and creates a <b>tenant</b> for each customer. A tenant sees only its own devices, templates and policies. The Controllers are assigned to tenants and the Validator authenticates devices for the right tenant. Each tenant has its own organization-name relationship, so devices of different customers cannot mix.</p>

<h3>Where to place the controllers</h3>
<p>For the on-premises model the placement rules matter more than the model name:</p>
<ul>
<li>The Validator must be reachable from every edge over every transport, so give it a public IP address (or a NAT mapping to one). It is the only controller that needs this for the first contact.</li>
<li>Controllers and the Manager are normally reached on the addresses given by the Validator. If they sit behind NAT, their public addresses must be configured so that the Validator can pass them to edges.</li>
<li>Place the controllers in at least two locations so that the loss of one site does not remove all of them. Chapter 9 returns to this.</li>
<li>Put the Manager's management and cluster interfaces in separate networks from the control-connection interface (tunnel interface), and keep the cluster traffic private.</li>
</ul>

<div class="eg"><p><b>Choosing a model.</b> A hospital group with 180 clinics, an existing virtualisation team and a rule that patient-network devices must be managed from inside the country chooses on-premises, with controllers in two Indian data centres. A retail chain with 400 shops and a small network team chooses Cisco-hosted cloud so that upgrades and redundancy are handled for them. A 25-branch manufacturer with no network staff buys SD-WAN as a managed service from a provider using multitenancy.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Assuming that the cloud model means no certificate or firewall work; putting all on-premises controllers in the same rack or site; giving the Validator only a private address that remote edges cannot reach; forgetting that an MSP tenant must use the right organization name.</p></div>

<div class="exam"><p><b>Exam traps.</b> The three models share the same three controllers. Multitenancy is a Manager feature used mainly by providers. In every model the Validator needs an address that edges can reach on every transport.</p></div>

<div class="scn"><h4>The unreachable Validator</h4><p>An on-premises design placed the Validator on a private address inside the data centre, expecting the branches to reach it over MPLS. The branches that had only broadband could not reach it and never joined. The team added a public address and a firewall rule for the control ports, and updated the Validator address in the configuration. The broadband sites joined immediately.</p><p><b>Lesson:</b> the Validator address must work on every transport that an edge uses to start up.</p></div>

<div class="iv"><p class="q">"Which deployment model would you recommend for a bank, and why?"</p><p>Strong answer: ask about data residency, regulation, change control, staff skills and scale first. Often on-premises or a dedicated Cisco-hosted instance in an approved region. Mention redundancy across two sites, certificate method (an enterprise CA if the bank must control trust), upgrade ownership and the Validator reachability. Do not pick a model without the requirements.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three models: Cisco-hosted cloud, on-premises and MSP-hosted.</li>
<li>The software and the three controllers are the same; ownership and effort differ.</li>
<li>Multitenancy lets a provider serve many customers from one Manager.</li>
<li>The Validator needs an address reachable on every transport.</li>
<li>Spread on-premises controllers over at least two locations.</li>
</ul></div>
`,hi:`
<p>Jis company ko SD-WAN chalana hai use tay karna padta hai ki controllers kaun chalayega. Yeh taxi service lene, apni gaadi rakhne ya transport contractor ki fleet use karne ke beech chunav jaisa hai. Teeno aapko manzil tak pahunchate hain, par cost, control, mehnat aur zimmedari mein alag hain. Yeh faisla tay karta hai ki software kaun install karega, patch kaun karega, certificates kahan se aayenge aur customer design ka kitna hissa badal sakta hai.</p>

<h3>Teen models</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Teen deployment models">
<rect x="10" y="15" width="200" height="140" rx="12" fill="#bae6fd"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="14">Cisco-hosted cloud</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="11">Cisco teeno controllers</text><text x="110" y="82" text-anchor="middle" class="svg-muted" font-size="11">banata aur chalata hai</text><text x="110" y="104" text-anchor="middle" class="svg-muted" font-size="11">Customer: edges, templates,</text><text x="110" y="120" text-anchor="middle" class="svg-muted" font-size="11">policy, monitoring</text><text x="110" y="142" text-anchor="middle" class="svg-ink" font-size="11">Sabse tez shuruaat</text>
<rect x="225" y="15" width="200" height="140" rx="12" fill="#bbf7d0"/><text x="325" y="40" text-anchor="middle" class="svg-ink" font-size="14">On-premises</text><text x="325" y="64" text-anchor="middle" class="svg-muted" font-size="11">Customer VMs lagata hai</text><text x="325" y="82" text-anchor="middle" class="svg-muted" font-size="11">apne data centre ya cloud mein</text><text x="325" y="104" text-anchor="middle" class="svg-muted" font-size="11">Customer: sab kuch,</text><text x="325" y="120" text-anchor="middle" class="svg-muted" font-size="11">upgrades samet</text><text x="325" y="142" text-anchor="middle" class="svg-ink" font-size="11">Sabse zyada control</text>
<rect x="440" y="15" width="190" height="140" rx="12" fill="#ddd6fe"/><text x="535" y="40" text-anchor="middle" class="svg-ink" font-size="14">MSP-hosted</text><text x="535" y="64" text-anchor="middle" class="svg-muted" font-size="11">Provider kai customers ke liye</text><text x="535" y="82" text-anchor="middle" class="svg-muted" font-size="11">controllers chalata hai</text><text x="535" y="104" text-anchor="middle" class="svg-muted" font-size="11">Multitenancy: har customer</text><text x="535" y="120" text-anchor="middle" class="svg-muted" font-size="11">ka ek tenant</text><text x="535" y="142" text-anchor="middle" class="svg-ink" font-size="11">Managed service</text>
<rect x="30" y="175" width="580" height="45" rx="10" fill="#f1f5f9"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">Har model mein wahi software aur wahi teen controllers.</text><text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="11">Badalta yeh hai ki unhe kaun operate karta hai aur customer kitna configure kar sakta hai.</text>
</svg><p class="cap">Model ownership badalta hai, architecture nahi.</p></div>
<table class="cmp"><tr><th>Pehlu</th><th>Cisco-hosted cloud</th><th>On-premises</th><th>MSP-hosted</th></tr>
<tr><td>Controllers kaun banata hai</td><td>Cisco</td><td>Customer</td><td>Provider</td></tr>
<tr><td>Software upgrade kaun karta hai</td><td>Cisco, customer ke saath tay schedule par</td><td>Customer</td><td>Provider</td></tr>
<tr><td>Certificates</td><td>Cisco PKI, zyada tar automatic</td><td>Cisco PKI ya enterprise CA, customer chunta hai</td><td>Provider tay karta hai</td></tr>
<tr><td>Design ka control</td><td>Service se seemit</td><td>Poora</td><td>Contract se seemit</td></tr>
<tr><td>Aam customer</td><td>Zyada tar enterprises</td><td>Regulated ya bahut bade networks</td><td>Service kharidne wale chhote aur madhyam business</td></tr>
<tr><td>Staff skill</td><td>Controller operations ke liye kam</td><td>Sabse zyada</td><td>Sabse kam</td></tr></table>

<h3>Cisco-hosted cloud</h3>
<p>Cisco customer ke liye Manager, Controller aur Validator deploy aur operate karta hai, aam taur par public-cloud regions mein, aur redundancy, backups aur upgrades sambhalta hai. Customer ko Manager ke web interface aur API ka access milta hai aur woh edges onboard karta hai. Yeh sabse tez shuruaat hai aur zyada tar customers yahi chunte hain. Certificate handling zyada tar automatic hoti hai kyunki Cisco PKI use hota hai. Customer ko phir bhi control connections samajhne padte hain, kyunki edges ko cloud Validator tak pahunchna hota hai aur firewalls ko ports allow karne hote hain.</p>

<h3>On-premises</h3>
<p>Customer teeno controllers ko virtual machines ke roop mein apne data centre mein ya apne public cloud account mein deploy karta hai. Placement, sizing, redundancy, certificate method aur upgrade ka samay customer tay karta hai. Yeh model strict data-residency rules, isolated networks aur bade fabrics ke liye chuna jaata hai jinhe customised design chahiye. Isme sabse zyada skill lagti hai: hypervisor, storage, addressing, firewall rules, certificates aur backups sab customer ka kaam hain. Cisco PKI method aur enterprise root CA dono use ho sakte hain.</p>

<h3>MSP-hosted aur multitenancy</h3>
<p>Managed service provider controllers chalata hai aur har customer ko unka hissa deta hai. Manager <b>multitenancy</b> support karta hai: provider system administer karta hai aur har customer ke liye ek <b>tenant</b> banata hai. Tenant sirf apne devices, templates aur policies dekhta hai. Controllers tenants ko assign hote hain aur Validator sahi tenant ke liye devices ko authenticate karta hai. Har tenant ka apna organization-name sambandh hota hai, isliye alag customers ke devices mix nahi ho sakte.</p>

<h3>Controllers kahan rakhein</h3>
<p>On-premises model mein model ke naam se zyada placement ke rules maayne rakhte hain:</p>
<ul>
<li>Validator har transport par har edge se reachable hona chahiye, isliye use public IP address do (ya uske liye NAT mapping). Pehle contact ke liye yahi akela controller hai jise yeh chahiye.</li>
<li>Controllers aur Manager aam taur par Validator ke diye addresses par pahunche jaate hain. Agar woh NAT ke peeche hain to unke public addresses configure hone chahiye taaki Validator unhe edges ko de sake.</li>
<li>Controllers ko kam se kam do locations mein rakho taaki ek site khone par sab na jaayein. Chapter 9 isi par wapas aata hai.</li>
<li>Manager ke management aur cluster interfaces ko control-connection interface (tunnel interface) se alag networks mein rakho, aur cluster traffic private rakho.</li>
</ul>

<div class="eg"><p><b>Model chunna.</b> 180 clinics wala hospital group, jiske paas virtualisation team hai aur rule hai ki patient-network devices desh ke andar se manage hon, on-premises chunta hai, do Indian data centres mein controllers ke saath. 400 shops wali retail chain aur chhoti network team Cisco-hosted cloud chunti hai taaki upgrades aur redundancy unke liye sambhali jayein. 25 branches wali manufacturer jiske paas network staff nahi, multitenancy use karne wale provider se managed service ke roop mein SD-WAN kharidti hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Yeh maan lena ki cloud model ka matlab certificate ya firewall ka kaam nahi; on-premises controllers ko ek hi rack ya site mein rakhna; Validator ko sirf private address dena jo remote edges tak nahi pahunchta; yeh bhoolna ki MSP tenant ko sahi organization name use karna hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Teeno models mein wahi teen controllers hain. Multitenancy Manager ka feature hai jo mukhyatah providers use karte hain. Har model mein Validator ko aisa address chahiye jo edges har transport par pahunch sakein.</p></div>

<div class="scn"><h4>Unreachable Validator</h4><p>Ek on-premises design ne Validator ko data centre ke andar private address par rakha, yeh soch kar ki branches MPLS se pahunchengi. Jin branches ke paas sirf broadband tha woh use reach nahi kar sakin aur kabhi join nahi hui. Team ne public address aur control ports ke liye firewall rule jode, aur configuration mein Validator address update kiya. Broadband sites turant join ho gayi.</p><p><b>Seekh:</b> Validator address har us transport par kaam karna chahiye jisse edge start hota hai.</p></div>

<div class="iv"><p class="q">"Bank ke liye kaunsa deployment model recommend karoge, aur kyun?"</p><p>Strong answer: pehle data residency, regulation, change control, staff skills aur scale poochho. Aksar on-premises ya approved region mein dedicated Cisco-hosted instance. Do sites ke beech redundancy, certificate method (agar bank ko trust control karna ho to enterprise CA), upgrade ownership aur Validator reachability ka zikr karo. Requirements ke bina model mat chuno.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen models: Cisco-hosted cloud, on-premises aur MSP-hosted.</li>
<li>Software aur teen controllers same hain; ownership aur mehnat alag hai.</li>
<li>Multitenancy provider ko ek Manager se kai customers dene deta hai.</li>
<li>Validator ko aisa address chahiye jo har transport par reachable ho.</li>
<li>On-premises controllers ko kam se kam do locations mein failao.</li>
</ul></div>
`}};export{e as default};