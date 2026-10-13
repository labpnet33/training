var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This module showed how one Junos router can hold several routing tables and decide which one a packet uses. Here is everything on one page for last-minute revision before JN0-351.</p>

<h3>The big picture</h3>
<div class="dia"><svg viewBox="0 0 660 190" role="img" aria-label="Module map">
<rect x="20" y="30" width="190" height="120" rx="10" fill="#bae6fd"/><text x="115" y="58" text-anchor="middle" class="svg-ink" font-size="14">Instances</text><text x="115" y="82" text-anchor="middle" class="svg-muted" font-size="11">separate tables</text><text x="115" y="102" text-anchor="middle" class="svg-muted" font-size="11">virtual-router, forwarding</text>
<rect x="235" y="30" width="190" height="120" rx="10" fill="#fde68a"/><text x="330" y="58" text-anchor="middle" class="svg-ink" font-size="14">Sharing and steering</text><text x="330" y="82" text-anchor="middle" class="svg-muted" font-size="11">RIB groups, next-table</text><text x="330" y="102" text-anchor="middle" class="svg-muted" font-size="11">input filters (FBF)</text>
<rect x="450" y="30" width="190" height="120" rx="10" fill="#bbf7d0"/><text x="545" y="58" text-anchor="middle" class="svg-ink" font-size="14">Load balancing</text><text x="545" y="82" text-anchor="middle" class="svg-muted" font-size="11">policy per-packet</text><text x="545" y="102" text-anchor="middle" class="svg-muted" font-size="11">forwarding-table export</text>
</svg><p class="cap">Three ideas: separate, share or steer, and spread.</p></div>

<h3>Instance types</h3>
<table class="cmp"><tr><th>Type</th><th>Protocols</th><th>Use</th></tr>
<tr><td>virtual-router</td><td>OSPF, BGP, static</td><td>Separate routing domain (guests)</td></tr>
<tr><td>forwarding</td><td>static only</td><td>Target of FBF</td></tr>
<tr><td>vrf</td><td>yes, plus RD and targets</td><td>MPLS Layer 3 VPN</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">show route instance
show route table NAME.inet.0
show ospf neighbor instance NAME
ping HOST routing-instance NAME
traceroute HOST routing-instance NAME
show interfaces ge-0/0/3.0 | match filter
show route forwarding-table destination PREFIX
show configuration routing-instances
show configuration routing-options
show configuration firewall</pre>

<h3>Configuration cheat sheet</h3>
<pre class="code">set routing-instances GUEST instance-type virtual-router
set routing-instances GUEST interface ge-0/0/2.0
set routing-options rib-groups RG import-rib [ inet.0 ISP-B.inet.0 ]
set routing-options interface-routes rib-group inet RG
set routing-instances GUEST routing-options static route 0.0.0.0/0 next-table inet.0
set firewall family inet filter F term A from source-address 10.1.2.0/24
set firewall family inet filter F term A then routing-instance ISP-B
set firewall family inet filter F term Z then accept
set interfaces ge-0/0/3 unit 0 family inet filter input F
set policy-options policy-statement LB then load-balance per-packet
set routing-options forwarding-table export LB</pre>

