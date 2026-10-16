var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="{{aria}}">
<rect x="10" y="20" width="250" height="190" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="24" y="42" class="svg-muted" font-size="12">VNet vnet-a 10.10.0.0/16</text>
<rect x="40" y="70" width="190" height="110" rx="8" fill="#ddd6fe"/><text x="135" y="92" text-anchor="middle" class="svg-ink" font-size="13">sn-a 10.10.1.0/24</text>
<rect x="65" y="110" width="140" height="44" rx="6" fill="#bbf7d0"/><text x="135" y="128" text-anchor="middle" class="svg-ink" font-size="13">vm-a</text><text x="135" y="144" text-anchor="middle" class="svg-muted" font-size="12">10.10.1.4</text>
<rect x="380" y="20" width="250" height="190" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="394" y="42" class="svg-muted" font-size="12">VNet vnet-b 10.20.0.0/16</text>
<rect x="410" y="70" width="190" height="110" rx="8" fill="#bae6fd"/><text x="505" y="92" text-anchor="middle" class="svg-ink" font-size="13">sn-b 10.20.1.0/24</text>
<rect x="435" y="110" width="140" height="44" rx="6" fill="#bbf7d0"/><text x="505" y="128" text-anchor="middle" class="svg-ink" font-size="13">vm-b</text><text x="505" y="144" text-anchor="middle" class="svg-muted" font-size="12">10.20.1.4</text>
<line x1="260" y1="132" x2="380" y2="132" stroke="#64748b" stroke-width="4"/>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="12">{{peer}}</text><text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">{{bb}}</text>
<text x="320" y="224" text-anchor="middle" class="svg-muted" font-size="12">{{cap1}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=`<div class="note"><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</div>`,r=e(t,{aria:`Two peered virtual networks`,peer:`VNet peering`,bb:`Microsoft backbone`,cap1:`Private IPs talk directly: no gateway, no public internet`,cap:`Two virtual networks with non-overlapping address spaces joined by peering behave like one network for routing between them.`}),i=e(t,{aria:`Two peered virtual networks`,peer:`VNet peering`,bb:`Microsoft backbone`,cap1:`Private IPs seedhe baat karte hain: gateway nahi, public internet nahi`,cap:`Non-overlapping address spaces wale do virtual networks peering se jud kar apas ke routing ke liye ek network ki tarah behave karte hain.`}),a={id:`big-picture`,h:{en:`Connecting virtual networks: why peering and routes`,hi:`Virtual networks jodna: peering aur routes kyun`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>What <b>VNet peering</b> is, how it differs from a VPN, and why peering is <b>non-transitive</b>.</li>
<li>Why address spaces must not overlap, and how gateway transit and "use remote gateways" share a VPN or ExpressRoute gateway.</li>
<li>Global (cross-region) peering and its cost and limit differences.</li>
<li><b>System routes</b>, <b>user-defined routes (UDRs)</b>, next-hop types (virtual appliance, virtual network gateway, none, internet) and route precedence.</li>
<li>Forced tunnelling and a hub-and-spoke design with a network virtual appliance (NVA) and IP forwarding.</li>
<li>Guided labs on your own Azure subscription with cleanup, and a troubleshooting workflow using Network Watcher.</li>
</ul>
<p><b>Prerequisites:</b> virtual networks, subnets and CIDR planning, NSGs, and the outbound module of this track (NAT Gateway). You should know that an Azure subnet reserves five addresses (the network address, the default gateway at .1, two for Azure DNS at .2 and .3, and the broadcast address).</p>

`+n+`

<h3>The two-office analogy</h3>
<p>Two companies rent offices in different buildings. Employees can only walk between buildings by going out into the street (the public internet), through security, and back in. Peering is like building a <b>private corridor</b> between the two buildings: it is fast, direct, and nobody on the street can use it. But a corridor between A and B and another between B and C does not let A walk to C through B unless B explicitly allows people to pass through: that is <b>non-transitivity</b>.</p>
<p>By default every virtual network (VNet) in Azure is an isolated island. Two VMs in different VNets cannot talk over private IPs, even in the same subscription and region. <b>VNet peering</b> connects two VNets so their resources can reach each other using private IPs, over the Microsoft backbone network, with low latency and no gateway in the middle.</p>
`+r+`
<h3>Why routes matter just as much</h3>
<p>Peering is about <b>reachability</b>; <b>routes</b> are about <b>path</b>. Azure builds a default route table for every subnet (system routes). Sometimes you want to change the path: send all internet traffic to a firewall, force spoke-to-spoke traffic through a central appliance, or send on-premises traffic into a VPN gateway. That is the job of <b>user-defined routes</b>. This module teaches peering and routing together because real designs always need both.</p>

<div class="eg"><b>Worked example.</b> vnet-a is 10.10.0.0/16 with vm-a at 10.10.1.4. vnet-b is 10.20.0.0/16 with vm-b at 10.20.1.4. Without peering, <code>ping 10.20.1.4</code> from vm-a times out. After you create a peering from A to B and from B to A, both show <b>Connected</b> and vm-a reaches vm-b privately. The NSG default rule AllowVnetInBound permits it because the <code>VirtualNetwork</code> service tag includes peered address spaces.</div>

<div class="note"><b>AWS vs Azure.</b> AWS VPC peering also is non-transitive and needs route table entries on both sides. In Azure, peering <b>adds system routes automatically</b> for the peer's address space, so no manual route is needed for basic reachability. Peering in Azure also needs a link in each direction.</div>

<div class="warn"><b>Common mistake.</b> Creating the peering in one direction only: the status stays <b>Initiated</b> and traffic does not flow. Another: overlapping address spaces, which Azure refuses to peer.</div>

<div class="scn"><h4>The merger that needed a corridor</h4><p>Two teams merged. Team 1 ran 10.10.0.0/16 in Central India; Team 2 ran 10.20.0.0/16 in the same region. The app needed private access to a database in the other VNet. The first idea was a VPN between them, with a gateway to pay for hourly. The engineer instead created two peering links with <code>az network vnet peering create</code> and had private connectivity in two minutes with no gateway.</p><p><b>Lesson:</b> for Azure-to-Azure private connectivity, peering is usually simpler and cheaper than a VPN.</p></div>

<div class="iv"><p class="q">"What is VNet peering and what is it not?"</p><p>A strong answer: it privately connects two VNets over the Microsoft backbone so resources communicate via private IPs. It needs non-overlapping address spaces and a link on each side. It is non-transitive, not a VPN, and does not encrypt traffic by itself at the VNet level (traffic stays on the Microsoft network). Mention that data transfer over peering is charged (verify pricing).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VNets are isolated until you peer them; peering gives private IP reachability.</li>
<li>Peering is non-transitive and needs a link in each direction.</li>
<li>Address spaces must not overlap.</li>
<li>Routes (system and user-defined) decide the path; peering adds system routes.</li>
<li>This module mixes theory with guided labs you can run on your own subscription or in the free practice labs.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<ul>
<li><b>VNet peering</b> kya hai, VPN se kaise alag hai, aur peering <b>non-transitive</b> kyun hai.</li>
<li>Address spaces overlap kyun nahi hone chahiye, aur gateway transit tatha "use remote gateways" VPN ya ExpressRoute gateway ko kaise share karte hain.</li>
<li>Global (cross-region) peering aur uske cost tatha limit ke farq.</li>
<li><b>System routes</b>, <b>user-defined routes (UDRs)</b>, next-hop types (virtual appliance, virtual network gateway, none, internet) aur route precedence.</li>
<li>Forced tunnelling aur network virtual appliance (NVA) tatha IP forwarding wala hub-and-spoke design.</li>
<li>Apne Azure subscription par cleanup ke saath guided labs, aur Network Watcher se troubleshooting workflow.</li>
</ul>
<p><b>Prerequisites:</b> virtual networks, subnets aur CIDR planning, NSGs, aur is track ka outbound module (NAT Gateway). Aapko pata hona chahiye ki Azure subnet paanch addresses reserve karta hai (network address, .1 par default gateway, .2 aur .3 Azure DNS ke liye, aur broadcast address).</p>

`+n+`

<h3>Do offices ki analogy</h3>
<p>Do companies alag buildings mein office kiraye par leti hain. Employees ek building se doosri mein sirf street (public internet) se, security se guzar kar, wapas andar jaakar pahunch sakte hain. Peering ek <b>private corridor</b> banane jaisa hai: tez, seedha, aur street ka koi use nahi kar sakta. Par A aur B ke beech corridor aur B aur C ke beech corridor se A, B ke through C tak nahi pahunch sakta jab tak B khud logon ko guzarne na de: yahi <b>non-transitivity</b> hai.</p>
<p>By default Azure ka har virtual network (VNet) ek isolated island hai. Alag VNets ke do VMs private IPs par baat nahi kar sakte, same subscription aur region mein bhi nahi. <b>VNet peering</b> do VNets ko jodti hai taaki unke resources private IPs se ek doosre tak pahunchein, Microsoft backbone network par, kam latency ke saath aur beech mein bina gateway ke.</p>
`+i+`
<h3>Routes utne hi zaroori kyun hain</h3>
<p>Peering <b>reachability</b> ke baare mein hai; <b>routes</b> <b>path</b> ke baare mein. Azure har subnet ke liye default route table (system routes) banata hai. Kabhi aap path badalna chahte ho: saara internet traffic firewall ko bhejna, spoke-to-spoke traffic ko central appliance se guzarna, ya on-premises traffic VPN gateway mein bhejna. Yeh <b>user-defined routes</b> ka kaam hai. Yeh module peering aur routing saath sikhata hai kyunki real designs ko dono chahiye.</p>

<div class="eg"><b>Worked example.</b> vnet-a 10.10.0.0/16 hai aur vm-a 10.10.1.4 par. vnet-b 10.20.0.0/16 hai aur vm-b 10.20.1.4 par. Peering ke bina vm-a se <code>ping 10.20.1.4</code> timeout hota hai. A se B aur B se A ki peering banane ke baad dono <b>Connected</b> dikhte hain aur vm-a vm-b tak privately pahunchta hai. NSG ka default rule AllowVnetInBound ise allow karta hai kyunki <code>VirtualNetwork</code> service tag mein peered address spaces shamil hain.</div>

<div class="note"><b>AWS vs Azure.</b> AWS VPC peering bhi non-transitive hai aur dono taraf route table entries chahiye. Azure mein peering peer ke address space ke liye <b>system routes automatically jodti hai</b>, isliye basic reachability ke liye manual route nahi chahiye. Azure mein peering ko bhi har direction mein link chahiye.</div>

<div class="warn"><b>Common mistake.</b> Peering sirf ek direction mein banana: status <b>Initiated</b> rehta hai aur traffic nahi chalta. Doosri: overlapping address spaces, jinhe Azure peer karne se mana kar deta hai.</div>

<div class="scn"><h4>Merger jise corridor chahiye tha</h4><p>Do teams merge hui. Team 1 Central India mein 10.10.0.0/16 chalati thi; Team 2 usi region mein 10.20.0.0/16. App ko doosre VNet ke database tak private access chahiye tha. Pehla idea unke beech VPN ka tha, jisme gateway ka hourly bill aata. Engineer ne <code>az network vnet peering create</code> se do peering links banaye aur do minute mein bina gateway ke private connectivity mil gayi.</p><p><b>Lesson:</b> Azure-to-Azure private connectivity ke liye peering aam taur par VPN se simple aur sasti hai.</p></div>

<div class="iv"><p class="q">"VNet peering kya hai aur kya nahi?"</p><p>Strong answer: yeh do VNets ko Microsoft backbone par privately jodti hai taaki resources private IPs se baat karein. Ise non-overlapping address spaces aur har taraf ek link chahiye. Yeh non-transitive hai, VPN nahi hai, aur VNet level par khud encrypt nahi karti (traffic Microsoft network par rehta hai). Batao ki peering par data transfer ka charge lagta hai (pricing verify karo).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Peer karne tak VNets isolated hain; peering private IP reachability deti hai.</li>
<li>Peering non-transitive hai aur har direction mein link chahiye.</li>
<li>Address spaces overlap nahi hone chahiye.</li>
<li>Routes (system aur user-defined) path decide karte hain; peering system routes jodti hai.</li>
<li>Is module mein theory ke saath guided labs hain jo aap apne subscription par ya free practice labs mein chala sakte ho.</li>
</ul></div>
`}};export{a as default};