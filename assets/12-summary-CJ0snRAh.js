var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with taxis and a dispatch centre, and you now know the real names of every part. Use this chapter the night before the exam and the morning of an interview: tick the checklist, read the glossary aloud, and make sure every "most tested" fact feels obvious.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SD-WAN and SD-Access side by side">
<rect x="10" y="10" width="305" height="210" rx="10" fill="#bae6fd"/><text x="162" y="34" text-anchor="middle" class="svg-ink" font-size="14">Catalyst SD-WAN (1.4)</text>
<text x="25" y="62" class="svg-ink" font-size="12">Management: SD-WAN Manager</text>
<text x="25" y="86" class="svg-ink" font-size="12">Control: Controller, OMP</text>
<text x="25" y="110" class="svg-ink" font-size="12">Orchestration: Validator</text>
<text x="25" y="134" class="svg-ink" font-size="12">Data: WAN edges, IPsec + BFD</text>
<text x="25" y="158" class="svg-ink" font-size="12">Segmentation: service VPNs</text>
<text x="25" y="182" class="svg-ink" font-size="12">Path choice: AAR, SLA classes</text>
<text x="25" y="206" class="svg-muted" font-size="12">TLOC = system-ip + colour + encap</text>
<rect x="325" y="10" width="305" height="210" rx="10" fill="#bbf7d0"/><text x="477" y="34" text-anchor="middle" class="svg-ink" font-size="14">SD-Access (1.5)</text>
<text x="340" y="62" class="svg-ink" font-size="12">Management: Catalyst Center</text>
<text x="340" y="86" class="svg-ink" font-size="12">Control: LISP (CP node MS/MR)</text>
<text x="340" y="110" class="svg-ink" font-size="12">Data: VXLAN-GPO, UDP 4789</text>
<text x="340" y="134" class="svg-ink" font-size="12">Policy: ISE, SGT, SGACL</text>
<text x="340" y="158" class="svg-ink" font-size="12">Underlay: IS-IS, LAN Automation</text>
<text x="340" y="182" class="svg-ink" font-size="12">Segmentation: VN + SGT</text>
<text x="340" y="206" class="svg-muted" font-size="12">Interop: border, fusion, L2 handoff</text>
</svg><p class="cap">Two fabrics, one idea: controllers decide, edges forward, policy follows identity.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain the WAN problems SD-WAN solves and list its benefits and limitations.</li>
<li>Name the four SD-WAN planes and components, old and new names, and what each does.</li>
<li>Describe onboarding: Validator, Manager, Controllers; PnP/ZTP; certificates; authorised device list.</li>
<li>Configure and verify system-ip, site-id, organization-name, Validator address, tunnel interfaces and colours.</li>
<li>Explain VPN 0, VPN 512 and service VPNs; TLOCs; public vs private colours; restrict.</li>
<li>Explain OMP route types, route resolution by BFD, AD 251, graceful restart.</li>
<li>Describe BFD measurement and application-aware routing with SLA classes.</li>
<li>Distinguish localised, centralised control, centralised data and app-route policy; describe templates and configuration groups; describe Cloud OnRamp.</li>
<li>Name every SD-Access role and the job of Catalyst Center and ISE.</li>
<li>Explain the underlay, LISP control plane, VXLAN-GPO data plane and TrustSec policy plane, and walk a packet.</li>
<li>Explain border handoff, fusion routers, Layer 2 handoff, SXP and transits.</li>
<li>Troubleshoot a branch that will not join, bottom-up, reading error codes per colour.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Validator / Manager / Controller</dt><dd>vBond (orchestration, NAT traversal) / vManage (GUI, templates, NETCONF) / vSmart (OMP, policy).</dd>
<dt>WAN edge</dt><dd>Data-plane router: IPsec, BFD, service-side routing.</dd>
<dt>OMP</dt><dd>Overlay Management Protocol between edges and Controllers; carries OMP, TLOC and service routes, keys and policy.</dd>
<dt>TLOC</dt><dd>Transport locator: system-ip + colour + encapsulation.</dd>
<dt>Colour</dt><dd>Transport label; public or private; restrict limits to same colour.</dd>
<dt>System-ip / site-id</dt><dd>Unique device identity / site number shared by co-located edges.</dd>
<dt>SLA class</dt><dd>Loss, latency and jitter thresholds for app-aware routing.</dd>
<dt>Control plane node</dt><dd>LISP map-server/map-resolver in SD-Access.</dd>
<dt>Edge / border node</dt><dd>Access switch (xTR, VTEP, anycast gateway) / handoff to outside networks.</dd>
<dt>VN / SGT</dt><dd>Virtual network (VRF, macro) / scalable group tag (micro).</dd>
<dt>Fusion router</dt><dd>Device outside the fabric that leaks routes between VNs and shared services.</dd>
<dt>SXP</dt><dd>SGT Exchange Protocol: shares IP-to-SGT bindings with non-fabric devices.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>First contact / NAT traversal</td><td>Validator (vBond)</td></tr>
<tr><td>Runs OMP, distributes policy and keys</td><td>Controller (vSmart); never forwards data</td></tr>
<tr><td>Control connection transport</td><td>DTLS (UDP 12346) default, TLS optional</td></tr>
<tr><td>BFD defaults in SD-WAN</td><td>1 s hello, multiplier 7, always on</td></tr>
<tr><td>OMP AD on IOS XE</td><td>251 (route code m)</td></tr>
<tr><td>OMP graceful restart</td><td>On, 43,200 s (12 h)</td></tr>
<tr><td>Transport / management VPN</td><td>VPN 0 / VPN 512</td></tr>
<tr><td>Route installed only if</td><td>its TLOC is resolved by an up BFD session</td></tr>
<tr><td>SD-Access control / data / policy</td><td>LISP / VXLAN-GPO / TrustSec</td></tr>
<tr><td>LAN Automation underlay</td><td>IS-IS</td></tr>
<tr><td>SGACL enforced at</td><td>egress edge</td></tr>
<tr><td>Fabric AP data path</td><td>VXLAN to the edge node</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! SD-WAN (edge)</span>
show sdwan control local-properties
show sdwan control connections
show sdwan control connection-history
show sdwan omp peers
show sdwan omp routes
show sdwan omp tlocs
show sdwan bfd sessions
show sdwan app-route stats
show sdwan policy from-controller
show ip route vrf 1
<span class="c">! SD-Access (edge / control plane node)</span>
show isis neighbors
show access-session
show lisp site
show lisp instance-id 4099 ipv4 map-cache
show cts role-based sgt-map all
show cts role-based permissions</pre>

