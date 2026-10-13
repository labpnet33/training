var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a box and finished with a working WAN edge. This chapter pulls everything together so that you can revise quickly before an interview or the exam. Read the checklist, test yourself on the glossary, and rehearse the commands.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Edge onboarding summary">
<rect x="10" y="10" width="140" height="60" rx="8" fill="#e2e8f0"/><text x="80" y="35" text-anchor="middle" class="svg-ink" font-size="13">Mode</text><text x="80" y="55" text-anchor="middle" class="svg-muted" font-size="12">controller mode</text>
<rect x="165" y="10" width="140" height="60" rx="8" fill="#bae6fd"/><text x="235" y="35" text-anchor="middle" class="svg-ink" font-size="13">Identity</text><text x="235" y="55" text-anchor="middle" class="svg-muted" font-size="12">cert, WAN edge list</text>
<rect x="320" y="10" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="390" y="35" text-anchor="middle" class="svg-ink" font-size="13">Day-0</text><text x="390" y="55" text-anchor="middle" class="svg-muted" font-size="12">VPN 0, system block</text>
<rect x="475" y="10" width="155" height="60" rx="8" fill="#bbf7d0"/><text x="552" y="35" text-anchor="middle" class="svg-ink" font-size="13">Control plane</text><text x="552" y="55" text-anchor="middle" class="svg-muted" font-size="12">DTLS to Controllers</text>
<rect x="10" y="90" width="140" height="60" rx="8" fill="#fde68a"/><text x="80" y="115" text-anchor="middle" class="svg-ink" font-size="13">TLOCs</text><text x="80" y="135" text-anchor="middle" class="svg-muted" font-size="12">color, restrict</text>
<rect x="165" y="90" width="140" height="60" rx="8" fill="#fed7aa"/><text x="235" y="115" text-anchor="middle" class="svg-ink" font-size="13">NAT</text><text x="235" y="135" text-anchor="middle" class="svg-muted" font-size="12">STUN, hole punch</text>
<rect x="320" y="90" width="140" height="60" rx="8" fill="#bae6fd"/><text x="390" y="115" text-anchor="middle" class="svg-ink" font-size="13">OMP + BFD</text><text x="390" y="135" text-anchor="middle" class="svg-muted" font-size="12">routes + tunnel health</text>
<rect x="475" y="90" width="155" height="60" rx="8" fill="#ddd6fe"/><text x="552" y="115" text-anchor="middle" class="svg-ink" font-size="13">HA</text><text x="552" y="135" text-anchor="middle" class="svg-muted" font-size="12">two edges, VRRP</text>
<rect x="10" y="170" width="620" height="40" rx="8" fill="#f1f5f9"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">Troubleshoot bottom-up: underlay, control, identity, OMP, BFD, service side</text>
</svg><p class="cap">The whole module on one page.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Name the WAN edge platforms (Catalyst 8000, ISR, ASR, vEdge) and explain autonomous versus controller mode.</li>
<li>Switch a router to controller mode and verify it with <code>show platform software device-mode</code>.</li>
<li>Compare PnP, ZTP, bootstrap file and manual onboarding, and say which file names are used.</li>
<li>Explain the WAN edge list, the Valid, Staging and Invalid states, and the Send to Controllers step.</li>
<li>Write a day-0 configuration: system block, VPN 0 interfaces, default route, Tunnel interface and <code>tunnel-interface</code> settings.</li>
<li>Explain VPN 0, VPN 512 and service VPNs, and static, DHCP and routed underlay addressing.</li>
<li>Define a TLOC; explain colors, public versus private, <code>restrict</code>, <code>carrier</code>, <code>bind</code> and <code>allow-service</code>.</li>
<li>Explain STUN, public and private TLOC addresses, hole punching, port 12346 and symmetric NAT.</li>
<li>Configure a service VRF and advertise it into OMP; read OMP routes and TLOCs.</li>
<li>Explain BFD defaults and how BFD resolves TLOCs.</li>
<li>Design a dual-edge site with same site ID, VRRP and preferences; describe hubs.</li>
<li>Troubleshoot in order, reading the connection-history error code.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>WAN edge</dt><dd>The router at a site that builds overlay tunnels (cEdge on IOS XE, vEdge on Viptela OS).</dd>
<dt>Controller mode</dt><dd>IOS XE mode in which the router joins the SD-WAN fabric and is managed centrally.</dd>
<dt>PnP / ZTP</dt><dd>Automatic onboarding: PnP for IOS XE, ZTP for vEdge.</dd>
<dt>Bootstrap file</dt><dd>File generated in the Manager with Validator address, organization name, system IP and site ID.</dd>
<dt>WAN edge list</dt><dd>Authorized devices (serial or chassis number) with a Valid, Staging or Invalid state.</dd>
<dt>System IP</dt><dd>A /32 identifier of the device, like a router ID; not necessarily routable.</dd>
<dt>Site ID</dt><dd>Number shared by all edges of one location. Same site ID, no tunnels between them.</dd>
<dt>TLOC</dt><dd>System IP + color + encapsulation; the address of one WAN attachment.</dd>
<dt>Color</dt><dd>Label for a circuit type. Private: mpls, metro-ethernet, private1 to private6. Public: the rest.</dd>
<dt>Restrict</dt><dd>Tunnels only to TLOCs with the same color.</dd>
<dt>VPN 0 / VPN 512</dt><dd>Transport VPN and management VPN. Service VPNs carry user traffic.</dd>
<dt>STUN</dt><dd>Mechanism that tells an edge its public IP and port as seen from outside.</dd>
<dt>OMP</dt><dd>Overlay Management Protocol; edge to Controller; AD 251 on IOS XE.</dd>
<dt>BFD</dt><dd>Tunnel heartbeat and measurement; 1000 ms hello, multiplier 7 by default.</dd>
</dl>

