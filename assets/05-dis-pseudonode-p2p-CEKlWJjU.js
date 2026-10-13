var e={id:`dis-pseudonode-p2p`,h:{en:`LANs and links: DIS, pseudonode and point-to-point circuits`,hi:`LANs aur links: DIS, pseudonode aur point-to-point circuits`},body:{en:`
<p>Picture a meeting room with ten people (a LAN with ten routers). If each person had to brief every other person separately that would be 45 conversations. Instead, the group elects one <b>chairperson</b> who keeps the minutes and reads out a short summary every few seconds. Everybody else just compares the summary with their own notes. In IS-IS the chairperson is the <b>DIS</b>, the Designated Intermediate System, and the "minutes" are a made-up router called the <b>pseudonode</b>.</p>

<h3>What happens on a broadcast link</h3>
<p>By default IOS treats an Ethernet interface as a <b>broadcast</b> circuit. The routers on it:</p>
<ol>
<li>Exchange LAN hellos (separately for level 1 and level 2) to multicast MAC addresses.</li>
<li><b>Elect a DIS per level.</b> The highest <b>priority</b> wins (default 64, range 0 to 127, <code>isis priority N [level-1|level-2]</code>). A tie is broken by the highest <b>MAC address</b> (SNPA).</li>
<li>The DIS creates a <b>pseudonode LSP</b> that represents the LAN. Every router on the LAN lists the pseudonode as a neighbour, and the pseudonode lists all the routers. The pseudonode LSP ID ends with a non-zero number, such as <b>R3.01-00</b>. The number is the local circuit ID on the DIS.</li>
<li>The DIS multicasts a <b>CSNP every 10 seconds</b> so that all routers can detect and repair missing LSPs, and it sends hellos three times as fast (every 3.33 s, hold 10 s) so a DIS failure is noticed quickly.</li>
</ol>
<p>A star-shaped description replaces the full mesh: the LSDB holds n links to one pseudonode instead of n(n-1)/2 links between routers. That is why the pseudonode exists.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Pseudonode on a LAN">
<rect x="20" y="30" width="200" height="150" rx="12" fill="#e2e8f0"/><text x="120" y="50" text-anchor="middle" class="svg-muted" font-size="12">Real topology (LAN)</text>
<circle cx="60" cy="100" r="20" fill="#bbf7d0"/><circle cx="120" cy="150" r="20" fill="#bbf7d0"/><circle cx="180" cy="100" r="20" fill="#bbf7d0"/>
<line x1="40" y1="130" x2="200" y2="130" stroke="#64748b" stroke-width="3"/>
<g stroke="#64748b" stroke-width="2"><line x1="60" y1="120" x2="60" y2="130"/><line x1="120" y1="130" x2="120" y2="130"/><line x1="180" y1="120" x2="180" y2="130"/></g>
<text x="60" y="104" text-anchor="middle" class="svg-ink" font-size="11">R1</text><text x="120" y="154" text-anchor="middle" class="svg-ink" font-size="11">R2</text><text x="180" y="104" text-anchor="middle" class="svg-ink" font-size="11">R3</text>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="26">&#8594;</text><text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="11">LSDB view</text>
<rect x="420" y="30" width="200" height="150" rx="12" fill="#e2e8f0"/><text x="520" y="50" text-anchor="middle" class="svg-muted" font-size="12">Pseudonode view</text>
<circle cx="520" cy="115" r="22" fill="#ddd6fe"/><text x="520" y="119" text-anchor="middle" class="svg-ink" font-size="11">R3.01</text>
<circle cx="460" cy="85" r="18" fill="#bbf7d0"/><circle cx="460" cy="150" r="18" fill="#bbf7d0"/><circle cx="580" cy="115" r="18" fill="#bbf7d0"/>
<g stroke="#64748b" stroke-width="2"><line x1="476" y1="92" x2="500" y2="108"/><line x1="476" y1="145" x2="500" y2="125"/><line x1="562" y1="115" x2="542" y2="115"/></g>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">n routers: n links to the pseudonode instead of a full mesh</text>
</svg><p class="cap">The DIS represents a LAN as one pseudonode in the database.</p></div>

<h3>How IS-IS differs from OSPF's DR</h3>
<table class="cmp"><tr><th>Feature</th><th>OSPF DR</th><th>IS-IS DIS</th></tr>
<tr><td>Backup</td><td>BDR exists</td><td>No backup DIS</td></tr>
<tr><td>Preemption</td><td>No: first elected stays</td><td>Yes: a better priority takes over at once</td></tr>
<tr><td>Adjacencies</td><td>Only to DR/BDR</td><td>Routers are adjacent to everyone</td></tr>
<tr><td>Priority 0</td><td>Never elected</td><td>Still eligible (lowest preference)</td></tr>
<tr><td>Per level</td><td>n/a</td><td>One DIS for L1 and one for L2, possibly different routers</td></tr></table>

<h3>Point-to-point circuits</h3>
<p>A core link joins exactly two routers, so a DIS and pseudonode are pure overhead. On Ethernet core links provider engineers configure <code>isis network point-to-point</code>. Then: no election, no pseudonode LSP, no periodic CSNP, one hello type for both levels, a three-way handshake, and PSNP acknowledgements. Adjacencies come up faster and the database is smaller. Both ends must be configured the same way.</p>
<pre class="out"><span class="c">! Point-to-point link (two-area lab, after the p2p step)</span>
R2# show isis neighbors
R1              L1   Gi0/0         10.1.12.1       UP    27       <span class="hl">00</span>
R3              L2   Gi0/1         10.1.23.3       UP    27       <span class="hl">00</span></pre>
<p>Circuit Id 00 marks a point-to-point circuit. On a LAN the Circuit Id is the DIS name and a pseudonode number. From the troubleshooting lab, once its four tasks are solved, the LAN links show:</p>
<pre class="out">R1# show isis neighbors
R2              L1   Gi0/0         10.1.12.2       UP    22       <span class="hl">R2.01</span>

R3# show isis neighbors
R4              L1   Gi0/0         10.1.34.4       UP    22       <span class="hl">R3.01</span>
R2              L2   Gi0/1         10.1.23.2       UP    22       00</pre>
<p><code>R2.01</code> says "on this LAN the DIS is R2 and the pseudonode is number 01". The R3-R4 LAN uses R3.01, because the last task of the lab gives R3 a higher level-1 priority:</p>
<pre class="out">R3# show clns interface g0/0
    Level-1 Metric: 10, Priority: <span class="hl">100</span>, Circuit ID: R3.01
    DR ID: R3.01
    Number of active level-1 adjacencies: 1
    Level-2 Metric: 10, Priority: 64, Circuit ID: R3.01</pre>
<p>On R4 you can also see the pseudonode LSP itself in the database, with its own LSP ID:</p>
<pre class="out">R4# show isis database
IS-IS Level-1 Link State Database:
LSPID                 LSP Seq Num  LSP Checksum  LSP Holdtime/Rcvd      ATT/P/OL
R3.00-00              0x00000004   0x8867        1175/1200              1/0/0
<span class="hl">R3.01-00</span>              0x00000001   0x5490        1175/1200              0/0/0
R4.00-00            * 0x00000002   0x493B        1175/*                 0/0/0</pre>

<div class="eg"><p><b>Worked example.</b> Three routers on one VLAN, all default priority 64. R1 has MAC 5254.0001, R2 5254.0002, R3 5254.0003. Tie on priority, so the highest MAC wins: R3 is DIS for both levels. An engineer sets <code>isis priority 100 level-1</code> on R1. Because the DIS is preemptive, R1 becomes the level-1 DIS at once and a new pseudonode LSP is generated, while R3 stays the level-2 DIS. Two DIS on the same LAN, one per level, is perfectly normal.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Configuring point-to-point on one end only: one side sends p2p hellos and the other LAN hellos, so the adjacency stays down. (2) Setting priority 0 and assuming that router can never be DIS: in IS-IS it still can be, if nobody else is eligible. (3) Using a switch in the middle of a "point-to-point" link: it is a LAN, so keep the broadcast type or use a real p2p.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam may ask which router is the DIS from a table of priorities and MACs. Highest priority wins, then highest MAC, per level, with preemption and no backup. Pseudonode LSP IDs end in a non-zero number.</p></div>

<div class="scn"><h4>The router that kept winning the election</h4><p>Whenever a lab router rebooted on a shared LAN, routing paused briefly: a replacement with a higher MAC took over as DIS, flooded a new pseudonode LSP, and every router re-ran SPF. The team moved all core links to point-to-point, so there was no DIS and no election, and reboots no longer disturbed neighbours.</p><p><b>Lesson:</b> on two-router links, point-to-point removes a source of instability.</p></div>

<div class="iv"><p class="q">"Why does an SP engineer configure isis network point-to-point on Ethernet links?"</p><p>An Ethernet interface defaults to a broadcast circuit, which runs a DIS election and creates a pseudonode LSP and CSNP traffic even if only two routers are present. Point-to-point avoids all of this, brings the adjacency up faster, uses a three-way handshake and reduces the database size. It must be set at both ends.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>On a LAN the DIS (per level) creates a pseudonode LSP and sends CSNPs every 10 seconds.</li>
<li>Highest priority then highest MAC wins; DIS is preemptive and has no backup.</li>
<li>Circuit Id such as R3.01 shows the DIS and pseudonode; 00 means point-to-point.</li>
<li>Core links use isis network point-to-point on both ends.</li>
<li>Priority 0 is still eligible in IS-IS, unlike OSPF.</li>
</ul></div>
`,hi:`
<p>Ek meeting room ki kalpana karo jisme das log hain (das routers wali LAN). Agar har insaan ko baaki sab ko alag-alag brief karna pade to 45 baatchit hongi. Iski jagah group ek <b>chairperson</b> chunta hai jo minutes rakhta hai aur har kuch seconds mein chhota summary padhta hai. Baaki sab bas summary ko apne notes se compare karte hain. IS-IS mein chairperson <b>DIS</b>, Designated Intermediate System, hai, aur "minutes" ek banaya hua router hai jise <b>pseudonode</b> kehte hain.</p>

<h3>Broadcast link par kya hota hai</h3>
<p>Default mein IOS Ethernet interface ko <b>broadcast</b> circuit maanta hai. Us par routers:</p>
<ol>
<li>LAN hellos exchange karte hain (level 1 aur level 2 ke liye alag-alag) multicast MAC addresses par.</li>
<li><b>Har level ke liye DIS chunte hain.</b> Sabse zyada <b>priority</b> jeetti hai (default 64, range 0 se 127, <code>isis priority N [level-1|level-2]</code>). Tie ho to sabse bada <b>MAC address</b> (SNPA) jeetta hai.</li>
<li>DIS ek <b>pseudonode LSP</b> banata hai jo LAN ko represent karta hai. LAN ka har router pseudonode ko neighbour ki tarah list karta hai, aur pseudonode saare routers ko list karta hai. Pseudonode LSP ID ek non-zero number par khatam hota hai, jaise <b>R3.01-00</b>. Number DIS par local circuit ID hai.</li>
<li>DIS har <b>10 seconds par CSNP</b> multicast karta hai taaki saare routers missing LSPs detect aur repair kar saken, aur woh hellos teen guna tez bhejta hai (har 3.33 s, hold 10 s) taaki DIS failure jaldi notice ho.</li>
</ol>
<p>Full mesh ki jagah star-shaped description aa jaata hai: LSDB mein n routers ke beech n(n-1)/2 links ki jagah pseudonode ke n links hote hain. Pseudonode isi liye hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="LAN par pseudonode">
<rect x="20" y="30" width="200" height="150" rx="12" fill="#e2e8f0"/><text x="120" y="50" text-anchor="middle" class="svg-muted" font-size="12">Real topology (LAN)</text>
<circle cx="60" cy="100" r="20" fill="#bbf7d0"/><circle cx="120" cy="150" r="20" fill="#bbf7d0"/><circle cx="180" cy="100" r="20" fill="#bbf7d0"/>
<line x1="40" y1="130" x2="200" y2="130" stroke="#64748b" stroke-width="3"/>
<g stroke="#64748b" stroke-width="2"><line x1="60" y1="120" x2="60" y2="130"/><line x1="120" y1="130" x2="120" y2="130"/><line x1="180" y1="120" x2="180" y2="130"/></g>
<text x="60" y="104" text-anchor="middle" class="svg-ink" font-size="11">R1</text><text x="120" y="154" text-anchor="middle" class="svg-ink" font-size="11">R2</text><text x="180" y="104" text-anchor="middle" class="svg-ink" font-size="11">R3</text>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="26">&#8594;</text><text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="11">LSDB view</text>
<rect x="420" y="30" width="200" height="150" rx="12" fill="#e2e8f0"/><text x="520" y="50" text-anchor="middle" class="svg-muted" font-size="12">Pseudonode view</text>
<circle cx="520" cy="115" r="22" fill="#ddd6fe"/><text x="520" y="119" text-anchor="middle" class="svg-ink" font-size="11">R3.01</text>
<circle cx="460" cy="85" r="18" fill="#bbf7d0"/><circle cx="460" cy="150" r="18" fill="#bbf7d0"/><circle cx="580" cy="115" r="18" fill="#bbf7d0"/>
<g stroke="#64748b" stroke-width="2"><line x1="476" y1="92" x2="500" y2="108"/><line x1="476" y1="145" x2="500" y2="125"/><line x1="562" y1="115" x2="542" y2="115"/></g>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">n routers: full mesh ki jagah pseudonode ke n links</text>
</svg><p class="cap">DIS database mein LAN ko ek pseudonode ki tarah represent karta hai.</p></div>

<h3>OSPF ke DR se IS-IS kaise alag hai</h3>
<table class="cmp"><tr><th>Feature</th><th>OSPF DR</th><th>IS-IS DIS</th></tr>
<tr><td>Backup</td><td>BDR hota hai</td><td>Backup DIS nahi</td></tr>
<tr><td>Preemption</td><td>Nahi: pehle chuna gaya wahi rehta hai</td><td>Haan: behtar priority turant le leti hai</td></tr>
<tr><td>Adjacencies</td><td>Sirf DR/BDR se</td><td>Routers sabke saath adjacent hote hain</td></tr>
<tr><td>Priority 0</td><td>Kabhi nahi chuna jaata</td><td>Phir bhi eligible (sabse kam preference)</td></tr>
<tr><td>Per level</td><td>n/a</td><td>L1 ke liye ek aur L2 ke liye ek DIS, shayad alag routers</td></tr></table>

<h3>Point-to-point circuits</h3>
<p>Core link bilkul do routers ko jodta hai, isliye DIS aur pseudonode bas overhead hain. Ethernet core links par provider engineers <code>isis network point-to-point</code> configure karte hain. Phir: koi election nahi, koi pseudonode LSP nahi, koi periodic CSNP nahi, dono levels ke liye ek hello type, three-way handshake, aur PSNP acknowledgements. Adjacencies tez up hoti hain aur database chhota hota hai. Dono ends par same configuration chahiye.</p>
<pre class="out"><span class="c">! Point-to-point link (two-area lab, p2p step ke baad)</span>
R2# show isis neighbors
R1              L1   Gi0/0         10.1.12.1       UP    27       <span class="hl">00</span>
R3              L2   Gi0/1         10.1.23.3       UP    27       <span class="hl">00</span></pre>
<p>Circuit Id 00 point-to-point circuit ko mark karta hai. LAN par Circuit Id DIS ka naam aur pseudonode number hota hai. Troubleshooting lab se, jab uske chaaron tasks solve ho jaate hain, LAN links aise dikhte hain:</p>
<pre class="out">R1# show isis neighbors
R2              L1   Gi0/0         10.1.12.2       UP    22       <span class="hl">R2.01</span>

R3# show isis neighbors
R4              L1   Gi0/0         10.1.34.4       UP    22       <span class="hl">R3.01</span>
R2              L2   Gi0/1         10.1.23.2       UP    22       00</pre>
<p><code>R2.01</code> kehta hai "is LAN par DIS R2 hai aur pseudonode number 01 hai". R3-R4 LAN R3.01 use karta hai, kyunki lab ka aakhri task R3 ko higher level-1 priority deta hai:</p>
<pre class="out">R3# show clns interface g0/0
    Level-1 Metric: 10, Priority: <span class="hl">100</span>, Circuit ID: R3.01
    DR ID: R3.01
    Number of active level-1 adjacencies: 1
    Level-2 Metric: 10, Priority: 64, Circuit ID: R3.01</pre>
<p>R4 par aap pseudonode LSP ko database mein bhi dekh sakte ho, uski apni LSP ID ke saath:</p>
<pre class="out">R4# show isis database
IS-IS Level-1 Link State Database:
LSPID                 LSP Seq Num  LSP Checksum  LSP Holdtime/Rcvd      ATT/P/OL
R3.00-00              0x00000004   0x8867        1175/1200              1/0/0
<span class="hl">R3.01-00</span>              0x00000001   0x5490        1175/1200              0/0/0
R4.00-00            * 0x00000002   0x493B        1175/*                 0/0/0</pre>

<div class="eg"><p><b>Worked example.</b> Ek VLAN par teen routers, sab default priority 64. R1 ka MAC 5254.0001, R2 ka 5254.0002, R3 ka 5254.0003. Priority par tie hai, isliye sabse bada MAC jeetta hai: R3 dono levels ka DIS hai. Engineer R1 par <code>isis priority 100 level-1</code> set karta hai. DIS preemptive hai, isliye R1 turant level-1 DIS ban jaata hai aur naya pseudonode LSP generate hota hai, jabki R3 level-2 DIS rehta hai. Ek hi LAN par do DIS, har level ke liye ek, bilkul normal hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Point-to-point sirf ek end par configure karna: ek side p2p hellos bhejti hai aur doosri LAN hellos, isliye adjacency down rehti hai. (2) Priority 0 set karke maan lena ki woh router kabhi DIS nahi ban sakta: IS-IS mein ban sakta hai, agar koi aur eligible na ho. (3) "Point-to-point" link ke beech mein switch lagana: woh LAN hai, isliye broadcast type rakho ya asli p2p use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam priorities aur MACs ki table se poochh sakta hai ki DIS kaun hai. Sabse zyada priority jeetti hai, phir sabse bada MAC, har level ke liye, preemption ke saath aur backup ke bina. Pseudonode LSP IDs non-zero number par khatam hote hain.</p></div>

<div class="scn"><h4>Woh router jo election jeetta raha</h4><p>Jab bhi shared LAN par koi lab router reboot hota, routing thodi der ruk jaati: zyada MAC wala replacement DIS ban jaata, naya pseudonode LSP flood karta, aur har router SPF dobara chalata. Team ne saare core links point-to-point kar diye, isliye na DIS raha na election, aur reboots se neighbours disturb hona band ho gaya.</p><p><b>Lesson:</b> do-router links par point-to-point instability ka ek source hata deta hai.</p></div>

<div class="iv"><p class="q">"SP engineer Ethernet links par isis network point-to-point kyun configure karta hai?"</p><p>Ethernet interface default mein broadcast circuit hota hai, jo DIS election chalata hai aur pseudonode LSP aur CSNP traffic banata hai chahe sirf do routers hon. Point-to-point yeh sab hata deta hai, adjacency tez up karta hai, three-way handshake use karta hai aur database size kam karta hai. Ise dono ends par set karna padta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LAN par DIS (per level) pseudonode LSP banata hai aur har 10 seconds CSNPs bhejta hai.</li>
<li>Sabse zyada priority phir sabse bada MAC jeetta hai; DIS preemptive hai aur uska backup nahi.</li>
<li>R3.01 jaisi Circuit Id DIS aur pseudonode dikhati hai; 00 ka matlab point-to-point.</li>
<li>Core links dono ends par isis network point-to-point use karte hain.</li>
<li>IS-IS mein priority 0 bhi eligible hai, OSPF ke ulat.</li>
</ul></div>
`}};export{e as default};