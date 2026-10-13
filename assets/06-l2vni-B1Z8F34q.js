var e={id:`l2vni`,h:{en:`L2VNI with BGP: ingress replication and ARP suppression`,hi:`BGP ke saath L2VNI: ingress replication aur ARP suppression`},body:{en:`
<p>Think of an office building where a receptionist used to shout every visitor's name down every corridor. Then the company gives the receptionist a live staff directory on a tablet and a list of which floors belong to which department. Visitors are now walked straight to the right desk, and the shouting stops, except for the rare announcement that really must reach everybody. Converting an L2VNI from flood-and-learn to BGP EVPN is exactly that upgrade, and on NX-OS it takes only a handful of lines. This chapter is lab 2 explained line by line.</p>

<h3>Starting point (lab 2)</h3>
<p>VLAN 10 is mapped to <b>VNI 10010</b> on LEAF1 and LEAF2. SRV1 (172.16.10.11) is on LEAF1 Ethernet1/5, SRV2 (172.16.10.12) on LEAF2 Ethernet1/5. The NVE interfaces use flood-and-learn with a static peer each: LEAF1 has <code>peer-ip 10.254.0.2</code>, LEAF2 has <code>peer-ip 10.254.0.1</code>. The EVPN sessions to both spines are already Established from lab 1. The goal: move VNI 10010 to the BGP control plane without changing VLANs, VNIs or loopbacks.</p>

<h3>Block 1: the EVPN instance (MAC-VRF)</h3>
<pre class="code">evpn
  vni 10010 l2
    rd auto
    route-target import auto
    route-target export auto</pre>
<p>This creates the <b>EVI</b> (EVPN instance) for VNI 10010: its RD (10.255.0.1:32777 on LEAF1) and its RT (65001:10010). Without this block BGP has no RD/RT for the VNI and will neither advertise nor import routes for it. The <code>evpn</code> section is available only after <code>nv overlay evpn</code>.</p>

<h3>Block 2: the NVE interface in control-plane mode</h3>
<pre class="code">interface nve1
  no shutdown
  host-reachability protocol bgp         <span class="c">! learn remote hosts from BGP, not from the wire</span>
  source-interface loopback1
  member vni 10010
    suppress-arp                         <span class="c">! answer ARP locally for known hosts</span>
    ingress-replication protocol bgp     <span class="c">! flood list = VTEPs that sent a type-3 route</span></pre>
<ul>
<li><b>host-reachability protocol bgp</b> switches the NVE to control-plane learning. Remote MACs now come from type-2 routes; the NVE stops learning MACs from arriving VXLAN packets. <code>show nve peers</code> changes LearnType from <b>DP</b> to <b>CP</b>. Configure it first: NX-OS rejects the BGP-based options under a member VNI until host-reachability is BGP.</li>
<li><b>ingress-replication protocol bgp</b> replaces the static <code>peer-ip</code> list. On real hardware you may need to remove the static method first (<code>no ingress-replication protocol static</code>) because a VNI uses one replication method at a time. The leaf now originates a type-3 route for VNI 10010 and builds its head-end replication list from the type-3 routes it imports.</li>
<li><b>suppress-arp</b> enables ARP suppression for this VNI (details below).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Ingress replication with BGP">
<rect x="250" y="10" width="140" height="36" rx="6" fill="#ddd6fe"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="12">Spine RR</text>
<rect x="30" y="120" width="140" height="44" rx="6" fill="#bae6fd"/><text x="100" y="140" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="100" y="156" text-anchor="middle" class="svg-muted" font-size="12">10.254.0.1</text>
<rect x="250" y="120" width="140" height="44" rx="6" fill="#bae6fd"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="320" y="156" text-anchor="middle" class="svg-muted" font-size="12">10.254.0.2</text>
<rect x="470" y="120" width="140" height="44" rx="6" fill="#bae6fd"/><text x="540" y="140" text-anchor="middle" class="svg-ink" font-size="12">LEAF3 (no VNI)</text><text x="540" y="156" text-anchor="middle" class="svg-muted" font-size="12">10.254.0.3</text>
<line x1="100" y1="120" x2="300" y2="46" stroke="#64748b" stroke-width="2"/><line x1="320" y1="120" x2="320" y2="46" stroke="#64748b" stroke-width="2"/><line x1="540" y1="120" x2="340" y2="46" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="185" y="75" class="svg-accent" font-size="12">type 3 VNI 10010</text><text x="330" y="95" class="svg-accent" font-size="12">type 3 VNI 10010</text>
<path d="M170 190 L250 190" stroke="#64748b" stroke-width="2" fill="none"/><text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">LEAF1 floods ARP for VNI 10010 only to 10.254.0.2</text>
</svg><p class="cap">Only leaves that originate a type-3 route for VNI 10010 enter each other's flood list. LEAF3, without the VNI, receives no BUM traffic for it.</p></div>

<h3>ARP suppression in detail</h3>
<p>Without suppression, SRV1's ARP request "who has 172.16.10.12?" is flooded to every VTEP in the VNI. With <code>suppress-arp</code> the leaf snoops ARP from local hosts, learns their MAC/IP pairs and advertises them as type-2 MAC+IP routes. Remote leaves store those pairs in an <b>ARP suppression cache</b>. When SRV1 asks for SRV2, LEAF1 already knows the answer from BGP and replies itself, as a proxy. If the entry is unknown, the ARP is still flooded normally, so nothing breaks. On some Nexus 9000 platforms ARP suppression needs a TCAM region (<code>hardware access-list tcam region arp-ether</code>) carved first, followed by a reload.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show nve vni
Codes: CP - Control Plane        DP - Data Plane
       UC - Unconfigured         SA - Suppress ARP
Interface VNI      Multicast-group   State Mode Type [BD/VRF]      Flags
--------- -------- ----------------- ----- ---- ------------------ -----
<span class="hl">nve1      10010    UnicastBGP        Up    CP   L2 [10]            SA</span></pre>
<pre class="out">LEAF1# show nve peers
Interface Peer-IP          State LearnType Uptime   Router-Mac
--------- ---------------  ----- --------- -------- -----------------
<span class="hl">nve1      10.254.0.2       Up    CP        00:03:12 n/a</span></pre>
<pre class="out">LEAF1# show l2route evpn mac all
Topology    Mac Address    Prod   Flags         Seq No     Next-Hops
----------- -------------- ------ ------------- ---------- ----------------
10          0050.7966.6801 Local  L,            0          Eth1/5
<span class="hl">10          0050.7966.6802 BGP    SplRcv        0          10.254.0.2</span></pre>
<pre class="out">LEAF1# show ip arp suppression-cache detail
Ip Address      Age      Mac Address    Vlan Physical-ifindex    Flags    Remote Vtep Addrs
172.16.10.11    00:02:11 0050.7966.6801   10 Ethernet1/5         L
<span class="hl">172.16.10.12    00:01:40 0050.7966.6802   10 (null)              R        10.254.0.2</span></pre>
<p>What to look for: Mode <b>CP</b>, replication <b>UnicastBGP</b>, flag <b>SA</b> on the VNI; the peer learned as <b>CP</b> (Router-Mac is n/a until an L3VNI exists); SRV2's MAC produced by <b>BGP</b> with next hop 10.254.0.2; and SRV2's ARP entry flagged <b>R</b> (remote) with the remote VTEP. Lab 2's last question asks for that LearnType value.</p>

<div class="eg"><p><b>Worked example.</b> A VNI spans 30 leaves. Without ARP suppression, each ARP request is replicated by the ingress leaf 29 times. A VM farm generating 2,000 ARP requests per minute creates 58,000 VXLAN copies per minute across the fabric. With suppression and hosts already known through type-2 routes, almost all of them are answered by the local leaf and never leave it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuring the EVPN instance but forgetting <code>host-reachability protocol bgp</code> (peers stay DP or never appear); leaving the static peer in place; forgetting the <code>evpn</code> / <code>vni 10010 l2</code> block (no type-3 route, so no peer); expecting an ARP entry for a host that has never sent ARP.</p></div>
<div class="exam"><p><b>Exam trap.</b> In <code>show nve vni</code>, "UnicastBGP" means ingress replication with BGP; a multicast group address there means the VNI uses underlay multicast for BUM. Flag SA means ARP suppression is on for that VNI.</p></div>

<div class="scn"><h4>The flood that would not stop</h4><p>A retail customer migrated to EVPN but still saw heavy BUM traffic on every uplink. <code>show nve vni</code> showed Mode CP and UnicastBGP, but the Flags column was empty for most VNIs. The template had put <code>suppress-arp</code> only under the first member VNI. Every ARP for the other 120 VNIs was still replicated to all leaves. After adding <code>suppress-arp</code> to every member VNI (and confirming the TCAM region was carved on the older leaves), uplink BUM traffic dropped by more than 80% during the next busy hour.</p><p><b>Lesson:</b> EVPN features are per VNI. Verify the flags of every VNI, not just the first one.</p></div>

<div class="iv"><p class="q">"How does ingress replication work with BGP EVPN, and what does ARP suppression do?"</p><p>Strong answer: each leaf originates a type-3 IMET route per VNI with a PMSI attribute saying ingress replication and its VTEP address. Leaves that import it add that VTEP to the VNI's head-end replication list, so BUM traffic is unicast-copied only to VTEPs that have the VNI; no static peers and no underlay multicast. ARP suppression: the leaf snoops local ARP, advertises MAC+IP in type-2 routes, caches remote MAC/IP pairs and answers ARP requests locally, flooding only when the entry is unknown. Mention show nve vni (UnicastBGP, SA) and show ip arp suppression-cache detail.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three pieces: evpn / vni x l2 with rd auto and RT auto, host-reachability protocol bgp, and member vni options.</li>
<li>ingress-replication protocol bgp builds the flood list from type-3 routes; no static peers.</li>
<li>suppress-arp lets the leaf answer ARP from type-2 MAC+IP information.</li>
<li>Healthy output: Mode CP, UnicastBGP, flag SA, peers LearnType CP, remote MACs produced by BGP.</li>
<li>Features are per VNI; check every VNI's flags.</li>
</ul></div>
`,hi:`
<p>Ek office building socho jahan receptionist har visitor ka naam har corridor mein chillata tha. Phir company receptionist ko tablet par live staff directory aur kaunsa floor kis department ka hai uski list deti hai. Ab visitors seedhe sahi desk tak le jaaye jaate hain, aur chillana band ho jaata hai, sivaye us kabhi-kabhaar ke announcement ke jo sach mein sab tak pahunchna chahiye. L2VNI ko flood-and-learn se BGP EVPN par convert karna bilkul yahi upgrade hai, aur NX-OS par isme sirf kuch lines lagti hain. Yeh chapter lab 2 ko line by line explain karta hai.</p>

<h3>Starting point (lab 2)</h3>
<p>LEAF1 aur LEAF2 par VLAN 10 <b>VNI 10010</b> se mapped hai. SRV1 (172.16.10.11) LEAF1 ke Ethernet1/5 par hai, SRV2 (172.16.10.12) LEAF2 ke Ethernet1/5 par. NVE interfaces flood-and-learn use karte hain, har ek par ek static peer: LEAF1 par <code>peer-ip 10.254.0.2</code>, LEAF2 par <code>peer-ip 10.254.0.1</code>. Dono spines ke saath EVPN sessions lab 1 se pehle hi Established hain. Goal: VLANs, VNIs ya loopbacks badle bina VNI 10010 ko BGP control plane par le jaana.</p>

<h3>Block 1: EVPN instance (MAC-VRF)</h3>
<pre class="code">evpn
  vni 10010 l2
    rd auto
    route-target import auto
    route-target export auto</pre>
<p>Yeh VNI 10010 ka <b>EVI</b> (EVPN instance) banata hai: uska RD (LEAF1 par 10.255.0.1:32777) aur uska RT (65001:10010). Is block ke bina BGP ke paas VNI ka RD/RT nahi hota aur woh uske routes na advertise karega na import. <code>evpn</code> section sirf <code>nv overlay evpn</code> ke baad available hota hai.</p>

<h3>Block 2: NVE interface control-plane mode mein</h3>
<pre class="code">interface nve1
  no shutdown
  host-reachability protocol bgp         <span class="c">! remote hosts BGP se seekho, wire se nahi</span>
  source-interface loopback1
  member vni 10010
    suppress-arp                         <span class="c">! known hosts ka ARP locally answer karo</span>
    ingress-replication protocol bgp     <span class="c">! flood list = jin VTEPs ne type-3 route bheja</span></pre>
<ul>
<li><b>host-reachability protocol bgp</b> NVE ko control-plane learning par le aata hai. Remote MACs ab type-2 routes se aate hain; NVE aane wale VXLAN packets se MACs seekhna band kar deta hai. <code>show nve peers</code> LearnType ko <b>DP</b> se <b>CP</b> kar deta hai. Ise pehle configure karo: jab tak host-reachability BGP nahi hota, NX-OS member VNI ke neeche BGP-based options reject karta hai.</li>
<li><b>ingress-replication protocol bgp</b> static <code>peer-ip</code> list ki jagah leta hai. Real hardware par aapko pehle static method hatana pad sakta hai (<code>no ingress-replication protocol static</code>) kyunki ek VNI ek time par ek hi replication method use karta hai. Leaf ab VNI 10010 ke liye type-3 route originate karta hai aur jo type-3 routes import karta hai unse apni head-end replication list banata hai.</li>
<li><b>suppress-arp</b> is VNI ke liye ARP suppression enable karta hai (details neeche).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="BGP ke saath ingress replication">
<rect x="250" y="10" width="140" height="36" rx="6" fill="#ddd6fe"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="12">Spine RR</text>
<rect x="30" y="120" width="140" height="44" rx="6" fill="#bae6fd"/><text x="100" y="140" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="100" y="156" text-anchor="middle" class="svg-muted" font-size="12">10.254.0.1</text>
<rect x="250" y="120" width="140" height="44" rx="6" fill="#bae6fd"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="320" y="156" text-anchor="middle" class="svg-muted" font-size="12">10.254.0.2</text>
<rect x="470" y="120" width="140" height="44" rx="6" fill="#bae6fd"/><text x="540" y="140" text-anchor="middle" class="svg-ink" font-size="12">LEAF3 (VNI nahi)</text><text x="540" y="156" text-anchor="middle" class="svg-muted" font-size="12">10.254.0.3</text>
<line x1="100" y1="120" x2="300" y2="46" stroke="#64748b" stroke-width="2"/><line x1="320" y1="120" x2="320" y2="46" stroke="#64748b" stroke-width="2"/><line x1="540" y1="120" x2="340" y2="46" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="185" y="75" class="svg-accent" font-size="12">type 3 VNI 10010</text><text x="330" y="95" class="svg-accent" font-size="12">type 3 VNI 10010</text>
<path d="M170 190 L250 190" stroke="#64748b" stroke-width="2" fill="none"/><text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">LEAF1 VNI 10010 ka ARP sirf 10.254.0.2 ko flood karta hai</text>
</svg><p class="cap">Sirf woh leaves ek doosre ki flood list mein aate hain jo VNI 10010 ka type-3 route originate karte hain. LEAF3, jiske paas VNI nahi, ko uska BUM traffic nahi milta.</p></div>

<h3>ARP suppression detail mein</h3>
<p>Suppression ke bina SRV1 ki ARP request "172.16.10.12 kiske paas hai?" VNI ke har VTEP ko flood hoti hai. <code>suppress-arp</code> ke saath leaf local hosts ka ARP snoop karta hai, unke MAC/IP pairs seekhta hai aur unhe type-2 MAC+IP routes ki tarah advertise karta hai. Remote leaves un pairs ko ek <b>ARP suppression cache</b> mein rakhte hain. Jab SRV1, SRV2 ke baare mein poochta hai, to LEAF1 ko BGP se jawab pehle se pata hai aur woh proxy ki tarah khud reply karta hai. Agar entry unknown hai, to ARP normal tarah flood hota hai, isliye kuch nahi tootta. Kuch Nexus 9000 platforms par ARP suppression ke liye pehle ek TCAM region (<code>hardware access-list tcam region arp-ether</code>) carve karna padta hai, aur phir reload.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show nve vni
Codes: CP - Control Plane        DP - Data Plane
       UC - Unconfigured         SA - Suppress ARP
Interface VNI      Multicast-group   State Mode Type [BD/VRF]      Flags
--------- -------- ----------------- ----- ---- ------------------ -----
<span class="hl">nve1      10010    UnicastBGP        Up    CP   L2 [10]            SA</span></pre>
<pre class="out">LEAF1# show nve peers
Interface Peer-IP          State LearnType Uptime   Router-Mac
--------- ---------------  ----- --------- -------- -----------------
<span class="hl">nve1      10.254.0.2       Up    CP        00:03:12 n/a</span></pre>
<pre class="out">LEAF1# show l2route evpn mac all
Topology    Mac Address    Prod   Flags         Seq No     Next-Hops
----------- -------------- ------ ------------- ---------- ----------------
10          0050.7966.6801 Local  L,            0          Eth1/5
<span class="hl">10          0050.7966.6802 BGP    SplRcv        0          10.254.0.2</span></pre>
<pre class="out">LEAF1# show ip arp suppression-cache detail
Ip Address      Age      Mac Address    Vlan Physical-ifindex    Flags    Remote Vtep Addrs
172.16.10.11    00:02:11 0050.7966.6801   10 Ethernet1/5         L
<span class="hl">172.16.10.12    00:01:40 0050.7966.6802   10 (null)              R        10.254.0.2</span></pre>
<p>Kya dekhna hai: VNI par Mode <b>CP</b>, replication <b>UnicastBGP</b>, flag <b>SA</b>; peer <b>CP</b> ki tarah seekha gaya (L3VNI hone tak Router-Mac n/a rehta hai); SRV2 ka MAC <b>BGP</b> ne produce kiya, next hop 10.254.0.2; aur SRV2 ki ARP entry <b>R</b> (remote) flag aur remote VTEP ke saath. Lab 2 ka aakhri sawaal yahi LearnType value poochta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek VNI 30 leaves par faila hai. ARP suppression ke bina har ARP request ingress leaf 29 baar replicate karta hai. Ek VM farm jo har minute 2,000 ARP requests banata hai, poore fabric mein har minute 58,000 VXLAN copies banata hai. Suppression ke saath, aur hosts type-2 routes se pehle se known hon, to lagbhag sab local leaf hi answer kar deta hai aur woh kabhi bahar nahi jaate.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> EVPN instance configure karna par <code>host-reachability protocol bgp</code> bhoolna (peers DP rehte hain ya aate hi nahi); static peer wahin chhod dena; <code>evpn</code> / <code>vni 10010 l2</code> block bhoolna (type-3 route nahi, to peer nahi); us host ki ARP entry expect karna jisne kabhi ARP nahi bheja.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show nve vni</code> mein "UnicastBGP" matlab BGP ke saath ingress replication; wahan multicast group address matlab VNI BUM ke liye underlay multicast use karta hai. Flag SA matlab us VNI par ARP suppression on hai.</p></div>

<div class="scn"><h4>Woh flood jo ruk hi nahi raha tha</h4><p>Ek retail customer EVPN par migrate hua par phir bhi har uplink par bhaari BUM traffic dikh raha tha. <code>show nve vni</code> Mode CP aur UnicastBGP dikha raha tha, lekin zyada tar VNIs ka Flags column khaali tha. Template ne <code>suppress-arp</code> sirf pehle member VNI ke neeche daala tha. Baaki 120 VNIs ka har ARP abhi bhi saare leaves ko replicate ho raha tha. Har member VNI mein <code>suppress-arp</code> jodne ke baad (aur purane leaves par TCAM region carve hai yeh confirm karke), agle busy hour mein uplink BUM traffic 80% se zyada gir gaya.</p><p><b>Seekh:</b> EVPN features har VNI ke hote hain. Har VNI ke flags verify karo, sirf pehle ke nahi.</p></div>

<div class="iv"><p class="q">"BGP EVPN ke saath ingress replication kaise kaam karta hai, aur ARP suppression kya karta hai?"</p><p>Strong answer: har leaf har VNI ke liye ek type-3 IMET route originate karta hai jismein PMSI attribute ingress replication aur uska VTEP address batata hai. Jo leaves use import karte hain woh us VTEP ko VNI ki head-end replication list mein jodte hain, isliye BUM traffic sirf un VTEPs ko unicast-copy hota hai jinke paas VNI hai; na static peers, na underlay multicast. ARP suppression: leaf local ARP snoop karta hai, MAC+IP type-2 routes mein advertise karta hai, remote MAC/IP pairs cache karta hai aur ARP requests locally answer karta hai, sirf entry unknown hone par flood karta hai. show nve vni (UnicastBGP, SA) aur show ip arp suppression-cache detail ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen hisse: rd auto aur RT auto ke saath evpn / vni x l2, host-reachability protocol bgp, aur member vni options.</li>
<li>ingress-replication protocol bgp flood list type-3 routes se banata hai; static peers nahi.</li>
<li>suppress-arp leaf ko type-2 MAC+IP information se ARP answer karne deta hai.</li>
<li>Healthy output: Mode CP, UnicastBGP, flag SA, peers LearnType CP, remote MACs BGP ne produce kiye.</li>
<li>Features har VNI ke hain; har VNI ke flags check karo.</li>
</ul></div>
`}};export{e as default};