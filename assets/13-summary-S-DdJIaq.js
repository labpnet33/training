var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have travelled from "why does ACI exist" to operating a fabric with faults, audit logs and zoning rules. Think of this chapter as the pilot's pre-flight checklist: short, complete, and read before every exam or interview. If any line below feels unclear, go back to the chapter named next to it.</p>

<h3>Checklist: you should be able to…</h3>
<ul>
<li>Explain ACI mode versus NX-OS mode and why the APIC is not in the data path (ch. 1-2).</li>
<li>Describe the APIC cluster, sharding and what happens when one or two APICs fail (ch. 3).</li>
<li>Read a DN such as <code>uni/tn-NK-PROD/ap-ECOM/epg-WEB</code> and name its classes; use moquery and the REST paths /api/node/mo and /api/node/class (ch. 4).</li>
<li>Bring a new fabric online: register LEAF101, then SPINE201, then LEAF102; verify with acidiag fnvread and IS-IS adjacencies (ch. 5, Lab 1).</li>
<li>Build tenant, VRF, BD with gateway subnet, application profile and EPG (ch. 6, Lab 2).</li>
<li>Explain local and remote endpoint learning, COOP, the spine proxy and each BD forwarding setting (ch. 7).</li>
<li>Build the access-policy chain and static ports, and fix all three F0467 causes (ch. 8, Labs 2 and 4).</li>
<li>Write a contract with the right provider, consumer, filter and subject options; read show zoning-rule (ch. 9, Labs 3 and 5).</li>
<li>Build an L3Out with an external EPG, advertise a BD subnet and apply a contract (ch. 10).</li>
<li>Explain VMM domains, immediacy, uSeg EPGs and ESGs (ch. 11).</li>
<li>Troubleshoot with faults, health, audit log, EP Tracker and snapshots; compare Multi-Pod and Multi-Site (ch. 12).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="ACI in one line">
<rect x="10" y="30" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="65" y="57" text-anchor="middle" class="svg-ink" font-size="13">APIC policy</text>
<rect x="140" y="30" width="110" height="44" rx="8" fill="#fde68a"/><text x="195" y="57" text-anchor="middle" class="svg-ink" font-size="13">Tenant / VRF</text>
<rect x="270" y="30" width="110" height="44" rx="8" fill="#bae6fd"/><text x="325" y="57" text-anchor="middle" class="svg-ink" font-size="13">BD + subnet</text>
<rect x="400" y="30" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="455" y="57" text-anchor="middle" class="svg-ink" font-size="13">EPG</text>
<rect x="530" y="30" width="100" height="44" rx="8" fill="#fed7aa"/><text x="580" y="57" text-anchor="middle" class="svg-ink" font-size="13">Contract</text>
<line x1="120" y1="52" x2="140" y2="52" stroke="#64748b" stroke-width="2"/><line x1="250" y1="52" x2="270" y2="52" stroke="#64748b" stroke-width="2"/><line x1="380" y1="52" x2="400" y2="52" stroke="#64748b" stroke-width="2"/><line x1="510" y1="52" x2="530" y2="52" stroke="#64748b" stroke-width="2"/>
<rect x="270" y="120" width="240" height="44" rx="8" fill="#e2e8f0"/><text x="390" y="147" text-anchor="middle" class="svg-ink" font-size="13">Domain → AAEP → ports</text>
<line x1="455" y1="74" x2="420" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Policy (top row) meets the physical fabric (bottom) at the domain</text>
</svg><p class="cap">The whole module in one picture.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>APIC</dt><dd>Application Policy Infrastructure Controller; cluster of 3 or more; policy and management, not data path.</dd>
<dt>MIT / MO / DN</dt><dd>Management Information Tree of managed objects; each has a unique distinguished name.</dd>
<dt>TEP</dt><dd>Tunnel endpoint address of a node, from the TEP pool chosen at setup.</dd>
<dt>overlay-1</dt><dd>The infra tenant VRF where IS-IS, COOP and MP-BGP run.</dd>
<dt>COOP</dt><dd>Council of Oracle Protocol; leaves report endpoints to the spine database.</dd>
<dt>Spine proxy</dt><dd>Anycast TEP on the spines used for unknown destinations.</dd>
<dt>VRF / BD / EPG</dt><dd>Routing table / Layer 2 domain with subnets / policy group of endpoints.</dd>
<dt>pcTag</dt><dd>EPG class ID used in zoning rules and carried in iVXLAN.</dd>
<dt>Contract</dt><dd>Whitelist between provider and consumer EPGs: subjects, filters, entries.</dd>
<dt>AAEP</dt><dd>Attachable Access Entity Profile; lists the domains allowed on a set of ports.</dd>
<dt>L3Out / external EPG</dt><dd>Routed connection to the outside / classification of external prefixes.</dd>
<dt>VMM domain</dt><dd>Link to vCenter and others with a dynamic VLAN pool and an APIC-managed VDS.</dd>
<dt>ESG</dt><dd>Endpoint Security Group; VRF-scoped security group built with selectors.</dd>
<dt>NDO</dt><dd>Nexus Dashboard Orchestrator; manages policy across Multi-Site fabrics.</dd>
</dl>

