var e={id:`tenant-constructs`,h:{en:`Tenant constructs: VRF, bridge domain, subnet, application profile and EPG`,hi:`Tenant constructs: VRF, bridge domain, subnet, application profile aur EPG`},body:{en:`
<p>Think of an office building. The <b>company</b> that rents a floor is the tenant. The floor's private <b>road map</b> (who can drive where) is the VRF. Each <b>corridor</b> with its own reception desk is a bridge domain with its gateway. The <b>departments</b> (finance, HR, sales) are EPGs: people are grouped by what they are allowed to do, not by which corridor they sit in. And the rules "sales may visit finance only for invoices" are contracts. This chapter builds these objects one by one.</p>

<h3>VRF (class fvCtx)</h3>
<p>A <b>VRF</b> (Virtual Routing and Forwarding, called a <i>context</i> in the object model) is a separate routing table inside a tenant. Subnets in different VRFs may overlap. The VRF also holds the <b>policy enforcement preference</b>: <i>Enforced</i> (default, contracts required between EPGs) or <i>Unenforced</i> (everything allowed). Each VRF gets a VNID used in the VXLAN header.</p>

<h3>Bridge domain (class fvBD)</h3>
<p>A <b>bridge domain (BD)</b> is a Layer 2 forwarding domain: the ACI equivalent of a VLAN's broadcast domain, stretched across all leaves where it is needed. Each BD belongs to exactly <b>one VRF</b>. A BD holds one or more <b>subnets</b>, and it has forwarding settings (unicast routing, ARP flooding, L2 unknown unicast) that you will study in the next chapter.</p>

<h3>Subnet (class fvSubnet)</h3>
<p>A BD subnet is written as the <b>gateway address with its mask</b>: <code>10.1.1.1/24</code>, not <code>10.1.1.0/24</code>. That address becomes the <b>pervasive gateway</b> on every leaf where the BD is deployed. A subnet also has a <b>scope</b>: <i>Private to VRF</i> (default), <i>Advertised Externally</i> (can be announced through an L3Out) and <i>Shared between VRFs</i> (for route leaking).</p>

<h3>Application profile (class fvAp)</h3>
<p>An <b>application profile</b> is simply a folder that groups the EPGs of one application, for example ECOM for the online shop. It has no forwarding meaning, but it gives you an application view: health, faults and statistics per application.</p>

<h3>EPG (class fvAEPg)</h3>
<p>An <b>endpoint group (EPG)</b> is a set of endpoints that need the <b>same policy</b>. An EPG is linked to one BD (and therefore one VRF). Endpoints enter an EPG through a binding: a <b>static port</b> (node, interface, VLAN) for bare-metal servers, or a <b>VMM domain</b> port group for virtual machines. Each EPG receives a class ID called <b>pcTag</b> (for example 32770), which the leaves use in contract rules instead of IP addresses.</p>
<p>Three facts make EPGs different from VLANs:</p>
<ul>
<li>The VLAN is only the <b>encapsulation</b> on a wire. EPG WEB can be VLAN 110 on leaf 101 and VLAN 310 on leaf 102.</li>
<li>Several EPGs can share one BD and one subnet, yet still need a <b>contract</b> to talk. That is microsegmentation inside a subnet without re-addressing.</li>
<li>Inside one EPG, traffic is allowed by default. Between EPGs, it is denied until a contract permits it.</li>
</ul>

<h3>Mapping to traditional networking</h3>
<table class="cmp"><tr><th>Traditional</th><th>ACI</th></tr>
<tr><td>VRF</td><td>VRF (fvCtx)</td></tr>
<tr><td>VLAN as a broadcast domain</td><td>Bridge domain</td></tr>
<tr><td>SVI with HSRP/VRRP gateway IP</td><td>BD subnet (pervasive gateway on every leaf)</td></tr>
<tr><td>VLAN as a security zone / server group</td><td>EPG</td></tr>
<tr><td>ACL between VLANs</td><td>Contract</td></tr>
<tr><td>(no equivalent)</td><td>Application profile</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Three-tier application in ACI">
<rect x="10" y="10" width="620" height="260" rx="10" fill="#e2e8f0"/><text x="24" y="32" class="svg-ink" font-size="13">Tenant NK-PROD</text>
<rect x="24" y="42" width="592" height="220" rx="8" fill="#fde68a"/><text x="38" y="62" class="svg-ink" font-size="13">VRF PROD</text>
<rect x="40" y="72" width="170" height="40" rx="6" fill="#bae6fd"/><text x="125" y="97" text-anchor="middle" class="svg-ink" font-size="12">WEB-BD 10.1.1.1/24</text>
<rect x="235" y="72" width="170" height="40" rx="6" fill="#bae6fd"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="12">APP-BD 10.1.2.1/24</text>
<rect x="430" y="72" width="170" height="40" rx="6" fill="#bae6fd"/><text x="515" y="97" text-anchor="middle" class="svg-ink" font-size="12">DB-BD 10.1.3.1/24</text>
<rect x="40" y="135" width="560" height="115" rx="8" fill="#ddd6fe"/><text x="54" y="155" class="svg-ink" font-size="12">Application profile ECOM</text>
<rect x="70" y="175" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="125" y="200" text-anchor="middle" class="svg-ink" font-size="13">EPG WEB</text>
<rect x="265" y="175" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">EPG APP</text>
<rect x="460" y="175" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="515" y="200" text-anchor="middle" class="svg-ink" font-size="13">EPG DB</text>
<line x1="125" y1="175" x2="125" y2="112" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><line x1="320" y1="175" x2="320" y2="112" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><line x1="515" y1="175" x2="515" y2="112" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<line x1="180" y1="195" x2="265" y2="195" stroke="#64748b" stroke-width="3"/><text x="222" y="235" text-anchor="middle" class="svg-accent" font-size="12">TCP 80</text>
<line x1="375" y1="195" x2="460" y2="195" stroke="#64748b" stroke-width="3"/><text x="417" y="235" text-anchor="middle" class="svg-accent" font-size="12">TCP 1433</text>
</svg><p class="cap">Dashed lines: each EPG uses one bridge domain. Solid lines: contracts between EPGs.</p></div>

<h3>Building it in the APIC GUI (Lab 2)</h3>
<pre class="code"><span class="c">! all paths start from the Tenants tab</span>
Tenants &gt; Add Tenant: NK-PROD
Tenant NK-PROD &gt; Networking &gt; VRFs &gt; Create VRF: PROD
Networking &gt; Bridge Domains &gt; Create Bridge Domain: WEB-BD, VRF PROD
    Subnets &gt; + : Gateway IP 10.1.1.1/24
Application Profiles &gt; Create Application Profile: ECOM
ECOM &gt; Application EPGs &gt; Create Application EPG: WEB, Bridge Domain WEB-BD
<span class="c">! domain association and static ports come from access policies (chapter 8)</span></pre>

<p>After a static port is added, the leaf shows both the BD and the EPG as internal VLANs. The BD uses a VXLAN encapsulation (its VNID); the EPG uses the wire VLAN:</p>
<pre class="out">LEAF101# show vlan extended
 VLAN Name                             Encap            Ports
 ---- -------------------------------- ---------------- ------------------------
 13   NK-PROD:WEB-BD                   vxlan-15826915   Eth1/1
 <span class="hl">14   NK-PROD:ECOM:WEB                 vlan-110         Eth1/1</span></pre>
<p>Note the internal VLAN IDs (13, 14) are chosen by the leaf and have only local meaning. What matters is the Encap column. Also note that the VRF, BD and EPG appear on a leaf <b>only when needed</b>: a leaf with no WEB endpoints and no static port for WEB does not program WEB-BD at all.</p>

<div class="eg"><p><b>Worked example.</b> An e-commerce app has 6 web servers, 4 app servers and 2 database servers. Network-centric design: 3 VLANs, 3 SVIs, ACLs between them. ACI application-centric design: tenant NK-PROD, VRF PROD, BDs WEB-BD (10.1.1.1/24), APP-BD (10.1.2.1/24), DB-BD (10.1.3.1/24), AP ECOM with EPGs WEB, APP, DB, and two contracts: WEB-TO-APP (TCP 80) and APP-TO-DB (TCP 1433). That is 1 + 1 + 3 + 1 + 3 + 2 = 11 objects for the whole application, independent of how many leaves it spans.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing the network address as the BD subnet (10.1.1.0/24), which makes the gateway .0 and breaks every server. Forgetting to link the BD to a VRF, which leaves the BD without routing. Creating the EPG without a BD: it deploys nowhere.</p></div>

<div class="exam"><p><b>Exam trap.</b> The subnet is configured under the <b>bridge domain</b> (it can also be configured under an EPG for special cases such as shared services), and the object hierarchy is tenant → VRF, tenant → BD (linked to a VRF), tenant → application profile → EPG (linked to a BD). An EPG belongs to exactly one BD; a BD to exactly one VRF.</p></div>

<div class="scn"><h4>From 120 VLANs to real applications</h4><p>A hospital moved its old data center into ACI. On day one they used a <b>network-centric</b> design: every legacy VLAN became one BD and one EPG with the same name (VLAN-210 → BD-210 → EPG-210), in a VRF set to Unenforced, so behaviour was identical to the old network. Over the next months they split the patient records application out of EPG-210 into its own EPGs (WEB, APP, DB) in the same BD and subnet, and added contracts. Servers kept their IP addresses; only their EPG changed.</p><p><b>Lesson:</b> because EPGs and BDs are separate objects, you can migrate first and segment later, without re-addressing servers.</p></div>

<div class="iv"><p class="q">"What is the difference between a bridge domain and an EPG?"</p><p>Strong answer: the bridge domain is a forwarding construct, the Layer 2 domain with its subnets and gateway, linked to one VRF. The EPG is a policy construct, a group of endpoints that share the same security and QoS policy, linked to one BD. Several EPGs can share one BD and subnet but still need a contract to talk. The VLAN is only the encapsulation on a port and can differ per leaf. Mention network-centric (1 VLAN = 1 BD = 1 EPG) versus application-centric designs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hierarchy: tenant contains VRFs, BDs and application profiles; application profiles contain EPGs.</li>
<li>A BD belongs to one VRF; an EPG belongs to one BD.</li>
<li>BD subnet = gateway IP with mask (10.1.1.1/24); scope private, advertised externally or shared.</li>
<li>An EPG is a policy group with a pcTag; the VLAN is only the wire encapsulation.</li>
<li>Objects are deployed on a leaf only where an EPG has endpoints or bindings.</li>
</ul></div>
`,hi:`
<p>Ek office building ke baare mein socho. Jo <b>company</b> ek floor kiraye par leti hai woh tenant hai. Floor ka private <b>road map</b> (kaun kahan ja sakta hai) VRF hai. Har <b>corridor</b> jiska apna reception desk hai, woh apne gateway wala bridge domain hai. <b>Departments</b> (finance, HR, sales) EPGs hain: log is hisaab se group hote hain ki unhe kya karne ki permission hai, is hisaab se nahi ki woh kis corridor mein baithte hain. Aur rules jaise "sales finance mein sirf invoices ke liye ja sakta hai" contracts hain. Yeh chapter in objects ko ek-ek karke banata hai.</p>

<h3>VRF (class fvCtx)</h3>
<p><b>VRF</b> (Virtual Routing and Forwarding, object model mein <i>context</i> kehte hain) tenant ke andar ek alag routing table hai. Alag VRFs ke subnets overlap ho sakte hain. VRF <b>policy enforcement preference</b> bhi rakhta hai: <i>Enforced</i> (default, EPGs ke beech contracts zaroori) ya <i>Unenforced</i> (sab allowed). Har VRF ko ek VNID milta hai jo VXLAN header mein use hota hai.</p>

<h3>Bridge domain (class fvBD)</h3>
<p><b>Bridge domain (BD)</b> ek Layer 2 forwarding domain hai: VLAN ke broadcast domain ka ACI equivalent, un saare leaves par faila hua jahan zaroorat hai. Har BD bilkul <b>ek VRF</b> ka hota hai. BD ek ya zyada <b>subnets</b> rakhta hai, aur uski forwarding settings hoti hain (unicast routing, ARP flooding, L2 unknown unicast) jo aap agle chapter mein padhoge.</p>

<h3>Subnet (class fvSubnet)</h3>
<p>BD subnet <b>gateway address uske mask ke saath</b> likha jaata hai: <code>10.1.1.1/24</code>, <code>10.1.1.0/24</code> nahi. Woh address har us leaf par <b>pervasive gateway</b> ban jaata hai jahan BD deployed hai. Subnet ka ek <b>scope</b> bhi hota hai: <i>Private to VRF</i> (default), <i>Advertised Externally</i> (L3Out se announce ho sakta hai) aur <i>Shared between VRFs</i> (route leaking ke liye).</p>

<h3>Application profile (class fvAp)</h3>
<p><b>Application profile</b> bas ek folder hai jo ek application ke EPGs ko group karta hai, jaise online shop ke liye ECOM. Iska koi forwarding matlab nahi, lekin yeh aapko application view deta hai: har application ki health, faults aur statistics.</p>

<h3>EPG (class fvAEPg)</h3>
<p><b>Endpoint group (EPG)</b> un endpoints ka set hai jinhe <b>same policy</b> chahiye. EPG ek BD (aur isliye ek VRF) se linked hota hai. Endpoints EPG mein ek binding se aate hain: bare-metal servers ke liye <b>static port</b> (node, interface, VLAN), ya virtual machines ke liye <b>VMM domain</b> port group. Har EPG ko ek class ID milta hai jise <b>pcTag</b> kehte hain (jaise 32770), jise leaves contract rules mein IP addresses ki jagah use karte hain.</p>
<p>Teen facts EPGs ko VLANs se alag banate hain:</p>
<ul>
<li>VLAN sirf wire par <b>encapsulation</b> hai. EPG WEB leaf 101 par VLAN 110 aur leaf 102 par VLAN 310 ho sakta hai.</li>
<li>Kai EPGs ek BD aur ek subnet share kar sakte hain, phir bhi baat karne ke liye <b>contract</b> chahiye. Yeh re-addressing ke bina subnet ke andar microsegmentation hai.</li>
<li>Ek EPG ke andar traffic default mein allowed hai. EPGs ke beech denied hai jab tak contract permit na kare.</li>
</ul>

<h3>Traditional networking se mapping</h3>
<table class="cmp"><tr><th>Traditional</th><th>ACI</th></tr>
<tr><td>VRF</td><td>VRF (fvCtx)</td></tr>
<tr><td>Broadcast domain ki tarah VLAN</td><td>Bridge domain</td></tr>
<tr><td>HSRP/VRRP gateway IP wala SVI</td><td>BD subnet (har leaf par pervasive gateway)</td></tr>
<tr><td>Security zone / server group ki tarah VLAN</td><td>EPG</td></tr>
<tr><td>VLANs ke beech ACL</td><td>Contract</td></tr>
<tr><td>(koi equivalent nahi)</td><td>Application profile</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="ACI mein three-tier application">
<rect x="10" y="10" width="620" height="260" rx="10" fill="#e2e8f0"/><text x="24" y="32" class="svg-ink" font-size="13">Tenant NK-PROD</text>
<rect x="24" y="42" width="592" height="220" rx="8" fill="#fde68a"/><text x="38" y="62" class="svg-ink" font-size="13">VRF PROD</text>
<rect x="40" y="72" width="170" height="40" rx="6" fill="#bae6fd"/><text x="125" y="97" text-anchor="middle" class="svg-ink" font-size="12">WEB-BD 10.1.1.1/24</text>
<rect x="235" y="72" width="170" height="40" rx="6" fill="#bae6fd"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="12">APP-BD 10.1.2.1/24</text>
<rect x="430" y="72" width="170" height="40" rx="6" fill="#bae6fd"/><text x="515" y="97" text-anchor="middle" class="svg-ink" font-size="12">DB-BD 10.1.3.1/24</text>
<rect x="40" y="135" width="560" height="115" rx="8" fill="#ddd6fe"/><text x="54" y="155" class="svg-ink" font-size="12">Application profile ECOM</text>
<rect x="70" y="175" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="125" y="200" text-anchor="middle" class="svg-ink" font-size="13">EPG WEB</text>
<rect x="265" y="175" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">EPG APP</text>
<rect x="460" y="175" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="515" y="200" text-anchor="middle" class="svg-ink" font-size="13">EPG DB</text>
<line x1="125" y1="175" x2="125" y2="112" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><line x1="320" y1="175" x2="320" y2="112" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><line x1="515" y1="175" x2="515" y2="112" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<line x1="180" y1="195" x2="265" y2="195" stroke="#64748b" stroke-width="3"/><text x="222" y="235" text-anchor="middle" class="svg-accent" font-size="12">TCP 80</text>
<line x1="375" y1="195" x2="460" y2="195" stroke="#64748b" stroke-width="3"/><text x="417" y="235" text-anchor="middle" class="svg-accent" font-size="12">TCP 1433</text>
</svg><p class="cap">Dashed lines: har EPG ek bridge domain use karta hai. Solid lines: EPGs ke beech contracts.</p></div>

<h3>APIC GUI mein banana (Lab 2)</h3>
<pre class="code"><span class="c">! saare paths Tenants tab se shuru hote hain</span>
Tenants &gt; Add Tenant: NK-PROD
Tenant NK-PROD &gt; Networking &gt; VRFs &gt; Create VRF: PROD
Networking &gt; Bridge Domains &gt; Create Bridge Domain: WEB-BD, VRF PROD
    Subnets &gt; + : Gateway IP 10.1.1.1/24
Application Profiles &gt; Create Application Profile: ECOM
ECOM &gt; Application EPGs &gt; Create Application EPG: WEB, Bridge Domain WEB-BD
<span class="c">! domain association aur static ports access policies se aate hain (chapter 8)</span></pre>

<p>Static port jodne ke baad, leaf BD aur EPG dono ko internal VLANs ki tarah dikhata hai. BD VXLAN encapsulation (apna VNID) use karta hai; EPG wire VLAN use karta hai:</p>
<pre class="out">LEAF101# show vlan extended
 VLAN Name                             Encap            Ports
 ---- -------------------------------- ---------------- ------------------------
 13   NK-PROD:WEB-BD                   vxlan-15826915   Eth1/1
 <span class="hl">14   NK-PROD:ECOM:WEB                 vlan-110         Eth1/1</span></pre>
<p>Dhyan do internal VLAN IDs (13, 14) leaf chunta hai aur unka sirf local matlab hai. Jo matter karta hai woh Encap column hai. Yeh bhi dekho ki VRF, BD aur EPG leaf par <b>sirf zaroorat hone par</b> dikhte hain: jis leaf par koi WEB endpoint nahi aur WEB ka koi static port nahi, woh WEB-BD program hi nahi karta.</p>

<div class="eg"><p><b>Worked example.</b> Ek e-commerce app mein 6 web servers, 4 app servers aur 2 database servers hain. Network-centric design: 3 VLANs, 3 SVIs, unke beech ACLs. ACI application-centric design: tenant NK-PROD, VRF PROD, BDs WEB-BD (10.1.1.1/24), APP-BD (10.1.2.1/24), DB-BD (10.1.3.1/24), AP ECOM jismein EPGs WEB, APP, DB, aur do contracts: WEB-TO-APP (TCP 80) aur APP-TO-DB (TCP 1433). Poori application ke liye 1 + 1 + 3 + 1 + 3 + 2 = 11 objects, chahe woh kitne bhi leaves par faili ho.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> BD subnet mein network address type karna (10.1.1.0/24), jisse gateway .0 ban jaata hai aur har server toot jaata hai. BD ko VRF se link karna bhoolna, jisse BD bina routing ke reh jaata hai. BD ke bina EPG banana: woh kahin deploy nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> Subnet <b>bridge domain</b> ke neeche configure hota hai (shared services jaise special cases mein EPG ke neeche bhi ho sakta hai), aur object hierarchy hai tenant → VRF, tenant → BD (VRF se linked), tenant → application profile → EPG (BD se linked). EPG bilkul ek BD ka hota hai; BD bilkul ek VRF ka.</p></div>

<div class="scn"><h4>120 VLANs se asli applications tak</h4><p>Ek hospital ne apna purana data center ACI mein shift kiya. Pehle din unhone <b>network-centric</b> design use kiya: har legacy VLAN same naam ka ek BD aur ek EPG ban gaya (VLAN-210 → BD-210 → EPG-210), Unenforced VRF mein, taaki behaviour purane network jaisa hi rahe. Agle mahinon mein unhone patient records application ko EPG-210 se nikaal kar same BD aur subnet mein uske apne EPGs (WEB, APP, DB) mein daala, aur contracts jode. Servers ke IP addresses wahi rahe; sirf unka EPG badla.</p><p><b>Seekh:</b> kyunki EPGs aur BDs alag objects hain, aap pehle migrate aur baad mein segment kar sakte ho, servers ko re-address kiye bina.</p></div>

<div class="iv"><p class="q">"Bridge domain aur EPG mein kya farak hai?"</p><p>Strong answer: bridge domain forwarding construct hai, subnets aur gateway wala Layer 2 domain, ek VRF se linked. EPG policy construct hai, endpoints ka group jo same security aur QoS policy share karte hain, ek BD se linked. Kai EPGs ek BD aur subnet share kar sakte hain lekin baat karne ke liye phir bhi contract chahiye. VLAN sirf port par encapsulation hai aur har leaf par alag ho sakta hai. Network-centric (1 VLAN = 1 BD = 1 EPG) vs application-centric designs ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hierarchy: tenant mein VRFs, BDs aur application profiles; application profiles mein EPGs.</li>
<li>BD ek VRF ka hota hai; EPG ek BD ka.</li>
<li>BD subnet = mask ke saath gateway IP (10.1.1.1/24); scope private, advertised externally ya shared.</li>
<li>EPG pcTag wala policy group hai; VLAN sirf wire encapsulation hai.</li>
<li>Objects leaf par sirf wahin deploy hote hain jahan EPG ke endpoints ya bindings hain.</li>
</ul></div>
`}};export{e as default};