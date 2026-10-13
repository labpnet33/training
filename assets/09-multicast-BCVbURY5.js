var e={id:`multicast`,h:{en:`Multicast underlay for VXLAN BUM traffic: PIM, anycast RP and BiDir`,hi:`VXLAN BUM traffic ke liye multicast underlay: PIM, anycast RP aur BiDir`},body:{en:`
<p>You want to send the same announcement to 40 friends. You can send 40 separate messages yourself, or post once in a group and let the app deliver a copy to everyone. The first method is <b>ingress replication</b>; the second is <b>multicast</b>. A VXLAN fabric faces exactly this choice every time a server sends a broadcast, such as an ARP request, because that frame must reach every leaf that has the same segment.</p>

<h3>What is BUM traffic?</h3>
<p><b>BUM</b> stands for <b>B</b>roadcast (ARP requests, DHCP discovers), <b>U</b>nknown unicast (a frame to a MAC address the leaf has not learned yet) and <b>M</b>ulticast (tenant multicast traffic). A normal switch floods these out of every port in the VLAN. In VXLAN the "ports" of a segment are the remote VTEPs that host the same <b>VNI</b>, so the leaf must deliver one copy to each of them. The underlay offers two ways to do that.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Ingress replication versus multicast">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">Ingress replication</text>
<rect x="110" y="30" width="100" height="34" rx="6" fill="#ddd6fe"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="12">SPINE</text>
<rect x="20" y="190" width="80" height="34" rx="6" fill="#bae6fd"/><text x="60" y="212" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text>
<rect x="120" y="190" width="80" height="34" rx="6" fill="#bae6fd"/><text x="160" y="212" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text>
<rect x="220" y="190" width="80" height="34" rx="6" fill="#bae6fd"/><text x="260" y="212" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text>
<line x1="55" y1="190" x2="130" y2="64" stroke="#64748b" stroke-width="2"/><line x1="65" y1="190" x2="140" y2="64" stroke="#64748b" stroke-width="2"/>
<line x1="160" y1="64" x2="160" y2="190" stroke="#64748b" stroke-width="2"/><line x1="190" y1="64" x2="260" y2="190" stroke="#64748b" stroke-width="2"/>
<text x="160" y="245" text-anchor="middle" class="svg-accent" font-size="12">LEAF1 sends 2 unicast copies</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">Multicast underlay</text>
<rect x="430" y="30" width="100" height="34" rx="6" fill="#ddd6fe"/><text x="480" y="52" text-anchor="middle" class="svg-ink" font-size="12">SPINE (RP)</text>
<rect x="340" y="190" width="80" height="34" rx="6" fill="#bae6fd"/><text x="380" y="212" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text>
<rect x="440" y="190" width="80" height="34" rx="6" fill="#bae6fd"/><text x="480" y="212" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text>
<rect x="540" y="190" width="80" height="34" rx="6" fill="#bae6fd"/><text x="580" y="212" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text>
<line x1="380" y1="190" x2="455" y2="64" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="64" x2="480" y2="190" stroke="#64748b" stroke-width="2"/><line x1="505" y1="64" x2="580" y2="190" stroke="#64748b" stroke-width="2"/>
<text x="480" y="245" text-anchor="middle" class="svg-accent" font-size="12">1 copy up, spine replicates</text>
</svg><p class="cap">With ingress replication the source leaf makes every copy; with multicast the network replicates.</p></div>

<h3>Building the multicast underlay: PIM sparse mode</h3>
<p><b>PIM</b> (Protocol Independent Multicast) builds multicast distribution trees using the unicast routing table you already have (that is the "protocol independent" part). In <b>sparse mode (PIM-SM)</b> nothing is sent anywhere unless a receiver explicitly joins:</p>
<ul>
<li>Each VTEP that hosts VNI 10010 joins the group mapped to that VNI, for example 239.1.1.10, by sending a PIM join toward the <b>rendezvous point (RP)</b>. This builds a <b>shared tree</b>, written (*,G).</li>
<li>When a VTEP sends BUM traffic to 239.1.1.10, its first-hop router registers the source with the RP; receivers can then join a <b>source tree</b>, written (S,G).</li>
<li>PIM uses <b>RPF</b> (reverse path forwarding): traffic is accepted only on the interface the unicast table uses to reach the source or RP. A healthy unicast underlay is therefore a prerequisite for multicast.</li>
</ul>

<h3>Where to put the RP: anycast RP on the spines</h3>
<p>Every leaf is one hop from every spine, so the spines are the natural RP location. To avoid a single point of failure, both spines use the <b>same RP address</b> (anycast): a loopback with 10.254.254.1/32 on each spine, advertised into OSPF. Each leaf sends joins to whichever spine its routing table prefers. The spines exchange information about active sources using <b>PIM anycast-RP</b> (RFC 4610), configured with each spine's unique loopback0. If one spine fails, its copy of 10.254.254.1 disappears from OSPF and leaves re-join toward the other.</p>

<pre class="code"><span class="c">! Both spines (SPINE2 identical except its own addresses)</span>
feature pim
interface loopback254
  description Anycast RP
  ip address 10.254.254.1/32
  ip router ospf UNDERLAY area 0.0.0.0
  ip pim sparse-mode
interface loopback0
  ip pim sparse-mode
interface Ethernet1/1-4
  ip pim sparse-mode
ip pim rp-address 10.254.254.1 group-list 239.1.1.0/24
ip pim anycast-rp 10.254.254.1 10.255.0.11
ip pim anycast-rp 10.254.254.1 10.255.0.12

<span class="c">! Every leaf</span>
feature pim
ip pim rp-address 10.254.254.1 group-list 239.1.1.0/24
interface loopback0
  ip pim sparse-mode
interface loopback1
  ip pim sparse-mode
interface Ethernet1/1-2
  ip pim sparse-mode</pre>
<p>The VTEP loopback1 must have PIM enabled because it is the source of the VXLAN multicast packets.</p>

<h3>PIM BiDir</h3>
<p>In a VXLAN fabric every VTEP is both a <b>source</b> and a <b>receiver</b> for its groups. With PIM-SM, 40 VTEPs in 100 groups can create up to 4,000 (S,G) entries. <b>Bidirectional PIM</b> uses only shared (*,G) trees rooted at the RP; traffic flows up and down the same tree, so state stays at one entry per group no matter how many sources exist. It is configured by marking the group range bidir:</p>
<pre class="code">ip pim rp-address 10.254.254.1 group-list 239.1.2.0/24 bidir</pre>
<p>Anycast RP does not apply to BiDir. Redundancy uses a <b>phantom RP</b>: the RP address is an unused address in a subnet advertised by both spines with different prefix lengths, so the longest match picks one spine and the other takes over if it fails.</p>

<h3>Group-to-VNI mapping (preview)</h3>
<p>On each leaf, <code>interface nve1</code> maps each VNI to a group. You will configure this fully in the VXLAN module:</p>
<pre class="code">interface nve1
  no shutdown
  source-interface loopback1
  member vni 10010
    mcast-group 239.1.1.10
  member vni 10020
    mcast-group 239.1.1.20</pre>
<p>One group per VNI gives precise flooding but more state. Sharing one group across several VNIs reduces state but sends some BUM traffic to leaves that do not need it. Many designs map groups of VNIs to a small pool of groups.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show ip pim neighbor
PIM Neighbor Status for VRF "default"
Neighbor        Interface            Uptime    Expires   DR       Bidir-  BFD
                                                         Priority Capable State
<span class="hl">10.1.1.0        Ethernet1/1          00:20:11  00:01:35  1        yes     n/a
10.1.2.0        Ethernet1/2          00:20:09  00:01:31  1        yes     n/a</span>

LEAF1# show ip pim rp
PIM RP Status Information for VRF "default"
<span class="hl">RP: 10.254.254.1, (0), uptime: 00:20:05, expires: never,
  priority: 0, RP-source: (local), group ranges:
      239.1.1.0/24</span>

LEAF1# show ip mroute 239.1.1.10
IP Multicast Routing Table for VRF "default"
<span class="hl">(*, 239.1.1.10/32), uptime: 00:12:41, nve ip pim
  Incoming interface: Ethernet1/1, RPF nbr: 10.1.1.0
  Outgoing interface list: (count: 1)
    nve1, uptime: 00:12:41, nve</span></pre>
<p>Read the (*,G) entry: the leaf joined 239.1.1.10 toward the RP via Ethernet1/1, and delivers received traffic to <code>nve1</code>, which decapsulates it for local servers.</p>

<h3>When to choose ingress replication instead</h3>
<table class="cmp"><tr><th></th><th>Multicast underlay</th><th>Ingress replication</th></tr>
<tr><td>Who copies</td><td>The network (spines)</td><td>The source leaf</td></tr>
<tr><td>Extra protocols</td><td>PIM, RP design</td><td>None; peer list static or from BGP EVPN route type 3</td></tr>
<tr><td>Best for</td><td>Many VTEPs per VNI, heavy BUM, flood-and-learn</td><td>EVPN fabrics with ARP suppression, small or medium VNI spans, teams without multicast skills</td></tr>
</table>
<div class="eg"><p><b>Worked example: uplink load.</b> A leaf sends 1,000 BUM packets per second of 200 bytes in a VNI present on 40 leaves. Ingress replication: 39 copies = 39,000 packets per second, about 62 Mbit/s leaving the source leaf. Multicast: 1,000 packets per second, about 1.6 Mbit/s up, and the spines replicate. With BGP EVPN and ARP suppression BUM volume drops sharply, which is why many modern EVPN fabrics simply use ingress replication.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>ip pim sparse-mode</code> on loopback1 or on one uplink (RPF fails through that spine). RP address not advertised in OSPF. Different <code>rp-address</code> group ranges on leaves and spines. Using anycast-RP entries with the anycast address itself instead of each spine's unique loopback.</p></div>
<div class="exam"><p><b>Exam tip.</b> BUM = broadcast, unknown unicast, multicast. Options: multicast underlay (PIM-SM with anycast RP, or PIM BiDir with phantom RP) or ingress replication (static or BGP EVPN route type 3). Map VNI to group with <code>mcast-group</code> under <code>member vni</code>.</p></div>

<div class="scn"><h4>ARP works to half the racks</h4><p>After a spine replacement, VMs in VNI 10010 could ARP for neighbours on some leaves but not others. <code>show ip mroute 239.1.1.10</code> on the failing leaves showed the (*,G) entry with RPF toward SPINE2, and <code>show ip pim neighbor</code> listed only SPINE1. The new SPINE2 had OSPF but no <code>ip pim sparse-mode</code> on its fabric interfaces, so joins sent toward it went nowhere. Enabling PIM on SPINE2's links (and checking its anycast-RP lines) restored flooding.</p><p><b>Lesson:</b> in a multicast underlay, every fabric link and every loopback involved needs PIM, and every spine must be a complete RP peer.</p></div>

<div class="iv"><p class="q">"How is BUM traffic handled in a VXLAN fabric, and how would you design the multicast underlay?"</p><p>Strong answer: BUM traffic for a VNI must reach every VTEP in that VNI, either by ingress replication (the source VTEP unicasts a copy to each peer, peers learned statically or via EVPN type-3 routes) or by mapping the VNI to a multicast group. For multicast: PIM sparse mode on all fabric links and loopbacks, RP on the spines using anycast RP with a shared loopback advertised in the IGP, PIM anycast-RP (or MSDP) between spines, and optionally PIM BiDir to limit (S,G) state. Mention the trade-off in state versus replication load.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BUM traffic must reach every VTEP in a VNI: via multicast groups or ingress replication.</li>
<li>PIM-SM with the RP on the spines; anycast RP shares one address across spines for redundancy.</li>
<li>PIM BiDir keeps only (*,G) state, ideal when every VTEP is both source and receiver.</li>
<li>Map VNIs to groups under interface nve1 with mcast-group.</li>
<li>With BGP EVPN and ARP suppression, ingress replication is often simpler and good enough.</li>
</ul></div>
`,hi:`
<p>Aap 40 dosto ko same announcement bhejna chahte ho. Aap khud 40 alag messages bhej sakte ho, ya ek group mein ek baar post karke app ko sabko copy deliver karne do. Pehla tareeka <b>ingress replication</b> hai; dusra <b>multicast</b> hai. VXLAN fabric har baar yahi choice face karta hai jab koi server broadcast bhejta hai, jaise ARP request, kyunki us frame ko har us leaf tak pahunchna hai jiske paas same segment hai.</p>

<h3>BUM traffic kya hai?</h3>
<p><b>BUM</b> ka matlab hai <b>B</b>roadcast (ARP requests, DHCP discovers), <b>U</b>nknown unicast (aise MAC address ka frame jo leaf ne abhi tak nahi seekha) aur <b>M</b>ulticast (tenant multicast traffic). Normal switch inhe VLAN ke har port se flood karta hai. VXLAN mein segment ke "ports" woh remote VTEPs hain jo same <b>VNI</b> host karte hain, isliye leaf ko har ek ko ek copy deliver karni padti hai. Underlay iske do tareeke deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Ingress replication versus multicast">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">Ingress replication</text>
<rect x="110" y="30" width="100" height="34" rx="6" fill="#ddd6fe"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="12">SPINE</text>
<rect x="20" y="190" width="80" height="34" rx="6" fill="#bae6fd"/><text x="60" y="212" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text>
<rect x="120" y="190" width="80" height="34" rx="6" fill="#bae6fd"/><text x="160" y="212" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text>
<rect x="220" y="190" width="80" height="34" rx="6" fill="#bae6fd"/><text x="260" y="212" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text>
<line x1="55" y1="190" x2="130" y2="64" stroke="#64748b" stroke-width="2"/><line x1="65" y1="190" x2="140" y2="64" stroke="#64748b" stroke-width="2"/>
<line x1="160" y1="64" x2="160" y2="190" stroke="#64748b" stroke-width="2"/><line x1="190" y1="64" x2="260" y2="190" stroke="#64748b" stroke-width="2"/>
<text x="160" y="245" text-anchor="middle" class="svg-accent" font-size="12">LEAF1 2 unicast copies bhejta hai</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">Multicast underlay</text>
<rect x="430" y="30" width="100" height="34" rx="6" fill="#ddd6fe"/><text x="480" y="52" text-anchor="middle" class="svg-ink" font-size="12">SPINE (RP)</text>
<rect x="340" y="190" width="80" height="34" rx="6" fill="#bae6fd"/><text x="380" y="212" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text>
<rect x="440" y="190" width="80" height="34" rx="6" fill="#bae6fd"/><text x="480" y="212" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text>
<rect x="540" y="190" width="80" height="34" rx="6" fill="#bae6fd"/><text x="580" y="212" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text>
<line x1="380" y1="190" x2="455" y2="64" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="64" x2="480" y2="190" stroke="#64748b" stroke-width="2"/><line x1="505" y1="64" x2="580" y2="190" stroke="#64748b" stroke-width="2"/>
<text x="480" y="245" text-anchor="middle" class="svg-accent" font-size="12">1 copy upar, spine replicate karta hai</text>
</svg><p class="cap">Ingress replication mein source leaf har copy banata hai; multicast mein network replicate karta hai.</p></div>

<h3>Multicast underlay banana: PIM sparse mode</h3>
<p><b>PIM</b> (Protocol Independent Multicast) aapke paas pehle se maujood unicast routing table use karke multicast distribution trees banata hai (yahi "protocol independent" wala hissa hai). <b>Sparse mode (PIM-SM)</b> mein kahin kuch nahi bheja jaata jab tak koi receiver explicitly join na kare:</p>
<ul>
<li>VNI 10010 host karne wala har VTEP us VNI se mapped group, jaise 239.1.1.10, ko <b>rendezvous point (RP)</b> ki taraf PIM join bhej kar join karta hai. Isse ek <b>shared tree</b> banta hai, jise (*,G) likhte hain.</li>
<li>Jab koi VTEP 239.1.1.10 par BUM traffic bhejta hai, uska first-hop router source ko RP ke saath register karta hai; phir receivers ek <b>source tree</b> join kar sakte hain, jise (S,G) likhte hain.</li>
<li>PIM <b>RPF</b> (reverse path forwarding) use karta hai: traffic sirf us interface par accept hota hai jise unicast table source ya RP tak pahunchne ke liye use karta hai. Isliye healthy unicast underlay multicast ki prerequisite hai.</li>
</ul>

<h3>RP kahan rakhein: spines par anycast RP</h3>
<p>Har leaf har spine se ek hop door hai, isliye spines RP ki natural location hain. Single point of failure se bachne ke liye dono spines <b>same RP address</b> (anycast) use karte hain: har spine par 10.254.254.1/32 wala loopback, jo OSPF mein advertise hota hai. Har leaf joins us spine ko bhejta hai jise uski routing table prefer karti hai. Spines active sources ki information <b>PIM anycast-RP</b> (RFC 4610) se exchange karte hain, jo har spine ke unique loopback0 ke saath configure hota hai. Agar ek spine fail ho, to uski 10.254.254.1 copy OSPF se gayab ho jaati hai aur leaves dusre ki taraf re-join karte hain.</p>

<pre class="code"><span class="c">! Dono spines (SPINE2 same, sirf apne addresses ke saath)</span>
feature pim
interface loopback254
  description Anycast RP
  ip address 10.254.254.1/32
  ip router ospf UNDERLAY area 0.0.0.0
  ip pim sparse-mode
interface loopback0
  ip pim sparse-mode
interface Ethernet1/1-4
  ip pim sparse-mode
ip pim rp-address 10.254.254.1 group-list 239.1.1.0/24
ip pim anycast-rp 10.254.254.1 10.255.0.11
ip pim anycast-rp 10.254.254.1 10.255.0.12

<span class="c">! Har leaf</span>
feature pim
ip pim rp-address 10.254.254.1 group-list 239.1.1.0/24
interface loopback0
  ip pim sparse-mode
interface loopback1
  ip pim sparse-mode
interface Ethernet1/1-2
  ip pim sparse-mode</pre>
<p>VTEP loopback1 par PIM enabled hona chahiye kyunki wahi VXLAN multicast packets ka source hai.</p>

<h3>PIM BiDir</h3>
<p>VXLAN fabric mein har VTEP apne groups ke liye <b>source</b> bhi hai aur <b>receiver</b> bhi. PIM-SM ke saath, 100 groups mein 40 VTEPs 4,000 tak (S,G) entries bana sakte hain. <b>Bidirectional PIM</b> sirf RP par rooted shared (*,G) trees use karta hai; traffic same tree par upar aur neeche flow karta hai, isliye kitne bhi sources hon, state har group ke liye ek entry par rehti hai. Ise group range ko bidir mark karke configure karte hain:</p>
<pre class="code">ip pim rp-address 10.254.254.1 group-list 239.1.2.0/24 bidir</pre>
<p>Anycast RP BiDir par apply nahi hota. Redundancy <b>phantom RP</b> use karti hai: RP address ek aise subnet ka unused address hai jise dono spines alag prefix lengths ke saath advertise karte hain, isliye longest match ek spine chunta hai aur agar woh fail ho to dusra le leta hai.</p>

<h3>Group-to-VNI mapping (preview)</h3>
<p>Har leaf par <code>interface nve1</code> har VNI ko ek group se map karta hai. Ise aap VXLAN module mein poori tarah configure karoge:</p>
<pre class="code">interface nve1
  no shutdown
  source-interface loopback1
  member vni 10010
    mcast-group 239.1.1.10
  member vni 10020
    mcast-group 239.1.1.20</pre>
<p>Har VNI ka ek group precise flooding deta hai lekin zyada state. Kai VNIs mein ek group share karna state kam karta hai lekin kuch BUM traffic un leaves ko bhejta hai jinhe iski zaroorat nahi. Kai designs VNIs ke groups ko groups ke ek chhote pool se map karte hain.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show ip pim neighbor
PIM Neighbor Status for VRF "default"
Neighbor        Interface            Uptime    Expires   DR       Bidir-  BFD
                                                         Priority Capable State
<span class="hl">10.1.1.0        Ethernet1/1          00:20:11  00:01:35  1        yes     n/a
10.1.2.0        Ethernet1/2          00:20:09  00:01:31  1        yes     n/a</span>

LEAF1# show ip pim rp
PIM RP Status Information for VRF "default"
<span class="hl">RP: 10.254.254.1, (0), uptime: 00:20:05, expires: never,
  priority: 0, RP-source: (local), group ranges:
      239.1.1.0/24</span>

LEAF1# show ip mroute 239.1.1.10
IP Multicast Routing Table for VRF "default"
<span class="hl">(*, 239.1.1.10/32), uptime: 00:12:41, nve ip pim
  Incoming interface: Ethernet1/1, RPF nbr: 10.1.1.0
  Outgoing interface list: (count: 1)
    nve1, uptime: 00:12:41, nve</span></pre>
<p>(*,G) entry padho: leaf ne Ethernet1/1 ke through RP ki taraf 239.1.1.10 join kiya, aur received traffic <code>nve1</code> ko deliver karta hai, jo local servers ke liye use decapsulate karta hai.</p>

<h3>Kab ingress replication choose karein</h3>
<table class="cmp"><tr><th></th><th>Multicast underlay</th><th>Ingress replication</th></tr>
<tr><td>Copy kaun banata hai</td><td>Network (spines)</td><td>Source leaf</td></tr>
<tr><td>Extra protocols</td><td>PIM, RP design</td><td>Koi nahi; peer list static ya BGP EVPN route type 3 se</td></tr>
<tr><td>Best for</td><td>Har VNI mein kai VTEPs, heavy BUM, flood-and-learn</td><td>ARP suppression wale EVPN fabrics, chhote ya medium VNI spans, multicast skills ke bina teams</td></tr>
</table>
<div class="eg"><p><b>Worked example: uplink load.</b> Ek leaf 40 leaves par maujood VNI mein 200 bytes ke 1,000 BUM packets per second bhejta hai. Ingress replication: 39 copies = 39,000 packets per second, lagbhag 62 Mbit/s source leaf se bahar. Multicast: 1,000 packets per second, lagbhag 1.6 Mbit/s upar, aur spines replicate karte hain. BGP EVPN aur ARP suppression ke saath BUM volume bahut gir jaata hai, isiliye kai modern EVPN fabrics seedha ingress replication use karte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> loopback1 ya ek uplink par <code>ip pim sparse-mode</code> bhool jaana (us spine ke through RPF fail hota hai). RP address OSPF mein advertise na hona. Leaves aur spines par alag <code>rp-address</code> group ranges. Anycast-RP entries mein har spine ke unique loopback ki jagah anycast address hi use karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> BUM = broadcast, unknown unicast, multicast. Options: multicast underlay (anycast RP ke saath PIM-SM, ya phantom RP ke saath PIM BiDir) ya ingress replication (static ya BGP EVPN route type 3). VNI ko group se <code>member vni</code> ke neeche <code>mcast-group</code> se map karo.</p></div>

<div class="scn"><h4>ARP aadhe racks tak kaam karta hai</h4><p>Spine replacement ke baad VNI 10010 ke VMs kuch leaves par neighbours ke liye ARP kar paate the lekin dusron par nahi. Failing leaves par <code>show ip mroute 239.1.1.10</code> ne (*,G) entry SPINE2 ki taraf RPF ke saath dikhayi, aur <code>show ip pim neighbor</code> mein sirf SPINE1 tha. Naye SPINE2 par OSPF tha lekin uske fabric interfaces par <code>ip pim sparse-mode</code> nahi tha, isliye uski taraf bheje gaye joins kahin nahi jaate the. SPINE2 ke links par PIM enable karne (aur uski anycast-RP lines check karne) se flooding wapas aa gayi.</p><p><b>Seekh:</b> multicast underlay mein har fabric link aur har involved loopback ko PIM chahiye, aur har spine ek complete RP peer hona chahiye.</p></div>

<div class="iv"><p class="q">"VXLAN fabric mein BUM traffic kaise handle hota hai, aur aap multicast underlay kaise design karoge?"</p><p>Strong answer: kisi VNI ka BUM traffic us VNI ke har VTEP tak pahunchna chahiye, ya to ingress replication se (source VTEP har peer ko unicast copy bhejta hai, peers static ya EVPN type-3 routes se seekhe jaate hain) ya VNI ko multicast group se map karke. Multicast ke liye: saare fabric links aur loopbacks par PIM sparse mode, spines par RP jo IGP mein advertised shared loopback ke saath anycast RP use kare, spines ke beech PIM anycast-RP (ya MSDP), aur (S,G) state limit karne ke liye optionally PIM BiDir. State versus replication load ka trade-off batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BUM traffic ko VNI ke har VTEP tak pahunchna hai: multicast groups ya ingress replication se.</li>
<li>Spines par RP ke saath PIM-SM; anycast RP redundancy ke liye spines mein ek address share karta hai.</li>
<li>PIM BiDir sirf (*,G) state rakhta hai, ideal jab har VTEP source aur receiver dono ho.</li>
<li>interface nve1 ke neeche mcast-group se VNIs ko groups se map karo.</li>
<li>BGP EVPN aur ARP suppression ke saath ingress replication aksar simple aur kaafi hota hai.</li>
</ul></div>
`}};export{e as default};