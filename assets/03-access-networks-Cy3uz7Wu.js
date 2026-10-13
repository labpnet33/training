var e={id:`access-networks`,h:{en:`Access networks: fixed, mobile and business access`,hi:`Access networks: fixed, mobile aur business access`},body:{en:`
<p>The access network is where the provider meets its customer. Different customer types use different physical technologies, but they all end up as Ethernet or IP at the aggregation tier. This chapter explains the main access models so you can place them in a design and know what each one demands from the aggregation and edge.</p>

<h3>Fixed broadband access</h3>
<dl class="terms">
<dt>FTTH with GPON or XGS-PON</dt><dd>Fibre to the home using a passive optical network. One fibre from an <b>OLT</b> (optical line terminal) in the central office is split passively (by optical splitters) to many <b>ONTs</b> (optical network terminals) at homes. Downstream traffic is broadcast to all ONTs on the tree and each ONT picks its own (encrypted); upstream is time-shared by the OLT. The split ratio and PON generation set the shared bandwidth.</dd>
<dt>DOCSIS cable</dt><dd>Broadband over coaxial cable. A <b>CMTS</b> (or distributed variants such as a converged cable access platform) serves cable modems on a shared coax segment.</dd>
<dt>DSL</dt><dd>Broadband over copper telephone lines with a DSLAM at the exchange. Older, but still deployed.</dd>
<dt>Fixed wireless</dt><dd>Radio links to the customer premises when fibre is not available.</dd>
</dl>
<p>Whatever the physical layer, the traffic reaches an <b>aggregation switch or router</b> and then a <b>BNG</b> (broadband network gateway) that handles subscriber sessions, authentication (often through RADIUS), addressing and per-subscriber policy.</p>

<h3>Two ways to carry subscribers: N:1 and 1:1 VLANs</h3>
<ul>
<li><b>N:1 VLAN</b>: many subscribers share a service VLAN. Efficient on VLAN numbers but requires security features at the access to keep subscribers apart (for example port isolation and DHCP snooping-style protections).</li>
<li><b>1:1 VLAN</b>: each subscriber has a VLAN (often an S-tag plus C-tag, using Q-in-Q from the Layer 2 VPN module). Good isolation, but consumes tag space and configuration.</li>
</ul>

<h3>Mobile transport (backhaul and fronthaul)</h3>
<p>A mobile network connects radios in <b>cell sites</b> to the mobile core. The transport between them is what an SP builds and sells.</p>
<ul>
<li><b>Backhaul</b>: from the cell-site router (or the radio's baseband unit) back to the mobile packet core. It is IP and Ethernet based today, often with MPLS or segment routing, carrying the radio's IP traffic and management.</li>
<li><b>Midhaul and fronthaul</b>: in modern radio designs, parts of the radio processing are split into a centralised unit and a distributed unit, creating more segments with <b>strict latency and synchronisation</b> needs.</li>
<li><b>Synchronisation</b>: radios need an accurate frequency and sometimes time and phase reference. Packet networks carry it with <b>SyncE</b> (frequency on the physical layer) and <b>PTP / IEEE 1588</b> (time and phase). Aggregation and core routers must support these, usually with boundary-clock or transparent-clock roles.</li>
<li><b>Services</b>: a typical design uses an L3VPN or EVPN per traffic type (user, control, management) from the cell-site router, with QoS to protect time-critical traffic.</li>
</ul>

<h3>Business access</h3>
<p>Enterprises buy <b>Ethernet services</b> (E-Line, E-LAN, from the Layer 2 VPN module) or <b>IP VPN</b> (L3VPN) and <b>dedicated Internet access</b>. They connect with a fibre handoff at a UNI port on a provider edge device or a small access router at the customer site. The provider provisions a service instance, a bandwidth profile and OAM. Because customer count is smaller but revenue per customer is high, designs use dual-homing and higher availability.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Access types converge">
<rect x="15" y="15" width="150" height="40" rx="6" fill="#bae6fd"/><text x="90" y="40" text-anchor="middle" class="svg-ink" font-size="12">Home (PON / cable)</text>
<rect x="15" y="85" width="150" height="40" rx="6" fill="#bae6fd"/><text x="90" y="110" text-anchor="middle" class="svg-ink" font-size="12">Cell site (radio)</text>
<rect x="15" y="155" width="150" height="40" rx="6" fill="#bae6fd"/><text x="90" y="180" text-anchor="middle" class="svg-ink" font-size="12">Business (Ethernet)</text>
<rect x="270" y="75" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="335" y="102" text-anchor="middle" class="svg-ink" font-size="13">Aggregation</text><text x="335" y="120" text-anchor="middle" class="svg-muted" font-size="11">Ethernet / MPLS</text>
<rect x="500" y="15" width="125" height="40" rx="6" fill="#fde68a"/><text x="562" y="40" text-anchor="middle" class="svg-ink" font-size="12">BNG</text>
<rect x="500" y="85" width="125" height="40" rx="6" fill="#fde68a"/><text x="562" y="110" text-anchor="middle" class="svg-ink" font-size="12">Mobile core</text>
<rect x="500" y="155" width="125" height="40" rx="6" fill="#fde68a"/><text x="562" y="180" text-anchor="middle" class="svg-ink" font-size="12">PE (VPN)</text>
<g stroke="#64748b" stroke-width="2"><line x1="165" y1="35" x2="270" y2="95"/><line x1="165" y1="105" x2="270" y2="105"/><line x1="165" y1="175" x2="270" y2="120"/><line x1="400" y1="95" x2="500" y2="35"/><line x1="400" y1="105" x2="500" y2="105"/><line x1="400" y1="120" x2="500" y2="175"/></g>
</svg><p class="cap">Different access types converge on aggregation and then split to the right service edge.</p></div>

<h3>What access means for the rest of the design</h3>
<table class="cmp"><tr><th>Access type</th><th>Needs from aggregation and edge</th></tr>
<tr><td>Fixed broadband</td><td>BNG capacity for sessions, RADIUS, per-subscriber QoS, multicast for IPTV</td></tr>
<tr><td>Mobile</td><td>Low latency, SyncE and PTP, many small VPNs, seamless MPLS or SR to cell sites</td></tr>
<tr><td>Business</td><td>Service instances (xconnect, VRF, EVPN), OAM, SLA measurement, dual-homing</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A 10G-PON OLT port serves a split of 1:32. If the downstream shared capacity is about 10 Gbps and subscribers are sold 500 Mbps plans, the sum of plans is 16 Gbps on one port, an oversubscription of 1.6 to 1 on that tree. Measured busy-hour use of 80 Mbps per subscriber gives 2.56 Gbps, comfortably inside the capacity. This is typical of how operators dimension PON trees using measured traffic, not plan speeds. Numbers here are illustrative arithmetic.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ignoring synchronisation in a mobile transport design; sizing aggregation by plan speed rather than measured traffic; and using N:1 VLANs without subscriber isolation.</p></div>
<div class="exam"><p><b>Exam trap.</b> OLT and ONT are PON terms, CMTS is cable, BNG terminates subscriber sessions. SyncE gives frequency; PTP gives time and phase.</p></div>

<div class="scn"><h4>Cell sites drift out of sync</h4><p>After an aggregation upgrade, several radios reported synchronisation alarms. The new routers carried the traffic but were not configured as PTP boundary clocks, so timing packets crossed them with variable delay. Enabling the right clock role restored accuracy.</p><p><b>Lesson:</b> for mobile transport, forwarding is not enough; timing support is part of the service.</p></div>

<div class="iv"><p class="q">"What does a mobile backhaul design need besides bandwidth?"</p><p>Low latency, high availability, QoS for control and user traffic, and synchronisation through SyncE and PTP. The transport is commonly L3VPN or EVPN over MPLS or segment routing from the cell-site router.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FTTH uses an OLT and ONTs over a passive optical network; cable uses a CMTS.</li>
<li>The BNG terminates subscriber sessions at the edge.</li>
<li>N:1 and 1:1 VLAN models trade VLAN space against isolation.</li>
<li>Mobile transport needs low latency and SyncE and PTP synchronisation.</li>
<li>Business access uses Ethernet services or IP VPNs with dual-homing.</li>
</ul></div>
`,hi:`
<p>Access network woh jagah hai jahan provider apne customer se milta hai. Alag customer types alag physical technologies use karte hain, lekin sab aggregation tier par Ethernet ya IP ban jaate hain. Yeh chapter main access models samjhata hai taaki aap unhe design mein rakh sako aur jaan sako ki har ek aggregation aur edge se kya maangta hai.</p>

<h3>Fixed broadband access</h3>
<dl class="terms">
<dt>GPON ya XGS-PON ke saath FTTH</dt><dd>Passive optical network use karke ghar tak fibre. Central office ke <b>OLT</b> (optical line terminal) se ek fibre optical splitters se passively kai <b>ONTs</b> (optical network terminals) tak ghar par baanti jaati hai. Downstream traffic tree ke saare ONTs ko broadcast hota hai aur har ONT apna (encrypted) chunta hai; upstream OLT time-share karta hai. Split ratio aur PON generation shared bandwidth tay karte hain.</dd>
<dt>DOCSIS cable</dt><dd>Coaxial cable par broadband. <b>CMTS</b> (ya distributed variants jaise converged cable access platform) shared coax segment par cable modems serve karta hai.</dd>
<dt>DSL</dt><dd>Exchange par DSLAM ke saath copper telephone lines par broadband. Purana, lekin abhi bhi deployed.</dd>
<dt>Fixed wireless</dt><dd>Jab fibre available na ho to customer premises tak radio links.</dd>
</dl>
<p>Physical layer jo bhi ho, traffic <b>aggregation switch ya router</b> tak aur phir <b>BNG</b> (broadband network gateway) tak pahunchta hai jo subscriber sessions, authentication (aksar RADIUS se), addressing aur per-subscriber policy handle karta hai.</p>

<h3>Subscribers carry karne ke do tareeke: N:1 aur 1:1 VLANs</h3>
<ul>
<li><b>N:1 VLAN</b>: kai subscribers ek service VLAN share karte hain. VLAN numbers par efficient hai lekin subscribers ko alag rakhne ke liye access par security features chahiye (jaise port isolation aur DHCP snooping-style protections).</li>
<li><b>1:1 VLAN</b>: har subscriber ki ek VLAN (aksar S-tag plus C-tag, Layer 2 VPN module ke Q-in-Q se). Achha isolation, lekin tag space aur configuration kharch hoti hai.</li>
</ul>

<h3>Mobile transport (backhaul aur fronthaul)</h3>
<p>Mobile network <b>cell sites</b> ke radios ko mobile core se jodta hai. Dono ke beech transport woh hai jo SP banata aur bechta hai.</p>
<ul>
<li><b>Backhaul</b>: cell-site router (ya radio ki baseband unit) se mobile packet core tak. Aaj yeh IP aur Ethernet based hai, aksar MPLS ya segment routing ke saath, radio ka IP traffic aur management carry karta hai.</li>
<li><b>Midhaul aur fronthaul</b>: modern radio designs mein radio processing ke hisse centralised unit aur distributed unit mein baante jaate hain, jisse aur segments bante hain jinki <b>strict latency aur synchronisation</b> needs hoti hain.</li>
<li><b>Synchronisation</b>: radios ko accurate frequency aur kabhi kabhi time aur phase reference chahiye. Packet networks ise <b>SyncE</b> (physical layer par frequency) aur <b>PTP / IEEE 1588</b> (time aur phase) se carry karte hain. Aggregation aur core routers ko inhe support karna padta hai, aam taur par boundary-clock ya transparent-clock roles ke saath.</li>
<li><b>Services</b>: typical design cell-site router se har traffic type (user, control, management) ke liye L3VPN ya EVPN use karta hai, time-critical traffic ko protect karne ke liye QoS ke saath.</li>
</ul>

<h3>Business access</h3>
<p>Enterprises <b>Ethernet services</b> (E-Line, E-LAN, Layer 2 VPN module se) ya <b>IP VPN</b> (L3VPN) aur <b>dedicated Internet access</b> kharidte hain. Woh provider edge device ke UNI port par fibre handoff se ya customer site par chhote access router se jude hote hain. Provider service instance, bandwidth profile aur OAM provision karta hai. Customer count kam lekin revenue per customer high hota hai, isliye designs dual-homing aur higher availability use karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Access types converge">
<rect x="15" y="15" width="150" height="40" rx="6" fill="#bae6fd"/><text x="90" y="40" text-anchor="middle" class="svg-ink" font-size="12">Ghar (PON / cable)</text>
<rect x="15" y="85" width="150" height="40" rx="6" fill="#bae6fd"/><text x="90" y="110" text-anchor="middle" class="svg-ink" font-size="12">Cell site (radio)</text>
<rect x="15" y="155" width="150" height="40" rx="6" fill="#bae6fd"/><text x="90" y="180" text-anchor="middle" class="svg-ink" font-size="12">Business (Ethernet)</text>
<rect x="270" y="75" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="335" y="102" text-anchor="middle" class="svg-ink" font-size="13">Aggregation</text><text x="335" y="120" text-anchor="middle" class="svg-muted" font-size="11">Ethernet / MPLS</text>
<rect x="500" y="15" width="125" height="40" rx="6" fill="#fde68a"/><text x="562" y="40" text-anchor="middle" class="svg-ink" font-size="12">BNG</text>
<rect x="500" y="85" width="125" height="40" rx="6" fill="#fde68a"/><text x="562" y="110" text-anchor="middle" class="svg-ink" font-size="12">Mobile core</text>
<rect x="500" y="155" width="125" height="40" rx="6" fill="#fde68a"/><text x="562" y="180" text-anchor="middle" class="svg-ink" font-size="12">PE (VPN)</text>
<g stroke="#64748b" stroke-width="2"><line x1="165" y1="35" x2="270" y2="95"/><line x1="165" y1="105" x2="270" y2="105"/><line x1="165" y1="175" x2="270" y2="120"/><line x1="400" y1="95" x2="500" y2="35"/><line x1="400" y1="105" x2="500" y2="105"/><line x1="400" y1="120" x2="500" y2="175"/></g>
</svg><p class="cap">Alag access types aggregation par milte hain aur phir sahi service edge ki taraf baant jaate hain.</p></div>

<h3>Access ka baaki design par matlab</h3>
<table class="cmp"><tr><th>Access type</th><th>Aggregation aur edge se zaroorat</th></tr>
<tr><td>Fixed broadband</td><td>Sessions ke liye BNG capacity, RADIUS, per-subscriber QoS, IPTV ke liye multicast</td></tr>
<tr><td>Mobile</td><td>Kam latency, SyncE aur PTP, kai chhote VPNs, cell sites tak seamless MPLS ya SR</td></tr>
<tr><td>Business</td><td>Service instances (xconnect, VRF, EVPN), OAM, SLA measurement, dual-homing</td></tr></table>

<div class="eg"><p><b>Worked example.</b> 10G-PON OLT port 1:32 split serve karta hai. Agar downstream shared capacity lagbhag 10 Gbps hai aur subscribers ko 500 Mbps plans bechte hain, to ek port par plans ka sum 16 Gbps hai, us tree par 1.6 to 1 oversubscription. Busy-hour mein measured 80 Mbps per subscriber 2.56 Gbps deta hai, jo capacity ke andar aaram se hai. Operators PON trees ko aise hi plan speeds se nahi, measured traffic se dimension karte hain. Yahan ke numbers illustrative arithmetic hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Mobile transport design mein synchronisation ignore karna; aggregation ko plan speed se size karna, measured traffic se nahi; aur subscriber isolation ke bina N:1 VLANs use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> OLT aur ONT PON terms hain, CMTS cable hai, BNG subscriber sessions terminate karta hai. SyncE frequency deta hai; PTP time aur phase.</p></div>

<div class="scn"><h4>Cell sites sync se bahar ho gaye</h4><p>Aggregation upgrade ke baad kai radios ne synchronisation alarms report kiye. Naye routers traffic carry kar rahe the lekin PTP boundary clocks ke roop mein configured nahi the, isliye timing packets variable delay ke saath unse guzarte the. Sahi clock role enable karne se accuracy wapas aayi.</p><p><b>Lesson:</b> mobile transport ke liye sirf forwarding kaafi nahi; timing support service ka hissa hai.</p></div>

<div class="iv"><p class="q">"Mobile backhaul design ko bandwidth ke alawa kya chahiye?"</p><p>Kam latency, high availability, control aur user traffic ke liye QoS, aur SyncE tatha PTP se synchronisation. Transport aam taur par cell-site router se MPLS ya segment routing par L3VPN ya EVPN hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FTTH passive optical network par OLT aur ONTs use karta hai; cable CMTS.</li>
<li>BNG edge par subscriber sessions terminate karta hai.</li>
<li>N:1 aur 1:1 VLAN models VLAN space ko isolation se tolte hain.</li>
<li>Mobile transport ko kam latency aur SyncE tatha PTP synchronisation chahiye.</li>
<li>Business access dual-homing ke saath Ethernet services ya IP VPNs use karta hai.</li>
</ul></div>
`}};export{e as default};