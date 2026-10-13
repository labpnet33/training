var e={id:`sase-connectivity`,h:{en:`Troubleshooting SASE: Prisma Access tunnels, BGP, policy and service reachability`,hi:`SASE troubleshooting: Prisma Access tunnels, BGP, policy aur service reachability`},body:{en:`
<p>When Prisma SD-WAN works with Prisma Access, a new set of parts sits between the user and the internet: an IPsec tunnel, a BGP session, a path rule, a security zone, and a cloud location you do not own. Think of a parcel that goes through a customs checkpoint run by another company. When the parcel is late, you ask: did it reach the checkpoint (tunnel), did the checkpoint know where it was going (BGP and routes), was it allowed on the road to the checkpoint (policy), and is the checkpoint itself working (cloud side)? This chapter walks those questions in order. It builds on psd-sase chapters 4 and 8 and on psd-ops chapter 8.</p>
<h3>The SASE ladder</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="diagram">
<rect x="10" y="10" width="620" height="38" rx="8" fill="#fecaca"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">1  Prerequisites: same TSG, licence, no old CloudBlade, ION 5.6 or later</text>
<rect x="10" y="56" width="620" height="38" rx="8" fill="#fed7aa"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">2  Circuit: the WAN circuit and DNS work (chapter 3)</text>
<rect x="10" y="102" width="620" height="38" rx="8" fill="#fde68a"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">3  Tunnel: connected, up on each circuit, IKE and IPsec agree</text>
<rect x="10" y="148" width="620" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">4  BGP: peer Established, routes learned and advertised as intended</text>
<rect x="10" y="194" width="620" height="38" rx="8" fill="#bae6fd"/><text x="320" y="218" text-anchor="middle" class="svg-ink" font-size="13">5  Policy: path rule sends the application, security zone allows it</text>
<rect x="10" y="240" width="620" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="264" text-anchor="middle" class="svg-ink" font-size="13">6  Cloud side: location, bandwidth, Prisma Access policy, ADEM</text>
</svg><p class="cap">Six rungs for a SASE ticket. The first wrong rung is usually the fault.</p></div>
<h3>Rung 1: prerequisites and licence</h3>
<ul>
<li>Are both products in the same tenant service group? If the Prisma Access locations do not appear, this is the cause.</li>
<li>Is the licensing model right (aggregate bandwidth per compute location, or site-based tiers), and is there bandwidth left in that location?</li>
<li>Is an old CloudBlade connection still active for the same site? It conflicts with native onboarding and can cause flapping.</li>
<li>Is the ION on 5.6 or later?</li>
</ul>
<h3>Rung 3: the tunnel</h3>
<p>In Strata Cloud Manager open the site, Overlay Connections, Branch-Standard VPN to see the tunnels and the Prisma Access peer details. The Branch Sites list shows the SASE Connection state. If a tunnel is down:</p>
<table class="cmp"><tr><th>Cause</th><th>Check</th></tr><tr><td>The circuit or DNS is broken</td><td>Chapter 3: interface, label, DNS, MTU</td></tr><tr><td>Crypto or identity mismatch</td><td>IKE version, pre-shared key or certificate, local and remote IDs, and IPsec profile must agree. SASE onboarding can synchronise IPsec profiles with Prisma Access (an optional step in SASE connectivity)</td></tr><tr><td>NAT in front of the ION</td><td>External NAT address and UDP 4500 (chapter 3)</td></tr><tr><td>Inner address overlap</td><td>The tunnel inner IP pool must be unique and not overlap the Palo Alto service infrastructure subnet</td></tr><tr><td>Wrong or distant termination node</td><td>Primary location and IPsec termination node chosen for the site; compare with a secondary</td></tr><tr><td>Probes failing for a standard VPN endpoint</td><td>For manually built standard VPN endpoints, liveliness probes (ICMP ping or HTTP) with intervals and failure thresholds decide health; check the probe target and thresholds</td></tr></table>
<p>For a manually configured standard VPN to an IPsec or GRE endpoint, the documentation notes that IKEv2 with re-authentication is recommended for NAT traversal and multiple tunnels, and that IKEv1 aggressive mode is legacy and should be avoided. For GRE tunnels, apply a zone-based firewall policy because GRE is not encrypted.</p>
<h3>Rung 4: BGP and routes</h3>
<p>SASE Easy Onboarding sets up BGP between the ION and Prisma Access. Check that the peer is Established with <code>dump routing peer status all</code>, and that the routes you expect are advertised and received. The deployment mode matters:</p>
<ul>
<li><b>Private-App-Access</b> (default): private applications and internet.</li>
<li><b>Internet-Only</b>: routes are advertised with BGP no-advertise, so they are not passed on.</li>
<li><b>Internet-Only-With-Mobile-User-Access</b>: routes with no-export.</li>
</ul>
<p>If mobile users cannot reach a branch, or a LAN peer cannot learn Prisma Access routes, check the dynamic routing options (summarise mobile user routes, advertise default route, do-not-export) and the deployment mode. Remember that the ION does not need Prisma Access routes to forward internet traffic, because path policy steers it; the routes matter for mobile users and LAN peers. A change of deployment mode affects only new or modified tunnels, so an old tunnel may still carry the old behaviour.</p>
<h4>Reference configuration (not run in the simulator)</h4>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! br-pune-01 ION, read-only; use the CLI help for options</span>
dump routing peer status all
dump routing peer received-routes
dump routing peer advertised-routes
dump standingalarms</pre>
<h3>Rung 5: policy</h3>
<p>Tunnels up and BGP Established, but traffic is not secured? Use the chapter 5 chain: is there a path rule that lists the Prisma Access path for the application, is a higher rule shadowing it, and what does the flow view say? Check the security zone bound to the tunnels and the zone rules between the LAN and that zone: a missing zone rule denies the traffic at the ION. Remember that local breakout is protected only by the ION zone firewall; if a flow is going direct when you expect Prisma Access, that is a policy issue, not a tunnel issue.</p>
<h3>Rung 6: the cloud side</h3>
<ul>
<li>Is the compute location healthy, and is there a planned maintenance? Does a secondary location exist for backup?</li>
<li>Is the allocated bandwidth for the location exhausted (many sites on one location)?</li>
<li>Does the Prisma Access policy permit the traffic?</li>
<li>For ADEM, is Autonomous DEM enabled for the location, and are the ADEM addresses and test traffic allowed?</li>
</ul>
<h4>Illustrative output, not captured from a device</h4>
<pre class="out">Illustrative portal view (story values)
Branch Sites, br-delhi-02
SASE Connection        : <span class="hl">disconnected</span>
Branch-Standard VPN    : tunnel ISP-A  <span class="hl">down</span>   tunnel ISP-B  up
Incident (Security Services): standard VPN to cloud security service unavailable, ISP-A, raised 09:02
Audit log, 08:55        : firewall rule change at the site (UDP 500 and 4500 now blocked on ISP-A path)</pre>
<p>This made-up view reads as: the problem is on the ISP-A tunnel only, the incident time matches an audit log change at the site, and the IKE and NAT-T ports are now blocked on that path. Reverting or correcting the firewall change restores the tunnel. The incident wording is paraphrased; use the codes your own release shows.</p>
<div class="eg"><p><b>Worked example.</b> Ticket: br-chennai-03 users cannot browse; branch internet goes to Prisma Access. Rung 1: same TSG, bandwidth fine. Rung 3: both tunnels up. Rung 4: the BGP peer is Established. Rung 5: the flow view shows a Prisma Access path, but the security zone for the tunnels is not bound and the zone rule set denies LAN to that zone. The engineer binds the zone and adds the allow rule. Rung 6 was not needed.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Calling Prisma Access when the tunnel is fine and the zone rule denies. Forgetting that old tunnels keep old deployment-mode behaviour. Treating the SASE Connection state as proof that traffic flows. Not checking the audit log for firewall or policy changes at the site. Assuming a cloud-side problem before the ION side is proven.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tunnels up and BGP Established but no traffic secured points to path policy or the security zone. Tunnel down on one circuit only points to that circuit, NAT or IPsec settings. Prisma Access locations not visible points to the tenant service group. A previously configured CloudBlade must be deactivated first.</p></div>
<div class="scn"><h4>The planned maintenance</h4><p>All three Harbor Retail branches lost Prisma Access at 02:00 on a Sunday. The ION side was healthy: tunnels flapped in sync, circuits were fine, nothing changed in the audit log. The cloud provider had scheduled maintenance for the compute location. The secondary location had been configured only for br-pune-01, so only that branch stayed secured. The team added a secondary location to the other two branches.</p><p><b>Lesson:</b> synchronised failures across sites point to the cloud side; design a secondary for every branch.</p></div>
<div class="iv"><p class="q">"Prisma Access tunnels are up but branch users cannot browse. What do you check?"</p><p>I move up the ladder: BGP established, then path policy: is there a rule for the application that lists the Prisma Access path and is nothing above it shadowing it; the security zone bound to the tunnels and the zone rules; then the flow view to see the real path; and finally the cloud side, bandwidth and Prisma Access policy. The tunnel alone does not carry traffic.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>SASE ladder: prerequisites, circuit, tunnel, BGP, policy, cloud side.</li><li>Branch-Standard VPN and SASE Connection show tunnel state; dump routing peer status shows BGP.</li><li>Deployment mode and routing options decide which routes are advertised; old tunnels keep old behaviour.</li><li>Tunnels up with no secured traffic points to path policy or zone rules.</li><li>Synchronised failures across sites suggest the cloud side; give every branch a secondary location.</li></ul></div>
`,hi:`
<p>Jab Prisma SD-WAN Prisma Access ke saath kaam karta hai, to user aur internet ke beech parts ka naya set aa jaata hai: IPsec tunnel, BGP session, path rule, security zone, aur ek cloud location jiske aap maalik nahi. Ek parcel socho jo kisi doosri company ke customs checkpoint se guzarta hai. Parcel late ho to aap poochhte ho: kya woh checkpoint tak pahuncha (tunnel), kya checkpoint ko pata tha woh kahan jaa raha hai (BGP aur routes), kya use checkpoint ke raaste par jaane diya gaya (policy), aur kya checkpoint khud kaam kar raha hai (cloud side)? Yeh chapter in sawalon ko order mein chalata hai. Yeh psd-sase ke chapters 4 aur 8 aur psd-ops ke chapter 8 par bana hai.</p>
<h3>SASE ladder</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="diagram">
<rect x="10" y="10" width="620" height="38" rx="8" fill="#fecaca"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">1  Prerequisites: same TSG, licence, koi purana CloudBlade nahi, ION 5.6 ya baad</text>
<rect x="10" y="56" width="620" height="38" rx="8" fill="#fed7aa"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">2  Circuit: WAN circuit aur DNS kaam karte hain (chapter 3)</text>
<rect x="10" y="102" width="620" height="38" rx="8" fill="#fde68a"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">3  Tunnel: connected, har circuit par up, IKE aur IPsec agree</text>
<rect x="10" y="148" width="620" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">4  BGP: peer Established, routes jaise chahiye waise learn aur advertise</text>
<rect x="10" y="194" width="620" height="38" rx="8" fill="#bae6fd"/><text x="320" y="218" text-anchor="middle" class="svg-ink" font-size="13">5  Policy: path rule application bhejti hai, security zone allow karta hai</text>
<rect x="10" y="240" width="620" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="264" text-anchor="middle" class="svg-ink" font-size="13">6  Cloud side: location, bandwidth, Prisma Access policy, ADEM</text>
</svg><p class="cap">SASE ticket ke liye chhe rungs. Pehli galat rung aksar fault hoti hai.</p></div>
<h3>Rung 1: prerequisites aur licence</h3>
<ul>
<li>Kya dono products same tenant service group mein hain? Prisma Access locations na dikhein to yahi wajah hai.</li>
<li>Kya licensing model sahi hai (compute location ke hisaab se aggregate bandwidth, ya site-based tiers), aur kya us location mein bandwidth bachi hai?</li>
<li>Kya usi site ke liye purana CloudBlade connection abhi active hai? Woh native onboarding se conflict karta hai aur flapping kar sakta hai.</li>
<li>Kya ION 5.6 ya baad par hai?</li>
</ul>
<h3>Rung 3: tunnel</h3>
<p>Strata Cloud Manager mein site kholo, Overlay Connections, Branch-Standard VPN mein tunnels aur Prisma Access peer details dekho. Branch Sites list SASE Connection state dikhati hai. Agar tunnel down hai:</p>
<table class="cmp"><tr><th>Wajah</th><th>Check</th></tr><tr><td>Circuit ya DNS toota</td><td>Chapter 3: interface, label, DNS, MTU</td></tr><tr><td>Crypto ya identity mismatch</td><td>IKE version, pre-shared key ya certificate, local aur remote IDs, aur IPsec profile agree hone chahiye. SASE onboarding Prisma Access ke saath IPsec profiles synchronise kar sakta hai (SASE connectivity ka optional step)</td></tr><tr><td>ION ke saamne NAT</td><td>External NAT address aur UDP 4500 (chapter 3)</td></tr><tr><td>Inner address overlap</td><td>Tunnel inner IP pool unique hona chahiye aur Palo Alto service infrastructure subnet se overlap nahi</td></tr><tr><td>Galat ya door ka termination node</td><td>Site ke liye chuna primary location aur IPsec termination node; secondary se compare karo</td></tr><tr><td>Standard VPN endpoint ke liye probes fail</td><td>Manually bane standard VPN endpoints ke liye liveliness probes (ICMP ping ya HTTP) intervals aur failure thresholds ke saath health tay karte hain; probe target aur thresholds check karo</td></tr></table>
<p>IPsec ya GRE endpoint tak manually configured standard VPN ke liye documentation note karti hai ki NAT traversal aur multiple tunnels ke liye re-authentication wala IKEv2 recommend hai, aur IKEv1 aggressive mode legacy hai jisse bachna chahiye. GRE tunnels ke liye zone-based firewall policy lagao kyunki GRE encrypted nahi hota.</p>
<h3>Rung 4: BGP aur routes</h3>
<p>SASE Easy Onboarding ION aur Prisma Access ke beech BGP set up karta hai. <code>dump routing peer status all</code> se check karo ki peer Established hai, aur jo routes expected hain woh advertised aur received hain. Deployment mode matter karta hai:</p>
<ul>
<li><b>Private-App-Access</b> (default): private applications aur internet.</li>
<li><b>Internet-Only</b>: routes BGP no-advertise ke saath advertise hote hain, isliye aage pass nahi hote.</li>
<li><b>Internet-Only-With-Mobile-User-Access</b>: routes no-export ke saath.</li>
</ul>
<p>Agar mobile users branch tak nahi pahunchte, ya LAN peer Prisma Access routes learn nahi kar paata, to dynamic routing options (mobile user routes summarise, default route advertise, do-not-export) aur deployment mode check karo. Yaad rakho ki ION ko internet traffic forward karne ke liye Prisma Access routes nahi chahiye, kyunki path policy use steer karti hai; routes mobile users aur LAN peers ke liye matter karte hain. Deployment mode badalne ka asar sirf naye ya modified tunnels par hota hai, isliye purana tunnel abhi bhi purana behaviour rakh sakta hai.</p>
<h4>Reference configuration (not run in the simulator)</h4>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! br-pune-01 ION, read-only; use the CLI help for options</span>
dump routing peer status all
dump routing peer received-routes
dump routing peer advertised-routes
dump standingalarms</pre>
<h3>Rung 5: policy</h3>
<p>Tunnels up aur BGP Established, par traffic secured nahi? Chapter 5 ki chain use karo: kya application ke liye Prisma Access path list karne wali path rule hai, kya koi upar ki rule use shadow kar rahi hai, aur flow view kya kehta hai? Tunnels se bound security zone aur LAN se us zone ke beech zone rules check karo: missing zone rule traffic ko ION par deny karti hai. Yaad rakho ki local breakout sirf ION zone firewall se protected hai; agar flow direct jaa raha hai jabki aap Prisma Access expect karte ho, to yeh policy issue hai, tunnel issue nahi.</p>
<h3>Rung 6: cloud side</h3>
<ul>
<li>Kya compute location healthy hai, aur kya planned maintenance hai? Kya backup ke liye secondary location hai?</li>
<li>Kya location ki allocated bandwidth khatam ho gayi (ek location par bahut si sites)?</li>
<li>Kya Prisma Access policy traffic permit karti hai?</li>
<li>ADEM ke liye, kya location ke liye Autonomous DEM enabled hai, aur kya ADEM addresses aur test traffic allowed hain?</li>
</ul>
<h4>Illustrative output, not captured from a device</h4>
<pre class="out">Illustrative portal view (story values)
Branch Sites, br-delhi-02
SASE Connection        : <span class="hl">disconnected</span>
Branch-Standard VPN    : tunnel ISP-A  <span class="hl">down</span>   tunnel ISP-B  up
Incident (Security Services): standard VPN to cloud security service unavailable, ISP-A, raised 09:02
Audit log, 08:55        : firewall rule change at the site (UDP 500 and 4500 now blocked on ISP-A path)</pre>
<p>Yeh banayi hui view aise padhi jaati hai: problem sirf ISP-A tunnel par hai, incident ka time site par audit log change se match karta hai, aur us path par IKE aur NAT-T ports ab blocked hain. Firewall change ko revert ya correct karne se tunnel wapas aata hai. Incident ki wording paraphrase hai; apni release ke dikhaye codes use karo.</p>
<div class="eg"><p><b>Worked example.</b> Ticket: br-chennai-03 ke users browse nahi kar paate; branch internet Prisma Access jaata hai. Rung 1: same TSG, bandwidth theek. Rung 3: dono tunnels up. Rung 4: BGP peer Established. Rung 5: flow view Prisma Access path dikhata hai, par tunnels ka security zone bound nahi hai aur zone rule set LAN se us zone ko deny karta hai. Engineer zone bind karta hai aur allow rule jodta hai. Rung 6 ki zaroorat nahi padi.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Prisma Access ko call karna jabki tunnel theek hai aur zone rule deny karti hai. Bhoolna ki purane tunnels purana deployment-mode behaviour rakhte hain. SASE Connection state ko saboot maanna ki traffic chal raha hai. Site par firewall ya policy changes ke liye audit log na dekhna. ION side prove hone se pehle cloud-side problem maan lena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tunnels up aur BGP Established par koi traffic secured nahi: path policy ya security zone ki taraf. Sirf ek circuit par tunnel down: us circuit, NAT ya IPsec settings ki taraf. Prisma Access locations na dikhna: tenant service group ki taraf. Pehle se configured CloudBlade ko pehle deactivate karna hoga.</p></div>
<div class="scn"><h4>Planned maintenance</h4><p>Sunday 02:00 par Harbor Retail ke teeno branches ne Prisma Access kho diya. ION side healthy tha: tunnels sync mein flap hue, circuits theek the, audit log mein kuch nahi badla. Cloud provider ne compute location ka maintenance schedule kiya tha. Secondary location sirf br-pune-01 ke liye configure thi, isliye sirf wahi branch secured raha. Team ne baaki do branches mein secondary location jodi.</p><p><b>Seekh:</b> sites ke beech synchronised failures cloud side ki taraf ishara karte hain; har branch ke liye secondary design karo.</p></div>
<div class="iv"><p class="q">"Prisma Access tunnels up hain par branch users browse nahi kar paate. Kya check karoge?"</p><p>Main ladder par upar jaata hoon: BGP established, phir path policy: kya application ke liye Prisma Access path list karne wali rule hai aur kya uske upar koi shadow nahi kar rahi; tunnels se bound security zone aur zone rules; phir asli path dekhne ke liye flow view; aur aakhir mein cloud side, bandwidth aur Prisma Access policy. Sirf tunnel traffic nahi le jaata.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>SASE ladder: prerequisites, circuit, tunnel, BGP, policy, cloud side.</li><li>Branch-Standard VPN aur SASE Connection tunnel state dikhate hain; dump routing peer status BGP dikhata hai.</li><li>Deployment mode aur routing options tay karte hain kaun se routes advertise hon; purane tunnels purana behaviour rakhte hain.</li><li>Tunnels up par koi traffic secured nahi: path policy ya zone rules.</li><li>Sites ke beech synchronised failures cloud side ki taraf; har branch ko secondary location do.</li></ul></div>
`}};export{e as default};