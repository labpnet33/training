var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now bring up OSPF, read its state, find faults and steer traffic. Review this page before the labs, interviews and the JN0-106 exam.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="OSPF in one picture">
<rect x="20" y="20" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="46" text-anchor="middle" class="svg-ink" font-size="13">Hello</text><text x="85" y="64" text-anchor="middle" class="svg-muted" font-size="11">find neighbours</text>
<rect x="175" y="20" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="240" y="46" text-anchor="middle" class="svg-ink" font-size="13">Full adjacency</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="11">swap LSAs</text>
<rect x="330" y="20" width="130" height="60" rx="10" fill="#fde68a"/><text x="395" y="46" text-anchor="middle" class="svg-ink" font-size="13">LSDB + SPF</text><text x="395" y="64" text-anchor="middle" class="svg-muted" font-size="11">lowest total cost</text>
<rect x="485" y="20" width="135" height="60" rx="10" fill="#bbf7d0"/><text x="552" y="46" text-anchor="middle" class="svg-ink" font-size="13">Route in inet.0</text><text x="552" y="64" text-anchor="middle" class="svg-muted" font-size="11">OSPF/10</text>
<line x1="150" y1="50" x2="175" y2="50" stroke="#64748b" stroke-width="2"/><line x1="305" y1="50" x2="330" y2="50" stroke="#64748b" stroke-width="2"/><line x1="460" y1="50" x2="485" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="120" y="115" width="400" height="55" rx="10" fill="#fed7aa"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Must match: area, hello/dead, subnet, auth, area type</text><text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="11">router ID unique; MTU equal; interface not passive on a link</text>
</svg><p class="cap">The life of an OSPF route.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can describe OSPF as a link-state protocol using IP protocol 89, multicast 224.0.0.5 and 224.0.0.6.</li>
<li>I can configure <code>protocols ospf area 0.0.0.0 interface ...</code> and set a router ID.</li>
<li>I know hello 10 s, dead 40 s and priority 128 as defaults.</li>
<li>I can read the states Down, Init, 2Way, ExStart, Exchange, Loading, Full.</li>
<li>I can explain DR, BDR and DROther on a LAN.</li>
<li>I can use show ospf neighbor, interface, database and route.</li>
<li>I know LSA types 1 to 5, ABR, ASBR and why area 0 is the backbone.</li>
<li>I can compute cost from reference bandwidth (100 Mbps default) and set metric or reference-bandwidth.</li>
<li>I can solve the three lab tickets: Indore, Vizag and Mysuru.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Adjacency</dt><dd>A Full relationship between two OSPF routers that exchanged databases.</dd>
<dt>LSA / LSDB</dt><dd>Link-state advertisement and the database of them, identical within an area.</dd>
<dt>SPF</dt><dd>The algorithm that builds the shortest-path tree from the LSDB.</dd>
<dt>Cost</dt><dd>OSPF metric, reference bandwidth divided by interface bandwidth.</dd>
<dt>DR / BDR</dt><dd>Designated and backup designated router elected on a broadcast LAN.</dd>
<dt>ABR / ASBR</dt><dd>Router joining areas; router injecting external routes.</dd>
<dt>Passive</dt><dd>An interface advertised in OSPF but sending no hellos.</dd>
<dt>Router ID</dt><dd>A 32-bit unique name, often the loopback address.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>OSPF IP protocol number</td><td>89</td></tr>
<tr><td>Multicast addresses</td><td>224.0.0.5 all routers, 224.0.0.6 DRs</td></tr>
<tr><td>Hello / dead</td><td>10 / 40 seconds on broadcast</td></tr>
<tr><td>OSPF internal preference</td><td>10 (external 150)</td></tr>
<tr><td>Backbone area</td><td>0.0.0.0</td></tr>
<tr><td>Final good state</td><td>Full (2Way between DROthers)</td></tr>
<tr><td>Metric formula</td><td>reference bandwidth / interface bandwidth</td></tr>
<tr><td>DR election</td><td>Highest priority, then highest router ID</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">set routing-options router-id 10.255.4.1
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0
set protocols ospf area 0.0.0.0 interface lo0.0 passive
set protocols ospf reference-bandwidth 100g
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 metric 500
delete protocols ospf area 0.0.0.0 interface ge-0/0/0.0 hello-interval

