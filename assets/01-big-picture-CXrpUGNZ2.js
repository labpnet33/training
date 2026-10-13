var e={id:`big-picture`,h:{en:`The big picture: from a server room to the cloud`,hi:`Big picture: server room se cloud tak`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these twelve chapters you will be able to explain the cloud service and deployment models, design a simple cloud network (a <b>VPC</b> with public and private subnets, an internet gateway and a NAT gateway), choose between <b>security groups</b> and <b>network security lists</b>, connect an office to the cloud with a VPN or a private direct connection, and describe the modern ideas that sit on top: <b>NFV</b>, <b>SDN</b>, <b>SD-WAN</b>, <b>VXLAN</b>, <b>zero trust</b>, <b>SASE/SSE</b> and <b>infrastructure as code</b>. Together these are CompTIA Network+ N10-009 objectives 1.3 and 1.8.</p>

<h3>Prerequisites</h3>
<ul>
<li>You can read an IPv4 address with a prefix (10.20.0.0/16) and split it into subnets. If not, revisit the IPv4 addressing module first.</li>
<li>You know what a router, a switch, a firewall and NAT do at a basic level, and what the OSI layers are.</li>
<li>No cloud account and no programming knowledge are needed. Every idea is explained from zero, with small AWS and Azure name equivalents so you recognise them at work.</li>
</ul>

<h3>An analogy: owning a house versus renting a serviced apartment</h3>
<p>Owning a house means you buy the land, build the walls, fix the plumbing and pay for the whole building even when half the rooms are empty. Renting a <b>serviced apartment</b> means somebody else owns the building, you pay only for the rooms you use, you can take a bigger flat next month, and the owner fixes the lifts. You still lock your own door and decide who enters your flat.</p>
<p>A traditional company server room is the house. The <b>cloud</b> is the serviced apartment block: a provider owns huge data centers, and you rent computing, storage and networking by the hour through a web console or an API. You still design your own rooms (subnets), your own doors (gateways) and your own locks (security groups). That last part is exactly where a network engineer is needed.</p>

<h3>Meet Harbourline Logistics, our running story</h3>
<p>Throughout this module you are a junior network engineer at <b>Harbourline Logistics</b>, a freight company with a head office (HQ), twelve branch offices and a warehouse. Your lead engineer, Meera, has been asked to move the company's customer tracking portal and its internal apps from the ageing HQ server room into a public cloud, without breaking anything for the branches. Every chapter adds one piece of the migration.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Harbourline migration map">
<rect x="20" y="20" width="170" height="70" rx="8" fill="#e2e8f0"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="14">HQ server room</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/16</text>
<rect x="450" y="20" width="170" height="70" rx="8" fill="#bae6fd"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="14">Cloud VPC hl-prod</text><text x="535" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/16</text>
<line x1="190" y1="55" x2="450" y2="55" stroke="#64748b" stroke-width="3"/><text x="320" y="46" text-anchor="middle" class="svg-accent" font-size="12">site-to-site VPN / direct connect</text>
<rect x="20" y="130" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="105" y="156" text-anchor="middle" class="svg-ink" font-size="14">12 branches</text><text x="105" y="175" text-anchor="middle" class="svg-muted" font-size="12">10.30.x.0/24</text>
<rect x="235" y="130" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="156" text-anchor="middle" class="svg-ink" font-size="14">SD-WAN overlay</text><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">MPLS + broadband + 5G</text>
<line x1="190" y1="160" x2="235" y2="160" stroke="#64748b" stroke-width="2"/><line x1="405" y1="160" x2="535" y2="90" stroke="#64748b" stroke-width="2"/><line x1="105" y1="130" x2="105" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="450" y="130" width="170" height="60" rx="8" fill="#fde68a"/><text x="535" y="156" text-anchor="middle" class="svg-ink" font-size="14">Remote staff</text><text x="535" y="175" text-anchor="middle" class="svg-muted" font-size="12">zero trust + SASE</text>
<line x1="535" y1="130" x2="535" y2="90" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<rect x="20" y="230" width="600" height="50" rx="8" fill="#fed7aa"/><text x="320" y="252" text-anchor="middle" class="svg-ink" font-size="14">Infrastructure as code: every piece built from templates in Git</text><text x="320" y="270" text-anchor="middle" class="svg-muted" font-size="12">automation, version control, drift checks</text>
</svg><p class="cap">The Harbourline migration. Each box is covered by one or more chapters of this module.</p></div>

<h3>The route through this module</h3>
<ol>
<li><b>Cloud models</b>: public, private and hybrid clouds; SaaS, PaaS and IaaS; who is responsible for what.</li>
<li><b>Virtualisation and NFV</b>: how one physical server becomes many, how routers and firewalls become software, and what scalability, elasticity and multitenancy mean.</li>
<li><b>The VPC</b>: subnets, route tables, the internet gateway and the NAT gateway.</li>
<li><b>Cloud firewalls</b>: security groups versus network security lists (network ACLs).</li>
<li><b>Hybrid connectivity</b>: site-to-site VPN versus a private direct connection.</li>
<li><b>SDN and VXLAN</b>: separating the brain of the network from its muscles, and stretching Layer 2 across Layer 3.</li>
<li><b>SD-WAN</b>: application-aware, transport-agnostic branch networking with zero-touch provisioning and central policy.</li>
<li><b>Zero trust and SASE/SSE</b>: never trust the network location, always verify the user and device.</li>
<li><b>Infrastructure as code</b>: playbooks, templates, dynamic inventories, Git branching and conflict handling.</li>
<li><b>Troubleshooting</b> a cloud and hybrid network, then a <b>summary and exam checklist</b>.</li>
</ol>

<h3>Why a network engineer must learn this</h3>
<p>People sometimes say "the cloud has no network team". The opposite is true. In the cloud nobody touches cables, but somebody still has to plan non-overlapping address space, decide which subnets reach the internet, write the firewall rules, build the encrypted tunnels back to the offices and troubleshoot when "the app is slow". The difference is that you do it in software, often with code, and mistakes are copied at the speed of automation.</p>

<div class="eg"><p><b>Worked example: why the address plan comes first.</b> Harbourline HQ uses 10.10.0.0/16 and the branches use 10.30.0.0/16 (one /24 per branch). The cloud console suggests a default network of 172.31.0.0/16, but Meera chooses <b>10.20.0.0/16</b> for the new VPC. Why? Because the VPC will later be joined to HQ over a VPN, and two networks with overlapping ranges cannot route to each other without messy NAT. A /16 gives 65,536 addresses, enough room for six /24 subnets today and many more later.</p></div>

<div class="warn"><p><b>Common mistake.</b> Accepting the cloud provider's default network for production. Default VPCs often use a range that already exists somewhere in your company, and the overlap is only discovered on the day you try to connect the VPN.</p></div>

<div class="exam"><p><b>Exam trap.</b> Network+ is vendor-neutral. Questions say "VPC", "internet gateway", "NAT gateway", "network security group" and "direct connect" in generic terms. Do not over-think a specific provider's feature; answer with the general concept.</p></div>

<div class="scn"><h4>The migration that started with a spreadsheet</h4><p>A mid-sized retailer lifted its web servers into the cloud over a weekend. On Monday the stores could not print invoices, because the print server stayed on-premises and the cloud subnet used the same 192.168.1.0/24 as twenty stores. The engineers had to renumber the cloud subnet and redeploy every server. The second migration wave started with a simple spreadsheet listing every range in the company before a single VPC was created.</p><p><b>Lesson:</b> cloud networking is still IP networking. Plan addresses and paths first, click buttons second.</p></div>

<div class="iv"><p class="q">"Why does a company still need network engineers after moving to the cloud?"</p><p>Strong answer: the physical layer moves to the provider, but the logical design stays with the customer: address planning, subnet and route design, gateways, security groups and ACLs, hybrid VPN or direct links, DNS, and troubleshooting. Mention that in the shared responsibility model the customer always owns network access control and data, and that cloud networks are built with code, so automation skills matter.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The cloud is rented computing, storage and networking; you still design your own subnets, gateways and firewall rules.</li>
<li>This module covers Network+ 1.3 (cloud concepts and connectivity) and 1.8 (SDN, SD-WAN, VXLAN, zero trust, SASE, IaC).</li>
<li>Harbourline Logistics moves from an HQ server room (10.10.0.0/16) to a cloud VPC (10.20.0.0/16) with branches on 10.30.0.0/16.</li>
<li>Plan non-overlapping address space before building anything in the cloud.</li>
<li>Network+ questions use generic names; AWS and Azure equivalents are only there to help you at work.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In barah chapters ke end tak aap cloud service aur deployment models explain kar paoge, ek simple cloud network design kar paoge (public aur private subnets wala <b>VPC</b>, ek internet gateway aur ek NAT gateway), <b>security groups</b> aur <b>network security lists</b> ke beech sahi choice kar paoge, ek office ko VPN ya private direct connection se cloud se jod paoge, aur upar baithe modern ideas samjha paoge: <b>NFV</b>, <b>SDN</b>, <b>SD-WAN</b>, <b>VXLAN</b>, <b>zero trust</b>, <b>SASE/SSE</b> aur <b>infrastructure as code</b>. Yeh sab milkar CompTIA Network+ N10-009 ke objectives 1.3 aur 1.8 hain.</p>

<h3>Prerequisites</h3>
<ul>
<li>Aap prefix ke saath IPv4 address padh sakte ho (10.20.0.0/16) aur use subnets mein baant sakte ho. Agar nahi, to pehle IPv4 addressing module dobara dekho.</li>
<li>Aapko basic level par pata hai ki router, switch, firewall aur NAT kya karte hain, aur OSI layers kya hain.</li>
<li>Koi cloud account ya programming knowledge nahi chahiye. Har idea zero se samjhaya gaya hai, chhote AWS aur Azure name equivalents ke saath taaki kaam par aap unhe pehchaan sako.</li>
</ul>

<h3>Ek analogy: apna ghar vs serviced apartment kiraye par lena</h3>
<p>Apna ghar hone ka matlab hai aap zameen khareedte ho, deewarein banate ho, plumbing theek karte ho aur poori building ka kharcha uthate ho chahe aadhe kamre khaali hon. <b>Serviced apartment</b> kiraye par lene ka matlab hai building kisi aur ki hai, aap sirf un kamron ka paisa dete ho jo use karte ho, agle mahine bada flat le sakte ho, aur lift owner theek karta hai. Phir bhi apna darwaza aap khud lock karte ho aur aap decide karte ho ki aapke flat mein kaun aayega.</p>
<p>Traditional company server room woh ghar hai. <b>Cloud</b> serviced apartment block hai: ek provider ke paas bade data centers hain, aur aap web console ya API ke through ghante ke hisaab se computing, storage aur networking kiraye par lete ho. Apne kamre (subnets), apne darwaze (gateways) aur apne taale (security groups) aap khud design karte ho. Wahi aakhri hissa hai jahan network engineer ki zaroorat padti hai.</p>

<h3>Harbourline Logistics se milo, hamari chalti kahani</h3>
<p>Is poore module mein aap <b>Harbourline Logistics</b> mein junior network engineer ho, ek freight company jiska ek head office (HQ), barah branch offices aur ek warehouse hai. Aapki lead engineer, Meera, ko kaha gaya hai ki company ka customer tracking portal aur internal apps purane HQ server room se public cloud mein le jaaye, branches ke liye kuch bhi tode bina. Har chapter migration ka ek hissa jodta hai.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Harbourline migration map">
<rect x="20" y="20" width="170" height="70" rx="8" fill="#e2e8f0"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="14">HQ server room</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/16</text>
<rect x="450" y="20" width="170" height="70" rx="8" fill="#bae6fd"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="14">Cloud VPC hl-prod</text><text x="535" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/16</text>
<line x1="190" y1="55" x2="450" y2="55" stroke="#64748b" stroke-width="3"/><text x="320" y="46" text-anchor="middle" class="svg-accent" font-size="12">site-to-site VPN / direct connect</text>
<rect x="20" y="130" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="105" y="156" text-anchor="middle" class="svg-ink" font-size="14">12 branches</text><text x="105" y="175" text-anchor="middle" class="svg-muted" font-size="12">10.30.x.0/24</text>
<rect x="235" y="130" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="156" text-anchor="middle" class="svg-ink" font-size="14">SD-WAN overlay</text><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">MPLS + broadband + 5G</text>
<line x1="190" y1="160" x2="235" y2="160" stroke="#64748b" stroke-width="2"/><line x1="405" y1="160" x2="535" y2="90" stroke="#64748b" stroke-width="2"/><line x1="105" y1="130" x2="105" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="450" y="130" width="170" height="60" rx="8" fill="#fde68a"/><text x="535" y="156" text-anchor="middle" class="svg-ink" font-size="14">Remote staff</text><text x="535" y="175" text-anchor="middle" class="svg-muted" font-size="12">zero trust + SASE</text>
<line x1="535" y1="130" x2="535" y2="90" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<rect x="20" y="230" width="600" height="50" rx="8" fill="#fed7aa"/><text x="320" y="252" text-anchor="middle" class="svg-ink" font-size="14">Infrastructure as code: har hissa Git ke templates se bana</text><text x="320" y="270" text-anchor="middle" class="svg-muted" font-size="12">automation, version control, drift checks</text>
</svg><p class="cap">Harbourline migration. Har box is module ke ek ya zyada chapters mein cover hota hai.</p></div>

<h3>Is module ka raasta</h3>
<ol>
<li><b>Cloud models</b>: public, private aur hybrid clouds; SaaS, PaaS aur IaaS; kaun kis cheez ka zimmedaar hai.</li>
<li><b>Virtualisation aur NFV</b>: ek physical server kaise kai ban jaata hai, routers aur firewalls kaise software ban jaate hain, aur scalability, elasticity aur multitenancy ka matlab kya hai.</li>
<li><b>VPC</b>: subnets, route tables, internet gateway aur NAT gateway.</li>
<li><b>Cloud firewalls</b>: security groups vs network security lists (network ACLs).</li>
<li><b>Hybrid connectivity</b>: site-to-site VPN vs private direct connection.</li>
<li><b>SDN aur VXLAN</b>: network ke dimaag ko uski muscles se alag karna, aur Layer 2 ko Layer 3 ke across stretch karna.</li>
<li><b>SD-WAN</b>: application-aware, transport-agnostic branch networking, zero-touch provisioning aur central policy ke saath.</li>
<li><b>Zero trust aur SASE/SSE</b>: network location par kabhi bharosa mat karo, hamesha user aur device verify karo.</li>
<li><b>Infrastructure as code</b>: playbooks, templates, dynamic inventories, Git branching aur conflict handling.</li>
<li>Cloud aur hybrid network ka <b>troubleshooting</b>, phir <b>summary aur exam checklist</b>.</li>
</ol>

<h3>Network engineer ko yeh kyun seekhna chahiye</h3>
<p>Log kabhi kabhi kehte hain "cloud mein network team nahi hoti". Sach iska ulta hai. Cloud mein koi cable nahi chhoota, par kisi ko to non-overlapping address space plan karna hai, decide karna hai ki kaunse subnets internet tak pahunchein, firewall rules likhne hain, offices tak encrypted tunnels banane hain aur "app slow hai" hone par troubleshoot karna hai. Fark bas itna hai ki aap yeh sab software mein karte ho, aksar code ke saath, aur galtiyan automation ki speed se copy hoti hain.</p>

<div class="eg"><p><b>Worked example: address plan pehle kyun aata hai.</b> Harbourline HQ 10.10.0.0/16 use karta hai aur branches 10.30.0.0/16 (har branch ek /24). Cloud console 172.31.0.0/16 ka default network suggest karta hai, par Meera naye VPC ke liye <b>10.20.0.0/16</b> chunti hai. Kyun? Kyunki VPC baad mein VPN se HQ se judega, aur overlapping ranges wale do networks bina messy NAT ke ek doosre tak route nahi kar sakte. Ek /16 mein 65,536 addresses hain, aaj ke chhe /24 subnets aur baad mein aur bhi bahut saare subnets ke liye kaafi jagah.</p></div>

<div class="warn"><p><b>Common galti.</b> Production ke liye cloud provider ka default network accept kar lena. Default VPCs aksar aisi range use karte hain jo aapki company mein kahin pehle se hai, aur overlap ka pata usi din chalta hai jis din aap VPN jodne ki koshish karte ho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Network+ vendor-neutral hai. Questions "VPC", "internet gateway", "NAT gateway", "network security group" aur "direct connect" generic terms mein bolte hain. Kisi specific provider ke feature par zyada mat socho; general concept ke saath answer do.</p></div>

<div class="scn"><h4>Woh migration jo ek spreadsheet se shuru hui</h4><p>Ek mid-sized retailer ne ek weekend mein apne web servers cloud mein utha diye. Monday ko stores invoices print nahi kar paaye, kyunki print server on-premises reh gaya tha aur cloud subnet wahi 192.168.1.0/24 use kar raha tha jo bees stores use karte the. Engineers ko cloud subnet renumber karna pada aur har server dobara deploy karna pada. Doosri migration wave ek simple spreadsheet se shuru hui jismein company ki har range listed thi, ek bhi VPC banne se pehle.</p><p><b>Seekh:</b> cloud networking abhi bhi IP networking hi hai. Pehle addresses aur paths plan karo, buttons baad mein dabao.</p></div>

<div class="iv"><p class="q">"Cloud mein jaane ke baad bhi company ko network engineers ki zaroorat kyun hai?"</p><p>Strong answer: physical layer provider ke paas chali jaati hai, par logical design customer ke paas rehta hai: address planning, subnet aur route design, gateways, security groups aur ACLs, hybrid VPN ya direct links, DNS, aur troubleshooting. Batao ki shared responsibility model mein network access control aur data hamesha customer ke hote hain, aur cloud networks code se bante hain, isliye automation skills matter karti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cloud kiraye par li gayi computing, storage aur networking hai; apne subnets, gateways aur firewall rules aap khud design karte ho.</li>
<li>Yeh module Network+ 1.3 (cloud concepts aur connectivity) aur 1.8 (SDN, SD-WAN, VXLAN, zero trust, SASE, IaC) cover karta hai.</li>
<li>Harbourline Logistics HQ server room (10.10.0.0/16) se cloud VPC (10.20.0.0/16) mein jaati hai, branches 10.30.0.0/16 par hain.</li>
<li>Cloud mein kuch bhi banane se pehle non-overlapping address space plan karo.</li>
<li>Network+ questions generic names use karte hain; AWS aur Azure equivalents sirf kaam par madad ke liye hain.</li>
</ul></div>
`}};export{e as default};