<h3>Most tested facts</h3>
<ol>
<li>The edge contacts the Validator first; the Validator connection is temporary.</li>
<li>One Manager connection per edge; one Controller connection per TLOC (up to max-control-connections).</li>
<li>Hardware bootstrap: <code>ciscosdwan.cfg</code>; virtual: <code>ciscosdwan_cloud_init.cfg</code> with the token.</li>
<li><code>controller-mode enable</code> erases the configuration.</li>
<li>Organization name must match on all devices; the WAN edge list must be sent to the Controllers.</li>
<li>Private colors use private IPs; public colors use public IPs.</li>
<li>Base UDP port 12346; additional TLOCs use offsets; port hopping is possible.</li>
<li>Symmetric NAT breaks direct tunnels.</li>
<li>OMP routes need a resolved TLOC (BFD up) to install; code m, AD 251.</li>
<li>VPN 512 is not advertised in OMP.</li>
</ol>

<h3>Command cheat-sheet</h3>
<pre class="code">controller-mode enable | disable
show platform software device-mode
request platform software sdwan config reset
request platform software sdwan vedge_cloud activate chassis-number &lt;n&gt; token &lt;t&gt;
request platform software sdwan root-cert-chain install bootflash:&lt;file&gt;
show sdwan control connections
show sdwan control connection-history
show sdwan control local-properties
show sdwan omp summary
show sdwan omp routes vpn 10
show sdwan omp tlocs
show sdwan bfd sessions
show sdwan bfd summary
show ip route vrf 10
ping vrf 10 &lt;ip&gt;
traceroute vrf 10 &lt;ip&gt;</pre>

<div class="warn"><p><b>Common mistakes to revise.</b> No default route in VPN 0; device left Invalid; organization name mismatch; color mismatch with restrict; no <code>advertise</code> line for a learned protocol; forgetting that same-site edges do not tunnel.</p></div>
<div class="exam"><p><b>Exam trap to revise.</b> The question may mention "serial number" for a virtual router or "Staging" as a full member. Slow down and map the keyword to the platform and state.</p></div>

