var e={id:`dci-l2-extension`,h:{en:`Data center interconnect: OTV vs EVPN Multi-Site and the risks of Layer 2 extension`,hi:`Data center interconnect: OTV vs EVPN Multi-Site aur Layer 2 extension ke risks`},body:{en:`

<p>Two cities linked by a bridge: the bridge is useful, but if it jams, both cities jam, and if a storm hits one city the traffic can flood into the other. Data center interconnect (DCI) is that bridge. The design question is not "can we stretch Layer 2?" (we can), but "which VLANs must be stretched, for how long, and what stops a problem from crossing?"</p>

<h3>The case: Pinnacle Credit Union</h3>
<div class="eg"><p><b>Customer.</b> Pinnacle Credit Union has two data centers 40 km apart on dark fibre. Around 900 VMs. Core banking runs active-standby, so a site move needs a live migration of VMs and cluster nodes.</p><p><b>Today.</b> Layer 2 is stretched with Cisco OTV on older Nexus 7000 edge devices; every VLAN is extended because it was easier.</p><p><b>Requirements.</b> Live migration for a six-month consolidation. Afterwards, active-active for web tiers and active-standby for databases. A failure in one site must not take down the other.</p><p><b>Constraints.</b> OTV hardware reaches end of life. The new fabrics at both sites are VXLAN EVPN on Nexus 9000. Latency 1 ms. Two diverse fibre paths.</p></div>

<h3>Options</h3>
<table class="cmp"><tr><th>Option</th><th>How it works</th><th>Strengths</th><th>Weaknesses</th></tr>
<tr><td>A. Keep OTV</td><td>MAC routing between edge devices over any IP network, IS-IS control plane</td><td>Proven, simple on legacy; STP is not extended; unknown unicast not flooded by default</td><td>A separate box and protocol; tied to old platforms; not integrated with the EVPN fabric</td></tr>
<tr><td>B. EVPN Multi-Site</td><td>Border gateways (BGW) join independent VXLAN EVPN fabrics with eBGP EVPN; VNIs are selectively stretched</td><td>One technology end to end, per-site failure domains, BUM and storm control at the BGW, Layer 3 is routed locally with anycast gateway</td><td>Needs Nexus 9000 BGW-capable platforms; design work on DCI underlay</td></tr>
<tr><td>C. No Layer 2 stretch</td><td>Layer 3 only, DNS or load-balancer based failover</td><td>Smallest blast radius</td><td>Needs re-IP or application change; not viable during migration</td></tr>
<tr><td>D. Stretched VLANs over dark fibre with vPC or STP</td><td>One Layer 2 domain, both sites</td><td>Cheap to start</td><td>One failure domain, STP across sites, loops cross cities</td></tr></table>

<h3>What a Multi-Site design contains</h3>
<p>Each site is a full fabric with its own underlay and its own BGP AS. <b>Border gateways (BGWs)</b> have two kinds of links: <b>fabric (site-internal) links</b> toward spines, and <b>DCI links</b> toward the other site. The BGW re-originates EVPN routes between sites (it is a "stitching" point), so a VTEP in site 1 does not tunnel directly to a leaf in site 2. BGWs can be a vPC pair or use anycast, and they track their links: if all DCI links drop, the BGW stops advertising and the site is isolated cleanly.</p>
<pre class="code"><span class="c">! Border gateway, abridged</span>
evpn multisite border-gateway 100
  delay-restore time 300
interface nve1
  multisite border-gateway interface loopback100
interface Ethernet1/1
  <span class="c">! toward the other site</span>
  evpn multisite dci-tracking
interface Ethernet1/2
  <span class="c">! toward the spines</span>
  evpn multisite fabric-tracking</pre>
<pre class="out">bgw-1# show nve multisite dci-links
Interface   State
Ethernet1/1 <span class="hl">Up</span>
bgw-1# show nve multisite fabric-links
Interface   State
Ethernet1/2 <span class="hl">Up</span></pre>

<p>For comparison, a minimal OTV edge looks like this (the overlay names the interface used to reach the other sites and which VLANs are extended):</p>
<pre class="code">feature otv
otv site-vlan 99
otv site-identifier 0x1
interface Overlay1
  otv join-interface Ethernet1/1
  otv control-group 239.1.1.1
  otv data-group 232.1.1.0/28
  otv extend-vlan 100-110</pre>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="EVPN Multi-Site: two fabrics joined by border gateways">
<rect x="10" y="8" width="250" height="190" rx="10" fill="#bbf7d0" fill-opacity="0.35" stroke="#64748b" stroke-dasharray="4 3"/><text x="18" y="24" class="svg-muted" font-size="12">Site 1 fabric</text>
<rect x="380" y="8" width="250" height="190" rx="10" fill="#bae6fd" fill-opacity="0.35" stroke="#64748b" stroke-dasharray="4 3"/><text x="388" y="24" class="svg-muted" font-size="12">Site 2 fabric</text>
<line x1="135" y1="52" x2="65" y2="102" stroke="#64748b" stroke-width="1.6"/>
<line x1="135" y1="52" x2="205" y2="102" stroke="#64748b" stroke-width="1.6"/>
<line x1="135" y1="52" x2="135" y2="152" stroke="#64748b" stroke-width="1.6"/>
<line x1="505" y1="52" x2="435" y2="102" stroke="#64748b" stroke-width="1.6"/>
<line x1="505" y1="52" x2="575" y2="102" stroke="#64748b" stroke-width="1.6"/>
<line x1="505" y1="52" x2="505" y2="152" stroke="#64748b" stroke-width="1.6"/>
<line x1="135" y1="152" x2="320" y2="110" stroke="#64748b" stroke-width="3"/>
<line x1="505" y1="152" x2="320" y2="110" stroke="#64748b" stroke-width="3"/>
<line x1="135" y1="152" x2="505" y2="152" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="5 4"/>
<rect x="92" y="35" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="98" y1="40" x2="172" y2="40" stroke="#16a34a" stroke-width="2"/><text x="135" y="56" text-anchor="middle" class="svg-ink" font-size="12">Spine</text>
<rect x="30" y="85" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="36" y1="114" x2="94" y2="114" stroke="#0284c7" stroke-width="2"/><text x="65" y="106" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="170" y="85" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="176" y1="114" x2="234" y2="114" stroke="#0284c7" stroke-width="2"/><text x="205" y="106" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="95" y="135" width="80" height="34" rx="7" fill="#fed7aa" stroke="#64748b"/><text x="135" y="156" text-anchor="middle" class="svg-ink" font-size="12">BGW</text>
<rect x="462" y="35" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="468" y1="40" x2="542" y2="40" stroke="#16a34a" stroke-width="2"/><text x="505" y="56" text-anchor="middle" class="svg-ink" font-size="12">Spine</text>
<rect x="400" y="85" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="406" y1="114" x2="464" y2="114" stroke="#0284c7" stroke-width="2"/><text x="435" y="106" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="540" y="85" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="546" y1="114" x2="604" y2="114" stroke="#0284c7" stroke-width="2"/><text x="575" y="106" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="465" y="135" width="80" height="34" rx="7" fill="#fed7aa" stroke="#64748b"/><text x="505" y="156" text-anchor="middle" class="svg-ink" font-size="12">BGW</text>
<ellipse cx="320" cy="110" rx="50" ry="21" fill="#fde68a" stroke="#64748b"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="12">DCI network</text>
<text x="320" y="176" text-anchor="middle" class="svg-muted" font-size="12">dashed red: L2 for chosen VNIs only</text>
<text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">eBGP EVPN between sites</text>
<line x1="16" y1="206" x2="624" y2="206" stroke="#e2e8f0"/><rect x="16" y="216" width="14" height="12" rx="2" fill="#bbf7d0" stroke="#64748b"/><text x="35" y="226" class="svg-muted" font-size="11">Spine</text><rect x="168" y="216" width="14" height="12" rx="2" fill="#bae6fd" stroke="#64748b"/><text x="187" y="226" class="svg-muted" font-size="11">Leaf / access</text><rect x="320" y="216" width="14" height="12" rx="2" fill="#fed7aa" stroke="#64748b"/><text x="339" y="226" class="svg-muted" font-size="11">Border / gateway</text><rect x="472" y="216" width="14" height="12" rx="2" fill="#fde68a" stroke="#64748b"/><text x="491" y="226" class="svg-muted" font-size="11">WAN / cloud</text>
</svg><p class="cap">Each site is its own failure domain. BGWs join them. Only chosen VNIs are extended at Layer 2.</p></div>

<h3>The risks of Layer 2 extension</h3>
<ul>
<li><b>Failure propagation:</b> broadcast storms and loops cross the DCI.</li>
<li><b>Tromboning:</b> traffic goes to a gateway in the other city and back; fix with a distributed gateway at each site and local egress.</li>
<li><b>Split brain:</b> clusters that think the other site is dead when only the DCI failed.</li>
<li><b>Stateful devices:</b> a firewall in site 1 cannot see the return path from site 2.</li>
<li><b>Bandwidth and latency:</b> vMotion and storage replication use the same link.</li>
</ul>
<p>Mitigations: stretch only named VNIs, enable ARP suppression and storm control for BUM at the BGW, keep the gateway local per site, use redundant DCI paths, and set a removal date for each stretched VLAN.</p>

<h3>Chosen design for Pinnacle</h3>
<p>EVPN Multi-Site with a BGW pair per site, two diverse DCI paths, and only the 11 VNIs that carry migrating VMs stretched. Web tiers use local anycast gateways. A migration calendar removes the stretch from each VLAN when its last VM has moved. OTV is decommissioned after the last cutover.</p>

<div class="warn"><p><b>Common mistakes.</b> Extending every VLAN "because it is easy". Using the same HSRP or anycast gateway MAC without thinking about egress. Treating the DCI as just another link and forgetting BUM limits.</p></div>
<div class="exam"><p><b>Exam trap.</b> OTV does not extend Spanning Tree; EVPN Multi-Site isolates each site's underlay and BGP AS. Neither design removes the application's latency and split-brain limits.</p></div>

<div class="scn"><h4>What went wrong at Pinnacle</h4><p>During a weekend change, a mis-patched cable created a loop inside site 1. Because the old OTV design extended 220 VLANs, the broadcast flood hit site 2 as well and both data centers slowed. In the new design a similar loop produced a storm-control alert at the BGW, only 11 VNIs were exposed, and site 2 was unaffected. The team also found that the cluster witness lived in site 1, which would have caused split brain; it was moved to a third location.</p><p><b>Lesson:</b> design the DCI so a local fault stays local.</p></div>

<div class="iv"><p class="q">"OTV or EVPN Multi-Site today?"</p><p>For a Nexus 9000 VXLAN EVPN fabric, EVPN Multi-Site: one control plane, per-site failure domains and selective stretching. OTV is a legacy option that can bridge to older platforms during migration. In both, minimise Layer 2 extension.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stretch the minimum number of VLANs or VNIs, for the shortest time.</li>
<li>OTV is MAC routing over IP; EVPN Multi-Site uses border gateways and eBGP EVPN.</li>
<li>BGWs have fabric links and DCI links, and track both.</li>
<li>Prevent tromboning with local gateways; prevent split brain with a third-site witness.</li>
</ul></div>

`,hi:`

<p>Do shehar ek bridge se jude hain: bridge kaam ki hai, par jam ho jaye to dono shehar jam, aur ek shehar mein toofan aaye to traffic doosre mein bah sakta hai. Data center interconnect (DCI) wahi bridge hai. Design ka sawaal "kya Layer 2 stretch kar sakte hain?" (haan) nahi hai, balki "kaunse VLANs stretch hone chahiye, kitne time ke liye, aur problem ko cross hone se kya rokta hai?"</p>

<h3>Case: Pinnacle Credit Union</h3>
<div class="eg"><p><b>Customer.</b> Pinnacle Credit Union ke do data centers dark fibre par 40 km door hain. Lagbhag 900 VMs. Core banking active-standby chalti hai, isliye site move ke liye VMs aur cluster nodes ka live migration chahiye.</p><p><b>Aaj.</b> Layer 2 purane Nexus 7000 edge devices par Cisco OTV se stretch hai; har VLAN extend hai kyunki aasan tha.</p><p><b>Requirements.</b> Chhe mahine ke consolidation ke liye live migration. Baad mein web tiers ke liye active-active aur databases ke liye active-standby. Ek site ki failure doosri ko na giraye.</p><p><b>Constraints.</b> OTV hardware end of life par hai. Dono sites ke naye fabrics Nexus 9000 par VXLAN EVPN hain. Latency 1 ms. Do diverse fibre paths.</p></div>

<h3>Options</h3>
<table class="cmp"><tr><th>Option</th><th>Kaise kaam karta hai</th><th>Strengths</th><th>Weaknesses</th></tr>
<tr><td>A. OTV rakho</td><td>Kisi bhi IP network par edge devices ke beech MAC routing, IS-IS control plane</td><td>Proven; STP extend nahi hota; unknown unicast default mein flood nahi hota</td><td>Alag box aur protocol; purane platforms se bandha; EVPN fabric se integrated nahi</td></tr>
<tr><td>B. EVPN Multi-Site</td><td>Border gateways (BGW) independent VXLAN EVPN fabrics ko eBGP EVPN se jodte hain; VNIs selectively stretch</td><td>Poora end-to-end ek technology, per-site failure domains, BGW par BUM aur storm control, anycast gateway se Layer 3 local route</td><td>BGW-capable Nexus 9000 platforms chahiye; DCI underlay ka design kaam</td></tr>
<tr><td>C. Layer 2 stretch nahi</td><td>Sirf Layer 3, DNS ya load-balancer based failover</td><td>Sabse chhota blast radius</td><td>Re-IP ya application change chahiye; migration mein viable nahi</td></tr>
<tr><td>D. Dark fibre par vPC ya STP se stretched VLANs</td><td>Ek Layer 2 domain, dono sites</td><td>Shuru mein sasta</td><td>Ek failure domain, sites ke across STP, loops shehron ke beech cross</td></tr></table>

<h3>Multi-Site design mein kya hota hai</h3>
<p>Har site apne underlay aur apne BGP AS wala poora fabric hai. <b>Border gateways (BGWs)</b> ke do tarah ke links hote hain: spines ki taraf <b>fabric (site-internal) links</b>, aur doosri site ki taraf <b>DCI links</b>. BGW sites ke beech EVPN routes re-originate karta hai ("stitching" point), isliye site 1 ka VTEP seedha site 2 ke leaf tak tunnel nahi banata. BGWs vPC pair ya anycast ho sakte hain aur apne links track karte hain: saare DCI links gir jaayein to BGW advertise karna band kar deta hai aur site saaf tareeke se isolate ho jaati hai.</p>
<pre class="code"><span class="c">! Border gateway, abridged</span>
evpn multisite border-gateway 100
  delay-restore time 300
interface nve1
  multisite border-gateway interface loopback100
interface Ethernet1/1
  <span class="c">! toward the other site</span>
  evpn multisite dci-tracking
interface Ethernet1/2
  <span class="c">! toward the spines</span>
  evpn multisite fabric-tracking</pre>
<pre class="out">bgw-1# show nve multisite dci-links
Interface   State
Ethernet1/1 <span class="hl">Up</span>
bgw-1# show nve multisite fabric-links
Interface   State
Ethernet1/2 <span class="hl">Up</span></pre>

<p>Comparison ke liye, minimal OTV edge aisa dikhta hai (overlay batata hai ki doosri sites tak kaunsa interface use hota hai aur kaunse VLANs extend hain):</p>
<pre class="code">feature otv
otv site-vlan 99
otv site-identifier 0x1
interface Overlay1
  otv join-interface Ethernet1/1
  otv control-group 239.1.1.1
  otv data-group 232.1.1.0/28
  otv extend-vlan 100-110</pre>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="EVPN Multi-Site: do fabrics border gateways se jude">
<rect x="10" y="8" width="250" height="190" rx="10" fill="#bbf7d0" fill-opacity="0.35" stroke="#64748b" stroke-dasharray="4 3"/><text x="18" y="24" class="svg-muted" font-size="12">Site 1 fabric</text>
<rect x="380" y="8" width="250" height="190" rx="10" fill="#bae6fd" fill-opacity="0.35" stroke="#64748b" stroke-dasharray="4 3"/><text x="388" y="24" class="svg-muted" font-size="12">Site 2 fabric</text>
<line x1="135" y1="52" x2="65" y2="102" stroke="#64748b" stroke-width="1.6"/>
<line x1="135" y1="52" x2="205" y2="102" stroke="#64748b" stroke-width="1.6"/>
<line x1="135" y1="52" x2="135" y2="152" stroke="#64748b" stroke-width="1.6"/>
<line x1="505" y1="52" x2="435" y2="102" stroke="#64748b" stroke-width="1.6"/>
<line x1="505" y1="52" x2="575" y2="102" stroke="#64748b" stroke-width="1.6"/>
<line x1="505" y1="52" x2="505" y2="152" stroke="#64748b" stroke-width="1.6"/>
<line x1="135" y1="152" x2="320" y2="110" stroke="#64748b" stroke-width="3"/>
<line x1="505" y1="152" x2="320" y2="110" stroke="#64748b" stroke-width="3"/>
<line x1="135" y1="152" x2="505" y2="152" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="5 4"/>
<rect x="92" y="35" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="98" y1="40" x2="172" y2="40" stroke="#16a34a" stroke-width="2"/><text x="135" y="56" text-anchor="middle" class="svg-ink" font-size="12">Spine</text>
<rect x="30" y="85" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="36" y1="114" x2="94" y2="114" stroke="#0284c7" stroke-width="2"/><text x="65" y="106" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="170" y="85" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="176" y1="114" x2="234" y2="114" stroke="#0284c7" stroke-width="2"/><text x="205" y="106" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="95" y="135" width="80" height="34" rx="7" fill="#fed7aa" stroke="#64748b"/><text x="135" y="156" text-anchor="middle" class="svg-ink" font-size="12">BGW</text>
<rect x="462" y="35" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="468" y1="40" x2="542" y2="40" stroke="#16a34a" stroke-width="2"/><text x="505" y="56" text-anchor="middle" class="svg-ink" font-size="12">Spine</text>
<rect x="400" y="85" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="406" y1="114" x2="464" y2="114" stroke="#0284c7" stroke-width="2"/><text x="435" y="106" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="540" y="85" width="70" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="546" y1="114" x2="604" y2="114" stroke="#0284c7" stroke-width="2"/><text x="575" y="106" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="465" y="135" width="80" height="34" rx="7" fill="#fed7aa" stroke="#64748b"/><text x="505" y="156" text-anchor="middle" class="svg-ink" font-size="12">BGW</text>
<ellipse cx="320" cy="110" rx="50" ry="21" fill="#fde68a" stroke="#64748b"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="12">DCI network</text>
<text x="320" y="176" text-anchor="middle" class="svg-muted" font-size="12">dashed red: sirf chune VNIs ka L2</text>
<text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">Sites ke beech eBGP EVPN</text>
<line x1="16" y1="206" x2="624" y2="206" stroke="#e2e8f0"/><rect x="16" y="216" width="14" height="12" rx="2" fill="#bbf7d0" stroke="#64748b"/><text x="35" y="226" class="svg-muted" font-size="11">Spine</text><rect x="168" y="216" width="14" height="12" rx="2" fill="#bae6fd" stroke="#64748b"/><text x="187" y="226" class="svg-muted" font-size="11">Leaf / access</text><rect x="320" y="216" width="14" height="12" rx="2" fill="#fed7aa" stroke="#64748b"/><text x="339" y="226" class="svg-muted" font-size="11">Border / gateway</text><rect x="472" y="216" width="14" height="12" rx="2" fill="#fde68a" stroke="#64748b"/><text x="491" y="226" class="svg-muted" font-size="11">WAN / cloud</text>
</svg><p class="cap">Har site apna failure domain hai. BGWs unhe jodte hain. Sirf chune hue VNIs Layer 2 par extend hote hain.</p></div>

<h3>Layer 2 extension ke risks</h3>
<ul>
<li><b>Failure propagation:</b> broadcast storms aur loops DCI cross karte hain.</li>
<li><b>Tromboning:</b> traffic doosre shehar ke gateway tak jaata aur wapas aata hai; fix: har site par distributed gateway aur local egress.</li>
<li><b>Split brain:</b> clusters sochte hain ki doosri site mar gayi jabki sirf DCI fail hua.</li>
<li><b>Stateful devices:</b> site 1 ka firewall site 2 se aane wala return path nahi dekh paata.</li>
<li><b>Bandwidth aur latency:</b> vMotion aur storage replication wahi link use karte hain.</li>
</ul>
<p>Mitigations: sirf named VNIs stretch karo, BGW par ARP suppression aur BUM ke liye storm control enable karo, gateway har site par local rakho, redundant DCI paths use karo, aur har stretched VLAN ki removal date set karo.</p>

<h3>Pinnacle ke liye chosen design</h3>
<p>Har site mein BGW pair ke saath EVPN Multi-Site, do diverse DCI paths, aur sirf woh 11 VNIs stretch jo migrating VMs carry karte hain. Web tiers local anycast gateways use karte hain. Migration calendar har VLAN ka stretch tab hataata hai jab uska aakhri VM move ho jaye. Aakhri cutover ke baad OTV decommission hota hai.</p>

<div class="warn"><p><b>Common mistakes.</b> "Aasan hai" kehkar har VLAN extend karna. Egress ke baare mein soche bina same HSRP ya anycast gateway MAC use karna. DCI ko aam link maanna aur BUM limits bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> OTV Spanning Tree extend nahi karta; EVPN Multi-Site har site ka underlay aur BGP AS isolate karta hai. Koi bhi design application ki latency aur split-brain limits hata nahi deta.</p></div>

<div class="scn"><h4>Pinnacle mein kya galat hua</h4><p>Weekend change mein ek mis-patched cable ne site 1 ke andar loop bana diya. Kyunki purana OTV design 220 VLANs extend karta tha, broadcast flood site 2 tak bhi pahunchi aur dono data centers slow ho gaye. Naye design mein aisi hi loop ne BGW par storm-control alert diya, sirf 11 VNIs exposed the, aur site 2 par asar nahi pada. Team ko yeh bhi mila ki cluster witness site 1 mein tha, jo split brain karta; use teesri location par move kiya gaya.</p><p><b>Lesson:</b> DCI aise design karo ki local fault local hi rahe.</p></div>

<div class="iv"><p class="q">"Aaj OTV ya EVPN Multi-Site?"</p><p>Nexus 9000 VXLAN EVPN fabric ke liye EVPN Multi-Site: ek control plane, per-site failure domains aur selective stretching. OTV legacy option hai jo migration mein purane platforms tak bridge kar sakta hai. Dono mein Layer 2 extension minimise karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kam se kam VLANs ya VNIs ko, kam se kam time ke liye stretch karo.</li>
<li>OTV IP par MAC routing hai; EVPN Multi-Site border gateways aur eBGP EVPN use karta hai.</li>
<li>BGWs ke fabric links aur DCI links hote hain, aur dono track hote hain.</li>
<li>Tromboning local gateways se, split brain teesri-site witness se roko.</li>
</ul></div>

`}};export{e as default};