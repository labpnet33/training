function e(e,t,n,r,i,a){return`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`}function t(t,n,r,i){return`<g stroke="#64748b" fill="`+r+`"><ellipse cx="`+(t-22)+`" cy="`+(n+6)+`" rx="22" ry="13"/><ellipse cx="`+(t+22)+`" cy="`+(n+6)+`" rx="22" ry="13"/><ellipse cx="`+t+`" cy="`+(n-6)+`" rx="24" ry="16"/></g><g fill="`+r+`"><ellipse cx="`+(t-22)+`" cy="`+(n+6)+`" rx="21" ry="12"/><ellipse cx="`+(t+22)+`" cy="`+(n+6)+`" rx="21" ry="12"/><ellipse cx="`+t+`" cy="`+(n-6)+`" rx="23" ry="15"/><rect x="`+(t-22)+`" y="`+(n-2)+`" width="44" height="20"/></g>`+e(t,n+4,i,`svg-ink`,11)}function n(t,n,r,i){return`<rect x="`+t+`" y="`+n+`" width="28" height="34" fill="`+r+`" stroke="#64748b"/><path d="M`+(t+6)+` `+(n+8)+`h4M`+(t+18)+` `+(n+8)+`h4M`+(t+6)+` `+(n+18)+`h4M`+(t+18)+` `+(n+18)+`h4" stroke="#1e293b" stroke-width="3"/>`+e(t+14,n+48,i,`svg-ink`,11)}function r(e,t,n,r,i){return`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"`+(i?` stroke-dasharray="5 4"`:``)+`/>`}function i(i){return`<div class="dia"><svg viewBox="0 0 640 310" role="img" aria-label="`+i.alt+`">`+r(74,57,296,70)+r(74,57,296,160,1)+r(74,147,296,160)+r(74,147,296,250,1)+r(74,237,296,160)+r(74,237,296,250,1)+r(344,70,546,85)+r(344,160,546,90)+r(344,160,546,180)+r(344,250,546,185,1)+t(320,70,`#bae6fd`,`MPLS`)+t(320,160,`#bbf7d0`,`Internet`)+t(320,250,`#fde68a`,`LTE/5G`)+n(46,40,`#e2e8f0`,i.a)+n(46,130,`#e2e8f0`,i.b)+n(46,220,`#e2e8f0`,i.c)+n(546,70,`#ddd6fe`,`DC 1`)+n(546,170,`#ddd6fe`,`DC 2`)+e(320,22,i.t,`svg-accent`,13)+`<line x1="150" y1="298" x2="180" y2="298" stroke="#64748b" stroke-width="2"/>`+e(186,302,i.p,`svg-ink`,11,`start`)+`<line x1="330" y1="298" x2="360" y2="298" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>`+e(366,302,i.k,`svg-ink`,11,`start`)+`</svg><p class="cap">`+i.cap+`</p></div>`}var a=i({alt:`Three store tiers connect to two data centres over MPLS, internet and LTE/5G`,a:`Tier A: 12`,b:`Tier B: 100`,c:`Tier C: 28`,t:`Underlay transports per store tier`,p:`Primary path`,k:`Backup path`,cap:`The tiered WAN: bigger stores get a private MPLS circuit plus internet, smaller stores get internet plus a cellular backup. Each tier is a different risk and cost level.`}),o=i({alt:`Teen store tiers do data centres se MPLS, internet aur LTE/5G ke through jude hain`,a:`Tier A: 12`,b:`Tier B: 100`,c:`Tier C: 28`,t:`Har store tier ke underlay transports`,p:`Primary path`,k:`Backup path`,cap:`Tiered WAN: bade stores ko private MPLS circuit plus internet milta hai, chhote stores ko internet plus cellular backup. Har tier ka risk aur cost level alag hai.`}),s={id:`wan-transport`,h:{en:`Customer case: choosing WAN transports for 140 stores`,hi:`Customer case: 140 stores ke liye WAN transports chunna`},body:{en:`
<p><b>What you will learn in this module.</b> ENSLD (300-420) is a design exam, so this module teaches you to choose, not just to configure. Across seven chapters you will read real customer cases and learn to pick WAN transports, build site-to-site VPN overlays (DMVPN, GETVPN, IPsec), design Cisco Catalyst SD-WAN with policies, regions and cloud on-ramps, make branches resilient, and shape traffic with QoS and multicast. Every chapter starts with a customer brief and ends with a post-mortem of what can go wrong. <b>Prerequisites:</b> ENCOR-level routing (OSPF, EIGRP, BGP), basic IPsec and GRE, and DSCP/QoS basics.</p>

<h3>The customer: Harbor and Pine Grocers</h3>
<p><b>Harbor and Pine Grocers</b> is a regional supermarket chain with 140 stores, 2 data centres, a head office of 600 staff and 3 distribution warehouses. Stores run point-of-sale (POS), card payment terminals, CCTV, store Wi-Fi and IP phones. Today every store has one MPLS circuit from a single carrier. The CIO wants a <b>22% cut in WAN cost</b>, card-data traffic encrypted end to end, and no store offline for more than a few minutes. The big constraint: the contract with the MPLS carrier ends in 9 months, and many small stores sit in towns where only one fibre provider and cellular coverage exist.</p>

<h3>Requirements before options</h3>
<p>A designer writes requirements first. Here they are: availability of 99.9% per store (about 8.8 hours of downtime a year), 20 Mbps average per small store and 100 Mbps for large stores, voice and payment traffic protected from video and updates, PCI-style encryption, and a bill that falls by 22%. Only after this list do we open the transport menu.</p>

<h3>The WAN transport menu</h3>
<table class="cmp"><tr><th>Option</th><th>How it works</th><th>Strength</th><th>Watch out for</th></tr>
<tr><td><b>MPLS Layer 3 VPN</b></td><td>The provider runs a routed VPN. Your CE router peers with the provider PE router (usually BGP or static).</td><td>Provider SLA, QoS classes, any-to-any connectivity, no encryption needed to isolate you</td><td>Highest cost per Mbps, slow provisioning, you share routing with the provider</td></tr>
<tr><td><b>Layer 2 VPN (VPWS point-to-point, VPLS multipoint)</b></td><td>The provider carries Ethernet frames; your routers become direct neighbours</td><td>You control routing and the IGP, transparent to protocols</td><td>A big shared broadcast domain with VPLS, so use routed design on top and limit the scope</td></tr>
<tr><td><b>Metro Ethernet / dedicated Ethernet</b></td><td>E-Line or E-LAN service with a committed rate</td><td>Predictable latency, simple handoff</td><td>Limited footprint, cost grows with distance</td></tr>
<tr><td><b>Direct Internet Access (DIA)</b></td><td>Business internet with a committed rate and SLA</td><td>Cheap bandwidth, quick to order, direct cloud access</td><td>No QoS across the internet, needs an overlay VPN</td></tr>
<tr><td><b>Broadband (cable, DSL, fibre)</b></td><td>Best-effort consumer-grade access</td><td>Lowest cost</td><td>No SLA, shared contention, slow repair</td></tr>
<tr><td><b>LTE / 5G</b></td><td>Cellular modem or built-in module on the router</td><td>Fast install, diverse from fixed lines</td><td>Data caps, variable latency, CGNAT and no inbound reachability</td></tr></table>

<h3>Underlay and overlay</h3>
<p>The <b>underlay</b> is what the carrier delivers: IP reachability between your sites. The <b>overlay</b> is the network you build on top: tunnels (GRE, IPsec, DMVPN, SD-WAN) that carry your private addressing. MPLS can serve as an underlay without any overlay, because the provider already isolates you. The internet always needs an overlay, because it offers no privacy and no isolation. A modern design treats every transport as a plain underlay and puts one consistent overlay on top, which is the idea behind both DMVPN and SD-WAN.</p>

@@DIA@@

<h3>Options, trade-offs and the chosen design</h3>
<p>Harbor and Pine considered three plans. <b>Plan 1:</b> keep MPLS everywhere (safe, but cost falls only 3%). <b>Plan 2:</b> internet-only with IPsec (cheapest, but a single cable fault takes a store offline). <b>Plan 3:</b> tiered hybrid. They chose Plan 3.</p>
<ul>
<li><b>Tier A (12 large stores, 100 Mbps):</b> MPLS L3VPN primary plus DIA for cloud and guest traffic, dual routers.</li>
<li><b>Tier B (100 medium stores, 50 Mbps):</b> two different internet access types (fibre plus cable) from different providers, plus IPsec overlay.</li>
<li><b>Tier C (28 small stores, 20 Mbps):</b> one broadband line plus a 5G router as automatic backup.</li>
</ul>
<div class="eg"><p><b>Worked cost example.</b> MPLS at 20 Mbps costs 420 per store per month. Broadband at 100 Mbps costs 90 plus a 5G plan at 35, so 125 in total. For the 128 stores in tiers B and C the saving is (420 - 125) x 128 = 37,760 per month, enough to pay for dual circuits at Tier A and still land near the 22% target.</p></div>

<div class="warn"><p><b>Common mistake.</b> Counting two circuits as redundancy while both ride the same carrier, the same street duct or the same cell tower. Ask for <b>path diversity</b> and a different provider, and check the carrier's circuit routes.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam rewards matching the transport to the requirement. Need an SLA and QoS classes: MPLS L3VPN. Need your own routing over the provider: L2VPN. Need cheap bandwidth and cloud access: DIA or broadband with an overlay. Need fast backup or a temporary site: LTE or 5G. No option wins for every requirement.</p></div>

<div class="scn"><h4>Post-mortem: two circuits, one fibre cut</h4><p>Before the redesign a Tier B store had a primary internet line and a "backup" line, both from the same carrier. A road crew cut the shared duct and the store lost card payments for five hours on a Saturday. The new design buys the second circuit from a different carrier, and the 5G router uses a different network path altogether. Monitoring now probes both transports every few seconds.</p><p><b>Lesson:</b> redundancy exists only when failure domains (carrier, duct, power, tower) are independent.</p></div>

<div class="iv"><p class="q">"Why would you not simply replace MPLS with internet for every site?"</p><p>A strong answer: internet is cheaper but has no SLA or QoS, so you pair it with an overlay for security and a second transport for resilience. Keep MPLS where the SLA matters (large sites, voice) and use a hybrid or SD-WAN to steer traffic. Mention path diversity and that cost savings must not break the availability requirement.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Write requirements (availability, bandwidth, security, cost) before choosing transports.</li>
<li>MPLS L3VPN gives SLA and QoS; L2VPN gives routing control; DIA and broadband give cheap bandwidth; LTE and 5G give fast diverse backup.</li>
<li>Underlay is what the carrier delivers; overlay is the tunnel network you design on top.</li>
<li>Tier the sites: spend more on the sites that matter more.</li>
<li>Two circuits are redundant only if their carriers, ducts and power are independent.</li>
</ul></div>
`.replace(`@@DIA@@`,a),hi:`
<p><b>Is module mein aap kya seekhoge.</b> ENSLD (300-420) design exam hai, isliye yeh module sirf configure karna nahi, choose karna sikhata hai. Saat chapters mein aap real customer cases padhoge aur WAN transports choose karna, site-to-site VPN overlays (DMVPN, GETVPN, IPsec) banana, Cisco Catalyst SD-WAN ko policies, regions aur cloud on-ramps ke saath design karna, branches ko resilient banana aur QoS aur multicast se traffic control karna seekhoge. Har chapter customer brief se shuru hota hai aur post-mortem par khatam hota hai ki kya galat ho sakta hai. <b>Prerequisites:</b> ENCOR level routing (OSPF, EIGRP, BGP), basic IPsec aur GRE, aur DSCP/QoS basics.</p>

<h3>Customer: Harbor and Pine Grocers</h3>
<p><b>Harbor and Pine Grocers</b> ek regional supermarket chain hai: 140 stores, 2 data centres, 600 staff wala head office aur 3 distribution warehouses. Stores mein point-of-sale (POS), card payment terminals, CCTV, store Wi-Fi aur IP phones chalte hain. Abhi har store par ek single carrier ka ek MPLS circuit hai. CIO chahta hai <b>WAN cost mein 22% ki kami</b>, card-data traffic end to end encrypted, aur koi store kuch minutes se zyada offline na ho. Badi constraint: MPLS carrier ka contract 9 mahine mein khatam hota hai, aur kai chhote stores aise towns mein hain jahan sirf ek fibre provider aur cellular coverage hai.</p>

<h3>Options se pehle requirements</h3>
<p>Designer pehle requirements likhta hai. Yahan: har store par 99.9% availability (saal mein lagbhag 8.8 ghante downtime), chhote store par average 20 Mbps aur bade stores par 100 Mbps, voice aur payment traffic video aur updates se protected, PCI-style encryption, aur bill mein 22% kami. Iss list ke baad hi hum transport menu kholte hain.</p>

<h3>WAN transport menu</h3>
<table class="cmp"><tr><th>Option</th><th>Kaise kaam karta hai</th><th>Strength</th><th>Dhyan rakho</th></tr>
<tr><td><b>MPLS Layer 3 VPN</b></td><td>Provider routed VPN chalata hai. Aapka CE router provider PE router se peer karta hai (aam taur par BGP ya static).</td><td>Provider SLA, QoS classes, any-to-any connectivity, isolation ke liye encryption zaroori nahi</td><td>Per Mbps sabse mehenga, provisioning slow, routing provider ke saath share hoti hai</td></tr>
<tr><td><b>Layer 2 VPN (VPWS point-to-point, VPLS multipoint)</b></td><td>Provider Ethernet frames carry karta hai; aapke routers direct neighbour ban jaate hain</td><td>Routing aur IGP aapke control mein, protocols ke liye transparent</td><td>VPLS mein bada shared broadcast domain, isliye upar routed design rakho aur scope chhota rakho</td></tr>
<tr><td><b>Metro Ethernet / dedicated Ethernet</b></td><td>Committed rate wali E-Line ya E-LAN service</td><td>Predictable latency, simple handoff</td><td>Footprint limited, distance ke saath cost badhti hai</td></tr>
<tr><td><b>Direct Internet Access (DIA)</b></td><td>Committed rate aur SLA wala business internet</td><td>Sasta bandwidth, jaldi order, direct cloud access</td><td>Internet par QoS nahi, overlay VPN chahiye</td></tr>
<tr><td><b>Broadband (cable, DSL, fibre)</b></td><td>Best-effort consumer-grade access</td><td>Sabse kam cost</td><td>SLA nahi, contention shared, repair slow</td></tr>
<tr><td><b>LTE / 5G</b></td><td>Cellular modem ya router ka built-in module</td><td>Fast install, fixed lines se diverse</td><td>Data caps, variable latency, CGNAT aur inbound reachability nahi</td></tr></table>

<h3>Underlay aur overlay</h3>
<p><b>Underlay</b> woh hai jo carrier deliver karta hai: aapke sites ke beech IP reachability. <b>Overlay</b> woh network hai jo aap upar banate ho: tunnels (GRE, IPsec, DMVPN, SD-WAN) jo aapki private addressing carry karte hain. MPLS bina overlay ke bhi underlay ban sakta hai, kyunki provider pehle se aapko isolate karta hai. Internet ko hamesha overlay chahiye, kyunki usme privacy aur isolation nahi hota. Modern design har transport ko plain underlay maanta hai aur uske upar ek consistent overlay rakhta hai; DMVPN aur SD-WAN dono ka yahi idea hai.</p>

@@DIA@@

<h3>Options, trade-offs aur chosen design</h3>
<p>Harbor and Pine ne teen plans dekhe. <b>Plan 1:</b> har jagah MPLS rakho (safe, par cost sirf 3% girti hai). <b>Plan 2:</b> sirf internet plus IPsec (sabse sasta, par ek cable fault se store offline). <b>Plan 3:</b> tiered hybrid. Unhone Plan 3 chuna.</p>
<ul>
<li><b>Tier A (12 bade stores, 100 Mbps):</b> MPLS L3VPN primary plus cloud aur guest traffic ke liye DIA, dual routers.</li>
<li><b>Tier B (100 medium stores, 50 Mbps):</b> alag providers se do alag internet access types (fibre plus cable), plus IPsec overlay.</li>
<li><b>Tier C (28 chhote stores, 20 Mbps):</b> ek broadband line plus automatic backup ke liye 5G router.</li>
</ul>
<div class="eg"><p><b>Worked cost example.</b> 20 Mbps MPLS ka cost 420 per store per month hai. 100 Mbps broadband 90 aur 5G plan 35, yaani total 125. Tier B aur C ke 128 stores par saving (420 - 125) x 128 = 37,760 per month, jo Tier A ke dual circuits ka kharcha uthane ke baad bhi 22% target ke aaspaas pahunchati hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Do circuits ko redundancy maan lena jabki dono same carrier, same street duct ya same cell tower par chalte hain. <b>Path diversity</b> aur alag provider maango, aur carrier ke circuit routes check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam requirement ke hisaab se transport match karne ko reward karta hai. SLA aur QoS classes chahiye: MPLS L3VPN. Provider ke upar apni routing chahiye: L2VPN. Sasta bandwidth aur cloud access chahiye: DIA ya broadband with overlay. Fast backup ya temporary site: LTE ya 5G. Koi ek option har requirement ke liye nahi jeetta.</p></div>

<div class="scn"><h4>Post-mortem: do circuits, ek fibre cut</h4><p>Redesign se pehle ek Tier B store par primary internet line aur "backup" line dono same carrier ki thin. Road crew ne shared duct kaat diya aur store Saturday ko paanch ghante card payments nahi le paya. Naye design mein doosra circuit alag carrier se liya gaya, aur 5G router bilkul alag network path use karta hai. Monitoring ab har kuch seconds mein dono transports probe karti hai.</p><p><b>Lesson:</b> redundancy tabhi hai jab failure domains (carrier, duct, power, tower) independent hon.</p></div>

<div class="iv"><p class="q">"Har site par MPLS ko internet se replace kyun nahi kar dete?"</p><p>Strong answer: internet sasta hai par usme SLA ya QoS nahi, isliye security ke liye overlay aur resilience ke liye doosra transport lagate hain. Jahan SLA matter karta hai (bade sites, voice) wahan MPLS rakho, aur hybrid ya SD-WAN se traffic steer karo. Path diversity batao aur yeh ki cost saving availability requirement ko todni nahi chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Transports choose karne se pehle requirements (availability, bandwidth, security, cost) likho.</li>
<li>MPLS L3VPN SLA aur QoS deta hai; L2VPN routing control; DIA aur broadband sasta bandwidth; LTE aur 5G fast diverse backup.</li>
<li>Underlay woh hai jo carrier deta hai; overlay woh tunnel network hai jo aap upar design karte ho.</li>
<li>Sites ko tier karo: jo site zyada important hai uspar zyada kharcha karo.</li>
<li>Do circuits tabhi redundant hain jab unke carriers, ducts aur power independent hon.</li>
</ul></div>
`.replace(`@@DIA@@`,o)}};export{s as default};