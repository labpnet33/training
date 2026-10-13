var e={id:`service-design`,h:{en:`Designing L2VPN services: choosing the technology, MTU, QoS and scale`,hi:`L2VPN services design karna: technology, MTU, QoS aur scale chunna`},body:{en:`
<p>Knowing each technology is half the job. The other half is choosing the right one for a customer and a network, and sizing it so it keeps working. This chapter gives a decision method and the design checks that SPCOR scenarios test: MTU, QoS, loop and MAC protection, redundancy and scale.</p>

<h3>Step 1: choose the service and technology</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Choosing an L2VPN technology">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">How many sites?</text>
<rect x="20" y="100" width="180" height="50" rx="8" fill="#bae6fd"/><text x="110" y="122" text-anchor="middle" class="svg-ink" font-size="12">Two sites</text><text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="11">VPWS (LDP) or EVPN VPWS</text>
<rect x="230" y="100" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">Many sites, one LAN</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="11">VPLS or EVPN</text>
<rect x="440" y="100" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="122" text-anchor="middle" class="svg-ink" font-size="12">Hub and spoke L2</text><text x="530" y="140" text-anchor="middle" class="svg-muted" font-size="11">E-Tree (EVPN or VPLS)</text>
<line x1="280" y1="50" x2="110" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="50" x2="530" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Then ask: multihoming needed? MAC scale? existing LDP only core?</text>
</svg><p class="cap">A first-cut decision tree for L2VPN technology.</p></div>
<table class="cmp"><tr><th>Requirement</th><th>Prefer</th><th>Reason</th></tr>
<tr><td>Simple point-to-point wire</td><td>VPWS</td><td>No MAC learning, small state</td></tr>
<tr><td>Multipoint with all-active dual-homing</td><td>EVPN</td><td>ESI, DF, aliasing, mass withdrawal</td></tr>
<tr><td>Existing LDP-only core, small customer count</td><td>VPLS</td><td>Works with what you have</td></tr>
<tr><td>Very many MACs in the core</td><td>PBB-EVPN</td><td>Core sees B-MACs</td></tr>
<tr><td>Metro access with VLAN overlap</td><td>802.1ad Q-in-Q at the edge</td><td>S-VLAN isolates customers</td></tr></table>

<h3>Step 2: the MTU budget</h3>
<p>Add every header the customer frame will carry across the core. For an Ethernet pseudowire over MPLS: two MPLS labels (4 bytes each) plus a control word (4 bytes) on top of the customer frame. A frame that includes the Ethernet header is 14 bytes plus payload, plus 4 for each VLAN tag. Sum them and raise the core interface MTU so the largest customer frame still fits. If the customer wants a payload of 1500 bytes with a C-tag, the budget is 1500 + 14 + 4 + 12 (three 4-byte items) = 1530 bytes, and more if the core also uses fast reroute or extra labels. Always add a margin, and remember that the signalled PW MTU must match at both PEs.</p>
<div class="eg"><p><b>Worked example.</b> Customer payload 1500, Ethernet header 14, one C-tag 4, one S-tag 4: 1522 bytes. MPLS transport label 4, PW label 4, control word 4: 12 bytes. Total 1534 bytes. The provider sets core MTU to 9000 to leave room for future labels, and signals a PW MTU of 1500 at both PEs, which means the AC MTU is 1500.</p></div>

<h3>Step 3: QoS</h3>
<ul>
<li><b>Classify at the UNI</b> by 802.1p (PCP), DSCP of the payload, or VLAN, and mark the MPLS EXP or traffic class bits for the core.</li>
<li><b>Police</b> to the sold CIR and EIR at ingress; colour frames green or yellow (DEI bit in the S-tag helps).</li>
<li><b>Shape and schedule</b> on core interfaces so priority classes receive low delay.</li>
<li>Decide whether the tunnel uses <b>pipe</b> or <b>uniform</b> model for QoS marking inside the core; the choice decides whether core re-marking affects the customer's markings.</li>
</ul>

<h3>Step 4: protect the provider</h3>
<ul>
<li>MAC limit per bridge domain and per AC, with an action.</li>
<li>Storm control for broadcast, unknown unicast and multicast on every UNI.</li>
<li>Layer 2 control protocol policy (tunnel, drop, peer) and BPDU guard where relevant.</li>
<li>Rate limit CFM and other OAM so a customer cannot flood the control plane.</li>
<li>In EVPN, limit MAC mobility events so a flapping host cannot cause constant BGP churn.</li>
</ul>

<h3>Step 5: resilience and scale</h3>
<ul>
<li>Dual-home customers with EVPN multihoming or MC-LAG; use PW redundancy with VPWS.</li>
<li>Count state: pseudowires per PE (n-1 per VPLS), MACs per bridge domain, EVPN routes per PE. Compare with platform limits from the data sheet; do not use made-up limits.</li>
<li>Use route reflectors for EVPN and BGP-signalled VPLS so full-mesh BGP is not needed.</li>
<li>Plan failure domains: which customer is affected if one PE fails?</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Choosing VPLS for a point-to-point need and paying for flooding; forgetting MTU until a customer complains; and no MAC limits.</p></div>
<div class="exam"><p><b>Exam trap.</b> When a question gives a dual-homing requirement with all-active load balancing in a multipoint service, the answer is EVPN. When it gives two sites and an LDP-only core, VPWS fits.</p></div>

<div class="scn"><h4>A VPLS for 40 sites becomes hard to run</h4><p>An operator sold a 40-site VPLS using manual neighbours. Each new site needed changes on 39 PEs and the pseudowire count grew quadratically. They migrated the service to EVPN with route reflectors; adding a site then needed one local change and BGP auto-discovery did the rest.</p><p><b>Lesson:</b> pick the control plane for the operational model, not only for the feature list.</p></div>

<div class="iv"><p class="q">"How would you design an E-LAN for 40 enterprise sites?"</p><p>EVPN over MPLS with route reflectors for auto-discovery and no full-mesh configuration, ESI for dual-homed sites, MAC limits and storm control at each UNI, an MTU budget covering all tags and labels, and QoS with policing at the UNI. Explain the fallback to VPLS if the platform lacks EVPN.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Match technology to need: VPWS for P2P, EVPN for multipoint with multihoming, VPLS for legacy.</li>
<li>Budget MTU for every tag, label and control word.</li>
<li>Apply QoS at the UNI: classify, police, mark, schedule.</li>
<li>Protect the provider with MAC limits and storm control.</li>
<li>Check scale and failure domains against real platform data.</li>
</ul></div>
`,hi:`
<p>Har technology jaanna aadha kaam hai. Doosra aadha customer aur network ke liye sahi technology chunna aur use aise size karna hai ki kaam karti rahe. Yeh chapter decision method aur woh design checks deta hai jo SPCOR scenarios test karte hain: MTU, QoS, loop aur MAC protection, redundancy aur scale.</p>

<h3>Step 1: service aur technology chuno</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="L2VPN technology chunna">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Kitni sites?</text>
<rect x="20" y="100" width="180" height="50" rx="8" fill="#bae6fd"/><text x="110" y="122" text-anchor="middle" class="svg-ink" font-size="12">Do sites</text><text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="11">VPWS (LDP) ya EVPN VPWS</text>
<rect x="230" y="100" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">Kai sites, ek LAN</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="11">VPLS ya EVPN</text>
<rect x="440" y="100" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="122" text-anchor="middle" class="svg-ink" font-size="12">Hub and spoke L2</text><text x="530" y="140" text-anchor="middle" class="svg-muted" font-size="11">E-Tree (EVPN ya VPLS)</text>
<line x1="280" y1="50" x2="110" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="50" x2="530" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Phir poochho: multihoming? MAC scale? sirf LDP wala core?</text>
</svg><p class="cap">L2VPN technology ke liye pehla decision tree.</p></div>
<table class="cmp"><tr><th>Requirement</th><th>Prefer</th><th>Reason</th></tr>
<tr><td>Simple point-to-point wire</td><td>VPWS</td><td>MAC learning nahi, chhoti state</td></tr>
<tr><td>All-active dual-homing ke saath multipoint</td><td>EVPN</td><td>ESI, DF, aliasing, mass withdrawal</td></tr>
<tr><td>Maujooda LDP-only core, kam customers</td><td>VPLS</td><td>Jo hai usi se chalta hai</td></tr>
<tr><td>Core mein bahut saare MACs</td><td>PBB-EVPN</td><td>Core B-MACs dekhta hai</td></tr>
<tr><td>VLAN overlap wala metro access</td><td>Edge par 802.1ad Q-in-Q</td><td>S-VLAN customers ko isolate karta hai</td></tr></table>

<h3>Step 2: MTU budget</h3>
<p>Core ke across customer frame jo bhi headers carry karega sab jodo. MPLS par Ethernet pseudowire ke liye: customer frame ke upar do MPLS labels (4 bytes each) plus control word (4 bytes). Jis frame mein Ethernet header hai woh 14 bytes plus payload, plus har VLAN tag ke 4. Inhe jodkar core interface MTU badhao taaki sabse bada customer frame fit ho. Agar customer C-tag ke saath 1500 bytes payload chahta hai, to budget 1500 + 14 + 4 + 12 (teen 4-byte items) = 1530 bytes hai, aur zyaada agar core fast reroute ya extra labels bhi use kare. Hamesha margin rakho, aur yaad rakho ki signalled PW MTU dono PEs par match karna chahiye.</p>
<div class="eg"><p><b>Worked example.</b> Customer payload 1500, Ethernet header 14, ek C-tag 4, ek S-tag 4: 1522 bytes. MPLS transport label 4, PW label 4, control word 4: 12 bytes. Total 1534 bytes. Provider future labels ke liye core MTU 9000 set karta hai, aur dono PEs par 1500 ka PW MTU signal karta hai, yaani AC MTU 1500 hai.</p></div>

<h3>Step 3: QoS</h3>
<ul>
<li><b>UNI par classify</b> karo 802.1p (PCP), payload ke DSCP ya VLAN se, aur core ke liye MPLS EXP ya traffic class bits mark karo.</li>
<li>Ingress par bechi gayi CIR aur EIR tak <b>police</b> karo; frames ko green ya yellow colour do (S-tag ka DEI bit madad karta hai).</li>
<li>Core interfaces par <b>shape aur schedule</b> karo taaki priority classes ko kam delay mile.</li>
<li>Tay karo ki tunnel core ke andar QoS marking ke liye <b>pipe</b> ya <b>uniform</b> model use karta hai; yeh choice tay karti hai ki core re-marking customer ke markings ko affect karti hai ya nahi.</li>
</ul>

<h3>Step 4: provider ko protect karo</h3>
<ul>
<li>Per bridge domain aur per AC MAC limit, action ke saath.</li>
<li>Har UNI par broadcast, unknown unicast aur multicast ke liye storm control.</li>
<li>Layer 2 control protocol policy (tunnel, drop, peer) aur jahan relevant ho BPDU guard.</li>
<li>CFM aur doosre OAM ko rate limit karo taaki customer control plane ko flood na kar sake.</li>
<li>EVPN mein MAC mobility events limit karo taaki flapping host constant BGP churn na kare.</li>
</ul>

<h3>Step 5: resilience aur scale</h3>
<ul>
<li>Customers ko EVPN multihoming ya MC-LAG se dual-home karo; VPWS ke saath PW redundancy use karo.</li>
<li>State gino: per PE pseudowires (har VPLS mein n-1), per bridge domain MACs, per PE EVPN routes. Data sheet ke platform limits se compare karo; banaye hue limits use mat karo.</li>
<li>EVPN aur BGP-signalled VPLS ke liye route reflectors use karo taaki full-mesh BGP na chahiye.</li>
<li>Failure domains plan karo: ek PE fail ho to kaun sa customer affect hoga?</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Point-to-point need ke liye VPLS chunna aur flooding ki keemat dena; customer ki shikayat tak MTU bhoolna; aur MAC limits nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jab question multipoint service mein all-active load balancing ke saath dual-homing requirement deta hai, jawab EVPN hai. Jab do sites aur LDP-only core deta hai, VPWS fit hota hai.</p></div>

<div class="scn"><h4>40 sites ka VPLS chalana mushkil ho gaya</h4><p>Operator ne manual neighbours se 40-site VPLS becha. Har nayi site ke liye 39 PEs par changes chahiye the aur pseudowire count quadratically badha. Unhone service ko route reflectors ke saath EVPN par migrate kiya; phir site jodne ke liye ek local change chahiye tha aur BGP auto-discovery ne baaki kiya.</p><p><b>Lesson:</b> control plane operational model ke hisaab se chuno, sirf feature list se nahi.</p></div>

<div class="iv"><p class="q">"40 enterprise sites ke liye E-LAN kaise design karoge?"</p><p>MPLS par EVPN, auto-discovery ke liye route reflectors aur full-mesh configuration nahi, dual-homed sites ke liye ESI, har UNI par MAC limits aur storm control, saari tags aur labels cover karne wala MTU budget, aur UNI par policing ke saath QoS. Agar platform EVPN support na kare to VPLS fallback samjhao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Need se technology match karo: P2P ke liye VPWS, multihoming ke saath multipoint ke liye EVPN, legacy ke liye VPLS.</li>
<li>Har tag, label aur control word ke liye MTU budget banao.</li>
<li>UNI par QoS lagao: classify, police, mark, schedule.</li>
<li>MAC limits aur storm control se provider ko protect karo.</li>
<li>Scale aur failure domains ko asli platform data se check karo.</li>
</ul></div>
`}};export{e as default};