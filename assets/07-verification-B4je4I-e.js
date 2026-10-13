var e={id:`verification`,h:{en:`Verification toolbox: reading the routing and forwarding tables`,hi:`Verification toolbox: routing aur forwarding tables padhna`},body:{en:`
<p><b>Why a toolbox.</b> Configuring a route takes one line; proving what the router really does takes the right command. The golden rule of routing troubleshooting is to look at three layers in order: <b>(1)</b> what is configured, <b>(2)</b> what the routing table decided, <b>(3)</b> what the forwarding table will use. A mismatch between the layers tells you where the fault is. This chapter builds your toolbox with real output from the branch router BR1 in its original faulty state (primary next hop mistyped, a reject route for 172.30.5.0/24, a backup static with preference 20).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Three layers of verification">
<rect x="20" y="40" width="170" height="80" rx="10" fill="#fde68a"/><text x="105" y="70" text-anchor="middle" class="svg-ink" font-size="14">1. Configuration</text><text x="105" y="92" text-anchor="middle" class="svg-muted" font-size="11">show configuration routing-options</text>
<rect x="235" y="40" width="170" height="80" rx="10" fill="#bae6fd"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="14">2. Routing table</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="11">show route ... [detail]</text>
<rect x="450" y="40" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="535" y="70" text-anchor="middle" class="svg-ink" font-size="14">3. Forwarding table</text><text x="535" y="92" text-anchor="middle" class="svg-muted" font-size="11">show route forwarding-table</text>
<line x1="190" y1="80" x2="235" y2="80" stroke="#64748b" stroke-width="2"/><line x1="405" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">compare the three to find where the intended behaviour is lost</text>
</svg><p class="cap">What you wrote, what the router decided, what the hardware does.</p></div>

<h3>Command 1: the whole table</h3>
<pre class="out">lab@BR1&gt; show route terse
A V Destination        P Prf   Metric 1   Metric 2  Next hop        AS path
* ? 10.60.1.0/30       D    0                        &gt;ge-0/0/0.0
* ? 10.60.2.0/30       D    0                        &gt;ge-0/0/1.0
* ? 172.30.0.0/16      S   20                        <span class="hl">&gt;10.60.2.2</span>
* ? 192.168.60.0/24    D    0                        &gt;ge-0/0/2.0</pre>
<p>The <b>terse</b> view puts one route per line: the star (active), protocol letter (D direct, L local, S static, O OSPF, B BGP, A aggregate), preference, and next hop. Here the /16 is active with preference 20 through 10.60.2.2, the <i>backup</i>. That is your first clue that the primary route never became active.</p>

<h3>Command 2: one destination</h3>
<p>To ask "what will the router do for this address?" give the address, not a prefix:</p>
<pre class="out">lab@BR1&gt; show route 172.30.5.10
172.30.5.0/24      *[Static/5] 00:00:40
                       Reject</pre>
<p>The router answers with the longest matching route, the /24, not the /16. That single output explains why the HR server fails. Related options:</p>
<table class="cmp"><tr><th>Command</th><th>Use</th></tr>
<tr><td><code>show route 172.30.0.0/16 exact</code></td><td>only that exact prefix (all its routes, active and inactive)</td></tr>
<tr><td><code>show route 172.30.0.0/16 longer</code></td><td>more specific routes inside it, not the prefix itself</td></tr>
<tr><td><code>show route 172.30.0.0/16 orlonger</code></td><td>the prefix and all more specific routes</td></tr>
<tr><td><code>show route best 172.30.5.10</code></td><td>the single best route for an address</td></tr>
<tr><td><code>show route protocol static</code></td><td>routes from one source</td></tr>
<tr><td><code>show route table inet.0 protocol static</code></td><td>same, naming the table</td></tr>
<tr><td><code>show route summary</code></td><td>route counts by protocol</td></tr></table>
<pre class="out">lab@BR1&gt; show route 172.30.0.0/16 longer
172.30.5.0/24      *[Static/5] 00:00:40
                       Reject</pre>
<p>The <b>longer</b> option found the black hole in one command: a more specific route lurking under the /16. Make this a habit when a covering route exists but a part of it fails.</p>

<h3>Command 3: detail</h3>
<pre class="out">lab@BR1&gt; show route 172.30.0.0/16 exact detail
172.30.0.0/16 (1 entry, 1 announced)
        *Static Preference: 20
                Next hop type: Router
                Next hop: 10.60.2.2 via ge-0/0/1.0, selected
                State: &lt;Active Int Ext&gt;
                Age: 0:40
                Task: RT</pre>
<p>"1 entry" is the key: only <i>one</i> route exists for this prefix. In the original design there should be two (primary and backup). Fields to read in detail output: preference, next-hop type (Router, Reject, Discard), the next-hop address, the active state, age and, for aggregates, contributing routes.</p>

<h3>Command 4: the forwarding table</h3>
<pre class="out">lab@BR1&gt; show route forwarding-table destination 172.30.5.10
Destination        Type RtRef Next hop           Type Index    NhRef Netif
172.30.5.0/24      user     0                    <span class="hl">rjct</span>    612     2</pre>
<table class="cmp"><tr><th>Next hop Type</th><th>Meaning</th></tr>
<tr><td>ucst</td><td>unicast to a neighbour (with its address and interface)</td></tr>
<tr><td>rjct</td><td>reject (drop and send ICMP)</td></tr>
<tr><td>dscd</td><td>discard (drop silently)</td></tr>
<tr><td>rslv</td><td>resolve: an attached subnet that must ARP for the host</td></tr>
<tr><td>locl</td><td>local address of the router</td></tr>
<tr><td>ulst</td><td>unilist: several next hops installed (load balancing)</td></tr></table>
<p>If the routing table and forwarding table disagree, suspect a platform or policy issue; for ordinary static routes they should match exactly.</p>

<h3>Command 5: real packets</h3>
<pre class="out">lab@BR1&gt; ping 172.30.5.10 count 2
2 packets transmitted, 0 packets received, 100% packet loss

lab@BR1&gt; traceroute 172.30.5.10 no-resolve
 1  * * *</pre>
<p>Use ping to test reachability and traceroute to see where packets stop. A reject route would normally return ICMP unreachable; a discard route gives silence. Ping from the router uses the router's own source address, so also test from a host on the LAN (a ping with <code>source</code> lets you simulate this from the router).</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "HQ is slow". Step 1 <code>show route 172.30.0.0/16 exact</code>: the active route is Static/20 via the backup link, so there is no primary route. Step 2 <code>show configuration routing-options</code>: primary next hop is 10.60.1.6. Step 3 compare with <code>show interfaces terse</code>: the link subnet is 10.60.1.0/30, so .6 is not connected. Fix and verify: <code>show route</code> now shows Static/5 with a star and Static/20 below it.</p></div>

<div class="warn"><p><b>Common mistake.</b> Running <code>show route 172.30.0.0/16</code> and concluding the route is fine. Test the <i>destination address</i> instead, because a more specific route can override. Likewise do not trust "the route exists": check the star, the next hop and the forwarding table type.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show route</code> without options shows inactive routes as well (no star). Hidden routes (ones the router cannot use) are shown with <code>show route hidden</code>, and the header counts them. Know the meaning of ucst, rjct, dscd and ulst.</p></div>

<div class="scn"><h4>The correct route that nobody used</h4><p>A new engineer verified a floating static by checking only <code>show configuration</code>. The backup was configured correctly, but traffic never failed over because the primary next hop still existed on a link that was up and passing nothing. Using <code>show route forwarding-table</code> and a traceroute showed packets stopping at the primary neighbour. Adding BFD to the static route let the router detect the dead path in under a second.</p><p><b>Lesson:</b> configuration is intent; the routing and forwarding tables are reality; a real packet test is truth.</p></div>
<div class="iv"><p class="q">"How do you check which route a Junos router will use for an IP address?"</p><p><code>show route ADDRESS</code> gives the best route by longest match, <code>show route ADDRESS detail</code> adds next-hop type and state, and <code>show route forwarding-table destination ADDRESS</code> shows what the PFE will really use. I would also use <code>longer</code> or <code>orlonger</code> to find more specific routes.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check three layers: configuration, routing table, forwarding table.</li>
<li>Ask about an address, not a prefix, to see longest match in action.</li>
<li><code>exact</code>, <code>longer</code>, <code>orlonger</code>, <code>protocol</code>, <code>terse</code> and <code>detail</code> narrow or widen the output.</li>
<li>Forwarding types: ucst, rjct, dscd, rslv, locl, ulst.</li>
<li>Finish with a real ping or traceroute.</li>
</ul></div>
`,hi:`
<p><b>Toolbox kyun.</b> Route configure karne mein ek line lagti hai; saabit karne ke liye ki router asal mein kya karta hai sahi command chahiye. Routing troubleshooting ka golden rule hai teen layers kram se dekho: <b>(1)</b> kya configure hai, <b>(2)</b> routing table ne kya tay kiya, <b>(3)</b> forwarding table kya use karegi. Layers ke beech mismatch batata hai fault kahan hai. Yeh chapter aapka toolbox branch router BR1 ke original faulty state (primary next hop galat type hua, 172.30.5.0/24 ke liye reject route, preference 20 wala backup static) ke real output se banata hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Verification ki teen layers">
<rect x="20" y="40" width="170" height="80" rx="10" fill="#fde68a"/><text x="105" y="70" text-anchor="middle" class="svg-ink" font-size="14">1. Configuration</text><text x="105" y="92" text-anchor="middle" class="svg-muted" font-size="11">show configuration routing-options</text>
<rect x="235" y="40" width="170" height="80" rx="10" fill="#bae6fd"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="14">2. Routing table</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="11">show route ... [detail]</text>
<rect x="450" y="40" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="535" y="70" text-anchor="middle" class="svg-ink" font-size="14">3. Forwarding table</text><text x="535" y="92" text-anchor="middle" class="svg-muted" font-size="11">show route forwarding-table</text>
<line x1="190" y1="80" x2="235" y2="80" stroke="#64748b" stroke-width="2"/><line x1="405" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">teeno compare karo ki intended behaviour kahan khoya</text>
</svg><p class="cap">Aapne kya likha, router ne kya tay kiya, hardware kya karta hai.</p></div>

<h3>Command 1: poori table</h3>
<pre class="out">lab@BR1&gt; show route terse
A V Destination        P Prf   Metric 1   Metric 2  Next hop        AS path
* ? 10.60.1.0/30       D    0                        &gt;ge-0/0/0.0
* ? 10.60.2.0/30       D    0                        &gt;ge-0/0/1.0
* ? 172.30.0.0/16      S   20                        <span class="hl">&gt;10.60.2.2</span>
* ? 192.168.60.0/24    D    0                        &gt;ge-0/0/2.0</pre>
<p><b>Terse</b> view mein ek line par ek route: star (active), protocol letter (D direct, L local, S static, O OSPF, B BGP, A aggregate), preference aur next hop. Yahan /16 preference 20 ke saath 10.60.2.2 se active hai, yaani <i>backup</i> se. Yeh pehla clue hai ki primary route kabhi active nahi hua.</p>

<h3>Command 2: ek destination</h3>
<p>"Router is address ke liye kya karega?" poochne ke liye prefix nahi, address do:</p>
<pre class="out">lab@BR1&gt; show route 172.30.5.10
172.30.5.0/24      *[Static/5] 00:00:40
                       Reject</pre>
<p>Router longest matching route se jawab deta hai, /24, /16 nahi. Yeh ek output HR server ke fail hone ki wajah samjha deta hai. Related options:</p>
<table class="cmp"><tr><th>Command</th><th>Kaam</th></tr>
<tr><td><code>show route 172.30.0.0/16 exact</code></td><td>sirf wahi exact prefix (uske saare routes, active aur inactive)</td></tr>
<tr><td><code>show route 172.30.0.0/16 longer</code></td><td>uske andar ke more specific routes, prefix khud nahi</td></tr>
<tr><td><code>show route 172.30.0.0/16 orlonger</code></td><td>prefix aur saare more specific routes</td></tr>
<tr><td><code>show route best 172.30.5.10</code></td><td>address ke liye ek best route</td></tr>
<tr><td><code>show route protocol static</code></td><td>ek source ke routes</td></tr>
<tr><td><code>show route table inet.0 protocol static</code></td><td>wahi, table ka naam dekar</td></tr>
<tr><td><code>show route summary</code></td><td>protocol ke hisaab se route counts</td></tr></table>
<pre class="out">lab@BR1&gt; show route 172.30.0.0/16 longer
172.30.5.0/24      *[Static/5] 00:00:40
                       Reject</pre>
<p><b>longer</b> option ne black hole ek command mein pakad liya: /16 ke neeche chhupa more specific route. Jab covering route ho lekin uska ek hissa fail ho to ise aadat banao.</p>

<h3>Command 3: detail</h3>
<pre class="out">lab@BR1&gt; show route 172.30.0.0/16 exact detail
172.30.0.0/16 (1 entry, 1 announced)
        *Static Preference: 20
                Next hop type: Router
                Next hop: 10.60.2.2 via ge-0/0/1.0, selected
                State: &lt;Active Int Ext&gt;
                Age: 0:40
                Task: RT</pre>
<p>"1 entry" key hai: is prefix ka sirf <i>ek</i> route hai. Original design mein do hone chahiye (primary aur backup). Detail output ke padhne wale fields: preference, next-hop type (Router, Reject, Discard), next-hop address, active state, age, aur aggregates ke liye contributing routes.</p>

<h3>Command 4: forwarding table</h3>
<pre class="out">lab@BR1&gt; show route forwarding-table destination 172.30.5.10
Destination        Type RtRef Next hop           Type Index    NhRef Netif
172.30.5.0/24      user     0                    <span class="hl">rjct</span>    612     2</pre>
<table class="cmp"><tr><th>Next hop Type</th><th>Matlab</th></tr>
<tr><td>ucst</td><td>neighbour ko unicast (address aur interface ke saath)</td></tr>
<tr><td>rjct</td><td>reject (drop aur ICMP bhejo)</td></tr>
<tr><td>dscd</td><td>discard (chupchaap drop)</td></tr>
<tr><td>rslv</td><td>resolve: attached subnet jisme host ke liye ARP karna padta hai</td></tr>
<tr><td>locl</td><td>router ka local address</td></tr>
<tr><td>ulst</td><td>unilist: kai next hops installed (load balancing)</td></tr></table>
<p>Routing table aur forwarding table mein farak ho to platform ya policy issue ka shak karo; aam static routes ke liye dono bilkul match karne chahiye.</p>

<h3>Command 5: real packets</h3>
<pre class="out">lab@BR1&gt; ping 172.30.5.10 count 2
2 packets transmitted, 0 packets received, 100% packet loss

lab@BR1&gt; traceroute 172.30.5.10 no-resolve
 1  * * *</pre>
<p>Reachability ke liye ping aur packets kahan ruke dekhne ke liye traceroute use karo. Reject route aam taur par ICMP unreachable lautata hai; discard route khamoshi deta hai. Router se ping router ka apna source address use karta hai, isliye LAN ke host se bhi test karo (router se <code>source</code> ke saath ping karke ise simulate kar sakte ho).</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "HQ slow hai". Step 1 <code>show route 172.30.0.0/16 exact</code>: active route backup link se Static/20 hai, yaani primary route nahi hai. Step 2 <code>show configuration routing-options</code>: primary next hop 10.60.1.6 hai. Step 3 <code>show interfaces terse</code> se compare: link subnet 10.60.1.0/30 hai, isliye .6 connected nahi. Fix aur verify: <code>show route</code> ab Static/5 star ke saath aur uske neeche Static/20 dikhata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>show route 172.30.0.0/16</code> chalakar maan lena ki route theek hai. <i>Destination address</i> test karo, kyunki more specific route override kar sakta hai. Isi tarah "route maujood hai" par bharosa mat karo: star, next hop aur forwarding table type check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Bina options ke <code>show route</code> inactive routes (bina star ke) bhi dikhata hai. Hidden routes (jinhe router use nahi kar sakta) <code>show route hidden</code> se dikhte hain, aur header unhe ginta hai. ucst, rjct, dscd aur ulst ka matlab jaano.</p></div>

<div class="scn"><h4>Sahi route jo kisi ne use nahi kiya</h4><p>Ek naye engineer ne floating static sirf <code>show configuration</code> dekhkar verify kiya. Backup sahi configure tha, lekin traffic failover nahi hua kyunki primary next hop aise link par tha jo up tha lekin kuch pass nahi kar raha tha. <code>show route forwarding-table</code> aur traceroute ne dikhaya ki packets primary neighbour par ruk rahe the. Static route mein BFD jodne se router ne dead path ko ek second se kam mein pakad liya.</p><p><b>Lesson:</b> configuration irada hai; routing aur forwarding tables hakikat hain; real packet test sach hai.</p></div>
<div class="iv"><p class="q">"Junos router kisi IP address ke liye kaunsa route use karega yeh kaise check karte ho?"</p><p><code>show route ADDRESS</code> longest match se best route deta hai, <code>show route ADDRESS detail</code> next-hop type aur state jodta hai, aur <code>show route forwarding-table destination ADDRESS</code> dikhata hai ki PFE asal mein kya use karega. Main more specific routes dhoondhne ke liye <code>longer</code> ya <code>orlonger</code> bhi use karunga.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen layers check karo: configuration, routing table, forwarding table.</li>
<li>Longest match dekhne ke liye prefix nahi, address poochho.</li>
<li><code>exact</code>, <code>longer</code>, <code>orlonger</code>, <code>protocol</code>, <code>terse</code> aur <code>detail</code> output ko chhota ya bada karte hain.</li>
<li>Forwarding types: ucst, rjct, dscd, rslv, locl, ulst.</li>
<li>Real ping ya traceroute se khatam karo.</li>
</ul></div>
`}};export{e as default};