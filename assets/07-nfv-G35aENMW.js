var e={id:`nfv`,h:{en:`NFV: virtualised network functions and how they fit the SP network`,hi:`NFV: virtualised network functions aur woh SP network mein kaise fit hote hain`},body:{en:`
<p>For decades a service provider bought a dedicated box for each function: one for routing, one for firewalling, one for NAT, one for the mobile core. Each box had its own hardware, its own refresh cycle and its own vendor. <b>Network functions virtualization (NFV)</b> asks a simple question: why not run these functions as <b>software on standard servers</b>, the way IT already runs applications in virtual machines and containers? The answer opens faster service launch and better resource sharing, and it also brings new design problems.</p>

<h3>Analogy: dedicated appliances versus apps on a smartphone</h3>
<p>Once you carried a camera, a music player, a torch and a map. Now one phone runs apps for each. The phone hardware is shared and you can install or remove an app in minutes. NFV does the same to network boxes: the server is the phone, and the firewall, router and gateway are apps.</p>

<h3>The ETSI NFV architecture</h3>
<p>The common reference is the ETSI NFV framework, with three blocks.</p>
<dl class="terms">
<dt>VNF (virtualised network function)</dt><dd>The function itself as software: a virtual router, firewall, NAT gateway, virtual BNG, virtual route reflector, or a mobile core function. Also called a CNF when it is cloud-native and containerised.</dd>
<dt>NFVI (NFV infrastructure)</dt><dd>The servers, storage, network and the virtualisation layer (hypervisor or container runtime) on which VNFs run.</dd>
<dt>MANO (management and orchestration)</dt><dd>The control layer, in three parts: the <b>NFV orchestrator (NFVO)</b> manages services and resources across the network, the <b>VNF manager (VNFM)</b> handles each VNF's lifecycle (create, scale, heal, delete), and the <b>virtualised infrastructure manager (VIM)</b> controls the compute, storage and network resources, for example an OpenStack-style or Kubernetes-based platform.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="ETSI NFV blocks">
<rect x="20" y="15" width="380" height="55" rx="8" fill="#bbf7d0"/><text x="210" y="38" text-anchor="middle" class="svg-ink" font-size="13">VNFs: vRouter, vFirewall, vBNG, vRR, ...</text><text x="210" y="57" text-anchor="middle" class="svg-muted" font-size="11">software functions, with EMS or element managers</text>
<rect x="20" y="85" width="380" height="75" rx="8" fill="#bae6fd"/><text x="210" y="108" text-anchor="middle" class="svg-ink" font-size="13">NFVI</text><text x="210" y="128" text-anchor="middle" class="svg-muted" font-size="11">virtual compute, storage, network (hypervisor or container runtime)</text><text x="210" y="146" text-anchor="middle" class="svg-muted" font-size="11">physical servers, switches, optics</text>
<rect x="430" y="15" width="190" height="145" rx="8" fill="#ddd6fe"/><text x="525" y="38" text-anchor="middle" class="svg-ink" font-size="13">MANO</text><text x="525" y="68" text-anchor="middle" class="svg-muted" font-size="11">NFVO: services</text><text x="525" y="90" text-anchor="middle" class="svg-muted" font-size="11">VNFM: VNF lifecycle</text><text x="525" y="112" text-anchor="middle" class="svg-muted" font-size="11">VIM: infrastructure</text>
<line x1="400" y1="85" x2="430" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">Functions are software; infrastructure is shared; orchestration ties them together</text>
</svg><p class="cap">The three ETSI NFV building blocks.</p></div>

<h3>NFV and SDN: related but different</h3>
<table class="cmp"><tr><th></th><th>NFV</th><th>SDN</th></tr>
<tr><td>Idea</td><td>Run network functions as software on shared infrastructure</td><td>Separate or centralise control logic and program the network through APIs</td></tr>
<tr><td>Question answered</td><td>What runs where, and on what hardware?</td><td>How is the network controlled and programmed?</td></tr>
<tr><td>Example</td><td>A virtual firewall on a server</td><td>A controller that sets paths or policy across routers</td></tr></table>
<p>They complement each other: SDN or automation connects and steers traffic to VNFs, and NFV supplies the functions. A provider can do one without the other.</p>

<h3>Virtual forwarding performance</h3>
<p>A packet that goes through a hypervisor and virtual switch can be slow. Providers use acceleration techniques so VNFs approach hardware performance.</p>
<ul>
<li><b>DPDK</b>: user-space packet processing that bypasses the standard kernel network stack.</li>
<li><b>SR-IOV</b>: lets a physical network card present virtual functions directly to VMs, bypassing the virtual switch.</li>
<li><b>vhost/virtio paths and virtual switches (for example OVS, VPP)</b>: optimised software switching.</li>
<li><b>CPU pinning, huge pages and NUMA awareness</b>: tuning so a VNF keeps its memory and cores close together.</li>
</ul>
<p>The trade-off: SR-IOV gives speed but limits live migration and flexibility, while a virtual switch gives flexibility at some cost in performance.</p>

<h3>Cisco examples (conceptual)</h3>
<p>Cisco offers virtual routers and VNF platforms across its portfolio. For example, IOS XE virtual routers (Catalyst 8000V, CSR 1000V), an IOS XR virtual router for labs and virtual PE or route-reflector roles, enterprise NFV infrastructure software that runs virtual functions on x86 hardware at branch sites, and orchestration products such as a service orchestrator (NSO) and an elastic services controller for VNF lifecycle. Exact product names, versions and support status change over time, so confirm on the vendor's current documentation. The principle is what the exam tests: where each fits in the ETSI model.</p>

<h3>Where NFV makes sense in the SP network</h3>
<ul>
<li><b>Route reflectors and control-plane functions</b> (virtual RRs): not in the forwarding path, so virtualisation is easy and cheap.</li>
<li><b>Virtual CPE (vCPE)</b>: replace a physical customer router with a VNF at the edge or in the cloud.</li>
<li><b>Virtualised mobile core and RAN functions</b>: cloud-native functions running on Kubernetes.</li>
<li><b>Service chaining</b>: steer traffic through a sequence of VNFs such as firewall then NAT, using SR, VRFs or policy-based routing.</li>
<li><b>Where it fits less well</b>: very high-throughput core forwarding, where purpose-built hardware is still more efficient per watt and per port.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> An operator needs 20 branch firewalls. With appliances: 20 boxes shipped and installed, three weeks lead time. With NFV: one standard server per branch (or a shared server in a regional data centre) running a virtual firewall. The orchestrator creates the VNF, attaches networks and starts it in minutes. If one branch needs more throughput, the VNF manager scales the VNF. If a server fails, the platform can restart the VNF elsewhere. The cost is operating the server platform and orchestration, plus performance tuning.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Treating NFV as only "put the old software in a VM" without addressing performance, licensing and operations; ignoring that failure domains shift to the shared server; and assuming every function suits virtualisation.</p></div>
<div class="exam"><p><b>Exam trap.</b> Map each ETSI block: VNF is the function, NFVI is the infrastructure, MANO is orchestration (NFVO, VNFM, VIM). NFV is about running functions as software; SDN is about control and programmability.</p></div>

<div class="scn"><h4>The virtual firewall that did not reach line rate</h4><p>A provider moved a firewall VNF to a server using a standard virtual switch and saw less than a third of the expected throughput. The cause was the virtual switch path and unpinned cores. After adopting SR-IOV, DPDK in the VNF and CPU pinning, throughput reached the target. They accepted that SR-IOV limited live migration for that VNF.</p><p><b>Lesson:</b> VNF performance is a design decision, not an automatic result.</p></div>

<div class="iv"><p class="q">"Explain the ETSI NFV architecture and how it differs from SDN."</p><p>VNFs are the software functions, NFVI is the compute, storage and network (and virtualisation) they run on, and MANO (NFVO, VNFM, VIM) orchestrates their lifecycle. NFV changes where functions run; SDN changes how the network is controlled. They are complementary.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NFV runs network functions as software on shared infrastructure.</li>
<li>ETSI blocks: VNF, NFVI, MANO (NFVO, VNFM, VIM).</li>
<li>NFV and SDN are different but complementary.</li>
<li>DPDK, SR-IOV, pinning and tuning address virtual performance.</li>
<li>Virtual RRs and vCPE are good fits; high-throughput core forwarding less so.</li>
</ul></div>
`,hi:`
<p>Dashakon tak service provider har function ke liye alag dedicated box kharidta tha: ek routing ke liye, ek firewall ke liye, ek NAT ke liye, ek mobile core ke liye. Har box ka apna hardware, apna refresh cycle aur apna vendor tha. <b>Network functions virtualization (NFV)</b> ek simple sawal poochta hai: in functions ko <b>standard servers par software</b> ke roop mein kyun na chalaya jaaye, jaise IT pehle se virtual machines aur containers mein applications chalata hai? Jawab tez service launch aur behtar resource sharing kholta hai, aur naye design problems bhi laata hai.</p>

<h3>Analogy: dedicated appliances versus smartphone ke apps</h3>
<p>Kabhi aap camera, music player, torch aur map alag alag rakhte the. Ab ek phone har ek ke liye app chalata hai. Phone ka hardware shared hai aur aap minutes mein app install ya remove kar sakte ho. NFV network boxes ke saath yahi karta hai: server phone hai, aur firewall, router tatha gateway apps hain.</p>

<h3>ETSI NFV architecture</h3>
<p>Common reference ETSI NFV framework hai, teen blocks ke saath.</p>
<dl class="terms">
<dt>VNF (virtualised network function)</dt><dd>Function khud software ke roop mein: virtual router, firewall, NAT gateway, virtual BNG, virtual route reflector, ya mobile core function. Jab woh cloud-native aur containerised ho to CNF bhi kehte hain.</dd>
<dt>NFVI (NFV infrastructure)</dt><dd>Servers, storage, network aur virtualisation layer (hypervisor ya container runtime) jis par VNFs chalte hain.</dd>
<dt>MANO (management and orchestration)</dt><dd>Control layer, teen hisson mein: <b>NFV orchestrator (NFVO)</b> network bhar mein services aur resources manage karta hai, <b>VNF manager (VNFM)</b> har VNF ka lifecycle (create, scale, heal, delete) handle karta hai, aur <b>virtualised infrastructure manager (VIM)</b> compute, storage aur network resources control karta hai, jaise OpenStack-style ya Kubernetes-based platform.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="ETSI NFV blocks">
<rect x="20" y="15" width="380" height="55" rx="8" fill="#bbf7d0"/><text x="210" y="38" text-anchor="middle" class="svg-ink" font-size="13">VNFs: vRouter, vFirewall, vBNG, vRR, ...</text><text x="210" y="57" text-anchor="middle" class="svg-muted" font-size="11">software functions, EMS ya element managers ke saath</text>
<rect x="20" y="85" width="380" height="75" rx="8" fill="#bae6fd"/><text x="210" y="108" text-anchor="middle" class="svg-ink" font-size="13">NFVI</text><text x="210" y="128" text-anchor="middle" class="svg-muted" font-size="11">virtual compute, storage, network (hypervisor ya container runtime)</text><text x="210" y="146" text-anchor="middle" class="svg-muted" font-size="11">physical servers, switches, optics</text>
<rect x="430" y="15" width="190" height="145" rx="8" fill="#ddd6fe"/><text x="525" y="38" text-anchor="middle" class="svg-ink" font-size="13">MANO</text><text x="525" y="68" text-anchor="middle" class="svg-muted" font-size="11">NFVO: services</text><text x="525" y="90" text-anchor="middle" class="svg-muted" font-size="11">VNFM: VNF lifecycle</text><text x="525" y="112" text-anchor="middle" class="svg-muted" font-size="11">VIM: infrastructure</text>
<line x1="400" y1="85" x2="430" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">Functions software hain; infrastructure shared; orchestration unhe jodta hai</text>
</svg><p class="cap">ETSI NFV ke teen building blocks.</p></div>

<h3>NFV aur SDN: related lekin alag</h3>
<table class="cmp"><tr><th></th><th>NFV</th><th>SDN</th></tr>
<tr><td>Idea</td><td>Network functions ko shared infrastructure par software ke roop mein chalana</td><td>Control logic ko alag ya centralise karna aur network ko APIs se program karna</td></tr>
<tr><td>Sawal jiska jawab deta hai</td><td>Kya kahan chalta hai, aur kis hardware par?</td><td>Network kaise control aur program hota hai?</td></tr>
<tr><td>Example</td><td>Server par virtual firewall</td><td>Controller jo routers ke across paths ya policy set karta hai</td></tr></table>
<p>Yeh ek-doosre ke poorak hain: SDN ya automation traffic ko VNFs tak jodta aur steer karta hai, aur NFV functions deta hai. Provider ek ke bina doosra kar sakta hai.</p>

<h3>Virtual forwarding performance</h3>
<p>Jo packet hypervisor aur virtual switch se guzarta hai woh slow ho sakta hai. Providers acceleration techniques use karte hain taaki VNFs hardware performance ke kareeb pahunchein.</p>
<ul>
<li><b>DPDK</b>: user-space packet processing jo standard kernel network stack ko bypass karti hai.</li>
<li><b>SR-IOV</b>: physical network card ko virtual functions seedha VMs ko dikhane deta hai, virtual switch ko bypass karke.</li>
<li><b>vhost/virtio paths aur virtual switches (jaise OVS, VPP)</b>: optimised software switching.</li>
<li><b>CPU pinning, huge pages aur NUMA awareness</b>: tuning taaki VNF apni memory aur cores paas rakhe.</li>
</ul>
<p>Trade-off: SR-IOV speed deta hai lekin live migration aur flexibility limit karta hai, jabki virtual switch flexibility deta hai performance ki kuch keemat par.</p>

<h3>Cisco examples (conceptual)</h3>
<p>Cisco apne portfolio mein virtual routers aur VNF platforms deta hai. Jaise IOS XE virtual routers (Catalyst 8000V, CSR 1000V), labs aur virtual PE ya route-reflector roles ke liye IOS XR virtual router, branch sites par x86 hardware par virtual functions chalane wala enterprise NFV infrastructure software, aur VNF lifecycle ke liye service orchestrator (NSO) tatha elastic services controller jaise orchestration products. Exact product names, versions aur support status samay ke saath badalte hain, isliye vendor ki current documentation se confirm karo. Exam jis principle ko test karta hai woh yeh hai: ETSI model mein har ek kahan fit hota hai.</p>

<h3>SP network mein NFV kahan sense banata hai</h3>
<ul>
<li><b>Route reflectors aur control-plane functions</b> (virtual RRs): forwarding path mein nahi, isliye virtualisation aasaan aur sasta.</li>
<li><b>Virtual CPE (vCPE)</b>: physical customer router ko edge ya cloud mein VNF se replace karna.</li>
<li><b>Virtualised mobile core aur RAN functions</b>: Kubernetes par chalne wale cloud-native functions.</li>
<li><b>Service chaining</b>: traffic ko VNFs ke sequence se steer karna, jaise firewall phir NAT, SR, VRFs ya policy-based routing se.</li>
<li><b>Jahan kam fit hota hai</b>: bahut high-throughput core forwarding, jahan purpose-built hardware per watt aur per port abhi bhi zyaada efficient hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Operator ko 20 branch firewalls chahiye. Appliances ke saath: 20 boxes ship aur install, teen hafte lead time. NFV ke saath: har branch par ek standard server (ya regional data centre mein shared server) jo virtual firewall chalata hai. Orchestrator VNF banata hai, networks attach karta hai aur minutes mein start karta hai. Agar ek branch ko zyaada throughput chahiye to VNF manager VNF scale karta hai. Agar server fail ho, platform VNF ko kahin aur restart kar sakta hai. Keemat server platform aur orchestration chalana, plus performance tuning hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> NFV ko sirf "purana software VM mein daalna" samajhna bina performance, licensing aur operations address kiye; yeh ignore karna ki failure domains shared server par shift ho jaate hain; aur yeh maanna ki har function virtualisation ke liye fit hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Har ETSI block map karo: VNF function hai, NFVI infrastructure hai, MANO orchestration hai (NFVO, VNFM, VIM). NFV functions ko software ke roop mein chalane ke baare mein hai; SDN control aur programmability ke baare mein.</p></div>

<div class="scn"><h4>Virtual firewall jo line rate tak nahi pahuncha</h4><p>Provider ne firewall VNF ko standard virtual switch wale server par move kiya aur expected throughput ka tihai se kam dekha. Wajah virtual switch path aur unpinned cores the. SR-IOV, VNF mein DPDK aur CPU pinning apnane ke baad throughput target tak pahuncha. Unhone maana ki SR-IOV ne us VNF ki live migration limit kar di.</p><p><b>Lesson:</b> VNF performance design decision hai, automatic result nahi.</p></div>

<div class="iv"><p class="q">"ETSI NFV architecture samjhao aur yeh SDN se kaise alag hai."</p><p>VNFs software functions hain, NFVI compute, storage aur network (aur virtualisation) hai jis par woh chalte hain, aur MANO (NFVO, VNFM, VIM) unka lifecycle orchestrate karta hai. NFV badalta hai ki functions kahan chalte hain; SDN badalta hai ki network kaise control hota hai. Yeh poorak hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NFV network functions ko shared infrastructure par software ke roop mein chalata hai.</li>
<li>ETSI blocks: VNF, NFVI, MANO (NFVO, VNFM, VIM).</li>
<li>NFV aur SDN alag lekin poorak hain.</li>
<li>DPDK, SR-IOV, pinning aur tuning virtual performance address karte hain.</li>
<li>Virtual RRs aur vCPE achhe fit hain; high-throughput core forwarding kam.</li>
</ul></div>
`}};export{e as default};