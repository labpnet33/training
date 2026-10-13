var e={id:`troubleshooting`,h:{en:`OSPF troubleshooting workflow`,hi:`OSPF troubleshooting workflow`},body:{en:`
<p>OSPF faults fall into three families: <b>no adjacency</b>, <b>adjacency but wrong or missing routes</b>, and <b>routes present but wrong path</b>. Each family has its own commands. This chapter gives you the flow and uses real simulator output, including faults we created on purpose in the Hubli lab.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="OSPF troubleshooting tree">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">show ospf neighbor</text>
<rect x="20" y="100" width="170" height="60" rx="8" fill="#fed7aa"/><text x="105" y="124" text-anchor="middle" class="svg-ink" font-size="12">No neighbour or stuck</text><text x="105" y="142" text-anchor="middle" class="svg-muted" font-size="11">hello, area, auth, MTU</text>
<rect x="235" y="100" width="170" height="60" rx="8" fill="#fde68a"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">Full, route missing</text><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="11">database, area, policy</text>
<rect x="450" y="100" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="124" text-anchor="middle" class="svg-ink" font-size="12">Full, wrong path</text><text x="535" y="142" text-anchor="middle" class="svg-muted" font-size="11">metric, type, preference</text>
<line x1="280" y1="50" x2="130" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="50" x2="510" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">Interface, neighbour, database, route, policy, forwarding: always in this order.</text>
</svg><p class="cap">Start with the neighbour table and branch.</p></div>

<h3>Family 1: no adjacency</h3>
<p>For two routers to become neighbours these must match: <b>area ID, subnet and mask, hello and dead intervals, authentication, stub or NSSA flag, and MTU</b>. Router IDs must be different. The interface must be enabled for OSPF, not passive, and hellos to 224.0.0.5 must not be filtered.</p>
<table class="cmp"><tr><th>Stuck state</th><th>Typical cause</th></tr>
<tr><td>Nothing in the table</td><td>Not in protocols ospf, passive, interface down, filter, wrong area, authentication or hello mismatch</td></tr>
<tr><td>Init</td><td>One-way: we hear them, they do not hear us (filter, authentication)</td></tr>
<tr><td>2-Way</td><td>Normal for DROther pairs; a problem only if one side should be DR or BDR</td></tr>
<tr><td>ExStart or Exchange</td><td>MTU mismatch, or duplicate router ID</td></tr>
<tr><td>Loading</td><td>Corrupted or missing LSAs; check logs</td></tr></table>
<p>Real evidence. We changed the hello interval on R4. R3 stays at 10 and 40, R4 now uses 5 and 20. The neighbour table on R4 is empty and the interface detail shows the values side by side:</p>
<pre class="out">lab@R3-DHARWAD&gt; show ospf interface detail
ge-0/0/1.0          DR      0.0.0.2         10.255.5.3      0.0.0.0            0
  Hello: <span class="hl">10</span>, Dead: <span class="hl">40</span>, ReXmit: 5, Not Stub

lab@R4-HUBLI&gt; show ospf interface detail
ge-0/0/0.0          DR      0.0.0.2         10.255.5.4      0.0.0.0            0
  Hello: <span class="hl">5</span>, Dead: <span class="hl">20</span>, ReXmit: 5, Not Stub

lab@R4-HUBLI&gt; show log messages | last 6
Oct  1 23:50:56  R4-HUBLI rpd[1083]: RPD_OSPF_NBRDOWN: OSPF neighbor 10.255.5.3 on ge-0/0/0.0 moved from Full to Down</pre>
<p>For authentication and area mismatches the log names the problem explicitly:</p>
<pre class="out">lab@R3-DHARWAD&gt; show log messages | last 6
... ospfd[1500]: OSPF_ERRRCV: Received invalid packet: <span class="hl">Mismatched Authentication type</span>. Input packet specified type 2, we use type 0 from 10.5.34.2, ge-0/0/1.0

lab@R4-HUBLI&gt; show log messages | last 6
... ospfd[1500]: OSPF_ERRRCV: Received invalid packet: <span class="hl">mismatched area ID</span> 0.0.0.2 (local area 0.0.0.3) from 10.5.34.1, ge-0/0/0.0</pre>
<p>Always read <code>show log messages</code> or <code>show ospf log</code> early; the router often tells you exactly what is wrong.</p>

<h3>Family 2: adjacency up, route missing</h3>
<ol>
<li><b>Is the interface in OSPF?</b> <code>show ospf interface</code> must list the interface, or the loopback if it is the destination. A LAN with no neighbour should be <code>passive</code>, not absent.</li>
<li><b>Did the information arrive?</b> Look in <code>show ospf database</code> for the Router LSA, the Summary LSA (inter-area) or the Extern LSA. In the Hubli lab R1 had no Summary for 172.16.5.0 until the virtual link came up.</li>
<li><b>Did the area design allow it?</b> Stub areas drop externals, <code>restrict</code> suppresses ranges, a detached area has no path to the backbone.</li>
<li><b>Was it rejected?</b> An import policy on this router, a missing export policy on the ASBR, or a route in <code>show route hidden</code>.</li>
</ol>

<h3>Family 3: route present, wrong path</h3>
<p>Compare path type (intra beats inter beats external), metric, external type, and preference against other protocols. Check link metrics with <code>show ospf interface detail</code> and use <code>traceroute no-resolve</code> to see the real path. In the Chennai lab the traceroute after overload proved that traffic left R2 and used R3.</p>

<h3>The three module labs as tickets</h3>
<ul>
<li><b>Delhi (OSPFv3).</b> Symptom: R1 cannot reach 2001:db8:77::1. Check <code>show ospf3 neighbor</code> on R2 (two Full), <code>show ospf3 database external detail</code> on R1 (Metric 50, Type 1), <code>show route</code> (metric 52, tag 77).</li>
<li><b>Chennai (policy and overload).</b> Symptom: R1 uses the test network. Check the Extern LSA tag, import policy on R1, then verify overload with <code>show route 172.16.4.0/24</code>.</li>
<li><b>Hubli (virtual link).</b> Symptom: PC1 cannot reach 172.16.5.10. Check <code>show ospf interface</code> for the vl- interface Down, then the neighbor-id on R3, fix it to R2's router ID 10.255.5.2, verify Full on vl- and the route on R1.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> An engineer says "OSPF is broken". R3 lists R2 and the vl- neighbour but no neighbour on its link to R4, and R4's neighbour table is empty. The log on R4 says "mismatched area ID 0.0.0.2 (local area 0.0.0.3)". Fix: put R4's ge-0/0/0.0 back in area 0.0.0.2. One log line found it in under a minute.</p></div>

<div class="warn"><p><b>Common mistake.</b> Debugging at the wrong layer: changing OSPF timers when the interface was simply in the wrong area, or rewriting policy when the neighbour was down. Follow the order of the tree.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hello and dead mismatch prevents adjacency, but the neighbour does not appear in the list at all, so a question that shows an empty neighbour table with Link up points to hello, area, authentication or subnet, not to the database.</p></div>

<div class="scn"><h4>One side authenticated, one not</h4><p>After a security push, a branch router lost its uplink adjacency. The link was up and pings worked. The log on the core router said "Mismatched Authentication type. Input packet specified type 2, we use type 0". The branch had a new MD5 key configured while the core had none. Applying the key on both sides in one change window restored the neighbour.</p><p><b>Lesson:</b> roll out authentication on both ends together, with confirmed commits.</p></div>

<div class="iv"><p class="q">"Two OSPF routers are directly connected, the link is up, but they will not form a neighbour. What do you check?"</p><p>Same subnet and mask, same area ID, same hello and dead timers, matching authentication, matching stub or NSSA flags, different router IDs, MTU, the interface not passive, and no filter blocking multicast 224.0.0.5. I read <code>show ospf interface detail</code> and <code>show log messages</code>, which often name the mismatch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three families: no adjacency, route missing, wrong path.</li>
<li>Adjacency needs matching area, subnet, timers, authentication, stub flag and MTU.</li>
<li>show log messages names authentication and area mismatches directly.</li>
<li>Database first, routing table second, policy third.</li>
<li>Change one thing and verify with the original test.</li>
</ul></div>
`,hi:`
<p>OSPF faults teen families mein aate hain: <b>koi adjacency nahi</b>, <b>adjacency hai par routes galat ya missing</b>, aur <b>routes hain par path galat</b>. Har family ke apne commands hain. Yeh chapter aapko flow deta hai aur asli simulator output use karta hai, un faults samet jo humne Hubli lab mein jaanbujhkar banaye.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="OSPF troubleshooting tree">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">show ospf neighbor</text>
<rect x="20" y="100" width="170" height="60" rx="8" fill="#fed7aa"/><text x="105" y="124" text-anchor="middle" class="svg-ink" font-size="12">Neighbour nahi ya atka</text><text x="105" y="142" text-anchor="middle" class="svg-muted" font-size="11">hello, area, auth, MTU</text>
<rect x="235" y="100" width="170" height="60" rx="8" fill="#fde68a"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">Full, route missing</text><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="11">database, area, policy</text>
<rect x="450" y="100" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="124" text-anchor="middle" class="svg-ink" font-size="12">Full, galat path</text><text x="535" y="142" text-anchor="middle" class="svg-muted" font-size="11">metric, type, preference</text>
<line x1="280" y1="50" x2="130" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="50" x2="510" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">Interface, neighbour, database, route, policy, forwarding: hamesha isi order mein.</text>
</svg><p class="cap">Neighbour table se shuru karo aur branch karo.</p></div>

<h3>Family 1: koi adjacency nahi</h3>
<p>Do routers neighbour banne ke liye in cheezon ka match karna zaroori hai: <b>area ID, subnet aur mask, hello aur dead intervals, authentication, stub ya NSSA flag, aur MTU</b>. Router IDs alag hone chahiye. Interface OSPF ke liye enabled ho, passive nahi, aur 224.0.0.5 ke hellos filter na hon.</p>
<table class="cmp"><tr><th>Atka hua state</th><th>Typical cause</th></tr>
<tr><td>Table mein kuch nahi</td><td>protocols ospf mein nahi, passive, interface down, filter, galat area, authentication ya hello mismatch</td></tr>
<tr><td>Init</td><td>One-way: hum unhe sunte hain, woh hamein nahi (filter, authentication)</td></tr>
<tr><td>2-Way</td><td>DROther pairs ke liye normal; problem tabhi jab ek side ko DR ya BDR hona chahiye</td></tr>
<tr><td>ExStart ya Exchange</td><td>MTU mismatch, ya duplicate router ID</td></tr>
<tr><td>Loading</td><td>Corrupt ya missing LSAs; logs dekho</td></tr></table>
<p>Asli saboot. Humne R4 par hello interval badla. R3 10 aur 40 par hai, R4 ab 5 aur 20 use karta hai. R4 par neighbour table khaali hai aur interface detail values side-by-side dikhata hai:</p>
<pre class="out">lab@R3-DHARWAD&gt; show ospf interface detail
ge-0/0/1.0          DR      0.0.0.2         10.255.5.3      0.0.0.0            0
  Hello: <span class="hl">10</span>, Dead: <span class="hl">40</span>, ReXmit: 5, Not Stub

lab@R4-HUBLI&gt; show ospf interface detail
ge-0/0/0.0          DR      0.0.0.2         10.255.5.4      0.0.0.0            0
  Hello: <span class="hl">5</span>, Dead: <span class="hl">20</span>, ReXmit: 5, Not Stub

lab@R4-HUBLI&gt; show log messages | last 6
Oct  1 23:50:56  R4-HUBLI rpd[1083]: RPD_OSPF_NBRDOWN: OSPF neighbor 10.255.5.3 on ge-0/0/0.0 moved from Full to Down</pre>
<p>Authentication aur area mismatch ke liye log problem ka naam seedha batata hai:</p>
<pre class="out">lab@R3-DHARWAD&gt; show log messages | last 6
... ospfd[1500]: OSPF_ERRRCV: Received invalid packet: <span class="hl">Mismatched Authentication type</span>. Input packet specified type 2, we use type 0 from 10.5.34.2, ge-0/0/1.0

lab@R4-HUBLI&gt; show log messages | last 6
... ospfd[1500]: OSPF_ERRRCV: Received invalid packet: <span class="hl">mismatched area ID</span> 0.0.0.2 (local area 0.0.0.3) from 10.5.34.1, ge-0/0/0.0</pre>
<p>Hamesha <code>show log messages</code> ya <code>show ospf log</code> jaldi padho; router aksar bilkul bata deta hai ki kya galat hai.</p>

<h3>Family 2: adjacency up, route missing</h3>
<ol>
<li><b>Kya interface OSPF mein hai?</b> <code>show ospf interface</code> mein interface list hona chahiye, ya destination ho to loopback. Bina neighbour wali LAN <code>passive</code> honi chahiye, absent nahi.</li>
<li><b>Kya information aayi?</b> <code>show ospf database</code> mein Router LSA, Summary LSA (inter-area) ya Extern LSA dekho. Hubli lab mein virtual link up hone tak R1 ke paas 172.16.5.0 ka Summary nahi tha.</li>
<li><b>Kya area design ne allow kiya?</b> Stub areas externals girate hain, <code>restrict</code> ranges suppress karta hai, alag pade area ka backbone tak path nahi hota.</li>
<li><b>Kya reject hua?</b> Is router par import policy, ASBR par missing export policy, ya <code>show route hidden</code> mein route.</li>
</ol>

<h3>Family 3: route hai, path galat</h3>
<p>Path type (intra inter se, inter external se jeetta), metric, external type aur doosre protocols ke against preference compare karo. Link metrics <code>show ospf interface detail</code> se check karo aur asli path dekhne ke liye <code>traceroute no-resolve</code> use karo. Chennai lab mein overload ke baad traceroute ne saabit kiya ki traffic R2 se hatkar R3 par chala gaya.</p>

<h3>Module ke teen labs ticket ke roop mein</h3>
<ul>
<li><b>Delhi (OSPFv3).</b> Symptom: R1 2001:db8:77::1 tak nahi pahunch raha. R2 par <code>show ospf3 neighbor</code> (do Full), R1 par <code>show ospf3 database external detail</code> (Metric 50, Type 1), <code>show route</code> (metric 52, tag 77) check karo.</li>
<li><b>Chennai (policy aur overload).</b> Symptom: R1 test network use kar raha hai. Extern LSA ka tag, R1 par import policy check karo, phir <code>show route 172.16.4.0/24</code> se overload verify karo.</li>
<li><b>Hubli (virtual link).</b> Symptom: PC1 172.16.5.10 tak nahi pahunch raha. <code>show ospf interface</code> mein vl- interface Down dekho, phir R3 par neighbor-id check karo, R2 ke router ID 10.255.5.2 par theek karo, vl- par Full aur R1 par route verify karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Engineer kehta hai "OSPF toota hua hai". R3 R2 aur vl- neighbour dikhata hai par R4 wale link par koi neighbour nahi, aur R4 ki neighbour table khaali hai. R4 ka log kehta hai "mismatched area ID 0.0.0.2 (local area 0.0.0.3)". Fix: R4 ka ge-0/0/0.0 wapas area 0.0.0.2 mein daalo. Ek log line ne ek minute se kam mein dhoondh diya.</p></div>

<div class="warn"><p><b>Common mistake.</b> Galat layer par debug karna: interface galat area mein tha aur OSPF timers badalna, ya neighbour down tha aur policy rewrite karna. Tree ke order ko follow karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hello aur dead mismatch adjacency rokta hai, par neighbour list mein bilkul nahi dikhta, isliye jo sawal Link up ke saath khaali neighbour table dikhaye woh hello, area, authentication ya subnet ki taraf ishara karta hai, database ki taraf nahi.</p></div>

<div class="scn"><h4>Ek taraf authentication, ek taraf nahi</h4><p>Security push ke baad ek branch router ki uplink adjacency chali gayi. Link up tha aur pings chal rahe the. Core router ka log kehta tha "Mismatched Authentication type. Input packet specified type 2, we use type 0". Branch par naya MD5 key configured tha jabki core par nahi. Ek change window mein dono taraf key lagane se neighbour wapas aa gaya.</p><p><b>Lesson:</b> authentication dono ends par saath roll out karo, confirmed commits ke saath.</p></div>

<div class="iv"><p class="q">"Do OSPF routers directly connected hain, link up hai, par neighbour nahi ban raha. Kya check karoge?"</p><p>Same subnet aur mask, same area ID, same hello aur dead timers, matching authentication, matching stub ya NSSA flags, alag router IDs, MTU, interface passive na ho, aur multicast 224.0.0.5 ko koi filter block na kare. Main <code>show ospf interface detail</code> aur <code>show log messages</code> padhta hoon, jo aksar mismatch ka naam batate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen families: koi adjacency nahi, route missing, galat path.</li>
<li>Adjacency ko matching area, subnet, timers, authentication, stub flag aur MTU chahiye.</li>
<li>show log messages authentication aur area mismatch ka naam seedha batata hai.</li>
<li>Pehle database, phir routing table, phir policy.</li>
<li>Ek cheez badlo aur original test se verify karo.</li>
</ul></div>
`}};export{e as default};