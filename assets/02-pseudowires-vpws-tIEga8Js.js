var e={id:`pseudowires-vpws`,h:{en:`VPWS and pseudowires: point-to-point Ethernet over MPLS`,hi:`VPWS aur pseudowires: MPLS par point-to-point Ethernet`},body:{en:`
<p>A <b>Virtual Private Wire Service (VPWS)</b> carries Ethernet frames from one attachment circuit to another across the provider core as an <b>Ethernet pseudowire</b> (the architecture is in RFC 3985, Ethernet encapsulation in RFC 4448, LDP signalling in RFC 4447). To the customer it looks like a cable. The PEs do not learn customer MAC addresses: they take a frame in on the AC and put it on the pseudowire, and the reverse.</p>

<h3>The packet on the wire</h3>
<p>The ingress PE adds two MPLS labels. The outer is the <b>transport (tunnel) label</b>, from LDP or segment routing, and it gets the packet to the egress PE, just as in the L3VPN chapters. The inner is the <b>pseudowire label</b> (also called the VC label), which tells the egress PE which attachment circuit receives the frame. A <b>control word</b> may sit between the labels and the payload. It carries a sequence number and flags and prevents some load-balancing mistakes in the core.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Pseudowire packet">
<rect x="15" y="50" width="105" height="55" fill="#ddd6fe"/><text x="67" y="82" text-anchor="middle" class="svg-ink" font-size="12">Transport label</text>
<rect x="120" y="50" width="105" height="55" fill="#fde68a"/><text x="172" y="82" text-anchor="middle" class="svg-ink" font-size="12">PW label</text>
<rect x="225" y="50" width="95" height="55" fill="#e2e8f0"/><text x="272" y="82" text-anchor="middle" class="svg-ink" font-size="12">Control word</text>
<rect x="320" y="50" width="300" height="55" fill="#bbf7d0"/><text x="470" y="82" text-anchor="middle" class="svg-ink" font-size="12">Customer Ethernet frame (without preamble and FCS)</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">Outer label reaches the PE; inner label picks the attachment circuit</text>
</svg><p class="cap">Encapsulation of an Ethernet pseudowire in MPLS.</p></div>

<h3>Signalling: how the two PEs agree on the labels</h3>
<ul>
<li><b>LDP signalling</b> (RFC 4447): the two PEs build a <b>targeted LDP session</b> to each other's loopback and exchange a <b>label mapping</b> that carries the <b>PW ID</b> (virtual circuit ID), the PW type and the interface parameters such as MTU. Both ends must agree on the PW ID, type and MTU, or the pseudowire stays down.</li>
<li><b>BGP signalling</b> (RFC 6624 for VPWS, or EVPN VPWS): used in large scale, with auto-discovery.</li>
<li><b>Static</b>: labels set by hand; rare.</li>
</ul>
<p>The PW type matters. <b>Type 5</b> carries raw Ethernet (port mode). <b>Type 4</b> carries Ethernet with a VLAN tag (tagged mode). A mismatch is a classic reason for a pseudowire that is not up. Remember the number-to-mode mapping for the exam.</p>

<h3>Port mode and VLAN mode</h3>
<ul>
<li><b>Port mode</b>: the whole physical port is the AC. All frames, tagged or not, travel over the PW (EPL).</li>
<li><b>VLAN mode</b>: a VLAN (or sub-interface) is the AC; the tag may be kept or removed and rewritten at each end (EVPL).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> PE1 loopback 192.0.2.1 and PE2 loopback 192.0.2.2. A customer port on each PE joins PW ID 100. PE1 and PE2 open a targeted LDP session. PE1 advertises PW label 2001 to PE2 for PW ID 100; PE2 advertises 2002. Frames from PE1 to PE2 carry the PW label 2002 (the label advertised by the receiver) under the transport label for 192.0.2.2. The numbers are illustrative.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<p>IOS XE port-based pseudowire (classic xconnect syntax; newer releases also offer an <code>l2vpn xconnect context</code> style):</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! PE1 (IOS XE)</span>
interface GigabitEthernet0/0/1
 description AC to customer
 no ip address
 xconnect 192.0.2.2 100 encapsulation mpls
<span class="c">! PE2 (IOS XE) mirrors it with the peer 192.0.2.1 and the same PW ID 100</span></pre>
<p>IOS XR uses the L2VPN construct:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
l2vpn
 xconnect group CUST-A
  p2p PUNE-MUMBAI
   interface GigabitEthernet0/0/0/1
   neighbor ipv4 192.0.2.2 pw-id 100</pre>
<p>What to verify (output not shown, because none was captured): the LDP neighbour to the peer loopback is up, the pseudowire is in the up state with both labels assigned, the transport LSP to the peer exists, and the AC interface is up. Typical commands are <code>show mpls l2transport vc</code> on IOS XE and <code>show l2vpn xconnect</code> on IOS XR.</p>

<h3>Pseudowire redundancy and status</h3>
<p>A primary and a backup pseudowire to different PEs let a dual-homed customer survive a PE failure. The <b>PW status TLV</b> signals attachment circuit up or down to the far end, so the remote PE can also stop forwarding or move to the backup. Failure of the AC must be signalled, or the far end keeps sending into a hole.</p>

<div class="warn"><p><b>Common mistakes.</b> Different PW IDs or types on the two PEs; no reachable /32 loopback LSP between the PEs; MTU mismatch signalled in the label mapping; and forgetting that the PW needs a targeted LDP session even if the core runs LDP only on links.</p></div>
<div class="exam"><p><b>Exam trap.</b> The PW label is the label advertised by the <i>remote</i> PE for that PW. PW type 4 is VLAN (tagged) and type 5 is Ethernet (raw); both ends must match.</p></div>

<div class="scn"><h4>Pseudowire stays in down state</h4><p>A new E-Line stayed down after configuration. The LDP session was established, but PE1 used PW type Ethernet while PE2 was configured for VLAN-tagged mode, and the interface MTU differed (1500 versus 9000). Aligning the mode and the MTU brought it up.</p><p><b>Lesson:</b> a pseudowire needs matching ID, type and MTU, not just reachability.</p></div>

<div class="iv"><p class="q">"How does a pseudowire work and how is it signalled?"</p><p>Ethernet frames are encapsulated with a PW label and a transport label across the MPLS core. The PEs signal PW labels with a targeted LDP session (or BGP), agreeing on PW ID, type and MTU. The control word and PW status help with ordering and failure signalling.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPWS = point-to-point; PEs do not learn customer MACs.</li>
<li>Two labels: transport label and PW label; optional control word.</li>
<li>LDP signalling uses a targeted session and requires matching ID, type and MTU.</li>
<li>Port mode versus VLAN mode; PW type 5 is Ethernet, type 4 is VLAN.</li>
<li>PW status and redundancy handle AC and PE failures.</li>
</ul></div>
`,hi:`
<p><b>Virtual Private Wire Service (VPWS)</b> Ethernet frames ko ek attachment circuit se doosre tak provider core ke across <b>Ethernet pseudowire</b> ke roop mein carry karta hai (architecture RFC 3985 mein, Ethernet encapsulation RFC 4448 mein, LDP signalling RFC 4447 mein). Customer ko yeh cable jaisa dikhta hai. PEs customer MAC addresses learn nahi karte: woh AC par aaya frame pseudowire par daal dete hain, aur ulta.</p>

<h3>Wire par packet</h3>
<p>Ingress PE do MPLS labels jodta hai. Bahar wala <b>transport (tunnel) label</b> hai, LDP ya segment routing se, aur woh packet ko egress PE tak pahunchata hai, bilkul L3VPN chapters jaisa. Andar wala <b>pseudowire label</b> (VC label bhi kehte hain) hai, jo egress PE ko batata hai ki frame kaunsa attachment circuit receive karega. Labels aur payload ke beech <b>control word</b> ho sakta hai. Ismein sequence number aur flags hote hain aur core mein kuch load-balancing galtiyan rokta hai.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Pseudowire packet">
<rect x="15" y="50" width="105" height="55" fill="#ddd6fe"/><text x="67" y="82" text-anchor="middle" class="svg-ink" font-size="12">Transport label</text>
<rect x="120" y="50" width="105" height="55" fill="#fde68a"/><text x="172" y="82" text-anchor="middle" class="svg-ink" font-size="12">PW label</text>
<rect x="225" y="50" width="95" height="55" fill="#e2e8f0"/><text x="272" y="82" text-anchor="middle" class="svg-ink" font-size="12">Control word</text>
<rect x="320" y="50" width="300" height="55" fill="#bbf7d0"/><text x="470" y="82" text-anchor="middle" class="svg-ink" font-size="12">Customer Ethernet frame (preamble aur FCS ke bina)</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">Bahar ka label PE tak; andar ka label attachment circuit chunta hai</text>
</svg><p class="cap">MPLS mein Ethernet pseudowire ka encapsulation.</p></div>

<h3>Signalling: do PEs labels par kaise agree karte hain</h3>
<ul>
<li><b>LDP signalling</b> (RFC 4447): dono PEs ek-doosre ke loopback tak <b>targeted LDP session</b> banate hain aur <b>label mapping</b> exchange karte hain jisme <b>PW ID</b> (virtual circuit ID), PW type aur MTU jaise interface parameters hote hain. Dono sirey ko PW ID, type aur MTU par agree karna padta hai, nahi to pseudowire down rehta hai.</li>
<li><b>BGP signalling</b> (VPWS ke liye RFC 6624, ya EVPN VPWS): bade scale par, auto-discovery ke saath.</li>
<li><b>Static</b>: labels haath se set; rare.</li>
</ul>
<p>PW type matter karta hai. <b>Type 5</b> raw Ethernet (port mode) carry karta hai. <b>Type 4</b> VLAN tag ke saath Ethernet (tagged mode) carry karta hai. Mismatch pseudowire ke up na hone ki classic wajah hai. Exam ke liye number-to-mode mapping yaad rakho.</p>

<h3>Port mode aur VLAN mode</h3>
<ul>
<li><b>Port mode</b>: poora physical port AC hai. Saare frames, tagged ya untagged, PW par jaate hain (EPL).</li>
<li><b>VLAN mode</b>: VLAN (ya sub-interface) AC hai; tag har sirey par rakha, hataya ya rewrite kiya ja sakta hai (EVPL).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> PE1 loopback 192.0.2.1 aur PE2 loopback 192.0.2.2. Har PE par customer port PW ID 100 se judta hai. PE1 aur PE2 targeted LDP session kholte hain. PE1 PW ID 100 ke liye PW label 2001 PE2 ko advertise karta hai; PE2 2002. PE1 se PE2 jaane wale frames PW label 2002 (receiver ka advertised label) carry karte hain, 192.0.2.2 ke transport label ke neeche. Numbers illustrative hain.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<p>IOS XE port-based pseudowire (classic xconnect syntax; naye releases <code>l2vpn xconnect context</code> style bhi dete hain):</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! PE1 (IOS XE)</span>
interface GigabitEthernet0/0/1
 description AC to customer
 no ip address
 xconnect 192.0.2.2 100 encapsulation mpls
<span class="c">! PE2 (IOS XE) mirrors it with the peer 192.0.2.1 and the same PW ID 100</span></pre>
<p>IOS XR L2VPN construct use karta hai:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
l2vpn
 xconnect group CUST-A
  p2p PUNE-MUMBAI
   interface GigabitEthernet0/0/0/1
   neighbor ipv4 192.0.2.2 pw-id 100</pre>
<p>Kya verify karna hai (output nahi dikhaya kyunki capture nahi hua): peer loopback tak LDP neighbour up hai, pseudowire dono labels assigned ke saath up state mein hai, peer tak transport LSP maujood hai, aur AC interface up hai. Typical commands IOS XE par <code>show mpls l2transport vc</code> aur IOS XR par <code>show l2vpn xconnect</code> hain.</p>

<h3>Pseudowire redundancy aur status</h3>
<p>Alag PEs tak primary aur backup pseudowire dual-homed customer ko PE failure se bachate hain. <b>PW status TLV</b> attachment circuit up ya down ka signal far end ko deta hai, taaki remote PE bhi forwarding rokle ya backup par chala jaye. AC failure ka signal dena zaroori hai, nahi to far end gadde mein bhejta rehta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Dono PEs par alag PW IDs ya types; PEs ke beech reachable /32 loopback LSP nahi; label mapping mein signalled MTU mismatch; aur yeh bhoolna ki core sirf links par LDP chalaye tab bhi PW ko targeted LDP session chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> PW label woh label hai jo us PW ke liye <i>remote</i> PE ne advertise kiya. PW type 4 VLAN (tagged) hai aur type 5 Ethernet (raw); dono sirey match hone chahiye.</p></div>

<div class="scn"><h4>Pseudowire down state mein atka hai</h4><p>Naya E-Line configuration ke baad down raha. LDP session established tha, lekin PE1 ne PW type Ethernet use kiya jabki PE2 VLAN-tagged mode ke liye configured tha, aur interface MTU alag tha (1500 versus 9000). Mode aur MTU align karne se up ho gaya.</p><p><b>Lesson:</b> pseudowire ko matching ID, type aur MTU chahiye, sirf reachability nahi.</p></div>

<div class="iv"><p class="q">"Pseudowire kaise kaam karta hai aur kaise signal hota hai?"</p><p>Ethernet frames MPLS core ke across PW label aur transport label ke saath encapsulate hote hain. PEs targeted LDP session (ya BGP) se PW labels signal karte hain, PW ID, type aur MTU par agree karke. Control word aur PW status ordering aur failure signalling mein madad karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPWS = point-to-point; PEs customer MACs learn nahi karte.</li>
<li>Do labels: transport label aur PW label; optional control word.</li>
<li>LDP signalling targeted session use karta hai aur matching ID, type, MTU chahta hai.</li>
<li>Port mode versus VLAN mode; PW type 5 Ethernet hai, type 4 VLAN.</li>
<li>PW status aur redundancy AC tatha PE failures handle karte hain.</li>
</ul></div>
`}};export{e as default};