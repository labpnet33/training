var e={id:`underlay`,h:{en:`The underlay: OSPF, loopbacks, MTU and ECMP`,hi:`Underlay: OSPF, loopbacks, MTU aur ECMP`},body:{en:`
<p>A VXLAN overlay is only as good as the road under it. Think of the underlay as the highway network between cities: the parcels (VXLAN packets) are not interesting to the highway; it just needs every city gate (VTEP loopback) to be reachable from every other city, over several parallel roads. If a gate is not on the map, no parcel reaches it, no matter how perfect the overlay config looks.</p>

<h3>Underlay requirements</h3>
<ol>
<li>Every VTEP source loopback (Lo1) must be reachable from every other leaf.</li>
<li>All fabric links are routed point-to-point (/30 here), never switchports.</li>
<li>ECMP over both spines.</li>
<li>MTU large enough for original frame + 50 bytes. Use jumbo on every fabric link.</li>
<li>Fast, simple, stable routing: OSPF process 1, area 0, on links and loopbacks.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Underlay addressing">
<rect x="260" y="10" width="120" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="12">SPINE1 .101</text>
<rect x="30" y="130" width="130" height="40" rx="8" fill="#bae6fd"/><text x="95" y="148" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="95" y="163" text-anchor="middle" class="svg-muted" font-size="12">Lo1 10.255.1.11</text>
<rect x="480" y="130" width="130" height="40" rx="8" fill="#bae6fd"/><text x="545" y="148" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="545" y="163" text-anchor="middle" class="svg-muted" font-size="12">Lo1 10.255.1.12</text>
<line x1="300" y1="46" x2="110" y2="130" stroke="#64748b" stroke-width="2"/><line x1="340" y1="46" x2="530" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="150" y="80" text-anchor="middle" class="svg-accent" font-size="12">10.1.1.0/30</text><text x="500" y="80" text-anchor="middle" class="svg-accent" font-size="12">10.1.2.0/30</text>
<text x="190" y="100" text-anchor="middle" class="svg-muted" font-size="12">leaf .2</text><text x="450" y="100" text-anchor="middle" class="svg-muted" font-size="12">leaf .2</text>
</svg><p class="cap">SPINE2 mirrors this with 10.2.n.0/30. Every leaf has two equal paths to every other leaf.</p></div>

<h3>Configuration (LEAF1 shown)</h3>
<pre class="code"><span class="c">! Fabric links (routed, jumbo)</span>
interface GigabitEthernet1/0/1
 description to SPINE1
 no switchport
 ip address 10.1.1.2 255.255.255.252
 mtu 9198
 ip ospf network point-to-point
 ip ospf 1 area 0
interface GigabitEthernet1/0/2
 description to SPINE2
 no switchport
 ip address 10.2.1.2 255.255.255.252
 mtu 9198
 ip ospf network point-to-point
 ip ospf 1 area 0
<span class="c">! Loopbacks</span>
interface Loopback0
 ip address 10.255.0.11 255.255.255.255
 ip ospf 1 area 0
interface Loopback1
 ip address 10.255.1.11 255.255.255.255
 ip ospf 1 area 0
router ospf 1
 router-id 10.255.0.11</pre>

<h3>Verifying the underlay before touching VXLAN</h3>
<pre class="out">LEAF1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.255.0.101      0   FULL/  -        00:00:36    10.1.1.1        GigabitEthernet1/0/1
10.255.0.102      0   FULL/  -        00:00:38    10.2.1.1        GigabitEthernet1/0/2

LEAF1# show ip route 10.255.1.12
Routing entry for 10.255.1.12/32
  Known via "ospf 1", distance 110, metric 3, type intra area
  Routing Descriptor Blocks:
  * 10.1.1.1, from 10.255.0.12, 00:08:12 ago, via GigabitEthernet1/0/1
    10.2.1.1, from 10.255.0.12, 00:08:12 ago, via GigabitEthernet1/0/2

LEAF1# ping 10.255.1.12 source Loopback1 size 1550 df-bit
<span class="hl">!!!!!</span></pre>
<p>Three checks: two FULL neighbors, two equal-cost routes to the remote VTEP loopback, and a <b>sourced-from-Lo1, large, DF-bit ping</b>. A plain ping from a physical address proves nothing about the tunnel path.</p>

<div class="eg"><p><b>Worked example: MTU arithmetic.</b> H1 sends a 1500-byte IP packet. Inside the Ethernet frame this is 1514 bytes. After VXLAN the outer packet is 1500 + 14 (inner Ethernet) + 8 (VXLAN) + 8 (UDP) + 20 (outer IP) = 1550 bytes of IP, so every fabric link needs an IP MTU of 1550 or more. With 9198 you have a lot of room, so hosts using 9000-byte jumbo frames also work.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting to put Lo1 in OSPF. Adjacencies look perfect and the spines are healthy, but the remote leaf cannot reach your VTEP address, so it never forms a tunnel to you. Always <code>show ip route</code> for the remote Lo1.</p></div>

<div class="exam"><p><b>Exam trap.</b> Small pings succeeding does not prove the MTU. A large-frame DF-bit ping from the VTEP loopback to the remote VTEP loopback is the correct test.</p></div>

<div class="scn"><h4>It worked until someone copied a file</h4><p>A new leaf pinged fine and ARP worked, but copying a 20 MB file between racks stalled at the first large burst. The spine port facing the new leaf still had the default 1500 MTU because the template was applied to only one spine. Small packets fitted; encapsulated full-size packets were dropped. After setting the MTU to 9198 on that link, the copy finished in seconds.</p><p><b>Lesson:</b> test the underlay with large DF-bit pings through every link before going live.</p></div>

<div class="iv"><p class="q">"What does the underlay need to provide for VXLAN?"</p><p>Strong answer: IP reachability between all VTEP loopbacks over routed point-to-point links, ECMP across spines, fast convergence (OSPF or IS-IS, or eBGP), and an MTU at least 50 bytes above the largest host frame. Mention that the underlay is independent of tenants and is tested first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay = routed /30 links, OSPF process 1 area 0, loopbacks Lo0 and Lo1 advertised.</li>
<li>Remote VTEP loopback must have two ECMP routes.</li>
<li>Overhead is 50 bytes: set jumbo MTU on every fabric link.</li>
<li>Test with a large, DF-bit ping sourced from Lo1.</li>
</ul></div>
`,hi:`
<p>VXLAN overlay utna hi acha hota hai jitni acchi uske neeche ki sadak ho. Underlay ko shehron ke beech ka highway network samjho: parcels (VXLAN packets) highway ke liye important nahi hain; use bas yeh chahiye ki har shehar ka gate (VTEP loopback) har doosre shehar se kai parallel sadkon par reachable ho. Agar koi gate map par nahi hai to overlay config kitna bhi perfect ho, koi parcel wahan nahi pahunchega.</p>

<h3>Underlay ki requirements</h3>
<ol>
<li>Har VTEP source loopback (Lo1) har doosre leaf se reachable hona chahiye.</li>
<li>Saare fabric links routed point-to-point hain (yahan /30), switchports nahi.</li>
<li>Dono spines par ECMP.</li>
<li>MTU original frame + 50 bytes ke liye kaafi bada ho. Har fabric link par jumbo use karo.</li>
<li>Tez, simple, stable routing: links aur loopbacks par OSPF process 1, area 0.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Underlay addressing">
<rect x="260" y="10" width="120" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="12">SPINE1 .101</text>
<rect x="30" y="130" width="130" height="40" rx="8" fill="#bae6fd"/><text x="95" y="148" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="95" y="163" text-anchor="middle" class="svg-muted" font-size="12">Lo1 10.255.1.11</text>
<rect x="480" y="130" width="130" height="40" rx="8" fill="#bae6fd"/><text x="545" y="148" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="545" y="163" text-anchor="middle" class="svg-muted" font-size="12">Lo1 10.255.1.12</text>
<line x1="300" y1="46" x2="110" y2="130" stroke="#64748b" stroke-width="2"/><line x1="340" y1="46" x2="530" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="150" y="80" text-anchor="middle" class="svg-accent" font-size="12">10.1.1.0/30</text><text x="500" y="80" text-anchor="middle" class="svg-accent" font-size="12">10.1.2.0/30</text>
<text x="190" y="100" text-anchor="middle" class="svg-muted" font-size="12">leaf .2</text><text x="450" y="100" text-anchor="middle" class="svg-muted" font-size="12">leaf .2</text>
</svg><p class="cap">SPINE2 bhi aisa hi hai, 10.2.n.0/30 ke saath. Har leaf ke paas har doosre leaf tak do equal paths hain.</p></div>

<h3>Configuration (LEAF1 dikhaya gaya)</h3>
<pre class="code"><span class="c">! Fabric links (routed, jumbo)</span>
interface GigabitEthernet1/0/1
 description to SPINE1
 no switchport
 ip address 10.1.1.2 255.255.255.252
 mtu 9198
 ip ospf network point-to-point
 ip ospf 1 area 0
interface GigabitEthernet1/0/2
 description to SPINE2
 no switchport
 ip address 10.2.1.2 255.255.255.252
 mtu 9198
 ip ospf network point-to-point
 ip ospf 1 area 0
<span class="c">! Loopbacks</span>
interface Loopback0
 ip address 10.255.0.11 255.255.255.255
 ip ospf 1 area 0
interface Loopback1
 ip address 10.255.1.11 255.255.255.255
 ip ospf 1 area 0
router ospf 1
 router-id 10.255.0.11</pre>

<h3>VXLAN chhune se pehle underlay verify karo</h3>
<pre class="out">LEAF1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.255.0.101      0   FULL/  -        00:00:36    10.1.1.1        GigabitEthernet1/0/1
10.255.0.102      0   FULL/  -        00:00:38    10.2.1.1        GigabitEthernet1/0/2

LEAF1# show ip route 10.255.1.12
Routing entry for 10.255.1.12/32
  Known via "ospf 1", distance 110, metric 3, type intra area
  Routing Descriptor Blocks:
  * 10.1.1.1, from 10.255.0.12, 00:08:12 ago, via GigabitEthernet1/0/1
    10.2.1.1, from 10.255.0.12, 00:08:12 ago, via GigabitEthernet1/0/2

LEAF1# ping 10.255.1.12 source Loopback1 size 1550 df-bit
<span class="hl">!!!!!</span></pre>
<p>Teen checks: do FULL neighbors, remote VTEP loopback tak do equal-cost routes, aur <b>Lo1 se sourced, bada, DF-bit ping</b>. Physical address se plain ping tunnel path ke baare mein kuch prove nahi karta.</p>

<div class="eg"><p><b>Worked example: MTU ka hisaab.</b> H1 1500-byte IP packet bhejta hai. Ethernet frame ke andar yeh 1514 bytes hai. VXLAN ke baad outer packet 1500 + 14 (inner Ethernet) + 8 (VXLAN) + 8 (UDP) + 20 (outer IP) = 1550 bytes IP hai, isliye har fabric link ka IP MTU 1550 ya usse zyada chahiye. 9198 ke saath kaafi jagah hai, isliye 9000-byte jumbo frames wale hosts bhi kaam karte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Lo1 ko OSPF mein daalna bhool jaana. Adjacencies perfect dikhti hain aur spines healthy hain, lekin remote leaf aapka VTEP address reach nahi kar sakta, isliye woh aapke saath tunnel nahi banata. Hamesha remote Lo1 ke liye <code>show ip route</code> karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Chhote pings ka succeed hona MTU prove nahi karta. VTEP loopback se remote VTEP loopback tak bada DF-bit ping sahi test hai.</p></div>

<div class="scn"><h4>Tab tak chala jab tak kisi ne file copy nahi ki</h4><p>Ek naya leaf ping fine kar raha tha aur ARP kaam kar raha tha, lekin racks ke beech 20 MB file copy pehle bade burst par ruk jaati thi. Naye leaf ki taraf wale spine port par default 1500 MTU tha kyunki template sirf ek spine par lagaya gaya tha. Chhote packets fit ho gaye; encapsulated full-size packets drop hue. Us link par MTU 9198 karne ke baad copy seconds mein khatam ho gayi.</p><p><b>Seekh:</b> live jaane se pehle har link se bade DF-bit pings se underlay test karo.</p></div>

<div class="iv"><p class="q">"VXLAN ke liye underlay ko kya provide karna chahiye?"</p><p>Strong answer: routed point-to-point links par saare VTEP loopbacks ke beech IP reachability, spines par ECMP, fast convergence (OSPF ya IS-IS, ya eBGP), aur sabse bade host frame se kam se kam 50 bytes zyada MTU. Bataao ki underlay tenants se independent hai aur pehle test hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay = routed /30 links, OSPF process 1 area 0, Lo0 aur Lo1 advertised.</li>
<li>Remote VTEP loopback ke liye do ECMP routes hone chahiye.</li>
<li>Overhead 50 bytes hai: har fabric link par jumbo MTU set karo.</li>
<li>Lo1 se sourced bade, DF-bit ping se test karo.</li>
</ul></div>
`}};export{e as default};