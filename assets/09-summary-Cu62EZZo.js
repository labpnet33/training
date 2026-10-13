var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This is your revision sheet for centralized control policy: topology, VPN membership and service chaining. It supports the blueprint objectives on centralized policy: policy types and where they run, lists, control policy, topologies, VPN membership, service chaining, activation and verification.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Control policy summary">
<rect x="10" y="15" width="200" height="200" rx="10" fill="#bae6fd"/><text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="14">Build</text>
<text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="12">lists: site, VPN, prefix, TLOC</text><text x="110" y="95" text-anchor="middle" class="svg-muted" font-size="12">sequences: match, action</text><text x="110" y="120" text-anchor="middle" class="svg-muted" font-size="12">default action: reject</text><text x="110" y="145" text-anchor="middle" class="svg-muted" font-size="12">set: preference, tloc, service</text>
<rect x="225" y="15" width="200" height="200" rx="10" fill="#fde68a"/><text x="325" y="38" text-anchor="middle" class="svg-ink" font-size="14">Apply and activate</text>
<text x="325" y="70" text-anchor="middle" class="svg-muted" font-size="12">apply-policy site-list</text><text x="325" y="95" text-anchor="middle" class="svg-muted" font-size="12">in: edges to Controller</text><text x="325" y="120" text-anchor="middle" class="svg-muted" font-size="12">out: Controller to edges</text><text x="325" y="145" text-anchor="middle" class="svg-muted" font-size="12">one active policy only</text>
<rect x="440" y="15" width="190" height="200" rx="10" fill="#bbf7d0"/><text x="535" y="38" text-anchor="middle" class="svg-ink" font-size="14">Verify</text>
<text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">show running-config policy</text><text x="535" y="95" text-anchor="middle" class="svg-muted" font-size="12">show omp routes / tlocs</text><text x="535" y="120" text-anchor="middle" class="svg-muted" font-size="12">show omp services</text><text x="535" y="145" text-anchor="middle" class="svg-muted" font-size="12">show sdwan policy from-vsmart</text>
</svg><p class="cap">Build, apply, verify.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Name the four policy types and say where each one runs (Controller or edge).</li>
<li>Create site, VPN, prefix and TLOC lists in the Manager and in CLI.</li>
<li>Write a control policy with route and tloc sequences, accept or reject, set preference, tloc and service.</li>
<li>State the default action of a control policy and its effect.</li>
<li>Build hub-and-spoke, describe partial mesh and the idea of regions.</li>
<li>Explain VPN membership policy and service chaining, and what each needs.</li>
<li>Apply a policy with the right direction and activate it from the Manager.</li>
<li>Verify with the Controller and edge commands, and troubleshoot with a fixed order.</li>
</ul>

<h3>Glossary</h3>
<dl class="terms">
<dt>Centralized policy</dt><dd>The Manager object that bundles control, VPN membership, data and application-aware policies; one is active at a time.</dd>
<dt>Control policy</dt><dd>Runs on the Controller; changes routes, TLOCs and service routes before edges see them.</dd>
<dt>VPN membership policy</dt><dd>Controller policy that limits which VPNs a site receives.</dd>
<dt>Data policy</dt><dd>Policy sent to edges that acts on packets.</dd>
<dt>Application-aware routing policy</dt><dd>Edge policy that picks paths by SLA.</dd>
<dt>Localized policy</dt><dd>Policy attached to one edge: ACL, QoS, route policy.</dd>
<dt>List</dt><dd>A reusable group of sites, VPNs, prefixes or TLOCs.</dd>
<dt>Sequence</dt><dd>One numbered match and action rule inside a policy.</dd>
<dt>Default action</dt><dd>What happens to an update no sequence matched; reject for control policy.</dd>
<dt>Service chaining</dt><dd>Steering routes through a service such as a firewall by a control policy and an advertised service route.</dd>
<dt>Direction</dt><dd>In: from edges to the Controller. Out: from the Controller to edges.</dd>
</dl>

<h3>Most tested facts</h3>
<ol>
<li>Control policy and VPN membership policy run on the Controller and are never pushed to edges.</li>
<li>Data and application-aware routing policies are sent to the edges over OMP.</li>
<li>Default overlay is a full mesh; topologies are built by removing information.</li>
<li>Control policy default action is reject.</li>
<li>A TLOC list entry has system IP, color and encapsulation.</li>
<li>Direction is relative to the Controller: in from edges, out to edges.</li>
<li>Only one centralized policy is active at a time.</li>
<li>Service chaining needs the service advertised by the edge and a control policy with set service.</li>
<li>Control-policy service chaining with a locally hosted service chain is not supported; service chaining and AppQoE on the same device are not supported.</li>
</ol>

<h3>Click path and command cheat-sheet</h3>
<pre class="code">Configuration &gt; Policies &gt; Centralized Policy &gt; Add Policy
  Create Groups of Interest &gt; Configure Topology and VPN Membership
  &gt; Configure Traffic Rules &gt; Apply Policies to Sites and VPNs &gt; Save Policy
