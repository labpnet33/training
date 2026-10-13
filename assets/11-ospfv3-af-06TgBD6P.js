var e={id:`ospfv3-af`,h:{en:`OSPFv3 address families: special areas and troubleshooting`,hi:`OSPFv3 address families: special areas aur troubleshooting`},body:{en:`
<p>Think of a courier company that used to run two separate fleets, one for letters and one for parcels. Then it bought bigger vans and put both in the same van, in separate compartments. <b>OSPFv3 with address families</b> is that van: one routing process, running over IPv6, carries an IPv6 compartment and an IPv4 compartment. The ENARSI blueprint asks you to troubleshoot OSPF "v2/v3" and "address families", so this chapter shows how everything you learned about areas works in OSPFv3 and which faults are unique to it. The dedicated OSPFv3 module later in the track goes deeper into passive interfaces, point-to-point links and summarisation.</p>

<h3>What changes from OSPFv2</h3>
<ul>
<li>OSPFv3 packets travel over <b>IPv6 link-local addresses</b> to FF02::5 (all OSPF routers) and FF02::6 (DRs). Even the IPv4 address family needs IPv6 enabled on the interface.</li>
<li>OSPFv3 is enabled <b>per interface</b> (<code>ospfv3 1 ipv6 area 51</code>), not with <code>network</code> statements.</li>
<li>Router and network LSAs no longer carry prefixes. Prefixes move to new LSAs: the <b>link LSA</b> (0x0008, link scope) and the <b>intra-area-prefix LSA</b> (0x2009). Type 3 is renamed inter-area-prefix (0x2003), type 4 inter-area-router (0x2004); AS-external (0x4005) and NSSA (0x2007) keep their roles.</li>
<li>The router ID is still a 32-bit number. A router with no IPv4 address cannot pick one, so you must configure it.</li>
<li>Authentication uses IPsec (AH or ESP) or, on newer IOS XE releases, the RFC 7166 authentication trailer with key chains, not the OSPFv2 commands.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="OSPFv3 address families over one link">
<rect x="20" y="40" width="170" height="130" rx="10" fill="#ddd6fe"/><text x="105" y="64" text-anchor="middle" class="svg-ink" font-size="13">BR: router ospfv3 1</text>
<rect x="35" y="80" width="140" height="34" rx="6" fill="#bae6fd"/><text x="105" y="102" text-anchor="middle" class="svg-ink" font-size="12">AF ipv6, instance 0</text>
<rect x="35" y="124" width="140" height="34" rx="6" fill="#bbf7d0"/><text x="105" y="146" text-anchor="middle" class="svg-ink" font-size="12">AF ipv4, instance 64</text>
<rect x="450" y="40" width="170" height="130" rx="10" fill="#ddd6fe"/><text x="535" y="64" text-anchor="middle" class="svg-ink" font-size="13">ABR: router ospfv3 1</text>
<rect x="465" y="80" width="140" height="34" rx="6" fill="#bae6fd"/><text x="535" y="102" text-anchor="middle" class="svg-ink" font-size="12">AF ipv6, instance 0</text>
<rect x="465" y="124" width="140" height="34" rx="6" fill="#bbf7d0"/><text x="535" y="146" text-anchor="middle" class="svg-ink" font-size="12">AF ipv4, instance 64</text>
<line x1="175" y1="97" x2="465" y2="97" stroke="#64748b" stroke-width="2"/><line x1="175" y1="141" x2="465" y2="141" stroke="#64748b" stroke-width="2"/>
<text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="12">adjacency 1</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">adjacency 2</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">both run over IPv6 link-local, FF02::5</text>
</svg><p class="cap">One process, two instances, two separate adjacencies and databases on the same wire.</p></div>

<h3>Configuring special areas with address families</h3>
<p>Area types are set <b>per address family</b>. If you want area 51 to be stub for both IPv4 and IPv6, configure it in both, on every router in the area, exactly as in OSPFv2.</p>
<pre class="code">ipv6 unicast-routing
router ospfv3 1
 router-id 1.1.1.1
 address-family ipv6 unicast
  area 51 stub
 exit-address-family
 address-family ipv4 unicast
  area 51 stub
 exit-address-family
interface GigabitEthernet0/0
 ipv6 address 2001:DB8:51:12::1/64
 ospfv3 1 ipv6 area 51
 ospfv3 1 ipv4 area 51
<span class="c">! On the ABR, totally stubby for IPv6 only:</span>
<span class="c">!  address-family ipv6 unicast</span>
<span class="c">!   area 51 stub no-summary</span></pre>
<p>NSSA works the same way (<code>area 30 nssa</code>, <code>no-summary</code>, <code>default-information-originate</code> inside the address family), and virtual links are configured inside the address family as well.</p>

<h3>Verification</h3>
<pre class="out">BR#show ospfv3 interface brief
Interface    PID   Area            AF         Cost  State Nbrs F/C
<span class="hl">Gi0/0        1     51              ipv4       1     BDR   1/1</span>
<span class="hl">Gi0/0        1     51              ipv6       1     BDR   1/1</span>

BR#show ospfv3 neighbor

          OSPFv3 1 address-family ipv4 (router-id 1.1.1.1)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
2.2.2.2           1   FULL/DR         00:00:35    3               GigabitEthernet0/0

          OSPFv3 1 address-family ipv6 (router-id 1.1.1.1)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
2.2.2.2           1   FULL/DR         00:00:33    3               GigabitEthernet0/0

BR#show ipv6 route ospf | include ::/0
<span class="hl">OI  ::/0 [110/2]</span>

BR#show ip route ospfv3 | include 0.0.0.0
<span class="hl">O*IA  0.0.0.0/0 [110/2] via 10.51.12.2, 00:01:10, GigabitEthernet0/0</span></pre>
<p>Other useful commands: <code>show ospfv3</code> (area types, ABR/ASBR role, per address family), <code>show ospfv3 database</code> and <code>show ospfv3 ipv4 database</code>. In the IPv6 table the codes are written without spaces: O, OI, OE1, OE2, ON1, ON2.</p>

<h3>Faults unique to OSPFv3 address families</h3>
<ol>
<li><b>No IPv6 on the interface.</b> The IPv4 address family forms no neighbour, because OSPFv3 needs a link-local address. Fix: <code>ipv6 enable</code> or an IPv6 address.</li>
<li><b>No router ID.</b> A router with only IPv6 addresses logs "%OSPFv3-4-NORTRID: Process OSPFv3-1-IPv6 could not pick a router-id, please configure manually".</li>
<li><b>Address family missing on one side.</b> One router runs <code>ospfv3 1 ipv4 area 51</code>, the other does not: IPv6 is FULL, IPv4 has no neighbour. Each family uses its own instance ID (IPv6 0 to 31, IPv4 64 to 95) and must match.</li>
<li><b>Area type in one family only.</b> Stub configured under IPv6 but not IPv4 on one router: the IPv4 adjacency fails with the same stub-flag mismatch you saw in OSPFv2.</li>
<li><b>ipv6 unicast-routing missing.</b> IPv6 routing is off, so the IPv6 family cannot route.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> In the Indore branch rebuilt with OSPFv3, BR has three IPv6 prefixes and three IPv4 prefixes of its own. Area 51 is stub in both families. BR's IPv4 table shows three O IA routes plus <code>O*IA 0.0.0.0/0</code>; its IPv6 table shows the matching OI routes plus <code>OI ::/0</code>. Make the ABR totally stubby in IPv6 only, and the IPv6 table shrinks to <code>OI ::/0</code> while the IPv4 table is unchanged: proof that each family has its own area settings.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuring the area type globally in your head but only in one address family on the router. Removing an IPv6 address from an "IPv4-only" link and breaking the IPv4 address family. Looking in <code>show ip ospf</code> for OSPFv3 information: use <code>show ospfv3</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> The IPv4 address family of OSPFv3 still needs IPv6 link-local addresses. And address-family instance IDs differ: IPv6 uses 0 to 31, IPv4 uses 64 to 95, so the two families never form an adjacency with each other.</p></div>

<div class="scn"><h4>IPv4 neighbour missing on the new link</h4><p>An engineer added a new OSPFv3 link carrying only IPv4 traffic and configured <code>ospfv3 1 ipv4 area 0</code> on both routers, but no IPv6 address because "there is no IPv6 here". <code>show ospfv3 interface brief</code> did not list the interface at all. Adding <code>ipv6 enable</code> on both ends created link-local addresses, and the IPv4 address family came up FULL within seconds.</p><p><b>Lesson:</b> OSPFv3 always rides on IPv6, even when it carries IPv4 routes.</p></div>

<div class="iv"><p class="q">"How does OSPFv3 carry IPv4 routes, and what usually breaks?"</p><p>Strong answer: with address families (RFC 5838), one <code>router ospfv3</code> process runs an IPv6 instance and an IPv4 instance, each with its own adjacency, LSDB and area settings, both transported over IPv6 link-local addresses. Common faults are missing IPv6 on the interface, no router ID on an IPv6-only router, the family enabled on one side only, and area types configured in one family but not the other. Verify with <code>show ospfv3 interface brief</code> and <code>show ospfv3 neighbor</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 address families: one process, separate IPv4 and IPv6 instances, adjacencies and databases.</li>
<li>Everything runs over IPv6 link-local; the IPv4 family needs IPv6 enabled on the interface.</li>
<li>Area types (stub, NSSA, no-summary) are configured per address family.</li>
<li>Set the router ID manually when the router has no IPv4 address.</li>
<li>Verify with show ospfv3 interface brief, show ospfv3 neighbor, show ospfv3 database and the IPv4/IPv6 route tables.</li>
</ul></div>
`,hi:`
<p>Ek courier company socho jo pehle do alag fleets chalati thi, ek letters ke liye aur ek parcels ke liye. Phir usne badi vans khareedi aur dono ko ek hi van mein, alag compartments mein rakh diya. <b>Address families wala OSPFv3</b> wahi van hai: ek routing process, IPv6 par chalta hua, ek IPv6 compartment aur ek IPv4 compartment le jaata hai. ENARSI blueprint aapse OSPF "v2/v3" aur "address families" troubleshoot karne ko kehta hai, isliye yeh chapter dikhata hai ki areas ke baare mein jo kuch aapne seekha woh OSPFv3 mein kaise chalta hai aur kaunse faults sirf isi mein hote hain. Track ka baad wala dedicated OSPFv3 module passive interfaces, point-to-point links aur summarisation mein aur gehraai se jaata hai.</p>

<h3>OSPFv2 se kya badalta hai</h3>
<ul>
<li>OSPFv3 packets <b>IPv6 link-local addresses</b> se FF02::5 (all OSPF routers) aur FF02::6 (DRs) tak jaate hain. IPv4 address family ko bhi interface par IPv6 enabled chahiye.</li>
<li>OSPFv3 <b>har interface par</b> enable hota hai (<code>ospfv3 1 ipv6 area 51</code>), <code>network</code> statements se nahi.</li>
<li>Router aur network LSAs ab prefixes nahi le jaate. Prefixes naye LSAs mein chale gaye: <b>link LSA</b> (0x0008, link scope) aur <b>intra-area-prefix LSA</b> (0x2009). Type 3 ka naam inter-area-prefix (0x2003) aur type 4 ka inter-area-router (0x2004) ho gaya; AS-external (0x4005) aur NSSA (0x2007) apne roles rakhte hain.</li>
<li>Router ID ab bhi 32-bit number hai. Jis router ka koi IPv4 address nahi, woh ek chun nahi sakta, isliye aapko configure karna padta hai.</li>
<li>Authentication IPsec (AH ya ESP) use karta hai ya, naye IOS XE releases par, key chains ke saath RFC 7166 authentication trailer, OSPFv2 commands nahi.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Ek link par OSPFv3 address families">
<rect x="20" y="40" width="170" height="130" rx="10" fill="#ddd6fe"/><text x="105" y="64" text-anchor="middle" class="svg-ink" font-size="13">BR: router ospfv3 1</text>
<rect x="35" y="80" width="140" height="34" rx="6" fill="#bae6fd"/><text x="105" y="102" text-anchor="middle" class="svg-ink" font-size="12">AF ipv6, instance 0</text>
<rect x="35" y="124" width="140" height="34" rx="6" fill="#bbf7d0"/><text x="105" y="146" text-anchor="middle" class="svg-ink" font-size="12">AF ipv4, instance 64</text>
<rect x="450" y="40" width="170" height="130" rx="10" fill="#ddd6fe"/><text x="535" y="64" text-anchor="middle" class="svg-ink" font-size="13">ABR: router ospfv3 1</text>
<rect x="465" y="80" width="140" height="34" rx="6" fill="#bae6fd"/><text x="535" y="102" text-anchor="middle" class="svg-ink" font-size="12">AF ipv6, instance 0</text>
<rect x="465" y="124" width="140" height="34" rx="6" fill="#bbf7d0"/><text x="535" y="146" text-anchor="middle" class="svg-ink" font-size="12">AF ipv4, instance 64</text>
<line x1="175" y1="97" x2="465" y2="97" stroke="#64748b" stroke-width="2"/><line x1="175" y1="141" x2="465" y2="141" stroke="#64748b" stroke-width="2"/>
<text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="12">adjacency 1</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">adjacency 2</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">dono IPv6 link-local par, FF02::5</text>
</svg><p class="cap">Ek process, do instances, ek hi wire par do alag adjacencies aur databases.</p></div>

<h3>Address families ke saath special areas configure karna</h3>
<p>Area types <b>har address family</b> mein set hote hain. Agar aap chahte ho ki area 51 IPv4 aur IPv6 dono ke liye stub ho, to use dono mein configure karo, area ke har router par, bilkul OSPFv2 ki tarah.</p>
<pre class="code">ipv6 unicast-routing
router ospfv3 1
 router-id 1.1.1.1
 address-family ipv6 unicast
  area 51 stub
 exit-address-family
 address-family ipv4 unicast
  area 51 stub
 exit-address-family
interface GigabitEthernet0/0
 ipv6 address 2001:DB8:51:12::1/64
 ospfv3 1 ipv6 area 51
 ospfv3 1 ipv4 area 51
<span class="c">! ABR par, sirf IPv6 ke liye totally stubby:</span>
<span class="c">!  address-family ipv6 unicast</span>
<span class="c">!   area 51 stub no-summary</span></pre>
<p>NSSA bhi aise hi kaam karta hai (address family ke andar <code>area 30 nssa</code>, <code>no-summary</code>, <code>default-information-originate</code>), aur virtual links bhi address family ke andar configure hote hain.</p>

<h3>Verification</h3>
<pre class="out">BR#show ospfv3 interface brief
Interface    PID   Area            AF         Cost  State Nbrs F/C
<span class="hl">Gi0/0        1     51              ipv4       1     BDR   1/1</span>
<span class="hl">Gi0/0        1     51              ipv6       1     BDR   1/1</span>

BR#show ospfv3 neighbor

          OSPFv3 1 address-family ipv4 (router-id 1.1.1.1)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
2.2.2.2           1   FULL/DR         00:00:35    3               GigabitEthernet0/0

          OSPFv3 1 address-family ipv6 (router-id 1.1.1.1)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
2.2.2.2           1   FULL/DR         00:00:33    3               GigabitEthernet0/0

BR#show ipv6 route ospf | include ::/0
<span class="hl">OI  ::/0 [110/2]</span>

BR#show ip route ospfv3 | include 0.0.0.0
<span class="hl">O*IA  0.0.0.0/0 [110/2] via 10.51.12.2, 00:01:10, GigabitEthernet0/0</span></pre>
<p>Doosri useful commands: <code>show ospfv3</code> (area types, ABR/ASBR role, har address family ke liye), <code>show ospfv3 database</code> aur <code>show ospfv3 ipv4 database</code>. IPv6 table mein codes bina space ke likhe jaate hain: O, OI, OE1, OE2, ON1, ON2.</p>

<h3>Faults jo sirf OSPFv3 address families mein hote hain</h3>
<ol>
<li><b>Interface par IPv6 nahi.</b> IPv4 address family koi neighbour nahi banati, kyunki OSPFv3 ko link-local address chahiye. Fix: <code>ipv6 enable</code> ya ek IPv6 address.</li>
<li><b>Router ID nahi.</b> Sirf IPv6 addresses wala router log karta hai "%OSPFv3-4-NORTRID: Process OSPFv3-1-IPv6 could not pick a router-id, please configure manually".</li>
<li><b>Ek side par address family missing.</b> Ek router <code>ospfv3 1 ipv4 area 51</code> chalata hai, doosra nahi: IPv6 FULL hai, IPv4 ka koi neighbour nahi. Har family apni instance ID use karti hai (IPv6 0 se 31, IPv4 64 se 95) aur woh match honi chahiye.</li>
<li><b>Area type sirf ek family mein.</b> Ek router par stub IPv6 ke andar configure hai lekin IPv4 mein nahi: IPv4 adjacency wahi stub-flag mismatch se fail hoti hai jo aapne OSPFv2 mein dekha.</li>
<li><b>ipv6 unicast-routing missing.</b> IPv6 routing band hai, isliye IPv6 family route nahi kar sakti.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> OSPFv3 ke saath dobara bani Indore branch mein BR ke apne teen IPv6 prefixes aur teen IPv4 prefixes hain. Area 51 dono families mein stub hai. BR ki IPv4 table teen O IA routes aur <code>O*IA 0.0.0.0/0</code> dikhati hai; uski IPv6 table matching OI routes aur <code>OI ::/0</code> dikhati hai. ABR ko sirf IPv6 mein totally stubby banao, aur IPv6 table <code>OI ::/0</code> tak simat jaati hai jabki IPv4 table waisi hi rehti hai: proof ki har family ki apni area settings hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Dimaag mein area type globally configure karna lekin router par sirf ek address family mein. "IPv4-only" link se IPv6 address hata kar IPv4 address family tod dena. OSPFv3 information ke liye <code>show ip ospf</code> mein dhoondhna: <code>show ospfv3</code> use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> OSPFv3 ki IPv4 address family ko ab bhi IPv6 link-local addresses chahiye. Aur address-family instance IDs alag hain: IPv6 0 se 31 use karta hai, IPv4 64 se 95, isliye dono families kabhi ek doosre ke saath adjacency nahi banati.</p></div>

<div class="scn"><h4>Naye link par IPv4 neighbour gayab</h4><p>Ek engineer ne sirf IPv4 traffic le jaane wala naya OSPFv3 link joda aur dono routers par <code>ospfv3 1 ipv4 area 0</code> configure kiya, lekin koi IPv6 address nahi kyunki "yahan IPv6 hai hi nahi". <code>show ospfv3 interface brief</code> ne interface list hi nahi kiya. Dono ends par <code>ipv6 enable</code> jodne se link-local addresses bane, aur IPv4 address family kuch seconds mein FULL ho gayi.</p><p><b>Lesson:</b> OSPFv3 hamesha IPv6 par chalta hai, tab bhi jab woh IPv4 routes le jaata hai.</p></div>

<div class="iv"><p class="q">"OSPFv3 IPv4 routes kaise le jaata hai, aur aam taur par kya tootta hai?"</p><p>Strong answer: address families (RFC 5838) ke saath ek <code>router ospfv3</code> process ek IPv6 instance aur ek IPv4 instance chalata hai, har ek ki apni adjacency, LSDB aur area settings, dono IPv6 link-local addresses par transport hote hain. Common faults hain interface par IPv6 na hona, IPv6-only router par router ID na hona, family sirf ek side par enable hona, aur area types ek family mein configure hona lekin doosri mein nahi. <code>show ospfv3 interface brief</code> aur <code>show ospfv3 neighbor</code> se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 address families: ek process, alag IPv4 aur IPv6 instances, adjacencies aur databases.</li>
<li>Sab kuch IPv6 link-local par chalta hai; IPv4 family ko interface par IPv6 enabled chahiye.</li>
<li>Area types (stub, NSSA, no-summary) har address family mein configure hote hain.</li>
<li>Jab router ka koi IPv4 address na ho, router ID manually set karo.</li>
<li>show ospfv3 interface brief, show ospfv3 neighbor, show ospfv3 database aur IPv4/IPv6 route tables se verify karo.</li>
</ul></div>
`}};export{e as default};