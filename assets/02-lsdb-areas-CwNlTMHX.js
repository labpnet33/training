var e={id:`lsdb-areas`,h:{en:`Reading the OSPF database: LSA types, scope and path types`,hi:`OSPF database padhna: LSA types, scope aur path types`},body:{en:`
<p>When an OSPF route behaves strangely, the routing table only shows you the result. The <b>link-state database (LSDB)</b> shows you what every router actually announced. Professional engineers read the database first. This chapter gives you the vocabulary and the commands.</p>

<h3>The LSA types and where they travel</h3>
<p>Each router describes itself in a <b>link-state advertisement (LSA)</b>. Different LSA types carry different information, and each type has a <b>flooding scope</b>: area, whole AS, or one link.</p>
<table class="cmp"><tr><th>Type</th><th>Junos name</th><th>Created by</th><th>Scope</th><th>Carries</th></tr>
<tr><td>1</td><td>Router</td><td>Every router</td><td>Area</td><td>Its links and their cost</td></tr>
<tr><td>2</td><td>Network</td><td>DR</td><td>Area</td><td>Routers on a broadcast segment</td></tr>
<tr><td>3</td><td>Summary (netsummary)</td><td>ABR</td><td>Area</td><td>An inter-area prefix and cost</td></tr>
<tr><td>4</td><td>ASBRSummary</td><td>ABR</td><td>Area</td><td>How to reach an ASBR</td></tr>
<tr><td>5</td><td>Extern</td><td>ASBR</td><td>Whole AS</td><td>A route from outside OSPF</td></tr>
<tr><td>7</td><td>NSSA</td><td>ASBR in an NSSA</td><td>NSSA only</td><td>External route inside an NSSA</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="LSA flooding scope">
<rect x="20" y="30" width="190" height="150" rx="12" fill="#bae6fd"/><text x="115" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 0.0.0.1</text><text x="115" y="95" text-anchor="middle" class="svg-muted" font-size="12">Type 1 Router</text><text x="115" y="115" text-anchor="middle" class="svg-muted" font-size="12">Type 2 Network</text>
<rect x="225" y="30" width="190" height="150" rx="12" fill="#bbf7d0"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 0.0.0.0</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">Type 1, 2 stay here</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">Types 3, 4 re-originated</text>
<rect x="430" y="30" width="190" height="150" rx="12" fill="#ddd6fe"/><text x="525" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 0.0.0.2</text><text x="525" y="95" text-anchor="middle" class="svg-muted" font-size="12">Type 1, 2 own area</text><text x="525" y="115" text-anchor="middle" class="svg-muted" font-size="12">Type 5 from anywhere</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">Type 5 floods through the whole AS (except stub areas).</text>
</svg><p class="cap">Types 1 and 2 never leave their area. ABRs turn them into type 3 summaries.</p></div>

<h3>Reading the database</h3>
<p>The first column of <code>show ospf database</code> is the type, then the LSA ID, the advertising router, a sequence number (higher means newer), the age in seconds and a checksum. An asterisk marks LSAs the local router originated. Here is the database of R2, the ABR of the Hubli lab, after the virtual link works:</p>
<pre class="out">lab@R2-HO&gt; show ospf database
    OSPF database, Area 0.0.0.0
 Type       ID               Adv Rtr           Seq      Age  Opt  Cksum  Len
Router   10.255.5.1       10.255.5.1       0x80000001   101  0x22 0xf4ea  60
Router  <span class="hl">*10.255.5.2</span>       10.255.5.2       0x80000002    34  0x22 0x1055  60
Router   10.255.5.3       10.255.5.3       0x80000001    34  0x22 0x5e3b  36
Network *10.5.12.2        10.255.5.2       0x80000001   101  0x22 0x9969  32
<span class="hl">Summary</span> *10.5.23.0        10.255.5.2       0x80000001   101  0x22 0xfe6b  28
Summary  10.5.34.0        10.255.5.3       0x80000001    34  0x22 0x9afd  28
Summary  172.16.5.0       10.255.5.3       0x80000001    34  0x22 0x6199  28</pre>
<p>Notice that router 10.255.5.3 appears in area 0 although it has no interface there: the virtual link makes it part of the backbone. Notice also that the Summary for 172.16.5.0 was created by 10.255.5.3, the ABR next to that area.</p>

<h3>Looking inside one LSA</h3>
<p>Use <code>extensive</code> or <code>detail</code> to see the content. A Router LSA lists its links by type: Transit, Stub, PtToPt or Virtual. The Virtual link type is the proof that a virtual link is part of the topology:</p>
<pre class="out">lab@R3-DHARWAD&gt; show ospf database extensive
Router  *10.255.5.3       10.255.5.3       0x80000001    39  0x22 0x5e3b  36
  bits 0x1, link count 1
  id 10.255.5.2, data 10.5.23.2, Type <span class="hl">Virtual (4)</span>
    Topology count: 0, Default metric: 1</pre>
<p>The <b>bits</b> field shows the router role: 0x1 means this router is an ABR (the B bit). A value of 0x2 marks an ASBR (E bit), and 0x3 would be both.</p>

<h3>Path types in the routing table</h3>
<p>OSPF classifies every route it calculates. <code>show ospf route</code> shows the <b>path type</b>:</p>
<pre class="out">lab@R1-HO&gt; show ospf route
Prefix             Path  Route      NH       Metric NextHop       Nexthop
                   Type  Type       Type            Interface     Address/LSP
10.255.5.2         Intra Area BR    IP            1 ge-0/0/0.0    10.5.12.2
10.5.12.0/30       Intra Network    IP            1 ge-0/0/0.0
10.5.23.0/30       <span class="hl">Inter</span> Network    IP            2 ge-0/0/0.0    10.5.12.2
172.16.5.0/24      Inter Network    IP            4 ge-0/0/0.0    10.5.12.2</pre>
<p>The order of preference between path types is: <b>intra-area, inter-area, external type 1, external type 2</b>, regardless of metric. An intra-area path with a bad metric still beats an inter-area path with a good one.</p>

<div class="eg"><p><b>Worked example.</b> R1 reaches 172.16.5.0/24 with metric 4. Break it down: the ABR R3 sits next to the Hubli area. R3 to R4 costs 1 and the R4 LAN stub costs 1, so R3 originates a Summary LSA for 172.16.5.0 with metric 2. R1 does not see those links. It adds its own cost to reach R3: R1 to R2 costs 1 and the virtual link R2 to R3 costs 1, so 2 plus 2 gives the displayed metric 4. The details of the area behind the ABR stay hidden.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading the Adv Rtr column as the next hop. It is the router that created the LSA, which may be several hops away.</p></div>
<div class="exam"><p><b>Exam trap.</b> Type 3 LSAs are not "routes learned from area 0". They are re-originated by each ABR with the ABR as advertising router, which is why a router cannot see the real path across areas. That is also why OSPF inter-area behaves like distance-vector.</p></div>

<div class="scn"><h4>A route that was there yesterday</h4><p>A service prefix disappeared from branch routers overnight. In the routing table nothing was left to examine. The database on the ABR still had the Summary LSA, but the sequence number had stopped moving and its age was growing: the originating router in the other area was down and its LSAs were aging out. The fault was a power failure at that site, found by reading ages and sequence numbers.</p><p><b>Lesson:</b> the database reveals time, a router that is gone, and who originated what.</p></div>

<div class="iv"><p class="q">"What is the difference between a type 3 and a type 5 LSA?"</p><p>A type 3 summary is created by an ABR and describes an inter-area prefix inside one area; it is re-originated at every border. A type 5 describes a route from outside OSPF, is created by an ASBR and floods the whole AS unchanged, except into stub areas. Add that type 4 helps routers find the ASBR.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Types 1 and 2 stay in the area; ABRs create type 3 and 4; ASBRs create type 5 or 7.</li>
<li>Higher sequence number means newer; an asterisk means locally originated.</li>
<li>The bits field shows ABR and ASBR roles; Virtual links appear as link type 4.</li>
<li>Path type preference: intra, inter, external 1, external 2.</li>
<li>Read the database before the routing table when behaviour is odd.</li>
</ul></div>
`,hi:`
<p>OSPF route ajeeb behave kare to routing table sirf result dikhata hai. <b>Link-state database (LSDB)</b> dikhata hai ki har router ne asal mein kya announce kiya. Professional engineers pehle database padhte hain. Yeh chapter aapko vocabulary aur commands deta hai.</p>

<h3>LSA types aur woh kahan jaate hain</h3>
<p>Har router apne aap ko <b>link-state advertisement (LSA)</b> mein describe karta hai. Alag LSA types alag information carry karte hain, aur har type ka ek <b>flooding scope</b> hota hai: area, poora AS, ya ek link.</p>
<table class="cmp"><tr><th>Type</th><th>Junos name</th><th>Kaun banata hai</th><th>Scope</th><th>Kya carry karta hai</th></tr>
<tr><td>1</td><td>Router</td><td>Har router</td><td>Area</td><td>Uske links aur cost</td></tr>
<tr><td>2</td><td>Network</td><td>DR</td><td>Area</td><td>Broadcast segment ke routers</td></tr>
<tr><td>3</td><td>Summary (netsummary)</td><td>ABR</td><td>Area</td><td>Inter-area prefix aur cost</td></tr>
<tr><td>4</td><td>ASBRSummary</td><td>ABR</td><td>Area</td><td>ASBR tak kaise pahunchein</td></tr>
<tr><td>5</td><td>Extern</td><td>ASBR</td><td>Poora AS</td><td>OSPF ke bahar ka route</td></tr>
<tr><td>7</td><td>NSSA</td><td>NSSA ka ASBR</td><td>Sirf NSSA</td><td>NSSA ke andar external route</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="LSA flooding scope">
<rect x="20" y="30" width="190" height="150" rx="12" fill="#bae6fd"/><text x="115" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 0.0.0.1</text><text x="115" y="95" text-anchor="middle" class="svg-muted" font-size="12">Type 1 Router</text><text x="115" y="115" text-anchor="middle" class="svg-muted" font-size="12">Type 2 Network</text>
<rect x="225" y="30" width="190" height="150" rx="12" fill="#bbf7d0"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 0.0.0.0</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">Type 1, 2 yahin rehte hain</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">Types 3, 4 re-originate</text>
<rect x="430" y="30" width="190" height="150" rx="12" fill="#ddd6fe"/><text x="525" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 0.0.0.2</text><text x="525" y="95" text-anchor="middle" class="svg-muted" font-size="12">Type 1, 2 apna area</text><text x="525" y="115" text-anchor="middle" class="svg-muted" font-size="12">Type 5 kahin se bhi</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">Type 5 poore AS mein flood hota hai (stub areas ko chhodkar).</text>
</svg><p class="cap">Types 1 aur 2 apna area kabhi nahi chhodte. ABRs unhe type 3 summaries mein badalte hain.</p></div>

<h3>Database padhna</h3>
<p><code>show ospf database</code> ka pehla column type hai, phir LSA ID, advertising router, sequence number (bada matlab naya), seconds mein age aur checksum. Asterisk un LSAs ko mark karta hai jo local router ne originate kiye. Yeh Hubli lab ke ABR R2 ka database hai, virtual link chalne ke baad:</p>
<pre class="out">lab@R2-HO&gt; show ospf database
    OSPF database, Area 0.0.0.0
 Type       ID               Adv Rtr           Seq      Age  Opt  Cksum  Len
Router   10.255.5.1       10.255.5.1       0x80000001   101  0x22 0xf4ea  60
Router  <span class="hl">*10.255.5.2</span>       10.255.5.2       0x80000002    34  0x22 0x1055  60
Router   10.255.5.3       10.255.5.3       0x80000001    34  0x22 0x5e3b  36
Network *10.5.12.2        10.255.5.2       0x80000001   101  0x22 0x9969  32
<span class="hl">Summary</span> *10.5.23.0        10.255.5.2       0x80000001   101  0x22 0xfe6b  28
Summary  10.5.34.0        10.255.5.3       0x80000001    34  0x22 0x9afd  28
Summary  172.16.5.0       10.255.5.3       0x80000001    34  0x22 0x6199  28</pre>
<p>Dekho ki router 10.255.5.3 area 0 mein dikhta hai jabki uska wahan koi interface nahi: virtual link use backbone ka hissa bana deta hai. Yeh bhi dekho ki 172.16.5.0 ka Summary 10.255.5.3 ne banaya, jo us area ke paas wala ABR hai.</p>

<h3>Ek LSA ke andar dekhna</h3>
<p>Content dekhne ke liye <code>extensive</code> ya <code>detail</code> use karo. Router LSA apne links type ke hisaab se list karta hai: Transit, Stub, PtToPt ya Virtual. Virtual link type saabit karta hai ki virtual link topology ka hissa hai:</p>
<pre class="out">lab@R3-DHARWAD&gt; show ospf database extensive
Router  *10.255.5.3       10.255.5.3       0x80000001    39  0x22 0x5e3b  36
  bits 0x1, link count 1
  id 10.255.5.2, data 10.5.23.2, Type <span class="hl">Virtual (4)</span>
    Topology count: 0, Default metric: 1</pre>
<p><b>bits</b> field router ka role dikhata hai: 0x1 matlab yeh router ABR hai (B bit). 0x2 ASBR (E bit) mark karta hai, aur 0x3 dono.</p>

<h3>Routing table mein path types</h3>
<p>OSPF har calculate kiye route ko classify karta hai. <code>show ospf route</code> <b>path type</b> dikhata hai:</p>
<pre class="out">lab@R1-HO&gt; show ospf route
Prefix             Path  Route      NH       Metric NextHop       Nexthop
                   Type  Type       Type            Interface     Address/LSP
10.255.5.2         Intra Area BR    IP            1 ge-0/0/0.0    10.5.12.2
10.5.12.0/30       Intra Network    IP            1 ge-0/0/0.0
10.5.23.0/30       <span class="hl">Inter</span> Network    IP            2 ge-0/0/0.0    10.5.12.2
172.16.5.0/24      Inter Network    IP            4 ge-0/0/0.0    10.5.12.2</pre>
<p>Path types ke beech preference ka order hai: <b>intra-area, inter-area, external type 1, external type 2</b>, metric chahe kuch bhi ho. Kharab metric wala intra-area path achhe metric wale inter-area path ko haraata hai.</p>

<div class="eg"><p><b>Worked example.</b> R1 172.16.5.0/24 ko metric 4 ke saath reach karta hai. Tod ke dekho: ABR R3 Hubli area ke paas hai. R3 se R4 cost 1 aur R4 LAN stub cost 1, isliye R3 172.16.5.0 ke liye metric 2 ka Summary LSA originate karta hai. R1 ko woh links nahi dikhte. Woh R3 tak apna cost jodta hai: R1 se R2 cost 1 aur virtual link R2 se R3 cost 1, yaani 2 plus 2 dikhne wala metric 4 deta hai. ABR ke peeche ke area ki details chhupi rehti hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adv Rtr column ko next hop samajhna. Yeh woh router hai jisne LSA banaya, jo kai hops door ho sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Type 3 LSAs "area 0 se seekhe routes" nahi hain. Har ABR unhe ABR ko advertising router banakar re-originate karta hai, isliye router areas ke paar asli path nahi dekh sakta. Isi wajah se OSPF inter-area distance-vector jaisa behave karta hai.</p></div>

<div class="scn"><h4>Route jo kal tha</h4><p>Raat bhar mein branch routers se ek service prefix gayab ho gaya. Routing table mein dekhne ko kuch nahi bacha. ABR ke database mein Summary LSA ab bhi tha, par sequence number ruk gaya tha aur age badh rahi thi: doosre area ka originating router down tha aur uske LSAs age out ho rahe the. Fault us site par power failure tha, jo ages aur sequence numbers padhkar mila.</p><p><b>Lesson:</b> database samay, gayab hua router aur kisne kya originate kiya yeh sab batata hai.</p></div>

<div class="iv"><p class="q">"Type 3 aur type 5 LSA mein kya difference hai?"</p><p>Type 3 summary ABR banata hai aur ek area ke andar inter-area prefix describe karta hai; har border par re-originate hota hai. Type 5 OSPF ke bahar ka route describe karta hai, ASBR banata hai aur poore AS mein unchanged flood hota hai, stub areas ko chhodkar. Jodo ki type 4 routers ko ASBR dhoondhne mein madad karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Types 1 aur 2 area mein rehte hain; ABRs type 3 aur 4 banate hain; ASBRs type 5 ya 7.</li>
<li>Bada sequence number matlab naya; asterisk matlab locally originated.</li>
<li>bits field ABR aur ASBR roles dikhata hai; Virtual links link type 4 ke roop mein dikhte hain.</li>
<li>Path type preference: intra, inter, external 1, external 2.</li>
<li>Behaviour ajeeb ho to routing table se pehle database padho.</li>
</ul></div>
`}};export{e as default};