<div class="eg"><p><b>Worked example: a 30-second exam drill.</b> "An OMP route shows Inv,U." Data plane: no BFD session to its TLOC. "Control connection error ORGMISMATCH." Organization name differs (case-sensitive). "Users get 169.254 addresses in a new VN." Fusion router route leaking to the DHCP server. "Large transfers fail, pings work in SD-Access." Underlay MTU too small for VXLAN.</p></div>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Mixing up Validator and Controller. Saying controllers forward traffic. Confusing SD-WAN "VPN" (a VRF) with an encrypted VPN. Calling the SD-Access control plane node a controller. Forgetting that SGACLs are enforced at egress.</p></div>

<div class="exam"><p><b>Exam traps recap.</b> Expect renamed components in questions, "which component" questions about the four planes, colour/restrict tunnel-count questions, policy-type matching (control vs data vs localised), and SD-Access role matching (control plane vs border vs edge, fusion outside the fabric).</p></div>

<div class="scn"><h4>The interview that turned on one sentence</h4><p>A candidate for a network engineer role at an MSP was asked to explain SD-WAN. He listed every component correctly, but the panel pushed: "So if the controllers die, the WAN goes down?" He answered calmly that control and data planes are separate, edges keep forwarding with cached routes and keys for the graceful-restart period, and only changes and new routes stop. He got the offer; the panel later said that answer separated him from candidates who had memorised slides.</p><p><b>Lesson:</b> the concepts that make the architecture work (plane separation, TLOC resolution, identity-based policy) matter more than the product names.</p></div>

