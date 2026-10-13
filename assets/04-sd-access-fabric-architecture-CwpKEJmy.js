var e={id:`sda-fabric`,h:{en:`SD-Access fabric design: sites, transit, border, control plane and edge nodes`,hi:`SD-Access fabric design: sites, transit, border, control plane aur edge nodes`},body:{en:`
<p>Think of an airline. Passengers (endpoints) walk into any airport (edge node), show an ID once, and the airline's central system (control plane) knows where they are and what they may do, wherever they travel. The underlying runways and routes (underlay) just move planes. <b>Cisco SD-Access</b> works like this: a routed <b>underlay</b>, a virtual <b>overlay</b> built with VXLAN, a LISP-based <b>control plane</b> that tracks endpoint locations, and policy based on groups. Cisco Catalyst Center (formerly DNA Center) automates it and Cisco ISE provides identity.</p>

<h3>The case: Zenith University</h3>
<div class="eg"><p><b>Customer.</b> Zenith University has a main campus (14,000 users and 900 APs), a North satellite campus (3,500 users), and a small research annex (300 users, 40 lab IoT devices). Sites are joined by privately owned dark fibre with under 5 ms latency. Budget is USD 6 million over two years. Requirements: separate students, staff, research and building-IoT at all sites; same access policy for wired and wireless; students roam between sites without changing IP address; and onboarding must not depend on engineers configuring VLANs. Constraints: IT has two network engineers plus a Catalyst Center admin; some lab switches are unmanaged industrial-style devices.</p></div>

<h3>Building blocks</h3>
<dl class="terms">
<dt>Underlay</dt><dd>The routed network that carries fabric traffic. Built by LAN Automation in Catalyst Center using IS-IS point-to-point links, loopbacks, ECMP. Requires an MTU big enough for VXLAN (the automated value is 9100 bytes) because VXLAN adds about 50 bytes of overhead.</dd>
<dt>Overlay</dt><dd>VXLAN tunnels (data plane, carrying the SGT in the VXLAN-GPO header) between fabric nodes, with LISP as the control plane.</dd>
<dt>Fabric site</dt><dd>An independent set of fabric nodes with its own control plane node(s), border node(s) and edge nodes. Failure of one site does not stop another.</dd>
<dt>Control plane node</dt><dd>LISP map-server and map-resolver; the database of endpoint-to-edge mappings. Deploy at least two for redundancy.</dd>
<dt>Edge node</dt><dd>Where wired endpoints and APs attach; hosts the anycast default gateway, registers endpoints with the control plane and encapsulates traffic.</dd>
<dt>Border node</dt><dd>Gateway between the fabric and everything else. <b>Internal border</b>: connects to known networks (data centre, shared services). <b>External border</b>: default exit to unknown networks (Internet, WAN). <b>Anywhere border</b>: both.</dd>
<dt>Intermediate node</dt><dd>Underlay-only device between fabric nodes. No fabric role.</dd>
<dt>Transit</dt><dd>What joins fabric sites. <b>SD-Access transit</b> keeps VXLAN and SGT end to end between sites (needs a high-bandwidth, low-latency, jumbo-MTU network such as dark fibre or metro Ethernet) and uses transit control plane nodes. <b>IP transit</b> hands off to a traditional network (VRF-lite plus BGP), where the VXLAN header is removed and SGT is lost unless carried another way.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 345" role="img" aria-label="Multi-site SD-Access">
<rect x="10" y="108" width="240" height="195" rx="10" fill="none" stroke="#64748b" stroke-dasharray="5 4"/>
<rect x="390" y="108" width="240" height="195" rx="10" fill="none" stroke="#64748b" stroke-dasharray="5 4"/>
<rect x="265" y="188" width="110" height="115" rx="10" fill="none" stroke="#64748b" stroke-dasharray="5 4"/>
<g fill="#bae6fd"><circle cx="290" cy="45" r="24"/><circle cx="325" cy="34" r="28"/><circle cx="360" cy="46" r="24"/><rect x="290" y="46" width="70" height="24"/></g>
<g stroke="#64748b" stroke-width="1.5">
<line x1="130" y1="120" x2="285" y2="62"/><line x1="510" y1="120" x2="365" y2="62"/><line x1="320" y1="72" x2="320" y2="224"/>
<line x1="130" y1="154" x2="130" y2="185"/><line x1="130" y1="219" x2="60" y2="245"/><line x1="130" y1="219" x2="190" y2="245"/>
<line x1="510" y1="154" x2="510" y2="185"/><line x1="510" y1="219" x2="440" y2="245"/><line x1="510" y1="219" x2="570" y2="245"/>
</g>
<g class="svg-ink" font-size="13" text-anchor="middle">
<text x="325" y="52">Transit</text>
<rect x="85" y="120" width="90" height="34" rx="8" fill="#fed7aa" stroke="#475569"/><text x="130" y="142">Border + CP</text>
<rect x="85" y="185" width="90" height="34" rx="8" fill="#e2e8f0" stroke="#475569"/><text x="130" y="207">Intermediate</text>
<rect x="20" y="245" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="60" y="265">Edge</text>
<rect x="150" y="245" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="190" y="265">Edge</text>
<rect x="465" y="120" width="90" height="34" rx="8" fill="#fed7aa" stroke="#475569"/><text x="510" y="142">Border + CP</text>
<rect x="465" y="185" width="90" height="34" rx="8" fill="#e2e8f0" stroke="#475569"/><text x="510" y="207">Intermediate</text>
<rect x="400" y="245" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="440" y="265">Edge</text>
<rect x="530" y="245" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="570" y="265">Edge</text>
<rect x="275" y="224" width="90" height="34" rx="8" fill="#fed7aa" stroke="#475569"/><text x="320" y="246">Fabric in a Box</text>
<text x="130" y="296" class="svg-muted" font-size="12">Site 1 Main</text>
<text x="510" y="296" class="svg-muted" font-size="12">Site 2 North</text>
<text x="320" y="282" class="svg-muted" font-size="12">Site 3 Annex</text>
<rect x="15" y="12" width="140" height="34" rx="8" fill="#fde68a" stroke="#475569"/><text x="85" y="34">Catalyst Center</text>
<rect x="485" y="12" width="140" height="34" rx="8" fill="#fed7aa" stroke="#475569"/><text x="565" y="34">ISE policy</text>
</g>
<path d="M497 20 l9 -4 l9 4 v9 q0 6 -9 9 q-9 -3 -9 -9 z" fill="#ea580c"/>
<rect x="15" y="318" width="14" height="14" fill="#fed7aa"/><text x="35" y="330" class="svg-ink" font-size="12">Border / CP / policy</text>
<rect x="170" y="318" width="14" height="14" fill="#bbf7d0"/><text x="190" y="330" class="svg-ink" font-size="12">Edge</text>
<rect x="240" y="318" width="14" height="14" fill="#e2e8f0"/><text x="260" y="330" class="svg-ink" font-size="12">Intermediate</text>
<rect x="360" y="318" width="14" height="14" fill="#bae6fd"/><text x="380" y="330" class="svg-ink" font-size="12">Transit</text>
<rect x="450" y="318" width="14" height="14" fill="#fde68a"/><text x="470" y="330" class="svg-ink" font-size="12">Management</text>
</svg><p class="cap">Three fabric sites joined by an SD-Access transit; Catalyst Center manages and ISE decides policy.</p></div>

<h3>Options for Zenith</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td><b>A. Traditional with VRF-lite</b></td><td>Known skills</td><td>Manual per-hop VRFs, VLAN sprawl, policy by ACL</td></tr>
<tr><td><b>B. One huge fabric site</b></td><td>One policy domain</td><td>Single failure domain; WAN dependency for control plane</td></tr>
<tr><td><b>C. Three sites, SD-Access transit</b></td><td>Site-level resilience; SGT and VN end to end</td><td>Needs MTU and bandwidth on the metro fibre</td></tr>
<tr><td><b>D. Three sites, IP transit</b></td><td>Works over any WAN</td><td>SGT lost at borders; fusion router and manual mapping</td></tr></table>

<h3>Chosen design</h3>
<p>Option C. The main and North campus are separate fabric sites, each with two border-plus-control-plane nodes (border and CP can be collocated at this size), and the dark fibre carries an SD-Access transit with its own transit control plane nodes. The 300-user annex becomes <b>Fabric in a Box</b>: one switch (or a stack) holds control plane, border and edge roles, which is right for small sites. Unmanaged lab switches attach as <b>extended nodes</b> (Layer 2 devices connected to an edge node and onboarded by Catalyst Center). Wireless uses a <b>fabric-enabled WLC</b> and <b>fabric-mode APs</b> attached to edge nodes, so wireless clients get the same anycast gateway, VN and SGT as wired. Justification: failure of the North site WAN never affects the main campus; policy follows the user; the team configures intent, not CLI.</p>

<pre class="out">EDGE-1# show lisp session
Sessions for VRF default, total: 2, established: 2
Peer                           State      Up/Down        In/Out    Users
10.255.1.1:4342                <span class="hl">Up</span>         02:11:08       12/10     3
10.255.1.2:4342                Up         02:11:05       11/9      3
</pre>

<div class="warn"><p><b>Common mistakes.</b> Using a single control plane node; MTU not raised on the intermediate links so VXLAN packets fragment or drop; mixing large IoT populations and Layer 2 flooding in one VN without need; and treating Fabric in a Box as a way to scale a big site.</p></div>
<div class="exam"><p><b>Exam trap.</b> SD-Access uses LISP for control plane, VXLAN for data plane and Cisco TrustSec SGT for policy. An IP transit loses the SGT unless the traditional network propagates it. An external border is for unknown routes; an internal border advertises known prefixes into the fabric.</p></div>

<div class="scn"><h4>Post-mortem: the border that could not see the DHCP server</h4><p>After cutover, students at the North campus got no IP addresses. DHCP and DNS lived in the data centre behind the main-campus border. The fabric VNs had no route to shared services because the fusion router had not been told to leak the DHCP subnet into the student VN. The engineer checked the border handoff VRF, found the missing leak, and added it. Clients recovered within minutes.</p><p><b>Lesson:</b> shared services need a deliberate route-leak design (fusion router or equivalent) before the first endpoint onboards.</p></div>
<div class="iv"><p class="q">"What is the difference between a fabric site and a transit?"</p><p>A fabric site is one resilient unit with its own control plane, borders and edges. A transit connects sites. SD-Access transit preserves VXLAN and SGT; IP transit does not. Name your pick criteria: bandwidth, latency, MTU.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-Access = routed underlay, VXLAN overlay, LISP control plane, SGT policy.</li>
<li>Roles: control plane, border (internal, external, anywhere), edge, intermediate, extended node.</li>
<li>Use separate fabric sites for failure isolation, joined by SD-Access or IP transit.</li>
<li>Fabric in a Box fits small sites; wireless in fabric uses a fabric WLC and fabric APs.</li>
<li>Plan MTU, redundancy of control plane nodes and shared-services route leaking.</li>
</ul></div>
`,hi:`
<p>Ek airline ke baare mein socho. Passengers (endpoints) kisi bhi airport (edge node) mein jaate hain, ek baar ID dikhate hain, aur airline ka central system (control plane) jaanta hai ki woh kahan hain aur kya kar sakte hain, chahe woh kahin bhi travel karein. Neeche ke runways aur routes (underlay) sirf planes ko le jaate hain. <b>Cisco SD-Access</b> aise hi kaam karta hai: routed <b>underlay</b>, VXLAN se bana virtual <b>overlay</b>, LISP-based <b>control plane</b> jo endpoint locations track karta hai, aur groups par based policy. Cisco Catalyst Center (pehle DNA Center) ise automate karta hai aur Cisco ISE identity deta hai.</p>

<h3>Case: Zenith University</h3>
<div class="eg"><p><b>Customer.</b> Zenith University ka ek main campus hai (14,000 users aur 900 APs), ek North satellite campus (3,500 users), aur chhota research annex (300 users, 40 lab IoT devices). Sites private dark fibre se jude hain jisme latency 5 ms se kam hai. Budget do saal mein USD 6 million. Requirements: sabhi sites par students, staff, research aur building-IoT alag rahein; wired aur wireless ke liye same access policy; students sites ke beech roam karein bina IP address badle; aur onboarding engineers ke VLAN configure karne par depend na kare. Constraints: IT mein do network engineers aur ek Catalyst Center admin hain; kuch lab switches unmanaged industrial-style devices hain.</p></div>

<h3>Building blocks</h3>
<dl class="terms">
<dt>Underlay</dt><dd>Routed network jo fabric traffic carry karta hai. Catalyst Center mein LAN Automation se banta hai, IS-IS point-to-point links, loopbacks, ECMP ke saath. VXLAN ke liye bada MTU chahiye (automated value 9100 bytes) kyunki VXLAN lagbhag 50 bytes overhead jodta hai.</dd>
<dt>Overlay</dt><dd>Fabric nodes ke beech VXLAN tunnels (data plane, VXLAN-GPO header mein SGT carry karta hai), control plane LISP.</dd>
<dt>Fabric site</dt><dd>Fabric nodes ka independent set, jiske apne control plane node(s), border node(s) aur edge nodes hote hain. Ek site ke fail hone se doosri site nahi rukti.</dd>
<dt>Control plane node</dt><dd>LISP map-server aur map-resolver; endpoint-to-edge mappings ka database. Redundancy ke liye kam se kam do lagao.</dd>
<dt>Edge node</dt><dd>Jahan wired endpoints aur APs attach hote hain; anycast default gateway host karta hai, endpoints ko control plane mein register karta hai aur traffic encapsulate karta hai.</dd>
<dt>Border node</dt><dd>Fabric aur baaki sab ke beech gateway. <b>Internal border</b>: known networks (data centre, shared services) se connect. <b>External border</b>: unknown networks (Internet, WAN) ke liye default exit. <b>Anywhere border</b>: dono.</dd>
<dt>Intermediate node</dt><dd>Fabric nodes ke beech sirf underlay device. Koi fabric role nahi.</dd>
<dt>Transit</dt><dd>Jo fabric sites ko jodta hai. <b>SD-Access transit</b> sites ke beech VXLAN aur SGT end to end rakhta hai (high-bandwidth, low-latency, jumbo-MTU network chahiye jaise dark fibre ya metro Ethernet) aur transit control plane nodes use karta hai. <b>IP transit</b> traditional network ko hand off karta hai (VRF-lite plus BGP), jahan VXLAN header hat jaata hai aur SGT chala jaata hai jab tak kisi aur tareeke se carry na ho.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 345" role="img" aria-label="Multi-site SD-Access">
<rect x="10" y="108" width="240" height="195" rx="10" fill="none" stroke="#64748b" stroke-dasharray="5 4"/>
<rect x="390" y="108" width="240" height="195" rx="10" fill="none" stroke="#64748b" stroke-dasharray="5 4"/>
<rect x="265" y="188" width="110" height="115" rx="10" fill="none" stroke="#64748b" stroke-dasharray="5 4"/>
<g fill="#bae6fd"><circle cx="290" cy="45" r="24"/><circle cx="325" cy="34" r="28"/><circle cx="360" cy="46" r="24"/><rect x="290" y="46" width="70" height="24"/></g>
<g stroke="#64748b" stroke-width="1.5">
<line x1="130" y1="120" x2="285" y2="62"/><line x1="510" y1="120" x2="365" y2="62"/><line x1="320" y1="72" x2="320" y2="224"/>
<line x1="130" y1="154" x2="130" y2="185"/><line x1="130" y1="219" x2="60" y2="245"/><line x1="130" y1="219" x2="190" y2="245"/>
<line x1="510" y1="154" x2="510" y2="185"/><line x1="510" y1="219" x2="440" y2="245"/><line x1="510" y1="219" x2="570" y2="245"/>
</g>
<g class="svg-ink" font-size="13" text-anchor="middle">
<text x="325" y="52">Transit</text>
<rect x="85" y="120" width="90" height="34" rx="8" fill="#fed7aa" stroke="#475569"/><text x="130" y="142">Border + CP</text>
<rect x="85" y="185" width="90" height="34" rx="8" fill="#e2e8f0" stroke="#475569"/><text x="130" y="207">Intermediate</text>
<rect x="20" y="245" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="60" y="265">Edge</text>
<rect x="150" y="245" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="190" y="265">Edge</text>
<rect x="465" y="120" width="90" height="34" rx="8" fill="#fed7aa" stroke="#475569"/><text x="510" y="142">Border + CP</text>
<rect x="465" y="185" width="90" height="34" rx="8" fill="#e2e8f0" stroke="#475569"/><text x="510" y="207">Intermediate</text>
<rect x="400" y="245" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="440" y="265">Edge</text>
<rect x="530" y="245" width="80" height="30" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="570" y="265">Edge</text>
<rect x="275" y="224" width="90" height="34" rx="8" fill="#fed7aa" stroke="#475569"/><text x="320" y="246">Fabric in a Box</text>
<text x="130" y="296" class="svg-muted" font-size="12">Site 1 Main</text>
<text x="510" y="296" class="svg-muted" font-size="12">Site 2 North</text>
<text x="320" y="282" class="svg-muted" font-size="12">Site 3 Annex</text>
<rect x="15" y="12" width="140" height="34" rx="8" fill="#fde68a" stroke="#475569"/><text x="85" y="34">Catalyst Center</text>
<rect x="485" y="12" width="140" height="34" rx="8" fill="#fed7aa" stroke="#475569"/><text x="565" y="34">ISE policy</text>
</g>
<path d="M497 20 l9 -4 l9 4 v9 q0 6 -9 9 q-9 -3 -9 -9 z" fill="#ea580c"/>
<rect x="15" y="318" width="14" height="14" fill="#fed7aa"/><text x="35" y="330" class="svg-ink" font-size="12">Border / CP / policy</text>
<rect x="170" y="318" width="14" height="14" fill="#bbf7d0"/><text x="190" y="330" class="svg-ink" font-size="12">Edge</text>
<rect x="240" y="318" width="14" height="14" fill="#e2e8f0"/><text x="260" y="330" class="svg-ink" font-size="12">Intermediate</text>
<rect x="360" y="318" width="14" height="14" fill="#bae6fd"/><text x="380" y="330" class="svg-ink" font-size="12">Transit</text>
<rect x="450" y="318" width="14" height="14" fill="#fde68a"/><text x="470" y="330" class="svg-ink" font-size="12">Management</text>
</svg><p class="cap">SD-Access transit se jude teen fabric sites; Catalyst Center manage karta hai aur ISE policy decide karta hai.</p></div>

<h3>Zenith ke options</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td><b>A. Traditional with VRF-lite</b></td><td>Known skills</td><td>Manual per-hop VRFs, VLAN sprawl, ACL se policy</td></tr>
<tr><td><b>B. Ek bada fabric site</b></td><td>Ek policy domain</td><td>Single failure domain; control plane ke liye WAN dependency</td></tr>
<tr><td><b>C. Teen sites, SD-Access transit</b></td><td>Site-level resilience; SGT aur VN end to end</td><td>Metro fibre par MTU aur bandwidth chahiye</td></tr>
<tr><td><b>D. Teen sites, IP transit</b></td><td>Kisi bhi WAN par chalta hai</td><td>Borders par SGT jaata hai; fusion router aur manual mapping</td></tr></table>

<h3>Chosen design</h3>
<p>Option C. Main aur North campus alag fabric sites hain, har ek mein do border-plus-control-plane nodes (is size par border aur CP collocated ho sakte hain), aur dark fibre apne transit control plane nodes ke saath SD-Access transit carry karta hai. 300-user annex <b>Fabric in a Box</b> ban jaata hai: ek switch (ya stack) mein control plane, border aur edge roles hote hain, jo chhoti sites ke liye sahi hai. Unmanaged lab switches <b>extended nodes</b> ke roop mein attach hote hain (Layer 2 devices jo edge node se jude hote hain aur Catalyst Center unhe onboard karta hai). Wireless <b>fabric-enabled WLC</b> aur edge nodes se attached <b>fabric-mode APs</b> use karta hai, taaki wireless clients ko wired jaisa hi anycast gateway, VN aur SGT mile. Justification: North site WAN fail ho to main campus affect nahi hota; policy user ke saath chalti hai; team intent configure karti hai, CLI nahi.</p>

<pre class="out">EDGE-1# show lisp session
Sessions for VRF default, total: 2, established: 2
Peer                           State      Up/Down        In/Out    Users
10.255.1.1:4342                <span class="hl">Up</span>         02:11:08       12/10     3
10.255.1.2:4342                Up         02:11:05       11/9      3
</pre>

<div class="warn"><p><b>Common mistakes.</b> Sirf ek control plane node; intermediate links par MTU nahi badhaya, to VXLAN packets fragment ya drop hote hain; bina zaroorat ke bade IoT population aur Layer 2 flooding ek hi VN mein mix karna; aur Fabric in a Box ko bade site ko scale karne ka tareeka samajhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> SD-Access control plane ke liye LISP, data plane ke liye VXLAN aur policy ke liye Cisco TrustSec SGT use karta hai. IP transit SGT kho deta hai jab tak traditional network use propagate na kare. External border unknown routes ke liye hai; internal border known prefixes ko fabric mein advertise karta hai.</p></div>

<div class="scn"><h4>Post-mortem: border ko DHCP server dikha hi nahi</h4><p>Cutover ke baad North campus ke students ko IP addresses nahi mile. DHCP aur DNS data centre mein main-campus border ke peeche the. Fabric VNs ke paas shared services ka route nahi tha kyunki fusion router ko DHCP subnet student VN mein leak karne ko nahi kaha gaya tha. Engineer ne border handoff VRF check kiya, missing leak mila, aur add kar diya. Clients kuch minute mein recover ho gaye.</p><p><b>Seekh:</b> pehla endpoint onboard hone se pehle shared services ke liye deliberate route-leak design (fusion router ya equivalent) chahiye.</p></div>
<div class="iv"><p class="q">"Fabric site aur transit mein kya farak hai?"</p><p>Fabric site ek resilient unit hai jiske apne control plane, borders aur edges hote hain. Transit sites ko jodta hai. SD-Access transit VXLAN aur SGT preserve karta hai; IP transit nahi karta. Apne pick criteria batao: bandwidth, latency, MTU.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-Access = routed underlay, VXLAN overlay, LISP control plane, SGT policy.</li>
<li>Roles: control plane, border (internal, external, anywhere), edge, intermediate, extended node.</li>
<li>Failure isolation ke liye alag fabric sites use karo, SD-Access ya IP transit se jodo.</li>
<li>Fabric in a Box chhoti sites ke liye hai; fabric mein wireless ke liye fabric WLC aur fabric APs chahiye.</li>
<li>MTU, control plane nodes ki redundancy aur shared-services route leaking plan karo.</li>
</ul></div>
`}};export{e as default};