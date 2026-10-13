var e=e=>`<div class="dia"><svg viewBox="0 0 640 345" role="img" aria-label="`+e.alt+`"><rect x="150" y="10" width="140" height="40" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="220" y="35" text-anchor="middle" class="svg-ink" font-size="13">`+e.n1+`</text><rect x="350" y="10" width="140" height="40" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="420" y="35" text-anchor="middle" class="svg-ink" font-size="13">`+e.n2+`</text><line x1="290" y1="30" x2="350" y2="30" stroke="#64748b" stroke-dasharray="4 3"/><text x="320" y="22" text-anchor="middle" class="svg-muted" font-size="11">`+e.peer+`</text><rect x="10" y="10" width="110" height="40" rx="6" fill="#fde68a" stroke="#64748b"/><text x="65" y="35" text-anchor="middle" class="svg-ink" font-size="13">`+e.ma+`</text><rect x="520" y="10" width="110" height="40" rx="6" fill="#fde68a" stroke="#64748b"/><text x="575" y="35" text-anchor="middle" class="svg-ink" font-size="13">`+e.mb+`</text><rect x="100" y="120" width="160" height="46" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="180" y="140" text-anchor="middle" class="svg-ink" font-size="13">`+e.fa+`</text><text x="180" y="157" text-anchor="middle" class="svg-muted" font-size="12">`+e.mode+`</text><rect x="380" y="120" width="160" height="46" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="460" y="140" text-anchor="middle" class="svg-ink" font-size="13">`+e.fb+`</text><text x="460" y="157" text-anchor="middle" class="svg-muted" font-size="12">`+e.mode+`</text><line x1="260" y1="143" x2="380" y2="143" stroke="#64748b" stroke-dasharray="2 3"/><text x="320" y="137" text-anchor="middle" class="svg-muted" font-size="11">L1 / L2</text><line x1="160" y1="120" x2="210" y2="50" stroke="#0369a1" stroke-width="3"/><line x1="200" y1="120" x2="400" y2="50" stroke="#0369a1" stroke-width="3"/><line x1="420" y1="120" x2="240" y2="50" stroke="#0369a1" stroke-width="3"/><line x1="480" y1="120" x2="440" y2="50" stroke="#0369a1" stroke-width="3"/><line x1="120" y1="120" x2="75" y2="50" stroke="#15803d" stroke-width="3"/><line x1="520" y1="120" x2="565" y2="50" stroke="#15803d" stroke-width="3"/><text x="320" y="85" text-anchor="middle" class="svg-muted" font-size="12">`+e.pc+`</text><rect x="100" y="205" width="440" height="85" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="12">`+e.ch+`</text><rect x="115" y="232" width="100" height="44" rx="5" fill="#fed7aa" stroke="#64748b"/><text x="165" y="252" text-anchor="middle" class="svg-ink" font-size="13">`+e.ioa+`</text><text x="165" y="268" text-anchor="middle" class="svg-muted" font-size="11">`+e.ioa2+`</text><rect x="425" y="232" width="100" height="44" rx="5" fill="#fed7aa" stroke="#64748b"/><text x="475" y="252" text-anchor="middle" class="svg-ink" font-size="13">`+e.iob+`</text><text x="475" y="268" text-anchor="middle" class="svg-muted" font-size="11">`+e.ioa2+`</text><rect x="250" y="232" width="140" height="44" rx="5" fill="#bbf7d0" stroke="#64748b"/><text x="320" y="252" text-anchor="middle" class="svg-ink" font-size="13">`+e.bl+`</text><text x="320" y="268" text-anchor="middle" class="svg-muted" font-size="11">VIC 2 x 10G / fabric</text><line x1="165" y1="205" x2="165" y2="166" stroke="#0369a1" stroke-width="2"/><line x1="475" y1="205" x2="475" y2="166" stroke="#0369a1" stroke-width="2"/><line x1="215" y1="254" x2="250" y2="254" stroke="#64748b"/><line x1="390" y1="254" x2="425" y2="254" stroke="#64748b"/><rect x="30" y="310" width="14" height="14" fill="#bae6fd" stroke="#64748b"/><text x="50" y="322" class="svg-muted" font-size="12">`+e.l1+`</text><rect x="150" y="310" width="14" height="14" fill="#ddd6fe" stroke="#64748b"/><text x="170" y="322" class="svg-muted" font-size="12">`+e.l2+`</text><rect x="290" y="310" width="14" height="14" fill="#fed7aa" stroke="#64748b"/><text x="310" y="322" class="svg-muted" font-size="12">`+e.l3+`</text><rect x="400" y="310" width="14" height="14" fill="#fde68a" stroke="#64748b"/><text x="420" y="322" class="svg-muted" font-size="12">`+e.l4+`</text><line x1="500" y1="317" x2="530" y2="317" stroke="#15803d" stroke-width="3"/><text x="536" y="322" class="svg-muted" font-size="12">`+e.l5+`</text></svg><p class="cap">`+e.cap+`</p></div>`,t={id:`uplink-server-connectivity`,h:{en:`Uplink and server connectivity design: VIC, vPC and oversubscription`,hi:`Uplink aur server connectivity design: VIC, vPC aur oversubscription`},body:{en:`
<h3>The customer case: Skyline Media</h3>
<p>Skyline Media renders and streams video. It is buying one UCS domain with two 6454 fabric interconnects (FIs) and four chassis of eight B-series blades each, running ESXi. The network team runs a pair of Nexus switches in a vPC domain. The storage team runs two MDS switches, one per fabric. At go-live the render hosts pulled 9 Gbps each in bursts, and the first design gave 40 Gbps of chassis links per fabric to eight hosts.</p>
<p><b>Requirements:</b> no single point of failure; render hosts must reach about 8 Gbps sustained; storage reachable by Fibre Channel on both fabrics; jumbo frames for NFS-based media. <b>Constraints:</b> the upstream pair cannot be changed; the FIs may not become a transit path between the two upstream switches; budget allows at most 8 uplink cables per FI to the LAN.</p>

<h3>Beginner view: the road from the VM to the wall</h3>
<p>A packet leaves a virtual machine, goes through the host's <b>VIC</b> (Virtual Interface Card, the Cisco adapter that creates many virtual NICs and HBAs in hardware), travels over the blade backplane to the <b>IOM</b> (I/O Module, a fabric extender inside the chassis), crosses the <b>FEX links</b> to the FI, and leaves on the FI uplinks to the data center network. Every stage has a bandwidth. The weakest stage under load is the bottleneck, and the ratio of sold bandwidth to real bandwidth is the <b>oversubscription ratio</b>.</p>
`+e({alt:`UCS uplink and server connectivity`,n1:`Nexus 1`,n2:`Nexus 2`,peer:`vPC peer link`,ma:`MDS A`,mb:`MDS B`,fa:`FI-A`,fb:`FI-B`,mode:`end-host mode`,pc:`LACP port-channels to vPC pair`,ch:`Chassis`,ioa:`IOM A`,iob:`IOM B`,ioa2:`FEX links`,bl:`Blade + VIC`,l1:`FI`,l2:`LAN switch`,l3:`IOM`,l4:`SAN switch`,l5:`FC uplink`,cap:`Each FI sends one LACP port-channel to the vPC pair. FC uplinks stay on their own fabric. FI-A and FI-B share only the L1 and L2 cluster links, never user traffic.`})+`
<h3>The design rules you must know</h3>
<ul>
<li><b>Two fabrics, A and B.</b> Each blade has a path to both. The FIs are joined by L1 and L2 links only for cluster heartbeat and database sync. Do not cable data between the FIs.</li>
<li><b>Ethernet end-host mode (EHM)</b> is the default and the usual choice. The FI looks like a big host to the LAN: it does not run Spanning Tree toward the uplinks, it pins server vNICs to uplinks, and it prevents loops with deja vu checking and reverse path forwarding. Switch mode is rare and brings the FI into Spanning Tree.</li>
<li><b>Uplinks:</b> bundle them in an LACP port-channel per FI to the upstream vPC pair. The vPC lives on the Nexus side. The FI itself does not form a vPC.</li>
<li><b>FC mode:</b> in FC end-host mode (NPV) the FI logs in to the MDS through NPIV. Use FC port-channels where supported and keep VSAN A on fabric A and VSAN B on fabric B. Unified ports can be Ethernet or FC; changing the FC range restarts the module or FI, so plan a window.</li>
<li><b>Chassis links:</b> the chassis discovery policy chooses the minimum number of links and whether links are grouped into a port-channel. A port-channel survives a link loss without re-pinning blades.</li>
<li><b>Jumbo frames:</b> set the MTU consistently in the QoS system class, the vNIC and the upstream switch. A mismatch drops large frames silently.</li>
</ul>

<h3>Calculating oversubscription</h3>
<div class="eg"><p>One chassis has 8 blades. Each blade has a VIC that gives 2 x 10 Gbps per fabric, so 20 Gbps per blade per fabric. The chassis offers 8 x 20 = 160 Gbps toward one IOM. If you cable 4 x 10 Gbps FEX links (40 Gbps), the ratio is 160 : 40 = 4:1. With 8 FEX links (80 Gbps) it is 2:1. Skyline's render hosts need 8 Gbps each at once, so 8 hosts need 64 Gbps. Four links (40 Gbps) are too few; eight links (80 Gbps) fit with 25 percent to spare. Next, the FI uplinks: 4 chassis x 80 Gbps = 320 Gbps of possible server traffic per fabric. With 8 x 25 Gbps uplinks (200 Gbps) the FI-to-LAN ratio is 1.6:1, which is acceptable because not every host bursts at once.</p></div>
<p>Keep in mind that traffic is balanced per flow across port-channel members, so one flow never exceeds one member link. Also, if one FI fails, all servers use the surviving fabric, so size the surviving side to carry the load you promise.</p>

<h3>Upstream configuration and verification</h3>
<p>The Nexus side of the uplink is a normal vPC member port-channel. The FI sends no Spanning Tree BPDUs in end-host mode, so the Nexus port is configured as an edge trunk:</p>
<pre class="code"><span class="c">! on each Nexus of the vPC pair (documentation example)</span>
interface port-channel101
  switchport mode trunk
  spanning-tree port type edge trunk
  mtu 9216
  vpc 101
interface Ethernet1/1-2
  switchport mode trunk
  channel-group 101 mode active</pre>
<pre class="out">nexus-1# show port-channel summary
Group Port-       Type     Protocol  Member Ports
      Channel
<span class="hl">101   Po101(SU)   Eth      LACP      Eth1/1(P)    Eth1/2(P)</span>
nexus-1# show vpc brief
<span class="hl">vPC status: id 101  Po101  up  success  success  1-199</span></pre>

<h3>Options and trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>1. 4 FEX links per IOM, 4 uplinks per FI</td><td>Cheapest cabling</td><td>4:1 chassis ratio fails the 8 Gbps need</td></tr>
<tr><td>2. 8 FEX links per IOM, FEX port-channel, 8 uplinks per FI</td><td>2:1 chassis, survives link loss, meets target</td><td>Uses more FI ports, so fewer chassis per FI pair</td></tr>
<tr><td>3. Switch mode with Spanning Tree</td><td>Local switching between uplinks</td><td>FI joins STP; the pair must not be a transit path</td></tr>
</table>
<div class="eg"><p><b>Chosen design.</b> Option 2 with end-host mode, LACP port-channels to the vPC pair, jumbo MTU 9216 end to end, FC uplinks to MDS A on fabric A and MDS B on fabric B, ESXi using two vNICs (one per fabric) and two vHBAs. Each ESXi host's teaming handles failure, so fabric failover on the vNIC is not required.</p></div>

<div class="warn"><p><b>Post-mortem: the silent MTU.</b> NFS datastores mounted but stalled during large copies. The vNIC MTU was 9000 and the QoS system class was still 1500. Small packets worked, large ones were dropped. Fix: set the best-effort class MTU to 9216 and verify upstream. Always test with a large do-not-fragment ping.</p></div>
<div class="exam"><p><b>Exam trap.</b> The FI does not run vPC; the upstream Nexus pair does. End-host mode does not use Spanning Tree toward the uplink and the FI is not a transit device. If a question says the FI must connect to two upstream switches without STP blocking any link, the answer is EHM with a port-channel to a vPC pair.</p></div>

<div class="scn"><h4>The uplink that was pinned alone</h4><p>After adding VLAN 300, a team saw one set of hosts slow while others were fine. The VLAN was only allowed on one uplink because a LAN pin group sent that vNIC's traffic to a single port. Removing the static pin group and using the port-channel spread flows across all links again.</p><p><b>Lesson:</b> prefer port-channels over static pinning; use pin groups only with a documented reason.</p></div>
<div class="iv"><p class="q">"How do you calculate oversubscription in UCS?"</p><p>Strong answer: add the adapter bandwidth per fabric for all blades in the chassis, divide by IOM-to-FI link bandwidth for the same fabric, then repeat for FI-to-LAN uplinks. Mention that sizing must hold when one fabric fails, and that peak concurrency matters more than the paper ratio.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Two fabrics, joined only by L1 and L2; FI uplinks go to a vPC pair through LACP port-channels.</li>
<li>End-host mode is the default: no STP toward the LAN, vNICs pinned to uplinks.</li>
<li>Oversubscription is calculated stage by stage: adapter, IOM, FI uplink.</li>
<li>FEX port-channel grouping keeps blades pinned when a link fails.</li>
<li>MTU must match in the QoS class, vNIC and upstream switch.</li>
</ul></div>
`,hi:`
<h3>Customer case: Skyline Media</h3>
<p>Skyline Media video render aur stream karta hai. Woh ek UCS domain khareed raha hai jisme do 6454 fabric interconnects (FIs) aur chaar chassis hain, har chassis mein aath B-series blades, ESXi chalate hue. Network team Nexus switches ki pair vPC domain mein chalati hai. Storage team do MDS switches chalati hai, har fabric ke liye ek. Go-live par render hosts bursts mein 9 Gbps tak kheenchte the, aur pehle design mein har fabric par aath hosts ko 40 Gbps chassis links mil rahe the.</p>
<p><b>Requirements:</b> koi single point of failure nahi; render hosts ko lagbhag 8 Gbps sustained chahiye; dono fabrics par Fibre Channel se storage; NFS-based media ke liye jumbo frames. <b>Constraints:</b> upstream pair badli nahi ja sakti; FIs do upstream switches ke beech transit path nahi ban sakte; budget har FI se LAN tak adhiktam 8 uplink cables deta hai.</p>

<h3>Beginner view: VM se deewar tak ka raasta</h3>
<p>Packet VM se nikalta hai, host ke <b>VIC</b> (Virtual Interface Card, Cisco adapter jo hardware mein bahut saare virtual NICs aur HBAs banata hai) se guzarta hai, blade backplane se <b>IOM</b> (I/O Module, chassis ke andar fabric extender) tak jaata hai, <b>FEX links</b> se FI tak, aur FI uplinks se data center network mein nikalta hai. Har stage ki bandwidth hoti hai. Load mein sabse kamzor stage bottleneck hai, aur becha gaya bandwidth aur asli bandwidth ka ratio <b>oversubscription ratio</b> hai.</p>
`+e({alt:`UCS uplink aur server connectivity`,n1:`Nexus 1`,n2:`Nexus 2`,peer:`vPC peer link`,ma:`MDS A`,mb:`MDS B`,fa:`FI-A`,fb:`FI-B`,mode:`end-host mode`,pc:`vPC pair tak LACP port-channels`,ch:`Chassis`,ioa:`IOM A`,iob:`IOM B`,ioa2:`FEX links`,bl:`Blade + VIC`,l1:`FI`,l2:`LAN switch`,l3:`IOM`,l4:`SAN switch`,l5:`FC uplink`,cap:`Har FI vPC pair ko ek LACP port-channel bhejta hai. FC uplinks apni fabric par rehte hain. FI-A aur FI-B sirf L1 aur L2 cluster links share karte hain, user traffic kabhi nahi.`})+`
<h3>Design rules jo aapko aane chahiye</h3>
<ul>
<li><b>Do fabrics, A aur B.</b> Har blade ke paas dono ka path hai. FIs sirf cluster heartbeat aur database sync ke liye L1 aur L2 links se jude hote hain. FIs ke beech data cable mat karo.</li>
<li><b>Ethernet end-host mode (EHM)</b> default aur aam choice hai. FI LAN ko ek bade host jaisa dikhta hai: uplinks ki taraf Spanning Tree nahi chalata, server vNICs ko uplinks se pin karta hai, aur deja vu checking tatha reverse path forwarding se loops rokta hai. Switch mode rare hai aur FI ko Spanning Tree mein le aata hai.</li>
<li><b>Uplinks:</b> har FI ke liye upstream vPC pair tak LACP port-channel banao. vPC Nexus side par hota hai. FI khud vPC nahi banata.</li>
<li><b>FC mode:</b> FC end-host mode (NPV) mein FI NPIV se MDS mein login karta hai. Jahan supported ho FC port-channels use karo aur VSAN A fabric A par, VSAN B fabric B par rakho. Unified ports Ethernet ya FC ho sakte hain; FC range badalne par module ya FI restart hota hai, isliye window plan karo.</li>
<li><b>Chassis links:</b> chassis discovery policy minimum links aur port-channel grouping tay karti hai. Port-channel link loss par blades ko re-pin kiye bina survive karta hai.</li>
<li><b>Jumbo frames:</b> MTU QoS system class, vNIC aur upstream switch mein ek jaisa rakho. Mismatch badi frames ko chupchap drop kar deta hai.</li>
</ul>

<h3>Oversubscription ki calculation</h3>
<div class="eg"><p>Ek chassis mein 8 blades hain. Har blade ka VIC har fabric par 2 x 10 Gbps deta hai, yaani blade per fabric 20 Gbps. Chassis ek IOM ki taraf 8 x 20 = 160 Gbps offer karta hai. Agar 4 x 10 Gbps FEX links (40 Gbps) cable karo to ratio 160 : 40 = 4:1. 8 FEX links (80 Gbps) par 2:1. Skyline ke render hosts ko ek saath 8 Gbps chahiye, to 8 hosts ko 64 Gbps. Chaar links (40 Gbps) kam hain; aath links (80 Gbps) 25 percent bachat ke saath fit hote hain. Ab FI uplinks: 4 chassis x 80 Gbps = har fabric par 320 Gbps possible server traffic. 8 x 25 Gbps uplinks (200 Gbps) ke saath FI-to-LAN ratio 1.6:1 hai, jo theek hai kyunki har host ek saath burst nahi karta.</p></div>
<p>Yaad rakho ki traffic port-channel members par per flow balance hota hai, isliye ek flow kabhi ek member link se zyada nahi jaata. Aur agar ek FI fail ho, to sabhi servers bachi hui fabric use karte hain, isliye bachi hui side ko wohi load uthane layak size karo jo aapne promise kiya hai.</p>

<h3>Upstream configuration aur verification</h3>
<p>Uplink ka Nexus side normal vPC member port-channel hai. End-host mode mein FI Spanning Tree BPDUs nahi bhejta, isliye Nexus port edge trunk configure hota hai:</p>
<pre class="code"><span class="c">! vPC pair ke har Nexus par (documentation example)</span>
interface port-channel101
  switchport mode trunk
  spanning-tree port type edge trunk
  mtu 9216
  vpc 101
interface Ethernet1/1-2
  switchport mode trunk
  channel-group 101 mode active</pre>
<pre class="out">nexus-1# show port-channel summary
Group Port-       Type     Protocol  Member Ports
      Channel
<span class="hl">101   Po101(SU)   Eth      LACP      Eth1/1(P)    Eth1/2(P)</span>
nexus-1# show vpc brief
<span class="hl">vPC status: id 101  Po101  up  success  success  1-199</span></pre>

<h3>Options aur trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>1. IOM par 4 FEX links, FI par 4 uplinks</td><td>Sabse sasti cabling</td><td>4:1 chassis ratio 8 Gbps need poori nahi karta</td></tr>
<tr><td>2. IOM par 8 FEX links, FEX port-channel, FI par 8 uplinks</td><td>2:1 chassis, link loss survive, target poora</td><td>Zyada FI ports lagte hain, isliye FI pair par kam chassis</td></tr>
<tr><td>3. Switch mode Spanning Tree ke saath</td><td>Uplinks ke beech local switching</td><td>FI STP mein judta hai; pair transit path nahi banni chahiye</td></tr>
</table>
<div class="eg"><p><b>Chosen design.</b> Option 2, end-host mode ke saath, vPC pair tak LACP port-channels, end to end jumbo MTU 9216, fabric A par MDS A aur fabric B par MDS B ko FC uplinks, ESXi mein do vNICs (har fabric ke liye ek) aur do vHBAs. ESXi host ki teaming failure handle karti hai, isliye vNIC par fabric failover zaroori nahi.</p></div>

<div class="warn"><p><b>Post-mortem: chupchap MTU.</b> NFS datastores mount ho gaye lekin badi copy ke dauraan atak gaye. vNIC MTU 9000 tha aur QoS system class abhi 1500 thi. Chhote packets chale, bade drop hue. Fix: best-effort class MTU 9216 karo aur upstream verify karo. Hamesha bade do-not-fragment ping se test karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> FI vPC nahi chalata; upstream Nexus pair chalati hai. End-host mode uplink ki taraf Spanning Tree use nahi karta aur FI transit device nahi hai. Agar sawal kahe ki FI do upstream switches se bina STP blocking ke judna chahiye, to jawab hai vPC pair tak port-channel ke saath EHM.</p></div>

<div class="scn"><h4>Akela pin hua uplink</h4><p>VLAN 300 jodne ke baad ek team ne dekha ki kuch hosts slow hain aur baaki theek. VLAN sirf ek uplink par allowed tha kyunki LAN pin group us vNIC ka traffic ek hi port par bhej raha tha. Static pin group hata kar port-channel use karne se flows phir saare links par failne lage.</p><p><b>Seekh:</b> static pinning ke bajay port-channels prefer karo; pin groups sirf documented wajah par.</p></div>
<div class="iv"><p class="q">"UCS mein oversubscription kaise calculate karte ho?"</p><p>Strong answer: chassis ke saare blades ka adapter bandwidth per fabric jodo, use usi fabric ke IOM-to-FI link bandwidth se divide karo, phir FI-to-LAN uplinks ke liye dohrao. Batao ki sizing ek fabric fail hone par bhi tikni chahiye, aur paper ratio se zyada peak concurrency matter karti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Do fabrics, sirf L1 aur L2 se jude; FI uplinks LACP port-channels se vPC pair tak jaate hain.</li>
<li>End-host mode default hai: LAN ki taraf STP nahi, vNICs uplinks se pinned.</li>
<li>Oversubscription stage by stage nikalta hai: adapter, IOM, FI uplink.</li>
<li>FEX port-channel grouping link fail par blades ko pinned rakhta hai.</li>
<li>MTU QoS class, vNIC aur upstream switch mein match hona chahiye.</li>
</ul></div>
`}};export{t as default};