<h3>Exam checklist</h3>
<ul>
<li>I can name the three instance types and say which runs protocols.</li>
<li>I know that tables in a named instance are called NAME.inet.0.</li>
<li>I always add <code>routing-instance NAME</code> to ping and traceroute from the router.</li>
<li>I can write a RIB group with the primary table first and say what <code>interface-routes</code> shares.</li>
<li>I know a RIB group is one-way and when to use <code>next-table</code> instead.</li>
<li>I can list the four building blocks of FBF and say where the filter is applied: <b>input</b>.</li>
<li>I never forget the final accept term, because of the implicit discard.</li>
<li>I can explain why a forwarding instance table can be empty.</li>
<li>I can configure per-packet load balancing, apply it under forwarding-table export, and recognise a <b>ulst</b>.</li>
<li>I can follow the three-question troubleshooting method.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Requirement: staff use ISPA, lab uses ISPB, guests are isolated, and the data centre uses both links. Answer: a GUEST virtual router for guests, an ISP-B forwarding instance with a RIB group and an input filter for the lab, and a load-balance policy exported to the forwarding table for the data centre links. Four features, one router.</p></div>
<div class="warn"><p><b>Common mistake.</b> Mixing up the tools. Isolation is an instance; sharing is a RIB group or next-table; steering is a filter; balancing is a policy. Name the problem first, then pick the tool.</p></div>
<div class="exam"><p><b>Exam trap.</b> Many answers look right because each tool changes something in a table. Read what the question needs: separate, share, steer by source, or use both paths, and the single correct tool follows.</p></div>
<div class="scn"><h4>One week before the exam</h4><p>A candidate rebuilt the three labs from memory with a timer: instance and OSPF in ten minutes, FBF in fifteen, load balancing in five. Each time she checked the same four outputs: show route instance, the instance table, the interface filter line and the forwarding table. Her confidence, and her speed, grew with every repetition.</p><p><b>Lesson:</b> practise the verification, not only the configuration.</p></div>
<div class="iv"><p class="q">"Summarise how you would give guests, a lab and a data centre different routing treatment on one router."</p><p>Guests go into a virtual-router instance so they have their own table. The lab uses filter-based forwarding: a forwarding instance with a default route to the second ISP, a RIB group so its next hop resolves, and an input filter with a final accept term. The data centre links use a load-balance policy exported to the forwarding table. I verify each with the instance table, the filter on the interface and the forwarding table.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Instances separate; RIB groups and next-table share; filters steer; policy balances.</li>
<li>Always name the table or instance when you show, ping or trace.</li>
<li>FBF needs forwarding instance, RIB group, input filter and a final accept.</li>
<li>Forwarding table (ulst) is the proof for load balancing.</li>
</ul></div>
`,hi:`
<p>Is module ne dikhaya ki ek Junos router kai routing tables rakh sakta hai aur tay kar sakta hai ki packet kaunsa use kare. JN0-351 se pehle aakhri revision ke liye sab kuch ek page par.</p>

<h3>Badi tasveer</h3>
<div class="dia"><svg viewBox="0 0 660 190" role="img" aria-label="Module map">
<rect x="20" y="30" width="190" height="120" rx="10" fill="#bae6fd"/><text x="115" y="58" text-anchor="middle" class="svg-ink" font-size="14">Instances</text><text x="115" y="82" text-anchor="middle" class="svg-muted" font-size="11">alag tables</text><text x="115" y="102" text-anchor="middle" class="svg-muted" font-size="11">virtual-router, forwarding</text>
<rect x="235" y="30" width="190" height="120" rx="10" fill="#fde68a"/><text x="330" y="58" text-anchor="middle" class="svg-ink" font-size="14">Sharing aur steering</text><text x="330" y="82" text-anchor="middle" class="svg-muted" font-size="11">RIB groups, next-table</text><text x="330" y="102" text-anchor="middle" class="svg-muted" font-size="11">input filters (FBF)</text>
<rect x="450" y="30" width="190" height="120" rx="10" fill="#bbf7d0"/><text x="545" y="58" text-anchor="middle" class="svg-ink" font-size="14">Load balancing</text><text x="545" y="82" text-anchor="middle" class="svg-muted" font-size="11">policy per-packet</text><text x="545" y="102" text-anchor="middle" class="svg-muted" font-size="11">forwarding-table export</text>
</svg><p class="cap">Teen idea: alag karo, share ya steer karo, aur failao.</p></div>

<h3>Instance types</h3>
<table class="cmp"><tr><th>Type</th><th>Protocols</th><th>Use</th></tr>
<tr><td>virtual-router</td><td>OSPF, BGP, static</td><td>Alag routing domain (guests)</td></tr>
<tr><td>forwarding</td><td>sirf static</td><td>FBF ka target</td></tr>
<tr><td>vrf</td><td>haan, RD aur targets ke saath</td><td>MPLS Layer 3 VPN</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">show route instance
show route table NAME.inet.0
show ospf neighbor instance NAME
ping HOST routing-instance NAME
traceroute HOST routing-instance NAME
show interfaces ge-0/0/3.0 | match filter
show route forwarding-table destination PREFIX
show configuration routing-instances
show configuration routing-options
show configuration firewall</pre>