<h3>Most-tested facts</h3>
<ol>
<li>If all APICs fail, traffic continues; only changes and monitoring stop.</li>
<li>3-node cluster: one failure is fine; two failures make the survivor read-only.</li>
<li>Discovery: LLDP + DHCP on the infra VLAN, one registered hop at a time; node IDs leaves 101+, spines 201+ by convention.</li>
<li>IS-IS = underlay; COOP = endpoint database; MP-BGP with spine route reflectors = external routes.</li>
<li>BD subnet = gateway IP with mask; the gateway is pervasive (anycast) on every leaf with the BD.</li>
<li>BD defaults: unicast routing on, L2 unknown unicast hardware proxy, ARP flooding off, limit IP learning on.</li>
<li>Access chain: VLAN pool → domain → AAEP → policy group → interface profile → switch profile.</li>
<li>F0467: invalid-path, invalid-vlan, encap-already-in-use.</li>
<li>Contracts: consumer initiates, provider serves; both directions and reverse ports on by default; default scope VRF.</li>
<li>External EPG "External Subnets for the External EPG" is security; export/import route control is routing.</li>
<li>Resolution immediacy: Pre-provision, Immediate, On Demand.</li>
<li>Multi-Pod: one APIC cluster and IPN with PIM Bidir; Multi-Site: many clusters with NDO and ISN.</li>
</ol>

<h3>Command and path cheat sheet</h3>
<pre class="code"><span class="c">! APIC CLI</span>
acidiag fnvread                   show controller     show faults code F0467
show epg                          show endpoints ip 10.1.1.12
moquery -c fvAEPg                 moquery -c faultInst
<span class="c">! Leaf CLI (read-only)</span>
show isis adjacency detail vrf overlay-1   show bgp sessions vrf overlay-1
show vlan extended                show endpoint ip 10.1.1.12
show ip route vrf NK-PROD:PROD    show zoning-rule
show logging ip access-list internal packet-loss
<span class="c">! Spine CLI</span>
show coop internal info ip-db
<span class="c">! GUI</span>
Fabric &gt; Inventory &gt; Fabric Membership          Fabric &gt; Access Policies
Tenants &gt; tenant &gt; Networking / Application Profiles / Contracts
System &gt; Faults     System &gt; History &gt; Audit Log     Operations &gt; EP Tracker
Admin &gt; Config Rollbacks</pre>

<div class="eg"><p><b>Worked example: a 60-second triage.</b> "WEB1 cannot reach APP1 on TCP 80." (1) Faults on NK-PROD: none. (2) EP Tracker: both learned, correct EPGs. (3) WEB1 pings its gateway 10.1.1.1: OK, so forwarding works. (4) EPG WEB contracts: nothing consumed. (5) Add consumed contract WEB-TO-APP; curl works; ping still blocked, as designed. Total: five checks, one fix.</p></div>

<div class="warn"><p><b>Common exam-day mistakes.</b> Confusing BD and EPG; writing the BD subnet as the network address; choosing "all traffic stops" for the APIC failure question; mixing up resolution and deployment immediacy; forgetting that the external EPG needs a contract.</p></div>