<div class="iv"><p class="q">"Compare Catalyst SD-WAN and SD-Access in two minutes."</p><p>Strong answer: both are controller-based fabrics with separate management, control, data and policy. SD-WAN connects sites over any transport: Manager, Validator, Controller with OMP, IPsec tunnels monitored by BFD, service VPNs, app-aware routing. SD-Access builds the campus: Catalyst Center automation, IS-IS underlay, LISP control plane, VXLAN-GPO data plane, ISE-driven SGTs and SGACLs, borders and fusion routers for interop. They integrate: SD-WAN can be the transit carrying VNs and SGTs between SD-Access sites.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN: Validator, Manager, Controller, WAN edges; OMP, TLOCs, colours, BFD, IPsec, AAR.</li>
<li>Onboarding depends on unique system-ip, exact org name, valid certificate and authorised serial.</li>
<li>SD-Access: control plane, border, edge, extended, WLC and AP roles; Catalyst Center + ISE.</li>
<li>SD-Access planes: IS-IS underlay, LISP control, VXLAN-GPO data, TrustSec policy.</li>
<li>Interop through border handoff, fusion routers, Layer 2 handoff, SXP and transits.</li>
</ul></div>
`,hi:`
<p>Aapne taxis aur dispatch centre se shuru kiya tha, aur ab aap har hisse ka asli naam jaante ho. Is chapter ko exam se pehli raat aur interview ki subah use karo: checklist tick karo, glossary zor se padho, aur pakka karo ki har "most tested" fact obvious lage.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SD-WAN aur SD-Access saath-saath">
<rect x="10" y="10" width="305" height="210" rx="10" fill="#bae6fd"/><text x="162" y="34" text-anchor="middle" class="svg-ink" font-size="14">Catalyst SD-WAN (1.4)</text>
<text x="25" y="62" class="svg-ink" font-size="12">Management: SD-WAN Manager</text>
<text x="25" y="86" class="svg-ink" font-size="12">Control: Controller, OMP</text>
<text x="25" y="110" class="svg-ink" font-size="12">Orchestration: Validator</text>
<text x="25" y="134" class="svg-ink" font-size="12">Data: WAN edges, IPsec + BFD</text>
<text x="25" y="158" class="svg-ink" font-size="12">Segmentation: service VPNs</text>
<text x="25" y="182" class="svg-ink" font-size="12">Path choice: AAR, SLA classes</text>
<text x="25" y="206" class="svg-muted" font-size="12">TLOC = system-ip + colour + encap</text>
<rect x="325" y="10" width="305" height="210" rx="10" fill="#bbf7d0"/><text x="477" y="34" text-anchor="middle" class="svg-ink" font-size="14">SD-Access (1.5)</text>
<text x="340" y="62" class="svg-ink" font-size="12">Management: Catalyst Center</text>
<text x="340" y="86" class="svg-ink" font-size="12">Control: LISP (CP node MS/MR)</text>
<text x="340" y="110" class="svg-ink" font-size="12">Data: VXLAN-GPO, UDP 4789</text>
<text x="340" y="134" class="svg-ink" font-size="12">Policy: ISE, SGT, SGACL</text>
<text x="340" y="158" class="svg-ink" font-size="12">Underlay: IS-IS, LAN Automation</text>
<text x="340" y="182" class="svg-ink" font-size="12">Segmentation: VN + SGT</text>
<text x="340" y="206" class="svg-muted" font-size="12">Interop: border, fusion, L2 handoff</text>
</svg><p class="cap">Do fabrics, ek idea: controllers decide karte hain, edges forward karte hain, policy identity ke saath chalti hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>SD-WAN kaunsi WAN problems solve karta hai samjhao aur iske fayde aur seemayein batao.</li>
<li>Chaar SD-WAN planes aur components, purane aur naye naam, aur har ek kya karta hai, batao.</li>
<li>Onboarding describe karo: Validator, Manager, Controllers; PnP/ZTP; certificates; authorised device list.</li>
<li>System-ip, site-id, organization-name, Validator address, tunnel interfaces aur colours configure aur verify karo.</li>
<li>VPN 0, VPN 512 aur service VPNs; TLOCs; public vs private colours; restrict samjhao.</li>
<li>OMP route types, BFD se route resolution, AD 251, graceful restart samjhao.</li>
<li>BFD measurement aur SLA classes ke saath application-aware routing describe karo.</li>
<li>Localised, centralised control, centralised data aur app-route policy mein farak karo; templates aur configuration groups describe karo; Cloud OnRamp describe karo.</li>
<li>Har SD-Access role aur Catalyst Center aur ISE ka kaam batao.</li>
<li>Underlay, LISP control plane, VXLAN-GPO data plane aur TrustSec policy plane samjhao, aur ek packet walk karao.</li>
<li>Border handoff, fusion routers, Layer 2 handoff, SXP aur transits samjhao.</li>
<li>Join na karne wale branch ko neeche se upar troubleshoot karo, har colour ke error codes padhte hue.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Validator / Manager / Controller</dt><dd>vBond (orchestration, NAT traversal) / vManage (GUI, templates, NETCONF) / vSmart (OMP, policy).</dd>
<dt>WAN edge</dt><dd>Data-plane router: IPsec, BFD, service-side routing.</dd>
<dt>OMP</dt><dd>Edges aur Controllers ke beech Overlay Management Protocol; OMP, TLOC aur service routes, keys aur policy le jaata hai.</dd>
<dt>TLOC</dt><dd>Transport locator: system-ip + colour + encapsulation.</dd>
<dt>Colour</dt><dd>Transport label; public ya private; restrict same colour tak seemit karta hai.</dd>
<dt>System-ip / site-id</dt><dd>Unique device identity / ek jagah ke edges ka shared site number.</dd>
<dt>SLA class</dt><dd>App-aware routing ke liye loss, latency aur jitter thresholds.</dd>
<dt>Control plane node</dt><dd>SD-Access mein LISP map-server/map-resolver.</dd>
<dt>Edge / border node</dt><dd>Access switch (xTR, VTEP, anycast gateway) / bahar ke networks tak handoff.</dd>
<dt>VN / SGT</dt><dd>Virtual network (VRF, macro) / scalable group tag (micro).</dd>
<dt>Fusion router</dt><dd>Fabric ke bahar ka device jo VNs aur shared services ke beech routes leak karta hai.</dd>
<dt>SXP</dt><dd>SGT Exchange Protocol: non-fabric devices ke saath IP-to-SGT bindings share karta hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>Pehla contact / NAT traversal</td><td>Validator (vBond)</td></tr>
<tr><td>OMP chalata hai, policy aur keys baant-ta hai</td><td>Controller (vSmart); kabhi data forward nahi karta</td></tr>
<tr><td>Control connection transport</td><td>DTLS (UDP 12346) default, TLS optional</td></tr>
<tr><td>SD-WAN mein BFD defaults</td><td>1 s hello, multiplier 7, hamesha on</td></tr>
<tr><td>IOS XE par OMP AD</td><td>251 (route code m)</td></tr>
<tr><td>OMP graceful restart</td><td>On, 43,200 s (12 h)</td></tr>
<tr><td>Transport / management VPN</td><td>VPN 0 / VPN 512</td></tr>
<tr><td>Route tabhi install hota hai jab</td><td>uska TLOC up BFD session se resolved ho</td></tr>
<tr><td>SD-Access control / data / policy</td><td>LISP / VXLAN-GPO / TrustSec</td></tr>
<tr><td>LAN Automation underlay</td><td>IS-IS</td></tr>
<tr><td>SGACL kahan enforce hota hai</td><td>egress edge</td></tr>
<tr><td>Fabric AP data path</td><td>edge node tak VXLAN</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! SD-WAN (edge)</span>
show sdwan control local-properties
show sdwan control connections
show sdwan control connection-history
show sdwan omp peers
show sdwan omp routes
show sdwan omp tlocs
show sdwan bfd sessions
show sdwan app-route stats
show sdwan policy from-controller
show ip route vrf 1
<span class="c">! SD-Access (edge / control plane node)</span>
show isis neighbors
show access-session
show lisp site
show lisp instance-id 4099 ipv4 map-cache
show cts role-based sgt-map all
show cts role-based permissions</pre>

