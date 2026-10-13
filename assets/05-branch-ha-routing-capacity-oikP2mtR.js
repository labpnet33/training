function e(e,t,n,r,i,a){return`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`}function t(t,n,r,i){return`<g stroke="#64748b" fill="`+r+`"><ellipse cx="`+(t-22)+`" cy="`+(n+6)+`" rx="22" ry="13"/><ellipse cx="`+(t+22)+`" cy="`+(n+6)+`" rx="22" ry="13"/><ellipse cx="`+t+`" cy="`+(n-6)+`" rx="24" ry="16"/></g><g fill="`+r+`"><ellipse cx="`+(t-22)+`" cy="`+(n+6)+`" rx="21" ry="12"/><ellipse cx="`+(t+22)+`" cy="`+(n+6)+`" rx="21" ry="12"/><ellipse cx="`+t+`" cy="`+(n-6)+`" rx="23" ry="15"/><rect x="`+(t-22)+`" y="`+(n-2)+`" width="44" height="20"/></g>`+e(t,n+4,i,`svg-ink`,11)}function n(t,n,r,i){return`<circle cx="`+t+`" cy="`+n+`" r="15" fill="`+r+`" stroke="#64748b"/><path d="M`+(t-8)+` `+n+`H`+(t+8)+`M`+t+` `+(n-8)+`V`+(n+8)+`" stroke="#1e293b" stroke-width="2"/>`+(i?e(t+20,n+4,i,`svg-ink`,11,`start`):``)}function r(e,t,n,r,i){return`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"`+(i?` stroke-dasharray="5 4"`:``)+`/>`}function i(i,a,o,s){var c=`<rect x="`+i+`" y="30" width="200" height="250" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>`+e(i+100,50,a,`svg-accent`,12),l=`<rect x="`+(i+55)+`" y="228" width="90" height="22" rx="5" fill="#e2e8f0" stroke="#64748b"/>`+e(i+100,243,`LAN`,`svg-ink`,11);return o===1&&(c+=r(i+100,114,i+100,155)+t(i+100,95,`#bae6fd`,`ISP A`)+n(i+100,170,`#fde68a`,`R1`)+r(i+100,185,i+100,228)),o===2&&(c+=r(i+55,114,i+100,155)+r(i+145,114,i+100,155)+t(i+55,95,`#bae6fd`,`ISP A`)+t(i+145,95,`#bbf7d0`,`ISP B`)+n(i+100,170,`#fde68a`,`R1`)+r(i+100,185,i+100,228)),o===3&&(c+=r(i+55,114,i+55,155)+r(i+145,114,i+145,155)+r(i+70,170,i+130,170,1)+t(i+55,95,`#bae6fd`,`ISP A`)+t(i+145,95,`#bbf7d0`,`ISP B`)+n(i+55,170,`#fde68a`,``)+n(i+145,170,`#fde68a`,``)+r(i+55,185,i+80,228)+r(i+145,185,i+120,228)),c+l+e(i+100,270,s,`svg-muted`,11)}function a(e){return`<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="`+e.alt+`">`+i(10,e.p1,1,e.r1)+i(220,e.p2,2,e.r2)+i(430,e.p3,3,e.r3)+`</svg><p class="cap">`+e.cap+`</p></div>`}var o=a({alt:`Three branch resilience levels: single router single link, single router dual link, dual router dual link`,p1:`Bronze`,p2:`Silver`,p3:`Gold`,r1:`Router + link are single points`,r2:`Router is a single point`,r3:`No WAN single point`,cap:`Branch resilience classes. Each step removes one single point of failure and adds cost. Blue and green clouds are different providers; the dashed line is the router-to-router link.`}),s=a({alt:`Teen branch resilience levels: single router single link, single router dual link, dual router dual link`,p1:`Bronze`,p2:`Silver`,p3:`Gold`,r1:`Router + link single points`,r2:`Router single point hai`,r3:`WAN mein single point nahi`,cap:`Branch resilience classes. Har step ek single point of failure hatata hai aur cost badhata hai. Blue aur green clouds alag providers hain; dashed line router-to-router link hai.`}),c={id:`branch-ha-routing`,h:{en:`Customer case: resilient branches, WAN routing and capacity for 210 pharmacies`,hi:`Customer case: 210 pharmacies ke liye resilient branches, WAN routing aur capacity`},body:{en:`
<h3>The customer: Redwood Pharmacies</h3>
<p><b>Redwood Pharmacies</b> runs 210 pharmacies, 30 of them open 24 hours, and 2 data centres. Prescription lookups, insurance checks and e-prescriptions all depend on the WAN; leadership estimates an outage costs about 4,000 per hour per 24-hour store and damages trust. Two carriers provide MPLS and internet. The CTO wants to know how much resilience each class of store deserves, how routing should behave when a link or router fails, and how to size circuits without waste.</p>

<h3>Branch resilience classes</h3>
<table class="cmp"><tr><th>Class</th><th>Topology</th><th>Survives</th><th>Use for</th></tr>
<tr><td><b>Bronze</b></td><td>1 router, 1 transport</td><td>Nothing; add 4G/5G backup if budget allows</td><td>Small, low-impact sites</td></tr>
<tr><td><b>Silver</b></td><td>1 router, 2 transports</td><td>Link or provider failure</td><td>Most pharmacies</td></tr>
<tr><td><b>Gold</b></td><td>2 routers, 2 transports, redundant LAN uplinks</td><td>Router, link, provider and power-supply failure</td><td>24-hour stores, hospitals, DC front doors</td></tr></table>
<p>Redwood puts 24-hour stores in Gold, the other 180 in Silver, and 5G backup in both. Dual providers must be truly diverse in carrier and path (see chapter 1).</p>

@@DIA@@

<h3>Routing design at the WAN edge</h3>
<p><b>BGP at the edge.</b> Between a branch or DC and a carrier, BGP is the normal choice for MPLS L3VPN (CE to PE) and for dual-internet DC edges. Design rules: filter in both directions with prefix lists so you advertise only your own prefixes and accept only what you expect (never become a transit between two providers); set a maximum-prefix limit; use <b>local preference</b> to choose the outbound path and <b>AS-path prepending</b> or provider communities to influence the inbound path.</p>
<p><b>OSPF or EIGRP over the WAN.</b> When the provider carries your IGP (PE-CE), remember the provider's rules: OSPF routes crossing an MPLS VPN appear as inter-area routes unless a <b>sham link</b> is used, which matters when you also have a backdoor link between sites. EIGRP uses Site of Origin (SoO) to prevent loops at multihomed sites. Over a DMVPN or SD-WAN overlay, run one IGP or BGP and keep the design simple.</p>
<p><b>Two routers, two redistribution points.</b> A dual-router branch that redistributes between an IGP and BGP on both routers can create loops and suboptimal paths. Tag the routes where they enter and deny that tag where they would re-enter.</p>
<pre class="code"><span class="c">! CE router: filter and prefer on the provider session</span>
router bgp 65010
 neighbor 192.0.2.1 remote-as 64500
 address-family ipv4
  network 10.20.0.0 mask 255.255.0.0
  neighbor 192.0.2.1 prefix-list OUT-OWN out
  neighbor 192.0.2.1 prefix-list IN-DEFAULT in
  neighbor 192.0.2.1 route-map PREF-PRIMARY in
  neighbor 192.0.2.1 maximum-prefix 100
ip prefix-list OUT-OWN seq 5 permit 10.20.0.0/16
ip prefix-list IN-DEFAULT seq 5 permit 0.0.0.0/0
route-map PREF-PRIMARY permit 10
 set local-preference 200
<span class="c">! Tag on entry, deny the tag on the way back</span>
router ospf 1
 redistribute bgp 65010 subnets route-map BGP-TO-OSPF
route-map BGP-TO-OSPF permit 10
 set tag 100
route-map OSPF-TO-BGP deny 10
 match tag 100
route-map OSPF-TO-BGP permit 20</pre>
<pre class="out">GOLD-R1# show ip bgp summary
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
192.0.2.1       4 64500    1822    1795       41    0    0 3d02h   <span class="hl">1</span></pre>

<h3>High availability inside the branch</h3>
<p>In a Gold branch the LAN default gateway is a first-hop redundancy pair (HSRP or VRRP). The active gateway must be the router with a working WAN, so <b>track the WAN interface or a route</b> and let the standby take over when it fails. Use BFD with the routing protocol for fast detection, and tune timers carefully: too aggressive and a brief loss flaps the network. Check that each router can carry the full branch load alone.</p>

<h3>Capacity planning</h3>
<p>Plan from measurement. Use the <b>95th percentile</b> utilization over a few weeks, add growth (often 20 to 30% per year), add overlay overhead (IPsec adds roughly 10 to 20% for small packets), and upgrade when sustained utilization passes about 70%. For active/active links, keep each below 50% so one link can carry everything after a failure.</p>
<div class="eg"><p><b>Worked example.</b> A 24-hour store has a 95th percentile of 18 Mbps. Add 25% growth (22.5 Mbps) and 15% overlay overhead (about 26 Mbps). Active/active with failover means each circuit must carry 26 Mbps alone at no more than 70%, so choose 40 Mbps circuits, not 20.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sizing for the average and forgetting failover. After a failure all traffic lands on one link, so each link must be ready for the whole load.</p></div>
<div class="exam"><p><b>Exam trap.</b> Redundancy at one layer does not help if another layer is single. Two routers on one switch or one power circuit still have a single point of failure. Also remember: mutual redistribution at more than one point needs tags and filters.</p></div>

<div class="scn"><h4>Post-mortem: the active gateway with no WAN</h4><p>At a 24-hour store, R1 lost its MPLS circuit but stayed HSRP active because nothing tracked the WAN. R2 had a healthy internet link but remained standby, so pharmacy terminals sent all traffic to a router with no path. The outage lasted 40 minutes until a technician failed over by hand. The fix: HSRP tracking of the WAN route with a priority decrement, BFD on the BGP session, and a quarterly failover test.</p><p><b>Lesson:</b> a resilient design must also fail over automatically. Test it.</p></div>

<div class="iv"><p class="q">"How do you avoid routing loops with two redistribution points?"</p><p>Tag routes when they are redistributed in the first direction, then deny that tag when redistributing back. Prefer a single routing protocol or design with a clear primary and backup. Mention route filtering with prefix lists, administrative distance, and testing failure cases.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Classify sites (Bronze, Silver, Gold) and spend on resilience where outage cost is highest.</li>
<li>BGP at the edge needs inbound and outbound filters, maximum-prefix and local preference.</li>
<li>OSPF over MPLS needs sham links with a backdoor; EIGRP uses SoO.</li>
<li>Tag and filter at multiple redistribution points; track WAN state in FHRP.</li>
<li>Size circuits from the 95th percentile, growth, overhead and failover.</li>
</ul></div>
`.replace(`@@DIA@@`,o),hi:`
<h3>Customer: Redwood Pharmacies</h3>
<p><b>Redwood Pharmacies</b> 210 pharmacies chalata hai, jinme 30 24 ghante khule rehte hain, aur 2 data centres. Prescription lookups, insurance checks aur e-prescriptions sab WAN par depend karte hain; leadership ka andaza hai ki 24-hour store par outage ka cost lagbhag 4,000 per hour hai aur trust bhi girta hai. Do carriers MPLS aur internet dete hain. CTO jaanna chahta hai ki har class ke store ko kitni resilience milni chahiye, link ya router fail hone par routing kaise behave kare, aur circuits ko bina waste ke kaise size karein.</p>

<h3>Branch resilience classes</h3>
<table class="cmp"><tr><th>Class</th><th>Topology</th><th>Survive karta hai</th><th>Kahan use karein</th></tr>
<tr><td><b>Bronze</b></td><td>1 router, 1 transport</td><td>Kuch nahi; budget ho to 4G/5G backup jodo</td><td>Chhote, low-impact sites</td></tr>
<tr><td><b>Silver</b></td><td>1 router, 2 transports</td><td>Link ya provider failure</td><td>Zyadatar pharmacies</td></tr>
<tr><td><b>Gold</b></td><td>2 routers, 2 transports, redundant LAN uplinks</td><td>Router, link, provider aur power-supply failure</td><td>24-hour stores, hospitals, DC front doors</td></tr></table>
<p>Redwood 24-hour stores ko Gold mein, baaki 180 ko Silver mein, aur dono mein 5G backup rakhta hai. Dono providers carrier aur path mein sach mein diverse hone chahiye (chapter 1 dekho).</p>

@@DIA@@

<h3>WAN edge par routing design</h3>
<p><b>Edge par BGP.</b> Branch ya DC aur carrier ke beech BGP MPLS L3VPN (CE se PE) aur dual-internet DC edges ke liye normal choice hai. Design rules: dono directions mein prefix lists se filter karo taaki sirf apne prefixes advertise ho aur sirf expected prefixes accept ho (do providers ke beech kabhi transit mat bano); maximum-prefix limit lagao; outbound path chunne ke liye <b>local preference</b> aur inbound path influence karne ke liye <b>AS-path prepending</b> ya provider communities use karo.</p>
<p><b>WAN par OSPF ya EIGRP.</b> Jab provider aapka IGP carry karta hai (PE-CE), provider ke rules yaad rakho: MPLS VPN cross karne wale OSPF routes inter-area dikhte hain jab tak <b>sham link</b> na ho, jo tab zaroori hai jab sites ke beech backdoor link bhi ho. EIGRP multihomed sites par loops rokne ke liye Site of Origin (SoO) use karta hai. DMVPN ya SD-WAN overlay par ek hi IGP ya BGP chalao aur design simple rakho.</p>
<p><b>Do routers, do redistribution points.</b> Dual-router branch jo dono routers par IGP aur BGP ke beech redistribute karta hai, loops aur suboptimal paths bana sakta hai. Routes ko entry par tag karo aur jahan woh wapas ghus sakte hain wahan us tag ko deny karo.</p>
<pre class="code"><span class="c">! CE router: provider session par filter aur prefer</span>
router bgp 65010
 neighbor 192.0.2.1 remote-as 64500
 address-family ipv4
  network 10.20.0.0 mask 255.255.0.0
  neighbor 192.0.2.1 prefix-list OUT-OWN out
  neighbor 192.0.2.1 prefix-list IN-DEFAULT in
  neighbor 192.0.2.1 route-map PREF-PRIMARY in
  neighbor 192.0.2.1 maximum-prefix 100
ip prefix-list OUT-OWN seq 5 permit 10.20.0.0/16
ip prefix-list IN-DEFAULT seq 5 permit 0.0.0.0/0
route-map PREF-PRIMARY permit 10
 set local-preference 200
<span class="c">! Entry par tag, wapas aate waqt tag deny</span>
router ospf 1
 redistribute bgp 65010 subnets route-map BGP-TO-OSPF
route-map BGP-TO-OSPF permit 10
 set tag 100
route-map OSPF-TO-BGP deny 10
 match tag 100
route-map OSPF-TO-BGP permit 20</pre>
<pre class="out">GOLD-R1# show ip bgp summary
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
192.0.2.1       4 64500    1822    1795       41    0    0 3d02h   <span class="hl">1</span></pre>

<h3>Branch ke andar high availability</h3>
<p>Gold branch mein LAN default gateway first-hop redundancy pair (HSRP ya VRRP) hota hai. Active gateway wahi router hona chahiye jiske paas working WAN ho, isliye <b>WAN interface ya route ko track karo</b> aur fail hone par standby ko takeover karne do. Fast detection ke liye routing protocol ke saath BFD use karo, aur timers dhyan se tune karo: bahut aggressive hue to chhota loss bhi network flap kara dega. Check karo ki har router akela poora branch load utha sakta hai.</p>

<h3>Capacity planning</h3>
<p>Planning measurement se karo. Kuch hafton ka <b>95th percentile</b> utilization lo, growth jodo (aksar saal mein 20 se 30%), overlay overhead jodo (chhote packets par IPsec lagbhag 10 se 20% jodta hai), aur sustained utilization lagbhag 70% paar karte hi upgrade karo. Active/active links mein har link 50% ke neeche rakho taaki failure ke baad ek link sab kuch utha sake.</p>
<div class="eg"><p><b>Worked example.</b> 24-hour store ka 95th percentile 18 Mbps hai. 25% growth jodo (22.5 Mbps) aur 15% overlay overhead (lagbhag 26 Mbps). Active/active with failover mein har circuit ko akele 26 Mbps 70% se zyada nahi par uthana hai, isliye 20 nahi, 40 Mbps circuits chuno.</p></div>

<div class="warn"><p><b>Common mistake.</b> Average ke hisaab se size karna aur failover bhool jana. Failure ke baad saara traffic ek link par aata hai, isliye har link poore load ke liye ready honi chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ek layer ki redundancy kaam nahi aati agar doosri layer single hai. Ek switch ya ek power circuit par do routers bhi single point of failure rakhte hain. Yeh bhi yaad rakho: ek se zyada jagah mutual redistribution mein tags aur filters chahiye.</p></div>

<div class="scn"><h4>Post-mortem: bina WAN wala active gateway</h4><p>Ek 24-hour store par R1 ka MPLS circuit gaya par woh HSRP active hi raha kyunki kuch WAN track nahi kar raha tha. R2 ka internet link theek tha par woh standby raha, isliye pharmacy terminals sara traffic aise router ko bhejte rahe jiske paas path nahi tha. Outage 40 minutes chala jab tak technician ne haath se failover nahi kiya. Fix: priority decrement ke saath WAN route ka HSRP tracking, BGP session par BFD, aur quarterly failover test.</p><p><b>Lesson:</b> resilient design ko automatically fail over bhi karna chahiye. Test karo.</p></div>

<div class="iv"><p class="q">"Do redistribution points ke saath routing loops kaise rokte ho?"</p><p>Pehli direction mein redistribute karte waqt routes ko tag karo, aur wapas redistribute karte waqt us tag ko deny karo. Single routing protocol ya clear primary aur backup wala design prefer karo. Prefix lists se route filtering, administrative distance aur failure cases ki testing ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sites ko classify karo (Bronze, Silver, Gold) aur jahan outage cost sabse zyada ho wahan resilience par kharcha karo.</li>
<li>Edge par BGP ko inbound aur outbound filters, maximum-prefix aur local preference chahiye.</li>
<li>MPLS par OSPF ko backdoor ke saath sham links chahiye; EIGRP SoO use karta hai.</li>
<li>Multiple redistribution points par tag aur filter karo; FHRP mein WAN state track karo.</li>
<li>Circuits ko 95th percentile, growth, overhead aur failover se size karo.</li>
</ul></div>
`.replace(`@@DIA@@`,s)}};export{c as default};