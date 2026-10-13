var e={id:`passive-interfaces`,h:{en:`Passive interfaces in traditional and AF mode`,hi:`Traditional aur AF mode mein passive interfaces`},body:{en:`
<p>A shop has a big glass window facing the street. Everyone walking past can see the products on display, but nobody can walk in through the glass. A <b>passive interface</b> is that window. OSPFv3 keeps advertising the interface's prefix to the rest of the network, so everyone knows the subnet exists, but it will not talk OSPF out of that interface, so nobody on that segment can join the routing conversation.</p>

<h3>What passive actually does</h3>
<ul>
<li>The router <b>stops sending Hellos</b> out of the interface.</li>
<li>It <b>ignores</b> any OSPFv3 packets received there, so no adjacency can ever form.</li>
<li>The interface's prefix is <b>still advertised</b>, as a stub prefix in the router's intra-area prefix LSA (type 9, referencing its router LSA).</li>
</ul>
<p>Compare that with simply not enabling OSPFv3 on the interface. Then the prefix is <b>not</b> advertised at all, and the rest of the network cannot reach the user LAN unless you redistribute connected routes. Passive gives you the advertisement without the risk.</p>

<h3>Why it matters: the user LAN in the lab</h3>
<p>R1 Gi0/2 connects to SW-USERS, where only PCs and printers live. With defaults, R1 multicasts a Hello to FF02::5 every 10 seconds onto that VLAN. That wastes a little bandwidth, but the real problem is <b>security</b>: any host running routing software (a lab VM, a misconfigured appliance, or an attacker) can become an OSPFv3 neighbour and inject routes such as a default route. Passive closes that door. It is a standard hardening step alongside authentication (chapter 9).</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Passive interface">
<rect x="250" y="30" width="140" height="56" rx="8" fill="#bae6fd"/><text x="320" y="54" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">RID 1.1.1.1</text>
<rect x="490" y="30" width="120" height="56" rx="8" fill="#fde68a"/><text x="550" y="62" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<line x1="390" y1="58" x2="490" y2="58" stroke="#64748b" stroke-width="2"/><text x="440" y="50" text-anchor="middle" class="svg-accent" font-size="12">Hellos</text>
<rect x="250" y="150" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">SW-USERS</text>
<line x1="320" y1="86" x2="320" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="330" y="118" class="svg-accent" font-size="12">Gi0/2 passive: no Hellos</text>
<rect x="30" y="140" width="170" height="70" rx="8" fill="#fed7aa"/><text x="115" y="165" text-anchor="middle" class="svg-ink" font-size="12">Type 9 LSA still</text><text x="115" y="185" text-anchor="middle" class="svg-ink" font-size="12">carries 100::/64</text>
</svg><p class="cap">Gi0/2 stays silent, but 2001:DB8:ACAD:100::/64 is still advertised to R2 and R3.</p></div>

<h3>Lab task 1: configure it (traditional)</h3>
<pre class="code">R1(config)# ipv6 router ospf 1
R1(config-rtr)# passive-interface GigabitEthernet0/2
<span class="c">! the interface keeps: ipv6 ospf 1 area 0</span></pre>
<p>For a router with many LAN ports, invert the logic: make everything passive and open only the uplinks.</p>
<pre class="code">ipv6 router ospf 1
 passive-interface default
 no passive-interface GigabitEthernet0/0</pre>

<h3>The same in address-family mode</h3>
<p>In AF mode, passive-interface is configured <b>per address family</b>. That gives you flexibility: an interface can be passive for IPv4 and active for IPv6, or the reverse.</p>
<pre class="code">router ospfv3 1
 address-family ipv6 unicast
  passive-interface GigabitEthernet0/2
 exit-address-family
 address-family ipv4 unicast
  passive-interface default
  no passive-interface GigabitEthernet0/0
 exit-address-family</pre>
<p>A classic exam question shows a router where the IPv4 AF neighbour is missing but the IPv6 AF neighbour is fine on the same interface. The answer is often a <code>passive-interface default</code> in only one address family.</p>

<h3>Verification</h3>
<pre class="out">R1# show ipv6 ospf interface GigabitEthernet0/2
GigabitEthernet0/2 is up, line protocol is up
  Link Local Address FE80::5200:FF:FE01:2, Interface ID 5
  Area 0, Process ID 1, Instance ID 0, Router ID 1.1.1.1
  Network Type BROADCAST, Cost: 1
  Transmit Delay is 1 sec, State DR, Priority 1
  Designated Router (ID) 1.1.1.1, local address FE80::5200:FF:FE01:2
  No backup designated router on this network
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
    <span class="hl">No Hellos (Passive interface)</span></pre>
<p>Then prove the prefix is still advertised. On R3, in area 1, the user LAN is an inter-area route:</p>
<pre class="out">R3# show ipv6 route 2001:DB8:ACAD:100::/64
Routing entry for 2001:DB8:ACAD:100::/64
  <span class="hl">Known via "ospf 1", distance 110, metric 3, type inter area</span>
  Route count is 1/1, share count 0
  Routing paths:
    FE80::5200:FF:FE02:1, GigabitEthernet0/0
      Last updated 00:02:14 ago</pre>
<p>That is exactly what the lab checks: Gi0/2 is passive on R1, and R3 has an <code>OI</code> route for 2001:DB8:ACAD:100::/64.</p>

<div class="eg"><p><b>Worked example: the metric of 3.</b> R3 reaches R2 over Gi0/0 (cost 1). R2's inter-area prefix LSA for 100::/64 carries R2's own cost to it: R2 to R1 (1) plus R1's Gi0/2 (1) = 2. R3 adds its cost to reach R2: 2 + 1 = <b>3</b>. Making the user LAN passive does not change the cost at all; only Hellos stop.</p></div>

<div class="warn"><p><b>Common mistake.</b> Making a transit interface passive. The prefix is still advertised, so the routing table looks almost right, but the neighbour on that link disappears and every route learned through it is lost. With <code>passive-interface default</code>, forgetting a <code>no passive-interface</code> for an uplink does the same thing.</p></div>

<div class="exam"><p><b>Exam trap.</b> Passive does <b>not</b> remove the prefix from OSPFv3 and does <b>not</b> shut the interface. If an answer says "passive-interface stops the subnet from being advertised", it is wrong. Also remember that OSPFv2 passive settings under <code>router ospf</code> do nothing for OSPFv3.</p></div>

<div class="scn"><h4>The lab VM that became a router</h4><p>At a software company, users on one floor suddenly lost internet access over IPv6. <code>show ipv6 route ::/0</code> on the floor's router showed an <code>OE2</code> default pointing to a link-local address on the user VLAN. <code>show ipv6 ospf neighbor</code> revealed a neighbour with router ID 10.99.99.1 on the access interface: a developer's virtual router appliance, left at default settings, was announcing a default route. The engineer made the access interfaces passive with <code>passive-interface default</code> and kept only uplinks active; the rogue neighbour vanished and the correct default returned.</p><p><b>Lesson:</b> every interface facing hosts should be passive. Treat it as a security control, not tuning.</p></div>

<div class="iv"><p class="q">"What is the difference between making an interface passive and not enabling OSPFv3 on it?"</p><p>Strong answer: a passive interface is still part of OSPFv3, so its prefix is advertised in the type 9 LSA, but no Hellos are sent and received packets are ignored, so no neighbour can form. An interface without OSPFv3 enabled is invisible: its prefix is not advertised unless redistributed. Use passive for host-facing LANs and loopbacks you want advertised. Mention <code>passive-interface default</code> for many ports and that in AF mode it is set per address family.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Passive = no Hellos, no adjacencies, prefix still advertised.</li>
<li>Traditional: under <code>ipv6 router ospf</code>; AF mode: under each <code>address-family</code>.</li>
<li><code>passive-interface default</code> plus <code>no passive-interface</code> on uplinks scales best.</li>
<li>Verify with "No Hellos (Passive interface)" and an OI route for the LAN on a far router.</li>
<li>Host-facing interfaces should always be passive to block rogue OSPFv3 speakers.</li>
</ul></div>
`,hi:`
<p>Ek dukaan ki badi glass window street ki taraf hai. Har guzarne wala display par products dekh sakta hai, lekin koi bhi glass ke through andar nahi aa sakta. <b>Passive interface</b> wahi window hai. OSPFv3 us interface ka prefix baaki network ko advertise karta rehta hai, isliye sabko pata hai ki subnet exist karta hai, lekin woh us interface se OSPF nahi bolta, isliye us segment par koi bhi routing conversation mein join nahi kar sakta.</p>

<h3>Passive asal mein kya karta hai</h3>
<ul>
<li>Router us interface se <b>Hellos bhejna band</b> kar deta hai.</li>
<li>Wahan receive hue kisi bhi OSPFv3 packet ko <b>ignore</b> karta hai, isliye koi adjacency kabhi nahi ban sakti.</li>
<li>Interface ka prefix <b>abhi bhi advertise</b> hota hai, router ke intra-area prefix LSA (type 9, uske router LSA ko reference karte hue) mein stub prefix ki tarah.</li>
</ul>
<p>Iski tulna interface par OSPFv3 enable hi na karne se karo. Tab prefix bilkul <b>advertise nahi</b> hota, aur baaki network user LAN tak nahi pahunch sakta jab tak aap connected routes redistribute na karo. Passive aapko bina risk ke advertisement deta hai.</p>

<h3>Yeh kyun matter karta hai: lab ka user LAN</h3>
<p>R1 Gi0/2 SW-USERS se juda hai, jahan sirf PCs aur printers hain. Defaults ke saath R1 har 10 second us VLAN par FF02::5 par Hello multicast karta hai. Isse thodi bandwidth waste hoti hai, lekin asli problem <b>security</b> hai: routing software chalane wala koi bhi host (lab VM, galat configure appliance, ya attacker) OSPFv3 neighbour ban sakta hai aur default route jaise routes inject kar sakta hai. Passive yeh darwaza band karta hai. Yeh authentication (chapter 9) ke saath ek standard hardening step hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Passive interface">
<rect x="250" y="30" width="140" height="56" rx="8" fill="#bae6fd"/><text x="320" y="54" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">RID 1.1.1.1</text>
<rect x="490" y="30" width="120" height="56" rx="8" fill="#fde68a"/><text x="550" y="62" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<line x1="390" y1="58" x2="490" y2="58" stroke="#64748b" stroke-width="2"/><text x="440" y="50" text-anchor="middle" class="svg-accent" font-size="12">Hellos</text>
<rect x="250" y="150" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">SW-USERS</text>
<line x1="320" y1="86" x2="320" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="330" y="118" class="svg-accent" font-size="12">Gi0/2 passive: Hellos nahi</text>
<rect x="30" y="140" width="170" height="70" rx="8" fill="#fed7aa"/><text x="115" y="165" text-anchor="middle" class="svg-ink" font-size="12">Type 9 LSA ab bhi</text><text x="115" y="185" text-anchor="middle" class="svg-ink" font-size="12">100::/64 le jaata hai</text>
</svg><p class="cap">Gi0/2 chup rehta hai, lekin 2001:DB8:ACAD:100::/64 abhi bhi R2 aur R3 ko advertise hota hai.</p></div>

<h3>Lab task 1: configure karo (traditional)</h3>
<pre class="code">R1(config)# ipv6 router ospf 1
R1(config-rtr)# passive-interface GigabitEthernet0/2
<span class="c">! interface par rehta hai: ipv6 ospf 1 area 0</span></pre>
<p>Bahut saare LAN ports wale router ke liye logic ulta karo: sab kuch passive banao aur sirf uplinks kholo.</p>
<pre class="code">ipv6 router ospf 1
 passive-interface default
 no passive-interface GigabitEthernet0/0</pre>

<h3>Address-family mode mein yahi</h3>
<p>AF mode mein passive-interface <b>har address family</b> ke liye configure hota hai. Isse flexibility milti hai: ek interface IPv4 ke liye passive aur IPv6 ke liye active ho sakta hai, ya ulta.</p>
<pre class="code">router ospfv3 1
 address-family ipv6 unicast
  passive-interface GigabitEthernet0/2
 exit-address-family
 address-family ipv4 unicast
  passive-interface default
  no passive-interface GigabitEthernet0/0
 exit-address-family</pre>
<p>Ek classic exam question aisa router dikhata hai jahan same interface par IPv4 AF neighbour gayab hai lekin IPv6 AF neighbour theek hai. Jawab aksar sirf ek address family mein <code>passive-interface default</code> hota hai.</p>

<h3>Verification</h3>
<pre class="out">R1# show ipv6 ospf interface GigabitEthernet0/2
GigabitEthernet0/2 is up, line protocol is up
  Link Local Address FE80::5200:FF:FE01:2, Interface ID 5
  Area 0, Process ID 1, Instance ID 0, Router ID 1.1.1.1
  Network Type BROADCAST, Cost: 1
  Transmit Delay is 1 sec, State DR, Priority 1
  Designated Router (ID) 1.1.1.1, local address FE80::5200:FF:FE01:2
  No backup designated router on this network
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
    <span class="hl">No Hellos (Passive interface)</span></pre>
<p>Phir prove karo ki prefix abhi bhi advertise ho raha hai. R3 par, area 1 mein, user LAN inter-area route hai:</p>
<pre class="out">R3# show ipv6 route 2001:DB8:ACAD:100::/64
Routing entry for 2001:DB8:ACAD:100::/64
  <span class="hl">Known via "ospf 1", distance 110, metric 3, type inter area</span>
  Route count is 1/1, share count 0
  Routing paths:
    FE80::5200:FF:FE02:1, GigabitEthernet0/0
      Last updated 00:02:14 ago</pre>
<p>Lab bilkul yahi check karta hai: R1 par Gi0/2 passive hai, aur R3 ke paas 2001:DB8:ACAD:100::/64 ke liye <code>OI</code> route hai.</p>

<div class="eg"><p><b>Worked example: metric 3 kyun.</b> R3 Gi0/0 par R2 tak pahunchta hai (cost 1). 100::/64 ke liye R2 ka inter-area prefix LSA R2 ki apni cost le jaata hai: R2 se R1 (1) plus R1 ka Gi0/2 (1) = 2. R3 R2 tak pahunchne ki apni cost jodta hai: 2 + 1 = <b>3</b>. User LAN ko passive banane se cost bilkul nahi badalti; sirf Hellos band hote hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Transit interface ko passive banana. Prefix abhi bhi advertise hota hai, isliye routing table lagbhag sahi dikhti hai, lekin us link ka neighbour gayab ho jaata hai aur uske through seekha har route kho jaata hai. <code>passive-interface default</code> ke saath uplink ke liye <code>no passive-interface</code> bhoolna bhi yahi karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Passive prefix ko OSPFv3 se <b>nahi</b> hatata aur interface ko shut <b>nahi</b> karta. Agar koi answer kehta hai "passive-interface subnet ko advertise hone se rokta hai", to woh galat hai. Yeh bhi yaad rakho ki <code>router ospf</code> ke neeche OSPFv2 passive settings OSPFv3 ke liye kuch nahi karti.</p></div>

<div class="scn"><h4>Lab VM jo router ban gaya</h4><p>Ek software company mein ek floor ke users ka achanak IPv6 par internet access chala gaya. Floor ke router par <code>show ipv6 route ::/0</code> ne user VLAN ke ek link-local address ki taraf point karta <code>OE2</code> default dikhaya. <code>show ipv6 ospf neighbor</code> ne access interface par router ID 10.99.99.1 wala neighbour dikhaya: ek developer ka virtual router appliance, default settings par chhoda hua, default route announce kar raha tha. Engineer ne <code>passive-interface default</code> se access interfaces passive kiye aur sirf uplinks active rakhe; rogue neighbour gayab hua aur sahi default wapas aaya.</p><p><b>Seekh:</b> hosts ki taraf wala har interface passive hona chahiye. Ise tuning nahi, security control maano.</p></div>

<div class="iv"><p class="q">"Interface ko passive banane aur us par OSPFv3 enable na karne mein kya fark hai?"</p><p>Strong answer: passive interface abhi bhi OSPFv3 ka hissa hai, isliye uska prefix type 9 LSA mein advertise hota hai, lekin Hellos nahi jaate aur received packets ignore hote hain, isliye koi neighbour nahi ban sakta. Bina OSPFv3 wala interface invisible hai: uska prefix advertise nahi hota jab tak redistribute na ho. Host-facing LANs aur jo loopbacks advertise karne hain unke liye passive use karo. Bahut saare ports ke liye <code>passive-interface default</code> batao aur yeh ki AF mode mein yeh har address family ke liye set hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Passive = Hellos nahi, adjacencies nahi, prefix abhi bhi advertise.</li>
<li>Traditional: <code>ipv6 router ospf</code> ke neeche; AF mode: har <code>address-family</code> ke neeche.</li>
<li><code>passive-interface default</code> plus uplinks par <code>no passive-interface</code> sabse achha scale karta hai.</li>
<li>"No Hellos (Passive interface)" aur door ke router par LAN ke OI route se verify karo.</li>
<li>Host-facing interfaces hamesha passive hone chahiye taaki rogue OSPFv3 speakers block hon.</li>
</ul></div>
`}};export{e as default};