<div class="eg"><p><b>Worked example: 30-second exam drill.</b> "OMP route Inv,U dikhata hai." Data plane: uske TLOC tak BFD session nahi. "Control connection error ORGMISMATCH." Organization name alag hai (case-sensitive). "Naye VN mein users ko 169.254 addresses milte hain." DHCP server tak fusion router route leaking. "SD-Access mein bade transfers fail, pings chalte hain." VXLAN ke liye underlay MTU bahut chhota.</p></div>

<div class="warn"><p><b>Aakhri minute ki galtiyan jinse bachna hai.</b> Validator aur Controller ko mix karna. Kehna ki controllers traffic forward karte hain. SD-WAN "VPN" (ek VRF) ko encrypted VPN se confuse karna. SD-Access control plane node ko controller kehna. Bhoolna ki SGACLs egress par enforce hote hain.</p></div>

<div class="exam"><p><b>Exam traps recap.</b> Questions mein renamed components expect karo, chaar planes par "kaunsa component" questions, colour/restrict tunnel-count questions, policy-type matching (control vs data vs localised), aur SD-Access role matching (control plane vs border vs edge, fusion fabric ke bahar).</p></div>

<div class="scn"><h4>Woh interview jo ek line par palta</h4><p>Ek MSP mein network engineer role ke candidate se SD-WAN samjhane ko kaha gaya. Usne har component sahi bataya, lekin panel ne dabaav daala: "To agar controllers mar jaayein, to WAN down ho jaata hai?" Usne shaanti se jawab diya ki control aur data planes alag hain, edges graceful-restart period tak cached routes aur keys ke saath forward karte rehte hain, aur sirf changes aur naye routes rukte hain. Use offer mila; panel ne baad mein kaha ki usi jawab ne use slides ratne wale candidates se alag kiya.</p><p><b>Seekh:</b> architecture ko chalane wale concepts (plane separation, TLOC resolution, identity-based policy) product names se zyada matter karte hain.</p></div>

