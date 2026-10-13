var e={id:`troubleshooting`,h:{en:`Design review and troubleshooting at the architecture level`,hi:`Architecture level par design review aur troubleshooting`},body:{en:`
<p>Architecture questions on the exam read like tickets: "subscribers in one metro lose service", "an upgrade took down the core", "a configuration change did not take effect". The method is to <b>localise by tier first</b>, then by layer, then by platform behaviour. This chapter gives that workflow and a review checklist you can apply to any provider design. The simulator has no labs for this module, so the examples are descriptions, not captured output; practise the protocol-level checks in spcor-isis, spcor-mpls-ldp and spcor-l3vpn.</p>

<h3>Step 1: scope the blast radius</h3>
<p>Ask who is affected: one customer, one access node, one metro, one service type, or everything. The size of the affected group points to the tier. One subscriber means access or the customer premises. A whole ring or an aggregation pair points to aggregation. One service type for all users (for example all L3VPN, but Internet fine) points to the service control plane at the PEs or route reflectors. Everything points to the core or a shared dependency.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Blast radius to tier">
<rect x="20" y="20" width="600" height="36" rx="6" fill="#bae6fd"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">One subscriber or site: access, CPE, last mile</text>
<rect x="60" y="66" width="520" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">One ring or metro: aggregation pair, ring protocol, uplink</text>
<rect x="100" y="112" width="440" height="36" rx="6" fill="#fde68a"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="13">One service for everyone: PE, route reflector, service control plane</text>
<rect x="140" y="158" width="360" height="36" rx="6" fill="#ddd6fe"/><text x="320" y="181" text-anchor="middle" class="svg-ink" font-size="13">Everything: core, IGP, shared dependency</text>
</svg><p class="cap">The size of the affected group points to the tier at fault.</p></div>

<h3>Step 2: layer by layer</h3>
<ol>
<li><b>Physical and Layer 2</b>: optics, fibre, link state, errors, ring protection state.</li>
<li><b>IGP and underlay</b>: neighbours, loopback reachability, metrics, area or level boundaries.</li>
<li><b>Transport labels</b>: LDP or SR labels for the PE loopbacks; an LSP exists end to end.</li>
<li><b>Service control plane</b>: BGP sessions to route reflectors, VPN or EVPN routes, route targets, policy.</li>
<li><b>Service data plane</b>: forwarding state, MTU, QoS, policers, subscriber sessions.</li>
<li><b>Platform</b>: software version, process health, resource exhaustion, configuration commit state.</li>
</ol>

<h3>Step 3: platform behaviour</h3>
<ul>
<li>On <b>IOS XR</b>: was the change committed, or still in the target configuration? Did the commit fail (check the failed-configuration view)? Was a route policy attached for eBGP? Did a process restart?</li>
<li>On <b>IOS XE</b>: is the line active in the running configuration, and was it saved? Is the feature supported on this hardware family and licence?</li>
<li>On <b>virtual platforms</b>: is the VNF running, are its virtual interfaces attached, and is the host oversubscribed (CPU, memory, packet rate)?</li>
</ul>

<h3>Common architecture-level failure patterns</h3>
<table class="cmp"><tr><th>Pattern</th><th>Typical cause</th><th>Prevention</th></tr>
<tr><td>Core outage after a "small" change</td><td>Change not staged; no confirmed commit; no rollback plan</td><td>Atomic commits, commit confirmed, maintenance windows</td></tr>
<tr><td>Loss after a single link failure</td><td>Capacity planned for the normal case only</td><td>Headroom for a single failure, utilisation monitoring</td></tr>
<tr><td>VPN customers cannot reach each other</td><td>PE loopbacks summarised; LSP missing</td><td>Keep PE /32 loopbacks reachable end to end</td></tr>
<tr><td>Slow convergence after failures</td><td>No BFD or fast reroute; large flat IGP</td><td>BFD, TI-LFA or LFA, hierarchy, BGP PIC</td></tr>
<tr><td>Route reflector failure removes service</td><td>Single RR or both RRs share a failure domain</td><td>Two or more RRs in different sites</td></tr>
<tr><td>VNF throughput far below expectation</td><td>No acceleration; wrong placement; resource contention</td><td>SR-IOV or DPDK, pinning, capacity tests</td></tr></table>

<h3>A design review checklist</h3>
<ul>
<li>Does each tier have two paths and no hidden single point of failure?</li>
<li>Does the IGP carry only infrastructure? Is state bounded by domains?</li>
<li>Is the core free of service state?</li>
<li>Is capacity enough for a single failure, with measured traffic?</li>
<li>Are fast detection and fast reroute in place?</li>
<li>Is the OS chosen to fit the role, and is there a rollback method for changes?</li>
<li>For NFV: are VNF placement, performance and failure domain understood?</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket: "Customers in Metro 3 lost their L3VPN service at 02:10, Internet is fine, and two other metros are fine." Scope: one service, one metro. The IGP in Metro 3 is up, so the underlay is not at fault. The transport check shows the LSP to the VPN route reflector is missing: the aggregation border summarised the RR loopback in that metro's configuration earlier that night. The change was committed without a confirmed commit. The fix is to roll back to the previous commit, restore the /32 reachability and then redo the change properly.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Debugging a protocol before establishing the blast radius; assuming the platform behaves like another OS; and changing several things at once.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam often hides the answer in the scope of the failure: "only VPN customers" points to the service control plane or labels, not the physical network.</p></div>

<div class="scn"><h4>The upgrade that took the core down</h4><p>A core router upgrade was done during working hours without a protected path. The router also held the only route reflector role in that site. As it reloaded, PEs lost their iBGP sessions and withdrew VPN routes. After the incident, the operator added a second route reflector in another site, moved routing-engine upgrades to a staged process with traffic drained first, and used commit and rollback for each change.</p><p><b>Lesson:</b> redundancy applies to control-plane roles as well as to links.</p></div>

<div class="iv"><p class="q">"Subscribers in one metro lost service after a night change. How do you approach it?"</p><p>Scope the blast radius, check the physical layer and IGP for that metro, then transport labels and the service control plane, then compare the night's change with the previous commit and roll back if it matches the symptoms. Communicate impact early and verify recovery from the customer's view.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start with the blast radius: it points to the tier.</li>
<li>Work layer by layer: physical, IGP, labels, service control plane, data plane, platform.</li>
<li>Check platform behaviour: commit state, policy, process health, VNF resources.</li>
<li>Use a review checklist: redundancy, hierarchy, capacity, convergence, rollback.</li>
<li>Roll back first when a change matches the timing of the fault.</li>
</ul></div>
`,hi:`
<p>Exam mein architecture questions tickets jaise padhe jaate hain: "ek metro ke subscribers ki service gayi", "upgrade ne core down kar diya", "configuration change effect nahi hua". Method hai <b>pehle tier se localise karo</b>, phir layer se, phir platform behaviour se. Yeh chapter woh workflow aur review checklist deta hai jo aap kisi bhi provider design par laga sakte ho. Is module ke liye simulator mein labs nahi hain, isliye examples descriptions hain, captured output nahi; protocol-level checks spcor-isis, spcor-mpls-ldp aur spcor-l3vpn mein practise karo.</p>

<h3>Step 1: blast radius scope karo</h3>
<p>Poochho kaun affected hai: ek customer, ek access node, ek metro, ek service type, ya sab. Affected group ka size tier ki taraf ishara karta hai. Ek subscriber matlab access ya customer premises. Poori ring ya aggregation pair matlab aggregation. Sab users ke liye ek service type (jaise sab L3VPN, lekin Internet theek) matlab PEs ya route reflectors par service control plane. Sab kuch matlab core ya shared dependency.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Blast radius se tier">
<rect x="20" y="20" width="600" height="36" rx="6" fill="#bae6fd"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">Ek subscriber ya site: access, CPE, last mile</text>
<rect x="60" y="66" width="520" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">Ek ring ya metro: aggregation pair, ring protocol, uplink</text>
<rect x="100" y="112" width="440" height="36" rx="6" fill="#fde68a"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="13">Sabke liye ek service: PE, route reflector, service control plane</text>
<rect x="140" y="158" width="360" height="36" rx="6" fill="#ddd6fe"/><text x="320" y="181" text-anchor="middle" class="svg-ink" font-size="13">Sab kuch: core, IGP, shared dependency</text>
</svg><p class="cap">Affected group ka size batata hai kaun sa tier fault mein hai.</p></div>

<h3>Step 2: layer by layer</h3>
<ol>
<li><b>Physical aur Layer 2</b>: optics, fibre, link state, errors, ring protection state.</li>
<li><b>IGP aur underlay</b>: neighbours, loopback reachability, metrics, area ya level boundaries.</li>
<li><b>Transport labels</b>: PE loopbacks ke liye LDP ya SR labels; end to end LSP maujood hai.</li>
<li><b>Service control plane</b>: route reflectors tak BGP sessions, VPN ya EVPN routes, route targets, policy.</li>
<li><b>Service data plane</b>: forwarding state, MTU, QoS, policers, subscriber sessions.</li>
<li><b>Platform</b>: software version, process health, resource exhaustion, configuration commit state.</li>
</ol>

<h3>Step 3: platform behaviour</h3>
<ul>
<li><b>IOS XR</b> par: change commit hua, ya abhi target configuration mein hai? Commit fail hua (failed-configuration view dekho)? eBGP ke liye route policy lagi thi? Koi process restart hua?</li>
<li><b>IOS XE</b> par: line running configuration mein active hai, aur save hui? Feature is hardware family aur licence par supported hai?</li>
<li><b>Virtual platforms</b> par: VNF chal raha hai, uske virtual interfaces attached hain, aur host oversubscribed (CPU, memory, packet rate) to nahi?</li>
</ul>

<h3>Common architecture-level failure patterns</h3>
<table class="cmp"><tr><th>Pattern</th><th>Typical cause</th><th>Prevention</th></tr>
<tr><td>"Chhote" change ke baad core outage</td><td>Change staged nahi; confirmed commit nahi; rollback plan nahi</td><td>Atomic commits, commit confirmed, maintenance windows</td></tr>
<tr><td>Ek link failure ke baad loss</td><td>Sirf normal case ke liye capacity plan</td><td>Single failure ke liye headroom, utilisation monitoring</td></tr>
<tr><td>VPN customers ek-doosre tak nahi pahunchte</td><td>PE loopbacks summarised; LSP missing</td><td>PE /32 loopbacks end to end reachable rakho</td></tr>
<tr><td>Failures ke baad slow convergence</td><td>BFD ya fast reroute nahi; bada flat IGP</td><td>BFD, TI-LFA ya LFA, hierarchy, BGP PIC</td></tr>
<tr><td>Route reflector failure service hata deta hai</td><td>Single RR ya dono RRs ek failure domain share karte hain</td><td>Alag sites mein do ya zyaada RRs</td></tr>
<tr><td>VNF throughput expectation se bahut kam</td><td>Acceleration nahi; galat placement; resource contention</td><td>SR-IOV ya DPDK, pinning, capacity tests</td></tr></table>

<h3>Design review checklist</h3>
<ul>
<li>Har tier ke do paths hain aur koi chhupa single point of failure nahi?</li>
<li>IGP sirf infrastructure carry karta hai? State domains se bounded hai?</li>
<li>Core service state se mukt hai?</li>
<li>Measured traffic ke saath single failure ke liye capacity kaafi hai?</li>
<li>Fast detection aur fast reroute maujood hain?</li>
<li>OS role ke hisaab se chuna gaya hai, aur changes ke liye rollback method hai?</li>
<li>NFV ke liye: VNF placement, performance aur failure domain samjha gaya hai?</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket: "Metro 3 ke customers ki L3VPN service raat 02:10 par gayi, Internet theek hai, aur do aur metros theek hain." Scope: ek service, ek metro. Metro 3 mein IGP up hai, isliye underlay fault nahi. Transport check dikhata hai ki VPN route reflector tak LSP missing hai: aggregation border ne us raat pehle us metro ki configuration mein RR loopback summarise kar diya. Change bina confirmed commit ke commit hua tha. Fix: pichhle commit par roll back karo, /32 reachability restore karo aur phir change sahi tareeke se dobara karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Blast radius tay kiye bina protocol debug karna; yeh maanna ki platform doosre OS jaisa behave karta hai; aur ek saath kai cheezein badalna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam aksar jawab failure ke scope mein chhupata hai: "sirf VPN customers" service control plane ya labels ki taraf ishara karta hai, physical network ki taraf nahi.</p></div>

<div class="scn"><h4>Upgrade jisne core down kar diya</h4><p>Core router upgrade working hours mein bina protected path ke kiya gaya. Wahi router us site mein akela route reflector role bhi rakhta tha. Jaise woh reload hua, PEs ne iBGP sessions kho diye aur VPN routes withdraw kiye. Incident ke baad operator ne doosri site mein doosra route reflector jodha, routing-engine upgrades ko staged process mein badla jisme pehle traffic drain hota hai, aur har change ke liye commit aur rollback use kiya.</p><p><b>Lesson:</b> redundancy links ke saath saath control-plane roles par bhi lagu hoti hai.</p></div>

<div class="iv"><p class="q">"Raat ke change ke baad ek metro ke subscribers ki service gayi. Kaise approach karoge?"</p><p>Blast radius scope karo, us metro ke liye physical layer aur IGP check karo, phir transport labels aur service control plane, phir raat ke change ko pichhle commit se compare karo aur agar symptoms se match kare to roll back karo. Impact jaldi communicate karo aur customer ke view se recovery verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Blast radius se shuru karo: woh tier ki taraf ishara karta hai.</li>
<li>Layer by layer kaam karo: physical, IGP, labels, service control plane, data plane, platform.</li>
<li>Platform behaviour check karo: commit state, policy, process health, VNF resources.</li>
<li>Review checklist use karo: redundancy, hierarchy, capacity, convergence, rollback.</li>
<li>Jab change fault ke timing se match kare to pehle roll back karo.</li>
</ul></div>
`}};export{e as default};