Row menu (three dots) &gt; Activate | Deactivate

show running-config policy          (Controller)
show running-config apply-policy    (Controller)
show omp routes | tlocs | services  (Controller)
show sdwan omp routes | tlocs       (edge)
show sdwan bfd sessions             (edge)
show sdwan policy from-vsmart       (edge)</pre>

<div class="warn"><p><b>Revise these mistakes.</b> Default reject silently removing routes; accepting routes without TLOCs; wrong direction; no pilot; searching for control policy on the edge.</p></div>
<div class="exam"><p><b>Exam trap to revise.</b> If a question asks where a control policy "is applied", the answer is the Controller, by site list, with a direction. If it asks where a data policy "acts", the answer is the edge.</p></div>

<div class="scn"><h4>The ninety-minute rollout</h4><p>A retailer used what you learned in a single change window: lists reviewed at 09:00, hub-and-spoke policy applied out to a pilot site list at 09:20, verification at 09:30 with TLOC tables and BFD sessions, widened to all branches at 10:15. One site was missing from a list and showed full mesh. The seven-question troubleshooting order found it in five minutes.</p></div>

<div class="iv"><p class="q">"Explain centralized control policy in two minutes."</p><p>Strong answer: it runs on the Controller and edits the OMP routes, TLOCs and service routes that edges receive. I build lists for sites, VPNs, prefixes and TLOCs, write sequences with match and action, and remember the default action is reject. I use it for topology such as hub-and-spoke and for service chaining, apply it to a site list with in or out relative to the Controller, activate it from the Centralized Policy page, then verify with show omp on the Controller, show sdwan omp and BFD on an edge, and keep a deactivation plan.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Control policy lives on the Controller and shapes what edges learn.</li>
<li>Lists, sequences, default reject, apply-policy with direction, activate.</li>
<li>Topology and service chaining are the two big uses; VPN membership limits VPNs.</li>
<li>Verify in layers and troubleshoot from the Controller to the edge.</li>
</ul></div>
`,hi:`
<p>Yeh centralized control policy ki revision sheet hai: topology, VPN membership aur service chaining. Yeh centralized policy ke blueprint objectives ko support karti hai: policy types aur woh kahan chalti hain, lists, control policy, topologies, VPN membership, service chaining, activation aur verification.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Control policy summary">
<rect x="10" y="15" width="200" height="200" rx="10" fill="#bae6fd"/><text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="14">Build</text>
<text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="12">lists: site, VPN, prefix, TLOC</text><text x="110" y="95" text-anchor="middle" class="svg-muted" font-size="12">sequences: match, action</text><text x="110" y="120" text-anchor="middle" class="svg-muted" font-size="12">default action: reject</text><text x="110" y="145" text-anchor="middle" class="svg-muted" font-size="12">set: preference, tloc, service</text>
<rect x="225" y="15" width="200" height="200" rx="10" fill="#fde68a"/><text x="325" y="38" text-anchor="middle" class="svg-ink" font-size="14">Apply aur activate</text>
<text x="325" y="70" text-anchor="middle" class="svg-muted" font-size="12">apply-policy site-list</text><text x="325" y="95" text-anchor="middle" class="svg-muted" font-size="12">in: edges se Controller</text><text x="325" y="120" text-anchor="middle" class="svg-muted" font-size="12">out: Controller se edges</text><text x="325" y="145" text-anchor="middle" class="svg-muted" font-size="12">sirf ek active policy</text>
<rect x="440" y="15" width="190" height="200" rx="10" fill="#bbf7d0"/><text x="535" y="38" text-anchor="middle" class="svg-ink" font-size="14">Verify</text>
<text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">show running-config policy</text><text x="535" y="95" text-anchor="middle" class="svg-muted" font-size="12">show omp routes / tlocs</text><text x="535" y="120" text-anchor="middle" class="svg-muted" font-size="12">show omp services</text><text x="535" y="145" text-anchor="middle" class="svg-muted" font-size="12">show sdwan policy from-vsmart</text>
</svg><p class="cap">Build, apply, verify.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Chaar policy types ke naam batao aur kahan chalti hain (Controller ya edge).</li>
<li>Manager aur CLI mein site, VPN, prefix aur TLOC lists banao.</li>
<li>Route aur tloc sequences, accept ya reject, set preference, tloc aur service ke saath control policy likho.</li>
<li>Control policy ka default action aur uska asar batao.</li>
<li>Hub-and-spoke banao, partial mesh aur regions ka idea batao.</li>
<li>VPN membership policy aur service chaining samjhao, aur har ek ko kya chahiye.</li>
<li>Sahi direction ke saath policy apply karo aur Manager se activate karo.</li>
<li>Controller aur edge commands se verify karo, aur fixed order se troubleshoot karo.</li>
</ul>

