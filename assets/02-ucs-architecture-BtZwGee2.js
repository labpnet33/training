var e={id:`architecture`,h:{en:`UCS architecture: fabric interconnects, IOMs, chassis and VICs`,hi:`UCS architecture: fabric interconnects, IOMs, chassis aur VICs`},body:{en:`
<p>Picture a large office building with two independent reception desks, desk A on the left and desk B on the right. Every room has two phone lines, one to each desk. Calls between rooms and to the outside world always pass through a desk; the corridors themselves never connect calls. If desk A closes, every room still reaches the world through desk B. A <b>UCS domain</b> is built the same way, and the two reception desks are the <b>fabric interconnects</b>.</p>

<h3>The pieces of a UCS domain</h3>
<dl class="terms">
<dt>Fabric interconnect (FI)</dt><dd>A pair of top-of-rack switches, FI-A and FI-B, that every server in the domain connects to. They carry all LAN and SAN traffic for the servers and run <b>UCS Manager</b>. Current models include the 6400 series (6454, 64108) and the 6536; older domains use the 6200 and 6300 series. Ports are <b>unified</b>: many can run as Ethernet or as Fibre Channel.</dd>
<dt>Cluster links (L1/L2)</dt><dd>Dedicated ports that join FI-A and FI-B. They carry heartbeats and configuration synchronisation only, <b>never server data</b>.</dd>
<dt>Blade chassis</dt><dd>The UCS 5108 chassis holds up to eight half-width B-Series blades (or four full-width) with shared power supplies and fans.</dd>
<dt>IOM (I/O module), also called FEX</dt><dd>Two modules at the back of each 5108 chassis (for example 2208XP, 2304, 2408). IOM A cables only to FI-A and IOM B only to FI-B. An IOM is a <b>fabric extender</b>: it has no local switching, so even two blades in the same chassis talk through the FI.</dd>
<dt>B-Series blade</dt><dd>A server in the chassis, such as the B200. It reaches both IOMs over the chassis midplane.</dd>
<dt>C-Series rack server</dt><dd>A standalone rack server that can be brought under the domain by cabling its VIC to both FIs (direct connect) or through Nexus 2000 FEXs. With <b>single-wire management</b>, one cable per fabric carries both data and management.</dd>
<dt>X-Series</dt><dd>The modular UCS X9508 chassis with X210c compute nodes, <b>Intelligent Fabric Modules</b> (IFMs, the IOM equivalent) and X-Fabric modules for PCIe devices such as GPUs. It was designed for Intersight Managed Mode; recent UCS Manager releases can also manage it.</dd>
<dt>VIC (virtual interface card)</dt><dd>Cisco's converged adapter (for example VIC 1440, 1480, 15231). It presents <b>virtual</b> PCIe devices to the OS: vNICs (Ethernet) and vHBAs (Fibre Channel), up to 256 depending on the model. The OS believes it has real NICs and HBAs.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="UCS data paths from blade to LAN and SAN">
<rect x="20" y="12" width="140" height="40" rx="8" fill="#bae6fd"/><text x="90" y="37" text-anchor="middle" class="svg-ink" font-size="13">LAN leaf A/B</text>
<rect x="190" y="12" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="250" y="37" text-anchor="middle" class="svg-ink" font-size="13">MDS fabric A</text>
<rect x="480" y="12" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="550" y="37" text-anchor="middle" class="svg-ink" font-size="13">MDS fabric B</text>
<rect x="120" y="92" width="150" height="46" rx="8" fill="#ddd6fe"/><text x="195" y="120" text-anchor="middle" class="svg-ink" font-size="13">FI-A</text>
<rect x="370" y="92" width="150" height="46" rx="8" fill="#ddd6fe"/><text x="445" y="120" text-anchor="middle" class="svg-ink" font-size="13">FI-B</text>
<line x1="270" y1="115" x2="370" y2="115" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">L1/L2 no data</text>
<line x1="150" y1="92" x2="100" y2="52" stroke="#64748b" stroke-width="2"/><line x1="220" y1="92" x2="245" y2="52" stroke="#64748b" stroke-width="2"/>
<line x1="420" y1="92" x2="110" y2="52" stroke="#64748b" stroke-width="2" stroke-dasharray="2 3"/><line x1="480" y1="92" x2="540" y2="52" stroke="#64748b" stroke-width="2"/>
<rect x="100" y="178" width="440" height="110" rx="10" fill="#e2e8f0"/><text x="320" y="198" text-anchor="middle" class="svg-muted" font-size="12">Chassis 5108</text>
<rect x="130" y="206" width="110" height="34" rx="6" fill="#fde68a"/><text x="185" y="228" text-anchor="middle" class="svg-ink" font-size="12">IOM A</text>
<rect x="400" y="206" width="110" height="34" rx="6" fill="#fde68a"/><text x="455" y="228" text-anchor="middle" class="svg-ink" font-size="12">IOM B</text>
<rect x="250" y="246" width="140" height="34" rx="6" fill="#fed7aa"/><text x="320" y="268" text-anchor="middle" class="svg-ink" font-size="12">Blade + VIC</text>
<line x1="185" y1="206" x2="185" y2="138" stroke="#64748b" stroke-width="2"/><line x1="455" y1="206" x2="455" y2="138" stroke="#64748b" stroke-width="2"/>
<line x1="250" y1="262" x2="200" y2="240" stroke="#64748b" stroke-width="2"/><line x1="390" y1="262" x2="440" y2="240" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Two fully separate paths: blade → IOM A → FI-A → LAN and SAN fabric A, and the mirror image on B. The cluster links carry no server traffic.</p></div>

<h3>Management plane and data plane are different</h3>
<p>The two FIs form a <b>cluster</b> for management: one is <b>primary</b> (runs the active UCS Manager), the other <b>subordinate</b> (standby copy, kept in sync over L1/L2). You reach UCS Manager at a <b>cluster virtual IP</b> that always points to the primary. The <b>data plane is active/active</b>: both FIs forward traffic all the time. A vNIC on fabric A uses FI-A, a vNIC on fabric B uses FI-B, regardless of which FI is primary.</p>
<pre class="out">UCS-A# show cluster state
Cluster Id: 0x4432f72a371511de-0xb97c000de1b1ada4

A: UP, PRIMARY
B: UP, SUBORDINATE

<span class="hl">HA READY</span></pre>
<p><b>HA READY</b> means both FIs are up, synchronised and able to take over management. Check it before any maintenance on an FI.</p>

<h3>End-host mode versus switch mode (Ethernet)</h3>
<p>In the default <b>end-host mode (EHM)</b> the FI does not behave like a normal switch towards the LAN. It looks to the upstream switches like one very large host with many MAC addresses:</p>
<ul>
<li>It runs <b>no spanning tree</b> on its uplinks. All uplinks forward at once.</li>
<li>Each server vNIC is <b>pinned</b> to one uplink (or uplink port-channel) that carries its VLANs. Pinning is dynamic by default, or static with LAN pin groups.</li>
<li>It learns MAC addresses only on server-facing ports and never forwards traffic from one uplink to another uplink, so it cannot create a loop. Checks called <b>deja-vu</b> and <b>RPF</b> drop frames that would come back in on the wrong uplink.</li>
</ul>
<p>In <b>switch mode</b> the FI becomes a classic Layer 2 switch that runs spanning tree towards the LAN and learns MACs on uplinks. It exists for special cases (for example directly attached Layer 2 devices), but EHM is the recommended and most common mode.</p>

<h3>End-host mode versus switch mode (Fibre Channel)</h3>
<p>For FC the same words mean something slightly different. In FC <b>end-host mode</b> the FI runs <b>NPV</b> (N-Port Virtualization): it does not become an FC switch, it proxies server logins (FLOGI) to the upstream MDS, which must have <b>NPIV</b> enabled. The FI consumes no domain ID and zoning is done on the MDS. In FC <b>switch mode</b> the FI is a full FC switch with its own domain ID; you need it when a storage array plugs directly into the FI through <b>FC storage ports</b>, and then UCS Manager can do the zoning.</p>

<div class="eg"><p><b>Worked example: chassis bandwidth.</b> A 5108 chassis with two 2408 IOMs, each with 4 × 25G links to its FI, gives 100 Gbit/s per fabric, 200 Gbit/s total for up to 8 blades, which is 25 Gbit/s per blade on average. If the chassis discovery policy is set to 2 links but you cabled 4, UCS Manager uses only 2 until you re-acknowledge the chassis, so half your cabling sits idle.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Cabling IOM A to both FIs (every IOM must go to one FI only). Expecting the L1/L2 cluster links to carry traffic between fabric A and fabric B (they never do; A-to-B traffic goes out through the upstream LAN). Configuring the upstream switches to expect spanning tree BPDUs from FIs in end-host mode.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which FI forwards data?" Both. Primary/subordinate describes only UCS Manager. IOMs do not switch locally. FC end-host mode = NPV on the FI, NPIV on the MDS.</p></div>

<div class="scn"><h4>The vMotion that crossed the building</h4><p>A team noticed that vMotion between two blades in the same chassis ran at half the expected speed. Host A's vMotion port group used vmnic0 (fabric A) while host B, built by a different engineer, used vmnic1 (fabric B) as active. Because FIs never switch between fabric A and fabric B internally, every vMotion frame left FI-A, crossed the upstream leaf pair and came back into FI-B, competing with production traffic on the uplinks. The fix was to standardise the port group: vmnic0 active and vmnic1 standby on every host, so vMotion stayed inside FI-A.</p><p><b>Lesson:</b> understanding the data path (IOM → FI, no A-to-B switching inside UCS) directly changes how you design hypervisor networking.</p></div>

<div class="iv"><p class="q">"Explain end-host mode on a fabric interconnect."</p><p>Strong answer: in EHM the FI presents itself to the LAN as a host, not a switch. It runs no STP on uplinks, pins each server vNIC to an uplink, learns MACs only from servers and never forwards uplink to uplink, which makes loops impossible and lets all uplinks forward. Mention deja-vu/RPF checks, that switch mode exists but is rare, and that the FC equivalent is NPV with NPIV on the MDS.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A domain = two FIs + chassis with IOMs/IFMs + B-, C- or X-Series servers with VICs.</li>
<li>IOM A connects only to FI-A, IOM B only to FI-B; IOMs never switch locally.</li>
<li>Management is primary/subordinate; data forwarding is active/active on both FIs.</li>
<li>End-host mode: no STP, vNICs pinned to uplinks, no uplink-to-uplink forwarding.</li>
<li>FC end-host mode is NPV (MDS needs NPIV); FC switch mode is for directly attached arrays.</li>
</ul></div>
`,hi:`
<p>Ek badi office building socho jismein do independent reception desks hain, desk A left par aur desk B right par. Har room mein do phone lines hain, har desk ke liye ek. Rooms ke beech aur bahar ki duniya ke calls hamesha kisi desk se hokar jaate hain; corridors khud kabhi call connect nahi karte. Agar desk A band ho jaaye, to har room desk B se duniya tak pahunchta hai. <b>UCS domain</b> bhi aise hi bana hota hai, aur do reception desks hain <b>fabric interconnects</b>.</p>

<h3>UCS domain ke hisse</h3>
<dl class="terms">
<dt>Fabric interconnect (FI)</dt><dd>Top-of-rack switches ka ek pair, FI-A aur FI-B, jisse domain ka har server judta hai. Yeh servers ka saara LAN aur SAN traffic le jaate hain aur <b>UCS Manager</b> chalate hain. Current models mein 6400 series (6454, 64108) aur 6536 hain; purane domains 6200 aur 6300 series use karte hain. Ports <b>unified</b> hote hain: kai ports Ethernet ya Fibre Channel dono ki tarah chal sakte hain.</dd>
<dt>Cluster links (L1/L2)</dt><dd>Dedicated ports jo FI-A aur FI-B ko jodte hain. Yeh sirf heartbeats aur configuration synchronisation le jaate hain, <b>server data kabhi nahi</b>.</dd>
<dt>Blade chassis</dt><dd>UCS 5108 chassis mein aath half-width B-Series blades (ya chaar full-width) aate hain, shared power supplies aur fans ke saath.</dd>
<dt>IOM (I/O module), jise FEX bhi kehte hain</dt><dd>Har 5108 chassis ke peeche do modules (jaise 2208XP, 2304, 2408). IOM A sirf FI-A se cable hota hai aur IOM B sirf FI-B se. IOM ek <b>fabric extender</b> hai: isme local switching nahi hoti, isliye same chassis ke do blades bhi FI ke through baat karte hain.</dd>
<dt>B-Series blade</dt><dd>Chassis ke andar ka server, jaise B200. Yeh chassis midplane se dono IOMs tak pahunchta hai.</dd>
<dt>C-Series rack server</dt><dd>Standalone rack server jise domain mein laaya ja sakta hai, uske VIC ko dono FIs se seedha cable karke (direct connect) ya Nexus 2000 FEXs ke through. <b>Single-wire management</b> ke saath har fabric ki ek cable data aur management dono le jaati hai.</dd>
<dt>X-Series</dt><dd>Modular UCS X9508 chassis, X210c compute nodes, <b>Intelligent Fabric Modules</b> (IFMs, IOM ka equivalent) aur GPUs jaise PCIe devices ke liye X-Fabric modules ke saath. Yeh Intersight Managed Mode ke liye design hua tha; recent UCS Manager releases bhi ise manage kar sakte hain.</dd>
<dt>VIC (virtual interface card)</dt><dd>Cisco ka converged adapter (jaise VIC 1440, 1480, 15231). Yeh OS ko <b>virtual</b> PCIe devices dikhata hai: vNICs (Ethernet) aur vHBAs (Fibre Channel), model ke hisaab se 256 tak. OS ko lagta hai uske paas asli NICs aur HBAs hain.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Blade se LAN aur SAN tak UCS data paths">
<rect x="20" y="12" width="140" height="40" rx="8" fill="#bae6fd"/><text x="90" y="37" text-anchor="middle" class="svg-ink" font-size="13">LAN leaf A/B</text>
<rect x="190" y="12" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="250" y="37" text-anchor="middle" class="svg-ink" font-size="13">MDS fabric A</text>
<rect x="480" y="12" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="550" y="37" text-anchor="middle" class="svg-ink" font-size="13">MDS fabric B</text>
<rect x="120" y="92" width="150" height="46" rx="8" fill="#ddd6fe"/><text x="195" y="120" text-anchor="middle" class="svg-ink" font-size="13">FI-A</text>
<rect x="370" y="92" width="150" height="46" rx="8" fill="#ddd6fe"/><text x="445" y="120" text-anchor="middle" class="svg-ink" font-size="13">FI-B</text>
<line x1="270" y1="115" x2="370" y2="115" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">L1/L2 data nahi</text>
<line x1="150" y1="92" x2="100" y2="52" stroke="#64748b" stroke-width="2"/><line x1="220" y1="92" x2="245" y2="52" stroke="#64748b" stroke-width="2"/>
<line x1="420" y1="92" x2="110" y2="52" stroke="#64748b" stroke-width="2" stroke-dasharray="2 3"/><line x1="480" y1="92" x2="540" y2="52" stroke="#64748b" stroke-width="2"/>
<rect x="100" y="178" width="440" height="110" rx="10" fill="#e2e8f0"/><text x="320" y="198" text-anchor="middle" class="svg-muted" font-size="12">Chassis 5108</text>
<rect x="130" y="206" width="110" height="34" rx="6" fill="#fde68a"/><text x="185" y="228" text-anchor="middle" class="svg-ink" font-size="12">IOM A</text>
<rect x="400" y="206" width="110" height="34" rx="6" fill="#fde68a"/><text x="455" y="228" text-anchor="middle" class="svg-ink" font-size="12">IOM B</text>
<rect x="250" y="246" width="140" height="34" rx="6" fill="#fed7aa"/><text x="320" y="268" text-anchor="middle" class="svg-ink" font-size="12">Blade + VIC</text>
<line x1="185" y1="206" x2="185" y2="138" stroke="#64748b" stroke-width="2"/><line x1="455" y1="206" x2="455" y2="138" stroke="#64748b" stroke-width="2"/>
<line x1="250" y1="262" x2="200" y2="240" stroke="#64748b" stroke-width="2"/><line x1="390" y1="262" x2="440" y2="240" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Do poori tarah alag paths: blade → IOM A → FI-A → LAN aur SAN fabric A, aur B par uska mirror. Cluster links koi server traffic nahi le jaate.</p></div>

<h3>Management plane aur data plane alag hain</h3>
<p>Dono FIs management ke liye ek <b>cluster</b> banate hain: ek <b>primary</b> hota hai (active UCS Manager chalata hai), doosra <b>subordinate</b> (standby copy, L1/L2 par sync mein). UCS Manager tak aap ek <b>cluster virtual IP</b> par pahunchte ho jo hamesha primary ki taraf point karta hai. <b>Data plane active/active hai</b>: dono FIs hamesha traffic forward karte hain. Fabric A ka vNIC FI-A use karta hai, fabric B ka vNIC FI-B, chahe primary koi bhi ho.</p>
<pre class="out">UCS-A# show cluster state
Cluster Id: 0x4432f72a371511de-0xb97c000de1b1ada4

A: UP, PRIMARY
B: UP, SUBORDINATE

<span class="hl">HA READY</span></pre>
<p><b>HA READY</b> ka matlab dono FIs up hain, synchronised hain aur management take over kar sakte hain. Kisi bhi FI par maintenance se pehle ise check karo.</p>

<h3>End-host mode vs switch mode (Ethernet)</h3>
<p>Default <b>end-host mode (EHM)</b> mein FI LAN ki taraf normal switch ki tarah behave nahi karta. Upstream switches ko woh bahut saare MAC addresses wala ek bahut bada host lagta hai:</p>
<ul>
<li>Iske uplinks par <b>koi spanning tree nahi</b> chalta. Saare uplinks ek saath forward karte hain.</li>
<li>Har server vNIC ek uplink (ya uplink port-channel) par <b>pinned</b> hota hai jo uske VLANs carry karta hai. Pinning default mein dynamic hoti hai, ya LAN pin groups se static.</li>
<li>Yeh MAC addresses sirf server-facing ports par seekhta hai aur kabhi ek uplink ka traffic doosre uplink par forward nahi karta, isliye loop nahi bana sakta. <b>Deja-vu</b> aur <b>RPF</b> naam ke checks un frames ko drop karte hain jo galat uplink par wapas aayein.</li>
</ul>
<p><b>Switch mode</b> mein FI ek classic Layer 2 switch ban jaata hai jo LAN ki taraf spanning tree chalata hai aur uplinks par MACs seekhta hai. Yeh special cases ke liye hai (jaise seedhe jude Layer 2 devices), lekin EHM hi recommended aur sabse common mode hai.</p>

<h3>End-host mode vs switch mode (Fibre Channel)</h3>
<p>FC ke liye inhi shabdon ka matlab thoda alag hai. FC <b>end-host mode</b> mein FI <b>NPV</b> (N-Port Virtualization) chalata hai: woh FC switch nahi banta, server logins (FLOGI) ko upstream MDS tak proxy karta hai, jis par <b>NPIV</b> enabled hona chahiye. FI koi domain ID nahi leta aur zoning MDS par hoti hai. FC <b>switch mode</b> mein FI apne domain ID ke saath poora FC switch hota hai; yeh tab chahiye jab storage array <b>FC storage ports</b> ke through seedha FI mein lage, aur tab UCS Manager zoning kar sakta hai.</p>

<div class="eg"><p><b>Worked example: chassis bandwidth.</b> Do 2408 IOMs wala 5108 chassis, har IOM ke 4 × 25G links apne FI tak, har fabric par 100 Gbit/s deta hai, total 200 Gbit/s aath blades tak ke liye, yaani average 25 Gbit/s har blade. Agar chassis discovery policy 2 links par set hai lekin aapne 4 cable kiye, to UCS Manager tab tak sirf 2 use karta hai jab tak aap chassis ko re-acknowledge na karo, aur aadhi cabling bekaar padi rehti hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> IOM A ko dono FIs se cable karna (har IOM sirf ek FI se jaana chahiye). Yeh expect karna ki L1/L2 cluster links fabric A aur fabric B ke beech traffic le jaayenge (kabhi nahi; A-se-B traffic upstream LAN se hokar jaata hai). Upstream switches ko end-host mode wale FIs se spanning tree BPDUs expect karne ke liye configure karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaunsa FI data forward karta hai?" Dono. Primary/subordinate sirf UCS Manager ke baare mein hai. IOMs local switching nahi karte. FC end-host mode = FI par NPV, MDS par NPIV.</p></div>

<div class="scn"><h4>Woh vMotion jo poori building ghoom aaya</h4><p>Ek team ne dekha ki same chassis ke do blades ke beech vMotion expected speed se aadhi par chal raha tha. Host A ka vMotion port group vmnic0 (fabric A) use karta tha jabki host B, jo doosre engineer ne banaya tha, vmnic1 (fabric B) ko active rakhta tha. Kyunki FIs andar fabric A aur fabric B ke beech kabhi switch nahi karte, har vMotion frame FI-A se nikal kar upstream leaf pair cross karta aur FI-B mein wapas aata, uplinks par production traffic se muqabla karte hue. Fix tha port group ko standardise karna: har host par vmnic0 active aur vmnic1 standby, taaki vMotion FI-A ke andar hi rahe.</p><p><b>Seekh:</b> data path samajhna (IOM → FI, UCS ke andar A-se-B switching nahi) seedha badal deta hai ki aap hypervisor networking kaise design karte ho.</p></div>

<div class="iv"><p class="q">"Fabric interconnect par end-host mode explain karo."</p><p>Strong answer: EHM mein FI khud ko LAN ke saamne switch nahi, host ki tarah dikhata hai. Uplinks par STP nahi chalata, har server vNIC ko ek uplink par pin karta hai, MACs sirf servers se seekhta hai aur kabhi uplink se uplink forward nahi karta, jisse loops impossible ho jaate hain aur saare uplinks forward karte hain. Deja-vu/RPF checks mention karo, yeh ki switch mode hai par rare hai, aur yeh ki FC equivalent NPV hai jiske liye MDS par NPIV chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain = do FIs + IOMs/IFMs wale chassis + VICs wale B-, C- ya X-Series servers.</li>
<li>IOM A sirf FI-A se judta hai, IOM B sirf FI-B se; IOMs kabhi local switching nahi karte.</li>
<li>Management primary/subordinate hai; data forwarding dono FIs par active/active hai.</li>
<li>End-host mode: STP nahi, vNICs uplinks par pinned, uplink-se-uplink forwarding nahi.</li>
<li>FC end-host mode NPV hai (MDS ko NPIV chahiye); FC switch mode seedhe jude arrays ke liye hai.</li>
</ul></div>
`}};export{e as default};