var e={id:`evpn-services`,h:{en:`EVPN services: BGP as the Layer 2 control plane`,hi:`EVPN services: Layer 2 control plane ke roop mein BGP`},body:{en:`
<p>VPLS learns MAC addresses by flooding and gluing pseudowires together. <b>EVPN</b> (RFC 7432, with service types in RFC 7209 and VPWS in RFC 8214) learns MAC addresses on the PE and <b>advertises them in BGP</b>, the same way L3VPN advertises IP prefixes. This brings control-plane learning, better multihoming, less flooding and a single protocol for Layer 2 and Layer 3 services. In service-provider networks it is the successor to VPLS and pseudowire-based E-Line.</p>

<h3>The parts</h3>
<dl class="terms">
<dt>EVI (EVPN instance)</dt><dd>The per-customer service on a PE, analogous to a VRF. It has a route distinguisher and route targets.</dd>
<dt>Bridge domain / MAC-VRF</dt><dd>The Layer 2 table inside an EVI.</dd>
<dt>ESI (Ethernet Segment Identifier)</dt><dd>A 10-byte identifier for the set of links that connect a customer to one or more PEs. It enables multihoming.</dd>
<dt>BGP address family</dt><dd><code>l2vpn evpn</code>. PEs exchange EVPN routes over iBGP, normally through route reflectors.</dd>
</dl>

<h3>The EVPN route types you must know</h3>
<table class="cmp"><tr><th>Type</th><th>Name</th><th>Purpose</th></tr>
<tr><td>1</td><td>Ethernet auto-discovery (per ES and per EVI)</td><td>Multihoming: fast convergence, aliasing, mass withdrawal</td></tr>
<tr><td>2</td><td>MAC/IP advertisement</td><td>Advertises a host MAC (and optionally IP); carries MAC mobility sequence</td></tr>
<tr><td>3</td><td>Inclusive multicast Ethernet tag</td><td>Builds the flood list for broadcast, unknown unicast and multicast</td></tr>
<tr><td>4</td><td>Ethernet segment</td><td>Discovers PEs sharing an ES and elects the designated forwarder</td></tr>
<tr><td>5</td><td>IP prefix</td><td>Advertises IP prefixes for inter-subnet routing (mainly in data centre designs)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="EVPN control plane">
<rect x="20" y="40" width="110" height="55" rx="8" fill="#bae6fd"/><text x="75" y="72" text-anchor="middle" class="svg-ink" font-size="13">PE1</text>
<rect x="265" y="30" width="110" height="55" rx="8" fill="#ddd6fe"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">Route reflector</text>
<rect x="510" y="40" width="110" height="55" rx="8" fill="#bae6fd"/><text x="565" y="72" text-anchor="middle" class="svg-ink" font-size="13">PE2</text>
<line x1="130" y1="65" x2="265" y2="58" stroke="#64748b" stroke-width="2"/><line x1="375" y1="58" x2="510" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">BGP l2vpn evpn: type 2 (MAC), type 3 (flood list), type 1 and 4 (multihoming)</text>
<text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">Data plane: MPLS labels over the core (or VXLAN in data centres)</text>
</svg><p class="cap">EVPN uses BGP to distribute MACs and flood lists between PEs.</p></div>

<h3>What EVPN improves over VPLS</h3>
<ul>
<li><b>MAC learning in the control plane</b>: remote MACs arrive in BGP type 2 routes, so unknown-unicast flooding drops sharply.</li>
<li><b>Multihoming</b>: a customer can connect to two or more PEs with <b>all-active</b> load balancing, using the ESI. A <b>designated forwarder (DF)</b> is elected per ES and per VLAN so BUM traffic is not duplicated.</li>
<li><b>Aliasing and mass withdrawal</b>: type 1 routes let remote PEs load-balance to all PEs of an ES and withdraw an entire failed link at once, so convergence does not depend on the number of MACs.</li>
<li><b>MAC mobility</b>: a sequence number in the type 2 route lets a MAC move between sites and still be resolved.</li>
<li><b>Auto-discovery</b>: PEs find each other through BGP, no manual neighbour lists.</li>
<li><b>One protocol</b>: the same BGP session carries L2 and L3 (IRB) services.</li>
</ul>

<h3>EVPN service flavours</h3>
<ul>
<li><b>VLAN-based, VLAN-bundle and VLAN-aware bundle</b>: how many VLANs map to one EVI and bridge domain. VLAN-based gives one EVI per VLAN.</li>
<li><b>EVPN VPWS (RFC 8214)</b>: point-to-point E-Line using EVPN, with no MAC learning, signalled by type 1 routes. It replaces LDP pseudowires with BGP.</li>
<li><b>EVPN-FXC</b> (flexible cross-connect): multiplexes many ACs to one pseudowire.</li>
<li><b>E-Tree</b> with leaf and root attributes.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A customer host with MAC aaaa.bbbb.0001 sits behind PE1. PE1 learns the MAC on the AC and sends a type 2 route, with the route targets of EVI 100 and a label. PE2 imports it and installs the MAC in its bridge domain pointing to PE1. Traffic from PE2 to that host is unicast to PE1 straight away, with no flooding. If the host moves to PE2, PE2 advertises the MAC with a higher sequence number and PE1 withdraws its entry.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XR PE1: EVPN with a bridge domain</span>
evpn
 evi 100
  bgp
   route-target import 65000:100
   route-target export 65000:100
  advertise-mac
l2vpn
 bridge group CUST
  bridge-domain BD100
   interface GigabitEthernet0/0/0/1.100
   evi 100
router bgp 65000
 address-family l2vpn evpn
 neighbor 192.0.2.10
  remote-as 65000
  address-family l2vpn evpn</pre>
<p>Verify: the BGP l2vpn evpn session is established, local and remote type 2 and type 3 routes exist for the EVI, the MAC table lists remote MACs pointing to PEs, and for multihoming the DF election result is as expected. To see EVPN route types and MAC learning working in the simulator, use the EVPN labs on other platforms (jncip-evpn, dc-evpn); the concepts are the same although the data plane and syntax differ.</p>

<div class="warn"><p><b>Common mistakes.</b> Missing route targets so no MAC import; a different ESI on two PEs of the same multihomed customer; forgetting that the route reflector must carry the l2vpn evpn family; and treating type 5 as a Layer 2 route.</p></div>
<div class="exam"><p><b>Exam trap.</b> Type 2 = MAC/IP, type 3 = flood list (inclusive multicast), type 1 = Ethernet A-D, type 4 = Ethernet segment (DF election), type 5 = IP prefix.</p></div>

<div class="scn"><h4>A dual-homed customer wastes half its links</h4><p>With VPLS, a data centre customer connected to two PEs could only use one active link; the other was backup. After migrating to EVPN with an ESI across both PEs, traffic used both links (all-active), and a link failure was signalled with a single type 1 withdrawal rather than thousands of MAC removals.</p><p><b>Lesson:</b> EVPN gives all-active multihoming and fast convergence that VPLS cannot.</p></div>

<div class="iv"><p class="q">"Why is EVPN replacing VPLS?"</p><p>EVPN learns MACs in BGP, which reduces flooding, supports all-active multihoming through ESI, DF election and aliasing, gives fast convergence with mass withdrawal, handles MAC mobility and uses one control plane for L2 and L3. Name the five route types.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EVPN advertises MACs in BGP (address family l2vpn evpn).</li>
<li>Route types: 1 Ethernet A-D, 2 MAC/IP, 3 inclusive multicast, 4 Ethernet segment, 5 IP prefix.</li>
<li>ESI enables all-active multihoming; a DF is elected per ES.</li>
<li>EVPN VPWS replaces LDP pseudowires with BGP signalling.</li>
<li>Practise EVPN concepts in jncip-evpn and dc-evpn.</li>
</ul></div>
`,hi:`
<p>VPLS MAC addresses flooding se aur pseudowires ko jodkar learn karta hai. <b>EVPN</b> (RFC 7432, service types RFC 7209 mein aur VPWS RFC 8214 mein) PE par MAC addresses learn karta hai aur unhe <b>BGP mein advertise</b> karta hai, jaise L3VPN IP prefixes advertise karta hai. Isse control-plane learning, behtar multihoming, kam flooding aur Layer 2 tatha Layer 3 services ke liye ek hi protocol milta hai. Service-provider networks mein yeh VPLS aur pseudowire-based E-Line ka successor hai.</p>

<h3>Parts</h3>
<dl class="terms">
<dt>EVI (EVPN instance)</dt><dd>PE par per-customer service, VRF ke jaisi. Ismein route distinguisher aur route targets hote hain.</dd>
<dt>Bridge domain / MAC-VRF</dt><dd>EVI ke andar Layer 2 table.</dd>
<dt>ESI (Ethernet Segment Identifier)</dt><dd>Un links ke set ka 10-byte identifier jo customer ko ek ya zyaada PEs se jodte hain. Yeh multihoming enable karta hai.</dd>
<dt>BGP address family</dt><dd><code>l2vpn evpn</code>. PEs EVPN routes iBGP par, aam taur par route reflectors ke zariye, exchange karte hain.</dd>
</dl>

<h3>EVPN route types jo aapko aane chahiye</h3>
<table class="cmp"><tr><th>Type</th><th>Naam</th><th>Purpose</th></tr>
<tr><td>1</td><td>Ethernet auto-discovery (per ES aur per EVI)</td><td>Multihoming: fast convergence, aliasing, mass withdrawal</td></tr>
<tr><td>2</td><td>MAC/IP advertisement</td><td>Host MAC (aur optionally IP) advertise karta hai; MAC mobility sequence carry karta hai</td></tr>
<tr><td>3</td><td>Inclusive multicast Ethernet tag</td><td>Broadcast, unknown unicast aur multicast ke liye flood list banata hai</td></tr>
<tr><td>4</td><td>Ethernet segment</td><td>ES share karne wale PEs dhoondta hai aur designated forwarder elect karta hai</td></tr>
<tr><td>5</td><td>IP prefix</td><td>Inter-subnet routing ke liye IP prefixes advertise karta hai (mukhya roop se data centre designs)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="EVPN control plane">
<rect x="20" y="40" width="110" height="55" rx="8" fill="#bae6fd"/><text x="75" y="72" text-anchor="middle" class="svg-ink" font-size="13">PE1</text>
<rect x="265" y="30" width="110" height="55" rx="8" fill="#ddd6fe"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">Route reflector</text>
<rect x="510" y="40" width="110" height="55" rx="8" fill="#bae6fd"/><text x="565" y="72" text-anchor="middle" class="svg-ink" font-size="13">PE2</text>
<line x1="130" y1="65" x2="265" y2="58" stroke="#64748b" stroke-width="2"/><line x1="375" y1="58" x2="510" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">BGP l2vpn evpn: type 2 (MAC), type 3 (flood list), type 1 aur 4 (multihoming)</text>
<text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">Data plane: core par MPLS labels (ya data centres mein VXLAN)</text>
</svg><p class="cap">EVPN PEs ke beech MACs aur flood lists distribute karne ke liye BGP use karta hai.</p></div>

<h3>EVPN VPLS se kya behtar karta hai</h3>
<ul>
<li><b>Control plane mein MAC learning</b>: remote MACs BGP type 2 routes mein aate hain, isliye unknown-unicast flooding tezi se girti hai.</li>
<li><b>Multihoming</b>: customer ESI se do ya zyaada PEs se <b>all-active</b> load balancing ke saath jud sakta hai. Har ES aur har VLAN ke liye <b>designated forwarder (DF)</b> elect hota hai taaki BUM traffic duplicate na ho.</li>
<li><b>Aliasing aur mass withdrawal</b>: type 1 routes remote PEs ko ES ke saare PEs par load-balance karne dete hain aur poora failed link ek saath withdraw karte hain, isliye convergence MACs ki ginti par depend nahi karta.</li>
<li><b>MAC mobility</b>: type 2 route mein sequence number MAC ko sites ke beech move hone aur phir bhi resolve hone deta hai.</li>
<li><b>Auto-discovery</b>: PEs BGP se ek-doosre ko dhoondte hain, manual neighbour lists nahi.</li>
<li><b>Ek protocol</b>: wahi BGP session L2 aur L3 (IRB) services carry karta hai.</li>
</ul>

<h3>EVPN service flavours</h3>
<ul>
<li><b>VLAN-based, VLAN-bundle aur VLAN-aware bundle</b>: kitne VLANs ek EVI aur bridge domain se map hote hain. VLAN-based mein har VLAN ke liye ek EVI.</li>
<li><b>EVPN VPWS (RFC 8214)</b>: EVPN se point-to-point E-Line, MAC learning ke bina, type 1 routes se signalled. Yeh LDP pseudowires ko BGP se replace karta hai.</li>
<li><b>EVPN-FXC</b> (flexible cross-connect): kai ACs ko ek pseudowire par multiplex karta hai.</li>
<li>Leaf aur root attributes ke saath <b>E-Tree</b>.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Customer host MAC aaaa.bbbb.0001 PE1 ke peeche hai. PE1 AC par MAC learn karta hai aur EVI 100 ke route targets aur label ke saath type 2 route bhejta hai. PE2 use import karta hai aur apne bridge domain mein MAC ko PE1 ki taraf point karke install karta hai. PE2 se us host ka traffic seedha PE1 ko unicast hota hai, flooding ke bina. Agar host PE2 par move karta hai, PE2 MAC ko zyaada sequence number ke saath advertise karta hai aur PE1 apni entry withdraw karta hai.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XR PE1: EVPN with a bridge domain</span>
evpn
 evi 100
  bgp
   route-target import 65000:100
   route-target export 65000:100
  advertise-mac
l2vpn
 bridge group CUST
  bridge-domain BD100
   interface GigabitEthernet0/0/0/1.100
   evi 100
router bgp 65000
 address-family l2vpn evpn
 neighbor 192.0.2.10
  remote-as 65000
  address-family l2vpn evpn</pre>
<p>Verify: BGP l2vpn evpn session established hai, EVI ke liye local aur remote type 2 tatha type 3 routes hain, MAC table PEs ki taraf point karte remote MACs list karti hai, aur multihoming mein DF election result expected hai. Simulator mein EVPN route types aur MAC learning ko kaam karte dekhne ke liye doosre platforms ke EVPN labs use karo (jncip-evpn, dc-evpn); concepts same hain halanki data plane aur syntax alag hain.</p>

<div class="warn"><p><b>Common mistakes.</b> Route targets missing, isliye MAC import nahi; ek hi multihomed customer ke do PEs par alag ESI; yeh bhoolna ki route reflector ko l2vpn evpn family carry karni padti hai; aur type 5 ko Layer 2 route maanna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Type 2 = MAC/IP, type 3 = flood list (inclusive multicast), type 1 = Ethernet A-D, type 4 = Ethernet segment (DF election), type 5 = IP prefix.</p></div>

<div class="scn"><h4>Dual-homed customer apne aadhe links waste karta hai</h4><p>VPLS ke saath do PEs se jude data centre customer ke liye sirf ek link active ho sakta tha; doosra backup. Dono PEs par ESI ke saath EVPN par migrate hone ke baad traffic dono links use karne laga (all-active), aur link failure ek type 1 withdrawal se signal hui, hazaron MAC removals se nahi.</p><p><b>Lesson:</b> EVPN all-active multihoming aur fast convergence deta hai jo VPLS nahi de sakta.</p></div>

<div class="iv"><p class="q">"EVPN VPLS ko replace kyun kar raha hai?"</p><p>EVPN BGP mein MACs learn karta hai, jisse flooding kam hoti hai, ESI, DF election aur aliasing ke zariye all-active multihoming support karta hai, mass withdrawal se fast convergence deta hai, MAC mobility handle karta hai aur L2 tatha L3 ke liye ek control plane use karta hai. Paanchon route types batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EVPN BGP mein MACs advertise karta hai (address family l2vpn evpn).</li>
<li>Route types: 1 Ethernet A-D, 2 MAC/IP, 3 inclusive multicast, 4 Ethernet segment, 5 IP prefix.</li>
<li>ESI all-active multihoming enable karta hai; har ES ke liye DF elect hota hai.</li>
<li>EVPN VPWS LDP pseudowires ko BGP signalling se replace karta hai.</li>
<li>EVPN concepts jncip-evpn aur dc-evpn mein practise karo.</li>
</ul></div>
`}};export{e as default};