var e={id:`troubleshooting-method`,h:{en:`A troubleshooting method for professional-level networks`,hi:`Professional-level networks ke liye troubleshooting method`},body:{en:`
<p>A professional-level fault rarely announces itself. The ticket says "the Hubli server is unreachable". You need a method that works for any protocol, so that you never stare at the screen not knowing what to type. This chapter gives you one and then applies it to a real simulator lab.</p>

<h3>The six-step method</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Six step method">
<rect x="10" y="50" width="92" height="60" rx="8" fill="#bae6fd"/><text x="56" y="76" text-anchor="middle" class="svg-ink" font-size="12">1 Define</text><text x="56" y="94" text-anchor="middle" class="svg-muted" font-size="10">symptom</text>
<rect x="115" y="50" width="92" height="60" rx="8" fill="#bbf7d0"/><text x="161" y="76" text-anchor="middle" class="svg-ink" font-size="12">2 Scope</text><text x="161" y="94" text-anchor="middle" class="svg-muted" font-size="10">who, where</text>
<rect x="220" y="50" width="92" height="60" rx="8" fill="#ddd6fe"/><text x="266" y="76" text-anchor="middle" class="svg-ink" font-size="12">3 Walk</text><text x="266" y="94" text-anchor="middle" class="svg-muted" font-size="10">bottom up</text>
<rect x="325" y="50" width="92" height="60" rx="8" fill="#fde68a"/><text x="371" y="76" text-anchor="middle" class="svg-ink" font-size="12">4 Hypothesis</text><text x="371" y="94" text-anchor="middle" class="svg-muted" font-size="10">one cause</text>
<rect x="430" y="50" width="92" height="60" rx="8" fill="#fed7aa"/><text x="476" y="76" text-anchor="middle" class="svg-ink" font-size="12">5 Fix</text><text x="476" y="94" text-anchor="middle" class="svg-muted" font-size="10">one change</text>
<rect x="535" y="50" width="92" height="60" rx="8" fill="#bae6fd"/><text x="581" y="76" text-anchor="middle" class="svg-ink" font-size="12">6 Verify</text><text x="581" y="94" text-anchor="middle" class="svg-muted" font-size="10">and record</text>
<text x="320" y="146" text-anchor="middle" class="svg-accent" font-size="12">If the verify step fails, return to step 3 with what you learned.</text>
</svg><p class="cap">Define, scope, walk the layers, hypothesise, fix one thing, verify.</p></div>
<ol>
<li><b>Define</b> the symptom exactly: source, destination, protocol, since when. "PC1 cannot ping 172.16.5.10" is testable; "the network is slow" is not.</li>
<li><b>Scope</b> it. Does it affect one host, one subnet, one site? Can the source reach the next router? The hop where reachability stops is your area.</li>
<li><b>Walk the layers bottom up</b> at that hop: interface and VLAN, IP address, IGP neighbour, database, route, forwarding, policy and services.</li>
<li><b>Form one hypothesis</b> that explains every observation. If it explains only half of them, it is wrong or incomplete.</li>
<li><b>Fix one thing</b> and use <code>commit confirmed</code> if the change is risky.</li>
<li><b>Verify</b> with the same test that failed, then record what was wrong.</li>
</ol>

<h3>Commands for each layer</h3>
<table class="cmp"><tr><th>Layer</th><th>Command</th><th>Looking for</th></tr>
<tr><td>Interface</td><td><code>show interfaces terse</code></td><td>Admin and Link up, right address</td></tr>
<tr><td>Neighbour</td><td><code>show ospf neighbor</code> / <code>show isis adjacency</code></td><td>Full / Up</td></tr>
<tr><td>Interface in protocol</td><td><code>show ospf interface</code></td><td>Correct area, state, no Down</td></tr>
<tr><td>Database</td><td><code>show ospf database</code> / <code>show isis database</code></td><td>Expected LSAs or LSPs present</td></tr>
<tr><td>Route</td><td><code>show route X</code>, <code>show route hidden</code></td><td>Present, active, right next hop</td></tr>
<tr><td>Forwarding</td><td><code>show route forwarding-table destination X</code></td><td>Next hop installed</td></tr>
<tr><td>Config</td><td><code>show configuration | display set | match ospf</code></td><td>Typos, wrong IDs</td></tr>
<tr><td>Path</td><td><code>ping</code>, <code>traceroute no-resolve</code></td><td>Where packets stop</td></tr></table>

<h3>Worked case: the area that lost the backbone</h3>
<p>Ticket: PC1 at head office cannot reach the Hubli server 172.16.5.10. R1 has no route to 172.16.5.0/24. Step 2 shows R1 and R2 are fine, so we walk R2, the ABR. The neighbour table has no virtual link and the interface list shows it Down.</p>
<pre class="out">lab@R2-HO&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.5.12.1        ge-0/0/0.0             Full            10.255.5.1       128    37
10.5.23.2        ge-0/0/1.0             Full            10.255.5.3       128    31

lab@R2-HO&gt; show ospf interface
Interface           State   Area            DR ID           BDR ID          Nbrs
ge-0/0/0.0          DR      0.0.0.0         10.255.5.2      10.255.5.1         1
ge-0/0/1.0          BDR     0.0.0.1         10.255.5.3      10.255.5.2         1
lo0.0               DR      0.0.0.0         0.0.0.0         0.0.0.0            0
<span class="hl">vl-10.255.5.3       Down</span>    0.0.0.0         0.0.0.0         0.0.0.0            0</pre>
<p>Hypothesis: R3 does not point back at R2's router ID. Check R3's configuration:</p>
<pre class="out">lab@R3-DHARWAD&gt; show configuration protocols ospf
area 0.0.0.0 {
    virtual-link neighbor-id <span class="hl">10.5.23.1</span> {
        transit-area 0.0.0.1;
    }
}</pre>
<p>10.5.23.1 is an interface address of R2. A virtual link needs the <b>router ID</b>, 10.255.5.2. One change fixes it, then we verify with the same tests.</p>
<pre class="code">delete protocols ospf area 0.0.0.0 virtual-link neighbor-id 10.5.23.1
set protocols ospf area 0.0.0.0 virtual-link neighbor-id 10.255.5.2 transit-area 0.0.0.1
commit and-quit</pre>
<pre class="out">lab@R2-HO&gt; show ospf neighbor
10.5.12.1        ge-0/0/0.0             Full            10.255.5.1       128    40
10.5.23.2        ge-0/0/1.0             Full            10.255.5.3       128    34
10.5.23.2        <span class="hl">vl-10.255.5.3</span>          Full            10.255.5.3         0    33

lab@R1-HO&gt; show route 172.16.5.0/24
172.16.5.0/24      *[OSPF/10] 00:00:32, metric 4
                    &gt;  to 10.5.12.2 via ge-0/0/0.0</pre>

<div class="warn"><p><b>Common mistake.</b> Changing three things at once. If the problem disappears you will not know which change fixed it, and a wrong change may hide a second fault.</p></div>
<div class="exam"><p><b>Exam trap.</b> In a troubleshooting question the visible symptom (no route on R1) is usually not on the faulty device. Follow the path hop by hop to find where information stops flowing.</p></div>

<div class="scn"><h4>Two faults, one ticket</h4><p>After a merger, one site could not reach a server. The engineer fixed the virtual link and the route appeared, but pings still failed. Walking the layers again, the forwarding table was correct, yet the server had no return route to the head-office subnet. The first fault was a routing fault; the second a missing return path on the server side.</p><p><b>Lesson:</b> verify end to end with the original test, in both directions, before you close the ticket.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot a network you have never seen."</p><p>Define the symptom precisely, find the last hop where it still works, then walk the layers at that hop: interface, neighbour, database, route, forwarding, policy. Form one hypothesis, change one thing, verify with the original test. Say that you record findings and use <code>commit confirmed</code> for risky changes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method beats memory: define, scope, walk layers, hypothesise, fix one thing, verify.</li>
<li>Find the hop where reachability stops before touching configuration.</li>
<li>Interface, neighbour, database, route, forwarding is the usual order.</li>
<li>A virtual link needs the remote router ID, not an interface address.</li>
<li>Verify with the original test in both directions.</li>
</ul></div>
`,hi:`
<p>Professional-level fault shayad hi khud batata hai ki woh kya hai. Ticket kehta hai "Hubli server unreachable hai". Aapko aisa method chahiye jo har protocol par chale, taaki aap kabhi screen ko ghoorte na reh jao ki kya type karein. Yeh chapter ek method deta hai aur use asli simulator lab par lagata hai.</p>

<h3>Chhe-step method</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Chhe step method">
<rect x="10" y="50" width="92" height="60" rx="8" fill="#bae6fd"/><text x="56" y="76" text-anchor="middle" class="svg-ink" font-size="12">1 Define</text><text x="56" y="94" text-anchor="middle" class="svg-muted" font-size="10">symptom</text>
<rect x="115" y="50" width="92" height="60" rx="8" fill="#bbf7d0"/><text x="161" y="76" text-anchor="middle" class="svg-ink" font-size="12">2 Scope</text><text x="161" y="94" text-anchor="middle" class="svg-muted" font-size="10">kaun, kahan</text>
<rect x="220" y="50" width="92" height="60" rx="8" fill="#ddd6fe"/><text x="266" y="76" text-anchor="middle" class="svg-ink" font-size="12">3 Walk</text><text x="266" y="94" text-anchor="middle" class="svg-muted" font-size="10">neeche se upar</text>
<rect x="325" y="50" width="92" height="60" rx="8" fill="#fde68a"/><text x="371" y="76" text-anchor="middle" class="svg-ink" font-size="12">4 Hypothesis</text><text x="371" y="94" text-anchor="middle" class="svg-muted" font-size="10">ek cause</text>
<rect x="430" y="50" width="92" height="60" rx="8" fill="#fed7aa"/><text x="476" y="76" text-anchor="middle" class="svg-ink" font-size="12">5 Fix</text><text x="476" y="94" text-anchor="middle" class="svg-muted" font-size="10">ek change</text>
<rect x="535" y="50" width="92" height="60" rx="8" fill="#bae6fd"/><text x="581" y="76" text-anchor="middle" class="svg-ink" font-size="12">6 Verify</text><text x="581" y="94" text-anchor="middle" class="svg-muted" font-size="10">aur record</text>
<text x="320" y="146" text-anchor="middle" class="svg-accent" font-size="12">Verify fail ho to jo seekha uske saath step 3 par wapas jao.</text>
</svg><p class="cap">Define, scope, layers walk karo, hypothesis, ek cheez fix, verify.</p></div>
<ol>
<li><b>Define</b> karo symptom ko bilkul exact: source, destination, protocol, kab se. "PC1 172.16.5.10 ko ping nahi kar sakta" testable hai; "network slow hai" nahi.</li>
<li><b>Scope</b> karo. Ek host, ek subnet, ek site par asar hai? Source agle router tak pahunch sakta hai? Jis hop par reachability rukti hai wahi aapka area hai.</li>
<li>Us hop par <b>layers neeche se upar walk karo</b>: interface aur VLAN, IP address, IGP neighbour, database, route, forwarding, policy aur services.</li>
<li><b>Ek hypothesis banao</b> jo har observation explain kare. Sirf aadhe explain kare to woh galat ya adhoori hai.</li>
<li><b>Ek cheez fix karo</b> aur change risky ho to <code>commit confirmed</code> use karo.</li>
<li>Jis test se fail tha usi se <b>verify</b> karo, aur likho ki kya galat tha.</li>
</ol>

<h3>Har layer ke commands</h3>
<table class="cmp"><tr><th>Layer</th><th>Command</th><th>Kya dhoondhna hai</th></tr>
<tr><td>Interface</td><td><code>show interfaces terse</code></td><td>Admin aur Link up, sahi address</td></tr>
<tr><td>Neighbour</td><td><code>show ospf neighbor</code> / <code>show isis adjacency</code></td><td>Full / Up</td></tr>
<tr><td>Protocol mein interface</td><td><code>show ospf interface</code></td><td>Sahi area, state, Down nahi</td></tr>
<tr><td>Database</td><td><code>show ospf database</code> / <code>show isis database</code></td><td>Expected LSAs ya LSPs maujood</td></tr>
<tr><td>Route</td><td><code>show route X</code>, <code>show route hidden</code></td><td>Maujood, active, sahi next hop</td></tr>
<tr><td>Forwarding</td><td><code>show route forwarding-table destination X</code></td><td>Next hop installed</td></tr>
<tr><td>Config</td><td><code>show configuration | display set | match ospf</code></td><td>Typos, galat IDs</td></tr>
<tr><td>Path</td><td><code>ping</code>, <code>traceroute no-resolve</code></td><td>Packets kahan ruke</td></tr></table>

<h3>Worked case: woh area jo backbone kho baitha</h3>
<p>Ticket: head office ka PC1 Hubli server 172.16.5.10 tak nahi pahunch raha. R1 ke paas 172.16.5.0/24 ka route nahi hai. Step 2 batata hai ki R1 aur R2 theek hain, isliye hum ABR R2 par walk karte hain. Neighbour table mein virtual link nahi aur interface list use Down dikhati hai.</p>
<pre class="out">lab@R2-HO&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.5.12.1        ge-0/0/0.0             Full            10.255.5.1       128    37
10.5.23.2        ge-0/0/1.0             Full            10.255.5.3       128    31

lab@R2-HO&gt; show ospf interface
Interface           State   Area            DR ID           BDR ID          Nbrs
ge-0/0/0.0          DR      0.0.0.0         10.255.5.2      10.255.5.1         1
ge-0/0/1.0          BDR     0.0.0.1         10.255.5.3      10.255.5.2         1
lo0.0               DR      0.0.0.0         0.0.0.0         0.0.0.0            0
<span class="hl">vl-10.255.5.3       Down</span>    0.0.0.0         0.0.0.0         0.0.0.0            0</pre>
<p>Hypothesis: R3 R2 ke router ID ki taraf wapas point nahi kar raha. R3 ki configuration check karo:</p>
<pre class="out">lab@R3-DHARWAD&gt; show configuration protocols ospf
area 0.0.0.0 {
    virtual-link neighbor-id <span class="hl">10.5.23.1</span> {
        transit-area 0.0.0.1;
    }
}</pre>
<p>10.5.23.1 R2 ka interface address hai. Virtual link ko <b>router ID</b> chahiye, 10.255.5.2. Ek change theek karta hai, phir wahi tests se verify karte hain.</p>
<pre class="code">delete protocols ospf area 0.0.0.0 virtual-link neighbor-id 10.5.23.1
set protocols ospf area 0.0.0.0 virtual-link neighbor-id 10.255.5.2 transit-area 0.0.0.1
commit and-quit</pre>
<pre class="out">lab@R2-HO&gt; show ospf neighbor
10.5.12.1        ge-0/0/0.0             Full            10.255.5.1       128    40
10.5.23.2        ge-0/0/1.0             Full            10.255.5.3       128    34
10.5.23.2        <span class="hl">vl-10.255.5.3</span>          Full            10.255.5.3         0    33

lab@R1-HO&gt; show route 172.16.5.0/24
172.16.5.0/24      *[OSPF/10] 00:00:32, metric 4
                    &gt;  to 10.5.12.2 via ge-0/0/0.0</pre>

<div class="warn"><p><b>Common mistake.</b> Ek saath teen cheezein badalna. Problem gayab ho gayi to pata nahi chalega ki kaunse change ne theek kiya, aur galat change doosra fault chhupa sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Troubleshooting sawal mein dikhne wala symptom (R1 par route nahi) aksar faulty device par nahi hota. Path ko hop-by-hop follow karo aur dhoondho ki information kahan behna band hoti hai.</p></div>

<div class="scn"><h4>Ek ticket, do faults</h4><p>Merger ke baad ek site server tak nahi pahunch pa raha tha. Engineer ne virtual link theek kiya aur route aa gaya, par pings phir bhi fail. Layers dobara walk karne par forwarding table sahi thi, par server ke paas head-office subnet ka return route nahi tha. Pehla fault routing fault tha; doosra server side par missing return path.</p><p><b>Lesson:</b> ticket band karne se pehle original test se end to end, dono directions mein verify karo.</p></div>

<div class="iv"><p class="q">"Aisa network jo kabhi nahi dekha, uska troubleshooting kaise karoge?"</p><p>Symptom precisely define karo, aakhri hop dhoondho jahan abhi bhi chalta hai, phir us hop par layers walk karo: interface, neighbour, database, route, forwarding, policy. Ek hypothesis banao, ek cheez badlo, original test se verify karo. Batao ki aap findings record karte ho aur risky changes ke liye <code>commit confirmed</code> use karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method yaadasht se behtar: define, scope, layers walk, hypothesise, ek cheez fix, verify.</li>
<li>Configuration chhune se pehle woh hop dhoondho jahan reachability rukti hai.</li>
<li>Interface, neighbour, database, route, forwarding aam order hai.</li>
<li>Virtual link ko remote router ID chahiye, interface address nahi.</li>
<li>Original test se dono directions mein end to end verify karo.</li>
</ul></div>
`}};export{e as default};