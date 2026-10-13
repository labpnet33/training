var e={id:`summary`,h:{en:`Summary and exam checklist: Unified SASE`,hi:`Summary aur exam checklist: Unified SASE`},body:{en:`
<p>You have followed one branch from a plain ION to a secured SASE site. This chapter is your last-minute review: what you must be able to do, the words you must know, the facts the exam likes, and a cheat sheet. Unified SASE is about 14% of the exam, but its ideas also appear in the Operations and Troubleshooting domains.</p>
<h3>Can-do checklist</h3>
<ul>
<li>Explain SASE and the roles of Prisma SD-WAN, Prisma Access, ADEM and Strata Cloud Manager.</li>
<li>Distinguish mobile users, remote networks and service connections, and say what each is for.</li>
<li>State the prerequisites for SASE Easy Onboarding and the Panorama-managed extras.</li>
<li>Do the one-time SASE connectivity setup and connect a site, choosing primary and secondary locations.</li>
<li>Explain what gets created: one tunnel per circuit (maximum four), BGP, a /31 inner address per tunnel.</li>
<li>Write path policy so that internet and SaaS use Prisma Access, private applications use the fabric, and selected applications break out locally.</li>
<li>Define fail-open and fail-closed behaviour for tunnel loss.</li>
<li>Enable and read ADEM for remote sites, and know its capacity limits.</li>
<li>Describe User-ID and Device-ID policy flows and limits.</li>
<li>Explain what CloudBlades are and why native onboarding replaces the Prisma Access CloudBlade for branches.</li>
<li>Verify a SASE site in layers and know where SASE incidents appear.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>SASE</dt><dd>Secure Access Service Edge: networking and security delivered together from the cloud.</dd>
<dt>Prisma Access</dt><dd>Palo Alto Networks cloud-delivered security for mobile users, branches and private application access.</dd>
<dt>Remote network</dt><dd>A branch or office connected to Prisma Access with IPsec tunnels.</dd>
<dt>Service connection</dt><dd>Also Corporate Access Node; connects a data center or headquarters; no internet egress over it.</dd>
<dt>Compute location</dt><dd>A Prisma Access region where tunnels terminate and bandwidth is allocated.</dd>
<dt>IPsec termination node</dt><dd>The gateway in a location that terminates a branch tunnel.</dd>
<dt>Aggregate bandwidth</dt><dd>Pooled bandwidth allocated per compute location.</dd>
<dt>Site-based licensing</dt><dd>Per-site bandwidth in five tiers from 25 Mbps to 2.5 Gbps (RN-HP).</dd>
<dt>SASE Easy Onboarding</dt><dd>Native integration that builds ION to Prisma Access tunnels without a CloudBlade.</dd>
<dt>Deployment mode</dt><dd>Private-App-Access, Internet-Only or Internet-Only-With-Mobile-User-Access; controls BGP route-map behaviour.</dd>
<dt>ADEM</dt><dd>Autonomous Digital Experience Management: segment-by-segment experience measurement.</dd>
<dt>User-ID, Device-ID</dt><dd>Policy based on user and group, or on device type.</dd>
<dt>CloudBlade</dt><dd>An integration module on the controller that automates tasks with another platform.</dd>
<dt>TSG</dt><dd>Tenant service group: the account container for subscriptions; both products must share it.</dd>
</dl>
<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr><tr><td>Software</td><td>ION 5.6 or later for SASE Easy Onboarding</td></tr><tr><td>Account</td><td>Prisma SD-WAN and Prisma Access in the same TSG</td></tr><tr><td>Tunnels</td><td>One per circuit, up to four circuits per site; /31 per tunnel from the inner pool</td></tr><tr><td>One-time setup</td><td>ION peering local AS (private recommended), deployment mode, inner IP pool, optional zone</td></tr><tr><td>Deployment modes</td><td>Private-App-Access (default), Internet-Only (no-advertise), Internet-Only-With-Mobile-User-Access (no-export)</td></tr><tr><td>Licensing</td><td>Aggregate bandwidth per compute location, or site-based five tiers</td></tr><tr><td>Service connection</td><td>No internet egress; limits depend on licence</td></tr><tr><td>ECMP</td><td>Needs BGP; up to four tunnels from a remote network</td></tr><tr><td>Existing CloudBlade</td><td>Deactivate and contact support before native onboarding</td></tr><tr><td>ADEM on ION</td><td>Native; monitors Prisma Access, secure fabric, direct access; backup paths double tests</td></tr><tr><td>User-ID</td><td>WAN-to-LAN between branches with direct tunnels; not DC-originated or transit</td></tr><tr><td>Device-ID</td><td>IoT Security licensing; DHCP relay or server for DHCP visibility</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="diagram">
<rect x="10" y="30" width="95" height="60" rx="10" fill="#bae6fd"/><text x="57" y="55" text-anchor="middle" class="svg-ink" font-size="11">1 Prereqs</text><text x="57" y="72" text-anchor="middle" class="svg-muted" font-size="10">5.6, TSG, licence</text>
<rect x="115" y="30" width="95" height="60" rx="10" fill="#ddd6fe"/><text x="162" y="55" text-anchor="middle" class="svg-ink" font-size="11">2 SASE setup</text><text x="162" y="72" text-anchor="middle" class="svg-muted" font-size="10">AS, mode, pool</text>
<rect x="220" y="30" width="95" height="60" rx="10" fill="#bbf7d0"/><text x="267" y="55" text-anchor="middle" class="svg-ink" font-size="11">3 Connect</text><text x="267" y="72" text-anchor="middle" class="svg-muted" font-size="10">locations, tunnels</text>
<rect x="325" y="30" width="95" height="60" rx="10" fill="#fde68a"/><text x="372" y="55" text-anchor="middle" class="svg-ink" font-size="11">4 Policy</text><text x="372" y="72" text-anchor="middle" class="svg-muted" font-size="10">path rules</text>
<rect x="430" y="30" width="95" height="60" rx="10" fill="#fed7aa"/><text x="477" y="55" text-anchor="middle" class="svg-ink" font-size="11">5 ADEM</text><text x="477" y="72" text-anchor="middle" class="svg-muted" font-size="10">enable, allow</text>
<rect x="535" y="30" width="95" height="60" rx="10" fill="#fecaca"/><text x="582" y="55" text-anchor="middle" class="svg-ink" font-size="11">6 Verify</text><text x="582" y="72" text-anchor="middle" class="svg-muted" font-size="10">layers</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Unified SASE rollout in six steps</text>
</svg><p class="cap">The six steps of a SASE rollout, each covered by one chapter of this module.</p></div>
<h3>Command and portal cheat sheet</h3>
<table class="cmp"><tr><th>Need</th><th>Where</th></tr><tr><td>One-time SASE settings</td><td>Configuration, Resources, SASE Connectivity</td></tr><tr><td>Connect or edit a site</td><td>Configuration, Prisma SD-WAN, Branch Sites: Connect to Prisma Access, Edit Connectivity</td></tr><tr><td>See tunnels</td><td>Site, Overlay Connections, Branch-Standard VPN</td></tr><tr><td>Path rules</td><td>Configuration, Prisma SD-WAN, Policies, Paths</td></tr><tr><td>ADEM per location</td><td>Configuration, NGFW and Prisma Access, Remote Networks, Bandwidth Management, Autonomous DEM column</td></tr><tr><td>ION checks</td><td>dump controller status, dump routing peer status all, dump standingalarms</td></tr></table>
<div class="warn"><p><b>Common mistakes to avoid on the exam.</b> Choosing the ION as the place for advanced threat inspection; forgetting that tunnels need path policy to carry traffic; confusing remote networks with service connections; ignoring the TSG; assuming a deployment-mode change updates old tunnels.</p></div>
<div class="exam"><p><b>Exam trap.</b> When a question gives you a symptom (tunnels up, no internet), think in layers: tunnel, BGP, path policy, security zone, ADEM. When it asks about design (fail open or closed, local breakout), answer with the requirement first (security, latency, regulation) and then the mechanism.</p></div>
<div class="scn"><h4>Go-live day</h4><p>Harbor Retail runs the six-step rollout on br-pune-01 on a Saturday. At step 6 the BGP peer is Established, the flow shows Prisma Access for web traffic and the fabric for ERP, and ADEM scores are good. One check fails: the security zone for the tunnels was not bound. They bind it, retest and sign off, with all six checks attached to the ticket.</p><p><b>Lesson:</b> a checklist finds the one thing you forgot.</p></div>
<div class="iv"><p class="q">"Summarise how you would roll out Prisma SD-WAN with Prisma Access to 50 branches."</p><p>Confirm prerequisites (ION 5.6 or later, one TSG, licensing and bandwidth per location). Do the one-time SASE setup, then onboard sites using a template approach with the nearest primary and a secondary location per site. Write path policy for internet and SaaS, private applications and local breakout exceptions, with a defined failure behaviour. Enable ADEM per location, verify each site in layers, and keep runbooks with the incident codes.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>SASE = SD-WAN plus cloud security; Prisma SD-WAN steers, Prisma Access inspects, ADEM measures.</li><li>Onboarding needs ION 5.6 or later, one TSG, licensing and no old CloudBlade.</li><li>One tunnel per circuit, up to four; BGP and a /31 per tunnel; path policy carries traffic.</li><li>Design the failure behaviour and the local breakout exceptions deliberately.</li><li>Verify in layers and use ADEM to find the unhealthy segment.</li></ul></div>
`,hi:`
<p>Aapne ek branch ko plain ION se secured SASE site tak jaate dekha. Yeh chapter aapka aakhri review hai: aap kya kar sakte ho, kaun se shabd jaanne hain, exam ko kaun se facts pasand hain, aur ek cheat sheet. Unified SASE exam ka lagbhag 14% hai, par iske ideas Operations aur Troubleshooting domains mein bhi aate hain.</p>
<h3>Can-do checklist</h3>
<ul>
<li>SASE aur Prisma SD-WAN, Prisma Access, ADEM tatha Strata Cloud Manager ke roles samjhao.</li>
<li>Mobile users, remote networks aur service connections mein fark batao aur har ek kis liye hai.</li>
<li>SASE Easy Onboarding ke prerequisites aur Panorama-managed extras batao.</li>
<li>One-time SASE connectivity setup karo aur primary tatha secondary locations chunkar site connect karo.</li>
<li>Samjhao kya create hota hai: har circuit ke liye ek tunnel (maximum chaar), BGP, har tunnel ke liye /31 inner address.</li>
<li>Path policy aise likho ki internet aur SaaS Prisma Access use karein, private applications fabric, aur chune hue applications locally break out karein.</li>
<li>Tunnel loss ke liye fail-open aur fail-closed behaviour define karo.</li>
<li>Remote sites ke liye ADEM enable karo aur padho, aur uski capacity limits jaano.</li>
<li>User-ID aur Device-ID policy flows aur limits describe karo.</li>
<li>Samjhao CloudBlades kya hain aur branches ke liye native onboarding Prisma Access CloudBlade ki jagah kyun leta hai.</li>
<li>SASE site ko layers mein verify karo aur jaano SASE incidents kahan dikhte hain.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>SASE</dt><dd>Secure Access Service Edge: networking aur security cloud se saath mein deliver.</dd>
<dt>Prisma Access</dt><dd>Mobile users, branches aur private application access ke liye Palo Alto Networks ki cloud-delivered security.</dd>
<dt>Remote network</dt><dd>IPsec tunnels se Prisma Access se juda branch ya office.</dd>
<dt>Service connection</dt><dd>Corporate Access Node bhi kehte hain; data center ya headquarters ko jodta hai; us par internet egress nahi.</dd>
<dt>Compute location</dt><dd>Prisma Access region jahan tunnels terminate hote hain aur bandwidth allocate hoti hai.</dd>
<dt>IPsec termination node</dt><dd>Location ka gateway jo branch tunnel terminate karta hai.</dd>
<dt>Aggregate bandwidth</dt><dd>Har compute location ke liye allocate pooled bandwidth.</dd>
<dt>Site-based licensing</dt><dd>25 Mbps se 2.5 Gbps ke paanch tiers mein per-site bandwidth (RN-HP).</dd>
<dt>SASE Easy Onboarding</dt><dd>Native integration jo bina CloudBlade ke ION se Prisma Access tunnels banata hai.</dd>
<dt>Deployment mode</dt><dd>Private-App-Access, Internet-Only ya Internet-Only-With-Mobile-User-Access; BGP route-map behaviour control karta hai.</dd>
<dt>ADEM</dt><dd>Autonomous Digital Experience Management: segment-by-segment experience measurement.</dd>
<dt>User-ID, Device-ID</dt><dd>User aur group, ya device type par based policy.</dd>
<dt>CloudBlade</dt><dd>Controller par integration module jo kisi doosre platform ke saath kaam automate karta hai.</dd>
<dt>TSG</dt><dd>Tenant service group: subscriptions ka account container; dono products ko share karna hoga.</dd>
</dl>
<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr><tr><td>Software</td><td>SASE Easy Onboarding ke liye ION 5.6 ya baad</td></tr><tr><td>Account</td><td>Prisma SD-WAN aur Prisma Access same TSG mein</td></tr><tr><td>Tunnels</td><td>Har circuit ke liye ek, per site chaar circuits tak; inner pool se har tunnel /31</td></tr><tr><td>One-time setup</td><td>ION peering local AS (private recommended), deployment mode, inner IP pool, optional zone</td></tr><tr><td>Deployment modes</td><td>Private-App-Access (default), Internet-Only (no-advertise), Internet-Only-With-Mobile-User-Access (no-export)</td></tr><tr><td>Licensing</td><td>Compute location par aggregate bandwidth, ya paanch tiers mein site-based</td></tr><tr><td>Service connection</td><td>Internet egress nahi; limits licence par nirbhar</td></tr><tr><td>ECMP</td><td>BGP chahiye; remote network se chaar tunnels tak</td></tr><tr><td>Maujooda CloudBlade</td><td>Native onboarding se pehle deactivate karo aur support se contact karo</td></tr><tr><td>ION par ADEM</td><td>Native; Prisma Access, secure fabric, direct access monitor karta hai; backup paths tests double karte hain</td></tr><tr><td>User-ID</td><td>Direct tunnels wale branches ke beech WAN-to-LAN; DC-originated ya transit nahi</td></tr><tr><td>Device-ID</td><td>IoT Security licensing; DHCP visibility ke liye DHCP relay ya server</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="diagram">
<rect x="10" y="30" width="95" height="60" rx="10" fill="#bae6fd"/><text x="57" y="55" text-anchor="middle" class="svg-ink" font-size="11">1 Prereqs</text><text x="57" y="72" text-anchor="middle" class="svg-muted" font-size="10">5.6, TSG, licence</text>
<rect x="115" y="30" width="95" height="60" rx="10" fill="#ddd6fe"/><text x="162" y="55" text-anchor="middle" class="svg-ink" font-size="11">2 SASE setup</text><text x="162" y="72" text-anchor="middle" class="svg-muted" font-size="10">AS, mode, pool</text>
<rect x="220" y="30" width="95" height="60" rx="10" fill="#bbf7d0"/><text x="267" y="55" text-anchor="middle" class="svg-ink" font-size="11">3 Connect</text><text x="267" y="72" text-anchor="middle" class="svg-muted" font-size="10">locations, tunnels</text>
<rect x="325" y="30" width="95" height="60" rx="10" fill="#fde68a"/><text x="372" y="55" text-anchor="middle" class="svg-ink" font-size="11">4 Policy</text><text x="372" y="72" text-anchor="middle" class="svg-muted" font-size="10">path rules</text>
<rect x="430" y="30" width="95" height="60" rx="10" fill="#fed7aa"/><text x="477" y="55" text-anchor="middle" class="svg-ink" font-size="11">5 ADEM</text><text x="477" y="72" text-anchor="middle" class="svg-muted" font-size="10">enable, allow</text>
<rect x="535" y="30" width="95" height="60" rx="10" fill="#fecaca"/><text x="582" y="55" text-anchor="middle" class="svg-ink" font-size="11">6 Verify</text><text x="582" y="72" text-anchor="middle" class="svg-muted" font-size="10">layers</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Chhe steps mein Unified SASE rollout</text>
</svg><p class="cap">SASE rollout ke chhe steps, har ek is module ke ek chapter mein covered.</p></div>
<h3>Command aur portal cheat sheet</h3>
<table class="cmp"><tr><th>Zaroorat</th><th>Kahan</th></tr><tr><td>One-time SASE settings</td><td>Configuration, Resources, SASE Connectivity</td></tr><tr><td>Site connect ya edit</td><td>Configuration, Prisma SD-WAN, Branch Sites: Connect to Prisma Access, Edit Connectivity</td></tr><tr><td>Tunnels dekhna</td><td>Site, Overlay Connections, Branch-Standard VPN</td></tr><tr><td>Path rules</td><td>Configuration, Prisma SD-WAN, Policies, Paths</td></tr><tr><td>Location ke hisaab se ADEM</td><td>Configuration, NGFW and Prisma Access, Remote Networks, Bandwidth Management, Autonomous DEM column</td></tr><tr><td>ION checks</td><td>dump controller status, dump routing peer status all, dump standingalarms</td></tr></table>
<div class="warn"><p><b>Exam mein bachne wali common galtiyan.</b> Advanced threat inspection ke liye ION chun lena; bhoolna ki tunnels ko traffic le jaane ke liye path policy chahiye; remote networks aur service connections ko confuse karna; TSG ko ignore karna; maan lena ki deployment-mode change purane tunnels ko update karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jab sawal symptom de (tunnels up, internet nahi), layers mein socho: tunnel, BGP, path policy, security zone, ADEM. Jab design poochhe (fail open ya closed, local breakout), pehle requirement (security, latency, regulation) se jawab do, phir mechanism se.</p></div>
<div class="scn"><h4>Go-live ka din</h4><p>Harbor Retail Saturday ko br-pune-01 par chhe-step rollout chalata hai. Step 6 par BGP peer Established hai, flow web traffic ke liye Prisma Access aur ERP ke liye fabric dikhata hai, aur ADEM scores achhe hain. Ek check fail hota hai: tunnels ka security zone bind nahi tha. Woh bind karte hain, dobara test karte hain aur sign off karte hain, chhahon checks ticket ke saath attach.</p><p><b>Seekh:</b> checklist woh ek cheez dhoondhti hai jo aap bhool gaye.</p></div>
<div class="iv"><p class="q">"50 branches par Prisma SD-WAN ko Prisma Access ke saath roll out karna summarise karo."</p><p>Prerequisites confirm karta hoon (ION 5.6 ya baad, ek TSG, har location ki licensing aur bandwidth). One-time SASE setup karta hoon, phir template approach se sites onboard karta hoon, har site ke liye sabse paas primary aur secondary location ke saath. Internet aur SaaS, private applications aur local breakout exceptions ke liye path policy likhta hoon, defined failure behaviour ke saath. Har location par ADEM enable karta hoon, har site ko layers mein verify karta hoon, aur incident codes ke saath runbooks rakhta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>SASE = SD-WAN plus cloud security; Prisma SD-WAN steer karta hai, Prisma Access inspect karta hai, ADEM naapta hai.</li><li>Onboarding ko ION 5.6 ya baad, ek TSG, licensing aur koi purana CloudBlade nahi chahiye.</li><li>Har circuit ke liye ek tunnel, chaar tak; BGP aur har tunnel /31; path policy traffic le jaati hai.</li><li>Failure behaviour aur local breakout exceptions jaan-boojhkar design karo.</li><li>Layers mein verify karo aur ADEM se unhealthy segment dhoondo.</li></ul></div>
`}};export{e as default};