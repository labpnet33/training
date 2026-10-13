var e={id:`show-commands`,h:{en:`The OSPF show commands: neighbor, interface, database, route`,hi:`OSPF show commands: neighbor, interface, database, route`},body:{en:`
<p>Four commands answer almost every OSPF question. Use them in order from the bottom up: is the interface in OSPF, is there a neighbour, are the databases full, and did a route come out the other end?</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Four show commands in order">
<rect x="10" y="30" width="140" height="80" rx="10" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="12">show ospf interface</text><text x="80" y="78" text-anchor="middle" class="svg-muted" font-size="11">Is OSPF running here?</text><text x="80" y="95" text-anchor="middle" class="svg-muted" font-size="11">area, cost, timers</text>
<rect x="170" y="30" width="140" height="80" rx="10" fill="#ddd6fe"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="12">show ospf neighbor</text><text x="240" y="78" text-anchor="middle" class="svg-muted" font-size="11">Who is my neighbour?</text><text x="240" y="95" text-anchor="middle" class="svg-muted" font-size="11">Is it Full?</text>
<rect x="330" y="30" width="140" height="80" rx="10" fill="#fde68a"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="12">show ospf database</text><text x="400" y="78" text-anchor="middle" class="svg-muted" font-size="11">Which LSAs do I hold?</text><text x="400" y="95" text-anchor="middle" class="svg-muted" font-size="11">who originated them</text>
<rect x="490" y="30" width="140" height="80" rx="10" fill="#bbf7d0"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="12">show ospf route</text><text x="560" y="78" text-anchor="middle" class="svg-muted" font-size="11">What did SPF compute?</text><text x="560" y="95" text-anchor="middle" class="svg-muted" font-size="11">then show route</text>
<line x1="150" y1="70" x2="170" y2="70" stroke="#64748b" stroke-width="2"/><line x1="310" y1="70" x2="330" y2="70" stroke="#64748b" stroke-width="2"/><line x1="470" y1="70" x2="490" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Work left to right until you find the first thing that is wrong</text>
</svg><p class="cap">The troubleshooting order for OSPF.</p></div>

<h3>1. show ospf interface</h3>
<p>This shows which interfaces run OSPF, in which area, their state, the DR and BDR, and how many neighbours are adjacent. Add <code>detail</code> for type, cost, timers, priority and authentication.</p>
<pre class="out">lab@R1-INDORE&gt; show ospf interface
Interface           State   Area            DR ID           BDR ID          Nbrs
ge-0/0/0.0          BDR     0.0.0.0         10.255.4.2      10.255.4.1         1
ge-0/0/1.0          BDR     0.0.0.0         10.255.4.3      10.255.4.1         1
ge-0/0/2.0          DRother 0.0.0.0         0.0.0.0         0.0.0.0            0
lo0.0               DR      0.0.0.0         0.0.0.0         0.0.0.0            0

lab@R1-INDORE&gt; show ospf interface ge-0/0/0.0 detail
Interface           State   Area            DR ID           BDR ID          Nbrs
ge-0/0/0.0          BDR     0.0.0.0         10.255.4.2      10.255.4.1         1
  Type: LAN, Address: 10.4.12.1, Mask: 255.255.255.252, MTU: 1500, Cost: 1
  DR addr: 10.4.12.2, Priority: 128
  Adj count: 1
  Hello: 10, Dead: 40, ReXmit: 5, Not Stub
  Auth type: None
</pre>
<p>What to read: is the interface listed at all (if not, it is not under <code>protocols ospf</code>)? Is the <b>Area</b> the same as the neighbour's? Is <b>Nbrs</b> above 0? On the <code>detail</code> view check <b>Hello</b> and <b>Dead</b> against the other end, <b>Cost</b>, <b>Priority</b>, and <b>Auth type</b>. An interface with 0 neighbours usually means a mismatch with the router on the other end.</p>

<h3>2. show ospf neighbor</h3>
<pre class="out">lab@R1-INDORE&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.4.12.2        ge-0/0/0.0             <span class="hl">Full</span>            10.255.4.2       128    40
10.4.13.2        ge-0/0/1.0             Full            10.255.4.3       128    31
</pre>
<p>Columns: the neighbour's interface <b>Address</b>, the local <b>Interface</b>, <b>State</b> (aim for Full), the neighbour's router <b>ID</b>, its <b>Pri</b>ority and the <b>Dead</b> countdown in seconds. The Dead timer counts down from 40 and resets to 40 each time a hello is heard; if you see it drop towards 0 repeatedly, hellos are being lost. <code>show ospf neighbor detail</code> adds uptime and the DR/BDR addresses. No line at all: no neighbour has been discovered.</p>

<h3>3. show ospf database</h3>
<p>The link-state database lists every LSA the router holds, grouped by type.</p>
<pre class="out">lab@R1-INDORE&gt; show ospf database
    OSPF database, Area 0.0.0.0
 Type       ID               Adv Rtr           Seq      Age  Opt  Cksum  Len 
Router  *10.255.4.1       10.255.4.1       0x80000003    26  0x22 0xc804  72
Router   10.255.4.2       10.255.4.2       0x80000003    26  0x22 0x113d  60
Router   10.255.4.3       10.255.4.3       0x80000002    66  0x22 0x1d5c  60
Router   10.255.4.4       10.255.4.4       0x80000002    66  0x22 0x5874  72
Network  10.4.12.2        10.255.4.2       0x80000001    26  0x22 0x9969  32
Network  10.4.13.2        10.255.4.3       0x80000001    66  0x22 0x28c5  32
Network  10.4.24.2        10.255.4.4       0x80000001    66  0x22 0x12da  32
Network  10.4.34.2        10.255.4.4       0x80000001   100  0x22 0xe1a6  32
</pre>
<p>The asterisk marks LSAs that this router originated. <b>Type</b> shows Router (type 1: each router describes its links) and Network (type 2: the DR describes a LAN segment). <b>Adv Rtr</b> is the originator, <b>Seq</b> the sequence number (higher is newer) and <b>Age</b> in seconds (LSAs are refreshed every 30 minutes). In a healthy single area, every router shows the same list, so counting the Router LSAs tells you how many routers are in the area: here 4. A missing router means that router is not in the database, so check its neighbours.</p>

<h3>4. show ospf route and show route protocol ospf</h3>
<pre class="out">lab@R1-INDORE&gt; show ospf route
Topology default Route Table:

Prefix             Path  Route      NH       Metric NextHop       Nexthop      
                   Type  Type       Type            Interface     Address/LSP
10.4.12.0/30       Intra Network    IP            1 ge-0/0/0.0    
10.4.13.0/30       Intra Network    IP            1 ge-0/0/1.0    
10.4.24.0/30       Intra Network    IP            2 ge-0/0/0.0    10.4.12.2
10.4.34.0/30       Intra Network    IP            2 ge-0/0/1.0    10.4.13.2
10.255.4.1/32      Intra Network    IP            0 lo0.0         
10.255.4.2/32      Intra Network    IP            1 ge-0/0/0.0    10.4.12.2
10.255.4.3/32      Intra Network    IP            1 ge-0/0/1.0    10.4.13.2
10.255.4.4/32      Intra Network    IP            2 ge-0/0/0.0    10.4.12.2
                                    IP              ge-0/0/1.0    10.4.13.2
172.16.44.0/24     Intra Network    IP            3 ge-0/0/0.0    10.4.12.2
                                    IP              ge-0/0/1.0    10.4.13.2
192.168.40.0/24    Intra Network    IP            1 ge-0/0/2.0    
</pre>
<p>This is what SPF computed: the prefix, <b>Path Type</b> (Intra = inside my area, Inter = from another area, Ext = external), the total <b>Metric</b> and the next hops. Then <code>show route protocol ospf</code> shows which of these became active routes in inet.0 with preference 10. A route can appear in the OSPF table but not in inet.0 if another source with a lower preference, for example a static route, already owns the prefix.</p>

<h3>Quick diagnostic table</h3>
<table class="cmp"><tr><th>What you see</th><th>Likely meaning</th></tr>
<tr><td>Interface not in show ospf interface</td><td>Not configured under protocols ospf (or no IP address, or disabled)</td></tr>
<tr><td>Interface listed, Nbrs 0</td><td>Mismatch with the far end: area, timers, subnet, auth</td></tr>
<tr><td>Neighbour in Init</td><td>One-way hellos</td></tr>
<tr><td>Neighbour in ExStart</td><td>MTU mismatch</td></tr>
<tr><td>Neighbour Full, no route</td><td>Remote interface not in OSPF, or lower-preference route exists</td></tr>
<tr><td>Route present, ping fails</td><td>Not an OSPF fault: check addressing and return path</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Checking only show ospf neighbor. A router with a Full neighbour can still lack a route because the LAN on the other side was never put into OSPF. Always follow through to show route.</p></div>
<div class="exam"><p><b>Exam trap.</b> Match the command to the question: neighbours and state = show ospf neighbor; area and timers = show ospf interface detail; LSAs = show ospf database; SPF result = show ospf route. An asterisk in the database means locally originated.</p></div>

<div class="scn"><h4>Counting routers in the database</h4><p>After a change, users in the Vizag branch lost the data centre. An engineer ran show ospf database on R1 and counted only three Router LSAs in a four-router ring. The missing one was R4. That immediately told her the problem was R4's adjacencies, not the data centre LAN. On R4 show ospf interface did not list the link towards R1: the interface had never been added to OSPF.</p><p><b>Lesson:</b> the database shows who is reachable in the area at a glance.</p></div>

<div class="iv"><p class="q">"Which OSPF show commands do you use and in what order?"</p><p>show ospf interface to confirm OSPF is on the right interfaces, in the right area, with matching timers; show ospf neighbor for state, aiming for Full; show ospf database for LSAs and originators; show ospf route for SPF results; then show route protocol ospf and a ping to confirm. Move from the first thing that is wrong.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Interface, neighbor, database, route: the four commands, in that order.</li>
<li>show ospf interface detail reveals area, hello, dead, cost, priority and auth.</li>
<li>Neighbour Dead timer counts down from 40 and resets with each hello.</li>
<li>The asterisk in the database marks locally originated LSAs; count Router LSAs to count routers.</li>
<li>OSPF routes appear in inet.0 with preference 10 unless a better source owns the prefix.</li>
</ul></div>
`,hi:`
<p>Chaar commands lagbhag har OSPF sawaal ka jawab dete hain. Unhe neeche se upar order mein use karo: interface OSPF mein hai, neighbour hai, databases full hain, aur doosre end se route nikla?</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Four show commands in order">
<rect x="10" y="30" width="140" height="80" rx="10" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="12">show ospf interface</text><text x="80" y="78" text-anchor="middle" class="svg-muted" font-size="11">Yahan OSPF chal raha hai?</text><text x="80" y="95" text-anchor="middle" class="svg-muted" font-size="11">area, cost, timers</text>
<rect x="170" y="30" width="140" height="80" rx="10" fill="#ddd6fe"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="12">show ospf neighbor</text><text x="240" y="78" text-anchor="middle" class="svg-muted" font-size="11">Mera neighbour kaun?</text><text x="240" y="95" text-anchor="middle" class="svg-muted" font-size="11">Full hai?</text>
<rect x="330" y="30" width="140" height="80" rx="10" fill="#fde68a"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="12">show ospf database</text><text x="400" y="78" text-anchor="middle" class="svg-muted" font-size="11">Kaunse LSAs mere paas?</text><text x="400" y="95" text-anchor="middle" class="svg-muted" font-size="11">kisne originate kiye</text>
<rect x="490" y="30" width="140" height="80" rx="10" fill="#bbf7d0"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="12">show ospf route</text><text x="560" y="78" text-anchor="middle" class="svg-muted" font-size="11">SPF ne kya nikala?</text><text x="560" y="95" text-anchor="middle" class="svg-muted" font-size="11">phir show route</text>
<line x1="150" y1="70" x2="170" y2="70" stroke="#64748b" stroke-width="2"/><line x1="310" y1="70" x2="330" y2="70" stroke="#64748b" stroke-width="2"/><line x1="470" y1="70" x2="490" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Baayein se daayein chalo jab tak pehli galat cheez na mile</text>
</svg><p class="cap">OSPF troubleshooting ka order.</p></div>

<h3>1. show ospf interface</h3>
<p>Yeh dikhata hai kaunse interfaces OSPF chalate hain, kis area mein, unki state, DR aur BDR, aur kitne neighbours adjacent hain. Type, cost, timers, priority aur authentication ke liye <code>detail</code> lagao.</p>
<pre class="out">lab@R1-INDORE&gt; show ospf interface
Interface           State   Area            DR ID           BDR ID          Nbrs
ge-0/0/0.0          BDR     0.0.0.0         10.255.4.2      10.255.4.1         1
ge-0/0/1.0          BDR     0.0.0.0         10.255.4.3      10.255.4.1         1
ge-0/0/2.0          DRother 0.0.0.0         0.0.0.0         0.0.0.0            0
lo0.0               DR      0.0.0.0         0.0.0.0         0.0.0.0            0

lab@R1-INDORE&gt; show ospf interface ge-0/0/0.0 detail
Interface           State   Area            DR ID           BDR ID          Nbrs
ge-0/0/0.0          BDR     0.0.0.0         10.255.4.2      10.255.4.1         1
  Type: LAN, Address: 10.4.12.1, Mask: 255.255.255.252, MTU: 1500, Cost: 1
  DR addr: 10.4.12.2, Priority: 128
  Adj count: 1
  Hello: 10, Dead: 40, ReXmit: 5, Not Stub
  Auth type: None
</pre>
<p>Kya padhna hai: interface list mein hai bhi (nahi to woh <code>protocols ospf</code> ke neeche configured nahi hai)? <b>Area</b> neighbour ke area jaisa hai? <b>Nbrs</b> 0 se zyada hai? <code>detail</code> view mein <b>Hello</b> aur <b>Dead</b> ko doosre end se milao, aur <b>Cost</b>, <b>Priority</b> aur <b>Auth type</b> dekho. 0 neighbours wala interface aksar doosre end ke router se mismatch dikhata hai.</p>

<h3>2. show ospf neighbor</h3>
<pre class="out">lab@R1-INDORE&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.4.12.2        ge-0/0/0.0             <span class="hl">Full</span>            10.255.4.2       128    40
10.4.13.2        ge-0/0/1.0             Full            10.255.4.3       128    31
</pre>
<p>Columns: neighbour ka interface <b>Address</b>, local <b>Interface</b>, <b>State</b> (Full chahiye), neighbour ka router <b>ID</b>, uski <b>Pri</b>ority aur seconds mein <b>Dead</b> countdown. Dead timer 40 se ghatta hai aur har hello sunne par 40 par reset hota hai; baar baar 0 ki taraf girta dikhe to hellos kho rahe hain. <code>show ospf neighbor detail</code> uptime aur DR/BDR addresses jodta hai. Koi line nahi: koi neighbour discover nahi hua.</p>

<h3>3. show ospf database</h3>
<p>Link-state database router ke paas har LSA type ke hisaab se list karta hai.</p>
<pre class="out">lab@R1-INDORE&gt; show ospf database
    OSPF database, Area 0.0.0.0
 Type       ID               Adv Rtr           Seq      Age  Opt  Cksum  Len 
Router  *10.255.4.1       10.255.4.1       0x80000003    26  0x22 0xc804  72
Router   10.255.4.2       10.255.4.2       0x80000003    26  0x22 0x113d  60
Router   10.255.4.3       10.255.4.3       0x80000002    66  0x22 0x1d5c  60
Router   10.255.4.4       10.255.4.4       0x80000002    66  0x22 0x5874  72
Network  10.4.12.2        10.255.4.2       0x80000001    26  0x22 0x9969  32
Network  10.4.13.2        10.255.4.3       0x80000001    66  0x22 0x28c5  32
Network  10.4.24.2        10.255.4.4       0x80000001    66  0x22 0x12da  32
Network  10.4.34.2        10.255.4.4       0x80000001   100  0x22 0xe1a6  32
</pre>
<p>Asterisk un LSAs ko mark karta hai jo is router ne originate kiye. <b>Type</b> Router (type 1: har router apne links batata hai) aur Network (type 2: DR LAN segment batata hai) dikhata hai. <b>Adv Rtr</b> originator hai, <b>Seq</b> sequence number (zyada matlab naya) aur <b>Age</b> seconds mein (LSAs har 30 minute refresh hote hain). Healthy single area mein har router same list dikhata hai, isliye Router LSAs ginne se pata chalta hai area mein kitne routers hain: yahan 4. Koi router missing ho to woh database mein nahi, isliye uske neighbours check karo.</p>

<h3>4. show ospf route aur show route protocol ospf</h3>
<pre class="out">lab@R1-INDORE&gt; show ospf route
Topology default Route Table:

Prefix             Path  Route      NH       Metric NextHop       Nexthop      
                   Type  Type       Type            Interface     Address/LSP
10.4.12.0/30       Intra Network    IP            1 ge-0/0/0.0    
10.4.13.0/30       Intra Network    IP            1 ge-0/0/1.0    
10.4.24.0/30       Intra Network    IP            2 ge-0/0/0.0    10.4.12.2
10.4.34.0/30       Intra Network    IP            2 ge-0/0/1.0    10.4.13.2
10.255.4.1/32      Intra Network    IP            0 lo0.0         
10.255.4.2/32      Intra Network    IP            1 ge-0/0/0.0    10.4.12.2
10.255.4.3/32      Intra Network    IP            1 ge-0/0/1.0    10.4.13.2
10.255.4.4/32      Intra Network    IP            2 ge-0/0/0.0    10.4.12.2
                                    IP              ge-0/0/1.0    10.4.13.2
172.16.44.0/24     Intra Network    IP            3 ge-0/0/0.0    10.4.12.2
                                    IP              ge-0/0/1.0    10.4.13.2
192.168.40.0/24    Intra Network    IP            1 ge-0/0/2.0    
</pre>
<p>Yeh SPF ka nateeja hai: prefix, <b>Path Type</b> (Intra = mere area ke andar, Inter = doosre area se, Ext = external), total <b>Metric</b> aur next hops. Phir <code>show route protocol ospf</code> dikhata hai inme se kaunse inet.0 mein preference 10 ke saath active route bane. Route OSPF table mein ho sakta hai lekin inet.0 mein nahi, agar kam preference wala koi aur source, jaise static route, pehle se prefix ka maalik ho.</p>

<h3>Quick diagnostic table</h3>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Sambhav matlab</th></tr>
<tr><td>Interface show ospf interface mein nahi</td><td>protocols ospf ke neeche configured nahi (ya IP address nahi, ya disabled)</td></tr>
<tr><td>Interface listed, Nbrs 0</td><td>Far end se mismatch: area, timers, subnet, auth</td></tr>
<tr><td>Neighbour Init mein</td><td>One-way hellos</td></tr>
<tr><td>Neighbour ExStart mein</td><td>MTU mismatch</td></tr>
<tr><td>Neighbour Full, route nahi</td><td>Remote interface OSPF mein nahi, ya kam-preference wala route maujood</td></tr>
<tr><td>Route hai, ping fail</td><td>OSPF fault nahi: addressing aur return path check karo</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Sirf show ospf neighbor check karna. Full neighbour wale router ke paas bhi route na ho sakta hai kyunki doosri taraf ka LAN kabhi OSPF mein daala hi nahi gaya. Hamesha show route tak follow karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Command ko sawaal se milao: neighbours aur state = show ospf neighbor; area aur timers = show ospf interface detail; LSAs = show ospf database; SPF result = show ospf route. Database mein asterisk matlab locally originated.</p></div>

<div class="scn"><h4>Database mein routers ginna</h4><p>Ek change ke baad Vizag branch ke users ne data centre kho diya. Engineer ne R1 par show ospf database chalaya aur chaar-router ring mein sirf teen Router LSAs ginne. Missing R4 tha. Isse turant pata chal gaya ki problem R4 ki adjacencies mein hai, data centre LAN mein nahi. R4 par show ospf interface ne R1 wala link list nahi kiya: interface kabhi OSPF mein add hi nahi hua tha.</p><p><b>Lesson:</b> database ek nazar mein dikhata hai area mein kaun reachable hai.</p></div>

<div class="iv"><p class="q">"Kaunse OSPF show commands use karte ho aur kis order mein?"</p><p>show ospf interface se confirm karo ki OSPF sahi interfaces par, sahi area mein, matching timers ke saath hai; show ospf neighbor se state, Full ka target; show ospf database se LSAs aur originators; show ospf route se SPF results; phir show route protocol ospf aur ping se confirm. Pehli galat cheez se aage badho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Interface, neighbor, database, route: chaar commands, isi order mein.</li>
<li>show ospf interface detail area, hello, dead, cost, priority aur auth dikhata hai.</li>
<li>Neighbour ka Dead timer 40 se ghatta hai aur har hello par reset hota hai.</li>
<li>Database mein asterisk locally originated LSAs mark karta hai; Router LSAs ginke routers ginte hain.</li>
<li>OSPF routes inet.0 mein preference 10 ke saath aate hain jab tak behtar source prefix ka maalik na ho.</li>
</ul></div>
`}};export{e as default};