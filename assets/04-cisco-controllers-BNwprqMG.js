var e={id:`cisco-controllers`,h:{en:`Underlay, overlay and fabric: Catalyst Center, SD-Access and SD-WAN`,hi:`Underlay, overlay aur fabric: Catalyst Center, SD-Access aur SD-WAN`},body:{en:`
<p>Think of a city metro. Under the ground there are concrete tunnels and steel tracks: that is the physical infrastructure. Passengers never think about tracks; they think about the <b>Blue Line</b> and the <b>Red Line</b>, routes that run on top of the same tracks. And the whole system, tracks plus lines plus the control centre, is run as one network. Controller-based networks use exactly these three words: <b>underlay</b>, <b>overlay</b> and <b>fabric</b>.</p>

<h3>Underlay, overlay, fabric</h3>
<dl class="terms">
<dt>Underlay</dt><dd>The physical network: devices, cables and a simple routed IP design whose only job is reliable reachability between the devices' loopback addresses. In Cisco SD-Access the underlay usually runs IS-IS.</dd>
<dt>Overlay</dt><dd>Virtual networks built on top of the underlay using <b>tunnels</b>. The original packet is wrapped in a new header and carried across the underlay. Examples: VXLAN in SD-Access, IPsec tunnels in SD-WAN. Overlays let you create segments that do not depend on where devices physically sit.</dd>
<dt>Fabric</dt><dd>The underlay and overlay designed, automated and managed together as one system, usually by a controller.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Overlay tunnels over an underlay">
<rect x="20" y="15" width="600" height="50" rx="8" fill="#ddd6fe"/>
<text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Controller: Catalyst Center (campus) or SD-WAN Manager (WAN)</text>
<path d="M110 150 C 200 85, 440 85, 530 150" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<path d="M110 150 C 200 115, 260 115, 320 150" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="96" text-anchor="middle" class="svg-accent" font-size="12">overlay: VXLAN or IPsec tunnels</text>
<rect x="60" y="150" width="100" height="40" rx="8" fill="#bae6fd"/><text x="110" y="175" text-anchor="middle" class="svg-ink" font-size="13">Edge 1</text>
<rect x="270" y="150" width="100" height="40" rx="8" fill="#bae6fd"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">Edge 2</text>
<rect x="480" y="150" width="100" height="40" rx="8" fill="#bae6fd"/><text x="530" y="175" text-anchor="middle" class="svg-ink" font-size="13">Border</text>
<line x1="160" y1="170" x2="270" y2="170" stroke="#64748b" stroke-width="3"/>
<line x1="370" y1="170" x2="480" y2="170" stroke="#64748b" stroke-width="3"/>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">underlay: physical links, routed IP (IS-IS)</text>
</svg><p class="cap">Solid lines are the underlay; dashed lines are overlay tunnels; everything together is the fabric.</p></div>

<h3>Cisco Catalyst Center (formerly DNA Center)</h3>
<p><b>Catalyst Center</b> is Cisco's controller and management platform for enterprise campus and branch networks. Older material and many exam questions still call it <b>Cisco DNA Center</b>; it is the same product. Its main functions:</p>
<ul>
<li><b>Discovery and inventory</b> of every device, with a live topology map.</li>
<li><b>Plug and Play (PnP)</b>: new devices are onboarded with zero-touch provisioning.</li>
<li><b>Templates</b> and <b>software image management (SWIM)</b> for consistent configuration and upgrades.</li>
<li><b>Assurance</b>: health scores for devices, clients and applications, issue detection with suggested fixes, and path trace.</li>
<li><b>Policy and fabric automation</b> for SD-Access.</li>
<li>A northbound <b>REST API</b> (the Intent API) so scripts and other systems can use all of the above. Southbound it uses SSH/CLI, SNMP and NETCONF to talk to devices.</li>
</ul>

<table class="cmp"><tr><th></th><th>Traditional device management</th><th>Catalyst Center managed</th></tr>
<tr><td>Where you configure</td><td>Each device's CLI</td><td>Central GUI or REST API, pushed to many devices</td></tr>
<tr><td>New device</td><td>Console cable, manual base config</td><td>Plug and Play, zero-touch</td></tr>
<tr><td>Upgrades</td><td>Copy image and reload box by box</td><td>SWIM, golden image, scheduled</td></tr>
<tr><td>Monitoring</td><td>SNMP tools, syslog, per-box <code>show</code></td><td>Assurance: health scores, issues, path trace</td></tr>
<tr><td>Policy</td><td>ACLs and VLANs per switch</td><td>Intent-based, by group, applied fabric-wide</td></tr></table>

<h3>SD-Access: the campus fabric</h3>
<p><b>SD-Access</b> is Cisco's campus fabric, automated by Catalyst Center with Cisco ISE providing identity and policy. Learn its building blocks at concept level:</p>
<ul>
<li><b>Underlay</b>: routed, usually IS-IS, often built automatically (LAN automation).</li>
<li><b>Overlay data plane</b>: <b>VXLAN</b> tunnels between fabric nodes.</li>
<li><b>Overlay control plane</b>: <b>LISP</b>, which keeps a database of where each endpoint is.</li>
<li><b>Policy plane</b>: Cisco TrustSec <b>Scalable Group Tags (SGTs)</b>, which group users and devices by role; virtual networks (VRFs) separate large segments.</li>
<li><b>Roles</b>: <b>edge nodes</b> connect endpoints, <b>border nodes</b> connect the fabric to outside networks, the <b>control plane node</b> runs the LISP database.</li>
</ul>

<h3>SD-WAN: the WAN fabric</h3>
<p><b>Cisco Catalyst SD-WAN</b> (formerly Viptela) builds an overlay of IPsec tunnels across any transport: MPLS, broadband internet, 4G/5G. Components:</p>
<ul>
<li><b>SD-WAN Manager</b> (vManage): the management plane, GUI and northbound REST API.</li>
<li><b>SD-WAN Controller</b> (vSmart): the control plane; distributes routes and policy with <b>OMP</b> (Overlay Management Protocol).</li>
<li><b>SD-WAN Validator</b> (vBond): authenticates and onboards devices and helps with NAT traversal.</li>
<li><b>WAN Edge</b> routers: the data plane at each site, forming IPsec tunnels and choosing a path per application.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A branch has an MPLS link and an internet link. With SD-WAN, the WAN Edge router builds IPsec tunnels over both. A policy from SD-WAN Manager says: voice uses the path with latency under 150 ms and loss under 1%. When the MPLS link starts losing 3% of packets, voice moves to the internet tunnel automatically, while bulk backup traffic stays on MPLS.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking the overlay replaces the underlay. The overlay depends completely on the underlay: if the underlay loses reachability between two loopbacks, every tunnel between them fails. Troubleshoot the underlay first.</p></div>

<div class="exam"><p><b>Exam trap.</b> Catalyst Center and DNA Center are the same controller. In SD-Access: underlay IS-IS, overlay data plane VXLAN, control plane LISP, policy SGT. In SD-WAN: Manager = management, Controller = control plane (OMP), Validator = onboarding/orchestration, WAN Edge = data plane.</p></div>

<div class="scn"><h4>Forty branches in six weeks</h4><p>A logistics company needed to connect 40 new warehouses quickly. Each site had cheap broadband and a 4G backup, no MPLS. Nobody configured the routers in advance: the WAN Edge routers were shipped straight to the sites, a local technician plugged them in, and the routers contacted the Validator, authenticated, downloaded their configuration from SD-WAN Manager and built IPsec tunnels to the data centers. When one broadband provider had an outage, traffic shifted to 4G without anyone logging in.</p><p><b>Lesson:</b> a fabric with a controller turns sites into templates, and zero-touch onboarding removes most of the site visit.</p></div>

<div class="iv"><p class="q">"What is the difference between an underlay and an overlay? Give a Cisco example."</p><p>Strong answer: the underlay is the physical, routed network that provides reachability between devices; the overlay is virtual networks built with tunnels on top of it, so segments do not depend on physical location. Together, managed as one, they form a fabric. Example: in SD-Access the underlay runs IS-IS, the overlay uses VXLAN for data, LISP for the control plane and SGTs for policy, all automated by Catalyst Center. Mention that an underlay problem breaks every overlay tunnel that crosses it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay = physical routed network; overlay = tunnels on top; fabric = both managed as one.</li>
<li>Catalyst Center (DNA Center): inventory, PnP, templates, SWIM, Assurance, SD-Access, northbound REST API.</li>
<li>SD-Access: IS-IS underlay, VXLAN data plane, LISP control plane, SGT policy; edge, border, control plane nodes.</li>
<li>SD-WAN: Manager, Controller (OMP), Validator, WAN Edge; IPsec overlay over any transport.</li>
<li>Always check the underlay before blaming the overlay.</li>
</ul></div>
`,hi:`
<p>Ek city metro socho. Zameen ke neeche concrete tunnels aur steel tracks hain: yeh physical infrastructure hai. Passengers kabhi tracks ke baare mein nahi sochte; woh <b>Blue Line</b> aur <b>Red Line</b> ke baare mein sochte hain, jo same tracks ke upar chalne wale routes hain. Aur poora system, tracks plus lines plus control centre, ek network ki tarah chalaya jaata hai. Controller-based networks bilkul yahi teen shabd use karte hain: <b>underlay</b>, <b>overlay</b> aur <b>fabric</b>.</p>

<h3>Underlay, overlay, fabric</h3>
<dl class="terms">
<dt>Underlay</dt><dd>Physical network: devices, cables aur ek simple routed IP design jiska ek hi kaam hai devices ke loopback addresses ke beech reliable reachability dena. Cisco SD-Access mein underlay aam taur par IS-IS chalata hai.</dd>
<dt>Overlay</dt><dd>Underlay ke upar <b>tunnels</b> se bane virtual networks. Original packet ek naye header mein lapeta jaata hai aur underlay ke paar le jaaya jaata hai. Examples: SD-Access mein VXLAN, SD-WAN mein IPsec tunnels. Overlays aise segments banane dete hain jo is par depend nahi karte ki devices physically kahan baithe hain.</dd>
<dt>Fabric</dt><dd>Underlay aur overlay ko ek system ki tarah saath mein design, automate aur manage karna, aam taur par ek controller se.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Underlay ke upar overlay tunnels">
<rect x="20" y="15" width="600" height="50" rx="8" fill="#ddd6fe"/>
<text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Controller: Catalyst Center (campus) ya SD-WAN Manager (WAN)</text>
<path d="M110 150 C 200 85, 440 85, 530 150" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<path d="M110 150 C 200 115, 260 115, 320 150" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="96" text-anchor="middle" class="svg-accent" font-size="12">overlay: VXLAN ya IPsec tunnels</text>
<rect x="60" y="150" width="100" height="40" rx="8" fill="#bae6fd"/><text x="110" y="175" text-anchor="middle" class="svg-ink" font-size="13">Edge 1</text>
<rect x="270" y="150" width="100" height="40" rx="8" fill="#bae6fd"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">Edge 2</text>
<rect x="480" y="150" width="100" height="40" rx="8" fill="#bae6fd"/><text x="530" y="175" text-anchor="middle" class="svg-ink" font-size="13">Border</text>
<line x1="160" y1="170" x2="270" y2="170" stroke="#64748b" stroke-width="3"/>
<line x1="370" y1="170" x2="480" y2="170" stroke="#64748b" stroke-width="3"/>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">underlay: physical links, routed IP (IS-IS)</text>
</svg><p class="cap">Solid lines underlay hain; dashed lines overlay tunnels hain; sab milkar fabric hai.</p></div>

<h3>Cisco Catalyst Center (pehle DNA Center)</h3>
<p><b>Catalyst Center</b> enterprise campus aur branch networks ke liye Cisco ka controller aur management platform hai. Purana material aur kai exam questions ise abhi bhi <b>Cisco DNA Center</b> kehte hain; yeh wahi product hai. Iske main functions:</p>
<ul>
<li>Har device ki <b>discovery aur inventory</b>, live topology map ke saath.</li>
<li><b>Plug and Play (PnP)</b>: naye devices zero-touch provisioning se onboard hote hain.</li>
<li>Consistent configuration aur upgrades ke liye <b>templates</b> aur <b>software image management (SWIM)</b>.</li>
<li><b>Assurance</b>: devices, clients aur applications ke health scores, suggested fixes ke saath issue detection, aur path trace.</li>
<li>SD-Access ke liye <b>policy aur fabric automation</b>.</li>
<li>Ek northbound <b>REST API</b> (Intent API) taaki scripts aur doosre systems upar ki sab cheezein use kar sakein. Southbound mein yeh devices se baat karne ke liye SSH/CLI, SNMP aur NETCONF use karta hai.</li>
</ul>

<table class="cmp"><tr><th></th><th>Traditional device management</th><th>Catalyst Center managed</th></tr>
<tr><td>Configure kahan karte ho</td><td>Har device ka CLI</td><td>Central GUI ya REST API, bahut devices par push</td></tr>
<tr><td>Naya device</td><td>Console cable, manual base config</td><td>Plug and Play, zero-touch</td></tr>
<tr><td>Upgrades</td><td>Image copy aur box by box reload</td><td>SWIM, golden image, scheduled</td></tr>
<tr><td>Monitoring</td><td>SNMP tools, syslog, har box par <code>show</code></td><td>Assurance: health scores, issues, path trace</td></tr>
<tr><td>Policy</td><td>Har switch par ACLs aur VLANs</td><td>Intent-based, group ke hisaab se, poore fabric par</td></tr></table>

<h3>SD-Access: campus fabric</h3>
<p><b>SD-Access</b> Cisco ka campus fabric hai, jise Catalyst Center automate karta hai aur Cisco ISE identity aur policy deta hai. Iske building blocks concept level par seekho:</p>
<ul>
<li><b>Underlay</b>: routed, aam taur par IS-IS, aksar automatically bana hua (LAN automation).</li>
<li><b>Overlay data plane</b>: fabric nodes ke beech <b>VXLAN</b> tunnels.</li>
<li><b>Overlay control plane</b>: <b>LISP</b>, jo database rakhta hai ki har endpoint kahan hai.</li>
<li><b>Policy plane</b>: Cisco TrustSec <b>Scalable Group Tags (SGTs)</b>, jo users aur devices ko role ke hisaab se group karte hain; virtual networks (VRFs) bade segments ko alag karte hain.</li>
<li><b>Roles</b>: <b>edge nodes</b> endpoints ko jodte hain, <b>border nodes</b> fabric ko bahar ke networks se jodte hain, <b>control plane node</b> LISP database chalata hai.</li>
</ul>

<h3>SD-WAN: WAN fabric</h3>
<p><b>Cisco Catalyst SD-WAN</b> (pehle Viptela) kisi bhi transport par IPsec tunnels ka overlay banata hai: MPLS, broadband internet, 4G/5G. Components:</p>
<ul>
<li><b>SD-WAN Manager</b> (vManage): management plane, GUI aur northbound REST API.</li>
<li><b>SD-WAN Controller</b> (vSmart): control plane; <b>OMP</b> (Overlay Management Protocol) se routes aur policy baantta hai.</li>
<li><b>SD-WAN Validator</b> (vBond): devices ko authenticate aur onboard karta hai aur NAT traversal mein madad karta hai.</li>
<li><b>WAN Edge</b> routers: har site par data plane, IPsec tunnels banate hain aur har application ke liye path chunte hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek branch ke paas ek MPLS link aur ek internet link hai. SD-WAN ke saath WAN Edge router dono par IPsec tunnels banata hai. SD-WAN Manager ki ek policy kehti hai: voice woh path use kare jiski latency 150 ms se kam aur loss 1% se kam ho. Jab MPLS link 3% packets khone lagta hai, voice apne aap internet tunnel par chali jaati hai, jabki bulk backup traffic MPLS par hi rehta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki overlay underlay ko replace kar deta hai. Overlay poori tarah underlay par depend karta hai: agar underlay do loopbacks ke beech reachability kho de, to unke beech ka har tunnel fail ho jaata hai. Pehle underlay troubleshoot karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Catalyst Center aur DNA Center same controller hain. SD-Access mein: underlay IS-IS, overlay data plane VXLAN, control plane LISP, policy SGT. SD-WAN mein: Manager = management, Controller = control plane (OMP), Validator = onboarding/orchestration, WAN Edge = data plane.</p></div>

<div class="scn"><h4>Chhe hafte mein chaalis branches</h4><p>Ek logistics company ko 40 naye warehouses jaldi jodne the. Har site par sasta broadband aur ek 4G backup tha, MPLS nahi. Team ne kuch bhi preconfigure nahi kiya: WAN Edge routers seedhe sites par bheje gaye, ek local technician ne unhe plug kiya, aur routers ne Validator se contact kiya, authenticate hue, SD-WAN Manager se apni configuration download ki aur data centers tak IPsec tunnels bana liye. Jab ek broadband provider mein outage hua, traffic bina kisi ke login kiye 4G par shift ho gaya.</p><p><b>Seekh:</b> controller wala fabric sites ko templates mein badal deta hai, aur zero-touch onboarding site visit ka zyada tar kaam hata deta hai.</p></div>

<div class="iv"><p class="q">"Underlay aur overlay mein kya farak hai? Ek Cisco example do."</p><p>Strong answer: underlay physical, routed network hai jo devices ke beech reachability deta hai; overlay uske upar tunnels se bane virtual networks hain, taaki segments physical location par depend na karein. Dono ko ek saath manage karo to fabric banta hai. Example: SD-Access mein underlay IS-IS chalata hai, overlay data ke liye VXLAN, control plane ke liye LISP aur policy ke liye SGTs use karta hai, sab Catalyst Center se automate. Yeh bhi batao ki underlay ki problem uske upar se guzarne wale har overlay tunnel ko tod deti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay = physical routed network; overlay = upar ke tunnels; fabric = dono ek saath managed.</li>
<li>Catalyst Center (DNA Center): inventory, PnP, templates, SWIM, Assurance, SD-Access, northbound REST API.</li>
<li>SD-Access: IS-IS underlay, VXLAN data plane, LISP control plane, SGT policy; edge, border, control plane nodes.</li>
<li>SD-WAN: Manager, Controller (OMP), Validator, WAN Edge; kisi bhi transport par IPsec overlay.</li>
<li>Overlay ko blame karne se pehle hamesha underlay check karo.</li>
</ul></div>
`}};export{e as default};