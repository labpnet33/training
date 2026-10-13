var e={id:`router-roles-dr-bdr`,h:{en:`Router roles, network types and the DR/BDR election`,hi:`Router roles, network types aur DR/BDR election`},body:{en:`
<p>In a company, the same person can be a team member, a team lead or a liaison to another company depending on where they sit. OSPF routers have roles in the same way, and the role follows from what the router is connected to. There are two families of roles: the <b>position in the area structure</b> (internal, backbone, ABR, ASBR) and the <b>role on a LAN</b> (DR, BDR, DROther).</p>

<h3>Roles in the area structure</h3>
<ul>
<li><b>Internal router</b>: all OSPF interfaces are in one area.</li>
<li><b>Backbone router</b>: at least one interface is in area 0.</li>
<li><b>ABR (area border router)</b>: interfaces in area 0 and in at least one other area. It holds one LSDB per area and creates type 3 and 4 LSAs. Junos sets the B bit in its router LSA.</li>
<li><b>ASBR (autonomous system boundary router)</b>: injects routes from another source into OSPF, on Junos with an <b>export policy</b>. It sets the E bit and creates type 5 (or type 7) LSAs. An ASBR can sit in any area except a stub area.</li>
</ul>
<p><code>show ospf overview</code> tells you what the local router is. In the stub/NSSA lab R2 serves area 0 and areas 30 and 40, so it prints:</p>
<pre class="out">lab@R2-PUNE&gt; show ospf overview
Instance: master
  Router ID: 10.255.1.2
  Route table index: 0
  <span class="hl">Area border router, AS boundary router</span>
  LSA refresh time: 50 minutes
  Area: 0.0.0.0
    Stub type: Not Stub
    Area border routers: 0, AS boundary routers: 1</pre>
<p>R2 is both: it is the ABR, and because it translates the NSSA type 7 into type 5 it also carries the ASBR flag. <code>show ospf route abr</code> and <code>show ospf route asbr</code> list the border routers a router can reach:</p>
<pre class="out">lab@R2-PUNE&gt; show ospf route asbr
Prefix             Path  Route      NH       Metric NextHop       Nexthop
                   Type  Type       Type            Interface     Address/LSP
10.255.1.1         Intra AS BR      IP            1 ge-0/0/0.0    10.1.12.1
10.255.1.4         Intra AS BR      IP            1 ge-0/0/2.0    10.40.24.2</pre>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="DR BDR and DROther on a LAN">
<rect x="20" y="95" width="600" height="22" rx="6" fill="#e2e8f0"/><text x="320" y="111" text-anchor="middle" class="svg-muted" font-size="12">shared Ethernet segment</text>
<rect x="40" y="20" width="120" height="55" rx="10" fill="#bbf7d0"/><text x="100" y="44" text-anchor="middle" class="svg-ink" font-size="14">R1 DR</text><text x="100" y="62" text-anchor="middle" class="svg-muted" font-size="12">priority 200</text>
<rect x="200" y="20" width="120" height="55" rx="10" fill="#fde68a"/><text x="260" y="44" text-anchor="middle" class="svg-ink" font-size="14">R2 BDR</text><text x="260" y="62" text-anchor="middle" class="svg-muted" font-size="12">priority 128</text>
<rect x="360" y="20" width="120" height="55" rx="10" fill="#ddd6fe"/><text x="420" y="44" text-anchor="middle" class="svg-ink" font-size="14">R3 DROther</text><text x="420" y="62" text-anchor="middle" class="svg-muted" font-size="12">priority 0</text>
<rect x="520" y="20" width="100" height="55" rx="10" fill="#ddd6fe"/><text x="570" y="44" text-anchor="middle" class="svg-ink" font-size="14">R5 DROther</text><text x="570" y="62" text-anchor="middle" class="svg-muted" font-size="12">priority 128</text>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">DROthers form Full adjacencies only with the DR and BDR; between themselves they stay 2Way</text>
</svg><p class="cap">The DR and BDR reduce adjacencies on a multi-access LAN.</p></div>

<h3>Why a DR exists</h3>
<p>On a LAN with n routers a full mesh of adjacencies needs n(n-1)/2 of them, each exchanging databases. With 6 routers that is 15 adjacencies. With a DR and a BDR every router forms an adjacency only with those two, which is 2n-3 = 9 in this example, and the LSAs are sent once to the DR (multicast 224.0.0.6) which re-floods to everyone (224.0.0.5). The DR also creates the type 2 LSA for the LAN. The BDR waits silently and takes over if the DR fails.</p>

<h3>The election</h3>
<ol>
<li>The router with the highest <b>interface priority</b> wins. The Junos default is <b>128</b>; the range is 0-255. Priority <b>0</b> means the router can never be DR or BDR.</li>
<li>If priorities tie, the highest <b>router ID</b> wins.</li>
<li>The election is <b>not pre-emptive</b>: once a DR exists, a new router with a better priority does not take over. The result changes only when the DR or BDR goes away, for example after <code>clear ospf neighbor</code> on the LAN routers.</li>
</ol>
<p>Here is what the Kochi lab looked like at the start. R3 (a small lab router) had priority 255 and became DR; the design says R1 must be DR:</p>
<pre class="out">lab@R1-KOCHI&gt; show ospf interface
Interface           State   Area            DR ID           BDR ID          Nbrs
ge-0/0/0.0          DRother 0.0.0.0         <span class="hl">10.255.2.3</span>      10.255.2.2         2
lab@R1-KOCHI&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.2.0.2         ge-0/0/0.0             Full            10.255.2.2       128    35
10.2.0.3         ge-0/0/0.0             Full            10.255.2.3       <span class="hl">255</span>    36</pre>
<p>After setting priority 200 on R1, priority 0 on R3 and clearing the neighbours:</p>
<pre class="code">[edit] set protocols ospf area 0.0.0.0 interface ge-0/0/0.0 priority 200   <span class="c">! on R1</span>
[edit] set protocols ospf area 0.0.0.0 interface ge-0/0/0.0 priority 0     <span class="c">! on R3</span>
lab@R1&gt; clear ospf neighbor</pre>
<pre class="out">lab@R1-KOCHI&gt; show ospf interface
ge-0/0/0.0          <span class="hl">DR</span>      0.0.0.0         10.255.2.1      10.255.2.2         2</pre>

<h3>Do you need a DR at all?</h3>
<p>On a link with only two routers the election is wasted effort. Set <code>interface-type p2p</code> on both ends: no DR, no type 2 LSA, a faster adjacency. The simulator labs use Ethernet links, which Junos treats as broadcast by default, so you will see a DR even on a two-router link, as in the R2-R3 link of the first lab where R3 is DR.</p>

<div class="eg"><p><b>Worked example.</b> Six routers on one LAN: a full mesh would need 6 x 5 / 2 = 15 adjacencies. With DR and BDR it is 5 + 4 = 9 (each of the 4 DROthers peers with 2, and the DR and BDR peer with each other). Add four more routers and the mesh grows to 45 while DR/BDR grows to 17.</p></div>

<div class="warn"><p><b>Common mistake.</b> Raising the priority on the router you want as DR, committing, and expecting the role to move. It does not until the election is re-run. Also, setting priority 0 on every router except one leaves no BDR.</p></div>
<div class="exam"><p><b>Exam trap.</b> DROthers stay in <b>2Way</b> with each other, and that is normal. On Junos the default priority is 128 (not 1, which is the usual default on other vendors). The DR originates the type 2 LSA. DR election tie-break is router ID, not interface address.</p></div>

<div class="scn"><h4>The lab router that became the LAN's DR</h4><p>A branch's small lab router joined the core LAN with priority 255 left over from a test. It became DR, and when it was rebooted for an upgrade the whole LAN re-flooded and the core flapped. The team set its priority to 0, the design routers got 200 and default, and they ran <code>clear ospf neighbor</code> in a quiet window so that the election ran once.</p><p><b>Lesson:</b> priority is configuration you must plan, and because the election is not pre-emptive, apply it in a change window and restart the adjacencies.</p></div>

<div class="iv"><p class="q">"Is the OSPF DR election pre-emptive? How do you force a specific router to be DR?"</p><p>No. The first router up wins unless it is rebooted or loses the role. To force a DR, give the chosen router the highest priority (for example 200) and give routers that must never serve priority 0, then restart the OSPF adjacencies on the LAN so a new election runs. Mention that on a two-router link you would use p2p instead.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roles: internal, backbone, ABR (B bit), ASBR (E bit); <code>show ospf overview</code> shows them.</li>
<li>The DR and BDR cut adjacencies on a LAN; the DR creates the type 2 LSA.</li>
<li>Highest priority wins (default 128, 0 = never), then highest router ID.</li>
<li>The election is not pre-emptive; restart adjacencies after a priority change.</li>
<li>Use <code>interface-type p2p</code> on two-router links to avoid the election.</li>
</ul></div>
`,hi:`
<p>Company mein ek hi insaan team member, team lead ya doosri company ka liaison ho sakta hai, jahan wo baitha hai uske hisaab se. OSPF routers ke roles bhi aise hi hote hain, aur role is baat se tay hota hai ki router kis se juda hai. Roles ke do families hain: <b>area structure mein position</b> (internal, backbone, ABR, ASBR) aur <b>LAN par role</b> (DR, BDR, DROther).</p>

<h3>Area structure mein roles</h3>
<ul>
<li><b>Internal router</b>: iske saare OSPF interfaces ek area mein hain.</li>
<li><b>Backbone router</b>: kam se kam ek interface area 0 mein hai.</li>
<li><b>ABR (area border router)</b>: interfaces area 0 mein aur kam se kam ek aur area mein. Iske paas har area ka alag LSDB hota hai aur ye type 3 aur 4 LSAs banata hai. Junos apne router LSA mein B bit set karta hai.</li>
<li><b>ASBR (autonomous system boundary router)</b>: kisi aur source ke routes OSPF mein inject karta hai, Junos par <b>export policy</b> se. Ye E bit set karta hai aur type 5 (ya type 7) LSAs banata hai. ASBR stub area ko chhodkar kisi bhi area mein ho sakta hai.</li>
</ul>
<p><code>show ospf overview</code> batata hai ki local router kya hai. Stub/NSSA lab mein R2 area 0 aur areas 30 aur 40 ko serve karta hai, isliye ye print karta hai:</p>
<pre class="out">lab@R2-PUNE&gt; show ospf overview
Instance: master
  Router ID: 10.255.1.2
  Route table index: 0
  <span class="hl">Area border router, AS boundary router</span>
  LSA refresh time: 50 minutes
  Area: 0.0.0.0
    Stub type: Not Stub
    Area border routers: 0, AS boundary routers: 1</pre>
<p>R2 dono hai: wo ABR hai, aur NSSA type 7 ko type 5 mein translate karne ki wajah se use ASBR flag bhi milta hai. <code>show ospf route abr</code> aur <code>show ospf route asbr</code> un border routers ko list karte hain jinhe router reach kar sakta hai:</p>
<pre class="out">lab@R2-PUNE&gt; show ospf route asbr
Prefix             Path  Route      NH       Metric NextHop       Nexthop
                   Type  Type       Type            Interface     Address/LSP
10.255.1.1         Intra AS BR      IP            1 ge-0/0/0.0    10.1.12.1
10.255.1.4         Intra AS BR      IP            1 ge-0/0/2.0    10.40.24.2</pre>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="LAN par DR BDR aur DROther">
<rect x="20" y="95" width="600" height="22" rx="6" fill="#e2e8f0"/><text x="320" y="111" text-anchor="middle" class="svg-muted" font-size="12">shared Ethernet segment</text>
<rect x="40" y="20" width="120" height="55" rx="10" fill="#bbf7d0"/><text x="100" y="44" text-anchor="middle" class="svg-ink" font-size="14">R1 DR</text><text x="100" y="62" text-anchor="middle" class="svg-muted" font-size="12">priority 200</text>
<rect x="200" y="20" width="120" height="55" rx="10" fill="#fde68a"/><text x="260" y="44" text-anchor="middle" class="svg-ink" font-size="14">R2 BDR</text><text x="260" y="62" text-anchor="middle" class="svg-muted" font-size="12">priority 128</text>
<rect x="360" y="20" width="120" height="55" rx="10" fill="#ddd6fe"/><text x="420" y="44" text-anchor="middle" class="svg-ink" font-size="14">R3 DROther</text><text x="420" y="62" text-anchor="middle" class="svg-muted" font-size="12">priority 0</text>
<rect x="520" y="20" width="100" height="55" rx="10" fill="#ddd6fe"/><text x="570" y="44" text-anchor="middle" class="svg-ink" font-size="14">R5 DROther</text><text x="570" y="62" text-anchor="middle" class="svg-muted" font-size="12">priority 128</text>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">DROthers sirf DR aur BDR ke saath Full bante hain; aapas mein 2Way rehte hain</text>
</svg><p class="cap">DR aur BDR multi-access LAN par adjacencies kam karte hain.</p></div>

<h3>DR kyun hota hai</h3>
<p>n routers wali LAN par full mesh ke liye n(n-1)/2 adjacencies chahiye, aur har ek database exchange karti hai. 6 routers par ye 15 adjacencies hain. DR aur BDR ke saath har router sirf un do se adjacency banata hai, jo is example mein 2n-3 = 9 hain, aur LSAs DR ko ek baar bheje jaate hain (multicast 224.0.0.6) jo sabko dobara flood karta hai (224.0.0.5). DR hi LAN ka type 2 LSA banata hai. BDR chupchaap intezaar karta hai aur DR fail ho to kaam sambhalta hai.</p>

<h3>Election</h3>
<ol>
<li>Sabse bada <b>interface priority</b> jeetta hai. Junos default <b>128</b> hai; range 0-255. Priority <b>0</b> ka matlab router kabhi DR ya BDR nahi ban sakta.</li>
<li>Priority barabar ho to sabse bada <b>router ID</b> jeetta hai.</li>
<li>Election <b>pre-emptive nahi</b> hai: DR ban jaane ke baad behtar priority wala naya router kabza nahi karta. Result tabhi badalta hai jab DR ya BDR chala jaaye, jaise LAN ke routers par <code>clear ospf neighbor</code> ke baad.</li>
</ol>
<p>Kochi lab shuru mein aisa dikhta tha. R3 (chhota lab router) ki priority 255 thi aur wo DR ban gaya; design kehta hai R1 DR hona chahiye:</p>
<pre class="out">lab@R1-KOCHI&gt; show ospf interface
Interface           State   Area            DR ID           BDR ID          Nbrs
ge-0/0/0.0          DRother 0.0.0.0         <span class="hl">10.255.2.3</span>      10.255.2.2         2
lab@R1-KOCHI&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.2.0.2         ge-0/0/0.0             Full            10.255.2.2       128    35
10.2.0.3         ge-0/0/0.0             Full            10.255.2.3       <span class="hl">255</span>    36</pre>
<p>R1 par priority 200, R3 par priority 0 set karke aur neighbours clear karne ke baad:</p>
<pre class="code">[edit] set protocols ospf area 0.0.0.0 interface ge-0/0/0.0 priority 200   <span class="c">! R1 par</span>
[edit] set protocols ospf area 0.0.0.0 interface ge-0/0/0.0 priority 0     <span class="c">! R3 par</span>
lab@R1&gt; clear ospf neighbor</pre>
<pre class="out">lab@R1-KOCHI&gt; show ospf interface
ge-0/0/0.0          <span class="hl">DR</span>      0.0.0.0         10.255.2.1      10.255.2.2         2</pre>

<h3>Kya DR ki zaroorat hai bhi?</h3>
<p>Sirf do routers wale link par election bekaar mehnat hai. Dono taraf <code>interface-type p2p</code> lagao: koi DR nahi, koi type 2 LSA nahi, adjacency tez. Simulator labs Ethernet links use karte hain, jinhe Junos default mein broadcast maanta hai, isliye do-router link par bhi DR dikhega, jaise pehle lab ke R2-R3 link par R3 DR hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek LAN par chhe routers: full mesh ke liye 6 x 5 / 2 = 15 adjacencies. DR aur BDR ke saath ye 5 + 4 = 9 hain (4 DROthers har ek 2 se peer karta hai, aur DR aur BDR aapas mein). Chaar aur router jodo to mesh 45 ho jaata hai jabki DR/BDR 17.</p></div>

<div class="warn"><p><b>Common mistake.</b> Jise DR banana hai us par priority badhana, commit karna, aur umeed karna ki role shift ho jaayega. Jab tak election dobara nahi chalta tab tak nahi hota. Saath hi, ek ko chhodkar baaki sab par priority 0 karne se koi BDR nahi bachta.</p></div>
<div class="exam"><p><b>Exam trap.</b> DROthers aapas mein <b>2Way</b> par rehte hain, aur yeh normal hai. Junos par default priority 128 hai (1 nahi, jo doosre vendors par aam default hai). Type 2 LSA DR banata hai. DR election tie-break router ID hai, interface address nahi.</p></div>

<div class="scn"><h4>Lab router jo LAN ka DR ban gaya</h4><p>Ek branch ka chhota lab router core LAN par test se bachi priority 255 ke saath join hua. Wo DR ban gaya, aur jab upgrade ke liye reboot hua to poori LAN ne dobara flood kiya aur core flap hua. Team ne uski priority 0 ki, design routers ko 200 aur default diya, aur shaant window mein <code>clear ospf neighbor</code> chalaya taaki election ek hi baar chale.</p><p><b>Lesson:</b> priority aisi configuration hai jise plan karna padta hai, aur election pre-emptive nahi hai, isliye use change window mein lagao aur adjacencies restart karo.</p></div>

<div class="iv"><p class="q">"Kya OSPF DR election pre-emptive hai? Kisi specific router ko DR kaise banate hain?"</p><p>Nahi. Jo router pehle up hota hai wo jeetta hai jab tak reboot na ho ya role na khoye. DR force karne ke liye chune hue router ko sabse bada priority (jaise 200) do aur jo routers kabhi serve na karein unhe priority 0, phir LAN par OSPF adjacencies restart karo taaki naya election chale. Yeh bhi batao ki do-router link par aap p2p use karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roles: internal, backbone, ABR (B bit), ASBR (E bit); <code>show ospf overview</code> dikhata hai.</li>
<li>DR aur BDR LAN par adjacencies kam karte hain; DR type 2 LSA banata hai.</li>
<li>Sabse bada priority jeetta hai (default 128, 0 = kabhi nahi), phir sabse bada router ID.</li>
<li>Election pre-emptive nahi; priority badalne ke baad adjacencies restart karo.</li>
<li>Do-router links par election se bachne ke liye <code>interface-type p2p</code> use karo.</li>
</ul></div>
`}};export{e as default};