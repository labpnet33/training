var e={id:`igp-foundations`,h:{en:`The IGP underlay: reading OSPF and IS-IS like an engineer`,hi:`IGP underlay: OSPF aur IS-IS ko engineer ki tarah padhna`},body:{en:`
<p>Everything above Layer 2 stands on the IGP. BGP next hops, EVPN VTEP addresses, multicast RPF checks and management access all need working loopback reachability. So the first professional skill is to <b>read the IGP state quickly and correctly</b>. This chapter shows the three questions to ask and the real simulator output that answers them. The later OSPF and IS-IS modules go deep.</p>

<h3>Question 1: who are my neighbours?</h3>
<p>No adjacency means no database, no routes. In OSPF use <code>show ospf neighbor</code>; in IS-IS use <code>show isis adjacency</code>. Look at the state (Full or Up) and at the interface.</p>
<pre class="out">lab@R2-HO&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.5.12.1        ge-0/0/0.0             Full            10.255.5.1       128    39
10.5.23.2        ge-0/0/1.0             <span class="hl">Full</span>            10.255.5.3       128    33
10.5.23.2        <span class="hl">vl-10.255.5.3</span>          Full            10.255.5.3         0    32

lab@R1&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R2             1 Up                   25
ge-0/0/1.0            R3             1 Up                   20</pre>
<p>The OSPF output comes from the virtual-link lab: the third line is a virtual link, shown as an interface named after the neighbour's router ID. In the IS-IS output the <b>L</b> column is the level of the adjacency.</p>

<h3>Question 2: what does the database say?</h3>
<p>The database is the truth the protocol believes. Routes are derived from it. <code>show ospf database</code> lists LSAs by type; <code>show isis database</code> lists LSPs and their attributes. You can see problems here that the routing table hides, such as a filtered route that still exists as an LSA.</p>
<pre class="out">lab@R1&gt; show ospf database summary
Area 0.0.0.0:
   3 Router LSAs
   1 Network LSAs
   7 Summary LSAs
Externals:

lab@R1&gt; show isis database
IS-IS level 1 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         0x1   0x3bc9     1140 L1
R2.00-00                         0x1   0xff60     1140 L1 L2 <span class="hl">Attached</span>
R3.00-00                         0x1   0x2f8c     1140 L1 L2 <span class="hl">Attached</span>
  3 LSPs</pre>
<p>The Attached flag on the L1/L2 routers tells L1-only router R1 to install a default route toward them. That small word explains why R1 shows <code>0.0.0.0/0 [IS-IS/15]</code> in the next question.</p>

<h3>Question 3: what did the routing table install, and why?</h3>
<p>The database feeds SPF, SPF feeds the routing table. Read the <b>preference</b> in brackets and the <b>metric</b>. Junos defaults: OSPF internal 10, OSPF external 150, IS-IS level 1 internal 15, level 2 internal 18, IS-IS level 1 external 160, level 2 external 165.</p>
<pre class="out">lab@R1&gt; show route protocol isis
inet.0: 8 destinations, 8 routes (8 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

0.0.0.0/0          *[IS-IS<span class="hl">/15</span>] 00:01:02, metric 10
                    &gt;  to 10.1.12.2 via ge-0/0/0.0
10.1.255.2/32      *[IS-IS/15] 00:01:02, metric 10
                    &gt;  to 10.1.12.2 via ge-0/0/0.0
10.1.255.3/32      *[IS-IS/15] 00:01:02, metric 20
                    &gt;  to 10.1.13.3 via ge-0/0/1.0</pre>

<h3>OSPF and IS-IS side by side</h3>
<table class="cmp"><tr><th>Idea</th><th>OSPF</th><th>IS-IS</th></tr>
<tr><td>Runs over</td><td>IP (protocol 89)</td><td>Directly on Layer 2 (CLNS), needs <code>family iso</code></td></tr>
<tr><td>Hierarchy</td><td>Areas, border inside a router (ABR)</td><td>Levels 1 and 2, border on the link</td></tr>
<tr><td>Identity</td><td>Router ID</td><td>NET: area plus system ID</td></tr>
<tr><td>Extra address families</td><td>OSPFv3 for IPv6</td><td>Same process carries IPv4 and IPv6</td></tr>
<tr><td>Routes from other protocols</td><td>Type 5 or 7 LSAs</td><td>External prefixes in LSPs</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A route to 172.16.5.0/24 is missing on R1. Walk the three questions. Neighbours: R2 is Full, so R1 hears R2. Database: <code>show ospf database netsummary</code> on R1 contains no summary for 172.16.5.0, so the problem is beyond R2. On R2, <code>show ospf interface</code> lists vl-10.255.5.3 as Down. The fault is one ABR away, found in three commands.</p></div>

<div class="warn"><p><b>Common mistake.</b> Looking only at the routing table. If a route is absent you must decide whether the protocol never learned it (database) or learned and rejected it (policy, preference, hidden). The table alone cannot tell you.</p></div>
<div class="exam"><p><b>Exam trap.</b> Preference decides between <i>protocols</i>; metric decides between paths of the <i>same</i> protocol. An OSPF external route (150) loses to an IS-IS level 2 internal route (18) for the same prefix, whatever the metrics.</p></div>

<div class="scn"><h4>Adjacency up, no routes</h4><p>A new core router showed a Full neighbour but no OSPF routes beyond the neighbour. The engineer compared the database and found Router LSAs from the new router but no summary LSAs. The router was an ABR in name only: it had no interface in area 0. Adding the uplink to area 0 filled the database.</p><p><b>Lesson:</b> an adjacency proves hellos work. The database proves the area design works.</p></div>

<div class="iv"><p class="q">"A route is missing from the routing table. Where do you look?"</p><p>First the protocol neighbours, then the protocol database to see whether the information arrived, then policy and preference to see whether it was rejected, then <code>show route hidden</code> for routes that exist but are unusable. State the order out loud: it shows method.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ask three questions: neighbours, database, routing table.</li>
<li>OSPF internal 10, external 150; IS-IS L1 15, L2 18, external 160 and 165.</li>
<li>The Attached flag on an LSP makes L1-only routers install a default route.</li>
<li>An OSPF virtual link appears as an interface named vl- plus the neighbour router ID.</li>
<li>The database shows what the protocol knows; the routing table shows what was selected.</li>
</ul></div>
`,hi:`
<p>Layer 2 ke upar sab kuch IGP par khada hai. BGP next hops, EVPN VTEP addresses, multicast RPF checks aur management access sab ko working loopback reachability chahiye. Isliye pehli professional skill hai <b>IGP state ko jaldi aur sahi padhna</b>. Yeh chapter teen sawal aur unka jawab dene wala asli simulator output dikhata hai. Baad ke OSPF aur IS-IS modules gehrai mein jaate hain.</p>

<h3>Sawal 1: mere neighbours kaun hain?</h3>
<p>Adjacency nahi to database nahi, routes nahi. OSPF mein <code>show ospf neighbor</code> use karo; IS-IS mein <code>show isis adjacency</code>. State (Full ya Up) aur interface dekho.</p>
<pre class="out">lab@R2-HO&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.5.12.1        ge-0/0/0.0             Full            10.255.5.1       128    39
10.5.23.2        ge-0/0/1.0             <span class="hl">Full</span>            10.255.5.3       128    33
10.5.23.2        <span class="hl">vl-10.255.5.3</span>          Full            10.255.5.3         0    32

lab@R1&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R2             1 Up                   25
ge-0/0/1.0            R3             1 Up                   20</pre>
<p>OSPF output virtual-link lab se hai: teesri line virtual link hai, jo neighbour ke router ID par naam wale interface ke roop mein dikhti hai. IS-IS output mein <b>L</b> column adjacency ka level hai.</p>

<h3>Sawal 2: database kya kehta hai?</h3>
<p>Database woh sach hai jise protocol maanta hai. Routes uspar se nikalte hain. <code>show ospf database</code> LSAs ko type ke hisaab se list karta hai; <code>show isis database</code> LSPs aur unke attributes. Yahan woh problems dikhti hain jo routing table chhupa deta hai, jaise filtered route jo LSA ke roop mein ab bhi maujood hai.</p>
<pre class="out">lab@R1&gt; show ospf database summary
Area 0.0.0.0:
   3 Router LSAs
   1 Network LSAs
   7 Summary LSAs
Externals:

lab@R1&gt; show isis database
IS-IS level 1 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         0x1   0x3bc9     1140 L1
R2.00-00                         0x1   0xff60     1140 L1 L2 <span class="hl">Attached</span>
R3.00-00                         0x1   0x2f8c     1140 L1 L2 <span class="hl">Attached</span>
  3 LSPs</pre>
<p>L1/L2 routers par Attached flag L1-only router R1 ko batata hai ki unki taraf default route install karo. Yahi chhota sa shabd batata hai ki agle sawal mein R1 <code>0.0.0.0/0 [IS-IS/15]</code> kyun dikhata hai.</p>

<h3>Sawal 3: routing table ne kya install kiya, aur kyun?</h3>
<p>Database SPF ko feed karta hai, SPF routing table ko. Bracket mein <b>preference</b> aur <b>metric</b> padho. Junos defaults: OSPF internal 10, OSPF external 150, IS-IS level 1 internal 15, level 2 internal 18, IS-IS level 1 external 160, level 2 external 165.</p>
<pre class="out">lab@R1&gt; show route protocol isis
inet.0: 8 destinations, 8 routes (8 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

0.0.0.0/0          *[IS-IS<span class="hl">/15</span>] 00:01:02, metric 10
                    &gt;  to 10.1.12.2 via ge-0/0/0.0
10.1.255.2/32      *[IS-IS/15] 00:01:02, metric 10
                    &gt;  to 10.1.12.2 via ge-0/0/0.0
10.1.255.3/32      *[IS-IS/15] 00:01:02, metric 20
                    &gt;  to 10.1.13.3 via ge-0/0/1.0</pre>

<h3>OSPF aur IS-IS saath-saath</h3>
<table class="cmp"><tr><th>Idea</th><th>OSPF</th><th>IS-IS</th></tr>
<tr><td>Kis par chalta hai</td><td>IP (protocol 89)</td><td>Seedha Layer 2 par (CLNS), <code>family iso</code> chahiye</td></tr>
<tr><td>Hierarchy</td><td>Areas, border router ke andar (ABR)</td><td>Levels 1 aur 2, border link par</td></tr>
<tr><td>Identity</td><td>Router ID</td><td>NET: area plus system ID</td></tr>
<tr><td>Extra address families</td><td>IPv6 ke liye OSPFv3</td><td>Wahi process IPv4 aur IPv6 dono carry karta hai</td></tr>
<tr><td>Doosre protocols ke routes</td><td>Type 5 ya 7 LSAs</td><td>LSPs mein external prefixes</td></tr></table>

<div class="eg"><p><b>Worked example.</b> R1 par 172.16.5.0/24 ka route missing hai. Teen sawal chalao. Neighbours: R2 Full hai, yaani R1 R2 ko sun raha hai. Database: R1 par <code>show ospf database netsummary</code> mein 172.16.5.0 ka summary nahi hai, yaani problem R2 ke aage hai. R2 par <code>show ospf interface</code> mein vl-10.255.5.3 Down hai. Fault ek ABR door mila, teen commands mein.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sirf routing table dekhna. Route absent ho to tay karna padta hai ki protocol ne kabhi seekha hi nahi (database) ya seekha aur reject kiya (policy, preference, hidden). Akela table yeh nahi bata sakta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Preference <i>protocols</i> ke beech faisla karta hai; metric <i>ek hi</i> protocol ke paths ke beech. Same prefix ke liye OSPF external route (150), IS-IS level 2 internal route (18) se haar jaata hai, metrics kuch bhi hon.</p></div>

<div class="scn"><h4>Adjacency up, routes nahi</h4><p>Naye core router ka neighbour Full tha par neighbour ke aage koi OSPF route nahi tha. Engineer ne database compare kiya aur naye router ke Router LSAs mile par summary LSAs nahi. Router naam ka ABR tha: uska koi interface area 0 mein nahi tha. Uplink area 0 mein daalne se database bhar gaya.</p><p><b>Lesson:</b> adjacency saabit karti hai ki hellos chalte hain. Database saabit karta hai ki area design chalta hai.</p></div>

<div class="iv"><p class="q">"Routing table se ek route missing hai. Kahan dekhoge?"</p><p>Pehle protocol neighbours, phir protocol database dekhne ke liye ki information aayi ya nahi, phir policy aur preference dekhne ke liye ki reject to nahi hui, phir <code>show route hidden</code> un routes ke liye jo hain par unusable. Order zor se bolo: isse method dikhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen sawal poochho: neighbours, database, routing table.</li>
<li>OSPF internal 10, external 150; IS-IS L1 15, L2 18, external 160 aur 165.</li>
<li>LSP par Attached flag L1-only routers se default route install karwata hai.</li>
<li>OSPF virtual link vl- plus neighbour router ID naam ke interface ke roop mein dikhta hai.</li>
<li>Database dikhata hai protocol kya jaanta hai; routing table dikhata hai kya select hua.</li>
</ul></div>
`}};export{e as default};