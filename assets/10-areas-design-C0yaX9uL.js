var e={id:`areas`,h:{en:`Areas and single-area design`,hi:`Areas aur single-area design`},fig:`areas`,body:{en:`
<p>India is divided into states. A traffic officer in Pune needs a detailed map of every road in Maharashtra, but for Tamil Nadu a summary is enough: "Chennai is that way, about this far". If every officer had to track every lane in the whole country, and redraw the map whenever a lane anywhere closed, nobody would get any work done. OSPF <b>areas</b> apply the same idea to routers.</p>

<h3>Why areas exist</h3>
<p>All routers in one area hold an <b>identical LSDB</b> containing every type 1 and type 2 LSA of that area. That brings three costs as the area grows:</p>
<ul>
<li><b>Memory:</b> the LSDB grows with every router and link.</li>
<li><b>CPU:</b> every topology change anywhere in the area triggers SPF on every router in the area.</li>
<li><b>Flooding:</b> every change is flooded to every router in the area.</li>
</ul>
<p>Areas put a boundary around this. Detailed LSAs stay inside their own area; other areas only receive summaries.</p>

<h3>The rules of areas</h3>
<dl class="terms">
<dt>Area 0 (the backbone)</dt><dd>Every multi-area OSPF design has an area 0, and every other area must connect to it. Area 0 can also be written 0.0.0.0.</dd>
<dt>Internal router</dt><dd>All its OSPF interfaces are in one area.</dd>
<dt>Backbone router</dt><dd>At least one interface in area 0.</dd>
<dt>ABR (Area Border Router)</dt><dd>Interfaces in area 0 and at least one other area. It keeps one LSDB per area and turns routes of one area into type 3 summary LSAs for the others.</dd>
<dt>ASBR (Autonomous System Boundary Router)</dt><dd>Injects external routes into OSPF, for example a default route with <code>default-information originate</code>.</dd>
</dl>
<p>You will see the difference in the routing table: <code>O</code> means intra-area (learned from type 1 and 2 LSAs of your own area), <code>O IA</code> means inter-area (learned from an ABR's summary), and <code>O E2</code> or <code>O*E2</code> means external (the asterisk marks a candidate default). The figure below this chapter shows two ABRs joining area 1 and area 2 to the backbone.</p>

<h3>Single-area OSPF: what the CCNA expects</h3>
<p>The CCNA blueprint covers <b>single-area OSPFv2</b>: every OSPF interface of every router is in the same area, and by convention that area is <b>area 0</b>. In a single area there are no ABRs, no summaries and no <code>O IA</code> routes: every OSPF route is plain <code>O</code> (plus an <code>O*E2</code> default if someone originates one). That is exactly the design of all three labs in this module.</p>
<pre class="out">R1# show ip ospf | include areas|Area
<span class="hl"> Number of areas in this router is 1. 1 normal 0 stub 0 nssa</span>
    Area BACKBONE(0)</pre>

<h3>Good single-area design habits</h3>
<ul>
<li>Use <b>area 0</b>, so the network can grow into multi-area later without renumbering the core.</li>
<li>Give every router a <b>loopback and a manual router ID</b> from a plan.</li>
<li>Set the same <b>reference bandwidth</b> on every router.</li>
<li>Use <b>point-to-point</b> network type on router-to-router Ethernet links.</li>
<li>Make user LANs and loopbacks <b>passive</b>, so no Hellos leak to hosts.</li>
<li>Allocate addresses so that each future area could be <b>summarised</b> in one block, for example all branch subnets inside 10.20.0.0/16.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> The Lab 1 chain has 4 routers and 7 LSAs; any change there is trivial. Now picture a retail chain with 150 stores in a single area, each store router with two WAN links. The LSDB holds 150-plus router LSAs, and when a flaky broadband link at one store flaps every few minutes, <b>all 150 routers</b> rerun SPF each time. Placing the stores into regional areas means a store flap only triggers full SPF inside its region, while the rest of the network sees at most a changed summary.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing the wrong area on one network statement: the link's two ends then disagree on the area, the neighbour never forms, and the router with the typo quietly becomes an ABR. This is the second fault in ticket NK-4521, where R3 has <code>network 10.0.23.0 0.0.0.3 area 1</code> while R2 uses area 0. Also, building a single area numbered something other than 0 and discovering later that adding a second area requires a backbone.</p></div>

<div class="exam"><p><b>Exam traps.</b> Area 0 is the backbone and all areas must touch it. An ABR has interfaces in area 0 and another area. <code>O IA</code> = inter-area, <code>O</code> = intra-area. The area ID is carried in every Hello and must match on both ends of a link. The CCNA tests single-area; stub, NSSA, virtual links and multi-area summarisation belong to CCNP.</p></div>

<div class="scn"><h4>One shop's broadband and three hundred busy routers</h4><p>After merging two companies, a network team connected everything into one big area 0 of about 300 routers. A shop in a small town had a broadband line that flapped several times an hour. Each flap was flooded to all 300 routers, each ran SPF, and the older branch routers showed CPU spikes and occasional dropped voice calls. <code>show ip ospf</code> on a distant router showed the SPF counter climbing all day. As a quick fix the team raised the shop's link cost and got the provider to fix the line. The long-term fix, a regional multi-area design, went into the next quarter's plan.</p><p><b>Lesson:</b> a single area is perfect for small and medium networks. As the router count grows, areas contain the blast radius of every change.</p></div>

<div class="iv"><p class="q">"Why does OSPF use areas, and what is an ABR?"</p><p>Strong answer: every router in an area has the same LSDB and reruns SPF on every change in the area, so large single areas waste memory and CPU and flood every change everywhere. Areas limit detailed LSAs to their own area; an ABR connects area 0 with another area, keeps one LSDB per area and advertises summaries between them, which appear as <code>O IA</code> routes. All areas must attach to area 0. For CCNA-sized networks I use a single area 0, designed with summarisable addressing so it can split later.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every router in an area has the same LSDB and runs SPF for every change in that area.</li>
<li>Area 0 is the backbone; every other area connects to it through an ABR.</li>
<li>Route codes: <code>O</code> intra-area, <code>O IA</code> inter-area, <code>O E2</code>/<code>O*E2</code> external.</li>
<li>CCNA scope is single-area OSPF, normally all interfaces in area 0.</li>
<li>An area typo breaks the adjacency on that link and silently creates an accidental ABR.</li>
</ul></div>
`,hi:`
<p>India states mein bata hua hai. Pune ke traffic officer ko Maharashtra ki har sadak ka detailed map chahiye, lekin Tamil Nadu ke liye summary kaafi hai: "Chennai us taraf hai, lagbhag itni door". Agar har officer ko poore desh ki har gali track karni padti, aur kahin bhi gali band hone par map dobara banana padta, to koi kaam hi nahi hota. OSPF <b>areas</b> routers par yahi idea lagate hain.</p>

<h3>Areas kyun hote hain</h3>
<p>Ek area ke saare routers ek <b>identical LSDB</b> rakhte hain jismein us area ka har type 1 aur type 2 LSA hota hai. Area badhne par isse teen keematein aati hain:</p>
<ul>
<li><b>Memory:</b> har router aur link ke saath LSDB badhta hai.</li>
<li><b>CPU:</b> area mein kahin bhi topology change area ke har router par SPF chalwata hai.</li>
<li><b>Flooding:</b> har change area ke har router tak flood hota hai.</li>
</ul>
<p>Areas iske chaaron taraf boundary bana dete hain. Detailed LSAs apne area ke andar rehte hain; dusre areas ko sirf summaries milti hain.</p>

<h3>Areas ke rules</h3>
<dl class="terms">
<dt>Area 0 (backbone)</dt><dd>Har multi-area OSPF design mein area 0 hota hai, aur har dusra area isse connect hona chahiye. Area 0 ko 0.0.0.0 bhi likha ja sakta hai.</dd>
<dt>Internal router</dt><dd>Iske saare OSPF interfaces ek hi area mein hain.</dd>
<dt>Backbone router</dt><dd>Kam se kam ek interface area 0 mein.</dd>
<dt>ABR (Area Border Router)</dt><dd>Interfaces area 0 aur kam se kam ek dusre area mein. Yeh har area ke liye ek LSDB rakhta hai aur ek area ke routes ko dusron ke liye type 3 summary LSAs mein badalta hai.</dd>
<dt>ASBR (Autonomous System Boundary Router)</dt><dd>OSPF mein external routes daalta hai, jaise <code>default-information originate</code> se default route.</dd>
</dl>
<p>Routing table mein farak dikhega: <code>O</code> matlab intra-area (apne area ke type 1 aur 2 LSAs se seekha), <code>O IA</code> matlab inter-area (ABR ki summary se seekha), aur <code>O E2</code> ya <code>O*E2</code> matlab external (asterisk candidate default ko mark karta hai). Is chapter ke neeche wala figure do ABRs dikhata hai jo area 1 aur area 2 ko backbone se jodte hain.</p>

<h3>Single-area OSPF: CCNA kya expect karta hai</h3>
<p>CCNA blueprint <b>single-area OSPFv2</b> cover karta hai: har router ka har OSPF interface same area mein, aur convention se woh area <b>area 0</b> hota hai. Single area mein koi ABR, koi summary aur koi <code>O IA</code> route nahi hota: har OSPF route seedha <code>O</code> hota hai (plus <code>O*E2</code> default agar koi originate kare). Is module ki teeno labs ka design bilkul yahi hai.</p>
<pre class="out">R1# show ip ospf | include areas|Area
<span class="hl"> Number of areas in this router is 1. 1 normal 0 stub 0 nssa</span>
    Area BACKBONE(0)</pre>

<h3>Achhe single-area design ki aadatein</h3>
<ul>
<li><b>Area 0</b> use karo, taaki network baad mein core renumber kiye bina multi-area mein badh sake.</li>
<li>Har router ko ek plan se <b>loopback aur manual router ID</b> do.</li>
<li>Har router par same <b>reference bandwidth</b> set karo.</li>
<li>Router-to-router Ethernet links par <b>point-to-point</b> network type use karo.</li>
<li>User LANs aur loopbacks ko <b>passive</b> banao, taaki hosts tak Hellos leak na hon.</li>
<li>Addresses aise allocate karo ki har future area ko ek block mein <b>summarise</b> kiya ja sake, jaise saare branch subnets 10.20.0.0/16 ke andar.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Lab 1 chain mein 4 routers aur 7 LSAs hain; wahan koi bhi change mamooli hai. Ab ek retail chain socho jiske 150 stores single area mein hain, har store router ke do WAN links. LSDB mein 150 se zyada router LSAs hain, aur jab ek store ka kharab broadband link har kuch minute flap karta hai, to <b>saare 150 routers</b> har baar SPF dobara chalate hain. Stores ko regional areas mein daalne se store ka flap sirf uske region ke andar full SPF chalwata hai, jabki baaki network zyada se zyada ek badli hui summary dekhta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Ek network statement par galat area type karna: link ke dono ends area par disagree karte hain, neighbour kabhi nahi banta, aur typo wala router chupchaap ABR ban jaata hai. Ticket NK-4521 ki dusri galti yahi hai, jahan R3 par <code>network 10.0.23.0 0.0.0.3 area 1</code> hai jabki R2 area 0 use karta hai. Aur 0 ke alawa kisi number wala single area banana, aur baad mein pata chalna ki dusra area jodne ke liye backbone chahiye.</p></div>

<div class="exam"><p><b>Exam traps.</b> Area 0 backbone hai aur saare areas ko use chhoona chahiye. ABR ke interfaces area 0 aur dusre area mein hote hain. <code>O IA</code> = inter-area, <code>O</code> = intra-area. Area ID har Hello mein jaata hai aur link ke dono ends par match hona chahiye. CCNA single-area test karta hai; stub, NSSA, virtual links aur multi-area summarisation CCNP ke hisse hain.</p></div>

<div class="scn"><h4>Ek dukaan ka broadband aur teen sau busy routers</h4><p>Do companies merge hone ke baad network team ne sab kuch lagbhag 300 routers ke ek bade area 0 mein jod diya. Ek chhote shehar ki dukaan ki broadband line ghante mein kai baar flap karti thi. Har flap saare 300 routers tak flood hota, har ek SPF chalata, aur purane branch routers par CPU spikes aur kabhi kabhi voice calls drop dikhne lage. Door ke ek router par <code>show ip ospf</code> mein SPF counter poore din badhta dikha. Quick fix ke roop mein team ne dukaan ke link ki cost badhayi aur provider se line theek karwayi. Long-term fix, regional multi-area design, agle quarter ke plan mein gaya.</p><p><b>Seekh:</b> chhote aur medium networks ke liye single area perfect hai. Router count badhne par areas har change ka blast radius seemit rakhte hain.</p></div>

<div class="iv"><p class="q">"OSPF areas kyun use karta hai, aur ABR kya hai?"</p><p>Strong answer: area ke har router ke paas same LSDB hota hai aur woh area ke har change par SPF dobara chalata hai, isliye bade single areas memory aur CPU waste karte hain aur har change har jagah flood karte hain. Areas detailed LSAs ko apne area tak seemit rakhte hain; ABR area 0 ko dusre area se jodta hai, har area ka ek LSDB rakhta hai aur unke beech summaries advertise karta hai, jo <code>O IA</code> routes ke roop mein dikhti hain. Saare areas area 0 se jude hone chahiye. CCNA size ke networks ke liye main single area 0 use karta hoon, summarisable addressing ke saath design kiya hua taaki baad mein split ho sake.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Area ke har router ka LSDB same hota hai aur woh us area ke har change par SPF chalata hai.</li>
<li>Area 0 backbone hai; har dusra area ABR ke through isse judta hai.</li>
<li>Route codes: <code>O</code> intra-area, <code>O IA</code> inter-area, <code>O E2</code>/<code>O*E2</code> external.</li>
<li>CCNA scope single-area OSPF hai, aam taur par saare interfaces area 0 mein.</li>
<li>Area typo us link ki adjacency tod deta hai aur chupchaap ek accidental ABR bana deta hai.</li>
</ul></div>
`}};export{e as default};