var e=`<svg viewBox="0 0 640 270" role="img" aria-label="A VNet with subnets and the internet">
<rect x="10" y="100" width="90" height="60" rx="8" fill="#e2e8f0"/><text x="55" y="135" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="100" y1="130" x2="150" y2="130" stroke="#64748b" stroke-width="2"/><text x="125" y="120" text-anchor="middle" class="svg-accent" font-size="12">public IP</text>
<rect x="150" y="10" width="480" height="250" rx="10" fill="#bae6fd"/><text x="164" y="30" class="svg-ink" font-size="13">vnet-nk 10.10.0.0/16 (Central India)</text>
<rect x="170" y="50" width="200" height="90" rx="8" fill="#bbf7d0"/><text x="270" y="75" text-anchor="middle" class="svg-ink" font-size="13">snet-web 10.10.1.0/24</text><text x="270" y="95" text-anchor="middle" class="svg-muted" font-size="12">VM web (10.10.1.4)</text><text x="270" y="115" text-anchor="middle" class="svg-muted" font-size="12">public IP attached</text>
<rect x="400" y="50" width="210" height="90" rx="8" fill="#ddd6fe"/><text x="505" y="75" text-anchor="middle" class="svg-ink" font-size="13">snet-app 10.10.2.0/24</text><text x="505" y="95" text-anchor="middle" class="svg-muted" font-size="12">VM app (10.10.2.4)</text><text x="505" y="115" text-anchor="middle" class="svg-muted" font-size="12">no public IP</text>
<line x1="370" y1="95" x2="400" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="160" width="440" height="85" rx="8" fill="#fde68a"/><text x="390" y="185" text-anchor="middle" class="svg-ink" font-size="13">Azure system routes (built in, no router to configure)</text><text x="390" y="206" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/16 to Virtual network, 0.0.0.0/0 to Internet</text><text x="390" y="226" text-anchor="middle" class="svg-muted" font-size="12">private ranges not in your VNet go to None</text>
</svg>`,t={id:`big-picture`,h:{en:`Virtual networks: the big picture`,hi:`Virtual networks: big picture`},body:{en:`
<h3>What you will learn</h3>
<p>By the end of this module you can design a virtual network (VNet) address space and subnets, explain the five reserved addresses, read system routes and effective routes, choose a public IP SKU, explain default outbound access and why it is changing, compare service endpoints with private endpoints, and describe DNS inside a VNet. You also run two guided labs on your own account with a cost estimate, verification and mandatory cleanup. This is the second of three Azure networking modules. The first covered accounts, regions and resource groups. The next covers <b>network security groups</b>.</p>
<p><b>Prerequisites:</b> the previous module (azure-start), and IPv4 subnetting basics. If you know the AWS VPC modules, you will find a lot familiar, and we add short AWS vs Azure boxes where the models differ.</p>
<p><b>Exam alignment:</b> AZ-900 networking (virtual networks, subnets, public and private IPs, DNS) and AZ-700 foundations (VNet design, routing, public IP addressing). This is not an exam-prep course.</p>

<h3>The analogy: a gated colony with a built-in road system</h3>
<p>A VNet is your gated colony. The colony has lanes (subnets). Azure pre-builds a road map for you, so every lane can reach every other lane without you laying a single cable. There is a main gate to the public road (the Internet), but a house only uses it if it holds a public address, and a guard (a network security group, next module) decides who walks in. You can change the road map with your own signboards (user-defined routes), which is how you send traffic through a firewall.</p>

<div class="dia">`+e+`<p class="cap">One VNet, two subnets, one public IP, and a built-in routing layer you do not configure by hand.</p></div>

<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>What a VNet is and is not</h3>
<ul>
<li>A VNet is a <b>regional</b>, logically isolated network in one subscription. It never spans regions.</li>
<li>You choose one or more <b>address prefixes</b> (CIDR blocks). Everything inside gets an address from them.</li>
<li>Resources in the same VNet can talk to each other by private IP <b>by default</b>, across subnets. Filtering comes from network security groups and routes, not from the subnet boundary.</li>
<li>Traffic between VNets, to the Internet and to on-premises is controlled by peering, public IPs, gateways, NAT and routes.</li>
<li>A VNet is free to create. You pay for what you put in it.</li>
</ul>

<table class="cmp"><tr><th>Idea</th><th>AWS</th><th>Azure</th></tr>
<tr><td>Private network</td><td>VPC</td><td>VNet</td></tr>
<tr><td>Subnet scope</td><td>One AZ</td><td>Whole region</td></tr>
<tr><td>Router</td><td>Route tables you associate</td><td>System routes always present, optional route tables for overrides</td></tr>
<tr><td>Internet access</td><td>IGW plus route plus public IP</td><td>Public IP on the NIC; the default route to Internet already exists</td></tr>
<tr><td>Subnet filter</td><td>Network ACL (stateless)</td><td>NSG (stateful) on subnet or NIC</td></tr>
</table>
<div class="note"><p><b>AWS vs Azure.</b> In AWS a subnet is public because its route table points to an internet gateway. In Azure there is no such switch: every subnet has a default route to the Internet, and what makes a VM reachable is a public IP plus an NSG that allows it.</p></div>

<h3>A worked address plan</h3>
<div class="eg"><p><b>Worked example.</b> Asha plans a small app. VNet <code>vnet-nk</code> uses 10.10.0.0/16. Subnet <code>snet-web</code> is 10.10.1.0/24 for a web VM that needs a public IP. Subnet <code>snet-app</code> is 10.10.2.0/24 for an application VM that must not be reachable from the Internet. She leaves 10.10.3.0 onward free for a database subnet, GatewaySubnet and later services. Each /24 gives 251 usable addresses.</p></div>

<h3>Why this matters</h3>
<p>Almost every Azure workload starts in a VNet: VMs, containers, databases with private endpoints, load balancers. A clean address plan and a clear picture of routes saves rebuilds later. Networking mistakes are expensive because other resources depend on the VNet.</p>

<div class="warn"><p><b>Common mistake.</b> Believing the subnet boundary blocks traffic. By default, a VM in snet-web can reach a VM in snet-app, because the system route for the VNet range sends it there and the default NSG rules allow VirtualNetwork traffic. You block it with an NSG rule.</p></div>

<div class="exam"><p><b>Exam trap.</b> A VNet is regional, free, and its subnets can hold resources from any zone. VNets are isolated from each other until you peer them or connect gateways.</p></div>

<div class="scn"><h4>The "private" VM that was not</h4><p>A team put a database VM in a "private" subnet with no public IP. A tester on another subnet queried it directly, with no firewall rule involved. The team thought subnets isolate. They added an NSG that allowed the database port only from the app subnet and denied the rest of the VNet.</p><p><b>Lesson:</b> a subnet is an addressing group. Isolation comes from NSGs and routes.</p></div>

<div class="iv"><p class="q">"What is a VNet and how does traffic move inside it?"</p><p>A regional isolated network with address prefixes and subnets. Azure adds system routes so subnets reach each other automatically, and NSGs filter. Mention peering for VNet to VNet, gateways for on-premises and public IPs or NAT for Internet.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VNet is regional, free and isolated; subnets inside it reach each other by default.</li>
<li>Azure provides routing through system routes; you override with user-defined routes.</li>
<li>Internet reachability needs a public IP and a permissive NSG, not an internet gateway.</li>
<li>Isolation inside a VNet comes from NSGs and routes, not from subnet boundaries.</li>
<li>Plan address space first; leave gaps for gateway, Bastion and firewall subnets.</li>
</ul></div>
`,hi:`
<h3>Is module mein aap kya seekhoge</h3>
<p>Module ke end tak aap virtual network (VNet) ka address space aur subnets design kar sakoge, paanch reserved addresses samjha sakoge, system routes aur effective routes padh sakoge, public IP SKU chun sakoge, default outbound access aur uske badalne ki wajah samjha sakoge, service endpoints aur private endpoints compare kar sakoge, aur VNet ke andar DNS describe kar sakoge. Aap apne account par do guided labs bhi chalaoge, cost estimate, verification aur mandatory cleanup ke saath. Yeh Azure networking ke teen modules mein doosra hai. Pehle module mein accounts, regions aur resource groups the. Agla <b>network security groups</b> cover karta hai.</p>
<p><b>Prerequisites:</b> pichla module (azure-start), aur IPv4 subnetting basics. Agar aap AWS VPC modules jaante ho to bahut kuch familiar lagega, aur jahan models alag hain wahan hum chhote AWS vs Azure boxes dete hain.</p>
<p><b>Exam alignment:</b> AZ-900 networking (virtual networks, subnets, public aur private IPs, DNS) aur AZ-700 foundations (VNet design, routing, public IP addressing). Yeh exam-prep course nahi hai.</p>

<h3>Analogy: built-in road system wali gated colony</h3>
<p>VNet aapki gated colony hai. Colony mein lanes (subnets) hain. Azure aapke liye road map pehle se bana deta hai, isliye har lane doosri lane tak bina ek bhi cable bichhaye pahunch sakti hai. Public road (Internet) ka main gate hai, lekin ghar use tabhi karta hai jab uske paas public address ho, aur guard (network security group, agla module) decide karta hai kaun andar aayega. Aap apne signboards (user-defined routes) se road map badal sakte ho, aise hi traffic ko firewall se bhejte hain.</p>

<div class="dia">`+e+`<p class="cap">Ek VNet, do subnets, ek public IP, aur built-in routing layer jise aap haath se configure nahi karte.</p></div>

<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>VNet kya hai aur kya nahi</h3>
<ul>
<li>VNet ek subscription mein <b>regional</b>, logically isolated network hai. Yeh kabhi regions ke beech nahi phailta.</li>
<li>Aap ek ya zyada <b>address prefixes</b> (CIDR blocks) chunte ho. Andar sabko inhi se address milta hai.</li>
<li>Ek hi VNet ke resources <b>default</b> mein private IP se ek doosre se baat kar sakte hain, subnets ke aar-paar bhi. Filtering network security groups aur routes se aati hai, subnet boundary se nahi.</li>
<li>VNets ke beech, Internet aur on-premises ka traffic peering, public IPs, gateways, NAT aur routes control karte hain.</li>
<li>VNet banana free hai. Jo andar rakhte ho uske paise lagte hain.</li>
</ul>

<table class="cmp"><tr><th>Idea</th><th>AWS</th><th>Azure</th></tr>
<tr><td>Private network</td><td>VPC</td><td>VNet</td></tr>
<tr><td>Subnet scope</td><td>Ek AZ</td><td>Poora region</td></tr>
<tr><td>Router</td><td>Route tables jo associate karte ho</td><td>System routes hamesha maujood, override ke liye optional route tables</td></tr>
<tr><td>Internet access</td><td>IGW plus route plus public IP</td><td>NIC par public IP; Internet ka default route pehle se hai</td></tr>
<tr><td>Subnet filter</td><td>Network ACL (stateless)</td><td>NSG (stateful), subnet ya NIC par</td></tr>
</table>
<div class="note"><p><b>AWS vs Azure.</b> AWS mein subnet public tab hota hai jab uska route table internet gateway ki taraf point kare. Azure mein aisa koi switch nahi: har subnet ka Internet ka default route hota hai, aur VM ko reachable banata hai public IP plus aisa NSG jo allow kare.</p></div>

<h3>Worked address plan</h3>
<div class="eg"><p><b>Worked example.</b> Asha chhoti app plan karti hai. VNet <code>vnet-nk</code> 10.10.0.0/16 use karta hai. Subnet <code>snet-web</code> 10.10.1.0/24 hai, web VM ke liye jise public IP chahiye. Subnet <code>snet-app</code> 10.10.2.0/24 hai, application VM ke liye jo Internet se reachable nahi hona chahiye. Woh 10.10.3.0 se aage database subnet, GatewaySubnet aur baad ki services ke liye free rakhti hai. Har /24 mein 251 usable addresses hote hain.</p></div>

<h3>Yeh kyun matter karta hai</h3>
<p>Lagbhag har Azure workload VNet se shuru hota hai: VMs, containers, private endpoints wale databases, load balancers. Saaf address plan aur routes ki clear picture baad mein rebuilds bachati hai. Networking galtiyan mehngi hoti hain kyunki doosre resources VNet par depend karte hain.</p>

<div class="warn"><p><b>Common mistake.</b> Yeh maan lena ki subnet boundary traffic block karta hai. Default mein snet-web ka VM snet-app ke VM tak pahunch sakta hai, kyunki VNet range ka system route use wahan bhejta hai aur default NSG rules VirtualNetwork traffic allow karte hain. Aap NSG rule se block karte ho.</p></div>

<div class="exam"><p><b>Exam trap.</b> VNet regional hai, free hai, aur uske subnets mein kisi bhi zone ke resources ho sakte hain. VNets ek doosre se isolated hote hain jab tak aap peer ya gateways connect na karo.</p></div>

<div class="scn"><h4>Woh "private" VM jo private nahi tha</h4><p>Ek team ne database VM ko bina public IP ke "private" subnet mein rakha. Doosre subnet ke tester ne bina kisi firewall rule ke use seedha query kiya. Team ne socha subnets isolate karte hain. Unhone aisa NSG lagaya jo database port sirf app subnet se allow karta tha aur VNet ke baaki sab ko deny.</p><p><b>Lesson:</b> subnet addressing group hai. Isolation NSGs aur routes se aata hai.</p></div>

<div class="iv"><p class="q">"VNet kya hai aur uske andar traffic kaise chalta hai?"</p><p>Regional isolated network jismein address prefixes aur subnets hote hain. Azure system routes add karta hai taki subnets apne aap ek doosre tak pahunchein, aur NSGs filter karte hain. VNet to VNet ke liye peering, on-premises ke liye gateways aur Internet ke liye public IPs ya NAT ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VNet regional, free aur isolated hai; uske andar subnets default mein ek doosre tak pahunchte hain.</li>
<li>Azure routing system routes se deta hai; aap user-defined routes se override karte ho.</li>
<li>Internet reachability ke liye public IP aur permissive NSG chahiye, internet gateway nahi.</li>
<li>VNet ke andar isolation NSGs aur routes se aata hai, subnet boundaries se nahi.</li>
<li>Pehle address space plan karo; gateway, Bastion aur firewall subnets ke liye gaps chhodo.</li>
</ul></div>
`}};export{t as default};