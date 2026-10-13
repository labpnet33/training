var e={id:`dc-physical-design`,h:{en:`Data center physical design: three-tier vs spine-leaf, oversubscription, sizing, cabling and optics`,hi:`Data center physical design: three-tier vs spine-leaf, oversubscription, sizing, cabling aur optics`},body:{en:`

<p>Think of a city. The old design was one tall office tower: every visitor takes the lift to the right floor. A spine-leaf design is a grid of streets: every neighbourhood has the same number of roads to every other neighbourhood, so traffic never has to queue for one lift. In this chapter we design the physical and logical shape of a data center the way a DCID candidate must: start from the customer, not from the product.</p>

<h3>What you will learn</h3>
<ul>
<li>Compare three-tier and spine-leaf designs and say when each is right.</li>
<li>Calculate oversubscription and size leaves, spines and uplinks.</li>
<li>Choose top-of-rack (ToR), end-of-row (EoR) or middle-of-row (MoR) cabling.</li>
<li>Match optics and cables to distance, speed and fibre type.</li>
</ul>
<h3>Prerequisites</h3>
<p>You should know what a VLAN, a port-channel, a Layer 3 interface and ECMP are, and the basic Nexus 9000 family. DCID asks you to <b>evaluate and justify</b>, not to type commands, so every chapter is built as a design case.</p>

<h3>The case: Ashford Regional Bank</h3>
<div class="eg"><p><b>Customer.</b> Ashford Regional Bank, one data center hall with 32 racks. About 640 servers (20 per rack), most dual-homed, a core banking cluster, a card-payment zone and a nightly backup that moves 40 TB.</p><p><b>Today.</b> A three-tier network: access switches with 10G server ports, aggregation pairs, a core pair. Spanning Tree blocks half the uplinks. Backup traffic fills the aggregation uplinks every night.</p><p><b>Requirements.</b> Servers move to 25G. East-west traffic (app to database, backup, analytics) is now 80 percent of the total. Growth of 50 percent in five years. No outage during migration.</p><p><b>Constraints.</b> Power is 8 kW per rack. Longest leaf-to-spine run is 60 m. Budget for one spine-leaf fabric plus re-cabling. Staff know vPC but not VXLAN yet.</p></div>

<h3>Options</h3>
<table class="cmp"><tr><th>Option</th><th>Strength</th><th>Weakness</th></tr>
<tr><td>A. Keep three-tier, upgrade to 25G/100G</td><td>Familiar, least change</td><td>STP or vPC limits; oversubscription grows with every tier; hop count differs per path</td></tr>
<tr><td>B. Spine-leaf with ToR leaves</td><td>Equal paths, ECMP, scale by adding leaves</td><td>More switches to manage (controller or automation needed)</td></tr>
<tr><td>C. Spine-leaf with EoR leaves</td><td>Fewer switches and licences</td><td>Long server cables, bulky cable trays, bigger blast radius per switch</td></tr></table>

<h3>Key ideas</h3>
<p><b>Three-tier</b> has access, aggregation and core layers. It suits north-south traffic (clients to servers) but the number of hops depends on where two servers sit. <b>Spine-leaf</b> (a Clos design) has two layers: every leaf connects to every spine, servers connect only to leaves, so any two servers on different leaves are exactly two switch hops apart and ECMP uses all links.</p>
<p><b>Oversubscription</b> is server-facing bandwidth divided by uplink bandwidth. A leaf with 48 x 25G down (1200G) and 6 x 100G up (600G) is 2:1. Banks often design 1.5:1 to 3:1 for general servers and 1:1 for storage or heavy compute.</p>
<div class="eg"><p><b>Worked sizing.</b> Each rack has 20 servers, each with two 25G ports, one to each leaf of a pair. Each leaf therefore has 20 x 25G = 500G down. With 4 spines and one 100G link to each, uplink is 400G. Ratio: 500 / 400 = 1.25:1. Leaves needed: 32 racks x 2 = 64 leaf switches, plus 2 border leaves. Each spine needs at least 66 ports, and more for growth; choose a spine with 96 or more 100G-capable ports. The maximum leaf count equals the number of spine ports, so choose spines for the five-year number, not today's.</p></div>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Spine-leaf fabric: every leaf connects to every spine">
<line x1="200" y1="40" x2="90" y2="120" stroke="#64748b" stroke-width="1.6"/>
<line x1="200" y1="40" x2="250" y2="120" stroke="#64748b" stroke-width="1.6"/>
<line x1="200" y1="40" x2="390" y2="120" stroke="#64748b" stroke-width="1.6"/>
<line x1="200" y1="40" x2="550" y2="120" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="40" x2="90" y2="120" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="40" x2="250" y2="120" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="40" x2="390" y2="120" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="40" x2="550" y2="120" stroke="#64748b" stroke-width="1.6"/>
<line x1="90" y1="120" x2="90" y2="205" stroke="#64748b" stroke-width="1.6"/>
<line x1="250" y1="120" x2="250" y2="205" stroke="#64748b" stroke-width="1.6"/>
<line x1="390" y1="120" x2="390" y2="205" stroke="#64748b" stroke-width="1.6"/>
<line x1="550" y1="120" x2="550" y2="170" stroke="#64748b" stroke-width="1.6"/>
<line x1="550" y1="170" x2="550" y2="225" stroke="#64748b" stroke-width="1.6"/>
<rect x="157" y="23" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="163" y1="28" x2="237" y2="28" stroke="#16a34a" stroke-width="2"/><text x="200" y="44" text-anchor="middle" class="svg-ink" font-size="12">Spine 1</text>
<rect x="397" y="23" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="403" y1="28" x2="477" y2="28" stroke="#16a34a" stroke-width="2"/><text x="440" y="44" text-anchor="middle" class="svg-ink" font-size="12">Spine 2</text>
<rect x="30" y="103" width="120" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="36" y1="132" x2="144" y2="132" stroke="#0284c7" stroke-width="2"/><text x="90" y="124" text-anchor="middle" class="svg-ink" font-size="12">Leaf 1 (ToR)</text>
<rect x="190" y="103" width="120" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="196" y1="132" x2="304" y2="132" stroke="#0284c7" stroke-width="2"/><text x="250" y="124" text-anchor="middle" class="svg-ink" font-size="12">Leaf 2 (ToR)</text>
<rect x="347" y="103" width="86" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="353" y1="132" x2="427" y2="132" stroke="#0284c7" stroke-width="2"/><text x="390" y="124" text-anchor="middle" class="svg-ink" font-size="12">Leaf 3</text>
<rect x="502.5" y="103" width="95" height="34" rx="7" fill="#fed7aa" stroke="#64748b"/><text x="550" y="124" text-anchor="middle" class="svg-ink" font-size="12">Border leaf</text>
<rect x="28" y="188" width="124" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="32" y="192" width="6" height="26" fill="#94a3b8"/><text x="90" y="209" text-anchor="middle" class="svg-ink" font-size="12">Rack 1 servers</text>
<rect x="188" y="188" width="124" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="192" y="192" width="6" height="26" fill="#94a3b8"/><text x="250" y="209" text-anchor="middle" class="svg-ink" font-size="12">Rack 2 servers</text>
<rect x="347" y="188" width="86" height="34" fill="#ddd6fe" stroke="#64748b"/><ellipse cx="390" cy="188" rx="43" ry="6" fill="#ddd6fe" stroke="#64748b"/><ellipse cx="390" cy="222" rx="43" ry="6" fill="#ddd6fe" stroke="#64748b"/><rect x="348" y="221" width="84" height="2" fill="#ddd6fe"/><text x="390" y="209" text-anchor="middle" class="svg-ink" font-size="12">Storage</text>
<rect x="507" y="153" width="86" height="34" rx="7" fill="#fecaca" stroke="#64748b"/><line x1="511" y1="170" x2="589" y2="170" stroke="#dc2626" stroke-width="1" stroke-opacity="0.5"/><line x1="535.6666666666666" y1="155" x2="535.6666666666666" y2="170" stroke="#dc2626" stroke-opacity="0.5"/><line x1="564.3333333333334" y1="170" x2="564.3333333333334" y2="185" stroke="#dc2626" stroke-opacity="0.5"/><text x="550" y="174" text-anchor="middle" class="svg-ink" font-size="12">Firewall</text>
<ellipse cx="550" cy="225" rx="40" ry="21" fill="#fde68a" stroke="#64748b"/><text x="550" y="229" text-anchor="middle" class="svg-ink" font-size="12">WAN</text>
<text x="16" y="46" text-anchor="start" class="svg-muted" font-size="12">Every leaf to every spine</text>
<text x="96" y="166" text-anchor="start" class="svg-muted" font-size="12">25G down</text>
<text x="16" y="62" text-anchor="start" class="svg-muted" font-size="12">100G up</text>
<line x1="16" y1="236" x2="624" y2="236" stroke="#e2e8f0"/><rect x="16" y="246" width="14" height="12" rx="2" fill="#bbf7d0" stroke="#64748b"/><text x="35" y="256" class="svg-muted" font-size="11">Spine</text><rect x="102.85714285714286" y="246" width="14" height="12" rx="2" fill="#bae6fd" stroke="#64748b"/><text x="121.85714285714286" y="256" class="svg-muted" font-size="11">Leaf / access</text><rect x="189.71428571428572" y="246" width="14" height="12" rx="2" fill="#fed7aa" stroke="#64748b"/><text x="208.71428571428572" y="256" class="svg-muted" font-size="11">Border / gateway</text><rect x="276.57142857142856" y="246" width="14" height="12" rx="2" fill="#e2e8f0" stroke="#64748b"/><text x="295.57142857142856" y="256" class="svg-muted" font-size="11">Server / host</text><rect x="363.42857142857144" y="246" width="14" height="12" rx="2" fill="#ddd6fe" stroke="#64748b"/><text x="382.42857142857144" y="256" class="svg-muted" font-size="11">Storage</text><rect x="450.28571428571433" y="246" width="14" height="12" rx="2" fill="#fecaca" stroke="#64748b"/><text x="469.28571428571433" y="256" class="svg-muted" font-size="11">Firewall</text><rect x="537.1428571428571" y="246" width="14" height="12" rx="2" fill="#fde68a" stroke="#64748b"/><text x="556.1428571428571" y="256" class="svg-muted" font-size="11">WAN / cloud</text>
</svg><p class="cap">Spine-leaf: two spines and leaves, 25G toward servers, 100G toward spines. The border leaf carries the firewall and WAN. Add capacity by adding spines (bandwidth) or leaves (ports).</p></div>

<h3>ToR, EoR and MoR cabling</h3>
<p><b>ToR:</b> a small switch (or a pair) in every rack. Server cables are short copper DAC (direct attach copper) or AOC (active optical cable). Only a few uplink fibres leave the rack. <b>EoR:</b> big switches at the end of the row; every server cable runs to them over structured cabling, so you manage fewer switches but more copper and cooling obstacles. <b>MoR:</b> the same as EoR but in the middle of the row, which halves the longest run. For Ashford, with 8 kW racks and 25G servers, ToR is the right answer.</p>
<h3>Optics: pick by distance</h3>
<table class="cmp"><tr><th>Link</th><th>Typical choice</th><th>Rough reach</th></tr>
<tr><td>Server to ToR in the same rack</td><td>25G passive DAC</td><td>up to about 3 to 5 m</td></tr>
<tr><td>Server to leaf in the next rack</td><td>25G AOC or SR optic</td><td>to tens of metres</td></tr>
<tr><td>Leaf to spine inside the hall</td><td>100G SR optic on OM4 multimode</td><td>about 100 m</td></tr>
<tr><td>Between buildings</td><td>100G LR single-mode</td><td>up to 10 km</td></tr></table>
<p>Always check the data sheet and the Cisco transceiver compatibility matrix for the exact reach on OM3, OM4 and OS2.</p>

<h3>Chosen design and why</h3>
<p>Ashford gets option B: 64 ToR leaves in vPC-style pairs, 4 spines, 2 border leaves, 1.25:1 at the rack. Why: equal paths remove STP, backup traffic is spread by ECMP, and capacity grows leaf by leaf. Single-mode and multimode were mixed: OM4 inside the hall.</p>
<pre class="out">leaf-101# show port-channel summary
Group Port-Channel Type Protocol Member Ports
1     Po1(SU)      Eth  LACP     Eth1/49(P) Eth1/50(P)
<span class="hl">leaf-101# show interface ethernet1/49 transceiver</span></pre>

<div class="warn"><p><b>Common mistake.</b> Sizing spines for today's leaf count. You cannot add a fifth spine to a leaf that has only four uplinks without re-cabling every leaf. Also mix up airflow: a switch with port-side intake in a hot-aisle rack recirculates hot air.</p></div>
<div class="exam"><p><b>Exam trap.</b> Oversubscription is calculated per leaf from provisioned ports, not total server count. And spine-leaf does not remove the need for redundancy at the server: dual-homing still needs vPC or EVPN multihoming.</p></div>

<div class="scn"><h4>What went wrong at Ashford</h4><p>After go-live, 120 servers in rows 3 and 4 would not link up. The team had ordered 3 m DAC cables, but the leaf for those servers sat in the neighbouring rack, 7 m away. DAC is distance-limited, so links stayed down. A second problem: leaves were ordered with port-side exhaust in a cold-aisle design, so hot air fed the neighbours and two leaves overheated. The fix was AOC cables for the longer runs and reversing the fans.</p><p><b>Lesson:</b> design the physical layer as carefully as the protocols: reach, airflow and power belong in the design document.</p></div>

<div class="iv"><p class="q">"Why spine-leaf over three-tier?"</p><p>Predictable two-hop east-west paths, all links forwarding with ECMP, scale by adding leaves, and a smaller failure domain per switch. Mention that three-tier is still fine for small or north-south sites.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Spine-leaf gives equal-cost two-hop paths; three-tier suits small or north-south designs.</li>
<li>Oversubscription = downlink bandwidth / uplink bandwidth, per leaf.</li>
<li>Maximum leaf count = spine port count; size spines for growth.</li>
<li>ToR is the default; EoR and MoR trade cabling for fewer switches.</li>
<li>Choose optics by distance and fibre type, and verify airflow direction.</li>
</ul></div>

`,hi:`

<p>Ek shehar socho. Purana design ek lamba office tower tha: har visitor lift se sahi floor par jaata hai. Spine-leaf design streets ka grid hai: har mohalle se doosre mohalle tak same number of roads hain, isliye traffic ko ek lift ke liye queue nahi lagani padti. Is chapter mein hum data center ka physical aur logical shape DCID candidate ki tarah design karte hain: customer se shuru karo, product se nahi.</p>

<h3>What you will learn</h3>
<ul>
<li>Three-tier aur spine-leaf designs ko compare karna aur batana ki kab kaunsa sahi hai.</li>
<li>Oversubscription calculate karna aur leaves, spines aur uplinks ka size nikalna.</li>
<li>Top-of-rack (ToR), end-of-row (EoR) ya middle-of-row (MoR) cabling chunna.</li>
<li>Distance, speed aur fibre type ke hisaab se optics aur cables match karna.</li>
</ul>
<h3>Prerequisites</h3>
<p>Aapko VLAN, port-channel, Layer 3 interface aur ECMP pata hona chahiye, aur Nexus 9000 family ki basic jaankari. DCID aapse <b>evaluate aur justify</b> karwata hai, commands type karwana nahi, isliye har chapter ek design case ke roop mein bana hai.</p>

<h3>Case: Ashford Regional Bank</h3>
<div class="eg"><p><b>Customer.</b> Ashford Regional Bank, ek data center hall jisme 32 racks hain. Lagbhag 640 servers (har rack mein 20), zyadatar dual-homed, ek core banking cluster, card-payment zone aur nightly backup jo 40 TB move karta hai.</p><p><b>Aaj.</b> Three-tier network: 10G server ports wale access switches, aggregation pairs, ek core pair. Spanning Tree aadhe uplinks block karta hai. Backup traffic har raat aggregation uplinks bhar deta hai.</p><p><b>Requirements.</b> Servers 25G par jaayenge. East-west traffic (app se database, backup, analytics) ab total ka 80 percent hai. Paanch saal mein 50 percent growth. Migration ke dauraan outage nahi.</p><p><b>Constraints.</b> Power 8 kW per rack. Sabse lamba leaf-to-spine run 60 m. Budget ek spine-leaf fabric aur re-cabling ka. Staff vPC jaanta hai par abhi VXLAN nahi.</p></div>

<h3>Options</h3>
<table class="cmp"><tr><th>Option</th><th>Strength</th><th>Weakness</th></tr>
<tr><td>A. Three-tier rakho, 25G/100G upgrade</td><td>Familiar, sabse kam change</td><td>STP ya vPC limits; har tier ke saath oversubscription badhta hai; path ke hisaab se hop count alag</td></tr>
<tr><td>B. ToR leaves ke saath spine-leaf</td><td>Equal paths, ECMP, leaf jodkar scale</td><td>Zyada switches manage karne padte hain (controller ya automation chahiye)</td></tr>
<tr><td>C. EoR leaves ke saath spine-leaf</td><td>Kam switches aur licences</td><td>Lambe server cables, bhaari cable trays, har switch ka bada blast radius</td></tr></table>

<h3>Key ideas</h3>
<p><b>Three-tier</b> mein access, aggregation aur core layers hote hain. Yeh north-south traffic (clients se servers) ke liye theek hai, lekin do servers kahan baithe hain us par hop count nirbhar karta hai. <b>Spine-leaf</b> (Clos design) mein do layers hain: har leaf har spine se judta hai, servers sirf leaves se, isliye alag leaves ke do servers ke beech exactly do switch hops hote hain aur ECMP saare links use karta hai.</p>
<p><b>Oversubscription</b> matlab server-facing bandwidth ko uplink bandwidth se divide karna. 48 x 25G down (1200G) aur 6 x 100G up (600G) wala leaf 2:1 hai. Banks aam servers ke liye aksar 1.5:1 se 3:1 aur storage ya heavy compute ke liye 1:1 design karte hain.</p>
<div class="eg"><p><b>Worked sizing.</b> Har rack mein 20 servers, har ek ke do 25G ports, pair ke har leaf par ek. Isliye har leaf par 20 x 25G = 500G down. 4 spines aur har ek se ek 100G link ke saath uplink 400G. Ratio: 500 / 400 = 1.25:1. Leaves chahiye: 32 racks x 2 = 64 leaf switches, plus 2 border leaves. Har spine ko kam se kam 66 ports chahiye, growth ke liye zyada; 96 ya zyada 100G-capable ports wala spine chuno. Maximum leaf count spine ports ke barabar hota hai, isliye spines ko paanch saal ke number ke liye size karo, aaj ke liye nahi.</p></div>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Spine-leaf fabric: har leaf har spine se connected">
<line x1="200" y1="40" x2="90" y2="120" stroke="#64748b" stroke-width="1.6"/>
<line x1="200" y1="40" x2="250" y2="120" stroke="#64748b" stroke-width="1.6"/>
<line x1="200" y1="40" x2="390" y2="120" stroke="#64748b" stroke-width="1.6"/>
<line x1="200" y1="40" x2="550" y2="120" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="40" x2="90" y2="120" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="40" x2="250" y2="120" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="40" x2="390" y2="120" stroke="#64748b" stroke-width="1.6"/>
<line x1="440" y1="40" x2="550" y2="120" stroke="#64748b" stroke-width="1.6"/>
<line x1="90" y1="120" x2="90" y2="205" stroke="#64748b" stroke-width="1.6"/>
<line x1="250" y1="120" x2="250" y2="205" stroke="#64748b" stroke-width="1.6"/>
<line x1="390" y1="120" x2="390" y2="205" stroke="#64748b" stroke-width="1.6"/>
<line x1="550" y1="120" x2="550" y2="170" stroke="#64748b" stroke-width="1.6"/>
<line x1="550" y1="170" x2="550" y2="225" stroke="#64748b" stroke-width="1.6"/>
<rect x="157" y="23" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="163" y1="28" x2="237" y2="28" stroke="#16a34a" stroke-width="2"/><text x="200" y="44" text-anchor="middle" class="svg-ink" font-size="12">Spine 1</text>
<rect x="397" y="23" width="86" height="34" rx="7" fill="#bbf7d0" stroke="#64748b"/><line x1="403" y1="28" x2="477" y2="28" stroke="#16a34a" stroke-width="2"/><text x="440" y="44" text-anchor="middle" class="svg-ink" font-size="12">Spine 2</text>
<rect x="30" y="103" width="120" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="36" y1="132" x2="144" y2="132" stroke="#0284c7" stroke-width="2"/><text x="90" y="124" text-anchor="middle" class="svg-ink" font-size="12">Leaf 1 (ToR)</text>
<rect x="190" y="103" width="120" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="196" y1="132" x2="304" y2="132" stroke="#0284c7" stroke-width="2"/><text x="250" y="124" text-anchor="middle" class="svg-ink" font-size="12">Leaf 2 (ToR)</text>
<rect x="347" y="103" width="86" height="34" rx="7" fill="#bae6fd" stroke="#64748b"/><line x1="353" y1="132" x2="427" y2="132" stroke="#0284c7" stroke-width="2"/><text x="390" y="124" text-anchor="middle" class="svg-ink" font-size="12">Leaf 3</text>
<rect x="502.5" y="103" width="95" height="34" rx="7" fill="#fed7aa" stroke="#64748b"/><text x="550" y="124" text-anchor="middle" class="svg-ink" font-size="12">Border leaf</text>
<rect x="28" y="188" width="124" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="32" y="192" width="6" height="26" fill="#94a3b8"/><text x="90" y="209" text-anchor="middle" class="svg-ink" font-size="12">Rack 1 servers</text>
<rect x="188" y="188" width="124" height="34" rx="3" fill="#e2e8f0" stroke="#64748b"/><rect x="192" y="192" width="6" height="26" fill="#94a3b8"/><text x="250" y="209" text-anchor="middle" class="svg-ink" font-size="12">Rack 2 servers</text>
<rect x="347" y="188" width="86" height="34" fill="#ddd6fe" stroke="#64748b"/><ellipse cx="390" cy="188" rx="43" ry="6" fill="#ddd6fe" stroke="#64748b"/><ellipse cx="390" cy="222" rx="43" ry="6" fill="#ddd6fe" stroke="#64748b"/><rect x="348" y="221" width="84" height="2" fill="#ddd6fe"/><text x="390" y="209" text-anchor="middle" class="svg-ink" font-size="12">Storage</text>
<rect x="507" y="153" width="86" height="34" rx="7" fill="#fecaca" stroke="#64748b"/><line x1="511" y1="170" x2="589" y2="170" stroke="#dc2626" stroke-width="1" stroke-opacity="0.5"/><line x1="535.6666666666666" y1="155" x2="535.6666666666666" y2="170" stroke="#dc2626" stroke-opacity="0.5"/><line x1="564.3333333333334" y1="170" x2="564.3333333333334" y2="185" stroke="#dc2626" stroke-opacity="0.5"/><text x="550" y="174" text-anchor="middle" class="svg-ink" font-size="12">Firewall</text>
<ellipse cx="550" cy="225" rx="40" ry="21" fill="#fde68a" stroke="#64748b"/><text x="550" y="229" text-anchor="middle" class="svg-ink" font-size="12">WAN</text>
<text x="16" y="46" text-anchor="start" class="svg-muted" font-size="12">Har leaf har spine se</text>
<text x="96" y="166" text-anchor="start" class="svg-muted" font-size="12">25G down</text>
<text x="16" y="62" text-anchor="start" class="svg-muted" font-size="12">100G up</text>
<line x1="16" y1="236" x2="624" y2="236" stroke="#e2e8f0"/><rect x="16" y="246" width="14" height="12" rx="2" fill="#bbf7d0" stroke="#64748b"/><text x="35" y="256" class="svg-muted" font-size="11">Spine</text><rect x="102.85714285714286" y="246" width="14" height="12" rx="2" fill="#bae6fd" stroke="#64748b"/><text x="121.85714285714286" y="256" class="svg-muted" font-size="11">Leaf / access</text><rect x="189.71428571428572" y="246" width="14" height="12" rx="2" fill="#fed7aa" stroke="#64748b"/><text x="208.71428571428572" y="256" class="svg-muted" font-size="11">Border / gateway</text><rect x="276.57142857142856" y="246" width="14" height="12" rx="2" fill="#e2e8f0" stroke="#64748b"/><text x="295.57142857142856" y="256" class="svg-muted" font-size="11">Server / host</text><rect x="363.42857142857144" y="246" width="14" height="12" rx="2" fill="#ddd6fe" stroke="#64748b"/><text x="382.42857142857144" y="256" class="svg-muted" font-size="11">Storage</text><rect x="450.28571428571433" y="246" width="14" height="12" rx="2" fill="#fecaca" stroke="#64748b"/><text x="469.28571428571433" y="256" class="svg-muted" font-size="11">Firewall</text><rect x="537.1428571428571" y="246" width="14" height="12" rx="2" fill="#fde68a" stroke="#64748b"/><text x="556.1428571428571" y="256" class="svg-muted" font-size="11">WAN / cloud</text>
</svg><p class="cap">Spine-leaf: do spines aur leaves, servers ki taraf 25G, spines ki taraf 100G. Border leaf firewall aur WAN rakhta hai. Bandwidth ke liye spines, ports ke liye leaves jodo.</p></div>

<h3>ToR, EoR aur MoR cabling</h3>
<p><b>ToR:</b> har rack mein chhota switch (ya pair). Server cables chhote copper DAC (direct attach copper) ya AOC (active optical cable) hote hain. Rack se sirf kuch uplink fibres bahar jaate hain. <b>EoR:</b> row ke end par bade switches; har server cable structured cabling se wahan tak jaata hai, isliye switches kam par copper aur cooling rukawaten zyada. <b>MoR:</b> EoR jaisa hi par row ke beech mein, jisse sabse lamba run aadha ho jaata hai. Ashford ke liye, 8 kW racks aur 25G servers ke saath, ToR sahi jawab hai.</p>
<h3>Optics: distance se chuno</h3>
<table class="cmp"><tr><th>Link</th><th>Typical choice</th><th>Rough reach</th></tr>
<tr><td>Same rack mein server se ToR</td><td>25G passive DAC</td><td>lagbhag 3 se 5 m tak</td></tr>
<tr><td>Agle rack ke leaf tak server</td><td>25G AOC ya SR optic</td><td>kuch dus metre tak</td></tr>
<tr><td>Hall ke andar leaf se spine</td><td>OM4 multimode par 100G SR optic</td><td>lagbhag 100 m</td></tr>
<tr><td>Buildings ke beech</td><td>100G LR single-mode</td><td>10 km tak</td></tr></table>
<p>OM3, OM4 aur OS2 par exact reach ke liye data sheet aur Cisco transceiver compatibility matrix hamesha check karo.</p>

<h3>Chosen design aur kyun</h3>
<p>Ashford ko option B milta hai: vPC-style pairs mein 64 ToR leaves, 4 spines, 2 border leaves, rack par 1.25:1. Kyun: equal paths STP hata dete hain, backup traffic ECMP se spread hota hai, aur capacity leaf-by-leaf badhti hai. Hall ke andar OM4 multimode use hua.</p>
<pre class="out">leaf-101# show port-channel summary
Group Port-Channel Type Protocol Member Ports
1     Po1(SU)      Eth  LACP     Eth1/49(P) Eth1/50(P)
<span class="hl">leaf-101# show interface ethernet1/49 transceiver</span></pre>

<div class="warn"><p><b>Common mistake.</b> Spines ko aaj ke leaf count ke hisaab se size karna. Jis leaf ke sirf chaar uplinks hain usme paanchva spine har leaf ko re-cable kiye bina nahi jud sakta. Airflow bhi mat milao: port-side intake wala switch hot-aisle rack mein garam hawa wapas kheenchta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Oversubscription har leaf ke provisioned ports se nikalta hai, total server count se nahi. Aur spine-leaf server par redundancy ki zaroorat khatam nahi karta: dual-homing ke liye abhi bhi vPC ya EVPN multihoming chahiye.</p></div>

<div class="scn"><h4>Ashford mein kya galat hua</h4><p>Go-live ke baad rows 3 aur 4 ke 120 servers link up nahi hue. Team ne 3 m DAC cables order kiye the, lekin un servers ka leaf agle rack mein tha, 7 m door. DAC distance-limited hai, isliye links down rahe. Doosri problem: leaves cold-aisle design mein port-side exhaust ke saath aaye, garam hawa padosiyon ko mili aur do leaves overheat hue. Fix: lambe runs ke liye AOC cables aur fans ko reverse karna.</p><p><b>Lesson:</b> physical layer ko protocols jitni dhyaan se design karo: reach, airflow aur power design document ka hissa hain.</p></div>

<div class="iv"><p class="q">"Three-tier ki jagah spine-leaf kyun?"</p><p>Predictable two-hop east-west paths, ECMP se saare links forwarding, leaves jodkar scale, aur har switch ka chhota failure domain. Batao ki chhote ya north-south sites ke liye three-tier abhi bhi theek hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Spine-leaf equal-cost two-hop paths deta hai; three-tier chhote ya north-south designs ke liye hai.</li>
<li>Oversubscription = downlink bandwidth / uplink bandwidth, har leaf par.</li>
<li>Maximum leaf count = spine port count; growth ke liye spines size karo.</li>
<li>ToR default hai; EoR aur MoR kam switches ke badle cabling ka trade-off hain.</li>
<li>Optics distance aur fibre type se chuno, aur airflow direction verify karo.</li>
</ul></div>

`}};export{e as default};