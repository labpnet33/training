var e={id:`security-design-review`,h:{en:`Security requirements, segmentation and the design-review workflow`,hi:`Security requirements, segmentation aur design-review workflow`},body:{en:`
<p>A design is not finished until you have written the <b>security requirements</b>: who may talk to whom, where inspection happens, and how guest, payment and corporate networks stay apart. In Prisma SD-WAN the built-in tool is the <b>zone-based firewall (ZBFW)</b>. This chapter also gives you the <b>design-review workflow</b>, the checklist you run before you sign off any design, which doubles as the troubleshooting order when a design fails in the field.</p>
<h3>Analogy: office building with badge zones</h3>
<p>A building has a public lobby, staff floors, a payment-processing room and a server room. Badges decide which zone you may enter, and a guard at each corridor checks them. A zone-based firewall is the badge system: you group networks into zones, then write rules that say which zone may reach which, for which application.</p>
<h3>Zones and policy as documented</h3>
<ul>
<li>A <b>security zone</b> maps to networks attached to physical interfaces, logical interfaces or sub-interfaces of the ION. You can allow or deny every interface in a zone access to other zones.</li>
<li>Typical organisations create three to four zones: a guest zone, one or more corporate LAN zones, an outside zone for internet, and a corporate WAN zone for private networks and VPN traffic. The documentation advises that more than 5 or 6 zones usually means overlapping requirements; use prefix filters inside existing zones instead.</li>
<li>A zone that is created but bound to no interface is a trap: the documentation says all traffic on unbound interfaces is blocked by default.</li>
<li><b>Security policy sets</b> contain rules that allow or deny application access between source and destination zones with prefix filters. Every set carries three default rules (self-zone, default and intra-zone) that cannot be edited. The platform does not create a default security policy set for you.</li>
<li><b>Stacks and binding.</b> A simple stack has one set (the documentation suggests it for fewer than 50 rules). An advanced stack evaluates up to four sets from left to right, top to bottom, and stops at the first match; the best practice is most specific first. A stack is bound to sites, and only one security stack can be active per site, though several sites can use the same stack.</li>
<li><b>Prefix filters</b> can be global (the same everywhere) or local (different per branch). Local prefixes must be attached to sites to work, and very large prefix lists are not recommended because they can exhaust ION memory.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Zone design for a store">
<rect x="10" y="20" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="13">Corporate</text><text x="85" y="59" text-anchor="middle" class="svg-muted" font-size="11">VLAN 20  10.110.20.0/24</text>
<rect x="10" y="85" width="150" height="50" rx="8" fill="#fde68a"/><text x="85" y="107" text-anchor="middle" class="svg-ink" font-size="13">Payment</text><text x="85" y="124" text-anchor="middle" class="svg-muted" font-size="11">VLAN 30  10.110.30.0/24</text>
<rect x="10" y="150" width="150" height="50" rx="8" fill="#fed7aa"/><text x="85" y="172" text-anchor="middle" class="svg-ink" font-size="13">Guest</text><text x="85" y="189" text-anchor="middle" class="svg-muted" font-size="11">VLAN 40  10.110.40.0/24</text>
<rect x="250" y="70" width="140" height="80" rx="10" fill="#ddd6fe"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">ION + ZBFW</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="11">zones + rules</text>
<rect x="480" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="555" y="42" text-anchor="middle" class="svg-ink" font-size="13">Corporate WAN</text><text x="555" y="59" text-anchor="middle" class="svg-muted" font-size="11">fabric to DCs</text>
<rect x="480" y="150" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="555" y="172" text-anchor="middle" class="svg-ink" font-size="13">Outside</text><text x="555" y="189" text-anchor="middle" class="svg-muted" font-size="11">internet</text>
<line x1="160" y1="45" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="160" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="160" y1="175" x2="250" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="100" x2="480" y2="45" stroke="#64748b" stroke-width="2"/><line x1="390" y1="125" x2="480" y2="175" stroke="#64748b" stroke-width="2"/>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Guest: outside only. Payment: corporate WAN to the payment servers only.</text>
</svg><p class="cap">Zone plan for a Harbor Foods store: three LAN zones, the WAN zone for the fabric and the outside zone for the internet.</p></div>
<h3>Writing security requirements</h3>
<p>Write them as a matrix before any configuration. Rows are source zones, columns are destination zones, cells say what is allowed.</p>
<table class="cmp"><tr><th>From \\ To</th><th>Corporate</th><th>Payment</th><th>Guest</th><th>Corporate WAN</th><th>Outside</th></tr>
<tr><td><b>Corporate</b></td><td>allow</td><td>deny</td><td>deny</td><td>allow business apps</td><td>allow web, SaaS</td></tr>
<tr><td><b>Payment</b></td><td>deny</td><td>allow</td><td>deny</td><td>allow payment servers only</td><td>deny</td></tr>
<tr><td><b>Guest</b></td><td>deny</td><td>deny</td><td>allow</td><td>deny</td><td>allow web</td></tr></table>
<p>Then check each requirement: where is it enforced (branch ION ZBFW, data center, a firewall in the DC, Prisma Access), and is any inspection beyond zone and application rules needed? A ZBFW filters by zone, prefix and application; if a compliance rule demands deeper threat inspection, the design must place a firewall or a cloud security service in the path.</p>
<h3>Segmentation across the WAN</h3>
<p>Zones separate traffic inside a site. To keep segments separate across the whole fabric you also use <b>network contexts</b> in policy (the policy documentation says a network context segments traffic so that identical applications can have different rules for different user communities) and VRF-based segmentation (module <b>psd-routing</b>). In design, decide the segments once (corporate, payment, guest, IoT) and use the same names in zones, contexts and VRFs.</p>
<h3>The design-review workflow</h3>
<p>Run this order for every design and for every field problem that looks like "the design is wrong".</p>
<ol>
<li><b>Requirements.</b> Is every business requirement written with a number (users, Mbps, minutes of downtime)?</li>
<li><b>Hardware.</b> Does each model meet throughput, ports and special features (bypass, PoE, LTE)? Is the DC model a DC model?</li>
<li><b>Licences.</b> Does every ION (physical or virtual) have a subscription, including DC ones and the standby?</li>
<li><b>Circuits.</b> Are circuits diverse in provider and path? Is each labelled with a category?</li>
<li><b>Bandwidth.</b> Does the plan include peaks, overhead, growth and the failure case?</li>
<li><b>Topology and HA.</b> Does the pattern survive the stated failure? HA gap and tracking arithmetic checked?</li>
<li><b>Routing.</b> Are prefixes advertised and learned both ways, with no overlaps?</li>
<li><b>Security.</b> Zones bound to interfaces, matrix written, NAT for breakout, one stack per site?</li>
<li><b>Policy.</b> Path, performance, QoS policy defined per application class (next module)?</li>
<li><b>Operations.</b> DNS, NTP, syslog, SNMP and controller reachability at every site? Phased rollout through Analytics mode?</li>
</ol>
<div class="eg"><p><b>Worked review: STORE-007.</b> Requirement: payments never lost. (1) Written: under 5 minutes per month. (2) Two ION 3200, 1 Gbps each, peak 400 Mbps: fits. (3) Per-site licence M covers both devices. (4) Internet-A and Internet-B from different carriers, MPLS from a third. (5) Plan 400 Mbps peak, 15 percent overhead, growth to 600 Mbps: within the 1 Gbps device. (6) HA priorities 200 and 100, reduction 120, tested. (7) The core router has a route for 10.110.0.0/16 via DC-EAST. (8) Payment zone to payment servers only, guest to outside only. (9) Payment flows given highest priority. (10) Pilot in Analytics mode for two weeks, then Control mode. The review passes.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Creating zones but not binding them to interfaces, which blocks that traffic. Creating dozens of zones instead of using prefix filters. Assuming ZBFW replaces a full next-generation firewall. Forgetting that a site has only one active security stack.</p></div>
<div class="exam"><p><b>Exam trap.</b> Each security policy set has three default rules (self-zone, default, intra-zone) that cannot be edited; the platform does not create default sets for you; one security stack is active per site; an advanced stack holds up to four sets evaluated left to right. A zone with no interface bound blocks the traffic on unbound interfaces.</p></div>
<div class="scn"><h4>Guest Wi-Fi that reached the cash registers</h4><p>During a customer audit, a tester on guest Wi-Fi at one store could ping the payment terminals. The review found that the store had a zone for guest in the plan, but the guest VLAN sub-interface was never bound to that zone and a permissive rule applied to the unbound network. After binding the VLAN to the guest zone, applying the zone matrix with deny between guest and payment, and re-running the audit, the finding closed.</p><p><b>Lesson:</b> a zone does nothing until it is bound to an interface, and the matrix must be tested, not assumed.</p></div>
<div class="iv"><p class="q">"What security can the ION provide at a branch, and what can it not?"</p><p>It provides zone-based firewalling: zones bound to interfaces, rules by source and destination zone, prefix filters and application, plus NAT policy for breakout. It is not a full next-generation firewall with deep threat inspection, so when the requirements demand that, I send traffic to a security service such as Prisma Access or a firewall at the data center, and I design the path policy accordingly.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ZBFW groups networks into zones bound to interfaces; keep zones few and use prefix filters for detail.</li>
<li>Security policy sets have three non-editable default rules; one security stack is active per site.</li>
<li>Write a source/destination zone matrix first, then test it.</li>
<li>Segmentation spans zones, network contexts and VRFs; use the same segment names everywhere.</li>
<li>Run the ten-step design review before sign-off; it is also the order for design troubleshooting.</li>
</ul></div>
`,hi:`
<p>Design tab tak poora nahi jab tak aapne <b>security requirements</b> nahi likhi: kaun kis se baat kar sakta hai, inspection kahan hota hai, aur guest, payment aur corporate networks alag kaise rehte hain. Prisma SD-WAN mein built-in tool <b>zone-based firewall (ZBFW)</b> hai. Is chapter mein <b>design-review workflow</b> bhi hai, woh checklist jo aap kisi bhi design ko sign off karne se pehle chalate ho, aur jo field mein design fail hone par troubleshooting ka order bhi hai.</p>
<h3>Analogy: badge zones wali office building</h3>
<p>Building mein public lobby, staff floors, payment-processing room aur server room hote hain. Badges tay karte hain ki aap kaunse zone mein ja sakte ho, aur har corridor par guard unhe check karta hai. Zone-based firewall badge system hai: aap networks ko zones mein group karte ho, phir rules likhte ho ki kaun sa zone kaun se zone tak, kaunsi application ke liye pahunch sakta hai.</p>
<h3>Zones aur policy, jaisa documented hai</h3>
<ul>
<li><b>Security zone</b> ION ke physical interfaces, logical interfaces ya sub-interfaces se attached networks se map hota hai. Aap zone ke har interface ko doosre zones tak access allow ya deny kar sakte ho.</li>
<li>Typical organisations teen se chaar zones banate hain: guest zone, ek ya zyada corporate LAN zones, internet ke liye outside zone, aur private networks aur VPN traffic ke liye corporate WAN zone. Documentation salah deti hai ki 5 ya 6 se zyada zones aam taur par overlapping requirements batate hain; uski jagah existing zones ke andar prefix filters use karo.</li>
<li>Jo zone bana ho par kisi interface se bound na ho woh trap hai: documentation kehti hai ki unbound interfaces ka saara traffic default roop se block ho jaata hai.</li>
<li><b>Security policy sets</b> mein aise rules hote hain jo source aur destination zones ke beech prefix filters ke saath application access allow ya deny karte hain. Har set mein teen default rules (self-zone, default aur intra-zone) hote hain jo edit nahi ho sakte. Platform aapke liye default security policy set nahi banata.</li>
<li><b>Stacks aur binding.</b> Simple stack mein ek set hota hai (documentation 50 se kam rules ke liye suggest karti hai). Advanced stack chaar tak sets ko left se right, upar se neeche evaluate karta hai aur pehle match par ruk jaata hai; best practice hai sabse specific pehle. Stack sites se bound hota hai, aur har site par sirf ek security stack active ho sakta hai, jabki kai sites ek hi stack use kar sakti hain.</li>
<li><b>Prefix filters</b> global (sab jagah same) ya local (har branch par alag) ho sakte hain. Local prefixes ko kaam karne ke liye sites se attach karna zaroori hai, aur bahut bade prefix lists recommended nahi hain kyunki woh ION memory khatam kar sakte hain.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Zone design for a store">
<rect x="10" y="20" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="13">Corporate</text><text x="85" y="59" text-anchor="middle" class="svg-muted" font-size="11">VLAN 20  10.110.20.0/24</text>
<rect x="10" y="85" width="150" height="50" rx="8" fill="#fde68a"/><text x="85" y="107" text-anchor="middle" class="svg-ink" font-size="13">Payment</text><text x="85" y="124" text-anchor="middle" class="svg-muted" font-size="11">VLAN 30  10.110.30.0/24</text>
<rect x="10" y="150" width="150" height="50" rx="8" fill="#fed7aa"/><text x="85" y="172" text-anchor="middle" class="svg-ink" font-size="13">Guest</text><text x="85" y="189" text-anchor="middle" class="svg-muted" font-size="11">VLAN 40  10.110.40.0/24</text>
<rect x="250" y="70" width="140" height="80" rx="10" fill="#ddd6fe"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">ION + ZBFW</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="11">zones + rules</text>
<rect x="480" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="555" y="42" text-anchor="middle" class="svg-ink" font-size="13">Corporate WAN</text><text x="555" y="59" text-anchor="middle" class="svg-muted" font-size="11">DCs tak fabric</text>
<rect x="480" y="150" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="555" y="172" text-anchor="middle" class="svg-ink" font-size="13">Outside</text><text x="555" y="189" text-anchor="middle" class="svg-muted" font-size="11">internet</text>
<line x1="160" y1="45" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="160" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="160" y1="175" x2="250" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="100" x2="480" y2="45" stroke="#64748b" stroke-width="2"/><line x1="390" y1="125" x2="480" y2="175" stroke="#64748b" stroke-width="2"/>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Guest: sirf outside. Payment: corporate WAN mein sirf payment servers tak.</text>
</svg><p class="cap">Harbor Foods store ka zone plan: teen LAN zones, fabric ke liye WAN zone aur internet ke liye outside zone.</p></div>
<h3>Security requirements likhna</h3>
<p>Configuration se pehle unhe matrix ki tarah likho. Rows source zones hain, columns destination zones, cells batate hain kya allowed hai.</p>
<table class="cmp"><tr><th>From \\ To</th><th>Corporate</th><th>Payment</th><th>Guest</th><th>Corporate WAN</th><th>Outside</th></tr>
<tr><td><b>Corporate</b></td><td>allow</td><td>deny</td><td>deny</td><td>business apps allow</td><td>web, SaaS allow</td></tr>
<tr><td><b>Payment</b></td><td>deny</td><td>allow</td><td>deny</td><td>sirf payment servers allow</td><td>deny</td></tr>
<tr><td><b>Guest</b></td><td>deny</td><td>deny</td><td>allow</td><td>deny</td><td>web allow</td></tr></table>
<p>Phir har requirement check karo: yeh kahan enforce hoti hai (branch ION ZBFW, data center, DC mein firewall, Prisma Access), aur kya zone aur application rules se aage inspection chahiye? ZBFW zone, prefix aur application se filter karta hai; agar compliance rule gehri threat inspection maangta hai to design mein path mein firewall ya cloud security service rakhni hogi.</p>
<h3>WAN ke across segmentation</h3>
<p>Zones site ke andar traffic alag karte hain. Poore fabric mein segments alag rakhne ke liye aap policy mein <b>network contexts</b> bhi use karte ho (policy documentation kehti hai ki network context traffic ko segment karta hai taaki ek hi application ke liye alag user communities ke alag rules ho sakein) aur VRF-based segmentation (module <b>psd-routing</b>). Design mein segments ek baar tay karo (corporate, payment, guest, IoT) aur zones, contexts aur VRFs mein wahi naam use karo.</p>
<h3>Design-review workflow</h3>
<p>Har design ke liye aur har aisi field problem ke liye jo "design galat hai" jaisi lagti hai, yeh order chalao.</p>
<ol>
<li><b>Requirements.</b> Kya har business requirement number ke saath likhi hai (users, Mbps, downtime minutes)?</li>
<li><b>Hardware.</b> Kya har model throughput, ports aur special features (bypass, PoE, LTE) pura karta hai? Kya DC model sach mein DC model hai?</li>
<li><b>Licences.</b> Kya har ION (physical ya virtual) ke paas subscription hai, DC wale aur standby sahit?</li>
<li><b>Circuits.</b> Kya circuits provider aur path mein diverse hain? Kya har ek ko category mili hai?</li>
<li><b>Bandwidth.</b> Kya plan mein peaks, overhead, growth aur failure case hai?</li>
<li><b>Topology aur HA.</b> Kya pattern stated failure survive karta hai? HA gap aur tracking arithmetic check ki?</li>
<li><b>Routing.</b> Kya prefixes dono taraf advertise aur learn ho rahe hain, bina overlap ke?</li>
<li><b>Security.</b> Zones interfaces se bound hain, matrix likhi hai, breakout ke liye NAT hai, har site par ek stack?</li>
<li><b>Policy.</b> Kya har application class ke liye path, performance, QoS policy define hai (agla module)?</li>
<li><b>Operations.</b> Kya har site par DNS, NTP, syslog, SNMP aur controller reachability hai? Analytics mode se phased rollout?</li>
</ol>
<div class="eg"><p><b>Worked review: STORE-007.</b> Requirement: payments kabhi na khoyein. (1) Likhi hai: mahine mein 5 minute se kam. (2) Do ION 3200, har ek 1 Gbps, peak 400 Mbps: fit. (3) Per-site licence M dono devices ko cover karta hai. (4) Internet-A aur Internet-B alag carriers se, MPLS teesre se. (5) Plan 400 Mbps peak, 15 percent overhead, growth 600 Mbps tak: 1 Gbps device ke andar. (6) HA priorities 200 aur 100, reduction 120, tested. (7) Core router mein DC-EAST ke through 10.110.0.0/16 ka route hai. (8) Payment zone sirf payment servers tak, guest sirf outside tak. (9) Payment flows ko highest priority. (10) Do hafte Analytics mode mein pilot, phir Control mode. Review pass hota hai.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Zones banana par interfaces se bound na karna, jisse woh traffic block hota hai. Prefix filters ki jagah darjano zones banana. Maan lena ki ZBFW poore next-generation firewall ki jagah le leta hai. Yeh bhool jaana ki site par sirf ek security stack active hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Har security policy set mein teen default rules (self-zone, default, intra-zone) hote hain jo edit nahi hote; platform default sets nahi banata; har site par ek security stack active hota hai; advanced stack mein chaar tak sets left se right evaluate hote hain. Jis zone se koi interface bound nahi hai woh unbound interfaces ka traffic block karta hai.</p></div>
<div class="scn"><h4>Guest Wi-Fi jo cash registers tak pahunchi</h4><p>Customer audit mein ek store par guest Wi-Fi par baitha tester payment terminals ko ping kar paaya. Review mein pata chala ki store ke plan mein guest ka zone tha, par guest VLAN sub-interface us zone se kabhi bound nahi hua tha aur unbound network par permissive rule lagu tha. Guest VLAN ko guest zone se bind karne, guest aur payment ke beech deny ke saath zone matrix lagane aur audit dobara chalane ke baad finding band hui.</p><p><b>Seekh:</b> zone tab tak kuch nahi karta jab tak interface se bound na ho, aur matrix ko test karna hota hai, maan nahi lena.</p></div>
<div class="iv"><p class="q">"ION branch par kaunsi security de sakta hai, aur kaunsi nahi?"</p><p>Woh zone-based firewalling deta hai: interfaces se bound zones, source aur destination zone, prefix filters aur application ke hisaab se rules, plus breakout ke liye NAT policy. Woh deep threat inspection wala full next-generation firewall nahi hai, isliye jab requirements yeh maangti hain to main traffic ko Prisma Access jaisi security service ya data center ke firewall ko bhejta hoon, aur path policy usi hisaab se design karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ZBFW networks ko interfaces se bound zones mein group karta hai; zones kam rakho aur detail ke liye prefix filters use karo.</li>
<li>Security policy sets mein teen non-editable default rules hote hain; har site par ek security stack active hota hai.</li>
<li>Pehle source/destination zone matrix likho, phir test karo.</li>
<li>Segmentation zones, network contexts aur VRFs mein phailti hai; sab jagah same segment names use karo.</li>
<li>Sign-off se pehle das-step design review chalao; yahi design troubleshooting ka order bhi hai.</li>
</ul></div>
`}};export{e as default};