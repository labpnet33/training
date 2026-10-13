var e={id:`longest-match-troubleshooting`,h:{en:`Longest match and troubleshooting a stale route`,hi:`Longest match aur stale route ka troubleshooting`},body:{en:`
<p>Every time a Junos router receives a packet, it asks one question: <b>which route in my table is the most specific one that contains this destination?</b> This is the <b>longest prefix match</b>. It is the most important rule in IP routing, and the second lab in this module is a ticket that depends on it.</p>

<h3>The rule in plain words</h3>
<p>Think of a postal sorter with three instructions: "everything else goes to the main hub", "anything for this city goes to depot A", "anything for this exact street goes to depot B". A letter for that street matches all three, but the most specific instruction wins. Routers do the same with prefixes: the route with the <b>longest prefix length</b> wins. <b>Preference</b> (Static 5, OSPF 10, BGP 170 and so on) only decides between routes for the <i>same</i> prefix and never beats a longer prefix.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Nested prefixes">
<rect x="10" y="10" width="620" height="190" rx="12" fill="#e2e8f0"/><text x="30" y="32" class="svg-ink" font-size="13">0.0.0.0/0 default: next hop 10.0.12.2 (R2, Internet)</text>
<rect x="40" y="48" width="560" height="140" rx="12" fill="#bae6fd"/><text x="60" y="70" class="svg-ink" font-size="13">172.20.0.0/16 campus: next hop 10.0.13.2 (R3)</text>
<rect x="70" y="86" width="500" height="90" rx="12" fill="#fde68a"/><text x="90" y="108" class="svg-ink" font-size="13">172.20.9.0/24 payroll: next hop 10.0.14.2 (R4, retired!)</text>
<circle cx="150" cy="148" r="6" fill="#dc2626"/><text x="165" y="152" class="svg-ink" font-size="12">172.20.9.10 matches all three, /24 wins</text>
</svg><p class="cap">Routes nest like boxes. The packet uses the smallest box it fits in.</p></div>

<h3>Direct and Local routes</h3>
<p>Every configured interface address creates two routes automatically: a <b>Direct</b> route for the connected subnet (preference 0) and a <b>Local</b> /32 route for the router's own address. In the first lab R1 holds 10.50.0.192/30 (Direct) and the static 10.50.0.0/24; for 10.50.0.193 the /30 wins even though both match.</p>

<h3>Commands to see which route is used</h3>
<pre class="code">show route                           <span class="c">whole inet.0 table</span>
show route 172.20.9.10               <span class="c">the route this address actually uses</span>
show route 172.20.0.0/16 orlonger    <span class="c">the /16 and everything more specific inside it</span>
show route protocol direct           <span class="c">only Direct routes</span></pre>
<p>If nothing matches and there is no default route, the packet is dropped and the sender receives an ICMP destination unreachable.</p>

<h3>Lab 2: the payroll server that vanished</h3>
<p><b>Ticket.</b> R1 is the hub of a small campus. Internet traffic leaves through R2 (10.0.12.2), the campus block 172.20.0.0/16 is behind R3 (10.0.13.2), and R4 (10.0.14.2) is the old DR site retired last month. Since the migration, the office LAN (10.1.1.0/24 behind R1) cannot reach the payroll server 172.20.9.10, though other campus hosts work.</p>
<p><b>Step 1: observe.</b> Do not change anything yet.</p>
<pre class="out">lab@R1-HUB&gt; show route 172.20.0.0/16 orlonger
inet.0: 12 destinations, 12 routes (12 active, 0 holddown, 0 hidden)
172.20.0.0/16      *[Static/5] 00:40:12
                    &gt;  to 10.0.13.2 via ge-0/0/1.0
<span class="hl">172.20.9.0/24      *[Static/5] 00:40:12
                    &gt;  to 10.0.14.2 via ge-0/0/2.0</span>

lab@R1-HUB&gt; show route 172.20.9.10
<span class="hl">172.20.9.0/24      *[Static/5] 00:40:15
                    &gt;  to 10.0.14.2 via ge-0/0/2.0</span>

lab@R1-HUB&gt; show route 172.20.200.7
172.20.0.0/16      *[Static/5] 00:40:20
                    &gt;  to 10.0.13.2 via ge-0/0/1.0</pre>
<p>The payroll server goes to 10.0.14.2 (the retired R4) because of a leftover /24. R3's management loopback 172.20.200.7 is inside the /16 but not the /24, so it works, which explains "other campus hosts work".</p>
<p><b>Step 2: fix.</b> Either delete the stale /24 (the /16 then takes over) or repoint it to 10.0.13.2. Deleting is cleaner:</p>
<pre class="code">lab@R1-HUB&gt; configure
lab@R1-HUB# delete routing-options static route 172.20.9.0/24
lab@R1-HUB# commit and-quit
lab@R1-HUB&gt; show route 172.20.9.10
172.20.0.0/16      *[Static/5] 00:00:04
                    &gt;  to 10.0.13.2 via ge-0/0/1.0</pre>
<p><b>Step 3: prove it.</b> From PC1 (10.1.1.10): <code>ping 172.20.9.10</code>, <code>ping 203.0.113.1</code> (the Internet test address on R2), and <code>trace 172.20.9.10</code>, which now shows the path through R3.</p>

<h3>A troubleshooting workflow that scales</h3>
<ol><li><b>Define the flow:</b> source, destination, expected path.</li>
<li><b>Layer 1 and 2:</b> <code>show interfaces terse</code>, <code>show arp no-resolve</code>.</li>
<li><b>Forward route:</b> on each hop run <code>show route &lt;destination&gt;</code> and read the next hop.</li>
<li><b>Return route:</b> repeat for the source address; many failures are one-way.</li>
<li><b>Look for a more specific route</b> than expected, using <code>orlonger</code>.</li>
<li><b>Change one thing,</b> commit (confirmed if remote), verify, and document.</li></ol>

<div class="eg"><p><b>Worked example.</b> Routes: 10.0.0.0/8 via A, 10.1.0.0/16 via B, 10.1.2.0/24 via C. Destination 10.1.2.55: all three match, /24 wins, go to C. Destination 10.1.9.9: /8 and /16 match, /16 wins, go to B. Destination 10.200.0.1: only /8 matches, go to A.</p></div>

<div class="warn"><p><b>Common mistake.</b> Looking only at the default or the summary route and forgetting that a leftover more-specific route is silently overriding it. Always use <code>show route &lt;dest&gt;</code> rather than reading the table by eye.</p></div>

<div class="exam"><p><b>Exam trap.</b> A route with a better preference but shorter prefix does not win. Longest prefix first; preference only breaks ties between identical prefixes.</p></div>

<div class="scn"><h4>The ghost of the old data center</h4><p>After a data center move, one finance application kept failing for one department. The old /24 static route to the retired site was never removed, while the new /16 pointed correctly. Every other server worked because it matched only the /16. A single <code>show route</code> for the failing address exposed the stale /24 in seconds.</p><p><b>Lesson:</b> after a migration, audit the specific routes, not only the summaries.</p></div>

<div class="iv"><p class="q">"A route with preference 5 and prefix /16 and another with preference 150 and prefix /24 exist. Which is used for an address in both?"</p><p>The /24 route, because longest prefix match comes first; preference only decides between routes for the same prefix. Show the command <code>show route &lt;address&gt;</code> as how you would confirm it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The router picks the longest (most specific) matching prefix; preference only breaks ties for the same prefix.</li>
<li>Every interface address adds a Direct and a Local /32 route.</li>
<li>show route &lt;address&gt; shows the route actually used; orlonger lists more-specific routes.</li>
<li>A stale more-specific static route can override a correct summary.</li>
<li>Troubleshoot forward and return routes, change one thing, verify.</li>
</ul></div>
`,hi:`
<p>Junos router jab bhi packet receive karta hai, woh ek sawal poochta hai: <b>meri table mein sabse specific route kaunsa hai jo is destination ko contain karta hai?</b> Yahi <b>longest prefix match</b> hai. Yeh IP routing ka sabse zaroori rule hai, aur is module ka doosra lab ek ticket hai jo isi par tika hai.</p>

<h3>Rule simple shabdon mein</h3>
<p>Ek postal sorter socho jiske paas teen instructions hain: "baaki sab main hub ko", "is sheher ka sab depot A ko", "is exact gali ka sab depot B ko". Us gali ki chitthi teeno se match karti hai, lekin sabse specific instruction jeetti hai. Routers prefixes ke saath wahi karte hain: jis route ki <b>prefix length sabse lambi</b> ho woh jeetta hai. <b>Preference</b> (Static 5, OSPF 10, BGP 170 aur aise) sirf <i>same</i> prefix ke routes ke beech faisla karti hai aur lambe prefix ko kabhi nahi harati.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Nested prefixes">
<rect x="10" y="10" width="620" height="190" rx="12" fill="#e2e8f0"/><text x="30" y="32" class="svg-ink" font-size="13">0.0.0.0/0 default: next hop 10.0.12.2 (R2, Internet)</text>
<rect x="40" y="48" width="560" height="140" rx="12" fill="#bae6fd"/><text x="60" y="70" class="svg-ink" font-size="13">172.20.0.0/16 campus: next hop 10.0.13.2 (R3)</text>
<rect x="70" y="86" width="500" height="90" rx="12" fill="#fde68a"/><text x="90" y="108" class="svg-ink" font-size="13">172.20.9.0/24 payroll: next hop 10.0.14.2 (R4, retired!)</text>
<circle cx="150" cy="148" r="6" fill="#dc2626"/><text x="165" y="152" class="svg-ink" font-size="12">172.20.9.10 teeno se match, /24 jeetta hai</text>
</svg><p class="cap">Routes dibbon ki tarah nested hote hain. Packet sabse chhote dibbe ko use karta hai jisme woh fit hota hai.</p></div>

<h3>Direct aur Local routes</h3>
<p>Har configured interface address do routes apne aap banata hai: connected subnet ka <b>Direct</b> route (preference 0) aur router ke apne address ka <b>Local</b> /32 route. Pehle lab mein R1 ke paas 10.50.0.192/30 (Direct) aur static 10.50.0.0/24 hain; 10.50.0.193 ke liye /30 jeetta hai, jabki dono match karte hain.</p>

<h3>Commands jo dikhate hain kaunsa route use hota hai</h3>
<pre class="code">show route                           <span class="c">poori inet.0 table</span>
show route 172.20.9.10               <span class="c">yeh address asal mein kaunsa route use karta hai</span>
show route 172.20.0.0/16 orlonger    <span class="c">/16 aur uske andar ke saare more-specific routes</span>
show route protocol direct           <span class="c">sirf Direct routes</span></pre>
<p>Kuch match na ho aur default route bhi na ho, to packet drop hota hai aur sender ko ICMP destination unreachable milta hai.</p>

<h3>Lab 2: payroll server jo gayab ho gaya</h3>
<p><b>Ticket.</b> R1 ek chhote campus ka hub hai. Internet traffic R2 (10.0.12.2) se bahar jaata hai, campus block 172.20.0.0/16 R3 (10.0.13.2) ke peeche hai, aur R4 (10.0.14.2) purani DR site hai jo pichle mahine band hui. Migration ke baad se office LAN (R1 ke peeche 10.1.1.0/24) payroll server 172.20.9.10 tak nahi pahunch pa raha, jabki baaki campus hosts chal rahe hain.</p>
<p><b>Step 1: observe.</b> Abhi kuch mat badlo.</p>
<pre class="out">lab@R1-HUB&gt; show route 172.20.0.0/16 orlonger
inet.0: 12 destinations, 12 routes (12 active, 0 holddown, 0 hidden)
172.20.0.0/16      *[Static/5] 00:40:12
                    &gt;  to 10.0.13.2 via ge-0/0/1.0
<span class="hl">172.20.9.0/24      *[Static/5] 00:40:12
                    &gt;  to 10.0.14.2 via ge-0/0/2.0</span>

lab@R1-HUB&gt; show route 172.20.9.10
<span class="hl">172.20.9.0/24      *[Static/5] 00:40:15
                    &gt;  to 10.0.14.2 via ge-0/0/2.0</span>

lab@R1-HUB&gt; show route 172.20.200.7
172.20.0.0/16      *[Static/5] 00:40:20
                    &gt;  to 10.0.13.2 via ge-0/0/1.0</pre>
<p>Payroll server 10.0.14.2 (band hua R4) ki taraf jaata hai ek bache hue /24 ki wajah se. R3 ka management loopback 172.20.200.7 /16 ke andar hai lekin /24 ke andar nahi, isliye chalta hai, aur isi se "baaki campus hosts chal rahe hain" samajh aata hai.</p>
<p><b>Step 2: fix.</b> Ya to purana /24 delete karo (tab /16 sambhal leta hai) ya use 10.0.13.2 par point karo. Delete karna zyada saaf hai:</p>
<pre class="code">lab@R1-HUB&gt; configure
lab@R1-HUB# delete routing-options static route 172.20.9.0/24
lab@R1-HUB# commit and-quit
lab@R1-HUB&gt; show route 172.20.9.10
172.20.0.0/16      *[Static/5] 00:00:04
                    &gt;  to 10.0.13.2 via ge-0/0/1.0</pre>
<p><b>Step 3: saabit karo.</b> PC1 (10.1.1.10) se: <code>ping 172.20.9.10</code>, <code>ping 203.0.113.1</code> (R2 par Internet test address), aur <code>trace 172.20.9.10</code>, jo ab R3 wala path dikhata hai.</p>

<h3>Troubleshooting workflow jo scale karta hai</h3>
<ol><li><b>Flow define karo:</b> source, destination, expected path.</li>
<li><b>Layer 1 aur 2:</b> <code>show interfaces terse</code>, <code>show arp no-resolve</code>.</li>
<li><b>Forward route:</b> har hop par <code>show route &lt;destination&gt;</code> chalao aur next hop padho.</li>
<li><b>Return route:</b> source address ke liye dohrao; kai failures one-way hote hain.</li>
<li><b>Expected se zyada specific route dhoondho</b>, <code>orlonger</code> se.</li>
<li><b>Ek cheez badlo,</b> commit (remote ho to confirmed), verify karo aur document karo.</li></ol>

<div class="eg"><p><b>Worked example.</b> Routes: 10.0.0.0/8 via A, 10.1.0.0/16 via B, 10.1.2.0/24 via C. Destination 10.1.2.55: teeno match, /24 jeetta hai, C ko jao. Destination 10.1.9.9: /8 aur /16 match, /16 jeetta hai, B ko. Destination 10.200.0.1: sirf /8 match, A ko.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sirf default ya summary route dekhna aur bhool jaana ki ek bacha hua more-specific route chupke se use override kar raha hai. Hamesha table aankh se padhne ki jagah <code>show route &lt;dest&gt;</code> use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Behtar preference lekin chhota prefix wala route nahi jeetta. Pehle longest prefix; preference sirf identical prefixes ke beech tie break karti hai.</p></div>

<div class="scn"><h4>Purane data center ka bhoot</h4><p>Data center move ke baad ek finance application ek department ke liye fail hoti rahi. Retired site ka purana /24 static route kabhi hataya nahi gaya tha, jabki naya /16 sahi point kar raha tha. Baaki sab servers chale kyunki woh sirf /16 se match karte the. Failing address ke liye ek <code>show route</code> ne stale /24 seconds mein pakad liya.</p><p><b>Lesson:</b> migration ke baad sirf summaries nahi, specific routes ka bhi audit karo.</p></div>

<div class="iv"><p class="q">"Preference 5 aur prefix /16 wala route aur preference 150 aur prefix /24 wala route hain. Dono mein aane wale address ke liye kaunsa use hota hai?"</p><p>/24 route, kyunki longest prefix match pehle aata hai; preference sirf same prefix ke routes ke beech faisla karti hai. Confirm karne ke liye <code>show route &lt;address&gt;</code> command ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Router sabse lamba (most specific) matching prefix chunta hai; preference sirf same prefix ka tie break karti hai.</li>
<li>Har interface address ek Direct aur ek Local /32 route jodta hai.</li>
<li>show route &lt;address&gt; asal route dikhata hai; orlonger more-specific routes list karta hai.</li>
<li>Bacha hua more-specific static route sahi summary ko override kar sakta hai.</li>
<li>Forward aur return routes troubleshoot karo, ek cheez badlo, verify karo.</li>
</ul></div>
`}};export{e as default};