var e={id:`access-policies`,h:{en:`Access policies: from VLAN pool to leaf port, static bindings and fault F0467`,hi:`Access policies: VLAN pool se leaf port tak, static bindings aur fault F0467`},body:{en:`
<p>Think of an office where tenants rent space, but the <b>facilities team</b> controls the doors. A tenant can say "my finance team sits in room 12", but only if facilities has given that tenant a badge range that opens room 12. In ACI the tenant admin builds EPGs, but the <b>fabric admin</b> decides which leaf ports and which VLANs a tenant may use. That permission system is called <b>access policies</b>, and it lives under <b>Fabric → Access Policies</b>.</p>

<h3>The chain, object by object</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Access policy chain">
<rect x="10" y="20" width="140" height="40" rx="6" fill="#fde68a"/><text x="80" y="38" text-anchor="middle" class="svg-ink" font-size="12">EPG (tenant)</text><text x="80" y="53" text-anchor="middle" class="svg-muted" font-size="12">static port vlan-110</text>
<rect x="170" y="20" width="140" height="40" rx="6" fill="#fed7aa"/><text x="240" y="45" text-anchor="middle" class="svg-ink" font-size="12">Physical domain</text>
<rect x="330" y="20" width="140" height="40" rx="6" fill="#e2e8f0"/><text x="400" y="45" text-anchor="middle" class="svg-ink" font-size="12">VLAN pool 100-199</text>
<line x1="150" y1="40" x2="170" y2="40" stroke="#64748b" stroke-width="2"/><line x1="310" y1="40" x2="330" y2="40" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="100" width="140" height="40" rx="6" fill="#ddd6fe"/><text x="240" y="125" text-anchor="middle" class="svg-ink" font-size="12">AAEP</text>
<line x1="240" y1="60" x2="240" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="180" width="140" height="40" rx="6" fill="#bbf7d0"/><text x="240" y="198" text-anchor="middle" class="svg-ink" font-size="12">Interface policy</text><text x="240" y="213" text-anchor="middle" class="svg-ink" font-size="12">group</text>
<line x1="240" y1="140" x2="240" y2="180" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="180" width="140" height="40" rx="6" fill="#bae6fd"/><text x="400" y="198" text-anchor="middle" class="svg-ink" font-size="12">Interface profile</text><text x="400" y="213" text-anchor="middle" class="svg-muted" font-size="12">ports 1/1-2</text>
<rect x="490" y="180" width="140" height="40" rx="6" fill="#bae6fd"/><text x="560" y="198" text-anchor="middle" class="svg-ink" font-size="12">Switch profile</text><text x="560" y="213" text-anchor="middle" class="svg-muted" font-size="12">nodes 101-102</text>
<line x1="330" y1="200" x2="310" y2="200" stroke="#64748b" stroke-width="2"/><line x1="490" y1="200" x2="470" y2="200" stroke="#64748b" stroke-width="2"/>
<text x="560" y="125" text-anchor="middle" class="svg-accent" font-size="12">read right to left:</text><text x="560" y="141" text-anchor="middle" class="svg-accent" font-size="12">which leaf, which port,</text><text x="560" y="157" text-anchor="middle" class="svg-accent" font-size="12">which domains and VLANs</text>
</svg><p class="cap">The tenant meets the fabric at the domain: the EPG's domain must be reachable from the port through the AAEP.</p></div>

<table class="cmp"><tr><th>#</th><th>Object (class)</th><th>What it holds</th><th>GUI path under Fabric → Access Policies</th></tr>
<tr><td>1</td><td>VLAN pool (fvnsVlanInstP)</td><td>Encap blocks such as 100-199; <b>static</b> allocation for static ports, <b>dynamic</b> for VMM</td><td>Pools → VLAN</td></tr>
<tr><td>2</td><td>Domain (physDomP for physical)</td><td>One VLAN pool; the "permission" an EPG must reference. Other types: L3 domain (L3Out), external bridged domain (L2Out), VMM domain</td><td>Physical and External Domains → Physical Domains</td></tr>
<tr><td>3</td><td>AAEP (infraAttEntityP)</td><td>The list of domains allowed on the ports that use it</td><td>Policies → Global → Attachable Access Entity Profiles</td></tr>
<tr><td>4</td><td>Interface policy group (infraAccPortGrp)</td><td>AAEP plus port settings: link speed, CDP, LLDP, and for PC/vPC the LACP policy</td><td>Interfaces → Leaf Interfaces → Policy Groups → Leaf Access Port</td></tr>
<tr><td>5</td><td>Leaf interface profile (infraAccPortP)</td><td>Port selectors (for example 1/1-1/2) pointing to a policy group</td><td>Interfaces → Leaf Interfaces → Profiles</td></tr>
<tr><td>6</td><td>Leaf switch profile (infraNodeP)</td><td>Leaf selector (for example nodes 101-102) plus the interface profiles to apply</td><td>Switches → Leaf Switches → Profiles</td></tr>
</table>
<p>The policy group type decides the link type: a <b>Leaf Access Port</b> policy group for single ports, a <b>PC</b> or <b>vPC</b> interface policy group for bundles (a vPC also needs the two leaves paired in a vPC explicit protection group). Reuse matters: one policy group can serve hundreds of identical server ports.</p>

<h3>Lab 2 walkthrough</h3>
<pre class="code"><span class="c">! Fabric admin: permissions</span>
Pools &gt; VLAN &gt; Create VLAN Pool: NK-POOL, Static Allocation, Encap Block 100-199
Physical Domains &gt; Create Physical Domain: NK-PHYS, VLAN Pool NK-POOL
Attachable Access Entity Profiles &gt; Create: NK-AAEP, Domains: NK-PHYS
<span class="c">! Fabric admin: which ports</span>
Leaf Access Port policy group: NK-SRV-PG, AAEP NK-AAEP
Leaf Interface Profile: NK-LEAF-IFP, port selector SERVERS 1/1-1/2 -&gt; NK-SRV-PG
Leaf Profile: NK-LEAFS, leaf selector 101-102, interface profile NK-LEAF-IFP
<span class="c">! Tenant admin: use the permission</span>
EPG WEB &gt; Domains &gt; Add Physical Domain Association: NK-PHYS
EPG WEB &gt; Static Ports &gt; Deploy Static EPG on PC, VPC, or Interface:
    Node 101, eth1/1, vlan-110, Mode Access (Untagged)
    Node 102, eth1/1, vlan-110, Mode Access (Untagged)</pre>
<p>In the lab APIC you can check the result with Access Policies → Quick Start → Check an interface: node 101 eth1/1 should resolve to policy group NK-SRV-PG, AAEP NK-AAEP and domain NK-PHYS.</p>

<h3>Static port modes</h3>
<ul>
<li><b>Trunk</b> (the default): frames are tagged with the VLAN. Use it for hypervisors and anything that tags.</li>
<li><b>Access (Untagged)</b>: frames are untagged in both directions. Use it for bare-metal servers whose NIC does not tag. It cannot share a port with trunk EPGs.</li>
<li><b>Access (802.1P)</b>: accepts untagged and priority-tagged frames; use it when one port carries an untagged EPG and also tagged EPGs.</li>
</ul>
<p>A server that sends untagged frames behind a Trunk binding simply gets no connectivity, and <b>no fault is raised</b>, because the configuration itself is valid.</p>

<h3>Fault F0467 and why it appears</h3>
<p>When you add a static port, the APIC resolves the whole chain for that leaf and port. If it cannot, it raises fault <b>F0467</b> (configuration failed) on the EPG, and the binding is not deployed. The debug message names the cause:</p>
<table class="cmp"><tr><th>Cause</th><th>Meaning</th><th>Fix</th></tr>
<tr><td><b>invalid-path</b></td><td>The EPG has no domain, or no domain of the EPG is in the AAEP of that port (or no switch/interface profile selects that port at all)</td><td>Associate the domain to the EPG; add the domain to the AAEP; check the profiles</td></tr>
<tr><td><b>invalid-vlan</b></td><td>The VLAN is not in a static block of the pool of the domain</td><td>Add the VLAN to the pool (or use a VLAN that is in it)</td></tr>
<tr><td><b>encap-already-in-use</b></td><td>Another EPG already uses that VLAN on the same leaf</td><td>Pick another VLAN (VLANs are leaf-significant by default)</td></tr>
</table>
<pre class="out">APIC1# show faults code F0467
 Code              : F0467
 Severity          : minor
 Lifecycle         : Raised
 DN                : uni/tn-NK-PROD/ap-ECOM/epg-WEB/node-101/stpathatt-[eth1/1]/nwissues
 Cause             : configuration-failed
 Description       : Configuration failed for uni/tn-NK-PROD/ap-ECOM/epg-WEB node 101 eth1/1 due to
                     Invalid Path Configuration, debug message: <span class="hl">invalid-path</span>: Either the EpG is not
                     associated with a domain or the domain does not have this interface assigned to it</pre>

<div class="eg"><p><b>Worked example: Lab 4.</b> The web servers moved to VLAN 210. F0467 shows invalid-path first: AAEP NK-AAEP has no domain. Add NK-PHYS to NK-AAEP; the fault changes to invalid-vlan, because NK-POOL only contains 100-199. Add a static encap block 200-299 to NK-POOL; the fault clears, both bindings deploy, and WEB1 pings WEB2. Two separate breaks, fixed in the order the APIC reported them.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Creating the VLAN pool as dynamic and then using it for static ports (static bindings need static blocks). Forgetting to add the interface profile to the switch profile, so the ports are never selected. Fixing F0467 by changing the EPG's VLAN to "something that works" instead of fixing the chain, which breaks the agreement with the server team.</p></div>

<div class="exam"><p><b>Exam trap.</b> The order of the chain is asked often: VLAN pool → domain → AAEP → interface policy group → interface profile → switch profile. The tenant side connects at the <b>domain</b>. Know the three F0467 causes and which object each points to.</p></div>

<div class="scn"><h4>Two tenants, one VLAN</h4><p>A service provider hosted two customers on leaf 105. Customer A had EPG FRONT on VLAN 150, port eth1/5. Customer B's engineer added EPG PORTAL with VLAN 150 on eth1/6 of the same leaf. The binding never deployed and F0467 appeared with <i>encap-already-in-use</i>, naming Customer A's EPG. The engineer moved PORTAL to VLAN 151 after agreeing it with the customer, and planned per-customer VLAN ranges in separate pools and domains so it could not happen again.</p><p><b>Lesson:</b> VLANs are a shared resource per leaf; plan pools per tenant and let F0467 tell you exactly which rule was broken.</p></div>

<div class="iv"><p class="q">"Explain the ACI access policy chain and how a tenant EPG connects to it."</p><p>Strong answer: the fabric admin defines a VLAN pool, a domain that uses the pool, and an AAEP that lists the allowed domains. An interface policy group references the AAEP and link settings; an interface profile maps ports to the policy group; a switch profile maps leaves to the interface profile. The tenant EPG associates the domain and adds static ports or a VMM binding. The APIC validates the path and VLAN; failures raise F0467 with invalid-path, invalid-vlan or encap-already-in-use. Mention reuse and the separation of duties between fabric and tenant admins.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access policies decide which leaves, ports and VLANs a tenant may use; they are owned by the fabric admin.</li>
<li>Chain: VLAN pool → domain → AAEP → interface policy group → interface profile → switch profile.</li>
<li>The EPG meets the chain at the domain, then uses static ports (node, port, VLAN, mode).</li>
<li>Untagged servers need Access (Untagged) or Access (802.1P); a wrong mode fails silently.</li>
<li>F0467 causes: invalid-path (domain/AAEP/profile), invalid-vlan (pool), encap-already-in-use (same VLAN on the leaf).</li>
</ul></div>
`,hi:`
<p>Ek office socho jahan tenants jagah kiraye par lete hain, lekin darwaze <b>facilities team</b> control karti hai. Tenant keh sakta hai "meri finance team room 12 mein baithti hai", lekin tabhi jab facilities ne us tenant ko aisi badge range di ho jo room 12 kholti ho. ACI mein tenant admin EPGs banata hai, lekin <b>fabric admin</b> decide karta hai ki tenant kaunse leaf ports aur kaunse VLANs use kar sakta hai. Us permission system ko <b>access policies</b> kehte hain, aur yeh <b>Fabric → Access Policies</b> ke neeche rehta hai.</p>

<h3>Chain, object by object</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Access policy chain">
<rect x="10" y="20" width="140" height="40" rx="6" fill="#fde68a"/><text x="80" y="38" text-anchor="middle" class="svg-ink" font-size="12">EPG (tenant)</text><text x="80" y="53" text-anchor="middle" class="svg-muted" font-size="12">static port vlan-110</text>
<rect x="170" y="20" width="140" height="40" rx="6" fill="#fed7aa"/><text x="240" y="45" text-anchor="middle" class="svg-ink" font-size="12">Physical domain</text>
<rect x="330" y="20" width="140" height="40" rx="6" fill="#e2e8f0"/><text x="400" y="45" text-anchor="middle" class="svg-ink" font-size="12">VLAN pool 100-199</text>
<line x1="150" y1="40" x2="170" y2="40" stroke="#64748b" stroke-width="2"/><line x1="310" y1="40" x2="330" y2="40" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="100" width="140" height="40" rx="6" fill="#ddd6fe"/><text x="240" y="125" text-anchor="middle" class="svg-ink" font-size="12">AAEP</text>
<line x1="240" y1="60" x2="240" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="180" width="140" height="40" rx="6" fill="#bbf7d0"/><text x="240" y="198" text-anchor="middle" class="svg-ink" font-size="12">Interface policy</text><text x="240" y="213" text-anchor="middle" class="svg-ink" font-size="12">group</text>
<line x1="240" y1="140" x2="240" y2="180" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="180" width="140" height="40" rx="6" fill="#bae6fd"/><text x="400" y="198" text-anchor="middle" class="svg-ink" font-size="12">Interface profile</text><text x="400" y="213" text-anchor="middle" class="svg-muted" font-size="12">ports 1/1-2</text>
<rect x="490" y="180" width="140" height="40" rx="6" fill="#bae6fd"/><text x="560" y="198" text-anchor="middle" class="svg-ink" font-size="12">Switch profile</text><text x="560" y="213" text-anchor="middle" class="svg-muted" font-size="12">nodes 101-102</text>
<line x1="330" y1="200" x2="310" y2="200" stroke="#64748b" stroke-width="2"/><line x1="490" y1="200" x2="470" y2="200" stroke="#64748b" stroke-width="2"/>
<text x="560" y="125" text-anchor="middle" class="svg-accent" font-size="12">right se left padho:</text><text x="560" y="141" text-anchor="middle" class="svg-accent" font-size="12">kaunsa leaf, kaunsa port,</text><text x="560" y="157" text-anchor="middle" class="svg-accent" font-size="12">kaunse domains aur VLANs</text>
</svg><p class="cap">Tenant fabric se domain par milta hai: EPG ka domain port se AAEP ke through reachable hona chahiye.</p></div>

<table class="cmp"><tr><th>#</th><th>Object (class)</th><th>Kya rakhta hai</th><th>Fabric → Access Policies ke neeche GUI path</th></tr>
<tr><td>1</td><td>VLAN pool (fvnsVlanInstP)</td><td>Encap blocks jaise 100-199; static ports ke liye <b>static</b> allocation, VMM ke liye <b>dynamic</b></td><td>Pools → VLAN</td></tr>
<tr><td>2</td><td>Domain (physical ke liye physDomP)</td><td>Ek VLAN pool; woh "permission" jise EPG reference karta hai. Doosre types: L3 domain (L3Out), external bridged domain (L2Out), VMM domain</td><td>Physical and External Domains → Physical Domains</td></tr>
<tr><td>3</td><td>AAEP (infraAttEntityP)</td><td>Un ports par allowed domains ki list jo ise use karte hain</td><td>Policies → Global → Attachable Access Entity Profiles</td></tr>
<tr><td>4</td><td>Interface policy group (infraAccPortGrp)</td><td>AAEP plus port settings: link speed, CDP, LLDP, aur PC/vPC ke liye LACP policy</td><td>Interfaces → Leaf Interfaces → Policy Groups → Leaf Access Port</td></tr>
<tr><td>5</td><td>Leaf interface profile (infraAccPortP)</td><td>Port selectors (jaise 1/1-1/2) jo policy group ko point karte hain</td><td>Interfaces → Leaf Interfaces → Profiles</td></tr>
<tr><td>6</td><td>Leaf switch profile (infraNodeP)</td><td>Leaf selector (jaise nodes 101-102) plus apply hone wale interface profiles</td><td>Switches → Leaf Switches → Profiles</td></tr>
</table>
<p>Policy group ka type link type decide karta hai: single ports ke liye <b>Leaf Access Port</b> policy group, bundles ke liye <b>PC</b> ya <b>vPC</b> interface policy group (vPC ke liye dono leaves ka vPC explicit protection group mein pair hona bhi zaroori hai). Reuse matter karta hai: ek policy group sainkdon identical server ports serve kar sakta hai.</p>

<h3>Lab 2 walkthrough</h3>
<pre class="code"><span class="c">! Fabric admin: permissions</span>
Pools &gt; VLAN &gt; Create VLAN Pool: NK-POOL, Static Allocation, Encap Block 100-199
Physical Domains &gt; Create Physical Domain: NK-PHYS, VLAN Pool NK-POOL
Attachable Access Entity Profiles &gt; Create: NK-AAEP, Domains: NK-PHYS
<span class="c">! Fabric admin: kaunse ports</span>
Leaf Access Port policy group: NK-SRV-PG, AAEP NK-AAEP
Leaf Interface Profile: NK-LEAF-IFP, port selector SERVERS 1/1-1/2 -&gt; NK-SRV-PG
Leaf Profile: NK-LEAFS, leaf selector 101-102, interface profile NK-LEAF-IFP
<span class="c">! Tenant admin: permission use karo</span>
EPG WEB &gt; Domains &gt; Add Physical Domain Association: NK-PHYS
EPG WEB &gt; Static Ports &gt; Deploy Static EPG on PC, VPC, or Interface:
    Node 101, eth1/1, vlan-110, Mode Access (Untagged)
    Node 102, eth1/1, vlan-110, Mode Access (Untagged)</pre>
<p>Lab APIC mein aap result Access Policies → Quick Start → Check an interface se check kar sakte ho: node 101 eth1/1 ko policy group NK-SRV-PG, AAEP NK-AAEP aur domain NK-PHYS tak resolve hona chahiye.</p>

<h3>Static port modes</h3>
<ul>
<li><b>Trunk</b> (default): frames VLAN ke saath tagged hote hain. Hypervisors aur tag karne wali har cheez ke liye use karo.</li>
<li><b>Access (Untagged)</b>: frames dono directions mein untagged. Un bare-metal servers ke liye jinka NIC tag nahi karta. Yeh trunk EPGs ke saath port share nahi kar sakta.</li>
<li><b>Access (802.1P)</b>: untagged aur priority-tagged frames accept karta hai; tab use karo jab ek port par untagged EPG ke saath tagged EPGs bhi hon.</li>
</ul>
<p>Jo server Trunk binding ke peeche untagged frames bhejta hai use bas connectivity nahi milti, aur <b>koi fault nahi aata</b>, kyunki configuration khud valid hai.</p>

<h3>Fault F0467 aur yeh kyun aata hai</h3>
<p>Jab aap static port jodte ho, APIC us leaf aur port ke liye poori chain resolve karta hai. Agar nahi kar pata, to EPG par fault <b>F0467</b> (configuration failed) raise karta hai, aur binding deploy nahi hoti. Debug message cause batata hai:</p>
<table class="cmp"><tr><th>Cause</th><th>Matlab</th><th>Fix</th></tr>
<tr><td><b>invalid-path</b></td><td>EPG ka koi domain nahi, ya EPG ka koi domain us port ke AAEP mein nahi (ya koi switch/interface profile us port ko select hi nahi karta)</td><td>EPG se domain associate karo; AAEP mein domain jodo; profiles check karo</td></tr>
<tr><td><b>invalid-vlan</b></td><td>VLAN domain ke pool ke kisi static block mein nahi</td><td>VLAN pool mein jodo (ya pool wala VLAN use karo)</td></tr>
<tr><td><b>encap-already-in-use</b></td><td>Same leaf par koi aur EPG woh VLAN pehle se use kar raha hai</td><td>Doosra VLAN chuno (VLANs default mein leaf-significant hain)</td></tr>
</table>
<pre class="out">APIC1# show faults code F0467
 Code              : F0467
 Severity          : minor
 Lifecycle         : Raised
 DN                : uni/tn-NK-PROD/ap-ECOM/epg-WEB/node-101/stpathatt-[eth1/1]/nwissues
 Cause             : configuration-failed
 Description       : Configuration failed for uni/tn-NK-PROD/ap-ECOM/epg-WEB node 101 eth1/1 due to
                     Invalid Path Configuration, debug message: <span class="hl">invalid-path</span>: Either the EpG is not
                     associated with a domain or the domain does not have this interface assigned to it</pre>

<div class="eg"><p><b>Worked example: Lab 4.</b> Web servers VLAN 210 par shift hue. F0467 pehle invalid-path dikhata hai: AAEP NK-AAEP mein koi domain nahi. NK-AAEP mein NK-PHYS jodo; fault invalid-vlan mein badal jaata hai, kyunki NK-POOL mein sirf 100-199 hai. NK-POOL mein static encap block 200-299 jodo; fault clear hota hai, dono bindings deploy hoti hain, aur WEB1 WEB2 ko ping karta hai. Do alag breaks, usi order mein fix kiye jis order mein APIC ne report kiye.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> VLAN pool dynamic banana aur phir use static ports ke liye use karna (static bindings ko static blocks chahiye). Interface profile ko switch profile mein jodna bhool jaana, jisse ports kabhi select hi nahi hote. F0467 ko chain theek karne ki jagah EPG ka VLAN "jo chal jaaye" usse badal kar fix karna, jisse server team ke saath agreement toot jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Chain ka order aksar poocha jaata hai: VLAN pool → domain → AAEP → interface policy group → interface profile → switch profile. Tenant side <b>domain</b> par judti hai. Teeno F0467 causes jaano aur har ek kis object ki taraf point karta hai.</p></div>

<div class="scn"><h4>Do tenants, ek VLAN</h4><p>Ek service provider leaf 105 par do customers host karta tha. Customer A ka EPG FRONT VLAN 150 par tha, port eth1/5. Customer B ke engineer ne same leaf ke eth1/6 par VLAN 150 ke saath EPG PORTAL joda. Binding kabhi deploy nahi hui aur F0467 <i>encap-already-in-use</i> ke saath aaya, Customer A ke EPG ka naam lete hue. Engineer ne customer se baat karke PORTAL ko VLAN 151 par shift kiya, aur alag pools aur domains mein per-customer VLAN ranges plan kiye taaki yeh dobara na ho.</p><p><b>Seekh:</b> VLANs har leaf par shared resource hain; tenant ke hisaab se pools plan karo aur F0467 ko batane do ki kaunsa rule toota.</p></div>

<div class="iv"><p class="q">"ACI access policy chain samjhao aur tenant EPG usse kaise judta hai."</p><p>Strong answer: fabric admin ek VLAN pool, pool use karne wala domain, aur allowed domains list karne wala AAEP define karta hai. Interface policy group AAEP aur link settings ko reference karta hai; interface profile ports ko policy group se map karta hai; switch profile leaves ko interface profile se map karta hai. Tenant EPG domain associate karta hai aur static ports ya VMM binding jodta hai. APIC path aur VLAN validate karta hai; failures par invalid-path, invalid-vlan ya encap-already-in-use ke saath F0467 aata hai. Reuse aur fabric aur tenant admins ke beech separation of duties ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access policies decide karti hain ki tenant kaunse leaves, ports aur VLANs use kar sakta hai; yeh fabric admin ki hoti hain.</li>
<li>Chain: VLAN pool → domain → AAEP → interface policy group → interface profile → switch profile.</li>
<li>EPG chain se domain par milta hai, phir static ports (node, port, VLAN, mode) use karta hai.</li>
<li>Untagged servers ko Access (Untagged) ya Access (802.1P) chahiye; galat mode chupchaap fail hota hai.</li>
<li>F0467 causes: invalid-path (domain/AAEP/profile), invalid-vlan (pool), encap-already-in-use (leaf par same VLAN).</li>
</ul></div>
`}};export{e as default};