<div class="exam"><p><b>Exam trap.</b> Many questions describe a symptom and ask for the object to change. Train yourself to answer with the exact object: "the AAEP", "the VLAN pool", "the BD subnet", "the consumed contract on EPG WEB", not "the network".</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A candidate for a data center role was asked to draw how a new web application goes live in ACI. She drew the access chain first (pool, domain, AAEP, policy group, profiles), then the tenant (VRF, BDs, AP, EPGs), then the contracts with provider and consumer arrows, then the L3Out with an external EPG. For each box she named the verification: acidiag fnvread, show vlan extended, show endpoint, show zoning-rule, show ip route vrf. The panel stopped her after ten minutes and moved to salary discussion.</p><p><b>Lesson:</b> a clear mental model plus one verification per object is what separates someone who has done ACI from someone who has read about it.</p></div>

<div class="iv"><p class="q">"In two minutes, explain ACI to me."</p><p>Strong answer: ACI is Cisco's SDN data center fabric: Nexus 9000 spine-leaf switches in ACI mode, managed by an APIC cluster that is not in the data path. You describe intent as objects in a tree: tenants, VRFs, bridge domains, EPGs and contracts. The APIC renders them onto the leaves, which use IS-IS, COOP and MP-BGP internally and VXLAN between leaves. Security is a whitelist between EPGs. Access policies map tenants to physical ports and VLANs, L3Outs connect to the outside, VMM integration follows VMs. Operations use faults, health scores and the audit log.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy (tenant, VRF, BD, EPG, contract) is separate from physical access (pool, domain, AAEP, profiles).</li>
<li>The APIC defines and monitors; switches forward on their own using IS-IS, COOP, MP-BGP and iVXLAN.</li>
<li>Between EPGs, nothing flows without a contract; zoning rules prove what is enforced.</li>
<li>Faults point to the exact object; the audit log tells you who changed it.</li>
<li>For every object you create, know one command or GUI view that verifies it.</li>
</ul></div>
`,hi:`
<p>Aapne "ACI kyun hai" se lekar faults, audit logs aur zoning rules ke saath fabric operate karne tak ka safar kiya hai. Is chapter ko pilot ki pre-flight checklist samjho: chhoti, poori, aur har exam ya interview se pehle padhne wali. Agar neeche ki koi line unclear lage, to uske saath likhe chapter par wapas jao.</p>

