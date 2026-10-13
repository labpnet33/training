var e={id:`juniper-product-map`,h:{en:`The Juniper product map: EX, QFX, MX, SRX, PTX and Mist`,hi:`Juniper product map: EX, QFX, MX, SRX, PTX aur Mist`},body:{en:`
<p>Juniper product names look like alphabet soup. Each family has one job, and once you know the job the name sticks. The exam expects you to recognise where each family sits, and interviewers love "which Juniper box would you use for...?" questions.</p>

<h3>The families in one view</h3>
<table class="cmp"><tr><th>Family</th><th>Job</th><th>Where you see it</th></tr>
<tr><td><b>EX Series</b></td><td>Ethernet switches for campus, branch and access</td><td>Office floors, wiring closets, small server rooms</td></tr>
<tr><td><b>QFX Series</b></td><td>Data center switches, high speed (10G up to 400G)</td><td>Top-of-rack and spine in data centers</td></tr>
<tr><td><b>MX Series</b></td><td>Universal routers for edge, WAN and service provider</td><td>Internet edge, metro, peering, enterprise WAN</td></tr>
<tr><td><b>PTX Series</b></td><td>Packet transport routers for very large cores</td><td>Provider backbones, 100G/400G core links</td></tr>
<tr><td><b>ACX Series</b></td><td>Compact access and aggregation routers</td><td>Mobile backhaul, cell sites, metro access</td></tr>
<tr><td><b>SRX Series</b></td><td>Firewalls with routing, NAT, VPN and security services</td><td>Internet perimeter, branch, data center edge</td></tr>
<tr><td><b>Mist AI</b></td><td>Cloud-managed Wi-Fi, wired and WAN assurance with AI</td><td>Offices and campuses managed from a cloud dashboard</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Where Juniper families sit in a network">
<rect x="230" y="10" width="180" height="36" rx="18" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Internet / WAN</text>
<rect x="250" y="66" width="140" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">MX / PTX routers</text>
<rect x="250" y="120" width="140" height="36" rx="8" fill="#fed7aa"/><text x="320" y="143" text-anchor="middle" class="svg-ink" font-size="13">SRX firewall</text>
<rect x="60" y="190" width="150" height="46" rx="8" fill="#bae6fd"/><text x="135" y="210" text-anchor="middle" class="svg-ink" font-size="13">EX switches</text><text x="135" y="226" text-anchor="middle" class="svg-muted" font-size="12">campus / branch</text>
<rect x="245" y="190" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">QFX switches</text><text x="320" y="226" text-anchor="middle" class="svg-muted" font-size="12">data center</text>
<rect x="430" y="190" width="150" height="46" rx="8" fill="#fde68a"/><text x="505" y="210" text-anchor="middle" class="svg-ink" font-size="13">Mist APs</text><text x="505" y="226" text-anchor="middle" class="svg-muted" font-size="12">Wi-Fi, cloud managed</text>
<line x1="320" y1="46" x2="320" y2="66" stroke="#64748b" stroke-width="2"/><line x1="320" y1="102" x2="320" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="300" y1="156" x2="135" y2="190" stroke="#64748b" stroke-width="2"/><line x1="320" y1="156" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><line x1="340" y1="156" x2="505" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A simplified network. Routers face the outside, the firewall protects, switches and access points serve users and servers.</p></div>

<h3>One OS, many boxes</h3>
<p>EX, QFX, MX, PTX, ACX and SRX all run <b>Junos OS</b> (some data center and campus models also run Junos OS Evolved, a Linux-based variant used on PTX and some QFX). The configuration language is the same. A <code>set interfaces ... unit 0 family inet address</code> line works on a branch switch and on a core router. Differences are in hardware, scale and features: an EX2300 has a few dozen 1G ports, a PTX can forward many terabits.</p>
<p>You may also meet <b>virtual</b> Junos: vMX (virtual router), vSRX (virtual firewall) and vJunos images used in labs. This simulator behaves like those: same CLI, no hardware.</p>

<h3>Naming hints</h3>
<p>Interface names show the hardware: <code>ge-</code> is Gigabit Ethernet, <code>xe-</code> is 10G, <code>et-</code> is 25G or faster, followed by <code>fpc/pic/port</code> such as <code>ge-0/0/1</code>. Special interfaces include <code>lo0</code> (loopback), <code>irb</code> (routed VLAN interface), <code>me0</code> or <code>fxp0</code> (out-of-band management) and <code>ae0</code> (aggregated Ethernet).</p>

<div class="eg"><p><b>Worked example.</b> A company with a head office, ten branches and a small data center. Head office edge: two MX routers. Perimeter: SRX firewalls. Office floors: EX switches with Mist access points. Data center: QFX leaf and spine switches. Branches: one SRX each as router and firewall. One OS family covers all of it, so one team can run everything.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Mixing up EX and QFX. A simple rule: EX serves people (campus), QFX serves servers (data center). Another trap: assuming an SRX is "only a firewall". It also routes, does NAT and VPN.</p></div>

<div class="exam"><p><b>Exam trap.</b> JNCIA-Junos asks which platform fits which role and what the interface naming means. It does not ask for part numbers, but knowing SRX = security and MX = routing helps.</p></div>

<div class="scn"><h4>Picking the right box for a school</h4><p>A school group with 40 classrooms asked for an upgrade. The proposal listed QFX switches for classrooms. A consultant pointed out that QFX is built for the data center and is overkill and over-priced for access. They switched to EX switches with PoE for access points, one SRX at the internet edge and Mist for Wi-Fi visibility. Same Junos, lower cost, easier management.</p><p><b>Lesson:</b> match the family to the role: access and campus EX, data center QFX, edge routing MX, security SRX.</p></div>

<div class="iv"><p class="q">"What is the difference between EX, QFX, MX and SRX?"</p><p>EX is campus and branch switching, QFX is data center switching, MX is the multi-service edge and WAN router, SRX is security (firewall, NAT, VPN, with routing). Add that all run Junos OS with the same CLI, which makes skills portable, and mention Mist as the cloud-managed AI-driven wireless and wired layer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EX = campus/branch switches; QFX = data center switches.</li>
<li>MX = edge and WAN routers; PTX = very large core routers; ACX = access and aggregation.</li>
<li>SRX = firewall with routing, NAT and VPN; Mist = cloud-managed AI-driven Wi-Fi and wired.</li>
<li>All run Junos OS (or Junos OS Evolved), so the CLI skills transfer.</li>
<li>Interface names: ge, xe, et plus fpc/pic/port; lo0, irb, fxp0/me0, ae0 are special.</li>
</ul></div>
`,hi:`
<p>Juniper product ke naam alphabet soup jaise lagte hain. Har family ka ek kaam hai, aur kaam pata ho to naam yaad rehta hai. Exam mein expected hai ki aap pehchano har family kahan baithti hai, aur interviewers "kaunsa Juniper box use karoge...?" wale sawal bahut poochte hain.</p>

<h3>Ek nazar mein families</h3>
<table class="cmp"><tr><th>Family</th><th>Kaam</th><th>Kahan milta hai</th></tr>
<tr><td><b>EX Series</b></td><td>Campus, branch aur access ke liye Ethernet switches</td><td>Office floors, wiring closets, chhote server rooms</td></tr>
<tr><td><b>QFX Series</b></td><td>Data center switches, high speed (10G se 400G)</td><td>Data centers mein top-of-rack aur spine</td></tr>
<tr><td><b>MX Series</b></td><td>Edge, WAN aur service provider ke liye universal routers</td><td>Internet edge, metro, peering, enterprise WAN</td></tr>
<tr><td><b>PTX Series</b></td><td>Bahut bade core ke liye packet transport routers</td><td>Provider backbones, 100G/400G core links</td></tr>
<tr><td><b>ACX Series</b></td><td>Compact access aur aggregation routers</td><td>Mobile backhaul, cell sites, metro access</td></tr>
<tr><td><b>SRX Series</b></td><td>Routing, NAT, VPN aur security services wale firewalls</td><td>Internet perimeter, branch, data center edge</td></tr>
<tr><td><b>Mist AI</b></td><td>Cloud-managed Wi-Fi, wired aur WAN assurance AI ke saath</td><td>Offices aur campuses jo cloud dashboard se manage hote hain</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Network mein Juniper families kahan baithti hain">
<rect x="230" y="10" width="180" height="36" rx="18" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Internet / WAN</text>
<rect x="250" y="66" width="140" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">MX / PTX routers</text>
<rect x="250" y="120" width="140" height="36" rx="8" fill="#fed7aa"/><text x="320" y="143" text-anchor="middle" class="svg-ink" font-size="13">SRX firewall</text>
<rect x="60" y="190" width="150" height="46" rx="8" fill="#bae6fd"/><text x="135" y="210" text-anchor="middle" class="svg-ink" font-size="13">EX switches</text><text x="135" y="226" text-anchor="middle" class="svg-muted" font-size="12">campus / branch</text>
<rect x="245" y="190" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">QFX switches</text><text x="320" y="226" text-anchor="middle" class="svg-muted" font-size="12">data center</text>
<rect x="430" y="190" width="150" height="46" rx="8" fill="#fde68a"/><text x="505" y="210" text-anchor="middle" class="svg-ink" font-size="13">Mist APs</text><text x="505" y="226" text-anchor="middle" class="svg-muted" font-size="12">Wi-Fi, cloud managed</text>
<line x1="320" y1="46" x2="320" y2="66" stroke="#64748b" stroke-width="2"/><line x1="320" y1="102" x2="320" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="300" y1="156" x2="135" y2="190" stroke="#64748b" stroke-width="2"/><line x1="320" y1="156" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><line x1="340" y1="156" x2="505" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek simplified network. Routers bahar ki taraf, firewall suraksha, switches aur access points users aur servers ko serve karte hain.</p></div>

<h3>Ek OS, kai boxes</h3>
<p>EX, QFX, MX, PTX, ACX aur SRX sab <b>Junos OS</b> par chalte hain (kuch data center aur campus models Junos OS Evolved bhi chalate hain, jo Linux-based variant hai aur PTX tatha kuch QFX par use hota hai). Configuration language wahi hai. <code>set interfaces ... unit 0 family inet address</code> line branch switch par bhi chalti hai aur core router par bhi. Fark hardware, scale aur features mein hai: EX2300 mein kuch dozen 1G ports hote hain, PTX kai terabits forward kar sakta hai.</p>
<p>Aapko <b>virtual</b> Junos bhi milega: vMX (virtual router), vSRX (virtual firewall) aur labs mein use hone wali vJunos images. Yeh simulator unhi ki tarah behave karta hai: wahi CLI, bina hardware.</p>

<h3>Naming ke hints</h3>
<p>Interface ke naam hardware batate hain: <code>ge-</code> Gigabit Ethernet hai, <code>xe-</code> 10G, <code>et-</code> 25G ya usse tez, uske baad <code>fpc/pic/port</code> jaise <code>ge-0/0/1</code>. Special interfaces mein <code>lo0</code> (loopback), <code>irb</code> (routed VLAN interface), <code>me0</code> ya <code>fxp0</code> (out-of-band management) aur <code>ae0</code> (aggregated Ethernet) aate hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek company jiska head office, das branches aur chhota data center hai. Head office edge: do MX routers. Perimeter: SRX firewalls. Office floors: EX switches aur Mist access points. Data center: QFX leaf aur spine switches. Branches: har ek mein ek SRX, router aur firewall dono ke roop mein. Ek OS family sab cover karti hai, isliye ek hi team sab chala sakti hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> EX aur QFX ko mila dena. Simple rule: EX logon ko serve karta hai (campus), QFX servers ko (data center). Ek aur jaal: SRX ko "sirf firewall" maan lena. Yeh route bhi karta hai, NAT aur VPN bhi.</p></div>

<div class="exam"><p><b>Exam trap.</b> JNCIA-Junos poochta hai ki kaunsa platform kis role mein fit hota hai aur interface naming ka matlab kya hai. Part numbers nahi poochta, lekin SRX = security aur MX = routing jaanna madad karta hai.</p></div>

<div class="scn"><h4>School ke liye sahi box chunna</h4><p>40 classrooms wale ek school group ne upgrade maanga. Proposal mein classrooms ke liye QFX switches the. Ek consultant ne bataya ki QFX data center ke liye bana hai aur access ke liye zaroorat se zyada aur mehnga hai. Unhone access points ke liye PoE wale EX switches, internet edge par ek SRX aur Wi-Fi visibility ke liye Mist chuna. Wahi Junos, kam cost, aasaan management.</p><p><b>Lesson:</b> family ko role se match karo: access aur campus EX, data center QFX, edge routing MX, security SRX.</p></div>

<div class="iv"><p class="q">"EX, QFX, MX aur SRX mein kya fark hai?"</p><p>EX campus aur branch switching hai, QFX data center switching, MX multi-service edge aur WAN router, SRX security (firewall, NAT, VPN, routing ke saath). Jodo ki sab Junos OS par chalte hain aur CLI same hai, to skills portable hain, aur Mist ka zikr karo jo cloud-managed AI-driven wireless aur wired layer hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EX = campus/branch switches; QFX = data center switches.</li>
<li>MX = edge aur WAN routers; PTX = bahut bade core routers; ACX = access aur aggregation.</li>
<li>SRX = routing, NAT aur VPN wala firewall; Mist = cloud-managed AI-driven Wi-Fi aur wired.</li>
<li>Sab Junos OS (ya Junos OS Evolved) chalate hain, isliye CLI skills transfer hoti hain.</li>
<li>Interface naam: ge, xe, et plus fpc/pic/port; lo0, irb, fxp0/me0, ae0 special hain.</li>
</ul></div>
`}};export{e as default};