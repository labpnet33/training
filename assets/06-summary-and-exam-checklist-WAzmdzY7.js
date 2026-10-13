var e={id:`summary-and-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The whole module in one picture</h3>
<p>Bharat Retail Co joins three cities with an overlay on top of the internet. MX-MUM is the hub, MX-BLR and MX-DEL are spokes. Each side marks which subnets join the VPN, each side needs a live uplink, and the dashboard introduces the devices to each other. When something breaks, you walk a fixed checklist from the bottom of the stack to the top.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="AutoVPN stack from uplink to licence">
<rect x="20" y="10" width="600" height="38" rx="6" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Uplink up (wan1 primary, wan2 backup, tunnel follows the active one)</text>
<rect x="20" y="56" width="600" height="38" rx="6" fill="#bbf7d0"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">Mode hub and spoke, hub in the spoke list (order = priority)</text>
<rect x="20" y="102" width="600" height="38" rx="6" fill="#ddd6fe"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">Subnets with Use VPN, no overlaps</text>
<rect x="20" y="148" width="600" height="38" rx="6" fill="#fde68a"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">Outbound UDP allowed upstream, licence valid</text>
<text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">All layers true: tunnel up. Then check firewall policy across the tunnel.</text>
</svg><p class="cap">Every condition must hold. The detail line in the tunnel table names the one that does not.</p></div>

<h3>Can-do checklist</h3>
<p>You should now be able to:</p>
<ul>
<li>Explain overlay and underlay, and compare hub-and-spoke (N - 1 tunnels) with full mesh (N x (N - 1) / 2).</li>
<li>Say what SD-WAN adds: central automation, health monitoring, failover and policy.</li>
<li>Set a hub (MX-MUM), set spokes (MX-BLR, MX-DEL), list the hub and choose subnets with Use VPN.</li>
<li>Explain why Guest (30) and Management (99) usually stay out of the VPN.</li>
<li>Recognise a subnet overlap conflict and fix it by renumbering or removing the subnet from the VPN.</li>
<li>Describe how a tunnel forms: registration, hub public IP, spoke outbound packets, NAT traversal.</li>
<li>List the six conditions for a tunnel to be up and the table line each failure produces.</li>
<li>Explain failover from wan1 to wan2 and why the tunnel re-forms with a new hub address.</li>
<li>Run the six-question workflow and prove real traffic after the fix.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Overlay / underlay</dt><dd>The private network drawn on top / the real internet circuits underneath.</dd>
<dt>Hub / spoke</dt><dd>The central VPN site / a site that builds a tunnel to the hub.</dd>
<dt>AutoVPN</dt><dd>Tunnel building coordinated by the cloud dashboard from a role choice.</dd>
<dt>SD-WAN</dt><dd>WAN over ordinary circuits with automation, monitoring, failover and policy.</dd>
<dt>Use VPN</dt><dd>The per-subnet choice that advertises it to other sites.</dd>
<dt>Subnet conflict</dt><dd>The same VPN subnet in two sites; not routed.</dd>
<dt>Uplink (wan1, wan2)</dt><dd>An internet connection of the MX; wan1 is primary.</dd>
<dt>Failover</dt><dd>Moving traffic to wan2 when wan1 is down.</dd>
<dt>NAT traversal</dt><dd>Starting traffic from inside so replies are allowed back through NAT.</dd>
<dt>Jitter</dt><dd>Variation in delay between packets.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Tunnels for N sites in hub-and-spoke</td><td>N - 1</td></tr>
<tr><td>Tunnels for N sites in full mesh</td><td>N x (N - 1) / 2</td></tr>
<tr><td>Hub priority</td><td>Order of the hub list; first is preferred</td></tr>
<tr><td>Subnets in the VPN</td><td>Only those with Use VPN yes</td></tr>
<tr><td>Overlapping VPN subnets</td><td>Flagged as conflict, not routed</td></tr>
<tr><td>What follows the active uplink</td><td>The tunnel (and the hub public IP)</td></tr>
<tr><td>Exact ports and licence tiers</td><td>Check the vendor documentation</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Tunnel from Bengaluru is down. Uplink is up, mode and list correct, Use VPN yes on VLAN 10, no conflict. The detail says "no response from peer". Answer: outbound UDP is blocked on one of the circuits; request the ISP or upstream owner to allow it. Not a dashboard fix.</p></div>
<div class="note"><p><b>What does this module change on the wire/policy?</b> Modes and hub lists decide who builds tunnels; Use VPN decides which routes are advertised; Uplinks decide which circuit carries them. None of these writes firewall rules, so verify policy separately.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Missing the hub list; enabling Guest or Management; overlapping subnets; testing failover with web only; stopping at "tunnel up" without testing traffic.</p></div>
<div class="exam"><p><b>Exam trap.</b> Read the question for the scope: one spoke down or all spokes down. The answer differs.</p></div>

<div class="scn"><h4>Quarter-end review</h4><p>Auditors asked how Bharat Retail Co proves that guests cannot reach servers across the VPN. The engineer showed that VLAN 30 has Use VPN no, the firewall order denies guests, and a test from a guest phone fails with hits on the deny rule.</p><p><b>Lesson:</b> a good design is explainable with three screenshots: VPN subnets, firewall order and a test result.</p></div>

<div class="iv"><p class="q">"Summarise how you would build and support site-to-site connectivity for 40 stores."</p><p>Strong answer: hub-and-spoke with two hubs for resilience, unique address plan per site, only needed subnets in the VPN, dual uplinks at hubs from different ISPs, monitoring alerts for tunnel and uplink, and the six-question workflow for incidents.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hub-and-spoke: MX-MUM hub, MX-BLR and MX-DEL spokes.</li>
<li>Six conditions: uplink, modes and hub list, subnets, no conflict, UDP, licence.</li>
<li>The tunnel follows the active uplink.</li>
<li>Always verify real traffic and firewall policy after the fix.</li>
<li>Ports and licence details come from the vendor documentation.</li>
</ul></div>
`,hi:`
<h3>Poora module ek picture mein</h3>
<p>Bharat Retail Co teen cities ko internet ke upar overlay se jodta hai. MX-MUM hub hai, MX-BLR aur MX-DEL spokes. Har side batati hai kaunse subnets VPN mein jaayenge, har side ko live uplink chahiye, aur dashboard devices ka ek dusre se parichay karata hai. Jab kuch toote, aap fixed checklist stack ke neeche se upar chalte ho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Uplink se licence tak AutoVPN stack">
<rect x="20" y="10" width="600" height="38" rx="6" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Uplink up (wan1 primary, wan2 backup, tunnel active wale ko follow karta hai)</text>
<rect x="20" y="56" width="600" height="38" rx="6" fill="#bbf7d0"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">Mode hub aur spoke, spoke list mein hub (order = priority)</text>
<rect x="20" y="102" width="600" height="38" rx="6" fill="#ddd6fe"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">Use VPN wale subnets, koi overlap nahi</text>
<rect x="20" y="148" width="600" height="38" rx="6" fill="#fde68a"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">Upstream outbound UDP allowed, licence valid</text>
<text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">Saari layers true: tunnel up. Phir tunnel ke across firewall policy check karo.</text>
</svg><p class="cap">Har condition hold karni chahiye. Tunnel table ki detail line woh batati hai jo hold nahi karti.</p></div>

<h3>Can-do checklist</h3>
<p>Ab aap yeh kar paane chahiye:</p>
<ul>
<li>Overlay aur underlay samjhana, aur hub-and-spoke (N - 1 tunnels) ko full mesh (N x (N - 1) / 2) se compare karna.</li>
<li>Batana ki SD-WAN kya add karta hai: central automation, health monitoring, failover aur policy.</li>
<li>Hub (MX-MUM) set karna, spokes (MX-BLR, MX-DEL) set karna, hub list karna aur Use VPN ke saath subnets chunna.</li>
<li>Samjhana ki Guest (30) aur Management (99) aam taur par VPN se bahar kyun rehte hain.</li>
<li>Subnet overlap conflict pehchaanna aur renumber karke ya subnet ko VPN se hatakar fix karna.</li>
<li>Tunnel kaise banta hai batana: registration, hub public IP, spoke ke outbound packets, NAT traversal.</li>
<li>Tunnel up hone ki chhe conditions aur har failure se banne wali table line batana.</li>
<li>wan1 se wan2 failover aur naye hub address ke saath tunnel ka re-form hona samjhana.</li>
<li>Chhe-sawal workflow chalana aur fix ke baad real traffic prove karna.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Overlay / underlay</dt><dd>Upar draw kiya private network / neeche ke asli internet circuits.</dd>
<dt>Hub / spoke</dt><dd>Central VPN site / woh site jo hub tak tunnel banati hai.</dd>
<dt>AutoVPN</dt><dd>Role choice se cloud dashboard dwara coordinate kiya gaya tunnel building.</dd>
<dt>SD-WAN</dt><dd>Normal circuits par WAN, automation, monitoring, failover aur policy ke saath.</dd>
<dt>Use VPN</dt><dd>Per-subnet choice jo use doosri sites ko advertise karta hai.</dd>
<dt>Subnet conflict</dt><dd>Do sites mein ek hi VPN subnet; route nahi hota.</dd>
<dt>Uplink (wan1, wan2)</dt><dd>MX ka internet connection; wan1 primary hai.</dd>
<dt>Failover</dt><dd>wan1 down hone par traffic wan2 par le jaana.</dd>
<dt>NAT traversal</dt><dd>Andar se traffic shuru karna taaki replies NAT se wapas allowed hon.</dd>
<dt>Jitter</dt><dd>Packets ke beech delay ka utar-chadhav.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Sawal</th><th>Jawab</th></tr>
<tr><td>Hub-and-spoke mein N sites ke tunnels</td><td>N - 1</td></tr>
<tr><td>Full mesh mein N sites ke tunnels</td><td>N x (N - 1) / 2</td></tr>
<tr><td>Hub priority</td><td>Hub list ka order; pehla preferred</td></tr>
<tr><td>VPN mein subnets</td><td>Sirf jinpar Use VPN yes</td></tr>
<tr><td>Overlapping VPN subnets</td><td>Conflict flag, route nahi hote</td></tr>
<tr><td>Active uplink ko kya follow karta hai</td><td>Tunnel (aur hub public IP)</td></tr>
<tr><td>Exact ports aur licence tiers</td><td>Vendor documentation check karo</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Bengaluru se tunnel down hai. Uplink up hai, mode aur list sahi, VLAN 10 par Use VPN yes, conflict nahi. Detail kehti hai "no response from peer". Jawab: kisi circuit par outbound UDP block hai; ISP ya upstream owner se allow karne ko kaho. Yeh dashboard fix nahi hai.</p></div>
<div class="note"><p><b>Is module se wire/policy par kya badalta hai?</b> Modes aur hub lists decide karti hain kaun tunnels banata hai; Use VPN decide karta hai kaunse routes advertise hon; Uplinks decide karte hain kaunsa circuit unhe carry kare. Inmein se koi firewall rules nahi likhta, isliye policy alag se verify karo.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Hub list chhoot jaana; Guest ya Management enable karna; overlapping subnets; failover ko sirf web se test karna; traffic test kiye bina "tunnel up" par ruk jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal mein scope padho: ek spoke down ya saare spokes down. Jawab alag hota hai.</p></div>

<div class="scn"><h4>Quarter-end review</h4><p>Auditors ne poocha ki Bharat Retail Co kaise prove karta hai ki guests VPN ke across servers tak nahi pahunch sakte. Engineer ne dikhaya ki VLAN 30 par Use VPN no hai, firewall order guests ko deny karta hai, aur guest phone se test fail hota hai aur deny rule par hits aate hain.</p><p><b>Seekh:</b> achha design teen screenshots se explain hota hai: VPN subnets, firewall order aur ek test result.</p></div>

<div class="iv"><p class="q">"40 stores ke liye site-to-site connectivity kaise banaoge aur support karoge, short mein batao."</p><p>Strong answer: resilience ke liye do hubs ke saath hub-and-spoke, har site ka unique address plan, VPN mein sirf zaroori subnets, hubs par alag ISPs ke dual uplinks, tunnel aur uplink ke liye monitoring alerts, aur incidents ke liye chhe-sawal workflow.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hub-and-spoke: MX-MUM hub, MX-BLR aur MX-DEL spokes.</li>
<li>Chhe conditions: uplink, modes aur hub list, subnets, no conflict, UDP, licence.</li>
<li>Tunnel active uplink ko follow karta hai.</li>
<li>Fix ke baad hamesha real traffic aur firewall policy verify karo.</li>
<li>Ports aur licence details vendor documentation se aate hain.</li>
</ul></div>
`}};export{e as default};