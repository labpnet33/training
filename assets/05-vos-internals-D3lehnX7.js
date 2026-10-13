var e={id:`vos-internals`,h:{en:`Inside VOS: the branch and FlexVNF`,hi:`VOS ke andar: branch aur FlexVNF`},body:{en:`
<p>A traditional branch has a router, a firewall, a WAN optimiser and maybe a switch: four boxes, four consoles. Versa puts all of these functions into <b>one software image</b>, <b>VOS</b>, which runs on a small appliance, a server, or a cloud instance. Think of a Swiss army knife that serves several customers at once, each with a private set of blades.</p>

<h3>Key ideas</h3>
<dl class="terms">
<dt>VOS and FlexVNF</dt><dd><b>VOS</b> is the operating system. <b>FlexVNF</b> is Versa's virtual network function software inside it: routing, SD-WAN, NGFW, NAT, QoS and more, all in one process family. The same VOS runs as a branch CPE, a hub, a Controller and, in a different role, can be a virtual instance.</dd>
<dt>Single-pass architecture</dt><dd>A packet is parsed once, then all services (firewall, application identification, SD-WAN policy, QoS, NAT) are applied in one pass, instead of travelling through several separate boxes. This saves CPU and latency.</dd>
<dt>Multi-tenancy: organizations</dt><dd>One VOS can host several <b>organizations</b> (tenants) with fully separated routing, policy and logs. A <b>provider organization</b> manages the device, child organizations belong to customers. In the lab there is one customer organization: <code>Acme</code>.</dd>
<dt>Routing instances (VRs)</dt><dd>A virtual router is a separate routing table. Typical VRs: a <b>management VR</b> (reach Director and Analytics), <b>transport VRs</b> for the underlay (one per WAN circuit), a <b>LAN VR</b> for site networks, and the control VR for the SD-WAN overlay.</dd>
<dt>VNI interfaces</dt><dd><b>vni-0/N</b> are Ethernet-like interfaces (the lab has vni-0/0 to vni-0/3). Virtual tunnel interfaces for IPsec overlay (tvi) also exist in real Versa. Interface addresses are set with <code>unit 0 family inet address</code>.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="VOS branch internals">
<rect x="20" y="15" width="600" height="270" rx="12" fill="#e2e8f0"/><text x="35" y="36" class="svg-accent" font-size="13">VOS on Branch1 (Delhi)  serial VOS-BR1-0001</text>
<rect x="40" y="55" width="540" height="140" rx="10" fill="#bae6fd"/><text x="55" y="75" class="svg-ink" font-size="13">Organization (tenant) Acme  site-id 101</text>
<rect x="55" y="90" width="115" height="44" rx="6" fill="#fff"/><text x="112" y="110" text-anchor="middle" class="svg-ink" font-size="12">Internet-</text><text x="112" y="125" text-anchor="middle" class="svg-ink" font-size="12">Transport-VR</text>
<rect x="180" y="90" width="115" height="44" rx="6" fill="#fff"/><text x="237" y="110" text-anchor="middle" class="svg-ink" font-size="12">MPLS-</text><text x="237" y="125" text-anchor="middle" class="svg-ink" font-size="12">Transport-VR</text>
<rect x="305" y="90" width="115" height="44" rx="6" fill="#fff"/><text x="362" y="110" text-anchor="middle" class="svg-ink" font-size="12">LTE-</text><text x="362" y="125" text-anchor="middle" class="svg-ink" font-size="12">Transport-VR</text>
<rect x="430" y="90" width="135" height="44" rx="6" fill="#bbf7d0"/><text x="497" y="117" text-anchor="middle" class="svg-ink" font-size="12">LAN VR 10.1.1.0/24</text>
<text x="300" y="165" text-anchor="middle" class="svg-muted" font-size="12">single pass: NGFW + SD-WAN policy + QoS + NAT on every packet</text>
<rect x="55" y="215" width="100" height="40" rx="6" fill="#fde68a"/><text x="105" y="240" text-anchor="middle" class="svg-ink" font-size="12">vni-0/0 Inet</text>
<rect x="175" y="215" width="100" height="40" rx="6" fill="#fde68a"/><text x="225" y="240" text-anchor="middle" class="svg-ink" font-size="12">vni-0/1 MPLS</text>
<rect x="295" y="215" width="100" height="40" rx="6" fill="#fde68a"/><text x="345" y="240" text-anchor="middle" class="svg-ink" font-size="12">vni-0/2 LTE</text>
<rect x="415" y="215" width="100" height="40" rx="6" fill="#fde68a"/><text x="465" y="240" text-anchor="middle" class="svg-ink" font-size="12">vni-0/3 LAN</text>
</svg><p class="cap">One VOS image, one organization, several VRs. Interface and VR names follow the lab.</p></div>

<h3>The branch underlay in the lab</h3>
<p>Each branch has per-transport VRs. <code>Internet-Transport-VR</code> has a default route to the carrier. <code>MPLS-Transport-VR</code> has <code>172.31.0.0/16</code> via the PE, which is enough to reach the Controller's MPLS address <code>172.31.100.2</code>. <code>LTE-Transport-VR</code> has a default route, used as backup. For Branch1 (k=1):</p>
<ul>
<li>Internet <code>203.0.113.4/30</code>: carrier .5, branch .6 on vni-0/0</li>
<li>MPLS <code>172.31.1.0/30</code>: PE .1, CE (branch) .2 on vni-0/1</li>
<li>LTE <code>100.64.1.0/30</code>: carrier .1, CPE .2 on vni-0/2</li>
<li>LAN <code>10.1.1.0/24</code> on vni-0/3, gateway .1, PC1 at .10</li>
</ul>

<pre class="code"><span class="c">! Branch1 underlay (excerpt, course CLI)</span>
configure
set system hostname Branch1
set interfaces vni-0/0 enable true
set interfaces vni-0/0 unit 0 family inet address 203.0.113.6/30
set routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.5
set routing-instances MPLS-Transport-VR routing-options static route 172.31.0.0/16 next-hop 172.31.1.1
commit</pre>
<pre class="out">admin@Branch1-cli&gt; show interfaces brief
Interface   Admin   Oper    Address
vni-0/0     up      up      203.0.113.6/30
vni-0/1     up      up      172.31.1.2/30
vni-0/2     up      up      100.64.1.2/30
vni-0/3     up      up      <span class="hl">10.1.1.1/24</span></pre>

<div class="eg"><p><b>Worked example.</b> A branch with two organizations, Acme and a cafeteria tenant, shares the same Internet line. Each organization has its own LAN VR and policy. The provider organization owns the transport VRs. Traffic of one tenant cannot reach the other without an explicit rule, even though both go through the same box and the same physical port.</p></div>

<div class="note"><p><b>Course model.</b> Real VOS configuration is hierarchical and Junos-like, with more objects (service nodes, appliances, tenants, routing-instance types, interfaces for tunnel and loopbacks). The lab only needs interface addresses, static routes and the sd-wan statements. Some course commands (<code>request staging</code>, <code>path-selection</code>) are model helpers.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting the underlay. An overlay cannot form if the branch cannot reach the Controller's address through the right transport VR. Always prove underlay with <code>ping</code> and <code>show route</code> first.</p></div>

<div class="exam"><p><b>Exam trap.</b> Organization (tenant), routing instance (VR) and interface are three different layers. The organization owns VRs; VRs own interfaces' routing.</p></div>

<div class="scn"><h4>Two tenants, one box</h4><p>A shopping mall deployed a single VOS appliance for two shops. The provider organization owned the WAN; each shop had a child organization with its own LAN VR and security policy. When one shop's PC was infected, the other shop saw nothing, and logs were separated per organization in Analytics.</p><p><b>Lesson:</b> multi-tenancy in VOS is real separation of routing, policy and logs, not just VLANs.</p></div>

<div class="iv"><p class="q">"What is single-pass processing in Versa?"</p><p>The packet is parsed once and all services (stateful firewall, application ID, SD-WAN path decision, NAT, QoS) run in the same pass, reducing CPU and latency compared with service chaining multiple devices. Mention multi-tenancy and that it runs on appliances, servers and cloud.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VOS is one software image with routing, SD-WAN, security and more (FlexVNF).</li>
<li>Single-pass processing applies services once per packet.</li>
<li>Organizations (tenants) separate customers; VRs separate routing tables.</li>
<li>vni-0/N interfaces: 0 Internet, 1 MPLS, 2 LTE, 3 LAN in the lab.</li>
<li>Per-transport VRs form the underlay that must reach the Controller.</li>
</ul></div>
`,hi:`
<p>Traditional branch mein router, firewall, WAN optimiser aur shayad switch hota hai: chaar boxes, chaar consoles. Versa in sab functions ko <b>ek software image</b>, <b>VOS</b>, mein daal deta hai, jo chhote appliance, server ya cloud instance par chalta hai. Ek Swiss army knife socho jo kai customers ko ek saath serve karta hai, har ek ke paas blades ka private set.</p>

<h3>Key ideas</h3>
<dl class="terms">
<dt>VOS aur FlexVNF</dt><dd><b>VOS</b> operating system hai. <b>FlexVNF</b> uske andar Versa ka virtual network function software hai: routing, SD-WAN, NGFW, NAT, QoS aur bahut kuch, ek hi process family mein. Wahi VOS branch CPE, hub, Controller ke roop mein chalta hai, aur alag role mein virtual instance bhi ho sakta hai.</dd>
<dt>Single-pass architecture</dt><dd>Packet ek baar parse hota hai, phir saari services (firewall, application identification, SD-WAN policy, QoS, NAT) ek hi pass mein lagti hain, kai alag boxes se guzarne ke bajay. Isse CPU aur latency bachti hai.</dd>
<dt>Multi-tenancy: organizations</dt><dd>Ek VOS kai <b>organizations</b> (tenants) host kar sakta hai, routing, policy aur logs poori tarah alag. <b>Provider organization</b> device manage karti hai, child organizations customers ki hoti hain. Lab mein ek customer organization hai: <code>Acme</code>.</dd>
<dt>Routing instances (VRs)</dt><dd>Virtual router ek alag routing table hai. Typical VRs: <b>management VR</b> (Director aur Analytics tak pahunchne ke liye), underlay ke liye <b>transport VRs</b> (har WAN circuit ke liye ek), site networks ke liye <b>LAN VR</b>, aur SD-WAN overlay ke liye control VR.</dd>
<dt>VNI interfaces</dt><dd><b>vni-0/N</b> Ethernet jaise interfaces hain (lab mein vni-0/0 se vni-0/3). IPsec overlay ke liye virtual tunnel interfaces (tvi) real Versa mein hote hain. Interface addresses <code>unit 0 family inet address</code> se set hote hain.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="VOS branch internals">
<rect x="20" y="15" width="600" height="270" rx="12" fill="#e2e8f0"/><text x="35" y="36" class="svg-accent" font-size="13">Branch1 (Delhi) par VOS  serial VOS-BR1-0001</text>
<rect x="40" y="55" width="540" height="140" rx="10" fill="#bae6fd"/><text x="55" y="75" class="svg-ink" font-size="13">Organization (tenant) Acme  site-id 101</text>
<rect x="55" y="90" width="115" height="44" rx="6" fill="#fff"/><text x="112" y="110" text-anchor="middle" class="svg-ink" font-size="12">Internet-</text><text x="112" y="125" text-anchor="middle" class="svg-ink" font-size="12">Transport-VR</text>
<rect x="180" y="90" width="115" height="44" rx="6" fill="#fff"/><text x="237" y="110" text-anchor="middle" class="svg-ink" font-size="12">MPLS-</text><text x="237" y="125" text-anchor="middle" class="svg-ink" font-size="12">Transport-VR</text>
<rect x="305" y="90" width="115" height="44" rx="6" fill="#fff"/><text x="362" y="110" text-anchor="middle" class="svg-ink" font-size="12">LTE-</text><text x="362" y="125" text-anchor="middle" class="svg-ink" font-size="12">Transport-VR</text>
<rect x="430" y="90" width="135" height="44" rx="6" fill="#bbf7d0"/><text x="497" y="117" text-anchor="middle" class="svg-ink" font-size="12">LAN VR 10.1.1.0/24</text>
<text x="300" y="165" text-anchor="middle" class="svg-muted" font-size="12">single pass: NGFW + SD-WAN policy + QoS + NAT har packet par</text>
<rect x="55" y="215" width="100" height="40" rx="6" fill="#fde68a"/><text x="105" y="240" text-anchor="middle" class="svg-ink" font-size="12">vni-0/0 Inet</text>
<rect x="175" y="215" width="100" height="40" rx="6" fill="#fde68a"/><text x="225" y="240" text-anchor="middle" class="svg-ink" font-size="12">vni-0/1 MPLS</text>
<rect x="295" y="215" width="100" height="40" rx="6" fill="#fde68a"/><text x="345" y="240" text-anchor="middle" class="svg-ink" font-size="12">vni-0/2 LTE</text>
<rect x="415" y="215" width="100" height="40" rx="6" fill="#fde68a"/><text x="465" y="240" text-anchor="middle" class="svg-ink" font-size="12">vni-0/3 LAN</text>
</svg><p class="cap">Ek VOS image, ek organization, kai VRs. Interface aur VR ke naam lab ke hain.</p></div>

<h3>Lab mein branch underlay</h3>
<p>Har branch ke paas per-transport VRs hain. <code>Internet-Transport-VR</code> mein carrier ki taraf default route hai. <code>MPLS-Transport-VR</code> mein PE ke through <code>172.31.0.0/16</code> hai, jo Controller ke MPLS address <code>172.31.100.2</code> tak pahunchne ke liye kaafi hai. <code>LTE-Transport-VR</code> mein default route hai, backup ke liye. Branch1 (k=1) ke liye:</p>
<ul>
<li>Internet <code>203.0.113.4/30</code>: carrier .5, branch .6 vni-0/0 par</li>
<li>MPLS <code>172.31.1.0/30</code>: PE .1, CE (branch) .2 vni-0/1 par</li>
<li>LTE <code>100.64.1.0/30</code>: carrier .1, CPE .2 vni-0/2 par</li>
<li>LAN <code>10.1.1.0/24</code> vni-0/3 par, gateway .1, PC1 .10 par</li>
</ul>

<pre class="code"><span class="c">! Branch1 underlay (excerpt, course CLI)</span>
configure
set system hostname Branch1
set interfaces vni-0/0 enable true
set interfaces vni-0/0 unit 0 family inet address 203.0.113.6/30
set routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.5
set routing-instances MPLS-Transport-VR routing-options static route 172.31.0.0/16 next-hop 172.31.1.1
commit</pre>
<pre class="out">admin@Branch1-cli&gt; show interfaces brief
Interface   Admin   Oper    Address
vni-0/0     up      up      203.0.113.6/30
vni-0/1     up      up      172.31.1.2/30
vni-0/2     up      up      100.64.1.2/30
vni-0/3     up      up      <span class="hl">10.1.1.1/24</span></pre>

<div class="eg"><p><b>Worked example.</b> Ek branch par do organizations hain, Acme aur ek cafeteria tenant, aur dono ek hi Internet line share karte hain. Har organization ka apna LAN VR aur policy hai. Provider organization transport VRs own karti hai. Ek tenant ka traffic doosre tak explicit rule ke bina nahi pahunch sakta, bhale dono ek hi box aur ek hi physical port se jaate hon.</p></div>

<div class="note"><p><b>Course model.</b> Real VOS configuration hierarchical aur Junos jaisi hoti hai, aur objects zyada hote hain (service nodes, appliances, tenants, routing-instance types, tunnel aur loopback interfaces). Lab ko sirf interface addresses, static routes aur sd-wan statements chahiye. Kuch course commands (<code>request staging</code>, <code>path-selection</code>) model helpers hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Underlay bhool jaana. Agar branch sahi transport VR se Controller ke address tak nahi pahunch sakta to overlay nahi ban sakta. Pehle <code>ping</code> aur <code>show route</code> se underlay prove karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Organization (tenant), routing instance (VR) aur interface teen alag layers hain. Organization VRs own karti hai; VRs interfaces ki routing own karte hain.</p></div>

<div class="scn"><h4>Do tenants, ek box</h4><p>Ek shopping mall ne do shops ke liye ek VOS appliance lagaya. Provider organization WAN own karti thi; har shop ki child organization ka apna LAN VR aur security policy tha. Jab ek shop ka PC infected hua, doosri shop ko kuch nahi dikha, aur Analytics mein logs organization ke hisaab se alag the.</p><p><b>Lesson:</b> VOS mein multi-tenancy routing, policy aur logs ki asli separation hai, sirf VLANs nahi.</p></div>

<div class="iv"><p class="q">"Versa mein single-pass processing kya hai?"</p><p>Packet ek baar parse hota hai aur saari services (stateful firewall, application ID, SD-WAN path decision, NAT, QoS) usi pass mein chalti hain, jisse kai devices ko service chain karne ke mukable CPU aur latency kam lagti hai. Multi-tenancy ka zikr karo aur yeh ki yeh appliances, servers aur cloud par chalta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VOS ek software image hai jisme routing, SD-WAN, security aur bahut kuch hai (FlexVNF).</li>
<li>Single-pass processing har packet par services ek baar lagata hai.</li>
<li>Organizations (tenants) customers ko alag karti hain; VRs routing tables ko.</li>
<li>vni-0/N interfaces: lab mein 0 Internet, 1 MPLS, 2 LTE, 3 LAN.</li>
<li>Per-transport VRs underlay banate hain jo Controller tak pahunchna chahiye.</li>
</ul></div>
`}};export{e as default};