var e={id:`dis-pseudonode`,h:{en:`LANs: the DIS, the pseudonode and point-to-point links`,hi:`LANs: DIS, pseudonode aur point-to-point links`},body:{en:`
<p>Picture a meeting room with six people. If each person had to write down who else is in the room for every other person, that would be 30 notes. If the room has a receptionist and everyone just registers with her, the whole list is one sheet. On a shared Ethernet segment IS-IS does the same: it elects a <b>DIS (Designated Intermediate System)</b> that acts as the receptionist and publishes a single sheet, the <b>pseudonode LSP</b>, that represents the LAN itself.</p>

<h3>What the DIS does</h3>
<ul>
<li>It sends a <b>CSNP every 10 seconds</b> so all routers on the LAN stay synchronised.</li>
<li>It sends hellos more often than the others (about three times as often) so a failure of the DIS is noticed quickly.</li>
<li>It originates the <b>pseudonode LSP</b>. Every router on the LAN lists the pseudonode as its neighbour instead of listing every other router.</li>
<li>It is elected <b>per level</b>: the L1 DIS and the L2 DIS may be different routers.</li>
</ul>

<h3>The election rules, and how IS-IS differs from OSPF</h3>
<table class="cmp"><tr><th></th><th>IS-IS DIS</th><th>OSPF DR</th></tr>
<tr><td>Winner</td><td>highest priority (Junos default 64, range 0-127); tie goes to the highest MAC address (SNPA)</td><td>highest priority (default 128), then highest router ID</td></tr>
<tr><td>Backup</td><td><b>none</b></td><td>BDR</td></tr>
<tr><td>Pre-emption</td><td><b>yes</b>: a better router takes over at once</td><td>no</td></tr>
<tr><td>Adjacencies</td><td>every router with every router</td><td>everybody only with DR and BDR</td></tr>
<tr><td>LSP / LSA for the LAN</td><td>pseudonode LSP</td><td>type 2 network LSA</td></tr></table>
<p>Because the election is pre-emptive, there is no need to clear anything after changing a priority. Because there is no backup, when the DIS fails a new one is elected after the hold time and a new pseudonode LSP is created; this is quick because everybody already has adjacencies with everyone. Priority 0 does not turn off the router, it only makes it ineligible when others exist: a priority 0 router can still be DIS if it is alone.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="LAN with pseudonode">
<rect x="20" y="95" width="600" height="20" rx="6" fill="#e2e8f0"/><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">shared LAN 10.70.0.0/24 through switch SW1</text>
<circle cx="120" cy="45" r="26" fill="#bbf7d0" stroke="#64748b"/><text x="120" y="49" text-anchor="middle" class="svg-ink" font-size="12">R1 DIS</text>
<circle cx="280" cy="45" r="26" fill="#bae6fd" stroke="#64748b"/><text x="280" y="49" text-anchor="middle" class="svg-ink" font-size="12">R2</text>
<circle cx="440" cy="45" r="26" fill="#bae6fd" stroke="#64748b"/><text x="440" y="49" text-anchor="middle" class="svg-ink" font-size="12">R3</text>
<line x1="120" y1="71" x2="120" y2="95" stroke="#64748b" stroke-width="2"/><line x1="280" y1="71" x2="280" y2="95" stroke="#64748b" stroke-width="2"/><line x1="440" y1="71" x2="440" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="20" width="120" height="50" rx="8" fill="#fde68a"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="12">pseudonode</text><text x="560" y="58" text-anchor="middle" class="svg-ink" font-size="12">R1.01-00</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">R1, R2 and R3 each list R1.01 as a neighbour with metric 0 on the LAN</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">The pseudonode lists R1, R2 and R3 with metric 0</text>
</svg><p class="cap">The pseudonode LSP represents the LAN in the database.</p></div>

<h3>Seeing the DIS in the Chennai lab</h3>
<p>Three routers share a LAN through SW1 and R1 also has a link to R4. At the start nobody has changed a priority, so all routers have the default 64 and the highest MAC wins: R2 is the DIS on the LAN (R2.01) and R1 is the DIS on the R1-R4 link (R1.02).</p>
<pre class="out">lab@R1&gt; show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            3   0x1 <span class="hl">R2.01</span>             <span class="hl">R2.01</span>                    10/10
ge-0/0/1.0            3   0x2 R1.02             R1.02                    10/10
lo0.0                 0   0x7 Passive           Passive                    0/0</pre>
<p>The DR columns show the DIS and the pseudonode ID (<code>.01</code> is the circuit ID byte). R1 is the new high-end chassis, so we raise its priority on both levels:</p>
<pre class="code">set protocols isis interface ge-0/0/0.0 level 1 priority 100
set protocols isis interface ge-0/0/0.0 level 2 priority 100</pre>
<pre class="out">lab@R1&gt; show isis interface
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            3   0x1 <span class="hl">R1.01</span>             <span class="hl">R1.01</span>                    10/10
ge-0/0/1.0            3   0x2 R1.02             R1.02                    10/10</pre>
<p>The new DIS appeared at once, without any clearing, because the election is pre-emptive. Now look at the pseudonode LSP R1.01-00 and at how R1 describes itself:</p>
<pre class="out">lab@R1&gt; show isis database detail
R1.00-00 Sequence: 0x2, Checksum: 0x5a9f, Lifetime: 1160 secs
   IS neighbor: R1.01                          Metric:       10
   IS neighbor: R1.02                          Metric:       10
   IP prefix: 10.70.0.0/24                     Metric:       10 Internal Up
R1.01-00 Sequence: 0x1, Checksum: 0xed91, Lifetime: 1160 secs
   IS neighbor: R1.00                          Metric:        0
   IS neighbor: R2.00                          Metric:        0
   IS neighbor: R3.00                          Metric:        0</pre>
<p>R1's own LSP does not list R2 and R3. It lists <code>R1.01</code>, the pseudonode, with the link metric 10. The pseudonode LSP lists all routers on the LAN with metric 0, so the cost across the LAN is counted only once. The same design exists for the R1-R4 link: R1.02-00 was a pseudonode with two members, which is wasteful.</p>

<h3>Point-to-point on two-router links</h3>
<p>A link with only two routers does not need a DIS or a pseudonode. Setting <code>point-to-point</code> on <b>both ends</b> changes the hello type to 17, removes the election, and reduces LSP count:</p>
<pre class="code"><span class="c">! R1</span>
set protocols isis interface ge-0/0/1.0 point-to-point
<span class="c">! R4</span>
set protocols isis interface ge-0/0/0.0 point-to-point</pre>
<pre class="out">lab@R1&gt; show isis interface
ge-0/0/0.0            3   0x1 R1.01             R1.01                    10/10
ge-0/0/1.0            3   0x2 <span class="hl">Point to Point</span>    Point to Point           10/10
lab@R1&gt; show isis database
IS-IS level 1 link-state database:
R1.00-00  R2.00-00  R3.00-00  R4.00-00  R1.01-00
  5 LSPs</pre>
<p>The pseudonode R1.02-00 disappeared: the level 1 and level 2 databases dropped from 6 LSPs to 5 each. R4 now reaches R3 through R1 and the LAN, which the lab verifies with <code>ping 10.70.255.3</code>. If only one end is point-to-point, the hello types differ and the adjacency is lost, so always change both ends in the same window.</p>

<div class="eg"><p><b>Worked example.</b> Count the LSPs. With 4 routers and 2 LANs (each with a pseudonode) there are 4 router LSPs + 2 pseudonode LSPs = 6 per level. Convert the two-router LAN to point-to-point and one pseudonode disappears: 5 per level. This is exactly what show isis database printed before and after.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing <code>point-to-point</code> on one end only, or leaving a two-router Ethernet link as broadcast and then wondering why a DIS appears on it. Also setting a priority of 0 on a router and expecting it to never be a DIS even if it is the only router on the segment.</p></div>
<div class="exam"><p><b>Exam trap.</b> The IS-IS DIS is pre-emptive and has no backup; the OSPF DR is not pre-emptive and has a BDR. Default priority is 64 on Junos (OSPF 128). Tie-break is the highest MAC (SNPA), not the system ID. The DIS sends CSNPs every 10 seconds.</p></div>

<div class="scn"><h4>The old router that kept winning</h4><p>A decade-old router with a high MAC address was always elected DIS on a busy LAN, even though a new, much more powerful router joined. The team set priority 100 on the new router for both levels. The next hello cycle moved the DIS role without any clearing, and the old router's CPU dropped. Nobody had to schedule a maintenance window because the IS-IS election is pre-emptive.</p><p><b>Lesson:</b> choose the DIS on purpose by priority; do not leave it to the highest MAC.</p></div>

<div class="iv"><p class="q">"How does the IS-IS DIS differ from the OSPF DR?"</p><p>The DIS has no backup, the election is pre-emptive, and every router forms an adjacency with every other router on the LAN, not only with the DIS. It sends CSNPs every 10 seconds and originates a pseudonode LSP. Junos default priority is 64, and the tie-break is the highest MAC address. For two-router links use point-to-point on both ends.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The DIS is elected per level and per LAN; no backup, pre-emptive.</li>
<li>Priority default 64 (0-127), tie-break highest MAC.</li>
<li>The pseudonode LSP (ID ends in non-zero, like R1.01-00) represents the LAN.</li>
<li>CSNP every 10 seconds from the DIS.</li>
<li>Use <code>point-to-point</code> on both ends of two-router links to remove the DIS.</li>
</ul></div>
`,hi:`
<p>Ek meeting room socho jisme chhe log hain. Agar har insaan ko baaki sab ke baare mein likhna pade ki kaun kaun room mein hai, to 30 notes banenge. Agar room mein ek receptionist ho aur sab bas usi ke paas register karein, to poori list ek sheet ban jaati hai. Shared Ethernet segment par IS-IS bhi yahi karta hai: wo ek <b>DIS (Designated Intermediate System)</b> elect karta hai jo receptionist ki tarah kaam karta hai aur ek hi sheet publish karta hai, <b>pseudonode LSP</b>, jo LAN ko khud represent karti hai.</p>

<h3>DIS kya karta hai</h3>
<ul>
<li>Wo <b>har 10 second par CSNP</b> bhejta hai taaki LAN ke saare routers synchronised rahein.</li>
<li>Wo baakiyon se zyada baar (lagbhag teen guna) hellos bhejta hai taaki DIS ka fail hona jaldi notice ho.</li>
<li>Wo <b>pseudonode LSP</b> originate karta hai. LAN ka har router baaki routers ko list karne ki jagah pseudonode ko apna neighbour list karta hai.</li>
<li>Wo <b>per level</b> elect hota hai: L1 DIS aur L2 DIS alag routers ho sakte hain.</li>
</ul>

<h3>Election rules, aur IS-IS OSPF se kaise alag hai</h3>
<table class="cmp"><tr><th></th><th>IS-IS DIS</th><th>OSPF DR</th></tr>
<tr><td>Winner</td><td>sabse bada priority (Junos default 64, range 0-127); tie par sabse bada MAC address (SNPA)</td><td>sabse bada priority (default 128), phir sabse bada router ID</td></tr>
<tr><td>Backup</td><td><b>koi nahi</b></td><td>BDR</td></tr>
<tr><td>Pre-emption</td><td><b>haan</b>: behtar router turant kabza kar leta hai</td><td>nahi</td></tr>
<tr><td>Adjacencies</td><td>har router har router ke saath</td><td>sab sirf DR aur BDR ke saath</td></tr>
<tr><td>LAN ka LSP / LSA</td><td>pseudonode LSP</td><td>type 2 network LSA</td></tr></table>
<p>Election pre-emptive hai, isliye priority badalne ke baad kuch clear karne ki zaroorat nahi. Backup nahi hai, isliye DIS fail ho to hold time ke baad naya elect hota hai aur naya pseudonode LSP banta hai; ye tez hota hai kyunki sabki sab ke saath adjacency pehle se hoti hai. Priority 0 router ko band nahi karta, sirf doosre hon to use ineligible banata hai: priority 0 router akela ho to DIS ban sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Pseudonode wali LAN">
<rect x="20" y="95" width="600" height="20" rx="6" fill="#e2e8f0"/><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">shared LAN 10.70.0.0/24, switch SW1 ke through</text>
<circle cx="120" cy="45" r="26" fill="#bbf7d0" stroke="#64748b"/><text x="120" y="49" text-anchor="middle" class="svg-ink" font-size="12">R1 DIS</text>
<circle cx="280" cy="45" r="26" fill="#bae6fd" stroke="#64748b"/><text x="280" y="49" text-anchor="middle" class="svg-ink" font-size="12">R2</text>
<circle cx="440" cy="45" r="26" fill="#bae6fd" stroke="#64748b"/><text x="440" y="49" text-anchor="middle" class="svg-ink" font-size="12">R3</text>
<line x1="120" y1="71" x2="120" y2="95" stroke="#64748b" stroke-width="2"/><line x1="280" y1="71" x2="280" y2="95" stroke="#64748b" stroke-width="2"/><line x1="440" y1="71" x2="440" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="20" width="120" height="50" rx="8" fill="#fde68a"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="12">pseudonode</text><text x="560" y="58" text-anchor="middle" class="svg-ink" font-size="12">R1.01-00</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">R1, R2 aur R3 LAN par R1.01 ko metric ke saath neighbour list karte hain</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Pseudonode R1, R2 aur R3 ko metric 0 ke saath list karta hai</text>
</svg><p class="cap">Pseudonode LSP database mein LAN ko represent karta hai.</p></div>

<h3>Chennai lab mein DIS dekhna</h3>
<p>Teen routers SW1 ke through ek LAN share karte hain aur R1 ka R4 se bhi link hai. Shuru mein kisi ne priority nahi badli, isliye saare routers ka default 64 hai aur sabse bada MAC jeetta hai: LAN par R2 DIS hai (R2.01) aur R1-R4 link par R1 DIS hai (R1.02).</p>
<pre class="out">lab@R1&gt; show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            3   0x1 <span class="hl">R2.01</span>             <span class="hl">R2.01</span>                    10/10
ge-0/0/1.0            3   0x2 R1.02             R1.02                    10/10
lo0.0                 0   0x7 Passive           Passive                    0/0</pre>
<p>DR columns DIS aur pseudonode ID dikhate hain (<code>.01</code> circuit ID byte hai). R1 naya high-end chassis hai, isliye hum dono levels par uski priority badhate hain:</p>
<pre class="code">set protocols isis interface ge-0/0/0.0 level 1 priority 100
set protocols isis interface ge-0/0/0.0 level 2 priority 100</pre>
<pre class="out">lab@R1&gt; show isis interface
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            3   0x1 <span class="hl">R1.01</span>             <span class="hl">R1.01</span>                    10/10
ge-0/0/1.0            3   0x2 R1.02             R1.02                    10/10</pre>
<p>Naya DIS turant aa gaya, bina kuch clear kiye, kyunki election pre-emptive hai. Ab pseudonode LSP R1.01-00 aur R1 apne aap ko kaise describe karta hai wo dekho:</p>
<pre class="out">lab@R1&gt; show isis database detail
R1.00-00 Sequence: 0x2, Checksum: 0x5a9f, Lifetime: 1160 secs
   IS neighbor: R1.01                          Metric:       10
   IS neighbor: R1.02                          Metric:       10
   IP prefix: 10.70.0.0/24                     Metric:       10 Internal Up
R1.01-00 Sequence: 0x1, Checksum: 0xed91, Lifetime: 1160 secs
   IS neighbor: R1.00                          Metric:        0
   IS neighbor: R2.00                          Metric:        0
   IS neighbor: R3.00                          Metric:        0</pre>
<p>R1 ka apna LSP R2 aur R3 ko list nahi karta. Wo <code>R1.01</code>, pseudonode, ko link metric 10 ke saath list karta hai. Pseudonode LSP LAN ke saare routers ko metric 0 ke saath list karta hai, isliye LAN ke across cost sirf ek baar gina jaata hai. Yahi design R1-R4 link ke liye bhi tha: R1.02-00 do members wala pseudonode tha, jo fuzool hai.</p>

<h3>Do-router links par point-to-point</h3>
<p>Sirf do routers wale link ko DIS ya pseudonode ki zaroorat nahi. <b>Dono ends</b> par <code>point-to-point</code> lagane se hello type 17 ho jaata hai, election hat jaata hai, aur LSP count kam hota hai:</p>
<pre class="code"><span class="c">! R1</span>
set protocols isis interface ge-0/0/1.0 point-to-point
<span class="c">! R4</span>
set protocols isis interface ge-0/0/0.0 point-to-point</pre>
<pre class="out">lab@R1&gt; show isis interface
ge-0/0/0.0            3   0x1 R1.01             R1.01                    10/10
ge-0/0/1.0            3   0x2 <span class="hl">Point to Point</span>    Point to Point           10/10
lab@R1&gt; show isis database
IS-IS level 1 link-state database:
R1.00-00  R2.00-00  R3.00-00  R4.00-00  R1.01-00
  5 LSPs</pre>
<p>Pseudonode R1.02-00 gaayab ho gaya: level 1 aur level 2 databases 6 LSPs se 5 LSPs par aa gaye. R4 ab R3 tak R1 aur LAN ke through pahunchta hai, jo lab <code>ping 10.70.255.3</code> se verify karta hai. Sirf ek end point-to-point ho to hello types alag hote hain aur adjacency toot jaati hai, isliye dono ends ek hi window mein badlo.</p>

<div class="eg"><p><b>Worked example.</b> LSPs gino. 4 routers aur 2 LANs (har ek ka pseudonode) ke saath har level par 4 router LSPs + 2 pseudonode LSPs = 6. Do-router LAN ko point-to-point karo to ek pseudonode hat jaata hai: har level par 5. Yahi show isis database ne pehle aur baad mein print kiya.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>point-to-point</code> sirf ek end par badalna, ya do-router Ethernet link ko broadcast chhodkar sochna ki us par DIS kyun aa gaya. Saath hi router par priority 0 karke umeed karna ki wo kabhi DIS nahi banega, jabki wo segment par akela ho sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> IS-IS DIS pre-emptive hai aur uska backup nahi; OSPF DR pre-emptive nahi aur BDR hota hai. Junos par default priority 64 hai (OSPF 128). Tie-break sabse bada MAC (SNPA) hai, system ID nahi. DIS har 10 second par CSNPs bhejta hai.</p></div>

<div class="scn"><h4>Purana router jo jeet-ta raha</h4><p>Dus saal purana router, jiska MAC address bada tha, vyast LAN par hamesha DIS elect hota raha, jabki naya, bahut taakatwar router join hua tha. Team ne naye router par dono levels ke liye priority 100 lagayi. Agle hello cycle mein DIS role bina kuch clear kiye shift ho gaya, aur purane router ka CPU gir gaya. Kisi ko maintenance window nahi chahiye thi kyunki IS-IS election pre-emptive hai.</p><p><b>Lesson:</b> DIS ko jaan-boojhkar priority se chuno; sabse bade MAC par mat chhodo.</p></div>

<div class="iv"><p class="q">"IS-IS DIS OSPF DR se kaise alag hai?"</p><p>DIS ka backup nahi hota, election pre-emptive hai, aur har router LAN ke har doosre router ke saath adjacency banata hai, sirf DIS ke saath nahi. Wo har 10 second par CSNPs bhejta hai aur pseudonode LSP originate karta hai. Junos default priority 64 hai, aur tie-break sabse bada MAC address. Do-router links ke liye dono ends par point-to-point use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DIS per level aur per LAN elect hota hai; backup nahi, pre-emptive.</li>
<li>Priority default 64 (0-127), tie-break sabse bada MAC.</li>
<li>Pseudonode LSP (ID non-zero par khatam, jaise R1.01-00) LAN ko represent karta hai.</li>
<li>DIS se har 10 second par CSNP.</li>
<li>DIS hatane ke liye do-router links ke dono ends par <code>point-to-point</code> use karo.</li>
</ul></div>
`}};export{e as default};