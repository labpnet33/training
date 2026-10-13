var e={id:`overview`,h:{en:`Overview and prerequisites: why more than one routing table?`,hi:`Overview aur prerequisites: ek se zyada routing table kyun?`},body:{en:`
<p>A Junos router starts with one routing table for IPv4 unicast, <code>inet.0</code>. For many networks this is enough. But some jobs need <b>separate routing tables</b> on the same box: guest traffic that must never see internal routes, a lab that has to leave through a different ISP, or two equal paths that should both carry traffic. This module teaches the Junos tools for those jobs: <b>routing instances</b>, <b>RIB groups</b>, <b>filter-based forwarding</b> and <b>load balancing</b>. They are part of the JNCIS-ENT (JN0-351) blueprint and appear in real campus and branch designs.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="One router with several tables">
<rect x="20" y="20" width="600" height="170" rx="12" fill="#f1f5f9" stroke="#94a3b8"/>
<text x="40" y="45" class="svg-ink" font-size="14">One physical router</text>
<rect x="45" y="65" width="150" height="95" rx="8" fill="#bae6fd"/><text x="120" y="92" text-anchor="middle" class="svg-ink" font-size="13">master instance</text><text x="120" y="115" text-anchor="middle" class="svg-muted" font-size="12">inet.0</text><text x="120" y="138" text-anchor="middle" class="svg-muted" font-size="11">staff, servers</text>
<rect x="245" y="65" width="150" height="95" rx="8" fill="#fde68a"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="13">GUEST (virtual-router)</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">GUEST.inet.0</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="11">guest users only</text>
<rect x="445" y="65" width="150" height="95" rx="8" fill="#bbf7d0"/><text x="520" y="92" text-anchor="middle" class="svg-ink" font-size="13">ISP-B (forwarding)</text><text x="520" y="115" text-anchor="middle" class="svg-muted" font-size="12">ISP-B.inet.0</text><text x="520" y="138" text-anchor="middle" class="svg-muted" font-size="11">steered traffic</text>
</svg><p class="cap">Each instance has its own tables, interfaces and protocols.</p></div>

<h3>What problems does this module solve?</h3>
<ul>
<li><b>Separation.</b> Guests and staff share hardware but not routes. A virtual-router instance gives each its own table.</li>
<li><b>Sharing on purpose.</b> When instances must exchange some routes, a <b>RIB group</b> copies routes from one table to another, or <code>next-table</code> sends lookups across.</li>
<li><b>Policy-based paths.</b> Normally the destination decides the path. <b>Filter-based forwarding</b> lets the source address decide.</li>
<li><b>Using both links.</b> By default Junos installs one next hop in the forwarding table even if two are equal. <code>load-balance per-packet</code> installs both.</li>
</ul>

<h3>Prerequisites</h3>
<ul>
<li>Basic Junos CLI: operational and configuration mode, <code>set</code>, <code>commit</code>, <code>show | compare</code>.</li>
<li>Routing table and forwarding table, route preference and longest prefix match (see the routing policy and preference module).</li>
<li>Simple OSPF: neighbours, areas, passive interfaces.</li>
<li>IPv4 addressing and the idea of a firewall filter with terms.</li>
</ul>

<h3>The three labs</h3>
<table class="cmp"><tr><th>Lab</th><th>Goal</th><th>Main tool</th></tr>
<tr><td>Guest virtual router</td><td>Guests get their own routing domain with OSPF to a gateway</td><td>virtual-router instance</td></tr>
<tr><td>Send the training lab via ISP-B</td><td>One subnet leaves through the second ISP</td><td>forwarding instance, RIB group, input filter</td></tr>
<tr><td>Use both data centre paths</td><td>Two equal OSPF paths carry traffic</td><td>load-balance per-packet policy</td></tr></table>

<h3>A map of the chapters</h3>
<ol>
<li>This overview.</li>
<li>Instance types and tables.</li>
<li>Working inside an instance (guest lab).</li>
<li>RIB groups and next-table.</li>
<li>Filter-based forwarding: the concept.</li>
<li>Filter-based forwarding: the ISP-B lab.</li>
<li>Load balancing.</li>
<li>Troubleshooting.</li>
<li>Summary and exam checklist.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> A small hotel has staff PCs and guest Wi-Fi on one router. Guests only need the Internet gateway, staff need the internal servers. With one table, a guest could in theory reach 10.20.0.0/24 if a firewall rule were missing. With a GUEST instance, that route does not even exist in the guest table, so there is nothing to attack.</p></div>
<div class="warn"><p><b>Common mistake.</b> Treating an instance as a firewall. An instance separates <i>routing</i>; it does not inspect traffic. You still use filters or security policy for access control.</p></div>
<div class="exam"><p><b>Exam trap.</b> The word "instance" alone is ambiguous. The exam may show <code>instance-type virtual-router</code>, <code>forwarding</code> or <code>vrf</code>; know which one runs protocols, which one only forwards, and which one needs a route distinguisher and targets.</p></div>
<div class="scn"><h4>The router that did everything</h4><p>A school ran staff, students and a visitor network on one edge router with a single table and a pile of filters. After a student found an internal printer, the school moved visitors into their own virtual router. The incident did not repeat because visitor routes simply never contained internal prefixes.</p><p><b>Lesson:</b> separate routing first, then filter what is left.</p></div>
<div class="iv"><p class="q">"Why use a routing instance instead of just filters?"</p><p>Filters decide per packet whether to permit traffic, while an instance gives a separate routing table, so unwanted destinations are not reachable at all. I use instances for isolation and filters for fine access control, often together.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One router can hold many routing tables; each instance has its own.</li>
<li>Instances separate routing; RIB groups share routes deliberately.</li>
<li>Filter-based forwarding steers by source; load balancing uses equal paths.</li>
<li>You need CLI, OSPF and routing table basics before starting.</li>
</ul></div>
`,hi:`
<p>Junos router IPv4 unicast ke liye ek routing table, <code>inet.0</code>, se shuru hota hai. Kai networks ke liye yeh kaafi hai. Lekin kuch kaam ek hi box par <b>alag routing tables</b> maangte hain: guest traffic jo internal routes kabhi na dekhe, lab jo alag ISP se bahar jaye, ya do barabar paths jo dono traffic le jayein. Is module mein un kaamon ke Junos tools hain: <b>routing instances</b>, <b>RIB groups</b>, <b>filter-based forwarding</b> aur <b>load balancing</b>. Yeh JNCIS-ENT (JN0-351) blueprint ka hissa hain aur real campus aur branch designs mein milte hain.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Ek router, kai tables">
<rect x="20" y="20" width="600" height="170" rx="12" fill="#f1f5f9" stroke="#94a3b8"/>
<text x="40" y="45" class="svg-ink" font-size="14">Ek physical router</text>
<rect x="45" y="65" width="150" height="95" rx="8" fill="#bae6fd"/><text x="120" y="92" text-anchor="middle" class="svg-ink" font-size="13">master instance</text><text x="120" y="115" text-anchor="middle" class="svg-muted" font-size="12">inet.0</text><text x="120" y="138" text-anchor="middle" class="svg-muted" font-size="11">staff, servers</text>
<rect x="245" y="65" width="150" height="95" rx="8" fill="#fde68a"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="13">GUEST (virtual-router)</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">GUEST.inet.0</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="11">sirf guest users</text>
<rect x="445" y="65" width="150" height="95" rx="8" fill="#bbf7d0"/><text x="520" y="92" text-anchor="middle" class="svg-ink" font-size="13">ISP-B (forwarding)</text><text x="520" y="115" text-anchor="middle" class="svg-muted" font-size="12">ISP-B.inet.0</text><text x="520" y="138" text-anchor="middle" class="svg-muted" font-size="11">steer kiya traffic</text>
</svg><p class="cap">Har instance ke apne tables, interfaces aur protocols hote hain.</p></div>

<h3>Yeh module kaunsi problems solve karta hai?</h3>
<ul>
<li><b>Separation.</b> Guests aur staff hardware share karte hain par routes nahi. Virtual-router instance har ek ko apna table deta hai.</li>
<li><b>Jaan-boojh kar sharing.</b> Jab instances ko kuch routes exchange karne hon, <b>RIB group</b> ek table se doosre mein routes copy karta hai, ya <code>next-table</code> lookup ko aage bhejta hai.</li>
<li><b>Policy-based paths.</b> Aam taur par destination path tay karta hai. <b>Filter-based forwarding</b> mein source address tay karta hai.</li>
<li><b>Dono links use karna.</b> Default mein Junos do barabar paths hone par bhi forwarding table mein ek hi next hop install karta hai. <code>load-balance per-packet</code> dono install karta hai.</li>
</ul>

<h3>Prerequisites</h3>
<ul>
<li>Basic Junos CLI: operational aur configuration mode, <code>set</code>, <code>commit</code>, <code>show | compare</code>.</li>
<li>Routing table aur forwarding table, route preference aur longest prefix match (routing policy aur preference module dekho).</li>
<li>Simple OSPF: neighbours, areas, passive interfaces.</li>
<li>IPv4 addressing aur terms wale firewall filter ka idea.</li>
</ul>

<h3>Teen labs</h3>
<table class="cmp"><tr><th>Lab</th><th>Goal</th><th>Mukhya tool</th></tr>
<tr><td>Guest virtual router</td><td>Guests ko apna routing domain aur gateway tak OSPF</td><td>virtual-router instance</td></tr>
<tr><td>Training lab ko ISP-B se bhejo</td><td>Ek subnet doosre ISP se bahar jaye</td><td>forwarding instance, RIB group, input filter</td></tr>
<tr><td>Data centre ke dono paths</td><td>Do barabar OSPF paths traffic le jayein</td><td>load-balance per-packet policy</td></tr></table>

<h3>Chapters ka naqsha</h3>
<ol>
<li>Yeh overview.</li>
<li>Instance types aur tables.</li>
<li>Instance ke andar kaam (guest lab).</li>
<li>RIB groups aur next-table.</li>
<li>Filter-based forwarding: concept.</li>
<li>Filter-based forwarding: ISP-B lab.</li>
<li>Load balancing.</li>
<li>Troubleshooting.</li>
<li>Summary aur exam checklist.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Ek chhote hotel mein staff PCs aur guest Wi-Fi ek router par hain. Guests ko sirf Internet gateway chahiye, staff ko internal servers. Ek table ho to guest, agar firewall rule chhoot jaye, 10.20.0.0/24 tak pahunch sakta hai. GUEST instance ke saath woh route guest table mein hai hi nahi, isliye attack karne ko kuch nahi.</p></div>
<div class="warn"><p><b>Common mistake.</b> Instance ko firewall samajhna. Instance <i>routing</i> alag karta hai; traffic inspect nahi karta. Access control ke liye filters ya security policy phir bhi chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sirf "instance" shabd ambiguous hai. Exam <code>instance-type virtual-router</code>, <code>forwarding</code> ya <code>vrf</code> dikha sakta hai; jaano kaunsa protocols chalata hai, kaunsa sirf forward karta hai, aur kisko route distinguisher aur targets chahiye.</p></div>
<div class="scn"><h4>Router jo sab kuch karta tha</h4><p>Ek school ne staff, students aur visitor network ek edge router par ek table aur filters ke dher ke saath chalaya. Ek student ko internal printer milne ke baad school ne visitors ko apne virtual router mein daal diya. Incident dobara nahi hua kyunki visitor routes mein internal prefixes the hi nahi.</p><p><b>Lesson:</b> pehle routing alag karo, phir jo bacha use filter karo.</p></div>
<div class="iv"><p class="q">"Sirf filters ki jagah routing instance kyun?"</p><p>Filters har packet par tay karte hain traffic permit ho ya nahi, jabki instance alag routing table deta hai, isliye unwanted destinations reachable hi nahi hoti. Main isolation ke liye instances aur fine access control ke liye filters use karta hoon, aksar dono saath.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek router mein kai routing tables ho sakte hain; har instance ka apna.</li>
<li>Instances routing alag karte hain; RIB groups jaan-boojh kar share karte hain.</li>
<li>Filter-based forwarding source se steer karta hai; load balancing barabar paths use karta hai.</li>
<li>Shuru karne se pehle CLI, OSPF aur routing table basics chahiye.</li>
</ul></div>
`}};export{e as default};