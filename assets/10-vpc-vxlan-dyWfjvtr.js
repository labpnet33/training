var e={id:`vpc-vxlan`,h:{en:`vPC with VXLAN EVPN, and EVPN multihoming`,hi:`VXLAN EVPN ke saath vPC, aur EVPN multihoming`},body:{en:`
<p>A courier company has two depots next to each other that share one public address, "Depot Park". Parcels from anywhere in the country are addressed to Depot Park, and whichever depot's gate the lorry reaches first unloads them. Each depot also has its own private address for things that belong only to it. That is the <b>anycast VTEP</b> idea: in a VXLAN fabric, a vPC pair shares one tunnel address so remote switches treat it as one destination.</p>

<h3>Quick recap of VXLAN EVPN</h3>
<p>In a modern spine-leaf fabric, Layer 2 segments are carried over the routed underlay by <b>VXLAN</b>. Each leaf is a <b>VTEP</b> (VXLAN tunnel endpoint) with an IP address on a loopback, used as the source of its <code>nve1</code> interface. <b>BGP EVPN</b> advertises which MAC and IP addresses sit behind which VTEP. So a remote leaf sends traffic for SRV1 to "the VTEP IP that advertised SRV1's MAC".</p>
<p>Now make SRV1 dual-homed to NX1 and NX2 with vPC. If each leaf advertised SRV1 with its own VTEP IP, remote leaves would see the same MAC behind two addresses and it would move back and forth. The solution: both peers use one shared VTEP address.</p>

<h3>The anycast VTEP: a secondary IP on the NVE loopback</h3>
<pre class="code"><span class="c">! NX1</span>
interface loopback1
  ip address 10.100.0.11/32              <span class="c">! primary IP, unique (PIP)</span>
  ip address 10.100.0.100/32 secondary   <span class="c">! shared anycast VTEP (VIP)</span>
<span class="c">! NX2</span>
interface loopback1
  ip address 10.100.0.12/32
  ip address 10.100.0.100/32 secondary
<span class="c">! Both</span>
interface nve1
  no shutdown
  host-reachability protocol bgp
  source-interface loopback1</pre>
<p>When the NVE source loopback has a secondary address and vPC is configured, the pair uses the <b>secondary IP as the VTEP address</b> for everything behind vPC ports. Both leaves advertise that address into the underlay, so spines see two equal-cost paths to 10.100.0.100 and ECMP spreads remote traffic across both leaves. EVPN routes for SRV1 carry next hop 10.100.0.100. If NX1 dies, 10.100.0.100 is still reachable through NX2 and nothing needs to be re-learned remotely. The secondary address must be identical on both peers; a mismatch is flagged and the NVE on the secondary can be held down.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Anycast VTEP on a vPC pair">
<rect x="170" y="10" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="230" y="33" text-anchor="middle" class="svg-ink" font-size="13">Spine 1</text>
<rect x="350" y="10" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="410" y="33" text-anchor="middle" class="svg-ink" font-size="13">Spine 2</text>
<rect x="60" y="110" width="170" height="54" rx="8" fill="#bae6fd"/><text x="145" y="132" text-anchor="middle" class="svg-ink" font-size="13">NX1 PIP .11</text><text x="145" y="151" text-anchor="middle" class="svg-accent" font-size="12">VIP 10.100.0.100</text>
<rect x="260" y="110" width="170" height="54" rx="8" fill="#bae6fd"/><text x="345" y="132" text-anchor="middle" class="svg-ink" font-size="13">NX2 PIP .12</text><text x="345" y="151" text-anchor="middle" class="svg-accent" font-size="12">VIP 10.100.0.100</text>
<rect x="470" y="110" width="150" height="54" rx="8" fill="#fde68a"/><text x="545" y="132" text-anchor="middle" class="svg-ink" font-size="13">LEAF3</text><text x="545" y="151" text-anchor="middle" class="svg-muted" font-size="12">remote VTEP</text>
<line x1="230" y1="46" x2="145" y2="110" stroke="#64748b" stroke-width="2"/><line x1="230" y1="46" x2="345" y2="110" stroke="#64748b" stroke-width="2"/><line x1="230" y1="46" x2="545" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="46" x2="145" y2="110" stroke="#64748b" stroke-width="2"/><line x1="410" y1="46" x2="345" y2="110" stroke="#64748b" stroke-width="2"/><line x1="410" y1="46" x2="545" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="230" y1="130" x2="260" y2="130" stroke="#64748b" stroke-width="4"/>
<rect x="170" y="210" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="245" y="235" text-anchor="middle" class="svg-ink" font-size="13">SRV1 (vPC)</text>
<line x1="145" y1="164" x2="220" y2="210" stroke="#64748b" stroke-width="3"/><line x1="345" y1="164" x2="270" y2="210" stroke="#64748b" stroke-width="3"/>
</svg><p class="cap">LEAF3 sees one next hop, 10.100.0.100, reachable over ECMP through both vPC peers.</p></div>

<pre class="out">NX1# show nve interface nve1 detail
Interface: nve1, State: Up, encapsulation: VXLAN
 VPC Capability: VPC-VIP-Only [notified]
 Host Learning Mode: Control-Plane
<span class="hl"> Source-Interface: loopback1 (primary: 10.100.0.11, secondary: 10.100.0.100)</span>

LEAF3# show nve peers
Interface Peer-IP          State LearnType Uptime   Router-Mac
--------- ---------------  ----- --------- -------- -----------------
<span class="hl">nve1      10.100.0.100     Up    CP        02:14:07 n/a</span></pre>

<h3>The peer-link in a VXLAN design</h3>
<p>The peer-link keeps its classic jobs: CFS synchronisation, orphan-port traffic and flooding. It also becomes a <b>backup underlay path</b>. If NX1 loses all its spine uplinks, traffic that arrives at NX1 for the fabric has no way out except through NX2. The usual design is a dedicated infra VLAN with an SVI on each peer, running the underlay routing protocol across the peer-link (on some platforms declared with <code>system nve infra-vlans</code>). Without it, a leaf with dead uplinks black-holes whatever the servers hash toward it.</p>

<h3>PIP and VIP for routed traffic</h3>
<p>Single-attached hosts and external routes learned by only one peer should not be advertised with the shared VIP, because a remote leaf might send the traffic to the wrong peer, which would then need the peer-link. With <code>advertise-pip</code> under the BGP EVPN address family and <code>advertise virtual-rmac</code> on the NVE interface, each peer advertises its <b>primary IP (PIP)</b> for prefix routes (type-5) it alone owns, and keeps the VIP for dual-homed hosts.</p>
<pre class="code">router bgp 65001
  address-family l2vpn evpn
    advertise-pip
interface nve1
  advertise virtual-rmac</pre>

<h3>vPC fabric peering (concept)</h3>
<p>Physical peer-link ports are expensive 100G interfaces. <b>vPC fabric peering</b>, available on Nexus 9000, replaces the physical peer-link with a <b>virtual peer-link</b> that runs as a tunnel across the spines, using <code>virtual peer-link destination ... source ...</code> in the vPC domain, with fabric uplinks marked <code>port-type fabric</code>. Control and data that would use the peer-link now ride through the fabric. The keepalive still runs separately. It saves ports and cables, at the cost of depending on the fabric for peer communication.</p>

<h3>EVPN multihoming: the standards-based alternative</h3>
<p><b>EVPN multihoming</b> (ESI multihoming, RFC 7432) solves the same problem in the control plane. Each port-channel toward a server is given an <b>Ethernet Segment Identifier (ESI)</b>; leaves that share an ESI advertise it with EVPN route types 1 and 4, elect a <b>designated forwarder</b> for broadcast and multicast, and remote leaves load-balance across all of them. There is no peer-link and no keepalive, more than two leaves can share a segment on some platforms, and it works between vendors.</p>
<table class="cmp"><tr><th>Aspect</th><th>vPC</th><th>EVPN multihoming (ESI)</th></tr>
<tr><td>Standard</td><td>Cisco proprietary</td><td>Open standard, multi-vendor</td></tr>
<tr><td>Peer-link and keepalive</td><td>Required (or fabric peering)</td><td>Not needed</td></tr>
<tr><td>Leaves per segment</td><td>Exactly two</td><td>Two or more, platform dependent</td></tr>
<tr><td>Consistency checks</td><td>Yes, type-1 and type-2</td><td>No automatic peer comparison; config discipline needed</td></tr>
<tr><td>Maturity on Nexus</td><td>Very mature, widely deployed</td><td>Supported, growing</td></tr>
<tr><td>Where it works</td><td>Classic Layer 2 and VXLAN</td><td>VXLAN EVPN fabrics only</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A fabric has 20 leaf pairs. With physical peer-links of 2 × 100G each, that is 80 ports of 100G. With vPC fabric peering, those 80 ports become server or uplink ports. With EVPN multihoming instead, the pairs are not "pairs" at all: they are 40 independent leaves, and a new server can be multihomed to any two leaves in the same rack.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Different anycast secondary IPs on the two peers; forgetting the backup underlay path over the peer-link; and advertising single-attached hosts with the VIP, which sends half their traffic across the peer-link.</p></div>

<div class="exam"><p><b>Exam trap.</b> In a vPC VTEP pair, the anycast VTEP is the <b>secondary</b> IP of the NVE source loopback, identical on both peers. The primary IP stays unique and is used as the PIP.</p></div>

<div class="scn"><h4>The leaf with no way out</h4><p>During a spine upgrade, one leaf of a vPC VTEP pair temporarily lost both of its uplinks. Half the flows from dual-homed servers, the ones that hashed to that leaf, timed out. The pair had no underlay routing across the peer-link, so the leaf had no route to remote VTEPs. The team added an infra VLAN SVI on both peers with OSPF over the peer-link. In the next upgrade the same event caused no loss: traffic simply detoured over the peer-link to the partner leaf.</p><p><b>Lesson:</b> in VXLAN designs, the peer-link must also be a backup path for the underlay.</p></div>

<div class="iv"><p class="q">"How does vPC work together with VXLAN EVPN, and how does it compare with EVPN multihoming?"</p><p>Strong answer: both vPC peers share an anycast VTEP address, configured as a secondary IP on the NVE source loopback, so remote VTEPs see dual-homed hosts behind one next hop reachable by ECMP. The peer-link still carries CFS and orphan traffic and should provide a backup underlay path; advertise-pip with virtual-rmac is used for routes that only one peer owns. EVPN multihoming achieves all-active multihoming with an ESI in BGP, no peer-link or keepalive, and is multi-vendor, while vPC is proprietary but very mature and has built-in consistency checks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A vPC VTEP pair shares an anycast VTEP: the secondary IP on the NVE source loopback, identical on both peers.</li>
<li>Remote VTEPs see one next hop reachable via ECMP through both peers.</li>
<li>The peer-link also provides a backup underlay route; use advertise-pip and virtual-rmac for single-owner routes.</li>
<li>vPC fabric peering replaces the physical peer-link with a virtual one over the spines.</li>
<li>EVPN multihoming (ESI) is the standards-based, peer-link-free alternative; vPC is proprietary but mature.</li>
</ul></div>
`,hi:`
<p>Ek courier company ke do depots ek doosre ke bagal mein hain jo ek public address share karte hain, "Depot Park". Desh bhar se parcels Depot Park ke naam aate hain, aur lorry jis depot ke gate par pehle pahunchti hai wahi unhe utaarta hai. Har depot ka apna private address bhi hai un cheezon ke liye jo sirf uski hain. Yahi <b>anycast VTEP</b> idea hai: VXLAN fabric mein vPC pair ek tunnel address share karta hai taaki remote switches use ek destination maanein.</p>

<h3>VXLAN EVPN ka quick recap</h3>
<p>Modern spine-leaf fabric mein Layer 2 segments routed underlay ke upar <b>VXLAN</b> se jaate hain. Har leaf ek <b>VTEP</b> (VXLAN tunnel endpoint) hai jiska loopback par ek IP address hota hai, jo uske <code>nve1</code> interface ke source ki tarah use hota hai. <b>BGP EVPN</b> advertise karta hai ki kaunse MAC aur IP addresses kis VTEP ke peeche hain. Isliye remote leaf SRV1 ka traffic "us VTEP IP ko jisne SRV1 ka MAC advertise kiya" bhejta hai.</p>
<p>Ab SRV1 ko vPC ke saath NX1 aur NX2 par dual-home karo. Agar har leaf SRV1 ko apne VTEP IP ke saath advertise kare, to remote leaves ko same MAC do addresses ke peeche dikhega aur woh idhar udhar hilta rahega. Solution: dono peers ek shared VTEP address use karein.</p>

<h3>Anycast VTEP: NVE loopback par secondary IP</h3>
<pre class="code"><span class="c">! NX1</span>
interface loopback1
  ip address 10.100.0.11/32              <span class="c">! primary IP, unique (PIP)</span>
  ip address 10.100.0.100/32 secondary   <span class="c">! shared anycast VTEP (VIP)</span>
<span class="c">! NX2</span>
interface loopback1
  ip address 10.100.0.12/32
  ip address 10.100.0.100/32 secondary
<span class="c">! Dono</span>
interface nve1
  no shutdown
  host-reachability protocol bgp
  source-interface loopback1</pre>
<p>Jab NVE source loopback par secondary address ho aur vPC configured ho, to pair vPC ports ke peeche ki har cheez ke liye <b>secondary IP ko VTEP address</b> ki tarah use karta hai. Dono leaves woh address underlay mein advertise karte hain, isliye spines ko 10.100.0.100 tak do equal-cost paths dikhte hain aur ECMP remote traffic ko dono leaves par baant deta hai. SRV1 ke EVPN routes next hop 10.100.0.100 ke saath aate hain. Agar NX1 mar jaaye, 10.100.0.100 NX2 ke through ab bhi reachable hai aur remote mein kuch dobara seekhna nahi padta. Secondary address dono peers par identical hona chahiye; mismatch flag hota hai aur secondary par NVE down rakha ja sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="vPC pair par anycast VTEP">
<rect x="170" y="10" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="230" y="33" text-anchor="middle" class="svg-ink" font-size="13">Spine 1</text>
<rect x="350" y="10" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="410" y="33" text-anchor="middle" class="svg-ink" font-size="13">Spine 2</text>
<rect x="60" y="110" width="170" height="54" rx="8" fill="#bae6fd"/><text x="145" y="132" text-anchor="middle" class="svg-ink" font-size="13">NX1 PIP .11</text><text x="145" y="151" text-anchor="middle" class="svg-accent" font-size="12">VIP 10.100.0.100</text>
<rect x="260" y="110" width="170" height="54" rx="8" fill="#bae6fd"/><text x="345" y="132" text-anchor="middle" class="svg-ink" font-size="13">NX2 PIP .12</text><text x="345" y="151" text-anchor="middle" class="svg-accent" font-size="12">VIP 10.100.0.100</text>
<rect x="470" y="110" width="150" height="54" rx="8" fill="#fde68a"/><text x="545" y="132" text-anchor="middle" class="svg-ink" font-size="13">LEAF3</text><text x="545" y="151" text-anchor="middle" class="svg-muted" font-size="12">remote VTEP</text>
<line x1="230" y1="46" x2="145" y2="110" stroke="#64748b" stroke-width="2"/><line x1="230" y1="46" x2="345" y2="110" stroke="#64748b" stroke-width="2"/><line x1="230" y1="46" x2="545" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="46" x2="145" y2="110" stroke="#64748b" stroke-width="2"/><line x1="410" y1="46" x2="345" y2="110" stroke="#64748b" stroke-width="2"/><line x1="410" y1="46" x2="545" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="230" y1="130" x2="260" y2="130" stroke="#64748b" stroke-width="4"/>
<rect x="170" y="210" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="245" y="235" text-anchor="middle" class="svg-ink" font-size="13">SRV1 (vPC)</text>
<line x1="145" y1="164" x2="220" y2="210" stroke="#64748b" stroke-width="3"/><line x1="345" y1="164" x2="270" y2="210" stroke="#64748b" stroke-width="3"/>
</svg><p class="cap">LEAF3 ko ek next hop dikhta hai, 10.100.0.100, jo dono vPC peers ke through ECMP se reachable hai.</p></div>

<pre class="out">NX1# show nve interface nve1 detail
Interface: nve1, State: Up, encapsulation: VXLAN
 VPC Capability: VPC-VIP-Only [notified]
 Host Learning Mode: Control-Plane
<span class="hl"> Source-Interface: loopback1 (primary: 10.100.0.11, secondary: 10.100.0.100)</span>

LEAF3# show nve peers
Interface Peer-IP          State LearnType Uptime   Router-Mac
--------- ---------------  ----- --------- -------- -----------------
<span class="hl">nve1      10.100.0.100     Up    CP        02:14:07 n/a</span></pre>

<h3>VXLAN design mein peer-link</h3>
<p>Peer-link apne classic kaam rakhta hai: CFS synchronisation, orphan-port traffic aur flooding. Yeh ek <b>backup underlay path</b> bhi ban jaata hai. Agar NX1 apne saare spine uplinks kho de, to fabric ke liye NX1 par aane wale traffic ke paas NX2 ke alawa bahar jaane ka koi raasta nahi. Usual design hai ek dedicated infra VLAN jiska har peer par SVI ho, jo peer-link ke across underlay routing protocol chalaye (kuch platforms par <code>system nve infra-vlans</code> se declare). Iske bina dead uplinks wala leaf woh sab black-hole karta hai jo servers uski taraf hash karte hain.</p>

<h3>Routed traffic ke liye PIP aur VIP</h3>
<p>Single-attached hosts aur sirf ek peer ke seekhe external routes shared VIP ke saath advertise nahi hone chahiye, kyunki remote leaf traffic galat peer ko bhej sakta hai, jise phir peer-link chahiye hoga. BGP EVPN address family ke neeche <code>advertise-pip</code> aur NVE interface par <code>advertise virtual-rmac</code> ke saath, har peer un prefix routes (type-5) ke liye apna <b>primary IP (PIP)</b> advertise karta hai jo sirf uske hain, aur dual-homed hosts ke liye VIP rakhta hai.</p>
<pre class="code">router bgp 65001
  address-family l2vpn evpn
    advertise-pip
interface nve1
  advertise virtual-rmac</pre>

<h3>vPC fabric peering (concept)</h3>
<p>Physical peer-link ports mehenge 100G interfaces hain. <b>vPC fabric peering</b>, jo Nexus 9000 par available hai, physical peer-link ki jagah ek <b>virtual peer-link</b> lagata hai jo spines ke across tunnel ki tarah chalta hai, vPC domain mein <code>virtual peer-link destination ... source ...</code> use karke, aur fabric uplinks <code>port-type fabric</code> mark hote hain. Jo control aur data peer-link use karta, woh ab fabric ke through jaata hai. Keepalive ab bhi alag chalta hai. Isse ports aur cables bachte hain, is keemat par ki peer communication fabric par depend karta hai.</p>

<h3>EVPN multihoming: standards-based alternative</h3>
<p><b>EVPN multihoming</b> (ESI multihoming, RFC 7432) wahi problem control plane mein solve karta hai. Server ki taraf har port-channel ko ek <b>Ethernet Segment Identifier (ESI)</b> diya jaata hai; ESI share karne wale leaves use EVPN route types 1 aur 4 se advertise karte hain, broadcast aur multicast ke liye <b>designated forwarder</b> elect karte hain, aur remote leaves un sab par load-balance karte hain. Koi peer-link nahi aur koi keepalive nahi, kuch platforms par do se zyada leaves ek segment share kar sakte hain, aur yeh vendors ke beech chalta hai.</p>
<table class="cmp"><tr><th>Pehlu</th><th>vPC</th><th>EVPN multihoming (ESI)</th></tr>
<tr><td>Standard</td><td>Cisco proprietary</td><td>Open standard, multi-vendor</td></tr>
<tr><td>Peer-link aur keepalive</td><td>Zaroori (ya fabric peering)</td><td>Zaroorat nahi</td></tr>
<tr><td>Har segment mein leaves</td><td>Bilkul do</td><td>Do ya zyada, platform par depend</td></tr>
<tr><td>Consistency checks</td><td>Haan, type-1 aur type-2</td><td>Automatic peer comparison nahi; config discipline chahiye</td></tr>
<tr><td>Nexus par maturity</td><td>Bahut mature, widely deployed</td><td>Supported, badh raha hai</td></tr>
<tr><td>Kahan chalta hai</td><td>Classic Layer 2 aur VXLAN</td><td>Sirf VXLAN EVPN fabrics</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Ek fabric mein 20 leaf pairs hain. Har ek ke 2 × 100G physical peer-links ke saath, yeh 100G ke 80 ports hain. vPC fabric peering ke saath woh 80 ports server ya uplink ports ban jaate hain. Iski jagah EVPN multihoming ke saath pairs "pairs" hi nahi rehte: woh 40 independent leaves hain, aur naya server same rack ke kisi bhi do leaves par multihome ho sakta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Dono peers par alag anycast secondary IPs; peer-link ke upar backup underlay path bhool jaana; aur single-attached hosts ko VIP ke saath advertise karna, jo unka aadha traffic peer-link ke paar bhejta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> vPC VTEP pair mein anycast VTEP NVE source loopback ka <b>secondary</b> IP hai, dono peers par identical. Primary IP unique rehta hai aur PIP ki tarah use hota hai.</p></div>

<div class="scn"><h4>Woh leaf jiske paas bahar ka raasta nahi tha</h4><p>Spine upgrade ke dauraan vPC VTEP pair ke ek leaf ne thodi der ke liye apne dono uplinks kho diye. Dual-homed servers ke aadhe flows, jo us leaf par hash hote the, time out ho gaye. Pair mein peer-link ke across koi underlay routing nahi thi, isliye leaf ke paas remote VTEPs tak route nahi tha. Team ne dono peers par infra VLAN SVI joda jismein peer-link ke upar OSPF chala. Agle upgrade mein wahi event bina loss ke hua: traffic bas peer-link se partner leaf tak ghoom gaya.</p><p><b>Seekh:</b> VXLAN designs mein peer-link underlay ke liye backup path bhi hona chahiye.</p></div>

<div class="iv"><p class="q">"vPC VXLAN EVPN ke saath kaise kaam karta hai, aur EVPN multihoming se kaise compare hota hai?"</p><p>Strong answer: dono vPC peers ek anycast VTEP address share karte hain, jo NVE source loopback par secondary IP ki tarah configure hota hai, isliye remote VTEPs ko dual-homed hosts ek next hop ke peeche dikhte hain jo ECMP se reachable hai. Peer-link ab bhi CFS aur orphan traffic le jaata hai aur use backup underlay path dena chahiye; sirf ek peer ke routes ke liye advertise-pip aur virtual-rmac use hote hain. EVPN multihoming BGP mein ESI ke saath all-active multihoming deta hai, bina peer-link ya keepalive ke, aur multi-vendor hai, jabki vPC proprietary hai par bahut mature hai aur usmein built-in consistency checks hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>vPC VTEP pair ek anycast VTEP share karta hai: NVE source loopback par secondary IP, dono peers par identical.</li>
<li>Remote VTEPs ko ek next hop dikhta hai jo dono peers ke through ECMP se reachable hai.</li>
<li>Peer-link backup underlay route bhi deta hai; single-owner routes ke liye advertise-pip aur virtual-rmac use karo.</li>
<li>vPC fabric peering physical peer-link ki jagah spines ke upar virtual peer-link lagata hai.</li>
<li>EVPN multihoming (ESI) standards-based, bina peer-link wala alternative hai; vPC proprietary par mature hai.</li>
</ul></div>
`}};export{e as default};