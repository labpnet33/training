var e={id:`overview`,h:{en:`Routing on PAN-OS: what you will learn and the big picture`,hi:`PAN-OS par routing: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn.</b> This module teaches dynamic routing on a Palo Alto Networks next-generation firewall: virtual routers, static routes with path monitoring, OSPF, BGP, redistribution profiles, and how the route table decides which zone a packet leaves from. It supports the Network and Routing objectives of the NGFW Engineer exam and applies to PAN-OS 10.x and 11.x.</p>
<p><b>Prerequisites.</b> You should know zones, interfaces and basic security policy from the pan-setup module, and NAT from pan-nat. General OSPF and BGP theory is taught in depth in enarsi-ospf and enarsi-bgp; here we focus on how PAN-OS implements them.</p>
<h3>Analogy: the firewall is a border post with a map</h3>
<p>A border post has guards (security policy) and also a map that says which road leads where. The guards can only check a car that arrives on the right road, and the map decides which gate it leaves by. On a firewall that map is the <b>route table</b>. If the map is wrong, the best policy in the world never sees the traffic, or sends it out of the wrong gate.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Every source feeds one route table per virtual router; the best route is installed in the forwarding table."><rect x="20" y="40" width="100" height="80" rx="10" fill="#bae6fd"/><text x="70" y="76" text-anchor="middle" class="svg-ink" font-size="14">Static</text><text x="70" y="98" text-anchor="middle" class="svg-muted" font-size="12">you type it</text><line x1="120" y1="80" x2="144" y2="80" stroke="#64748b" stroke-width="2"/><rect x="144" y="40" width="100" height="80" rx="10" fill="#bbf7d0"/><text x="194" y="76" text-anchor="middle" class="svg-ink" font-size="14">OSPF</text><text x="194" y="98" text-anchor="middle" class="svg-muted" font-size="12">learned inside</text><line x1="244" y1="80" x2="268" y2="80" stroke="#64748b" stroke-width="2"/><rect x="268" y="40" width="100" height="80" rx="10" fill="#ddd6fe"/><text x="318" y="76" text-anchor="middle" class="svg-ink" font-size="14">BGP</text><text x="318" y="98" text-anchor="middle" class="svg-muted" font-size="12">from peers</text><line x1="368" y1="80" x2="392" y2="80" stroke="#64748b" stroke-width="2"/><rect x="392" y="40" width="100" height="80" rx="10" fill="#fde68a"/><text x="442" y="76" text-anchor="middle" class="svg-ink" font-size="14">Virtual router</text><text x="442" y="98" text-anchor="middle" class="svg-muted" font-size="12">best route wins</text><line x1="492" y1="80" x2="516" y2="80" stroke="#64748b" stroke-width="2"/><rect x="516" y="40" width="100" height="80" rx="10" fill="#fed7aa"/><text x="566" y="76" text-anchor="middle" class="svg-ink" font-size="14">FIB</text><text x="566" y="98" text-anchor="middle" class="svg-muted" font-size="12">forwarding</text></svg><p class="cap">Every source feeds one route table per virtual router; the best route is installed in the forwarding table.</p></div>
<h3>The virtual router</h3>
<p>A <b>virtual router (VR)</b> is the routing instance inside the firewall. It holds the route table, the routing protocols and the interfaces that belong to it. A Layer 3 interface must be assigned to exactly one VR, and a new firewall starts with one VR named <code>default</code>. Interfaces in different VRs cannot reach each other unless a route points across, so a VR is also a simple way to separate tenants or to keep an untrusted segment away from the internal table.</p>
<div class="note"><p><b>Note.</b> PAN-OS 11.0 and later also offers the Advanced Routing Engine on supported platforms, with logical routers and a different configuration model. This module teaches the classic virtual router, which most exam questions and production firewalls use. Confirm which engine a firewall runs before you follow any recipe.</p></div>
<h3>Where routes come from</h3>
<ul>
<li><b>Connected</b>: a Layer 3 interface with an IP address creates a route to its own subnet.</li>
<li><b>Static</b>: you create it, optionally with path monitoring.</li>
<li><b>OSPF</b> and <b>BGP</b>: learned from neighbours (RIP also exists but is not covered here).</li>
<li><b>Redistribution</b>: one source is advertised into another through a redistribution profile.</li>
</ul>
<p>When several sources offer the same prefix, the lowest <b>administrative distance</b> wins. Defaults, which you can change under the virtual router:</p>
<table class="cmp">
<tr><th>Source</th><th>Default distance</th></tr>
<tr><td>Static</td><td>10</td></tr>
<tr><td>EBGP</td><td>20</td></tr>
<tr><td>OSPF internal</td><td>30</td></tr>
<tr><td>OSPF external</td><td>110</td></tr>
<tr><td>RIP</td><td>120</td></tr>
<tr><td>IBGP</td><td>200</td></tr>
</table>
<p>Inside one source the lowest metric wins; for equal-cost paths, ECMP can use several next hops if you enable it.</p>
<h3>What the simulator can show</h3>
<p>The NetSim PAN-OS simulator runs connected and static routes and the command <code>show routing route</code>. It does not run OSPF, BGP or Panorama, so everything about those features in this module is labelled as a reference configuration and no lab exists for it yet. Practise the supported parts in pan-setup and pan-nat, and build protocol intuition in enarsi-ospf, enarsi-bgp and nse4-dynamic. The legend that the real command prints starts like this:</p>
<pre class="out">flags: A:active, ?:loose, C:connect, H:host, S:static, ~:internal, R:rip, O:ospf, B:bgp,
       Oi:ospf intra-area, Oo:ospf inter-area, O1:ospf ext-type-1, O2:ospf ext-type-2, E:ecmp, M:multicast

VIRTUAL ROUTER: default (id 1)</pre>
<p>Flag <code>A</code> means the route is active, that is, installed. A route can exist but not be active, usually because a better distance won.</p>
<div class="eg"><p><b>Worked example.</b> A firewall has eth1/1 on 10.10.1.0/24 and learns 10.50.0.0/16 from both a static route (distance 10) and OSPF external (110). The static route is installed. Delete it and OSPF takes over with no other change.</p></div>
<div class="warn"><p><b>Common mistake.</b> Assuming the firewall routes like a switch. A packet with no route is dropped, even if the policy would allow it. Check the route first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Distances are asked by number. Remember static 10, EBGP 20, OSPF internal 30, OSPF external 110, RIP 120, IBGP 200.</p></div>
<div class="scn"><h4>The policy was perfect, the traffic still died</h4><p>A new branch subnet could not reach the data centre. The security rule was correct and the logs were empty. The engineer ran a route lookup and found no route back to the branch, because OSPF was not enabled on the new interface. After the interface joined the area and the route appeared, traffic flowed.</p><p><b>Lesson:</b> when logs are empty, suspect the route table before the rulebase.</p></div>
<div class="iv"><p class="q">"What is a virtual router on a Palo Alto firewall?"</p><p>It is the routing instance that owns the route table, the protocols and the interfaces. Each Layer 3 interface belongs to exactly one VR and the first one is named default. Mention administrative distance, and that policy depends on the result of the route lookup.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A virtual router owns a route table, protocols and interfaces.</li><li>Each Layer 3 interface belongs to exactly one VR.</li><li>Lowest distance wins: static 10, EBGP 20, OSPF internal 30, OSPF external 110, IBGP 200.</li><li>The simulator runs static routes only; OSPF and BGP here are reference configuration.</li><li>No route means dropped traffic, whatever the policy says.</li></ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh module Palo Alto Networks next-generation firewall par dynamic routing sikhata hai: virtual routers, path monitoring ke saath static routes, OSPF, BGP, redistribution profiles, aur route table kaise decide karta hai ki packet kis zone se bahar jaayega. Yeh NGFW Engineer exam ke Network aur Routing objectives ko cover karta hai aur PAN-OS 10.x aur 11.x par lagu hota hai.</p>
<p><b>Prerequisites.</b> Aapko pan-setup module se zones, interfaces aur basic security policy, aur pan-nat se NAT aana chahiye. OSPF aur BGP ki general theory enarsi-ospf aur enarsi-bgp mein detail mein hai; yahan hum sirf yeh dekhte hain ki PAN-OS unhe kaise implement karta hai.</p>
<h3>Analogy: firewall ek border post hai jiske paas map hai</h3>
<p>Border post par guards (security policy) hote hain aur ek map bhi, jo batata hai kaunsi road kahan jaati hai. Guards sirf us gaadi ko check kar sakte hain jo sahi road se aayi ho, aur map decide karta hai ki gaadi kis gate se niklegi. Firewall par woh map <b>route table</b> hai. Map galat ho to duniya ki best policy ko traffic dikhta hi nahi, ya woh galat gate se bahar chala jaata hai.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Har source ek virtual router ke route table mein jaata hai; best route forwarding table mein install hota hai."><rect x="20" y="40" width="100" height="80" rx="10" fill="#bae6fd"/><text x="70" y="76" text-anchor="middle" class="svg-ink" font-size="14">Static</text><text x="70" y="98" text-anchor="middle" class="svg-muted" font-size="12">aap type karte ho</text><line x1="120" y1="80" x2="144" y2="80" stroke="#64748b" stroke-width="2"/><rect x="144" y="40" width="100" height="80" rx="10" fill="#bbf7d0"/><text x="194" y="76" text-anchor="middle" class="svg-ink" font-size="14">OSPF</text><text x="194" y="98" text-anchor="middle" class="svg-muted" font-size="12">andar se seekha</text><line x1="244" y1="80" x2="268" y2="80" stroke="#64748b" stroke-width="2"/><rect x="268" y="40" width="100" height="80" rx="10" fill="#ddd6fe"/><text x="318" y="76" text-anchor="middle" class="svg-ink" font-size="14">BGP</text><text x="318" y="98" text-anchor="middle" class="svg-muted" font-size="12">peers se seekha</text><line x1="368" y1="80" x2="392" y2="80" stroke="#64748b" stroke-width="2"/><rect x="392" y="40" width="100" height="80" rx="10" fill="#fde68a"/><text x="442" y="76" text-anchor="middle" class="svg-ink" font-size="14">Virtual router</text><text x="442" y="98" text-anchor="middle" class="svg-muted" font-size="12">best route jeetta hai</text><line x1="492" y1="80" x2="516" y2="80" stroke="#64748b" stroke-width="2"/><rect x="516" y="40" width="100" height="80" rx="10" fill="#fed7aa"/><text x="566" y="76" text-anchor="middle" class="svg-ink" font-size="14">FIB</text><text x="566" y="98" text-anchor="middle" class="svg-muted" font-size="12">forwarding</text></svg><p class="cap">Har source ek virtual router ke route table mein jaata hai; best route forwarding table mein install hota hai.</p></div>
<h3>Virtual router</h3>
<p><b>Virtual router (VR)</b> firewall ke andar ka routing instance hai. Isme route table, routing protocols aur uske interfaces hote hain. Har Layer 3 interface ek hi VR mein hona chahiye, aur naye firewall mein <code>default</code> naam ka ek VR hota hai. Alag VRs ke interfaces tab tak ek dusre tak nahi pahunch sakte jab tak koi route across na jaaye, isliye VR tenants ko alag karne ya untrusted segment ko internal table se door rakhne ka simple tareeka bhi hai.</p>
<div class="note"><p><b>Note.</b> PAN-OS 11.0 aur uske baad supported platforms par Advanced Routing Engine bhi milta hai, jisme logical routers aur alag configuration model hota hai. Yeh module classic virtual router sikhata hai, jo zyadatar exam questions aur production firewalls mein hota hai. Koi bhi recipe follow karne se pehle confirm karo ki firewall kaunsa engine chala raha hai.</p></div>
<h3>Routes kahan se aate hain</h3>
<ul>
<li><b>Connected</b>: IP address wale Layer 3 interface se apne subnet ka route ban jaata hai.</li>
<li><b>Static</b>: aap banate ho, chahe to path monitoring ke saath.</li>
<li><b>OSPF</b> aur <b>BGP</b>: neighbours se seekhe jaate hain (RIP bhi hota hai par yahan nahi hai).</li>
<li><b>Redistribution</b>: ek source ko redistribution profile se dusre mein advertise karna.</li>
</ul>
<p>Jab kai sources same prefix dein, sabse kam <b>administrative distance</b> jeetta hai. Defaults, jo aap virtual router mein badal sakte ho:</p>
<table class="cmp">
<tr><th>Source</th><th>Default distance</th></tr>
<tr><td>Static</td><td>10</td></tr>
<tr><td>EBGP</td><td>20</td></tr>
<tr><td>OSPF internal</td><td>30</td></tr>
<tr><td>OSPF external</td><td>110</td></tr>
<tr><td>RIP</td><td>120</td></tr>
<tr><td>IBGP</td><td>200</td></tr>
</table>
<p>Ek hi source ke andar sabse kam metric jeetta hai; equal-cost paths ke liye ECMP enable karoge to kai next hops use ho sakte hain.</p>
<h3>Simulator kya dikha sakta hai</h3>
<p>NetSim PAN-OS simulator connected aur static routes aur <code>show routing route</code> command chalata hai. Yeh OSPF, BGP ya Panorama nahi chalata, isliye in features ki saari baatein is module mein reference configuration ke roop mein likhi hain aur inke liye abhi koi lab nahi hai. Supported hisse pan-setup aur pan-nat mein practise karo, aur protocol intuition enarsi-ospf, enarsi-bgp aur nse4-dynamic mein banao. Real command ka legend aise shuru hota hai:</p>
<pre class="out">flags: A:active, ?:loose, C:connect, H:host, S:static, ~:internal, R:rip, O:ospf, B:bgp,
       Oi:ospf intra-area, Oo:ospf inter-area, O1:ospf ext-type-1, O2:ospf ext-type-2, E:ecmp, M:multicast

VIRTUAL ROUTER: default (id 1)</pre>
<p>Flag <code>A</code> ka matlab route active hai, yaani installed. Route table mein ho sakta hai par active na ho, aam taur par kyunki behtar distance jeet gaya.</p>
<div class="eg"><p><b>Worked example.</b> Firewall ka eth1/1 10.10.1.0/24 par hai aur 10.50.0.0/16 static route (distance 10) aur OSPF external (110) dono se seekhta hai. Static route install hota hai. Use delete karo to OSPF bina kisi aur change ke le leta hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Maan lena ki firewall switch ki tarah route karta hai. Route na ho to packet drop hota hai, chahe policy allow kare. Pehle route check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Distances number se poochhe jaate hain. Yaad rakho static 10, EBGP 20, OSPF internal 30, OSPF external 110, RIP 120, IBGP 200.</p></div>
<div class="scn"><h4>Policy perfect thi, traffic phir bhi mara</h4><p>Naya branch subnet data centre tak nahi pahunch raha tha. Security rule sahi thi aur logs khaali the. Engineer ne route lookup chalaya to branch ka return route nahi mila, kyunki naye interface par OSPF enable nahi tha. Interface area mein aaya aur route dikhne laga to traffic chalne laga.</p><p><b>Lesson:</b> jab logs khaali ho to rulebase se pehle route table par shak karo.</p></div>
<div class="iv"><p class="q">"Palo Alto firewall par virtual router kya hota hai?"</p><p>Yeh woh routing instance hai jiske paas route table, protocols aur interfaces hote hain. Har Layer 3 interface ek hi VR ka hota hai aur pehla VR default naam ka hota hai. Administrative distance ka zikr karo, aur yeh bhi ki policy route lookup ke result par depend karti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Virtual router ke paas route table, protocols aur interfaces hote hain.</li><li>Har Layer 3 interface ek hi VR mein hota hai.</li><li>Sabse kam distance jeetta hai: static 10, EBGP 20, OSPF internal 30, OSPF external 110, IBGP 200.</li><li>Simulator sirf static routes chalata hai; yahan OSPF aur BGP reference configuration hain.</li><li>Route na ho to traffic drop hota hai, policy kuch bhi kahe.</li></ul></div>
`}};export{e as default};