<h3>Checklist: aap yeh kar paane chahiye…</h3>
<ul>
<li>ACI mode vs NX-OS mode samjhana aur APIC data path mein kyun nahi hai (ch. 1-2).</li>
<li>APIC cluster, sharding aur ek ya do APIC fail hone par kya hota hai, batana (ch. 3).</li>
<li><code>uni/tn-NK-PROD/ap-ECOM/epg-WEB</code> jaisa DN padhna aur uski classes batana; moquery aur REST paths /api/node/mo aur /api/node/class use karna (ch. 4).</li>
<li>Naya fabric online laana: LEAF101, phir SPINE201, phir LEAF102 register karna; acidiag fnvread aur IS-IS adjacencies se verify karna (ch. 5, Lab 1).</li>
<li>Tenant, VRF, gateway subnet wala BD, application profile aur EPG banana (ch. 6, Lab 2).</li>
<li>Local aur remote endpoint learning, COOP, spine proxy aur har BD forwarding setting samjhana (ch. 7).</li>
<li>Access-policy chain aur static ports banana, aur teeno F0467 causes fix karna (ch. 8, Labs 2 aur 4).</li>
<li>Sahi provider, consumer, filter aur subject options ke saath contract likhna; show zoning-rule padhna (ch. 9, Labs 3 aur 5).</li>
<li>External EPG ke saath L3Out banana, BD subnet advertise karna aur contract lagana (ch. 10).</li>
<li>VMM domains, immediacy, uSeg EPGs aur ESGs samjhana (ch. 11).</li>
<li>Faults, health, audit log, EP Tracker aur snapshots se troubleshoot karna; Multi-Pod aur Multi-Site compare karna (ch. 12).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Ek line mein ACI">
<rect x="10" y="30" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="65" y="57" text-anchor="middle" class="svg-ink" font-size="13">APIC policy</text>
<rect x="140" y="30" width="110" height="44" rx="8" fill="#fde68a"/><text x="195" y="57" text-anchor="middle" class="svg-ink" font-size="13">Tenant / VRF</text>
<rect x="270" y="30" width="110" height="44" rx="8" fill="#bae6fd"/><text x="325" y="57" text-anchor="middle" class="svg-ink" font-size="13">BD + subnet</text>
<rect x="400" y="30" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="455" y="57" text-anchor="middle" class="svg-ink" font-size="13">EPG</text>
<rect x="530" y="30" width="100" height="44" rx="8" fill="#fed7aa"/><text x="580" y="57" text-anchor="middle" class="svg-ink" font-size="13">Contract</text>
<line x1="120" y1="52" x2="140" y2="52" stroke="#64748b" stroke-width="2"/><line x1="250" y1="52" x2="270" y2="52" stroke="#64748b" stroke-width="2"/><line x1="380" y1="52" x2="400" y2="52" stroke="#64748b" stroke-width="2"/><line x1="510" y1="52" x2="530" y2="52" stroke="#64748b" stroke-width="2"/>
<rect x="270" y="120" width="240" height="44" rx="8" fill="#e2e8f0"/><text x="390" y="147" text-anchor="middle" class="svg-ink" font-size="13">Domain → AAEP → ports</text>
<line x1="455" y1="74" x2="420" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Policy (upar ki row) physical fabric (neeche) se domain par milti hai</text>
</svg><p class="cap">Poora module ek picture mein.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>APIC</dt><dd>Application Policy Infrastructure Controller; 3 ya zyada ka cluster; policy aur management, data path nahi.</dd>
<dt>MIT / MO / DN</dt><dd>Managed objects ka Management Information Tree; har ek ka unique distinguished name.</dd>
<dt>TEP</dt><dd>Node ka tunnel endpoint address, setup mein chune TEP pool se.</dd>
<dt>overlay-1</dt><dd>Infra tenant ka VRF jahan IS-IS, COOP aur MP-BGP chalte hain.</dd>
<dt>COOP</dt><dd>Council of Oracle Protocol; leaves endpoints ko spine database mein report karte hain.</dd>
<dt>Spine proxy</dt><dd>Spines par anycast TEP jo unknown destinations ke liye use hota hai.</dd>
<dt>VRF / BD / EPG</dt><dd>Routing table / subnets wala Layer 2 domain / endpoints ka policy group.</dd>
<dt>pcTag</dt><dd>EPG class ID jo zoning rules mein use hota hai aur iVXLAN mein jaata hai.</dd>
<dt>Contract</dt><dd>Provider aur consumer EPGs ke beech whitelist: subjects, filters, entries.</dd>
<dt>AAEP</dt><dd>Attachable Access Entity Profile; ports ke set par allowed domains ki list.</dd>
<dt>L3Out / external EPG</dt><dd>Bahar ke saath routed connection / external prefixes ki classification.</dd>
<dt>VMM domain</dt><dd>vCenter aur doosron se link, dynamic VLAN pool aur APIC-managed VDS ke saath.</dd>
<dt>ESG</dt><dd>Endpoint Security Group; selectors se bana VRF-scoped security group.</dd>
<dt>NDO</dt><dd>Nexus Dashboard Orchestrator; Multi-Site fabrics mein policy manage karta hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ol>
<li>Saare APIC fail ho jaayein to traffic chalta rehta hai; sirf changes aur monitoring rukti hai.</li>
<li>3-node cluster: ek failure theek hai; do failures mein bacha hua read-only ho jaata hai.</li>
<li>Discovery: infra VLAN par LLDP + DHCP, ek-ek registered hop; convention se node IDs leaves 101+, spines 201+.</li>
<li>IS-IS = underlay; COOP = endpoint database; spine route reflectors wala MP-BGP = external routes.</li>
<li>BD subnet = mask ke saath gateway IP; gateway BD wale har leaf par pervasive (anycast) hai.</li>
<li>BD defaults: unicast routing on, L2 unknown unicast hardware proxy, ARP flooding off, limit IP learning on.</li>
<li>Access chain: VLAN pool → domain → AAEP → policy group → interface profile → switch profile.</li>
<li>F0467: invalid-path, invalid-vlan, encap-already-in-use.</li>
<li>Contracts: consumer initiate karta hai, provider serve karta hai; both directions aur reverse ports default on; default scope VRF.</li>
<li>External EPG ka "External Subnets for the External EPG" security hai; export/import route control routing hai.</li>
<li>Resolution immediacy: Pre-provision, Immediate, On Demand.</li>
<li>Multi-Pod: ek APIC cluster aur PIM Bidir wala IPN; Multi-Site: NDO aur ISN ke saath kai clusters.</li>
</ol>