<div class="scn"><h4>The first week at Bharat Retail</h4><p>A new network engineer was given three Catalyst 8200 routers and one rule: be online by Friday. On Monday she brought E-DEL-1 up by bootstrap, Tuesday E-MUM-1 by PnP, and on Wednesday E-BLR-1 by manual day-0 because the branch had no PnP route. The failure came on Thursday: BLR had a color typo. Using the six-step order, she found it in ten minutes.</p><p><b>Lesson:</b> a fixed method matters more than memorising commands.</p></div>

<div class="iv"><p class="q">"Summarise how a branch edge joins a Catalyst SD-WAN fabric."</p><p>Strong answer: controller-mode IOS XE router, authorized in the WAN edge list; day-0 gives underlay and the system block; it contacts the Validator, learns the Manager and Controller, authenticates with its certificate, builds control connections and OMP, receives configuration, exchanges TLOCs and routes, and forms IPsec tunnels with BFD. Add NAT traversal and HA if time allows.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identity, authorization and reachability are the three requirements for onboarding.</li>
<li>TLOC, color, restrict and NAT decide which tunnels form.</li>
<li>OMP advertises routes; BFD proves tunnels and resolves TLOCs.</li>
<li>Dual-edge sites use the same site ID, VRRP or routing, and preference.</li>
<li>Troubleshoot bottom-up and read the control connection error code.</li>
</ul></div>
`,hi:`
<p>Aapne box se shuru kiya aur working WAN edge par khatam kiya. Yeh chapter sab kuch ek jagah laata hai taaki aap interview ya exam se pehle jaldi revise kar sako. Checklist padho, glossary par khud ko test karo, aur commands ka rehearsal karo.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Edge onboarding summary">
<rect x="10" y="10" width="140" height="60" rx="8" fill="#e2e8f0"/><text x="80" y="35" text-anchor="middle" class="svg-ink" font-size="13">Mode</text><text x="80" y="55" text-anchor="middle" class="svg-muted" font-size="12">controller mode</text>
<rect x="165" y="10" width="140" height="60" rx="8" fill="#bae6fd"/><text x="235" y="35" text-anchor="middle" class="svg-ink" font-size="13">Identity</text><text x="235" y="55" text-anchor="middle" class="svg-muted" font-size="12">cert, WAN edge list</text>
<rect x="320" y="10" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="390" y="35" text-anchor="middle" class="svg-ink" font-size="13">Day-0</text><text x="390" y="55" text-anchor="middle" class="svg-muted" font-size="12">VPN 0, system block</text>
<rect x="475" y="10" width="155" height="60" rx="8" fill="#bbf7d0"/><text x="552" y="35" text-anchor="middle" class="svg-ink" font-size="13">Control plane</text><text x="552" y="55" text-anchor="middle" class="svg-muted" font-size="12">Controllers se DTLS</text>
<rect x="10" y="90" width="140" height="60" rx="8" fill="#fde68a"/><text x="80" y="115" text-anchor="middle" class="svg-ink" font-size="13">TLOCs</text><text x="80" y="135" text-anchor="middle" class="svg-muted" font-size="12">color, restrict</text>
<rect x="165" y="90" width="140" height="60" rx="8" fill="#fed7aa"/><text x="235" y="115" text-anchor="middle" class="svg-ink" font-size="13">NAT</text><text x="235" y="135" text-anchor="middle" class="svg-muted" font-size="12">STUN, hole punch</text>
<rect x="320" y="90" width="140" height="60" rx="8" fill="#bae6fd"/><text x="390" y="115" text-anchor="middle" class="svg-ink" font-size="13">OMP + BFD</text><text x="390" y="135" text-anchor="middle" class="svg-muted" font-size="12">routes + tunnel health</text>
<rect x="475" y="90" width="155" height="60" rx="8" fill="#ddd6fe"/><text x="552" y="115" text-anchor="middle" class="svg-ink" font-size="13">HA</text><text x="552" y="135" text-anchor="middle" class="svg-muted" font-size="12">do edges, VRRP</text>
<rect x="10" y="170" width="620" height="40" rx="8" fill="#f1f5f9"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">Neeche se troubleshoot karo: underlay, control, identity, OMP, BFD, service side</text>
</svg><p class="cap">Poora module ek page par.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>WAN edge platforms (Catalyst 8000, ISR, ASR, vEdge) ke naam batao aur autonomous versus controller mode samjhao.</li>
<li>Router ko controller mode mein switch karo aur <code>show platform software device-mode</code> se verify karo.</li>
<li>PnP, ZTP, bootstrap file aur manual onboarding compare karo, aur batao kaunse file names use hote hain.</li>
<li>WAN edge list, Valid, Staging aur Invalid states, aur Send to Controllers step samjhao.</li>
<li>Day-0 configuration likho: system block, VPN 0 interfaces, default route, Tunnel interface aur <code>tunnel-interface</code> settings.</li>
<li>VPN 0, VPN 512 aur service VPNs, aur static, DHCP aur routed underlay addressing samjhao.</li>
<li>TLOC define karo; colors, public versus private, <code>restrict</code>, <code>carrier</code>, <code>bind</code> aur <code>allow-service</code> samjhao.</li>
<li>STUN, public aur private TLOC addresses, hole punching, port 12346 aur symmetric NAT samjhao.</li>
<li>Service VRF configure karo aur use OMP mein advertise karo; OMP routes aur TLOCs padho.</li>
<li>BFD defaults aur BFD TLOCs ko kaise resolve karta hai samjhao.</li>
<li>Same site ID, VRRP aur preferences ke saath dual-edge site design karo; hubs describe karo.</li>
<li>Connection-history error code padhkar order mein troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>WAN edge</dt><dd>Site ka router jo overlay tunnels banata hai (IOS XE par cEdge, Viptela OS par vEdge).</dd>
<dt>Controller mode</dt><dd>IOS XE mode jismein router SD-WAN fabric join karta hai aur centrally manage hota hai.</dd>
<dt>PnP / ZTP</dt><dd>Automatic onboarding: IOS XE ke liye PnP, vEdge ke liye ZTP.</dd>
<dt>Bootstrap file</dt><dd>Manager mein bani file jismein Validator address, organization name, system IP aur site ID hota hai.</dd>
<dt>WAN edge list</dt><dd>Authorized devices (serial ya chassis number) jinki state Valid, Staging ya Invalid hoti hai.</dd>
<dt>System IP</dt><dd>Device ka /32 identifier, router ID jaisa; zaroori nahi ki routable ho.</dd>
<dt>Site ID</dt><dd>Ek location ke saare edges ka shared number. Same site ID, unke beech tunnels nahi.</dd>
<dt>TLOC</dt><dd>System IP + color + encapsulation; ek WAN attachment ka address.</dd>
<dt>Color</dt><dd>Circuit type ka label. Private: mpls, metro-ethernet, private1 se private6. Public: baaki sab.</dd>
<dt>Restrict</dt><dd>Sirf same color wale TLOCs se tunnels.</dd>
<dt>VPN 0 / VPN 512</dt><dd>Transport VPN aur management VPN. Service VPNs user traffic le jaate hain.</dd>
<dt>STUN</dt><dd>Mechanism jo edge ko bahar se dikhta uska public IP aur port batata hai.</dd>
<dt>OMP</dt><dd>Overlay Management Protocol; edge se Controller; IOS XE par AD 251.</dd>
<dt>BFD</dt><dd>Tunnel heartbeat aur measurement; default 1000 ms hello, multiplier 7.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ol>
<li>Edge pehle Validator se contact karta hai; Validator connection temporary hai.</li>
<li>Har edge ka ek Manager connection; har TLOC par ek Controller connection (max-control-connections tak).</li>
<li>Hardware bootstrap: <code>ciscosdwan.cfg</code>; virtual: token ke saath <code>ciscosdwan_cloud_init.cfg</code>.</li>
<li><code>controller-mode enable</code> configuration erase karta hai.</li>
<li>Organization name sab devices par match hona chahiye; WAN edge list Controllers ko bheji jaani chahiye.</li>
<li>Private colors private IPs use karte hain; public colors public IPs.</li>
<li>Base UDP port 12346; additional TLOCs offsets use karte hain; port hopping possible hai.</li>
<li>Symmetric NAT direct tunnels tod deta hai.</li>
<li>OMP routes ko install hone ke liye resolved TLOC (BFD up) chahiye; code m, AD 251.</li>
<li>VPN 512 OMP mein advertise nahi hota.</li>
</ol>

