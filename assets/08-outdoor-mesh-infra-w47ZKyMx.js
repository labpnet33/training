var e={id:`outdoor-mesh-infra`,h:{en:`Infrastructure, outdoor, mesh and bridge design`,hi:`Infrastructure, outdoor, mesh aur bridge design`},body:{en:`
<p>A perfect RF plan fails if the AP has no power, the cable is too long or the licence is missing. This chapter covers the <b>physical and logical infrastructure</b> items of the design blueprint (AP power, cabling, switch ports, mounting, grounding, controller and AP capacity and licensing) and then <b>outdoor and wireless bridging (mesh)</b>. Outdoor, mesh and bridge are <b>concept only</b> in the lab; the dB maths you need is in chapter 5.</p>

<h3>Analogy: building a house</h3>
<p>The RF plan is the architect's drawing. The infrastructure is the electricity, plumbing and roof. A beautiful drawing without a water connection is not a house.</p>

<h3>PoE: powering the APs</h3>
<p>Most APs take power over the Ethernet cable (PoE). The switch (power sourcing equipment, PSE) must supply what the AP (powered device, PD) needs, and the AP's radios may reduce features when power is low.</p>
<table class="cmp"><tr><th>Standard</th><th>Name</th><th>PSE budget per port</th><th>Power at the AP</th></tr>
<tr><td>802.3af</td><td>PoE (Type 1)</td><td>15.4 W</td><td>12.95 W</td></tr>
<tr><td>802.3at</td><td>PoE+ (Type 2)</td><td>30 W</td><td>25.5 W</td></tr>
<tr><td>802.3bt Type 3</td><td>PoE++ / UPOE</td><td>60 W</td><td>51 W</td></tr>
<tr><td>802.3bt Type 4</td><td>PoE++</td><td>90 W</td><td>71.3 W</td></tr>
</table>
<p>Many Wi-Fi 6 and 6E APs need 802.3at or 802.3bt for full radios and USB or extra ports. Always read the data sheet: at af power an AP may disable a radio or reduce transmit chains.</p>
<div class="eg"><p><b>Worked example: PoE budget.</b> A 48-port switch has a 740 W PoE budget. Each AP is allocated 30 W (802.3at). 24 APs x 30 W = 720 W, fits. 25 APs x 30 W = 750 W, does not fit, so the 25th AP stays unpowered or the allocation must drop. If APs actually draw 20 W, a dynamic (consumption-based) allocation allows more, but design to the worst case.</p></div>

<h3>Cabling, ports and uplinks</h3>
<ul>
<li><b>Cable:</b> Cat5e or Cat6 up to 100 m channel length. Wi-Fi 6 APs can need 2.5 or 5 Gbps (multigigabit) over Cat5e/Cat6, so plan <b>multigigabit switch ports</b> for those APs.</li>
<li><b>Uplink capacity:</b> total AP peak throughput feeds an access switch uplink. 24 APs at 1 Gbps each can offer 24 Gbps at peak, so even a 10 Gbps uplink is oversubscribed about 2.4 to 1. Choose the ratio deliberately.</li>
<li><b>Switch ports:</b> one per AP, plus spare for growth, plus VLAN design (AP management VLAN versus client VLANs).</li>
<li><b>Controller location:</b> CAPWAP latency and bandwidth to the WLC (FlexConnect in <code>wl-flex</code> for remote sites).</li>
</ul>

<h3>Mounting, orientation and grounding</h3>
<ul>
<li><b>Ceiling AP:</b> internal antennas point downward, a doughnut pattern. Typical indoor mounting is ceiling height of 3 to 4 m. Above that the patterns are poor; use directional antennas or lower mounts.</li>
<li><b>Wall mount:</b> the pattern points outward; check data sheet notes, since patterns differ from the ceiling.</li>
<li><b>Hazards:</b> keep APs away from metal ducts, fire doors, microwaves and large metal cabinets. Above a false ceiling, plenum-rated models are required in air handling spaces.</li>
<li><b>Grounding:</b> outdoor APs and antennas need a proper ground and a lightning arrestor on the cable. A mast without a ground is a lightning rod.</li>
</ul>

<h3>Controller and AP capacity, licensing</h3>
<p>Each controller model has a maximum number of APs and clients. Plan the AP count per controller and for high availability (<code>wl-mobility</code>): N+1 or SSO pairs need capacity for the failover load. Controllers also need the right <b>licence level</b> per AP and, for the 9800-CL, a suitable virtual machine size. Treat licensing, model scale and AP support as design inputs, not afterthoughts, and check the current platform guide before the order.</p>

<h3>Outdoor design</h3>
<ul>
<li><b>Hardware:</b> outdoor-rated APs (weatherproof, wide temperature range, sealed connectors) with external antennas.</li>
<li><b>Regulatory:</b> outdoor channels, DFS and EIRP limits are stricter; the country code matters.</li>
<li><b>Coverage:</b> there are no walls, so cells are large; use directional or sector antennas to avoid interference at long range. Foliage, rain and vehicles add loss.</li>
<li><b>Link planning:</b> use the link budget of chapter 5 and a 10 to 20 dB fade margin.</li>
</ul>

<h3>Mesh and point-to-point bridges</h3>
<p>A <b>wireless bridge</b> joins two wired networks with a radio link. A <b>mesh</b> network is a tree of APs that reach the wired network through other APs. In Cisco terminology, the <b>Root AP (RAP)</b> has the wired uplink and <b>Mesh APs (MAPs)</b> connect to a RAP (or another MAP) through a <b>backhaul</b> radio, usually 5 GHz, while the access radio serves clients. Mesh APs choose their parent with the <b>Adaptive Wireless Path Protocol (AWPP)</b>, which scores the available paths by link quality and hop count. A <b>bridge group name (BGN)</b> keeps mesh APs from joining the wrong tree.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Mesh with root AP and mesh APs">
<rect x="20" y="20" width="110" height="36" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="75" y="43" text-anchor="middle" class="svg-ink" font-size="12">Switch + WLC</text>
<rect x="190" y="20" width="90" height="36" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="235" y="43" text-anchor="middle" class="svg-ink" font-size="12">RAP</text>
<rect x="350" y="20" width="90" height="36" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="395" y="43" text-anchor="middle" class="svg-ink" font-size="12">MAP 1</text>
<rect x="510" y="20" width="90" height="36" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="555" y="43" text-anchor="middle" class="svg-ink" font-size="12">MAP 2</text>
<path d="M130 38H190" stroke="#64748b" stroke-width="2"/>
<path d="M280 38H350M440 38H510" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="315" y="78" text-anchor="middle" class="svg-muted" font-size="12">backhaul 5 GHz</text><text x="475" y="78" text-anchor="middle" class="svg-muted" font-size="12">backhaul 5 GHz</text>
<text x="160" y="32" text-anchor="middle" class="svg-muted" font-size="11">wired</text>
<rect x="20" y="110" width="600" height="64" rx="8" fill="#f1f5f9" stroke="#64748b"/>
<text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="12">Hops share the backhaul channel: about 200, 100, 50 Mbps</text>
<text x="320" y="154" text-anchor="middle" class="svg-muted" font-size="12">keep hop count low; add wired RAPs where you can</text>
</svg><p class="cap">A root AP with two mesh hops. Throughput falls with each hop on a shared channel.</p></div>

<h3>Designing bridge links and mesh</h3>
<ul>
<li><b>Line of sight and the Fresnel zone.</b> The first Fresnel zone is an ellipse around the straight line; keep at least 60 percent of it clear. At the midpoint its radius is r = 17.3 x sqrt(d / (4 f)) metres, d in km and f in GHz.</li>
<li><b>Hops:</b> each hop on a shared channel roughly halves throughput, so keep hops to two or three. A dual-radio backhaul or different channels per hop helps.</li>
<li><b>Types:</b> point-to-point (two bridges with directional antennas), point-to-multipoint (a hub bridge and several remote bridges), and mesh (self-forming).</li>
<li><b>Security:</b> encrypt the backhaul; use the mesh security profile and authenticate the mesh APs.</li>
</ul>
<div class="eg"><p><b>Worked example: Fresnel zone.</b> A 5 km link at 5.5 GHz: r = 17.3 x sqrt(5 / (4 x 5.5)) = 17.3 x 0.4767 = <b>8.25 m</b>. 60 percent clearance is <b>4.95 m</b>. The antennas must be high enough that the midpoint of the path is at least 5 m above any obstacle, plus earth curvature allowance on long links.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Powering an 802.3at AP from an 802.3af port; forgetting multigigabit ports; mounting a ceiling AP on a wall; no lightning protection on outdoor antennas; planning mesh with five hops and expecting full speed; ignoring the Fresnel zone.</p></div>
<div class="exam"><p><b>Exam trap.</b> 802.3af 15.4 W, 802.3at 30 W, 802.3bt 60 W or 90 W are <b>PSE</b> budgets, and the AP receives less. RAP has the wired uplink; MAP does not. Mesh backhaul is usually 5 GHz and AWPP chooses the parent.</p></div>

<div class="scn"><h4>The AP that lost a radio</h4><p>Twelve new Wi-Fi 6 APs came up with only one working 5 GHz radio. The ports were 802.3af. The switch log reported insufficient power and the APs ran in a low-power mode. The team moved them to PoE+ ports and the missing radio returned. They also found two APs behind a lift motor room that needed a grounded metal enclosure.</p><p><b>Lesson:</b> check the PoE class on the data sheet before cabling.</p></div>

<div class="iv"><p class="q">"How do you design a link between two buildings 3 km apart?"</p><p>Check line of sight and 60 percent Fresnel clearance, choose directional antennas and a regulatory-legal EIRP, compute the link budget with FSPL and a 10 to 20 dB fade margin, use a dedicated 5 GHz channel, mount with lightning protection and grounding, encrypt it, and test with an alignment tool. Say it is point-to-point bridging, not a mesh.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PoE: af 15.4 W, at 30 W, bt 60 or 90 W at the switch; the AP receives less.</li>
<li>Plan multigigabit ports, uplink bandwidth, mounting, grounding and controller scale or licences.</li>
<li>Mesh = RAP plus MAPs on a 5 GHz backhaul, parent chosen by AWPP, BGN separates trees.</li>
<li>Each shared-channel hop roughly halves throughput; keep hops low.</li>
<li>Fresnel zone: keep 60 percent clear; r = 17.3 x sqrt(d / (4 f)).</li>
</ul></div>
`,hi:`
<p>Perfect RF plan bhi fail ho jaata hai agar AP ko power nahi, cable bahut lambi ho ya licence na ho. Yeh chapter design blueprint ke <b>physical aur logical infrastructure</b> items cover karta hai (AP power, cabling, switch ports, mounting, grounding, controller aur AP capacity aur licensing) aur phir <b>outdoor aur wireless bridging (mesh)</b>. Outdoor, mesh aur bridge lab mein <b>concept only</b> hain; zaroori dB maths chapter 5 mein hai.</p>

<h3>Analogy: ghar banana</h3>
<p>RF plan architect ka drawing hai. Infrastructure bijli, plumbing aur chhat hai. Paani ke connection ke bina khoobsurat drawing ghar nahi hai.</p>

<h3>PoE: APs ko power dena</h3>
<p>Zyada tar APs Ethernet cable par power lete hain (PoE). Switch (power sourcing equipment, PSE) ko wahi dena padta hai jo AP (powered device, PD) ko chahiye, aur power kam hone par AP ke radios features ghata sakte hain.</p>
<table class="cmp"><tr><th>Standard</th><th>Naam</th><th>PSE budget per port</th><th>AP par power</th></tr>
<tr><td>802.3af</td><td>PoE (Type 1)</td><td>15.4 W</td><td>12.95 W</td></tr>
<tr><td>802.3at</td><td>PoE+ (Type 2)</td><td>30 W</td><td>25.5 W</td></tr>
<tr><td>802.3bt Type 3</td><td>PoE++ / UPOE</td><td>60 W</td><td>51 W</td></tr>
<tr><td>802.3bt Type 4</td><td>PoE++</td><td>90 W</td><td>71.3 W</td></tr>
</table>
<p>Kai Wi-Fi 6 aur 6E APs ko poore radios aur USB ya extra ports ke liye 802.3at ya 802.3bt chahiye. Hamesha data sheet padho: af power par AP ek radio disable ya transmit chains kam kar sakta hai.</p>
<div class="eg"><p><b>Worked example: PoE budget.</b> 48-port switch ka PoE budget 740 W hai. Har AP ko 30 W (802.3at) allocate hota hai. 24 APs x 30 W = 720 W, fit hota hai. 25 APs x 30 W = 750 W, fit nahi hota, isliye 25va AP unpowered rehta hai ya allocation kam karni padti hai. Agar APs asal mein 20 W khinchte hain to dynamic (consumption-based) allocation zyada allow karta hai, lekin worst case ke liye design karo.</p></div>

<h3>Cabling, ports aur uplinks</h3>
<ul>
<li><b>Cable:</b> Cat5e ya Cat6 100 m channel length tak. Wi-Fi 6 APs ko Cat5e/Cat6 par 2.5 ya 5 Gbps (multigigabit) chahiye ho sakta hai, isliye un APs ke liye <b>multigigabit switch ports</b> plan karo.</li>
<li><b>Uplink capacity:</b> total AP peak throughput access switch uplink mein jaata hai. 1 Gbps wale 24 APs peak par 24 Gbps de sakte hain, isliye 10 Gbps uplink bhi lagbhag 2.4 to 1 oversubscribed hai. Ratio soch samajh kar chuno.</li>
<li><b>Switch ports:</b> har AP ke liye ek, growth ke liye spare, aur VLAN design (AP management VLAN versus client VLANs).</li>
<li><b>Controller location:</b> WLC tak CAPWAP latency aur bandwidth (remote sites ke liye <code>wl-flex</code> mein FlexConnect).</li>
</ul>

<h3>Mounting, orientation aur grounding</h3>
<ul>
<li><b>Ceiling AP:</b> internal antennas neeche ki taraf, doughnut pattern. Typical indoor mounting 3 se 4 m ceiling height hai. Usse upar patterns kharab hote hain; directional antennas ya lower mounts use karo.</li>
<li><b>Wall mount:</b> pattern bahar ki taraf jaata hai; data sheet notes check karo, kyunki patterns ceiling se alag hote hain.</li>
<li><b>Hazards:</b> APs ko metal ducts, fire doors, microwaves aur bade metal cabinets se door rakho. False ceiling ke upar air handling spaces mein plenum-rated models zaroori hain.</li>
<li><b>Grounding:</b> outdoor APs aur antennas ko sahi ground aur cable par lightning arrestor chahiye. Bina ground ka mast bijli ka rod hai.</li>
</ul>

<h3>Controller aur AP capacity, licensing</h3>
<p>Har controller model ka AP aur clients ka maximum hota hai. Har controller par AP count aur high availability (<code>wl-mobility</code>) ke liye plan karo: N+1 ya SSO pairs ko failover load ki capacity chahiye. Controllers ko har AP ke liye sahi <b>licence level</b> aur 9800-CL ke liye suitable virtual machine size bhi chahiye. Licensing, model scale aur AP support ko design inputs maano, baad ki soch nahi, aur order se pehle current platform guide check karo.</p>

<h3>Outdoor design</h3>
<ul>
<li><b>Hardware:</b> outdoor-rated APs (weatherproof, wide temperature range, sealed connectors) external antennas ke saath.</li>
<li><b>Regulatory:</b> outdoor channels, DFS aur EIRP limits zyada sakht hain; country code matter karta hai.</li>
<li><b>Coverage:</b> walls nahi hain, isliye cells bade hote hain; long range par interference se bachne ke liye directional ya sector antennas use karo. Foliage, rain aur vehicles loss jodte hain.</li>
<li><b>Link planning:</b> chapter 5 ka link budget aur 10 se 20 dB fade margin use karo.</li>
</ul>

<h3>Mesh aur point-to-point bridges</h3>
<p><b>Wireless bridge</b> do wired networks ko radio link se jodta hai. <b>Mesh</b> APs ka tree hai jo doosre APs ke through wired network tak pahunchte hain. Cisco terminology mein <b>Root AP (RAP)</b> ke paas wired uplink hota hai aur <b>Mesh APs (MAPs)</b> <b>backhaul</b> radio (aam taur par 5 GHz) se RAP (ya doosre MAP) se connect hote hain, jabki access radio clients ko serve karta hai. Mesh APs apna parent <b>Adaptive Wireless Path Protocol (AWPP)</b> se chunte hain, jo available paths ko link quality aur hop count se score karta hai. <b>Bridge group name (BGN)</b> mesh APs ko galat tree join karne se rokta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Root AP aur mesh APs wala mesh">
<rect x="20" y="20" width="110" height="36" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="75" y="43" text-anchor="middle" class="svg-ink" font-size="12">Switch + WLC</text>
<rect x="190" y="20" width="90" height="36" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="235" y="43" text-anchor="middle" class="svg-ink" font-size="12">RAP</text>
<rect x="350" y="20" width="90" height="36" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="395" y="43" text-anchor="middle" class="svg-ink" font-size="12">MAP 1</text>
<rect x="510" y="20" width="90" height="36" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="555" y="43" text-anchor="middle" class="svg-ink" font-size="12">MAP 2</text>
<path d="M130 38H190" stroke="#64748b" stroke-width="2"/>
<path d="M280 38H350M440 38H510" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="315" y="78" text-anchor="middle" class="svg-muted" font-size="12">backhaul 5 GHz</text><text x="475" y="78" text-anchor="middle" class="svg-muted" font-size="12">backhaul 5 GHz</text>
<text x="160" y="32" text-anchor="middle" class="svg-muted" font-size="11">wired</text>
<rect x="20" y="110" width="600" height="64" rx="8" fill="#f1f5f9" stroke="#64748b"/>
<text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="12">Hops backhaul channel share karte hain: lagbhag 200, 100, 50 Mbps</text>
<text x="320" y="154" text-anchor="middle" class="svg-muted" font-size="12">hop count kam rakho; jahan ho wahan wired RAPs jodo</text>
</svg><p class="cap">Do mesh hops wala root AP. Shared channel par har hop ke saath throughput girta hai.</p></div>

<h3>Bridge links aur mesh design karna</h3>
<ul>
<li><b>Line of sight aur Fresnel zone.</b> Pehla Fresnel zone seedhi line ke aas paas ek ellipse hai; kam se kam 60 percent saaf rakho. Midpoint par uska radius r = 17.3 x sqrt(d / (4 f)) metre hai, d km mein aur f GHz mein.</li>
<li><b>Hops:</b> shared channel par har hop throughput lagbhag aadha kar deta hai, isliye hops do ya teen rakho. Dual-radio backhaul ya har hop par alag channel madad karta hai.</li>
<li><b>Types:</b> point-to-point (directional antennas wale do bridges), point-to-multipoint (hub bridge aur kai remote bridges), aur mesh (khud banne wala).</li>
<li><b>Security:</b> backhaul encrypt karo; mesh security profile use karo aur mesh APs authenticate karo.</li>
</ul>
<div class="eg"><p><b>Worked example: Fresnel zone.</b> 5.5 GHz par 5 km link: r = 17.3 x sqrt(5 / (4 x 5.5)) = 17.3 x 0.4767 = <b>8.25 m</b>. 60 percent clearance <b>4.95 m</b> hai. Antennas itne uchhe hone chahiye ki path ka midpoint kisi bhi rukawat se kam se kam 5 m upar ho, lambe links par earth curvature allowance ke saath.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> 802.3at AP ko 802.3af port se power dena; multigigabit ports bhool jaana; ceiling AP ko wall par lagana; outdoor antennas par lightning protection na hona; paanch hops ka mesh plan karke full speed expect karna; Fresnel zone ignore karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> 802.3af 15.4 W, 802.3at 30 W, 802.3bt 60 W ya 90 W <b>PSE</b> budgets hain, aur AP ko kam milta hai. RAP ke paas wired uplink hota hai; MAP ke paas nahi. Mesh backhaul aam taur par 5 GHz hai aur AWPP parent chunta hai.</p></div>

<div class="scn"><h4>Jis AP ka ek radio gum ho gaya</h4><p>Bara naye Wi-Fi 6 APs sirf ek working 5 GHz radio ke saath up aaye. Ports 802.3af the. Switch log ne insufficient power report kiya aur APs low-power mode mein chale. Team ne unhe PoE+ ports par move kiya aur gum radio wapas aa gaya. Unhe yeh bhi mila ki lift motor room ke peeche do APs ko grounded metal enclosure chahiye tha.</p><p><b>Seekh:</b> cabling se pehle data sheet par PoE class check karo.</p></div>

<div class="iv"><p class="q">"3 km door do buildings ke beech link kaise design karoge?"</p><p>Line of sight aur 60 percent Fresnel clearance check karo, directional antennas aur regulatory-legal EIRP chuno, FSPL aur 10 se 20 dB fade margin ke saath link budget nikalo, dedicated 5 GHz channel use karo, lightning protection aur grounding ke saath mount karo, encrypt karo, aur alignment tool se test karo. Bolo ki yeh point-to-point bridging hai, mesh nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PoE: switch par af 15.4 W, at 30 W, bt 60 ya 90 W; AP ko kam milta hai.</li>
<li>Multigigabit ports, uplink bandwidth, mounting, grounding aur controller scale ya licences plan karo.</li>
<li>Mesh = RAP plus MAPs 5 GHz backhaul par, parent AWPP chunta hai, BGN trees alag rakhta hai.</li>
<li>Shared-channel har hop throughput lagbhag aadha karta hai; hops kam rakho.</li>
<li>Fresnel zone: 60 percent saaf rakho; r = 17.3 x sqrt(d / (4 f)).</li>
</ul></div>
`}};export{e as default};