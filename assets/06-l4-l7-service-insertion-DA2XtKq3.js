var e={id:`service-insertion`,h:{en:`L4-L7 service insertion: firewalls, load balancers, service graphs and PBR`,hi:`L4-L7 service insertion: firewalls, load balancers, service graphs aur PBR`},body:{en:`

<p>A shopping mall has security guards at the entrance and a customer-service desk that sends people to the shortest queue. Firewalls and load balancers are the guards and the desk. In a fabric, the design question is where to put them so every flow that needs them goes through them, in both directions, without every packet taking a detour.</p>

<h3>The case: Brightwave Travel</h3>
<div class="eg"><p><b>Customer.</b> Brightwave Travel, an online booking company. Three tiers (web, application, database), 450 VMs, a peak sale each month with 10 times normal traffic, and a payment tier under PCI rules.</p><p><b>Requirements.</b> Inspect north-south traffic and web-to-database traffic. Spread web requests across 12 web servers. Keep the client's source IP visible to the web logs. Add firewall capacity without redesign. A firewall failure must not drop sessions for long.</p><p><b>Constraints.</b> One active-standby firewall pair now, a cluster later. Load-balancer appliances from another vendor. VXLAN EVPN fabric from chapter 3. Operations want only the traffic that needs inspection to go through the firewall.</p></div>

<h3>Options for the firewall</h3>
<table class="cmp"><tr><th>Option</th><th>How</th><th>Pros</th><th>Cons</th></tr>
<tr><td>A. Firewall as the gateway of each segment</td><td>Hosts point at the firewall; the fabric is just Layer 2</td><td>Easy to understand; strict control</td><td>All traffic hairpins; firewall limits scale; fabric gateway benefits lost</td></tr>
<tr><td>B. VRF sandwich</td><td>Outside VRF and inside VRF meet at the firewall (routed mode)</td><td>Clean separation for north-south; works with any firewall</td><td>Only for traffic between those VRFs; adds routing config per tenant</td></tr>
<tr><td>C. Transparent (Layer 2) firewall</td><td>Firewall bridges two VLANs</td><td>No re-IP</td><td>Loop risk, VLAN pairs, less fit for VXLAN</td></tr>
<tr><td>D. Policy-based redirect (PBR) to a service leaf</td><td>Fabric steers only chosen flows to the firewall, then returns them</td><td>Only needed traffic inspected; firewall can scale out; fabric gateway stays</td><td>Needs PBR design on both directions; symmetry planning</td></tr></table>
<p>In Cisco ACI, the same idea is a <b>service graph</b>: you describe the firewall or load balancer as a node between two EPGs and attach it to a contract. The graph can run in <b>managed mode</b> (the APIC also configures the device through a device package or function) or <b>unmanaged mode</b>, also called network-policy mode, where the APIC only builds the network path and a team configures the device. PBR is the usual way a service graph redirects traffic.</p>

<h3>Options for the load balancer</h3>
<ul>
<li><b>Inline routed:</b> the load balancer is the servers' gateway. Client IP is preserved, but all server traffic passes the load balancer.</li>
<li><b>One-arm with SNAT:</b> the load balancer sits to the side and rewrites the source address so replies come back to it. Easy to insert, but servers see the load balancer's IP; use an X-Forwarded-For style header for logs.</li>
<li><b>Direct server return (DSR):</b> replies skip the load balancer. Efficient, but needs special configuration on the servers.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 262" role="img" aria-label="Service insertion: firewall and load balancer on a service leaf with PBR">
<line x1="60" y1="50" x2="190" y2="50" stroke="#64748b" stroke-width="1.6"/>
<line x1="190" y1="50" x2="350" y2="50" stroke="#64748b" stroke-width="1.6"/>
<line x1="350" y1="50" x2="190" y2="130" stroke="#64748b" stroke-width="1.6"/>
<line x1="350" y1="50" x2="350" y2="130" stroke="#64748b" stroke-width="1.6"/>
<line x1="350" y1="50" x2="510" y2="130" stroke="#64748b" stroke-width="1.6"/>
<line x1="190" y1="130" x2="110" y2="205" stroke="#64748b" stroke-width="1.6"/>
<line x1="190" y1="130" x2="270" y2="205" stroke="#64748b" stroke-width="1.6"/>
<line x1="350" y1="130" x2="430" y2="205" stroke="#64748b" stroke-width="1.6"/>
<line x1="510" y1="130" x2="570" y2="205" stroke="#64748b" stroke-width="1.6"/>
<line x1="190" y1="130" x2="350" y2="130" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="5 4"/>
<ellipse cx="60" cy="50" rx="45" ry="21" fill="#fde68a" stroke="#64748b"/><text x="60" y="54" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="140" y="33" width="100" height="34" rx="7" fill="#fed7aa" stroke="#64748b"/><text x="190" y="54" text-anchor="middle" class="svg-ink" font-size="12">Border leaf</text>
<rect x="307" y="33" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="313" y1="38" x2="387" y2="38" stroke="#16a34a" stroke-width="2"/><text x="350" y="54" text-anchor="middle" class="svg-ink" font-size="12">Spine</text>
<rect x="138" y="113" width="104" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="144" y1="142" x2="236" y2="142" stroke="#0284c7" stroke-width="2"/><text x="190" y="134" text-anchor="middle" class="svg-ink" font-size="12">Service leaf</text>
<rect x="307" y="113" width="86" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="313" y1="142" x2="387" y2="142" stroke="#0284c7" stroke-width="2"/><text x="350" y="134" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="467" y="113" width="86" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="473" y1="142" x2="547" y2="142" stroke="#0284c7" stroke-width="2"/><text x="510" y="134" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="67" y="188" width="86" height="34" rx="7" fill="#fecaca" stroke="#64748b"/><line x1="71" y1="205" x2="149" y2="205" stroke="#dc2626" stroke-width="1" stroke-opacity="0.5"/><line x1="95.66666666666667" y1="190" x2="95.66666666666667" y2="205" stroke="#dc2626" stroke-opacity="0.5"/><line x1="124.33333333333334" y1="205" x2="124.33333333333334" y2="220" stroke="#dc2626" stroke-opacity="0.5"/><text x="110" y="209" text-anchor="middle" class="svg-ink" font-size="12">Firewall</text>
<rect x="215" y="188" width="110" height="34" rx="7" fill="#fbcfe8" stroke="#64748b"/><text x="270" y="209" text-anchor="middle" class="svg-ink" font-size="12">Load balancer</text>
<rect x="390" y="188" width="80" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="394" y="192" width="6" height="26" fill="#94a3b8"/><text x="430" y="209" text-anchor="middle" class="svg-ink" font-size="12">Web tier</text>
<rect x="530" y="188" width="80" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="534" y="192" width="6" height="26" fill="#94a3b8"/><text x="570" y="209" text-anchor="middle" class="svg-ink" font-size="12">DB tier</text>
<text x="275" y="122" text-anchor="middle" class="svg-muted" font-size="12">PBR redirect</text>
<line x1="16" y1="228" x2="624" y2="228" stroke="#e2e8f0"/><rect x="16" y="238" width="14" height="12" rx="2" fill="#fde68a" stroke="#64748b"/><text x="35" y="248" class="svg-muted" font-size="11">WAN / cloud</text><rect x="102.85714285714286" y="238" width="14" height="12" rx="2" fill="#fed7aa" stroke="#64748b"/><text x="121.85714285714286" y="248" class="svg-muted" font-size="11">Border / gateway</text><rect x="189.71428571428572" y="238" width="14" height="12" rx="2" fill="#bbf7d0" stroke="#64748b"/><text x="208.71428571428572" y="248" class="svg-muted" font-size="11">Spine</text><rect x="276.57142857142856" y="238" width="14" height="12" rx="2" fill="#bae6fd" stroke="#64748b"/><text x="295.57142857142856" y="248" class="svg-muted" font-size="11">Leaf / access</text><rect x="363.42857142857144" y="238" width="14" height="12" rx="2" fill="#fecaca" stroke="#64748b"/><text x="382.42857142857144" y="248" class="svg-muted" font-size="11">Firewall</text><rect x="450.28571428571433" y="238" width="14" height="12" rx="2" fill="#fbcfe8" stroke="#64748b"/><text x="469.28571428571433" y="248" class="svg-muted" font-size="11">Load balancer</text><rect x="537.1428571428571" y="238" width="14" height="12" rx="2" fill="#e2e8f0" stroke="#64748b"/><text x="556.1428571428571" y="248" class="svg-muted" font-size="11">Server / host</text>
</svg><p class="cap">The service leaf holds the firewall and the load balancer. The fabric redirects only the flows that need services; other traffic uses the shortest path.</p></div>

<h3>Symmetry and failure</h3>
<p>A stateful firewall must see both directions of a flow. With PBR you configure the redirect for both the forward and the return direction, and for several firewalls you need <b>symmetric</b> hashing so the same flow always reaches the same firewall. Health tracking checks each service node, and when a node dies the policy can bypass it, drop traffic, or use the remaining nodes, according to the security rule.</p>

<h3>Chosen design for Brightwave</h3>
<p>North-south: VRF sandwich on the border leaves for the internet edge. East-west: PBR from the web and application EPGs or VNIs to a firewall on a dedicated service leaf pair, only for web-to-DB flows (the PCI path). Load balancer in one-arm mode with SNAT, logging X-Forwarded-For. The service leaf pair has spare ports so a second firewall can be added and hashed symmetrically.</p>
<pre class="out">svc-leaf-1# show port-channel summary
Group Port-Channel Type Protocol Member Ports
10    Po10(SU)     Eth  LACP     Eth1/10(P) Eth1/11(P)
<span class="hl">svc-leaf-1# show ip route vrf WEB 10.20.0.0/24</span></pre>

<div class="warn"><p><b>Common mistakes.</b> One-way redirect, so the firewall sees SYN but never the SYN-ACK. Putting service devices on the same leaf as servers that also use PBR. Sizing the firewall for average load, not the monthly peak.</p></div>
<div class="exam"><p><b>Exam trap.</b> A service graph does not itself inspect traffic; it inserts a device into the path. Unmanaged mode does not configure the device. Symmetry, not just redirection, is what a stateful device needs.</p></div>

<div class="scn"><h4>What went wrong at Brightwave</h4><p>On the first sale day, random payment failures appeared. The load balancer in one-arm mode used SNAT, but a second rule sent database replies directly back from a server, bypassing it; the firewall saw only half of those flows and dropped them as out-of-state. Engineers found the asymmetric path by capturing on both firewall ports, then added the return-direction redirect and aligned the NAT rules.</p><p><b>Lesson:</b> trace the forward and return path of one session before go-live.</p></div>

<div class="iv"><p class="q">"How do you avoid sending all traffic through the firewall?"</p><p>Use PBR or a service graph so only flows that need inspection are redirected, and keep the gateway distributed in the fabric. Mention symmetry and health tracking for failures.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Service insertion options: gateway, VRF sandwich, transparent, PBR/service graph.</li>
<li>PBR redirects only the flows that need services.</li>
<li>Stateful devices need symmetric paths in both directions.</li>
<li>Load balancer modes: inline, one-arm with SNAT, DSR.</li>
<li>ACI service graph: managed vs unmanaged mode.</li>
</ul></div>

`,hi:`

<p>Shopping mall mein entrance par security guards hote hain aur ek customer-service desk hota hai jo logon ko sabse chhoti queue mein bhejta hai. Firewalls aur load balancers wahi guards aur desk hain. Fabric mein design ka sawaal yeh hai ki unhe kahan rakhein taaki jin flows ko unki zaroorat hai woh dono directions mein unse guzrein, bina har packet ko detour karwaye.</p>

<h3>Case: Brightwave Travel</h3>
<div class="eg"><p><b>Customer.</b> Brightwave Travel, ek online booking company. Teen tiers (web, application, database), 450 VMs, har mahine peak sale jisme traffic normal ka 10 guna, aur PCI rules ke under ek payment tier.</p><p><b>Requirements.</b> North-south traffic aur web-to-database traffic inspect karna. Web requests ko 12 web servers mein baantna. Client ka source IP web logs mein dikhna chahiye. Redesign ke bina firewall capacity badhana. Firewall failure sessions ko lambe time tak na giraye.</p><p><b>Constraints.</b> Abhi ek active-standby firewall pair, baad mein cluster. Load-balancer appliances doosre vendor ke. Chapter 3 wala VXLAN EVPN fabric. Operations chahte hain ki sirf inspection wala traffic firewall se guzre.</p></div>

<h3>Firewall ke options</h3>
<table class="cmp"><tr><th>Option</th><th>Kaise</th><th>Pros</th><th>Cons</th></tr>
<tr><td>A. Firewall har segment ka gateway</td><td>Hosts firewall ko point karte hain; fabric sirf Layer 2</td><td>Samajhna aasan; strict control</td><td>Saara traffic hairpin hota hai; firewall scale limit; fabric gateway ke fayde khatam</td></tr>
<tr><td>B. VRF sandwich</td><td>Outside VRF aur inside VRF firewall par milte hain (routed mode)</td><td>North-south ke liye clean separation; kisi bhi firewall ke saath</td><td>Sirf un VRFs ke beech ke traffic ke liye; har tenant ka routing config</td></tr>
<tr><td>C. Transparent (Layer 2) firewall</td><td>Firewall do VLANs ko bridge karta hai</td><td>Re-IP nahi</td><td>Loop risk, VLAN pairs, VXLAN ke liye kam fit</td></tr>
<tr><td>D. Service leaf par policy-based redirect (PBR)</td><td>Fabric sirf chune flows ko firewall tak le jaata hai, phir wapas</td><td>Sirf zaroori traffic inspect; firewall scale-out; fabric gateway bacha</td><td>Dono directions ka PBR design; symmetry planning</td></tr></table>
<p>Cisco ACI mein yahi idea <b>service graph</b> hai: firewall ya load balancer ko do EPGs ke beech node ke roop mein describe karte ho aur contract se attach karte ho. Graph <b>managed mode</b> mein chal sakta hai (APIC device ko device package ya function se configure bhi karta hai) ya <b>unmanaged mode</b> mein, jise network-policy mode bhi kehte hain, jahan APIC sirf network path banata hai aur device team configure karti hai. Service graph traffic redirect karne ka usual tareeka PBR hai.</p>

<h3>Load balancer ke options</h3>
<ul>
<li><b>Inline routed:</b> load balancer servers ka gateway hai. Client IP preserve hota hai, par saara server traffic load balancer se guzarta hai.</li>
<li><b>One-arm with SNAT:</b> load balancer side mein baitha hai aur source address rewrite karta hai taaki replies usi ke paas wapas aayein. Insert karna aasan, par servers ko load balancer ka IP dikhta hai; logs ke liye X-Forwarded-For jaisa header use karo.</li>
<li><b>Direct server return (DSR):</b> replies load balancer ko skip karti hain. Efficient, par servers par special configuration chahiye.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 262" role="img" aria-label="Service insertion: service leaf par firewall aur load balancer, PBR ke saath">
<line x1="60" y1="50" x2="190" y2="50" stroke="#64748b" stroke-width="1.6"/>
<line x1="190" y1="50" x2="350" y2="50" stroke="#64748b" stroke-width="1.6"/>
<line x1="350" y1="50" x2="190" y2="130" stroke="#64748b" stroke-width="1.6"/>
<line x1="350" y1="50" x2="350" y2="130" stroke="#64748b" stroke-width="1.6"/>
<line x1="350" y1="50" x2="510" y2="130" stroke="#64748b" stroke-width="1.6"/>
<line x1="190" y1="130" x2="110" y2="205" stroke="#64748b" stroke-width="1.6"/>
<line x1="190" y1="130" x2="270" y2="205" stroke="#64748b" stroke-width="1.6"/>
<line x1="350" y1="130" x2="430" y2="205" stroke="#64748b" stroke-width="1.6"/>
<line x1="510" y1="130" x2="570" y2="205" stroke="#64748b" stroke-width="1.6"/>
<line x1="190" y1="130" x2="350" y2="130" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="5 4"/>
<ellipse cx="60" cy="50" rx="45" ry="21" fill="#fde68a" stroke="#64748b"/><text x="60" y="54" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="140" y="33" width="100" height="34" rx="7" fill="#fed7aa" stroke="#64748b"/><text x="190" y="54" text-anchor="middle" class="svg-ink" font-size="12">Border leaf</text>
<rect x="307" y="33" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="313" y1="38" x2="387" y2="38" stroke="#16a34a" stroke-width="2"/><text x="350" y="54" text-anchor="middle" class="svg-ink" font-size="12">Spine</text>
<rect x="138" y="113" width="104" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="144" y1="142" x2="236" y2="142" stroke="#0284c7" stroke-width="2"/><text x="190" y="134" text-anchor="middle" class="svg-ink" font-size="12">Service leaf</text>
<rect x="307" y="113" width="86" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="313" y1="142" x2="387" y2="142" stroke="#0284c7" stroke-width="2"/><text x="350" y="134" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="467" y="113" width="86" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="473" y1="142" x2="547" y2="142" stroke="#0284c7" stroke-width="2"/><text x="510" y="134" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="67" y="188" width="86" height="34" rx="7" fill="#fecaca" stroke="#64748b"/><line x1="71" y1="205" x2="149" y2="205" stroke="#dc2626" stroke-width="1" stroke-opacity="0.5"/><line x1="95.66666666666667" y1="190" x2="95.66666666666667" y2="205" stroke="#dc2626" stroke-opacity="0.5"/><line x1="124.33333333333334" y1="205" x2="124.33333333333334" y2="220" stroke="#dc2626" stroke-opacity="0.5"/><text x="110" y="209" text-anchor="middle" class="svg-ink" font-size="12">Firewall</text>
<rect x="215" y="188" width="110" height="34" rx="7" fill="#fbcfe8" stroke="#64748b"/><text x="270" y="209" text-anchor="middle" class="svg-ink" font-size="12">Load balancer</text>
<rect x="390" y="188" width="80" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="394" y="192" width="6" height="26" fill="#94a3b8"/><text x="430" y="209" text-anchor="middle" class="svg-ink" font-size="12">Web tier</text>
<rect x="530" y="188" width="80" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="534" y="192" width="6" height="26" fill="#94a3b8"/><text x="570" y="209" text-anchor="middle" class="svg-ink" font-size="12">DB tier</text>
<text x="275" y="122" text-anchor="middle" class="svg-muted" font-size="12">PBR redirect</text>
<line x1="16" y1="228" x2="624" y2="228" stroke="#e2e8f0"/><rect x="16" y="238" width="14" height="12" rx="2" fill="#fde68a" stroke="#64748b"/><text x="35" y="248" class="svg-muted" font-size="11">WAN / cloud</text><rect x="102.85714285714286" y="238" width="14" height="12" rx="2" fill="#fed7aa" stroke="#64748b"/><text x="121.85714285714286" y="248" class="svg-muted" font-size="11">Border / gateway</text><rect x="189.71428571428572" y="238" width="14" height="12" rx="2" fill="#bbf7d0" stroke="#64748b"/><text x="208.71428571428572" y="248" class="svg-muted" font-size="11">Spine</text><rect x="276.57142857142856" y="238" width="14" height="12" rx="2" fill="#bae6fd" stroke="#64748b"/><text x="295.57142857142856" y="248" class="svg-muted" font-size="11">Leaf / access</text><rect x="363.42857142857144" y="238" width="14" height="12" rx="2" fill="#fecaca" stroke="#64748b"/><text x="382.42857142857144" y="248" class="svg-muted" font-size="11">Firewall</text><rect x="450.28571428571433" y="238" width="14" height="12" rx="2" fill="#fbcfe8" stroke="#64748b"/><text x="469.28571428571433" y="248" class="svg-muted" font-size="11">Load balancer</text><rect x="537.1428571428571" y="238" width="14" height="12" rx="2" fill="#e2e8f0" stroke="#64748b"/><text x="556.1428571428571" y="248" class="svg-muted" font-size="11">Server / host</text>
</svg><p class="cap">Service leaf firewall aur load balancer rakhta hai. Fabric sirf jin flows ko services chahiye unhe redirect karta hai; baaki traffic shortest path leta hai.</p></div>

<h3>Symmetry aur failure</h3>
<p>Stateful firewall ko flow ke dono directions dikhne chahiye. PBR mein forward aur return dono direction ke liye redirect configure karte ho, aur kai firewalls ho to <b>symmetric</b> hashing chahiye taaki ek flow hamesha ek hi firewall tak pahunche. Health tracking har service node check karti hai, aur node mar jaye to policy security rule ke hisaab se use bypass kar sakti hai, traffic drop kar sakti hai, ya bache nodes use kar sakti hai.</p>

<h3>Brightwave ke liye chosen design</h3>
<p>North-south: internet edge ke liye border leaves par VRF sandwich. East-west: web aur application EPGs ya VNIs se dedicated service leaf pair ke firewall tak PBR, sirf web-to-DB flows ke liye (PCI path). Load balancer one-arm mode mein SNAT ke saath, X-Forwarded-For log karte hue. Service leaf pair par spare ports hain taaki doosra firewall jodkar symmetrically hash kiya ja sake.</p>
<pre class="out">svc-leaf-1# show port-channel summary
Group Port-Channel Type Protocol Member Ports
10    Po10(SU)     Eth  LACP     Eth1/10(P) Eth1/11(P)
<span class="hl">svc-leaf-1# show ip route vrf WEB 10.20.0.0/24</span></pre>

<div class="warn"><p><b>Common mistakes.</b> One-way redirect, jisse firewall SYN dekhta hai par SYN-ACK nahi. Service devices ko usi leaf par rakhna jahan PBR use karne wale servers hain. Firewall ko average load ke liye size karna, monthly peak ke liye nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Service graph khud traffic inspect nahi karta; woh path mein device insert karta hai. Unmanaged mode device ko configure nahi karta. Stateful device ko sirf redirection nahi, symmetry chahiye.</p></div>

<div class="scn"><h4>Brightwave mein kya galat hua</h4><p>Pehle sale din random payment failures aaye. One-arm mode ka load balancer SNAT use karta tha, par ek doosre rule ne database replies ko server se seedha wapas bhej diya, load balancer bypass karke; firewall ne un flows ka sirf aadha hissa dekha aur unhe out-of-state maan kar drop kar diya. Engineers ne dono firewall ports par capture karke asymmetric path pakda, phir return-direction redirect jodi aur NAT rules align kiye.</p><p><b>Lesson:</b> go-live se pehle ek session ka forward aur return path trace karo.</p></div>

<div class="iv"><p class="q">"Saara traffic firewall se bhejne se kaise bachoge?"</p><p>PBR ya service graph use karo taaki sirf inspection wale flows redirect hon, aur gateway fabric mein distributed rakho. Failures ke liye symmetry aur health tracking batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Service insertion options: gateway, VRF sandwich, transparent, PBR/service graph.</li>
<li>PBR sirf un flows ko redirect karta hai jinhe services chahiye.</li>
<li>Stateful devices ko dono directions mein symmetric paths chahiye.</li>
<li>Load balancer modes: inline, one-arm with SNAT, DSR.</li>
<li>ACI service graph: managed vs unmanaged mode.</li>
</ul></div>

`}};export{e as default};