<div class="iv"><p class="q">"Do minute mein Catalyst SD-WAN aur SD-Access compare karo."</p><p>Strong answer: dono alag management, control, data aur policy wale controller-based fabrics hain. SD-WAN kisi bhi transport par sites jodta hai: Manager, Validator, OMP wala Controller, BFD se monitored IPsec tunnels, service VPNs, app-aware routing. SD-Access campus banata hai: Catalyst Center automation, IS-IS underlay, LISP control plane, VXLAN-GPO data plane, ISE-driven SGTs aur SGACLs, interop ke liye borders aur fusion routers. Yeh integrate hote hain: SD-WAN SD-Access sites ke beech VNs aur SGTs le jaane wala transit ban sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN: Validator, Manager, Controller, WAN edges; OMP, TLOCs, colours, BFD, IPsec, AAR.</li>
<li>Onboarding unique system-ip, exact org name, valid certificate aur authorised serial par depend karta hai.</li>
<li>SD-Access: control plane, border, edge, extended, WLC aur AP roles; Catalyst Center + ISE.</li>
<li>SD-Access planes: IS-IS underlay, LISP control, VXLAN-GPO data, TrustSec policy.</li>
<li>Border handoff, fusion routers, Layer 2 handoff, SXP aur transits se interop.</li>
</ul></div>
`}};export{e as default};