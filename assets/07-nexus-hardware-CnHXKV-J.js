var e={id:`nexus-hardware`,h:{en:`Cisco Nexus hardware: families, chassis and ports`,hi:`Cisco Nexus hardware: families, chassis aur ports`},body:{en:`
<p>A transport company runs two kinds of vehicles: small vans that do one job well and cost little, and large buses whose seats, engines and doors can be replaced or upgraded while the bus stays in service. Cisco Nexus switches come in the same two shapes, <b>fixed</b> and <b>modular</b>. In this chapter you will learn the families, what is inside a chassis, how to read model names and port speeds, and how to choose leaves and spines.</p>

<h3>The Nexus families</h3>
<table class="cmp"><tr><th>Family</th><th>Form</th><th>Typical role</th><th>Status</th></tr>
<tr><td><b>Nexus 9300</b></td><td>Fixed, 1RU or 2RU</td><td>Leaf; spine in small and medium fabrics</td><td>Current</td></tr>
<tr><td><b>Nexus 9500</b></td><td>Modular (9504, 9508, 9516)</td><td>Spine or core in large fabrics</td><td>Current</td></tr>
<tr><td><b>Nexus 9800</b></td><td>Modular (9804, 9808)</td><td>High-density 400G/800G spine</td><td>Current</td></tr>
<tr><td><b>Nexus 3000</b></td><td>Fixed</td><td>Simple ToR, ultra-low-latency (trading)</td><td>Current, NX-OS only</td></tr>
<tr><td><b>Nexus 7000 / 7700</b></td><td>Modular</td><td>Aggregation and core; VDCs, OTV, FabricPath</td><td>Legacy (end of sale)</td></tr>
<tr><td><b>Nexus 5000/5600 + 2000 FEX</b></td><td>Fixed + fabric extenders</td><td>Access with remote line cards</td><td>Legacy</td></tr></table>

<h3>Nexus 9000: NX-OS mode or ACI mode</h3>
<p>The Nexus 9000 family can run two different software images:</p>
<ul>
<li><b>NX-OS mode</b> (standalone): you configure each switch with the CLI or automation. VXLAN EVPN fabrics are built this way, often managed with Nexus Dashboard Fabric Controller.</li>
<li><b>ACI mode</b>: the switches run the ACI image and are managed only through the <b>APIC</b> controller cluster. You do not configure them one by one.</li>
</ul>
<p>Not every model supports both modes, and switching modes means reinstalling the software image, not typing a command. Always check the model's support before buying for ACI.</p>

<h3>Inside a modular chassis</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Modular chassis components">
<rect x="20" y="15" width="170" height="200" rx="8" fill="#e2e8f0"/><text x="105" y="36" text-anchor="middle" class="svg-ink" font-size="13">Line cards (front)</text>
<rect x="35" y="50" width="140" height="26" rx="4" fill="#bae6fd"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="12">LC 1: 36 x 100G</text>
<rect x="35" y="84" width="140" height="26" rx="4" fill="#bae6fd"/><text x="105" y="102" text-anchor="middle" class="svg-ink" font-size="12">LC 2: 36 x 100G</text>
<rect x="35" y="118" width="140" height="26" rx="4" fill="#bae6fd"/><text x="105" y="136" text-anchor="middle" class="svg-ink" font-size="12">LC 3 ...</text>
<rect x="35" y="160" width="140" height="22" rx="4" fill="#ddd6fe"/><text x="105" y="176" text-anchor="middle" class="svg-ink" font-size="12">Supervisor A</text>
<rect x="35" y="186" width="140" height="22" rx="4" fill="#ddd6fe"/><text x="105" y="202" text-anchor="middle" class="svg-ink" font-size="12">Supervisor B</text>
<rect x="250" y="15" width="170" height="200" rx="8" fill="#e2e8f0"/><text x="335" y="36" text-anchor="middle" class="svg-ink" font-size="13">Fabric modules (rear)</text>
<rect x="265" y="50" width="140" height="24" rx="4" fill="#fde68a"/><text x="335" y="67" text-anchor="middle" class="svg-ink" font-size="12">FM 1</text>
<rect x="265" y="80" width="140" height="24" rx="4" fill="#fde68a"/><text x="335" y="97" text-anchor="middle" class="svg-ink" font-size="12">FM 2</text>
<rect x="265" y="110" width="140" height="24" rx="4" fill="#fde68a"/><text x="335" y="127" text-anchor="middle" class="svg-ink" font-size="12">FM 3 ... FM 6</text>
<rect x="265" y="150" width="140" height="24" rx="4" fill="#fed7aa"/><text x="335" y="167" text-anchor="middle" class="svg-ink" font-size="12">Fans, power</text>
<line x1="175" y1="63" x2="265" y2="62" stroke="#64748b" stroke-width="2"/><line x1="175" y1="97" x2="265" y2="92" stroke="#64748b" stroke-width="2"/><line x1="175" y1="63" x2="265" y2="122" stroke="#64748b" stroke-width="2"/><line x1="175" y1="97" x2="265" y2="62" stroke="#64748b" stroke-width="2"/>
<text x="530" y="90" text-anchor="middle" class="svg-accent" font-size="12">Every line card</text><text x="530" y="108" text-anchor="middle" class="svg-accent" font-size="12">to every fabric</text><text x="530" y="126" text-anchor="middle" class="svg-accent" font-size="12">module: a Clos</text><text x="530" y="144" text-anchor="middle" class="svg-accent" font-size="12">inside the box</text>
</svg><p class="cap">A modular chassis is itself a small Clos: line cards are the leaves, fabric modules are the spines.</p></div>
<ul>
<li><b>Supervisor engines.</b> The brain: they run NX-OS, the routing protocols and management. Install two for redundancy (one active, one standby).</li>
<li><b>Line cards.</b> Hold the front-panel ports and the forwarding ASICs that switch packets in hardware.</li>
<li><b>Fabric modules.</b> Connect every line card to every other line card. More fabric modules means more internal bandwidth and redundancy.</li>
<li><b>System controllers</b> (on Nexus 9500), <b>power supplies</b> and <b>fan trays</b>, all hot-swappable.</li>
</ul>
<pre class="out">SPINE-9508# show module
Mod Ports             Module-Type                      Model           Status
--- ----- ------------------------------------- --------------------- ---------
1    36   36x100G Ethernet Module               N9K-X9736C-FX         ok
2    36   36x100G Ethernet Module               N9K-X9736C-FX         ok
22   0    8-slot (100G) Fabric Module           N9K-C9508-FM-E        ok
<span class="hl">27   0    Supervisor Module                     N9K-SUP-B             active *
28   0    Supervisor Module                     N9K-SUP-B             ha-standby</span>
29   0    System Controller                     N9K-SC-A              active</pre>
<p>A <b>fixed</b> switch has everything on one board: one control plane, fixed ports, one or a few ASICs. It is cheaper, smaller and uses less power, but a failed switch is replaced as a whole and there is no second supervisor.</p>
<table class="cmp"><tr><th></th><th>Fixed (9300)</th><th>Modular (9500/9800)</th></tr>
<tr><td>Ports</td><td>Fixed, up to about 64</td><td>Hundreds, add line cards</td></tr>
<tr><td>Control plane redundancy</td><td>No (rely on the fabric)</td><td>Dual supervisors</td></tr>
<tr><td>Cost, power, space</td><td>Low</td><td>High</td></tr>
<tr><td>Typical use</td><td>Leaves, small/medium spines</td><td>Large spines and cores</td></tr></table>
<p>In a spine-leaf fabric, redundancy mostly comes from having <b>many</b> spines, so fixed spines are very common. Modular spines are chosen when you need a very high port count (many leaves) in one box.</p>

<h3>ASICs and model names (concept level)</h3>
<p>The forwarding ASIC decides speeds, table sizes, buffers and features such as VXLAN, telemetry and MACsec. Cisco's <b>Cloud Scale</b> ASIC generations show up as model suffixes: <b>-EX</b>, <b>-FX</b>, <b>-FX2</b>, <b>-FX3</b>, <b>-GX</b>, <b>-GX2</b>, with later letters adding features and speeds (GX brought 400G). Newer platforms such as the Nexus 9800 use Cisco <b>Silicon One</b>. You do not need ASIC internals for this exam, but you should know that the suffix tells you the generation and that mixing generations can limit which features the fabric can use.</p>
<p>A useful decoding pattern in Nexus 9300 names: <b>Y</b> = 25G ports, <b>C</b> = 100G, <b>D</b> = 400G, <b>T</b> = 10GBASE-T copper. So a 93180YC-FX has 48 × 25G (Y) and 6 × 100G (C) ports; a 9364C-GX has 64 × 100G; a 9332D-GX2B has 32 × 400G.</p>

<h3>Port speeds, optics and breakout</h3>
<ul>
<li><b>SFP28</b>: 25G (also runs 10G). Typical server port.</li>
<li><b>QSFP28</b>: 100G. Typical uplink and spine port.</li>
<li><b>QSFP-DD</b> and <b>OSFP</b>: 400G and 800G.</li>
</ul>
<p>A high-speed port can be split into several lower-speed ports with a <b>breakout</b> cable: 100G into 4 × 25G or 4 × 10G, 400G into 4 × 100G. On NX-OS the parent port disappears and sub-ports appear with a third number.</p>
<pre class="code"><span class="c">! Split port 49 into four 25G ports</span>
interface breakout module 1 port 49 map 25g-4x</pre>
<pre class="out">LEAF1# show interface brief | include Eth1/49
<span class="hl">Eth1/49/1     1       eth  access down    Link not connected         auto(D) --
Eth1/49/2     1       eth  access down    Link not connected         auto(D) --</span>
Eth1/49/3     1       eth  access down    Link not connected         auto(D) --
Eth1/49/4     1       eth  access down    Link not connected         auto(D) --</pre>

<h3>Choosing leaf and spine models</h3>
<ul>
<li><b>Leaf</b>: server port speed and count (for example 48 × 25G), enough uplinks for your target ratio and spine count (6 or 8 × 100G/400G), the features you need (VXLAN EVPN, FC/FCoE for storage, deeper buffers), and ACI support if relevant.</li>
<li><b>Spine</b>: port count at uplink speed (this caps the number of leaves), matching speed to leaf uplinks, and a model that supports the fabric mode. Fixed for small and medium fabrics; modular when one box must terminate hundreds of leaves.</li>
<li>Keep generations consistent across the fabric, and plan optics and cabling (multimode vs single-mode) at the same time as switches.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Buying NX-OS-only models for an ACI project. Running a breakout command on a port that is already an uplink. Forgetting that breakout ports use a new name (Ethernet1/49/1). Choosing spines by bandwidth only and ignoring port count.</p></div>
<div class="exam"><p><b>Exam tip.</b> Nexus 9000 runs NX-OS mode or ACI mode (different images). Modular chassis = supervisors, line cards, fabric modules, system controllers, power, fans. Fixed switches suit leaves; modular suits large spines. Breakout: 100G into 4 × 25G or 4 × 10G.</p></div>

<div class="scn"><h4>The breakout on the wrong port</h4><p>A storage team needed four extra 25G ports on LEAF6. A junior engineer ran <code>interface breakout module 1 port 49 map 25g-4x</code>. Within seconds the OSPF neighbor to SPINE1 went down: Ethernet1/49 was an uplink, and breaking it out removed the interface and its configuration. <code>show ip ospf neighbors</code> showed three neighbors instead of four, and the leaf ran on 3/4 of its uplink bandwidth. The engineer reversed the change with <code>no interface breakout module 1 port 49 map 25g-4x</code>, restored the uplink configuration from the backup, and performed the breakout on unused port 53 instead.</p><p><b>Lesson:</b> confirm a port's role (description, <code>show cdp neighbors</code> or <code>show lldp neighbors</code>) before a breakout, and take a configuration checkpoint first.</p></div>

<div class="iv"><p class="q">"How would you choose leaf and spine switches for a new fabric?"</p><p>Strong answer: start from the servers. Pick a leaf with the right server port speed and count, and enough uplinks for the target oversubscription and number of spines. Pick spines by port count at uplink speed, because that caps the number of leaves, and by growth plans. Check the operating mode (NX-OS or ACI), the features (VXLAN EVPN, FC, buffers), and keep ASIC generations consistent. Mention fixed spines for most fabrics and modular spines when a single box must terminate many leaves.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Nexus 9300 (fixed) and 9500/9800 (modular) are the current fabric switches; 3000 serves simple and low-latency roles; 7000/7700 and 5000/2000 are legacy.</li>
<li>Nexus 9000 runs either NX-OS mode or ACI mode, with different images.</li>
<li>A modular chassis contains supervisors, line cards, fabric modules, system controllers, power and fans.</li>
<li>Model suffixes (EX, FX, GX) show the ASIC generation; Y, C and D hint at 25G, 100G and 400G ports.</li>
<li>Breakout splits 100G into 4 × 25G or 4 × 10G and renames the port (Ethernet1/49/1).</li>
</ul></div>
`,hi:`
<p>Ek transport company do tarah ki gaadiyan chalati hai: chhoti vans jo ek kaam achhe se karti hain aur sasti hain, aur badi buses jinki seats, engines aur darwaze bus ko service mein rakhte hue replace ya upgrade kiye ja sakte hain. Cisco Nexus switches bhi inhi do shapes mein aate hain, <b>fixed</b> aur <b>modular</b>. Is chapter mein aap families, chassis ke andar kya hota hai, model names aur port speeds kaise padhein, aur leaves aur spines kaise chunein, yeh seekhoge.</p>

<h3>Nexus families</h3>
<table class="cmp"><tr><th>Family</th><th>Form</th><th>Typical role</th><th>Status</th></tr>
<tr><td><b>Nexus 9300</b></td><td>Fixed, 1RU ya 2RU</td><td>Leaf; small aur medium fabrics mein spine</td><td>Current</td></tr>
<tr><td><b>Nexus 9500</b></td><td>Modular (9504, 9508, 9516)</td><td>Bade fabrics mein spine ya core</td><td>Current</td></tr>
<tr><td><b>Nexus 9800</b></td><td>Modular (9804, 9808)</td><td>High-density 400G/800G spine</td><td>Current</td></tr>
<tr><td><b>Nexus 3000</b></td><td>Fixed</td><td>Simple ToR, ultra-low-latency (trading)</td><td>Current, sirf NX-OS</td></tr>
<tr><td><b>Nexus 7000 / 7700</b></td><td>Modular</td><td>Aggregation aur core; VDCs, OTV, FabricPath</td><td>Legacy (end of sale)</td></tr>
<tr><td><b>Nexus 5000/5600 + 2000 FEX</b></td><td>Fixed + fabric extenders</td><td>Remote line cards ke saath access</td><td>Legacy</td></tr></table>

<h3>Nexus 9000: NX-OS mode ya ACI mode</h3>
<p>Nexus 9000 family do alag software images chala sakti hai:</p>
<ul>
<li><b>NX-OS mode</b> (standalone): aap har switch ko CLI ya automation se configure karte ho. VXLAN EVPN fabrics aise hi bante hain, aksar Nexus Dashboard Fabric Controller se manage hote hain.</li>
<li><b>ACI mode</b>: switches ACI image chalate hain aur sirf <b>APIC</b> controller cluster se manage hote hain. Aap unhe ek-ek karke configure nahi karte.</li>
</ul>
<p>Har model dono modes support nahi karta, aur mode badalne ka matlab software image reinstall karna hai, koi command type karna nahi. ACI ke liye khareedne se pehle hamesha model ka support check karo.</p>

<h3>Modular chassis ke andar</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Modular chassis components">
<rect x="20" y="15" width="170" height="200" rx="8" fill="#e2e8f0"/><text x="105" y="36" text-anchor="middle" class="svg-ink" font-size="13">Line cards (aage)</text>
<rect x="35" y="50" width="140" height="26" rx="4" fill="#bae6fd"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="12">LC 1: 36 x 100G</text>
<rect x="35" y="84" width="140" height="26" rx="4" fill="#bae6fd"/><text x="105" y="102" text-anchor="middle" class="svg-ink" font-size="12">LC 2: 36 x 100G</text>
<rect x="35" y="118" width="140" height="26" rx="4" fill="#bae6fd"/><text x="105" y="136" text-anchor="middle" class="svg-ink" font-size="12">LC 3 ...</text>
<rect x="35" y="160" width="140" height="22" rx="4" fill="#ddd6fe"/><text x="105" y="176" text-anchor="middle" class="svg-ink" font-size="12">Supervisor A</text>
<rect x="35" y="186" width="140" height="22" rx="4" fill="#ddd6fe"/><text x="105" y="202" text-anchor="middle" class="svg-ink" font-size="12">Supervisor B</text>
<rect x="250" y="15" width="170" height="200" rx="8" fill="#e2e8f0"/><text x="335" y="36" text-anchor="middle" class="svg-ink" font-size="13">Fabric modules (peeche)</text>
<rect x="265" y="50" width="140" height="24" rx="4" fill="#fde68a"/><text x="335" y="67" text-anchor="middle" class="svg-ink" font-size="12">FM 1</text>
<rect x="265" y="80" width="140" height="24" rx="4" fill="#fde68a"/><text x="335" y="97" text-anchor="middle" class="svg-ink" font-size="12">FM 2</text>
<rect x="265" y="110" width="140" height="24" rx="4" fill="#fde68a"/><text x="335" y="127" text-anchor="middle" class="svg-ink" font-size="12">FM 3 ... FM 6</text>
<rect x="265" y="150" width="140" height="24" rx="4" fill="#fed7aa"/><text x="335" y="167" text-anchor="middle" class="svg-ink" font-size="12">Fans, power</text>
<line x1="175" y1="63" x2="265" y2="62" stroke="#64748b" stroke-width="2"/><line x1="175" y1="97" x2="265" y2="92" stroke="#64748b" stroke-width="2"/><line x1="175" y1="63" x2="265" y2="122" stroke="#64748b" stroke-width="2"/><line x1="175" y1="97" x2="265" y2="62" stroke="#64748b" stroke-width="2"/>
<text x="530" y="90" text-anchor="middle" class="svg-accent" font-size="12">Har line card</text><text x="530" y="108" text-anchor="middle" class="svg-accent" font-size="12">har fabric module</text><text x="530" y="126" text-anchor="middle" class="svg-accent" font-size="12">se: box ke andar</text><text x="530" y="144" text-anchor="middle" class="svg-accent" font-size="12">ek Clos</text>
</svg><p class="cap">Modular chassis khud ek chhota Clos hai: line cards leaves hain, fabric modules spines hain.</p></div>
<ul>
<li><b>Supervisor engines.</b> Dimaag: yeh NX-OS, routing protocols aur management chalate hain. Redundancy ke liye do lagao (ek active, ek standby).</li>
<li><b>Line cards.</b> Front-panel ports aur forwarding ASICs rakhte hain jo hardware mein packets switch karte hain.</li>
<li><b>Fabric modules.</b> Har line card ko har dusre line card se jodte hain. Zyada fabric modules matlab zyada internal bandwidth aur redundancy.</li>
<li><b>System controllers</b> (Nexus 9500 par), <b>power supplies</b> aur <b>fan trays</b>, sab hot-swappable.</li>
</ul>
<pre class="out">SPINE-9508# show module
Mod Ports             Module-Type                      Model           Status
--- ----- ------------------------------------- --------------------- ---------
1    36   36x100G Ethernet Module               N9K-X9736C-FX         ok
2    36   36x100G Ethernet Module               N9K-X9736C-FX         ok
22   0    8-slot (100G) Fabric Module           N9K-C9508-FM-E        ok
<span class="hl">27   0    Supervisor Module                     N9K-SUP-B             active *
28   0    Supervisor Module                     N9K-SUP-B             ha-standby</span>
29   0    System Controller                     N9K-SC-A              active</pre>
<p><b>Fixed</b> switch mein sab kuch ek board par hota hai: ek control plane, fixed ports, ek ya kuch ASICs. Yeh sasta, chhota aur kam power lene wala hai, lekin fail hone par poora switch replace hota hai aur koi dusra supervisor nahi hota.</p>
<table class="cmp"><tr><th></th><th>Fixed (9300)</th><th>Modular (9500/9800)</th></tr>
<tr><td>Ports</td><td>Fixed, lagbhag 64 tak</td><td>Sainkdon, line cards jodo</td></tr>
<tr><td>Control plane redundancy</td><td>Nahi (fabric par bharosa)</td><td>Dual supervisors</td></tr>
<tr><td>Cost, power, space</td><td>Kam</td><td>Zyada</td></tr>
<tr><td>Typical use</td><td>Leaves, small/medium spines</td><td>Bade spines aur cores</td></tr></table>
<p>Spine-leaf fabric mein redundancy zyada tar <b>kai</b> spines hone se aati hai, isliye fixed spines bahut common hain. Modular spines tab chune jaate hain jab ek box mein bahut zyada port count (bahut saare leaves) chahiye.</p>

<h3>ASICs aur model names (concept level)</h3>
<p>Forwarding ASIC speeds, table sizes, buffers aur VXLAN, telemetry aur MACsec jaise features tay karta hai. Cisco ki <b>Cloud Scale</b> ASIC generations model suffixes mein dikhti hain: <b>-EX</b>, <b>-FX</b>, <b>-FX2</b>, <b>-FX3</b>, <b>-GX</b>, <b>-GX2</b>, baad ke letters features aur speeds jodte hain (GX 400G laaya). Nexus 9800 jaise naye platforms Cisco <b>Silicon One</b> use karte hain. Is exam ke liye ASIC internals nahi chahiye, lekin yeh pata hona chahiye ki suffix generation batata hai aur generations mix karne se fabric ke features limit ho sakte hain.</p>
<p>Nexus 9300 names mein ek useful decoding pattern: <b>Y</b> = 25G ports, <b>C</b> = 100G, <b>D</b> = 400G, <b>T</b> = 10GBASE-T copper. To 93180YC-FX mein 48 × 25G (Y) aur 6 × 100G (C) ports hain; 9364C-GX mein 64 × 100G; 9332D-GX2B mein 32 × 400G.</p>

<h3>Port speeds, optics aur breakout</h3>
<ul>
<li><b>SFP28</b>: 25G (10G bhi chalata hai). Typical server port.</li>
<li><b>QSFP28</b>: 100G. Typical uplink aur spine port.</li>
<li><b>QSFP-DD</b> aur <b>OSFP</b>: 400G aur 800G.</li>
</ul>
<p>High-speed port ko <b>breakout</b> cable se kai low-speed ports mein toda ja sakta hai: 100G ko 4 × 25G ya 4 × 10G mein, 400G ko 4 × 100G mein. NX-OS par parent port gayab ho jaata hai aur teesre number ke saath sub-ports dikhte hain.</p>
<pre class="code"><span class="c">! Port 49 ko chaar 25G ports mein todo</span>
interface breakout module 1 port 49 map 25g-4x</pre>
<pre class="out">LEAF1# show interface brief | include Eth1/49
<span class="hl">Eth1/49/1     1       eth  access down    Link not connected         auto(D) --
Eth1/49/2     1       eth  access down    Link not connected         auto(D) --</span>
Eth1/49/3     1       eth  access down    Link not connected         auto(D) --
Eth1/49/4     1       eth  access down    Link not connected         auto(D) --</pre>

<h3>Leaf aur spine models chunna</h3>
<ul>
<li><b>Leaf</b>: server port speed aur count (jaise 48 × 25G), target ratio aur spine count ke liye kaafi uplinks (6 ya 8 × 100G/400G), zaroori features (VXLAN EVPN, storage ke liye FC/FCoE, deeper buffers), aur relevant ho to ACI support.</li>
<li><b>Spine</b>: uplink speed par port count (yeh leaves ki sankhya ko cap karta hai), leaf uplinks se matching speed, aur aisa model jo fabric mode support kare. Small aur medium fabrics ke liye fixed; modular tab jab ek box ko sainkdon leaves terminate karne hon.</li>
<li>Poore fabric mein generations consistent rakho, aur switches ke saath hi optics aur cabling (multimode vs single-mode) plan karo.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> ACI project ke liye sirf NX-OS wale models khareedna. Aise port par breakout command chalana jo pehle se uplink hai. Yeh bhoolna ki breakout ports naya naam use karte hain (Ethernet1/49/1). Spines ko sirf bandwidth se chunna aur port count ignore karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> Nexus 9000 NX-OS mode ya ACI mode chalata hai (alag images). Modular chassis = supervisors, line cards, fabric modules, system controllers, power, fans. Fixed switches leaves ke liye theek hain; modular bade spines ke liye. Breakout: 100G ko 4 × 25G ya 4 × 10G mein.</p></div>

<div class="scn"><h4>Galat port par breakout</h4><p>Storage team ko LEAF6 par chaar extra 25G ports chahiye the. Ek junior engineer ne <code>interface breakout module 1 port 49 map 25g-4x</code> chala diya. Kuch hi seconds mein SPINE1 ka OSPF neighbor down ho gaya: Ethernet1/49 ek uplink tha, aur use break out karne se interface aur uski configuration hat gayi. <code>show ip ospf neighbors</code> ne chaar ki jagah teen neighbors dikhaye, aur leaf apni uplink bandwidth ke 3/4 par chal raha tha. Engineer ne <code>no interface breakout module 1 port 49 map 25g-4x</code> se change reverse kiya, backup se uplink configuration restore ki, aur breakout unused port 53 par kiya.</p><p><b>Seekh:</b> breakout se pehle port ka role confirm karo (description, <code>show cdp neighbors</code> ya <code>show lldp neighbors</code>), aur pehle configuration checkpoint lo.</p></div>

<div class="iv"><p class="q">"Naye fabric ke liye aap leaf aur spine switches kaise chunoge?"</p><p>Strong answer: servers se shuru karo. Sahi server port speed aur count wala leaf chuno, aur target oversubscription aur spines ki sankhya ke liye kaafi uplinks. Spines ko uplink speed par port count se chuno, kyunki woh leaves ki sankhya cap karta hai, aur growth plans se. Operating mode (NX-OS ya ACI), features (VXLAN EVPN, FC, buffers) check karo, aur ASIC generations consistent rakho. Zyada tar fabrics ke liye fixed spines aur jab ek box ko bahut saare leaves terminate karne hon tab modular spines ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Nexus 9300 (fixed) aur 9500/9800 (modular) current fabric switches hain; 3000 simple aur low-latency roles ke liye; 7000/7700 aur 5000/2000 legacy hain.</li>
<li>Nexus 9000 NX-OS mode ya ACI mode chalata hai, alag images ke saath.</li>
<li>Modular chassis mein supervisors, line cards, fabric modules, system controllers, power aur fans hote hain.</li>
<li>Model suffixes (EX, FX, GX) ASIC generation dikhate hain; Y, C aur D 25G, 100G aur 400G ports ka hint dete hain.</li>
<li>Breakout 100G ko 4 × 25G ya 4 × 10G mein todta hai aur port ka naam badal deta hai (Ethernet1/49/1).</li>
</ul></div>
`}};export{e as default};