var e=e=>`<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="`+e.alt+`">`+e.items.map((e,t)=>{let n=10+t*124;return`<rect x="`+n+`" y="20" width="114" height="150" rx="8" fill="`+e.c+`" stroke="#64748b"/><text x="`+(n+57)+`" y="44" text-anchor="middle" class="svg-ink" font-size="13">`+e.h+`</text>`+e.l.map((e,t)=>`<text x="`+(n+57)+`" y="`+(70+t*20)+`" text-anchor="middle" class="svg-muted" font-size="11">`+e+`</text>`).join(``)}).join(``)+`<rect x="10" y="190" width="620" height="40" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="13">`+e.base+`</text><rect x="30" y="256" width="14" height="14" fill="#bae6fd" stroke="#64748b"/><text x="50" y="268" class="svg-muted" font-size="12">`+e.l1+`</text><rect x="230" y="256" width="14" height="14" fill="#bbf7d0" stroke="#64748b"/><text x="250" y="268" class="svg-muted" font-size="12">`+e.l2+`</text><rect x="430" y="256" width="14" height="14" fill="#e2e8f0" stroke="#64748b"/><text x="450" y="268" class="svg-muted" font-size="12">`+e.l3+`</text></svg><p class="cap">`+e.cap+`</p></div>`,t={id:`summary-exam-checklist`,h:{en:`Summary and exam checklist: HA, scaling, licensing and capacity`,hi:`Summary aur exam checklist: HA, scaling, licensing aur capacity`},body:{en:`
<h3>The customer case: Atlas Retail design review</h3>
<p>Atlas Retail is opening a new data center to replace two old server rooms. The architect has presented a UCS design: one domain with two 6454 FIs, six chassis, ESXi clusters, Intersight SaaS and HX Edge clusters in 30 stores. The CTO asks four questions: What happens when something fails? How far can this grow? What do we pay for licences? How do we know we are not running out of room? This chapter ties the module together by answering those four questions and gives you a checklist for the exam.</p>

<h3>High availability</h3>
<ul>
<li><b>FI cluster:</b> two FIs run as a cluster over the L1 and L2 links. One is primary and one is subordinate for management; both forward data at the same time. A virtual management IP follows the primary. If the primary fails, the subordinate takes over management. Data on the surviving fabric continues.</li>
<li><b>Fabric A and B:</b> each server has vNICs and vHBAs on both. Design for the loss of an entire fabric: the survivor must carry the full load.</li>
<li><b>Chassis:</b> two IOMs, redundant power supplies and a power policy such as N+1 or grid (two separate feeds). Fans and blades are hot-swappable.</li>
<li><b>Hosts:</b> N+1 in each cluster and anti-affinity for critical VMs. A spare blade in a server pool means a failed profile can move in minutes.</li>
<li><b>Management plane:</b> Intersight keeps managing inventory, but servers keep running if the connection is lost. An appliance needs its own backup.</li>
</ul>
`+e({alt:`Compute design review map`,items:[{c:`#bae6fd`,h:`Management`,l:[`UCSM or IMM`,`Intersight form`,`orgs, roles`]},{c:`#bbf7d0`,h:`Connectivity`,l:[`EHM, vPC`,`FEX links`,`oversub ratio`]},{c:`#bae6fd`,h:`Identity`,l:[`pools`,`policies`,`templates`]},{c:`#bbf7d0`,h:`Availability`,l:[`dual FI, A/B`,`N+1 hosts`,`power grids`]},{c:`#bae6fd`,h:`Capacity`,l:[`ports, power`,`licences`,`growth 3 yr`]}],base:`Requirements, constraints, options, trade-offs, chosen design`,l1:`Design area`,l2:`Resilience area`,l3:`Method`,cap:`Every compute design question can be answered by walking these five areas in order and stating the trade-off you accept.`})+`
<pre class="code"><span class="c">! UCS Manager CLI, check the FI cluster (read only)</span>
FI-A# connect local-mgmt
FI-A(local-mgmt)# show cluster state</pre>
<pre class="out">Cluster Id: 0x4a1b2c3d5e6f7a8b-0x9c0d1e2f3a4b5c6d
A: UP, PRIMARY
B: UP, SUBORDINATE
<span class="hl">HA READY</span></pre>

<h3>Scaling</h3>
<p>A UCS domain scales until it runs out of FI ports, chassis links or its supported server count (check the current release notes and configuration limits for the exact figure; it is in the order of a hundred and sixty servers per domain). Each chassis needs two to eight IOM links per fabric. Every extra chassis costs FI ports, so plan ports for uplinks, FC, appliance ports and growth together. When the domain is full, add a second domain and manage both from Intersight. Scale HCI by adding nodes; scale a stretched cluster in equal pairs on both sites.</p>

<h3>Licensing</h3>
<p>Intersight licences are per managed device and per tier (for example Essentials and Advantage). Features such as advanced automation and workload optimisation need the higher tier. Plan for the number of servers in each tier, term length, and grace behaviour. Older FI families used port licences; check the model. HyperFlex and software add-ons may have their own subscriptions. Always compare the licence tier with the features the design depends on.</p>

<h3>Capacity planning</h3>
<div class="eg"><p>Atlas: 6 chassis x 8 blades = 48 blades, each blade 2 x 10 Gbps per fabric. Per fabric: 48 x 20 = 960 Gbps possible. With 8 FEX links per IOM, FI downlinks use 6 x 8 = 48 ports per FI. The FI has 54 ports in total, so only 6 remain for uplinks, which is too few. Fix: move to 25 Gbps FEX-capable IOMs with fewer cables, or two domains of three chassis. Capacity planning is about ports, power (kW per rack), cooling, rack units, licences and growth for three years, with headroom of 20 to 30 percent.</p></div>
<p>Do this arithmetic early. It is the most common reason a design on paper does not survive the bill of materials.</p>

<h3>Exam checklist</h3>
<ul>
<li>Choose UCSM or IMM and the Intersight form from site constraints.</li>
<li>Explain stateless computing, pools, policies, templates and profiles.</li>
<li>Calculate oversubscription at adapter, IOM and uplink stages.</li>
<li>Explain end-host mode, port-channels to a vPC pair, and FC end-host (NPV) mode.</li>
<li>Pick an HCI form: standard, edge, stretched.</li>
<li>Size for N+1 and a failed fabric; plan ports, power and licences.</li>
</ul>
<dl class="terms">
<dt>FI</dt><dd>Fabric Interconnect, the switch that manages and connects a UCS domain.</dd>
<dt>IOM</dt><dd>I/O Module in the chassis, a fabric extender connecting blades to the FI.</dd>
<dt>VIC</dt><dd>Virtual Interface Card, the adapter creating virtual NICs and HBAs.</dd>
<dt>EHM</dt><dd>End-host mode, the default FI mode with no Spanning Tree toward the LAN.</dd>
<dt>IMM</dt><dd>Intersight Managed Mode, where Intersight configures the domain.</dd>
<dt>RF</dt><dd>Replication factor in HyperFlex, the number of data copies.</dd>
</dl>
<div class="exam"><p><b>Most tested facts.</b> FIs run in a cluster joined by L1 and L2 only. FI uplink bundles go to a vPC pair, and the FI does not itself run vPC. X-Series needs IMM. Switching between UCSM and IMM re-initialises the domain. Device Connector connects outbound only. Maintenance policy decides when disruptive profile changes apply. HX Edge has no FIs; stretched HX needs a witness.</p></div>
<div class="warn"><p><b>Post-mortem: the paper design.</b> A design was approved without a port count. At cabling time the domain had no ports left for storage uplinks. The fix was a second domain and a re-plan. Count ports before approval.</p></div>

<div class="scn"><h4>The failover test</h4><p>Before go-live, Atlas powered off FI-A during a test window. Most hosts stayed up, but one cluster lost storage paths because its second vHBA had been mapped to the same fabric. The profile was corrected and the test repeated.</p><p><b>Lesson:</b> test fabric failure on purpose and verify that A and B are really separate.</p></div>
<div class="iv"><p class="q">"Walk me through how you would review a UCS design before purchase."</p><p>Strong answer: confirm management model, count FI ports against chassis links, uplinks and storage, calculate oversubscription, check A and B separation, N+1 and power, licence tier versus features, and growth for three years. Finish by naming the trade-off you accepted.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA means dual FIs, A and B fabrics, redundant IOMs and power, and N+1 hosts.</li>
<li>Scaling is limited by FI ports and domain limits; plan a second domain early.</li>
<li>Licences are per device and tier; check features against tier.</li>
<li>Capacity covers ports, power, cooling, rack space and three-year growth.</li>
<li>Answer design questions by walking requirements, constraints, options and trade-offs.</li>
</ul></div>
`,hi:`
<h3>Customer case: Atlas Retail design review</h3>
<p>Atlas Retail do purane server rooms ki jagah naya data center khol raha hai. Architect ne UCS design pesh kiya hai: ek domain jisme do 6454 FIs, chhe chassis, ESXi clusters, Intersight SaaS aur 30 stores mein HX Edge clusters. CTO chaar sawal poochta hai: kuch fail hone par kya hoga? Yeh kitna grow kar sakta hai? Licences par kitna kharch hoga? Hume kaise pata chalega ki jagah khatam nahi ho rahi? Yeh chapter in chaar sawalon ke jawab dekar module ko jodta hai aur exam ke liye checklist deta hai.</p>

<h3>High availability</h3>
<ul>
<li><b>FI cluster:</b> do FIs L1 aur L2 links par cluster ki tarah chalte hain. Management ke liye ek primary aur ek subordinate hota hai; data dono ek saath forward karte hain. Virtual management IP primary ke saath chalta hai. Primary fail ho to subordinate management sambhalta hai. Bachi fabric par data chalta rehta hai.</li>
<li><b>Fabric A aur B:</b> har server ke vNICs aur vHBAs dono par hain. Poori fabric khone ke liye design karo: bachi fabric ko poora load uthana hai.</li>
<li><b>Chassis:</b> do IOMs, redundant power supplies aur power policy jaise N+1 ya grid (do alag feeds). Fans aur blades hot-swappable hain.</li>
<li><b>Hosts:</b> har cluster mein N+1 aur critical VMs ke liye anti-affinity. Server pool mein spare blade ka matlab fail hua profile minutes mein move ho sakta hai.</li>
<li><b>Management plane:</b> Intersight inventory manage karta rehta hai, lekin connection tootne par bhi servers chalte rehte hain. Appliance ka apna backup chahiye.</li>
</ul>
`+e({alt:`Compute design review map`,items:[{c:`#bae6fd`,h:`Management`,l:[`UCSM ya IMM`,`Intersight form`,`orgs, roles`]},{c:`#bbf7d0`,h:`Connectivity`,l:[`EHM, vPC`,`FEX links`,`oversub ratio`]},{c:`#bae6fd`,h:`Identity`,l:[`pools`,`policies`,`templates`]},{c:`#bbf7d0`,h:`Availability`,l:[`dual FI, A/B`,`N+1 hosts`,`power grids`]},{c:`#bae6fd`,h:`Capacity`,l:[`ports, power`,`licences`,`3 saal growth`]}],base:`Requirements, constraints, options, trade-offs, chosen design`,l1:`Design area`,l2:`Resilience area`,l3:`Tareeka`,cap:`Har compute design sawal in paanch areas ko order mein chal kar aur jo trade-off aap maante ho use bata kar solve hota hai.`})+`
<pre class="code"><span class="c">! UCS Manager CLI, FI cluster check karo (read only)</span>
FI-A# connect local-mgmt
FI-A(local-mgmt)# show cluster state</pre>
<pre class="out">Cluster Id: 0x4a1b2c3d5e6f7a8b-0x9c0d1e2f3a4b5c6d
A: UP, PRIMARY
B: UP, SUBORDINATE
<span class="hl">HA READY</span></pre>

<h3>Scaling</h3>
<p>UCS domain tab tak scale hota hai jab tak FI ports, chassis links ya supported server count khatam na ho (exact figure ke liye current release notes aur configuration limits dekho; yeh ek domain mein lagbhag ek sau saath servers ke order mein hai). Har chassis ko har fabric par do se aath IOM links chahiye. Har extra chassis FI ports khata hai, isliye uplinks, FC, appliance ports aur growth ke ports saath mein plan karo. Domain bhar jaye to doosra domain jodo aur dono Intersight se manage karo. HCI nodes jodkar scale hota hai; stretched cluster dono sites par barabar pairs mein scale karo.</p>

<h3>Licensing</h3>
<p>Intersight licences per managed device aur per tier hote hain (jaise Essentials aur Advantage). Advanced automation aur workload optimisation jaise features ke liye upar ka tier chahiye. Har tier ke servers ki ginti, term length aur grace behaviour plan karo. Purane FI families port licences use karte the; model check karo. HyperFlex aur software add-ons ki apni subscriptions ho sakti hain. Licence tier ko hamesha un features se milao jin par design depend karta hai.</p>

<h3>Capacity planning</h3>
<div class="eg"><p>Atlas: 6 chassis x 8 blades = 48 blades, har blade har fabric par 2 x 10 Gbps. Per fabric: 48 x 20 = 960 Gbps possible. IOM par 8 FEX links ke saath FI downlinks 6 x 8 = 48 ports lete hain. FI ke kul 54 ports hain, to uplinks ke liye sirf 6 bachte hain, jo bahut kam hai. Fix: kam cables wale 25 Gbps FEX-capable IOMs par jao, ya teen chassis ke do domains. Capacity planning ports, power (rack ke kW), cooling, rack units, licences aur teen saal ki growth ke baare mein hai, 20 se 30 percent headroom ke saath.</p></div>
<p>Yeh hisaab pehle karo. Paper par achha design bill of materials mein jab fail hota hai to aksar yahi wajah hoti hai.</p>

<h3>Exam checklist</h3>
<ul>
<li>Site constraints se UCSM ya IMM aur Intersight form choose karo.</li>
<li>Stateless computing, pools, policies, templates aur profiles explain karo.</li>
<li>Adapter, IOM aur uplink stages par oversubscription calculate karo.</li>
<li>End-host mode, vPC pair tak port-channels aur FC end-host (NPV) mode explain karo.</li>
<li>HCI form choose karo: standard, edge, stretched.</li>
<li>N+1 aur failed fabric ke liye size karo; ports, power aur licences plan karo.</li>
</ul>
<dl class="terms">
<dt>FI</dt><dd>Fabric Interconnect, woh switch jo UCS domain ko manage aur connect karta hai.</dd>
<dt>IOM</dt><dd>Chassis ka I/O Module, blades ko FI se jodne wala fabric extender.</dd>
<dt>VIC</dt><dd>Virtual Interface Card, virtual NICs aur HBAs banane wala adapter.</dd>
<dt>EHM</dt><dd>End-host mode, default FI mode jisme LAN ki taraf Spanning Tree nahi.</dd>
<dt>IMM</dt><dd>Intersight Managed Mode, jahan Intersight domain configure karta hai.</dd>
<dt>RF</dt><dd>HyperFlex mein replication factor, data copies ki sankhya.</dd>
</dl>
<div class="exam"><p><b>Sabse zyada pooche jaane wale facts.</b> FIs cluster mein sirf L1 aur L2 se jude hain. FI uplink bundles vPC pair tak jaate hain, aur FI khud vPC nahi chalata. X-Series ko IMM chahiye. UCSM aur IMM ke beech switch karne par domain re-initialise hota hai. Device Connector sirf outbound connect karta hai. Maintenance policy tay karti hai ki disruptive profile changes kab lagenge. HX Edge mein FIs nahi hote; stretched HX ko witness chahiye.</p></div>
<div class="warn"><p><b>Post-mortem: paper design.</b> Ek design bina port count ke approve ho gaya. Cabling ke waqt domain mein storage uplinks ke liye ports bache hi nahi. Fix tha doosra domain aur re-plan. Approval se pehle ports gino.</p></div>

<div class="scn"><h4>Failover test</h4><p>Go-live se pehle Atlas ne test window mein FI-A power off kiya. Zyadatar hosts chalte rahe, lekin ek cluster ke storage paths chale gaye kyunki uska doosra vHBA usi fabric par map tha. Profile theek kiya gaya aur test dohraya gaya.</p><p><b>Seekh:</b> fabric failure ka test jaan-boojh kar karo aur verify karo ki A aur B sach mein alag hain.</p></div>
<div class="iv"><p class="q">"Purchase se pehle UCS design ka review kaise karoge?"</p><p>Strong answer: management model confirm karo, chassis links, uplinks aur storage ke against FI ports gino, oversubscription calculate karo, A aur B separation, N+1 aur power check karo, licence tier versus features dekho, aur teen saal ki growth. End mein jo trade-off aapne maana hai woh batao.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA ka matlab dual FIs, A aur B fabrics, redundant IOMs aur power, aur N+1 hosts.</li>
<li>Scaling FI ports aur domain limits se bandhi hai; doosra domain pehle se plan karo.</li>
<li>Licences per device aur tier hote hain; features ko tier se milao.</li>
<li>Capacity mein ports, power, cooling, rack space aur teen saal ki growth aate hain.</li>
<li>Design sawal requirements, constraints, options aur trade-offs chal kar solve karo.</li>
</ul></div>
`}};export{t as default};