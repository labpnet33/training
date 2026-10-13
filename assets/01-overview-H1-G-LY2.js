var e={id:`overview`,h:{en:`Two SD-WAN options from Palo Alto Networks: what you will learn and the big picture`,hi:`Palo Alto Networks ke do SD-WAN options: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> Palo Alto Networks offers SD-WAN in two forms. <b>Prisma SD-WAN</b> uses dedicated ION devices and a cloud controller. <b>PAN-OS SD-WAN</b> adds SD-WAN to a next-generation firewall, managed by Panorama (and, in newer releases, Strata Cloud Manager). This module teaches the second one in detail (link tags, SD-WAN interface profiles, path quality profiles, traffic distribution profiles, SaaS monitoring, VPN clusters and the Panorama workflow), then compares both, so that you can choose between them and answer exam questions that mix the two.</p>
<div class="note"><p><b>Note.</b> <b>Honest note about the simulator.</b> The NK-OS simulator does not model the Prisma SD-WAN portal, ION devices or PAN-OS SD-WAN, so this module has no labs. Each portal walk-through is labelled <b>Portal walk-through (not run in the simulator)</b> and each CLI or configuration listing is labelled <b>Reference configuration (not run in the simulator)</b>. I use only portal paths, field names and commands that appear in the Palo Alto Networks documentation; where I could not verify a detail I describe it in words and show no invented output.</p></div>
<p><b>Prerequisites.</b> Read <b>psd-start</b>. If you know PAN-OS (zones, virtual routers, IPsec tunnels, Panorama templates) you will find PAN-OS SD-WAN familiar. If you only know Prisma SD-WAN, read the PAN-OS parts slowly, because the vocabulary is different.</p>
<h3>Analogy: upgrading a shop versus opening a new kind of shop</h3>
<p>PAN-OS SD-WAN is like adding a delivery counter to a shop you already run: the same building (the firewall), the same staff skills, a new service on top. Prisma SD-WAN is like opening a purpose-built delivery depot: new equipment (ION), a new control room (the controller) and a design made around delivery from day one. Both deliver parcels; the cost, the skills and the growth path differ.</p>
<h3>The two options side by side</h3>
<table class="cmp"><tr><th>Item</th><th>PAN-OS SD-WAN</th><th>Prisma SD-WAN</th></tr>
<tr><td>Edge device</td><td>Next-generation firewall running PAN-OS</td><td>ION device (physical or virtual)</td></tr>
<tr><td>Management</td><td>Panorama with the SD-WAN plugin; newer releases also Strata Cloud Manager</td><td>Cloud management plane and portal</td></tr>
<tr><td>Core idea</td><td>Virtual SD-WAN interface grouping physical links, steered by SD-WAN policy rules</td><td>Application fabric with path, QoS, performance, security and NAT policy stacks</td></tr>
<tr><td>Link grouping</td><td>Link tags on interfaces through SD-WAN interface profiles</td><td>Circuit categories and labels</td></tr>
<tr><td>Quality control</td><td>Path quality profiles and traffic distribution profiles</td><td>Performance policy and path policy</td></tr>
<tr><td>Typical fit</td><td>Firewall estate already on PAN-OS that needs SD-WAN features</td><td>Large branch estates that want a purpose-built SD-WAN</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Two SD-WAN options">
<rect x="10" y="10" width="290" height="230" rx="12" fill="#e0f2fe"/><text x="155" y="35" text-anchor="middle" class="svg-ink" font-size="14">PAN-OS SD-WAN</text>
<rect x="30" y="55" width="250" height="40" rx="8" fill="#fff"/><text x="155" y="80" text-anchor="middle" class="svg-ink" font-size="12">Panorama + SD-WAN plugin</text>
<rect x="30" y="110" width="250" height="40" rx="8" fill="#fff"/><text x="155" y="135" text-anchor="middle" class="svg-ink" font-size="12">NGFW hub / NGFW branch</text>
<rect x="30" y="165" width="250" height="55" rx="8" fill="#fff"/><text x="155" y="188" text-anchor="middle" class="svg-ink" font-size="12">sdwan.1 virtual interface</text><text x="155" y="206" text-anchor="middle" class="svg-muted" font-size="11">link tags + profiles + rules</text>
<rect x="340" y="10" width="290" height="230" rx="12" fill="#dcfce7"/><text x="485" y="35" text-anchor="middle" class="svg-ink" font-size="14">Prisma SD-WAN</text>
<rect x="360" y="55" width="250" height="40" rx="8" fill="#fff"/><text x="485" y="80" text-anchor="middle" class="svg-ink" font-size="12">Cloud controller and portal</text>
<rect x="360" y="110" width="250" height="40" rx="8" fill="#fff"/><text x="485" y="135" text-anchor="middle" class="svg-ink" font-size="12">ION branch / ION data center</text>
<rect x="360" y="165" width="250" height="55" rx="8" fill="#fff"/><text x="485" y="188" text-anchor="middle" class="svg-ink" font-size="12">Application fabric</text><text x="485" y="206" text-anchor="middle" class="svg-muted" font-size="11">policy sets and stacks</text>
</svg><p class="cap">Two products, one goal: application-aware use of several WAN links.</p></div>
<h3>What the exam asks</h3>
<p>The exam spreads its five domains across the products. You must know the vocabulary of both, recognise which product a question describes, and avoid mixing the terms. For example, a link tag and a circuit label are not the same thing, and a path quality profile is not a performance policy, although both define what "good enough" means.</p>
<h3>Plan of this module</h3>
<ol>
<li>PAN-OS SD-WAN architecture, roles and licensing.</li>
<li>Link tags, SD-WAN interface profiles and the sdwan.1 virtual interface.</li>
<li>Path quality profiles and traffic distribution profiles.</li>
<li>SD-WAN policy rules, SaaS monitoring and error correction.</li>
<li>VPN clusters and the Panorama workflow.</li>
<li>CLI and a troubleshooting workflow.</li>
<li>Prisma SD-WAN compared, with when to choose which.</li>
<li>Summary and exam checklist.</li>
</ol>
<div class="warn"><p><b>Common mistake.</b> Treating the two products as the same with different names. They share a goal and some ideas (application awareness, path selection on measured quality), but the objects, management plane and operations differ.</p></div>
<div class="exam"><p><b>Exam trap.</b> A question may describe "link tags and a traffic distribution profile" and offer ION or circuit-label answers. The words give the product away: link tags and traffic distribution profiles are PAN-OS SD-WAN terms.</p></div>
<div class="scn"><h4>The firewall estate that wants SD-WAN</h4><p>Harbor Foods already runs PAN-OS firewalls at 40 stores, managed by Panorama. Management asks whether to buy ION devices. The first question is not the product but the need: if the stores only need two-ISP failover and application steering, PAN-OS SD-WAN may be enough; if they want large-scale uniform branches with the Prisma SD-WAN operations model, ION is worth evaluating. Decide on requirements, then product.</p></div>
<div class="iv"><p class="q">"What is the difference between PAN-OS SD-WAN and Prisma SD-WAN?"</p><p>PAN-OS SD-WAN is an SD-WAN feature set on a next-generation firewall, managed through Panorama and its SD-WAN plugin. Prisma SD-WAN uses ION devices and a cloud management plane. Both steer applications over several links using measured path quality, but they use different objects, and the choice depends on the existing estate, the scale and the operations model.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Two products: PAN-OS SD-WAN (firewall plus Panorama plugin) and Prisma SD-WAN (ION plus cloud).</li>
<li>Learn each product's own vocabulary and do not mix it.</li>
<li>The simulator does not model either; study with diagrams and reference listings.</li>
<li>Choose by requirements, estate and operations model.</li>
</ul></div>
`,hi:`
<p><b>Is module mein kya seekhoge.</b> Palo Alto Networks SD-WAN do roop mein deta hai. <b>Prisma SD-WAN</b> dedicated ION devices aur cloud controller use karta hai. <b>PAN-OS SD-WAN</b> next-generation firewall mein SD-WAN jodta hai, jo Panorama (aur naye releases mein Strata Cloud Manager) se manage hota hai. Yeh module doosre ko detail mein sikhata hai (link tags, SD-WAN interface profiles, path quality profiles, traffic distribution profiles, SaaS monitoring, VPN clusters aur Panorama workflow), phir dono ki tulna karta hai, taaki aap unmein se chun sako aur wo exam sawal solve kar sako jo dono ko mila dete hain.</p>
<div class="note"><p><b>Note.</b> <b>Simulator ke baare mein imaandaar note.</b> NK-OS simulator Prisma SD-WAN portal, ION devices ya PAN-OS SD-WAN ko model nahi karta, isliye is module mein labs nahi hain. Har portal walk-through ko <b>Portal walk-through (not run in the simulator)</b> label diya gaya hai aur har CLI ya configuration listing ko <b>Reference configuration (not run in the simulator)</b>. Main sirf wohi portal paths, field names aur commands use karta hoon jo Palo Alto Networks documentation mein hain; jahan detail verify nahi kar paya wahan use shabdon mein describe karta hoon aur koi invented output nahi dikhata.</p></div>
<p><b>Prerequisites.</b> <b>psd-start</b> padho. Agar PAN-OS (zones, virtual routers, IPsec tunnels, Panorama templates) jaante ho to PAN-OS SD-WAN jaana-pehchana lagega. Agar sirf Prisma SD-WAN jaante ho to PAN-OS ke hisse dheere padho, kyunki vocabulary alag hai.</p>
<h3>Analogy: dukaan ko upgrade karna versus nayi tarah ki dukaan kholna</h3>
<p>PAN-OS SD-WAN aisa hai jaise jo dukaan chala rahe ho usme delivery counter jod do: wahi building (firewall), wahi staff skills, upar ek nayi service. Prisma SD-WAN aisa hai jaise purpose-built delivery depot kholna: naya equipment (ION), naya control room (controller) aur pehle din se delivery ke around bana design. Dono parcel pahunchate hain; cost, skills aur growth path alag hain.</p>
<h3>Do options side by side</h3>
<table class="cmp"><tr><th>Item</th><th>PAN-OS SD-WAN</th><th>Prisma SD-WAN</th></tr>
<tr><td>Edge device</td><td>PAN-OS chalane wala next-generation firewall</td><td>ION device (physical ya virtual)</td></tr>
<tr><td>Management</td><td>SD-WAN plugin ke saath Panorama; naye releases mein Strata Cloud Manager bhi</td><td>Cloud management plane aur portal</td></tr>
<tr><td>Core idea</td><td>Physical links ko group karne wala virtual SD-WAN interface, SD-WAN policy rules se steer hota hai</td><td>Path, QoS, performance, security aur NAT policy stacks wala application fabric</td></tr>
<tr><td>Link grouping</td><td>SD-WAN interface profiles se interfaces par link tags</td><td>Circuit categories aur labels</td></tr>
<tr><td>Quality control</td><td>Path quality profiles aur traffic distribution profiles</td><td>Performance policy aur path policy</td></tr>
<tr><td>Typical fit</td><td>PAN-OS par chalta firewall estate jise SD-WAN features chahiye</td><td>Bade branch estates jo purpose-built SD-WAN chahte hain</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Two SD-WAN options">
<rect x="10" y="10" width="290" height="230" rx="12" fill="#e0f2fe"/><text x="155" y="35" text-anchor="middle" class="svg-ink" font-size="14">PAN-OS SD-WAN</text>
<rect x="30" y="55" width="250" height="40" rx="8" fill="#fff"/><text x="155" y="80" text-anchor="middle" class="svg-ink" font-size="12">Panorama + SD-WAN plugin</text>
<rect x="30" y="110" width="250" height="40" rx="8" fill="#fff"/><text x="155" y="135" text-anchor="middle" class="svg-ink" font-size="12">NGFW hub / NGFW branch</text>
<rect x="30" y="165" width="250" height="55" rx="8" fill="#fff"/><text x="155" y="188" text-anchor="middle" class="svg-ink" font-size="12">sdwan.1 virtual interface</text><text x="155" y="206" text-anchor="middle" class="svg-muted" font-size="11">link tags + profiles + rules</text>
<rect x="340" y="10" width="290" height="230" rx="12" fill="#dcfce7"/><text x="485" y="35" text-anchor="middle" class="svg-ink" font-size="14">Prisma SD-WAN</text>
<rect x="360" y="55" width="250" height="40" rx="8" fill="#fff"/><text x="485" y="80" text-anchor="middle" class="svg-ink" font-size="12">Cloud controller and portal</text>
<rect x="360" y="110" width="250" height="40" rx="8" fill="#fff"/><text x="485" y="135" text-anchor="middle" class="svg-ink" font-size="12">ION branch / ION data center</text>
<rect x="360" y="165" width="250" height="55" rx="8" fill="#fff"/><text x="485" y="188" text-anchor="middle" class="svg-ink" font-size="12">Application fabric</text><text x="485" y="206" text-anchor="middle" class="svg-muted" font-size="11">policy sets and stacks</text>
</svg><p class="cap">Do products, ek goal: kai WAN links ka application-aware use.</p></div>
<h3>Exam kya poochta hai</h3>
<p>Exam apne paanch domains ko dono products mein failata hai. Aapko dono ki vocabulary aani chahiye, pehchanna chahiye ki sawal kaunsa product describe kar raha hai, aur terms ko mix nahi karna. Jaise link tag aur circuit label ek cheez nahi hain, aur path quality profile performance policy nahi hai, haalanki dono "kitna achha kaafi hai" define karte hain.</p>
<h3>Is module ka plan</h3>
<ol>
<li>PAN-OS SD-WAN architecture, roles aur licensing.</li>
<li>Link tags, SD-WAN interface profiles aur sdwan.1 virtual interface.</li>
<li>Path quality profiles aur traffic distribution profiles.</li>
<li>SD-WAN policy rules, SaaS monitoring aur error correction.</li>
<li>VPN clusters aur Panorama workflow.</li>
<li>CLI aur troubleshooting workflow.</li>
<li>Prisma SD-WAN se tulna, kaunsa kab chunein.</li>
<li>Summary aur exam checklist.</li>
</ol>
<div class="warn"><p><b>Common galti.</b> Dono products ko alag naam wala same samajhna. Dono ka goal aur kuch ideas same hain (application awareness, measured quality par path selection), par objects, management plane aur operations alag hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal "link tags aur traffic distribution profile" describe kar sakta hai aur ION ya circuit-label jawab de sakta hai. Shabd product bata dete hain: link tags aur traffic distribution profiles PAN-OS SD-WAN ke terms hain.</p></div>
<div class="scn"><h4>Firewall estate jo SD-WAN chahta hai</h4><p>Harbor Foods ke 40 stores par pehle se PAN-OS firewalls hain, Panorama se managed. Management poochta hai ki ION devices khareedne chahiye ya nahi. Pehla sawal product nahi, zaroorat hai: agar stores ko sirf do-ISP failover aur application steering chahiye to PAN-OS SD-WAN kaafi ho sakta hai; agar bade-scale uniform branches aur Prisma SD-WAN ka operations model chahiye to ION evaluate karne layak hai. Pehle requirements, phir product.</p></div>
<div class="iv"><p class="q">"PAN-OS SD-WAN aur Prisma SD-WAN mein kya farak hai?"</p><p>PAN-OS SD-WAN next-generation firewall par SD-WAN feature set hai, jo Panorama aur uske SD-WAN plugin se manage hota hai. Prisma SD-WAN ION devices aur cloud management plane use karta hai. Dono measured path quality se applications ko kai links par steer karte hain, par unke objects alag hain, aur choice existing estate, scale aur operations model par depend karti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Do products: PAN-OS SD-WAN (firewall plus Panorama plugin) aur Prisma SD-WAN (ION plus cloud).</li>
<li>Har product ki apni vocabulary seekho aur mix mat karo.</li>
<li>Simulator dono ko model nahi karta; diagrams aur reference listings se padho.</li>
<li>Requirements, estate aur operations model se chuno.</li>
</ul></div>
`}};export{e as default};