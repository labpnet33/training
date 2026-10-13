var e={id:`routing-forwarding-tables`,h:{en:`Routing table versus forwarding table, and reading show route`,hi:`Routing table vs forwarding table, aur show route padhna`},body:{en:`
<p>Junos keeps two different structures, and the exam loves to ask which is which. One is the library of everything the router has heard; the other is the short list of what it actually uses.</p>

<h3>Analogy: the travel agent and the departure board</h3>
<p>A travel agent has a thick file with every flight option to every city, including cheaper but slower ones. The departure board at the airport shows only the one flight that will actually leave. The agent's file is the <b>routing table</b>; the departure board is the <b>forwarding table</b>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Control plane and forwarding plane">
<rect x="10" y="10" width="620" height="90" rx="10" fill="#ddd6fe"/><text x="25" y="32" class="svg-ink" font-size="13">Routing Engine (RE): control plane</text>
<rect x="30" y="45" width="130" height="40" rx="6" fill="#bae6fd"/><text x="95" y="70" text-anchor="middle" class="svg-ink" font-size="12">Static, Direct</text>
<rect x="175" y="45" width="130" height="40" rx="6" fill="#bae6fd"/><text x="240" y="70" text-anchor="middle" class="svg-ink" font-size="12">OSPF, BGP</text>
<rect x="340" y="40" width="270" height="50" rx="6" fill="#fde68a"/><text x="475" y="62" text-anchor="middle" class="svg-ink" font-size="12">Routing table inet.0</text><text x="475" y="80" text-anchor="middle" class="svg-muted" font-size="11">all routes, active and inactive</text>
<rect x="10" y="130" width="620" height="70" rx="10" fill="#bbf7d0"/><text x="25" y="152" class="svg-ink" font-size="13">Packet Forwarding Engine (PFE): forwarding plane</text>
<rect x="340" y="158" width="270" height="34" rx="6" fill="#fed7aa"/><text x="475" y="180" text-anchor="middle" class="svg-ink" font-size="12">Forwarding table: active routes only</text>
<path d="M475 90 L475 158" stroke="#64748b" stroke-width="2" fill="none"/><text x="560" y="128" class="svg-accent" font-size="11">active copied</text>
</svg><p class="cap">The RE decides and keeps all routes; only the active route per prefix is pushed to the PFE, which moves packets at line rate.</p></div>

<h3>The two tables</h3>
<ul>
<li><b>Routing table</b>, on the Routing Engine. It holds every route learned from every source: directly connected subnets, the router's own addresses, static routes, OSPF, BGP. There can be several routes to the same prefix. IPv4 unicast routes are in <code>inet.0</code>, IPv6 unicast routes in <code>inet6.0</code>.</li>
<li><b>Forwarding table</b>, on the Packet Forwarding Engine. It holds one <b>active route</b> per prefix, the one chosen to move packets.</li>
</ul>
<p>Other tables exist for other jobs, such as <code>inet.3</code> for MPLS next hops and <code>mpls.0</code>, but for JNCIA you need inet.0 and inet6.0.</p>

<h3>Direct and Local routes</h3>
<p>When you configure <code>set interfaces ge-0/0/0 unit 0 family inet address 10.1.12.1/30</code>, Junos creates two routes at once: a <b>Direct</b> route for the subnet (10.1.12.0/30) and a <b>Local</b> route for the router's own address (10.1.12.1/32). Both have preference 0. A loopback address gives a Local route as well.</p>
<pre class="out">lab@R1-NAGPUR&gt; show route

inet.0: 7 destinations, 7 routes (7 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

0.0.0.0/0          *[Static/5] 00:12:04
                    &gt;  to 10.1.12.2 via ge-0/0/0.0
<span class="hl">10.1.12.0/30       *[Direct/0] 00:41:19
                    &gt;  via ge-0/0/0.0
10.1.12.1/32       *[Local/0] 00:41:19
                      Local via ge-0/0/0.0</span>
192.168.10.0/24    *[Direct/0] 00:41:19
                    &gt;  via ge-0/0/2.0
192.168.10.1/32    *[Local/0] 00:41:19
                      Local via ge-0/0/2.0
</pre>
<p>The header line says how many destinations and routes the table has, and how many are active, holddown (waiting) or hidden (unusable, for example because the next hop cannot be resolved). The legend <code>+ = Active Route, - = Last Active, * = Both</code> explains the symbol before each route.</p>

<h3>The show route family</h3>
<table class="cmp"><tr><th>Command</th><th>Use</th></tr>
<tr><td><code>show route</code></td><td>All routes in all tables</td></tr>
<tr><td><code>show route table inet.0</code></td><td>Only the IPv4 unicast table</td></tr>
<tr><td><code>show route table inet6.0</code></td><td>Only the IPv6 unicast table</td></tr>
<tr><td><code>show route 172.16.30.10</code></td><td>The route that would forward this address</td></tr>
<tr><td><code>show route 172.16.30.0/24 exact</code></td><td>Only that exact prefix</td></tr>
<tr><td><code>show route 192.168.0.0/16 longer</code></td><td>That prefix and everything more specific</td></tr>
<tr><td><code>show route protocol static</code></td><td>Only routes from one source (also ospf, direct, local)</td></tr>
<tr><td><code>show route 172.16.30.0/24 detail</code></td><td>Full details, including the reason a route is inactive</td></tr>
<tr><td><code>show route forwarding-table</code></td><td>What the PFE really uses</td></tr>
<tr><td><code>show route summary</code></td><td>Counts per table and protocol</td></tr></table>
<pre class="out">lab@R1-NAGPUR&gt; show route forwarding-table destination 172.16.30.10
Routing table: default.inet
Internet:
Destination        Type RtRef Next hop           Type Index    NhRef Netif
default            user     0 10.1.12.2          ucst  587     5 ge-0/0/0.0
</pre>
<p>If <code>show route</code> and the forwarding table disagree, something is wrong, for example a route that is hidden. In normal work you trust show route and verify with ping and traceroute.</p>

<div class="warn"><p><b>Common mistake.</b> Searching <code>show route</code> for an IPv6 destination and finding nothing, when the route is in inet6.0, or the reverse. Remember: IPv4 is inet.0, IPv6 is inet6.0. Plain <code>show route</code> without a table name shows all of them.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which table contains only the active route for each prefix?" Answer: the forwarding table, not inet.0. The routing table keeps active and inactive routes; the forwarding table keeps only the winners.</p></div>

<div class="scn"><h4>The hidden route</h4><p>An engineer configured a static route with a next hop that was two subnets away. The configuration committed without an error, but traffic never used the route. show route showed "1 hidden" in the header and show route hidden listed it. Junos requires a directly connected next hop unless the route has the resolve keyword. Adding resolve (or using the correct neighbour as next hop) made the route active.</p><p><b>Lesson:</b> read the header line of show route; hidden routes are routes that exist but cannot be used.</p></div>

<div class="iv"><p class="q">"What is the difference between the routing table and the forwarding table in Junos?"</p><p>The routing table lives on the Routing Engine and has all routes from all sources, several per prefix, in tables like inet.0 and inet6.0. The forwarding table is pushed to the Packet Forwarding Engine and holds only the single active route per prefix, which hardware uses to forward at line rate. This separation of control and forwarding planes keeps traffic flowing even when the RE is busy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routing table: all routes, on the RE. Forwarding table: active routes only, on the PFE.</li>
<li>inet.0 is IPv4 unicast; inet6.0 is IPv6 unicast.</li>
<li>Every interface address creates a Direct route (subnet) and a Local route (/32), preference 0.</li>
<li>show route has many filters: table, exact, longer, protocol, detail, forwarding-table.</li>
<li>Hidden routes exist but are unusable; read the header line.</li>
</ul></div>
`,hi:`
<p>Junos do alag structures rakhta hai, aur exam yeh poochna pasand karta hai ki kaunsa kaunsa hai. Ek woh library hai jo router ne sab suna hai; doosra woh chhoti list jo woh sach mein use karta hai.</p>

<h3>Analogy: travel agent aur departure board</h3>
<p>Travel agent ke paas har shehar ki har flight ki moti file hoti hai, sasti lekin slow flights samet. Airport ka departure board sirf woh ek flight dikhata hai jo sach mein jaayegi. Agent ki file <b>routing table</b> hai; departure board <b>forwarding table</b> hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Control plane and forwarding plane">
<rect x="10" y="10" width="620" height="90" rx="10" fill="#ddd6fe"/><text x="25" y="32" class="svg-ink" font-size="13">Routing Engine (RE): control plane</text>
<rect x="30" y="45" width="130" height="40" rx="6" fill="#bae6fd"/><text x="95" y="70" text-anchor="middle" class="svg-ink" font-size="12">Static, Direct</text>
<rect x="175" y="45" width="130" height="40" rx="6" fill="#bae6fd"/><text x="240" y="70" text-anchor="middle" class="svg-ink" font-size="12">OSPF, BGP</text>
<rect x="340" y="40" width="270" height="50" rx="6" fill="#fde68a"/><text x="475" y="62" text-anchor="middle" class="svg-ink" font-size="12">Routing table inet.0</text><text x="475" y="80" text-anchor="middle" class="svg-muted" font-size="11">saare routes, active aur inactive</text>
<rect x="10" y="130" width="620" height="70" rx="10" fill="#bbf7d0"/><text x="25" y="152" class="svg-ink" font-size="13">Packet Forwarding Engine (PFE): forwarding plane</text>
<rect x="340" y="158" width="270" height="34" rx="6" fill="#fed7aa"/><text x="475" y="180" text-anchor="middle" class="svg-ink" font-size="12">Forwarding table: sirf active routes</text>
<path d="M475 90 L475 158" stroke="#64748b" stroke-width="2" fill="none"/><text x="560" y="128" class="svg-accent" font-size="11">active copy hota hai</text>
</svg><p class="cap">RE decide karta hai aur saare routes rakhta hai; har prefix ka sirf active route PFE ko jaata hai, jo line rate par packets chalata hai.</p></div>

<h3>Do tables</h3>
<ul>
<li><b>Routing table</b>, Routing Engine par. Isme har source se seekhe saare routes hote hain: directly connected subnets, router ke apne addresses, static routes, OSPF, BGP. Ek hi prefix ke kai routes ho sakte hain. IPv4 unicast routes <code>inet.0</code> mein, IPv6 unicast routes <code>inet6.0</code> mein.</li>
<li><b>Forwarding table</b>, Packet Forwarding Engine par. Isme har prefix ka ek <b>active route</b> hota hai, jo packets chalane ke liye chuna gaya.</li>
</ul>
<p>Doosre kaamon ke liye aur tables hain, jaise MPLS next hops ke liye <code>inet.3</code> aur <code>mpls.0</code>, lekin JNCIA ke liye inet.0 aur inet6.0 chahiye.</p>

<h3>Direct aur Local routes</h3>
<p>Jab aap <code>set interfaces ge-0/0/0 unit 0 family inet address 10.1.12.1/30</code> configure karte ho, Junos ek saath do routes banata hai: subnet ka <b>Direct</b> route (10.1.12.0/30) aur router ke apne address ka <b>Local</b> route (10.1.12.1/32). Dono ki preference 0 hai. Loopback address bhi Local route deta hai.</p>
<pre class="out">lab@R1-NAGPUR&gt; show route

inet.0: 7 destinations, 7 routes (7 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

0.0.0.0/0          *[Static/5] 00:12:04
                    &gt;  to 10.1.12.2 via ge-0/0/0.0
<span class="hl">10.1.12.0/30       *[Direct/0] 00:41:19
                    &gt;  via ge-0/0/0.0
10.1.12.1/32       *[Local/0] 00:41:19
                      Local via ge-0/0/0.0</span>
192.168.10.0/24    *[Direct/0] 00:41:19
                    &gt;  via ge-0/0/2.0
192.168.10.1/32    *[Local/0] 00:41:19
                      Local via ge-0/0/2.0
</pre>
<p>Header line batati hai table mein kitne destinations aur routes hain, aur kitne active, holddown (intezaar mein) ya hidden (unusable, jaise next hop resolve na ho) hain. Legend <code>+ = Active Route, - = Last Active, * = Both</code> har route se pehle ka symbol samjhata hai.</p>

<h3>show route family</h3>
<table class="cmp"><tr><th>Command</th><th>Use</th></tr>
<tr><td><code>show route</code></td><td>Saari tables ke saare routes</td></tr>
<tr><td><code>show route table inet.0</code></td><td>Sirf IPv4 unicast table</td></tr>
<tr><td><code>show route table inet6.0</code></td><td>Sirf IPv6 unicast table</td></tr>
<tr><td><code>show route 172.16.30.10</code></td><td>Woh route jo is address ko forward karega</td></tr>
<tr><td><code>show route 172.16.30.0/24 exact</code></td><td>Sirf wahi exact prefix</td></tr>
<tr><td><code>show route 192.168.0.0/16 longer</code></td><td>Woh prefix aur uske andar ke saare zyada specific</td></tr>
<tr><td><code>show route protocol static</code></td><td>Sirf ek source ke routes (ospf, direct, local bhi)</td></tr>
<tr><td><code>show route 172.16.30.0/24 detail</code></td><td>Poori details, route inactive kyun hai uska kaaran samet</td></tr>
<tr><td><code>show route forwarding-table</code></td><td>PFE asal mein kya use karta hai</td></tr>
<tr><td><code>show route summary</code></td><td>Har table aur protocol ki ginti</td></tr></table>
<pre class="out">lab@R1-NAGPUR&gt; show route forwarding-table destination 172.16.30.10
Routing table: default.inet
Internet:
Destination        Type RtRef Next hop           Type Index    NhRef Netif
default            user     0 10.1.12.2          ucst  587     5 ge-0/0/0.0
</pre>
<p>show route aur forwarding table mein farq ho to kuch galat hai, jaise hidden route. Normal kaam mein show route par bharosa karte hain aur ping aur traceroute se verify karte hain.</p>

<div class="warn"><p><b>Common mistake.</b> IPv6 destination ke liye <code>show route</code> mein kuch na milna, jabki route inet6.0 mein hai, ya ulta. Yaad rakho: IPv4 inet.0, IPv6 inet6.0. Table naam ke bina plain <code>show route</code> sab dikhata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaunsi table har prefix ka sirf active route rakhti hai?" Jawab: forwarding table, inet.0 nahi. Routing table active aur inactive dono rakhti hai; forwarding table sirf winners.</p></div>

<div class="scn"><h4>Chhupa hua route</h4><p>Ek engineer ne aisa static route configure kiya jiska next hop do subnets door tha. Configuration bina error ke commit hui, lekin traffic ne route kabhi use nahi kiya. show route ke header mein "1 hidden" tha aur show route hidden ne use list kiya. Junos directly connected next hop expect karta hai jab tak route par resolve keyword na ho. Resolve lagane se (ya sahi neighbour ko next hop banane se) route active ho gaya.</p><p><b>Lesson:</b> show route ki header line padho; hidden routes woh hain jo maujood hain lekin use nahi ho sakte.</p></div>

<div class="iv"><p class="q">"Junos mein routing table aur forwarding table mein kya fark hai?"</p><p>Routing table Routing Engine par hai aur isme saare sources ke saare routes hain, ek prefix ke kai, inet.0 aur inet6.0 jaisi tables mein. Forwarding table Packet Forwarding Engine ko push hoti hai aur isme har prefix ka sirf ek active route hai, jise hardware line rate par forward karne ke liye use karta hai. Control aur forwarding planes ka yeh alag hona RE busy hone par bhi traffic chalta rakhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routing table: saare routes, RE par. Forwarding table: sirf active routes, PFE par.</li>
<li>inet.0 IPv4 unicast hai; inet6.0 IPv6 unicast.</li>
<li>Har interface address ek Direct route (subnet) aur ek Local route (/32) banata hai, preference 0.</li>
<li>show route ke kai filters hain: table, exact, longer, protocol, detail, forwarding-table.</li>
<li>Hidden routes maujood hain lekin unusable; header line padho.</li>
</ul></div>
`}};export{e as default};