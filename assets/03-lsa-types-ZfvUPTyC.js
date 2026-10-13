var e={id:`lsa-types`,h:{en:`OSPFv3 LSAs in depth: types 8 and 9 and prefix separation`,hi:`OSPFv3 LSAs gehraai se: types 8 aur 9 aur prefix separation`},body:{en:`
<p>Walk into an office building. In the lobby hangs a <b>floor plan</b> showing rooms and corridors. On each door is a small <b>notice</b> meant only for people standing at that door. And next to the lift is a <b>directory</b> saying which team sits in which room. OSPFv3 has the same three layers: router and network LSAs are the floor plan, the link LSA (type 8) is the door notice, and the intra-area prefix LSA (type 9) is the directory.</p>

<h3>The LS type field and flooding scope</h3>
<p>In OSPFv3 the LS type is a 16-bit field. The top three bits are flags and the rest is a <b>function code</b>. The <b>S2/S1 bits</b> encode the flooding scope: 00 = link-local, 01 = area, 10 = AS (the whole domain). That is why the type codes look like 0x2001 (area scope, function 1) or 0x4005 (AS scope, function 5). The <b>U bit</b> tells a router what to do with an unknown type; you rarely see it set.</p>

<table class="cmp"><tr><th>Code</th><th>Name</th><th>Scope</th><th>v2 equivalent</th><th>Carries</th></tr>
<tr><td>0x2001</td><td>Router</td><td>Area</td><td>Type 1</td><td>Links to neighbours, costs, interface IDs. No prefixes.</td></tr>
<tr><td>0x2002</td><td>Network</td><td>Area</td><td>Type 2</td><td>Routers on a transit link, from the DR. No prefixes.</td></tr>
<tr><td>0x2003</td><td>Inter-area prefix</td><td>Area</td><td>Type 3</td><td>Prefixes from other areas, from an ABR.</td></tr>
<tr><td>0x2004</td><td>Inter-area router</td><td>Area</td><td>Type 4</td><td>How to reach an ASBR in another area.</td></tr>
<tr><td>0x4005</td><td>AS-external</td><td>AS</td><td>Type 5</td><td>Redistributed prefixes, from an ASBR.</td></tr>
<tr><td>0x2007</td><td>NSSA</td><td>Area</td><td>Type 7</td><td>Externals inside an NSSA.</td></tr>
<tr><td>0x0008</td><td>Link</td><td>Link</td><td>None</td><td>Link-local address, priority, options, prefixes on the link.</td></tr>
<tr><td>0x2009</td><td>Intra-area prefix</td><td>Area</td><td>None</td><td>Prefixes of a router or of a transit link.</td></tr>
</table>

<h3>Type 8: the link LSA</h3>
<p>Every router originates <b>one link LSA per link</b> it runs OSPFv3 on, and it never leaves that link. It carries three things:</p>
<ul>
<li>The router's <b>link-local address</b> on that link. Neighbours use it as the next hop in their routing tables.</li>
<li>The <b>list of IPv6 prefixes</b> configured on that interface. The DR collects these from all routers on a transit link.</li>
<li>The router <b>priority</b> and <b>options</b> for that link.</li>
</ul>
<pre class="out">R2# show ipv6 ospf database link adv-router 1.1.1.1

            OSPFv3 Router with ID (2.2.2.2) (Process ID 1)

                Link (Type-8) Link States (Area 0)

  LS age: 95
  Options: (V6-Bit, E-Bit, R-bit, DC-Bit)
  LS Type: Link-LSA (Interface: GigabitEthernet0/0)
  Link State ID: 3 (Interface ID)
  Advertising Router: 1.1.1.1
  LS Seq Number: 80000002
  Checksum: 0x1B2C
  Length: 56
  Router Priority: 1
  <span class="hl">Link Local Address: FE80::5200:FF:FE01:0</span>
  Number of Prefixes: 1
  <span class="hl">Prefix Address: 2001:DB8:ACAD:F12::</span>
  Prefix Length: 64, Options: None</pre>

<h3>Type 9: the intra-area prefix LSA</h3>
<p>This LSA puts the addresses back onto the graph. Each one <b>references</b> a topology LSA:</p>
<ul>
<li>A router's own type 9 references its <b>router LSA</b> (referenced type 0x2001, link state ID 0). It lists prefixes on point-to-point links, loopbacks and stub links such as a passive user LAN.</li>
<li>The <b>DR</b> originates a type 9 that references its <b>network LSA</b> (0x2002, link state ID = the DR's interface ID). It lists the prefixes of the transit link, gathered from the link LSAs.</li>
</ul>
<pre class="out">R2# show ipv6 ospf database prefix adv-router 3.3.3.3

                Intra Area Prefix Link States (Area 1)

  LS Type: Intra-Area-Prefix-LSA
  Link State ID: 0
  Advertising Router: 3.3.3.3
  <span class="hl">Referenced LSA Type: 2001</span>
  Referenced Link State ID: 0
  Referenced Advertising Router: 3.3.3.3
  Number of Prefixes: 4
  <span class="hl">Prefix Address: 2001:DB8:ACAD:10::1</span>
  <span class="hl">Prefix Length: 128, Options: LA , Metric: 0</span>
  Prefix Address: 2001:DB8:ACAD:11::1
  Prefix Length: 128, Options: LA , Metric: 0
  ...</pre>
<p>Notice the <b>/128 with the LA bit</b> (local address). OSPFv3 advertises a loopback as a host route by default, even though Loopback10 is configured with /64. Setting <code>ipv6 ospf network point-to-point</code> on the loopback makes it advertise the /64 instead. Other prefix option bits: <b>NU</b> (no unicast), <b>P</b> (propagate, used on NSSA externals) and <b>DN</b> (loop prevention for VPNs).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Type 9 references">
<rect x="30" y="30" width="170" height="54" rx="8" fill="#bae6fd"/><text x="115" y="53" text-anchor="middle" class="svg-ink" font-size="13">Router LSA 0x2001</text><text x="115" y="72" text-anchor="middle" class="svg-muted" font-size="12">R3: link to R2</text>
<rect x="30" y="160" width="170" height="54" rx="8" fill="#bbf7d0"/><text x="115" y="183" text-anchor="middle" class="svg-ink" font-size="13">Prefix LSA 0x2009</text><text x="115" y="202" text-anchor="middle" class="svg-muted" font-size="12">R3 loopbacks /128</text>
<line x1="115" y1="160" x2="115" y2="84" stroke="#64748b" stroke-width="2"/><text x="125" y="125" class="svg-accent" font-size="12">references</text>
<rect x="420" y="30" width="190" height="54" rx="8" fill="#ddd6fe"/><text x="515" y="53" text-anchor="middle" class="svg-ink" font-size="13">Network LSA 0x2002</text><text x="515" y="72" text-anchor="middle" class="svg-muted" font-size="12">from DR, lists R2 and R3</text>
<rect x="420" y="160" width="190" height="54" rx="8" fill="#bbf7d0"/><text x="515" y="183" text-anchor="middle" class="svg-ink" font-size="13">Prefix LSA 0x2009</text><text x="515" y="202" text-anchor="middle" class="svg-muted" font-size="12">transit link F23::/64</text>
<line x1="515" y1="160" x2="515" y2="84" stroke="#64748b" stroke-width="2"/><text x="525" y="125" class="svg-accent" font-size="12">references</text>
<rect x="245" y="95" width="150" height="54" rx="8" fill="#fde68a"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">Link LSAs 0x0008</text><text x="320" y="137" text-anchor="middle" class="svg-muted" font-size="12">feed the DR</text>
<line x1="395" y1="122" x2="420" y2="175" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
</svg><p class="cap">Topology LSAs on top, prefix LSAs underneath pointing up to them. Link LSAs feed the DR's prefix list.</p></div>

<h3>Why the split matters</h3>
<p>In OSPFv2 a prefix change on a router changes its router LSA, which triggers a <b>full SPF</b> across the area. In OSPFv3 the router LSA stays the same; only the type 9 LSA is re-flooded, and routers run a cheaper <b>partial route calculation</b> for prefixes without rebuilding the SPF tree. On large IPv6 networks with many access prefixes, this is a real stability gain.</p>

<h3>The whole database at a glance</h3>
<pre class="out">R2# show ipv6 ospf database

            OSPFv3 Router with ID (2.2.2.2) (Process ID 1)

                Router Link States (Area 0)
ADV Router       Age         Seq#        Fragment ID  Link count  Bits
 1.1.1.1         412         0x80000004  0            1           None
 2.2.2.2         405         0x80000005  0            1           B
                Net Link States (Area 0)
ADV Router       Age         Seq#        Link ID    Rtr count
 2.2.2.2         405         0x80000001  3          2
                <span class="hl">Inter Area Prefix Link States (Area 0)</span>
ADV Router       Age         Seq#        Prefix
 2.2.2.2         398         0x80000001  2001:DB8:ACAD:F23::/64
 2.2.2.2         390         0x80000001  2001:DB8:ACAD:10::1/128
 ...</pre>
<p>The <b>B</b> bit in R2's router LSA marks it as an ABR (an <b>E</b> bit would mark an ASBR). The inter-area prefix LSAs are what R2 announces into area 0, and they are exactly what the summary in chapter 8 will shrink.</p>

<div class="eg"><p><b>Worked example.</b> Count the LSAs in area 1 of the lab with defaults. Router LSAs: 2 (R2 and R3). Network LSA: 1 (from the DR on the F23 link). Link LSAs on the F23 link: 2. Intra-area prefix LSAs: R3's (four /128 loopbacks) and the DR's (F23::/64). After you make the link point-to-point, the network LSA and the DR's type 9 disappear, and F23::/64 moves into the router-referenced type 9 of both R2 and R3.</p></div>

<div class="warn"><p><b>Common mistake.</b> Looking inside router LSAs for a missing prefix. In OSPFv3 they never contain prefixes. Look at <code>show ipv6 ospf database prefix</code> for intra-area prefixes and <code>inter-area prefix</code> for inter-area ones.</p></div>

<div class="exam"><p><b>Exam trap.</b> The link LSA has <b>link-local</b> flooding scope, not area scope. And the "LSA type 3" in OSPFv3 is called the inter-area <b>prefix</b> LSA, not the summary LSA. Questions often test those two names.</p></div>

<div class="scn"><h4>The /128 routes nobody configured</h4><p>An engineer building an IPv6 lab configured four loopbacks as /64 and was confused to see <code>OI 2001:DB8:ACAD:10::1/128</code> on the far router, and a filter that matched /64s let nothing through. <code>show ipv6 ospf interface Loopback10</code> said "Loopback interface is treated as a stub Host". The intra-area prefix LSA confirmed a /128 with the LA bit. Adding <code>ipv6 ospf network point-to-point</code> on each loopback made OSPFv3 advertise the /64s.</p><p><b>Lesson:</b> OSPFv3 advertises loopbacks as /128 by default; check the type 9 LSA before blaming filters.</p></div>

<div class="iv"><p class="q">"What is the difference between the OSPFv3 link LSA and the intra-area prefix LSA?"</p><p>Strong answer: the link LSA (0x0008) has link-local scope; each router sends one per link with its link-local address, priority, options and the prefixes on that interface. The intra-area prefix LSA (0x2009) has area scope and carries prefixes into the area, referencing either a router LSA (the router's stub and point-to-point prefixes) or, from the DR, a network LSA (the transit link prefixes). Mention that this split means a prefix change does not trigger a full SPF.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LS type = scope bits plus function code: 0x2xxx area, 0x4005 AS, 0x0008 link.</li>
<li>Router and network LSAs describe topology only; prefixes live in types 8 and 9 (and 3, 5, 7 across boundaries).</li>
<li>The link LSA gives neighbours your link-local next hop and gives the DR the transit prefixes.</li>
<li>Type 9 references a router LSA or, from the DR, a network LSA.</li>
<li>Loopbacks are advertised as /128 with the LA bit unless set to point-to-point.</li>
</ul></div>
`,hi:`
<p>Ek office building mein jaao. Lobby mein ek <b>floor plan</b> tanga hai jo rooms aur corridors dikhata hai. Har darwaze par ek chhota <b>notice</b> hai jo sirf usi darwaze par khade logon ke liye hai. Aur lift ke paas ek <b>directory</b> hai jo batati hai kaunsi team kis room mein baithti hai. OSPFv3 mein bhi yahi teen layers hain: router aur network LSAs floor plan hain, link LSA (type 8) darwaze ka notice hai, aur intra-area prefix LSA (type 9) directory hai.</p>

<h3>LS type field aur flooding scope</h3>
<p>OSPFv3 mein LS type 16-bit field hai. Upar ke teen bits flags hain aur baaki <b>function code</b> hai. <b>S2/S1 bits</b> flooding scope batate hain: 00 = link-local, 01 = area, 10 = AS (poora domain). Isiliye type codes 0x2001 (area scope, function 1) ya 0x4005 (AS scope, function 5) jaise dikhte hain. <b>U bit</b> router ko batata hai ki unknown type ke saath kya kare; yeh aap kam hi set dekhte ho.</p>

<table class="cmp"><tr><th>Code</th><th>Naam</th><th>Scope</th><th>v2 equivalent</th><th>Kya le jaata hai</th></tr>
<tr><td>0x2001</td><td>Router</td><td>Area</td><td>Type 1</td><td>Neighbours tak links, costs, interface IDs. Prefixes nahi.</td></tr>
<tr><td>0x2002</td><td>Network</td><td>Area</td><td>Type 2</td><td>Transit link ke routers, DR se. Prefixes nahi.</td></tr>
<tr><td>0x2003</td><td>Inter-area prefix</td><td>Area</td><td>Type 3</td><td>Doosre areas ke prefixes, ABR se.</td></tr>
<tr><td>0x2004</td><td>Inter-area router</td><td>Area</td><td>Type 4</td><td>Doosre area ke ASBR tak kaise pahunchein.</td></tr>
<tr><td>0x4005</td><td>AS-external</td><td>AS</td><td>Type 5</td><td>Redistributed prefixes, ASBR se.</td></tr>
<tr><td>0x2007</td><td>NSSA</td><td>Area</td><td>Type 7</td><td>NSSA ke andar externals.</td></tr>
<tr><td>0x0008</td><td>Link</td><td>Link</td><td>Koi nahi</td><td>Link-local address, priority, options, link ke prefixes.</td></tr>
<tr><td>0x2009</td><td>Intra-area prefix</td><td>Area</td><td>Koi nahi</td><td>Router ya transit link ke prefixes.</td></tr>
</table>

<h3>Type 8: link LSA</h3>
<p>Har router jis link par OSPFv3 chalata hai us par <b>ek link LSA per link</b> originate karta hai, aur yeh us link se kabhi bahar nahi jaata. Isme teen cheezein hoti hain:</p>
<ul>
<li>Us link par router ka <b>link-local address</b>. Neighbours ise apni routing tables mein next hop ki tarah use karte hain.</li>
<li>Us interface par configure <b>IPv6 prefixes ki list</b>. DR transit link ke saare routers se yeh collect karta hai.</li>
<li>Us link ke liye router ki <b>priority</b> aur <b>options</b>.</li>
</ul>
<pre class="out">R2# show ipv6 ospf database link adv-router 1.1.1.1

            OSPFv3 Router with ID (2.2.2.2) (Process ID 1)

                Link (Type-8) Link States (Area 0)

  LS age: 95
  Options: (V6-Bit, E-Bit, R-bit, DC-Bit)
  LS Type: Link-LSA (Interface: GigabitEthernet0/0)
  Link State ID: 3 (Interface ID)
  Advertising Router: 1.1.1.1
  LS Seq Number: 80000002
  Checksum: 0x1B2C
  Length: 56
  Router Priority: 1
  <span class="hl">Link Local Address: FE80::5200:FF:FE01:0</span>
  Number of Prefixes: 1
  <span class="hl">Prefix Address: 2001:DB8:ACAD:F12::</span>
  Prefix Length: 64, Options: None</pre>

<h3>Type 9: intra-area prefix LSA</h3>
<p>Yeh LSA addresses ko wapas graph par rakhta hai. Har ek kisi topology LSA ko <b>reference</b> karta hai:</p>
<ul>
<li>Router ka apna type 9 uske <b>router LSA</b> ko reference karta hai (referenced type 0x2001, link state ID 0). Isme point-to-point links, loopbacks aur passive user LAN jaise stub links ke prefixes hote hain.</li>
<li><b>DR</b> ek type 9 originate karta hai jo uske <b>network LSA</b> ko reference karta hai (0x2002, link state ID = DR ka interface ID). Isme transit link ke prefixes hote hain, link LSAs se ikattha kiye hue.</li>
</ul>
<pre class="out">R2# show ipv6 ospf database prefix adv-router 3.3.3.3

                Intra Area Prefix Link States (Area 1)

  LS Type: Intra-Area-Prefix-LSA
  Link State ID: 0
  Advertising Router: 3.3.3.3
  <span class="hl">Referenced LSA Type: 2001</span>
  Referenced Link State ID: 0
  Referenced Advertising Router: 3.3.3.3
  Number of Prefixes: 4
  <span class="hl">Prefix Address: 2001:DB8:ACAD:10::1</span>
  <span class="hl">Prefix Length: 128, Options: LA , Metric: 0</span>
  Prefix Address: 2001:DB8:ACAD:11::1
  Prefix Length: 128, Options: LA , Metric: 0
  ...</pre>
<p><b>LA bit ke saath /128</b> par dhyan do (local address). OSPFv3 default mein loopback ko host route ki tarah advertise karta hai, bhale hi Loopback10 /64 ke saath configure ho. Loopback par <code>ipv6 ospf network point-to-point</code> set karne se woh /64 advertise karta hai. Baaki prefix option bits: <b>NU</b> (no unicast), <b>P</b> (propagate, NSSA externals par use hota hai) aur <b>DN</b> (VPNs ke liye loop prevention).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Type 9 references">
<rect x="30" y="30" width="170" height="54" rx="8" fill="#bae6fd"/><text x="115" y="53" text-anchor="middle" class="svg-ink" font-size="13">Router LSA 0x2001</text><text x="115" y="72" text-anchor="middle" class="svg-muted" font-size="12">R3: R2 tak link</text>
<rect x="30" y="160" width="170" height="54" rx="8" fill="#bbf7d0"/><text x="115" y="183" text-anchor="middle" class="svg-ink" font-size="13">Prefix LSA 0x2009</text><text x="115" y="202" text-anchor="middle" class="svg-muted" font-size="12">R3 loopbacks /128</text>
<line x1="115" y1="160" x2="115" y2="84" stroke="#64748b" stroke-width="2"/><text x="125" y="125" class="svg-accent" font-size="12">reference</text>
<rect x="420" y="30" width="190" height="54" rx="8" fill="#ddd6fe"/><text x="515" y="53" text-anchor="middle" class="svg-ink" font-size="13">Network LSA 0x2002</text><text x="515" y="72" text-anchor="middle" class="svg-muted" font-size="12">DR se, R2 aur R3 list</text>
<rect x="420" y="160" width="190" height="54" rx="8" fill="#bbf7d0"/><text x="515" y="183" text-anchor="middle" class="svg-ink" font-size="13">Prefix LSA 0x2009</text><text x="515" y="202" text-anchor="middle" class="svg-muted" font-size="12">transit link F23::/64</text>
<line x1="515" y1="160" x2="515" y2="84" stroke="#64748b" stroke-width="2"/><text x="525" y="125" class="svg-accent" font-size="12">reference</text>
<rect x="245" y="95" width="150" height="54" rx="8" fill="#fde68a"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">Link LSAs 0x0008</text><text x="320" y="137" text-anchor="middle" class="svg-muted" font-size="12">DR ko feed karte hain</text>
<line x1="395" y1="122" x2="420" y2="175" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
</svg><p class="cap">Upar topology LSAs, neeche prefix LSAs jo unki taraf point karte hain. Link LSAs DR ki prefix list ko feed karte hain.</p></div>

<h3>Split kyun matter karta hai</h3>
<p>OSPFv2 mein router par prefix change hone se uska router LSA badalta hai, jo poore area mein <b>full SPF</b> trigger karta hai. OSPFv3 mein router LSA same rehta hai; sirf type 9 LSA dobara flood hota hai, aur routers SPF tree dobara banaye bina prefixes ke liye sasta <b>partial route calculation</b> chalate hain. Bahut saare access prefixes wale bade IPv6 networks par yeh asli stability gain hai.</p>

<h3>Poora database ek nazar mein</h3>
<pre class="out">R2# show ipv6 ospf database

            OSPFv3 Router with ID (2.2.2.2) (Process ID 1)

                Router Link States (Area 0)
ADV Router       Age         Seq#        Fragment ID  Link count  Bits
 1.1.1.1         412         0x80000004  0            1           None
 2.2.2.2         405         0x80000005  0            1           B
                Net Link States (Area 0)
ADV Router       Age         Seq#        Link ID    Rtr count
 2.2.2.2         405         0x80000001  3          2
                <span class="hl">Inter Area Prefix Link States (Area 0)</span>
ADV Router       Age         Seq#        Prefix
 2.2.2.2         398         0x80000001  2001:DB8:ACAD:F23::/64
 2.2.2.2         390         0x80000001  2001:DB8:ACAD:10::1/128
 ...</pre>
<p>R2 ke router LSA mein <b>B</b> bit use ABR mark karta hai (<b>E</b> bit ASBR mark karta). Inter-area prefix LSAs woh hain jo R2 area 0 mein announce karta hai, aur chapter 8 ka summary inhi ko chhota karega.</p>

<div class="eg"><p><b>Worked example.</b> Defaults ke saath lab ke area 1 mein LSAs gino. Router LSAs: 2 (R2 aur R3). Network LSA: 1 (F23 link par DR se). F23 link par link LSAs: 2. Intra-area prefix LSAs: R3 ka (chaar /128 loopbacks) aur DR ka (F23::/64). Link ko point-to-point banane ke baad network LSA aur DR ka type 9 gayab ho jaate hain, aur F23::/64 R2 aur R3 dono ke router-referenced type 9 mein chala jaata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Missing prefix ko router LSAs ke andar dhoondhna. OSPFv3 mein unme kabhi prefixes nahi hote. Intra-area prefixes ke liye <code>show ipv6 ospf database prefix</code> aur inter-area ke liye <code>inter-area prefix</code> dekho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Link LSA ka flooding scope <b>link-local</b> hai, area nahi. Aur OSPFv3 mein "LSA type 3" ko inter-area <b>prefix</b> LSA kehte hain, summary LSA nahi. Questions aksar yeh do naam test karte hain.</p></div>

<div class="scn"><h4>/128 routes jo kisi ne configure nahi kiye</h4><p>IPv6 lab banate hue ek engineer ne chaar loopbacks /64 ke roop mein configure kiye aur door ke router par <code>OI 2001:DB8:ACAD:10::1/128</code> dekh kar confuse ho gaya, aur /64s match karne wala filter kuch bhi nahi guzarne de raha tha. <code>show ipv6 ospf interface Loopback10</code> ne kaha "Loopback interface is treated as a stub Host". Intra-area prefix LSA ne LA bit ke saath /128 confirm kiya. Har loopback par <code>ipv6 ospf network point-to-point</code> jodne se OSPFv3 ne /64s advertise kiye.</p><p><b>Seekh:</b> OSPFv3 default mein loopbacks ko /128 advertise karta hai; filters ko blame karne se pehle type 9 LSA check karo.</p></div>

<div class="iv"><p class="q">"OSPFv3 link LSA aur intra-area prefix LSA mein kya fark hai?"</p><p>Strong answer: link LSA (0x0008) ka scope link-local hai; har router har link par ek bhejta hai jisme uska link-local address, priority, options aur us interface ke prefixes hote hain. Intra-area prefix LSA (0x2009) ka scope area hai aur yeh prefixes area mein le jaata hai, ya to router LSA ko reference karke (router ke stub aur point-to-point prefixes) ya, DR se, network LSA ko reference karke (transit link prefixes). Batao ki is split ki wajah se prefix change full SPF trigger nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LS type = scope bits plus function code: 0x2xxx area, 0x4005 AS, 0x0008 link.</li>
<li>Router aur network LSAs sirf topology describe karte hain; prefixes types 8 aur 9 mein rehte hain (aur boundaries ke paar 3, 5, 7 mein).</li>
<li>Link LSA neighbours ko aapka link-local next hop deta hai aur DR ko transit prefixes deta hai.</li>
<li>Type 9 router LSA ko, ya DR se network LSA ko reference karta hai.</li>
<li>Loopbacks LA bit ke saath /128 advertise hote hain jab tak point-to-point set na ho.</li>
</ul></div>
`}};export{e as default};