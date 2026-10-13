var e={id:`virtualisation-nfv`,h:{en:`Virtualisation, NFV, scalability, elasticity and multitenancy`,hi:`Virtualisation, NFV, scalability, elasticity aur multitenancy`},body:{en:`
<p>Picture a large empty office floor. Instead of building a separate building for every small company, the owner puts up light partition walls and rents out cabins. Each tenant gets a lockable cabin, its own phone extension and its own name plate, but they all share the same floor, lifts and air-conditioning. When a tenant grows, the partitions move. That is <b>virtualisation</b> and <b>multitenancy</b> in one picture, and it is the engine that makes the cloud possible.</p>

<h3>Virtualisation in two minutes</h3>
<p>A <b>hypervisor</b> is software that splits one physical server into many <b>virtual machines</b> (VMs). Each VM believes it has its own CPU, memory, disk and network card.</p>
<ul>
<li><b>Type 1 (bare-metal) hypervisor</b> runs directly on the hardware. Used in data centers and every public cloud. Examples: VMware ESXi, Microsoft Hyper-V, KVM.</li>
<li><b>Type 2 (hosted) hypervisor</b> runs as an application on top of a normal operating system. Used on laptops for labs. Examples: VirtualBox, VMware Workstation.</li>
</ul>
<p>Each VM has a <b>vNIC</b> (virtual network interface card) connected to a <b>virtual switch</b> inside the hypervisor, which then connects to the physical NICs. So even inside one server there is a switched network, with VLANs and policies, that a network engineer must understand.</p>
<p><b>Containers</b> go one step lighter. Instead of each workload having a full operating system, many containers share the host's kernel and package only the application and its libraries. They start in seconds and use far less memory, which is why modern cloud apps are often built as many small containers.</p>

<h3>NFV: network devices become software</h3>
<p><b>Network functions virtualisation (NFV)</b> takes functions that used to need a dedicated box (router, firewall, load balancer, WAN optimiser, VPN concentrator) and runs them as software, called <b>virtual network functions (VNFs)</b>, on ordinary x86 servers or cloud VMs. The standard NFV architecture has three parts: the <b>VNFs</b> themselves, the <b>NFV infrastructure (NFVI)</b> of compute, storage and network they run on, and <b>MANO</b> (management and orchestration) which deploys and scales them.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Appliances versus NFV">
<text x="150" y="22" text-anchor="middle" class="svg-ink" font-size="14">Before: one box per function</text>
<rect x="30" y="35" width="240" height="36" rx="6" fill="#fed7aa"/><text x="150" y="58" text-anchor="middle" class="svg-ink" font-size="13">Router appliance</text>
<rect x="30" y="77" width="240" height="36" rx="6" fill="#fed7aa"/><text x="150" y="100" text-anchor="middle" class="svg-ink" font-size="13">Firewall appliance</text>
<rect x="30" y="119" width="240" height="36" rx="6" fill="#fed7aa"/><text x="150" y="142" text-anchor="middle" class="svg-ink" font-size="13">Load balancer appliance</text>
<text x="150" y="180" text-anchor="middle" class="svg-muted" font-size="12">3 boxes, 3 power supplies, 3 shipments</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">After: VNFs on one server</text>
<rect x="340" y="35" width="280" height="150" rx="8" fill="#e2e8f0"/>
<rect x="355" y="45" width="80" height="50" rx="6" fill="#bae6fd"/><text x="395" y="75" text-anchor="middle" class="svg-ink" font-size="12">vRouter</text>
<rect x="440" y="45" width="80" height="50" rx="6" fill="#fde68a"/><text x="480" y="75" text-anchor="middle" class="svg-ink" font-size="12">vFirewall</text>
<rect x="525" y="45" width="80" height="50" rx="6" fill="#bbf7d0"/><text x="565" y="75" text-anchor="middle" class="svg-ink" font-size="12">vLB</text>
<rect x="355" y="105" width="250" height="30" rx="6" fill="#ddd6fe"/><text x="480" y="125" text-anchor="middle" class="svg-ink" font-size="12">Hypervisor + virtual switch</text>
<rect x="355" y="142" width="250" height="30" rx="6" fill="#ffffff" stroke="#64748b"/><text x="480" y="162" text-anchor="middle" class="svg-ink" font-size="12">Standard x86 server (NFVI)</text>
<text x="480" y="210" text-anchor="middle" class="svg-accent" font-size="12">deployed and scaled by MANO in minutes</text>
</svg><p class="cap">NFV replaces single-purpose appliances with virtual network functions on shared, standard hardware.</p></div>

<p>Why it matters: a new firewall no longer needs a purchase order and a courier. At Harbourline, the cloud edge firewall is a VNF launched from the provider's marketplace, and each branch will get one small <b>universal CPE (uCPE)</b> box that runs the SD-WAN router and a firewall as VNFs side by side.</p>

<h3>Scalability and elasticity</h3>
<dl class="terms">
<dt>Scalability</dt><dd>The <b>ability</b> of a system to handle more load by adding resources. <b>Vertical scaling (scale up)</b> gives one machine more CPU or memory, which usually needs a restart and has a ceiling. <b>Horizontal scaling (scale out)</b> adds more machines behind a load balancer, with no fixed ceiling.</dd>
<dt>Elasticity</dt><dd>Adding <b>and removing</b> resources <b>automatically</b> as demand rises and falls, so you pay only for what you use. In the cloud this is done by an <b>autoscaling group</b> with a minimum, a maximum and a target metric such as 60% CPU.</dd>
</dl>
<p>Every elastic system is scalable, but not every scalable system is elastic. A company that buys a bigger server every year is scalable; a web tier that grows from 2 to 6 VMs at 9 a.m. and shrinks back at night is elastic.</p>

<div class="eg"><p><b>Worked example: Harbourline's web tier.</b> One web VM serves about 500 requests per second at 60% CPU. On Friday evenings customers check shipments at up to 3,000 requests per second; at night the load is 400 requests per second. Meera sets an autoscaling group with <b>minimum 2</b> (one per availability zone, for resilience), <b>maximum 10</b> and a <b>target of 60% CPU</b>. Friday: 3,000 / 500 = 6 VMs. Night: 400 / 500 is less than 1, but the minimum keeps 2. Instead of paying for 6 VMs all week, the company pays for 6 only during the peak.</p></div>
<pre class="code"><span class="c"># check the current size of the autoscaling group from the cloud CLI</span>
aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names hl-web-asg --query "AutoScalingGroups[0].[MinSize,MaxSize,DesiredCapacity]" --output text</pre>
<pre class="out"><span class="hl">2       10      6</span></pre>
<p>The output reads minimum 2, maximum 10, currently 6 instances: the Friday peak is in progress.</p>

<h3>Multitenancy</h3>
<p><b>Multitenancy</b> means many customers (tenants) share the same physical servers, switches and storage, but each sees only its own logically isolated slice. Isolation comes from the hypervisor, from per-tenant virtual networks (VPCs, VRFs, VXLAN segments) and from access control. Benefits: low cost and huge scale. Risks: a <b>noisy neighbour</b> that consumes shared resources, and the need to trust the provider's isolation. Customers with strict rules can buy <b>dedicated hosts</b> (single-tenant hardware) at a higher price.</p>

<div class="warn"><p><b>Common mistake.</b> Setting an autoscaling minimum of 1 to save money. When that one VM or its zone fails, the service is down until a new VM boots. Keep at least one instance per availability zone for anything customer-facing.</p></div>

<div class="exam"><p><b>Exam trap.</b> Elasticity is automatic and works in both directions; scalability is only the ability to grow. NFV virtualises network <b>functions</b> (firewall, router); SDN separates the control plane from the data plane. They complement each other but are not the same thing.</p></div>

<div class="scn"><h4>The sale that melted the web servers</h4><p>An online shop ran a flash sale. Traffic rose ten times in five minutes, but the web tier stayed at four VMs and customers saw timeouts. The autoscaling group existed, but its maximum was also set to 4, copied from the test environment. Raising the maximum to 20 and adding a scheduled scale-out before future sales solved it.</p><p><b>Lesson:</b> elasticity only works inside the limits you configure. Review minimum, maximum and the scaling metric for production.</p></div>

<div class="iv"><p class="q">"What is the difference between scalability and elasticity, and where does NFV fit?"</p><p>Strong answer: scalability is the capacity to grow, vertically (bigger VM) or horizontally (more VMs); elasticity is automatic scaling out and in with demand, paying only for what is used, usually through autoscaling groups. NFV runs network functions such as firewalls and load balancers as VNFs on standard hardware, so they can also be deployed and scaled like any other VM. Mention VNF, NFVI and MANO for a complete answer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 1 hypervisors run on bare metal (data centers, clouds); type 2 run on a host OS (labs).</li>
<li>NFV turns routers, firewalls and load balancers into VNFs on standard servers; MANO orchestrates them.</li>
<li>Scalability = ability to grow (scale up or out); elasticity = automatic grow and shrink with demand.</li>
<li>Multitenancy = many customers on shared hardware with logical isolation; watch for noisy neighbours.</li>
<li>Autoscaling needs a sensible minimum (one per zone), maximum and target metric.</li>
</ul></div>
`,hi:`
<p>Ek bada khaali office floor imagine karo. Har chhoti company ke liye alag building banane ki jagah, owner halki partition walls lagata hai aur cabins kiraye par deta hai. Har tenant ko lock hone wala cabin, apna phone extension aur apna name plate milta hai, par sab ek hi floor, lifts aur air-conditioning share karte hain. Jab koi tenant badhta hai, partitions khisak jaati hain. Ek hi tasveer mein yahi <b>virtualisation</b> aur <b>multitenancy</b> hai, aur yahi woh engine hai jo cloud ko possible banata hai.</p>

<h3>Do minute mein virtualisation</h3>
<p><b>Hypervisor</b> woh software hai jo ek physical server ko kai <b>virtual machines</b> (VMs) mein baant deta hai. Har VM ko lagta hai ki uske paas apna CPU, memory, disk aur network card hai.</p>
<ul>
<li><b>Type 1 (bare-metal) hypervisor</b> seedha hardware par chalta hai. Data centers aur har public cloud mein use hota hai. Examples: VMware ESXi, Microsoft Hyper-V, KVM.</li>
<li><b>Type 2 (hosted) hypervisor</b> normal operating system ke upar ek application ki tarah chalta hai. Labs ke liye laptops par use hota hai. Examples: VirtualBox, VMware Workstation.</li>
</ul>
<p>Har VM ka ek <b>vNIC</b> (virtual network interface card) hota hai jo hypervisor ke andar ek <b>virtual switch</b> se juda hota hai, jo phir physical NICs se judta hai. Yaani ek server ke andar bhi ek switched network hai, VLANs aur policies ke saath, jise network engineer ko samajhna chahiye.</p>
<p><b>Containers</b> ek step aur halke hain. Har workload ka poora operating system hone ki jagah, kai containers host ka kernel share karte hain aur sirf application aur uski libraries pack karte hain. Yeh seconds mein start hote hain aur bahut kam memory lete hain, isliye modern cloud apps aksar kai chhote containers se bante hain.</p>

<h3>NFV: network devices software ban jaate hain</h3>
<p><b>Network functions virtualisation (NFV)</b> un functions ko lekar jinke liye pehle dedicated box chahiye tha (router, firewall, load balancer, WAN optimiser, VPN concentrator), unhe software ki tarah chalata hai, jinhe <b>virtual network functions (VNFs)</b> kehte hain, normal x86 servers ya cloud VMs par. Standard NFV architecture ke teen hisse hain: khud <b>VNFs</b>, compute, storage aur network ka <b>NFV infrastructure (NFVI)</b> jis par woh chalte hain, aur <b>MANO</b> (management and orchestration) jo unhe deploy aur scale karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Appliances versus NFV">
<text x="150" y="22" text-anchor="middle" class="svg-ink" font-size="14">Pehle: har function ka ek box</text>
<rect x="30" y="35" width="240" height="36" rx="6" fill="#fed7aa"/><text x="150" y="58" text-anchor="middle" class="svg-ink" font-size="13">Router appliance</text>
<rect x="30" y="77" width="240" height="36" rx="6" fill="#fed7aa"/><text x="150" y="100" text-anchor="middle" class="svg-ink" font-size="13">Firewall appliance</text>
<rect x="30" y="119" width="240" height="36" rx="6" fill="#fed7aa"/><text x="150" y="142" text-anchor="middle" class="svg-ink" font-size="13">Load balancer appliance</text>
<text x="150" y="180" text-anchor="middle" class="svg-muted" font-size="12">3 box, 3 power supplies, 3 shipments</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">Ab: ek server par VNFs</text>
<rect x="340" y="35" width="280" height="150" rx="8" fill="#e2e8f0"/>
<rect x="355" y="45" width="80" height="50" rx="6" fill="#bae6fd"/><text x="395" y="75" text-anchor="middle" class="svg-ink" font-size="12">vRouter</text>
<rect x="440" y="45" width="80" height="50" rx="6" fill="#fde68a"/><text x="480" y="75" text-anchor="middle" class="svg-ink" font-size="12">vFirewall</text>
<rect x="525" y="45" width="80" height="50" rx="6" fill="#bbf7d0"/><text x="565" y="75" text-anchor="middle" class="svg-ink" font-size="12">vLB</text>
<rect x="355" y="105" width="250" height="30" rx="6" fill="#ddd6fe"/><text x="480" y="125" text-anchor="middle" class="svg-ink" font-size="12">Hypervisor + virtual switch</text>
<rect x="355" y="142" width="250" height="30" rx="6" fill="#ffffff" stroke="#64748b"/><text x="480" y="162" text-anchor="middle" class="svg-ink" font-size="12">Standard x86 server (NFVI)</text>
<text x="480" y="210" text-anchor="middle" class="svg-accent" font-size="12">MANO minutes mein deploy aur scale karta hai</text>
</svg><p class="cap">NFV single-purpose appliances ko shared, standard hardware par chalne wale virtual network functions se replace karta hai.</p></div>

<p>Yeh kyun matter karta hai: naye firewall ke liye ab purchase order aur courier nahi chahiye. Harbourline mein, cloud edge firewall provider ke marketplace se launch kiya gaya VNF hai, aur har branch ko ek chhota <b>universal CPE (uCPE)</b> box milega jo SD-WAN router aur firewall ko VNFs ki tarah saath saath chalayega.</p>

<h3>Scalability aur elasticity</h3>
<dl class="terms">
<dt>Scalability</dt><dd>System ki resources jodkar zyada load sambhalne ki <b>kshamta</b>. <b>Vertical scaling (scale up)</b> ek machine ko zyada CPU ya memory deta hai, jiske liye aam taur par restart chahiye aur ek ceiling hoti hai. <b>Horizontal scaling (scale out)</b> load balancer ke peeche aur machines jodta hai, bina kisi fixed ceiling ke.</dd>
<dt>Elasticity</dt><dd>Demand badhne aur ghatne ke saath resources <b>automatically</b> jodna <b>aur hatana</b>, taaki aap sirf utna pay karo jitna use karo. Cloud mein yeh <b>autoscaling group</b> se hota hai jiska ek minimum, ek maximum aur ek target metric hota hai, jaise 60% CPU.</dd>
</dl>
<p>Har elastic system scalable hai, par har scalable system elastic nahi. Jo company har saal bada server khareedti hai woh scalable hai; jo web tier subah 9 baje 2 se 6 VMs tak badhta hai aur raat ko wapas chhota ho jaata hai woh elastic hai.</p>

<div class="eg"><p><b>Worked example: Harbourline ka web tier.</b> Ek web VM 60% CPU par lagbhag 500 requests per second serve karta hai. Friday shaam customers 3,000 requests per second tak shipments check karte hain; raat ko load 400 requests per second hota hai. Meera ek autoscaling group set karti hai: <b>minimum 2</b> (resilience ke liye har availability zone mein ek), <b>maximum 10</b> aur <b>60% CPU ka target</b>. Friday: 3,000 / 500 = 6 VMs. Raat: 400 / 500 ek se kam hai, par minimum 2 rakhta hai. Poore hafte 6 VMs ka paisa dene ki jagah, company sirf peak ke dauraan 6 ka paisa deti hai.</p></div>
<pre class="code"><span class="c"># cloud CLI se autoscaling group ka current size check karo</span>
aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names hl-web-asg --query "AutoScalingGroups[0].[MinSize,MaxSize,DesiredCapacity]" --output text</pre>
<pre class="out"><span class="hl">2       10      6</span></pre>
<p>Output ka matlab hai minimum 2, maximum 10, abhi 6 instances: Friday ka peak chal raha hai.</p>

<h3>Multitenancy</h3>
<p><b>Multitenancy</b> ka matlab hai kai customers (tenants) same physical servers, switches aur storage share karte hain, par har ek ko sirf apna logically isolated hissa dikhta hai. Isolation hypervisor se, har tenant ke virtual networks (VPCs, VRFs, VXLAN segments) se aur access control se aata hai. Fayde: kam cost aur bahut bada scale. Risks: ek <b>noisy neighbour</b> jo shared resources kha jaata hai, aur provider ki isolation par bharosa karne ki zaroorat. Strict rules wale customers zyada price par <b>dedicated hosts</b> (single-tenant hardware) le sakte hain.</p>

<div class="warn"><p><b>Common galti.</b> Paise bachane ke liye autoscaling minimum 1 set karna. Jab woh ek VM ya uska zone fail hota hai, to naya VM boot hone tak service down rehti hai. Customer-facing cheezon ke liye har availability zone mein kam se kam ek instance rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Elasticity automatic hai aur dono directions mein kaam karti hai; scalability sirf badhne ki kshamta hai. NFV network <b>functions</b> (firewall, router) ko virtualise karta hai; SDN control plane ko data plane se alag karta hai. Dono ek doosre ke saathi hain par ek cheez nahi.</p></div>

<div class="scn"><h4>Sale jisne web servers pighla diye</h4><p>Ek online shop ne flash sale chalayi. Paanch minute mein traffic das guna badh gaya, par web tier chaar VMs par hi raha aur customers ko timeouts dikhe. Autoscaling group tha, par uska maximum bhi 4 set tha, test environment se copy kiya hua. Maximum 20 karne aur aage ki sales se pehle scheduled scale-out jodne se problem solve hui.</p><p><b>Seekh:</b> elasticity sirf un limits ke andar kaam karti hai jo aap configure karte ho. Production ke liye minimum, maximum aur scaling metric review karo.</p></div>

<div class="iv"><p class="q">"Scalability aur elasticity mein kya fark hai, aur NFV kahan fit hota hai?"</p><p>Strong answer: scalability badhne ki capacity hai, vertically (bada VM) ya horizontally (zyada VMs); elasticity demand ke saath automatic scale out aur scale in hai, sirf use ki hui cheez ka paisa, aam taur par autoscaling groups se. NFV firewalls aur load balancers jaise network functions ko standard hardware par VNFs ki tarah chalata hai, taaki unhe bhi kisi aur VM ki tarah deploy aur scale kiya ja sake. Poore answer ke liye VNF, NFVI aur MANO ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 1 hypervisors bare metal par chalte hain (data centers, clouds); type 2 host OS par chalte hain (labs).</li>
<li>NFV routers, firewalls aur load balancers ko standard servers par VNFs bana deta hai; MANO unhe orchestrate karta hai.</li>
<li>Scalability = badhne ki kshamta (scale up ya out); elasticity = demand ke saath automatic badhna aur ghatna.</li>
<li>Multitenancy = logical isolation ke saath shared hardware par kai customers; noisy neighbours ka dhyaan rakho.</li>
<li>Autoscaling ko sensible minimum (har zone mein ek), maximum aur target metric chahiye.</li>
</ul></div>
`}};export{e as default};