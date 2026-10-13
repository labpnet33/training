var e={id:`aci-design`,h:{en:`Cisco ACI design: APIC, tenants, EPGs, contracts, Multi-Pod, Multi-Site and remote leaf`,hi:`Cisco ACI design: APIC, tenants, EPGs, contracts, Multi-Pod, Multi-Site aur remote leaf`},body:{en:`

<p>A traditional network is like a building where every door has its own lock that a technician sets by hand. ACI is a building with one security office: you write the rules ("accounting staff may enter the finance room") and the system programs every lock. This chapter designs an ACI deployment for a customer with several buildings, and decides which ACI extension model fits each one.</p>

<h3>The case: Lakeside Manufacturing Group</h3>
<div class="eg"><p><b>Customer.</b> Lakeside Manufacturing runs two data halls on one campus, a disaster-recovery (DR) site 400 km away, and 12 factories with 4 to 10 servers each (production line software).</p><p><b>Requirements.</b> One policy view for IT; strict separation of office, factory (OT) and development systems; application owners request network access without opening tickets for every VLAN; the factory sites must follow central policy.</p><p><b>Constraints.</b> Between the two halls there is dark fibre (low latency). The DR site is reached over a WAN. Factories have a single WAN link and no network engineers on site. Budget excludes a full fabric per factory.</p></div>

<h3>ACI building blocks</h3>
<p>The <b>APIC</b> (Application Policy Infrastructure Controller) is a cluster of appliances (a minimum of three for production) that holds the policy. It is not in the data path: if all APICs fail, leaves and spines keep forwarding, but you cannot change policy. Each fabric uses an internal <b>TEP pool</b> (tunnel endpoint addresses) and an infrastructure VLAN. Choose the TEP pool carefully at day 0: it is hard to change later, it must not overlap with anything you will connect, and a /16 is the usual recommendation, especially for Multi-Pod.</p>
<dl class="terms"><dt>Tenant</dt><dd>An administrative container: for example Office, Factory, Dev.</dd>
<dt>VRF</dt><dd>The tenant's Layer 3 routing instance.</dd>
<dt>Bridge domain (BD)</dt><dd>A Layer 2 forwarding domain with its subnets (gateway).</dd>
<dt>EPG</dt><dd>Endpoint group: servers that share the same policy, such as Web, App, DB.</dd>
<dt>Contract</dt><dd>The rule that lets one EPG talk to another: subjects and filters (protocols and ports). No contract means no traffic between EPGs.</dd>
<dt>L3Out</dt><dd>The routed connection from a VRF to the outside world.</dd></dl>
<pre class="code"><span class="c">! Policy model sketch, not CLI</span>
Tenant Factory
  VRF ot-vrf
  Bridge domain bd-line (10.40.1.1/24, ot-vrf)
  Application profile mes
    EPG mes-app  -> bd-line
    EPG mes-db   -> bd-line
  Contract app-to-db : subject tcp-1433 (provided by mes-db, consumed by mes-app)</pre>

<h3>Extension options</h3>
<table class="cmp"><tr><th>Model</th><th>What it is</th><th>Use when</th></tr>
<tr><td>Multi-Pod</td><td>One fabric, one APIC cluster, several pods linked by an IPN (inter-pod network) of ordinary routers</td><td>Nearby sites, low latency (the documented maximum is around 50 ms round trip), one failure domain acceptable</td></tr>
<tr><td>Multi-Site</td><td>Separate fabrics, each with its own APIC cluster, tied together by Nexus Dashboard Orchestrator through an inter-site network</td><td>Distant sites, isolated failure domains, DR</td></tr>
<tr><td>Remote leaf</td><td>Leaf switches at a small remote site, managed by the main fabric APICs over the WAN</td><td>Small sites that need the same policy but not a full fabric</td></tr></table>
<p>The IPN for Multi-Pod needs OSPF toward the pod spines, PIM Bidir for BUM traffic, DHCP relay so remote-pod nodes can discover the APICs, and a jumbo MTU. The remote leaf needs a routable path to the main pod.</p>

<h3>Chosen design for Lakeside</h3>
<p>The two halls become <b>Multi-Pod</b> (shared policy, one operations team, dark fibre makes latency easy). The DR site is a second fabric under <b>Multi-Site</b>, so a mistake in one site cannot take down the other; Nexus Dashboard Orchestrator pushes consistent tenants and contracts across sites. Each factory gets a <b>remote leaf</b> pair (or a single leaf where an outage is acceptable). Tenants: Office, Factory and Dev, with contracts allowing only the application ports needed. OT systems never share an EPG with office systems.</p>
<div class="warn"><p><b>Common mistakes.</b> Treating Multi-Pod as DR: it is one failure domain and one APIC cluster policy plane. Choosing a TEP pool that overlaps a WAN prefix. Leaving contracts as "permit all" and calling it segmentation.</p></div>

<div class="dia"><svg viewBox="0 0 640 282" role="img" aria-label="ACI design: two pods, a remote leaf and a DR site">
<rect x="10" y="8" width="250" height="172" rx="10" fill="#bbf7d0" fill-opacity="0.35" stroke="#64748b" stroke-dasharray="4 3"/><text x="18" y="24" class="svg-muted" font-size="12">Pod 1 (Hall A)</text>
<rect x="380" y="8" width="250" height="172" rx="10" fill="#bae6fd" fill-opacity="0.35" stroke="#64748b" stroke-dasharray="4 3"/><text x="388" y="24" class="svg-muted" font-size="12">Pod 2 (Hall B)</text>
<line x1="135" y1="55" x2="320" y2="55" stroke="#64748b" stroke-width="1.6"/>
<line x1="320" y1="55" x2="505" y2="55" stroke="#64748b" stroke-width="1.6"/>
<line x1="135" y1="55" x2="70" y2="108" stroke="#64748b" stroke-width="1.6"/>
<line x1="135" y1="55" x2="200" y2="108" stroke="#64748b" stroke-width="1.6"/>
<line x1="135" y1="152" x2="70" y2="108" stroke="#64748b" stroke-width="1.6"/>
<line x1="135" y1="152" x2="200" y2="108" stroke="#64748b" stroke-width="1.6"/>
<line x1="505" y1="55" x2="440" y2="108" stroke="#64748b" stroke-width="1.6"/>
<line x1="505" y1="55" x2="570" y2="108" stroke="#64748b" stroke-width="1.6"/>
<line x1="505" y1="152" x2="440" y2="108" stroke="#64748b" stroke-width="1.6"/>
<line x1="505" y1="152" x2="570" y2="108" stroke="#64748b" stroke-width="1.6"/>
<line x1="320" y1="55" x2="320" y2="135" stroke="#64748b" stroke-width="1.6" stroke-dasharray="5 4"/>
<line x1="320" y1="135" x2="320" y2="232" stroke="#64748b" stroke-width="1.6"/>
<line x1="320" y1="135" x2="95" y2="232" stroke="#64748b" stroke-width="1.6" stroke-dasharray="5 4"/>
<line x1="320" y1="232" x2="510" y2="232" stroke="#64748b" stroke-width="1.6"/>
<rect x="92" y="38" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="98" y1="43" x2="172" y2="43" stroke="#16a34a" stroke-width="2"/><text x="135" y="59" text-anchor="middle" class="svg-ink" font-size="12">Spine</text>
<rect x="35" y="91" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="41" y1="120" x2="99" y2="120" stroke="#0284c7" stroke-width="2"/><text x="70" y="112" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="165" y="91" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="171" y1="120" x2="229" y2="120" stroke="#0284c7" stroke-width="2"/><text x="200" y="112" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="85" y="135" width="100" height="34" rx="7" fill="#fde68a" stroke="#64748b"/><text x="135" y="156" text-anchor="middle" class="svg-ink" font-size="12">APIC 1, 2</text>
<rect x="462" y="38" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="468" y1="43" x2="542" y2="43" stroke="#16a34a" stroke-width="2"/><text x="505" y="59" text-anchor="middle" class="svg-ink" font-size="12">Spine</text>
<rect x="405" y="91" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="411" y1="120" x2="469" y2="120" stroke="#0284c7" stroke-width="2"/><text x="440" y="112" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="535" y="91" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="541" y1="120" x2="599" y2="120" stroke="#0284c7" stroke-width="2"/><text x="570" y="112" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="455" y="135" width="100" height="34" rx="7" fill="#fde68a" stroke="#64748b"/><text x="505" y="156" text-anchor="middle" class="svg-ink" font-size="12">APIC 3</text>
<ellipse cx="320" cy="55" rx="35" ry="21" fill="#fde68a" stroke="#64748b"/><text x="320" y="59" text-anchor="middle" class="svg-ink" font-size="12">IPN</text>
<ellipse cx="320" cy="135" rx="35" ry="21" fill="#fde68a" stroke="#64748b"/><text x="320" y="139" text-anchor="middle" class="svg-ink" font-size="12">WAN</text>
<rect x="30" y="215" width="130" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="36" y1="220" x2="154" y2="220" stroke="#16a34a" stroke-width="2"/><text x="95" y="236" text-anchor="middle" class="svg-ink" font-size="12">DR site fabric</text>
<rect x="265" y="215" width="110" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="271" y1="244" x2="369" y2="244" stroke="#0284c7" stroke-width="2"/><text x="320" y="236" text-anchor="middle" class="svg-ink" font-size="12">Remote leaf</text>
<rect x="445" y="215" width="130" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="449" y="219" width="6" height="26" fill="#94a3b8"/><text x="510" y="236" text-anchor="middle" class="svg-ink" font-size="12">Factory servers</text>
<text x="326" y="100" text-anchor="start" class="svg-muted" font-size="12">Multi-Pod</text>
<text x="210" y="192" text-anchor="middle" class="svg-muted" font-size="12">Multi-Site</text>
<text x="420" y="192" text-anchor="middle" class="svg-muted" font-size="12">Remote leaf</text>
<line x1="16" y1="248" x2="624" y2="248" stroke="#e2e8f0"/><rect x="16" y="258" width="14" height="12" rx="2" fill="#bbf7d0" stroke="#64748b"/><text x="35" y="268" class="svg-muted" font-size="11">Spine</text><rect x="137.6" y="258" width="14" height="12" rx="2" fill="#bae6fd" stroke="#64748b"/><text x="156.6" y="268" class="svg-muted" font-size="11">Leaf / access</text><rect x="259.2" y="258" width="14" height="12" rx="2" fill="#fde68a" stroke="#64748b"/><text x="278.2" y="268" class="svg-muted" font-size="11">Controller</text><rect x="380.79999999999995" y="258" width="14" height="12" rx="2" fill="#fde68a" stroke="#64748b"/><text x="399.79999999999995" y="268" class="svg-muted" font-size="11">WAN / cloud</text><rect x="502.4" y="258" width="14" height="12" rx="2" fill="#e2e8f0" stroke="#64748b"/><text x="521.4" y="268" class="svg-muted" font-size="11">Server / host</text>
</svg><p class="cap">Two pods share one APIC cluster over the IPN. The DR fabric joins by Multi-Site. Factories attach by remote leaf over the WAN.</p></div>

<div class="exam"><p><b>Exam trap.</b> Multi-Pod is one APIC cluster (one policy domain, one failure domain). Multi-Site is several clusters orchestrated centrally. Remote leaf extends a fabric to a small site without a spine.</p></div>

<div class="scn"><h4>What went wrong at Lakeside</h4><p>Pod 2 spines came up but its leaves never registered. The IPN routers had OSPF and multicast configured, but nobody had enabled DHCP relay on the IPN interfaces facing the spines, so the new leaves could not get discovery addresses from the APICs. A second issue followed: with the TEP pool set to a /23, planned growth to 120 nodes would not fit. The team rebuilt the TEP plan before production.</p><p><b>Lesson:</b> write the IPN requirement list (OSPF, PIM Bidir, DHCP relay, MTU) into the design and test it before ordering the pods.</p></div>

<div class="iv"><p class="q">"Multi-Pod or Multi-Site for my second data center?"</p><p>Ask about latency, distance and failure-domain tolerance. Close, fast and one operations team: Multi-Pod. Far apart, DR, or need to contain a software or policy fault: Multi-Site. Add that both can coexist.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>APIC holds policy, not data; the fabric forwards without it.</li>
<li>Tenant, VRF, BD, EPG and contract are the policy chain; no contract, no traffic.</li>
<li>Multi-Pod: one cluster, IPN; Multi-Site: many clusters, Orchestrator.</li>
<li>Remote leaf serves small sites; size the TEP pool at day 0.</li>
</ul></div>

`,hi:`

<p>Traditional network aisi building hai jahan har darwaze ka apna lock hai jo technician haath se set karta hai. ACI aisi building hai jisme ek security office hai: aap rules likhte ho ("accounting staff finance room mein ja sakta hai") aur system har lock program kar deta hai. Yeh chapter kai buildings wale customer ke liye ACI deployment design karta hai, aur har ek ke liye sahi ACI extension model chunta hai.</p>

<h3>Case: Lakeside Manufacturing Group</h3>
<div class="eg"><p><b>Customer.</b> Lakeside Manufacturing ek campus mein do data halls, 400 km door ek disaster-recovery (DR) site, aur 12 factories chalata hai jinme 4 se 10 servers hain (production line software).</p><p><b>Requirements.</b> IT ke liye ek policy view; office, factory (OT) aur development systems ka strict separation; application owners har VLAN ke ticket ke bina network access maangein; factory sites central policy follow karein.</p><p><b>Constraints.</b> Dono halls ke beech dark fibre hai (low latency). DR site WAN se pahunchte hain. Factories mein ek WAN link hai aur site par network engineer nahi. Budget mein har factory ka poora fabric shaamil nahi.</p></div>

<h3>ACI building blocks</h3>
<p><b>APIC</b> (Application Policy Infrastructure Controller) appliances ka cluster hai (production ke liye kam se kam teen) jo policy hold karta hai. Yeh data path mein nahi hai: saare APICs fail ho jaayein to bhi leaves aur spines forwarding karte rehte hain, par aap policy badal nahi sakte. Har fabric ek internal <b>TEP pool</b> (tunnel endpoint addresses) aur infrastructure VLAN use karta hai. TEP pool day 0 par dhyan se chuno: baad mein badalna mushkil hai, jo connect karoge usse overlap nahi hona chahiye, aur /16 usual recommendation hai, khaaskar Multi-Pod mein.</p>
<dl class="terms"><dt>Tenant</dt><dd>Administrative container: jaise Office, Factory, Dev.</dd>
<dt>VRF</dt><dd>Tenant ka Layer 3 routing instance.</dd>
<dt>Bridge domain (BD)</dt><dd>Apne subnets (gateway) ke saath Layer 2 forwarding domain.</dd>
<dt>EPG</dt><dd>Endpoint group: same policy share karne wale servers, jaise Web, App, DB.</dd>
<dt>Contract</dt><dd>Rule jo ek EPG ko doosre se baat karne deta hai: subjects aur filters (protocols aur ports). Contract nahi to EPGs ke beech traffic nahi.</dd>
<dt>L3Out</dt><dd>VRF se bahar ki duniya tak routed connection.</dd></dl>
<pre class="code"><span class="c">! Policy model sketch, not CLI</span>
Tenant Factory
  VRF ot-vrf
  Bridge domain bd-line (10.40.1.1/24, ot-vrf)
  Application profile mes
    EPG mes-app  -> bd-line
    EPG mes-db   -> bd-line
  Contract app-to-db : subject tcp-1433 (provided by mes-db, consumed by mes-app)</pre>

<h3>Extension options</h3>
<table class="cmp"><tr><th>Model</th><th>Yeh kya hai</th><th>Kab use karein</th></tr>
<tr><td>Multi-Pod</td><td>Ek fabric, ek APIC cluster, kai pods jo ordinary routers ke IPN (inter-pod network) se jude hain</td><td>Paas ki sites, low latency (documented maximum lagbhag 50 ms round trip), ek failure domain acceptable</td></tr>
<tr><td>Multi-Site</td><td>Alag fabrics, har ek ka apna APIC cluster, Nexus Dashboard Orchestrator se inter-site network par jude</td><td>Door ki sites, isolated failure domains, DR</td></tr>
<tr><td>Remote leaf</td><td>Chhoti remote site par leaf switches, jo main fabric ke APICs WAN par manage karte hain</td><td>Chhoti sites jinhe same policy chahiye par poora fabric nahi</td></tr></table>
<p>Multi-Pod ke IPN ko pod spines ki taraf OSPF, BUM traffic ke liye PIM Bidir, DHCP relay (taaki remote-pod nodes APICs discover kar sakein) aur jumbo MTU chahiye. Remote leaf ko main pod tak routable path chahiye.</p>

<h3>Lakeside ke liye chosen design</h3>
<p>Dono halls <b>Multi-Pod</b> banenge (shared policy, ek operations team, dark fibre se latency aasan). DR site <b>Multi-Site</b> ke under doosra fabric hai, taaki ek site ki galti doosri ko na giraye; Nexus Dashboard Orchestrator sites ke across consistent tenants aur contracts push karta hai. Har factory ko <b>remote leaf</b> pair milta hai (ya jahan outage acceptable ho wahan single leaf). Tenants: Office, Factory aur Dev, contracts sirf zaroori application ports allow karte hain. OT systems kabhi office systems ke saath EPG share nahi karte.</p>
<div class="warn"><p><b>Common mistakes.</b> Multi-Pod ko DR maanna: yeh ek failure domain aur ek APIC cluster policy plane hai. TEP pool WAN prefix se overlap hone dena. Contracts ko "permit all" chhodkar segmentation kehna.</p></div>

<div class="dia"><svg viewBox="0 0 640 282" role="img" aria-label="ACI design: do pods, ek remote leaf aur DR site">
<rect x="10" y="8" width="250" height="172" rx="10" fill="#bbf7d0" fill-opacity="0.35" stroke="#64748b" stroke-dasharray="4 3"/><text x="18" y="24" class="svg-muted" font-size="12">Pod 1 (Hall A)</text>
<rect x="380" y="8" width="250" height="172" rx="10" fill="#bae6fd" fill-opacity="0.35" stroke="#64748b" stroke-dasharray="4 3"/><text x="388" y="24" class="svg-muted" font-size="12">Pod 2 (Hall B)</text>
<line x1="135" y1="55" x2="320" y2="55" stroke="#64748b" stroke-width="1.6"/>
<line x1="320" y1="55" x2="505" y2="55" stroke="#64748b" stroke-width="1.6"/>
<line x1="135" y1="55" x2="70" y2="108" stroke="#64748b" stroke-width="1.6"/>
<line x1="135" y1="55" x2="200" y2="108" stroke="#64748b" stroke-width="1.6"/>
<line x1="135" y1="152" x2="70" y2="108" stroke="#64748b" stroke-width="1.6"/>
<line x1="135" y1="152" x2="200" y2="108" stroke="#64748b" stroke-width="1.6"/>
<line x1="505" y1="55" x2="440" y2="108" stroke="#64748b" stroke-width="1.6"/>
<line x1="505" y1="55" x2="570" y2="108" stroke="#64748b" stroke-width="1.6"/>
<line x1="505" y1="152" x2="440" y2="108" stroke="#64748b" stroke-width="1.6"/>
<line x1="505" y1="152" x2="570" y2="108" stroke="#64748b" stroke-width="1.6"/>
<line x1="320" y1="55" x2="320" y2="135" stroke="#64748b" stroke-width="1.6" stroke-dasharray="5 4"/>
<line x1="320" y1="135" x2="320" y2="232" stroke="#64748b" stroke-width="1.6"/>
<line x1="320" y1="135" x2="95" y2="232" stroke="#64748b" stroke-width="1.6" stroke-dasharray="5 4"/>
<line x1="320" y1="232" x2="510" y2="232" stroke="#64748b" stroke-width="1.6"/>
<rect x="92" y="38" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="98" y1="43" x2="172" y2="43" stroke="#16a34a" stroke-width="2"/><text x="135" y="59" text-anchor="middle" class="svg-ink" font-size="12">Spine</text>
<rect x="35" y="91" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="41" y1="120" x2="99" y2="120" stroke="#0284c7" stroke-width="2"/><text x="70" y="112" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="165" y="91" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="171" y1="120" x2="229" y2="120" stroke="#0284c7" stroke-width="2"/><text x="200" y="112" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="85" y="135" width="100" height="34" rx="7" fill="#fde68a" stroke="#64748b"/><text x="135" y="156" text-anchor="middle" class="svg-ink" font-size="12">APIC 1, 2</text>
<rect x="462" y="38" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="468" y1="43" x2="542" y2="43" stroke="#16a34a" stroke-width="2"/><text x="505" y="59" text-anchor="middle" class="svg-ink" font-size="12">Spine</text>
<rect x="405" y="91" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="411" y1="120" x2="469" y2="120" stroke="#0284c7" stroke-width="2"/><text x="440" y="112" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="535" y="91" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="541" y1="120" x2="599" y2="120" stroke="#0284c7" stroke-width="2"/><text x="570" y="112" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="455" y="135" width="100" height="34" rx="7" fill="#fde68a" stroke="#64748b"/><text x="505" y="156" text-anchor="middle" class="svg-ink" font-size="12">APIC 3</text>
<ellipse cx="320" cy="55" rx="35" ry="21" fill="#fde68a" stroke="#64748b"/><text x="320" y="59" text-anchor="middle" class="svg-ink" font-size="12">IPN</text>
<ellipse cx="320" cy="135" rx="35" ry="21" fill="#fde68a" stroke="#64748b"/><text x="320" y="139" text-anchor="middle" class="svg-ink" font-size="12">WAN</text>
<rect x="30" y="215" width="130" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="36" y1="220" x2="154" y2="220" stroke="#16a34a" stroke-width="2"/><text x="95" y="236" text-anchor="middle" class="svg-ink" font-size="12">DR site fabric</text>
<rect x="265" y="215" width="110" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="271" y1="244" x2="369" y2="244" stroke="#0284c7" stroke-width="2"/><text x="320" y="236" text-anchor="middle" class="svg-ink" font-size="12">Remote leaf</text>
<rect x="445" y="215" width="130" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="449" y="219" width="6" height="26" fill="#94a3b8"/><text x="510" y="236" text-anchor="middle" class="svg-ink" font-size="12">Factory servers</text>
<text x="326" y="100" text-anchor="start" class="svg-muted" font-size="12">Multi-Pod</text>
<text x="210" y="192" text-anchor="middle" class="svg-muted" font-size="12">Multi-Site</text>
<text x="420" y="192" text-anchor="middle" class="svg-muted" font-size="12">Remote leaf</text>
<line x1="16" y1="248" x2="624" y2="248" stroke="#e2e8f0"/><rect x="16" y="258" width="14" height="12" rx="2" fill="#bbf7d0" stroke="#64748b"/><text x="35" y="268" class="svg-muted" font-size="11">Spine</text><rect x="137.6" y="258" width="14" height="12" rx="2" fill="#bae6fd" stroke="#64748b"/><text x="156.6" y="268" class="svg-muted" font-size="11">Leaf / access</text><rect x="259.2" y="258" width="14" height="12" rx="2" fill="#fde68a" stroke="#64748b"/><text x="278.2" y="268" class="svg-muted" font-size="11">Controller</text><rect x="380.79999999999995" y="258" width="14" height="12" rx="2" fill="#fde68a" stroke="#64748b"/><text x="399.79999999999995" y="268" class="svg-muted" font-size="11">WAN / cloud</text><rect x="502.4" y="258" width="14" height="12" rx="2" fill="#e2e8f0" stroke="#64748b"/><text x="521.4" y="268" class="svg-muted" font-size="11">Server / host</text>
</svg><p class="cap">Do pods IPN par ek APIC cluster share karte hain. DR fabric Multi-Site se judta hai. Factories WAN par remote leaf se judti hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Multi-Pod ek APIC cluster hai (ek policy domain, ek failure domain). Multi-Site kai clusters hain jo centrally orchestrate hote hain. Remote leaf spine ke bina chhoti site tak fabric extend karta hai.</p></div>

<div class="scn"><h4>Lakeside mein kya galat hua</h4><p>Pod 2 ke spines up ho gaye par uske leaves kabhi register nahi hue. IPN routers par OSPF aur multicast configured the, par spines ki taraf IPN interfaces par DHCP relay kisi ne enable nahi kiya tha, isliye naye leaves ko APICs se discovery addresses nahi mile. Phir doosra issue: TEP pool /23 set tha, to 120 nodes tak planned growth fit nahi hoti. Team ne production se pehle TEP plan dobara banaya.</p><p><b>Lesson:</b> IPN requirement list (OSPF, PIM Bidir, DHCP relay, MTU) design mein likho aur pods order karne se pehle test karo.</p></div>

<div class="iv"><p class="q">"Mere doosre data center ke liye Multi-Pod ya Multi-Site?"</p><p>Latency, distance aur failure-domain tolerance poochho. Paas, fast aur ek operations team: Multi-Pod. Door, DR, ya software ya policy fault contain karna ho: Multi-Site. Batao ki dono saath bhi chal sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>APIC policy hold karta hai, data nahi; fabric uske bina forward karta hai.</li>
<li>Tenant, VRF, BD, EPG aur contract policy chain hai; contract nahi to traffic nahi.</li>
<li>Multi-Pod: ek cluster, IPN; Multi-Site: kai clusters, Orchestrator.</li>
<li>Remote leaf chhoti sites ke liye hai; TEP pool day 0 par size karo.</li>
</ul></div>

`}};export{e as default};