<h3>Command cheat-sheet</h3>
<pre class="code">controller-mode enable | disable
show platform software device-mode
request platform software sdwan config reset
request platform software sdwan vedge_cloud activate chassis-number &lt;n&gt; token &lt;t&gt;
request platform software sdwan root-cert-chain install bootflash:&lt;file&gt;
show sdwan control connections
show sdwan control connection-history
show sdwan control local-properties
show sdwan omp summary
show sdwan omp routes vpn 10
show sdwan omp tlocs
show sdwan bfd sessions
show sdwan bfd summary
show ip route vrf 10
ping vrf 10 &lt;ip&gt;
traceroute vrf 10 &lt;ip&gt;</pre>

<div class="warn"><p><b>Revise karne wali common mistakes.</b> VPN 0 mein default route nahi; device Invalid chhoda; organization name mismatch; restrict ke saath color mismatch; learned protocol ke liye <code>advertise</code> line nahi; yeh bhoolna ki same-site edges tunnel nahi banate.</p></div>
<div class="exam"><p><b>Revise karne wala exam trap.</b> Sawal virtual router ke liye "serial number" ya "Staging" ko full member bata sakta hai. Dheere chalo aur keyword ko platform aur state se map karo.</p></div>

<div class="scn"><h4>Bharat Retail mein pehla hafta</h4><p>Ek naye network engineer ko teen Catalyst 8200 routers diye gaye aur ek rule: Friday tak online ho jao. Monday ko usne E-DEL-1 ko bootstrap se up kiya, Tuesday ko E-MUM-1 ko PnP se, aur Wednesday ko E-BLR-1 ko manual day-0 se kyunki branch ke paas PnP route nahi tha. Failure Thursday ko aaya: BLR mein color typo tha. Six-step order use karke usne dus minute mein dhoondh liya.</p><p><b>Seekh:</b> fixed method commands yaad karne se zyada matter karta hai.</p></div>

<div class="iv"><p class="q">"Batao ki branch edge Catalyst SD-WAN fabric mein kaise join karta hai."</p><p>Strong answer: controller-mode IOS XE router, WAN edge list mein authorized; day-0 underlay aur system block deta hai; woh Validator se contact karta hai, Manager aur Controller ka pata lagata hai, certificate se authenticate karta hai, control connections aur OMP banata hai, configuration receive karta hai, TLOCs aur routes exchange karta hai, aur BFD ke saath IPsec tunnels banata hai. Time ho to NAT traversal aur HA jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identity, authorization aur reachability onboarding ki teen requirements hain.</li>
<li>TLOC, color, restrict aur NAT decide karte hain ki kaunse tunnels bante hain.</li>
<li>OMP routes advertise karta hai; BFD tunnels prove karta hai aur TLOCs resolve karta hai.</li>
<li>Dual-edge sites same site ID, VRRP ya routing, aur preference use karte hain.</li>
<li>Neeche se troubleshoot karo aur control connection error code padho.</li>
</ul></div>
`}};export{e as default};