show ospf neighbor
show ospf interface detail
show ospf database
show route protocol ospf
show log messages | match OSPF</pre>
<div class="warn"><p><b>Common mistake.</b> Forgetting that a mismatch can hide behind another one. Check each link on its own.</p></div>
<div class="exam"><p><b>Exam trap.</b> A question that asks for the neighbour state when one router has a different hello interval: the answer is no neighbour at all, not Init.</p></div>

<div class="scn"><h4>A day in the life</h4><p>A new branch router joined a ring. The engineer added its interfaces to area 0, saw Init on one link and fixed a hello mismatch, then noticed traffic still used a slow link because the reference bandwidth differed on one router. After aligning it and setting metric 500 on the rented link, the show route output showed one clean next hop and a traceroute confirmed the path.</p><p><b>Lesson:</b> check adjacency first, cost second.</p></div>

<div class="iv"><p class="q">"Describe OSPF from start to route in two minutes."</p><p>Routers send hellos to 224.0.0.5, agree on parameters, become neighbours, elect a DR on LANs, and form adjacencies by exchanging database descriptions and LSAs until Full. Each router builds the same LSDB per area, runs SPF to the lowest total cost, and installs OSPF routes with preference 10 in inet.0.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hello, adjacency, LSDB, SPF, route.</li>
<li>Match area, timers, subnet and authentication.</li>
<li>Cost comes from bandwidth; change the reference or the metric.</li>
<li>Read the state to know which fault to chase.</li>
<li>Next module: continue with the rest of the JNCIA path.</li>
</ul></div>
`,hi:`
<p>Ab aap OSPF up kar sakte ho, uski state padh sakte ho, faults dhoondh sakte ho aur traffic mod sakte ho. Labs, interviews aur JN0-106 exam se pehle yeh page review karo.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="OSPF in one picture">
<rect x="20" y="20" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="46" text-anchor="middle" class="svg-ink" font-size="13">Hello</text><text x="85" y="64" text-anchor="middle" class="svg-muted" font-size="11">neighbours dhoondo</text>
<rect x="175" y="20" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="240" y="46" text-anchor="middle" class="svg-ink" font-size="13">Full adjacency</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="11">LSAs ki adla-badli</text>
<rect x="330" y="20" width="130" height="60" rx="10" fill="#fde68a"/><text x="395" y="46" text-anchor="middle" class="svg-ink" font-size="13">LSDB + SPF</text><text x="395" y="64" text-anchor="middle" class="svg-muted" font-size="11">lowest total cost</text>
<rect x="485" y="20" width="135" height="60" rx="10" fill="#bbf7d0"/><text x="552" y="46" text-anchor="middle" class="svg-ink" font-size="13">inet.0 mein route</text><text x="552" y="64" text-anchor="middle" class="svg-muted" font-size="11">OSPF/10</text>
<line x1="150" y1="50" x2="175" y2="50" stroke="#64748b" stroke-width="2"/><line x1="305" y1="50" x2="330" y2="50" stroke="#64748b" stroke-width="2"/><line x1="460" y1="50" x2="485" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="120" y="115" width="400" height="55" rx="10" fill="#fed7aa"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Match: area, hello/dead, subnet, auth, area type</text><text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="11">router ID unique; MTU barabar; link par passive nahi</text>
</svg><p class="cap">OSPF route ki zindagi.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main OSPF ko link-state protocol bata sakta hoon jo IP protocol 89, multicast 224.0.0.5 aur 224.0.0.6 use karta hai.</li>
<li>Main <code>protocols ospf area 0.0.0.0 interface ...</code> configure kar sakta hoon aur router ID set karta hoon.</li>
<li>Mujhe defaults pata hain: hello 10 s, dead 40 s, priority 128.</li>
<li>Main states padh sakta hoon: Down, Init, 2Way, ExStart, Exchange, Loading, Full.</li>
<li>Main LAN par DR, BDR aur DROther samjha sakta hoon.</li>
<li>Main show ospf neighbor, interface, database aur route use karta hoon.</li>
<li>Mujhe LSA types 1 se 5, ABR, ASBR aur area 0 backbone kyun hai, yeh pata hai.</li>
<li>Main reference bandwidth (default 100 Mbps) se cost nikaal sakta hoon aur metric ya reference-bandwidth set karta hoon.</li>
<li>Main teeno lab tickets solve kar sakta hoon: Indore, Vizag aur Mysuru.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Adjacency</dt><dd>Do OSPF routers ke beech Full rishta jinhone databases exchange kiye.</dd>
<dt>LSA / LSDB</dt><dd>Link-state advertisement aur unka database, ek area mein identical.</dd>
<dt>SPF</dt><dd>Woh algorithm jo LSDB se shortest-path tree banata hai.</dd>
<dt>Cost</dt><dd>OSPF metric, reference bandwidth bhaag interface bandwidth.</dd>
<dt>DR / BDR</dt><dd>Broadcast LAN par chune gaye designated aur backup designated router.</dd>
<dt>ABR / ASBR</dt><dd>Areas ko jodne wala router; external routes daalne wala router.</dd>
<dt>Passive</dt><dd>OSPF mein advertise hone wala interface jo hello nahi bhejta.</dd>
<dt>Router ID</dt><dd>32-bit unique naam, aksar loopback address.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Jawab</th></tr>
<tr><td>OSPF IP protocol number</td><td>89</td></tr>
<tr><td>Multicast addresses</td><td>224.0.0.5 all routers, 224.0.0.6 DRs</td></tr>
<tr><td>Hello / dead</td><td>Broadcast par 10 / 40 seconds</td></tr>
<tr><td>OSPF internal preference</td><td>10 (external 150)</td></tr>
<tr><td>Backbone area</td><td>0.0.0.0</td></tr>
<tr><td>Antim achhi state</td><td>Full (DROthers ke beech 2Way)</td></tr>
<tr><td>Metric formula</td><td>reference bandwidth / interface bandwidth</td></tr>
<tr><td>DR election</td><td>Highest priority, phir highest router ID</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">set routing-options router-id 10.255.4.1
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0
set protocols ospf area 0.0.0.0 interface lo0.0 passive
set protocols ospf reference-bandwidth 100g
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 metric 500
delete protocols ospf area 0.0.0.0 interface ge-0/0/0.0 hello-interval

