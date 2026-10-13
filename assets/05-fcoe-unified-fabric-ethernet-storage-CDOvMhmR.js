var e={id:`fcoe-ethernet-storage`,h:{en:`FCoE, multi-hop unified fabric, iSCSI, NVMe/TCP and lossless Ethernet`,hi:`FCoE, multi-hop unified fabric, iSCSI, NVMe/TCP aur lossless Ethernet`},body:{en:`
<p>Many customers want fewer cables, fewer adapters and one operations team. This chapter shows when a unified fabric is the right answer, how to design FCoE across several hops, and how to run iSCSI and NVMe over Ethernet without hurting latency.</p>

<h3>The case: Atlas Media</h3>
<div class="eg"><p><b>Customer.</b> Atlas Media, a video post-production studio. 24 rack servers for rendering and editing, each with four 10G NICs and two 16G HBAs today, plus 10 ESXi hosts for asset management. Two arrays with FC and iSCSI ports. A new row of 30 servers is coming, and the facility has no free rack units for more cable managers.</p><p><b>Requirements.</b> Fewer cables per server (two 25G links instead of six); keep the existing FC arrays; separate A and B paths; lossless storage even when a render job saturates the network; two-year plan to move some storage to NVMe/TCP.</p><p><b>Constraints.</b> The LAN team owns the Nexus switches, the storage team owns the MDS; they must agree on QoS. Cabling between rooms is single-mode fibre, limited to 6 uplinks.</p></div>

<h3>FCoE building blocks</h3>
<p><b>FCoE</b> carries FC frames in Ethernet frames (Ethertype 0x8906) on a no-drop traffic class. Three standards make Ethernet suitable, together called Data Center Bridging: <b>PFC</b> (802.1Qbb) pauses one priority class without stopping others; <b>ETS</b> (802.1Qaz) guarantees bandwidth shares per class; <b>DCBX</b> negotiates these settings between neighbours. FCoE usually uses CoS 3 as the no-drop class, a baby-jumbo MTU of 2158 bytes, and <b>FIP</b> (FCoE Initialization Protocol, Ethertype 0x8914) to discover the switch and log in.</p>
<ul>
<li><b>CNA</b> (Converged Network Adapter): the host card that speaks both Ethernet and FCoE.</li>
<li><b>FCF</b> (FCoE Forwarder): the switch function that does FC services. Its virtual ports are <b>VF</b> (to a host VN port) and <b>VE</b> (between two FCFs).</li>
<li><b>vfc</b>: the virtual Fibre Channel interface on a Cisco Nexus, bound to a physical Ethernet interface or port channel.</li>
<li><b>FCoE VLAN</b>: a VLAN mapped to exactly one VSAN, carrying only FCoE frames.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Multi-hop FCoE with A and B fabrics">
<rect x="20" y="20" width="110" height="40" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="12">Server CNA</text>
<rect x="20" y="170" width="110" height="40" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="75" y="195" text-anchor="middle" class="svg-ink" font-size="12">Server CNA</text>
<rect x="210" y="20" width="120" height="50" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="270" y="42" text-anchor="middle" class="svg-ink" font-size="12">Access A</text><text x="270" y="58" text-anchor="middle" class="svg-muted" font-size="11">VLAN 100 = VSAN 10</text>
<rect x="210" y="170" width="120" height="50" rx="8" fill="#fde68a" stroke="#64748b"/><text x="270" y="192" text-anchor="middle" class="svg-ink" font-size="12">Access B</text><text x="270" y="208" text-anchor="middle" class="svg-muted" font-size="11">VLAN 200 = VSAN 20</text>
<rect x="430" y="20" width="110" height="50" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="12">Core A</text><text x="485" y="58" text-anchor="middle" class="svg-muted" font-size="11">FC / FCoE</text>
<rect x="430" y="170" width="110" height="50" rx="8" fill="#fde68a" stroke="#64748b"/><text x="485" y="192" text-anchor="middle" class="svg-ink" font-size="12">Core B</text><text x="485" y="208" text-anchor="middle" class="svg-muted" font-size="11">FC / FCoE</text>
<rect x="570" y="85" width="60" height="90" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="600" y="125" text-anchor="middle" class="svg-ink" font-size="12">Array</text>
<line x1="130" y1="35" x2="210" y2="40" stroke="#64748b" stroke-width="2"/><line x1="130" y1="50" x2="210" y2="185" stroke="#64748b" stroke-width="2" stroke-dasharray="5 3"/>
<line x1="130" y1="185" x2="210" y2="195" stroke="#64748b" stroke-width="2"/><line x1="130" y1="175" x2="210" y2="55" stroke="#64748b" stroke-width="2" stroke-dasharray="5 3"/>
<line x1="330" y1="45" x2="430" y2="45" stroke="#16a34a" stroke-width="4"/><line x1="330" y1="195" x2="430" y2="195" stroke="#d97706" stroke-width="4"/>
<line x1="540" y1="50" x2="570" y2="110" stroke="#64748b" stroke-width="2"/><line x1="540" y1="195" x2="570" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="380" y="36" text-anchor="middle" class="svg-ink" font-size="11">VE hop</text><text x="380" y="186" text-anchor="middle" class="svg-ink" font-size="11">VE hop</text>
<text x="320" y="262" text-anchor="middle" class="svg-muted" font-size="11">Solid = FCoE path per fabric; dashed = LAN-only VLANs. Green = A, amber = B, blue = host, purple = array</text>
</svg><p class="cap">Each CNA port goes to a different access switch; FCoE VLANs are never shared between A and B.</p></div>

<h3>Design rules for unified and multi-hop FCoE</h3>
<ul>
<li><b>Keep A and B separate</b> all the way. An FCoE VLAN exists on only one side; do not carry FCoE VLANs on vPC peer links or across to the other fabric. The LAN side may use vPC, but each FCoE vfc binds to a physical port or a port channel local to one switch.</li>
<li><b>Multi-hop</b> means FCoE crosses more than one FCoE-aware switch. Between FCFs use VE ports, typically on dedicated or at least no-drop-protected port channels; end-to-end PFC and the same class settings are mandatory on every hop.</li>
<li><b>Dedicated versus converged uplinks.</b> Uplinks shared with LAN save fibre; dedicated FCoE uplinks give predictable bandwidth. Atlas has only 6 uplinks, so it uses converged with ETS giving FCoE a guaranteed 50 percent.</li>
<li><b>Platform support varies.</b> Verify the FCoE feature and licence on each Nexus and MDS model and release before you promise it.</li>
</ul>
<pre class="code"><span class="c">! Access A (names and numbers are examples)</span>
feature fcoe
vlan 100
  fcoe vsan 10
interface ethernet1/10
  switchport mode trunk
  switchport trunk allowed vlan 1,100
interface vfc10
  bind interface ethernet1/10
  switchport trunk allowed vsan 10
  no shutdown
vsan database
  vsan 10 interface vfc10</pre>
<pre class="out">access-a# show interface vfc10
vfc10 is <span class="hl">up</span>
    Bound interface is Ethernet1/10
    Port mode is F, FCID is 0x610010
    Port vsan is 10</pre>

<h3>Storage over plain Ethernet</h3>
<table class="cmp"><tr><th>Item</th><th>iSCSI</th><th>NVMe/TCP</th><th>NVMe/RoCEv2</th></tr>
<tr><td>Transport</td><td>TCP 3260</td><td>TCP</td><td>UDP 4791 with RDMA</td></tr>
<tr><td>Lossless needed?</td><td>No, but helps</td><td>No, ECN recommended</td><td>Yes: PFC plus ECN</td></tr>
<tr><td>MTU</td><td>9000 end to end</td><td>9000 recommended</td><td>Often 9000 or more</td></tr>
<tr><td>Special NIC</td><td>No</td><td>No</td><td>RDMA-capable NIC</td></tr>
<tr><td>Multipath</td><td>MPIO, two subnets/VLANs</td><td>NVMe multipath</td><td>NVMe multipath</td></tr>
</table>
<p>For iSCSI and NVMe/TCP: dedicated VLANs per path (A and B), jumbo MTU configured on host, switch and array, separate queues in QoS, no LACP bundling of the storage NICs (use multipathing instead), and CHAP or network isolation for security. For RoCE, enable PFC only on the RoCE priority and ECN marking through a WRED-style queue so congestion is signalled before pauses spread. Keep PFC domains small; a pause storm can freeze an entire fabric.</p>

<h3>Chosen design for Atlas</h3>
<p>Two 25G CNA links per server, one to Access A and one to Access B. FCoE VLAN 100/VSAN 10 on A, VLAN 200/VSAN 20 on B. Converged uplinks to the MDS cores with ETS: FCoE 50 percent, LAN 50 percent, MTU 2158 on the FCoE class and 9216 for the rest. NVMe/TCP is piloted on the ESXi cluster over its own two VLANs with ECN marking. FC arrays remain unchanged.</p>

<div class="warn"><p><b>Common mistake.</b> Enabling PFC on every priority "to be safe". Pause frames then propagate everywhere and one slow receiver blocks the whole link, including the LAN.</p></div>
<div class="exam"><p><b>Exam trap.</b> FCoE is not routable like IP; it needs a lossless Layer 2 path and FCoE traffic stays in its VLAN. FIP uses a different Ethertype from FCoE data frames. ETS shares bandwidth; PFC prevents drops; they do different jobs.</p></div>

<div class="scn"><h4>The pause storm</h4><p>At Atlas, a render node with a faulty NIC stopped draining its queue. PFC pause frames climbed from the access switch to the core, and within a minute LAN and storage latency rose on 20 servers. The team confirmed a rising PFC pause counter on one port, shut the port, and replaced the NIC. They then limited PFC to the FCoE class only, enabled a PFC watchdog where the platform supports it, and kept the render VLANs outside the no-drop class.</p><p><b>Lesson:</b> lossless is powerful and contagious. Scope it narrowly and monitor pause counters.</p></div>

<div class="iv"><p class="q">"How do you keep fabric A and B separate with FCoE and vPC?"</p><p>Strong answer: each server CNA port connects to a different access switch; the FCoE VLAN and VSAN differ per side and are not carried on the vPC peer link; vfc interfaces bind to a local port or local port channel. LAN traffic can still use vPC.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FCoE needs DCB: PFC for no-drop, ETS for bandwidth, DCBX to negotiate, plus FIP for login.</li>
<li>One FCoE VLAN maps to one VSAN; A and B must stay separate across every hop.</li>
<li>Multi-hop uses VE ports between FCFs with identical no-drop settings on every hop.</li>
<li>iSCSI and NVMe/TCP need dedicated VLANs, jumbo MTU and multipathing, not LACP.</li>
<li>RoCEv2 needs PFC and ECN; limit the no-drop domain.</li>
</ul></div>
`,hi:`
<p>Kai customers ko kam cables, kam adapters aur ek hi operations team chahiye. Yeh chapter dikhata hai ki unified fabric kab sahi jawab hai, FCoE ko kai hops mein kaise design karte hain, aur iSCSI aur NVMe ko Ethernet par bina latency bigade kaise chalate hain.</p>

<h3>Case: Atlas Media</h3>
<div class="eg"><p><b>Customer.</b> Atlas Media, ek video post-production studio. Rendering aur editing ke liye 24 rack servers, har ek mein abhi chaar 10G NICs aur do 16G HBAs, plus asset management ke liye 10 ESXi hosts. Do arrays jinke FC aur iSCSI ports hain. Naye 30 servers ki ek row aane wali hai, aur facility mein cable managers ke liye free rack units nahi hain.</p><p><b>Requirements.</b> Har server par kam cables (chhe ki jagah do 25G links); existing FC arrays rakhna; A aur B paths alag; render job network saturate kare tab bhi lossless storage; do saal mein kuch storage NVMe/TCP par le jaana.</p><p><b>Constraints.</b> LAN team Nexus switches sambhalti hai, storage team MDS; QoS par dono ko agree karna hoga. Rooms ke beech single-mode fibre hai, sirf 6 uplinks tak.</p></div>

<h3>FCoE ke building blocks</h3>
<p><b>FCoE</b> FC frames ko Ethernet frames (Ethertype 0x8906) mein no-drop traffic class par le jaata hai. Teen standards Ethernet ko suitable banate hain, jinhe milkar Data Center Bridging kehte hain: <b>PFC</b> (802.1Qbb) ek priority class ko pause karta hai bina doosri ko roke; <b>ETS</b> (802.1Qaz) har class ko bandwidth share guarantee karta hai; <b>DCBX</b> neighbours ke beech yeh settings negotiate karta hai. FCoE aam taur par CoS 3 ko no-drop class banata hai, 2158 bytes ka baby-jumbo MTU, aur <b>FIP</b> (FCoE Initialization Protocol, Ethertype 0x8914) switch discover karne aur login ke liye.</p>
<ul>
<li><b>CNA</b> (Converged Network Adapter): host card jo Ethernet aur FCoE dono bolta hai.</li>
<li><b>FCF</b> (FCoE Forwarder): switch function jo FC services deta hai. Iske virtual ports <b>VF</b> (host ke VN port ki taraf) aur <b>VE</b> (do FCFs ke beech) hain.</li>
<li><b>vfc</b>: Cisco Nexus par virtual Fibre Channel interface, jo physical Ethernet interface ya port channel se bind hota hai.</li>
<li><b>FCoE VLAN</b>: ek VLAN jo exactly ek VSAN se map hota hai aur sirf FCoE frames carry karta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="A aur B fabrics ke saath multi-hop FCoE">
<rect x="20" y="20" width="110" height="40" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="12">Server CNA</text>
<rect x="20" y="170" width="110" height="40" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="75" y="195" text-anchor="middle" class="svg-ink" font-size="12">Server CNA</text>
<rect x="210" y="20" width="120" height="50" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="270" y="42" text-anchor="middle" class="svg-ink" font-size="12">Access A</text><text x="270" y="58" text-anchor="middle" class="svg-muted" font-size="11">VLAN 100 = VSAN 10</text>
<rect x="210" y="170" width="120" height="50" rx="8" fill="#fde68a" stroke="#64748b"/><text x="270" y="192" text-anchor="middle" class="svg-ink" font-size="12">Access B</text><text x="270" y="208" text-anchor="middle" class="svg-muted" font-size="11">VLAN 200 = VSAN 20</text>
<rect x="430" y="20" width="110" height="50" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="12">Core A</text><text x="485" y="58" text-anchor="middle" class="svg-muted" font-size="11">FC / FCoE</text>
<rect x="430" y="170" width="110" height="50" rx="8" fill="#fde68a" stroke="#64748b"/><text x="485" y="192" text-anchor="middle" class="svg-ink" font-size="12">Core B</text><text x="485" y="208" text-anchor="middle" class="svg-muted" font-size="11">FC / FCoE</text>
<rect x="570" y="85" width="60" height="90" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="600" y="125" text-anchor="middle" class="svg-ink" font-size="12">Array</text>
<line x1="130" y1="35" x2="210" y2="40" stroke="#64748b" stroke-width="2"/><line x1="130" y1="50" x2="210" y2="185" stroke="#64748b" stroke-width="2" stroke-dasharray="5 3"/>
<line x1="130" y1="185" x2="210" y2="195" stroke="#64748b" stroke-width="2"/><line x1="130" y1="175" x2="210" y2="55" stroke="#64748b" stroke-width="2" stroke-dasharray="5 3"/>
<line x1="330" y1="45" x2="430" y2="45" stroke="#16a34a" stroke-width="4"/><line x1="330" y1="195" x2="430" y2="195" stroke="#d97706" stroke-width="4"/>
<line x1="540" y1="50" x2="570" y2="110" stroke="#64748b" stroke-width="2"/><line x1="540" y1="195" x2="570" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="380" y="36" text-anchor="middle" class="svg-ink" font-size="11">VE hop</text><text x="380" y="186" text-anchor="middle" class="svg-ink" font-size="11">VE hop</text>
<text x="320" y="262" text-anchor="middle" class="svg-muted" font-size="11">Solid = har fabric ka FCoE path; dashed = sirf LAN VLANs. Hara = A, amber = B, neela = host, purple = array</text>
</svg><p class="cap">Har CNA port alag access switch se judta hai; FCoE VLANs A aur B ke beech kabhi share nahi hote.</p></div>

<h3>Unified aur multi-hop FCoE ke design rules</h3>
<ul>
<li><b>A aur B ko poore raste alag rakho.</b> FCoE VLAN sirf ek side par hota hai; FCoE VLANs ko vPC peer link par ya doosre fabric tak carry mat karo. LAN side vPC use kar sakti hai, par har FCoE vfc ek local physical port ya port channel se bind hota hai.</li>
<li><b>Multi-hop</b> ka matlab FCoE ek se zyada FCoE-aware switch cross kare. FCFs ke beech VE ports use hote hain, aam taur par dedicated ya no-drop-protected port channels par; har hop par end-to-end PFC aur same class settings zaroori hain.</li>
<li><b>Dedicated versus converged uplinks.</b> LAN ke saath shared uplinks fibre bachate hain; dedicated FCoE uplinks predictable bandwidth dete hain. Atlas ke paas sirf 6 uplinks hain, isliye converged use hota hai aur ETS FCoE ko guaranteed 50 percent deta hai.</li>
<li><b>Platform support alag hota hai.</b> Promise karne se pehle har Nexus aur MDS model aur release par FCoE feature aur licence verify karo.</li>
</ul>
<pre class="code"><span class="c">! Access A (names aur numbers examples hain)</span>
feature fcoe
vlan 100
  fcoe vsan 10
interface ethernet1/10
  switchport mode trunk
  switchport trunk allowed vlan 1,100
interface vfc10
  bind interface ethernet1/10
  switchport trunk allowed vsan 10
  no shutdown
vsan database
  vsan 10 interface vfc10</pre>
<pre class="out">access-a# show interface vfc10
vfc10 is <span class="hl">up</span>
    Bound interface is Ethernet1/10
    Port mode is F, FCID is 0x610010
    Port vsan is 10</pre>

<h3>Plain Ethernet par storage</h3>
<table class="cmp"><tr><th>Item</th><th>iSCSI</th><th>NVMe/TCP</th><th>NVMe/RoCEv2</th></tr>
<tr><td>Transport</td><td>TCP 3260</td><td>TCP</td><td>UDP 4791 RDMA ke saath</td></tr>
<tr><td>Lossless chahiye?</td><td>Nahi, par madad karta hai</td><td>Nahi, ECN recommended</td><td>Haan: PFC plus ECN</td></tr>
<tr><td>MTU</td><td>9000 end to end</td><td>9000 recommended</td><td>Aksar 9000 ya zyada</td></tr>
<tr><td>Special NIC</td><td>Nahi</td><td>Nahi</td><td>RDMA-capable NIC</td></tr>
<tr><td>Multipath</td><td>MPIO, do subnets/VLANs</td><td>NVMe multipath</td><td>NVMe multipath</td></tr>
</table>
<p>iSCSI aur NVMe/TCP ke liye: har path (A aur B) ka dedicated VLAN, host, switch aur array par jumbo MTU, QoS mein alag queues, storage NICs ka LACP bundling nahi (multipathing use karo), aur security ke liye CHAP ya network isolation. RoCE ke liye PFC sirf RoCE priority par enable karo aur WRED-style queue se ECN marking karo taaki pauses phailne se pehle congestion signal ho jaye. PFC domains chhote rakho; ek pause storm poora fabric freeze kar sakta hai.</p>

<h3>Atlas ke liye chosen design</h3>
<p>Har server ke do 25G CNA links, ek Access A ko aur ek Access B ko. A par FCoE VLAN 100/VSAN 10, B par VLAN 200/VSAN 20. MDS cores tak converged uplinks ETS ke saath: FCoE 50 percent, LAN 50 percent, FCoE class par MTU 2158 aur baaki ke liye 9216. ESXi cluster par NVMe/TCP ka pilot apne do VLANs par ECN marking ke saath chalta hai. FC arrays jaise hain waise rehte hain.</p>

<div class="warn"><p><b>Common mistake.</b> "Safe rehne ke liye" har priority par PFC enable karna. Pause frames phir har jagah phailte hain aur ek slow receiver poora link block kar deta hai, LAN samet.</p></div>
<div class="exam"><p><b>Exam trap.</b> FCoE IP ki tarah routable nahi hai; use lossless Layer 2 path chahiye aur FCoE traffic apne VLAN mein rehta hai. FIP ka Ethertype FCoE data frames se alag hai. ETS bandwidth share karta hai; PFC drops rokta hai; dono ke kaam alag hain.</p></div>

<div class="scn"><h4>Pause storm</h4><p>Atlas mein ek render node ka faulty NIC apni queue drain karna band kar gaya. PFC pause frames access switch se core tak chadhe, aur ek minute mein 20 servers par LAN aur storage latency badh gayi. Team ne ek port par badhta PFC pause counter confirm kiya, port shut kiya, aur NIC badla. Phir PFC ko sirf FCoE class tak seemit kiya, jahan platform support kare wahan PFC watchdog enable kiya, aur render VLANs ko no-drop class se bahar rakha.</p><p><b>Lesson:</b> lossless taqatwar hai aur chhoot se phailta hai. Ise tang scope mein rakho aur pause counters monitor karo.</p></div>

<div class="iv"><p class="q">"FCoE aur vPC ke saath fabric A aur B alag kaise rakhoge?"</p><p>Strong answer: har server CNA port alag access switch se judta hai; FCoE VLAN aur VSAN har side par alag hote hain aur vPC peer link par carry nahi hote; vfc interfaces local port ya local port channel se bind hote hain. LAN traffic phir bhi vPC use kar sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FCoE ko DCB chahiye: no-drop ke liye PFC, bandwidth ke liye ETS, negotiate karne ke liye DCBX, aur login ke liye FIP.</li>
<li>Ek FCoE VLAN ek VSAN se map hota hai; A aur B har hop par alag rehne chahiye.</li>
<li>Multi-hop mein FCFs ke beech VE ports use hote hain aur har hop par identical no-drop settings.</li>
<li>iSCSI aur NVMe/TCP ko dedicated VLANs, jumbo MTU aur multipathing chahiye, LACP nahi.</li>
<li>RoCEv2 ko PFC aur ECN chahiye; no-drop domain chhota rakho.</li>
</ul></div>
`}};export{e as default};