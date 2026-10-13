var e={id:`cloud-models`,h:{en:`Deployment models and service models (SaaS, PaaS, IaaS)`,hi:`Deployment models aur service models (SaaS, PaaS, IaaS)`},body:{en:`
<p>Think about how you can eat pizza. You can make it at home (buy flour, own an oven, wash the dishes). You can buy a frozen pizza and bake it in your oven. You can order delivery and eat at your table. Or you can go to a restaurant where everything, even the table, belongs to someone else. In every case you eat pizza; what changes is <b>how much of the work you do yourself</b>. Cloud service models are the same idea applied to IT.</p>

<p>Two separate questions describe any cloud offering. <b>Where does it run and who can use the infrastructure?</b> That is the <b>deployment model</b>. <b>How much of the stack does the provider manage for you?</b> That is the <b>service model</b>. Do not mix them up: a SaaS product can run in a public cloud, and an IaaS platform can be built as a private cloud.</p>

<h3>Deployment models</h3>
<dl class="terms">
<dt>Public cloud</dt><dd>Infrastructure owned and run by a provider and shared by many customers over the internet. You pay as you go, start in minutes and never buy hardware. Large public providers have regions all over the world. Trade-off: less control over the physical layer, and costs can grow if nobody watches them.</dd>
<dt>Private cloud</dt><dd>Cloud-style infrastructure (self-service portal, virtualisation, automation, pooled resources) used by <b>one organisation</b> only. It can sit in the company's own data center or be hosted for it by a third party. Chosen for strict data-location rules, predictable heavy workloads or existing hardware. Trade-off: the company still buys and maintains the hardware.</dd>
<dt>Hybrid cloud</dt><dd>A mix of private (or on-premises) and public cloud <b>connected together</b> so workloads and data can move or talk between them. Most real companies are hybrid. Example: the database stays on-premises for compliance while the web front end runs in the public cloud. A special use is <b>cloud bursting</b>: extra capacity is taken from the public cloud only during peaks.</dd>
</dl>
<p>You may also hear <b>community cloud</b> (shared by organisations with common needs, such as several hospitals) and <b>multicloud</b> (using two or more public providers). Network+ N10-009 focuses on public, private and hybrid.</p>

<h3>Service models and the shared responsibility model</h3>
<dl class="terms">
<dt>IaaS (Infrastructure as a Service)</dt><dd>The provider gives you virtual machines, virtual networks and storage. You install and patch the operating system, the runtime and the application. Closest to running your own servers. Example: renting VMs and a VPC.</dd>
<dt>PaaS (Platform as a Service)</dt><dd>The provider also runs the operating system and runtime. You only bring your code and data. Examples: a managed database service, an app hosting platform where you upload code.</dd>
<dt>SaaS (Software as a Service)</dt><dd>A finished application used through a browser or app. The provider runs everything; you manage users, settings and your data. Examples: hosted email, CRM, video meetings.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 345" role="img" aria-label="Shared responsibility stack">
<text x="232" y="35" text-anchor="middle" class="svg-ink" font-size="14">On-prem</text><text x="347" y="35" text-anchor="middle" class="svg-ink" font-size="14">IaaS</text><text x="462" y="35" text-anchor="middle" class="svg-ink" font-size="14">PaaS</text><text x="577" y="35" text-anchor="middle" class="svg-ink" font-size="14">SaaS</text>
<text x="95" y="64" text-anchor="middle" class="svg-muted" font-size="12">Applications</text><text x="95" y="94" text-anchor="middle" class="svg-muted" font-size="12">Data</text><text x="95" y="124" text-anchor="middle" class="svg-muted" font-size="12">Runtime</text><text x="95" y="154" text-anchor="middle" class="svg-muted" font-size="12">Middleware</text><text x="95" y="184" text-anchor="middle" class="svg-muted" font-size="12">Operating system</text><text x="95" y="214" text-anchor="middle" class="svg-muted" font-size="12">Virtualisation</text><text x="95" y="244" text-anchor="middle" class="svg-muted" font-size="12">Servers</text><text x="95" y="274" text-anchor="middle" class="svg-muted" font-size="12">Storage</text><text x="95" y="304" text-anchor="middle" class="svg-muted" font-size="12">Networking</text>
<rect x="180" y="45" width="105" height="268" rx="6" fill="#bbf7d0"/><text x="232" y="184" text-anchor="middle" class="svg-ink" font-size="13">you</text>
<rect x="295" y="45" width="105" height="148" rx="6" fill="#bbf7d0"/><text x="347" y="124" text-anchor="middle" class="svg-ink" font-size="13">you</text>
<rect x="295" y="195" width="105" height="118" rx="6" fill="#bae6fd"/><text x="347" y="259" text-anchor="middle" class="svg-ink" font-size="13">provider</text>
<rect x="410" y="45" width="105" height="58" rx="6" fill="#bbf7d0"/><text x="462" y="79" text-anchor="middle" class="svg-ink" font-size="13">you</text>
<rect x="410" y="105" width="105" height="208" rx="6" fill="#bae6fd"/><text x="462" y="214" text-anchor="middle" class="svg-ink" font-size="13">provider</text>
<rect x="525" y="45" width="105" height="268" rx="6" fill="#bae6fd"/><text x="577" y="184" text-anchor="middle" class="svg-ink" font-size="13">provider</text>
<text x="320" y="335" text-anchor="middle" class="svg-accent" font-size="12">In every model you still own your data, identities and access rules</text>
</svg><p class="cap">The further right you go, the more the provider manages. Security of the cloud is the provider's job; security in the cloud is yours.</p></div>

<p>The <b>shared responsibility model</b> is the formal name for the diagram above. The provider secures the physical data centers, hardware and the virtualisation layer (security <i>of</i> the cloud). The customer secures what they put in it (security <i>in</i> the cloud): data, user accounts, access rules, and in IaaS also the OS patches and the firewall rules on their subnets.</p>

<h3>Why it matters to the network team</h3>
<p>The service model tells you what you can configure. With IaaS you design the VPC, subnets, routes and security groups yourself. With PaaS you usually only choose whether the service has a public endpoint or a private one inside your VPC. With SaaS your work is mostly about the path to it: internet bandwidth, DNS, proxy or SASE rules, and single sign-on.</p>

<div class="eg"><p><b>Worked example: classifying Harbourline's workloads.</b></p>
<table class="cmp"><tr><th>Workload</th><th>Decision</th><th>Model</th></tr>
<tr><td>Staff email and calendars</td><td>Move to a hosted email suite</td><td>SaaS, public cloud</td></tr>
<tr><td>Customer tracking portal (web + app servers)</td><td>Rebuild as VMs in a VPC</td><td>IaaS, public cloud</td></tr>
<tr><td>Tracking database</td><td>Use the provider's managed database</td><td>PaaS, public cloud</td></tr>
<tr><td>Customs records that must stay in the country office</td><td>Keep on the virtualised HQ cluster with a self-service portal</td><td>Private cloud</td></tr>
<tr><td>The whole company after migration</td><td>HQ private cloud joined to the public VPC by VPN</td><td>Hybrid</td></tr>
</table></div>

<div class="warn"><p><b>Common mistake.</b> Believing that SaaS means "no security work". A misconfigured sharing setting in a SaaS file store, or a user account without multifactor authentication, is still the customer's problem under the shared responsibility model.</p></div>

<div class="exam"><p><b>Exam trap.</b> "The customer manages the operating system but not the hardware" is IaaS. "The customer only deploys code" is PaaS. "The customer only uses the application" is SaaS. "Public and private connected together" is hybrid, not multicloud; multicloud means more than one public provider.</p></div>

<div class="scn"><h4>The PaaS database nobody could reach</h4><p>A developer created a managed database (PaaS) and chose "private access only". The IaaS web servers in the same VPC could connect, but the reporting team at HQ could not, even though the VPN was up. The network engineer found that the database's private endpoint address lived in a new subnet whose range had never been added to the VPN's allowed prefixes on the HQ router. Adding the prefix to the route advertisement fixed it.</p><p><b>Lesson:</b> PaaS hides the servers, not the network. Private endpoints still need routes, DNS and firewall rules.</p></div>

<div class="iv"><p class="q">"Explain IaaS, PaaS and SaaS with an example of what the customer manages in each."</p><p>Strong answer: IaaS gives virtual machines, storage and networks, and the customer manages the OS upward (patches, apps, security groups). PaaS adds the OS and runtime, so the customer manages only code, data and configuration, for example a managed database. SaaS is a complete application such as hosted email; the customer manages users, data and settings. Close with the shared responsibility model: security of the cloud belongs to the provider, security in the cloud to the customer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Deployment model = where it runs and who shares it: public, private, hybrid.</li>
<li>Service model = how much the provider manages: IaaS (VMs and networks), PaaS (platform for your code), SaaS (finished application).</li>
<li>Shared responsibility: the provider secures the cloud itself; the customer secures data, identities, access rules and, in IaaS, the OS.</li>
<li>Hybrid cloud means private or on-premises and public connected; multicloud means several public providers.</li>
<li>The service model decides how much network design you control.</li>
</ul></div>
`,hi:`
<p>Socho aap pizza kaise kha sakte ho. Ghar par bana sakte ho (aata khareedo, apna oven rakho, bartan dho). Frozen pizza khareed kar apne oven mein bake kar sakte ho. Delivery mangwa kar apni table par kha sakte ho. Ya restaurant jaa sakte ho jahan sab kuch, table tak, kisi aur ka hai. Har case mein aap pizza hi khaate ho; badalta hai bas yeh ki <b>kitna kaam aap khud karte ho</b>. Cloud service models IT par lagaya gaya yahi idea hain.</p>

<p>Kisi bhi cloud offering ko do alag sawaal describe karte hain. <b>Yeh kahan chalta hai aur infrastructure kaun use kar sakta hai?</b> Yeh <b>deployment model</b> hai. <b>Provider aapke liye stack ka kitna hissa manage karta hai?</b> Yeh <b>service model</b> hai. Inhe mix mat karo: ek SaaS product public cloud mein chal sakta hai, aur ek IaaS platform private cloud ki tarah bana ho sakta hai.</p>

<h3>Deployment models</h3>
<dl class="terms">
<dt>Public cloud</dt><dd>Provider ka owned aur run kiya hua infrastructure, jo internet par bahut saare customers share karte hain. Aap jitna use karo utna paisa dete ho, minutes mein shuru karte ho aur kabhi hardware nahi khareedte. Bade public providers ke regions poori duniya mein hain. Trade-off: physical layer par kam control, aur agar koi dhyaan na de to cost badh sakti hai.</dd>
<dt>Private cloud</dt><dd>Cloud-style infrastructure (self-service portal, virtualisation, automation, pooled resources) jo sirf <b>ek organisation</b> use karti hai. Yeh company ke apne data center mein ho sakta hai ya kisi third party ne uske liye host kiya ho. Strict data-location rules, predictable heavy workloads ya pehle se maujood hardware ke liye chuna jaata hai. Trade-off: company ko abhi bhi hardware khareedna aur maintain karna padta hai.</dd>
<dt>Hybrid cloud</dt><dd>Private (ya on-premises) aur public cloud ka mix jo <b>aapas mein jude</b> hon taaki workloads aur data unke beech move kar sakein ya baat kar sakein. Zyada tar real companies hybrid hain. Example: database compliance ke liye on-premises rehta hai jabki web front end public cloud mein chalta hai. Ek special use hai <b>cloud bursting</b>: extra capacity sirf peaks ke dauraan public cloud se li jaati hai.</dd>
</dl>
<p>Aap <b>community cloud</b> (common needs wali organisations mein shared, jaise kai hospitals) aur <b>multicloud</b> (do ya zyada public providers use karna) bhi sunoge. Network+ N10-009 public, private aur hybrid par focus karta hai.</p>

<h3>Service models aur shared responsibility model</h3>
<dl class="terms">
<dt>IaaS (Infrastructure as a Service)</dt><dd>Provider aapko virtual machines, virtual networks aur storage deta hai. Operating system, runtime aur application aap install aur patch karte ho. Apne servers chalane ke sabse kareeb. Example: VMs aur ek VPC kiraye par lena.</dd>
<dt>PaaS (Platform as a Service)</dt><dd>Provider operating system aur runtime bhi chalata hai. Aap sirf apna code aur data laate ho. Examples: managed database service, app hosting platform jahan aap code upload karte ho.</dd>
<dt>SaaS (Software as a Service)</dt><dd>Browser ya app se use hone wali tayyar application. Provider sab kuch chalata hai; aap users, settings aur apna data manage karte ho. Examples: hosted email, CRM, video meetings.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 345" role="img" aria-label="Shared responsibility stack">
<text x="232" y="35" text-anchor="middle" class="svg-ink" font-size="14">On-prem</text><text x="347" y="35" text-anchor="middle" class="svg-ink" font-size="14">IaaS</text><text x="462" y="35" text-anchor="middle" class="svg-ink" font-size="14">PaaS</text><text x="577" y="35" text-anchor="middle" class="svg-ink" font-size="14">SaaS</text>
<text x="95" y="64" text-anchor="middle" class="svg-muted" font-size="12">Applications</text><text x="95" y="94" text-anchor="middle" class="svg-muted" font-size="12">Data</text><text x="95" y="124" text-anchor="middle" class="svg-muted" font-size="12">Runtime</text><text x="95" y="154" text-anchor="middle" class="svg-muted" font-size="12">Middleware</text><text x="95" y="184" text-anchor="middle" class="svg-muted" font-size="12">Operating system</text><text x="95" y="214" text-anchor="middle" class="svg-muted" font-size="12">Virtualisation</text><text x="95" y="244" text-anchor="middle" class="svg-muted" font-size="12">Servers</text><text x="95" y="274" text-anchor="middle" class="svg-muted" font-size="12">Storage</text><text x="95" y="304" text-anchor="middle" class="svg-muted" font-size="12">Networking</text>
<rect x="180" y="45" width="105" height="268" rx="6" fill="#bbf7d0"/><text x="232" y="184" text-anchor="middle" class="svg-ink" font-size="13">aap</text>
<rect x="295" y="45" width="105" height="148" rx="6" fill="#bbf7d0"/><text x="347" y="124" text-anchor="middle" class="svg-ink" font-size="13">aap</text>
<rect x="295" y="195" width="105" height="118" rx="6" fill="#bae6fd"/><text x="347" y="259" text-anchor="middle" class="svg-ink" font-size="13">provider</text>
<rect x="410" y="45" width="105" height="58" rx="6" fill="#bbf7d0"/><text x="462" y="79" text-anchor="middle" class="svg-ink" font-size="13">aap</text>
<rect x="410" y="105" width="105" height="208" rx="6" fill="#bae6fd"/><text x="462" y="214" text-anchor="middle" class="svg-ink" font-size="13">provider</text>
<rect x="525" y="45" width="105" height="268" rx="6" fill="#bae6fd"/><text x="577" y="184" text-anchor="middle" class="svg-ink" font-size="13">provider</text>
<text x="320" y="335" text-anchor="middle" class="svg-accent" font-size="12">Har model mein data, identities aur access rules aapke hi hain</text>
</svg><p class="cap">Jitna right jaoge, utna zyada provider manage karta hai. Cloud ki security provider ka kaam hai; cloud ke andar ki security aapki.</p></div>

<p>Upar wale diagram ka formal naam <b>shared responsibility model</b> hai. Provider physical data centers, hardware aur virtualisation layer secure karta hai (cloud <i>ki</i> security). Customer woh secure karta hai jo woh usmein daalta hai (cloud <i>mein</i> security): data, user accounts, access rules, aur IaaS mein OS patches aur apne subnets ke firewall rules bhi.</p>

<h3>Network team ke liye yeh kyun matter karta hai</h3>
<p>Service model batata hai ki aap kya configure kar sakte ho. IaaS mein VPC, subnets, routes aur security groups aap khud design karte ho. PaaS mein aap aam taur par sirf yeh chunte ho ki service ka public endpoint ho ya aapke VPC ke andar private endpoint. SaaS mein aapka kaam zyada tar uske raaste ke baare mein hai: internet bandwidth, DNS, proxy ya SASE rules, aur single sign-on.</p>

<div class="eg"><p><b>Worked example: Harbourline ke workloads classify karna.</b></p>
<table class="cmp"><tr><th>Workload</th><th>Decision</th><th>Model</th></tr>
<tr><td>Staff email aur calendars</td><td>Hosted email suite mein le jao</td><td>SaaS, public cloud</td></tr>
<tr><td>Customer tracking portal (web + app servers)</td><td>VPC mein VMs ki tarah dobara banao</td><td>IaaS, public cloud</td></tr>
<tr><td>Tracking database</td><td>Provider ka managed database use karo</td><td>PaaS, public cloud</td></tr>
<tr><td>Customs records jo desh ke office mein hi rehne chahiye</td><td>Self-service portal wale virtualised HQ cluster par rakho</td><td>Private cloud</td></tr>
<tr><td>Migration ke baad poori company</td><td>HQ private cloud VPN se public VPC se juda</td><td>Hybrid</td></tr>
</table></div>

<div class="warn"><p><b>Common galti.</b> Yeh maanna ki SaaS ka matlab "koi security kaam nahi". SaaS file store mein galat sharing setting, ya bina multifactor authentication wala user account, shared responsibility model ke hisaab se abhi bhi customer ki problem hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Customer operating system manage karta hai par hardware nahi" IaaS hai. "Customer sirf code deploy karta hai" PaaS hai. "Customer sirf application use karta hai" SaaS hai. "Public aur private aapas mein jude" hybrid hai, multicloud nahi; multicloud ka matlab ek se zyada public provider.</p></div>

<div class="scn"><h4>PaaS database jis tak koi nahi pahunch paaya</h4><p>Ek developer ne managed database (PaaS) banaya aur "private access only" chuna. Usi VPC ke IaaS web servers connect kar paaye, par HQ ki reporting team nahi, jabki VPN up tha. Network engineer ne paaya ki database ka private endpoint address ek naye subnet mein tha jiski range kabhi HQ router par VPN ke allowed prefixes mein add hi nahi hui thi. Route advertisement mein prefix add karne se problem theek ho gayi.</p><p><b>Seekh:</b> PaaS servers chhupata hai, network nahi. Private endpoints ko bhi routes, DNS aur firewall rules chahiye.</p></div>

<div class="iv"><p class="q">"IaaS, PaaS aur SaaS explain karo, har ek mein customer kya manage karta hai uske example ke saath."</p><p>Strong answer: IaaS virtual machines, storage aur networks deta hai, aur customer OS se upar sab manage karta hai (patches, apps, security groups). PaaS mein OS aur runtime bhi provider ka hai, isliye customer sirf code, data aur configuration manage karta hai, jaise managed database. SaaS poori application hai jaise hosted email; customer users, data aur settings manage karta hai. Shared responsibility model ke saath khatam karo: cloud ki security provider ki, cloud mein security customer ki.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Deployment model = kahan chalta hai aur kaun share karta hai: public, private, hybrid.</li>
<li>Service model = provider kitna manage karta hai: IaaS (VMs aur networks), PaaS (aapke code ke liye platform), SaaS (tayyar application).</li>
<li>Shared responsibility: provider cloud ko secure karta hai; customer data, identities, access rules aur IaaS mein OS secure karta hai.</li>
<li>Hybrid cloud ka matlab private ya on-premises aur public jude hue; multicloud ka matlab kai public providers.</li>
<li>Service model decide karta hai ki network design ka kitna control aapke paas hai.</li>
</ul></div>
`}};export{e as default};