<h3>Command aur path cheat sheet</h3>
<pre class="code"><span class="c">! APIC CLI</span>
acidiag fnvread                   show controller     show faults code F0467
show epg                          show endpoints ip 10.1.1.12
moquery -c fvAEPg                 moquery -c faultInst
<span class="c">! Leaf CLI (read-only)</span>
show isis adjacency detail vrf overlay-1   show bgp sessions vrf overlay-1
show vlan extended                show endpoint ip 10.1.1.12
show ip route vrf NK-PROD:PROD    show zoning-rule
show logging ip access-list internal packet-loss
<span class="c">! Spine CLI</span>
show coop internal info ip-db
<span class="c">! GUI</span>
Fabric &gt; Inventory &gt; Fabric Membership          Fabric &gt; Access Policies
Tenants &gt; tenant &gt; Networking / Application Profiles / Contracts
System &gt; Faults     System &gt; History &gt; Audit Log     Operations &gt; EP Tracker
Admin &gt; Config Rollbacks</pre>

<div class="eg"><p><b>Worked example: 60 second ka triage.</b> "WEB1 APP1 tak TCP 80 par nahi pahunchta." (1) NK-PROD par faults: koi nahi. (2) EP Tracker: dono learned, sahi EPGs. (3) WEB1 apna gateway 10.1.1.1 ping karta hai: OK, yaani forwarding chal rahi hai. (4) EPG WEB contracts: kuch consumed nahi. (5) Consumed contract WEB-TO-APP jodo; curl chalta hai; ping abhi bhi blocked, design ke hisaab se. Total: paanch checks, ek fix.</p></div>

<div class="warn"><p><b>Exam day ki common galtiyan.</b> BD aur EPG mein confuse hona; BD subnet ko network address ki tarah likhna; APIC failure wale sawaal mein "saara traffic ruk jaata hai" chunna; resolution aur deployment immediacy mix karna; bhool jaana ki external EPG ko contract chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Bahut sawaal ek symptom describe karte hain aur poochte hain ki kaunsa object badalna hai. Khud ko exact object ke saath jawab dena sikhao: "AAEP", "VLAN pool", "BD subnet", "EPG WEB par consumed contract", "network" nahi.</p></div>

<div class="scn"><h4>Interview ka whiteboard</h4><p>Data center role ke ek candidate se poocha gaya ki draw karke dikhao ACI mein naya web application kaise live hota hai. Usne pehle access chain draw ki (pool, domain, AAEP, policy group, profiles), phir tenant (VRF, BDs, AP, EPGs), phir provider aur consumer arrows ke saath contracts, phir external EPG ke saath L3Out. Har box ke liye usne verification batayi: acidiag fnvread, show vlan extended, show endpoint, show zoning-rule, show ip route vrf. Panel ne das minute baad use roka aur salary discussion par chale gaye.</p><p><b>Seekh:</b> saaf mental model plus har object ka ek verification hi us insaan ko jisne ACI kiya hai, us insaan se alag karta hai jisne sirf padha hai.</p></div>

<div class="iv"><p class="q">"Do minute mein mujhe ACI samjhao."</p><p>Strong answer: ACI Cisco ka SDN data center fabric hai: ACI mode mein Nexus 9000 spine-leaf switches, ek APIC cluster se managed jo data path mein nahi hai. Aap intent ko ek tree mein objects ki tarah describe karte ho: tenants, VRFs, bridge domains, EPGs aur contracts. APIC unhe leaves par render karta hai, jo andar IS-IS, COOP aur MP-BGP aur leaves ke beech VXLAN use karte hain. Security EPGs ke beech whitelist hai. Access policies tenants ko physical ports aur VLANs se map karti hain, L3Outs bahar se jodte hain, VMM integration VMs ko follow karta hai. Operations faults, health scores aur audit log use karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy (tenant, VRF, BD, EPG, contract) physical access (pool, domain, AAEP, profiles) se alag hai.</li>
<li>APIC define aur monitor karta hai; switches IS-IS, COOP, MP-BGP aur iVXLAN se khud forward karte hain.</li>
<li>EPGs ke beech contract ke bina kuch nahi chalta; zoning rules saabit karte hain kya enforce ho raha hai.</li>
<li>Faults exact object ki taraf point karte hain; audit log batata hai kisne use badla.</li>
<li>Har object jo aap banate ho, uske liye ek command ya GUI view jaano jo use verify kare.</li>
</ul></div>
`}};export{e as default};