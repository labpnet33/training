var e={id:`layer3-zones`,h:{en:`Layer 3 interfaces, the virtual router and zones`,hi:`Layer 3 interfaces, virtual router aur zones`},body:{en:`
<p><b>Analogy: a house needs three papers.</b> To live in a house legally you need the deed (IP address: where it is), a municipal registration (virtual router: which city's map it belongs to) and a neighbourhood classification (zone: residential or commercial, which decides the rules). Without the second or third paper the house exists but nobody serves it.</p>

<h3>The three requirements</h3>
<ol>
<li><b>IP address:</b> <code>set network interface ethernet ethernet1/2 layer3 ip 10.0.1.1/24</code>. This makes the firewall the gateway for that network and creates the connected route.</li>
<li><b>Virtual router membership:</b> <code>set network virtual-router default interface [ ethernet1/1 ethernet1/2 ]</code>. A virtual router is a routing table plus the process that fills it. Without membership, the interface has no routing table, so it cannot even answer ARP for routed traffic.</li>
<li><b>Zone membership:</b> <code>set zone trust network layer3 ethernet1/2</code>. The zone gives policy a place to attach. An interface in no zone passes nothing.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Interface bindings">
<rect x="230" y="60" width="180" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="14">ethernet1/2</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">layer3 ip 10.0.1.1/24</text>
<rect x="10" y="20" width="170" height="50" rx="8" fill="#bae6fd"/><text x="95" y="42" text-anchor="middle" class="svg-ink" font-size="13">virtual router</text><text x="95" y="60" text-anchor="middle" class="svg-muted" font-size="12">default (routes)</text>
<rect x="460" y="20" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="545" y="42" text-anchor="middle" class="svg-ink" font-size="13">zone</text><text x="545" y="60" text-anchor="middle" class="svg-muted" font-size="12">trust (policy)</text>
<rect x="235" y="125" width="170" height="38" rx="8" fill="#fde68a"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">management profile</text>
<line x1="230" y1="75" x2="180" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="75" x2="460" y2="50" stroke="#64748b" stroke-width="2"/><line x1="320" y1="120" x2="320" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three bindings make an interface useful: IP, virtual router, zone. A profile adds service access.</p></div>

<h3>Configuring the lab interfaces</h3>
<pre class="code">set network interface ethernet ethernet1/2 layer3 ip 10.0.1.1/24 interface-management-profile mgmt-lan
set network interface ethernet ethernet1/1 layer3 ip 203.0.113.2/30 interface-management-profile allow-ping
set network virtual-router default interface [ ethernet1/1 ethernet1/2 ]
set zone trust network layer3 ethernet1/2
set zone untrust network layer3 ethernet1/1
commit</pre>
<p>A single <code>set</code> line can set an IP and attach a profile together. Then check the result:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show interface all
total configured logical interfaces: 2

name                id    vsys zone             forwarding               tag    address
------------------- ----- ---- ---------------- ------------------------ ------ ------------------
ethernet1/2         16    1    trust            vr:default               0      10.0.1.1/24
ethernet1/1         17    1    untrust          vr:default               0      203.0.113.2/30</pre>
<p>The last lab question asks what forwarding entry ethernet1/2 shows. The answer is in the <b>forwarding</b> column: <code>vr:default</code>, the virtual router it belongs to. The upper table of the same command lists physical ports with their link state; the lower table lists logical interfaces that you configured.</p>

<h3>Why zones are separate from the virtual router</h3>
<p>Beginners ask: "I already put the interface in a virtual router, why a zone?" Because they do different jobs. The <b>virtual router</b> answers "where does a packet go next?" The <b>zone</b> answers "which security rules apply to it?". Two interfaces may be in the same virtual router but in different zones (trust and DMZ), and the firewall still applies policy between them.</p>

<h3>What happens when one piece is missing</h3>
<p>Using the simulator, you can see the three failures:</p>
<ul>
<li>No IP on the interface: PC1 cannot even resolve the gateway ("host not reachable").</li>
<li>IP but no virtual router or zone: the logical table shows N/A in the zone and forwarding columns and traffic is not forwarded.</li>
<li>IP, router and zone but no management profile: the firewall exists in the network but will not answer ping (timeouts).</li>
</ul>
<p>Subinterfaces and VLAN tagging (for example ethernet1/2.10) follow exactly the same three requirements and are the subject of the pan-vlans module.</p>

<div class="eg"><p><b>Worked example.</b> You add ethernet1/3 as a DMZ with 10.0.2.1/24. To make it work you need three more lines even though the IP is committed: <code>set network virtual-router default interface ethernet1/3</code>, <code>set zone dmz network layer3 ethernet1/3</code> and a profile with ping. These three lines are the entire fix in the second lab.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Assuming the zone is created by naming it in a rule: the zone must exist and contain the interface. Putting an interface into a zone of the wrong type (a Layer 3 interface belongs in a Layer 3 zone). Using a subnet mask like 255.255.255.0 instead of /24 in the set command.</p></div>
<div class="exam"><p><b>Exam trap.</b> Interface in a virtual router, but no zone: no traffic. Interface in a zone, but no virtual router: no routing. The exam gives a symptom and asks which object is missing, so tie each symptom to the right object.</p></div>

<div class="scn"><h4>The network team's new server VLAN</h4><p>A new server network appeared on ethernet1/4 and the team committed the IP only. Servers could ping nothing. <code>show interface all</code> showed zone N/A and forwarding N/A. Adding the interface to the virtual router and to a new zone <code>servers</code>, plus a rule from trust to servers, finished the job.</p><p><b>Lesson:</b> every new network needs interface, virtual router, zone and a rule.</p></div>

<div class="iv"><p class="q">"What is the difference between a zone and a virtual router?"</p><p>A virtual router is a routing instance: it holds the routing table and decides the next hop. A zone is a security construct: it groups interfaces so policy can be written between them. An interface needs both for routed traffic, and the two are independent: several zones can share one virtual router.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A routed interface needs IP, virtual router membership and a zone.</li>
<li>show interface all shows the zone and the forwarding (vr:default) side by side.</li>
<li>Virtual router = where to send; zone = which rules apply.</li>
<li>Missing pieces give different symptoms: not reachable, N/A, timeout.</li>
<li>Subinterfaces follow the same rules (see pan-vlans).</li>
</ul></div>
`,hi:`
<p><b>Analogy: ghar ko teen kaagaz chahiye.</b> Ghar mein kaanooni taur par rehne ke liye aapko deed chahiye (IP address: woh kahan hai), nagar palika registration (virtual router: woh kis sheher ke naqshe ka hissa hai) aur mohalle ki classification (zone: residential ya commercial, jo rules tay karta hai). Doosra ya teesra kaagaz na ho to ghar hai lekin koi service nahi deta.</p>

<h3>Teen requirements</h3>
<ol>
<li><b>IP address:</b> <code>set network interface ethernet ethernet1/2 layer3 ip 10.0.1.1/24</code>. Yeh firewall ko us network ka gateway banata hai aur connected route banata hai.</li>
<li><b>Virtual router membership:</b> <code>set network virtual-router default interface [ ethernet1/1 ethernet1/2 ]</code>. Virtual router routing table plus use bharne wala process hai. Membership ke bina interface ki koi routing table nahi, isliye woh routed traffic ke liye ARP ka jawab bhi nahi de sakta.</li>
<li><b>Zone membership:</b> <code>set zone trust network layer3 ethernet1/2</code>. Zone policy ko attach hone ki jagah deta hai. Bina zone ka interface kuch pass nahi karta.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Interface bindings">
<rect x="230" y="60" width="180" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="14">ethernet1/2</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">layer3 ip 10.0.1.1/24</text>
<rect x="10" y="20" width="170" height="50" rx="8" fill="#bae6fd"/><text x="95" y="42" text-anchor="middle" class="svg-ink" font-size="13">virtual router</text><text x="95" y="60" text-anchor="middle" class="svg-muted" font-size="12">default (routes)</text>
<rect x="460" y="20" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="545" y="42" text-anchor="middle" class="svg-ink" font-size="13">zone</text><text x="545" y="60" text-anchor="middle" class="svg-muted" font-size="12">trust (policy)</text>
<rect x="235" y="125" width="170" height="38" rx="8" fill="#fde68a"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">management profile</text>
<line x1="230" y1="75" x2="180" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="75" x2="460" y2="50" stroke="#64748b" stroke-width="2"/><line x1="320" y1="120" x2="320" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Teen bindings interface ko kaam ka banate hain: IP, virtual router, zone. Profile service access jodta hai.</p></div>

<h3>Lab interfaces configure karna</h3>
<pre class="code">set network interface ethernet ethernet1/2 layer3 ip 10.0.1.1/24 interface-management-profile mgmt-lan
set network interface ethernet ethernet1/1 layer3 ip 203.0.113.2/30 interface-management-profile allow-ping
set network virtual-router default interface [ ethernet1/1 ethernet1/2 ]
set zone trust network layer3 ethernet1/2
set zone untrust network layer3 ethernet1/1
commit</pre>
<p>Ek hi <code>set</code> line IP set kar sakti hai aur profile bhi attach kar sakti hai. Phir result check karo:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show interface all
total configured logical interfaces: 2

name                id    vsys zone             forwarding               tag    address
------------------- ----- ---- ---------------- ------------------------ ------ ------------------
ethernet1/2         16    1    trust            vr:default               0      10.0.1.1/24
ethernet1/1         17    1    untrust          vr:default               0      203.0.113.2/30</pre>
<p>Lab ka aakhri sawal poochta hai ki ethernet1/2 kaunsi forwarding entry dikhata hai. Jawab <b>forwarding</b> column mein hai: <code>vr:default</code>, woh virtual router jisse woh judta hai. Same command ki upar wali table physical ports ko link state ke saath list karti hai; neeche wali table aapke configure kiye logical interfaces list karti hai.</p>

<h3>Zones virtual router se alag kyun hain</h3>
<p>Beginners poochte hain: "Maine interface virtual router mein daal diya, phir zone kyun?" Kyunki dono alag kaam karte hain. <b>Virtual router</b> jawab deta hai "packet aage kahan jaaye?" <b>Zone</b> jawab deta hai "us par kaunse security rules lagenge?" Do interfaces ek hi virtual router mein lekin alag zones (trust aur DMZ) mein ho sakte hain, aur firewall unke beech phir bhi policy lagata hai.</p>

<h3>Ek piece missing ho to kya hota hai</h3>
<p>Simulator mein aap teen failures dekh sakte ho:</p>
<ul>
<li>Interface par IP nahi: PC1 gateway resolve hi nahi kar pata ("host not reachable").</li>
<li>IP hai lekin virtual router ya zone nahi: logical table zone aur forwarding columns mein N/A dikhati hai aur traffic forward nahi hota.</li>
<li>IP, router aur zone hain lekin management profile nahi: firewall network mein hai lekin ping ka jawab nahi deta (timeouts).</li>
</ul>
<p>Subinterfaces aur VLAN tagging (jaise ethernet1/2.10) bilkul yahi teen requirements follow karte hain aur pan-vlans module ka vishay hain.</p>

<div class="eg"><p><b>Worked example.</b> Aap ethernet1/3 ko 10.0.2.1/24 ke saath DMZ banate ho. Ise chalane ke liye aapko teen aur lines chahiye bhale hi IP committed ho: <code>set network virtual-router default interface ethernet1/3</code>, <code>set zone dmz network layer3 ethernet1/3</code> aur ping wala profile. Yeh teen lines doosre lab ka poora fix hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Maan lena ki rule mein naam dene se zone ban jaata hai: zone exist karna chahiye aur usme interface hona chahiye. Interface ko galat type ke zone mein daalna (Layer 3 interface Layer 3 zone mein jaata hai). Set command mein /24 ki jagah 255.255.255.0 jaisa subnet mask dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Interface virtual router mein hai lekin zone nahi: traffic nahi. Interface zone mein hai lekin virtual router nahi: routing nahi. Exam symptom deta hai aur poochta hai kaunsa object missing hai, isliye har symptom ko sahi object se jodo.</p></div>

<div class="scn"><h4>Network team ka naya server VLAN</h4><p>ethernet1/4 par naya server network aaya aur team ne sirf IP commit kiya. Servers kuch ping nahi kar paye. <code>show interface all</code> ne zone N/A aur forwarding N/A dikhaya. Interface ko virtual router mein aur naye zone <code>servers</code> mein daalne, plus trust se servers ka rule jodne se kaam poora hua.</p><p><b>Lesson:</b> har naye network ko interface, virtual router, zone aur rule chahiye.</p></div>

<div class="iv"><p class="q">"Zone aur virtual router mein kya fark hai?"</p><p>Virtual router ek routing instance hai: woh routing table rakhta hai aur next hop tay karta hai. Zone ek security construct hai: woh interfaces ko group karta hai taaki unke beech policy likhi ja sake. Routed traffic ke liye interface ko dono chahiye, aur dono independent hain: kai zones ek virtual router share kar sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routed interface ko IP, virtual router membership aur zone chahiye.</li>
<li>show interface all zone aur forwarding (vr:default) saath dikhata hai.</li>
<li>Virtual router = kahan bhejna hai; zone = kaunse rules lagenge.</li>
<li>Missing pieces alag symptoms dete hain: not reachable, N/A, timeout.</li>
<li>Subinterfaces yahi rules follow karte hain (pan-vlans dekho).</li>
</ul></div>
`}};export{e as default};