show ospf neighbor
show ospf interface detail
show ospf database
show route protocol ospf
show log messages | match OSPF</pre>
<div class="warn"><p><b>Common mistake.</b> Yeh bhool jaana ki ek mismatch doosre ke peeche chhup sakta hai. Har link ko alag se check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal jo poochta hai ki ek router ka hello interval alag ho to neighbour state kya hogi: jawab hai koi neighbour hi nahi, Init nahi.</p></div>

<div class="scn"><h4>Ek din ki kahani</h4><p>Ek naya branch router ring mein judha. Engineer ne uske interfaces area 0 mein daale, ek link par Init dekha aur hello mismatch theek kiya, phir dekha ki traffic abhi bhi slow link use kar raha hai kyunki ek router par reference bandwidth alag thi. Use barabar karke aur kiraye wale link par metric 500 lagakar show route mein ek saaf next hop dikha aur traceroute ne path confirm kiya.</p><p><b>Lesson:</b> pehle adjacency check karo, phir cost.</p></div>

<div class="iv"><p class="q">"Do minute mein OSPF shuru se route tak samjhao."</p><p>Routers 224.0.0.5 par hellos bhejte hain, parameters par sahmat hote hain, neighbour bante hain, LAN par DR chunte hain, aur database descriptions aur LSAs exchange karke Full adjacency banate hain. Har router ek area ka same LSDB banata hai, lowest total cost tak SPF chalata hai, aur OSPF routes preference 10 ke saath inet.0 mein install karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hello, adjacency, LSDB, SPF, route.</li>
<li>Area, timers, subnet aur authentication match karao.</li>
<li>Cost bandwidth se aati hai; reference ya metric badlo.</li>
<li>State padho taaki pata chale kaunsa fault chase karna hai.</li>
<li>Agla module: JNCIA path ke baaki topics.</li>
</ul></div>
`}};export{e as default};