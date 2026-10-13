var e={id:`ospfv3`,h:{en:`OSPFv3: OSPF for IPv6 on Junos`,hi:`OSPFv3: Junos par IPv6 ke liye OSPF`},body:{en:`
<p>OSPFv3 is the version of OSPF defined for IPv6. It keeps the ideas you already know (areas, LSAs, SPF, DR and BDR, neighbour states) but changes the way information is packaged. The Delhi lab uses IPv6 only, so this chapter follows its three routers: R1 and R2 in area 0.0.0.0 and R3 in area 0.0.0.1 with the research LAN 2001:db8:77::/64.</p>

<h3>What changes compared with OSPFv2</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="OSPFv2 versus OSPFv3">
<rect x="20" y="20" width="280" height="150" rx="10" fill="#bae6fd"/><text x="160" y="44" text-anchor="middle" class="svg-ink" font-size="14">OSPFv2 (IPv4)</text>
<text x="160" y="72" text-anchor="middle" class="svg-muted" font-size="12">per-subnet, address in header</text><text x="160" y="94" text-anchor="middle" class="svg-muted" font-size="12">Router LSA carries prefixes</text><text x="160" y="116" text-anchor="middle" class="svg-muted" font-size="12">Authentication in OSPF header</text><text x="160" y="138" text-anchor="middle" class="svg-muted" font-size="12">protocols ospf</text>
<rect x="340" y="20" width="280" height="150" rx="10" fill="#bbf7d0"/><text x="480" y="44" text-anchor="middle" class="svg-ink" font-size="14">OSPFv3 (IPv6)</text>
<text x="480" y="72" text-anchor="middle" class="svg-muted" font-size="12">per-link, link-local neighbours</text><text x="480" y="94" text-anchor="middle" class="svg-muted" font-size="12">Prefixes moved to new LSAs</text><text x="480" y="116" text-anchor="middle" class="svg-muted" font-size="12">Authentication via IPsec</text><text x="480" y="138" text-anchor="middle" class="svg-muted" font-size="12">protocols ospf3</text>
</svg><p class="cap">Same protocol ideas, different packaging.</p></div>
<ul>
<li><b>Separate instance.</b> OSPFv3 is configured under <code>protocols ospf3</code> and has its own neighbours and database. On a dual-stack network you run OSPFv2 and OSPFv3 side by side.</li>
<li><b>Link-local neighbours.</b> Hello packets use the fe80:: link-local address, so adjacencies do not depend on the global prefix being the same. The interface needs <code>family inet6</code>.</li>
<li><b>Router ID is still 32 bits.</b> On an IPv6-only router you must configure <code>routing-options router-id</code>, because there is no IPv4 address to borrow.</li>
<li><b>Topology and prefixes are separated.</b> Router and Network LSAs carry only topology. Prefixes move to <b>Intra-Area-Prefix</b> LSAs (function code 0x2009), and the <b>Link</b> LSA (0x0008, link-local scope) carries the link-local address and the prefixes of one link.</li>
<li><b>Inter-area LSAs renamed.</b> Type 3 becomes <b>Inter-Area-Prefix</b>, type 4 becomes <b>Inter-Area-Router</b>.</li>
<li><b>Authentication.</b> There is no authentication field in the OSPFv3 header; protection is by IPsec (AH or ESP), configured with a security association.</li>
</ul>

<h3>Configuration walkthrough</h3>
<pre class="code"><span class="c">! R1 and R2: backbone link and loopbacks</span>
set protocols ospf3 area 0.0.0.0 interface ge-0/0/0.0
set protocols ospf3 area 0.0.0.0 interface lo0.0 passive
<span class="c">! R2: second area toward R3</span>
set protocols ospf3 area 0.0.0.1 interface ge-0/0/1.0
<span class="c">! R3: its uplink and loopback in area 0.0.0.1</span>
set protocols ospf3 area 0.0.0.1 interface ge-0/0/0.0
set protocols ospf3 area 0.0.0.1 interface lo0.0 passive</pre>
<p>Addresses on the interfaces are plain IPv6, for example <code>set interfaces ge-0/0/0 unit 0 family inet6 address 2001:db8:3:12::1/64</code>, and the loopbacks carry 2001:db8:3::1/128 and so on.</p>

<h3>Verification</h3>
<pre class="out">lab@R2-DELHI&gt; show ospf3 neighbor
ID               Interface              State     Pri   Dead
10.255.3.1       ge-0/0/0.0             <span class="hl">Full</span>      128     38
  Neighbor-address fe80::5054:cff:fe04:4b01
10.255.3.3       ge-0/0/1.0             Full      128     32
  Neighbor-address fe80::5054:eff:fe04:4e01

lab@R2-DELHI&gt; show ospf3 interface
Interface           State   Area            DR ID           BDR ID          Nbrs
ge-0/0/0.0          DR      0.0.0.0         10.255.3.2      10.255.3.1         1
ge-0/0/1.0          BDR     0.0.0.1         10.255.3.3      10.255.3.2         1
lo0.0               DR      0.0.0.0         0.0.0.0         0.0.0.0            0</pre>
<p>Note the neighbour address: it is a link-local fe80:: address, not the 2001:db8 address. Now the database. These are R2's lines for the LSA families described above:</p>
<pre class="out">lab@R2-DELHI&gt; show ospf3 database
    OSPF3 database, Area 0.0.0.0
 Type       ID               Adv Rtr           Seq         Age  Cksum  Len
Router      0.0.0.0          10.255.3.1       0x80000002    51  0x0ea5  40
Network    *0.0.0.1          10.255.3.2       0x80000001    52  0x7a07  32
<span class="hl">InterArPfx</span> *0.0.0.1          10.255.3.2       0x80000001    50  0x18ee  36
InterArRtr *10.255.3.3       10.255.3.2       0x80000001    50  0xc8da  28
<span class="hl">IntraArPfx</span>  0.0.0.1          10.255.3.1       0x80000002    51  0xab66  52

    OSPF3 AS SCOPE link state database
 Type       ID               Adv Rtr           Seq         Age  Cksum  Len
Extern      0.0.0.1          10.255.3.3       0x80000001    88  0x1221  36

    OSPF3 Link-Local database, interface ge-0/0/0.0 Area 0.0.0.0
 Type       ID               Adv Rtr           Seq         Age  Cksum  Len
<span class="hl">Link</span>        0.0.0.1          10.255.3.1       0x80000001    96  0x32c3  64</pre>

<h3>Exporting an IPv6 route as external type 1</h3>
<p>R3 owns the research LAN. The NOC wants it as external type 1, metric 50 and tag 77. The policy is the same language you learned for IPv4, with an IPv6 route filter, applied under <code>ospf3 export</code>. R1 then sees metric 52: the external metric 50 plus its own cost of 2 to the ASBR R3.</p>
<pre class="out">lab@R1-DELHI&gt; show ospf3 database external detail
Extern      0.0.0.1          10.255.3.3       0x80000001    89  0x1221  36
  Prefix 2001:db8:77::/64
  Prefix-options 0x0, Metric 50, Type 1

lab@R1-DELHI&gt; show route 2001:db8:77::/64
2001:db8:77::/64   *[OSPF3/150] 00:00:51, <span class="hl">metric 52, tag 77</span>
                    &gt;  to fe80::5054:fff:fe04:5001 via ge-0/0/0.0</pre>
<p>The next hop is the link-local address of R2. The preference is 150, the same external preference as OSPFv2. A final proof: <code>ping 2001:db8:77::1 count 3</code> from R1 shows 3 packets received, 0 percent loss.</p>

<div class="eg"><p><b>Worked example.</b> R1 learns 2001:db8:3::3/128 with metric 2. R1 to R2 costs 1 and R2 to R3 costs 1, and a loopback is cost 0, so the total is 2. It is an inter-area route because R3 is in area 0.0.0.1, so R1 learned it from an Inter-Area-Prefix LSA created by the ABR R2.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting the router ID on an IPv6-only router, or enabling <code>ospf3</code> on an interface without <code>family inet6</code>. The router will not form neighbours.</p></div>
<div class="exam"><p><b>Exam trap.</b> OSPFv3 does not carry authentication in its header. Questions about securing OSPFv3 expect IPsec. Also remember that IPv4 and IPv6 are separate OSPF processes, so an OSPFv2 neighbour does not prove an OSPFv3 neighbour.</p></div>

<div class="scn"><h4>The IPv6 campus that had no router ID</h4><p>A new IPv6-only router refused to bring up OSPFv3 neighbours. Hello packets were exchanged, but the commit had produced a warning that no router ID could be chosen. The router had no IPv4 address anywhere. Setting <code>routing-options router-id 10.255.3.2</code> and committing brought the adjacency to Full within seconds.</p><p><b>Lesson:</b> OSPFv3 still needs a 32-bit router ID, and it is your job to provide it when no IPv4 address exists.</p></div>

<div class="iv"><p class="q">"What are the main differences between OSPFv2 and OSPFv3?"</p><p>OSPFv3 runs per link rather than per subnet, uses link-local addresses for neighbours, separates prefixes from topology by using Intra-Area-Prefix and Link LSAs, renames the inter-area LSAs, has no authentication field and relies on IPsec, and is configured as a separate protocol, <code>protocols ospf3</code>. The router ID is still 32 bits.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 is configured under protocols ospf3 and is a separate instance from OSPFv2.</li>
<li>Neighbours use link-local addresses; the interface needs family inet6.</li>
<li>Router IDs are 32 bits; configure one on IPv6-only routers.</li>
<li>Prefixes live in Intra-Area-Prefix and Link LSAs; inter-area LSAs are renamed.</li>
<li>Authentication uses IPsec; export policy language is the same as for OSPFv2.</li>
</ul></div>
`,hi:`
<p>OSPFv3 OSPF ka woh version hai jo IPv6 ke liye define hua. Yeh un ideas ko rakhta hai jo aap jaante ho (areas, LSAs, SPF, DR aur BDR, neighbour states) par information ko package karne ka tareeka badal deta hai. Delhi lab sirf IPv6 use karta hai, isliye yeh chapter uske teen routers follow karta hai: R1 aur R2 area 0.0.0.0 mein aur R3 area 0.0.0.1 mein research LAN 2001:db8:77::/64 ke saath.</p>

<h3>OSPFv2 ke mukable kya badalta hai</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="OSPFv2 versus OSPFv3">
<rect x="20" y="20" width="280" height="150" rx="10" fill="#bae6fd"/><text x="160" y="44" text-anchor="middle" class="svg-ink" font-size="14">OSPFv2 (IPv4)</text>
<text x="160" y="72" text-anchor="middle" class="svg-muted" font-size="12">per-subnet, header mein address</text><text x="160" y="94" text-anchor="middle" class="svg-muted" font-size="12">Router LSA prefixes carry karta hai</text><text x="160" y="116" text-anchor="middle" class="svg-muted" font-size="12">Authentication OSPF header mein</text><text x="160" y="138" text-anchor="middle" class="svg-muted" font-size="12">protocols ospf</text>
<rect x="340" y="20" width="280" height="150" rx="10" fill="#bbf7d0"/><text x="480" y="44" text-anchor="middle" class="svg-ink" font-size="14">OSPFv3 (IPv6)</text>
<text x="480" y="72" text-anchor="middle" class="svg-muted" font-size="12">per-link, link-local neighbours</text><text x="480" y="94" text-anchor="middle" class="svg-muted" font-size="12">Prefixes naye LSAs mein gaye</text><text x="480" y="116" text-anchor="middle" class="svg-muted" font-size="12">Authentication IPsec se</text><text x="480" y="138" text-anchor="middle" class="svg-muted" font-size="12">protocols ospf3</text>
</svg><p class="cap">Protocol ke ideas same, packaging alag.</p></div>
<ul>
<li><b>Alag instance.</b> OSPFv3 <code>protocols ospf3</code> ke neeche configure hota hai aur uske apne neighbours aur database hain. Dual-stack network par OSPFv2 aur OSPFv3 saath-saath chalte hain.</li>
<li><b>Link-local neighbours.</b> Hello packets fe80:: link-local address use karte hain, isliye adjacency global prefix same hone par depend nahi karti. Interface par <code>family inet6</code> chahiye.</li>
<li><b>Router ID ab bhi 32 bits.</b> IPv6-only router par <code>routing-options router-id</code> configure karna padta hai, kyunki udhaar lene ke liye IPv4 address nahi hota.</li>
<li><b>Topology aur prefixes alag.</b> Router aur Network LSAs sirf topology carry karte hain. Prefixes <b>Intra-Area-Prefix</b> LSAs (function code 0x2009) mein jaate hain, aur <b>Link</b> LSA (0x0008, link-local scope) ek link ka link-local address aur prefixes carry karta hai.</li>
<li><b>Inter-area LSAs ke naam badle.</b> Type 3 <b>Inter-Area-Prefix</b> aur type 4 <b>Inter-Area-Router</b> ban gaya.</li>
<li><b>Authentication.</b> OSPFv3 header mein authentication field nahi hai; protection IPsec (AH ya ESP) se hoti hai, security association ke saath.</li>
</ul>

<h3>Configuration walkthrough</h3>
<pre class="code"><span class="c">! R1 aur R2: backbone link aur loopbacks</span>
set protocols ospf3 area 0.0.0.0 interface ge-0/0/0.0
set protocols ospf3 area 0.0.0.0 interface lo0.0 passive
<span class="c">! R2: R3 ki taraf doosra area</span>
set protocols ospf3 area 0.0.0.1 interface ge-0/0/1.0
<span class="c">! R3: uska uplink aur loopback area 0.0.0.1 mein</span>
set protocols ospf3 area 0.0.0.1 interface ge-0/0/0.0
set protocols ospf3 area 0.0.0.1 interface lo0.0 passive</pre>
<p>Interfaces ke addresses seedhe IPv6 hain, jaise <code>set interfaces ge-0/0/0 unit 0 family inet6 address 2001:db8:3:12::1/64</code>, aur loopbacks 2001:db8:3::1/128 waghera carry karte hain.</p>

<h3>Verification</h3>
<pre class="out">lab@R2-DELHI&gt; show ospf3 neighbor
ID               Interface              State     Pri   Dead
10.255.3.1       ge-0/0/0.0             <span class="hl">Full</span>      128     38
  Neighbor-address fe80::5054:cff:fe04:4b01
10.255.3.3       ge-0/0/1.0             Full      128     32
  Neighbor-address fe80::5054:eff:fe04:4e01

lab@R2-DELHI&gt; show ospf3 interface
Interface           State   Area            DR ID           BDR ID          Nbrs
ge-0/0/0.0          DR      0.0.0.0         10.255.3.2      10.255.3.1         1
ge-0/0/1.0          BDR     0.0.0.1         10.255.3.3      10.255.3.2         1
lo0.0               DR      0.0.0.0         0.0.0.0         0.0.0.0            0</pre>
<p>Neighbour address dekho: yeh link-local fe80:: address hai, 2001:db8 wala nahi. Ab database. Upar bataye LSA families ke liye yeh R2 ki lines hain:</p>
<pre class="out">lab@R2-DELHI&gt; show ospf3 database
    OSPF3 database, Area 0.0.0.0
 Type       ID               Adv Rtr           Seq         Age  Cksum  Len
Router      0.0.0.0          10.255.3.1       0x80000002    51  0x0ea5  40
Network    *0.0.0.1          10.255.3.2       0x80000001    52  0x7a07  32
<span class="hl">InterArPfx</span> *0.0.0.1          10.255.3.2       0x80000001    50  0x18ee  36
InterArRtr *10.255.3.3       10.255.3.2       0x80000001    50  0xc8da  28
<span class="hl">IntraArPfx</span>  0.0.0.1          10.255.3.1       0x80000002    51  0xab66  52

    OSPF3 AS SCOPE link state database
 Type       ID               Adv Rtr           Seq         Age  Cksum  Len
Extern      0.0.0.1          10.255.3.3       0x80000001    88  0x1221  36

    OSPF3 Link-Local database, interface ge-0/0/0.0 Area 0.0.0.0
 Type       ID               Adv Rtr           Seq         Age  Cksum  Len
<span class="hl">Link</span>        0.0.0.1          10.255.3.1       0x80000001    96  0x32c3  64</pre>

<h3>IPv6 route ko external type 1 ke roop mein export karna</h3>
<p>R3 research LAN ka owner hai. NOC use external type 1, metric 50 aur tag 77 ke saath chahta hai. Policy wahi language hai jo aapne IPv4 ke liye seekhi, IPv6 route filter ke saath, <code>ospf3 export</code> ke neeche lagayi. R1 phir metric 52 dekhta hai: external metric 50 plus ASBR R3 tak apna cost 2.</p>
<pre class="out">lab@R1-DELHI&gt; show ospf3 database external detail
Extern      0.0.0.1          10.255.3.3       0x80000001    89  0x1221  36
  Prefix 2001:db8:77::/64
  Prefix-options 0x0, Metric 50, Type 1

lab@R1-DELHI&gt; show route 2001:db8:77::/64
2001:db8:77::/64   *[OSPF3/150] 00:00:51, <span class="hl">metric 52, tag 77</span>
                    &gt;  to fe80::5054:fff:fe04:5001 via ge-0/0/0.0</pre>
<p>Next hop R2 ka link-local address hai. Preference 150 hai, OSPFv2 ki external preference jaisi hi. Aakhri saboot: R1 se <code>ping 2001:db8:77::1 count 3</code> 3 packets received, 0 percent loss dikhata hai.</p>

<div class="eg"><p><b>Worked example.</b> R1 2001:db8:3::3/128 ko metric 2 ke saath seekhta hai. R1 se R2 cost 1 aur R2 se R3 cost 1, loopback cost 0, to total 2. Yeh inter-area route hai kyunki R3 area 0.0.0.1 mein hai, isliye R1 ne ise ABR R2 ke banaye Inter-Area-Prefix LSA se seekha.</p></div>

<div class="warn"><p><b>Common mistake.</b> IPv6-only router par router ID bhool jaana, ya interface par <code>family inet6</code> ke bina <code>ospf3</code> enable karna. Router neighbours nahi banayega.</p></div>
<div class="exam"><p><b>Exam trap.</b> OSPFv3 apne header mein authentication carry nahi karta. OSPFv3 secure karne ke sawal IPsec expect karte hain. Yeh bhi yaad rakho ki IPv4 aur IPv6 alag OSPF processes hain, isliye OSPFv2 neighbour OSPFv3 neighbour saabit nahi karta.</p></div>

<div class="scn"><h4>IPv6 campus jiska router ID nahi tha</h4><p>Naya IPv6-only router OSPFv3 neighbours up nahi kar raha tha. Hello packets exchange ho rahe the, par commit ne warning di thi ki router ID choose nahi ho sakta. Router ke paas kahin bhi IPv4 address nahi tha. <code>routing-options router-id 10.255.3.2</code> set karke commit karne se adjacency kuch seconds mein Full ho gayi.</p><p><b>Lesson:</b> OSPFv3 ko ab bhi 32-bit router ID chahiye, aur IPv4 address na ho to dena aapka kaam hai.</p></div>

<div class="iv"><p class="q">"OSPFv2 aur OSPFv3 mein main differences kya hain?"</p><p>OSPFv3 per subnet nahi balki per link chalta hai, neighbours ke liye link-local addresses use karta hai, prefixes ko topology se Intra-Area-Prefix aur Link LSAs se alag karta hai, inter-area LSAs ke naam badalta hai, authentication field nahi rakhta aur IPsec par depend karta hai, aur alag protocol <code>protocols ospf3</code> ke roop mein configure hota hai. Router ID ab bhi 32 bits hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 protocols ospf3 ke neeche configure hota hai aur OSPFv2 se alag instance hai.</li>
<li>Neighbours link-local addresses use karte hain; interface par family inet6 chahiye.</li>
<li>Router IDs 32 bits hain; IPv6-only routers par ek configure karo.</li>
<li>Prefixes Intra-Area-Prefix aur Link LSAs mein rehte hain; inter-area LSAs ke naam badle.</li>
<li>Authentication IPsec se hoti hai; export policy language OSPFv2 jaisi hi hai.</li>
</ul></div>
`}};export{e as default};