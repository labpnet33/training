var e={id:`vrf-routing`,h:{en:`Routing inside a VRF: static, OSPF, EIGRP, BGP and VRF-aware tools`,hi:`VRF ke andar routing: static, OSPF, EIGRP, BGP aur VRF-aware tools`},body:{en:`
<p>Back to the apartment building. Each flat needs its own newspaper delivery: the newspaper boy for Flat 101 must not throw the paper into Flat 102. In a router, every routing protocol that serves a VRF must be told which flat it works for, otherwise it delivers routes to the global table. This chapter shows how each protocol is bound to a VRF and how to look inside a VRF with the right commands.</p>

<h3>The extended topology</h3>
<p>For this chapter, guests reach EDGE through a distribution router, DIST. The two routers share one physical link, Gi0/4, with subinterface .10 (global, 10.10.0.0/30) and .20 (VRF GUEST, 10.20.0.0/30). EDGE is 10.20.0.1 and DIST is 10.20.0.2 on the guest subinterface.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="VRF-lite between DIST and EDGE">
<rect x="30" y="60" width="150" height="100" rx="10" fill="#e2e8f0"/><text x="105" y="84" text-anchor="middle" class="svg-ink" font-size="14">DIST</text><text x="105" y="108" text-anchor="middle" class="svg-muted" font-size="12">global + GUEST</text><text x="105" y="128" text-anchor="middle" class="svg-muted" font-size="12">guest APs behind</text>
<rect x="460" y="60" width="150" height="100" rx="10" fill="#e2e8f0"/><text x="535" y="84" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text><text x="535" y="108" text-anchor="middle" class="svg-muted" font-size="12">global + GUEST</text><text x="535" y="128" text-anchor="middle" class="svg-muted" font-size="12">ISP1 / ISP2</text>
<line x1="180" y1="90" x2="460" y2="90" stroke="#64748b" stroke-width="3"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="12">Gi0/4.10 global 10.10.0.0/30</text>
<line x1="180" y1="130" x2="460" y2="130" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">Gi0/4.20 VRF GUEST 10.20.0.0/30</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">One physical link, two 802.1Q subinterfaces, two separate routing domains</text>
</svg><p class="cap">Hop-by-hop VRF-lite: each VRF has its own subinterface and its own routing process or address family.</p></div>

<h3>Static routes</h3>
<pre class="code">ip route vrf GUEST 0.0.0.0 0.0.0.0 10.0.2.1
ip route vrf GUEST 192.168.24.0 255.255.248.0 10.20.0.2</pre>
<p>The next hop is resolved inside the VRF. Without the <code>vrf GUEST</code> keyword the route lands in the global table, where 10.20.0.2 is unknown, and it never installs.</p>

<h3>OSPF: one process per VRF</h3>
<pre class="code">router ospf 20 vrf GUEST
 router-id 10.20.0.1
 network 10.20.0.0 0.0.0.3 area 0
 network 192.168.20.0 0.0.0.255 area 0
 <span class="c">! Needed when this multi-VRF router peers with an MPLS PE</span>
 capability vrf-lite</pre>
<p>An OSPF process belongs to exactly one VRF, so the global OSPF process (for example <code>router ospf 1</code>) and process 20 are completely separate: separate LSDBs, separate SPF runs. Set the router ID explicitly; it is chosen from interfaces in that VRF only. <code>capability vrf-lite</code> disables the down-bit and domain-tag checks that a VRF OSPF process normally performs as if it were a PE. Without it, a multi-VRF CE connected to an MPLS provider silently ignores the provider's type 3, 5 and 7 LSAs.</p>
<pre class="out">EDGE# show ip ospf 20 neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">10.20.0.2         1   FULL/BDR        00:00:35    10.20.0.2       GigabitEthernet0/4.20</span></pre>

<h3>EIGRP: an address family per VRF</h3>
<pre class="code"><span class="c">! Named mode (preferred)</span>
router eigrp NK
 address-family ipv4 unicast vrf GUEST autonomous-system 20
  network 10.20.0.0 0.0.0.3
  network 192.168.20.0
  af-interface GigabitEthernet0/4.20
   summary-address 192.168.16.0 255.255.248.0
  exit-af-interface
 exit-address-family
<span class="c">! Classic mode equivalent</span>
router eigrp 100
 address-family ipv4 vrf GUEST autonomous-system 20
  network 10.20.0.0 0.0.0.3
 exit-address-family</pre>
<p>A common fault in classic mode is forgetting the <code>autonomous-system</code> number for the VRF address family: the address family exists but never forms neighbours. Both ends must use the same AS number in that VRF.</p>
<pre class="out">EDGE# show ip eigrp vrf GUEST neighbors
EIGRP-IPv4 VR(NK) Address-Family Neighbors for AS(20)
           VRF(GUEST)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
<span class="hl">0   10.20.0.2               Gi0/4.20                 13 00:05:12    4   100  0  17</span></pre>

<h3>BGP: address-family ipv4 vrf</h3>
<pre class="code">vrf definition GUEST
 rd 65010:20
 address-family ipv4
 exit-address-family
router bgp 65010
 address-family ipv4 vrf GUEST
  neighbor 10.0.2.1 remote-as 64520
  neighbor 10.0.2.1 activate
  network 192.168.20.0 mask 255.255.255.0
 exit-address-family</pre>
<p>BGP needs the RD because it keeps all VRF prefixes in one BGP table and must tell them apart. Without the RD, IOS refuses the VRF address family.</p>
<pre class="out">EDGE# show ip bgp vpnv4 vrf GUEST summary
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">10.0.2.1        4        64520      27      25        4    0    0 00:18:44        1</span></pre>

<h3>Summarisation inside a VRF (blueprint 1.5)</h3>
<p>Summarisation works exactly as in the global table, but inside the VRF process: <code>area 1 range</code> under <code>router ospf 20 vrf GUEST</code>, or <code>summary-address</code> under the EIGRP VRF af-interface as above. The Null0 discard route appears in <code>show ip route vrf GUEST</code>, not in the global table, so look in the right table when a summary "black-holes" traffic.</p>

<div class="eg"><p><b>Worked example.</b> DIST has guest subnets 192.168.16.0/24 to 192.168.23.0/24 (eight /24s). The smallest covering summary is 192.168.16.0/21 (mask 255.255.248.0), because 16 is a multiple of 8 and eight /24s fit in a /21. EDGE then learns one route in VRF GUEST instead of eight.</p></div>

<h3>VRF-aware tools</h3>
<table class="cmp"><tr><th>Task</th><th>Command</th></tr>
<tr><td>Ping or trace inside a VRF</td><td><code>ping vrf GUEST 198.51.100.10</code>, <code>traceroute vrf GUEST 198.51.100.10</code></td></tr>
<tr><td>Routing, ARP, CEF</td><td><code>show ip route vrf GUEST</code>, <code>show ip arp vrf GUEST</code>, <code>show ip cef vrf GUEST</code></td></tr>
<tr><td>Protocols in the VRF</td><td><code>show ip protocols vrf GUEST</code></td></tr>
<tr><td>Config of one VRF</td><td><code>show running-config vrf GUEST</code></td></tr>
<tr><td>Remote access from a VRF</td><td><code>telnet 10.0.2.1 /vrf GUEST</code>, <code>ssh -vrf GUEST -l admin 10.0.2.1</code></td></tr>
</table>

<div class="warn"><p><b>Common mistake.</b> Running <code>show ip route</code> or a plain ping and concluding "the route is missing". Every show and test command defaults to the global table. Add the <code>vrf</code> keyword first, then troubleshoot.</p></div>

<div class="exam"><p><b>Exam trap.</b> "An OSPF VRF process on a customer router ignores type 5 LSAs from the provider" points to missing <code>capability vrf-lite</code>. "BGP refuses address-family ipv4 vrf" points to a missing RD.</p></div>

<div class="scn"><h4>The OSPF adjacency that joined the wrong table</h4><p>An engineer added the guest subinterface Gi0/4.20 on EDGE and DIST and typed <code>ip ospf 1 area 0</code> on both, reusing the global process. EDGE rejected the command because Gi0/4.20 was in VRF GUEST while process 1 was global. DIST had no VRF on its subinterface, so there the command worked and guest routes leaked into DIST's global table. The fix: put Gi0/4.20 on DIST into VRF GUEST, and use <code>ip ospf 20 area 0</code> with <code>router ospf 20 vrf GUEST</code> on both.</p><p><b>Lesson:</b> the interface's VRF, the process's VRF and the neighbour's VRF must all agree.</p></div>

<div class="iv"><p class="q">"How do you run OSPF, EIGRP and BGP inside a VRF on IOS?"</p><p>Strong answer: OSPF uses a separate process bound to the VRF, <code>router ospf 20 vrf GUEST</code>, with <code>capability vrf-lite</code> on multi-VRF CE routers. EIGRP uses an address family, <code>address-family ipv4 unicast vrf GUEST autonomous-system 20</code> in named mode. BGP uses <code>address-family ipv4 vrf GUEST</code> and requires an RD on the VRF. Verify with the VRF keyword: <code>show ip route vrf</code>, <code>show ip eigrp vrf GUEST neighbors</code>, <code>show ip bgp vpnv4 vrf GUEST summary</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static: <code>ip route vrf NAME</code>; OSPF: a process per VRF; EIGRP and BGP: an address family per VRF.</li>
<li>BGP in a VRF needs an RD; OSPF on a multi-VRF CE facing a PE needs <code>capability vrf-lite</code>.</li>
<li>Interface VRF, process VRF and neighbour VRF must match.</li>
<li>Summaries and their Null0 routes live in the VRF's own table.</li>
<li>Every test and show command needs the <code>vrf</code> keyword, or you are looking at the global table.</li>
</ul></div>
`,hi:`
<p>Wapas apartment building par. Har flat ko apni newspaper delivery chahiye: Flat 101 ka newspaper boy paper Flat 102 mein nahi phenk sakta. Router mein har routing protocol jo kisi VRF ko serve karta hai, use batana padta hai ki woh kis flat ke liye kaam karta hai, warna woh routes global table mein deliver kar deta hai. Yeh chapter dikhata hai ki har protocol VRF se kaise bandhta hai aur sahi commands se VRF ke andar kaise dekhein.</p>

<h3>Extended topology</h3>
<p>Is chapter ke liye guests ek distribution router, DIST, ke through EDGE tak pahunchte hain. Dono routers ek physical link Gi0/4 share karte hain, subinterface .10 (global, 10.10.0.0/30) aur .20 (VRF GUEST, 10.20.0.0/30) ke saath. Guest subinterface par EDGE 10.20.0.1 aur DIST 10.20.0.2 hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="VRF-lite between DIST and EDGE">
<rect x="30" y="60" width="150" height="100" rx="10" fill="#e2e8f0"/><text x="105" y="84" text-anchor="middle" class="svg-ink" font-size="14">DIST</text><text x="105" y="108" text-anchor="middle" class="svg-muted" font-size="12">global + GUEST</text><text x="105" y="128" text-anchor="middle" class="svg-muted" font-size="12">peeche guest APs</text>
<rect x="460" y="60" width="150" height="100" rx="10" fill="#e2e8f0"/><text x="535" y="84" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text><text x="535" y="108" text-anchor="middle" class="svg-muted" font-size="12">global + GUEST</text><text x="535" y="128" text-anchor="middle" class="svg-muted" font-size="12">ISP1 / ISP2</text>
<line x1="180" y1="90" x2="460" y2="90" stroke="#64748b" stroke-width="3"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="12">Gi0/4.10 global 10.10.0.0/30</text>
<line x1="180" y1="130" x2="460" y2="130" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">Gi0/4.20 VRF GUEST 10.20.0.0/30</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Ek physical link, do 802.1Q subinterfaces, do alag routing domains</text>
</svg><p class="cap">Hop-by-hop VRF-lite: har VRF ka apna subinterface aur apna routing process ya address family hai.</p></div>

<h3>Static routes</h3>
<pre class="code">ip route vrf GUEST 0.0.0.0 0.0.0.0 10.0.2.1
ip route vrf GUEST 192.168.24.0 255.255.248.0 10.20.0.2</pre>
<p>Next hop VRF ke andar resolve hota hai. <code>vrf GUEST</code> keyword ke bina route global table mein chala jaata hai, jahan 10.20.0.2 unknown hai, aur woh kabhi install nahi hota.</p>

<h3>OSPF: har VRF ka ek process</h3>
<pre class="code">router ospf 20 vrf GUEST
 router-id 10.20.0.1
 network 10.20.0.0 0.0.0.3 area 0
 network 192.168.20.0 0.0.0.255 area 0
 <span class="c">! Tab zaroori jab yeh multi-VRF router MPLS PE se peer kare</span>
 capability vrf-lite</pre>
<p>Ek OSPF process bilkul ek VRF ka hota hai, isliye global OSPF process (jaise <code>router ospf 1</code>) aur process 20 poori tarah alag hain: alag LSDBs, alag SPF runs. Router ID explicitly set karo; woh sirf us VRF ke interfaces se chuna jaata hai. <code>capability vrf-lite</code> woh down-bit aur domain-tag checks band karta hai jo VRF OSPF process normally aise karta hai jaise woh PE ho. Iske bina, MPLS provider se juda multi-VRF CE provider ke type 3, 5 aur 7 LSAs ko chupchaap ignore karta hai.</p>
<pre class="out">EDGE# show ip ospf 20 neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">10.20.0.2         1   FULL/BDR        00:00:35    10.20.0.2       GigabitEthernet0/4.20</span></pre>

<h3>EIGRP: har VRF ki ek address family</h3>
<pre class="code"><span class="c">! Named mode (preferred)</span>
router eigrp NK
 address-family ipv4 unicast vrf GUEST autonomous-system 20
  network 10.20.0.0 0.0.0.3
  network 192.168.20.0
  af-interface GigabitEthernet0/4.20
   summary-address 192.168.16.0 255.255.248.0
  exit-af-interface
 exit-address-family
<span class="c">! Classic mode equivalent</span>
router eigrp 100
 address-family ipv4 vrf GUEST autonomous-system 20
  network 10.20.0.0 0.0.0.3
 exit-address-family</pre>
<p>Classic mode mein common fault hai VRF address family ke liye <code>autonomous-system</code> number bhool jaana: address family exist karti hai lekin kabhi neighbours nahi banati. Us VRF mein dono ends ko same AS number use karna chahiye.</p>
<pre class="out">EDGE# show ip eigrp vrf GUEST neighbors
EIGRP-IPv4 VR(NK) Address-Family Neighbors for AS(20)
           VRF(GUEST)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
<span class="hl">0   10.20.0.2               Gi0/4.20                 13 00:05:12    4   100  0  17</span></pre>

<h3>BGP: address-family ipv4 vrf</h3>
<pre class="code">vrf definition GUEST
 rd 65010:20
 address-family ipv4
 exit-address-family
router bgp 65010
 address-family ipv4 vrf GUEST
  neighbor 10.0.2.1 remote-as 64520
  neighbor 10.0.2.1 activate
  network 192.168.20.0 mask 255.255.255.0
 exit-address-family</pre>
<p>BGP ko RD chahiye kyunki woh saare VRF prefixes ek BGP table mein rakhta hai aur unhe alag pehchanna padta hai. RD ke bina IOS VRF address family ko mana kar deta hai.</p>
<pre class="out">EDGE# show ip bgp vpnv4 vrf GUEST summary
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">10.0.2.1        4        64520      27      25        4    0    0 00:18:44        1</span></pre>

<h3>VRF ke andar summarisation (blueprint 1.5)</h3>
<p>Summarisation bilkul global table jaisa kaam karta hai, lekin VRF process ke andar: <code>router ospf 20 vrf GUEST</code> ke neeche <code>area 1 range</code>, ya upar jaisa EIGRP VRF af-interface ke neeche <code>summary-address</code>. Null0 discard route <code>show ip route vrf GUEST</code> mein dikhta hai, global table mein nahi, isliye jab summary traffic ko "black-hole" kare to sahi table mein dekho.</p>

<div class="eg"><p><b>Worked example.</b> DIST ke paas guest subnets 192.168.16.0/24 se 192.168.23.0/24 tak hain (aath /24s). Sabse chhota covering summary 192.168.16.0/21 (mask 255.255.248.0) hai, kyunki 16 aath ka multiple hai aur aath /24s ek /21 mein fit hote hain. EDGE phir VRF GUEST mein aath ke bajaye ek route seekhta hai.</p></div>

<h3>VRF-aware tools</h3>
<table class="cmp"><tr><th>Kaam</th><th>Command</th></tr>
<tr><td>VRF ke andar ping ya trace</td><td><code>ping vrf GUEST 198.51.100.10</code>, <code>traceroute vrf GUEST 198.51.100.10</code></td></tr>
<tr><td>Routing, ARP, CEF</td><td><code>show ip route vrf GUEST</code>, <code>show ip arp vrf GUEST</code>, <code>show ip cef vrf GUEST</code></td></tr>
<tr><td>VRF mein protocols</td><td><code>show ip protocols vrf GUEST</code></td></tr>
<tr><td>Ek VRF ka config</td><td><code>show running-config vrf GUEST</code></td></tr>
<tr><td>VRF se remote access</td><td><code>telnet 10.0.2.1 /vrf GUEST</code>, <code>ssh -vrf GUEST -l admin 10.0.2.1</code></td></tr>
</table>

<div class="warn"><p><b>Common galti.</b> <code>show ip route</code> ya plain ping chala kar keh dena "route missing hai". Har show aur test command default mein global table use karta hai. Pehle <code>vrf</code> keyword jodo, phir troubleshoot karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Customer router par OSPF VRF process provider ke type 5 LSAs ignore karta hai" missing <code>capability vrf-lite</code> ki taraf ishara hai. "BGP address-family ipv4 vrf ko mana karta hai" missing RD ki taraf ishara hai.</p></div>

<div class="scn"><h4>OSPF adjacency jo galat table mein jud gayi</h4><p>Ek engineer ne EDGE aur DIST par guest subinterface Gi0/4.20 joda aur dono par <code>ip ospf 1 area 0</code> type kiya, global process reuse karte hue. EDGE ne command reject kiya kyunki Gi0/4.20 VRF GUEST mein tha jabki process 1 global tha. DIST ke subinterface par koi VRF nahi tha, isliye wahan command chal gaya aur guest routes DIST ki global table mein leak ho gaye. Fix: DIST par Gi0/4.20 ko VRF GUEST mein daalo, aur dono par <code>router ospf 20 vrf GUEST</code> ke saath <code>ip ospf 20 area 0</code> use karo.</p><p><b>Seekh:</b> interface ka VRF, process ka VRF aur neighbour ka VRF, teeno match hone chahiye.</p></div>

<div class="iv"><p class="q">"IOS par VRF ke andar OSPF, EIGRP aur BGP kaise chalate ho?"</p><p>Strong answer: OSPF VRF se bandha alag process use karta hai, <code>router ospf 20 vrf GUEST</code>, multi-VRF CE routers par <code>capability vrf-lite</code> ke saath. EIGRP address family use karta hai, named mode mein <code>address-family ipv4 unicast vrf GUEST autonomous-system 20</code>. BGP <code>address-family ipv4 vrf GUEST</code> use karta hai aur VRF par RD maangta hai. VRF keyword se verify karo: <code>show ip route vrf</code>, <code>show ip eigrp vrf GUEST neighbors</code>, <code>show ip bgp vpnv4 vrf GUEST summary</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static: <code>ip route vrf NAME</code>; OSPF: har VRF ka process; EIGRP aur BGP: har VRF ki address family.</li>
<li>VRF mein BGP ko RD chahiye; PE ki taraf multi-VRF CE par OSPF ko <code>capability vrf-lite</code> chahiye.</li>
<li>Interface VRF, process VRF aur neighbour VRF match hone chahiye.</li>
<li>Summaries aur unke Null0 routes VRF ki apni table mein rehte hain.</li>
<li>Har test aur show command ko <code>vrf</code> keyword chahiye, warna aap global table dekh rahe ho.</li>
</ul></div>
`}};export{e as default};