<h3>Configuration cheat sheet</h3>
<pre class="code">set routing-instances GUEST instance-type virtual-router
set routing-instances GUEST interface ge-0/0/2.0
set routing-options rib-groups RG import-rib [ inet.0 ISP-B.inet.0 ]
set routing-options interface-routes rib-group inet RG
set routing-instances GUEST routing-options static route 0.0.0.0/0 next-table inet.0
set firewall family inet filter F term A from source-address 10.1.2.0/24
set firewall family inet filter F term A then routing-instance ISP-B
set firewall family inet filter F term Z then accept
set interfaces ge-0/0/3 unit 0 family inet filter input F
set policy-options policy-statement LB then load-balance per-packet
set routing-options forwarding-table export LB</pre>

<h3>Exam checklist</h3>
<ul>
<li>Main teen instance types ke naam bata sakta hoon aur kaunsa protocols chalata hai.</li>
<li>Main jaanta hoon ki named instance ke tables NAME.inet.0 kehlate hain.</li>
<li>Router se ping aur traceroute mein hamesha <code>routing-instance NAME</code> jodta hoon.</li>
<li>Main primary table pehle rakhkar RIB group likh sakta hoon aur bata sakta hoon ki <code>interface-routes</code> kya share karta hai.</li>
<li>Main jaanta hoon ki RIB group ek-tarfa hai aur kab <code>next-table</code> use karna hai.</li>
<li>Main FBF ke chaar building blocks bata sakta hoon aur filter kahan lagta hai: <b>input</b>.</li>
<li>Main aakhri accept term kabhi nahi bhoolta, implicit discard ki wajah se.</li>
<li>Main samjha sakta hoon ki forwarding instance ka table khali kyun ho sakta hai.</li>
<li>Main per-packet load balancing configure kar sakta hoon, forwarding-table export mein laga sakta hoon, aur <b>ulst</b> pehchan sakta hoon.</li>
<li>Main teen-sawal troubleshooting method follow kar sakta hoon.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Requirement: staff ISPA use karein, lab ISPB, guests isolated, aur data centre dono links use kare. Jawab: guests ke liye GUEST virtual router, lab ke liye RIB group aur input filter ke saath ISP-B forwarding instance, aur data centre links ke liye forwarding table mein export hui load-balance policy. Chaar features, ek router.</p></div>
<div class="warn"><p><b>Common mistake.</b> Tools ko aapas mein milana. Isolation instance hai; sharing RIB group ya next-table; steering filter; balancing policy. Pehle problem ka naam lo, phir tool chuno.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kai jawab sahi lagte hain kyunki har tool kisi table mein kuch badalta hai. Dekho sawal ko kya chahiye: alag karna, share karna, source se steer karna, ya dono paths use karna, aur ek sahi tool mil jaayega.</p></div>
<div class="scn"><h4>Exam se ek hafta pehle</h4><p>Ek candidate ne timer ke saath teeno labs yaad se dobara banaye: instance aur OSPF das minute mein, FBF pandrah mein, load balancing paanch mein. Har baar usne wahi chaar outputs check kiye: show route instance, instance table, interface filter line aur forwarding table. Har repetition ke saath uska confidence aur speed badhi.</p><p><b>Lesson:</b> sirf configuration nahi, verification ka bhi abhyas karo.</p></div>
<div class="iv"><p class="q">"Ek router par guests, lab aur data centre ko alag routing treatment kaise doge, summary do."</p><p>Guests ko virtual-router instance mein daalta hoon taaki unka apna table ho. Lab filter-based forwarding use karta hai: doosre ISP ke default route wala forwarding instance, next hop resolve karane ke liye RIB group, aur aakhri accept term wala input filter. Data centre links forwarding table mein export hui load-balance policy use karte hain. Har ek ko instance table, interface par filter aur forwarding table se verify karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Instances alag karte hain; RIB groups aur next-table share; filters steer; policy balance.</li>
<li>Show, ping ya trace karte waqt hamesha table ya instance ka naam do.</li>
<li>FBF ko forwarding instance, RIB group, input filter aur aakhri accept chahiye.</li>
<li>Load balancing ka saboot forwarding table (ulst) hai.</li>
</ul></div>
`}};export{e as default};