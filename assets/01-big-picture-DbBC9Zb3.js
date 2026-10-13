var e={id:`big-picture`,h:{en:`The big picture: one physical network, many virtual ones`,hi:`Big picture: ek physical network, kai virtual networks`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain how one physical server becomes many virtual machines, how one router becomes several isolated routers with VRFs, and how two branches separated by the internet can behave as if a private cable joined them, using GRE and IPsec tunnels. You will configure VRF-lite, a GRE tunnel, a crypto-map IPsec VPN and GRE over IPsec, verify each one from the CLI, and fix the classic faults: the flapping tunnel, the phase 1 that never comes up and the VPN that encrypts in one direction only. This is domain 2.0 <b>Virtualization</b> of the CCNP ENCOR 350-401 exam: 2.1 device virtualization (hypervisors, virtual machines, virtual switching) and 2.2 data path virtualization (VRF, GRE and IPsec tunnelling).</p>

<p><b>Prerequisites.</b> You should be comfortable with IPv4 addressing and subnet masks, static and default routes, the routing table and longest-prefix match, and basic IOS configuration. The CCNA virtualization module introduced hypervisors and VRF-lite at a high level; here we go deeper and add the tunnel technologies. The next module, LISP and VXLAN, builds on the overlay and underlay idea you meet here.</p>

<h3>An analogy: one building, many offices, private corridors</h3>
<p>Think of a large office tower. One physical building is shared by many companies. Each company rents a floor, has its own locked doors, its own reception and its own room numbers. Two companies can both have a "room 101" without confusion, because they live on different floors. That is <b>virtualization</b>: slicing one physical thing into many isolated logical things.</p>
<p>Now imagine a company with offices in two towers across the city. It wants its staff to walk between them as if they were one office. It cannot build a private road, so it hires a sealed courier van that drives on the public roads. Inside the van everything looks private; outside, the traffic police only see a van going from tower A to tower B. That van is a <b>tunnel</b>. If the van is also armoured and locked so nobody can read the letters inside, that is <b>IPsec</b>.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Module map">
<rect x="20" y="20" width="180" height="60" rx="8" fill="#ddd6fe"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="14">Device virtualization</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="12">hypervisor, VM, vSwitch</text>
<rect x="230" y="20" width="180" height="60" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">VRF</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">many routing tables</text>
<rect x="440" y="20" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="14">Tunnels</text><text x="530" y="64" text-anchor="middle" class="svg-muted" font-size="12">GRE, IPsec, VTI</text>
<rect x="60" y="160" width="100" height="44" rx="8" fill="#fde68a"/><text x="110" y="187" text-anchor="middle" class="svg-ink" font-size="13">BR1 Pune</text>
<rect x="270" y="130" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="157" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<rect x="480" y="160" width="100" height="44" rx="8" fill="#fde68a"/><text x="530" y="187" text-anchor="middle" class="svg-ink" font-size="13">BR2 Jaipur</text>
<line x1="160" y1="175" x2="270" y2="155" stroke="#64748b" stroke-width="2"/><line x1="370" y1="155" x2="480" y2="175" stroke="#64748b" stroke-width="2"/>
<path d="M160 200 Q320 250 480 200" fill="none" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/>
<text x="320" y="245" text-anchor="middle" class="svg-accent" font-size="13">Tunnel0 172.16.12.0/30</text>
<text x="200" y="150" text-anchor="middle" class="svg-muted" font-size="12">100.64.11.0/30</text><text x="440" y="150" text-anchor="middle" class="svg-muted" font-size="12">100.64.22.0/30</text>
</svg><p class="cap">Three ideas in this module, and the two-branch lab topology used by the GRE and GRE-over-IPsec labs.</p></div>

<h3>Why virtualization matters to a network engineer</h3>
<p>A decade ago one application meant one physical server, one switch port and one cable. Today one server hosts dozens of virtual machines, and the first switch those VMs meet is a <b>virtual switch</b> inside the hypervisor, not the Catalyst in the rack. If you do not understand port groups and VLAN tagging on that virtual switch, you cannot troubleshoot why a VM cannot reach its gateway.</p>
<p>The same thinking applies to routers. A service provider edge router, a data center border router or a campus core may carry traffic for many customers or departments that must never mix and may even use the same addresses. Buying one router per customer is expensive. A <b>VRF</b> (Virtual Routing and Forwarding instance) gives each of them its own routing table on the same box.</p>
<p>Finally, branches need to reach each other across networks they do not control. The internet will not route 10.x private addresses, and it offers no privacy. <b>GRE</b> solves the first problem by wrapping private packets in public ones. <b>IPsec</b> solves the second by encrypting and authenticating them.</p>

<h3>Overlay and underlay: the vocabulary for everything that follows</h3>
<p>The <b>underlay</b> is the real transport network: the WAN links, the ISP and the public addresses. The <b>overlay</b> is the virtual network you build on top: the tunnel interfaces, their 172.16.12.0/30 addresses and the private LAN routes. An overlay only works if the underlay can deliver packets between the tunnel endpoints. Keep these two words in mind; half of all tunnel faults come from mixing them up.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (10.1.10.10) in Pune pings PC2 (10.2.20.10) in Jaipur. PC1 sends to its gateway BR1. BR1's routing table says 10.2.20.0/24 is reached through Tunnel0. BR1 wraps the packet in a GRE header and a new IP header with source 100.64.11.2 and destination 100.64.22.2. The ISP routes this public packet normally. BR2 receives it, removes the outer header and GRE header, and forwards the original packet to PC2. The ISP never saw a 10.x address.</p></div>

<h3>The four labs you will complete</h3>
<table class="cmp"><tr><th>Lab</th><th>What you do</th><th>Chapter</th></tr>
<tr><td>GRE between two branches</td><td>Build Tunnel0 on BR1 and BR2, route the LANs, add keepalives</td><td>5 and 6</td></tr>
<tr><td>The flapping tunnel</td><td>Find and remove a route that causes recursive routing</td><td>7</td></tr>
<tr><td>IPsec with a crypto map</td><td>Fix the key and transform set on BR, build the crypto map, verify SAs</td><td>9</td></tr>
<tr><td>Protect the GRE tunnel</td><td>Add IKE policy, transform set, IPsec profile and tunnel protection</td><td>10</td></tr>
</table>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking a tunnel replaces routing. It does not. A tunnel is just another interface. You still need routes that send LAN traffic into the tunnel, and the underlay still needs a route to the far tunnel endpoint. No route, no tunnel.</p></div>

<div class="exam"><p><b>Exam trap.</b> GRE provides encapsulation, not security. If a question asks which technology gives confidentiality, the answer is IPsec (ESP), not GRE. If it asks which one carries multicast and routing-protocol hellos natively, the answer is GRE, not a plain crypto map.</p></div>

<div class="scn"><h4>Two acquisitions, one address plan</h4><p>A logistics company bought two smaller firms. Both used 10.10.0.0/16 internally, and both needed to reach the parent company's ERP in Delhi. Re-addressing would have taken months. The network team created two VRFs, ACQ-A and ACQ-B, on the Delhi edge router, terminated each firm's GRE-over-IPsec tunnel in its own VRF, and used NAT to reach the shared ERP. Overlapping addresses stopped being a problem, and traffic from the two firms could never mix.</p><p><b>Lesson:</b> VRFs, tunnels and IPsec are not separate exam topics. In real networks they are used together, which is why ENCOR groups them under one domain.</p></div>

<div class="iv"><p class="q">"What is the difference between an overlay and an underlay?"</p><p>A strong answer: the underlay is the physical or transport network that moves packets between tunnel endpoints, such as the ISP or an MPLS WAN. The overlay is the logical network built on top using tunnels, with its own addressing and routing, such as GRE, IPsec VTI, DMVPN, SD-WAN or VXLAN. The overlay depends on the underlay for reachability; the underlay does not know or care what the overlay carries. Give one example with real addresses.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Virtualization slices one physical device into many isolated logical ones: VMs on a server, VRFs on a router.</li>
<li>A tunnel wraps a private packet inside a public one; GRE does this, IPsec adds encryption and integrity.</li>
<li>Underlay = real transport network; overlay = virtual network on top. The overlay needs the underlay.</li>
<li>A tunnel is an interface: it still needs routes pointing into it and a route to its destination.</li>
<li>ENCOR domain 2.0 covers hypervisors, virtual switching, VRF, GRE and IPsec; LISP and VXLAN follow next.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki ek physical server kai virtual machines kaise banta hai, ek router VRFs se kai isolated routers kaise banta hai, aur internet se alag do branches GRE aur IPsec tunnels use karke aise kaise behave karti hain jaise ek private cable se judi hon. Aap VRF-lite, ek GRE tunnel, crypto-map wala IPsec VPN aur GRE over IPsec configure karoge, har ek ko CLI se verify karoge, aur classic faults fix karoge: flapping tunnel, phase 1 jo kabhi up nahi hota, aur VPN jo sirf ek direction mein encrypt karta hai. Yeh CCNP ENCOR 350-401 exam ka domain 2.0 <b>Virtualization</b> hai: 2.1 device virtualization (hypervisors, virtual machines, virtual switching) aur 2.2 data path virtualization (VRF, GRE aur IPsec tunnelling).</p>

<p><b>Prerequisites.</b> Aapko IPv4 addressing aur subnet masks, static aur default routes, routing table aur longest-prefix match, aur basic IOS configuration aani chahiye. CCNA virtualization module ne hypervisors aur VRF-lite ko high level par introduce kiya tha; yahan hum gehrai mein jaate hain aur tunnel technologies jodte hain. Agla module, LISP aur VXLAN, yahan seekhe overlay aur underlay idea par hi bana hai.</p>

<h3>Ek analogy: ek building, kai offices, private corridors</h3>
<p>Ek badi office tower socho. Ek physical building kai companies share karti hain. Har company ek floor kiraye par leti hai, uske apne locked darwaze, apna reception aur apne room numbers hote hain. Do companies dono ke paas "room 101" ho sakta hai bina confusion ke, kyunki woh alag floors par hain. Yahi <b>virtualization</b> hai: ek physical cheez ko kai isolated logical cheezon mein kaatna.</p>
<p>Ab socho ek company ke offices shehar ki do towers mein hain. Woh chahti hai ki staff dono ke beech aise aaye-jaaye jaise ek hi office ho. Woh private sadak nahi bana sakti, isliye ek sealed courier van hire karti hai jo public roads par chalti hai. Van ke andar sab private dikhta hai; bahar traffic police ko sirf tower A se tower B jaati ek van dikhti hai. Woh van ek <b>tunnel</b> hai. Agar van armoured aur locked bhi ho taaki koi andar ki chitthiyan na padh sake, to woh <b>IPsec</b> hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Module ka map">
<rect x="20" y="20" width="180" height="60" rx="8" fill="#ddd6fe"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="14">Device virtualization</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="12">hypervisor, VM, vSwitch</text>
<rect x="230" y="20" width="180" height="60" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">VRF</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">kai routing tables</text>
<rect x="440" y="20" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="14">Tunnels</text><text x="530" y="64" text-anchor="middle" class="svg-muted" font-size="12">GRE, IPsec, VTI</text>
<rect x="60" y="160" width="100" height="44" rx="8" fill="#fde68a"/><text x="110" y="187" text-anchor="middle" class="svg-ink" font-size="13">BR1 Pune</text>
<rect x="270" y="130" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="157" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<rect x="480" y="160" width="100" height="44" rx="8" fill="#fde68a"/><text x="530" y="187" text-anchor="middle" class="svg-ink" font-size="13">BR2 Jaipur</text>
<line x1="160" y1="175" x2="270" y2="155" stroke="#64748b" stroke-width="2"/><line x1="370" y1="155" x2="480" y2="175" stroke="#64748b" stroke-width="2"/>
<path d="M160 200 Q320 250 480 200" fill="none" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/>
<text x="320" y="245" text-anchor="middle" class="svg-accent" font-size="13">Tunnel0 172.16.12.0/30</text>
<text x="200" y="150" text-anchor="middle" class="svg-muted" font-size="12">100.64.11.0/30</text><text x="440" y="150" text-anchor="middle" class="svg-muted" font-size="12">100.64.22.0/30</text>
</svg><p class="cap">Is module ke teen ideas, aur do-branch lab topology jo GRE aur GRE-over-IPsec labs mein use hoti hai.</p></div>

<h3>Network engineer ke liye virtualization kyun matter karta hai</h3>
<p>Das saal pehle ek application ka matlab tha ek physical server, ek switch port aur ek cable. Aaj ek server darjanon virtual machines host karta hai, aur un VMs ko jo pehla switch milta hai woh hypervisor ke andar ka <b>virtual switch</b> hai, rack wala Catalyst nahi. Agar aap us virtual switch par port groups aur VLAN tagging nahi samajhte, to aap troubleshoot nahi kar paoge ki VM apne gateway tak kyun nahi pahunch rahi.</p>
<p>Yahi soch routers par bhi lagti hai. Service provider edge router, data center border router ya campus core kai customers ya departments ka traffic le jaata hai jo kabhi mix nahi hona chahiye aur jo shayad same addresses bhi use karte hon. Har customer ke liye ek router khareedna mehenga hai. <b>VRF</b> (Virtual Routing and Forwarding instance) har ek ko same box par apni routing table deta hai.</p>
<p>Aakhir mein, branches ko aise networks ke paar ek doosre tak pahunchna hota hai jo unke control mein nahi hain. Internet 10.x private addresses route nahi karta, aur koi privacy nahi deta. <b>GRE</b> pehli problem solve karta hai private packets ko public packets mein lapet kar. <b>IPsec</b> doosri problem solve karta hai unhe encrypt aur authenticate karke.</p>

<h3>Overlay aur underlay: aage ki har cheez ki vocabulary</h3>
<p><b>Underlay</b> asli transport network hai: WAN links, ISP aur public addresses. <b>Overlay</b> woh virtual network hai jo aap upar banate ho: tunnel interfaces, unke 172.16.12.0/30 addresses aur private LAN routes. Overlay tabhi chalta hai jab underlay tunnel endpoints ke beech packets deliver kar sake. Yeh do shabd yaad rakho; aadhe tunnel faults inhe mix karne se hi aate hain.</p>

<div class="eg"><p><b>Worked example.</b> Pune ka PC1 (10.1.10.10) Jaipur ke PC2 (10.2.20.10) ko ping karta hai. PC1 apne gateway BR1 ko bhejta hai. BR1 ki routing table kehti hai 10.2.20.0/24 Tunnel0 se milta hai. BR1 packet ko GRE header aur ek naye IP header mein lapet-ta hai jiska source 100.64.11.2 aur destination 100.64.22.2 hai. ISP is public packet ko normal route karta hai. BR2 use receive karta hai, outer header aur GRE header hataata hai, aur original packet PC2 ko forward karta hai. ISP ne kabhi 10.x address dekha hi nahi.</p></div>

<h3>Chaar labs jo aap complete karoge</h3>
<table class="cmp"><tr><th>Lab</th><th>Aap kya karte ho</th><th>Chapter</th></tr>
<tr><td>Do branches ke beech GRE</td><td>BR1 aur BR2 par Tunnel0 banao, LANs route karo, keepalives lagao</td><td>5 aur 6</td></tr>
<tr><td>Flapping tunnel</td><td>Recursive routing paida karne wala route dhoondo aur hatao</td><td>7</td></tr>
<tr><td>Crypto map se IPsec</td><td>BR par key aur transform set theek karo, crypto map banao, SAs verify karo</td><td>9</td></tr>
<tr><td>GRE tunnel ko protect karo</td><td>IKE policy, transform set, IPsec profile aur tunnel protection lagao</td><td>10</td></tr>
</table>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki tunnel routing ki jagah le leta hai. Aisa nahi hai. Tunnel bas ek aur interface hai. Aapko ab bhi aise routes chahiye jo LAN traffic ko tunnel mein bhejein, aur underlay ko ab bhi far tunnel endpoint tak route chahiye. Route nahi, to tunnel nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> GRE encapsulation deta hai, security nahi. Agar question poochhe kaunsi technology confidentiality deti hai, to jawab IPsec (ESP) hai, GRE nahi. Agar poochhe kaunsi multicast aur routing-protocol hellos natively le jaati hai, to jawab GRE hai, plain crypto map nahi.</p></div>

<div class="scn"><h4>Do acquisitions, ek address plan</h4><p>Ek logistics company ne do chhoti firms khareedi. Dono andar 10.10.0.0/16 use karti thi, aur dono ko Delhi mein parent company ke ERP tak pahunchna tha. Re-addressing mein mahine lagte. Network team ne Delhi edge router par do VRFs, ACQ-A aur ACQ-B, banaye, har firm ka GRE-over-IPsec tunnel uske apne VRF mein terminate kiya, aur shared ERP tak pahunchne ke liye NAT use kiya. Overlapping addresses problem nahi rahe, aur dono firms ka traffic kabhi mix nahi ho sakta tha.</p><p><b>Seekh:</b> VRFs, tunnels aur IPsec alag-alag exam topics nahi hain. Real networks mein yeh saath use hote hain, isiliye ENCOR inhe ek domain mein rakhta hai.</p></div>

<div class="iv"><p class="q">"Overlay aur underlay mein kya farak hai?"</p><p>Strong answer: underlay woh physical ya transport network hai jo tunnel endpoints ke beech packets le jaata hai, jaise ISP ya MPLS WAN. Overlay tunnels se upar bana logical network hai, apni addressing aur routing ke saath, jaise GRE, IPsec VTI, DMVPN, SD-WAN ya VXLAN. Overlay reachability ke liye underlay par depend karta hai; underlay ko pata nahi ya farak nahi padta ki overlay kya le ja raha hai. Real addresses ke saath ek example do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Virtualization ek physical device ko kai isolated logical devices mein kaatta hai: server par VMs, router par VRFs.</li>
<li>Tunnel private packet ko public packet ke andar lapet-ta hai; GRE yeh karta hai, IPsec encryption aur integrity jodta hai.</li>
<li>Underlay = asli transport network; overlay = upar ka virtual network. Overlay ko underlay chahiye.</li>
<li>Tunnel ek interface hai: use ab bhi andar point karne wale routes aur apni destination tak route chahiye.</li>
<li>ENCOR domain 2.0 hypervisors, virtual switching, VRF, GRE aur IPsec cover karta hai; LISP aur VXLAN agle module mein.</li>
</ul></div>
`}};export{e as default};