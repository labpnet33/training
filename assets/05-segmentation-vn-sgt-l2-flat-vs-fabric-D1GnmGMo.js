var e={id:`segmentation`,h:{en:`Segmentation design: virtual networks, SGTs, and Layer 2 flat versus fabric`,hi:`Segmentation design: virtual networks, SGTs, aur Layer 2 flat versus fabric`},body:{en:`
<p>A large hospital has public lobbies, nurse stations, drug rooms and server rooms. You do not rely on one big wall around the whole building. You use <b>zones</b> (floors with badge readers) and <b>roles</b> (a nurse badge opens some doors, a cleaner badge opens others). In networks, <b>macro-segmentation</b> is the zone: separate routing tables. <b>Micro-segmentation</b> is the role: policy between groups in the same zone.</p>

<h3>The case: Northgate Medical Centre</h3>
<div class="eg"><p><b>Customer.</b> Northgate Medical Centre has 2,200 staff, 3,000 medical and building devices, public guest Wi-Fi and visiting contractors. A recent ransomware drill showed that an infected infusion-pump controller could reach the finance file servers. Requirements: contain lateral movement, keep clinical devices reachable only by clinicians and imaging servers, separate guests entirely, and make the policy follow a person from wired desk to wireless tablet. Constraints: the clinical team cannot tolerate re-IPing devices; some nurse-call equipment needs Layer 2 broadcast; the security team wants policy defined once, centrally. Budget: USD 2.5 million.</p></div>

<h3>Segmentation tools in the campus</h3>
<dl class="terms">
<dt>VLAN and ACL</dt><dd>Oldest method: IP-based ACLs per VLAN. Scales badly: ACLs grow with every new subnet, and the policy is tied to addressing.</dd>
<dt>VRF-lite</dt><dd>Separate routing tables hop by hop. Strong isolation, but it must be configured on every Layer 3 device and trunk.</dd>
<dt>Virtual Network (VN)</dt><dd>In SD-Access, a VN is a VRF carried end to end by the fabric (VXLAN VNI). It gives <b>macro-segmentation</b>. Traffic between VNs needs a route-leak through a border and fusion device, so the default is isolation.</dd>
<dt>Scalable Group Tag (SGT)</dt><dd>A 16-bit tag assigned to a user or device at login by ISE using 802.1X or MAB (or statically). It gives <b>micro-segmentation</b> inside a VN.</dd>
<dt>Group-based policy (SGACL)</dt><dd>A matrix on ISE: source group, destination group, contract (permit, deny, or an access list). Enforced where the destination attaches, so the matrix scales with groups, not subnets.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 345" role="img" aria-label="VN and SGT segmentation">
<g fill="none" stroke="#64748b" stroke-dasharray="5 4">
<rect x="10" y="40" width="290" height="150" rx="10"/><rect x="340" y="40" width="290" height="150" rx="10"/>
<rect x="10" y="215" width="290" height="90" rx="10"/><rect x="340" y="215" width="290" height="90" rx="10"/>
</g>
<g class="svg-muted" font-size="12"><text x="10" y="32">VN Clinical</text><text x="340" y="32">VN Corporate</text><text x="10" y="207">VN Guest</text><text x="340" y="207">Shared services (fusion)</text></g>
<line x1="65" y1="98" x2="155" y2="125" stroke="#16a34a" stroke-width="2.5"/>
<line x1="290" y1="84" x2="355" y2="84" stroke="#dc2626" stroke-width="2.5"/>
<text x="322" y="78" text-anchor="middle" font-size="14" fill="#dc2626">X</text>
<text x="322" y="104" text-anchor="middle" class="svg-muted" font-size="11">deny</text>
<g class="svg-ink" font-size="12" text-anchor="middle">
<rect x="25" y="70" width="80" height="28" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="65" y="89">Nurses</text>
<rect x="115" y="70" width="80" height="28" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="155" y="89">Doctors</text>
<rect x="205" y="70" width="85" height="28" rx="6" fill="#fed7aa" stroke="#475569"/><text x="247" y="89">Med devices</text>
<rect x="25" y="125" width="80" height="28" rx="6" fill="#fed7aa" stroke="#475569"/><text x="65" y="144">Imaging</text>
<rect x="115" y="125" width="80" height="28" rx="6" fill="#fde68a" stroke="#475569"/><text x="155" y="144">PACS</text>
<rect x="355" y="70" width="85" height="28" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="397" y="89">Staff PCs</text>
<rect x="450" y="70" width="85" height="28" rx="6" fill="#fde68a" stroke="#475569"/><text x="492" y="89">Finance</text>
<rect x="545" y="70" width="75" height="28" rx="6" fill="#e2e8f0" stroke="#475569"/><text x="582" y="89">Printers</text>
<rect x="355" y="125" width="85" height="28" rx="6" fill="#fde68a" stroke="#475569"/><text x="397" y="144">ERP</text>
<rect x="25" y="250" width="90" height="28" rx="6" fill="#e2e8f0" stroke="#475569"/><text x="70" y="269">Guest Wi-Fi</text>
<rect x="125" y="250" width="100" height="28" rx="6" fill="#e2e8f0" stroke="#475569"/><text x="175" y="269">Contractors</text>
<rect x="355" y="250" width="70" height="28" rx="6" fill="#ddd6fe" stroke="#475569"/><text x="390" y="269">DHCP</text>
<rect x="435" y="250" width="70" height="28" rx="6" fill="#ddd6fe" stroke="#475569"/><text x="470" y="269">DNS</text>
<rect x="515" y="250" width="70" height="28" rx="6" fill="#ddd6fe" stroke="#475569"/><text x="550" y="269">ISE</text>
</g>
<line x1="15" y1="326" x2="45" y2="326" stroke="#16a34a" stroke-width="2.5"/><text x="52" y="330" class="svg-ink" font-size="12">Permit</text>
<line x1="120" y1="326" x2="150" y2="326" stroke="#dc2626" stroke-width="2.5"/><text x="157" y="330" class="svg-ink" font-size="12">Deny</text>
<rect x="215" y="319" width="14" height="14" fill="#bbf7d0"/><text x="235" y="330" class="svg-ink" font-size="12">Users</text>
<rect x="290" y="319" width="14" height="14" fill="#fed7aa"/><text x="310" y="330" class="svg-ink" font-size="12">Devices</text>
<rect x="375" y="319" width="14" height="14" fill="#fde68a"/><text x="395" y="330" class="svg-ink" font-size="12">Servers</text>
<rect x="455" y="319" width="14" height="14" fill="#ddd6fe"/><text x="475" y="330" class="svg-ink" font-size="12">Services</text>
</svg><p class="cap">VNs isolate the zones; SGT policy controls who may talk to whom inside and between them.</p></div>

<h3>Options and trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td><b>A. VLAN plus ACLs on distribution</b></td><td>No new tools</td><td>Policy tied to IPs; thousands of lines; hair-pinning through distribution</td></tr>
<tr><td><b>B. VRF-lite plus firewall</b></td><td>Strong zones</td><td>Every hop configured; no per-user policy</td></tr>
<tr><td><b>C. Non-fabric TrustSec (ISE, SGT inline tagging)</b></td><td>Keep existing network; group policy</td><td>Needs TrustSec-capable hardware and transport of tags (inline or SXP)</td></tr>
<tr><td><b>D. SD-Access VNs plus SGT</b></td><td>Both macro and micro; policy follows user wired and wireless</td><td>Platform and licence cost; migration project</td></tr></table>

<h3>Layer 2 flat versus fabric</h3>
<p>A traditional <b>flat Layer 2</b> VLAN spreads one broadcast domain across many closets, relies on STP and floods ARP and unknown unicast everywhere. In a <b>fabric</b>, every edge node has the same <b>anycast gateway</b> for each subnet, so endpoints keep their IP when they move. Instead of flooding ARP, the edge node asks the LISP control plane where an address is, and tunnels the packet directly. When an application truly needs Layer 2 broadcast (nurse-call), the fabric offers a <b>Layer 2 VN</b> with <b>Layer 2 flooding</b> enabled, which uses underlay multicast or head-end replication. Use it only for those endpoints, to keep the benefits elsewhere.</p>
<table class="cmp"><tr><th></th><th>Flat Layer 2</th><th>Fabric</th></tr>
<tr><td>Gateway</td><td>HSRP pair at distribution</td><td>Anycast gateway on every edge</td></tr>
<tr><td>Loop prevention</td><td>STP</td><td>Routed underlay, no STP between nodes</td></tr>
<tr><td>Failure domain</td><td>Whole VLAN</td><td>Per edge node</td></tr>
<tr><td>Broadcast</td><td>Everywhere</td><td>Suppressed, optional per L2 VN</td></tr></table>

<h3>Chosen design</h3>
<p>Northgate adopts option D at the core of clinical care: VNs for Clinical, Corporate, Guest and Building-IoT; SGTs for Nurses, Doctors, Med devices, Imaging, PACS, Staff and Finance. The group matrix permits Nurses and Doctors to PACS, denies Med devices to everything except Imaging and PACS, and keeps all guest traffic inside the Guest VN. The nurse-call segment becomes a Layer 2 VN with flooding. Justification: it answers the ransomware drill (infected pump cannot reach Finance), meets "policy follows the person", and avoids re-IPing.</p>
<pre class="out">EDGE-7# show cts role-based permissions
IPv4 Role-based permissions from group 10:Nurses to group 30:PACS:
        <span class="hl">Permit IP-00</span>
IPv4 Role-based permissions from group 40:MedDevices to group 20:Finance:
        <span class="hl">Deny IP-00</span>
</pre>
<p>Defensive controls complete the picture on any campus: <b>802.1X or MAB</b> to authenticate, <b>DHCP snooping</b> and <b>Dynamic ARP Inspection</b> against spoofing, <b>CoPP</b> to protect the control plane, <b>MACsec</b> for switch links where required, and a default-deny contract between sensitive groups.</p>

<div class="warn"><p><b>Common mistakes.</b> Creating dozens of VNs when SGTs would do (each VN needs routing and leaking); forgetting that guest and unauthenticated devices need a default SGT or authorization policy; and enabling Layer 2 flooding for every VN.</p></div>
<div class="exam"><p><b>Exam trap.</b> VN = macro-segmentation; SGT = micro-segmentation. SGT policy is enforced at the egress (destination) side by default. Inter-VN communication needs an explicit leak.</p></div>

<div class="scn"><h4>Post-mortem: too many VNs</h4><p>An early pilot gave every department its own VN: 24 VNs. Each needed border handoff, BGP and a fusion VRF; a change to the DHCP server broke 24 leaks. Redesign: 4 VNs and SGTs for departments. Fusion complexity dropped by 80% and onboarding became a policy edit, not a routing change.</p><p><b>Lesson:</b> use VNs for hard boundaries, SGTs for everything finer.</p></div>
<div class="iv"><p class="q">"How do you stop lateral movement between devices in the same subnet?"</p><p>Micro-segmentation: assign SGTs through ISE and enforce group-based policy at the edge, because VLAN ACLs cannot see traffic that stays inside a VLAN on the same switch. Mention VN for macro, SGT for micro, and default-deny between sensitive groups.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Macro-segmentation = VN or VRF; micro-segmentation = SGT and group policy.</li>
<li>Fabric replaces flat Layer 2 with anycast gateways and LISP lookups.</li>
<li>Use Layer 2 VN with flooding only where an application demands it.</li>
<li>Keep VN count small; leak shared services deliberately.</li>
<li>Pair segmentation with 802.1X, DHCP snooping, DAI, CoPP and MACsec.</li>
</ul></div>
`,hi:`
<p>Ek bade hospital mein public lobby, nurse stations, drug rooms aur server rooms hote hain. Aap poori building ke chaaron taraf ek badi deewar par rely nahi karte. Aap <b>zones</b> (badge readers wali floors) aur <b>roles</b> (nurse badge kuch doors kholta hai, cleaner badge doosre) use karte ho. Networks mein <b>macro-segmentation</b> zone hai: alag routing tables. <b>Micro-segmentation</b> role hai: same zone ke groups ke beech policy.</p>

<h3>Case: Northgate Medical Centre</h3>
<div class="eg"><p><b>Customer.</b> Northgate Medical Centre mein 2,200 staff, 3,000 medical aur building devices, public guest Wi-Fi aur visiting contractors hain. Haal hi ke ransomware drill se pata chala ki ek infected infusion-pump controller finance file servers tak pahunch sakta hai. Requirements: lateral movement contain karo, clinical devices sirf clinicians aur imaging servers ko reachable rakho, guests ko poori tarah alag rakho, aur policy insaan ke saath chale (wired desk se wireless tablet tak). Constraints: clinical team devices ko re-IP nahi kar sakti; kuch nurse-call equipment ko Layer 2 broadcast chahiye; security team chahti hai ki policy ek baar central jagah define ho. Budget: USD 2.5 million.</p></div>

<h3>Campus mein segmentation ke tools</h3>
<dl class="terms">
<dt>VLAN aur ACL</dt><dd>Sabse purana tareeka: har VLAN par IP-based ACLs. Kharab scale hota hai: har naye subnet ke saath ACLs badhte hain, aur policy addressing se bandh jaati hai.</dd>
<dt>VRF-lite</dt><dd>Hop by hop alag routing tables. Strong isolation, lekin har Layer 3 device aur trunk par configure karna padta hai.</dd>
<dt>Virtual Network (VN)</dt><dd>SD-Access mein VN ek VRF hai jo fabric end to end carry karta hai (VXLAN VNI). Yeh <b>macro-segmentation</b> deta hai. VNs ke beech traffic ke liye border aur fusion device se route-leak chahiye, isliye default isolation hai.</dd>
<dt>Scalable Group Tag (SGT)</dt><dd>16-bit tag jo ISE login par 802.1X ya MAB (ya static) se user ya device ko assign karta hai. Yeh VN ke andar <b>micro-segmentation</b> deta hai.</dd>
<dt>Group-based policy (SGACL)</dt><dd>ISE par matrix: source group, destination group, contract (permit, deny, ya access list). Destination jahan attach hota hai wahan enforce hota hai, isliye matrix subnets ke saath nahi, groups ke saath scale hota hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 345" role="img" aria-label="VN and SGT segmentation">
<g fill="none" stroke="#64748b" stroke-dasharray="5 4">
<rect x="10" y="40" width="290" height="150" rx="10"/><rect x="340" y="40" width="290" height="150" rx="10"/>
<rect x="10" y="215" width="290" height="90" rx="10"/><rect x="340" y="215" width="290" height="90" rx="10"/>
</g>
<g class="svg-muted" font-size="12"><text x="10" y="32">VN Clinical</text><text x="340" y="32">VN Corporate</text><text x="10" y="207">VN Guest</text><text x="340" y="207">Shared services (fusion)</text></g>
<line x1="65" y1="98" x2="155" y2="125" stroke="#16a34a" stroke-width="2.5"/>
<line x1="290" y1="84" x2="355" y2="84" stroke="#dc2626" stroke-width="2.5"/>
<text x="322" y="78" text-anchor="middle" font-size="14" fill="#dc2626">X</text>
<text x="322" y="104" text-anchor="middle" class="svg-muted" font-size="11">deny</text>
<g class="svg-ink" font-size="12" text-anchor="middle">
<rect x="25" y="70" width="80" height="28" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="65" y="89">Nurses</text>
<rect x="115" y="70" width="80" height="28" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="155" y="89">Doctors</text>
<rect x="205" y="70" width="85" height="28" rx="6" fill="#fed7aa" stroke="#475569"/><text x="247" y="89">Med devices</text>
<rect x="25" y="125" width="80" height="28" rx="6" fill="#fed7aa" stroke="#475569"/><text x="65" y="144">Imaging</text>
<rect x="115" y="125" width="80" height="28" rx="6" fill="#fde68a" stroke="#475569"/><text x="155" y="144">PACS</text>
<rect x="355" y="70" width="85" height="28" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="397" y="89">Staff PCs</text>
<rect x="450" y="70" width="85" height="28" rx="6" fill="#fde68a" stroke="#475569"/><text x="492" y="89">Finance</text>
<rect x="545" y="70" width="75" height="28" rx="6" fill="#e2e8f0" stroke="#475569"/><text x="582" y="89">Printers</text>
<rect x="355" y="125" width="85" height="28" rx="6" fill="#fde68a" stroke="#475569"/><text x="397" y="144">ERP</text>
<rect x="25" y="250" width="90" height="28" rx="6" fill="#e2e8f0" stroke="#475569"/><text x="70" y="269">Guest Wi-Fi</text>
<rect x="125" y="250" width="100" height="28" rx="6" fill="#e2e8f0" stroke="#475569"/><text x="175" y="269">Contractors</text>
<rect x="355" y="250" width="70" height="28" rx="6" fill="#ddd6fe" stroke="#475569"/><text x="390" y="269">DHCP</text>
<rect x="435" y="250" width="70" height="28" rx="6" fill="#ddd6fe" stroke="#475569"/><text x="470" y="269">DNS</text>
<rect x="515" y="250" width="70" height="28" rx="6" fill="#ddd6fe" stroke="#475569"/><text x="550" y="269">ISE</text>
</g>
<line x1="15" y1="326" x2="45" y2="326" stroke="#16a34a" stroke-width="2.5"/><text x="52" y="330" class="svg-ink" font-size="12">Permit</text>
<line x1="120" y1="326" x2="150" y2="326" stroke="#dc2626" stroke-width="2.5"/><text x="157" y="330" class="svg-ink" font-size="12">Deny</text>
<rect x="215" y="319" width="14" height="14" fill="#bbf7d0"/><text x="235" y="330" class="svg-ink" font-size="12">Users</text>
<rect x="290" y="319" width="14" height="14" fill="#fed7aa"/><text x="310" y="330" class="svg-ink" font-size="12">Devices</text>
<rect x="375" y="319" width="14" height="14" fill="#fde68a"/><text x="395" y="330" class="svg-ink" font-size="12">Servers</text>
<rect x="455" y="319" width="14" height="14" fill="#ddd6fe"/><text x="475" y="330" class="svg-ink" font-size="12">Services</text>
</svg><p class="cap">VNs zones ko isolate karte hain; SGT policy control karti hai ki kaun kis se baat kar sakta hai.</p></div>

<h3>Options aur trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td><b>A. VLAN plus distribution par ACLs</b></td><td>Naye tools nahi</td><td>Policy IPs se bandhi; hazaaron lines; distribution se hair-pinning</td></tr>
<tr><td><b>B. VRF-lite plus firewall</b></td><td>Strong zones</td><td>Har hop configure; per-user policy nahi</td></tr>
<tr><td><b>C. Non-fabric TrustSec (ISE, SGT inline tagging)</b></td><td>Existing network rakho; group policy</td><td>TrustSec-capable hardware aur tags ka transport chahiye (inline ya SXP)</td></tr>
<tr><td><b>D. SD-Access VNs plus SGT</b></td><td>Macro aur micro dono; policy wired aur wireless mein user ke saath</td><td>Platform aur licence cost; migration project</td></tr></table>

<h3>Layer 2 flat versus fabric</h3>
<p>Traditional <b>flat Layer 2</b> VLAN ek broadcast domain ko kai closets mein failata hai, STP par rely karta hai aur ARP tatha unknown unicast ko har jagah flood karta hai. <b>Fabric</b> mein har edge node par har subnet ke liye wahi <b>anycast gateway</b> hota hai, isliye endpoints move karne par IP nahi badalte. ARP flood karne ki jagah edge node LISP control plane se poochta hai ki address kahan hai, aur packet ko seedha tunnel karta hai. Jab kisi application ko sach mein Layer 2 broadcast chahiye (nurse-call), fabric <b>Layer 2 flooding</b> enabled <b>Layer 2 VN</b> deta hai, jo underlay multicast ya head-end replication use karta hai. Ise sirf un endpoints ke liye use karo, taaki baaki jagah fayde bane rahein.</p>
<table class="cmp"><tr><th></th><th>Flat Layer 2</th><th>Fabric</th></tr>
<tr><td>Gateway</td><td>Distribution par HSRP pair</td><td>Har edge par anycast gateway</td></tr>
<tr><td>Loop prevention</td><td>STP</td><td>Routed underlay, nodes ke beech STP nahi</td></tr>
<tr><td>Failure domain</td><td>Poora VLAN</td><td>Per edge node</td></tr>
<tr><td>Broadcast</td><td>Har jagah</td><td>Suppressed, per L2 VN optional</td></tr></table>

<h3>Chosen design</h3>
<p>Northgate clinical care ke core mein option D adopt karta hai: Clinical, Corporate, Guest aur Building-IoT ke liye VNs; Nurses, Doctors, Med devices, Imaging, PACS, Staff aur Finance ke liye SGTs. Group matrix Nurses aur Doctors ko PACS permit karta hai, Med devices ko Imaging aur PACS ke alawa sab deny karta hai, aur saara guest traffic Guest VN ke andar rakhta hai. Nurse-call segment flooding wala Layer 2 VN ban jaata hai. Justification: yeh ransomware drill ka jawab hai (infected pump Finance tak nahi pahunch sakta), "policy insaan ke saath chale" poora karta hai, aur re-IP se bachata hai.</p>
<pre class="out">EDGE-7# show cts role-based permissions
IPv4 Role-based permissions from group 10:Nurses to group 30:PACS:
        <span class="hl">Permit IP-00</span>
IPv4 Role-based permissions from group 40:MedDevices to group 20:Finance:
        <span class="hl">Deny IP-00</span>
</pre>
<p>Kisi bhi campus par defensive controls picture poori karte hain: authenticate karne ke liye <b>802.1X ya MAB</b>, spoofing ke khilaaf <b>DHCP snooping</b> aur <b>Dynamic ARP Inspection</b>, control plane bachane ke liye <b>CoPP</b>, jahan zaroori ho wahan switch links ke liye <b>MACsec</b>, aur sensitive groups ke beech default-deny contract.</p>

<div class="warn"><p><b>Common mistakes.</b> SGT se kaam chal sakta tha, phir bhi darjanon VNs banana (har VN ko routing aur leaking chahiye); yeh bhoolna ki guest aur unauthenticated devices ko default SGT ya authorization policy chahiye; aur har VN mein Layer 2 flooding enable karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> VN = macro-segmentation; SGT = micro-segmentation. SGT policy default roop se egress (destination) side par enforce hoti hai. Inter-VN communication ke liye explicit leak chahiye.</p></div>

<div class="scn"><h4>Post-mortem: bahut zyada VNs</h4><p>Ek early pilot mein har department ko apna VN diya gaya: 24 VNs. Har ek ko border handoff, BGP aur fusion VRF chahiye tha; DHCP server mein ek change ne 24 leaks tod diye. Redesign: 4 VNs aur departments ke liye SGTs. Fusion complexity 80% ghati aur onboarding routing change nahi, policy edit ban gaya.</p><p><b>Seekh:</b> hard boundaries ke liye VNs, baaki sab finer cheezon ke liye SGTs.</p></div>
<div class="iv"><p class="q">"Same subnet ke devices ke beech lateral movement kaise rokoge?"</p><p>Micro-segmentation: ISE se SGTs assign karo aur edge par group-based policy enforce karo, kyunki VLAN ACLs woh traffic nahi dekh paate jo same switch par VLAN ke andar rehta hai. VN macro ke liye, SGT micro ke liye, aur sensitive groups ke beech default-deny ka zikr karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Macro-segmentation = VN ya VRF; micro-segmentation = SGT aur group policy.</li>
<li>Fabric flat Layer 2 ko anycast gateways aur LISP lookups se replace karta hai.</li>
<li>Layer 2 VN with flooding sirf wahan use karo jahan application demand kare.</li>
<li>VN count chhota rakho; shared services deliberately leak karo.</li>
<li>Segmentation ke saath 802.1X, DHCP snooping, DAI, CoPP aur MACsec jodo.</li>
</ul></div>
`}};export{e as default};