<h3>Glossary</h3>
<dl class="terms">
<dt>Centralized policy</dt><dd>Manager object jo control, VPN membership, data aur application-aware policies bundle karta hai; ek waqt mein ek active.</dd>
<dt>Control policy</dt><dd>Controller par chalti hai; edges ke dekhne se pehle routes, TLOCs aur service routes badalti hai.</dd>
<dt>VPN membership policy</dt><dd>Controller policy jo limit karti hai ki site ko kaun se VPNs milte hain.</dd>
<dt>Data policy</dt><dd>Edges ko bheji gayi policy jo packets par kaam karti hai.</dd>
<dt>Application-aware routing policy</dt><dd>Edge policy jo SLA se path chunti hai.</dd>
<dt>Localized policy</dt><dd>Ek edge se attached policy: ACL, QoS, route policy.</dd>
<dt>List</dt><dd>Sites, VPNs, prefixes ya TLOCs ka reusable group.</dd>
<dt>Sequence</dt><dd>Policy ke andar ek numbered match aur action rule.</dd>
<dt>Default action</dt><dd>Jis update ko koi sequence match na kare uska kya hota hai; control policy ke liye reject.</dd>
<dt>Service chaining</dt><dd>Control policy aur advertised service route se routes ko firewall jaisi service se guzarna.</dd>
<dt>Direction</dt><dd>In: edges se Controller. Out: Controller se edges.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ol>
<li>Control policy aur VPN membership policy Controller par chalti hain aur edges ko push nahi hoti.</li>
<li>Data aur application-aware routing policies OMP se edges ko bheji jaati hain.</li>
<li>Default overlay full mesh hai; topologies jaankari hata kar banti hain.</li>
<li>Control policy ka default action reject hai.</li>
<li>TLOC list entry mein system IP, color aur encapsulation hota hai.</li>
<li>Direction Controller ke relative hai: in edges se, out edges ko.</li>
<li>Ek waqt mein sirf ek centralized policy active hoti hai.</li>
<li>Service chaining ko edge se advertised service aur set service wali control policy chahiye.</li>
<li>Locally hosted service chain ke saath control-policy service chaining supported nahi hai; same device par service chaining aur AppQoE supported nahi hain.</li>
</ol>

<h3>Click path aur command cheat-sheet</h3>
<pre class="code">Configuration &gt; Policies &gt; Centralized Policy &gt; Add Policy
  Create Groups of Interest &gt; Configure Topology and VPN Membership
  &gt; Configure Traffic Rules &gt; Apply Policies to Sites and VPNs &gt; Save Policy
Row menu (three dots) &gt; Activate | Deactivate

show running-config policy          (Controller)
show running-config apply-policy    (Controller)
show omp routes | tlocs | services  (Controller)
show sdwan omp routes | tlocs       (edge)
show sdwan bfd sessions             (edge)
show sdwan policy from-vsmart       (edge)</pre>

<div class="warn"><p><b>Yeh galtiyan revise karo.</b> Default reject ka chupke se routes hatana; TLOCs ke bina routes accept karna; galat direction; pilot na karna; control policy edge par dhundhna.</p></div>
<div class="exam"><p><b>Revise karne wala exam trap.</b> Agar sawal poochta hai ki control policy "kahan apply" hoti hai, to jawab Controller hai, site list se, direction ke saath. Agar poochta hai ki data policy "kahan kaam" karti hai, to jawab edge hai.</p></div>

<div class="scn"><h4>Nabbe minute ka rollout</h4><p>Ek retailer ne ek hi change window mein jo aapne seekha woh use kiya: 09:00 par lists review, 09:20 par pilot site list par hub-and-spoke policy out apply, 09:30 par TLOC tables aur BFD sessions se verification, 10:15 par saari branches tak widen. Ek site ek list se missing thi aur full mesh dikha rahi thi. Saat-sawal troubleshooting order ne use paanch minute mein dhundh liya.</p></div>

<div class="iv"><p class="q">"Do minute mein centralized control policy samjhao."</p><p>Strong answer: yeh Controller par chalti hai aur woh OMP routes, TLOCs aur service routes edit karti hai jo edges receive karte hain. Main sites, VPNs, prefixes aur TLOCs ki lists banata hoon, match aur action ke saath sequences likhta hoon, aur yaad rakhta hoon ki default action reject hai. Main ise hub-and-spoke jaisi topology aur service chaining ke liye use karta hoon, Controller ke relative in ya out ke saath site list par apply karta hoon, Centralized Policy page se activate karta hoon, phir Controller par show omp, edge par show sdwan omp aur BFD se verify karta hoon, aur deactivation plan rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Control policy Controller par rehti hai aur edges kya seekhte hain use shape karti hai.</li>
<li>Lists, sequences, default reject, direction ke saath apply-policy, activate.</li>
<li>Topology aur service chaining do bade use hain; VPN membership VPNs limit karti hai.</li>
<li>Layers mein verify karo aur Controller se edge ki taraf troubleshoot karo.</li>
</ul></div>
`}};export{e as default};