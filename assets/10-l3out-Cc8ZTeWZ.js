var e={id:`l3out`,h:{en:`Leaving the fabric: L3Out, external EPGs and L2Out`,hi:`Fabric se bahar: L3Out, external EPGs aur L2Out`},body:{en:`
<p>Think of a country's border post. Roads inside the country are planned by the government (the fabric), but to reach another country you need an official crossing point (a border leaf), an agreement with the neighbour about which roads connect (a routing protocol), and immigration rules that decide who may enter and from where (the external EPG and its contract). In ACI that whole crossing point is an <b>L3Out</b>.</p>

<h3>What an L3Out is made of</h3>
<p>An <b>L3Out</b> (class l3extOut) lives inside a tenant and connects one VRF to external routers: the WAN edge, a core switch or a firewall. You build it under <b>Tenant → Networking → L3Outs → Create L3Out</b>. Its parts:</p>
<ol>
<li><b>VRF and L3 domain.</b> The L3Out belongs to one VRF. It references an <b>L3 domain</b> (l3extDomP) from access policies, with a VLAN pool for SVIs and sub-interfaces; the AAEP of the border leaf ports must include that L3 domain.</li>
<li><b>Logical node profile.</b> The <b>border leaves</b> that run the routing protocol, each with a router ID.</li>
<li><b>Logical interface profile.</b> The interfaces towards the external router: a <b>routed interface</b>, a <b>routed sub-interface</b> (with a VLAN) or an <b>SVI</b> (useful with vPC), each with an IP address.</li>
<li><b>Routing protocol.</b> OSPF (area and area type), EIGRP (AS number), BGP (peer connectivity profile with neighbour IP and remote AS) or static routes on the node.</li>
<li><b>External EPG</b> (l3extInstP, often called the L3Out EPG). It groups external addresses by prefix so that contracts can apply to them.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="L3Out on a border leaf">
<rect x="250" y="10" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Spine (BGP RR)</text>
<rect x="60" y="100" width="150" height="40" rx="6" fill="#bae6fd"/><text x="135" y="125" text-anchor="middle" class="svg-ink" font-size="13">LEAF101 (compute)</text>
<rect x="400" y="100" width="170" height="40" rx="6" fill="#fde68a"/><text x="485" y="125" text-anchor="middle" class="svg-ink" font-size="13">LEAF103 (border)</text>
<line x1="135" y1="100" x2="290" y2="46" stroke="#64748b" stroke-width="2"/><line x1="485" y1="100" x2="350" y2="46" stroke="#64748b" stroke-width="2"/>
<text x="235" y="80" text-anchor="middle" class="svg-muted" font-size="12">MP-BGP</text><text x="430" y="80" text-anchor="middle" class="svg-muted" font-size="12">MP-BGP</text>
<rect x="410" y="195" width="150" height="40" rx="6" fill="#fed7aa"/><text x="485" y="220" text-anchor="middle" class="svg-ink" font-size="13">WAN router</text>
<line x1="485" y1="140" x2="485" y2="195" stroke="#64748b" stroke-width="3"/><text x="495" y="172" class="svg-accent" font-size="12">OSPF area 0</text>
<rect x="60" y="195" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="135" y="220" text-anchor="middle" class="svg-ink" font-size="13">EPG WEB</text>
<line x1="135" y1="140" x2="135" y2="195" stroke="#64748b" stroke-width="2"/>
<text x="300" y="220" text-anchor="middle" class="svg-accent" font-size="12">contract WEB with ext EPG</text>
</svg><p class="cap">The border leaf peers with the outside; MP-BGP through the spine route reflectors carries the external routes to the compute leaves.</p></div>

<h3>External EPG subnets and their scopes</h3>
<p>Each subnet under the external EPG has checkboxes that do very different jobs. Mixing them up is the most common L3Out mistake.</p>
<table class="cmp"><tr><th>Scope</th><th>Job</th></tr>
<tr><td><b>External Subnets for the External EPG</b></td><td>Security: traffic from or to these prefixes is classified into this external EPG, so contracts apply. 0.0.0.0/0 means "everything outside".</td></tr>
<tr><td>Export Route Control Subnet</td><td>Routing: advertise this prefix out of the L3Out (used for transit routing between L3Outs).</td></tr>
<tr><td>Import Route Control Subnet</td><td>Routing: accept this prefix from outside (only when import route control is enforced on the L3Out).</td></tr>
<tr><td>Shared Route Control / Shared Security Import</td><td>Leak the prefix and its classification to other VRFs (shared L3Out).</td></tr>
</table>

<h3>Two steps people forget</h3>
<ol>
<li><b>Advertise the BD subnet.</b> Set the BD subnet scope to <i>Advertised Externally</i> and associate the BD with the L3Out (BD → Policy → L3 Configurations → Associated L3 Outs), or use a route map. Otherwise the outside never learns 10.1.1.0/24.</li>
<li><b>Contract with the external EPG.</b> The external EPG is just another EPG in the whitelist. For example, EPG WEB provides WEB-PUBLIC (TCP 443) and the external EPG consumes it.</li>
</ol>
<p>Also make sure the <b>BGP Route Reflector</b> policy is set (fabric AS and spine route reflectors, chapter 5). The border leaf redistributes external routes into MP-BGP; without the route reflectors, the compute leaves never receive them.</p>

<h3>Verification</h3>
<pre class="out">LEAF103# show ip ospf neighbors vrf NK-PROD:PROD
 OSPF Process ID default VRF NK-PROD:PROD
 Total number of neighbors: 1
 Neighbor ID     Pri State            Up Time  Address         Interface
 <span class="hl">198.51.100.254    1 FULL/ -          01:22:10 203.0.113.2     Eth1/48</span></pre>
<pre class="out">LEAF101# show ip route 0.0.0.0/0 vrf NK-PROD:PROD
0.0.0.0/0, ubest/mbest: 1/0
    <span class="hl">*via 10.0.72.66%overlay-1, [200/1], 00:41:12, bgp-65001, internal, tag 65001</span></pre>
<p>On the compute leaf, the default route points to the TEP of the border leaf (10.0.72.66) and was learned by internal MP-BGP. That one line proves the whole chain: OSPF on the border, redistribution, route reflection, import on the compute leaf.</p>

<div class="eg"><p><b>Worked example.</b> Tenant NK-PROD needs internet access through a WAN router. Border leaf LEAF103 eth1/48 is a routed interface 203.0.113.1/30; the router is 203.0.113.2/30 with router ID 198.51.100.254. L3Out WAN-OUT: VRF PROD, L3 domain NK-L3DOM, node LEAF103 with router ID 192.0.2.103, OSPF area 0 (point-to-point interface policy), external EPG INTERNET with 0.0.0.0/0 as External Subnets for the External EPG. WEB-BD subnet 10.1.1.1/24 set to Advertised Externally and WEB-BD associated with WAN-OUT. Contract WEB-PUBLIC (TCP 443) provided by WEB, consumed by INTERNET. Result: the router learns 10.1.1.0/24 by OSPF, every leaf with WEB-BD learns 0.0.0.0/0 by MP-BGP, and only TCP 443 from outside reaches the web servers.</p></div>

<h3>L2Out in brief</h3>
<p>An <b>L2Out</b> (l2extOut) extends a bridge domain to an external Layer 2 network with a VLAN on a border port, creating an <b>external bridged EPG</b> that also needs contracts. It is mostly used during migrations, when servers still sit in the legacy network with their gateway moving into ACI. Many teams do the same thing more simply with an EPG static port (trunk) towards the legacy switch, which puts the legacy servers into the EPG itself.</p>

<div class="warn"><p><b>Common mistakes.</b> Ticking only Export Route Control on 0.0.0.0/0 and forgetting External Subnets for the External EPG: routes are exchanged but traffic is not classified and gets dropped. Forgetting to add the L3 domain to the border leaf AAEP (the L3Out interfaces never come up). Not setting the BGP route reflector policy.</p></div>

<div class="exam"><p><b>Exam trap.</b> The external EPG classification is by prefix, and the most specific match wins. "External Subnets for the External EPG" is for security; "Export/Import Route Control" is for routing. The BD subnet must be Advertised Externally (and associated to the L3Out) to be announced.</p></div>

<div class="scn"><h4>Routes everywhere, traffic nowhere</h4><p>After a new L3Out went live, the WAN router had 10.1.1.0/24 and the leaves had 0.0.0.0/0, yet users could not open the web portal. <code>show logging ip access-list internal packet-loss</code> on the border leaf showed the users' packets dropped. The external EPG had one subnet, 0.0.0.0/0, with only <i>Export Route Control Subnet</i> ticked, copied from an old transit-routing template. Without <i>External Subnets for the External EPG</i>, outside addresses were not classified into the external EPG, so the contract never matched. Ticking the right scope fixed it instantly.</p><p><b>Lesson:</b> in an L3Out, routing and security are separate checkboxes; verify both.</p></div>

<div class="iv"><p class="q">"What do you need to configure for servers in an EPG to reach an external network through an L3Out?"</p><p>Strong answer: an L3 domain in access policies included in the border leaf AAEP; the L3Out with VRF, node profile (border leaves and router IDs), interface profile (routed, sub-interface or SVI) and a routing protocol; an external EPG with the external prefixes as External Subnets for the External EPG; the BD subnet Advertised Externally and the BD associated to the L3Out; a contract between the internal EPG and the external EPG; and the BGP route reflector policy so MP-BGP spreads external routes. Verify neighbours on the border leaf and routes on a compute leaf.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An L3Out = VRF + L3 domain + node profile + interface profile + routing protocol + external EPG.</li>
<li>External EPG subnets classify outside prefixes; routing checkboxes (export/import) are a separate job.</li>
<li>Advertise BD subnets externally and associate the BD with the L3Out.</li>
<li>Contracts are needed between internal EPGs and the external EPG.</li>
<li>MP-BGP with spine route reflectors carries external routes to compute leaves; L2Out extends a BD at Layer 2.</li>
</ul></div>
`,hi:`
<p>Ek desh ke border post ke baare mein socho. Desh ke andar ki sadkein sarkar (fabric) plan karti hai, lekin doosre desh tak jaane ke liye aapko ek official crossing point (border leaf), padosi ke saath agreement ki kaunsi sadkein judti hain (routing protocol), aur immigration rules chahiye jo decide karein kaun, kahan se andar aa sakta hai (external EPG aur uska contract). ACI mein woh poora crossing point ek <b>L3Out</b> hai.</p>

<h3>L3Out kis cheez se banta hai</h3>
<p><b>L3Out</b> (class l3extOut) tenant ke andar rehta hai aur ek VRF ko external routers se jodta hai: WAN edge, core switch ya firewall. Aap ise <b>Tenant → Networking → L3Outs → Create L3Out</b> ke neeche banate ho. Iske hisse:</p>
<ol>
<li><b>VRF aur L3 domain.</b> L3Out ek VRF ka hota hai. Yeh access policies se ek <b>L3 domain</b> (l3extDomP) reference karta hai, SVIs aur sub-interfaces ke liye VLAN pool ke saath; border leaf ports ke AAEP mein woh L3 domain hona chahiye.</li>
<li><b>Logical node profile.</b> Woh <b>border leaves</b> jo routing protocol chalate hain, har ek router ID ke saath.</li>
<li><b>Logical interface profile.</b> External router ki taraf ke interfaces: <b>routed interface</b>, <b>routed sub-interface</b> (VLAN ke saath) ya <b>SVI</b> (vPC ke saath useful), har ek IP address ke saath.</li>
<li><b>Routing protocol.</b> OSPF (area aur area type), EIGRP (AS number), BGP (neighbour IP aur remote AS wala peer connectivity profile) ya node par static routes.</li>
<li><b>External EPG</b> (l3extInstP, jise aksar L3Out EPG kehte hain). Yeh external addresses ko prefix se group karta hai taaki un par contracts apply ho sakein.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Border leaf par L3Out">
<rect x="250" y="10" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Spine (BGP RR)</text>
<rect x="60" y="100" width="150" height="40" rx="6" fill="#bae6fd"/><text x="135" y="125" text-anchor="middle" class="svg-ink" font-size="13">LEAF101 (compute)</text>
<rect x="400" y="100" width="170" height="40" rx="6" fill="#fde68a"/><text x="485" y="125" text-anchor="middle" class="svg-ink" font-size="13">LEAF103 (border)</text>
<line x1="135" y1="100" x2="290" y2="46" stroke="#64748b" stroke-width="2"/><line x1="485" y1="100" x2="350" y2="46" stroke="#64748b" stroke-width="2"/>
<text x="235" y="80" text-anchor="middle" class="svg-muted" font-size="12">MP-BGP</text><text x="430" y="80" text-anchor="middle" class="svg-muted" font-size="12">MP-BGP</text>
<rect x="410" y="195" width="150" height="40" rx="6" fill="#fed7aa"/><text x="485" y="220" text-anchor="middle" class="svg-ink" font-size="13">WAN router</text>
<line x1="485" y1="140" x2="485" y2="195" stroke="#64748b" stroke-width="3"/><text x="495" y="172" class="svg-accent" font-size="12">OSPF area 0</text>
<rect x="60" y="195" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="135" y="220" text-anchor="middle" class="svg-ink" font-size="13">EPG WEB</text>
<line x1="135" y1="140" x2="135" y2="195" stroke="#64748b" stroke-width="2"/>
<text x="300" y="220" text-anchor="middle" class="svg-accent" font-size="12">WEB aur ext EPG ka contract</text>
</svg><p class="cap">Border leaf bahar ke saath peer karta hai; spine route reflectors ke through MP-BGP external routes compute leaves tak le jaata hai.</p></div>

<h3>External EPG subnets aur unke scopes</h3>
<p>External EPG ke neeche har subnet ke checkboxes bilkul alag kaam karte hain. Inhe mix karna sabse common L3Out galti hai.</p>
<table class="cmp"><tr><th>Scope</th><th>Kaam</th></tr>
<tr><td><b>External Subnets for the External EPG</b></td><td>Security: in prefixes se ya in tak ka traffic is external EPG mein classify hota hai, taaki contracts apply hon. 0.0.0.0/0 matlab "bahar ka sab kuch".</td></tr>
<tr><td>Export Route Control Subnet</td><td>Routing: is prefix ko L3Out se bahar advertise karo (L3Outs ke beech transit routing ke liye).</td></tr>
<tr><td>Import Route Control Subnet</td><td>Routing: is prefix ko bahar se accept karo (sirf jab L3Out par import route control enforced ho).</td></tr>
<tr><td>Shared Route Control / Shared Security Import</td><td>Prefix aur uski classification ko doosre VRFs mein leak karo (shared L3Out).</td></tr>
</table>

<h3>Do steps jo log bhool jaate hain</h3>
<ol>
<li><b>BD subnet advertise karo.</b> BD subnet scope <i>Advertised Externally</i> set karo aur BD ko L3Out se associate karo (BD → Policy → L3 Configurations → Associated L3 Outs), ya route map use karo. Warna bahar wale kabhi 10.1.1.0/24 nahi seekhte.</li>
<li><b>External EPG ke saath contract.</b> Whitelist mein external EPG bhi bas ek aur EPG hai. Jaise, EPG WEB WEB-PUBLIC (TCP 443) provide karta hai aur external EPG use consume karta hai.</li>
</ol>
<p>Yeh bhi pakka karo ki <b>BGP Route Reflector</b> policy set hai (fabric AS aur spine route reflectors, chapter 5). Border leaf external routes ko MP-BGP mein redistribute karta hai; route reflectors ke bina compute leaves unhe kabhi receive nahi karte.</p>

<h3>Verification</h3>
<pre class="out">LEAF103# show ip ospf neighbors vrf NK-PROD:PROD
 OSPF Process ID default VRF NK-PROD:PROD
 Total number of neighbors: 1
 Neighbor ID     Pri State            Up Time  Address         Interface
 <span class="hl">198.51.100.254    1 FULL/ -          01:22:10 203.0.113.2     Eth1/48</span></pre>
<pre class="out">LEAF101# show ip route 0.0.0.0/0 vrf NK-PROD:PROD
0.0.0.0/0, ubest/mbest: 1/0
    <span class="hl">*via 10.0.72.66%overlay-1, [200/1], 00:41:12, bgp-65001, internal, tag 65001</span></pre>
<p>Compute leaf par default route border leaf ke TEP (10.0.72.66) ko point karta hai aur internal MP-BGP se seekha gaya hai. Woh ek line poori chain saabit karti hai: border par OSPF, redistribution, route reflection, compute leaf par import.</p>

<div class="eg"><p><b>Worked example.</b> Tenant NK-PROD ko WAN router ke through internet access chahiye. Border leaf LEAF103 eth1/48 routed interface 203.0.113.1/30 hai; router 203.0.113.2/30 hai, router ID 198.51.100.254. L3Out WAN-OUT: VRF PROD, L3 domain NK-L3DOM, node LEAF103 router ID 192.0.2.103 ke saath, OSPF area 0 (point-to-point interface policy), external EPG INTERNET jismein 0.0.0.0/0 External Subnets for the External EPG ki tarah. WEB-BD subnet 10.1.1.1/24 Advertised Externally set aur WEB-BD WAN-OUT se associated. Contract WEB-PUBLIC (TCP 443) WEB provide karta hai, INTERNET consume karta hai. Result: router OSPF se 10.1.1.0/24 seekhta hai, WEB-BD wala har leaf MP-BGP se 0.0.0.0/0 seekhta hai, aur bahar se sirf TCP 443 web servers tak pahunchta hai.</p></div>

<h3>L2Out short mein</h3>
<p><b>L2Out</b> (l2extOut) border port par ek VLAN ke saath bridge domain ko external Layer 2 network tak extend karta hai, ek <b>external bridged EPG</b> banata hai jise bhi contracts chahiye. Yeh zyada tar migrations mein use hota hai, jab servers abhi legacy network mein hain aur unka gateway ACI mein shift ho raha hai. Bahut teams yahi kaam legacy switch ki taraf EPG static port (trunk) se aur simple tareeke se karti hain, jisse legacy servers khud EPG mein aa jaate hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> 0.0.0.0/0 par sirf Export Route Control tick karna aur External Subnets for the External EPG bhool jaana: routes exchange hote hain lekin traffic classify nahi hota aur drop ho jaata hai. Border leaf AAEP mein L3 domain jodna bhoolna (L3Out interfaces kabhi up nahi hote). BGP route reflector policy set na karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> External EPG classification prefix se hoti hai, aur sabse specific match jeetta hai. "External Subnets for the External EPG" security ke liye hai; "Export/Import Route Control" routing ke liye. Announce hone ke liye BD subnet Advertised Externally (aur L3Out se associated) hona chahiye.</p></div>

<div class="scn"><h4>Routes har jagah, traffic kahin nahi</h4><p>Naya L3Out live hone ke baad, WAN router ke paas 10.1.1.0/24 tha aur leaves ke paas 0.0.0.0/0, phir bhi users web portal nahi khol pa rahe the. Border leaf par <code>show logging ip access-list internal packet-loss</code> ne users ke packets drop hote dikhaye. External EPG mein ek subnet tha, 0.0.0.0/0, jismein sirf <i>Export Route Control Subnet</i> ticked tha, ek purane transit-routing template se copy kiya hua. <i>External Subnets for the External EPG</i> ke bina bahar ke addresses external EPG mein classify nahi hue, isliye contract kabhi match nahi hua. Sahi scope tick karte hi fix ho gaya.</p><p><b>Seekh:</b> L3Out mein routing aur security alag checkboxes hain; dono verify karo.</p></div>

<div class="iv"><p class="q">"EPG ke servers L3Out ke through external network tak pahunchein, iske liye kya configure karna padta hai?"</p><p>Strong answer: access policies mein L3 domain jo border leaf AAEP mein included ho; L3Out jismein VRF, node profile (border leaves aur router IDs), interface profile (routed, sub-interface ya SVI) aur routing protocol ho; external EPG jismein external prefixes External Subnets for the External EPG ki tarah hon; BD subnet Advertised Externally aur BD L3Out se associated; internal EPG aur external EPG ke beech contract; aur BGP route reflector policy taaki MP-BGP external routes failaye. Border leaf par neighbours aur compute leaf par routes verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L3Out = VRF + L3 domain + node profile + interface profile + routing protocol + external EPG.</li>
<li>External EPG subnets bahar ke prefixes classify karte hain; routing checkboxes (export/import) alag kaam hain.</li>
<li>BD subnets ko externally advertise karo aur BD ko L3Out se associate karo.</li>
<li>Internal EPGs aur external EPG ke beech contracts chahiye.</li>
<li>Spine route reflectors wala MP-BGP external routes compute leaves tak le jaata hai; L2Out BD ko Layer 2 par extend karta hai.</li>
</ul></div>
`}};export{e as default};