var e={id:`overview`,h:{en:`OSPF on Junos: what you will learn and the big picture`,hi:`Junos par OSPF: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will go from the idea of a link-state protocol to running a multi-area OSPF network on Junos and fixing it when it breaks. The nine chapters cover: the link-state database and every LSA type, router roles and the DR/BDR election, how an adjacency forms and where it gets stuck, multi-area design with summarisation, stub, totally stubby and NSSA areas, external routes and metrics, and a troubleshooting workflow. The same material is tested in the Juniper intermediate routing exams, so the chapters end with exam traps and interview tips.</p>
<p><b>Prerequisites.</b> You should be comfortable with the Junos CLI (candidate configuration, <code>commit</code>, <code>show | compare</code>) and with the OSPF basics from the JNCIA module: what a neighbour is, what area 0 is, and how to enable OSPF on an interface. We refresh these quickly and then go deeper. If a term looks new, the chapter defines it the first time it appears.</p>

<h3>Analogy: every router owns the same city map</h3>
<p>Imagine a courier company where every depot keeps an identical paper map of the whole city. When a road closes, the depot nearest to it writes a short notice, numbers it, and hands copies to its neighbours, who pass it on. Every depot then redraws its own routes from the same map. Nobody asks a neighbour "how far is the airport?" - each depot calculates it alone. That is a <b>link-state</b> protocol. The map is the <b>link-state database (LSDB)</b>, the notices are <b>LSAs</b> (link-state advertisements), and the redrawing is the <b>SPF</b> (shortest path first) calculation.</p>
<p>A very large city is hard to keep on one map, so the company splits it into <b>districts</b> (areas). Each district keeps a detailed map of itself and only a summary of the others. A central district, <b>area 0</b>, joins all of them.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="OSPF areas around the backbone">
<rect x="230" y="70" width="180" height="90" rx="12" fill="#bae6fd"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="14">Area 0.0.0.0</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">backbone</text>
<rect x="20" y="70" width="150" height="90" rx="12" fill="#bbf7d0"/><text x="95" y="105" text-anchor="middle" class="svg-ink" font-size="14">Area 0.0.0.10</text><text x="95" y="125" text-anchor="middle" class="svg-muted" font-size="12">Agra region</text>
<rect x="470" y="70" width="150" height="90" rx="12" fill="#ddd6fe"/><text x="545" y="105" text-anchor="middle" class="svg-ink" font-size="14">Area 0.0.0.20</text><text x="545" y="125" text-anchor="middle" class="svg-muted" font-size="12">Jaipur region</text>
<line x1="170" y1="115" x2="230" y2="115" stroke="#64748b" stroke-width="2"/><text x="200" y="105" text-anchor="middle" class="svg-accent" font-size="12">ABR</text>
<line x1="410" y1="115" x2="470" y2="115" stroke="#64748b" stroke-width="2"/><text x="440" y="105" text-anchor="middle" class="svg-accent" font-size="12">ABR</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Every non-backbone area connects to area 0 through an area border router</text>
</svg><p class="cap">Areas keep the LSDB small; area 0 joins them.</p></div>

<h3>OSPF in five facts</h3>
<ul>
<li>OSPF runs <b>directly on IP</b> (protocol number 89), not on TCP or UDP. Hellos go to the multicast address 224.0.0.5 (AllSPFRouters); the DR uses 224.0.0.6 (AllDRouters).</li>
<li>Every router has a <b>router ID</b>, a 32-bit number written like an IPv4 address. On Junos set it yourself with <code>set routing-options router-id 10.255.0.1</code>.</li>
<li>Neighbours become <b>adjacent</b> by exchanging their databases. Routers inside one area end up with identical LSDBs.</li>
<li>The best path is the lowest total <b>cost</b> (metric) found by SPF. Junos derives the cost from the interface bandwidth and a <b>reference bandwidth</b>.</li>
<li>Junos gives OSPF <b>preference 10</b> for internal routes and <b>150</b> for external routes. A lower preference wins against other protocols.</li>
</ul>

<h3>The lab network for this module</h3>
<p>Throughout the module we use the same simulator labs. In the first, four routers form two regions: R1 (Agra) behind ABR R2, and R4 (Jaipur) behind ABR R3, with area 0 on the R2-R3 link, loopbacks 10.255.0.x/32 and LANs 172.20.1.0/24 and 172.20.2.0/24. The second lab adds an ASBR and stub/NSSA areas (R1 exports 198.51.100.0/24, R4 injects 203.0.113.0/24). The third is a troubleshooting lab on a shared LAN. We will show real output from them.</p>
<pre class="code"><span class="c">! minimum OSPF on Junos</span>
set routing-options router-id 10.255.0.2
set protocols ospf area 0.0.0.10 interface ge-0/0/0.0
set protocols ospf area 0.0.0.10 interface lo0.0 passive</pre>
<pre class="out">lab@R2-AGRA&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.10.12.1       ge-0/0/0.0             <span class="hl">Full</span>            10.255.0.1       128    32
10.0.23.2        ge-0/0/1.0             <span class="hl">Full</span>            10.255.0.3       128    36</pre>
<p>Note that on Junos an interface can be listed with no extra statement: there is no <code>network</code> command. You name the interfaces, and the interface address is advertised. The <code>passive</code> keyword advertises the prefix but sends no hellos, which is exactly what you want on loopbacks and user LANs.</p>

<div class="eg"><p><b>Worked example.</b> R1 has ge-0/0/1 (172.20.1.0/24) and ge-0/0/2 (172.20.2.0/24) for office users. You do not want routers on those LANs forming neighbours, so you list both interfaces under area 0.0.0.10 as <code>passive</code>. R2 then learns both /24 prefixes through R1's router LSA, while no hello is ever sent to the users.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Forgetting <code>passive</code> on loopbacks and edge LANs, or leaving the loopback out of OSPF so the router ID address is never reachable by the rest of the network. Another one: leaving the router ID unset, so a later interface change silently changes the router ID.</p></div>
<div class="exam"><p><b>Exam trap.</b> The area ID is a 32-bit number and Junos shows it in dotted form (0.0.0.0, 0.0.0.10) even if you type a plain number. OSPF uses protocol 89, not a TCP port. Internal preference is 10, external is 150.</p></div>

<div class="scn"><h4>The loopback nobody advertised</h4><p>A new core router came up with all neighbours Full, yet monitoring could not ping its management loopback from the NOC. The engineer compared <code>show ospf interface</code> with the interface list and found lo0.0 was missing from OSPF. After <code>set protocols ospf area 0.0.0.0 interface lo0.0 passive</code> and a commit, the /32 appeared in every neighbour's table within seconds.</p><p><b>Lesson:</b> a healthy adjacency does not prove every prefix is advertised. Always check the routes the neighbour should have learned.</p></div>

<div class="iv"><p class="q">"Why do OSPF routers in one area have the same database, and why do we need areas at all?"</p><p>Each router floods its own LSAs and every router stores all LSAs of the area, so the databases are identical and each router can run SPF alone. In a large network the database, the SPF load and the flooding would grow with every link, so we split it into areas. Inside an area detail is kept; between areas only summaries travel through the backbone, area 0.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF is a link-state protocol: flood LSAs, build an identical LSDB, run SPF.</li>
<li>Areas limit the size of the LSDB; area 0 joins all other areas.</li>
<li>OSPF runs over IP protocol 89 with hellos to 224.0.0.5.</li>
<li>On Junos you list interfaces under an area; <code>passive</code> advertises without hellos.</li>
<li>Internal routes have preference 10, external routes 150.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap link-state protocol ke idea se shuru karke Junos par multi-area OSPF network chalana aur tootne par theek karna seekhoge. Nau chapters ye cover karte hain: link-state database aur har LSA type, router roles aur DR/BDR election, adjacency kaise banti hai aur kahan atakti hai, summarisation ke saath multi-area design, stub, totally stubby aur NSSA areas, external routes aur metrics, aur ek troubleshooting workflow. Yahi material Juniper ke intermediate routing exams mein poochha jaata hai, isliye chapters exam traps aur interview tips ke saath khatam hote hain.</p>
<p><b>Prerequisites.</b> Aapko Junos CLI (candidate configuration, <code>commit</code>, <code>show | compare</code>) aur JNCIA module ke OSPF basics se comfortable hona chahiye: neighbour kya hota hai, area 0 kya hai, aur interface par OSPF kaise enable karte hain. Hum inhe jaldi refresh karke phir gehrai mein jaayenge. Koi term naya lage to chapter use pehli baar aate hi define karta hai.</p>

<h3>Analogy: har router ke paas same city ka map hai</h3>
<p>Socho ek courier company hai jahan har depot ke paas poore sheher ka ek jaisa paper map hai. Jab koi road band hoti hai, us ke sabse paas wala depot ek chhota notice likhta hai, number lagata hai, aur apne padosiyon ko copies deta hai, jo aage pass karte hain. Phir har depot usi map se apne routes dobara banata hai. Koi padosi se nahi poochta "airport kitna door hai?" - har depot khud calculate karta hai. Yahi <b>link-state</b> protocol hai. Map <b>link-state database (LSDB)</b> hai, notices <b>LSAs</b> (link-state advertisements) hain, aur routes dobara banana <b>SPF</b> (shortest path first) calculation hai.</p>
<p>Bahut bade sheher ko ek map par rakhna mushkil hai, isliye company use <b>districts</b> (areas) mein baant deti hai. Har district apna detailed map rakhta hai aur baaki ka sirf summary. Beech ka district, <b>area 0</b>, sabko jodta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Backbone ke aas-paas OSPF areas">
<rect x="230" y="70" width="180" height="90" rx="12" fill="#bae6fd"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="14">Area 0.0.0.0</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">backbone</text>
<rect x="20" y="70" width="150" height="90" rx="12" fill="#bbf7d0"/><text x="95" y="105" text-anchor="middle" class="svg-ink" font-size="14">Area 0.0.0.10</text><text x="95" y="125" text-anchor="middle" class="svg-muted" font-size="12">Agra region</text>
<rect x="470" y="70" width="150" height="90" rx="12" fill="#ddd6fe"/><text x="545" y="105" text-anchor="middle" class="svg-ink" font-size="14">Area 0.0.0.20</text><text x="545" y="125" text-anchor="middle" class="svg-muted" font-size="12">Jaipur region</text>
<line x1="170" y1="115" x2="230" y2="115" stroke="#64748b" stroke-width="2"/><text x="200" y="105" text-anchor="middle" class="svg-accent" font-size="12">ABR</text>
<line x1="410" y1="115" x2="470" y2="115" stroke="#64748b" stroke-width="2"/><text x="440" y="105" text-anchor="middle" class="svg-accent" font-size="12">ABR</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Har non-backbone area, area border router ke through area 0 se judta hai</text>
</svg><p class="cap">Areas LSDB ko chhota rakhte hain; area 0 unhe jodta hai.</p></div>

<h3>Paanch facts mein OSPF</h3>
<ul>
<li>OSPF <b>seedha IP par</b> chalta hai (protocol number 89), TCP ya UDP par nahi. Hellos multicast address 224.0.0.5 (AllSPFRouters) par jaate hain; DR 224.0.0.6 (AllDRouters) use karta hai.</li>
<li>Har router ka ek <b>router ID</b> hota hai, 32-bit number jo IPv4 address jaisa likha jaata hai. Junos par ise khud set karo: <code>set routing-options router-id 10.255.0.1</code>.</li>
<li>Neighbours apne databases exchange karke <b>adjacent</b> bante hain. Ek area ke routers ke LSDB bilkul same ho jaate hain.</li>
<li>Best path SPF se mila sabse kam total <b>cost</b> (metric) hai. Junos cost ko interface bandwidth aur <b>reference bandwidth</b> se nikalta hai.</li>
<li>Junos OSPF ko internal routes ke liye <b>preference 10</b> aur external routes ke liye <b>150</b> deta hai. Doosre protocols ke saamne kam preference jeetta hai.</li>
</ul>

<h3>Is module ka lab network</h3>
<p>Poore module mein hum wahi simulator labs use karte hain. Pehle lab mein chaar routers do regions banate hain: R1 (Agra) ABR R2 ke peeche, aur R4 (Jaipur) ABR R3 ke peeche, R2-R3 link par area 0, loopbacks 10.255.0.x/32 aur LANs 172.20.1.0/24 aur 172.20.2.0/24. Doosra lab ASBR aur stub/NSSA areas jodta hai (R1 198.51.100.0/24 export karta hai, R4 203.0.113.0/24 inject karta hai). Teesra shared LAN par troubleshooting lab hai. Hum inka real output dikhayenge.</p>
<pre class="code"><span class="c">! Junos par minimum OSPF</span>
set routing-options router-id 10.255.0.2
set protocols ospf area 0.0.0.10 interface ge-0/0/0.0
set protocols ospf area 0.0.0.10 interface lo0.0 passive</pre>
<pre class="out">lab@R2-AGRA&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.10.12.1       ge-0/0/0.0             <span class="hl">Full</span>            10.255.0.1       128    32
10.0.23.2        ge-0/0/1.0             <span class="hl">Full</span>            10.255.0.3       128    36</pre>
<p>Dhyan do ki Junos par koi alag <code>network</code> command nahi hota. Aap interfaces ka naam likhte ho, aur interface ka address advertise ho jaata hai. <code>passive</code> keyword prefix advertise karta hai par hello nahi bhejta, jo loopbacks aur user LANs ke liye bilkul sahi hai.</p>

<div class="eg"><p><b>Worked example.</b> R1 ke paas office users ke liye ge-0/0/1 (172.20.1.0/24) aur ge-0/0/2 (172.20.2.0/24) hain. Aap nahi chahte ki in LANs ke routers neighbour banayein, isliye dono interfaces ko area 0.0.0.10 ke neeche <code>passive</code> likhte ho. R2 R1 ke router LSA se dono /24 prefixes seekh leta hai, aur users ko kabhi hello nahi jaata.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Loopbacks aur edge LANs par <code>passive</code> bhoolna, ya loopback ko OSPF se bahar rakhna jisse router ID wala address baaki network ko kabhi reachable nahi hota. Ek aur galti: router ID set na karna, jisse baad mein interface change hone par router ID chupchaap badal jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Area ID 32-bit number hai aur Junos use dotted form (0.0.0.0, 0.0.0.10) mein dikhata hai chahe aap plain number type karo. OSPF protocol 89 use karta hai, TCP port nahi. Internal preference 10 hai, external 150.</p></div>

<div class="scn"><h4>Woh loopback jo kisi ne advertise nahi kiya</h4><p>Ek naya core router aaya, saare neighbours Full the, phir bhi NOC se uska management loopback ping nahi ho raha tha. Engineer ne <code>show ospf interface</code> ko interface list se compare kiya aur dekha ki lo0.0 OSPF mein hai hi nahi. <code>set protocols ospf area 0.0.0.0 interface lo0.0 passive</code> aur commit ke baad /32 kuch seconds mein har neighbour ki table mein aa gaya.</p><p><b>Lesson:</b> healthy adjacency ka matlab yeh nahi ki har prefix advertise ho raha hai. Hamesha check karo ki neighbour ne wo routes seekhe ya nahi jo use seekhne chahiye.</p></div>

<div class="iv"><p class="q">"Ek area ke OSPF routers ka database same kyun hota hai, aur areas ki zaroorat hi kyun hai?"</p><p>Har router apne LSAs flood karta hai aur har router area ke saare LSAs store karta hai, isliye databases same hote hain aur har router akele SPF chala sakta hai. Bade network mein database, SPF load aur flooding har link ke saath badhte, isliye hum use areas mein baantte hain. Area ke andar detail rehti hai; areas ke beech sirf summaries backbone, area 0, se guzarti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPF link-state protocol hai: LSAs flood karo, same LSDB banao, SPF chalao.</li>
<li>Areas LSDB ka size limit karte hain; area 0 baaki sab areas ko jodta hai.</li>
<li>OSPF IP protocol 89 par chalta hai, hellos 224.0.0.5 par.</li>
<li>Junos par interfaces area ke neeche list karte hain; <code>passive</code> bina hello ke advertise karta hai.</li>
<li>Internal routes ki preference 10, external routes ki 150.</li>
</ul></div>
`}};export{e as default};