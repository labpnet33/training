var e={id:`load-balancing`,h:{en:`Load balancing over equal-cost paths`,hi:`Barabar-cost paths par load balancing`},body:{en:`
<p>Routing instances and filters decide <i>which table</i> a packet uses. Load balancing decides <i>which of several equal next hops</i> carries it. It is a separate topic, but the JN0-351 blueprint groups it here because the surprise is the same: what you see in the routing table is not always what is installed in the forwarding table.</p>

<h3>Equal-cost paths in the routing table</h3>
<p>When OSPF finds two paths with the same cost, it installs both next hops in the route. The data centre lab has R1 at the top, two middle routers R2 and R3, and R4 at the bottom in front of the data centre network 172.16.40.0/24:</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Two equal paths">
<rect x="20" y="95" width="80" height="45" rx="8" fill="#bae6fd"/><text x="60" y="123" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="240" y="30" width="80" height="45" rx="8" fill="#e2e8f0"/><text x="280" y="58" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="240" y="160" width="80" height="45" rx="8" fill="#e2e8f0"/><text x="280" y="188" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="450" y="95" width="80" height="45" rx="8" fill="#bbf7d0"/><text x="490" y="123" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<rect x="570" y="100" width="60" height="35" rx="8" fill="#e2e8f0"/><text x="600" y="122" text-anchor="middle" class="svg-ink" font-size="10">172.16.40.0</text>
<line x1="100" y1="105" x2="240" y2="55" stroke="#64748b" stroke-width="3"/><line x1="100" y1="130" x2="240" y2="180" stroke="#64748b" stroke-width="3"/>
<line x1="320" y1="55" x2="450" y2="105" stroke="#64748b" stroke-width="3"/><line x1="320" y1="180" x2="450" y2="130" stroke="#64748b" stroke-width="3"/><line x1="530" y1="118" x2="570" y2="118" stroke="#64748b" stroke-width="2"/>
<text x="150" y="68" class="svg-muted" font-size="11">10.0.12.0/30</text><text x="150" y="195" class="svg-muted" font-size="11">10.0.13.0/30</text>
</svg><p class="cap">Two paths of the same OSPF cost from R1 to R4.</p></div>

<h3>What Junos does by default</h3>
<p>The routing table has both next hops, but only the first is marked with the active arrow:</p>
<pre class="out">lab@R1&gt; show route 172.16.40.0/24
inet.0: 14 destinations, 14 routes (14 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.40.0/24     *[OSPF/10] 00:01:25, metric 3
                    &gt;  to 10.0.12.2 via ge-0/0/0.0
                       to 10.0.13.2 via ge-0/0/1.0</pre>
<p>The forwarding table is what the packet engine uses. It holds <b>one</b> unicast next hop:</p>
<pre class="out">lab@R1&gt; show route forwarding-table destination 172.16.40.0/24
Routing table: default.inet
Internet:
Destination        Type RtRef Next hop           Type Index    NhRef Netif
172.16.40.0/24     user     0 10.0.12.2          ucst    868     2 ge-0/0/0.0</pre>
<p>(The output is trimmed to the relevant line; the default and multicast entries are also present.) The second link sits idle. This is the default Junos behaviour: it picks one next hop per prefix and uses it for all flows.</p>

<h3>Turning load balancing on</h3>
<p>The name of the knob is historic. On modern platforms <code>per-packet</code> actually means <b>per flow</b> hashing (source, destination and ports), so one conversation stays on one path and packets are not reordered. The configuration is two statements:</p>
<pre class="code">set policy-options policy-statement LB then load-balance per-packet
set routing-options forwarding-table export LB</pre>
<p>The policy is applied as an <b>export policy of the forwarding table</b>. This is easy to forget: a policy-statement alone does nothing until it is applied at <code>forwarding-table export</code>.</p>

<h3>After the change</h3>
<pre class="out">lab@R1&gt; show route 172.16.40.0/24
172.16.40.0/24     *[OSPF/10] 00:01:25, metric 3
                    &gt;  to 10.0.12.2 via ge-0/0/0.0
                    &gt;  to 10.0.13.2 via ge-0/0/1.0</pre>
<p>Both next hops now have the arrow. The forwarding table shows what changed:</p>
<pre class="out">lab@R1&gt; show route forwarding-table destination 172.16.40.0/24
172.16.40.0/24     user     0                    ulst  1048491     2
                              10.0.12.2          ucst    871     1 ge-0/0/0.0
                              10.0.13.2          ucst    874     1 ge-0/0/1.0</pre>
<p><b>ulst</b> means a <b>unilist</b>, a list of unicast next hops. The two <b>ucst</b> lines are the members. A destination now hashes onto one of them.</p>

<h3>Seeing the split</h3>
<p>Different destination addresses inside the data centre may take different paths:</p>
<pre class="out">lab@R1&gt; traceroute 172.16.40.10
 1  10.0.12.2 (10.0.12.2)  2.900 ms  1.300 ms  2.000 ms
 2  10.0.24.2 (10.0.24.2)  1.900 ms  2.600 ms  1.000 ms
 3  172.16.40.10 (172.16.40.10)  0.900 ms  1.600 ms  2.300 ms

lab@R1&gt; traceroute 172.16.40.23
 1  10.0.13.2 (10.0.13.2)  2.900 ms  1.300 ms  2.000 ms
 2  10.0.34.2 (10.0.34.2)  1.900 ms  2.600 ms  1.000 ms
 3  172.16.40.23 (172.16.40.23)  0.900 ms  1.600 ms  2.300 ms</pre>
<p>The first host goes via R2, the second via R3. That is flow-based sharing: one flow stays on one path, many flows use both.</p>

<h3>Limits to know</h3>
<ul>
<li>Load balancing needs more than one next hop in the route; with a single path nothing changes.</li>
<li>OSPF equal-cost only: paths of different cost are not shared.</li>
<li>Maximum number of next hops depends on the platform.</li>
<li>Other routing instances have their own forwarding entries and need the policy as well.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Two 1 Gbps links to a data centre give 2 Gbps of capacity only if both carry traffic. Without the policy a single large backup flow and everything else share one link and the other stays idle. After the policy, users and backups spread over both.</p></div>
<div class="warn"><p><b>Common mistake.</b> Writing the policy but never applying it under <code>forwarding-table export</code>. The routing table looks unchanged, the forwarding table keeps one next hop, and the engineer concludes the feature is broken.</p></div>
<div class="exam"><p><b>Exam trap.</b> The question shows a routing table with two next hops and asks why only one link is busy. The answer is that the forwarding table has one next hop until a load-balance policy is exported. Do not choose "OSPF has not converged".</p></div>
<div class="scn"><h4>The idle backup link</h4><p>A hospital paid for two links to its data centre but monitoring showed one at 90% and the other at 1%. The routing table showed two next hops, so the team believed load balancing was on. A look at the forwarding table showed a single ucst entry. The two-line policy fixed it, and peak utilisation dropped to about half on each link.</p><p><b>Lesson:</b> check the forwarding table, not only the routing table.</p></div>
<div class="iv"><p class="q">"OSPF shows two equal paths but only one is used. Why, and how do you fix it?"</p><p>By default Junos installs a single next hop in the forwarding table. I create a policy with <code>then load-balance per-packet</code> and apply it as <code>routing-options forwarding-table export</code>. Then the forwarding table shows a ulst with both next hops, and flows are hashed across the links.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Equal-cost routes carry several next hops, but only one is forwarded by default.</li>
<li>Policy <code>load-balance per-packet</code> plus <code>forwarding-table export</code> installs all.</li>
<li>A <b>ulst</b> entry in the forwarding table proves it.</li>
<li>Hashing is per flow, so packets of one conversation stay in order.</li>
</ul></div>
`,hi:`
<p>Routing instances aur filters tay karte hain ki packet <i>kaunsa table</i> use kare. Load balancing tay karta hai ki <i>kai barabar next hops mein se kaunsa</i> use ho. Yeh alag topic hai, lekin JN0-351 blueprint ise yahan rakhta hai kyunki hairani wahi hai: routing table mein jo dikhta hai woh hamesha forwarding table mein install nahi hota.</p>

<h3>Routing table mein barabar-cost paths</h3>
<p>Jab OSPF ko same cost ke do paths milte hain, woh dono next hops route mein install karta hai. Data centre lab mein R1 upar hai, do beech ke routers R2 aur R3, aur R4 neeche data centre network 172.16.40.0/24 ke saamne:</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Do barabar paths">
<rect x="20" y="95" width="80" height="45" rx="8" fill="#bae6fd"/><text x="60" y="123" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="240" y="30" width="80" height="45" rx="8" fill="#e2e8f0"/><text x="280" y="58" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="240" y="160" width="80" height="45" rx="8" fill="#e2e8f0"/><text x="280" y="188" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="450" y="95" width="80" height="45" rx="8" fill="#bbf7d0"/><text x="490" y="123" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<rect x="570" y="100" width="60" height="35" rx="8" fill="#e2e8f0"/><text x="600" y="122" text-anchor="middle" class="svg-ink" font-size="10">172.16.40.0</text>
<line x1="100" y1="105" x2="240" y2="55" stroke="#64748b" stroke-width="3"/><line x1="100" y1="130" x2="240" y2="180" stroke="#64748b" stroke-width="3"/>
<line x1="320" y1="55" x2="450" y2="105" stroke="#64748b" stroke-width="3"/><line x1="320" y1="180" x2="450" y2="130" stroke="#64748b" stroke-width="3"/><line x1="530" y1="118" x2="570" y2="118" stroke="#64748b" stroke-width="2"/>
<text x="150" y="68" class="svg-muted" font-size="11">10.0.12.0/30</text><text x="150" y="195" class="svg-muted" font-size="11">10.0.13.0/30</text>
</svg><p class="cap">R1 se R4 tak same OSPF cost ke do paths.</p></div>

<h3>Junos default mein kya karta hai</h3>
<p>Routing table mein dono next hops hain, lekin sirf pehle par active arrow hai:</p>
<pre class="out">lab@R1&gt; show route 172.16.40.0/24
inet.0: 14 destinations, 14 routes (14 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.40.0/24     *[OSPF/10] 00:01:25, metric 3
                    &gt;  to 10.0.12.2 via ge-0/0/0.0
                       to 10.0.13.2 via ge-0/0/1.0</pre>
<p>Forwarding table woh hai jo packet engine use karta hai. Usmein <b>ek</b> unicast next hop hai:</p>
<pre class="out">lab@R1&gt; show route forwarding-table destination 172.16.40.0/24
Routing table: default.inet
Internet:
Destination        Type RtRef Next hop           Type Index    NhRef Netif
172.16.40.0/24     user     0 10.0.12.2          ucst    868     2 ge-0/0/0.0</pre>
<p>(Output sirf zaroori line tak kaata gaya hai; default aur multicast entries bhi maujood hain.) Doosra link khali baitha rehta hai. Yeh Junos ka default behaviour hai: har prefix ke liye ek next hop chunta hai aur sab flows ke liye use karta hai.</p>

<h3>Load balancing chalu karna</h3>
<p>Knob ka naam purana hai. Modern platforms par <code>per-packet</code> ka asli matlab <b>per flow</b> hashing hai (source, destination aur ports), isliye ek conversation ek hi path par rehti hai aur packets reorder nahi hote. Configuration do statements ki hai:</p>
<pre class="code">set policy-options policy-statement LB then load-balance per-packet
set routing-options forwarding-table export LB</pre>
<p>Policy <b>forwarding table ki export policy</b> ke roop mein lagti hai. Yeh bhoolna aasan hai: <code>forwarding-table export</code> par lagaye bina policy-statement kuch nahi karta.</p>

<h3>Change ke baad</h3>
<pre class="out">lab@R1&gt; show route 172.16.40.0/24
172.16.40.0/24     *[OSPF/10] 00:01:25, metric 3
                    &gt;  to 10.0.12.2 via ge-0/0/0.0
                    &gt;  to 10.0.13.2 via ge-0/0/1.0</pre>
<p>Ab dono next hops par arrow hai. Forwarding table dikhata hai kya badla:</p>
<pre class="out">lab@R1&gt; show route forwarding-table destination 172.16.40.0/24
172.16.40.0/24     user     0                    ulst  1048491     2
                              10.0.12.2          ucst    871     1 ge-0/0/0.0
                              10.0.13.2          ucst    874     1 ge-0/0/1.0</pre>
<p><b>ulst</b> ka matlab <b>unilist</b>, unicast next hops ki list. Do <b>ucst</b> lines members hain. Destination ab inmein se ek par hash hota hai.</p>

<h3>Split dekhna</h3>
<p>Data centre ke andar alag destination addresses alag paths le sakte hain:</p>
<pre class="out">lab@R1&gt; traceroute 172.16.40.10
 1  10.0.12.2 (10.0.12.2)  2.900 ms  1.300 ms  2.000 ms
 2  10.0.24.2 (10.0.24.2)  1.900 ms  2.600 ms  1.000 ms
 3  172.16.40.10 (172.16.40.10)  0.900 ms  1.600 ms  2.300 ms

lab@R1&gt; traceroute 172.16.40.23
 1  10.0.13.2 (10.0.13.2)  2.900 ms  1.300 ms  2.000 ms
 2  10.0.34.2 (10.0.34.2)  1.900 ms  2.600 ms  1.000 ms
 3  172.16.40.23 (172.16.40.23)  0.900 ms  1.600 ms  2.300 ms</pre>
<p>Pehla host R2 se, doosra R3 se jaata hai. Yahi flow-based sharing hai: ek flow ek path par, kai flows dono par.</p>

<h3>Limits jo jaanne hain</h3>
<ul>
<li>Load balancing ke liye route mein ek se zyada next hop chahiye; ek path ho to kuch nahi badalta.</li>
<li>Sirf OSPF equal-cost: alag cost ke paths share nahi hote.</li>
<li>Maximum next hops platform par nirbhar hai.</li>
<li>Doosre routing instances ke apne forwarding entries hote hain aur unhe bhi policy chahiye.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Data centre ke do 1 Gbps links tabhi 2 Gbps capacity dete hain jab dono traffic le jayein. Policy ke bina ek bada backup flow aur baaki sab ek link share karte hain aur doosra khali rehta hai. Policy ke baad users aur backups dono links par phail jaate hain.</p></div>
<div class="warn"><p><b>Common mistake.</b> Policy likhna par <code>forwarding-table export</code> mein na lagana. Routing table waisa hi dikhta hai, forwarding table mein ek next hop rehta hai, aur engineer maan leta hai ki feature toota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal do next hops wala routing table dikhata hai aur poochta hai sirf ek link busy kyun hai. Jawab: jab tak load-balance policy export na ho forwarding table mein ek next hop hota hai. "OSPF converge nahi hua" mat chuno.</p></div>
<div class="scn"><h4>Khali pada backup link</h4><p>Ek hospital ne data centre ke do links ke paise diye lekin monitoring mein ek 90% aur doosra 1% dikha. Routing table mein do next hops the, isliye team ne maana load balancing chalu hai. Forwarding table dekhne par ek hi ucst entry mili. Do-line policy ne theek kar diya, aur peak utilisation har link par lagbhag aadha ho gaya.</p><p><b>Lesson:</b> sirf routing table nahi, forwarding table bhi check karo.</p></div>
<div class="iv"><p class="q">"OSPF do barabar paths dikhata hai par ek hi use hota hai. Kyun, aur theek kaise karoge?"</p><p>Default mein Junos forwarding table mein ek next hop install karta hai. Main <code>then load-balance per-packet</code> wali policy banata hoon aur use <code>routing-options forwarding-table export</code> ki tarah lagata hoon. Phir forwarding table mein dono next hops wala ulst dikhta hai aur flows links par hash hote hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Equal-cost routes mein kai next hops hote hain, par default mein sirf ek forward hota hai.</li>
<li>Policy <code>load-balance per-packet</code> aur <code>forwarding-table export</code> sab install karte hain.</li>
<li>Forwarding table mein <b>ulst</b> entry iska saboot hai.</li>
<li>Hashing per flow hai, isliye ek conversation ke packets sahi order mein rehte hain.</li>
</ul></div>
`}};export{e as default};