var e={id:`junos-overview`,h:{en:`What Junos OS is and what you will learn`,hi:`Junos OS kya hai aur aap kya seekhoge`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a Junos device is built inside: the Routing Engine (RE) that thinks, the Packet Forwarding Engine (PFE) that moves packets, why the routing table and the forwarding table are different things, which packets are transit traffic and which are exception traffic, and how a loopback (lo0) firewall filter protects the RE. Two labs make it real: you protect router R2 with a lo0 filter and prove with counters which traffic reaches the RE, and you watch a floating static route take over when a primary link fails.</p>
<p><b>Prerequisites.</b> Modules "Networking and Junos from zero" and "Networking fundamentals" (addressing, longest match). You should be comfortable with <code>configure</code>, <code>set</code>, <code>commit</code> and <code>show route</code>.</p>

<h3>An analogy: an airport</h3>
<p>Picture a busy airport. The <b>control tower</b> studies maps and weather, and decides which plane uses which runway. The <b>runways and ground crew</b> actually move the planes at high speed. If the tower is busy with a long meeting about new schedules, planes already cleared keep landing and taking off. In a Junos device the control tower is the <b>Routing Engine</b> and the runways are the <b>Packet Forwarding Engine</b>. This separation is the single most important idea in Junos.</p>

<h3>What Junos OS is</h3>
<p><b>Junos OS</b> is the operating system of Juniper routers, switches and firewalls (MX, PTX, SRX, EX, QFX, vMX and more). It is built on a hardened Unix-like kernel with a modular design: each function, such as routing protocols, configuration management or interface control, runs as a separate protected <b>process</b> (daemon) with its own memory. A crash in one process does not take down the rest, and the kernel can restart it. One code base, one CLI and one configuration style run on all platforms, so the skills transfer. Some newer platforms run Junos OS Evolved, a Linux-based variant with the same CLI.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Junos device: RE and PFE">
<rect x="20" y="20" width="600" height="95" rx="10" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">Routing Engine (RE) - control plane</text>
<rect x="40" y="55" width="110" height="45" rx="6" fill="#fff"/><text x="95" y="82" text-anchor="middle" class="svg-ink" font-size="12">rpd routing</text>
<rect x="165" y="55" width="110" height="45" rx="6" fill="#fff"/><text x="220" y="82" text-anchor="middle" class="svg-ink" font-size="12">mgd CLI/config</text>
<rect x="290" y="55" width="110" height="45" rx="6" fill="#fff"/><text x="345" y="82" text-anchor="middle" class="svg-ink" font-size="12">chassisd, dcd</text>
<rect x="415" y="55" width="190" height="45" rx="6" fill="#fff"/><text x="510" y="82" text-anchor="middle" class="svg-ink" font-size="12">routing tables, config, logs</text>
<line x1="320" y1="115" x2="320" y2="150" stroke="#64748b" stroke-width="3"/><text x="335" y="138" class="svg-accent" font-size="12">internal link: forwarding table copy, exception traffic</text>
<rect x="20" y="150" width="600" height="65" rx="10" fill="#bae6fd"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="14">Packet Forwarding Engine (PFE) - forwarding plane</text><text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="12">forwarding table, filters, policers, queues, line-rate lookups</text>
</svg><p class="cap">Two cooperating planes inside every Junos device, joined by an internal link.</p></div>

<h3>Why Juniper separated the planes</h3>
<ul><li><b>Stability:</b> a CPU spike on the RE, such as a large commit or an OSPF recalculation, does not slow forwarding.</li>
<li><b>Speed:</b> the PFE uses specialised hardware (ASICs) or an optimised software engine for line-rate lookups.</li>
<li><b>Resilience:</b> if the RE restarts a process, the PFE keeps forwarding using the last good forwarding table. Platforms with two REs can fail over (GRES and NSR, covered in later tracks).</li>
<li><b>Security:</b> the RE is small and precious, so we protect it with filters.</li></ul>

<div class="eg"><p><b>Worked example.</b> A router has 1,000 routes learned from OSPF. When a link flaps, <code>rpd</code> on the RE recalculates and pushes the changed next hops to the PFE. While it calculates, packets already matched by existing forwarding entries keep flowing at line rate. Users notice at most a brief reconvergence, not a router freeze.</p></div>

<h3>Seeing it on the box</h3>
<pre class="out">lab@R2-AGG&gt; show version
Hostname: R2-AGG
Model: vmx
Junos: 23.4R1.10
JUNOS OS Kernel 64-bit  [20231218.xxxxxxx_builder_stable_12]
JUNOS Routing Software Suite [23.4R1.10]</pre>
<p>Your lab output may show a different release; the structure is what matters: the kernel, the routing software suite and the host name.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Believing that "the router" is one brain. Slow SSH or a slow <code>show</code> command is an RE problem. Dropped user traffic with an idle RE is a PFE or link problem. Knowing which plane is involved tells you where to look.</p></div>

<div class="scn"><h4>Busy CPU, calm network</h4><p>A network operations team got an alert: the RE CPU of a core router was at 90 percent during a big configuration load. Managers feared an outage, but ping and throughput tests across the router were perfect. The engineer explained that the RE was busy with a commit and route recalculation while the PFE kept forwarding. By morning the CPU had settled and no user was affected.</p><p><b>Lesson:</b> control plane load and forwarding plane health are separate things.</p></div>

<div class="iv"><p class="q">"Describe the Junos architecture in a minute."</p><p>Strong answer: Junos separates the control plane (Routing Engine: rpd, mgd, routing tables, configuration) from the forwarding plane (Packet Forwarding Engine: forwarding table copy, filters, queues). Transit traffic is forwarded by the PFE alone; only exception traffic, such as packets to the router or protocol packets, goes to the RE. Mention modular daemons and that a busy RE does not stop forwarding.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Junos is modular: separate protected processes (rpd, mgd, chassisd, dcd and more).</li>
<li>The Routing Engine is the control plane; the Packet Forwarding Engine is the forwarding plane.</li>
<li>An internal link joins them: the RE sends the forwarding table, the PFE punts exception traffic.</li>
<li>A busy RE does not stop transit forwarding.</li>
<li>The same Junos skills apply across MX, PTX, SRX, EX, QFX and virtual devices.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki Junos device andar se kaise bana hai: Routing Engine (RE) jo sochta hai, Packet Forwarding Engine (PFE) jo packets chalata hai, routing table aur forwarding table alag cheezein kyun hain, kaun se packets transit traffic hain aur kaun se exception traffic, aur loopback (lo0) firewall filter RE ko kaise bachata hai. Do labs ise asli banate hain: aap router R2 ko lo0 filter se protect karte ho aur counters se saabit karte ho ki kaunsa traffic RE tak pahunchta hai, aur primary link fail hone par floating static route ko control sambhalte dekhte ho.</p>
<p><b>Prerequisites.</b> Modules "Networking and Junos from zero" aur "Networking fundamentals" (addressing, longest match). Aapko <code>configure</code>, <code>set</code>, <code>commit</code> aur <code>show route</code> mein comfortable hona chahiye.</p>

<h3>Analogy: ek airport</h3>
<p>Ek busy airport socho. <b>Control tower</b> maps aur mausam dekhta hai, aur tay karta hai kaunsa plane kaunsa runway use karega. <b>Runways aur ground crew</b> planes ko asal mein tez raftaar se chalate hain. Tower lambi meeting mein busy ho to bhi jinhe clearance mil chuka hai woh planes land aur take off karte rehte hain. Junos device mein control tower <b>Routing Engine</b> hai aur runways <b>Packet Forwarding Engine</b>. Yeh alag-alag hona Junos ka sabse zaroori idea hai.</p>

<h3>Junos OS kya hai</h3>
<p><b>Junos OS</b> Juniper routers, switches aur firewalls (MX, PTX, SRX, EX, QFX, vMX aur aur) ka operating system hai. Yeh ek mazboot Unix-jaise kernel par bana hai aur modular design ka hai: har function, jaise routing protocols, configuration management ya interface control, ek alag protected <b>process</b> (daemon) ke roop mein apni memory ke saath chalta hai. Ek process crash ho to baaki nahi girte, aur kernel use restart kar sakta hai. Ek code base, ek CLI aur ek configuration style sab platforms par chalta hai, isliye skills transfer hoti hain. Kuch naye platforms Junos OS Evolved chalate hain, jo Linux-based variant hai aur CLI wahi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Junos device: RE aur PFE">
<rect x="20" y="20" width="600" height="95" rx="10" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">Routing Engine (RE) - control plane</text>
<rect x="40" y="55" width="110" height="45" rx="6" fill="#fff"/><text x="95" y="82" text-anchor="middle" class="svg-ink" font-size="12">rpd routing</text>
<rect x="165" y="55" width="110" height="45" rx="6" fill="#fff"/><text x="220" y="82" text-anchor="middle" class="svg-ink" font-size="12">mgd CLI/config</text>
<rect x="290" y="55" width="110" height="45" rx="6" fill="#fff"/><text x="345" y="82" text-anchor="middle" class="svg-ink" font-size="12">chassisd, dcd</text>
<rect x="415" y="55" width="190" height="45" rx="6" fill="#fff"/><text x="510" y="82" text-anchor="middle" class="svg-ink" font-size="12">routing tables, config, logs</text>
<line x1="320" y1="115" x2="320" y2="150" stroke="#64748b" stroke-width="3"/><text x="335" y="138" class="svg-accent" font-size="12">internal link: forwarding table copy, exception traffic</text>
<rect x="20" y="150" width="600" height="65" rx="10" fill="#bae6fd"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="14">Packet Forwarding Engine (PFE) - forwarding plane</text><text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="12">forwarding table, filters, policers, queues, line-rate lookups</text>
</svg><p class="cap">Har Junos device ke andar do cooperating planes, ek internal link se jude hue.</p></div>

<h3>Juniper ne planes alag kyun kiye</h3>
<ul><li><b>Stability:</b> RE par CPU spike, jaise bada commit ya OSPF recalculation, forwarding ko slow nahi karta.</li>
<li><b>Speed:</b> PFE specialised hardware (ASICs) ya optimised software engine se line-rate lookups karta hai.</li>
<li><b>Resilience:</b> RE kisi process ko restart kare to PFE aakhri achhi forwarding table se forwarding chalata rehta hai. Do REs wale platforms failover kar sakte hain (GRES aur NSR, aage ke tracks mein).</li>
<li><b>Security:</b> RE chhota aur keemti hai, isliye hum use filters se protect karte hain.</li></ul>

<div class="eg"><p><b>Worked example.</b> Router ke paas OSPF se seekhe 1,000 routes hain. Link flap hone par RE par <code>rpd</code> recalculate karke badle hue next hops PFE ko bhejta hai. Calculate karte waqt jin packets ke liye forwarding entries maujood hain woh line rate par chalte rehte hain. Users ko zyada se zyada thodi der ka reconvergence dikhta hai, router freeze nahi hota.</p></div>

<h3>Box par dekhna</h3>
<pre class="out">lab@R2-AGG&gt; show version
Hostname: R2-AGG
Model: vmx
Junos: 23.4R1.10
JUNOS OS Kernel 64-bit  [20231218.xxxxxxx_builder_stable_12]
JUNOS Routing Software Suite [23.4R1.10]</pre>
<p>Aapke lab ka output alag release dikha sakta hai; structure matter karta hai: kernel, routing software suite aur host name.</p>

<div class="warn"><p><b>Common beginner mistake.</b> "Router" ko ek hi dimaag maan lena. SSH ya <code>show</code> command ka dheema hona RE ki problem hai. RE khaali ho aur user traffic drop ho raha ho to PFE ya link ki problem hai. Kaunsa plane involved hai yeh jaanne se pata chalta hai kahan dekhna hai.</p></div>

<div class="scn"><h4>Busy CPU, shaant network</h4><p>Network operations team ko alert mila: bade configuration load ke dauran core router ka RE CPU 90 percent tha. Managers ko outage ka darr tha, lekin router ke aar-paar ping aur throughput tests bilkul theek the. Engineer ne samjhaya ki RE commit aur route recalculation mein busy tha jabki PFE forwarding chalata raha. Subah tak CPU settle ho gaya aur kisi user par asar nahi hua.</p><p><b>Lesson:</b> control plane load aur forwarding plane health alag cheezein hain.</p></div>

<div class="iv"><p class="q">"Junos architecture ek minute mein batao."</p><p>Strong answer: Junos control plane (Routing Engine: rpd, mgd, routing tables, configuration) ko forwarding plane (Packet Forwarding Engine: forwarding table copy, filters, queues) se alag karta hai. Transit traffic sirf PFE forward karta hai; sirf exception traffic, jaise router ko jaane wale ya protocol packets, RE tak jaata hai. Modular daemons ka zikr karo aur yeh ki busy RE forwarding nahi rokta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Junos modular hai: alag protected processes (rpd, mgd, chassisd, dcd aur aur).</li>
<li>Routing Engine control plane hai; Packet Forwarding Engine forwarding plane.</li>
<li>Internal link dono ko jodta hai: RE forwarding table bhejta hai, PFE exception traffic punt karta hai.</li>
<li>Busy RE transit forwarding nahi rokta.</li>
<li>Wahi Junos skills MX, PTX, SRX, EX, QFX aur virtual devices par lagti hain.</li>
</ul></div>
`}};export{e as default};