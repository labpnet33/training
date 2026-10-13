var e={id:`type2-type3`,h:{en:`L2VNI with route types 3 and 2: who is here, who lives where`,hi:`Route types 3 aur 2 ke saath L2VNI: kaun yahan hai, kaun kahan rehta hai`},body:{en:`
<p>Think of a conference. First, each delegate pins a badge on a board saying "I am attending session 10010, find me at hotel 10.255.1.11". That board is the guest list. Later, when someone orders a coffee, the waiter writes "Rahul, table 7" on a second board. Type 3 is the guest list of VTEPs per VNI. Type 2 is the "who sits where" board for individual hosts.</p>

<h3>Route type 3: Inclusive Multicast Ethernet Tag (IMET)</h3>
<p>For every VNI a leaf announces a type-3 route that means "I take part in this VNI; send me your BUM traffic at this address". Receiving leaves use it to <b>build the ingress-replication list automatically</b>. The typed peer list from the previous module disappears.</p>

<h3>Route type 2: MAC/IP advertisement</h3>
<p>When a leaf learns a local host MAC (and, from ARP or DHCP snooping, its IP), it announces a type-2 route: MAC, optional IP, the L2VNI, and the next hop (the leaf's VTEP). Remote leaves install the MAC as "reachable via that VTEP". With the IP included, the leaf can also answer the host's ARP locally (ARP suppression).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Type 3 and type 2 flow">
<rect x="20" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="90" y="40" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="90" y="56" text-anchor="middle" class="svg-muted" font-size="12">VNI 10010 up</text>
<rect x="250" y="20" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="12">SPINE RRs</text>
<rect x="480" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="550" y="46" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text>
<line x1="160" y1="42" x2="250" y2="42" stroke="#64748b" stroke-width="2"/><line x1="390" y1="42" x2="480" y2="42" stroke="#64748b" stroke-width="2"/>
<text x="205" y="36" text-anchor="middle" class="svg-accent" font-size="12">[3]</text><text x="435" y="36" text-anchor="middle" class="svg-accent" font-size="12">[3]</text>
<text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="12">[3] says: add 10.255.1.11 to the VNI 10010 flood list</text>
<rect x="20" y="120" width="140" height="44" rx="8" fill="#fed7aa"/><text x="90" y="140" text-anchor="middle" class="svg-ink" font-size="12">H1 appears</text><text x="90" y="156" text-anchor="middle" class="svg-muted" font-size="12">MAC + IP</text>
<line x1="160" y1="142" x2="480" y2="142" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="136" text-anchor="middle" class="svg-accent" font-size="12">[2] MAC 0050.56aa.0001 / IP .11 via 10.255.1.11</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">[2] installs the MAC on LEAF2 pointing at VTEP .11</text>
</svg><p class="cap">Type 3 first (membership), type 2 afterwards (hosts).</p></div>

<h3>Configuration of one L2VNI (EVI 10 for VLAN 10)</h3>
<pre class="code">l2vpn evpn instance 10 vlan-based
 encapsulation vxlan
 rd 65001:10
 route-target export 65001:10
 route-target import 65001:10
vlan configuration 10
 member evpn-instance 10 vni 10010
interface nve1
 no ip address
 source-interface Loopback1
 host-reachability protocol bgp
 member vni 10010 ingress-replication</pre>
<p><code>host-reachability protocol bgp</code> is the switch from flood-and-learn to EVPN: remote hosts come from BGP. If you leave it out, nve1 stays in data-plane mode and BGP routes have no effect on forwarding.</p>

<h3>What the control plane shows</h3>
<pre class="out">LEAF2# show bgp l2vpn evpn route-type 3
 Network          Next Hop            Metric LocPrf Weight Path
Route Distinguisher: 65001:10
 *>i [3][65001:10][0][32][10.255.1.11]/17
                    10.255.1.11              0    100      0 i
 *>  [3][65001:10][0][32][10.255.1.12]/17
                    10.255.1.12              0    100  32768 i

LEAF2# show bgp l2vpn evpn route-type 2
Route Distinguisher: 65001:10
 *>i [2][65001:10][0][48][0050.56aa.0001][32][10.10.10.11]/24
                    10.255.1.11              0    100      0 i

LEAF2# show l2vpn evpn mac evi 10
MAC Address    EVI   VLAN  ESI                      Ether Tag  Next Hop(s)
0050.56aa.0001 10    10    0000.0000.0000.0000.0000 0          <span class="hl">10.255.1.11</span>
0050.56aa.0002 10    10    0000.0000.0000.0000.0000 0          Gi1/0/5

LEAF2# show nve peers
Interface  VNI      Type Peer-IP          RMAC/Num_RTs   eVNI     state flags UP time
nve1       10010    L2CP 10.255.1.11      1              10010    UP    N/A   00:09:12</pre>
<p>Notice the peer type <b>L2CP</b>: Layer 2, learned from the control plane. The ESI field of all zeros means a single-homed host; the next module changes that.</p>

<div class="eg"><p><b>Worked example: reading a type-2 key.</b> <code>[2][65001:10][0][48][0050.56aa.0001][32][10.10.10.11]</code> reads: type 2, route distinguisher 65001:10, Ethernet tag 0, MAC length 48 and the MAC, IP length 32 and the IP. The next hop 10.255.1.11 is the VTEP to which LEAF2 will tunnel traffic for that MAC.</p></div>

<div class="warn"><p><b>Common mistake.</b> Expecting a type-2 route for a silent host. A leaf creates type 2 only after it learns the MAC (any frame, ARP or GARP). A host that never transmits is invisible to the control plane until it does.</p></div>

<div class="exam"><p><b>Exam trap.</b> The type-2 route contains the L2VNI in its label field, and the route target is attached as an extended community. The RD is part of the key but does not control import. Import is decided by RT.</p></div>

<div class="scn"><h4>The leaf that did not know its neighbours</h4><p>After upgrading LEAF3, VNI 10020 showed no peers although BGP was up. The configuration restore had dropped <code>host-reachability protocol bgp</code> from nve1, so the leaf ignored type-3 routes and still used an empty static list. Adding the line brought up the peers and MACs in seconds.</p><p><b>Lesson:</b> if BGP has the routes but the nve peer list is empty, look at nve1 before blaming BGP.</p></div>

<div class="iv"><p class="q">"What do route types 2 and 3 do in EVPN VXLAN?"</p><p>Strong answer: type 3 (IMET) advertises VTEP membership per VNI and builds the BUM replication list. Type 2 advertises a host MAC, optionally with its IP, bound to the L2VNI and the VTEP next hop. Together they replace static peer lists and flooding-based learning, and the MAC/IP binding enables ARP suppression.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 3 = "I am in this VNI" and builds the flood list; type 2 = host MAC (and IP).</li>
<li>host-reachability protocol bgp switches nve1 to the EVPN control plane.</li>
<li>L2CP peers and next hops in the MAC table prove EVPN learning.</li>
<li>No MAC route until the host sends a frame.</li>
</ul></div>
`,hi:`
<p>Ek conference socho. Pehle har delegate board par badge lagata hai "Main session 10010 mein hoon, mujhe hotel 10.255.1.11 mein dhoondho". Yeh board guest list hai. Baad mein jab koi coffee order karta hai, waiter doosre board par likhta hai "Rahul, table 7". Type 3 har VNI ke VTEPs ki guest list hai. Type 2 individual hosts ka "kaun kahan baitha hai" board hai.</p>

<h3>Route type 3: Inclusive Multicast Ethernet Tag (IMET)</h3>
<p>Har VNI ke liye leaf ek type-3 route announce karta hai jiska matlab: "Main is VNI mein hoon; apna BUM traffic mujhe is address par bhejo". Receiving leaves isse <b>ingress-replication list automatically banate hain</b>. Pichhle module ki typed peer list gayab ho jaati hai.</p>

<h3>Route type 2: MAC/IP advertisement</h3>
<p>Jab leaf local host MAC (aur ARP ya DHCP snooping se uska IP) seekhta hai, woh type-2 route announce karta hai: MAC, optional IP, L2VNI aur next hop (leaf ka VTEP). Remote leaves MAC ko "us VTEP se reachable" install karte hain. IP ke saath leaf host ke ARP ka jawab locally bhi de sakta hai (ARP suppression).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Type 3 and type 2 flow">
<rect x="20" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="90" y="40" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="90" y="56" text-anchor="middle" class="svg-muted" font-size="12">VNI 10010 up</text>
<rect x="250" y="20" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="12">SPINE RRs</text>
<rect x="480" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="550" y="46" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text>
<line x1="160" y1="42" x2="250" y2="42" stroke="#64748b" stroke-width="2"/><line x1="390" y1="42" x2="480" y2="42" stroke="#64748b" stroke-width="2"/>
<text x="205" y="36" text-anchor="middle" class="svg-accent" font-size="12">[3]</text><text x="435" y="36" text-anchor="middle" class="svg-accent" font-size="12">[3]</text>
<text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="12">[3] kehta hai: 10.255.1.11 ko VNI 10010 flood list mein jodo</text>
<rect x="20" y="120" width="140" height="44" rx="8" fill="#fed7aa"/><text x="90" y="140" text-anchor="middle" class="svg-ink" font-size="12">H1 aata hai</text><text x="90" y="156" text-anchor="middle" class="svg-muted" font-size="12">MAC + IP</text>
<line x1="160" y1="142" x2="480" y2="142" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="136" text-anchor="middle" class="svg-accent" font-size="12">[2] MAC 0050.56aa.0001 / IP .11 via 10.255.1.11</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">[2] LEAF2 par MAC install, VTEP .11 ko point</text>
</svg><p class="cap">Pehle type 3 (membership), phir type 2 (hosts).</p></div>

<h3>Ek L2VNI ka configuration (VLAN 10 ke liye EVI 10)</h3>
<pre class="code">l2vpn evpn instance 10 vlan-based
 encapsulation vxlan
 rd 65001:10
 route-target export 65001:10
 route-target import 65001:10
vlan configuration 10
 member evpn-instance 10 vni 10010
interface nve1
 no ip address
 source-interface Loopback1
 host-reachability protocol bgp
 member vni 10010 ingress-replication</pre>
<p><code>host-reachability protocol bgp</code> flood-and-learn se EVPN ka switch hai: remote hosts BGP se aate hain. Ise chhodo to nve1 data-plane mode mein rehta hai aur BGP routes ka forwarding par koi asar nahi hota.</p>

<h3>Control plane kya dikhata hai</h3>
<pre class="out">LEAF2# show bgp l2vpn evpn route-type 3
 Network          Next Hop            Metric LocPrf Weight Path
Route Distinguisher: 65001:10
 *>i [3][65001:10][0][32][10.255.1.11]/17
                    10.255.1.11              0    100      0 i
 *>  [3][65001:10][0][32][10.255.1.12]/17
                    10.255.1.12              0    100  32768 i

LEAF2# show bgp l2vpn evpn route-type 2
Route Distinguisher: 65001:10
 *>i [2][65001:10][0][48][0050.56aa.0001][32][10.10.10.11]/24
                    10.255.1.11              0    100      0 i

LEAF2# show l2vpn evpn mac evi 10
MAC Address    EVI   VLAN  ESI                      Ether Tag  Next Hop(s)
0050.56aa.0001 10    10    0000.0000.0000.0000.0000 0          <span class="hl">10.255.1.11</span>
0050.56aa.0002 10    10    0000.0000.0000.0000.0000 0          Gi1/0/5

LEAF2# show nve peers
Interface  VNI      Type Peer-IP          RMAC/Num_RTs   eVNI     state flags UP time
nve1       10010    L2CP 10.255.1.11      1              10010    UP    N/A   00:09:12</pre>
<p>Peer type <b>L2CP</b> dekho: Layer 2, control plane se learned. ESI field ke sab zeros ka matlab single-homed host; agla module ise badalta hai.</p>

<div class="eg"><p><b>Worked example: type-2 key padhna.</b> <code>[2][65001:10][0][48][0050.56aa.0001][32][10.10.10.11]</code> ka matlab: type 2, route distinguisher 65001:10, Ethernet tag 0, MAC length 48 aur MAC, IP length 32 aur IP. Next hop 10.255.1.11 woh VTEP hai jahan LEAF2 us MAC ke liye tunnel karega.</p></div>

<div class="warn"><p><b>Common galti.</b> Silent host ke liye type-2 route ki umeed karna. Leaf type 2 tabhi banata hai jab MAC learn kare (koi bhi frame, ARP ya GARP). Jo host kabhi transmit nahi karta woh control plane ke liye invisible hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Type-2 route ke label field mein L2VNI hota hai, aur route target extended community ke roop mein lagta hai. RD key ka hissa hai lekin import control nahi karta. Import RT decide karta hai.</p></div>

<div class="scn"><h4>Woh leaf jo apne padosiyon ko nahi jaanta tha</h4><p>LEAF3 upgrade ke baad VNI 10020 par koi peer nahi dikha jabki BGP up tha. Configuration restore ne nve1 se <code>host-reachability protocol bgp</code> hata diya tha, isliye leaf type-3 routes ignore karta tha aur khaali static list use karta tha. Line jodte hi seconds mein peers aur MACs aa gaye.</p><p><b>Seekh:</b> agar BGP ke paas routes hain lekin nve peer list khaali hai, to BGP ko dosh dene se pehle nve1 dekho.</p></div>

<div class="iv"><p class="q">"EVPN VXLAN mein route types 2 aur 3 kya karte hain?"</p><p>Strong answer: type 3 (IMET) har VNI ke liye VTEP membership advertise karta hai aur BUM replication list banata hai. Type 2 host MAC advertise karta hai, optional IP ke saath, L2VNI aur VTEP next hop se bound. Dono milkar static peer lists aur flooding-based learning ko replace karte hain, aur MAC/IP binding ARP suppression enable karti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 3 = "main is VNI mein hoon" aur flood list banata hai; type 2 = host MAC (aur IP).</li>
<li>host-reachability protocol bgp nve1 ko EVPN control plane par switch karta hai.</li>
<li>MAC table mein L2CP peers aur next hops EVPN learning prove karte hain.</li>
<li>Host frame bheje tab tak MAC route nahi.</li>
</ul></div>
`}};export{e as default};