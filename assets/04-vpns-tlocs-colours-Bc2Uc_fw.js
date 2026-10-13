var e={id:`tlocs-colours`,h:{en:`Transport and service sides: VPN 0, service VPNs, TLOCs and colours`,hi:`Transport aur service sides: VPN 0, service VPNs, TLOCs aur colours`},body:{en:`
<p>A courier hub has two sides. The <b>loading dock</b> faces the highways: trucks from different companies (road, rail, air) arrive there. The <b>sorting floor</b> faces the customers, with separate counters for different clients so their parcels never mix. An SD-WAN edge is built the same way: a <b>transport side</b> facing the WAN circuits and a <b>service side</b> facing the users, split into separate VPNs.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Transport and service VPNs on a WAN edge">
<rect x="220" y="60" width="200" height="130" rx="10" fill="#e2e8f0"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="14">EDGE1 (site 100)</text>
<rect x="232" y="95" width="80" height="40" rx="6" fill="#bae6fd"/><text x="272" y="120" text-anchor="middle" class="svg-ink" font-size="12">VPN 0</text>
<rect x="328" y="95" width="80" height="40" rx="6" fill="#bbf7d0"/><text x="368" y="120" text-anchor="middle" class="svg-ink" font-size="12">VPN 1</text>
<rect x="280" y="145" width="80" height="34" rx="6" fill="#fde68a"/><text x="320" y="167" text-anchor="middle" class="svg-ink" font-size="12">VPN 512</text>
<rect x="10" y="40" width="150" height="40" rx="6" fill="#bae6fd"/><text x="85" y="65" text-anchor="middle" class="svg-ink" font-size="12">INET: biz-internet</text>
<rect x="10" y="150" width="150" height="40" rx="6" fill="#bae6fd"/><text x="85" y="175" text-anchor="middle" class="svg-ink" font-size="12">MPLS: mpls</text>
<line x1="160" y1="60" x2="232" y2="110" stroke="#64748b"/><line x1="160" y1="170" x2="232" y2="122" stroke="#64748b"/>
<rect x="480" y="95" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="555" y="120" text-anchor="middle" class="svg-ink" font-size="12">LAN 10.10.1.0/24</text>
<line x1="408" y1="115" x2="480" y2="115" stroke="#64748b"/>
<text x="85" y="215" text-anchor="middle" class="svg-muted" font-size="12">two TLOCs</text>
<text x="555" y="160" text-anchor="middle" class="svg-muted" font-size="12">service VPN</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">out-of-band management</text>
</svg><p class="cap">Each colour on VPN 0 is one TLOC. User subnets live in service VPNs and never touch VPN 0 routing.</p></div>

<h3>VPNs in SD-WAN mean VRFs</h3>
<p>In SD-WAN the word <b>VPN</b> means a routing table (a VRF), not an encrypted tunnel.</p>
<ul>
<li><b>VPN 0</b> — the <b>transport VPN</b>. WAN interfaces, their default routes and the control connections live here. On IOS XE edges it is the global routing table.</li>
<li><b>VPN 512</b> — out-of-band <b>management</b> (on IOS XE the Mgmt-intf VRF).</li>
<li><b>Service VPNs</b> (1–511 and 513–65530) — the user side. Branch LANs, voice, guest, PCI each get their own VPN, which is how SD-WAN gives <b>segmentation</b> end to end. On IOS XE they are ordinary <code>vrf definition</code>s.</li>
</ul>
<p>Prefixes learned or connected in a service VPN are advertised into OMP with their VPN number (a label goes into the data packets), so the far edge delivers them into the same VPN only.</p>

<h3>TLOC: the address of a transport</h3>
<p>A <b>TLOC</b> (Transport Locator) is the attachment point of an edge to one transport. It is identified by the tuple <b>(system-ip, colour, encapsulation)</b>, for example (10.255.0.11, biz-internet, ipsec). The TLOC route also carries the interface's <b>private IP and port</b>, its <b>public IP and port</b> as seen by the Validator (these differ behind NAT), plus attributes such as preference, weight, site-id and restrict. A two-circuit edge has two TLOCs. Remote edges build tunnels <i>to TLOCs</i>, not to routers.</p>

<h3>Colours</h3>
<p>A <b>colour</b> is a label that describes the transport. There is a fixed list:</p>
<table class="cmp"><tr><th>Public colours</th><th>Private colours</th></tr>
<tr><td>default, biz-internet, public-internet, lte, 3g, red, green, blue, gold, silver, bronze, custom1-3</td><td>mpls, metro-ethernet, private1-6</td></tr></table>
<p>The colour decides <b>which address</b> is used to build a tunnel. Between two private colours the edges use each other's <b>private</b> IP (no NAT expected on a private network). Whenever a public colour is involved they use the <b>public</b> (post-NAT) IP. By default an edge tries a tunnel from every local TLOC to every remote TLOC; pairs with no underlay path (say mpls to biz-internet) simply stay down. To stop those useless attempts you add <code>restrict</code>, which limits a colour to tunnels with the <b>same</b> colour only. The lab simplifies this: private colours pair only with the same colour, and public colours with any public colour.</p>

<h3>Configuring the transport side (lab syntax)</h3>
<pre class="code"><span class="c">! VPN 0: transport interfaces with a default route each way</span>
interface GigabitEthernet0/0
 description INET transport
 ip address 198.51.100.2 255.255.255.252
interface GigabitEthernet0/1
 description MPLS transport
 ip address 172.16.1.2 255.255.255.252
ip route 0.0.0.0 0.0.0.0 198.51.100.1
ip route 172.16.0.0 255.255.0.0 172.16.1.1
<span class="c">! Mark each circuit as a TLOC with a colour</span>
sdwan
 interface GigabitEthernet0/0
  tunnel-interface
   encapsulation ipsec
   color biz-internet
 interface GigabitEthernet0/1
  tunnel-interface
   encapsulation ipsec
   color mpls
<span class="c">! Service side: the LAN joins VPN 1 (IOS XE: vrf forwarding 1)</span>
vpn 1
 interface GigabitEthernet0/2</pre>
<p>Under <code>tunnel-interface</code> real edges also take <code>allow-service</code> (which services such as SSH, NETCONF, DNS or ICMP may be answered on that WAN port; the rest are blocked), <code>max-control-connections</code> (0 on a circuit that cannot reach the controllers), and <code>color mpls restrict</code>.</p>

<pre class="out">EDGE1# show sdwan omp tlocs
TLOC IP          COLOR           ENCAP  FROM PEER        STATUS  PUBLIC IP
---------------- --------------- ------ ---------------- ------- ---------------
10.255.0.11      biz-internet    ipsec  0.0.0.0          C,Red,R 198.51.100.2
10.255.0.11      mpls            ipsec  0.0.0.0          C,Red,R 172.16.1.2
<span class="hl">10.255.0.12      biz-internet    ipsec  10.255.0.1       C,I,R   198.51.100.6</span>
<span class="hl">10.255.0.12      mpls            ipsec  10.255.0.1       C,I,R   172.16.2.2</span></pre>
<p>EDGE1 sees its own two TLOCs (from peer 0.0.0.0) and EDGE2's two TLOCs reflected by the controller (10.255.0.1). Note that EDGE2's mpls TLOC is known even though MPLS cannot reach the controller: TLOCs are advertised by the edge over whichever control connection is up.</p>

<div class="eg"><p><b>Worked example.</b> Edge A has TLOCs biz-internet and mpls; edge B has lte and mpls. Without restrict the real platform attempts four pairs; biz-internet to lte works over the internet, mpls to mpls works over the MPLS cloud, and the two cross pairs fail for lack of reachability. With <code>color mpls restrict</code> on both edges, mpls pairs only with mpls, so just two pairs are attempted, biz-internet–lte and mpls–mpls: <b>two tunnels, both up</b>, and no down sessions cluttering the dashboard.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using a public colour on an MPLS circuit, so the edge advertises a NAT-discovered public IP the MPLS peers cannot reach. Forgetting the VPN 0 default route, so DTLS cannot leave. Putting the LAN interface in VPN 0, which leaks user subnets into the underlay and never into OMP.</p></div>

<div class="exam"><p><b>Exam traps.</b> VPN 0 = transport, VPN 512 = management, others = service. TLOC = system-ip + colour + encapsulation. <code>restrict</code> = same colour only. Private colour to private colour uses private IPs; anything else uses public IPs.</p></div>

<div class="scn"><h4>The MPLS tunnels that pointed at the internet</h4><p>A manufacturer saw half its BFD sessions down after migrating to SD-WAN. Every down session involved an MPLS TLOC. The installer had coloured the MPLS circuits <code>gold</code> to "mark them premium". Gold is a public colour, so the edges advertised the public IP the Validator saw, which for MPLS was the provider's NAT address, unreachable from other MPLS sites. Recolouring to <code>mpls</code> with <code>restrict</code> brought every tunnel up.</p><p><b>Lesson:</b> colours are not decoration. Public versus private decides which address the tunnels target.</p></div>

<div class="iv"><p class="q">"What is a TLOC and how does colour affect tunnel formation?"</p><p>Strong answer: a TLOC is the transport attachment of an edge, identified by system-ip, colour and encapsulation, advertised in OMP with private and public addresses. Tunnels are built TLOC to TLOC. Private-to-private colours use private IPs; if either side is public the public (NAT) IP is used. By default all TLOC pairs are tried; <code>restrict</code> limits a colour to the same colour. Give the mpls restrict example.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>In SD-WAN a VPN is a VRF: VPN 0 transport, VPN 512 management, service VPNs for users.</li>
<li>A TLOC = (system-ip, colour, encapsulation) with private and public addresses.</li>
<li>Public vs private colour decides which address a tunnel uses.</li>
<li><code>restrict</code> limits a colour to same-colour tunnels.</li>
<li>Verify with <code>show sdwan omp tlocs</code> and <code>show sdwan control local-properties</code>.</li>
</ul></div>
`,hi:`
<p>Ek courier hub ki do sides hoti hain. <b>Loading dock</b> highways ki taraf hota hai: alag-alag companies ke trucks (road, rail, air) wahan aate hain. <b>Sorting floor</b> customers ki taraf hota hai, alag clients ke liye alag counters taaki unke parcels kabhi mix na hon. SD-WAN edge bhi isi tarah bana hai: WAN circuits ki taraf ek <b>transport side</b> aur users ki taraf ek <b>service side</b>, jo alag VPNs mein bati hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="WAN edge par transport aur service VPNs">
<rect x="220" y="60" width="200" height="130" rx="10" fill="#e2e8f0"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="14">EDGE1 (site 100)</text>
<rect x="232" y="95" width="80" height="40" rx="6" fill="#bae6fd"/><text x="272" y="120" text-anchor="middle" class="svg-ink" font-size="12">VPN 0</text>
<rect x="328" y="95" width="80" height="40" rx="6" fill="#bbf7d0"/><text x="368" y="120" text-anchor="middle" class="svg-ink" font-size="12">VPN 1</text>
<rect x="280" y="145" width="80" height="34" rx="6" fill="#fde68a"/><text x="320" y="167" text-anchor="middle" class="svg-ink" font-size="12">VPN 512</text>
<rect x="10" y="40" width="150" height="40" rx="6" fill="#bae6fd"/><text x="85" y="65" text-anchor="middle" class="svg-ink" font-size="12">INET: biz-internet</text>
<rect x="10" y="150" width="150" height="40" rx="6" fill="#bae6fd"/><text x="85" y="175" text-anchor="middle" class="svg-ink" font-size="12">MPLS: mpls</text>
<line x1="160" y1="60" x2="232" y2="110" stroke="#64748b"/><line x1="160" y1="170" x2="232" y2="122" stroke="#64748b"/>
<rect x="480" y="95" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="555" y="120" text-anchor="middle" class="svg-ink" font-size="12">LAN 10.10.1.0/24</text>
<line x1="408" y1="115" x2="480" y2="115" stroke="#64748b"/>
<text x="85" y="215" text-anchor="middle" class="svg-muted" font-size="12">do TLOCs</text>
<text x="555" y="160" text-anchor="middle" class="svg-muted" font-size="12">service VPN</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">out-of-band management</text>
</svg><p class="cap">VPN 0 par har colour ek TLOC hai. User subnets service VPNs mein rehte hain aur kabhi VPN 0 routing ko nahi chhoote.</p></div>

<h3>SD-WAN mein VPN ka matlab VRF hai</h3>
<p>SD-WAN mein <b>VPN</b> shabd ka matlab ek routing table (VRF) hai, encrypted tunnel nahi.</p>
<ul>
<li><b>VPN 0</b> — <b>transport VPN</b>. WAN interfaces, unke default routes aur control connections yahan rehte hain. IOS XE edges par yeh global routing table hai.</li>
<li><b>VPN 512</b> — out-of-band <b>management</b> (IOS XE par Mgmt-intf VRF).</li>
<li><b>Service VPNs</b> (1–511 aur 513–65530) — user side. Branch LANs, voice, guest, PCI sabko apna VPN milta hai, isi tarah SD-WAN end to end <b>segmentation</b> deta hai. IOS XE par yeh normal <code>vrf definition</code>s hain.</li>
</ul>
<p>Service VPN mein seekhe gaye ya connected prefixes apne VPN number ke saath OMP mein advertise hote hain (data packets mein ek label jaata hai), isliye far edge unhe sirf usi VPN mein deliver karta hai.</p>

<h3>TLOC: ek transport ka address</h3>
<p><b>TLOC</b> (Transport Locator) kisi edge ka ek transport se attachment point hai. Yeh tuple <b>(system-ip, colour, encapsulation)</b> se pehchana jaata hai, jaise (10.255.0.11, biz-internet, ipsec). TLOC route mein interface ka <b>private IP aur port</b>, Validator ko dikhne wala <b>public IP aur port</b> (NAT ke peeche yeh alag hote hain), aur preference, weight, site-id aur restrict jaise attributes bhi hote hain. Do circuit wale edge ke do TLOCs hote hain. Remote edges tunnels <i>TLOCs tak</i> banate hain, routers tak nahi.</p>

<h3>Colours</h3>
<p><b>Colour</b> ek label hai jo transport ko describe karta hai. Ek fixed list hai:</p>
<table class="cmp"><tr><th>Public colours</th><th>Private colours</th></tr>
<tr><td>default, biz-internet, public-internet, lte, 3g, red, green, blue, gold, silver, bronze, custom1-3</td><td>mpls, metro-ethernet, private1-6</td></tr></table>
<p>Colour decide karta hai ki tunnel banane ke liye <b>kaunsa address</b> use hoga. Do private colours ke beech edges ek doosre ka <b>private</b> IP use karte hain (private network par NAT expected nahi). Jab bhi koi public colour involved ho, woh <b>public</b> (post-NAT) IP use karte hain. Default mein edge har local TLOC se har remote TLOC tak tunnel try karta hai; jin pairs ka underlay path nahi (jaise mpls se biz-internet) woh bas down rehte hain. In bekaar attempts ko rokne ke liye aap <code>restrict</code> jodte ho, jo colour ko sirf <b>same</b> colour ke tunnels tak seemit karta hai. Lab ise simple karti hai: private colours sirf same colour se jodi banate hain, aur public colours kisi bhi public colour se.</p>

<h3>Transport side configure karna (lab syntax)</h3>
<pre class="code"><span class="c">! VPN 0: transport interfaces, har taraf default route</span>
interface GigabitEthernet0/0
 description INET transport
 ip address 198.51.100.2 255.255.255.252
interface GigabitEthernet0/1
 description MPLS transport
 ip address 172.16.1.2 255.255.255.252
ip route 0.0.0.0 0.0.0.0 198.51.100.1
ip route 172.16.0.0 255.255.0.0 172.16.1.1
<span class="c">! Har circuit ko colour ke saath TLOC mark karo</span>
sdwan
 interface GigabitEthernet0/0
  tunnel-interface
   encapsulation ipsec
   color biz-internet
 interface GigabitEthernet0/1
  tunnel-interface
   encapsulation ipsec
   color mpls
<span class="c">! Service side: LAN VPN 1 mein judta hai (IOS XE: vrf forwarding 1)</span>
vpn 1
 interface GigabitEthernet0/2</pre>
<p><code>tunnel-interface</code> ke neeche real edges <code>allow-service</code> (us WAN port par kaunsi services jaise SSH, NETCONF, DNS ya ICMP ka jawab diya ja sakta hai; baaki block), <code>max-control-connections</code> (jo circuit controllers tak nahi pahunch sakta us par 0), aur <code>color mpls restrict</code> bhi lete hain.</p>

<pre class="out">EDGE1# show sdwan omp tlocs
TLOC IP          COLOR           ENCAP  FROM PEER        STATUS  PUBLIC IP
---------------- --------------- ------ ---------------- ------- ---------------
10.255.0.11      biz-internet    ipsec  0.0.0.0          C,Red,R 198.51.100.2
10.255.0.11      mpls            ipsec  0.0.0.0          C,Red,R 172.16.1.2
<span class="hl">10.255.0.12      biz-internet    ipsec  10.255.0.1       C,I,R   198.51.100.6</span>
<span class="hl">10.255.0.12      mpls            ipsec  10.255.0.1       C,I,R   172.16.2.2</span></pre>
<p>EDGE1 apne do TLOCs (peer 0.0.0.0 se) aur controller (10.255.0.1) dwara reflect kiye EDGE2 ke do TLOCs dekhta hai. Dhyan do ki EDGE2 ka mpls TLOC pata hai jabki MPLS controller tak nahi pahunch sakta: edge TLOCs ko jo bhi control connection up ho us par advertise karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Edge A ke TLOCs biz-internet aur mpls hain; edge B ke lte aur mpls. Restrict ke bina real platform chaar pairs try karta hai; biz-internet se lte internet par chalta hai, mpls se mpls MPLS cloud par chalta hai, aur do cross pairs reachability na hone se fail hote hain. Dono par <code>color mpls restrict</code> ke saath mpls sirf mpls se jodi banata hai, isliye sirf do pairs try hote hain, biz-internet–lte aur mpls–mpls: <b>do tunnels, dono up</b>, aur dashboard par koi down session ka kachra nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> MPLS circuit par public colour use karna, jisse edge NAT se mila public IP advertise karta hai jahan MPLS peers nahi pahunch sakte. VPN 0 default route bhoolna, jisse DTLS bahar hi nahi ja paata. LAN interface ko VPN 0 mein daalna, jisse user subnets underlay mein leak hote hain aur OMP mein kabhi nahi jaate.</p></div>

<div class="exam"><p><b>Exam traps.</b> VPN 0 = transport, VPN 512 = management, baaki = service. TLOC = system-ip + colour + encapsulation. <code>restrict</code> = sirf same colour. Private colour se private colour private IPs use karta hai; baaki sab public IPs.</p></div>

<div class="scn"><h4>MPLS tunnels jo internet ki taraf point kar rahe the</h4><p>Ek manufacturer ne SD-WAN migration ke baad apne aadhe BFD sessions down dekhe. Har down session mein ek MPLS TLOC tha. Installer ne MPLS circuits ko "premium mark karne" ke liye <code>gold</code> colour diya tha. Gold public colour hai, isliye edges ne Validator ko dikha public IP advertise kiya, jo MPLS ke liye provider ka NAT address tha, doosri MPLS sites se unreachable. <code>mpls</code> aur <code>restrict</code> par recolour karne se har tunnel up ho gaya.</p><p><b>Seekh:</b> colours decoration nahi hain. Public ya private decide karta hai ki tunnels kis address ko target karenge.</p></div>

<div class="iv"><p class="q">"TLOC kya hai aur colour tunnel formation ko kaise affect karta hai?"</p><p>Strong answer: TLOC edge ka transport attachment hai, system-ip, colour aur encapsulation se pehchana jaata hai, aur OMP mein private aur public addresses ke saath advertise hota hai. Tunnels TLOC se TLOC bante hain. Private-to-private colours private IPs use karte hain; agar koi bhi side public ho to public (NAT) IP use hota hai. Default mein saare TLOC pairs try hote hain; <code>restrict</code> colour ko same colour tak seemit karta hai. mpls restrict ka example do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN mein VPN ek VRF hai: VPN 0 transport, VPN 512 management, users ke liye service VPNs.</li>
<li>TLOC = (system-ip, colour, encapsulation), private aur public addresses ke saath.</li>
<li>Public ya private colour decide karta hai ki tunnel kaunsa address use karega.</li>
<li><code>restrict</code> colour ko same-colour tunnels tak seemit karta hai.</li>
<li><code>show sdwan omp tlocs</code> aur <code>show sdwan control local-properties</code> se verify karo.</li>
</ul></div>
`}};export{e as default};