var e={id:`neighbours-states-dr`,h:{en:`Neighbours, adjacency states and the DR`,hi:`Neighbours, adjacency states aur DR`},body:{en:`
<p>Two routers cannot exchange routes until they first become <b>neighbours</b> and then <b>adjacent</b>. Most OSPF problems you will meet are neighbours that never reach Full. If you understand the states, you can read exactly where a relationship stopped.</p>

<h3>Analogy: meeting a new colleague</h3>
<p>First you hear someone say hello (Hello packet). You check that you work in the same department and speak the same language (matching settings). You introduce yourselves and agree who talks first. Then you compare notes: "what projects do you know that I do not?" Finally you both have the same notes and can work together. OSPF follows the same steps.</p>

<h3>Hello packets and what must match</h3>
<p>Routers send <b>hello</b> packets every <b>10 seconds</b> on broadcast and point-to-point links (Junos default). The <b>dead interval</b> is 4 times the hello, so <b>40 seconds</b>: if no hello is heard for 40 seconds, the neighbour is declared down. Two routers become neighbours only if the following match in their hellos:</p>
<table class="cmp"><tr><th>Must match</th><th>Typical fault</th></tr>
<tr><td>Area ID</td><td>One end in area 0, the other in 0.0.0.1</td></tr>
<tr><td>Subnet and mask (on LAN links)</td><td>Interface addresses in different subnets</td></tr>
<tr><td>Hello and dead intervals</td><td>One end set <code>hello-interval 5</code></td></tr>
<tr><td>Authentication type and key</td><td>Password on one end only</td></tr>
<tr><td>Area type flags (stub)</td><td>One end configured stub</td></tr>
<tr><td>MTU (for the database exchange)</td><td>Stuck in ExStart</td></tr></table>
<p>The router ID must be <b>different</b> on the two routers. Interface type (broadcast or point-to-point) should also agree on both sides. Junos treats an Ethernet interface as a broadcast network by default; for a two-router link you can configure <code>interface-type p2p</code> on both ends to skip the DR election.</p>

<h3>The neighbour states</h3>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="OSPF neighbour states">
<rect x="4" y="40" width="80" height="40" rx="6" fill="#fed7aa"/><text x="44" y="64" text-anchor="middle" class="svg-ink" font-size="12">Down</text>
<rect x="94" y="40" width="80" height="40" rx="6" fill="#fde68a"/><text x="134" y="64" text-anchor="middle" class="svg-ink" font-size="12">Init</text>
<rect x="184" y="40" width="80" height="40" rx="6" fill="#fde68a"/><text x="224" y="64" text-anchor="middle" class="svg-ink" font-size="12">2Way</text>
<rect x="274" y="40" width="80" height="40" rx="6" fill="#ddd6fe"/><text x="314" y="64" text-anchor="middle" class="svg-ink" font-size="12">ExStart</text>
<rect x="364" y="40" width="80" height="40" rx="6" fill="#ddd6fe"/><text x="404" y="64" text-anchor="middle" class="svg-ink" font-size="12">Exchange</text>
<rect x="454" y="40" width="80" height="40" rx="6" fill="#ddd6fe"/><text x="494" y="64" text-anchor="middle" class="svg-ink" font-size="12">Loading</text>
<rect x="544" y="40" width="80" height="40" rx="6" fill="#bbf7d0"/><text x="584" y="64" text-anchor="middle" class="svg-ink" font-size="12">Full</text>
<text x="134" y="105" text-anchor="middle" class="svg-muted" font-size="10">hello heard</text><text x="224" y="105" text-anchor="middle" class="svg-muted" font-size="10">two-way hello</text><text x="314" y="105" text-anchor="middle" class="svg-muted" font-size="10">master/slave</text><text x="404" y="105" text-anchor="middle" class="svg-muted" font-size="10">DBD swap</text><text x="494" y="105" text-anchor="middle" class="svg-muted" font-size="10">LSR/LSU</text><text x="584" y="105" text-anchor="middle" class="svg-muted" font-size="10">synchronised</text>
</svg><p class="cap">The journey to Full. Where a neighbour stops tells you what is wrong.</p></div>
<ul>
<li><b>Down:</b> no hello received.</li>
<li><b>Init:</b> a hello was heard, but the neighbour has not yet seen us in its hello.</li>
<li><b>2Way:</b> each router sees its own ID in the other's hello. On a broadcast link, routers that are not DR or BDR stay in 2Way with each other, which is normal.</li>
<li><b>ExStart:</b> choose master and slave and start the DBD exchange. A router stuck here often has an <b>MTU mismatch</b>.</li>
<li><b>Exchange:</b> swap Database Description packets (summaries of LSAs).</li>
<li><b>Loading:</b> request (LSR) and receive (LSU) the LSAs that are missing.</li>
<li><b>Full:</b> databases are synchronised. This is the target. On a LAN, Full is reached only with the DR and BDR.</li></ul>
<p>The log line you saw in the monitoring module, <code>state changed from Loading to Full</code>, is the last step of this journey.</p>

<h3>The Designated Router</h3>
<p>On a multi-access segment such as Ethernet, if every router formed a full adjacency with every other, the number of adjacencies and flooded updates would explode. OSPF elects a <b>Designated Router (DR)</b> and a <b>Backup DR (BDR)</b>; all other routers (DROthers) form Full adjacencies only with these two. Updates go to the DR at 224.0.0.6, and the DR floods to everyone at 224.0.0.5.</p>
<ul>
<li>The election winner has the highest <b>priority</b> (Junos default 128; 0 means never DR). On a tie, the highest router ID wins.</li>
<li>The election is <b>not pre-emptive</b>: a better router joining later does not take over until the DR fails or OSPF restarts.</li>
<li>On a point-to-point link there is no DR.</li></ul>
<pre class="out">lab@R1-INDORE&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.4.12.2        ge-0/0/0.0             <span class="hl">Full</span>            10.255.4.2       128    40
10.4.13.2        ge-0/0/1.0             Full            10.255.4.3       128    31
</pre>

<div class="warn"><p><b>Common mistakes.</b> Reading 2Way between two routers on a LAN as a fault: it is normal between two DROthers. Reading Init as "almost there": Init means hellos are only going one way, often a filter or a mismatched area or subnet on the far side.</p></div>
<div class="exam"><p><b>Exam trap.</b> Defaults: hello 10 s, dead 40 s, priority 128. Priority 0 is never DR. DR election is not pre-emptive. Neighbours need matching area, hello and dead timers, subnet, authentication. A router stuck at ExStart: think MTU.</p></div>

<div class="scn"><h4>Stuck at 2Way</h4><p>A new switch was added to a LAN with three routers. A junior engineer saw two neighbours showing 2Way and reported OSPF broken. The senior engineer checked show ospf interface: the two stuck neighbours were DROthers, and both were Full with the DR and the BDR. Nothing was wrong. The routes were present and the traffic worked.</p><p><b>Lesson:</b> 2Way is a normal final state between DROthers on a LAN.</p></div>

<div class="iv"><p class="q">"List the OSPF neighbour states and what each means. Why is Full needed?"</p><p>Down, Init, 2Way, ExStart, Exchange, Loading, Full. Hello heard; bidirectional; master/slave chosen; database summaries exchanged; missing LSAs requested and received; synchronised. Only Full neighbours exchange routes for SPF. Mention that on broadcast networks only DR and BDR adjacencies reach Full.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hello every 10 s, dead 40 s; area, timers, subnet, authentication and area type must match.</li>
<li>States: Down, Init, 2Way, ExStart, Exchange, Loading, Full.</li>
<li>Stuck at Init means one-way hellos; stuck at ExStart often means MTU mismatch.</li>
<li>On LANs, a DR and BDR are elected: priority 128 default, highest wins, not pre-emptive.</li>
<li>2Way between DROthers is normal.</li>
</ul></div>
`,hi:`
<p>Do routers tab tak routes exchange nahi kar sakte jab tak woh pehle <b>neighbours</b> aur phir <b>adjacent</b> na ban jaayein. OSPF ki zyadatar problems jo aap dekhoge woh neighbours hain jo kabhi Full tak nahi pahunchte. States samajh lo to aap padh sakte ho ki rishta kahan ruka.</p>

<h3>Analogy: naye colleague se milna</h3>
<p>Pehle koi hello kehta hai (Hello packet). Aap check karte ho ki aap same department mein ho aur same bhasha bolte ho (matching settings). Aap parichay dete ho aur tay karte ho pehle kaun bolega. Phir notes compare karte ho: "tum kaunse projects jaante ho jo main nahi jaanta?" Aakhir mein dono ke paas same notes hote hain aur saath kaam kar sakte ho. OSPF bhi yahi steps follow karta hai.</p>

<h3>Hello packets aur kya match hona chahiye</h3>
<p>Routers broadcast aur point-to-point links par har <b>10 second</b> mein <b>hello</b> packets bhejte hain (Junos default). <b>Dead interval</b> hello ka 4 guna, yaani <b>40 second</b> hai: 40 second tak hello na sune to neighbour down maana jaata hai. Do routers tabhi neighbours bante hain jab hellos mein yeh match karein:</p>
<table class="cmp"><tr><th>Match hona chahiye</th><th>Typical fault</th></tr>
<tr><td>Area ID</td><td>Ek end area 0 mein, doosra 0.0.0.1 mein</td></tr>
<tr><td>Subnet aur mask (LAN links par)</td><td>Interface addresses alag subnets mein</td></tr>
<tr><td>Hello aur dead intervals</td><td>Ek end ne <code>hello-interval 5</code> set kiya</td></tr>
<tr><td>Authentication type aur key</td><td>Password sirf ek end par</td></tr>
<tr><td>Area type flags (stub)</td><td>Ek end stub configure hai</td></tr>
<tr><td>MTU (database exchange ke liye)</td><td>ExStart mein atka</td></tr></table>
<p>Router ID dono routers par <b>alag</b> hona chahiye. Interface type (broadcast ya point-to-point) bhi dono taraf agree hona chahiye. Junos Ethernet interface ko default mein broadcast network maanta hai; do-router link ke liye dono ends par <code>interface-type p2p</code> configure karke DR election skip kar sakte ho.</p>

<h3>Neighbour states</h3>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="OSPF neighbour states">
<rect x="4" y="40" width="80" height="40" rx="6" fill="#fed7aa"/><text x="44" y="64" text-anchor="middle" class="svg-ink" font-size="12">Down</text>
<rect x="94" y="40" width="80" height="40" rx="6" fill="#fde68a"/><text x="134" y="64" text-anchor="middle" class="svg-ink" font-size="12">Init</text>
<rect x="184" y="40" width="80" height="40" rx="6" fill="#fde68a"/><text x="224" y="64" text-anchor="middle" class="svg-ink" font-size="12">2Way</text>
<rect x="274" y="40" width="80" height="40" rx="6" fill="#ddd6fe"/><text x="314" y="64" text-anchor="middle" class="svg-ink" font-size="12">ExStart</text>
<rect x="364" y="40" width="80" height="40" rx="6" fill="#ddd6fe"/><text x="404" y="64" text-anchor="middle" class="svg-ink" font-size="12">Exchange</text>
<rect x="454" y="40" width="80" height="40" rx="6" fill="#ddd6fe"/><text x="494" y="64" text-anchor="middle" class="svg-ink" font-size="12">Loading</text>
<rect x="544" y="40" width="80" height="40" rx="6" fill="#bbf7d0"/><text x="584" y="64" text-anchor="middle" class="svg-ink" font-size="12">Full</text>
<text x="134" y="105" text-anchor="middle" class="svg-muted" font-size="10">hello suna</text><text x="224" y="105" text-anchor="middle" class="svg-muted" font-size="10">two-way hello</text><text x="314" y="105" text-anchor="middle" class="svg-muted" font-size="10">master/slave</text><text x="404" y="105" text-anchor="middle" class="svg-muted" font-size="10">DBD swap</text><text x="494" y="105" text-anchor="middle" class="svg-muted" font-size="10">LSR/LSU</text><text x="584" y="105" text-anchor="middle" class="svg-muted" font-size="10">synchronised</text>
</svg><p class="cap">Full tak ka safar. Neighbour kahan rukta hai yeh batata hai kya galat hai.</p></div>
<ul>
<li><b>Down:</b> koi hello nahi mila.</li>
<li><b>Init:</b> hello suna, lekin neighbour ne abhi tak hume apne hello mein nahi dekha.</li>
<li><b>2Way:</b> har router doosre ke hello mein apna ID dekhta hai. Broadcast link par jo routers DR ya BDR nahi hain woh ek doosre ke saath 2Way mein rehte hain, jo normal hai.</li>
<li><b>ExStart:</b> master aur slave chuno aur DBD exchange shuru karo. Yahan atka router aksar <b>MTU mismatch</b> se hota hai.</li>
<li><b>Exchange:</b> Database Description packets (LSAs ke summaries) swap karo.</li>
<li><b>Loading:</b> jo LSAs missing hain unhe maango (LSR) aur receive karo (LSU).</li>
<li><b>Full:</b> databases synchronised hain. Yahi target hai. LAN par Full sirf DR aur BDR ke saath hota hai.</li></ul>
<p>Monitoring module mein dekhi log line, <code>state changed from Loading to Full</code>, is safar ka aakhri step hai.</p>

<h3>Designated Router</h3>
<p>Ethernet jaise multi-access segment par har router har doosre ke saath full adjacency banaye to adjacencies aur flooded updates ki ginti phat jaaye. OSPF ek <b>Designated Router (DR)</b> aur ek <b>Backup DR (BDR)</b> elect karta hai; baaki sab routers (DROthers) sirf in do ke saath Full adjacency banate hain. Updates DR ko 224.0.0.6 par jaate hain, aur DR sabko 224.0.0.5 par flood karta hai.</p>
<ul>
<li>Election ka winner sabse zyada <b>priority</b> wala hota hai (Junos default 128; 0 matlab kabhi DR nahi). Tie par sabse bada router ID jeetta hai.</li>
<li>Election <b>pre-emptive nahi</b> hai: baad mein judne wala behtar router tab tak nahi leta jab tak DR fail ya OSPF restart na ho.</li>
<li>Point-to-point link par DR nahi hota.</li></ul>
<pre class="out">lab@R1-INDORE&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.4.12.2        ge-0/0/0.0             <span class="hl">Full</span>            10.255.4.2       128    40
10.4.13.2        ge-0/0/1.0             Full            10.255.4.3       128    31
</pre>

<div class="warn"><p><b>Common mistakes.</b> LAN par do routers ke beech 2Way ko fault samajhna: do DROthers ke beech yeh normal hai. Init ko "lagbhag ho gaya" samajhna: Init ka matlab hellos sirf ek taraf ja rahe hain, aksar far side par filter ya mismatched area ya subnet.</p></div>
<div class="exam"><p><b>Exam trap.</b> Defaults: hello 10 s, dead 40 s, priority 128. Priority 0 kabhi DR nahi. DR election pre-emptive nahi. Neighbours ko area, hello aur dead timers, subnet, authentication match chahiye. ExStart mein atka router: MTU socho.</p></div>

<div class="scn"><h4>2Way par atka</h4><p>Teen routers wale LAN mein naya switch jodi gayi. Ek junior engineer ne do neighbours 2Way dikhate dekhe aur OSPF kharab bata diya. Senior engineer ne show ospf interface check kiya: dono atke neighbours DROthers the, aur dono DR aur BDR ke saath Full the. Kuch galat nahi tha. Routes maujood the aur traffic chal raha tha.</p><p><b>Lesson:</b> LAN par DROthers ke beech 2Way normal final state hai.</p></div>

<div class="iv"><p class="q">"OSPF neighbour states list karo aur har ek ka matlab batao. Full kyun zaroori hai?"</p><p>Down, Init, 2Way, ExStart, Exchange, Loading, Full. Hello suna; bidirectional; master/slave chuna gaya; database summaries exchange; missing LSAs maange aur mile; synchronised. Sirf Full neighbours SPF ke liye routes exchange karte hain. Batao ki broadcast networks par sirf DR aur BDR adjacencies Full tak jaati hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hello har 10 s, dead 40 s; area, timers, subnet, authentication aur area type match hone chahiye.</li>
<li>States: Down, Init, 2Way, ExStart, Exchange, Loading, Full.</li>
<li>Init mein atka matlab one-way hellos; ExStart mein atka aksar MTU mismatch.</li>
<li>LANs par DR aur BDR elect hote hain: priority 128 default, sabse bada jeetta hai, pre-emptive nahi.</li>
<li>DROthers ke beech 2Way normal hai.</li>
</ul></div>
`}};export{e as default};